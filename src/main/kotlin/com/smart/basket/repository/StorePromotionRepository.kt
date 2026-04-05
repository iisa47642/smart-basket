package com.smart.basket.repository

import com.smart.basket.entity.StorePromotion
import org.springframework.data.jpa.repository.JpaRepository

interface StorePromotionRepository : JpaRepository<StorePromotion, Long> {
    fun findByStoreId(storeId: Long): List<StorePromotion>
    fun findByStoreCityIdAndActiveTrue(cityId: Long): List<StorePromotion>
    fun findByStoreCityIdAndCategoryIdAndActiveTrue(cityId: Long, categoryId: Long): List<StorePromotion>
}
