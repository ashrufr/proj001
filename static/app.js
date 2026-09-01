/* ============================================================
   HairNet — a booking platform (vanilla JS SPA)
   ============================================================ */

/* ---------------- Icons (lucide-style inline SVG) ---------------- */
const I = {
  spark: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.9 5.7a2 2 0 0 0 1.3 1.3L21 11l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 20l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 11l5.8-1.9a2 2 0 0 0 1.3-1.3z"/></svg>',
  search: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
  calendar: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
  clock: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
  user: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  scissors: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12"/></svg>',
  heart: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
  book: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>',
  briefcase: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
  check: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
  checkBig: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
  x: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  pencil: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>',
  trash: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  plus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>',
  arrowLeft: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7M5 12h14"/></svg>',
  arrowRight: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
  chart: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>',
  wallet: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>',
  zap: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  layers: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 2 7l10 5 10-5-10-5Z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg>',
  shield: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z"/></svg>',
  layout: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>',
  sun: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  logOut: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/></svg>',
  chevRight: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
  star: '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/></svg>',
};

/* ---------------- Categories ---------------- */
const CATEGORIES = ['Haircuts & Styling', 'Colouring & Treatments', 'Barbershop', 'Nail & Beauty'];

const CAT_STYLE = {
  'Haircuts & Styling': { grad: 'linear-gradient(135deg,#F5A48C 0%,#E07A5F 100%)', icon: I.scissors },
  'Colouring & Treatments': { grad: 'linear-gradient(135deg,#A3C9B5 0%,#6FA98C 100%)', icon: I.heart },
  'Barbershop': { grad: 'linear-gradient(135deg,#7D82B5 0%,#5A5F8F 100%)', icon: I.scissors },
  'Nail & Beauty': { grad: 'linear-gradient(135deg,#E8B96A 0%,#D29A3F 100%)', icon: I.heart },
};

function bizStyle(name) { return { grad: 'linear-gradient(135deg,#A8A29E,#78716C)', initial: (name || '?').charAt(0).toUpperCase() }; }

function catStyle(cat) {
  return CAT_STYLE[cat] || { grad: 'linear-gradient(135deg,#A8A29E,#78716C)', icon: I.spark };
}

/* ---------------- State ---------------- */
const STORE_KEY = 'hairnet_state_v1';
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Mon..Sun

function defaultHours() {
  const h = {};
  DAY_ORDER.forEach(d => {
    h[d] = (d >= 1 && d <= 5) ? { open: '08:00', close: '17:00' } : null;
  });
  return h;
}

function iso(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function fromISO(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
function addDays(d, n) { const c = new Date(d); c.setDate(c.getDate() + n); return c; }

function emptyState() {
  return {
    user: null,
    services: [],
    appointments: [],
    hours: defaultHours(),
    businessName: 'My Business',
    businessCategory: '',
    businesses: [],
  };
}

let state = (function () {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return Object.assign(emptyState(), JSON.parse(raw));
  } catch (e) { /* ignore */ }
  return emptyState();
})();

function persist() { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ } }

/* API client (api.js). If the module is missing, fall back to "offline" stubs
   so the app still runs from localStorage when opened without the backend. */
const apiClient = (typeof API !== 'undefined' && API) || new Proxy({}, { get: () => () => Promise.reject(new Error('API module not loaded')) });

function syncToServer(promise) {
  promise.catch(err => console.warn('HairNet: could not sync to server.', err));
}

function hasBusiness() {
  // 'My Business' is the placeholder for "no real business configured yet".
  const n = state.businessName;
  return !!(n && n !== 'My Business');
}

function categoryOptions(selected) {
  const opts = CATEGORIES.map(c => `<option value="${c}" ${selected === c ? 'selected' : ''}>${c}</option>`).join('');
  return `<option value="" disabled selected>Select a category…</option>${opts}`;
}

function defaultServiceFields() {
  return `
  <div class="field">
    <label for="svc-name">Default service name</label>
    <input id="svc-name" name="serviceName" type="text" placeholder="e.g. Signature Haircut" required />
    <div class="hint">Your first bookable service — required so customers can find you.</div>
  </div>
  <div class="flex gap-2" style="gap:12px">
    <div class="field" style="flex:1">
      <label for="svc-price">Price (R)</label>
      <input id="svc-price" name="servicePrice" type="number" min="0" step="0.01" value="50" required />
    </div>
    <div class="field" style="flex:1">
      <label for="svc-duration">Duration (min)</label>
      <input id="svc-duration" name="serviceDuration" type="number" min="15" max="480" step="15" value="60" required />
    </div>
  </div>`;
}

async function addDefaultService(fd, business, category) {
  const serviceName = (fd.get('serviceName') || '').trim();
  if (!serviceName) return null;
  const svc = {
    id: uid(), business, category,
    name: serviceName, desc: '',
    duration: Number(fd.get('serviceDuration')) || 60,
    price: Number(fd.get('servicePrice')) || 0,
  };
  try {
    const created = await apiClient.createService(svc);
    state.services = [created, ...(state.services || [])];
    return created;
  } catch (err) {
    toast('Could not add the default service: ' + err.message);
    return null;
  }
}

function normalizeRemote(remote) {
  const hours = {};
  for (let i = 0; i < 7; i++) hours[i] = (remote.hours && (remote.hours[String(i)] || remote.hours[i])) || null;
  return {
    user: remote.user || null,
    services: remote.services || [],
    appointments: remote.appointments || [],
    hours,
    businessName: remote.businessName || 'My Business',
    businessCategory: remote.businessCategory || '',
    businesses: remote.businesses || [],
  };
}

/* ---------------- Util ---------------- */
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function money(n) { return 'R' + Number(n).toFixed(n % 1 ? 2 : 0); }
function minutesLabel(m) { return m + ' min'; }
function fmtLong(isoDate, time) {
  const d = fromISO(isoDate);
  return DAY_NAMES[d.getDay()] + ', ' + d.toLocaleString('en-US', { month: 'short' }) + ' ' + d.getDate() + ' · ' + fmtTime(time);
}
function fmtTime(t) {
  let [h, m] = t.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return h + ':' + String(m).padStart(2, '0') + ' ' + ap;
}
function isPast(date, time) {
  const now = new Date();
  const [y, mo, d] = date.split('-').map(Number);
  const [h, mi] = time.split(':').map(Number);
  const that = new Date(y, mo - 1, d, h, mi);
  return that.getTime() <= now.getTime();
}
function timeslots(dayNum, dateStr, duration) {
  const h = state.hours[dayNum];
  if (!h) return [];
  const dur = Number(duration) || 30;
  const out = [];
  const [oh, om] = h.open.split(':').map(Number);
  const [ch, cm] = h.close.split(':').map(Number);
  let cur = oh * 60 + om;
  const end = ch * 60 + cm;
  while (cur + dur <= end) {
    const t = String(Math.floor(cur / 60)).padStart(2, '0') + ':' + String(cur % 60).padStart(2, '0');
    out.push(t);
    cur += 30;
  }
  return out;
}
function isBooked(dateStr, time, business) {
  return state.appointments.some(a => a.date === dateStr && a.time === time && a.status !== 'cancelled' && a.business === business);
}
function hashStr(s) { let x = 0; for (let i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) >>> 0; return x; }
function pseudoBooked(dateStr, time) { return hashStr(dateStr + '|' + time) % 4 === 0; }
function slotState(dateStr, time, dayNum, business) {
  const today = iso(new Date());
  const isToday = dateStr === today;
  if (isBooked(dateStr, time, business)) return 'booked';
  if (isToday && isPast(dateStr, time)) return 'past';
  return 'available';
}

function byId(id) { return state.services.find(s => s.id === id); }
function uid() { return 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

/* ---------------- Toast & Modal ---------------- */
function toast(msg) {
  const wrap = document.querySelector('.toast-wrap') || (() => { const w = document.createElement('div'); w.className = 'toast-wrap'; document.body.appendChild(w); return w; })();
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = '<span class="dot"></span>' + esc(msg);
  wrap.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(() => el.remove(), 300); }, 2600);
}
function openModal(html) {
  closeModal();
  const bd = document.createElement('div');
  bd.className = 'modal-backdrop';
  bd.id = 'modal-root';
  bd.innerHTML = html;
  bd.addEventListener('click', e => { if (e.target === bd) closeModal(); });
  document.body.appendChild(bd);
}
function closeModal() { const m = document.getElementById('modal-root'); if (m) m.remove(); }

