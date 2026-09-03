"""Azure SQL data layer for HairNet.

Store and retrieve everything the app needs: businesses, services,
appointments, weekly hours, the signed-in user and business settings.

Public functions open their own connection, commit and close it. Pass
``conn=`` to join an existing transaction (used by init_db/import_state).
"""
import functools
import hashlib
import hmac
import os
import re
import secrets
import uuid
from datetime import datetime, timedelta

import pyodbc

CONN_STR = os.environ.get(
    "AZURE_SQL_CONNECTION",
    "DRIVER={ODBC Driver 18 for SQL Server};"
    "SERVER=tcp:proj001.database.windows.net,1433;"
    "DATABASE=proj001;"
    "UID=ashrufr;"
    "PWD=/bnK4th1r;",
)

VALID_STATUSES = {"pending", "confirmed", "cancelled", "completed"}


def connect():
    return pyodbc.connect(CONN_STR)


def _new_id(prefix="x"):
    return prefix + uuid.uuid4().hex[:10]


# ---------------------------------------------------------------------------
# password hashing (PBKDF2-HMAC-SHA256, salted)
# ---------------------------------------------------------------------------
_PBKDF2_ITERATIONS = 260_000


def hash_password(password):
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256", str(password).encode("utf-8"), salt.encode("utf-8"), _PBKDF2_ITERATIONS
    ).hex()
    return f"{salt}${digest}"


def verify_password(password, stored):
    if not stored or "$" not in stored:
        return False
    salt, expected = stored.split("$", 1)
    digest = hashlib.pbkdf2_hmac(
        "sha256", str(password).encode("utf-8"), salt.encode("utf-8"), _PBKDF2_ITERATIONS
    ).hex()
    return hmac.compare_digest(digest, expected)


# ---------------------------------------------------------------------------
# row helpers (pyodbc returns tuples, not dict rows)
# ---------------------------------------------------------------------------
def _row_to_dict(cursor, row):
    cols = [d[0] for d in cursor.description]
    return dict(zip(cols, row))


def _rows_to_dicts(cursor, rows):
    cols = [d[0] for d in cursor.description]
    return [dict(zip(cols, r)) for r in rows]


