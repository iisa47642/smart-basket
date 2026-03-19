package com.smart.basket.service

import com.smart.basket.dto.PriceHistoryResponse
import com.smart.basket.repository.ProductPriceRepository
import org.springframework.stereotype.Service

@Service
class PriceService(private val priceRepo: ProductPriceRepository) {
    fun getPriceHistory(productId: Long, storeId: Long): List<PriceHistoryResponse> =
        priceRepo.findPriceHistory(productId, storeId).map {
            PriceHistoryResponse(date = it.priceDate.toString(), price = it.price)
        }
}
