package com.smart.basket.service

import com.smart.basket.dto.CategoryDto
import com.smart.basket.dto.toDto
import com.smart.basket.repository.CategoryRepository
import java.time.Duration
import org.springframework.stereotype.Service

@Service
class CategoryService(private val categoryRepo: CategoryRepository) {
    private val cache = CategorySnapshot(Duration.ofMinutes(5))

    fun findAll(): List<CategoryDto> = cache.get { categoryRepo.findAll().map { it.toDto() } }
}

internal class CategorySnapshot(private val ttl: Duration, private val now: () -> Long = System::nanoTime) {
    private var categories: List<CategoryDto>? = null
    private var loadedAt = 0L

    @Synchronized
    fun get(load: () -> List<CategoryDto>): List<CategoryDto> {
        val existing = categories
        if (existing != null && now() - loadedAt < ttl.toNanos()) return existing
        return load().also {
            categories = it
            loadedAt = now()
        }
    }
}
