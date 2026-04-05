package com.smart.basket.repository

import com.smart.basket.entity.ProductPackage
import org.springframework.data.jpa.repository.JpaRepository

interface ProductPackageRepository : JpaRepository<ProductPackage, Long> {
    fun findAllByOrderByNameAsc(): List<ProductPackage>
}
