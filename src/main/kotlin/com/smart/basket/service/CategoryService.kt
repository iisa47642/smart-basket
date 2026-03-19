package com.smart.basket.service

import com.smart.basket.dto.CategoryDto
import com.smart.basket.dto.toDto
import com.smart.basket.repository.CategoryRepository
import org.springframework.stereotype.Service

@Service
class CategoryService(private val categoryRepo: CategoryRepository) {
    fun findAll(): List<CategoryDto> = categoryRepo.findAll().map { it.toDto() }
}
