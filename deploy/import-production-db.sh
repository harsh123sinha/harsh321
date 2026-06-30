#!/bin/bash
# Import a mysqldump into production realestate DB (run on VPS as root).
set -euo pipefail

DUMP="${1:-/tmp/realestate-export.sql}"
DB_PASS=$(cat /root/.htls_db_pass)

if [[ ! -f "$DUMP" ]]; then
  echo "Dump not found: $DUMP"
  exit 1
fi

echo "Importing $DUMP into realestate..."
mysql -u htls -p"$DB_PASS" realestate < "$DUMP"
echo "Done. Row counts:"
mysql -u htls -p"$DB_PASS" realestate -e \
  "SELECT COUNT(*) AS properties FROM properties;
   SELECT COUNT(*) AS users FROM user;
   SELECT COUNT(*) AS brokers FROM brokers;"
