package com.smart.basket.repository

import com.smart.basket.entity.Store
import org.springframework.data.jpa.repository.JpaRepository

interface StoreRepository : JpaRepository<Store, Long> {
    fun findByCityId(cityId: Long): List<Store>
}
