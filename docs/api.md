# API и права доступа

Базовый путь `/api/v1`. Формат обычных запросов и ответов — JSON. Вход использует стандартную форму `application/x-www-form-urlencoded`.

| Метод и путь | Доступ | Результат |
|---|---|---|
| GET /auth/csrf | Все | Защитный токен и имя заголовка |
| POST /auth/login | Все, с CSRF | username/password; 204 либо 401 |
| GET /auth/me | Все | username и список ролей; для гостя username=null |
| POST /auth/logout | С CSRF | 204, завершение сессии |
| GET /cities, /stores, /categories, /products | Все | Каталог и справочники |
| POST /analytics/cart/compare | Все, с CSRF | Сравнение корзины |
| GET /packages и /packages/{id}/cost | Все | Наборы и их стоимость |
| POST /packages/compare | Все, с CSRF | Сравнение выбранных наборов |
| GET /promotions и /promotions/active | Все | Акции |
| GET /admin/prices?productId=1&storeId=1 | ADMIN | История цен выбранной пары |
| GET /admin/prices/{id} | ADMIN | Одна запись |
| POST /admin/prices | ADMIN, CSRF | 201 и Location |
| PUT /admin/prices/{id} | ADMIN, CSRF | 200 и обновлённая запись |
| DELETE /admin/prices/{id} | ADMIN, CSRF | 204 |

Тело создания/изменения цены: `{"productId":1,"storeId":1,"price":79.90,"priceDate":"2026-10-25"}`. Это пример формата, а не команда для загрузки в рабочую базу. Цена положительная, максимум восемь цифр до точки и две после; дата не позже текущей. Сочетание товара, магазина и даты уникально.

Перед каждой изменяющей операцией клиент вызывает `/auth/csrf`, сохраняет cookie сессии и передаёт `token` в заголовке `headerName`. После входа и выхода токен получают повторно. Пароль не хранится в localStorage. Сессионная cookie HttpOnly, SameSite=Strict; в HTTPS-конфигурации также Secure.

Ошибки: 400 — некорректные данные; 401 — нужен вход или неверные учётные данные; 403 — нет прав либо CSRF не прошёл; 404 — объект не найден; 409 — конфликт ограничений; 429 — слишком много попыток входа на Nginx. Внутренние сообщения исключений не возвращаются клиенту.

`/actuator/health` открыт и не раскрывает подробности гостю. Остальные опубликованные Actuator-эндпоинты требуют ADMIN. Swagger описывает публичные и административные контроллеры; вход и выход обрабатывает фильтр Spring Security, их формат приведён выше и в описании OpenAPI.