/* ---------------- Router ---------------- */
function parseHash() {
  const h = location.hash.replace(/^#\/?/, '').split('?')[0];
  const parts = h.split('/').filter(Boolean);
  return { view: parts[0] || 'home', id: parts[1], tab: parts[1] || 'overview' };
}

function navigate(path) { location.hash = path; }

const App = {};
window.App = App;

function render() {
  const { view, id, tab } = parseHash();
  const root = document.getElementById('app');
  let body = '';
  if (view === 'browse') body = viewBrowse();
  else if (view === 'pricing') body = viewPricing();
  else if (view === 'service') body = viewService(id);
  else if (view === 'account') body = viewAccount();
  else if (view === 'business') body = viewBusinessAuth();
  else if (view === 'appointments') body = viewAppointments();
  else if (view === 'provider') body = viewProvider(tab);
  else if (view === 'onboard') body = (state.user && state.user.role === 'provider' && !hasBusiness()) ? viewOnboard() : ((state.user && state.user.role === 'provider') ? viewProvider(tab) : viewAccount());
  else if (view === 'confirmed') body = viewConfirmed();
  else if (view === 'forgot-password') body = viewForgotPassword();
  else if (view === 'reset-password') body = viewResetPassword();
  else if (view === 'oauth-complete') body = viewOAuthComplete();
  else body = viewHome();
  root.innerHTML = navHtml() + '<main>' + body + '</main>' + footerHtml();
  afterRender(view, id, tab);
}

function navHtml() {
  const u = state.user;
  const links = ['Browse services', 'Pricing'];
  if (u && u.role === 'customer') links.push('My appointments');
  if (u && u.role === 'provider') links.push('Dashboard');
  if (!u || u.role === 'customer') links.push('For businesses');
  const linkPath = {
    'Browse services': '#/browse', 'Pricing': '#/pricing', 'My appointments': '#/appointments',
    'Dashboard': '#/provider', 'For businesses': '#/business/create',
  };
  return `
  <header class="nav">
    <div class="container nav-inner">
      <a class="brand" href="#/">
        <span class="brand-mark">${I.spark}</span>
        HairNet
      </a>
      <nav class="nav-links">
        ${links.map(l => `<a class="nav-link" href="${linkPath[l]}">${l}</a>`).join('')}
      </nav>
      <div class="nav-user">
        ${u ? `
          <span style="display:flex;align-items:center;gap:8px">
            <span class="avatar">${esc(u.name ? u.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : 'U')}</span>
            <a class="uname" href="#/account" title="My account">${esc(u.name || u.email)}</a>
          </span>
          <button class="icon-btn" title="Sign out" onclick="App.signOut()">${I.logOut}</button>
        ` : `
          <a class="nav-link" href="#/account">Sign in</a>
          <button class="btn btn-primary btn-sm" onclick="App.go('#/account')">Get started</button>
        `}
      </div>
    </div>
  </header>`;
}

function footerHtml() {
  return `
  <footer class="footer">
    <div class="container footer-grid">
      <div>
        <a class="brand" href="#/"><span class="brand-mark">${I.spark}</span> ARX Intelligence</a>
        <p>Find and book trusted salon services in seconds. Providers manage everything from services to schedules in one calm place.</p>
      </div>
      <div>
        <h4>Explore</h4>
        <a href="#/browse">Browse services</a>
        <a href="#/account">For businesses</a>
        <a href="#/account">Sign in</a>
      </div>
      <div>
        <h4>Company</h4>
        <a href="#/">About</a>
        <a href="#/">Support</a>
        <a href="#/">Privacy</a>
      </div>
    </div>
    <div class="container" style="margin-top:32px;border-top:1px solid var(--stone-200);padding-top:20px">
      <p style="margin:0">© ${new Date().getFullYear()} ARX Intelligence. All rights reserved. <span class="version">v1.009</span></p>
    </div>
  </footer>`;
}

/* ============================================================
   VIEWS
   ============================================================ */

/* ---------------- Home / landing ---------------- */
function viewHome() {
  const stats = [
    { n: '2,400+', l: 'Total bookings' },
    { n: '1,200h', l: 'Hours saved' },
    { n: '350+', l: 'Active services' },
  ];
  const cats = CATEGORIES.map((c, i) => {
    const st = CAT_STYLE[c];
    return `<button class="cat-card" onclick="App.go('#/browse?cat='+encodeURIComponent('${c}'))">
      <span style="width:36px;height:36px;border-radius:11px;background:${st.grad};color:#fff;display:flex;align-items:center;justify-content:center">${st.icon.replace('20"', '18"')}</span>
      ${c}
    </button>`;
  }).join('');

  return `
  <section class="hero">
    <div class="container hero-grid">
      <div>
        <span class="badge-pill">${I.star} Trusted by providers & customers</span>
        <h1>Find &amp; book services,<br/><span class="accent">any time.</span></h1>
        <p class="lead">Find and book with trusted salons, barbers and hairdressers in seconds. Providers manage everything from services to schedules in one calm place.</p>
        <div class="hero-cta">
          <button class="btn btn-primary btn-lg" onclick="App.go('#/browse')">Browse services ${I.arrowRight}</button>
          <button class="btn btn-outline btn-lg" onclick="App.go('#/account')">I run a business</button>
        </div>
        <div class="hero-stats">
          ${stats.map(s => `<div class="hero-stat"><div class="num">${s.n}</div><div class="lbl">${s.l}</div></div>`).join('')}
        </div>
      </div>
      <div class="hero-visual">
        <div class="float-card">
          <span class="ok">${I.check}</span>
          <div><b>Booking confirmed</b><span>Today · 3:30 PM</span></div>
        </div>
        ${mockupCard()}
        <div class="float-card float-card-2">
          <span class="ok">${I.clock}</span>
          <div><b>60 min saved</b><span>this month</span></div>
        </div>
      </div>
    </div>
  </section>

  <section class="section section-alt">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">Categories</span>
        <h2>Browse by category</h2>
        <p>From a fresh cut to a colour transformation, find the right salon or barber for what you need.</p>
      </div>
      <div class="categories-strip">${cats}</div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">Why HairNet</span>
        <h2>Everything in one calm place</h2>
        <p>Customers book in seconds, providers run the whole shop — no spreadsheets, no phone tag.</p>
      </div>
      <div class="feature-grid">
        <div class="feature-card">
          <div class="f-icon">${I.calendar}</div>
          <h3>Real-time availability</h3>
          <p>Bookings only appear inside your working hours. No double bookings, no back-and-forth messages.</p>
        </div>
        <div class="feature-card">
          <div class="f-icon">${I.layers}</div>
          <h3>Manage everything</h3>
          <p>Services, schedules and bookings live in one calm dashboard. Set hours once, let customers do the rest.</p>
        </div>
        <div class="feature-card">
          <div class="f-icon">${I.shield}</div>
          <h3>Built for trust</h3>
          <p>Transparent pricing and confirmed slots, so both sides always know exactly what to expect.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="section section-alt">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">Pricing</span>
        <h2>Simple, transparent plans</h2>
        <p>Start for free, upgrade when you're ready. No hidden fees.</p>
      </div>
      <div class="pricing-grid">
        <div class="pricing-card">
          <div class="pricing-name">Free</div>
          <div class="pricing-price">R0<span>/month</span></div>
          <div class="pricing-limit">Up to 50 appointments per month</div>
          <ul class="pricing-features">
            <li>${I.check} Basic booking page</li>
            <li>${I.check} Service listings</li>
            <li>${I.check} Schedule management</li>
            <li>${I.check} Customer notifications</li>
          </ul>
          <button class="btn btn-outline btn-block" onclick="App.go('#/account')">Get started</button>
        </div>
        <div class="pricing-card pricing-card-featured">
          <div class="pricing-badge">Popular</div>
          <div class="pricing-name">Starter</div>
          <div class="pricing-price">R100<span>/month</span></div>
          <div class="pricing-limit">Up to 200 appointments per month</div>
          <ul class="pricing-features">
            <li>${I.check} Everything in Free</li>
            <li>${I.check} Priority support</li>
            <li>${I.check} Advanced analytics</li>
            <li>${I.check} Custom branding</li>
          </ul>
          <button class="btn btn-primary btn-block" onclick="App.go('#/account')">Start free trial</button>
        </div>
        <div class="pricing-card">
          <div class="pricing-name">Pro</div>
          <div class="pricing-price">R300<span>/month</span></div>
          <div class="pricing-limit">Unlimited appointments per month</div>
          <ul class="pricing-features">
            <li>${I.check} Everything in Starter</li>
            <li>${I.check} Unlimited bookings</li>
            <li>${I.check} Multi-staff support</li>
            <li>${I.check} API access</li>
          </ul>
          <button class="btn btn-outline btn-block" onclick="App.go('#/account')">Start free trial</button>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="cta-banner">
        <h2>Ready to find your next appointment?</h2>
        <p>Browse trusted salon and barber services or set up your own booking page in minutes — it's free to start.</p>
        <div class="hero-cta" style="justify-content:center;margin-top:0">
          <button class="btn btn-lg" onclick="App.go('#/browse')">Find a service ${I.arrowRight}</button>
          <button class="btn btn-navy btn-lg" onclick="App.go('#/account')">Start my business</button>
        </div>
      </div>
    </div>
  </section>`;
}

/* ---------------- Pricing ---------------- */
function viewPricing() {
  return `
  <div class="page container" style="max-width:920px">
    <div class="page-head" style="text-align:center">
      <h1>Pricing</h1>
      <p>Simple, transparent plans. Start for free, upgrade when you're ready.</p>
    </div>
    <div class="pricing-grid">
      <div class="pricing-card">
        <div class="pricing-name">Free</div>
        <div class="pricing-price">R0<span>/month</span></div>
        <div class="pricing-limit">Up to 50 appointments per month</div>
        <ul class="pricing-features">
          <li>${I.check} Basic booking page</li>
          <li>${I.check} Service listings</li>
          <li>${I.check} Schedule management</li>
          <li>${I.check} Customer notifications</li>
        </ul>
        <button class="btn btn-outline btn-block" onclick="App.go('#/account')">Get started</button>
      </div>
      <div class="pricing-card pricing-card-featured">
        <div class="pricing-badge">Popular</div>
        <div class="pricing-name">Starter</div>
        <div class="pricing-price">R100<span>/month</span></div>
        <div class="pricing-limit">Up to 200 appointments per month</div>
        <ul class="pricing-features">
          <li>${I.check} Everything in Free</li>
          <li>${I.check} Priority support</li>
          <li>${I.check} Advanced analytics</li>
          <li>${I.check} Custom branding</li>
        </ul>
        <button class="btn btn-primary btn-block" onclick="App.go('#/account')">Start free trial</button>
      </div>
      <div class="pricing-card">
        <div class="pricing-name">Pro</div>
        <div class="pricing-price">R300<span>/month</span></div>
        <div class="pricing-limit">Unlimited appointments per month</div>
        <ul class="pricing-features">
          <li>${I.check} Everything in Starter</li>
          <li>${I.check} Unlimited bookings</li>
          <li>${I.check} Multi-staff support</li>
          <li>${I.check} API access</li>
        </ul>
        <button class="btn btn-outline btn-block" onclick="App.go('#/account')">Start free trial</button>
      </div>
    </div>
  </div>`;
}

function mockupCard() {
  const s = state.services[0];
  if (!s) return '';
  const bs = bizStyle(s.business);
  const cs = CAT_STYLE[s.category] || { grad: 'linear-gradient(135deg,#A8A29E,#78716C)', icon: I.spark };
  return `
  <div class="mockup">
    <div class="mockup-head">
      <div class="bus">
        <span class="avatar-logo" style="background:${bs.grad}">${bs.initial}</span>
        <div><h3>${esc(s.business)}</h3><p>${esc(s.category)}</p></div>
      </div>
      <span class="meta-chip" style="background:${cs.grad};color:#fff;border:none">${cs.icon.replace('20"', '14"')}</span>
    </div>
    <div class="mockup-svc">
      <div>
        <div class="name">${esc(s.name)}</div>
        <div class="meta">${minutesLabel(s.duration)}</div>
      </div>
      <div class="price">${money(s.price)}</div>
    </div>
    <div class="mockup-slots">
      <div class="slot-chip">9:00 AM</div>
      <div class="slot-chip sel">9:30 AM</div>
      <div class="slot-chip">10:00 AM</div>
      <div class="slot-chip">10:30 AM</div>
      <div class="slot-chip">11:00 AM</div>
      <div class="slot-chip">1:00 PM</div>
    </div>
    <button class="btn btn-primary btn-block" onclick="App.go('#/service/${esc(s.id)}')">Confirm booking ${I.arrowRight}</button>
  </div>`;
}

/* ---------------- Browse ---------------- */
function viewBrowse() {
  const params = new URLSearchParams(location.hash.split('?')[1] || '');
  const q = (params.get('q') || '').toLowerCase();
  const cat = params.get('cat') || '';
  const biz = params.get('biz') || '';

  /* Step 1 — pick a category */
  if (!cat) return viewBrowseCategories();

  /* Step 2 — pick a business within the category */
  if (!biz) return viewBrowseBusinesses(cat, q);

  /* Step 3 — services from a specific business in a category */
  return viewBrowseServices(cat, biz, q);
}

/* Step 1: category grid */
function viewBrowseCategories() {
  const businesses = state.businesses || [];
  const services = state.services || [];
  const bizCount = {};
  businesses.forEach(b => { if (b.category) bizCount[b.category] = (bizCount[b.category] || 0) + 1; });
  const svcCount = {};
  services.forEach(s => { svcCount[s.category] = (svcCount[s.category] || 0) + 1; });
  const cats = CATEGORIES.map(c => {
    const st = CAT_STYLE[c];
    const n = bizCount[c] || 0;
    const svcs = svcCount[c] || 0;
    return `<button class="cat-card" onclick="App.go('#/browse?cat='+encodeURIComponent('${c}'))">
      <span style="width:40px;height:40px;border-radius:12px;background:${st.grad};color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0">${st.icon.replace('20"', '18"')}</span>
      <div style="text-align:left">
        <div style="font-weight:700">${c}</div>
        <div style="font-size:12px;color:var(--stone-500);font-weight:500">${n} business${n === 1 ? '' : 'es'} · ${svcs} service${svcs === 1 ? '' : 's'}</div>
      </div>
    </button>`;
  }).join('');

  const allCards = services.map(s => serviceCard(s)).join('');

  return `
  <div class="page container" style="max-width:720px">
    <div class="page-head" style="text-align:center">
      <h1>Browse by service type</h1>
      <p>Pick a category, then choose your preferred business.</p>
    </div>
    <div class="categories-strip" style="flex-direction:column;gap:12px;margin-top:8px">
      ${cats}
    </div>
    <div class="section" style="margin-top:32px">
      <div class="section-head" style="text-align:left">
        <span class="eyebrow">All services</span>
        <h2>Book a service</h2>
        <p>Every service available right now.</p>
      </div>
      ${allCards ? `<div class="grid-cards">${allCards}</div>` : `<div class="empty-state"><div class="big-ico">${I.search}</div><h3>No services yet</h3><p>Bookings will appear here as soon as providers add services.</p></div>`}
    </div>
  </div>`;
}

/* Step 2: businesses within a category */
function viewBrowseBusinesses(cat, q) {
  const cs = CAT_STYLE[cat] || { grad: 'linear-gradient(135deg,#A8A29E,#78716C)', icon: I.scissors };
  const directory = state.businesses || [];
  const services = state.services || [];
  // Businesses are listed by the category chosen at business creation, so a
  // brand-new business (even with no services yet) appears here and is findable.
  const dirBiz = directory.filter(b => b.category === cat).map(b => b.name);
  // Fall back to businesses that only exist via services in this category.
  const svcBiz = [...new Set(services.filter(s => s.category === cat).map(s => s.business))];
  let businesses = [...new Set([...dirBiz, ...svcBiz])];
  if (q) businesses = businesses.filter(b => b.toLowerCase().includes(q));

  const serviceCount = {};
  services.forEach(s => { serviceCount[s.business] = (serviceCount[s.business] || 0) + 1; });

  const cards = businesses.map(b => {
    const bs = bizStyle(b);
    const n = serviceCount[b] || 0;
    const prices = services.filter(s => s.business === b).map(s => s.price);
    const lo = Math.min(...prices), hi = Math.max(...prices);
    const priceRange = prices.length ? (lo === hi ? money(lo) : money(lo) + ' – ' + money(hi)) : 'No services yet';
    return `<a class="biz-browse-card" href="#/browse?cat=${encodeURIComponent(cat)}&biz=${encodeURIComponent(b)}">
      <span class="blogo" style="background:${bs.grad}">${bs.initial}</span>
      <div class="binfo">
        <h3>${esc(b)}</h3>
        <p>${n} service${n === 1 ? '' : 's'} · ${priceRange}</p>
        <div class="bcount">View services →</div>
      </div>
    </a>`;
  }).join('');

  return `
  <div class="page container" style="max-width:720px">
    <button class="back-link" onclick="App.go('#/browse')">${I.arrowLeft} All categories</button>
    <div class="page-head">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:4px">
        <span style="width:36px;height:36px;border-radius:10px;background:${cs.grad};color:#fff;display:flex;align-items:center;justify-content:center">${cs.icon.replace('20"', '16"')}</span>
        <h1 style="margin:0">${esc(cat)}</h1>
      </div>
      <p>Choose a business to see their ${esc(cat).toLowerCase()} services.</p>
    </div>
    <div class="search-wrap" style="margin-bottom:20px">
      ${I.search}
      <input class="search-input" placeholder="Search businesses…"
             value="${esc(q)}" oninput="App.searchBiz('${esc(cat)}',this.value)" />
    </div>
    ${cards.length
      ? `<div style="display:flex;flex-direction:column;gap:12px">${cards}</div>`
      : `<div class="empty-state">
           <div class="big-ico">${I.search}</div>
           <h3>No businesses found</h3>
           <p>Try a different search or go back to all categories.</p>
           <button class="btn btn-outline mt-2" onclick="App.go('#/browse?cat=${encodeURIComponent(cat)}')">Clear search</button>
         </div>`}
  </div>`;
}

/* Step 3: services from a specific business */
function viewBrowseServices(cat, biz, q) {
  const cs = CAT_STYLE[cat] || { grad: 'linear-gradient(135deg,#A8A29E,#78716C)', icon: I.scissors };
  const bs = bizStyle(biz);
  const services = state.services || [];
  // Browsing is business-first now: show everything this business offers.
  const bizNorm = (biz || '').trim().toLowerCase();
  let list = services.filter(s => (s.business || '').trim().toLowerCase() === bizNorm);
  if (q) list = list.filter(s => (s.name + s.desc).toLowerCase().includes(q));

  const empty = q
    ? `<h3>No services match your search</h3><p>Try a different keyword or clear the search.</p>
       <button class="btn btn-outline mt-2" onclick="App.go('#/browse?cat=${encodeURIComponent(cat)}&biz=${encodeURIComponent(biz)}')">Clear search</button>`
    : `<h3>No services yet</h3><p>This business has not added services. Check back soon.</p>`;
  const grid = list.length
    ? `<div class="grid-cards">${list.map(serviceCard).join('')}</div>`
    : `<div class="empty-state">
         <div class="big-ico">${I.search}</div>
         ${empty}
       </div>`;

  return `
  <div class="page container">
    <button class="back-link" onclick="App.go('#/browse?cat=${encodeURIComponent(cat)}')">${I.arrowLeft} All ${esc(cat)} businesses</button>
    <div class="page-head" style="display:flex;align-items:center;gap:14px">
      <span class="avatar-logo" style="width:48px;height:48px;border-radius:14px;font-size:18px;background:${bs.grad};color:#fff;display:flex;align-items:center;justify-content:center">${bs.initial}</span>
      <div>
        <h1 style="font-size:22px">${esc(biz)}</h1>
        <p style="margin:0">${esc(cat)} · ${list.length} service${list.length === 1 ? '' : 's'}</p>
      </div>
    </div>
    <div class="toolbar" style="margin-top:8px">
      <div class="search-wrap">
        ${I.search}
        <input class="search-input" placeholder="Search services…"
               value="${esc(q)}" oninput="App.searchBizSvc('${esc(cat)}','${esc(biz)}',this.value)" />
      </div>
    </div>
    ${grid}
  </div>`;
}

function serviceCard(s) {
  const bs = bizStyle(s.business);
  const cs = catStyle(s.category);
  return `
  <a class="service-card" href="#/service/${s.id}">
    <div class="cover" style="background:${cs.grad}">
      <span class="cat">${esc(s.category)}</span>
      <span class="big-ico">${cs.icon.replace('20"', '26"')}</span>
    </div>
    <div class="body">
      <div class="biz"><span class="avatar-logo" style="width:20px;height:20px;border-radius:7px;font-size:10px;background:${bs.grad}">${bs.initial}</span>${esc(s.business)}</div>
      <h3>${esc(s.name)}</h3>
      <div class="desc">${esc(s.desc)}</div>
      <div class="foot">
        <span class="price">${money(s.price)}</span>
        <span class="dur">${I.clock.replace('18"', '12"')} ${minutesLabel(s.duration)}</span>
      </div>
    </div>
  </a>`;
}

/* ---------------- Service detail + booking ---------------- */
function viewService(id) {
  const s = byId(id);
  if (!s) return viewNotFound();
  const bs = bizStyle(s.business);
  const cs = catStyle(s.category);

  return `
  <div class="page container">
    <button class="back-link" onclick="App.go('#/browse?cat=${encodeURIComponent(s.category)}&biz=${encodeURIComponent(s.business)}')">${I.arrowLeft} ${esc(s.business)}</button>
    <div class="detail-grid">
      <div>
        <div class="detail-cover" style="background:${cs.grad}">
          <span class="big-ico">${cs.icon.replace('20"', '30"')}</span>
        </div>
        <div class="detail-meta">
          <span class="meta-chip">${I.clock} <strong>${minutesLabel(s.duration)}</strong></span>
          <span class="meta-chip">${I.wallet} <strong>${money(s.price)}</strong></span>
          <span class="meta-chip" style="background:${cs.grad};color:#fff">${esc(s.category)}</span>
        </div>
        <h1>${esc(s.name)}</h1>
        <p class="detail-desc">${esc(s.desc)}</p>
        <div class="prov-row">
          <span class="avatar-logo" style="background:${bs.grad}">${bs.initial}</span>
          <div><b>${esc(s.business)}</b><span>${esc(s.category)} · Verified provider</span></div>
          ${I.shield}
        </div>
      </div>
      <div>
        <div class="booking-panel card" style="padding:24px">
          <h2 style="font-size:18px;font-weight:800;color:var(--stone-900);margin-bottom:4px">Pick a date &amp; time</h2>
          <p class="sm" style="margin-bottom:16px">Bookings appear inside the provider's working hours.</p>
          ${bookingPanel(s)}
        </div>
      </div>
    </div>
  </div>`;
}

function bookingPanel(s) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const days = [];
  for (let i = 0; i < 14; i++) {
    const d = addDays(today, i);
    days.push({ d, iso: iso(d), dow: d.getDay(), num: d.getDate(), mon: d.toLocaleString('en-US', { month: 'short' }) });
  }
  const selDate = currentSelDate();
  const selTime = sessionStorage.getItem('ae_sel_time') || '';
  const savedName = sessionStorage.getItem('ae_customer_name');
  const customerName = savedName !== null ? savedName : (state.user && state.user.name ? state.user.name : '');

  const chips = days.map(d => {
    const disabled = timeslots(d.dow, d.iso, s.duration).length === 0;
    const sel = d.iso === selDate;
    return `<button class="day-chip ${sel ? 'sel' : ''} ${disabled ? 'disabled' : ''}"
      onclick="App.pickDate('${d.iso}')">
      <div class="d">${DAY_NAMES[d.dow]}</div>
      <div class="n">${d.num}</div>
      <div class="m">${d.mon}</div>
    </button>`;
  }).join('');

  const slots = timeslots(fromISO(selDate).getDay(), selDate, s.duration);
  const slotBtns = slots.length ? slots.map(t => {
    const st = slotState(selDate, t, fromISO(selDate).getDay(), s.business);
    const sel = t === selTime;
    if (st === 'booked') return `<div class="time-slot booked">${fmtTime(t)}</div>`;
    if (st === 'past') return `<div class="time-slot past-slot">${fmtTime(t)}</div>`;
    return `<button class="time-slot ${sel ? 'sel' : ''}" onclick="App.pickTime('${t}')">${fmtTime(t)}</button>`;
  }).join('') : '<div class="sm center" style="grid-column:1/-1;padding:18px 0">No available slots on this day. Try another date.</div>';

  return `
    <div class="days-row">${chips}</div>
    <button class="btn btn-ghost btn-sm" style="margin-top:10px;color:var(--sage-deep)" onclick="App.nextAvailable()">${I.zap} Next available</button>
    <div class="slot-grid">${slotBtns}</div>
    <div class="field mt-2">
      <label for="customerName">Your name</label>
      <input id="customerName" type="text" placeholder="How should the provider address you?" maxlength="80" value="${esc(customerName)}" oninput="App.onCustomerName(this)" />
    </div>
    <div class="field">
      <label for="notes">Notes (optional)</label>
      <textarea id="notes" placeholder="Anything the provider should know…" maxlength="200"></textarea>
    </div>
    <div class="order-summary">
      <div class="row"><span>Service</span><span>${esc(s.name)}</span></div>
      <div class="row"><span>Duration</span><span>${minutesLabel(s.duration)}</span></div>
      ${selDate && selTime ? `<div class="row"><span>When</span><b>${fmtLong(selDate, selTime)}</b></div>` : ''}
      <div class="row total"><span>Total</span><span>${money(s.price)}</span></div>
    </div>
    <button class="btn btn-primary btn-lg btn-block mt-3" ${selTime && customerName ? '' : 'disabled'}
      onclick="App.confirmBooking('${s.id}')">Confirm booking ${I.arrowRight}</button>
    <p class="sm center mt-1">No payment taken today — just lock in your slot.</p>
  `;
}

