package com.smart.basket.service

import com.smart.basket.dto.CityDto
import com.smart.basket.dto.toDto
import com.smart.basket.repository.CityRepository
import org.springframework.stereotype.Service

@Service
class CityService(private val cityRepo: CityRepository) {
    fun findAll(): List<CityDto> = cityRepo.findAll().map { it.toDto() }
}
