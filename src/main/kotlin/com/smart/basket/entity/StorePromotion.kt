package com.smart.basket.entity

import jakarta.persistence.*
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime

@Entity
@Table(name = "store_promotions")
data class StorePromotion(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    val store: Store = Store(),
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    val category: Category? = null,
    @Column(nullable = false, length = 200)
    val title: String = "",
    @Column(length = 500)
    val description: String? = null,
    @Column(name = "discount_percent")
    val discountPercent: Int? = null,
    @Column(name = "day_of_week", length = 20)
    val dayOfWeek: String? = null,
    @Column(name = "time_from")
    val timeFrom: LocalTime? = null,
    @Column(name = "time_to")
    val timeTo: LocalTime? = null,
    @Column(name = "valid_from", nullable = false)
    val validFrom: LocalDate = LocalDate.now(),
    @Column(name = "valid_to", nullable = false)
    val validTo: LocalDate = LocalDate.now().plusMonths(1),
    @Column(nullable = false)
    val active: Boolean = true,
    @Column(name = "created_at")
    val createdAt: LocalDateTime = LocalDateTime.now()
)
