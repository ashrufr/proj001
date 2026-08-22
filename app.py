"""HairNet Flask server.

Serves the static frontend and a JSON REST API backed by Azure SQL.
Run:  python3 app.py
"""
import json
import os
import re
import secrets

from flask import Flask, jsonify, request, send_from_directory, session

import db

app = Flask(__name__, static_folder="static", static_url_path="")
app.secret_key = os.environ.get("FLASK_SECRET_KEY", secrets.token_hex(32))


# ---------------------------------------------------------------------------
# session helper
# ---------------------------------------------------------------------------
def _current_user():
    return db.get_user(token=session.get("token"))


def _set_user(user, token):
    session["token"] = token
    session.permanent = True


def _clear_user():
    token = session.pop("token", None)
    if token:
        db.clear_user(token=token)


def _owns_appointment(user, appt):
    """True if this user may see/manage the appointment: it's their booking,
    or they are the provider of the business it was booked with."""
    if not user or not appt:
        return False
    if appt.get("customerId") == user["id"]:
        return True
    if user.get("role") == "provider":
        return appt.get("business") == db.get_user_business(user["id"])
    return False


# ---------------------------------------------------------------------------
# static files
# ---------------------------------------------------------------------------
@app.route("/")
def index():
    return send_from_directory("static", "index.html")


# ---------------------------------------------------------------------------
# API: bootstrap (full state)
# ---------------------------------------------------------------------------
@app.route("/api/bootstrap")
def api_bootstrap():
    user = _current_user()
    state = db.get_full_state(viewer=user)
    state["user"] = user
    if user and user.get("role") == "provider":
        business = db.get_user_business(user["id"])
        if business:
            state["businessName"] = business
    return jsonify(state)


# ---------------------------------------------------------------------------
# API: services
# ---------------------------------------------------------------------------
@app.route("/api/services", methods=["GET"])
def api_list_services():
    return jsonify(db.list_services())


@app.route("/api/services", methods=["POST"])
def api_create_service():
    return jsonify(db.create_service(request.get_json())), 201


@app.route("/api/services/<service_id>", methods=["GET"])
def api_get_service(service_id):
    row = db.get_service(service_id)
    return jsonify(row) if row else (jsonify({"error": "not found"}), 404)


@app.route("/api/services/<service_id>", methods=["PUT"])
def api_update_service(service_id):
    row = db.update_service(service_id, request.get_json())
    return jsonify(row) if row else (jsonify({"error": "not found"}), 404)


@app.route("/api/services/<service_id>", methods=["DELETE"])
def api_delete_service(service_id):
    db.delete_service(service_id)
    return jsonify({"ok": True})


# ---------------------------------------------------------------------------
# API: appointments
# ---------------------------------------------------------------------------
@app.route("/api/appointments", methods=["GET"])
def api_list_appointments():
    user = _current_user()
    if not user:
        return jsonify({"error": "not signed in"}), 401
    if user["role"] == "provider":
        business = db.get_user_business(user["id"])
        if not business:
            return jsonify([])
        return jsonify(db.list_appointments(business=business))
    return jsonify(db.list_appointments(customer_id=user["id"]))


@app.route("/api/appointments", methods=["POST"])
def api_create_appointment():
    user = _current_user()
    if not user:
        return jsonify({"error": "sign in to book an appointment"}), 401
    data = request.get_json() or {}
    data["customerId"] = user["id"]
    return jsonify(db.create_appointment(data)), 201


@app.route("/api/appointments/<appointment_id>", methods=["GET"])
def api_get_appointment(appointment_id):
    user = _current_user()
    if not user:
        return jsonify({"error": "not signed in"}), 401
    row = db.get_appointment(appointment_id)
    if not row or not _owns_appointment(user, row):
        return jsonify({"error": "not found"}), 404
    return jsonify(row)


