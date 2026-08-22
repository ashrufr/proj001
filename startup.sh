#!/bin/bash
# Install the Microsoft ODBC driver if missing (required by pyodbc on App Service).
if ! odbcinst -q -d -n "ODBC Driver 18 for SQL Server" >/dev/null 2>&1; then
  . /etc/os-release
  case "$VERSION_CODENAME" in
    focal)    REPO="ubuntu/20.04" ;;
    jammy)    REPO="ubuntu/22.04" ;;
    noble)    REPO="ubuntu/24.04" ;;
    bullseye) REPO="debian/11" ;;
    bookworm) REPO="debian/12" ;;
    *)        REPO="" ;;
  esac
  if [ -n "$REPO" ]; then
    sudo curl -sSL -o /etc/apt/trusted.gpg.d/microsoft.asc https://packages.microsoft.com/keys/microsoft.asc
    echo "deb [arch=amd64,arm64] https://packages.microsoft.com/$REPO/prod $VERSION_CODENAME main" \
      | sudo tee /etc/apt/sources.list.d/mssql-release.list >/dev/null
    sudo apt-get update -qq
    sudo ACCEPT_EULA=Y apt-get install -y -qq msodbcsql18
  fi
fi

pip install --quiet pyodbc
python -c "import db; db.init_db()"
exec gunicorn app:app --bind 0.0.0.0:8000 --timeout 120
