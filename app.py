"""HairNet Flask server.

Serves the static frontend and a JSON REST API backed by Azure SQL.
Run:  python3 app.py
"""
import hashlib
import base64
import json
import os
import re
import secrets
import smtplib
import time
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from urllib.parse import urlencode

import requests as http_requests
from flask import Flask, jsonify, request, redirect, send_from_directory, session

import db

app = Flask(__name__, static_folder="static", static_url_path="")
app.secret_key = os.environ.get("FLASK_SECRET_KEY", secrets.token_hex(32))


# ---------------------------------------------------------------------------
# Gmail SMTP helper
# ---------------------------------------------------------------------------
GMAIL_SMTP_HOST = os.environ.get("GMAIL_SMTP_HOST", "smtp.gmail.com")
GMAIL_SMTP_PORT = int(os.environ.get("GMAIL_SMTP_PORT", "587"))
GMAIL_SMTP_USER = os.environ.get("GMAIL_SMTP_USER", "")
GMAIL_SMTP_PASS = os.environ.get("GMAIL_SMTP_PASS", "")


def _send_email(to_email, subject, html_body):
    """Send an HTML email via Gmail SMTP. Returns True on success, False on failure."""
    if not GMAIL_SMTP_USER or not GMAIL_SMTP_PASS:
        print("HairNet: Gmail SMTP not configured — skipping email send.")
        return False
    try:
        msg = MIMEMultipart("alternative")
        msg["From"] = GMAIL_SMTP_USER
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.attach(MIMEText(html_body, "html"))
        with smtplib.SMTP(GMAIL_SMTP_HOST, GMAIL_SMTP_PORT, timeout=15) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(GMAIL_SMTP_USER, GMAIL_SMTP_PASS)
            server.sendmail(GMAIL_SMTP_USER, to_email, msg.as_string())
        return True
    except Exception as exc:
        print(f"HairNet: failed to send email to {to_email}: {exc}")
        return False


def _reset_link_base():
    """Build the base URL for password-reset links (scheme + host)."""
    explicit = os.environ.get("RESET_LINK_BASE")
    if explicit:
        return explicit.rstrip("/")
    host = os.environ.get("WEBSITE_HOSTNAME") or request.host
    scheme = "https" if os.environ.get("WEBSITE_HOSTNAME") else request.scheme
    return f"{scheme}://{host}"

# ---------------------------------------------------------------------------
# HTTPS enforcement (production)
# ---------------------------------------------------------------------------
@app.before_request
def _enforce_https():
    """Redirect HTTP to HTTPS in production (behind Azure load balancer)."""
    if os.environ.get("WEBSITE_HOSTNAME"):
        proto = request.headers.get("X-Forwarded-Proto", request.scheme)
        if proto != "https":
            url = request.url.replace("http://", "https://", 1)
            return redirect(url, code=301)


# ---------------------------------------------------------------------------
# Google OAuth 2.0 (Authorization Code + PKCE)
# ---------------------------------------------------------------------------
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", "")
GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_ENDPOINT = "https://www.googleapis.com/oauth2/v2/userinfo"


def _pkce_code_verifier():
    """Generate a cryptographically random code verifier (43-128 chars)."""
    return secrets.token_urlsafe(64)


def _pkce_code_challenge(verifier):
    """Derive the S256 code challenge from a code verifier."""
    digest = hashlib.sha256(verifier.encode("ascii")).digest()
    return base64.urlsafe_b64encode(digest).rstrip(b"=").decode("ascii")


def _google_redirect_uri():
    """Build the OAuth callback URL, respecting the production hostname."""
    explicit = os.environ.get("GOOGLE_REDIRECT_URI")
    if explicit:
        return explicit
    host = os.environ.get("WEBSITE_HOSTNAME") or request.host
    scheme = "https" if os.environ.get("WEBSITE_HOSTNAME") else request.scheme
    return f"{scheme}://{host}/api/auth/google/callback"


# ---------------------------------------------------------------------------
# session helper
# ---------------------------------------------------------------------------
def _current_user():
    return db.get_user(token=session.get("token"))


def _set_user(user, token):
    session["token"] = token
    session.permanent = True


def _clear_user():
    token = session.get("token")
    session.clear()
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


def _require_provider():
    """Return (user, business) if the requester is a signed-in provider that
    has a linked business, else (None, None)."""
    user = _current_user()
    if not user or user.get("role") != "provider":
        return None, None
    business = db.get_user_business(user["id"])
    if not business:
        return None, None
    return user, business


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
    try:
        user = _current_user()
        state = db.get_full_state(viewer=user)
        state["user"] = user
        if user and user.get("role") == "provider":
            business = db.get_user_business(user["id"])
            if business:
                state["businessName"] = business
                state["businessCategory"] = db.get_business_category(business)
        return jsonify(state)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


