package com.smart.basket.repository

import com.smart.basket.entity.City
import org.springframework.data.jpa.repository.JpaRepository

interface CityRepository : JpaRepository<City, Long>
