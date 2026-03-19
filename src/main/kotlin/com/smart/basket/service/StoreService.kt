package com.smart.basket.service

import com.smart.basket.dto.StoreDto
import com.smart.basket.dto.toDto
import com.smart.basket.repository.StoreRepository
import org.springframework.stereotype.Service

@Service
class StoreService(private val storeRepo: StoreRepository) {
    fun findByCityId(cityId: Long): List<StoreDto> = storeRepo.findByCityId(cityId).map { it.toDto() }
    fun findAll(): List<StoreDto> = storeRepo.findAll().map { it.toDto() }
}
