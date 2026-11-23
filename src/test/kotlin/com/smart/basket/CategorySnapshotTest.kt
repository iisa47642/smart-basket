package com.smart.basket

import com.smart.basket.dto.CategoryDto
import com.smart.basket.service.CategorySnapshot
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import java.time.Duration

class CategorySnapshotTest {
    @Test
    fun `one load per lifetime and refresh at expiry`() {
        val ttl = Duration.ofMinutes(5)
        var time = 0L
        var loads = 0
        val cache = CategorySnapshot(ttl) { time }
        fun read() = cache.get { listOf(CategoryDto((++loads).toLong(), "Категория")) }.single().id
        assertEquals(1L, read())
        time = ttl.toNanos() - 1
        repeat(19) { assertEquals(1L, read()) }
        time++
        assertEquals(2L, read())
        assertEquals(2, loads)
    }
}
