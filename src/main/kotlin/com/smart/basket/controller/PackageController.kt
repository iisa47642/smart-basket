package com.smart.basket.controller

import com.smart.basket.dto.PackageCostRequest
import com.smart.basket.service.PackageService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/packages")
class PackageController(private val packageService: PackageService) {

    @GetMapping
    fun getAll() = packageService.findAll()

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long) = packageService.getById(id)

    @GetMapping("/{id}/cost")
    fun calculateCost(@PathVariable id: Long, @RequestParam cityId: Long) =
        ResponseEntity.ok(packageService.calculateCost(id, cityId))

    @PostMapping("/compare")
    fun comparePackages(
        @Valid @RequestBody request: PackageCostRequest,
        @RequestParam cityId: Long
    ) = ResponseEntity.ok(packageService.comparePackages(request.packageIds, cityId))
}
