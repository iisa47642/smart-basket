package com.smart.basket.controller

import org.springframework.security.core.Authentication
import org.springframework.security.web.csrf.CsrfToken
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/auth")
class AuthController {
    @GetMapping("/csrf")
    fun csrf(token: CsrfToken) = mapOf("token" to token.token, "headerName" to token.headerName)

    @GetMapping("/me")
    fun me(auth: Authentication?) = mapOf(
        "username" to auth?.name,
        "roles" to (auth?.authorities?.mapNotNull { it.authority?.removePrefix("ROLE_") } ?: emptyList<String>())
    )
}