# ---------------------------------------------------------------------------
# connection decorator (auto commit/close)
# ---------------------------------------------------------------------------
def _with_conn(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        conn = kwargs.pop("conn", None)
        own = conn is None
        if own:
            conn = connect()
        try:
            result = func(conn, *args, **kwargs)
            if own:
                conn.commit()
            return result
        finally:
            if own:
                conn.close()
    return wrapper


# ---------------------------------------------------------------------------
# schema + seed
# ---------------------------------------------------------------------------
SCHEMA_SQL = """
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Businesses')
CREATE TABLE Businesses (
  id NVARCHAR(20) PRIMARY KEY,
  name NVARCHAR(200) NOT NULL UNIQUE,
  password_hash NVARCHAR(400) NOT NULL DEFAULT '',
  owner_id NVARCHAR(20) NULL,
  category NVARCHAR(100) NOT NULL DEFAULT '',
  street_address NVARCHAR(300) NOT NULL DEFAULT '',
  city NVARCHAR(100) NOT NULL DEFAULT '',
  zip_code NVARCHAR(20) NOT NULL DEFAULT '',
  contact_number NVARCHAR(30) NOT NULL DEFAULT '',
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Businesses') AND name = 'owner_id')
ALTER TABLE Businesses ADD owner_id NVARCHAR(20) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Businesses') AND name = 'category')
ALTER TABLE Businesses ADD category NVARCHAR(100) NOT NULL DEFAULT '';

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Businesses') AND name = 'street_address')
ALTER TABLE Businesses ADD street_address NVARCHAR(300) NOT NULL DEFAULT '';

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Businesses') AND name = 'city')
ALTER TABLE Businesses ADD city NVARCHAR(100) NOT NULL DEFAULT '';

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Businesses') AND name = 'zip_code')
ALTER TABLE Businesses ADD zip_code NVARCHAR(20) NOT NULL DEFAULT '';

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Businesses') AND name = 'contact_number')
ALTER TABLE Businesses ADD contact_number NVARCHAR(30) NOT NULL DEFAULT '';

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
CREATE TABLE Users (
  id NVARCHAR(20) PRIMARY KEY,
  name NVARCHAR(200) NOT NULL,
  email NVARCHAR(200) NOT NULL UNIQUE,
  role NVARCHAR(20) NOT NULL DEFAULT 'customer',
  password_hash NVARCHAR(400) NOT NULL DEFAULT '',
  google_id NVARCHAR(100) NOT NULL DEFAULT '',
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'google_id')
ALTER TABLE Users ADD google_id NVARCHAR(100) NOT NULL DEFAULT '';

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Services')
CREATE TABLE Services (
  id NVARCHAR(20) PRIMARY KEY,
  business_id NVARCHAR(20) NOT NULL REFERENCES Businesses(id),
  name NVARCHAR(200) NOT NULL,
  description NVARCHAR(MAX) NOT NULL DEFAULT '',
  duration INT NOT NULL,
  category NVARCHAR(100) NOT NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Appointments')
CREATE TABLE Appointments (
  id NVARCHAR(20) PRIMARY KEY,
  service_id NVARCHAR(20) NULL REFERENCES Services(id),
  business NVARCHAR(200) NOT NULL,
  service_name NVARCHAR(200) NOT NULL,
  category NVARCHAR(100) NOT NULL,
  duration INT NOT NULL,
  date NVARCHAR(10) NOT NULL,
  time NVARCHAR(5) NOT NULL,
  customer_name NVARCHAR(200) NOT NULL DEFAULT '',
  customer_id NVARCHAR(20) NULL REFERENCES Users(id),
  notes NVARCHAR(MAX) NOT NULL DEFAULT '',
  status NVARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Appointments') AND name = 'customer_id')
ALTER TABLE Appointments ADD customer_id NVARCHAR(20) NULL;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Hours')
CREATE TABLE Hours (
  day_of_week INT PRIMARY KEY,
  open_time NVARCHAR(5) NOT NULL,
  close_time NVARCHAR(5) NOT NULL
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Meta')
CREATE TABLE Meta (
  [key] NVARCHAR(100) PRIMARY KEY,
  value NVARCHAR(MAX) NOT NULL
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Reviews')
CREATE TABLE Reviews (
  id NVARCHAR(20) PRIMARY KEY,
  business NVARCHAR(200) NOT NULL,
  customer_id NVARCHAR(20) NULL,
  customer_name NVARCHAR(200) NOT NULL DEFAULT '',
  rating INT NOT NULL,
  comment NVARCHAR(MAX) NOT NULL DEFAULT '',
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

/* ---- indexes ---- */
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Services_BusinessId' AND object_id = OBJECT_ID('Services'))
CREATE INDEX IX_Services_BusinessId ON Services(business_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Services_CreatedAt' AND object_id = OBJECT_ID('Services'))
CREATE INDEX IX_Services_CreatedAt ON Services(created_at);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Appointments_Customer' AND object_id = OBJECT_ID('Appointments'))
CREATE INDEX IX_Appointments_Customer ON Appointments(customer_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Appointments_Business_Date' AND object_id = OBJECT_ID('Appointments'))
CREATE INDEX IX_Appointments_Business_Date ON Appointments(business, date);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Users_GoogleId' AND object_id = OBJECT_ID('Users'))
CREATE INDEX IX_Users_GoogleId ON Users(google_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Reviews_Business' AND object_id = OBJECT_ID('Reviews'))
CREATE INDEX IX_Reviews_Business ON Reviews(business);
"""


def init_db():
    """Create the schema. Existing tables and data are left untouched."""
    conn = connect()
    try:
        cursor = conn.cursor()
        for stmt in SCHEMA_SQL.strip().split(";"):
            stmt = stmt.strip()
            if stmt:
                cursor.execute(stmt)
        conn.commit()
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# businesses
# ---------------------------------------------------------------------------
def _get_or_create_business(conn, name, owner_id=None, category=None, street_address=None, city=None, zip_code=None):
    cursor = conn.cursor()
    row = cursor.execute("SELECT id FROM Businesses WHERE name = ?", (name,)).fetchone()
    if row:
        bid = row[0]
        # Fill in owner, category or address fields if they were previously missing.
        if owner_id:
            cursor.execute(
                "UPDATE Businesses SET owner_id = ? WHERE id = ? AND owner_id IS NULL",
                (owner_id, bid),
            )
        if category:
            cursor.execute(
                "UPDATE Businesses SET category = ? WHERE id = ? AND (category IS NULL OR category = '')",
                (category, bid),
            )
        if street_address:
            cursor.execute(
                "UPDATE Businesses SET street_address = ? WHERE id = ? AND (street_address IS NULL OR street_address = '')",
                (street_address, bid),
            )
        if city:
            cursor.execute(
                "UPDATE Businesses SET city = ? WHERE id = ? AND (city IS NULL OR city = '')",
                (city, bid),
            )
        if zip_code:
            cursor.execute(
                "UPDATE Businesses SET zip_code = ? WHERE id = ? AND (zip_code IS NULL OR zip_code = '')",
                (zip_code, bid),
            )
        return bid
    bid = _new_id("b")
    cursor.execute(
        "INSERT INTO Businesses (id, name, owner_id, category, street_address, city, zip_code) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (bid, name, owner_id, category or "", street_address or "", city or "", zip_code or ""),
    )
    return bid


def _claim_business_owner(conn, business, user_id):
    """Record user_id as the owner of a business that has no owner yet."""
    if not user_id:
        return
    bid = _get_or_create_business(conn, business, owner_id=user_id)
    conn.cursor().execute(
        "UPDATE Businesses SET owner_id = ? WHERE id = ? AND owner_id IS NULL",
        (user_id, bid),
    )


def _business_name(conn, business_id):
    cursor = conn.cursor()
    row = cursor.execute("SELECT name FROM Businesses WHERE id = ?", (business_id,)).fetchone()
    return row[0] if row else ""


@_with_conn
def get_business_owner(conn, business):
    """Return the id of the user account that created the business, or None."""
    if not business:
        return None
    cursor = conn.cursor()
    row = cursor.execute(
        "SELECT owner_id FROM Businesses WHERE name = ?", (business,)
    ).fetchone()
    return row[0] if row else None


def _has_column(conn, table, column):
    """True if the given column exists on the table (guards against migrations
    that have not run yet, so a missing column can't break the whole catalog)."""
    cursor = conn.cursor()
    row = cursor.execute(
        "SELECT COUNT(*) FROM sys.columns "
        "WHERE object_id = OBJECT_ID(?) AND name = ?",
        (table, column),
    ).fetchone()
    return bool(row and row[0])


@_with_conn
def get_business_category(conn, business):
    """Return the category of a business (by name), or ''."""
    if not business:
        return ""
    cursor = conn.cursor()
    if not _has_column(conn, "Businesses", "category"):
        return ""
    row = cursor.execute(
        "SELECT category FROM Businesses WHERE name = ?", (business,)
    ).fetchone()
    return (row[0] or "") if row else ""


@_with_conn
def get_business_contact_number(conn, business):
    """Return the contact number of a business (by name), or ''."""
    if not business:
        return ""
    cursor = conn.cursor()
    if not _has_column(conn, "Businesses", "contact_number"):
        return ""
    row = cursor.execute(
        "SELECT contact_number FROM Businesses WHERE name = ?", (business,)
    ).fetchone()
    return (row[0] or "") if row else ""


@_with_conn
def list_businesses(conn):
    """Return every real business with its category and address, for the public directory.

    Businesses that have no services yet are still included, so a newly
    created business shows up under its chosen category and is searchable.
    """
    cursor = conn.cursor()
    if _has_column(conn, "Businesses", "category"):
        has_addr = _has_column(conn, "Businesses", "street_address")
        has_contact = _has_column(conn, "Businesses", "contact_number")
        if has_addr and has_contact:
            rows = cursor.execute(
                "SELECT name, category, street_address, city, zip_code, contact_number FROM Businesses "
                "WHERE name <> 'My Business' ORDER BY name"
            ).fetchall()
            return [{"name": r[0], "category": r[1] or "",
                      "street_address": r[2] or "", "city": r[3] or "", "zip_code": r[4] or "",
                      "contact_number": r[5] or ""} for r in rows]
        if has_addr:
            rows = cursor.execute(
                "SELECT name, category, street_address, city, zip_code FROM Businesses "
                "WHERE name <> 'My Business' ORDER BY name"
            ).fetchall()
            return [{"name": r[0], "category": r[1] or "",
                      "street_address": r[2] or "", "city": r[3] or "", "zip_code": r[4] or ""} for r in rows]
        rows = cursor.execute(
            "SELECT name, category FROM Businesses WHERE name <> 'My Business' "
            "ORDER BY name"
        ).fetchall()
        return [{"name": r[0], "category": r[1] or ""} for r in rows]
    rows = cursor.execute(
        "SELECT name FROM Businesses WHERE name <> 'My Business' ORDER BY name"
    ).fetchall()
    return [{"name": r[0], "category": ""} for r in rows]


# ---------------------------------------------------------------------------
# reviews
# ---------------------------------------------------------------------------
@_with_conn
def create_review(conn, business, customer_id, customer_name, rating, comment):
    """Create a review for a business. Returns the review dict."""
    rating = max(1, min(5, int(rating or 3)))
    rid = _new_id("r")
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO Reviews (id, business, customer_id, customer_name, rating, comment) VALUES (?, ?, ?, ?, ?, ?)",
        (rid, business, customer_id, customer_name or "", rating, comment or ""),
    )
    return {"id": rid, "business": business, "customer_id": customer_id,
            "customer_name": customer_name or "", "rating": rating, "comment": comment or ""}


