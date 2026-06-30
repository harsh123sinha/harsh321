#!/bin/bash
# Reset production admin password (run on VPS as root).
# Usage: bash reset-admin-password.sh 'YourNewPassword'
set -euo pipefail

NEW_PASS="${1:-}"
EMAIL="${2:-harshsinha.user2002@gmail.com}"

if [[ -z "$NEW_PASS" ]]; then
  echo "Usage: bash reset-admin-password.sh 'NewPassword' [email]"
  exit 1
fi

DB_PASS=$(cat /root/.htls_db_pass)
HASH=$(node -e "const bcrypt=require('bcryptjs'); bcrypt.hash(process.argv[1],10).then(h=>console.log(h));" "$NEW_PASS")

mysql -u htls -p"$DB_PASS" realestate -e \
  "UPDATE admins SET hashed_password='${HASH}' WHERE LOWER(TRIM(email))=LOWER(TRIM('${EMAIL}')); SELECT id,email,name FROM admins WHERE LOWER(TRIM(email))=LOWER(TRIM('${EMAIL}'));"

echo "Admin password updated for ${EMAIL}"
