package com.smart.basket.service

import com.smart.basket.dto.*
import com.smart.basket.repository.ProductRepository
import org.springframework.stereotype.Service

@Service
class ProductService(private val productRepo: ProductRepository) {
    fun findAll(search: String?, categoryId: Long?): List<ProductDto> =
        productRepo.searchProducts(search, categoryId).map { it.toDto() }

    fun findAllGroupedByCategory(): List<CategoryProductsDto> {
        val products = productRepo.findAll()
        return products.groupBy { it.category }
            .map { (category, prods) ->
                CategoryProductsDto(
                    category = category?.toDto() ?: CategoryDto(0, "Без категории"),
                    products = prods.map { it.toDto() }
                )
            }
            .sortedBy { it.category.name }
    }
}
