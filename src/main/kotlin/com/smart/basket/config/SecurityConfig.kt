package com.smart.basket.config

import com.smart.basket.entity.AppUser
import com.smart.basket.repository.AppUserRepository
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.CommandLineRunner
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.core.userdetails.User
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.SecurityFilterChain

@Configuration
class SecurityConfig {
    @Bean
    fun passwordEncoder(): PasswordEncoder = BCryptPasswordEncoder(12)

    @Bean
    fun users(repo: AppUserRepository) = UserDetailsService { username ->
        val user = repo.findByUsername(username) ?: throw UsernameNotFoundException("Unknown user")
        User.withUsername(user.username).password(user.passwordHash).roles(user.role).build()
    }

    @Bean
    fun bootstrapAdmin(repo: AppUserRepository, encoder: PasswordEncoder,
        @Value("\${app.admin.username:admin}") username: String,
        @Value("\${app.admin.password:}") password: String
    ) = CommandLineRunner {
        // A supplied password provisions a new account only; restart never resets an existing password.
        if (password.isNotBlank() && repo.findByUsername(username) == null) {
            require(password.length >= 12) { "ADMIN_PASSWORD must contain at least 12 characters" }
            repo.save(AppUser(username = username, passwordHash = encoder.encode(password)!!, role = "ADMIN"))
        }
    }

    @Bean
    fun security(http: HttpSecurity): SecurityFilterChain {
        http.authorizeHttpRequests { auth -> auth
            .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
            .requestMatchers("/actuator/health", "/actuator/health/**").permitAll()
            .requestMatchers("/actuator/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.GET, "/api/v1/**", "/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
            .requestMatchers(HttpMethod.POST, "/api/v1/analytics/cart/compare", "/api/v1/packages/compare").permitAll()
            .requestMatchers("/error").permitAll()
            .anyRequest().denyAll()
        }
        // Session CSRF protection stays enabled, including login and logout.
        http.formLogin { form -> form.loginProcessingUrl("/api/v1/auth/login")
            .successHandler { _, response, _ -> response.status = 204 }
            .failureHandler { _, response, _ ->
                response.status = 401; response.contentType = "application/json;charset=UTF-8"
                response.writer.write("{\"error\":\"Неверное имя пользователя или пароль\"}")
            }.permitAll()
        }
        http.logout { logout -> logout.logoutUrl("/api/v1/auth/logout")
            .deleteCookies("JSESSIONID")
            .logoutSuccessHandler { _, response, _ -> response.status = 204 }
        }
        http.requestCache { it.disable() }
        http.exceptionHandling { errors -> errors
            .authenticationEntryPoint { _, response, _ ->
                response.status = 401; response.contentType = "application/json;charset=UTF-8"
                response.writer.write("{\"error\":\"Требуется вход\"}")
            }
            .accessDeniedHandler { _, response, _ ->
                response.status = 403; response.contentType = "application/json;charset=UTF-8"
                response.writer.write("{\"error\":\"Доступ запрещён или устарел защитный токен. Обновите страницу\"}")
            }
        }
        return http.build()
    }
}
