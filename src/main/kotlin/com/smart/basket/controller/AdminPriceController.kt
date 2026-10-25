package com.smart.basket.controller

import io.swagger.v3.oas.annotations.security.SecurityRequirement
import com.smart.basket.entity.ProductPrice
import com.smart.basket.exception.ResourceNotFoundException
import com.smart.basket.repository.*
import jakarta.validation.Valid
import jakarta.validation.constraints.*
import org.springframework.http.ResponseEntity
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*
import java.math.BigDecimal
import java.net.URI
import java.time.LocalDate

data class PriceWriteRequest(
    @field:Positive val productId: Long,
    @field:Positive val storeId: Long,
    @field:DecimalMin("0.01") @field:Digits(integer = 8, fraction = 2) val price: BigDecimal,
    @field:PastOrPresent val priceDate: LocalDate
)
data class AdminPriceDto(val id: Long, val productId: Long, val storeId: Long,
    val price: BigDecimal, val priceDate: LocalDate)

@SecurityRequirement(name = "session")
@RestController
@RequestMapping("/api/v1/admin/prices")
@Transactional
class AdminPriceController(private val prices: ProductPriceRepository,
    private val products: ProductRepository, private val stores: StoreRepository) {
    private fun dto(p: ProductPrice) = AdminPriceDto(p.id, p.product.id, p.store.id, p.price, p.priceDate)

    @GetMapping
    fun list(@RequestParam productId: Long, @RequestParam storeId: Long) =
        prices.findPriceHistory(productId, storeId).map(::dto)

    @PostMapping
    fun create(@Valid @RequestBody request: PriceWriteRequest): ResponseEntity<AdminPriceDto> {
        val saved = prices.saveAndFlush(entity(request))
        return ResponseEntity.created(URI.create("/api/v1/admin/prices/${saved.id}")).body(dto(saved))
    }

    @GetMapping("/{id}")
    fun get(@PathVariable id: Long) = dto(find(id))

    @PutMapping("/{id}")
    fun update(@PathVariable id: Long, @Valid @RequestBody request: PriceWriteRequest): AdminPriceDto {
        val old = find(id)
        return dto(prices.saveAndFlush(entity(request).copy(id = id, createdAt = old.createdAt)))
    }

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        prices.delete(find(id))
        return ResponseEntity.noContent().build()
    }

    private fun find(id: Long) = prices.findById(id).orElseThrow { ResourceNotFoundException("Цена не найдена") }
    private fun entity(r: PriceWriteRequest) = ProductPrice(
        product = products.findById(r.productId).orElseThrow { ResourceNotFoundException("Товар не найден") },
        store = stores.findById(r.storeId).orElseThrow { ResourceNotFoundException("Магазин не найден") },
        price = r.price, priceDate = r.priceDate)
}
