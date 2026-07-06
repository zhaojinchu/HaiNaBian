#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-${ROOT_DIR}/backups}"
STAMP="$(date -u +%Y-%m-%dT%H-%M-%SZ)"
OUTPUT="${BACKUP_DIR}/hainabian-${STAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"
chmod 700 "${BACKUP_DIR}"

docker compose \
  --env-file "${ROOT_DIR}/.env.production" \
  -f "${ROOT_DIR}/compose.production.yaml" \
  exec -T postgres \
  sh -c 'pg_dump --clean --if-exists --no-owner -U "$POSTGRES_USER" "$POSTGRES_DB"' \
  | gzip -9 > "${OUTPUT}"

chmod 600 "${OUTPUT}"
find "${BACKUP_DIR}" -type f -name "hainabian-*.sql.gz" -mtime +14 -delete

echo "Created ${OUTPUT}"