function viewConfirmed() {
  const b = sessionStorage.getItem('ae_last_booking');
  let inner = '<p class="sm">Your appointment was booked.</p>';
  if (b) {
    const d = JSON.parse(b);
    inner = `
      <div class="confirm-detail">
        <div class="row"><span>Service</span><b>${esc(d.serviceName)}</b></div>
        <div class="row"><span>Provider</span><b>${esc(d.business)}</b></div>
        <div class="row"><span>When</span><b>${fmtLong(d.date, d.time)}</b></div>
        <div class="row"><span>Duration</span><b>${minutesLabel(d.duration)}</b></div>
        <div class="row"><span>Total</span><b>${money(d.price)}</b></div>
      </div>`;
  }
  return `
  <div class="page container">
    <div class="confirm-card card">
      <div class="check">${I.checkBig}</div>
      <h2>Booking confirmed</h2>
      <p>You're all set. We've added it to your appointments and notified the provider.</p>
      ${inner}
      <div class="hero-cta" style="justify-content:center;margin-top:24px">
        <button class="btn btn-primary" onclick="App.go('#/appointments')">View my appointments</button>
        <button class="btn btn-outline" onclick="App.go('#/browse')">Keep browsing</button>
      </div>
    </div>
  </div>`;
}

/* ---------------- Provider onboarding ---------------
   Phase 2 of 3: business details (name + owner).
   Phase 1 = email/oauth sign-in; Phase 3 = products & prefs in the dashboard. */
