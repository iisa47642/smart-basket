#!/usr/bin/env bash
# Encrypt an existing custom-format pg_dump for the holder of a matching private key.
set -euo pipefail
umask 077
if [[ $# != 3 || ! $1 =~ ^([[:xdigit:]]{40}|[[:xdigit:]]{64})$ ]]; then
  echo 'Usage: encrypt-backup.sh RECIPIENT_FINGERPRINT INPUT.dump OUTPUT.gpg' >&2
  exit 2
fi
test -s "$2"
target=$3
tmp=$(mktemp "${target}.XXXXXX")
trap 'rm -f -- "$tmp"' EXIT
gpg --batch --trust-model always --recipient "$1" --output - --encrypt -- "$2" > "$tmp"
# Publish only complete ciphertext, without replacing an earlier backup.
ln -- "$tmp" "$target"
