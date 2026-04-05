package com.smart.basket.repository

import com.smart.basket.entity.PackageItem
import org.springframework.data.jpa.repository.JpaRepository

interface PackageItemRepository : JpaRepository<PackageItem, Long> {
    fun findByProductPackageId(packageId: Long): List<PackageItem>
}
