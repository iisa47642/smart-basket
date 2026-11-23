package com.smart.basket.controller

import com.smart.basket.service.PriceService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.media.Schema
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/prices")
class PriceController(private val priceService: PriceService) {
    @Operation(summary = "История цен товара в магазине", description = "Без limit возвращается вся история. Даты в ответе идут от старых к новым.")
    @GetMapping("/history")
    fun getPriceHistory(
        @RequestParam productId: Long,
        @RequestParam storeId: Long,
        @Parameter(description = "Число последних записей", schema = Schema(type = "integer", format = "int32", minimum = "1", maximum = "100"))
        @RequestParam(required = false) limit: Int?
    ) = priceService.getPriceHistory(productId, storeId, limit)
}
