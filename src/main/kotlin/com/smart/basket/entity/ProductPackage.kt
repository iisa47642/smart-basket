package com.smart.basket.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "product_packages")
data class ProductPackage(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    @Column(nullable = false, length = 100)
    val name: String = "",
    @Column(length = 500)
    val description: String = "",
    @Column(length = 50)
    val icon: String = "",
    @Column(length = 50, nullable = false)
    val type: String = "BUDGET",
    @OneToMany(mappedBy = "productPackage", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
    val items: List<PackageItem> = emptyList(),
    @Column(name = "created_at")
    val createdAt: LocalDateTime = LocalDateTime.now()
)