@app.route("/api/appointments/<appointment_id>", methods=["PATCH"])
def api_update_appointment(appointment_id):
    user = _current_user()
    if not user:
        return jsonify({"error": "not signed in"}), 401
    row = db.get_appointment(appointment_id)
    if not row or not _owns_appointment(user, row):
        return jsonify({"error": "not found"}), 404
    data = request.get_json() or {}
    # Customers may only cancel their own bookings; the provider controls
    # confirming/completing them.
    if user["role"] != "provider" and data.get("status") != "cancelled":
        return jsonify({"error": "customers can only cancel appointments"}), 403
    try:
        row = db.update_appointment_status(appointment_id, data.get("status"))
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    return jsonify(row) if row else (jsonify({"error": "not found"}), 404)


@app.route("/api/appointments/<appointment_id>", methods=["DELETE"])
def api_delete_appointment(appointment_id):
    user = _current_user()
    if not user:
        return jsonify({"error": "not signed in"}), 401
    row = db.get_appointment(appointment_id)
    if not row or not _owns_appointment(user, row):
        return jsonify({"error": "not found"}), 404
    db.delete_appointment(appointment_id)
    return jsonify({"ok": True})


# ---------------------------------------------------------------------------
# API: hours
# ---------------------------------------------------------------------------
@app.route("/api/hours", methods=["GET"])
def api_get_hours():
    return jsonify(db.get_hours_full())


@app.route("/api/hours", methods=["PUT"])
def api_save_hours():
    db.replace_hours(request.get_json().get("hours", {}))
    return jsonify({"ok": True})


# ---------------------------------------------------------------------------
# API: business name
# ---------------------------------------------------------------------------
@app.route("/api/business-name", methods=["PUT"])
def api_save_business_name():
    db.set_business_name(request.get_json().get("name", "My Business"))
    return jsonify({"ok": True})


# ---------------------------------------------------------------------------
# API: auth
# ---------------------------------------------------------------------------
@app.route("/api/user")
def api_get_user():
    user = _current_user()
    return jsonify(user)


@app.route("/api/auth/signup", methods=["POST"])
def api_signup():
    data = request.get_json()
    try:
        user, token = db.create_user(
            data.get("name", ""), data.get("email", ""),
            data.get("role", "customer"), data.get("password", ""),
        )
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 409
    _set_user(user, token)
    if data.get("role") == "provider" and data.get("business"):
        db.set_business_name(data["business"])
        db.set_user_business(user["id"], data["business"])
        try:
            db.set_business_password(data["business"], data.get("password", ""))
        except ValueError as exc:
            return jsonify({"error": str(exc)}), 400
    return jsonify({"ok": True, "user": user}), 201


@app.route("/api/auth/login", methods=["POST"])
def api_login():
    data = request.get_json()
    result = db.login_user(data.get("email", ""), data.get("password", ""))
    if not result:
        return jsonify({"error": "Incorrect email or password."}), 401
    user, token = result
    _set_user(user, token)
    return jsonify({"ok": True, "user": user})


@app.route("/api/auth/business-login", methods=["POST"])
def api_business_login():
    data = request.get_json()
    business = (data.get("business") or "").strip()
    if not db.verify_business_password(business, data.get("password", "")):
        return jsonify({"error": "Incorrect business name or password."}), 401
    user, token = db.set_business_session(
        business, data.get("name", ""), data.get("email", "")
    )
    db.set_business_name(business)
    _set_user(user, token)
    return jsonify({"ok": True, "user": user, "business": business})


@app.route("/api/auth", methods=["DELETE"])
def api_sign_out():
    _clear_user()
    return jsonify({"ok": True})


@app.route("/api/auth/change-password", methods=["POST"])
def api_change_password():
    user = _current_user()
    if not user:
        return jsonify({"error": "not signed in"}), 401
    data = request.get_json()
    try:
        db.change_password(
            user["id"],
            data.get("currentPassword", ""),
            data.get("newPassword", ""),
        )
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    return jsonify({"ok": True})


# ---------------------------------------------------------------------------
# init + run
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    db.init_db()
    print("HairNet backend running at http://localhost:8000")
    app.run(host="0.0.0.0", port=8000, debug=True)
