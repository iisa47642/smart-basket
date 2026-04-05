package com.smart.basket.entity

import jakarta.persistence.*

@Entity
@Table(name = "package_items")
data class PackageItem(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "package_id", nullable = false)
    val productPackage: ProductPackage = ProductPackage(),
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    val product: Product = Product(),
    @Column(nullable = false)
    val quantity: Int = 1
)
