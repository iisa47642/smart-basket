package com.smart.basket.dto

import jakarta.validation.Valid
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotEmpty
import jakarta.validation.constraints.NotNull
import java.math.BigDecimal

data class CityDto(val id: Long, val name: String)
data class StoreDto(val id: Long, val name: String, val cityName: String, val address: String?)
data class CategoryDto(val id: Long, val name: String)
data class ProductDto(val id: Long, val name: String, val categoryName: String?, val unit: String)

data class CartCompareRequest(
    @field:NotNull val cityId: Long,
    @field:NotEmpty @field:Valid val items: List<CartItemDto>,
    @field:NotBlank val strategy: String
)

data class CartItemDto(
    @field:NotNull val productId: Long,
    @field:Min(1) val quantity: Int
)

data class SingleStoreResult(
    val store: StoreDto,
    val totalPrice: BigDecimal,
    val items: List<CartPriceItem>,
    val missingItems: List<String>,
    val savings: BigDecimal? = null
)

data class CartPriceItem(
    val productId: Long,
    val productName: String,
    val quantity: Int,
    val unitPrice: BigDecimal?,
    val totalPrice: BigDecimal?,
    val available: Boolean
)

data class OptimalResult(
    val totalPrice: BigDecimal,
    val itemAllocations: List<ItemAllocation>,
    val storesNeeded: Int,
    val savingsVsBestSingle: BigDecimal
)

data class ItemAllocation(
    val productId: Long,
    val productName: String,
    val quantity: Int,
    val bestStore: StoreDto,
    val unitPrice: BigDecimal,
    val totalPrice: BigDecimal
)

data class ProductCompareResponse(
    val store: StoreDto,
    val price: BigDecimal,
    val priceDate: String
)

data class PriceHistoryResponse(
    val date: String,
    val price: BigDecimal
)
