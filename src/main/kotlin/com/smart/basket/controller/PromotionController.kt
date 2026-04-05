package com.smart.basket.controller

import com.smart.basket.service.PromotionService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/promotions")
class PromotionController(private val promotionService: PromotionService) {

    @GetMapping
    fun getAll(
        @RequestParam(required = false) cityId: Long?,
        @RequestParam(required = false) storeId: Long?
    ) = when {
        storeId != null -> promotionService.findByStore(storeId)
        cityId != null -> promotionService.findByCity(cityId)
        else -> emptyList()
    }

    @GetMapping("/active")
    fun getActive(@RequestParam cityId: Long) = promotionService.findActiveNow(cityId)
}