# ---------------------------------------------------------------------------
# API: services
# ---------------------------------------------------------------------------
@app.route("/api/services", methods=["GET"])
def api_list_services():
    return jsonify(db.list_services())


@app.route("/api/services", methods=["POST"])
def api_create_service():
    user, business = _require_provider()
    if not user:
        return jsonify({"error": "only signed-in business owners can create services"}), 403
    data = request.get_json() or {}
    data["business"] = business
    return jsonify(db.create_service(data, owner_id=user["id"])), 201


@app.route("/api/services/<service_id>", methods=["GET"])
def api_get_service(service_id):
    row = db.get_service(service_id)
    return jsonify(row) if row else (jsonify({"error": "not found"}), 404)


@app.route("/api/services/<service_id>", methods=["PUT"])
def api_update_service(service_id):
    user, business = _require_provider()
    if not user:
        return jsonify({"error": "only signed-in business owners can update services"}), 403
    row = db.get_service(service_id)
    if not row or row.get("business") != business:
        return jsonify({"error": "not found"}), 404
    data = request.get_json() or {}
    data["business"] = business
    return jsonify(db.update_service(service_id, data, owner_id=user["id"]))


@app.route("/api/services/<service_id>", methods=["DELETE"])
def api_delete_service(service_id):
    user, business = _require_provider()
    if not user:
        return jsonify({"error": "only signed-in business owners can delete services"}), 403
    row = db.get_service(service_id)
    if not row or row.get("business") != business:
        return jsonify({"error": "not found"}), 404
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
    try:
        appt = db.create_appointment(data)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 409
    return jsonify(appt), 201


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
    user, _business = _require_provider()
    if not user:
        return jsonify({"error": "only signed-in business owners can set working hours"}), 403
    db.replace_hours(request.get_json().get("hours", {}))
    return jsonify({"ok": True})


# ---------------------------------------------------------------------------
# API: business name
# ---------------------------------------------------------------------------
@app.route("/api/business-name", methods=["PUT"])
def api_save_business_name():
    user, business = _require_provider()
    if not user:
        return jsonify({"error": "only signed-in business owners can update the business"}), 403
    db.set_user_business(user["id"], business)
    return jsonify({"ok": True})


@app.route("/api/business-address", methods=["PUT"])
def api_save_business_address():
    user, business = _require_provider()
    if not user:
        return jsonify({"error": "only signed-in business owners can update the address"}), 403
    data = request.get_json() or {}
    street_address = (data.get("street_address") or "").strip()
    city = (data.get("city") or "").strip()
    zip_code = (data.get("zip_code") or "").strip()
    db.update_business_address(business, street_address=street_address, city=city, zip_code=zip_code)
    return jsonify({"ok": True})


@app.route("/api/reviews", methods=["POST"])
def api_create_review():
    user = _current_user()
    data = request.get_json() or {}
    business = (data.get("business") or "").strip()
    if not business:
        return jsonify({"error": "Business name is required."}), 400
    rating = data.get("rating")
    if not rating or int(rating) < 1 or int(rating) > 5:
        return jsonify({"error": "Rating must be between 1 and 5."}), 400
    customer_id = user["id"] if user else None
    customer_name = (data.get("customer_name") or (user.get("name") if user else "") or "").strip()
    comment = (data.get("comment") or "").strip()
    review = db.create_review(business, customer_id, customer_name, int(rating), comment)
    return jsonify({"ok": True, "review": review}), 201


@app.route("/api/reviews/<business>", methods=["GET"])
def api_list_reviews(business):
    reviews = db.list_reviews(business)
    rating = db.get_business_rating(business)
    return jsonify({"reviews": reviews, "rating": rating})


@app.route("/api/ratings", methods=["GET"])
def api_list_all_ratings():
    ratings = db.list_all_ratings()
    return jsonify({"ratings": ratings})


