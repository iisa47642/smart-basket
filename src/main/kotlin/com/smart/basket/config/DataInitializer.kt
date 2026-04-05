package com.smart.basket.config

import com.smart.basket.entity.*
import com.smart.basket.repository.*
import org.springframework.boot.CommandLineRunner
import org.springframework.stereotype.Component
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDate
import java.time.LocalTime
import kotlin.random.Random

@Component
class DataInitializer(
    private val cityRepo: CityRepository,
    private val storeRepo: StoreRepository,
    private val categoryRepo: CategoryRepository,
    private val productRepo: ProductRepository,
    private val priceRepo: ProductPriceRepository,
    private val packageRepo: ProductPackageRepository,
    private val packageItemRepo: PackageItemRepository,
    private val promoRepo: StorePromotionRepository
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

        // === Packages ===
        val studentPkg = packageRepo.save(ProductPackage(
            name = "Студенческий", description = "Базовый набор продуктов на неделю для студента. Экономичный вариант.",
            icon = "🎓", type = "BUDGET"
        ))
        // Student: bread, milk, eggs, pasta, potatoes, tea, sugar (7 items)
        listOf(products[1] to 2, products[0] to 2, products[4] to 1, products[9] to 2, products[15] to 2, products[16] to 1, products[10] to 1)
            .forEach { (prod, qty) -> packageItemRepo.save(PackageItem(productPackage = studentPkg, product = prod, quantity = qty)) }

        val familyPkg = packageRepo.save(ProductPackage(
            name = "Семейный", description = "Сбалансированный набор продуктов на неделю для семьи из 3-4 человек.",
            icon = "👨‍👩‍👧‍👦", type = "MEDIUM"
        ))
        // Family: milk, bread, butter, chicken, eggs, cheese, kefir, rice, buckwheat, pasta, oil, apples, potatoes, smetana, baton (15 items)
        listOf(products[0] to 4, products[1] to 3, products[2] to 2, products[3] to 2, products[4] to 2, products[5] to 2,
            products[6] to 3, products[7] to 1, products[8] to 1, products[9] to 2, products[11] to 1, products[12] to 2,
            products[15] to 3, products[18] to 2, products[20] to 3)
            .forEach { (prod, qty) -> packageItemRepo.save(PackageItem(productPackage = familyPkg, product = prod, quantity = qty)) }

        val premiumPkg = packageRepo.save(ProductPackage(
            name = "Премиум", description = "Набор качественных продуктов для гурманов. Включает кофе, сыр, фрукты.",
            icon = "⭐", type = "PREMIUM"
        ))
        // Premium: butter, chicken, cheese, coffee, smetana, tvorog, bananas, tomatoes, juice, kolbasa (10 items)
        listOf(products[2] to 2, products[3] to 3, products[5] to 3, products[17] to 2, products[18] to 3,
            products[19] to 3, products[13] to 2, products[14] to 2, products[22] to 3, products[21] to 2)
            .forEach { (prod, qty) -> packageItemRepo.save(PackageItem(productPackage = premiumPkg, product = prod, quantity = qty)) }

        val healthPkg = packageRepo.save(ProductPackage(
            name = "Здоровое питание", description = "Набор для тех, кто следит за здоровьем. Овощи, фрукты, кефир, творог.",
            icon = "🥗", type = "HEALTH"
        ))
        // Health: kefir, tvorog, apples, bananas, tomatoes, potatoes, chicken, eggs, buckwheat, water (10 items)
        listOf(products[6] to 4, products[19] to 3, products[12] to 3, products[13] to 2, products[14] to 2,
            products[15] to 2, products[3] to 2, products[4] to 2, products[8] to 2, products[23] to 4)
            .forEach { (prod, qty) -> packageItemRepo.save(PackageItem(productPackage = healthPkg, product = prod, quantity = qty)) }

        val monthlyPkg = packageRepo.save(ProductPackage(
            name = "На месяц", description = "Полный набор базовых продуктов на месяц. Все необходимое для дома.",
            icon = "📦", type = "MONTHLY"
        ))
        // Monthly: all basic items in larger quantities
        listOf(products[0] to 8, products[1] to 8, products[2] to 4, products[3] to 4, products[4] to 4,
            products[5] to 3, products[6] to 6, products[7] to 2, products[8] to 2, products[9] to 4,
            products[10] to 2, products[11] to 2, products[12] to 4, products[13] to 3, products[14] to 3,
            products[15] to 5, products[16] to 2, products[17] to 1, products[18] to 4, products[19] to 4,
            products[20] to 6, products[21] to 3, products[22] to 4, products[23] to 6, products[24] to 2)
            .forEach { (prod, qty) -> packageItemRepo.save(PackageItem(productPackage = monthlyPkg, product = prod, quantity = qty)) }

        // === Store Promotions ===
        val nextMonth = today.plusMonths(1)

        // Moscow stores promotions
        promoRepo.save(StorePromotion(store = moscowStores[0], category = bakery, title = "Скидка 20% на выпечку после 18:00",
            description = "Каждый день с 18:00 до закрытия скидка на все хлебобулочные изделия", discountPercent = 20,
            timeFrom = LocalTime.of(18, 0), timeTo = LocalTime.of(23, 0), validFrom = today, validTo = nextMonth))
        promoRepo.save(StorePromotion(store = moscowStores[1], category = dairy, title = "Молочные понедельники",
            description = "Каждый понедельник скидка 15% на все молочные продукты", discountPercent = 15,
            dayOfWeek = "MONDAY", validFrom = today, validTo = nextMonth))
        promoRepo.save(StorePromotion(store = moscowStores[2], category = vegs, title = "Свежие овощи со скидкой 10%",
            description = "Постоянная акция на овощи и фрукты", discountPercent = 10,
            validFrom = today, validTo = nextMonth))
        promoRepo.save(StorePromotion(store = moscowStores[3], category = grocery, title = "Бакалея: 3 по цене 2",
            description = "При покупке 3 единиц бакалеи самая дешёвая — бесплатно",
            validFrom = today, validTo = nextMonth))
        promoRepo.save(StorePromotion(store = moscowStores[0], category = meat, title = "Мясные выходные",
            description = "В субботу и воскресенье скидка на мясную продукцию", discountPercent = 12,
            dayOfWeek = "SATURDAY", validFrom = today, validTo = nextMonth))

        // SPb stores promotions
        promoRepo.save(StorePromotion(store = spbStores[0], category = drinks, title = "Напитки со скидкой 10%",
            description = "Акция на все напитки до конца месяца", discountPercent = 10,
            validFrom = today, validTo = nextMonth))
        promoRepo.save(StorePromotion(store = spbStores[2], category = dairy, title = "Лента: молочные скидки",
            description = "Скидка 18% на молочную продукцию по средам", discountPercent = 18,
            dayOfWeek = "WEDNESDAY", validFrom = today, validTo = nextMonth))
        promoRepo.save(StorePromotion(store = spbStores[3], category = bakery, title = "Вечерняя выпечка -25%",
            description = "С 19:00 скидка на хлебобулочные изделия", discountPercent = 25,
            timeFrom = LocalTime.of(19, 0), timeTo = LocalTime.of(22, 0), validFrom = today, validTo = nextMonth))

        // Kazan stores promotions
        promoRepo.save(StorePromotion(store = kazanStores[2], category = meat, title = "Бахетле: свежее мясо -15%",
            description = "Скидка на мясные продукты по пятницам", discountPercent = 15,
            dayOfWeek = "FRIDAY", validFrom = today, validTo = nextMonth))
        promoRepo.save(StorePromotion(store = kazanStores[0], category = vegs, title = "Овощи дня",
            description = "Каждый день новая скидка на один вид овощей", discountPercent = 20,
            validFrom = today, validTo = nextMonth))
    }
}
