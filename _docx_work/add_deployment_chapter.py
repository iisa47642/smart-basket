from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.shared import Pt, Cm


ROOT = Path(__file__).resolve().parents[1]
INPUT = ROOT / "report_input.docx"
OUTPUT = ROOT / "smart-basket-report-v3-deployment.docx"


def add_paragraph_before(anchor, text="", style="Normal", *, bold_lead=None):
    paragraph = anchor.insert_paragraph_before(style=style)
    if bold_lead and text.startswith(bold_lead):
        paragraph.add_run(bold_lead).bold = True
        paragraph.add_run(text[len(bold_lead):])
    else:
        paragraph.add_run(text)
    return paragraph


def add_code_before(anchor, text):
    paragraph = anchor.insert_paragraph_before(style="Normal")
    paragraph.paragraph_format.left_indent = Cm(1.0)
    paragraph.paragraph_format.space_before = Pt(2)
    paragraph.paragraph_format.space_after = Pt(6)
    run = paragraph.add_run(text)
    run.font.name = "Courier New"
    run.font.size = Pt(9.5)
    run._element.get_or_add_rPr().rFonts.set(qn("w:ascii"), "Courier New")
    run._element.get_or_add_rPr().rFonts.set(qn("w:hAnsi"), "Courier New")
    return paragraph


doc = Document(INPUT)

anchor = next(
    paragraph
    for paragraph in doc.paragraphs
    if paragraph.text.strip() == "8. Список использованных источников"
)

chapter = add_paragraph_before(
    anchor,
    "Глава 3. Развертывание и эксплуатация приложения",
    "Heading 1",
)
chapter.paragraph_format.page_break_before = True

add_paragraph_before(
    anchor,
    "Завершающим этапом практической работы стало развертывание Smart Basket на удаленном сервере. "
    "Приложение было перенесено на виртуальный сервер с Ubuntu 24.04.5 LTS и опубликовано по публичному "
    "IP-адресу 158.160.207.68. Основной задачей являлось создание воспроизводимой конфигурации, при которой "
    "для запуска системы достаточно установить Docker и выполнить один сценарий развертывания. Такой подход "
    "исключает необходимость отдельно устанавливать на сервер Java, Node.js, PostgreSQL и Nginx.",
)

add_paragraph_before(anchor, "1. Архитектура развертывания", "Heading 2")
add_paragraph_before(
    anchor,
    "Production-конфигурация построена на Docker Compose и включает три изолированных сервиса: frontend, "
    "backend и postgres. Все контейнеры объединены внутренней сетью Docker. Наружу опубликован только порт 80 "
    "контейнера frontend; Spring Boot и PostgreSQL не имеют прямых публичных портов.",
)
add_code_before(anchor, "Клиент → Nginx :80 → Spring Boot :8080 → PostgreSQL :5432")
add_paragraph_before(
    anchor,
    "Frontend собирается в многоэтапном Docker-образе. На первом этапе Node.js 22 и Vite формируют статические "
    "файлы React-приложения, после чего они копируются в минимальный образ Nginx на базе Alpine Linux. Nginx "
    "раздает пользовательский интерфейс, поддерживает маршрутизацию одностраничного приложения и выполняет "
    "обратное проксирование запросов к backend.",
)
add_paragraph_before(
    anchor,
    "Backend также собирается в два этапа. В образе Eclipse Temurin JDK 21 запускается Gradle-задача bootJar, "
    "а готовый JAR-файл переносится в облегченный образ Eclipse Temurin JRE 21. Приложение работает от "
    "непривилегированного пользователя app, что уменьшает последствия возможной компрометации контейнера.",
)
add_paragraph_before(
    anchor,
    "Сервис postgres использует официальный образ PostgreSQL 16 Alpine. Данные размещаются в именованном Docker "
    "volume pgdata, поэтому пересоздание или обновление контейнера не приводит к потере содержимого базы данных.",
)

add_paragraph_before(anchor, "2. Подготовка конфигурации проекта", "Heading 2")
add_paragraph_before(
    anchor,
    "Для production-среды адрес API во frontend был заменен с абсолютного localhost:8080 на относительный путь "
    "/api/v1. Благодаря этому браузер обращается к тому же IP-адресу и порту, с которого загружена страница, "
    "а Nginx самостоятельно передает запрос в контейнер backend. Для локальной разработки в Vite сохранено "
    "проксирование /api на localhost:8080.",
)
add_paragraph_before(
    anchor,
    "В docker-compose.yml параметры подключения Spring Boot к базе данных передаются через переменные окружения. "
    "Внутри Docker-сети используется адрес postgres:5432 вместо localhost. Имя базы, имя пользователя, пароль "
    "и публикуемый HTTP-порт хранятся в файле .env. При первом запуске сценарий deploy.sh создает данный файл "
    "с ограниченными правами доступа и генерирует случайный пароль PostgreSQL командой openssl.",
)
add_paragraph_before(
    anchor,
    "Для каждого сервиса настроена политика restart: unless-stopped. PostgreSQL проверяется командой pg_isready, "
    "backend — через /actuator/health, а Nginx — HTTP-запросом к 127.0.0.1. Зависимости запуска описаны через "
    "condition: service_healthy, поэтому frontend запускается только после готовности backend, а backend — после "
    "готовности базы данных.",
)

