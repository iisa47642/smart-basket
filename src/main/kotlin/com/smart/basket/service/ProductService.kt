package com.smart.basket.service

import com.smart.basket.dto.ProductDto
import com.smart.basket.dto.toDto
import com.smart.basket.repository.ProductRepository
import org.springframework.stereotype.Service

@Service
class ProductService(private val productRepo: ProductRepository) {
    fun findAll(search: String?, categoryId: Long?): List<ProductDto> =
        productRepo.searchProducts(search, categoryId).map { it.toDto() }
}