@_with_conn
def list_reviews(conn, business):
    """Return all reviews for a business, newest first."""
    cursor = conn.cursor()
    rows = cursor.execute(
        "SELECT id, business, customer_id, customer_name, rating, comment, created_at "
        "FROM Reviews WHERE business = ? ORDER BY created_at DESC",
        (business,),
    ).fetchall()
    return [{"id": r[0], "business": r[1], "customer_id": r[2],
             "customer_name": r[3], "rating": r[4], "comment": r[5],
             "created_at": str(r[6]) if r[6] else ""} for r in rows]


@_with_conn
def get_business_rating(conn, business):
    """Return average rating and review count for a business."""
    cursor = conn.cursor()
    row = cursor.execute(
        "SELECT AVG(CAST(rating AS FLOAT)), COUNT(*) FROM Reviews WHERE business = ?",
        (business,),
    ).fetchone()
    avg = round(row[0], 1) if row and row[0] else None
    count = row[1] if row else 0
    return {"average": avg, "count": count}


@_with_conn
def list_all_ratings(conn):
    """Return ratings for all businesses as a dict keyed by business name."""
    cursor = conn.cursor()
    rows = cursor.execute(
        "SELECT business, AVG(CAST(rating AS FLOAT)), COUNT(*) FROM Reviews GROUP BY business"
    ).fetchall()
    return {r[0]: {"average": round(r[1], 1) if r[1] else None, "count": r[2]} for r in rows}


# ---------------------------------------------------------------------------
# services
# ---------------------------------------------------------------------------
def _service_to_dict(conn, row_dict):
    return {
        "id": row_dict["id"],
        "business": _business_name(conn, row_dict["business_id"]),
        "name": row_dict["name"],
        "desc": row_dict["description"],
        "duration": row_dict["duration"],
        "category": row_dict["category"],
    }


@_with_conn
def list_services(conn):
    cursor = conn.cursor()
    rows = cursor.execute("SELECT * FROM Services ORDER BY created_at").fetchall()
    dicts = _rows_to_dicts(cursor, rows)
    return [_service_to_dict(conn, d) for d in dicts]


@_with_conn
def get_service(conn, service_id):
    cursor = conn.cursor()
    row = cursor.execute("SELECT * FROM Services WHERE id = ?", (service_id,)).fetchone()
    if not row:
        return None
    return _service_to_dict(conn, _row_to_dict(cursor, row))


@_with_conn
def create_service(conn, data, owner_id=None):
    sid = data.get("id") or _new_id("s")
    business_id = _get_or_create_business(conn, data.get("business") or "My Business", owner_id=owner_id)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO Services (id, business_id, name, description, duration, category) "
        "VALUES (?, ?, ?, ?, ?, ?)",
        (sid, business_id, data.get("name", ""), data.get("desc", ""),
         int(data.get("duration", 30)),
         data.get("category", "Other")),
    )
    row = cursor.execute("SELECT * FROM Services WHERE id = ?", (sid,)).fetchone()
    return _service_to_dict(conn, _row_to_dict(cursor, row))


@_with_conn
def update_service(conn, service_id, data, owner_id=None):
    cursor = conn.cursor()
    row = cursor.execute("SELECT * FROM Services WHERE id = ?", (service_id,)).fetchone()
    if not row:
        return None
    existing = _row_to_dict(cursor, row)
    business_id = existing["business_id"]
    if data.get("business"):
        business_id = _get_or_create_business(conn, data["business"], owner_id=owner_id)
    cursor.execute(
        "UPDATE Services SET business_id = ?, name = ?, description = ?, duration = ?, category = ? "
        "WHERE id = ?",
        (business_id, data.get("name", existing["name"]), data.get("desc", existing["description"]),
         int(data.get("duration", existing["duration"])),
         data.get("category", existing["category"]), service_id),
    )
    row = cursor.execute("SELECT * FROM Services WHERE id = ?", (service_id,)).fetchone()
    return _service_to_dict(conn, _row_to_dict(cursor, row))


@_with_conn
def delete_service(conn, service_id):
    conn.cursor().execute("DELETE FROM Services WHERE id = ?", (service_id,))


# ---------------------------------------------------------------------------
# appointments
# ---------------------------------------------------------------------------
def _appt_to_dict(row_dict):
    return {
        "id": row_dict["id"],
        "serviceId": row_dict["service_id"],
        "business": row_dict["business"],
        "serviceName": row_dict["service_name"],
        "category": row_dict["category"],
        "duration": row_dict["duration"],
        "date": row_dict["date"],
        "time": row_dict["time"],
        "customerName": row_dict["customer_name"],
        "customerId": row_dict.get("customer_id"),
        "notes": row_dict["notes"],
        "status": row_dict["status"],
        "createdAt": str(row_dict["created_at"]),
    }