function viewOnboard() {
  const u = state.user || {};
  const prepName = sessionStorage.getItem('ae_pending_google_name') || '';
  const greetName = u.name || prepName || '';
  return `
  <div class="page container" style="max-width:620px">
    <div class="stepper" style="margin-bottom:26px;max-width:460px">
      <div class="step done"><span class="dot">1</span><small>Account</small></div>
      <div class="step-line"></div>
      <div class="step active"><span class="dot">2</span><small>Business details</small></div>
      <div class="step-line"></div>
      <div class="step"><span class="dot">3</span><small>Products & setup</small></div>
    </div>
    <div class="page-head center" style="text-align:center;margin-bottom:26px">
      <span class="badge-pill">${I.layout.replace('18"','14"')} Welcome, ${esc(greetName)}!</span>
      <h1>Set up your business</h1>
      <p>Tell us the name of your business and how to address you.</p>
    </div>
    <form onsubmit="App.onboardSetupBusiness(event)">
      <div class="card" style="padding:22px;margin-bottom:14px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
          <span style="width:32px;height:32px;border-radius:10px;background:var(--terracotta-soft);color:var(--terracotta);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800">1</span>
          <h3 style="font-size:15px;font-weight:700;color:var(--stone-900);margin:0">Business details</h3>
        </div>
        <div class="field">
          <label for="obz-name">Your full name</label>
          <input id="obz-name" name="name" type="text" placeholder="Alex Morgan" value="${esc(u.name || '')}" required />
        </div>
        <div class="field">
          <label for="obz-business">Business name</label>
          <input id="obz-business" name="business" type="text" placeholder="e.g. Riverside Barbershop" required />
          <div class="hint">Shown to customers on your booking page.</div>
        </div>
        <div class="field">
          <label for="obz-category">Business category</label>
          <select id="obz-category" name="category" required>
            ${categoryOptions()}
          </select>
          <div class="hint">Pick the category that best describes your business.</div>
        </div>
      </div>
      <div class="card" style="padding:22px;margin-bottom:14px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
          <span style="width:32px;height:32px;border-radius:10px;background:var(--sage-soft);color:var(--sage-deep);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800">2</span>
          <h3 style="font-size:15px;font-weight:700;color:var(--stone-900);margin:0">Address details</h3>
        </div>
        <div class="field">
          <label for="obz-street_address">Street address</label>
          <input id="obz-street_address" name="street_address" type="text" placeholder="123 Main St" />
        </div>
        <div style="display:flex;gap:12px">
          <div class="field" style="flex:1">
            <label for="obz-city">City</label>
            <input id="obz-city" name="city" type="text" placeholder="City" />
          </div>
          <div class="field" style="flex:0 0 120px">
            <label for="obz-zip_code">ZIP code</label>
            <input id="obz-zip_code" name="zip_code" type="text" placeholder="12345" />
          </div>
        </div>
        <div class="hint" style="margin-top:-10px">For Google Maps directions on your booking page.</div>
      </div>
      <div class="card" style="padding:22px;margin-bottom:14px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
          <span style="width:32px;height:32px;border-radius:10px;background:#F0EDFB;color:#6D5ACF;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800">3</span>
          <h3 style="font-size:15px;font-weight:700;color:var(--stone-900);margin:0">First service</h3>
        </div>
        ${defaultServiceFields()}
      </div>
      <div class="card" style="padding:22px;margin-bottom:18px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
          <span style="width:32px;height:32px;border-radius:10px;background:var(--cream);color:var(--stone-700);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800">4</span>
          <h3 style="font-size:15px;font-weight:700;color:var(--stone-900);margin:0">Account details</h3>
        </div>
        <div class="field">
          <label for="obz-email">Email</label>
          <input id="obz-email" type="email" value="${esc(u.email || '')}" disabled style="background:var(--stone-100);color:var(--stone-500)" />
          <div class="hint">Signed in with Google. Your account is linked to this email.</div>
        </div>
      </div>
      <button class="btn btn-primary btn-lg btn-block" type="submit">Continue to dashboard ${I.arrowRight}</button>
    </form>
  </div>`;
}

/* ---------------- Forgot / Reset Password ---------------- */
function viewForgotPassword() {
  return `
  <div class="page container">
    <div class="card form-card" style="padding:34px">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:6px">
        <span class="avatar-logo" style="width:46px;height:46px;border-radius:14px;background:var(--sage);color:#fff;font-size:18px">${I.shield.replace('18"','22"')}</span>
        <div><h1 style="font-size:21px;font-weight:800;color:var(--stone-900)">Forgot password?</h1></div>
      </div>
      <p class="sm" style="margin-bottom:22px">Enter your email address and we'll send you a reset link.</p>
      <form onsubmit="App.doForgotPassword(event)">
        <div class="field">
          <label for="fp-email">Email</label>
          <input id="fp-email" name="email" type="email" placeholder="you@example.com" required />
        </div>
        <button class="btn btn-primary btn-lg btn-block" type="submit">Send reset link</button>
      </form>
      <p class="sm center mt-2"><a href="#" onclick="App.go('#/account');return false;">Back to sign in</a></p>
    </div>
  </div>`;
}

function viewResetPassword() {
  return `
  <div class="page container">
    <div class="card form-card" style="padding:34px">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:6px">
        <span class="avatar-logo" style="width:46px;height:46px;border-radius:14px;background:var(--sage);color:#fff;font-size:18px">${I.shield.replace('18"','22"')}</span>
        <div><h1 style="font-size:21px;font-weight:800;color:var(--stone-900)">Reset password</h1></div>
      </div>
      <p class="sm" style="margin-bottom:22px">Paste your reset token and choose a new password.</p>
      <form onsubmit="App.doResetPassword(event)">
        <div class="field">
          <label for="rp-token">Reset token</label>
          <input id="rp-token" name="token" type="text" placeholder="Paste your reset token" required />
        </div>
        <div class="field">
          <label for="rp-new">New password</label>
          <input id="rp-new" name="newPassword" type="password" minlength="8" placeholder="At least 8 characters" required />
        </div>
        <div class="field">
          <label for="rp-confirm">Confirm password</label>
          <input id="rp-confirm" name="confirm" type="password" minlength="8" placeholder="Repeat your password" required />
        </div>
        <button class="btn btn-primary btn-lg btn-block" type="submit">Reset password</button>
      </form>
      <p class="sm center mt-2"><a href="#" onclick="App.go('#/account');return false;">Back to sign in</a></p>
    </div>
  </div>`;
}

/* ---------------- OAuth Complete ---------------- */
function viewOAuthComplete() {
  // This view is reached after the backend redirects from Google OAuth. The
  // account is NOT created yet — it is finalized below, so a cancelled flow
  // never leaves a Gmail account behind.
  (async () => {
    try {
      const s = await apiClient.googleSignupStatus();
      if (!s.pending) {
        toast('Google sign-in did not complete.');
        App.go('#/account');
        return;
      }
      if (s.handler === 'provider') {
        if (s.existing) {
          const res = await apiClient.googleConfirm();
          state.user = res.user;
          if (res.businessName) state.businessName = res.businessName;
          if (res.businessCategory) state.businessCategory = res.businessCategory;
          persist();
          toast('Signed in with Google, ' + res.user.name.split(' ')[0] + '!');
          App.go('#/provider');
        } else {
          // New provider: create the account only when onboarding finishes.
          sessionStorage.setItem('ae_pending_google_name', s.name || '');
          // Provisional user so the onboarding view renders; the real account
          // is created by the business-setup call, which returns the real user.
          state.user = { name: s.name || '', email: s.email || '', role: 'provider' };
          persist();
          App.go('#/onboard');
        }
      } else {
        const res = await apiClient.googleConfirm();
        state.user = res.user;
        persist();
        toast('Signed in with Google, ' + res.user.name.split(' ')[0] + '!');
        App.go('#/browse');
      }
    } catch {
      const params = new URLSearchParams(location.hash.split('?')[1] || '');
      const err = params.get('error');
      if (err === 'oauth_email_taken') {
        toast('This email is already linked to an existing HairNet account. Please sign in with that account instead.');
      } else {
        toast('Google sign-in failed.' + (err ? ' (' + err + ')' : ''));
      }
      App.go('#/account');
    }
  })();
  return `
  <div class="page container" style="text-align:center;padding:80px 20px">
    <div class="spinner" style="margin:0 auto"></div>
    <p class="sm mt-2">Signing you in with Google…</p>
  </div>`;
}

/* ---------------- Account ---------------- */
function viewAccount() {
  if (state.user) {
    const u = state.user;
    return `
    <div class="page container" style="max-width:520px;margin:0 auto">
      <div class="card form-card" style="padding:34px;text-align:center">
        <span class="avatar" style="width:64px;height:64px;font-size:22px;margin:0 auto 16px;border-radius:50%;background:var(--navy);color:#fff;display:flex;align-items:center;justify-content:center">${esc(u.name.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase())}</span>
        <h1 style="font-size:22px;font-weight:800;color:var(--stone-900)">${esc(u.name)}</h1>
        <p class="sm mt-1">${esc(u.email)}</p>
        <p class="sm mt-1" style="font-weight:600;color:var(--stone-700)">${u.role === 'provider' ? 'Business: ' + esc(state.businessName) : ''}</p>
        <span class="status ${u.role === 'provider' ? 'status-confirmed' : 'status-pending'}" style="margin-top:12px">${u.role === 'provider' ? 'Business account' : 'Customer account'}</span>
        <div class="hero-cta" style="justify-content:center;margin-top:22px">
          <button class="btn btn-danger" onclick="App.signOut()">Sign out</button>
        </div>
      </div>

      <div class="card form-card" style="padding:34px;margin-top:20px">
        <h2 style="font-size:18px;font-weight:800;color:var(--stone-900);margin-bottom:16px">Change password</h2>
        <form onsubmit="App.changePassword(event)">
          <div class="field">
            <label for="cur-pw">Current password</label>
            <input id="cur-pw" name="current" type="password" minlength="8" placeholder="Your current password" required />
          </div>
          <div class="field">
            <label for="new-pw">New password</label>
            <input id="new-pw" name="newPw" type="password" minlength="8" placeholder="At least 8 characters" required />
          </div>
          <div class="field">
            <label for="confirm-pw">Confirm new password</label>
            <input id="confirm-pw" name="confirm" type="password" minlength="8" placeholder="Repeat new password" required />
          </div>
          <button class="btn btn-primary btn-lg btn-block" type="submit">Update password</button>
        </form>
      </div>

      <div class="card form-card" style="padding:34px;margin-top:20px;border:1px solid var(--danger-soft)">
        <h2 style="font-size:18px;font-weight:800;color:var(--stone-900);margin-bottom:8px">Delete account</h2>
        <p class="sm" style="margin-bottom:16px;color:var(--stone-600)">Permanently remove your account and all associated data. This cannot be undone.</p>
        <button class="btn btn-danger btn-block" onclick="App.confirmDeleteAccount()">Delete my account</button>
      </div>
    </div>`;
  }

  return `
  <div class="page container">
    <div class="page-head center" style="max-width:520px;margin:0 auto 28px;text-align:center">
      <span class="badge-pill">Welcome to HairNet</span>
      <h1>Pick how you'd like to use HairNet</h1>
      <p>Sign in to book or manage appointments.</p>
    </div>
    <div class="role-grid" style="max-width:640px;margin:0 auto">
      <button class="role-card" onclick="App.chooseRole('customer')">
        <span class="r-ico" style="background:var(--sage-soft);color:var(--sage-deep)">${I.calendar}</span>
        <h3>I'm booking</h3>
        <p>Browse trusted services and book appointments in seconds, any time.</p>
        <span class="go">Continue ${I.chevRight}</span>
      </button>
      <button class="role-card" onclick="App.chooseRole('provider')">
        <span class="r-ico" style="background:var(--terracotta-soft);color:var(--terracotta-hover)">${I.layout}</span>
        <h3>I run a business</h3>
        <p>Manage your services, hours and bookings from one calm dashboard.</p>
        <span class="go">Continue ${I.chevRight}</span>
      </button>
    </div>
    <div class="card" style="margin-top:26px;max-width:640px;margin-left:auto;margin-right:auto;padding:22px;text-align:center">
      <p class="sm" style="font-weight:700;color:var(--stone-700)">Already have a business on HairNet?</p>
      <button class="btn btn-outline mt-1" onclick="App.go('#/business/signin')">Sign in to your business</button>
    </div>
  </div>`;
}

function signInForm(role, mode) {
  const isCreate = mode !== 'login';
  const heading = role === 'provider'
    ? (isCreate ? 'Create my business' : 'Sign in to your business')
    : (isCreate ? 'Create account' : 'Sign in');
  const sub = role === 'provider'
    ? (isCreate ? 'Set up your business page — add a business name, then publish your first service.'
        : 'Welcome back — sign in with your business password.')
    : (isCreate ? 'Create an account to book and manage appointments.'
        : 'Welcome back — sign in to manage your bookings.');
  const tabs = role === 'customer' ? `
    <div class="tabs" style="margin-bottom:20px">
      <button class="tab ${!isCreate ? 'active' : ''}" onclick="App.setAuthMode('customer','login')">Sign in</button>
      <button class="tab ${isCreate ? 'active' : ''}" onclick="App.setAuthMode('customer','create')">Create account</button>
    </div>` : '';
  return `
  <div class="page container">
    <button class="back-link" onclick="App.go('#/account')">${I.arrowLeft} Change how I'm joining</button>
    <div class="card form-card" style="padding:34px">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:6px">
        <span class="avatar-logo" style="width:46px;height:46px;border-radius:14px;background:${role === 'provider' ? 'var(--terracotta)' : 'var(--sage)'};color:#fff;font-size:18px">${role === 'provider' ? I.layout.replace('18"','22"') : I.calendar.replace('18"','22"')}</span>
        <div><h1 style="font-size:21px;font-weight:800;color:var(--stone-900)">${role === 'provider' ? 'For businesses' : 'Welcome to HairNet'}</h1></div>
      </div>
      <p class="sm" style="margin-bottom:22px">${sub}</p>
      ${tabs}
      <form onsubmit="${isCreate ? 'App.doSignUp(event)' : 'App.doLogin(event)'}">
        <input type="hidden" name="role" value="${role}">
        ${isCreate ? `
        <div class="field">
          <label for="name">Full name</label>
          <input id="name" name="name" type="text" placeholder="Alex Morgan" required />
        </div>
        ${role === 'provider' ? `
        <div class="field">
          <label for="business">Business name</label>
          <input id="business" name="business" type="text" placeholder="e.g. Riverside Barbershop" required />
          <div class="hint">Shown to customers on your booking page.</div>
        </div>
        <div class="field">
          <label for="category">Business category</label>
          <select id="category" name="category" required>
            ${categoryOptions()}
          </select>
        </div>
        ${defaultServiceFields()}` : ''}` : ''}
        <div class="field">
          <label for="email">Email</label>
          <input id="email" name="email" type="email" placeholder="you@example.com" required />
        </div>
        <div class="field">
          <label for="password">Password</label>
          <input id="password" name="password" type="password" minlength="8" placeholder="At least 8 characters" required />
          ${!isCreate ? '<div class="hint"><a href="#" onclick="App.go(\'#/forgot-password\');return false;">Forgot password?</a></div>' : ''}
        </div>
        ${isCreate ? `
        <div class="field">
          <label for="confirm">Confirm password</label>
          <input id="confirm" name="confirm" type="password" minlength="8" placeholder="Repeat your password" required />
        </div>` : ''}
        <button class="btn btn-primary btn-lg btn-block" type="submit">${heading}</button>
        ${role === 'customer' ? `
        <div style="display:flex;align-items:center;gap:12px;margin:18px 0">
          <div style="flex:1;height:1px;background:var(--stone-200)"></div>
          <span class="sm" style="font-weight:600;color:var(--stone-400)">or</span>
          <div style="flex:1;height:1px;background:var(--stone-200)"></div>
        </div>
        <button class="btn btn-outline btn-lg btn-block" type="button" onclick="App.googleSignIn()" style="gap:10px">
          <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Sign in with Google
        </button>` : ''}
        ${role === 'provider' ? `
        <p class="sm center mt-2"><a href="#" onclick="App.businessSignIn();return false;">Already have a business? Sign in instead</a></p>` : ''}
      </form>
    </div>
  </div>`;
}

