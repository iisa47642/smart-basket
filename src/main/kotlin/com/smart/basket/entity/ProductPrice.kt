package com.smart.basket.entity

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

@Entity
@Table(name = "product_prices")
data class ProductPrice(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    val product: Product = Product(),
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    val store: Store = Store(),
    @Column(nullable = false, precision = 10, scale = 2)
    val price: BigDecimal = BigDecimal.ZERO,
    @Column(name = "price_date", nullable = false)
    val priceDate: LocalDate = LocalDate.now(),
    @Column(name = "created_at")
    val createdAt: LocalDateTime = LocalDateTime.now()
)