def _insert_appointment(conn, aid, data):
    conn.cursor().execute(
        "INSERT INTO Appointments "
        "(id, service_id, business, service_name, category, duration, "
        "date, time, customer_name, customer_id, notes, status, created_at) "
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, SYSUTCDATETIME())",
        (aid, data.get("serviceId"), data.get("business", ""), data.get("serviceName", ""),
         data.get("category", ""), int(data.get("duration", 30)),
         data.get("date", ""), data.get("time", ""), data.get("customerName", ""),
         data.get("customerId"), data.get("notes", ""), data.get("status", "pending")),
    )


def _list_appointments_conn(conn, customer_id=None, business=None):
    """Scoped appointment listing — callers pass at least one filter."""
    sql = "SELECT * FROM Appointments"
    clauses, params = [], []
    if customer_id is not None:
        clauses.append("customer_id = ?")
        params.append(customer_id)
    if business is not None:
        clauses.append("business = ?")
        params.append(business)
    if clauses:
        sql += " WHERE " + " AND ".join(clauses)
    sql += " ORDER BY date, time"
    cursor = conn.cursor()
    rows = cursor.execute(sql, params).fetchall()
    return [_appt_to_dict(d) for d in _rows_to_dicts(cursor, rows)]


@_with_conn
def list_appointments(conn, customer_id=None, business=None):
    return _list_appointments_conn(conn, customer_id=customer_id, business=business)


@_with_conn
def get_appointment(conn, appointment_id):
    cursor = conn.cursor()
    row = cursor.execute("SELECT * FROM Appointments WHERE id = ?", (appointment_id,)).fetchone()
    return _appt_to_dict(_row_to_dict(cursor, row)) if row else None


def _slot_error(conn, business, date, time, duration):
    """Return an error string if the slot can't be booked, else None.

    Validates that the requested date/time falls within the business's
    working hours, is not in the past, and does not collide with an
    existing booking for that business.
    """
    # 1. Past date/time check
    try:
        start_dt = datetime.strptime(f"{date} {time}", "%Y-%m-%d %H:%M")
    except ValueError:
        return "invalid date or time"
    if start_dt < datetime.now() - timedelta(minutes=1):
        return "that time is in the past"

    # 2. Working hours check
    # Hours are stored with JS getDay() keys (0=Sun,1=Mon..6=Sat).
    # Python weekday() is 0=Mon..6=Sun — convert to getDay convention.
    day_num = (start_dt.weekday() + 1) % 7
    span = _get_hours_raw(conn).get(str(day_num))
    if not span:
        return "the business is closed on that day"
    open_min = int(span["open"][:2]) * 60 + int(span["open"][3:])
    close_min = int(span["close"][:2]) * 60 + int(span["close"][3:])
    start_min = start_dt.hour * 60 + start_dt.minute
    if start_min < open_min or start_min + duration > close_min:
        return "that time is outside working hours"

    # 3. Collision / overlap with existing bookings
    cursor = conn.cursor()
    rows = cursor.execute(
        "SELECT time, duration FROM Appointments "
        "WHERE business = ? AND date = ? AND status <> 'cancelled'",
        (business, date),
    ).fetchall()
    for r in rows:
        t, dur = r[0], (r[1] or 0)
        existing_min = int(t[:2]) * 60 + int(t[3:])
        if not (start_min + duration <= existing_min or start_min >= existing_min + dur):
            return "that slot is already booked"
    return None


@_with_conn
def create_appointment(conn, data):
    business = data.get("business", "")
    date = data.get("date", "")
    time = data.get("time", "")
    duration = int(data.get("duration", 30))
    error = _slot_error(conn, business, date, time, duration)
    if error:
        raise ValueError(error)
    aid = data.get("id") or _new_id("a")
    _insert_appointment(conn, aid, data)
    cursor = conn.cursor()
    row = cursor.execute("SELECT * FROM Appointments WHERE id = ?", (aid,)).fetchone()
    return _appt_to_dict(_row_to_dict(cursor, row))


@_with_conn
def update_appointment_status(conn, appointment_id, status):
    status = (status or "pending").lower()
    if status not in VALID_STATUSES:
        raise ValueError(f"invalid appointment status: {status}")
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE Appointments SET status = ? WHERE id = ?", (status, appointment_id)
    )
    if cursor.rowcount == 0:
        return None
    row = cursor.execute("SELECT * FROM Appointments WHERE id = ?", (appointment_id,)).fetchone()
    return _appt_to_dict(_row_to_dict(cursor, row))


@_with_conn
def delete_appointment(conn, appointment_id):
    conn.cursor().execute("DELETE FROM Appointments WHERE id = ?", (appointment_id,))


# ---------------------------------------------------------------------------
# hours
# ---------------------------------------------------------------------------
def _get_hours_raw(conn):
    cursor = conn.cursor()
    rows = cursor.execute(
        "SELECT day_of_week, open_time, close_time FROM Hours ORDER BY day_of_week"
    ).fetchall()
    return {str(r[0]): {"open": r[1], "close": r[2]} for r in rows}


@_with_conn
def get_hours(conn):
    return _get_hours_raw(conn)


@_with_conn
def get_hours_full(conn):
    hours = {str(i): None for i in range(7)}
    hours.update(_get_hours_raw(conn))
    return hours


@_with_conn
def replace_hours(conn, hours):
    cursor = conn.cursor()
    cursor.execute("DELETE FROM Hours")
    for day, span in (hours or {}).items():
        if not span:
            continue
        cursor.execute(
            "INSERT INTO Hours (day_of_week, open_time, close_time) VALUES (?, ?, ?)",
            (int(day), span["open"], span["close"]),
        )


# ---------------------------------------------------------------------------
# users & sessions
# ---------------------------------------------------------------------------
_EMAIL_RE = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")


def _validate_email(email):
    if not email or not _EMAIL_RE.match(email):
        raise ValueError("invalid email address")


def _user_to_dict(row_dict):
    return {"id": row_dict["id"], "name": row_dict["name"],
            "email": row_dict["email"], "role": row_dict["role"],
            "google_id": bool(row_dict.get("google_id"))}


def _create_session_token(conn, user_id):
    """Create a new session token and return it."""
    token = secrets.token_urlsafe(32)
    conn.cursor().execute(
        "INSERT INTO Meta ([key], value) VALUES (?, ?)",
        (f"session:{token[:16]}", f"{token}:{user_id}"),
    )
    return token