function businessSignInForm() {
  const names = [...new Set([
    ...state.businesses.map(b => b.name),
    ...state.services.map(s => s.business).filter(Boolean),
  ].filter(Boolean))];
  if (state.businessName && !names.includes(state.businessName)) names.push(state.businessName);
  names.sort();
  const opts = names.map(n => `<option value="${esc(n)}">${esc(n)}</option>`).join('');
  return `
  <div class="page container">
    <button class="back-link" onclick="App.go('#/business')">${I.arrowLeft} Business sign-in options</button>
    <div class="card form-card" style="padding:34px">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:6px">
        <span class="avatar-logo" style="width:46px;height:46px;border-radius:14px;background:var(--terracotta);color:#fff;font-size:18px">${I.layout.replace('18"','22"')}</span>
        <div><h1 style="font-size:21px;font-weight:800;color:var(--stone-900)">Business sign in</h1></div>
      </div>
      <p class="sm" style="margin-bottom:22px">View and manage your appointments. Pick your business and enter its password.</p>
      <form onsubmit="App.doBusinessSignIn(event)">
        <div class="field">
          <label for="biz-which">Your business</label>
          <select id="biz-which" name="business" required>
            ${opts}
          </select>
          <div class="hint">Choose a business already listed on HairNet.</div>
        </div>
        <div class="field">
          <label for="name">Full name</label>
          <input id="name" name="name" type="text" placeholder="Alex Morgan" required />
        </div>
        <div class="field">
          <label for="email">Email</label>
          <input id="email" name="email" type="email" placeholder="you@example.com" required />
        </div>
        <div class="field">
          <label for="password">Business password</label>
          <input id="password" name="password" type="password" minlength="8" placeholder="Your business password" required />
          <div class="hint"><a href="#" onclick="App.go('#/business/forgot-password');return false;">Forgot business password?</a></div>
        </div>
        <button class="btn btn-primary btn-lg btn-block" type="submit">Sign in to dashboard</button>
      </form>
    </div>
  </div>`;
}

