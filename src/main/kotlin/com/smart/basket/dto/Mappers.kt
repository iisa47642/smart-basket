package com.smart.basket.dto

import com.smart.basket.entity.*

fun City.toDto() = CityDto(id = id, name = name)
fun Store.toDto() = StoreDto(id = id, name = name, cityName = city.name, address = address)
fun Category.toDto() = CategoryDto(id = id, name = name)
fun Product.toDto() = ProductDto(id = id, name = name, categoryName = category?.name, unit = unit)
