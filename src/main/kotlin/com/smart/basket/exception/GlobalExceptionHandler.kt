package com.smart.basket.exception

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException
import org.springframework.web.bind.MissingServletRequestParameterException
import org.slf4j.LoggerFactory

@RestControllerAdvice
class GlobalExceptionHandler {
    private val log = LoggerFactory.getLogger(javaClass)

    @ExceptionHandler(DataIntegrityViolationException::class)
    fun conflict(): ResponseEntity<Map<String, String>> = ResponseEntity.status(409)
        .body(mapOf("error" to "Запись уже существует или нарушает ограничения данных"))

    @ExceptionHandler(HttpMessageNotReadableException::class, MethodArgumentTypeMismatchException::class,
        MissingServletRequestParameterException::class, IllegalArgumentException::class)
    fun badRequest(): ResponseEntity<Map<String, String>> = ResponseEntity.badRequest()
        .body(mapOf("error" to "Проверьте параметры и формат запроса"))

    @ExceptionHandler(ResourceNotFoundException::class)
    fun handleNotFound(ex: ResourceNotFoundException): ResponseEntity<Map<String, String?>> =
        ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to ex.message))

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidation(ex: MethodArgumentNotValidException): ResponseEntity<Map<String, Any>> {
        val errors = ex.bindingResult.fieldErrors.associate { it.field to (it.defaultMessage ?: "Invalid") }
        return ResponseEntity.badRequest().body(mapOf("errors" to errors))
    }

    @ExceptionHandler(Exception::class)
    fun handleGeneral(ex: Exception): ResponseEntity<Map<String, String>> {
        log.error("Request failed", ex)
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(mapOf("error" to "Внутренняя ошибка сервера"))
    }
}
