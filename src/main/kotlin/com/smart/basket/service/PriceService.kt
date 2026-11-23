package com.smart.basket.service

import com.smart.basket.dto.PriceHistoryResponse
import com.smart.basket.repository.ProductPriceRepository
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service

@Service
class PriceService(private val priceRepo: ProductPriceRepository) {
    fun getPriceHistory(productId: Long, storeId: Long, limit: Int?): List<PriceHistoryResponse> {
        require(limit == null || limit in 1..100)
        val page = limit?.let { PageRequest.of(0, it) } ?: Pageable.unpaged()
        return priceRepo.latestHistory(productId, storeId, page).asReversed().map {
            PriceHistoryResponse(date = it.date.toString(), price = it.price)
        }
    }
}
