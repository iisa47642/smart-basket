package com.smart.basket.controller

import com.smart.basket.dto.CartCompareRequest
import com.smart.basket.service.AnalyticsService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/analytics")
class AnalyticsController(private val analyticsService: AnalyticsService) {

    @PostMapping("/cart/compare")
    fun compareCart(@Valid @RequestBody request: CartCompareRequest): ResponseEntity<Any> {
        return when (request.strategy) {
            "single_store" -> ResponseEntity.ok(
                analyticsService.compareSingleStore(request.cityId, request.items)
            )
            "optimal" -> ResponseEntity.ok(
                analyticsService.compareOptimal(request.cityId, request.items)
            )
            else -> ResponseEntity.badRequest().body("Unknown strategy: ${request.strategy}")
        }
    }

    @GetMapping("/products/{id}/compare")
    fun compareProduct(
        @PathVariable id: Long,
        @RequestParam cityId: Long
    ) = ResponseEntity.ok(analyticsService.compareProduct(id, cityId))

    @GetMapping("/products/{id}/history")
    fun priceHistory(
        @PathVariable id: Long,
        @RequestParam storeId: Long
    ) = ResponseEntity.ok(analyticsService.getPriceHistory(id, storeId))
}
