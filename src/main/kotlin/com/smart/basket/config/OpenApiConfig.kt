package com.smart.basket.config

import io.swagger.v3.oas.models.OpenAPI
import io.swagger.v3.oas.models.Components
import io.swagger.v3.oas.models.info.Info
import io.swagger.v3.oas.models.security.SecurityScheme
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class OpenApiConfig {
    @Bean
    fun openApi() = OpenAPI().info(Info().title("Smart Basket API").version("2.1")
        .description("Публичный каталог и сравнение цен. Для /admin требуется сессия ADMIN. " +
            "Вход: POST /api/v1/auth/login (application/x-www-form-urlencoded: username, password). " +
            "Выход: POST /api/v1/auth/logout. Перед POST, PUT, DELETE получите token и headerName " +
            "через GET /api/v1/auth/csrf и передайте токен в указанном заголовке. После входа и выхода получите новый токен."))
        .components(Components().addSecuritySchemes("session", SecurityScheme()
            .type(SecurityScheme.Type.APIKEY).`in`(SecurityScheme.In.COOKIE).name("JSESSIONID")))
}
