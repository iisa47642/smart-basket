package com.smart.basket.service

import com.smart.basket.dto.*
import com.smart.basket.exception.ResourceNotFoundException
import com.smart.basket.repository.PackageItemRepository
import com.smart.basket.repository.ProductPackageRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class PackageService(
    private val packageRepo: ProductPackageRepository,
    private val packageItemRepo: PackageItemRepository,
    private val analyticsService: AnalyticsService
) {

    @Transactional(readOnly = true)
    fun findAll(): List<PackageDto> = packageRepo.findAllByOrderByNameAsc().map { it.toDto() }

    @Transactional(readOnly = true)
    fun getById(id: Long): PackageDto =
        packageRepo.findById(id).orElseThrow { ResourceNotFoundException("Package not found: $id") }.toDto()

    @Transactional(readOnly = true)
    fun calculateCost(packageId: Long, cityId: Long): PackageCostResult {
        val pkg = packageRepo.findById(packageId)
            .orElseThrow { ResourceNotFoundException("Package not found: $packageId") }
        val items = packageItemRepo.findByProductPackageId(packageId)

        val cartItems = items.map { CartItemDto(productId = it.product.id, quantity = it.quantity) }

        val optimalResult = analyticsService.compareOptimal(cityId, cartItems)
        val singleStoreResults = analyticsService.compareSingleStore(cityId, cartItems)
        val bestSinglePrice = singleStoreResults.firstOrNull()?.totalPrice ?: optimalResult.totalPrice

        return PackageCostResult(
            packageId = pkg.id,
            packageName = pkg.name,
            packageIcon = pkg.icon,
            totalOptimalPrice = optimalResult.totalPrice,
            totalSingleStorePrice = bestSinglePrice,
            storesNeeded = optimalResult.storesNeeded,
            itemAllocations = optimalResult.itemAllocations
        )
    }

    @Transactional(readOnly = true)
    fun comparePackages(packageIds: List<Long>, cityId: Long): List<PackageCostResult> =
        packageIds.map { calculateCost(it, cityId) }
}
