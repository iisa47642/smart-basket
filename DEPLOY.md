# Развёртывание Smart Basket на VPS

Проект запускается в трёх контейнерах:

- `frontend` — Nginx, который раздаёт React и проксирует `/api` в backend;
- `backend` — Spring Boot на Java 21;
- `postgres` — PostgreSQL с постоянным Docker volume.

Наружу публикуется только HTTP-порт `80`. Backend и PostgreSQL доступны только внутри Docker-сети.

## Требования к серверу

- Ubuntu или Debian;
- пользователь с правами `sudo` или `root`;
- открытые входящие TCP-порты `22` и `80` в firewall VPS-провайдера.

## Первый запуск

Скопируйте весь каталог проекта на сервер, перейдите в него и выполните:

```bash
chmod +x deploy.sh
./deploy.sh
```

Скрипт:

1. установит Docker Engine и Docker Compose plugin, если они отсутствуют;
2. создаст `.env` со случайным паролем PostgreSQL;
3. соберёт frontend и backend;
4. запустит приложение в фоне.

Откройте приложение по адресу `http://IP_СЕРВЕРА`.

## Мониторинг

Spring Boot Actuator доступен через тот же HTTP-порт:

- `/actuator/health` — состояние приложения и PostgreSQL;
- `/actuator/info` — общая информация о приложении;
- `/actuator/metrics` — список доступных метрик;
- `/actuator/metrics/{metric.name}` — значение конкретной метрики;
- `/actuator/prometheus` — метрики в формате Prometheus.

Эндпоинты мониторинга опубликованы без авторизации. Потенциально чувствительные Actuator-эндпоинты (`env`, `configprops`, `beans` и другие) не экспонируются.

Если порт `80` уже занят, перед первым запуском можно выбрать другой:

```bash
HTTP_PORT=8088 ./deploy.sh
```

Тогда приложение будет доступно по адресу `http://IP_СЕРВЕРА:8088`.

## Обновление приложения

Замените файлы проекта новой версией и снова запустите:

```bash
./deploy.sh
```

Содержимое базы данных при обновлении сохраняется в Docker volume.

## Полезные команды

```bash
# Состояние контейнеров
sudo docker compose ps

# Логи всех сервисов
sudo docker compose logs -f

# Логи только backend
sudo docker compose logs -f backend

# Перезапуск
sudo docker compose restart

# Остановка без удаления базы
sudo docker compose down
```

Не запускайте `docker compose down -v`, если хотите сохранить данные PostgreSQL.
