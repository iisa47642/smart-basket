package com.smart.basket.entity

import jakarta.persistence.*

@Entity
@Table(name = "app_users")
class AppUser(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    @Column(nullable = false, unique = true, length = 80)
    val username: String = "",
    @Column(name = "password_hash", nullable = false, length = 100)
    val passwordHash: String = "",
    @Column(nullable = false, length = 20)
    val role: String = "USER"
)
