package com.smart.basket.controller

import com.smart.basket.service.CityService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/cities")
class CityController(private val cityService: CityService) {
    @GetMapping
    fun getAll() = cityService.findAll()
}
