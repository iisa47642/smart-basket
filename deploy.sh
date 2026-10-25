#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

if [[ "${EUID}" -ne 0 ]]; then
  if ! command -v sudo >/dev/null 2>&1; then
    echo "Для установки Docker запустите скрипт от root."
    exit 1
  fi
  exec sudo --preserve-env=HTTP_PORT bash "$0" "$@"
fi

cd "$PROJECT_DIR"

install_docker() {
  if ! command -v apt-get >/dev/null 2>&1; then
    echo "Автоустановка Docker поддерживается только на Ubuntu и Debian."
    echo "Установите Docker Engine с Compose plugin и запустите скрипт повторно."
    exit 1
  fi

  # shellcheck disable=SC1091
  . /etc/os-release
  case "${ID:-}" in
    ubuntu|debian) ;;
    *)
      echo "Автоустановка Docker поддерживается только на Ubuntu и Debian (обнаружено: ${ID:-unknown})."
      exit 1
      ;;
  esac

  echo "Устанавливаю Docker Engine..."
  apt-get update
  apt-get install -y ca-certificates curl gnupg
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL "https://download.docker.com/linux/${ID}/gpg" | \
    gpg --dearmor --batch --yes -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg

  local architecture
  architecture="$(dpkg --print-architecture)"
  echo "deb [arch=${architecture} signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/${ID} ${VERSION_CODENAME} stable" \
    > /etc/apt/sources.list.d/docker.list

  apt-get update
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable --now docker
}

if ! command -v docker >/dev/null 2>&1 || ! docker compose version >/dev/null 2>&1; then
  install_docker
fi

if ! docker info >/dev/null 2>&1; then
  systemctl start docker
fi

if [[ ! -f .env ]]; then
  if ! command -v openssl >/dev/null 2>&1; then
    apt-get update
    apt-get install -y openssl
  fi

  db_password="$(openssl rand -hex 24)"
  http_port="${HTTP_PORT:-80}"
  umask 077
  {
    echo "POSTGRES_DB=smartbasket"
    echo "POSTGRES_USER=smartbasket"
    echo "POSTGRES_PASSWORD=${db_password}"
    echo "HTTP_PORT=${http_port}"
  } > .env
  echo "Создан .env со случайным паролем PostgreSQL."
fi

echo "Проверяю конфигурацию Docker Compose..."
docker compose config --quiet

echo "Собираю и запускаю Smart Basket..."
docker compose up -d --build --remove-orphans

echo
docker compose ps
echo
echo "Smart Basket запущен. Откройте в браузере: http://IP_СЕРВЕРА"
echo "Логи: cd '$PROJECT_DIR' && sudo docker compose logs -f"
