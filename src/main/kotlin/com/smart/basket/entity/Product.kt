package com.smart.basket.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "products")
data class Product(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    @Column(nullable = false, length = 200)
    val name: String = "",
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    val category: Category? = null,
    @Column(length = 20, nullable = false)
    val unit: String = "шт",
    @Column(name = "created_at")
    val createdAt: LocalDateTime = LocalDateTime.now()
)
