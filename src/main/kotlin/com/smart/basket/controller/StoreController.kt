package com.smart.basket.controller

import com.smart.basket.service.StoreService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/stores")
class StoreController(private val storeService: StoreService) {
    @GetMapping
    fun getAll(@RequestParam(required = false) cityId: Long?) =
        if (cityId != null) storeService.findByCityId(cityId) else storeService.findAll()
}
