package com.smart.basket.controller

import com.smart.basket.service.CategoryService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/categories")
class CategoryController(private val categoryService: CategoryService) {
    @GetMapping
    fun getAll() = categoryService.findAll()
}