def _user_id_from_token(conn, token):
    """Look up the user_id for a session token (targeted by key prefix)."""
    if not token:
        return None
    cursor = conn.cursor()
    row = cursor.execute(
        "SELECT value FROM Meta WHERE [key] = ?",
        (f"session:{token[:16]}",),
    ).fetchone()
    if not row or ":" not in row[0]:
        return None
    t, uid = row[0].split(":", 1)
    return uid if t == token else None


def _meta(conn, key, default=None):
    cursor = conn.cursor()
    row = cursor.execute("SELECT value FROM Meta WHERE [key] = ?", (key,)).fetchone()
    return row[0] if row else default


def _set_user_business_conn(conn, user_id, business):
    """Link a provider account to a business (by name)."""
    key = f"business_of:{user_id}"
    conn.cursor().execute("DELETE FROM Meta WHERE [key] = ?", (key,))
    conn.cursor().execute("INSERT INTO Meta ([key], value) VALUES (?, ?)", (key, business))


@_with_conn
def set_user_business(conn, user_id, business):
    _set_user_business_conn(conn, user_id, business)


@_with_conn
def get_user_business(conn, user_id):
    return _meta(conn, f"business_of:{user_id}")


def get_user_by_token(token):
    """Get user dict from session token. No @_with_conn — uses caller's conn or opens one."""
    if not token:
        return None
    conn = connect()
    try:
        uid = _user_id_from_token(conn, token)
        if not uid:
            return None
        cursor = conn.cursor()
        row = cursor.execute("SELECT * FROM Users WHERE id = ?", (uid,)).fetchone()
        if not row:
            return None
        return _user_to_dict(_row_to_dict(cursor, row))
    finally:
        conn.close()


@_with_conn
def get_user(conn, token=None):
    if token:
        uid = _user_id_from_token(conn, token)
    else:
        uid = None
    if not uid:
        return None
    cursor = conn.cursor()
    row = cursor.execute("SELECT * FROM Users WHERE id = ?", (uid,)).fetchone()
    return _user_to_dict(_row_to_dict(cursor, row)) if row else None


@_with_conn
def create_user(conn, name, email, role, password):
    name = (name or "").strip()
    email = (email or "").strip().lower()
    role = (role or "customer").strip().lower()
    if role not in ("customer", "provider"):
        raise ValueError("role must be 'customer' or 'provider'")
    _validate_email(email)
    if len(str(password or "")) < 8:
        raise ValueError("password must be at least 8 characters")
    cursor = conn.cursor()
    existing = cursor.execute("SELECT id FROM Users WHERE email = ?", (email,)).fetchone()
    if existing:
        raise ValueError("an account with that email already exists")
    uid = _new_id("u")
    cursor.execute(
        "INSERT INTO Users (id, name, email, role, password_hash) VALUES (?, ?, ?, ?, ?)",
        (uid, name, email, role, hash_password(password)),
    )
    token = _create_session_token(conn, uid)
    row = cursor.execute("SELECT * FROM Users WHERE id = ?", (uid,)).fetchone()
    return _user_to_dict(_row_to_dict(cursor, row)), token


@_with_conn
def login_user(conn, email, password):
    email = (email or "").strip().lower()
    cursor = conn.cursor()
    row = cursor.execute("SELECT * FROM Users WHERE email = ?", (email,)).fetchone()
    if not row:
        return None
    d = _row_to_dict(cursor, row)
    if not verify_password(password, d["password_hash"]):
        return None
    token = _create_session_token(conn, d["id"])
    return _user_to_dict(d), token


@_with_conn
def change_password(conn, user_id, current_password, new_password):
    cursor = conn.cursor()
    row = cursor.execute("SELECT * FROM Users WHERE id = ?", (user_id,)).fetchone()
    if not row:
        raise ValueError("user not found")
    d = _row_to_dict(cursor, row)
    if not verify_password(current_password, d["password_hash"]):
        raise ValueError("current password is incorrect")
    if len(str(new_password or "")) < 8:
        raise ValueError("new password must be at least 8 characters")
    cursor.execute(
        "UPDATE Users SET password_hash = ? WHERE id = ?",
        (hash_password(new_password), user_id),
    )


@_with_conn
def clear_user(conn, token=None):
    if token:
        conn.cursor().execute(
            "DELETE FROM Meta WHERE [key] LIKE 'session:%' AND value LIKE ?",
            (f"{token}:%",),
        )
    else:
        conn.cursor().execute("DELETE FROM Meta WHERE [key] LIKE 'session:%'")


@_with_conn
def delete_user(conn, user_id):
    """Permanently delete a user and their personal data.

    Removes the user's session tokens, business association meta, and any
    appointments booked by them. If they are a provider, also removes their
    services and the linked Business when they are the sole owner of that
    business — the business's existing bookings are cancelled rather than
    deleted so customers still see the appointment was called off.
    """
    cursor = conn.cursor()

    business = _meta(conn, f"business_of:{user_id}") or None

    # revoke every session belonging to this user — the active one and any
    # orphaned sessions on other devices
    for prefix in ("session:%", "reset:%"):
        rows = cursor.execute(
            "SELECT [key] FROM Meta WHERE [key] LIKE ? AND value LIKE ?",
            (prefix, f"%:{user_id}"),
        ).fetchall()
        for r in rows:
            cursor.execute("DELETE FROM Meta WHERE [key] = ?", (r[0],))

    # business association meta
    cursor.execute("DELETE FROM Meta WHERE [key] = ?", (f"business_of:{user_id}",))

    # appointments booked by this user
    cursor.execute("DELETE FROM Appointments WHERE customer_id = ?", (user_id,))

    # provider-owned business cleanup
    if business:
        row = cursor.execute("SELECT id FROM Businesses WHERE name = ?", (business,)).fetchone()
        if row:
            business_id = row[0]
            # only remove the business if no other provider still points to it
            other = cursor.execute(
                "SELECT COUNT(*) FROM Meta WHERE [key] LIKE 'business_of:%' AND value = ? AND [key] <> ?",
                (business, f"business_of:{user_id}"),
            ).fetchone()
            if (other and other[0] or 0) == 0:
                # Cancel this business's bookings (so customers still see them),
                # detaching their service reference so the services can be
                # removed without tripping the service_id foreign key.
                cursor.execute(
                    "UPDATE Appointments SET status = 'cancelled', service_id = NULL WHERE business = ?",
                    (business,),
                )
                cursor.execute("DELETE FROM Services WHERE business_id = ?", (business_id,))
                cursor.execute("DELETE FROM Businesses WHERE id = ?", (business_id,))

    # any business this account created that still exists loses its owner link
    cursor.execute("UPDATE Businesses SET owner_id = NULL WHERE owner_id = ?", (user_id,))

    cursor.execute("DELETE FROM Users WHERE id = ?", (user_id,))




