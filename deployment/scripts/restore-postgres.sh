#!/usr/bin/env sh
set -eu

if [ "$#" -ne 1 ]; then
  echo "Usage: CONFIRM_RESTORE=yes sh deployment/scripts/restore-postgres.sh <backup.dump>" >&2
  exit 1
fi

if [ "${CONFIRM_RESTORE:-}" != "yes" ]; then
  echo "Restore can replace existing database objects. Set CONFIRM_RESTORE=yes to continue." >&2
  exit 1
fi

BACKUP_FILE=$1
if [ ! -s "$BACKUP_FILE" ]; then
  echo "Backup file does not exist or is empty: $BACKUP_FILE" >&2
  exit 1
fi

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)
COMPOSE_FILE=${COMPOSE_FILE:-"$ROOT_DIR/docker-compose.production.yml"}
ENV_FILE=${ENV_FILE:-"$ROOT_DIR/.env.production"}

docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T postgres \
  sh -c 'pg_restore --clean --if-exists --no-owner --no-privileges -U "$POSTGRES_USER" -d "$POSTGRES_DB"' \
  < "$BACKUP_FILE"

echo "Restore completed from: $BACKUP_FILE"
