package com.smart.basket

import com.smart.basket.entity.AppUser
import com.smart.basket.repository.AppUserRepository
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.test.context.ActiveProfiles
import tools.jackson.databind.json.JsonMapper
import java.net.CookieManager
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class BasketApplicationTests {
    @Value("\${local.server.port}") private var port: Int = 0
    @Autowired private lateinit var users: AppUserRepository
    @Autowired private lateinit var encoder: PasswordEncoder
    private val json = JsonMapper.builder().build()
    private fun client() = HttpClient.newBuilder().cookieHandler(CookieManager()).build()
    private fun request(c: HttpClient, method: String, path: String, body: String = "", csrf: Boolean = true,
                        contentType: String = "application/json"): HttpResponse<String> {
        val b = HttpRequest.newBuilder(URI("http://localhost:$port$path"))
        if (method != "GET" && csrf) {
            val t = json.readTree(request(c, "GET", "/api/v1/auth/csrf").body())
            b.header(t["headerName"].asText(), t["token"].asText())
        }
        b.header("Content-Type", contentType)
        return c.send(b.method(method, HttpRequest.BodyPublishers.ofString(body)).build(), HttpResponse.BodyHandlers.ofString())
    }
    private fun login(c: HttpClient, name: String = "test-admin", password: String = "local-test-password-only") =
        request(c, "POST", "/api/v1/auth/login", "username=$name&password=$password", contentType = "application/x-www-form-urlencoded")
    private fun price(date: String = "2000-01-01", amount: String = "42.50", productId: Long = 1) =
        """{"productId":$productId,"storeId":1,"price":$amount,"priceDate":"$date"}"""

    @Test fun `public catalog and csrf token are available`() {
        val c = client()
        assertEquals(200, request(c, "GET", "/api/v1/products").statusCode())
        assertTrue(request(c, "GET", "/api/v1/auth/csrf").body().contains("token"))
        assertTrue(request(c, "GET", "/api/v1/auth/me").body().contains("null"))
    }
    @Test fun `anonymous admin and metrics requests require login`() {
        val c = client()
        assertEquals(401, request(c, "GET", "/api/v1/admin/prices/1").statusCode())
        assertEquals(401, request(c, "GET", "/actuator/metrics").statusCode())
        val health = request(c, "GET", "/actuator/health")
        assertEquals(200, health.statusCode()); assertFalse(health.body().contains("components"))
    }
    @Test fun `login requires csrf and valid password`() {
        val c = client()
        assertEquals(403, request(c, "POST", "/api/v1/auth/login", "username=test-admin&password=x", false, "application/x-www-form-urlencoded").statusCode())
        assertEquals(401, login(c, password = "incorrect").statusCode())
        assertEquals(204, login(c).statusCode())
        assertTrue(request(c, "GET", "/api/v1/auth/me").body().contains("ADMIN"))
    }
    @Test fun `user role cannot edit prices`() {
        users.save(AppUser(username = "reader", passwordHash = encoder.encode("reader-test-password")!!, role = "USER"))
        val c = client()
        assertEquals(204, login(c, "reader", "reader-test-password").statusCode())
        assertEquals(403, request(c, "GET", "/api/v1/admin/prices/1").statusCode())
        assertEquals(403, request(c, "POST", "/api/v1/admin/prices", price()).statusCode())
    }
    @Test fun `admin can create read update delete and duplicate dates conflict`() {
        val c = client(); assertEquals(204, login(c).statusCode())
        val created = request(c, "POST", "/api/v1/admin/prices", price())
        assertEquals(201, created.statusCode(), created.body())
        val id = json.readTree(created.body())["id"].asLong()
        try {
            assertEquals(200, request(c, "GET", "/api/v1/admin/prices/$id").statusCode())
            assertEquals(409, request(c, "POST", "/api/v1/admin/prices", price()).statusCode())
            val updated = request(c, "PUT", "/api/v1/admin/prices/$id", price(amount = "43.00"))
            assertEquals(200, updated.statusCode()); assertEquals(43.0, json.readTree(updated.body())["price"].asDouble())
        } finally { assertEquals(204, request(c, "DELETE", "/api/v1/admin/prices/$id").statusCode()) }
        assertEquals(404, request(c, "GET", "/api/v1/admin/prices/$id").statusCode())
    }
    @Test fun `invalid price date json and reference are rejected`() {
        val c = client(); login(c)
        assertEquals(400, request(c, "POST", "/api/v1/admin/prices", price(amount = "-1")).statusCode())
        assertEquals(400, request(c, "POST", "/api/v1/admin/prices", price(date = "2999-01-01")).statusCode())
        assertEquals(400, request(c, "POST", "/api/v1/admin/prices", "{broken").statusCode())
        assertEquals(404, request(c, "POST", "/api/v1/admin/prices", price(productId = 999999)).statusCode())
    }
    @Test fun `writes require csrf even for admin and logout invalidates session`() {
        val c = client(); login(c)
        assertEquals(403, request(c, "POST", "/api/v1/admin/prices", price(), false).statusCode())
        assertEquals(204, request(c, "POST", "/api/v1/auth/logout").statusCode())
        assertEquals(401, request(c, "GET", "/api/v1/admin/prices/1").statusCode())
    }
    @Test fun `public comparison remains available with csrf`() {
        val c = client()
        val body = """{"cityId":1,"items":[{"productId":1,"quantity":2}],"strategy":"single_store"}"""
        assertEquals(200, request(c, "POST", "/api/v1/analytics/cart/compare", body).statusCode())
        assertEquals(400, request(c, "POST", "/api/v1/analytics/cart/compare", body.replace("single_store", "invalid")).statusCode())
    }
    @Test fun `openapi renders with boot four`() {
        val r = request(client(), "GET", "/api-docs")
        assertEquals(200, r.statusCode(), r.body()); assertTrue(r.body().contains("/api/v1/admin/prices"))
    }
}
