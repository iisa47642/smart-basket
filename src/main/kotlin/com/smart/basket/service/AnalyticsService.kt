package com.smart.basket.service

import com.smart.basket.dto.*
import com.smart.basket.repository.ProductPriceRepository
import com.smart.basket.repository.ProductRepository
import com.smart.basket.repository.StoreRepository
import org.springframework.stereotype.Service
import java.math.BigDecimal

@Service
class AnalyticsService(
    private val priceRepo: ProductPriceRepository,
    private val storeRepo: StoreRepository,
    private val productRepo: ProductRepository
) {

    fun compareSingleStore(cityId: Long, items: List<CartItemDto>): List<SingleStoreResult> {
        val stores = storeRepo.findByCityId(cityId)
        val products = productRepo.findAllById(items.map { it.productId })
        val productMap = products.associateBy { it.id }

        val results = stores.map { store ->
            val cartItems = items.map { item ->
                val product = productMap[item.productId]!!
                val latestPrice = priceRepo.findTopByProductIdAndStoreIdOrderByPriceDateDesc(
                    item.productId, store.id
                )
                CartPriceItem(
                    productId = item.productId,
                    productName = product.name,
                    quantity = item.quantity,
                    unitPrice = latestPrice?.price,
                    totalPrice = latestPrice?.price?.multiply(BigDecimal(item.quantity)),
                    available = latestPrice != null
                )
            }

            val totalPrice = cartItems
                .filter { it.available }
                .mapNotNull { it.totalPrice }
                .fold(BigDecimal.ZERO) { acc, p -> acc.add(p) }

            val missingItems = cartItems
                .filter { !it.available }
                .map { it.productName }

            SingleStoreResult(
                store = store.toDto(),
                totalPrice = totalPrice,
                items = cartItems,
                missingItems = missingItems
            )
        }.sortedBy { it.totalPrice }

        if (results.size > 1) {
            val maxPrice = results.last().totalPrice
            return results.map { it.copy(savings = maxPrice.subtract(it.totalPrice)) }
        }
        return results
    }

    fun compareOptimal(cityId: Long, items: List<CartItemDto>): OptimalResult {
        val products = productRepo.findAllById(items.map { it.productId })
        val productMap = products.associateBy { it.id }

        val allocations = items.map { item ->
            val prices = priceRepo.findLatestPricesByProductAndCity(item.productId, cityId)
            val bestPrice = prices.firstOrNull()

            ItemAllocation(
                productId = item.productId,
                productName = productMap[item.productId]!!.name,
                quantity = item.quantity,
                bestStore = bestPrice?.store?.toDto() ?: StoreDto(0, "Нет в наличии", "", null),
                unitPrice = bestPrice?.price ?: BigDecimal.ZERO,
                totalPrice = (bestPrice?.price ?: BigDecimal.ZERO).multiply(BigDecimal(item.quantity))
            )
        }

        val totalOptimal = allocations.fold(BigDecimal.ZERO) { acc, a -> acc.add(a.totalPrice) }
        val storesNeeded = allocations.map { it.bestStore.id }.distinct().size

        val singleStoreResults = compareSingleStore(cityId, items)
        val bestSinglePrice = singleStoreResults.firstOrNull()?.totalPrice ?: totalOptimal

        return OptimalResult(
            totalPrice = totalOptimal,
            itemAllocations = allocations,
            storesNeeded = storesNeeded,
            savingsVsBestSingle = bestSinglePrice.subtract(totalOptimal)
        )
    }

    fun compareProduct(productId: Long, cityId: Long): List<ProductCompareResponse> {
        val prices = priceRepo.findLatestPricesByProductAndCity(productId, cityId)
        return prices.map {
            ProductCompareResponse(
                store = it.store.toDto(),
                price = it.price,
                priceDate = it.priceDate.toString()
            )
        }
    }

    fun getPriceHistory(productId: Long, storeId: Long): List<PriceHistoryResponse> {
        return priceRepo.findPriceHistory(productId, storeId).map {
            PriceHistoryResponse(date = it.priceDate.toString(), price = it.price)
        }
    }
}
