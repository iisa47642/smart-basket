#!/usr/bin/env bash
# Restore into a NEW temporary database only. The application database is never overwritten.
set -euo pipefail
cd "$(dirname "$0")/.."
test -f "${1:?Pass a backup .dump file}"
restore_db="restore_check_$(date +%s)_$$"
docker compose exec -T postgres sh -c 'createdb -U "$POSTGRES_USER" "$1"' sh "$restore_db"
trap 'docker compose exec -T postgres sh -c '\''dropdb -U "$POSTGRES_USER" "$1"'\'' sh "$restore_db"' EXIT
docker compose exec -T postgres sh -c 'pg_restore -U "$POSTGRES_USER" -d "$1" --exit-on-error --no-owner' sh "$restore_db" < "$1"
docker compose exec -T postgres sh -c 'psql -U "$POSTGRES_USER" -d "$1" -c "SELECT count(*) AS price_rows FROM product_prices;"' sh "$restore_db"
printf 'Backup restored successfully into a temporary database.\n'
