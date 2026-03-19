package com.smart.basket.controller

import com.smart.basket.service.ProductService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/products")
class ProductController(private val productService: ProductService) {
    @GetMapping
    fun getAll(
        @RequestParam(required = false) search: String?,
        @RequestParam(required = false) categoryId: Long?
    ) = productService.findAll(search, categoryId)
}
