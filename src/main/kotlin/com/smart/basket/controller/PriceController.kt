package com.smart.basket.controller

import com.smart.basket.service.PriceService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/prices")
class PriceController(private val priceService: PriceService) {
    @GetMapping("/history")
    fun getPriceHistory(
        @RequestParam productId: Long,
        @RequestParam storeId: Long
    ) = priceService.getPriceHistory(productId, storeId)
}
