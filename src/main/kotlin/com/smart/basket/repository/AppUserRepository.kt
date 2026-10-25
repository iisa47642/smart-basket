package com.smart.basket.repository

import com.smart.basket.entity.AppUser
import org.springframework.data.jpa.repository.JpaRepository

interface AppUserRepository : JpaRepository<AppUser, Long> {
    fun findByUsername(username: String): AppUser?
}
