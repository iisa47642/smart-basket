package com.smart.basket.config

import com.smart.basket.entity.*
import com.smart.basket.repository.*
import org.springframework.boot.CommandLineRunner
import org.springframework.stereotype.Component
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDate
import kotlin.random.Random

@Component
class DataInitializer(
    private val cityRepo: CityRepository,
    private val storeRepo: StoreRepository,
    private val categoryRepo: CategoryRepository,
    private val productRepo: ProductRepository,
    private val priceRepo: ProductPriceRepository
) : CommandLineRunner {

    override fun run(vararg args: String) {
        if (cityRepo.count() > 0L) return

        // Cities
        val moscow = cityRepo.save(City(name = "Москва"))
        val spb = cityRepo.save(City(name = "Санкт-Петербург"))
        val kazan = cityRepo.save(City(name = "Казань"))

        // Stores
        val moscowStores = listOf(
            storeRepo.save(Store(name = "Пятёрочка", city = moscow, address = "ул. Тверская, 15")),
            storeRepo.save(Store(name = "Магнит", city = moscow, address = "ул. Арбат, 24")),
            storeRepo.save(Store(name = "Перекрёсток", city = moscow, address = "Ленинский пр-т, 42")),
            storeRepo.save(Store(name = "Ашан", city = moscow, address = "МКАД 14-й км"))
        )
        val spbStores = listOf(
            storeRepo.save(Store(name = "Пятёрочка", city = spb, address = "Невский пр-т, 30")),
            storeRepo.save(Store(name = "Магнит", city = spb, address = "ул. Садовая, 18")),
            storeRepo.save(Store(name = "Лента", city = spb, address = "пр-т Просвещения, 87")),
            storeRepo.save(Store(name = "Окей", city = spb, address = "Московский пр-т, 55"))
        )
        val kazanStores = listOf(
            storeRepo.save(Store(name = "Пятёрочка", city = kazan, address = "ул. Баумана, 12")),
            storeRepo.save(Store(name = "Магнит", city = kazan, address = "ул. Пушкина, 33")),
            storeRepo.save(Store(name = "Бахетле", city = kazan, address = "ул. Островского, 57"))
        )

        val allStores = moscowStores + spbStores + kazanStores

        // Categories
        val dairy = categoryRepo.save(Category(name = "Молочные"))
        val bakery = categoryRepo.save(Category(name = "Хлебобулочные"))
        val meat = categoryRepo.save(Category(name = "Мясные"))
        val vegs = categoryRepo.save(Category(name = "Овощи и фрукты"))
        val drinks = categoryRepo.save(Category(name = "Напитки"))
        val grocery = categoryRepo.save(Category(name = "Бакалея"))

        // Products with base prices
        data class ProductDef(val name: String, val category: Category, val unit: String, val basePrice: Double)

        val productDefs = listOf(
            ProductDef("Молоко 1л", dairy, "л", 82.0),
            ProductDef("Хлеб белый", bakery, "шт", 55.0),
            ProductDef("Масло сливочное 200г", dairy, "шт", 185.0),
            ProductDef("Куриная грудка 1кг", meat, "кг", 370.0),
            ProductDef("Яйца 10шт", dairy, "уп", 115.0),
            ProductDef("Сыр 200г", dairy, "шт", 250.0),
            ProductDef("Кефир 1л", dairy, "л", 75.0),
            ProductDef("Рис 1кг", grocery, "кг", 105.0),
            ProductDef("Гречка 1кг", grocery, "кг", 130.0),
            ProductDef("Макароны 500г", grocery, "шт", 90.0),
            ProductDef("Сахар 1кг", grocery, "кг", 78.0),
            ProductDef("Подсолнечное масло 1л", grocery, "л", 150.0),
            ProductDef("Яблоки 1кг", vegs, "кг", 140.0),
            ProductDef("Бананы 1кг", vegs, "кг", 120.0),
            ProductDef("Помидоры 1кг", vegs, "кг", 200.0),
            ProductDef("Картофель 1кг", vegs, "кг", 70.0),
            ProductDef("Чай чёрный 100г", drinks, "шт", 140.0),
            ProductDef("Кофе молотый 250г", drinks, "шт", 400.0),
            ProductDef("Сметана 200г", dairy, "шт", 105.0),
            ProductDef("Творог 200г", dairy, "шт", 115.0),
            ProductDef("Батон нарезной", bakery, "шт", 50.0),
            ProductDef("Колбаса варёная 300г", meat, "шт", 260.0),
            ProductDef("Сок апельсиновый 1л", drinks, "л", 160.0),
            ProductDef("Вода минеральная 1.5л", drinks, "шт", 60.0),
            ProductDef("Мука 1кг", grocery, "кг", 80.0)
        )

        val products = productDefs.map { def ->
            productRepo.save(Product(name = def.name, category = def.category, unit = def.unit))
        }

        // Generate prices
        val random = Random(42)
        val today = LocalDate.now()
        val dates = (0..6).map { today.minusDays((it * 9).toLong()) } // ~7 dates over last 2 months

        products.forEachIndexed { pIdx, product ->
            val basePriceDef = productDefs[pIdx].basePrice
            allStores.forEach { store ->
                // Each store has a price multiplier (5-25% variation)
                val storeMultiplier = 0.88 + random.nextDouble() * 0.24 // 0.88 to 1.12 range
                dates.forEach { date ->
                    // Date variation ±3-8%
                    val dateVariation = 0.94 + random.nextDouble() * 0.12 // 0.94 to 1.06
                    val finalPrice = basePriceDef * storeMultiplier * dateVariation
                    priceRepo.save(
                        ProductPrice(
                            product = product,
                            store = store,
                            price = BigDecimal(finalPrice).setScale(2, RoundingMode.HALF_UP),
                            priceDate = date
                        )
                    )
                }
            }
        }
    }
}