add_paragraph_before(anchor, "3. Развертывание на сервере", "Heading 2")
add_paragraph_before(
    anchor,
    "Проект был размещен в каталоге /opt/smart-basket. Для автоматизации создан сценарий deploy.sh, рассчитанный "
    "на Ubuntu и Debian. Сценарий проверяет наличие Docker Engine и Docker Compose plugin, при необходимости "
    "подключает официальный репозиторий Docker, устанавливает пакеты и включает службу Docker в автозапуске "
    "systemd. После этого проверяется конфигурация Compose и выполняется сборка контейнеров.",
)
add_code_before(anchor, "cd /opt/smart-basket\nsudo ./deploy.sh")
add_paragraph_before(
    anchor,
    "Основная команда запуска, выполняемая сценарием, имеет следующий вид:",
)
add_code_before(anchor, "docker compose up -d --build --remove-orphans")
add_paragraph_before(
    anchor,
    "Ключ -d переводит контейнеры в фоновый режим, --build обновляет образы при изменении исходного кода, а "
    "--remove-orphans удаляет контейнеры сервисов, исключенных из актуальной конфигурации. Повторный запуск "
    "deploy.sh используется для обновления приложения; volume PostgreSQL при этом сохраняется.",
)

add_paragraph_before(anchor, "4. Настройка Nginx и сетевого доступа", "Heading 2")
add_paragraph_before(
    anchor,
    "Nginx является единственной публичной точкой входа. Запросы к корневому пути обслуживаются статическими "
    "файлами React. Для клиентских маршрутов используется fallback на index.html. Пути /api/, /api-docs, "
    "/swagger-ui/ и /actuator/ проксируются на backend:8080 с передачей заголовков Host, X-Real-IP, "
    "X-Forwarded-For и X-Forwarded-Proto.",
)
add_paragraph_before(
    anchor,
    "На уровне Ubuntu был включен UFW с политикой запрета входящих соединений по умолчанию. Разрешены только "
    "22/tcp для администрирования по SSH и 80/tcp для HTTP-доступа к приложению. Аналогичное правило для "
    "80/tcp было добавлено в security group облачного провайдера. Порты 8080 и 5432 не открывались, поскольку "
    "они требуются только для обмена данными между контейнерами.",
)
add_paragraph_before(
    anchor,
    "На текущем этапе приложение работает по HTTP, так как доменное имя отсутствует. После подключения домена "
    "конфигурацию можно дополнить HTTPS на порту 443 и автоматическим выпуском сертификата. До этого момента "
    "передача конфиденциальных пользовательских данных через приложение не предполагается.",
)

add_paragraph_before(anchor, "5. Мониторинг приложения", "Heading 2")
add_paragraph_before(
    anchor,
    "Для контроля состояния Spring Boot подключены зависимости Spring Boot Actuator и Micrometer Prometheus. "
    "Без авторизации опубликован ограниченный набор служебных эндпоинтов:",
)
for item in (
    "/actuator/health — состояние приложения, подключения к PostgreSQL и дискового пространства;",
    "/actuator/info — общая информация о приложении;",
    "/actuator/metrics — перечень и получение отдельных метрик JVM и HTTP-запросов;",
    "/actuator/prometheus — метрики в текстовом формате для сбора системой Prometheus.",
):
    add_paragraph_before(anchor, item, "List Paragraph")
add_paragraph_before(
    anchor,
    "Потенциально чувствительные эндпоинты Actuator, включая env, configprops и beans, не экспонируются. "
    "Метрики снабжаются тегом application=smart-basket. В дальнейшем Prometheus может периодически опрашивать "
    "endpoint /actuator/prometheus, а Grafana — отображать загрузку JVM, расход памяти, число HTTP-запросов, "
    "время ответа и доступность базы данных.",
)

add_paragraph_before(anchor, "6. Проверка результата", "Heading 2")
add_paragraph_before(
    anchor,
    "После развертывания была выполнена проверка контейнеров командой docker compose ps. Сервисы frontend, "
    "backend и postgres получили статус healthy. С внешнего компьютера были проверены главная страница, API, "
    "Swagger UI и endpoints Actuator. Все запросы завершились с кодом HTTP 200.",
)
add_paragraph_before(
    anchor,
    "Приложение доступно по адресу http://158.160.207.68/. API работает через префикс /api/v1, документация "
    "OpenAPI — через /swagger-ui.html, а метрики Prometheus — через /actuator/prometheus. После перезагрузки "
    "сервера Docker запускается автоматически, а контейнеры восстанавливаются согласно заданной политике "
    "перезапуска.",
)
add_paragraph_before(
    anchor,
    "В результате сформирована воспроизводимая схема развертывания, отделяющая приложение от конфигурации "
    "операционной системы. Обновление выполняется повторным запуском одного сценария, данные PostgreSQL "
    "сохраняются независимо от контейнера, а состояние системы контролируется стандартными HTTP-метриками. "
    "Выбранная архитектура подходит для учебной и демонстрационной эксплуатации Smart Basket и допускает "
    "дальнейшее подключение домена, TLS и централизованного мониторинга.",
)

# Список источников должен завершать весь отчет, а не вторую главу.
anchor.text = "Список использованных источников"
anchor.style = doc.styles["Heading 1"]
anchor.paragraph_format.page_break_before = True

doc.save(OUTPUT)
print(OUTPUT)