/* ---------------- Business auth (create / sign in) ---------------- */
function viewBusinessAuth() {
  if (state.user && state.user.role === 'provider') {
    return `
    <div class="page container" style="max-width:520px;margin:0 auto">
      <div class="card form-card" style="padding:34px;text-align:center">
        <span class="avatar-logo" style="width:56px;height:56px;border-radius:16px;background:var(--terracotta);color:#fff;font-size:20px;margin:0 auto 14px;display:flex;align-items:center;justify-content:center">${I.layout.replace('18"','24"')}</span>
        <h1 style="font-size:22px;font-weight:800;color:var(--stone-900)">${esc(state.businessName)}</h1>
        <p class="sm mt-1">You're already signed in to this business.</p>
        <div class="hero-cta" style="justify-content:center;margin-top:22px">
          <button class="btn btn-primary" onclick="App.go('#/provider')">Open dashboard ${I.chevRight}</button>
          <button class="btn btn-ghost" onclick="App.signOut()">Sign out</button>
        </div>
      </div>
    </div>`;
  }
  const subHash = parseHash().id;
  if (subHash === 'forgot-password') {
    return viewBusinessForgotPasswordForm();
  }
  if (subHash === 'reset-password') {
    return viewBusinessResetPasswordForm();
  }

  const isCreate = subHash === 'create';
  const heading = isCreate ? 'List your business on HairNet' : 'Sign in to your business';
  const sub = isCreate
    ? 'Create a free business account — publish services, set your hours and manage bookings from one dashboard.'
    : 'Welcome back. Sign in with your email and password to open your dashboard.';
  const tabs = `
    <div class="tabs" style="margin-bottom:20px">
      <button class="tab ${!isCreate ? 'active' : ''}" onclick="App.go('#/business/signin')">Sign in</button>
      <button class="tab ${isCreate ? 'active' : ''}" onclick="App.go('#/business/create')">Create account</button>
    </div>`;
  const googleDivider = `
      <button class="btn btn-outline btn-lg btn-block" type="button" onclick="App.googleSignIn('provider')" style="gap:10px;margin-bottom:18px">
        <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
        ${isCreate ? 'Create with Google' : 'Sign in with Google'}
      </button>
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px">
        <div style="flex:1;height:1px;background:var(--stone-200)"></div>
        <span class="sm" style="font-weight:600;color:var(--stone-400)">or</span>
        <div style="flex:1;height:1px;background:var(--stone-200)"></div>
      </div>`;
  return `
  <div class="page container">
    <button class="back-link" onclick="App.go('#/account')">${I.arrowLeft} All sign-in options</button>
    <div class="card form-card" style="padding:34px">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:6px">
        <span class="avatar-logo" style="width:46px;height:46px;border-radius:14px;background:var(--terracotta);color:#fff;font-size:18px">${I.layout.replace('18"','22"')}</span>
        <div><h1 style="font-size:21px;font-weight:800;color:var(--stone-900)">${heading}</h1></div>
      </div>
      ${state.user ? `<p class="hint" style="margin-bottom:10px">You're signed in as a customer (${esc(state.user.email)}). Sign out first to use a business account.</p>` : ''}
      <p class="sm" style="margin-bottom:22px">${sub}</p>
      ${tabs}
      ${googleDivider}
      <form onsubmit="${isCreate ? 'App.doSignUp(event)' : 'App.doLogin(event)'}">
        <input type="hidden" name="role" value="provider">
        ${isCreate ? `
        <div class="card" style="padding:22px;margin-bottom:14px">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
            <span style="width:32px;height:32px;border-radius:10px;background:var(--terracotta-soft);color:var(--terracotta);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800">1</span>
            <h3 style="font-size:15px;font-weight:700;color:var(--stone-900);margin:0">Business details</h3>
          </div>
          <div class="field">
            <label for="name">Your full name</label>
            <input id="name" name="name" type="text" placeholder="Alex Morgan" required />
          </div>
          <div class="field">
            <label for="business">Business name</label>
            <input id="business" name="business" type="text" placeholder="e.g. Riverside Barbershop" required />
            <div class="hint">Shown to customers on your booking page.</div>
          </div>
          <div class="field">
            <label for="category">Business category</label>
            <select id="category" name="category" required>
              ${categoryOptions()}
            </select>
          </div>
        </div>
        <div class="card" style="padding:22px;margin-bottom:14px">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
            <span style="width:32px;height:32px;border-radius:10px;background:var(--sage-soft);color:var(--sage-deep);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800">2</span>
            <h3 style="font-size:15px;font-weight:700;color:var(--stone-900);margin:0">Address details</h3>
          </div>
          <div class="field">
            <label for="street_address">Street address</label>
            <input id="street_address" name="street_address" type="text" placeholder="123 Main St" />
          </div>
          <div style="display:flex;gap:12px">
            <div class="field" style="flex:1">
              <label for="city">City</label>
              <input id="city" name="city" type="text" placeholder="City" />
            </div>
            <div class="field" style="flex:0 0 120px">
              <label for="zip_code">ZIP code</label>
              <input id="zip_code" name="zip_code" type="text" placeholder="12345" />
            </div>
          </div>
          <div class="hint" style="margin-top:-10px">For Google Maps directions on your booking page.</div>
        </div>
        <div class="card" style="padding:22px;margin-bottom:14px">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
            <span style="width:32px;height:32px;border-radius:10px;background:#F0EDFB;color:#6D5ACF;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800">3</span>
            <h3 style="font-size:15px;font-weight:700;color:var(--stone-900);margin:0">First service</h3>
          </div>
          ${defaultServiceFields()}
        </div>
        <div class="card" style="padding:22px;margin-bottom:18px">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
            <span style="width:32px;height:32px;border-radius:10px;background:var(--cream);color:var(--stone-700);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800">4</span>
            <h3 style="font-size:15px;font-weight:700;color:var(--stone-900);margin:0">Account details</h3>
          </div>
          <div class="field">
            <label for="email">Work email</label>
            <input id="email" name="email" type="email" placeholder="you@yourbusiness.com" required />
          </div>
          <div class="field">
            <label for="password">Password</label>
            <input id="password" name="password" type="password" minlength="8" placeholder="At least 8 characters" required />
          </div>
          <div class="field">
            <label for="confirm">Confirm password</label>
            <input id="confirm" name="confirm" type="password" minlength="8" placeholder="Repeat your password" required />
          </div>
        </div>` : ''}
        ${!isCreate ? `
        <div class="field">
          <label for="email">Work email</label>
          <input id="email" name="email" type="email" placeholder="you@yourbusiness.com" required />
        </div>
        <div class="field">
          <label for="password">Password</label>
          <input id="password" name="password" type="password" minlength="8" placeholder="At least 8 characters" required />
          <div class="hint"><a href="#" onclick="App.go(\'#/business/forgot-password\');return false;">Forgot password?</a></div>
        </div>` : ''}
        <button class="btn btn-primary btn-lg btn-block" type="submit">${isCreate ? 'Create business account' : 'Sign in to dashboard'}</button>
      </form>
      <p class="sm center mt-2"><a href="#" onclick="App.businessSignIn();return false;">Sign in with a shared business password instead</a></p>
    </div>
  </div>`;
}

function viewBusinessForgotPasswordForm() {
  return `
  <div class="page container">
    <button class="back-link" onclick="App.go('#/business/signin')">${I.arrowLeft} Back to sign in</button>
    <div class="card form-card" style="padding:34px">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:6px">
        <span class="avatar-logo" style="width:46px;height:46px;border-radius:14px;background:var(--terracotta);color:#fff;font-size:18px">${I.layout.replace('18"','22"')}</span>
        <div><h1 style="font-size:21px;font-weight:800;color:var(--stone-900)">Forgot business password?</h1></div>
      </div>
      <p class="sm" style="margin-bottom:22px">Enter your business name and we'll generate a reset token for you.</p>
      <form onsubmit="App.doBusinessForgotPassword(event)">
        <div class="field">
          <label for="bz-fp-biz">Business name</label>
          <input id="bz-fp-biz" name="business" type="text" placeholder="e.g. Riverside Barbershop" required />
        </div>
        <button class="btn btn-primary btn-lg btn-block" type="submit">Get reset token</button>
      </form>
      <p class="sm center mt-2"><a href="#" onclick="App.go('#/business/signin');return false;">Back to sign in</a></p>
    </div>
  </div>`;
}

function viewBusinessResetPasswordForm() {
  return `
  <div class="page container">
    <button class="back-link" onclick="App.go('#/business/signin')">${I.arrowLeft} Back to sign in</button>
    <div class="card form-card" style="padding:34px">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:6px">
        <span class="avatar-logo" style="width:46px;height:46px;border-radius:14px;background:var(--terracotta);color:#fff;font-size:18px">${I.layout.replace('18"','22"')}</span>
        <div><h1 style="font-size:21px;font-weight:800;color:var(--stone-900)">Reset business password</h1></div>
      </div>
      <p class="sm" style="margin-bottom:22px">Paste your reset token and choose a new business password.</p>
      <form onsubmit="App.doBusinessResetPassword(event)">
        <div class="field">
          <label for="bz-rp-token">Reset token</label>
          <input id="bz-rp-token" name="token" type="text" placeholder="Paste your reset token" required />
        </div>
        <div class="field">
          <label for="bz-rp-new">New password</label>
          <input id="bz-rp-new" name="newPassword" type="password" minlength="8" placeholder="At least 8 characters" required />
        </div>
        <div class="field">
          <label for="bz-rp-confirm">Confirm password</label>
          <input id="bz-rp-confirm" name="confirm" type="password" minlength="8" placeholder="Repeat your password" required />
        </div>
        <button class="btn btn-primary btn-lg btn-block" type="submit">Reset business password</button>
      </form>
    </div>
  </div>`;
}

/* ---------------- My appointments ---------------- */
function viewAppointments() {
  const list = state.appointments.slice().sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const upcoming = list.filter(a => a.status !== 'cancelled' && !isPast(a.date, a.time)).reverse();
  const past = list.filter(a => a.status === 'cancelled' || isPast(a.date, a.time)).reverse();

  const tab = sessionStorage.getItem('ae_appt_tab') || 'upcoming';
  const active = tab === 'upcoming' ? upcoming : past;
  const emptyMsg = tab === 'upcoming' ? 'No upcoming appointments.' : 'No past appointments yet.';

  const rows = active.length ? active.map(a => apptCard(a, tab === 'upcoming')).join('') :
    `<div class="empty-state card"><div class="big-ico">${I.calendar}</div><h3>${emptyMsg}</h3>
     <button class="btn btn-primary mt-2" onclick="App.go('#/browse')">Browse services</button></div>`;

  return `
  <div class="page container" style="max-width:760px">
    <div class="page-head">
      <h1>My Appointments</h1>
      <p>Manage upcoming and past bookings.</p>
    </div>
    <div class="tabs">
      <button class="tab ${tab === 'upcoming' ? 'active' : ''}" onclick="App.setApptTab('upcoming')">Upcoming (${upcoming.length})</button>
      <button class="tab ${tab === 'past' ? 'active' : ''}" onclick="App.setApptTab('past')">Past (${past.length})</button>
    </div>
    <div class="appt-list">${rows}</div>
  </div>`;
}

function apptCard(a, cancellable) {
  const bs = bizStyle(a.business);
  const cs = catStyle(a.category);
  const stCls = { pending: 'status-pending', confirmed: 'status-confirmed', cancelled: 'status-cancelled', completed: 'status-completed' }[a.status] || 'status-pending';
  return `
  <div class="appt-card card">
    <span class="avatar-logo" style="background:${cs.grad}">${cs.icon.replace('20"','22"')}</span>
    <div style="flex:1;min-width:180px">
      <div class="flex items-center gap-2" style="gap:8px;flex-wrap:wrap">
        <h3>${esc(a.serviceName)}</h3>
        <span class="status ${stCls}">${a.status}</span>
      </div>
      <div class="meta">
        ${I.calendar.replace('18"','13"')} ${fmtLong(a.date, a.time)}
        <span style="color:var(--stone-300)">·</span>
        <span style="display:inline-flex;align-items:center;gap:4px"><span class="avatar-logo" style="width:16px;height:16px;border-radius:5px;font-size:8px;background:${bs.grad}">${bs.initial}</span>${esc(a.business)}</span>
      </div>
      ${a.customerName ? `<div class="sm" style="margin-top:4px;font-weight:600;color:var(--stone-700)">${I.user.replace('18"','12"')} ${esc(a.customerName)}</div>` : ''}
      ${a.notes ? `<p class="sm" style="margin-top:6px">“${esc(a.notes)}”</p>` : ''}
    </div>
    <div style="text-align:right">
      <div class="price">${money(a.price)}</div>
      <div class="sm">${minutesLabel(a.duration)}</div>
    </div>
    ${cancellable && a.status !== 'cancelled' ? `<button class="btn btn-outline btn-sm" onclick="App.cancelAppt('${a.id}')">Cancel</button>` : ''}
  </div>`;
}

/* ---------------- Provider dashboard ---------------- */
function myAppointments() { return state.appointments.filter(a => a.business === state.businessName); }

function viewProvider(tab) {
  const valid = ['overview', 'appointments', 'services', 'hours'];
  const cur = valid.includes(tab) ? tab : 'overview';

  const tabs = [
    { id: 'overview', label: 'Overview', icon: I.layout },
    { id: 'appointments', label: 'Appointments', icon: I.calendar },
    { id: 'services', label: 'Services', icon: I.layers },
    { id: 'hours', label: 'Working hours', icon: I.clock },
  ].map(t => `<button class="tab ${cur === t.id ? 'active' : ''}" onclick="App.go('#/provider/${t.id}')">${t.icon} ${t.label}</button>`).join('');

  const body = {
    overview: dashOverview(),
    appointments: dashAppointments(),
    services: dashServices(),
    hours: dashHours(),
  }[cur];

  return `
  <div class="page container">
    <div class="page-head">
      <div class="flex items-center justify-between wrap gap-2">
        <div>
          <h1>${esc(state.businessName)}</h1>
          <p>${state.businessCategory ? esc(state.businessCategory) + ' — ' : ''}Manage your services, hours and bookings.</p>
        </div>
        <span class="meta-chip" style="background:var(--sage-soft);color:var(--sage-deep)">${esc(state.businessName)}</span>
      </div>
    </div>
    <div class="dash-wrap">
      <nav class="dash-nav"><div class="tabs">${tabs}</div></nav>
      <div>${body}</div>
    </div>
  </div>`;
}

function dashOverview() {
  const list = myAppointments();
  const active = list.filter(a => a.status !== 'cancelled');
  const revenue = list.filter(a => a.status === 'confirmed' || a.status === 'completed').reduce((s, a) => s + a.price, 0);
  const hrsSaved = active.reduce((s, a) => s + a.duration, 0);
  const upcoming = list.filter(a => a.status !== 'cancelled' && !isPast(a.date, a.time)).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).slice(0, 4);

  const stats = [
    { icon: I.wallet, color: 'background:var(--terracotta-soft);color:var(--terracotta-hover)', val: money(revenue), lbl: 'Revenue', sub: 'confirmed bookings' },
    { icon: I.calendar, color: 'background:var(--sage-soft);color:var(--sage-deep)', val: String(active.length), lbl: 'Total bookings', sub: 'this period' },
    { icon: I.zap, color: 'background:var(--cream);color:var(--navy)', val: hrsSaved + ' min', lbl: 'Hours saved', sub: 'for your customers' },
    { icon: I.layers, color: 'background:#F0EDFB;color:#6D5ACF', val: String(state.services.length), lbl: 'Active services', sub: 'across ' + new Set(state.services.map(s => s.category)).size + ' categories' },
  ];

  const recent = upcoming.length ? upcoming.map(a => `
    <div class="appt-card card" style="padding:14px 18px">
      <span class="avatar-logo" style="width:40px;height:40px;border-radius:12px;background:${catStyle(a.category).grad}">${catStyle(a.category).icon.replace('20"','18"')}</span>
      <div style="flex:1;min-width:0">
        <h3 style="font-size:14px">${esc(a.serviceName)}</h3>
        ${a.customerName ? `<div class="sm" style="font-size:12px;font-weight:600;color:var(--stone-600)">${I.user.replace('18"','12"')} ${esc(a.customerName)}</div>` : ''}
        <div class="meta" style="font-size:12px">${fmtLong(a.date, a.time)}</div>
      </div>
      <span class="status ${a.status === 'pending' ? 'status-pending' : 'status-confirmed'}">${a.status}</span>
    </div>`).join('')
    : `<div class="empty-state card"><div class="big-ico">${I.calendar}</div><h3>No upcoming bookings</h3><p>Share your booking page to get started.</p></div>`;

  return `
    <div class="stat-grid">
      ${stats.map(s => `
        <div class="stat-card card">
          <span class="s-ico" style="${s.color}">${s.icon}</span>
          <div class="s-val">${s.val}</div>
          <div class="s-lbl">${s.lbl}</div>
          <div class="s-sub" style="color:var(--stone-400)">${s.sub}</div>
        </div>`).join('')}
    </div>
    <div class="row-head"><div><h2>Upcoming bookings</h2><p>Latest appointments in your calendar.</p></div></div>
    <div class="appt-list">${recent}</div>
  `;
}

function fmtDay(dateStr) {
  const d = fromISO(dateStr);
  return DAY_NAMES[d.getDay()] + ', ' + d.toLocaleString('en-US', { month: 'short' }) + ' ' + d.getDate();
}

function calApptRow(a) {
  const stCls = a.status === 'pending' ? 'status-pending' : a.status === 'confirmed' ? 'status-confirmed' : 'status-cancelled';
  return `
  <div class="appt-card card">
    <span class="avatar-logo" style="background:${catStyle(a.category).grad}">${catStyle(a.category).icon.replace('20"','22"')}</span>
    <div style="flex:1;min-width:180px">
      <h3>${esc(a.serviceName)}</h3>
      <div class="meta">${I.clock.replace('18"','13"')} ${fmtTime(a.time)} · ${minutesLabel(a.duration)}</div>
      ${a.customerName ? `<p class="sm" style="margin-top:4px;font-weight:600;color:var(--stone-700)">${I.user.replace('18"','12"')} ${esc(a.customerName)}</p>` : ''}
      ${a.notes ? `<p class="sm" style="margin-top:6px">“${esc(a.notes)}”</p>` : ''}
    </div>
    <div style="text-align:right">
      <span class="status ${stCls}">${a.status}</span>
      <div class="price mt-1">${money(a.price)}</div>
    </div>
    ${a.status === 'pending' ? `
      <div class="flex gap-2" style="gap:8px">
        <button class="btn btn-sage btn-sm" ${a.customerName ? '' : 'disabled'} title="${a.customerName ? '' : 'Waiting for customer name'}" onclick="App.setStatus('${a.id}','confirmed')">${I.check} Confirm</button>
        <button class="btn btn-outline btn-sm" onclick="App.setStatus('${a.id}','cancelled')">Cancel</button>
      </div>` : ''}
  </div>`;
}

function dashAppointments() {
  const list = myAppointments();
  const today = iso(new Date());
  let sel = sessionStorage.getItem('ae_cal_date');
  if (!sel || !/^\d{4}-\d{2}-\d{2}$/.test(sel)) sel = today;
  const selDate = fromISO(sel);
  const year = selDate.getFullYear();
  const month = selDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = selDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const byDate = {};
  list.forEach(a => { (byDate[a.date] = byDate[a.date] || []).push(a); });

  const cells = [];
  for (let i = 0; i < new Date(year, month, 1).getDay(); i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
    cells.push(dateStr);
  }
  while (cells.length % 7) cells.push(null);

  const dayCells = cells.map(dateStr => {
    if (!dateStr) return '<span class="cal-day empty"></span>';
    const active = (byDate[dateStr] || []).filter(a => a.status !== 'cancelled').length;
    const cls = [
      'cal-day',
      dateStr === sel ? ' sel' : '',
      dateStr === today ? ' today' : '',
      dateStr < today ? ' past' : '',
    ].join('');
    return `<button class="${cls}" onclick="App.calDay('${dateStr}')">
      <span class="cal-num">${Number(dateStr.slice(8))}</span>
      ${active ? `<span class="cal-count">${active}</span>` : ''}
    </button>`;
  }).join('');

  const dayAppts = (byDate[sel] || []).slice().sort((a, b) => a.time.localeCompare(b.time));
  const details = dayAppts.length
    ? dayAppts.map(calApptRow).join('')
    : `<div class="empty-state card"><div class="big-ico">${I.calendar}</div><h3>No appointments on ${fmtDay(sel)}</h3></div>`;

  return `
    <div class="cal-wrap">
      <div class="cal-head">
        <button class="icon-btn" onclick="App.calPrev()" title="Previous month">${I.arrowLeft}</button>
        <h3>${monthName}</h3>
        <button class="icon-btn" onclick="App.calNext()" title="Next month">${I.arrowRight}</button>
      </div>
      <div class="cal-grid">
        ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => `<span class="cal-dow">${d}</span>`).join('')}
        ${dayCells}
      </div>
    </div>
    <div class="row-head" style="margin-top:24px"><div><h2>${fmtDay(sel)}</h2><p>${dayAppts.length ? dayAppts.length + ' appointment' + (dayAppts.length === 1 ? '' : 's') : 'Pick a day to see its appointments.'}</p></div></div>
    <div class="appt-list">${details}</div>
  `;
}

function dashServices() {
  const myBiz = (state.businessName || '').toLowerCase();
  const rows = state.services.filter(s => (s.business || '').toLowerCase() === myBiz).map(s => {
    const bs = bizStyle(s.business);
    return `
    <div class="svc-row card" style="border-radius:14px;margin-bottom:10px">
      <span class="avatar-logo" style="background:${catStyle(s.category).grad}">${catStyle(s.category).icon.replace('20"','20"')}</span>
      <div style="flex:1;min-width:0">
        <h3>${esc(s.name)}</h3>
        <div class="meta">${esc(s.business)} · ${esc(s.category)} · ${minutesLabel(s.duration)}</div>
      </div>
      <span class="price">${money(s.price)}</span>
      <div class="flex gap-2" style="gap:6px">
        <button class="icon-btn-sm" title="Edit" onclick="App.editService('${s.id}')">${I.pencil}</button>
        <button class="icon-btn-sm danger" title="Delete" onclick="App.deleteService('${s.id}')">${I.trash}</button>
      </div>
    </div>`;
  }).join('');

  return `
    <div class="row-head">
      <div><h2>Services</h2><p>${state.services.length} active — ${esc(state.businessName)}</p></div>
      <button class="btn btn-primary" onclick="App.addService()">${I.plus} Add service</button>
    </div>
    ${rows || `<div class="empty-state card"><div class="big-ico">${I.layers}</div><h3>Add your first service to start taking bookings.</h3><button class="btn btn-primary mt-2" onclick="App.addService()">Add service</button></div>`}
  `;
}

function dashHours() {
  const rows = DAY_ORDER.map(d => {
    const h = state.hours[d];
    const name = DAY_NAMES[d];
    const times = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'];
    const opt = sel => times.map(o => `<option value="${o}" ${h && h.open === o && sel === 'open' ? 'selected' : ''}>${fmtTime(o)}</option>`).join('');
    const closeOpts = times.map(o => `<option value="${o}" ${h && h.close === o ? 'selected' : ''}>${fmtTime(o)}</option>`).join('');
    return `
    <div class="day-row ${h ? '' : 'closed'}" data-day="${d}">
      <div class="day">${name}</div>
      <select data-role="open" ${h ? '' : 'disabled'}>${opt('open')}</select>
      <span style="color:var(--stone-400);font-size:13px;text-align:center">to</span>
      <select data-role="close" ${h ? '' : 'disabled'}>${closeOpts}</select>
      <button class="icon-btn-sm" data-role="toggle" style="${h ? '' : 'background:var(--cream)'}"
        onclick="App.toggleDay(${d})" title="${h ? 'Close this day' : 'Open this day'}">
        ${h ? I.check : I.plus}
      </button>
    </div>`;
  }).join('');

  return `
    <div class="row-head">
      <div><h2>Working hours</h2><p>Set the weekly hours you're available. Bookings only appear inside these windows.</p></div>
    </div>
    <div class="hours-card card" style="border-radius:16px">
      ${rows}
    </div>
    <div class="flex justify-between items-center mt-3">
      <p class="sm">Changes apply to new bookings immediately.</p>
      <button class="btn btn-navy" onclick="App.saveHours()">${I.check} Save hours</button>
    </div>`;
}

function viewNotFound() {
  return `<div class="page container center"><h1 style="font-size:26px;font-weight:800">Page not found</h1><p class="sm mt-1">That page doesn't exist.</p><button class="btn btn-primary mt-2" onclick="App.go('#/')">Go home</button></div>`;
}