# ---------------------------------------------------------------------------
# password reset tokens
# ---------------------------------------------------------------------------
@_with_conn
def is_google_user(conn, email):
    """Return True if the user with the given email signed up via Google."""
    email = (email or "").strip().lower()
    row = conn.cursor().execute(
        "SELECT google_id FROM Users WHERE email = ?", (email,)
    ).fetchone()
    return bool(row and row[0])


@_with_conn
def create_reset_token(conn, email):
    """Create a password reset token for the user with the given email.

    Returns the plain-text token string (to be shown to the user since there
    is no email infrastructure), or None if no user with that email exists.
    """
    email = (email or "").strip().lower()
    cursor = conn.cursor()
    row = cursor.execute("SELECT id FROM Users WHERE email = ?", (email,)).fetchone()
    if not row:
        return None
    user_id = row[0]
    # Remove any existing reset tokens for this user
    cursor.execute(
        "DELETE FROM Meta WHERE [key] LIKE 'reset:%' AND value LIKE ?",
        (f"%:{user_id}",),
    )
    token = secrets.token_urlsafe(32)
    cursor.execute(
        "INSERT INTO Meta ([key], value) VALUES (?, ?)",
        (f"reset:{token[:16]}", f"{token}:{user_id}"),
    )
    return token


@_with_conn
def get_user_by_reset_token(conn, token):
    """Return the user dict for a valid reset token, or None."""
    if not token:
        return None
    cursor = conn.cursor()
    rows = cursor.execute(
        "SELECT value FROM Meta WHERE [key] LIKE 'reset:%'"
    ).fetchall()
    for r in rows:
        val = r[0]
        if ":" in val:
            t, uid = val.split(":", 1)
            if t == token:
                row = cursor.execute("SELECT * FROM Users WHERE id = ?", (uid,)).fetchone()
                if row:
                    return _user_to_dict(_row_to_dict(cursor, row))
    return None


@_with_conn
def reset_password(conn, token, new_password):
    """Reset a user's password using a valid reset token.

    Raises ValueError if the token is invalid or the password is too short.
    """
    if not token:
        raise ValueError("invalid reset token")
    if len(str(new_password or "")) < 8:
        raise ValueError("new password must be at least 8 characters")
    cursor = conn.cursor()
    rows = cursor.execute(
        "SELECT value FROM Meta WHERE [key] LIKE 'reset:%'"
    ).fetchall()
    user_id = None
    for r in rows:
        val = r[0]
        if ":" in val:
            t, uid = val.split(":", 1)
            if t == token:
                user_id = uid
                break
    if not user_id:
        raise ValueError("invalid or expired reset token")
    cursor.execute(
        "UPDATE Users SET password_hash = ? WHERE id = ?",
        (hash_password(new_password), user_id),
    )
    # Clean up the used token
    cursor.execute(
        "DELETE FROM Meta WHERE [key] LIKE 'reset:%' AND value LIKE ?",
        (f"%:{user_id}",),
    )


# ---------------------------------------------------------------------------
# Google OAuth
# ---------------------------------------------------------------------------
@_with_conn
def get_user_by_google_id(conn, google_id):
    """Return user dict for a user linked to the given Google ID, or None."""
    if not google_id:
        return None
    cursor = conn.cursor()
    row = cursor.execute("SELECT * FROM Users WHERE google_id = ?", (google_id,)).fetchone()
    if not row:
        return None
    return _user_to_dict(_row_to_dict(cursor, row))


@_with_conn
def find_user_by_google_or_email(conn, google_id, email):
    """Return an existing user matching a Google ID (or email), or None.

    Used to decide whether a Google sign-in maps to an already-created account
    (a returning user) or to a brand-new user that still needs to finish the
    signup flow before its account is created.
    """
    cursor = conn.cursor()
    if google_id:
        row = cursor.execute("SELECT * FROM Users WHERE google_id = ?", (google_id,)).fetchone()
        if row:
            return _user_to_dict(_row_to_dict(cursor, row))
    if email:
        row = cursor.execute("SELECT * FROM Users WHERE email = ?", (email,)).fetchone()
        if row:
            return _user_to_dict(_row_to_dict(cursor, row))
    return None


@_with_conn
def is_email_taken(conn, email):
    """Return True if the email is already registered to any user."""
    email = (email or "").strip().lower()
    if not email:
        return False
    row = conn.cursor().execute("SELECT id FROM Users WHERE email = ?", (email,)).fetchone()
    return row is not None


@_with_conn
def link_google_id(conn, user_id, google_id):
    """Link a Google account to an existing local user."""
    if not user_id or not google_id:
        return
    conn.cursor().execute(
        "UPDATE Users SET google_id = ? WHERE id = ?", (google_id, user_id)
    )


@_with_conn
def create_user_from_google(conn, google_id, email, name):
    """Create or find a user from Google OAuth. Returns (user_dict, token)."""
    # 1. Check if a user is already linked to this Google ID
    cursor = conn.cursor()
    row = cursor.execute("SELECT * FROM Users WHERE google_id = ?", (google_id,)).fetchone()
    if row:
        d = _row_to_dict(cursor, row)
        token = _create_session_token(conn, d["id"])
        return _user_to_dict(d), token

    # 2. If a user exists with this email but a different Google account,
    #    or no Google account at all, block the OAuth sign-up rather than
    #    silently claiming/upgrading that account.
    row = cursor.execute("SELECT * FROM Users WHERE email = ?", (email,)).fetchone()
    if row:
        raise ValueError("email already registered with another account")

    # 3. Create a new user
    uid = _new_id("u")
    cursor.execute(
        "INSERT INTO Users (id, name, email, role, password_hash, google_id) "
        "VALUES (?, ?, ?, 'customer', '', ?)",
        (uid, name or email.split("@")[0], email, google_id),
    )
    token = _create_session_token(conn, uid)
    row = cursor.execute("SELECT * FROM Users WHERE id = ?", (uid,)).fetchone()
    return _user_to_dict(_row_to_dict(cursor, row)), token


