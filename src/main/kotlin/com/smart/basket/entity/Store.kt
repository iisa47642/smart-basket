package com.smart.basket.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "stores")
data class Store(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    @Column(nullable = false, length = 100)
    val name: String = "",
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "city_id", nullable = false)
    val city: City = City(),
    @Column(length = 200)
    val address: String? = null,
    @Column(name = "created_at")
    val createdAt: LocalDateTime = LocalDateTime.now()
)