/* ---------------- after render ---------------- */
function afterRender(view, id, tab) {
  if (view === 'service') {
    const notes = document.getElementById('notes');
    if (notes) {
      const saved = sessionStorage.getItem('ae_notes');
      if (saved) notes.value = saved;
      notes.addEventListener('input', () => sessionStorage.setItem('ae_notes', notes.value));
    }
  }
}

/* ============================================================
   ACTIONS (exposed on App)
   ============================================================ */
App.go = navigate;
App.search = function (v) {
  const base = '#/browse';
  const q = encodeURIComponent(v);
  const cat = new URLSearchParams(location.hash.split('?')[1] || '').get('cat') || 'All';
  const catStr = cat !== 'All' ? '?cat=' + encodeURIComponent(cat) + '&' : '?';
  history.replaceState(null, '', base + catStr + 'q=' + q);
  render();
};
App.searchBiz = function (cat, v) {
  history.replaceState(null, '', '#/browse?cat=' + encodeURIComponent(cat) + '&q=' + encodeURIComponent(v));
  render();
};
App.searchBizSvc = function (cat, biz, v) {
  history.replaceState(null, '', '#/browse?cat=' + encodeURIComponent(cat) + '&biz=' + encodeURIComponent(biz) + '&q=' + encodeURIComponent(v));
  render();
};
App.pickDate = function (d) { sessionStorage.setItem('ae_sel_date', d); sessionStorage.setItem('ae_sel_time', ''); render(); };
App.pickTime = function (t) { sessionStorage.setItem('ae_sel_time', t); render(); };
App.onCustomerName = function (input) {
  sessionStorage.setItem('ae_customer_name', input.value.trim());
  const btn = document.querySelector('.btn-primary.btn-block');
  if (btn) btn.disabled = !(input.value.trim() && sessionStorage.getItem('ae_sel_time'));
};
App.nextAvailable = function () {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const s = currentBookingService();
  for (let i = 0; i < 14; i++) {
    const d = addDays(today, i);
    if (timeslots(d.getDay(), iso(d), s && s.duration).length) {
      sessionStorage.setItem('ae_sel_date', iso(d));
      sessionStorage.setItem('ae_sel_time', '');
      render();
      return;
    }
  }
  toast('No availability in the next two weeks.');
};
function currentBookingService() {
  const { id } = parseHash();
  return id ? byId(id) : null;
}
function currentSelDate() {
  const stored = sessionStorage.getItem('ae_sel_date');
  if (stored) return stored;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const s = currentBookingService();
  for (let i = 0; i < 14; i++) {
    const d = addDays(today, i);
    if (timeslots(d.getDay(), iso(d), s && s.duration).length) return iso(d);
  }
  return iso(today);
}

App.confirmBooking = async function (id) {
  const s = byId(id);
  const date = currentSelDate();
  const time = sessionStorage.getItem('ae_sel_time');
  const notes = (document.getElementById('notes') && document.getElementById('notes').value) || sessionStorage.getItem('ae_notes') || '';
  const customerName = (document.getElementById('customerName') && document.getElementById('customerName').value.trim())
    || (state.user && state.user.name) || '';
  if (!state.user) { toast('Please sign in to book an appointment.'); App.go('#/account'); return; }
  if (!s || !time) { toast('Please pick a time slot first.'); return; }
  if (!customerName) { toast('Please add your name before booking.'); return; }
  if (slotState(date, time, fromISO(date).getDay(), s.business) !== 'available') { toast('That slot is no longer available — pick another.'); return; }
  const appt = {
    id: uid(), serviceId: s.id, business: s.business, serviceName: s.name, category: s.category,
    price: s.price, duration: s.duration, date, time, customerName,
    customerId: state.user.id, notes, status: 'pending', createdAt: Date.now(),
  };
  try {
    await apiClient.createAppointment(appt);
  } catch (err) {
    render();
    toast('Sorry, that slot is no longer available. Please pick another time.');
    return;
  }
  state.appointments.push(appt);
  persist();
  sessionStorage.setItem('ae_last_booking', JSON.stringify(appt));
  sessionStorage.setItem('ae_sel_time', '');
  App.go('#/confirmed');
};
App.cancelAppt = function (id) {
  openModal(`
    <div class="modal modal-head">
      <h2>Cancel this appointment?</h2>
      <p class="m-sub">This frees the slot for other customers. This can't be undone.</p>
      <div class="modal-actions">
        <button class="btn btn-ghost" onclick="App.closeModal()">Keep it</button>
        <button class="btn btn-danger" onclick="App.doCancel('${id}')">Cancel appointment</button>
      </div>
    </div>`);
};
App.doCancel = function (id) {
  const a = state.appointments.find(x => x.id === id);
  if (a) {
    a.status = 'cancelled';
    persist();
    syncToServer(apiClient.updateAppointment(id, { status: 'cancelled' }));
    toast('Appointment cancelled.');
  }
  App.closeModal(); render();
};
App.setStatus = function (id, status) {
  const a = state.appointments.find(x => x.id === id);
  if (a) {
    a.status = status;
    persist();
    syncToServer(apiClient.updateAppointment(id, { status }));
    toast(status === 'confirmed' ? 'Appointment confirmed.' : 'Appointment cancelled.');
  }
  render();
};
App.setApptTab = function (t) { sessionStorage.setItem('ae_appt_tab', t); render(); };
App.calDay = function (dateStr) { sessionStorage.setItem('ae_cal_date', dateStr); render(); };
function calMove(delta) {
  const cur = fromISO(sessionStorage.getItem('ae_cal_date') || iso(new Date()));
  const first = new Date(cur.getFullYear(), cur.getMonth() + delta, 1);
  const last = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  first.setDate(Math.min(cur.getDate(), last));
  sessionStorage.setItem('ae_cal_date', iso(first));
  render();
}
App.calPrev = function () { calMove(-1); };
App.calNext = function () { calMove(1); };

/* account */
App.chooseRole = function (role) {
  if (role === 'provider') { App.go('#/business/create'); return; }
  sessionStorage.setItem('ae_role', role);
  renderAccountBody(role, 'login');
};
App.signIn = function (role, mode) { renderAccountBody(role, mode || 'login'); };
App.setAuthMode = function (role, mode) { renderAccountBody(role, mode); };
App.businessSignIn = function () {
  document.getElementById('app').innerHTML = navHtml() + '<main>' + businessSignInForm() + '</main>' + footerHtml();
};

function validatePassword(fd) {
  const password = fd.get('password');
  if (String(password || '').length < 8) { toast('Password must be at least 8 characters.'); return null; }
  if (fd.get('confirm') && password !== fd.get('confirm')) { toast('Passwords do not match.'); return null; }
  return password;
}

App.doSignUp = async function (e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const name = fd.get('name').trim();
  const email = fd.get('email').trim();
  const role = fd.get('role');
  const business = fd.get('business') ? fd.get('business').trim() : '';
  const category = (fd.get('category') || '').trim();
  const street_address = (fd.get('street_address') || '').trim();
  const city = (fd.get('city') || '').trim();
  const zip_code = (fd.get('zip_code') || '').trim();
  const serviceName = (fd.get('serviceName') || '').trim();
  const password = validatePassword(fd);
  if (password === null) return;
  if (role === 'provider' && !business) { toast('Please name your business.'); return; }
  if (role === 'provider' && !category) { toast('Please choose a business category.'); return; }
  if (role === 'provider' && !serviceName) { toast('Please add your first service.'); return; }
  const btn = e.target.querySelector('button[type="submit"]');
  if (btn) { btn.disabled = true; btn.textContent = 'Creating account...'; }
  try {
    const res = await apiClient.signUp({ name, email, password, role, business, category, street_address, city, zip_code });
    state.user = res.user;
    if (role === 'provider') {
      state.businessName = business;
      state.businessCategory = category;
      state.hours = defaultHours();
      await Promise.all([
        addDefaultService(fd, business, category),
        apiClient.saveHours(state.hours),
      ]);
    }
    persist();
    toast('Welcome to HairNet, ' + name.split(' ')[0] + '!');
    App.go(role === 'provider' ? '#/provider' : '#/browse');
  } catch (err) {
    if (btn) { btn.disabled = false; btn.textContent = role === 'provider' ? 'Create my business' : 'Create account'; }
    toast('Could not create account: ' + err.message);
  }
};

App.doLogin = async function (e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const email = fd.get('email').trim();
  const password = fd.get('password');
  const btn = e.target.querySelector('button[type="submit"]');
  if (btn) { btn.disabled = true; btn.textContent = 'Signing in...'; }
  try {
    const res = await apiClient.logIn({ email, password });
    state.user = res.user;
    if (res.user.role === 'provider') {
      state.businessName = res.businessName || state.businessName;
      state.businessCategory = res.businessCategory || state.businessCategory;
    }
    persist();
    toast('Welcome back, ' + res.user.name.split(' ')[0] + '!');
    App.go(res.user.role === 'provider' ? '#/provider' : '#/browse');
  } catch (err) {
    if (btn) { btn.disabled = false; btn.textContent = 'Sign in'; }
    toast('Sign in failed: ' + err.message);
  }
};

