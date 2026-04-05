package com.smart.basket.dto

import com.smart.basket.entity.*

fun City.toDto() = CityDto(id = id, name = name)
fun Store.toDto() = StoreDto(id = id, name = name, cityName = city.name, address = address)
fun Category.toDto() = CategoryDto(id = id, name = name)
fun Product.toDto() = ProductDto(id = id, name = name, categoryName = category?.name, unit = unit)

fun ProductPackage.toDto() = PackageDto(
    id = id, name = name, description = description,
    icon = icon, type = type,
    items = items.map { it.toDto() }
)

fun PackageItem.toDto() = PackageItemDto(
    productId = product.id,
    productName = product.name,
    quantity = quantity,
    unit = product.unit
)

fun StorePromotion.toDto() = PromotionDto(
    id = id, storeId = store.id, storeName = store.name,
    categoryId = category?.id, categoryName = category?.name,
    title = title, description = description,
    discountPercent = discountPercent, dayOfWeek = dayOfWeek,
    timeFrom = timeFrom?.toString(), timeTo = timeTo?.toString(),
    validFrom = validFrom.toString(), validTo = validTo.toString()
)
