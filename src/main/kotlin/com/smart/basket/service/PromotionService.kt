package com.smart.basket.service

import com.smart.basket.dto.PromotionDto
import com.smart.basket.dto.toDto
import com.smart.basket.repository.StorePromotionRepository
import org.springframework.stereotype.Service
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.LocalTime

@Service
class PromotionService(
    private val promoRepo: StorePromotionRepository
) {

    fun findByCity(cityId: Long): List<PromotionDto> =
        promoRepo.findByStoreCityIdAndActiveTrue(cityId).map { it.toDto() }

    fun findByStore(storeId: Long): List<PromotionDto> =
        promoRepo.findByStoreId(storeId).filter { it.active }.map { it.toDto() }

    fun findActiveNow(cityId: Long): List<PromotionDto> {
        val now = LocalTime.now()
        val today = LocalDate.now().dayOfWeek
        return promoRepo.findByStoreCityIdAndActiveTrue(cityId)
            .filter { promo ->
                val dayMatch = promo.dayOfWeek == null || promo.dayOfWeek == today.name
                val timeMatch = (promo.timeFrom == null && promo.timeTo == null) ||
                    (promo.timeFrom != null && promo.timeTo != null && now >= promo.timeFrom && now <= promo.timeTo)
                val dateMatch = !LocalDate.now().isBefore(promo.validFrom) && !LocalDate.now().isAfter(promo.validTo)
                dayMatch && timeMatch && dateMatch
            }
            .map { it.toDto() }
    }
}
