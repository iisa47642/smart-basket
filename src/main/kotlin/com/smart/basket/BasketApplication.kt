package com.smart.basket

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class BasketApplication

fun main(args: Array<String>) {
    runApplication<BasketApplication>(*args)
}