@_with_conn
def create_provider_from_google(conn, google_id, email, name):
    """Create or find a provider user from Google OAuth, linked to no business yet.

    Returns (user_dict, token). Role is set to 'provider'. If the Google account
    is already tied to a business, the caller reads the business association.
    """
    cursor = conn.cursor()
    row = cursor.execute("SELECT * FROM Users WHERE google_id = ?", (google_id,)).fetchone()
    if row:
        d = _row_to_dict(cursor, row)
        # Ensure provider role
        cursor.execute("UPDATE Users SET role = 'provider' WHERE id = ?", (d["id"],))
        token = _create_session_token(conn, d["id"])
        d["role"] = "provider"
        return _user_to_dict({**d, "role": "provider"}), token

    row = cursor.execute("SELECT * FROM Users WHERE email = ?", (email,)).fetchone()
    if row:
        raise ValueError("email already registered with another account")

    uid = _new_id("u")
    cursor.execute(
        "INSERT INTO Users (id, name, email, role, password_hash, google_id) "
        "VALUES (?, ?, ?, 'provider', '', ?)",
        (uid, name or email.split("@")[0], email, google_id),
    )
    token = _create_session_token(conn, uid)
    row = cursor.execute("SELECT * FROM Users WHERE id = ?", (uid,)).fetchone()
    return _user_to_dict(_row_to_dict(cursor, row)), token


@_with_conn
def get_user_business_name(conn, user_id):
    """Return the business name a provider user is associated with, or blank."""
    return _meta(conn, f"business_of:{user_id}", "")


@_with_conn
def set_user_business_name(conn, user_id, business):
    """Associate (or re-associate) a provider user with a business by name."""
    _set_user_business_conn(conn, user_id, business)


@_with_conn
def update_business_address(conn, business, street_address=None, city=None, zip_code=None):
    """Update the address fields for a business."""
    cursor = conn.cursor()
    row = cursor.execute("SELECT id FROM Businesses WHERE name = ?", (business,)).fetchone()
    if not row:
        return False
    bid = row[0]
    cursor.execute(
        "UPDATE Businesses SET street_address = ?, city = ?, zip_code = ? WHERE id = ?",
        (street_address or "", city or "", zip_code or "", bid),
    )
    return True


@_with_conn
def update_business_contact_number(conn, business, contact_number=None):
    """Update the contact number for a business."""
    cursor = conn.cursor()
    row = cursor.execute("SELECT id FROM Businesses WHERE name = ?", (business,)).fetchone()
    if not row:
        return False
    bid = row[0]
    if _has_column(conn, "Businesses", "contact_number"):
        cursor.execute(
            "UPDATE Businesses SET contact_number = ? WHERE id = ?",
            (contact_number or "", bid),
        )
    return True


@_with_conn
def link_provider_to_business(conn, user_id, name, business, category=None, street_address=None, city=None, zip_code=None):
    """Update a provider's display name and link them to a business (creating it if needed)."""
    cursor = conn.cursor()
    _get_or_create_business(conn, business, owner_id=user_id, category=category, street_address=street_address, city=city, zip_code=zip_code)
    _set_user_business_conn(conn, user_id, business)
    if name:
        cursor.execute("UPDATE Users SET name = ? WHERE id = ?", (name, user_id))
    return business


# ---------------------------------------------------------------------------
# business login passwords
# ---------------------------------------------------------------------------
@_with_conn
def set_business_password(conn, name, password, owner_id=None, category=None, street_address=None, city=None, zip_code=None):
    if len(str(password or "")) < 8:
        raise ValueError("password must be at least 8 characters")
    business_id = _get_or_create_business(conn, name, owner_id=owner_id, category=category, street_address=street_address, city=city, zip_code=zip_code)
    conn.cursor().execute(
        "UPDATE Businesses SET password_hash = ? WHERE id = ?",
        (hash_password(password), business_id),
    )


@_with_conn
def verify_business_password(conn, name, password):
    cursor = conn.cursor()
    row = cursor.execute("SELECT * FROM Businesses WHERE name = ?", (name,)).fetchone()
    if not row:
        return False
    d = _row_to_dict(cursor, row)
    return verify_password(password, d["password_hash"])


@_with_conn
def set_business_session(conn, business, name, email):
    email = (email or "").strip().lower()
    cursor = conn.cursor()
    row = cursor.execute("SELECT * FROM Users WHERE email = ?", (email,)).fetchone()
    if row:
        uid = _row_to_dict(cursor, row)["id"]
        cursor.execute(
            "UPDATE Users SET name = ?, role = 'provider' WHERE id = ?",
            (name or "", uid),
        )
    else:
        uid = _new_id("u")
        cursor.execute(
            "INSERT INTO Users (id, name, email, role, password_hash) VALUES (?, ?, ?, 'provider', '')",
            (uid, name or "", email),
        )
    token = _create_session_token(conn, uid)
    _set_user_business_conn(conn, uid, business)
    _claim_business_owner(conn, business, uid)
    row = cursor.execute("SELECT * FROM Users WHERE id = ?", (uid,)).fetchone()
    return _user_to_dict(_row_to_dict(cursor, row)), token


# ---------------------------------------------------------------------------
# business password reset (reuses Meta reset tokens, tracked per business)
# ---------------------------------------------------------------------------
@_with_conn
def create_business_reset_token(conn, business):
    """Create a reset token for a business password. Returns token or None."""
    business = (business or "").strip()
    cursor = conn.cursor()
    row = cursor.execute("SELECT name FROM Businesses WHERE name = ?", (business,)).fetchone()
    if not row:
        return None
    # Remove any existing reset tokens for this business
    cursor.execute(
        "DELETE FROM Meta WHERE [key] LIKE 'bizreset:%' AND value LIKE ?",
        (f"%:{business}",),
    )
    token = secrets.token_urlsafe(32)
    cursor.execute(
        "INSERT INTO Meta ([key], value) VALUES (?, ?)",
        (f"bizreset:{token[:16]}", f"{token}:{business}"),
    )
    return token


