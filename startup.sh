#!/bin/bash
pip install --quiet pyodbc
python -c "import db; db.init_db(force=True)"
exec gunicorn app:app --bind 0.0.0.0:8000 --timeout 120