@app.route("/api/business/setup", methods=["POST"])
def api_business_setup():
    """Link the provider to a business and update their display name.

    For a new Google signup the account is only created here — the moment the
    provider finishes onboarding. If they cancel the flow before this call the
    pending Google signup is discarded and no account is created.
    """
    user = _current_user()
    # A brand-new provider coming through Google OAuth has no account yet; the
    # identity lives in the session. Finalize (create) the account here.
    if not user:
        pending = _pending_google_signup(handler="provider")
        if not pending:
            return jsonify({"error": "not signed in"}), 401
        try:
            user, token = db.create_provider_from_google(
                pending["google_id"], pending["email"], pending["name"]
            )
        except ValueError:
            return jsonify({"error": "email already registered with another account"}), 409
        _set_user(user, token)
    if user.get("role") != "provider":
        return jsonify({"error": "only business owners can set up a business"}), 403
    data = request.get_json() or {}
    business = (data.get("business") or "").strip()
    if not business:
        return jsonify({"error": "Business name is required."}), 400
    name = (data.get("name") or user.get("name") or "").strip()
    category = (data.get("category") or "").strip()
    street_address = (data.get("street_address") or "").strip()
    city = (data.get("city") or "").strip()
    zip_code = (data.get("zip_code") or "").strip()
    if not category:
        return jsonify({"error": "A business category is required."}), 400
    linked = db.link_provider_to_business(user["id"], name, business, category=category, street_address=street_address, city=city, zip_code=zip_code)
    return jsonify({
        "ok": True,
        "business": linked,
        "category": category,
        "user": user,
    })


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
        business = (data.get("business") or "").strip()
        category = (data.get("category") or "").strip()
        street_address = (data.get("street_address") or "").strip()
        city = (data.get("city") or "").strip()
        zip_code = (data.get("zip_code") or "").strip()
        if not category:
            return jsonify({"error": "A business category is required."}), 400
        if category not in ('Haircuts & Styling', 'Colouring & Treatments', 'Barbershop', 'Nail & Beauty'):
            return jsonify({"error": "Invalid business category."}), 400
        db.set_user_business(user["id"], business)
        try:
            db.set_business_password(
                business, data.get("password", ""),
                owner_id=user["id"], category=category,
                street_address=street_address, city=city, zip_code=zip_code,
            )
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
    payload = {"ok": True, "user": user}
    if user.get("role") == "provider":
        payload["businessName"] = db.get_user_business(user["id"])
        payload["businessCategory"] = db.get_business_category(payload["businessName"])
    return jsonify(payload)


@app.route("/api/auth/business-login", methods=["POST"])
def api_business_login():
    data = request.get_json()
    business = (data.get("business") or "").strip()
    if not db.verify_business_password(business, data.get("password", "")):
        return jsonify({"error": "Incorrect business name or password."}), 401
    user, token = db.set_business_session(
        business, data.get("name", ""), data.get("email", "")
    )
    _set_user(user, token)
    return jsonify({"ok": True, "user": user, "business": business})


@app.route("/api/auth", methods=["DELETE"])
def api_sign_out():
    _clear_user()
    return jsonify({"ok": True})


@app.route("/api/account", methods=["DELETE"])
def api_delete_account():
    """Permanently delete the signed-in user's account and their data."""
    user = _current_user()
    if not user:
        return jsonify({"error": "not signed in"}), 401
    db.delete_user(user["id"])
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


@app.route("/api/auth/forgot-password", methods=["POST"])
def api_forgot_password():
    data = request.get_json()
    email = (data.get("email") or "").strip()
    if not email:
        return jsonify({"error": "email is required"}), 400
    token = db.create_reset_token(email)
    if token is None:
        # Don't reveal whether the email exists
        return jsonify({"ok": True})
    reset_url = f"{_reset_link_base()}/#/reset-password?token={token}"
    subject = "HairNet — Reset your password"
    html_body = f"""
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:32px 20px">
      <h2 style="color:#1C1917;margin-bottom:8px">Reset your password</h2>
      <p style="color:#57534E;font-size:15px;line-height:1.6">
        Click the button below to set a new password for your HairNet account.
        This link expires in 1 hour.
      </p>
      <a href="{reset_url}"
         style="display:inline-block;background:#E07A5F;color:#fff;padding:12px 28px;border-radius:12px;text-decoration:none;font-weight:600;font-size:15px;margin:16px 0">
        Reset password
      </a>
      <p style="color:#78716C;font-size:13px;margin-top:24px">
        If you didn't request a password reset, you can safely ignore this email.
      </p>
    </div>
    """
    _send_email(email, subject, html_body)
    return jsonify({"ok": True})


@app.route("/api/auth/reset-password", methods=["POST"])
def api_reset_password():
    data = request.get_json()
    token = data.get("token", "")
    new_password = data.get("newPassword", "")
    try:
        db.reset_password(token, new_password)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    return jsonify({"ok": True})