App.doBusinessSignIn = async function (e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const business = fd.get('business').trim();
  const name = fd.get('name').trim();
  const email = fd.get('email').trim();
  const password = fd.get('password');
  const btn = e.target.querySelector('button[type="submit"]');
  if (btn) { btn.disabled = true; btn.textContent = 'Signing in...'; }
  try {
    await apiClient.businessLogIn({ business, name, email, password });
    state.user = { name, email, role: 'provider' };
    state.businessName = business;
    persist();
    toast('Signed in as ' + business + '.');
    App.go('#/provider');
  } catch (err) {
    if (btn) { btn.disabled = false; btn.textContent = 'Sign in to dashboard'; }
    toast('Sign in failed: ' + err.message);
  }
};

App.signOut = function () {
  state.user = null;
  persist();
  syncToServer(apiClient.signOut());
  toast('Signed out.');
  App.go('#/');
};

App.confirmDeleteAccount = function () {
  openModal(`
    <div class="modal modal-head">
      <h2>Delete your account?</h2>
      <p class="m-sub">This permanently removes your profile and all associated data. This action cannot be undone.</p>
      <div class="modal-actions">
        <button class="btn btn-ghost" onclick="App.closeModal()">Cancel</button>
        <button class="btn btn-danger" onclick="App.deleteAccount()">Yes, delete my account</button>
      </div>
    </div>`);
};

App.deleteAccount = async function () {
  const btn = document.querySelector('#modal-root .btn-danger');
  if (btn) { btn.disabled = true; btn.textContent = 'Deleting...'; }
  try {
    await apiClient.deleteAccount();
  } catch (err) {
    if (btn) { btn.disabled = false; btn.textContent = 'Yes, delete my account'; }
    toast('Could not delete account: ' + err.message);
    App.closeModal();
    return;
  }
  App.closeModal();
  state.user = null;
  state.services = [];
  state.appointments = [];
  state.businessName = 'My Business';
  persist();
  toast('Your account has been deleted. Goodbye.');
  App.go('#/');
};

App.changePassword = async function (e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const current = fd.get('current');
  const newPw = fd.get('newPw');
  const confirm = fd.get('confirm');
  if (newPw.length < 8) { toast('Password must be at least 8 characters.'); return; }
  if (newPw !== confirm) { toast('Passwords do not match.'); return; }
  try {
    await apiClient.changePassword({ currentPassword: current, newPassword: newPw });
    toast('Password updated.');
    e.target.reset();
  } catch (err) {
    toast('Could not update password: ' + err.message);
  }
};

App.doForgotPassword = async function (e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const email = fd.get('email').trim();
  try {
    const res = await apiClient.forgotPassword(email);
    if (res.token) {
      toast('Reset token: ' + res.token);
      App.go('#/reset-password?token=' + encodeURIComponent(res.token));
    } else {
      toast('If an account exists, a reset link has been sent.');
    }
  } catch (err) {
    toast('Something went wrong: ' + err.message);
  }
};

App.doResetPassword = async function (e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const params = new URLSearchParams(location.hash.split('?')[1] || '');
  const token = fd.get('token') || params.get('token') || '';
  const newPw = fd.get('newPassword');
  const confirm = fd.get('confirm');
  if (newPw.length < 8) { toast('Password must be at least 8 characters.'); return; }
  if (newPw !== confirm) { toast('Passwords do not match.'); return; }
  try {
    await apiClient.resetPassword({ token, newPassword: newPw });
    toast('Password reset successful. You can now sign in.');
    App.go('#/account');
  } catch (err) {
    toast('Reset failed: ' + err.message);
  }
};

App.googleSignIn = async function (handler) {
  try {
    const res = await apiClient.googleAuthorize(handler || 'customer');
    if (res.url) {
      window.location.href = res.url;
    } else {
      toast('Google sign-in is not configured.');
    }
  } catch (err) {
    toast('Google sign-in unavailable: ' + err.message);
  }
};

App.doBusinessForgotPassword = async function (e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const business = fd.get('business').trim();
  try {
    const res = await apiClient.businessForgotPassword(business);
    if (res.token) {
      toast('Reset token: ' + res.token);
      App.go('#/business/reset-password?token=' + encodeURIComponent(res.token));
    } else {
      toast('If that business exists, a reset link has been sent.');
    }
  } catch (err) {
    toast('Something went wrong: ' + err.message);
  }
};

App.doBusinessResetPassword = async function (e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const params = new URLSearchParams(location.hash.split('?')[1] || '');
  const token = fd.get('token') || params.get('token') || '';
  const newPw = fd.get('newPassword');
  const confirm = fd.get('confirm');
  if (newPw.length < 8) { toast('Password must be at least 8 characters.'); return; }
  if (newPw !== confirm) { toast('Passwords do not match.'); return; }
  try {
    await apiClient.businessResetPassword({ token, newPassword: newPw });
    toast('Business password reset successful.');
    App.go('#/business/signin');
  } catch (err) {
    toast('Reset failed: ' + err.message);
  }
};

function renderAccountBody(role, mode) {
  document.getElementById('app').innerHTML = navHtml() + '<main>' + signInForm(role, mode) + '</main>' + footerHtml();
}

/* provider services */
function serviceModal(s) {
  const isEdit = !!s;
  const form = `
    <div class="modal modal-head">
      <h2>${isEdit ? 'Edit service' : 'New service'}</h2>
      <p class="m-sub">${esc(state.businessName)} · shown on your booking page.</p>
      <form onsubmit="App.saveService(event)">
        <input type="hidden" name="id" value="${isEdit ? s.id : ''}">
        <div class="field">
          <label for="sv-name">Service name</label>
          <input id="sv-name" name="name" type="text" value="${isEdit ? esc(s.name) : ''}" placeholder="e.g. Signature Haircut" required />
        </div>
        <div class="field">
          <label for="sv-desc">Description</label>
          <textarea id="sv-desc" name="desc" placeholder="What makes this service special?" required>${isEdit ? esc(s.desc) : ''}</textarea>
        </div>
        <div class="flex gap-2" style="gap:12px">
          <div class="field" style="flex:1">
            <label for="sv-dur">Duration (min)</label>
            <input id="sv-dur" name="duration" type="number" min="15" max="480" step="15" value="${isEdit ? s.duration : 60}" required />
          </div>
          <div class="field" style="flex:1">
            <label for="sv-price">Price (R)</label>
            <input id="sv-price" name="price" type="number" min="0" step="0.01" value="${isEdit ? s.price : 50}" required />
          </div>
        </div>
        <div class="field">
          <label for="sv-cat">Category</label>
          <select id="sv-cat" name="category">
            ${CATEGORIES.map(c => `<option value="${c}" ${isEdit && s.category === c ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="App.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">${isEdit ? 'Save changes' : 'Add service'}</button>
        </div>
      </form>
    </div>`;
  openModal(form);
}
App.addService = function () { serviceModal(null); };
App.editService = function (id) { serviceModal(byId(id)); };
App.onboardSetupBusiness = async function (e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const name = fd.get('name').trim();
  const business = fd.get('business').trim();
  const category = (fd.get('category') || '').trim();
  const street_address = (fd.get('street_address') || '').trim();
  const city = (fd.get('city') || '').trim();
  const zip_code = (fd.get('zip_code') || '').trim();
  const serviceName = (fd.get('serviceName') || '').trim();
  if (!business) { toast('Please enter your business name.'); return; }
  if (!category) { toast('Please choose a business category.'); return; }
  if (!serviceName) { toast('Please add your first service.'); return; }
  try {
    const res = await apiClient.businessSetup({ name, business, category, street_address, city, zip_code });
    sessionStorage.removeItem('ae_pending_google_name');
    state.businessName = res.business || business;
    state.businessCategory = res.category || category;
    state.user = Object.assign({}, res.user || {}, { name });
    state.hours = defaultHours();
    await Promise.all([
      addDefaultService(fd, business, category),
      apiClient.saveHours(state.hours),
    ]);
    persist();
    toast('Business set up. Now add more products and preferences.');
    App.go('#/provider');
  } catch (err) {
    toast('Could not set up business: ' + err.message);
  }
};

App.saveService = async function (e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const id = fd.get('id');
  const data = {
    name: fd.get('name').trim(), desc: fd.get('desc').trim(),
    duration: Number(fd.get('duration')), price: Number(fd.get('price')),
    category: fd.get('category'),
  };
  if (id) {
    const s = byId(id);
    Object.assign(s, data);
    toast('Service updated.');
    syncToServer(apiClient.updateService(id, data));
    persist(); render();
  } else {
    const svc = { id: uid(), business: state.businessName, ...data };
    try {
      const created = await apiClient.createService(svc);
      state.services = [created, ...state.services.filter(x => x.id !== created.id)];
      toast('Service added — it is live on your booking page.');
    } catch (err) {
      toast('Could not add service: ' + err.message);
      App.closeModal();
      return;
    }
    persist(); render();
  }
  App.closeModal();
};
App.deleteService = function (id) {
  const s = byId(id);
  openModal(`
    <div class="modal modal-head">
      <h2>Delete this service?</h2>
      <p class="m-sub">“${esc(s.name)}” will be removed and can't be booked anymore.</p>
      <div class="modal-actions">
        <button class="btn btn-ghost" onclick="App.closeModal()">Keep it</button>
        <button class="btn btn-danger" onclick="App.doDeleteService('${id}')">Delete service</button>
      </div>
    </div>`);
};
App.doDeleteService = function (id) {
  state.services = state.services.filter(s => s.id !== id);
  persist();
  syncToServer(apiClient.deleteService(id));
  App.closeModal(); render(); toast('Service deleted.');
};

/* provider hours */
App.toggleDay = function (d) {
  if (state.hours[d]) { state.hours[d] = null; }
  else { state.hours[d] = { open: '08:00', close: '17:00' }; }
  render();
};
App.saveHours = function () {
  document.querySelectorAll('.day-row').forEach(row => {
    const d = Number(row.dataset.day);
    const open = row.querySelector('[data-role="open"]');
    const close = row.querySelector('[data-role="close"]');
    if (state.hours[d]) {
      state.hours[d] = { open: open.value, close: close.value };
    }
  });
  persist();
  syncToServer(apiClient.saveHours(state.hours));
  toast('Working hours saved.');
  render();
};

App.closeModal = closeModal;

/* ---------------- init ---------------- */
async function loadInitialState() {
  render();
  try {
    const remote = await apiClient.bootstrap();
    if (remote && Array.isArray(remote.services)) {
      state = normalizeRemote(remote);
      persist();
      render();
    }
  } catch (err) {
    console.warn('HairNet: server unavailable — running with local data.', err);
  }
}

/* Poll the server so bookings made elsewhere show up automatically. */
const POLL_MS = 5000;
let lastApptsJson = '';

function showAppointments(view, tab) {
  if (view === 'appointments') return true;
  return view === 'provider' && (tab === 'overview' || tab === 'appointments');
}

async function pollAppointments() {
  if (document.visibilityState === 'hidden') return;
  try {
    const remote = await apiClient.appointments();
    if (!Array.isArray(remote)) return;
    // The server only returns this user's appointments; drop any stale local
    // entries that don't belong to the signed-in account.
    const mine = a => state.user && (
      (a.customerId || '') === state.user.id ||
      (state.user.role === 'provider' && a.business === state.businessName)
    );
    const merged = remote.concat(
      state.appointments.filter(a => !remote.some(r => r.id === a.id) && mine(a))
    ).sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    const next = JSON.stringify(merged);
    if (next === lastApptsJson) return;
    lastApptsJson = next;
    state.appointments = merged;
    persist();
    const { view, tab } = parseHash();
    if (showAppointments(view, tab)) render();
  } catch (err) {
    /* server unavailable — keep local data */
  }
}

/* Keep the client-facing catalog in sync so clients always see ALL current
   businesses and services (plus working hours) without a full reload. */
let lastCatalogJson = '';
async function pollCatalog() {
  if (document.visibilityState === 'hidden') return;
  try {
    const remote = await apiClient.bootstrap();
    if (!remote || !Array.isArray(remote.services)) return;
    const hours = {};
    for (let i = 0; i < 7; i++) hours[i] = (remote.hours && (remote.hours[String(i)] || remote.hours[i])) || null;
    const next = JSON.stringify({ s: remote.services || [], b: remote.businesses || [], h: hours });
    if (next === lastCatalogJson) return;
    lastCatalogJson = next;
    state.services = remote.services || [];
    state.businesses = remote.businesses || [];
    state.hours = hours;
    persist();
    const { view } = parseHash();
    if (view === 'browse' || view === 'service' || view === 'home' || view === 'provider') render();
  } catch (err) {
    /* server unavailable — keep local data */
  }
}

function init() {
  window.addEventListener('hashchange', render);
  loadInitialState();
  setInterval(pollAppointments, POLL_MS);
  setInterval(pollCatalog, POLL_MS);
}
init();
