package com.smart.basket.repository

import com.smart.basket.entity.Product
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param

interface ProductRepository : JpaRepository<Product, Long> {
    @Query(
        value = "SELECT * FROM products p WHERE (CAST(:search AS text) IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', CAST(:search AS text), '%'))) AND (CAST(:categoryId AS bigint) IS NULL OR p.category_id = CAST(:categoryId AS bigint))",
        nativeQuery = true
    )
    fun searchProducts(@Param("search") search: String?, @Param("categoryId") categoryId: Long?): List<Product>
}
