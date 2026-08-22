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
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
CREATE TABLE Users (
  id NVARCHAR(20) PRIMARY KEY,
  name NVARCHAR(200) NOT NULL,
  email NVARCHAR(200) NOT NULL UNIQUE,
  role NVARCHAR(20) NOT NULL DEFAULT 'customer',
  password_hash NVARCHAR(400) NOT NULL DEFAULT '',
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Services')
CREATE TABLE Services (
  id NVARCHAR(20) PRIMARY KEY,
  business_id NVARCHAR(20) NOT NULL REFERENCES Businesses(id),
  name NVARCHAR(200) NOT NULL,
  description NVARCHAR(MAX) NOT NULL DEFAULT '',
  duration INT NOT NULL,
  price FLOAT NOT NULL,
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
  price FLOAT NOT NULL,
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
def _get_or_create_business(conn, name):
    cursor = conn.cursor()
    row = cursor.execute("SELECT id FROM Businesses WHERE name = ?", (name,)).fetchone()
    if row:
        return row[0]
    bid = _new_id("b")
    cursor.execute("INSERT INTO Businesses (id, name) VALUES (?, ?)", (bid, name))
    return bid


def _business_name(conn, business_id):
    cursor = conn.cursor()
    row = cursor.execute("SELECT name FROM Businesses WHERE id = ?", (business_id,)).fetchone()
    return row[0] if row else ""


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
        "price": row_dict["price"],
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
def create_service(conn, data):
    sid = data.get("id") or _new_id("s")
    business_id = _get_or_create_business(conn, data.get("business") or "My Business")
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO Services (id, business_id, name, description, duration, price, category) "
        "VALUES (?, ?, ?, ?, ?, ?, ?)",
        (sid, business_id, data.get("name", ""), data.get("desc", ""),
         int(data.get("duration", 30)), float(data.get("price", 0)),
         data.get("category", "Other")),
    )
    row = cursor.execute("SELECT * FROM Services WHERE id = ?", (sid,)).fetchone()
    return _service_to_dict(conn, _row_to_dict(cursor, row))


@_with_conn
def update_service(conn, service_id, data):
    cursor = conn.cursor()
    row = cursor.execute("SELECT * FROM Services WHERE id = ?", (service_id,)).fetchone()
    if not row:
        return None
    existing = _row_to_dict(cursor, row)
    business_id = existing["business_id"]
    if data.get("business"):
        business_id = _get_or_create_business(conn, data["business"])
    cursor.execute(
        "UPDATE Services SET business_id = ?, name = ?, description = ?, duration = ?, price = ?, category = ? "
        "WHERE id = ?",
        (business_id, data.get("name", existing["name"]), data.get("desc", existing["description"]),
         int(data.get("duration", existing["duration"])), float(data.get("price", existing["price"])),
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
        "price": row_dict["price"],
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
        "(id, service_id, business, service_name, category, price, duration, "
        "date, time, customer_name, customer_id, notes, status, created_at) "
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, SYSUTCDATETIME())",
        (aid, data.get("serviceId"), data.get("business", ""), data.get("serviceName", ""),
         data.get("category", ""), float(data.get("price", 0)), int(data.get("duration", 30)),
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


@_with_conn
def create_appointment(conn, data):
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
            "email": row_dict["email"], "role": row_dict["role"]}


def _create_session_token(conn, user_id):
    """Create a new session token and return it."""
    token = secrets.token_urlsafe(32)
    conn.cursor().execute(
        "INSERT INTO Meta ([key], value) VALUES (?, ?)",
        (f"session:{token[:16]}", f"{token}:{user_id}"),
    )
    return token


def _user_id_from_token(conn, token):
    """Look up the user_id for a session token."""
    if not token:
        return None
    cursor = conn.cursor()
    row = cursor.execute(
        "SELECT value FROM Meta WHERE [key] LIKE 'session:%'"
    ).fetchall()
    for r in row:
        val = r[0]
        if ":" in val:
            t, uid = val.split(":", 1)
            if t == token:
                return uid
    return None


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


# ---------------------------------------------------------------------------
# business login passwords
# ---------------------------------------------------------------------------
@_with_conn
def set_business_password(conn, name, password):
    if len(str(password or "")) < 8:
        raise ValueError("password must be at least 8 characters")
    business_id = _get_or_create_business(conn, name)
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
    row = cursor.execute("SELECT * FROM Users WHERE id = ?", (uid,)).fetchone()
    return _user_to_dict(_row_to_dict(cursor, row)), token


# ---------------------------------------------------------------------------
# meta / business settings
# ---------------------------------------------------------------------------
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
    if viewer is None:
        appointments = []
    elif viewer.get("role") == "provider":
        biz = _meta(conn, f"business_of:{viewer['id']}")
        appointments = _list_appointments_conn(conn, business=biz) if biz else []
    else:
        appointments = _list_appointments_conn(conn, customer_id=viewer["id"])
    return {
        "services": [_service_to_dict(conn, d) for d in svc_dicts],
        "appointments": appointments,
        "hours": hours,
        "user": get_user(conn=conn),
        "businessName": _meta(conn, "business_name", "My Business"),
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
                "UPDATE Services SET business_id = ?, name = ?, description = ?, duration = ?, price = ?, category = ? "
                "WHERE id = ?",
                (business_id, service.get("name", ""), service.get("desc", ""),
                 int(service.get("duration", 30)), float(service.get("price", 0)),
                 service.get("category", "Other"), sid),
            )
        else:
            cursor.execute(
                "INSERT INTO Services (id, business_id, name, description, duration, price, category) "
                "VALUES (?, ?, ?, ?, ?, ?, ?)",
                (sid, business_id, service.get("name", ""), service.get("desc", ""),
                 int(service.get("duration", 30)), float(service.get("price", 0)),
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