@app.route("/api/auth/business/forgot-password", methods=["POST"])
def api_business_forgot_password():
    data = request.get_json()
    business = (data.get("business") or "").strip()
    if not business:
        return jsonify({"error": "business name is required"}), 400
    token = db.create_business_reset_token(business)
    if token is None:
        # Don't reveal whether the business exists
        return jsonify({"ok": True})
    # Find the business owner's email to send the reset link
    owner_email = db.get_business_owner_email(business)
    if owner_email:
        reset_url = f"{_reset_link_base()}/#/business/reset-password?token={token}"
        subject = "HairNet — Reset your business password"
        html_body = f"""
        <div style="font-family:system-ui,-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:32px 20px">
          <h2 style="color:#1C1917;margin-bottom:8px">Reset your business password</h2>
          <p style="color:#57534E;font-size:15px;line-height:1.6">
            Click the button below to set a new password for <strong>{business}</strong> on HairNet.
            This link expires in 1 hour.
          </p>
          <a href="{reset_url}"
             style="display:inline-block;background:#E07A5F;color:#fff;padding:12px 28px;border-radius:12px;text-decoration:none;font-weight:600;font-size:15px;margin:16px 0">
            Reset business password
          </a>
          <p style="color:#78716C;font-size:13px;margin-top:24px">
            If you didn't request a password reset, you can safely ignore this email.
          </p>
        </div>
        """
        _send_email(owner_email, subject, html_body)
    return jsonify({"ok": True})


@app.route("/api/auth/business/reset-password", methods=["POST"])
def api_business_reset_password():
    data = request.get_json()
    token = data.get("token", "")
    new_password = data.get("newPassword", "")
    try:
        db.reset_business_password(token, new_password)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    return jsonify({"ok": True})


@app.route("/api/auth/google/business-session", methods=["GET"])
def api_google_business_session():
    """Return the current provider user + their business after OAuth."""
    user = _current_user()
    if not user:
        return jsonify({"error": "not signed in"}), 401
    business = db.get_user_business_name(user["id"])
    return jsonify({"ok": True, "user": user, "businessName": business})


@app.route("/api/auth/google/authorize")
def api_google_authorize():
    """Begin Google OAuth: generate PKCE verifier, state, and redirect URL.

    Query param `handler` selects the post-OAuth behaviour:
      - "customer" (default): sign in/up as a customer
      - "provider": sign in/up as a provider (business owner)
    """
    if not GOOGLE_CLIENT_ID:
        return jsonify({"error": "Google OAuth is not configured"}), 503

    handler = request.args.get("handler", "customer")
    if handler not in ("customer", "provider"):
        handler = "customer"

    # PKCE
    code_verifier = _pkce_code_verifier()
    code_challenge = _pkce_code_challenge(code_verifier)
    session["google_oauth_verifier"] = code_verifier
    session["google_oauth_handler"] = handler

    # CSRF state
    state = secrets.token_urlsafe(32)
    session["google_oauth_state"] = state

    redirect_uri = _google_redirect_uri()

    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "state": state,
        "code_challenge": code_challenge,
        "code_challenge_method": "S256",
        "access_type": "offline",
        "prompt": "consent",
    }
    url = f"{GOOGLE_AUTH_ENDPOINT}?{urlencode(params)}"
    return jsonify({"url": url})


@app.route("/api/auth/google/callback")
def api_google_callback():
    """Handle the redirect from Google: exchange code for tokens, sign in."""
    # --- CSRF validation ---
    state = request.args.get("state", "")
    expected_state = session.pop("google_oauth_state", None)
    if not state or state != expected_state:
        return redirect("/#/account?error=oauth_state_mismatch", code=302)

    handler = session.pop("google_oauth_handler", "customer")
    target = "#/oauth-complete"

    # --- Error from Google ---
    error = request.args.get("error")
    if error:
        return redirect(f"{target}?error={error}", code=302)

    # --- Exchange authorization code for tokens (with PKCE verifier) ---
    code = request.args.get("code", "")
    code_verifier = session.pop("google_oauth_verifier", None)
    if not code or not code_verifier:
        return redirect(f"{target}?error=oauth_missing_code", code=302)

    redirect_uri = _google_redirect_uri()
    token_resp = http_requests.post(GOOGLE_TOKEN_ENDPOINT, data={
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": redirect_uri,
        "grant_type": "authorization_code",
        "code_verifier": code_verifier,
    }, timeout=10)

    if token_resp.status_code != 200:
        return redirect(f"{target}?error=oauth_token_exchange_failed", code=302)

    token_data = token_resp.json()
    access_token = token_data.get("access_token")
    if not access_token:
        return redirect(f"{target}?error=oauth_no_access_token", code=302)

    # --- Fetch user info from Google ---
    userinfo_resp = http_requests.get(GOOGLE_USERINFO_ENDPOINT, headers={
        "Authorization": f"Bearer {access_token}",
    }, timeout=10)

    if userinfo_resp.status_code != 200:
        return redirect(f"{target}?error=oauth_userinfo_failed", code=302)

    userinfo = userinfo_resp.json()
    google_id = userinfo.get("id")
    email = userinfo.get("email", "")
    name = userinfo.get("name", "")

    if not google_id or not email:
        return redirect(f"{target}?error=oauth_incomplete_profile", code=302)

    # Cache the Google identity but DO NOT create the account yet. The account
    # is only created once the user finishes the signup flow (a customer
    # confirms on the completion screen; a new provider completes onboarding).
    # If the user cancels / backs out before that, no account is left behind.
    session["google_signup"] = {
        "google_id": google_id,
        "email": email,
        "name": name,
        "handler": handler,
        "created_at": time.time(),
    }

    return redirect(f"{target}", code=302)


