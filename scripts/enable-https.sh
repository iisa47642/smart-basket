#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [[ $EUID -ne 0 ]]; then echo 'Run with sudo'; exit 1; fi
public_ip="${1:?Pass the public IPv4 address}"
if [[ ! "$public_ip" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then echo 'Expected IPv4 address'; exit 1; fi
install -d -m 755 /var/www/certbot
install -d -m 700 /etc/letsencrypt /var/lib/letsencrypt
docker pull certbot/certbot:v5.4.0
# Standalone validation needs public port 80. Restore the running frontend even if validation fails.
trap 'docker compose start frontend' EXIT
docker compose stop frontend
docker run --rm -p 80:80 -v /etc/letsencrypt:/etc/letsencrypt -v /var/lib/letsencrypt:/var/lib/letsencrypt certbot/certbot:v5.4.0 certonly --standalone --preferred-profile shortlived --ip-address "$public_ip" --cert-name smart-basket --non-interactive --agree-tos --register-unsafely-without-email
docker compose -f docker-compose.yml -f docker-compose.https.yml up -d --no-build
install -m 644 deploy/smart-basket-cert-renew.service deploy/smart-basket-cert-renew.timer /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now smart-basket-cert-renew.timer
trap - EXIT
echo "HTTPS configured for $public_ip. Check the certificate and renewal with the commands in DEPLOY.md."