@_with_conn
def verify_business_reset_token(conn, token):
    """Return the business name for a valid reset token, or None."""
    if not token:
        return None
    cursor = conn.cursor()
    rows = cursor.execute("SELECT value FROM Meta WHERE [key] LIKE 'bizreset:%'").fetchall()
    for r in rows:
        val = r[0]
        if ":" in val:
            t, business = val.split(":", 1)
            if t == token:
                return business
    return None


@_with_conn
def reset_business_password(conn, token, new_password):
    """Reset a business password using a valid reset token."""
    if len(str(new_password or "")) < 8:
        raise ValueError("new password must be at least 8 characters")
    business = verify_business_reset_token(conn, token)
    if not business:
        raise ValueError("invalid or expired reset token")
    cursor = conn.cursor()
    bid = _get_or_create_business(conn, business)
    cursor.execute(
        "UPDATE Businesses SET password_hash = ? WHERE id = ?",
        (hash_password(new_password), bid),
    )
    # Clean up the used token
    cursor.execute(
        "DELETE FROM Meta WHERE [key] LIKE 'bizreset:%' AND value LIKE ?",
        (f"%:{business}",),
    )


# ---------------------------------------------------------------------------
# meta / business settings
# ---------------------------------------------------------------------------
@_with_conn
def get_business_owner_email(conn, business):
    """Return the email of the business owner, or None if not found."""
    if not business:
        return None
    cursor = conn.cursor()
    row = cursor.execute(
        "SELECT u.email FROM Users u "
        "JOIN Businesses b ON b.owner_id = u.id "
        "WHERE b.name = ?",
        (business,),
    ).fetchone()
    return row[0] if row else None


@_with_conn
def get_business_by_owner_email(conn, email):
    """Return the business name owned by the given email, or None."""
    email = (email or "").strip().lower()
    if not email:
        return None
    row = conn.cursor().execute(
        "SELECT b.name FROM Businesses b "
        "JOIN Users u ON b.owner_id = u.id "
        "WHERE u.email = ?",
        (email,),
    ).fetchone()
    return row[0] if row else None


@_with_conn
def get_business_name(conn):
    return _meta(conn, "business_name", "My Business")


@_with_conn
def set_business_name(conn, name):
    cursor = conn.cursor()
    cursor.execute("DELETE FROM Meta WHERE [key] = 'business_name'")
    cursor.execute("INSERT INTO Meta ([key], value) VALUES ('business_name', ?)", (name,))


# ---------------------------------------------------------------------------
# whole-state export / import
# ---------------------------------------------------------------------------
@_with_conn
def get_full_state(conn, viewer=None):
    """Full app state for a signed-in viewer. Appointments are scoped:
    customers see their own bookings, providers see their business's."""
    hours = {str(i): None for i in range(7)}
    hours.update(_get_hours_raw(conn))
    cursor = conn.cursor()
    svc_rows = cursor.execute("SELECT * FROM Services ORDER BY created_at").fetchall()
    svc_dicts = _rows_to_dicts(cursor, svc_rows)
    business_name = "My Business"
    if viewer is None:
        appointments = []
    elif viewer.get("role") == "provider":
        biz = _meta(conn, f"business_of:{viewer['id']}")
        appointments = _list_appointments_conn(conn, business=biz) if biz else []
        if biz:
            business_name = biz
    else:
        appointments = _list_appointments_conn(conn, customer_id=viewer["id"])
    return {
        "services": [_service_to_dict(conn, d) for d in svc_dicts],
        "appointments": appointments,
        "hours": hours,
        "user": get_user(conn=conn),
        "businessName": business_name,
        "businesses": list_businesses(conn=conn),
        "ratings": list_all_ratings(conn=conn),
    }


@_with_conn
def import_state(conn, state):
    cursor = conn.cursor()
    for service in state.get("services", []):
        business_id = _get_or_create_business(conn, service.get("business") or "My Business")
        sid = service.get("id") or _new_id("s")
        existing = cursor.execute("SELECT id FROM Services WHERE id = ?", (sid,)).fetchone()
        if existing:
            cursor.execute(
                "UPDATE Services SET business_id = ?, name = ?, description = ?, duration = ?, category = ? "
                "WHERE id = ?",
                (business_id, service.get("name", ""), service.get("desc", ""),
                 int(service.get("duration", 30)),
                 service.get("category", "Other"), sid),
            )
        else:
            cursor.execute(
                "INSERT INTO Services (id, business_id, name, description, duration, category) "
                "VALUES (?, ?, ?, ?, ?, ?)",
                (sid, business_id, service.get("name", ""), service.get("desc", ""),
                 int(service.get("duration", 30)),
                 service.get("category", "Other")),
            )
    for appt in state.get("appointments", []):
        cursor.execute("DELETE FROM Appointments WHERE id = ?", (appt.get("id", ""),))
        _insert_appointment(conn, appt.get("id") or _new_id("a"), appt)
    if "hours" in state:
        cursor.execute("DELETE FROM Hours")
        for day, span in state["hours"].items():
            if span:
                cursor.execute(
                    "INSERT INTO Hours (day_of_week, open_time, close_time) VALUES (?, ?, ?)",
                    (int(day), span["open"], span["close"]),
                )
    if state.get("businessName"):
        cursor.execute("DELETE FROM Meta WHERE [key] = 'business_name'")
        cursor.execute(
            "INSERT INTO Meta ([key], value) VALUES ('business_name', ?)",
            (state["businessName"],),
        )
    user = state.get("user")
    if user:
        email = (user.get("email") or "").strip().lower()
        row = cursor.execute("SELECT * FROM Users WHERE email = ?", (email,)).fetchone()
        if row:
            uid = _row_to_dict(cursor, row)["id"]
            cursor.execute(
                "UPDATE Users SET name = ?, role = ? WHERE id = ?",
                (user.get("name", ""), user.get("role", "customer"), uid),
            )
        else:
            uid = _new_id("u")
            cursor.execute(
                "INSERT INTO Users (id, name, email, role, password_hash) VALUES (?, ?, ?, ?, '')",
                (uid, user.get("name", ""), email, user.get("role", "customer")),
            )
