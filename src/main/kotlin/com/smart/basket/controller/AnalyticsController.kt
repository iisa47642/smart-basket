package com.smart.basket.controller

import com.smart.basket.dto.CartCompareRequest
import com.smart.basket.service.PriceService
import com.smart.basket.service.AnalyticsService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.media.Schema
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/analytics")
class AnalyticsController(private val analyticsService: AnalyticsService, private val priceService: PriceService) {

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

    @Operation(summary = "История цен товара в магазине", description = "Без limit возвращается вся история. Даты в ответе идут от старых к новым.")
    @GetMapping("/products/{id}/history")
    fun priceHistory(
        @PathVariable id: Long,
        @RequestParam storeId: Long,
        @Parameter(description = "Число последних записей", schema = Schema(minimum = "1", maximum = "100"))
        @RequestParam(required = false) limit: Int?
    ) = ResponseEntity.ok(priceService.getPriceHistory(id, storeId, limit))
}