@app.route("/api/auth/google/session", methods=["GET"])
def api_google_session():
    """Return the current user after OAuth redirect (SPA reads this)."""
    user = _current_user()
    if not user:
        return jsonify({"error": "not signed in"}), 401
    payload = {"ok": True, "user": user}
    if user.get("role") == "provider":
        business = db.get_user_business_name(user["id"])
        payload["businessName"] = business
    return jsonify(payload)


# A pending Google signup is only trusted for a short window. After that it is
# discarded so a cancelled/stale flow can never finalize into an account.
_PENDING_SIGNUP_TTL = 15 * 60  # 15 minutes


def _pending_google_signup(handler=None, pop=True):
    """Return a valid cached Google signup, or None. Expires and checks handler."""
    pending = session.get("google_signup")
    if not pending:
        return None
    if time.time() - pending.get("created_at", 0) > _PENDING_SIGNUP_TTL:
        session.pop("google_signup", None)
        return None
    if handler and pending.get("handler") != handler:
        return None
    return session.pop("google_signup", None) if pop else pending


@app.route("/api/auth/google/signup-status", methods=["GET"])
def api_google_signup_status():
    """Report a deferred Google signup so the SPA can route the user.

    Only an authorized pending signup is honoured. The account has NOT been
    created yet, so cancelling the flow leaves no user behind.
    """
    pending = _pending_google_signup(pop=False)
    if not pending:
        return jsonify({"pending": False})
    handler = pending.get("handler", "customer")
    existing = db.find_user_by_google_or_email(
        pending.get("google_id"), pending.get("email")
    )
    business_name = None
    if existing and existing.get("role") == "provider":
        business_name = db.get_user_business_name(existing["id"])
    return jsonify({
        "pending": True,
        "handler": handler,
        "name": pending.get("name"),
        "email": pending.get("email"),
        "existing": existing is not None,
        "businessName": business_name,
    })


@app.route("/api/auth/google/confirm", methods=["POST"])
def api_google_confirm():
    """Create (or sign back in) the Google account once the user finishes.

    This is the final step of the Google signup. It only runs for a pending
    signup cached in the session; if the flow was cancelled, no user appears.
    """
    pending = _pending_google_signup()
    if not pending:
        return jsonify({"error": "no pending Google signup"}), 400
    handler = pending.get("handler", "customer")
    try:
        if handler == "provider":
            user, token = db.create_provider_from_google(
                pending["google_id"], pending["email"], pending["name"]
            )
        else:
            user, token = db.create_user_from_google(
                pending["google_id"], pending["email"], pending["name"]
            )
    except ValueError:
        # Block OAuth when the email already belongs to another account.
        return jsonify({"error": "email already registered with another account"}), 409
    _set_user(user, token)
    business = db.get_user_business_name(user["id"]) if user.get("role") == "provider" else None
    category = db.get_business_category(business) if business else None
    return jsonify({"ok": True, "user": user, "businessName": business, "businessCategory": category})


# ---------------------------------------------------------------------------
# init + run
# ---------------------------------------------------------------------------
@app.route("/api/init-db")
def api_init_db():
    """Create any missing database tables/columns. Idempotent and safe to call."""
    db.init_db()
    return jsonify({"ok": True})


# Ensure the schema (and any migrations, e.g. Businesses.category) exists before
# serving requests, regardless of whether the process was started via the
# __main__ branch or gunicorn. Idempotent; a failure is non-fatal on startup.
if not os.environ.get("FLASK_SKIP_INIT_DB"):
    try:
        db.init_db()
    except Exception as exc:  # pragma: no cover - startup best-effort
        print("HairNet: deferred DB init (will retry via /api/init-db):", exc)


if __name__ == "__main__":
    db.init_db()
    print("HairNet backend running at http://localhost:8000")
    app.run(host="0.0.0.0", port=8000, debug=True)
