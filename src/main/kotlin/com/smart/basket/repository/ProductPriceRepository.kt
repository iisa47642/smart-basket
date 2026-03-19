package com.smart.basket.repository

import com.smart.basket.entity.ProductPrice
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param

interface ProductPriceRepository : JpaRepository<ProductPrice, Long> {

    fun findTopByProductIdAndStoreIdOrderByPriceDateDesc(
        productId: Long, storeId: Long
    ): ProductPrice?

    @Query("""
        SELECT pp FROM ProductPrice pp
        JOIN pp.store s
        WHERE pp.product.id = :productId
        AND s.city.id = :cityId
        AND pp.priceDate = (
            SELECT MAX(pp2.priceDate) FROM ProductPrice pp2
            WHERE pp2.product.id = pp.product.id
            AND pp2.store.id = pp.store.id
        )
        ORDER BY pp.price ASC
    """)
    fun findLatestPricesByProductAndCity(
        @Param("productId") productId: Long,
        @Param("cityId") cityId: Long
    ): List<ProductPrice>

    @Query("""
        SELECT pp FROM ProductPrice pp
        WHERE pp.product.id = :productId
        AND pp.store.id = :storeId
        ORDER BY pp.priceDate ASC
    """)
    fun findPriceHistory(
        @Param("productId") productId: Long,
        @Param("storeId") storeId: Long
    ): List<ProductPrice>
}
