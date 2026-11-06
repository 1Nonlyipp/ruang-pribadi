'use strict';
/* Ruang Pribadi — frontend (tanpa framework, tanpa internet) */

/* ================================================================ util */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const ymd = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseYmd = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = parseYmd(s); d.setDate(d.getDate() + n); return ymd(d); };
const monthKey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
const shiftMonth = (m, n) => { const [y, mo] = m.split('-').map(Number); return monthKey(new Date(y, mo - 1 + n, 1)); };
const monthLabel = m => { const [y, mo] = m.split('-').map(Number); return new Date(y, mo - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }); };
const fmtDate = (s, opt = { day: 'numeric', month: 'short' }) => parseYmd(s).toLocaleDateString('id-ID', opt);
const rupiahFmt = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
const rupiah = n => rupiahFmt.format(n || 0);
const parseMoney = v => Number(String(v || '').replace(/\D/g, '')) || 0;
const sum = arr => arr.reduce((a, x) => a + (Number(x.amount) || 0), 0);
const find = (col, id) => S[col].find(x => x.id === id);
const uniq = arr => [...new Set(arr.filter(Boolean))];

function relDay(s) {
  const t = ymd();
  if (s === t) return 'Hari ini';
  if (s === addDays(t, 1)) return 'Besok';
  if (s === addDays(t, -1)) return 'Kemarin';
  const sameYear = s.slice(0, 4) === t.slice(0, 4);
  return fmtDate(s, { weekday: 'short', day: 'numeric', month: 'short', year: sameYear ? undefined : 'numeric' });
}
function timeAgo(ts) {
  if (!ts) return '';
  const s = Date.now() / 1000 - ts;
  if (s < 60) return 'baru saja';
  if (s < 3600) return `${Math.floor(s / 60)} menit lalu`;
  if (s < 86400) return `${Math.floor(s / 3600)} jam lalu`;
  const d = new Date(ts * 1000);
  if (ymd(d) === addDays(ymd(), -1)) return 'kemarin';
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined });
}

/* ================================================================ icons */
const svg = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const ICON = {
  home: svg('<path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9v11.5h13V9"/><path d="M10 20.5v-6h4v6"/>'),
  note: svg('<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5"/><path d="M9 13h7M9 17h5"/>'),
  task: svg('<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="m8 12 3 3 5-6"/>'),
  wallet: svg('<path d="M4 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a1 1 0 0 1-1-1z"/><path d="M4 7V6a2 2 0 0 1 2-2h10"/><circle cx="16" cy="13.5" r="1.2"/>'),
  habit: svg('<path d="M17 2.5 20 5.5l-3 3"/><path d="M4 11V9.5a4 4 0 0 1 4-4h12"/><path d="M7 21.5 4 18.5l3-3"/><path d="M20 13v1.5a4 4 0 0 1-4 4H4"/>'),
  data: svg('<ellipse cx="12" cy="5.5" rx="7.5" ry="2.5"/><path d="M4.5 5.5v13c0 1.4 3.4 2.5 7.5 2.5s7.5-1.1 7.5-2.5v-13"/><path d="M4.5 12c0 1.4 3.4 2.5 7.5 2.5s7.5-1.1 7.5-2.5"/>'),
  check: svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
  trash: svg('<path d="M4 7h16"/><path d="M9.5 7V4h5v3"/><path d="M6.5 7l1 13h9l1-13"/>'),
  pin: svg('<path d="M9 3.5h6l-1 6.5 3 3H7l3-3z"/><path d="M12 13v7.5"/>'),
  plus: svg('<path d="M12 5v14M5 12h14"/>'),
  search: svg('<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/>'),
  left: svg('<path d="m15 6-6 6 6 6"/>'),
  right: svg('<path d="m9 6 6 6-6 6"/>'),
  back: svg('<path d="M19 12H5M11 6l-6 6 6 6"/>'),
  eye: svg('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
  edit: svg('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>'),
  moon: svg('<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>'),
  sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
  download: svg('<path d="M12 4v11M7 10l5 5 5-5"/><path d="M5 20h14"/>'),
  run: svg('<path d="M3 12h4l3-8 4 16 3-8h4"/>'),
  reset: svg('<path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5"/><path d="M4 4v4.5h4.5"/>'),
  link: svg('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
  upload: svg('<path d="M12 15V4M7 9l5-5 5 5"/><path d="M5 20h14"/>'),
};

/* ================================================================ api + state */
const api = {
  async req(method, url, body) {
    const r = await fetch(url, {
      method,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : {},
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (r.status === 401) { location.href = '/login'; throw new Error('Perlu masuk dengan PIN'); }
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error || `Gagal (HTTP ${r.status})`);
    return data;
  },
  all: () => api.req('GET', '/api/all'),
  create: (col, d) => api.req('POST', `/api/${col}`, d),
  update: (col, id, d) => api.req('PATCH', `/api/${col}/${id}`, d),
  remove: (col, id) => api.req('DELETE', `/api/${col}/${id}`),
};

const S = {
  notes: [], todos: [], transactions: [], habits: [], workouts: [],
  ui: {
    wMonth: monthKey(new Date()), wType: '', wDay: '',
    view: 'beranda', focus: null,
    noteId: null, noteQuery: '', noteTag: '', notePreview: false,
    todoFilter: 'aktif', todoList: '',
    month: monthKey(new Date()), txType: 'keluar',
  },
};

async function add(col, data) {
  if (cloud.active) {
    const now = Date.now() / 1000;
    const it = { ...data, id: uid(), created_at: now, updated_at: now };
    S[col].push(it); saveCache(); cloud.queue(col, it.id, 'put');
    return it;
  }
  const it = await api.create(col, data); S[col].push(it); return it;
}
async function patch(col, id, data) {
  if (cloud.active) {
    const it = find(col, id);
    if (!it) throw new Error('Data tidak ditemukan');
    Object.assign(it, data, { updated_at: Date.now() / 1000 });
    saveCache(); cloud.queue(col, id, 'put');
    return it;
  }
  const it = await api.update(col, id, data);
  const i = S[col].findIndex(x => x.id === id);
  if (i >= 0) S[col][i] = it;
  return it;
}
async function del(col, id) {
  if (cloud.active) { S[col] = S[col].filter(x => x.id !== id); saveCache(); cloud.queue(col, id, 'del'); return; }
  await api.remove(col, id); S[col] = S[col].filter(x => x.id !== id);
}
/* ================================================================ CLOUD (Supabase) */
/* Mode cloud aktif bila config.js (atau form setup) berisi URL & key Supabase.
   Data disimpan lokal dulu (bisa offline), lalu dikirim lewat antrian (outbox). */
const COLS = ['notes', 'todos', 'transactions', 'habits', 'workouts'];
const CFG_KEY = 'rp-cloud-config', SES_KEY = 'rp-session', CACHE_KEY = 'rp-cache', OUT_KEY = 'rp-outbox';
const PAGE = 1000;

const uid = () => (window.crypto && crypto.randomUUID ? crypto.randomUUID()
  : 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 12));
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { console.warn('Penyimpanan lokal penuh', e); } };
const netError = () => Object.assign(new Error('Tidak ada koneksi internet'), { network: true });
const authErrorObj = () => Object.assign(new Error('Sesi berakhir, silakan masuk lagi'), { auth: true });

function cloudConfig() {
  const c = window.RP_CONFIG || {};
  if (c.supabaseUrl && c.supabaseKey) return { url: c.supabaseUrl.trim().replace(/\/+$/, ''), key: c.supabaseKey.trim(), fromFile: true };
  const s = lsGet(CFG_KEY, null);
  return s && s.url && s.key ? s : null;
}

const cloud = {
  active: false, cfg: null, session: null, outbox: [], syncing: false, lastSync: 0, state: '', timer: null,

  load() {
    this.cfg = cloudConfig();
    this.session = lsGet(SES_KEY, null);
    this.outbox = lsGet(OUT_KEY, []);
  },
  saveSession() { lsSet(SES_KEY, this.session); },
  saveOutbox() { lsSet(OUT_KEY, this.outbox); updateSyncPill(); },

  async authReq(path, body) {
    let r;
    try {
      r = await fetch(`${this.cfg.url}/auth/v1/${path}`, {
        method: 'POST', headers: { apikey: this.cfg.key, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
    } catch (e) { throw netError(); }
    const d = await r.json().catch(() => ({}));
    if (!r.ok) {
      const msg = d.error_description || d.msg || d.message || d.error || `HTTP ${r.status}`;
      throw Object.assign(new Error(/invalid login|invalid_grant|credentials/i.test(msg) ? 'Email atau password salah' : /not confirmed/i.test(msg) ? 'Email belum dikonfirmasi (lihat panduan langkah Supabase)' : msg), { status: r.status });
    }
    return d;
  },
  setSession(d) {
    this.session = {
      access_token: d.access_token, refresh_token: d.refresh_token,
      expires_at: d.expires_at || Math.floor(Date.now() / 1000) + (d.expires_in || 3600),
      user: { id: d.user && d.user.id, email: d.user && d.user.email },
    };
    this.saveSession();
  },
  async login(email, password) { this.setSession(await this.authReq('token?grant_type=password', { email, password })); },
  async token() {
    if (!this.session) throw authErrorObj();
    if (this.session.expires_at - 60 < Date.now() / 1000) {
      try {
        const d = await this.authReq('token?grant_type=refresh_token', { refresh_token: this.session.refresh_token });
        this.setSession({ ...d, user: d.user || this.session.user });
      } catch (e) {
        if (e.network || !(e.status >= 400 && e.status < 500)) throw e;
        this.session = null; this.saveSession(); throw authErrorObj();
      }
    }
    return this.session.access_token;
  },
  async rest(method, query, body, prefer) {
    const tok = await this.token();
    let r;
    try {
      r = await fetch(`${this.cfg.url}/rest/v1/items${query}`, {
        method,
        headers: { apikey: this.cfg.key, Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json', ...(prefer ? { Prefer: prefer } : {}) },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } catch (e) { throw netError(); }
    if (r.status === 401) { this.session.expires_at = 0; this.saveSession(); }
    if (!r.ok) {
      const d = await r.json().catch(() => ({}));
      const hint = r.status === 404 || d.code === '42P01' || d.code === '42501' || d.code === 'PGRST205'
        ? ' — tabel belum dibuat/diberi izin. Jalankan ulang SETUP-SUPABASE.sql.' : '';
      throw new Error((d.message || `Gagal sinkron (HTTP ${r.status})`) + hint);
    }
    return r.status === 204 || r.status === 201 && prefer && prefer.includes('minimal') ? null : r.json().catch(() => null);
  },
  rowToItem: row => ({ ...(row.data || {}), id: row.id, created_at: row.created_at, updated_at: row.updated_at }),
  itemToRow(col, it) { const { id, created_at, updated_at, ...data } = it; return { id, collection: col, data, created_at, updated_at }; },

  async pullAll() {
    const out = {}; COLS.forEach(c => (out[c] = []));
    for (let off = 0; ; off += PAGE) {
      const rows = await this.rest('GET', `?select=id,collection,data,created_at,updated_at&order=created_at.asc,id.asc&limit=${PAGE}&offset=${off}`);
      (rows || []).forEach(r => { if (out[r.collection]) out[r.collection].push(this.rowToItem(r)); });
      if (!rows || rows.length < PAGE) break;
    }
    return out;
  },
  queue(col, id, op) {
    this.outbox = this.outbox.filter(o => o.id !== id);
    this.outbox.push({ col, id, op });
    this.saveOutbox();
    scheduleSync();
  },
  async flush() {
    while (this.outbox.length) {
      const o = this.outbox[0];
      if (o.op === 'del') await this.rest('DELETE', `?id=eq.${encodeURIComponent(o.id)}`, undefined, 'return=minimal');
      else {
        const it = S[o.col] && find(o.col, o.id);
        if (it) await this.rest('POST', '?on_conflict=id', [this.itemToRow(o.col, it)], 'resolution=merge-duplicates,return=minimal');
      }
      const i = this.outbox.indexOf(o);
      if (i >= 0) this.outbox.splice(i, 1);
      this.saveOutbox();
    }
  },
  async replaceAll(collections) {
    await this.flush();
    await this.rest('DELETE', '?id=not.is.null', undefined, 'return=minimal');
    const rows = [];
    COLS.forEach(col => (collections[col] || []).forEach(it => {
      if (!it || typeof it !== 'object') return;
      const now = Date.now() / 1000;
      rows.push(this.itemToRow(col, { ...it, id: String(it.id || uid()), created_at: +it.created_at || now, updated_at: +it.updated_at || now }));
    }));
    for (let i = 0; i < rows.length; i += 500)
      await this.rest('POST', '?on_conflict=id', rows.slice(i, i + 500), 'resolution=merge-duplicates,return=minimal');
    return rows.length;
  },
};

function saveCache() {
  if (!cloud.active || !cloud.session) return;
  const data = { user: cloud.session.user.id };
  COLS.forEach(c => (data[c] = S[c]));
  lsSet(CACHE_KEY, data);
}
function loadCache() {
  const c = lsGet(CACHE_KEY, null);
  if (c && cloud.session && c.user === cloud.session.user.id) COLS.forEach(k => (S[k] = c[k] || []));
}

/* ---------- sinkronisasi */
let syncDebounce = null, pendingRender = false;
function scheduleSync() { clearTimeout(syncDebounce); syncDebounce = setTimeout(syncNow, 700); }
function safeToRender() {
  const a = document.activeElement;
  return !$('#modal').open && !(a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) && a.type !== 'radio');
}
function applyRemote(data) {
  if (noteSave.pending) return;
  let changed = false;
  COLS.forEach(c => { if (JSON.stringify(S[c]) !== JSON.stringify(data[c])) { S[c] = data[c]; changed = true; } });
  if (!changed) return;
  saveCache();
  if (safeToRender()) render(); else pendingRender = true;
}
async function syncNow() {
  if (!cloud.active || !cloud.session || cloud.syncing) return;
  if (!navigator.onLine) { setSync('offline'); return; }
  cloud.syncing = true; setSync('syncing');
  try {
    await cloud.flush();
    const data = await cloud.pullAll();
    if (!cloud.outbox.length) applyRemote(data);
    cloud.lastSync = Date.now();
    setSync('ok');
  } catch (e) {
    console.warn(e);
    if (e.auth) { setSync('error', e.message); showLogin(e.message); }
    else setSync(e.network ? 'offline' : 'error', e.message);
  } finally {
    cloud.syncing = false;
    if (cloud.outbox.length && navigator.onLine && cloud.state === 'ok') scheduleSync();
  }
}
function setSync(state, msg) { cloud.state = state; cloud.msg = msg || ''; updateSyncPill(); }
function updateSyncPill() {
  const el = $('#syncPill');
  if (!el) return;
  if (!cloud.active || !cloud.session) { el.hidden = true; return; }
  const n = cloud.outbox.length;
  const txt = {
    ok: n ? `Menunggu kirim (${n})` : 'Tersinkron',
    syncing: 'Menyinkronkan…',
    offline: n ? `Offline · ${n} perubahan menunggu` : 'Offline',
    error: 'Gagal sinkron — ketuk untuk coba lagi',
  }[cloud.state] || 'Sinkron';
  el.hidden = false;
  el.className = 'sync-pill ' + (cloud.state || '');
  el.title = cloud.msg || (cloud.lastSync ? 'Terakhir sinkron ' + new Date(cloud.lastSync).toLocaleTimeString('id-ID') : '');
  el.innerHTML = `<i></i><span>${esc(txt)}</span>`;
}
function startSyncLoop() {
  cloud.loopStarted = true;
  window.addEventListener('online', syncNow);
  window.addEventListener('offline', () => setSync('offline'));
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') syncNow(); });
  document.addEventListener('focusout', () => setTimeout(() => { if (pendingRender && safeToRender()) { pendingRender = false; render(); } }, 50));
  $('#modal').addEventListener('close', () => { if (pendingRender) { pendingRender = false; render(); } });
  setInterval(() => { if (document.visibilityState === 'visible') syncNow(); }, 45000);
}

/* ---------- layar setup & login */
function gateHtml(inner) {
  return `<div class="gate-wrap"><div class="gate-card card"><div class="gate-mark">R</div>${inner}</div></div>`;
}
function showSetup(err) {
  document.body.classList.add('gate');
  $('#view').innerHTML = gateHtml(`<h1>Hubungkan ke Supabase</h1>
    <p class="muted">Isi alamat project dan <b>publishable key</b> dari Supabase (Project Settings → API Keys). Lebih praktis lagi: isi sekali di file <code>config.js</code> sebelum diunggah, supaya form ini tidak muncul.</p>
    <form data-form="cloudSetup" class="gate-form">
      <label>Project URL<input name="url" placeholder="https://xxxx.supabase.co" required autocomplete="off" inputmode="url"></label>
      <label>Publishable key<input name="key" placeholder="sb_publishable_..." required autocomplete="off"></label>
      <button class="btn primary">Simpan</button>
    </form>
    ${err ? `<p class="muted small">Server lokal juga tidak ditemukan (${esc(err.message || err)}).</p>` : ''}`);
}
function showLogin(msg) {
  document.body.classList.add('gate');
  $('#view').innerHTML = gateHtml(`<h1>Masuk</h1>
    <p class="muted">Pakai email &amp; password akun yang kamu buat di Supabase (Authentication → Users).</p>
    <form data-form="cloudLogin" class="gate-form">
      <label>Email<input name="email" type="email" required autocomplete="username" value="${esc(lsGet('rp-last-email', ''))}"></label>
      <label>Password<input name="password" type="password" required autocomplete="current-password"></label>
      <button class="btn primary">Masuk</button>
      ${msg ? `<p class="gate-err">${esc(msg)}</p>` : ''}
    </form>
    ${cloud.cfg && !cloud.cfg.fromFile ? `<button class="btn ghost sm" data-act="cloudReset">Ganti project Supabase</button>` : ''}`);
}
async function enterApp() {
  document.body.classList.remove('gate');
  loadCache();
  await route();
  updateSyncPill();
  await syncNow();
}

const CLOUD_FORM = {
  async cloudSetup(f, d) {
    const url = d.url.trim().replace(/\/+$/, ''), key = d.key.trim();
    if (!/^https:\/\/.+/.test(url)) throw new Error('Project URL harus diawali https://');
    lsSet(CFG_KEY, { url, key });
    cloud.load(); cloud.active = true;
    if (!cloud.loopStarted) startSyncLoop();
    showLogin();
  },
  async cloudLogin(f, d) {
    const btn = $('button.primary', f); btn.disabled = true; btn.textContent = 'Memeriksa…';
    try {
      await cloud.login(d.email.trim(), d.password);
      lsSet('rp-last-email', d.email.trim());
      const c = lsGet(CACHE_KEY, null);
      if (c && c.user !== cloud.session.user.id) { localStorage.removeItem(CACHE_KEY); cloud.outbox = []; cloud.saveOutbox(); }
      await enterApp();
      toast('Berhasil masuk');
    } catch (e) {
      btn.disabled = false; btn.textContent = 'Masuk';
      throw e;
    }
  },
};
const CLOUD_ACT = {
  syncNow() { syncNow(); },
  async cloudLogout() {
    const n = cloud.outbox.length;
    if (!confirm(n ? `Masih ada ${n} perubahan yang BELUM terkirim ke cloud dan akan hilang. Tetap keluar?` : 'Keluar dari akun di perangkat ini?')) return;
    try { await fetch(`${cloud.cfg.url}/auth/v1/logout`, { method: 'POST', headers: { apikey: cloud.cfg.key, Authorization: 'Bearer ' + cloud.session.access_token } }); } catch (e) {}
    ['rp-session', 'rp-cache', 'rp-outbox'].forEach(k => localStorage.removeItem(k));
    location.reload();
  },
  cloudReset() {
    if (!confirm('Hapus pengaturan project Supabase di perangkat ini?')) return;
    [CFG_KEY, SES_KEY, CACHE_KEY, OUT_KEY].forEach(k => localStorage.removeItem(k));
    location.reload();
  },
  exportCloud() {
    const data = { app: 'Ruang Pribadi', version: 1, exported_at: new Date().toISOString(), collections: {} };
    COLS.forEach(c => (data.collections[c] = S[c]));
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    a.download = `ruang-pribadi-cadangan-${ymd()}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  },
};


/* ================================================================ router */
const NAV = [
  ['beranda', 'Beranda', 'home'],
  ['catatan', 'Catatan', 'note'],
  ['tugas', 'Tugas', 'task'],
  ['keuangan', 'Keuangan', 'wallet', 'Uang'],
  ['olahraga', 'Olahraga', 'run'],
  ['kebiasaan', 'Kebiasaan', 'habit', 'Habit'],
  ['data', 'Data', 'data'],
];
const VIEWS = {
  beranda: renderHome, catatan: renderNotes, tugas: renderTodos,
  keuangan: renderMoney, olahraga: renderSport, kebiasaan: renderHabits, data: renderData,
};

function buildNav() {
  $('#nav').innerHTML = NAV.map(([k, label, ic, short]) =>
    `<a href="#${k}" data-view="${k}">${ICON[ic]}<span class="nl">${label}</span><span class="ns">${short || label}</span><b class="badge" data-badge="${k}" hidden></b></a>`).join('');
}

async function route() {
  const v = location.hash.slice(1);
  const next = VIEWS[v] ? v : 'beranda';
  if (S.ui.view === 'catatan' && next !== 'catatan') await leaveNote();
  S.ui.view = next;
  $$('#nav a').forEach(a => a.classList.toggle('active', a.dataset.view === next));
  const label = NAV.find(n => n[0] === next)[1];
  document.title = `${label} · Ruang Pribadi`;
  render();
  window.scrollTo(0, 0);
}

function render() {
  $('#view').innerHTML = VIEWS[S.ui.view]();
  updateBadges();
  if (S.ui.view === 'olahraga') updateTimerDom();
  if (S.ui.view === 'data') loadHpInfo();
  if (S.ui.focus) { const el = $(S.ui.focus); if (el) { el.focus(); if (el.setSelectionRange && el.type !== 'date') { const n = el.value.length; try { el.setSelectionRange(n, n); } catch (e) {} } } S.ui.focus = null; }
}

function updateBadges() {
  const t = ymd();
  const due = S.todos.filter(x => !x.done && x.due && x.due <= t).length;
  const b = $('[data-badge="tugas"]');
  if (b) { b.hidden = !due; b.textContent = due; }
}

/* ================================================================ BERANDA */
function renderHome() {
  const now = new Date(), t = ymd(now), h = now.getHours();
  const greet = h < 11 ? 'Selamat pagi' : h < 15 ? 'Selamat siang' : h < 18 ? 'Selamat sore' : 'Selamat malam';
  const open = S.todos.filter(x => !x.done);
  const late = open.filter(x => x.due && x.due < t).length;
  const focus = open.filter(x => x.due && x.due <= t).sort(sortTodos);
  const next = open.filter(x => !x.due || x.due > t).sort(sortTodos).slice(0, Math.max(0, 5 - focus.length));

  const m = monthKey(now);
  const tx = S.transactions.filter(x => (x.date || '').startsWith(m));
  const inc = sum(tx.filter(x => x.type === 'masuk')), out = sum(tx.filter(x => x.type !== 'masuk'));
  const todayOut = sum(tx.filter(x => x.type !== 'masuk' && x.date === t));

  const hb = S.habits;
  const hbDone = hb.filter(x => (x.done || []).includes(t)).length;
  const notes = sortedNotes(S.notes).slice(0, 5);

  return `
  <header class="page-head">
    <div><p class="eyebrow">${now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
    <h1>${greet}.</h1></div>
  </header>

  <form class="quick" data-form="quickTodo">
    ${ICON.plus}
    <input name="title" placeholder="Tangkap cepat: tugas untuk hari ini… (Enter)" autocomplete="off" aria-label="Tugas baru">
    <button class="btn primary sm">Tambah</button>
  </form>

  <div class="stats">
    ${stat('Tugas aktif', open.length, late ? `${late} terlambat` : 'tidak ada yang terlambat', late ? 'warn' : '')}
    ${stat('Kebiasaan hari ini', `${hbDone}/${hb.length}`, !hb.length ? 'belum ada kebiasaan' : hbDone === hb.length ? 'semua beres 👏' : 'ayo lanjutkan', hb.length && hbDone === hb.length ? 'good' : '')}
    ${stat('Pengeluaran bulan ini', rupiah(out), `hari ini ${rupiah(todayOut)}`)}
    ${stat('Selisih bulan ini', rupiah(inc - out), `pemasukan ${rupiah(inc)}`, inc - out < 0 ? 'warn' : 'good')}
  </div>

  <div class="home-grid">
    <section class="card">
      <div class="card-head"><h2>Fokus hari ini</h2><a class="link" href="#tugas">Semua tugas →</a></div>
      ${focus.length ? `<ul class="todo-list">${focus.map(todoRow).join('')}</ul>` : `<p class="empty">Tidak ada tugas yang jatuh tempo hari ini.</p>`}
      ${next.length ? `<p class="group-label">Berikutnya</p><ul class="todo-list">${next.map(todoRow).join('')}</ul>` : ''}
    </section>

    <div class="stack">
    <section class="card">
      <div class="card-head"><h2>Kebiasaan</h2><a class="link" href="#kebiasaan">Kelola →</a></div>
      ${hb.length ? hb.map(x => {
        const on = (x.done || []).includes(t);
        return `<button class="habit-today ${on ? 'on' : ''}" data-act="toggleHabit" data-id="${x.id}" data-date="${t}">
          <span class="dot">${on ? ICON.check : ''}</span>
          <span class="hn">${x.emoji ? esc(x.emoji) + ' ' : ''}${esc(x.name)}</span>
          <span class="hs">${streak(x) ? streak(x) + ' hari' : ''}</span></button>`;
      }).join('') : `<p class="empty">Belum ada kebiasaan. <a class="link" href="#kebiasaan">Tambah satu</a></p>`}
    </section>

    ${homeSportCard(t, now)}

    <section class="card">
      <div class="card-head"><h2>Catatan</h2><button class="btn ghost sm" data-act="newNote">${ICON.plus} Baru</button></div>
      ${notes.length ? `<ul class="mini-notes">${notes.map(n => `<li><button data-act="openNote" data-id="${n.id}">
        <span class="mn-title">${n.pinned ? ICON.pin : ''}${esc(n.title || 'Tanpa judul')}</span>
        <span class="mn-date">${timeAgo(n.updated_at)}</span></button></li>`).join('')}</ul>` : `<p class="empty">Belum ada catatan.</p>`}
    </section>
    </div>
  </div>`;
}

function homeSportCard(t, now) {
  const wkStart = addDays(t, -((now.getDay() + 6) % 7));
  const wk = S.workouts.filter(w => w.date >= wkStart && w.date <= t && w.type !== 'istirahat');
  const km = wk.filter(w => w.type === 'lari').reduce((a, w) => a + num(w.distance_km), 0);
  const last = S.workouts.filter(w => w.type !== 'istirahat' && w.date <= t).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.created_at - a.created_at))[0];
  return `<section class="card">
    <div class="card-head"><h2>Olahraga</h2><a class="link" href="#olahraga">Jurnal →</a></div>
    <div class="mini-stats">
      <div><b>${new Set(wk.map(w => w.date)).size}</b><span>hari aktif minggu ini</span></div>
      <div><b>${fmtKm(km)}</b><span>km lari minggu ini</span></div>
    </div>
    <div class="home-sport-foot">
      <span class="muted small">${last ? `Terakhir: ${wLabel(last.type, true)}${last.title ? ' — ' + esc(last.title) : ''} · ${relDay(last.date)}` : 'Belum ada catatan olahraga.'}</span>
      <button class="btn sm" data-act="newWorkout">${ICON.plus} Catat</button>
    </div>
  </section>`;
}

function stat(label, value, sub, tone = '') {
  return `<div class="stat ${tone}"><span class="stat-label">${label}</span><span class="stat-value">${value}</span><span class="stat-sub">${sub}</span></div>`;
}

/* ================================================================ TUGAS */
const PRIO = { tinggi: 0, sedang: 1, rendah: 2 };
const PRIO_LABEL = { tinggi: 'Tinggi', sedang: 'Sedang', rendah: 'Rendah' };
const prioOptions = sel => Object.keys(PRIO).map(k => `<option value="${k}" ${k === (sel || 'sedang') ? 'selected' : ''}>${PRIO_LABEL[k]}</option>`).join('');

function sortTodos(a, b) {
  const da = a.due || '9999-99-99', db = b.due || '9999-99-99';
  return (a.done - b.done) || (da < db ? -1 : da > db ? 1 : 0)
    || ((PRIO[a.priority] ?? 1) - (PRIO[b.priority] ?? 1)) || (a.created_at - b.created_at);
}

function todoRow(x) {
  const t = ymd();
  const late = !x.done && x.due && x.due < t;
  const today = !x.done && x.due === t;
  return `<li class="todo ${x.done ? 'done' : ''} prio-${x.priority || 'sedang'}">
    <button class="check" data-act="toggleTodo" data-id="${x.id}" aria-label="${x.done ? 'Batalkan selesai' : 'Tandai selesai'}">${x.done ? ICON.check : ''}</button>
    <div class="todo-main" data-act="editTodo" data-id="${x.id}" title="Klik untuk mengubah">
      <span class="todo-title">${esc(x.title)}</span>
      <span class="meta">
        ${x.due ? `<span class="chip ${late ? 'late' : today ? 'today' : ''}">${late ? 'Terlambat · ' : ''}${relDay(x.due)}</span>` : ''}
        ${x.priority === 'tinggi' ? '<span class="chip hi">Penting</span>' : ''}
        ${x.list ? `<span class="chip">${esc(x.list)}</span>` : ''}
      </span>
      ${x.notes ? `<span class="todo-notes">${esc(x.notes)}</span>` : ''}
    </div>
    <button class="icon-btn danger" data-act="deleteTodo" data-id="${x.id}" title="Hapus">${ICON.trash}</button>
  </li>`;
}

function todoGroups(items, t) {
  const tm = addDays(t, 1);
  const g = [['Terlambat', []], ['Hari ini', []], ['Besok', []], ['Nanti', []], ['Tanpa tanggal', []]];
  for (const x of items) g[!x.due ? 4 : x.due < t ? 0 : x.due === t ? 1 : x.due === tm ? 2 : 3][1].push(x);
  return g.filter(([, a]) => a.length);
}

function renderTodos() {
  const t = ymd(), f = S.ui.todoFilter, L = S.ui.todoList;
  const lists = uniq(S.todos.map(x => x.list)).sort();
  const base = S.todos.filter(x => !L || x.list === L);
  const FILTERS = {
    aktif: ['Aktif', x => !x.done],
    'hari-ini': ['Hari ini', x => !x.done && x.due && x.due <= t],
    mendatang: ['Mendatang', x => !x.done && x.due > t],
    selesai: ['Selesai', x => x.done],
  };
  let items = base.filter(FILTERS[f][1]);
  items = f === 'selesai'
    ? items.sort((a, b) => (b.done_at || '').localeCompare(a.done_at || '') || b.updated_at - a.updated_at)
    : items.sort(sortTodos);

  let body;
  if (!items.length) {
    body = `<p class="empty">${f === 'selesai' ? 'Belum ada tugas yang selesai.' : 'Tidak ada tugas di sini. 🎉'}</p>`;
  } else if (f === 'aktif') {
    body = todoGroups(items, t).map(([label, arr]) =>
      `<p class="group-label ${label === 'Terlambat' ? 'warn' : ''}">${label} <span>${arr.length}</span></p>
       <ul class="todo-list">${arr.map(todoRow).join('')}</ul>`).join('');
  } else {
    body = `<ul class="todo-list">${items.map(todoRow).join('')}</ul>`;
  }

  return `
  <header class="page-head"><div><p class="eyebrow">To-do</p><h1>Tugas</h1></div></header>

  <form class="card add-todo" data-form="addTodo">
    <input id="todoTitle" name="title" placeholder="Apa yang perlu dikerjakan?" required autocomplete="off" aria-label="Judul tugas">
    <div class="add-row">
      <label>Tenggat<input type="date" name="due"></label>
      <label>Prioritas<select name="priority">${prioOptions('sedang')}</select></label>
      <label>Daftar<input name="list" list="todoLists" placeholder="mis. Kuliah" value="${esc(L)}" autocomplete="off"></label>
      <button class="btn primary">${ICON.plus} Tambah</button>
    </div>
    <datalist id="todoLists">${lists.map(l => `<option value="${esc(l)}">`).join('')}</datalist>
  </form>

  <div class="toolbar">
    <div class="tabs" role="tablist">
      ${Object.entries(FILTERS).map(([k, [label, fn]]) =>
        `<button class="tab ${k === f ? 'on' : ''}" data-act="todoFilter" data-v="${k}">${label}<span class="n">${base.filter(fn).length}</span></button>`).join('')}
    </div>
    ${f === 'selesai' && items.length ? `<button class="btn ghost sm danger" data-act="clearDone">${ICON.trash} Hapus semua yang selesai</button>` : ''}
  </div>
  ${lists.length ? `<div class="chips">${lists.map(l => `<button class="chip-btn ${l === L ? 'on' : ''}" data-act="todoList" data-v="${esc(l)}">${esc(l)}</button>`).join('')}</div>` : ''}

  <section class="card list-card">${body}</section>`;
}

function todoModal(x) {
  const lists = uniq(S.todos.map(y => y.list)).sort();
  return `<form class="modal-body" data-form="editTodo" data-id="${x.id}">
    <h2>Ubah tugas</h2>
    <label>Judul<input name="title" required value="${esc(x.title)}" autocomplete="off"></label>
    <label>Catatan<textarea name="notes" rows="3" placeholder="Detail, link, dll. (opsional)">${esc(x.notes || '')}</textarea></label>
    <div class="row2">
      <label>Tenggat<input type="date" name="due" value="${esc(x.due || '')}"></label>
      <label>Prioritas<select name="priority">${prioOptions(x.priority)}</select></label>
    </div>
    <label>Daftar<input name="list" list="todoListsM" value="${esc(x.list || '')}" autocomplete="off"></label>
    <datalist id="todoListsM">${lists.map(l => `<option value="${esc(l)}">`).join('')}</datalist>
    <div class="modal-actions">
      <button type="button" class="btn ghost" data-act="closeModal">Batal</button>
      <button class="btn primary">Simpan</button>
    </div>
  </form>`;
}

/* ================================================================ CATATAN */
const sortedNotes = arr => [...arr].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.updated_at - a.updated_at);
const parseTags = v => uniq(String(v).split(',').map(s => s.trim().replace(/^#/, '').toLowerCase()));
const snippet = s => String(s || '').replace(/^\s*[-*]\s+\[[ xX]\]/gm, '').replace(/[#*`>\[\]_-]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 110);

function renderNotes() {
  const n = S.ui.noteId && find('notes', S.ui.noteId);
  if (S.ui.noteId && !n) S.ui.noteId = null;
  return `<div class="notes-layout ${n ? 'has-open' : ''}">
    <section class="notes-side">
      <div class="notes-side-head"><h1>Catatan</h1><button class="btn primary sm" data-act="newNote">${ICON.plus} Baru</button></div>
      <label class="search">${ICON.search}<input type="search" placeholder="Cari catatan…" value="${esc(S.ui.noteQuery)}" data-input="noteSearch" aria-label="Cari catatan"></label>
      <div id="noteList">${noteListHtml()}</div>
    </section>
    <section class="note-pane">
      ${n ? noteEditorHtml(n) : `<div class="empty big">${ICON.note}<p>Pilih catatan, atau buat yang baru.</p><button class="btn" data-act="newNote">${ICON.plus} Buat catatan</button></div>`}
    </section>
  </div>`;
}

function noteListHtml() {
  const q = S.ui.noteQuery.trim().toLowerCase(), tag = S.ui.noteTag;
  const tags = uniq(S.notes.flatMap(n => n.tags || [])).sort();
  const list = sortedNotes(S.notes.filter(n =>
    (!tag || (n.tags || []).includes(tag)) &&
    (!q || `${n.title || ''} ${n.content || ''} ${(n.tags || []).join(' ')}`.toLowerCase().includes(q))));
  return `${tags.length ? `<div class="chips">${tags.map(t => `<button class="chip-btn ${t === tag ? 'on' : ''}" data-act="noteTag" data-v="${esc(t)}">#${esc(t)}</button>`).join('')}</div>` : ''}
    ${list.length ? `<ul class="note-items">${list.map(n => `<li><button class="note-item ${n.id === S.ui.noteId ? 'active' : ''}" data-act="openNote" data-id="${n.id}">
        <span class="ni-title">${n.pinned ? ICON.pin : ''}<span>${esc(n.title || 'Tanpa judul')}</span></span>
        ${n.content ? `<span class="ni-snip">${esc(snippet(n.content))}</span>` : ''}
        <span class="ni-date">${timeAgo(n.updated_at)}</span></button></li>`).join('')}</ul>`
      : `<p class="empty">${q || tag ? 'Tidak ada catatan yang cocok.' : 'Belum ada catatan.'}</p>`}`;
}

function noteEditorHtml(n) {
  const pv = S.ui.notePreview;
  return `<div class="note-editor">
    <div class="note-toolbar">
      <button class="icon-btn back" data-act="closeNote" title="Kembali ke daftar">${ICON.back}</button>
      <span class="save-status" id="saveStatus">${n.updated_at ? 'Disimpan ' + timeAgo(n.updated_at) : ''}</span>
      <span class="spacer"></span>
      <button class="icon-btn ${pv ? 'on' : ''}" data-act="togglePreview" title="${pv ? 'Kembali menulis' : 'Pratinjau format'}">${pv ? ICON.edit : ICON.eye}</button>
      <button class="icon-btn ${n.pinned ? 'on' : ''}" data-act="togglePin" title="${n.pinned ? 'Lepas sematan' : 'Sematkan di atas'}">${ICON.pin}</button>
      <button class="icon-btn danger" data-act="deleteNote" title="Hapus catatan">${ICON.trash}</button>
    </div>
    <input id="noteTitle" class="note-title" name="title" placeholder="Judul" value="${esc(n.title || '')}" data-input="noteField" autocomplete="off" aria-label="Judul catatan">
    <input class="note-tags" name="tags" placeholder="Tag, pisahkan dengan koma — mis. kuliah, ide" value="${esc((n.tags || []).join(', '))}" data-input="noteField" autocomplete="off" aria-label="Tag">
    ${pv
      ? `<article class="md">${md(n.content || '') || '<p class="muted">Catatan masih kosong.</p>'}</article>`
      : `<textarea id="noteBody" class="note-body" name="content" data-input="noteField" aria-label="Isi catatan"
          placeholder="Mulai menulis…&#10;&#10;Format sederhana:  # Judul   **tebal**   *miring*   - daftar   - [ ] ceklis">${esc(n.content || '')}</textarea>`}
  </div>`;
}

/* autosave catatan */
const noteSave = { timer: null, pending: null };
function setSaveStatus(txt) { const el = $('#saveStatus'); if (el) el.textContent = txt; }
function refreshNoteList() { const el = $('#noteList'); if (el) el.innerHTML = noteListHtml(); }

function queueNoteSave(id, fields) {
  const n = find('notes', id);
  if (!n) return;
  Object.assign(n, fields);
  const prev = noteSave.pending && noteSave.pending.id === id ? noteSave.pending.data : {};
  noteSave.pending = { id, data: { ...prev, ...fields } };
  setSaveStatus('Menyimpan…');
  clearTimeout(noteSave.timer);
  noteSave.timer = setTimeout(flushNote, 600);
}

async function flushNote() {
  clearTimeout(noteSave.timer);
  const p = noteSave.pending;
  if (!p) return;
  noteSave.pending = null;
  try {
    const it = cloud.active ? await patch('notes', p.id, p.data) : await api.update('notes', p.id, p.data);
    const n = find('notes', p.id);
    if (n) n.updated_at = it.updated_at;
    if (!noteSave.pending) setSaveStatus('Tersimpan');
    refreshNoteList();
  } catch (e) {
    const later = noteSave.pending && noteSave.pending.id === p.id ? noteSave.pending.data : {};
    noteSave.pending = { id: p.id, data: { ...p.data, ...later } };
    setSaveStatus('Gagal menyimpan — mencoba lagi…');
    noteSave.timer = setTimeout(flushNote, 3000);
  }
}

/* catatan kosong yang ditinggalkan dihapus otomatis */
async function leaveNote() {
  await flushNote();
  const n = S.ui.noteId && find('notes', S.ui.noteId);
  if (n && !(n.title || '').trim() && !(n.content || '').trim() && !(n.tags || []).length) {
    try { await del('notes', n.id); } catch (e) {}
    S.ui.noteId = null;
  }
}

/* markdown mini (aman: teks di-escape dulu) */
function md(src) {
  const out = [];
  let list = null, code = null;
  const open = type => { if (list !== type) { close(); out.push(type === 'ol' ? '<ol>' : type === 'cl' ? '<ul class="checklist">' : '<ul>'); list = type; } };
  const close = () => { if (list) { out.push(list === 'ol' ? '</ol>' : '</ul>'); list = null; } };
  const inline = s => s
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*\w])\*(?!\s)(.+?)\*(?!\w)/g, '$1<em>$2</em>')
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, '$1<a href="$2" target="_blank" rel="noopener">$2</a>');

  esc(src).split('\n').forEach((raw, i) => {
    if (code !== null) {
      if (/^```/.test(raw)) { out.push(`<pre><code>${code.join('\n')}</code></pre>`); code = null; } else code.push(raw);
      return;
    }
    let m;
    if (/^```/.test(raw)) { close(); code = []; return; }
    if ((m = raw.match(/^(#{1,3})\s+(.*)$/))) { close(); const l = m[1].length + 1; out.push(`<h${l}>${inline(m[2])}</h${l}>`); return; }
    if (/^\s*(-{3,}|\*{3,})\s*$/.test(raw)) { close(); out.push('<hr>'); return; }
    if ((m = raw.match(/^\s*[-*]\s+\[([ xX])\]\s?(.*)$/))) {
      open('cl'); const on = m[1].trim() !== '';
      out.push(`<li class="${on ? 'checked' : ''}" data-act="toggleCheck" data-line="${i}"><span class="box">${on ? ICON.check : ''}</span><span>${inline(m[2])}</span></li>`);
      return;
    }
    if ((m = raw.match(/^\s*[-*]\s+(.*)$/))) { open('ul'); out.push(`<li>${inline(m[1])}</li>`); return; }
    if ((m = raw.match(/^\s*\d+[.)]\s+(.*)$/))) { open('ol'); out.push(`<li>${inline(m[1])}</li>`); return; }
    if ((m = raw.match(/^&gt;\s?(.*)$/))) { close(); out.push(`<blockquote>${inline(m[1])}</blockquote>`); return; }
    if (!raw.trim()) { close(); return; }
    close(); out.push(`<p>${inline(raw)}</p>`);
  });
  if (code !== null) out.push(`<pre><code>${code.join('\n')}</code></pre>`);
  close();
  return out.join('');
}

/* ================================================================ KEUANGAN */
const CAT_OUT = ['Makan & Minum', 'Transportasi', 'Kos / Tempat tinggal', 'Kuliah', 'Belanja', 'Tagihan & Pulsa', 'Hiburan', 'Kesehatan', 'Lainnya'];
const CAT_IN = ['Uang saku', 'Gaji', 'Freelance', 'Beasiswa', 'Hadiah', 'Lainnya'];

function renderMoney() {
  const m = S.ui.month, t = ymd(), type = S.ui.txType;
  const isNow = m === monthKey(new Date());
  const tx = S.transactions.filter(x => (x.date || '').startsWith(m));
  const inc = sum(tx.filter(x => x.type === 'masuk')), out = sum(tx.filter(x => x.type !== 'masuk'));

  const byCat = {};
  tx.filter(x => x.type !== 'masuk').forEach(x => { byCat[x.category || 'Lainnya'] = (byCat[x.category || 'Lainnya'] || 0) + Number(x.amount || 0); });
  const cats = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
  const max = cats.length ? cats[0][1] : 1;

  const byDate = {};
  tx.forEach(x => (byDate[x.date] = byDate[x.date] || []).push(x));
  const dates = Object.keys(byDate).sort().reverse();

  const usedOut = uniq(S.transactions.filter(x => x.type !== 'masuk').map(x => x.category));
  const usedIn = uniq(S.transactions.filter(x => x.type === 'masuk').map(x => x.category));
  const opts = arr => arr.map(c => `<option value="${esc(c)}">`).join('');

  return `
  <header class="page-head">
    <div><p class="eyebrow">Keuangan</p><h1>Uang masuk &amp; keluar</h1></div>
    <div class="month-nav">
      <button class="icon-btn" data-act="monthPrev" title="Bulan sebelumnya">${ICON.left}</button>
      <b>${monthLabel(m)}</b>
      <button class="icon-btn" data-act="monthNext" title="Bulan berikutnya">${ICON.right}</button>
      ${isNow ? '' : `<button class="btn ghost sm" data-act="monthNow">Bulan ini</button>`}
    </div>
  </header>

  <div class="stats three">
    ${stat('Pemasukan', rupiah(inc), `${tx.filter(x => x.type === 'masuk').length} transaksi`, 'good')}
    ${stat('Pengeluaran', rupiah(out), `${tx.filter(x => x.type !== 'masuk').length} transaksi`)}
    ${stat('Selisih', rupiah(inc - out), inc - out < 0 ? 'pengeluaran lebih besar' : 'masih aman', inc - out < 0 ? 'warn' : 'good')}
  </div>

  <div class="money-layout">
    <div class="stack">
      <form class="card tx-form" data-form="addTx">
        <div class="seg" role="radiogroup" aria-label="Jenis">
          <label><input type="radio" name="type" value="keluar" ${type !== 'masuk' ? 'checked' : ''} data-change="txType"><span>Pengeluaran</span></label>
          <label><input type="radio" name="type" value="masuk" ${type === 'masuk' ? 'checked' : ''} data-change="txType"><span>Pemasukan</span></label>
        </div>
        <div class="tx-grid">
          <label>Jumlah<span class="money"><span>Rp</span><input id="txAmount" name="amount" inputmode="numeric" placeholder="0" data-input="money" required autocomplete="off"></span></label>
          <label>Tanggal<input type="date" name="date" value="${isNow ? t : m + '-01'}"></label>
          <label>Kategori<input id="txCategory" name="category" list="${type === 'masuk' ? 'catIn' : 'catOut'}" placeholder="Pilih / ketik" autocomplete="off"></label>
          <label>Keterangan<input name="note" placeholder="opsional" autocomplete="off"></label>
        </div>
        <button class="btn primary">${ICON.plus} Catat</button>
        <datalist id="catOut">${opts(uniq([...CAT_OUT, ...usedOut]))}</datalist>
        <datalist id="catIn">${opts(uniq([...CAT_IN, ...usedIn]))}</datalist>
      </form>

      <section class="card">
        <div class="card-head"><h2>Pengeluaran per kategori</h2></div>
        ${cats.length ? cats.map(([c, v]) => `<div class="bar-row"><span class="bar-label">${esc(c)}</span>
          <span class="bar"><i style="width:${Math.max(3, v / max * 100)}%"></i></span>
          <span class="bar-val">${rupiah(v)}</span></div>`).join('') : '<p class="empty">Belum ada pengeluaran bulan ini.</p>'}
      </section>
    </div>

    <section class="card">
      <div class="card-head"><h2>Riwayat</h2></div>
      ${dates.length ? dates.map(d => {
        const items = byDate[d].sort((a, b) => b.created_at - a.created_at);
        const net = sum(items.filter(x => x.type === 'masuk')) - sum(items.filter(x => x.type !== 'masuk'));
        return `<div class="day-group"><h3><span>${relDay(d)}</span><span>${net >= 0 ? '+' : '−'}${rupiah(Math.abs(net))}</span></h3>
          ${items.map(x => `<div class="tx">
            <div class="tx-main"><span class="tx-cat">${esc(x.category || 'Lainnya')}</span>${x.note ? `<span class="tx-note">${esc(x.note)}</span>` : ''}</div>
            <span class="amt ${x.type === 'masuk' ? 'in' : 'out'}">${x.type === 'masuk' ? '+' : '−'}${rupiah(x.amount)}</span>
            <button class="icon-btn danger" data-act="deleteTx" data-id="${x.id}" title="Hapus">${ICON.trash}</button>
          </div>`).join('')}</div>`;
      }).join('') : '<p class="empty">Belum ada transaksi di bulan ini.</p>'}
    </section>
  </div>`;
}

/* ================================================================ KEBIASAAN */
function streak(h) {
  const set = new Set(h.done || []);
  let d = ymd();
  if (!set.has(d)) d = addDays(d, -1);
  let n = 0;
  while (set.has(d)) { n++; d = addDays(d, -1); }
  return n;
}
function rate30(h) {
  const t = ymd();
  const age = Math.floor((Date.now() / 1000 - (h.created_at || 0)) / 86400) + 1;
  const span = Math.max(1, Math.min(30, age));
  const from = addDays(t, -(span - 1));
  const n = (h.done || []).filter(d => d >= from && d <= t).length;
  return Math.round(n / span * 100);
}

function renderHabits() {
  const t = ymd();
  const days = [...Array(7)].map((_, i) => addDays(t, i - 6));
  const doneToday = S.habits.filter(h => (h.done || []).includes(t)).length;
  return `
  <header class="page-head"><div><p class="eyebrow">Kebiasaan</p><h1>Sedikit demi sedikit</h1></div>
    ${S.habits.length ? `<p class="muted">Hari ini: <b>${doneToday}</b> dari ${S.habits.length} selesai</p>` : ''}</header>

  <form class="card add-habit" data-form="addHabit">
    <input name="emoji" class="emoji-in" maxlength="4" placeholder="🌱" aria-label="Emoji (opsional)" autocomplete="off">
    <input id="habitName" name="name" placeholder="Kebiasaan baru — mis. Minum 8 gelas air, Baca 10 halaman" required autocomplete="off" aria-label="Nama kebiasaan">
    <button class="btn primary">${ICON.plus} Tambah</button>
  </form>

  <section class="card">
    ${S.habits.length ? `<div class="table-wrap"><table class="habit-table">
      <thead><tr><th class="hname">Kebiasaan</th>
        ${days.map(d => `<th class="dh ${d === t ? 'today' : ''}">${parseYmd(d).toLocaleDateString('id-ID', { weekday: 'short' })}<small>${parseYmd(d).getDate()}</small></th>`).join('')}
        <th>Beruntun</th><th>30 hari</th><th></th></tr></thead>
      <tbody>${S.habits.map(h => {
        const set = new Set(h.done || []);
        return `<tr><td class="hname">${h.emoji ? `<span class="em">${esc(h.emoji)}</span>` : ''}${esc(h.name)}</td>
          ${days.map(d => `<td><button class="day ${set.has(d) ? 'on' : ''} ${d === t ? 'is-today' : ''}" data-act="toggleHabit" data-id="${h.id}" data-date="${d}" aria-label="${esc(h.name)} ${d}">${set.has(d) ? ICON.check : ''}</button></td>`).join('')}
          <td class="num">${streak(h)}<small> hari</small></td>
          <td class="num">${rate30(h)}%</td>
          <td class="acts"><button class="icon-btn" data-act="editHabit" data-id="${h.id}" title="Ganti nama">${ICON.edit}</button><button class="icon-btn danger" data-act="deleteHabit" data-id="${h.id}" title="Hapus">${ICON.trash}</button></td></tr>`;
      }).join('')}</tbody></table></div>`
      : `<p class="empty">Belum ada kebiasaan. Mulai dari satu yang kecil saja.</p>`}
  </section>`;
}

/* ================================================================ DATA */
function renderData() {
  const theme = getTheme();
  return `
  <header class="page-head"><div><p class="eyebrow">Pengaturan</p><h1>Data &amp; tampilan</h1></div></header>
  <div class="grid-2">
    <section class="card">
      <h2>Cadangan</h2>
      ${cloud.active
        ? `<p class="muted">Data tersimpan di cloud (Supabase) dan disalin di perangkat ini supaya bisa dipakai offline. Sesekali unduh cadangan dan simpan di Google Drive. File cadangan dari versi laptop (localhost) juga bisa dipulihkan ke sini.</p>`
        : `<p class="muted">Semua data tersimpan di komputer kamu sendiri, di file <code>data/ruang.db</code> dalam folder aplikasi. Server juga otomatis membuat salinan harian di <code>data/backup/</code> (14 hari terakhir).</p>`}
      <div class="btn-row">
        ${cloud.active ? `<button class="btn primary" data-act="exportCloud">${ICON.download} Unduh cadangan (.json)</button>` : `<a class="btn primary" href="/api/export" download>${ICON.download} Unduh cadangan (.json)</a>`}
        <button class="btn" data-act="importClick">${ICON.upload} Pulihkan dari file…</button>
        <input type="file" id="importFile" accept=".json,application/json" hidden data-change="importFile">
      </div>
    </section>
    <section class="card hp-card">
      <h2>${cloud.active ? 'Akun &amp; sinkron' : 'Buka di HP'}</h2>
      <div id="hpInfo"><p class="muted">Memeriksa…</p></div>
    </section>
    <section class="card">
      <h2>Tampilan</h2>
      <label>Tema<select data-change="theme">
        <option value="light" ${theme === 'light' ? 'selected' : ''}>Terang (biru–mint)</option>
        <option value="auto" ${theme === 'auto' ? 'selected' : ''}>Ikuti sistem</option>
        <option value="dark" ${theme === 'dark' ? 'selected' : ''}>Gelap</option>
      </select></label>
    </section>
    <section class="card">
      <h2>Isi saat ini</h2>
      <dl class="kv">
        <dt>Catatan</dt><dd>${S.notes.length}</dd>
        <dt>Tugas (aktif / selesai)</dt><dd>${S.todos.filter(x => !x.done).length} / ${S.todos.filter(x => x.done).length}</dd>
        <dt>Transaksi</dt><dd>${S.transactions.length}</dd>
        <dt>Kebiasaan</dt><dd>${S.habits.length}</dd>
        <dt>Catatan olahraga</dt><dd>${S.workouts.length}</dd>
      </dl>
    </section>
    <section class="card">
      <h2>Tips</h2>
      <ul class="tips">
        <li>Bookmark <code>${esc(location.origin)}</code> di browser agar cepat dibuka.</li>
        <li>Di catatan, tekan <kbd>Ctrl</kbd>+<kbd>S</kbd> untuk menyimpan seketika (sebenarnya sudah tersimpan otomatis).</li>
        <li>Tulis <code>- [ ] sesuatu</code> di catatan untuk membuat ceklis yang bisa dicentang di mode pratinjau.</li>
        <li>Unduh cadangan sesekali dan simpan di Google Drive/flashdisk.</li>
      </ul>
    </section>
  </div>`;
}

/* ================================================================ OLAHRAGA */
const WTYPES = {
  lari: { label: 'Lari', color: '#2f6fe4', cardio: true },
  strength: { label: 'Strength training', short: 'Strength', color: '#7c5cdb' },
  sepeda: { label: 'Bersepeda', color: '#0e9f9a', cardio: true },
  jalan: { label: 'Jalan kaki', color: '#3a9bd8', cardio: true },
  renang: { label: 'Renang', color: '#1b7fc4', cardio: true },
  futsal: { label: 'Futsal / Bola', short: 'Futsal', color: '#e0874f' },
  badminton: { label: 'Badminton', color: '#c99312' },
  yoga: { label: 'Yoga / Stretching', short: 'Yoga', color: '#14a38b' },
  lainnya: { label: 'Lainnya', color: '#64748b' },
  istirahat: { label: 'Hari istirahat', short: 'Istirahat', color: '#94a3b8' },
};
const INTENSITY = { ringan: 'Ringan', sedang: 'Sedang', berat: 'Berat' };
const FEEL = { '': '—', segar: '😀 Segar', biasa: '🙂 Biasa', capek: '😮‍💨 Capek', pegal: '🤕 Pegal / sakit' };
const EX_SUGGEST = ['Squat', 'Bench press', 'Deadlift', 'Overhead press', 'Barbell row', 'Pull up', 'Push up', 'Lat pulldown', 'Leg press', 'Lunges', 'Romanian deadlift', 'Hip thrust', 'Dumbbell curl', 'Tricep pushdown', 'Shoulder press', 'Plank'];
const wLabel = (t, short) => { const x = WTYPES[t] || WTYPES.lainnya; return (short && x.short) || x.label; };
const wColor = t => (WTYPES[t] || WTYPES.lainnya).color;
const isCardio = t => !!(WTYPES[t] && WTYPES[t].cardio);
const num = v => { const n = parseFloat(String(v ?? '').replace(',', '.')); return isFinite(n) ? n : 0; };
const fmtKm = n => (Math.round(num(n) * 100) / 100).toLocaleString('id-ID');
const fmtFull = s => fmtDate(s, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const daysBetween = (a, b) => Math.round((parseYmd(b) - parseYmd(a)) / 86400000);
const fmtClock = s => `${Math.floor(s / 60)}:${pad(s % 60)}`;

function parseDur(v) { /* "45" = 45 menit, "32:15" = mm:ss, "1:05:30" = j:mm:ss */
  v = String(v || '').trim();
  if (!v) return 0;
  if (/^\d+([.,]\d+)?$/.test(v)) return Math.round(num(v) * 60);
  const p = v.split(':').map(Number);
  if (p.some(x => !isFinite(x))) return 0;
  return p.length >= 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + (p[1] || 0);
}
function parseRest(v) { /* "90" = detik, "1:30" = mm:ss */
  v = String(v || '').trim();
  if (!v) return 0;
  if (v.includes(':')) { const [m, s] = v.split(':').map(Number); return (m || 0) * 60 + (s || 0); }
  return Math.round(num(v));
}
function durInput(s) {
  s = Math.round(s || 0); if (!s) return '';
  const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60;
  if (!x) return `${h * 60 + m}`;
  return h ? `${h}:${pad(m)}:${pad(x)}` : `${m}:${pad(x)}`;
}
function fmtDur(s) {
  s = Math.round(s || 0); if (!s) return '';
  const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60;
  if (h) return m ? `${h} j ${m} mnt` : `${h} jam`;
  return x ? `${m} mnt ${x} dtk` : `${m} mnt`;
}
const fmtRest = s => (s >= 60 ? (s % 60 ? fmtClock(s) : `${s / 60} mnt`) : `${s} dtk`);
function pace(sec, km) {
  km = num(km); if (!sec || !km) return '';
  const p = Math.round(sec / km);
  return `${Math.floor(p / 60)}:${pad(p % 60)} /km`;
}
const volume = w => (w.exercises || []).reduce((a, e) => a + num(e.sets) * num(e.reps) * num(e.kg), 0);

/* ---------- tampilan utama */
function renderSport() {
  const m = S.ui.wMonth, t = ymd();
  const inMonth = S.workouts.filter(w => (w.date || '').startsWith(m));
  const act = inMonth.filter(w => w.type !== 'istirahat');
  const rest = inMonth.filter(w => w.type === 'istirahat');
  const runs = inMonth.filter(w => w.type === 'lari');
  const runKm = runs.reduce((a, w) => a + num(w.distance_km), 0);
  const dur = act.reduce((a, w) => a + (w.duration_sec || 0), 0);
  const activeDays = new Set(act.map(w => w.date)).size;
  const sleeps = rest.map(w => num(w.sleep_h)).filter(Boolean);
  const lastAct = S.workouts.filter(w => w.type !== 'istirahat' && w.date <= t).map(w => w.date).sort().pop();
  const since = !lastAct ? 'belum ada catatan' : lastAct === t ? 'terakhir: hari ini' : `terakhir: ${daysBetween(lastAct, t)} hari lalu`;

  let list = inMonth.filter(w => (!S.ui.wType || w.type === S.ui.wType) && (!S.ui.wDay || w.date === S.ui.wDay));
  list.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.created_at - a.created_at));
  const byDate = {};
  list.forEach(w => (byDate[w.date] = byDate[w.date] || []).push(w));
  const usedTypes = uniq(inMonth.map(w => w.type));

  return `
  <header class="page-head">
    <div><p class="eyebrow">Olahraga</p><h1>Jurnal olahraga</h1></div>
    <div class="month-nav">
      <button class="icon-btn" data-act="wMonth" data-n="-1" title="Bulan sebelumnya">${ICON.left}</button>
      <b>${monthLabel(m)}</b>
      <button class="icon-btn" data-act="wMonth" data-n="1" title="Bulan berikutnya">${ICON.right}</button>
      ${m === monthKey(new Date()) ? '' : `<button class="btn ghost sm" data-act="wMonth" data-n="0">Bulan ini</button>`}
    </div>
  </header>

  <div class="w-actions">
    <button class="btn primary" data-act="newWorkout">${ICON.plus} Catat olahraga</button>
    <button class="btn" data-act="newWorkout" data-type="istirahat">${ICON.moon} Catat hari istirahat</button>
  </div>

  <div class="stats">
    ${stat('Hari aktif', activeDays, `${act.length} sesi · ${since}`)}
    ${stat('Total durasi', fmtDur(dur) || '0 mnt', act.length ? `rata-rata ${fmtDur(Math.round(dur / Math.max(1, act.filter(w => w.duration_sec).length))) || '-'} / sesi` : 'bulan ini')}
    ${stat('Jarak lari', `${fmtKm(runKm)} km`, `${runs.length} kali lari`, 'good')}
    ${stat('Hari istirahat', rest.length, sleeps.length ? `rata-rata tidur ${fmtKm(sleeps.reduce((a, b) => a + b, 0) / sleeps.length)} jam` : 'bulan ini')}
  </div>

  <div class="sport-layout">
    <div class="stack">
      <section class="card">
        <div class="card-head"><h2>Kalender</h2>${S.ui.wDay ? `<button class="btn ghost sm" data-act="wDay" data-d="${S.ui.wDay}">Tampilkan semua hari</button>` : '<span class="muted small">klik tanggal untuk melihat harinya</span>'}</div>
        ${calendarHtml(m, inMonth)}
      </section>

      <section class="card">
        <div class="card-head"><h2>Riwayat${S.ui.wDay ? ' · ' + fmtDate(S.ui.wDay, { day: 'numeric', month: 'long' }) : ''}</h2></div>
        ${usedTypes.length > 1 ? `<div class="chips">${usedTypes.map(k => `<button class="chip-btn ${S.ui.wType === k ? 'on' : ''}" data-act="wFilter" data-v="${k}">${wLabel(k, true)}</button>`).join('')}</div>` : ''}
        ${Object.keys(byDate).length ? Object.keys(byDate).map(d => {
          const rel = d === t ? 'Hari ini' : d === addDays(t, -1) ? 'Kemarin' : '';
          return `<div class="day-group"><h3><span>${fmtFull(d)}</span><span>${rel}</span></h3>${byDate[d].map(workoutItem).join('')}</div>`;
        }).join('') : `<div class="empty">${S.ui.wDay ? `Tidak ada catatan di tanggal ini. <button class="btn sm" data-act="newWorkout" data-date="${S.ui.wDay}">${ICON.plus} Catat</button>` : 'Belum ada catatan olahraga di bulan ini.'}</div>`}
      </section>
    </div>

    <div class="stack">
      ${timerHtml()}
      ${recordsHtml()}
    </div>
  </div>`;
}

function calendarHtml(m, entries) {
  const [y, mo] = m.split('-').map(Number);
  const startDow = (new Date(y, mo - 1, 1).getDay() + 6) % 7;
  const days = new Date(y, mo, 0).getDate(), t = ymd();
  const by = {};
  entries.forEach(w => (by[w.date] = by[w.date] || []).push(w));
  let cells = '';
  for (let i = 0; i < startDow; i++) cells += '<span></span>';
  for (let d = 1; d <= days; d++) {
    const ds = `${m}-${pad(d)}`, es = by[ds] || [];
    const onlyRest = es.length && es.every(w => w.type === 'istirahat');
    const types = uniq(es.map(w => w.type)).slice(0, 3);
    cells += `<button class="cal-d ${es.length ? (onlyRest ? 'rest' : 'has') : ''} ${ds === t ? 'today' : ''} ${ds === S.ui.wDay ? 'sel' : ''} ${ds > t ? 'future' : ''}" data-act="wDay" data-d="${ds}" title="${fmtFull(ds)}${es.length ? ': ' + es.map(w => wLabel(w.type, true)).join(', ') : ''}">
      <span>${d}</span><span class="dots">${types.map(k => `<i style="--c:${wColor(k)}"></i>`).join('')}</span></button>`;
  }
  return `<div class="cal">${['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map(h => `<span class="cal-h">${h}</span>`).join('')}${cells}</div>
    <div class="legend">${['lari', 'strength', 'sepeda', 'istirahat'].map(k => `<span><i style="--c:${wColor(k)}"></i>${wLabel(k, true)}</span>`).join('')}<span><i style="--c:${wColor('lainnya')}"></i>Lainnya</span></div>`;
}

function workoutItem(w) {
  const mt = [];
  if (w.type === 'istirahat') {
    if (w.sleep_h) mt.push(`Tidur ${fmtKm(w.sleep_h)} jam`);
  } else {
    if (w.duration_sec) mt.push(fmtDur(w.duration_sec));
    if (num(w.distance_km)) mt.push(`${fmtKm(w.distance_km)} km`);
    if (['lari', 'jalan'].includes(w.type) && pace(w.duration_sec, w.distance_km)) mt.push(`Pace ${pace(w.duration_sec, w.distance_km)}`);
    if (w.type === 'strength') {
      const sets = (w.exercises || []).reduce((a, e) => a + num(e.sets), 0);
      if (sets) mt.push(`${sets} set`);
      const v = volume(w); if (v) mt.push(`Volume ${Math.round(v).toLocaleString('id-ID')} kg`);
      if (w.rest_sec) mt.push(`Istirahat ${fmtRest(w.rest_sec)}/set`);
    }
    if (w.intensity) mt.push(INTENSITY[w.intensity] || w.intensity);
  }
  if (w.feel && FEEL[w.feel]) mt.push(FEEL[w.feel]);
  return `<article class="w-item" style="--c:${wColor(w.type)}">
    <span class="w-bar"></span>
    <div class="w-body">
      <div class="w-top"><span class="w-type">${wLabel(w.type)}</span>${w.title ? `<span class="w-title">${esc(w.title)}</span>` : ''}
        <span class="spacer"></span>
        <button class="icon-btn" data-act="editWorkout" data-id="${w.id}" title="Ubah">${ICON.edit}</button></div>
      ${mt.length ? `<div class="w-metrics">${mt.map(x => `<span>${esc(x)}</span>`).join('')}</div>` : ''}
      ${(w.exercises || []).length ? `<ul class="w-ex">${w.exercises.map(e => `<li><b>${esc(e.name)}</b> ${num(e.sets) || '?'}×${num(e.reps) || '?'}${num(e.kg) ? ` @ ${fmtKm(e.kg)} kg` : ''}</li>`).join('')}</ul>` : ''}
      ${w.note ? `<p class="w-note">${esc(w.note)}</p>` : ''}
    </div>
  </article>`;
}

function recordsHtml() {
  const t = ymd(), y = t.slice(0, 4);
  const runs = S.workouts.filter(w => w.type === 'lari' && num(w.distance_km) > 0);
  const longest = runs.reduce((a, w) => (!a || num(w.distance_km) > num(a.distance_km) ? w : a), null);
  const paced = runs.filter(w => w.duration_sec && num(w.distance_km) >= 1);
  const best = paced.reduce((a, w) => (!a || w.duration_sec / num(w.distance_km) < a.duration_sec / num(a.distance_km) ? w : a), null);
  const lifts = {};
  S.workouts.filter(w => w.type === 'strength').forEach(w => (w.exercises || []).forEach(e => {
    const k = String(e.name || '').trim().toLowerCase(); if (!k || !num(e.kg)) return;
    if (!lifts[k] || num(e.kg) > lifts[k].kg) lifts[k] = { name: e.name, kg: num(e.kg), date: w.date };
  }));
  const top = Object.values(lifts).sort((a, b) => b.kg - a.kg).slice(0, 6);
  const yr = S.workouts.filter(w => (w.date || '').startsWith(y) && w.type !== 'istirahat');
  const yrKm = yr.filter(w => w.type === 'lari').reduce((a, w) => a + num(w.distance_km), 0);
  const yrDur = yr.reduce((a, w) => a + (w.duration_sec || 0), 0);
  return `<section class="card">
    <div class="card-head"><h2>Rekor pribadi</h2></div>
    <dl class="kv">
      <dt>Lari terjauh</dt><dd>${longest ? `${fmtKm(longest.distance_km)} km <small>${fmtDate(longest.date, { day: 'numeric', month: 'short', year: 'numeric' })}</small>` : '—'}</dd>
      <dt>Pace terbaik (≥1 km)</dt><dd>${best ? `${pace(best.duration_sec, best.distance_km)} <small>${fmtDate(best.date, { day: 'numeric', month: 'short', year: 'numeric' })}</small>` : '—'}</dd>
      ${top.map(l => `<dt>${esc(l.name)}</dt><dd>${fmtKm(l.kg)} kg <small>${fmtDate(l.date, { day: 'numeric', month: 'short' })}</small></dd>`).join('')}
    </dl>
    <p class="group-label">Tahun ${y}</p>
    <dl class="kv">
      <dt>Sesi olahraga</dt><dd>${yr.length}</dd>
      <dt>Total lari</dt><dd>${fmtKm(yrKm)} km</dd>
      <dt>Total durasi</dt><dd>${fmtDur(yrDur) || '0 mnt'}</dd>
    </dl>
  </section>`;
}

/* ---------- form catat / ubah */
let wDraft = null;
function workoutDraftNew(type, date) {
  return { type, date: date || ymd(), title: '', duration_sec: 0, distance_km: '', intensity: 'sedang', feel: '', rest_sec: 90,
    exercises: type === 'strength' ? [{ name: '', sets: 3, reps: 10, kg: '' }] : [], sleep_h: '', note: '' };
}
const optList = (obj, sel) => Object.entries(obj).map(([k, v]) => `<option value="${k}" ${k === (sel || '') ? 'selected' : ''}>${v}</option>`).join('');

function workoutModal(w) {
  const t = w.type, rest = t === 'istirahat', cardio = isCardio(t);
  const exNames = uniq([...EX_SUGGEST, ...S.workouts.flatMap(x => (x.exercises || []).map(e => e.name))]);
  return `<form class="modal-body w-form" data-form="saveWorkout" data-id="${w.id || ''}">
    <h2>${w.id ? 'Ubah catatan' : rest ? 'Catat hari istirahat' : 'Catat olahraga'}</h2>
    <div class="type-grid" role="radiogroup" aria-label="Jenis">${Object.keys(WTYPES).map(k =>
      `<label class="type-pill"><input type="radio" name="type" value="${k}" ${k === t ? 'checked' : ''} data-change="wType"><span style="--c:${wColor(k)}">${wLabel(k, true)}</span></label>`).join('')}</div>
    <div class="row2">
      <label>Tanggal<input type="date" name="date" value="${esc(w.date)}" required></label>
      ${rest ? `<label>Jam tidur semalam<input name="sleep_h" inputmode="decimal" placeholder="mis. 7,5" value="${esc(w.sleep_h ?? '')}" autocomplete="off"></label>`
        : `<label>${t === 'lainnya' ? 'Nama olahraga' : 'Judul sesi (opsional)'}<input name="title" value="${esc(w.title || '')}" autocomplete="off"
            placeholder="${t === 'lari' ? 'mis. Easy run, Interval' : t === 'strength' ? 'mis. Push day, Leg day' : t === 'lainnya' ? 'mis. Basket' : 'opsional'}" ${t === 'lainnya' ? 'required' : ''}></label>`}
    </div>
    ${rest ? '' : `<div class="row2">
      <label>Durasi<input name="duration" placeholder="mis. 45 atau 32:15" value="${esc(durInput(w.duration_sec))}" autocomplete="off"></label>
      ${cardio ? `<label>Jarak (km)<input name="distance_km" inputmode="decimal" placeholder="mis. 5,2" value="${esc(w.distance_km ?? '')}" autocomplete="off"></label>`
        : `<label>Intensitas<select name="intensity">${optList(INTENSITY, w.intensity)}</select></label>`}
    </div>`}
    <div class="row2">
      ${cardio ? `<label>Intensitas<select name="intensity">${optList(INTENSITY, w.intensity)}</select></label>` : ''}
      <label>Kondisi badan<select name="feel">${optList(FEEL, w.feel)}</select></label>
    </div>
    ${t === 'strength' ? `<div class="ex-block">
      <div class="ex-head"><span>Latihan</span><span>Set</span><span>Reps</span><span>kg</span><span></span></div>
      ${(w.exercises || []).map((e, i) => `<div class="ex-row">
        <input name="ex_name" list="exList" value="${esc(e.name || '')}" placeholder="Nama latihan" autocomplete="off" aria-label="Nama latihan">
        <input name="ex_sets" inputmode="numeric" value="${esc(e.sets ?? '')}" aria-label="Set">
        <input name="ex_reps" inputmode="numeric" value="${esc(e.reps ?? '')}" aria-label="Reps">
        <input name="ex_kg" inputmode="decimal" value="${esc(e.kg ?? '')}" placeholder="0" aria-label="Beban kg">
        <button type="button" class="icon-btn danger" data-act="wExDel" data-i="${i}" title="Hapus baris">${ICON.trash}</button></div>`).join('')}
      <button type="button" class="btn ghost sm add-ex" data-act="wExAdd">${ICON.plus} Tambah latihan</button>
      <datalist id="exList">${exNames.map(n => `<option value="${esc(n)}">`).join('')}</datalist>
      <label>Istirahat antar set<input name="rest" placeholder="mis. 90 (detik) atau 1:30" value="${w.rest_sec ? (w.rest_sec >= 60 ? fmtClock(w.rest_sec) : w.rest_sec) : ''}" autocomplete="off"></label>
    </div>` : ''}
    <label>Catatan<textarea name="note" rows="2" placeholder="${rest ? 'mis. pegal di betis, tidur cukup' : 'mis. rute, cuaca, rasanya gimana'}">${esc(w.note || '')}</textarea></label>
    <div class="modal-actions">
      ${w.id ? `<button type="button" class="btn ghost danger" data-act="deleteWorkout" data-id="${w.id}">${ICON.trash} Hapus</button><span class="spacer"></span>` : ''}
      <button type="button" class="btn ghost" data-act="closeModal">Batal</button>
      <button class="btn primary">Simpan</button>
    </div>
  </form>`;
}

function readWorkoutForm(f) {
  const fd = new FormData(f);
  const g = k => String(fd.get(k) ?? '').trim();
  const has = k => fd.has(k);
  const w = { ...wDraft, type: g('type') || wDraft.type, date: g('date') || wDraft.date, feel: g('feel'), note: g('note') };
  if (has('title')) w.title = g('title');
  if (has('duration')) w.duration_sec = parseDur(g('duration'));
  if (has('distance_km')) w.distance_km = g('distance_km');
  if (has('intensity')) w.intensity = g('intensity');
  if (has('sleep_h')) w.sleep_h = g('sleep_h');
  if (has('rest')) w.rest_sec = parseRest(g('rest'));
  if ($('.ex-block', f)) {
    const n = fd.getAll('ex_name'), s = fd.getAll('ex_sets'), r = fd.getAll('ex_reps'), k = fd.getAll('ex_kg');
    w.exercises = n.map((x, i) => ({ name: String(x).trim(), sets: s[i], reps: r[i], kg: k[i] }));
  }
  return w;
}

function normWorkout(w) {
  const o = { type: w.type, date: w.date, title: '', note: w.note || '', feel: w.feel || '',
    duration_sec: 0, distance_km: '', intensity: '', exercises: [], rest_sec: 0, sleep_h: '' };
  if (w.type === 'istirahat') { o.sleep_h = num(w.sleep_h) || ''; return o; }
  o.title = w.title || '';
  o.duration_sec = w.duration_sec || 0;
  o.intensity = w.intensity || 'sedang';
  if (isCardio(w.type)) o.distance_km = num(w.distance_km) || '';
  if (w.type === 'strength') {
    o.exercises = (w.exercises || []).filter(e => e.name).map(e => ({ name: e.name, sets: num(e.sets), reps: num(e.reps), kg: num(e.kg) }));
    o.rest_sec = w.rest_sec || 0;
  }
  return o;
}
function rerenderWorkoutModal(focusSel) {
  $('#modal').innerHTML = workoutModal(wDraft);
  if (focusSel) { const el = $(focusSel, $('#modal')); if (el) el.focus(); }
}

/* ---------- timer istirahat antar set */
const T = { total: 90, left: 90, running: false, end: 0, iv: null, done: false };
const RING = 2 * Math.PI * 54;
function timerHtml() {
  const presets = [[30, '30 dtk'], [60, '1 mnt'], [90, '1:30'], [120, '2 mnt'], [180, '3 mnt']];
  return `<section class="card timer-card">
    <div class="card-head"><h2>Timer istirahat</h2><span class="muted small">antar set</span></div>
    <div class="timer-face" id="timerFace">
      <svg viewBox="0 0 120 120" aria-hidden="true"><circle class="trk" cx="60" cy="60" r="54"/><circle class="prg" id="timerRing" cx="60" cy="60" r="54" stroke-dasharray="${RING}" stroke-dashoffset="0"/></svg>
      <span id="timerTime">${fmtClock(T.left)}</span>
    </div>
    <div class="timer-presets">${presets.map(([s, l]) => `<button class="chip-btn ${T.total === s ? 'on' : ''}" data-act="timerSet" data-s="${s}">${l}</button>`).join('')}</div>
    <div class="timer-ctrl">
      <button class="btn" data-act="timerAdd" data-s="-15">−15</button>
      <button class="btn primary" data-act="timerToggle" id="timerBtn">Mulai</button>
      <button class="btn" data-act="timerAdd" data-s="15">+15</button>
      <button class="icon-btn" data-act="timerReset" title="Ulang">${ICON.reset}</button>
    </div>
  </section>`;
}
function timerLeft() { return T.running ? Math.max(0, Math.ceil((T.end - Date.now()) / 1000)) : T.left; }
function updateTimerDom() {
  const left = timerLeft();
  const tt = $('#timerTime'); if (!tt) return;
  tt.textContent = fmtClock(left);
  $('#timerRing').style.strokeDashoffset = String(RING * (1 - left / Math.max(1, T.total)));
  $('#timerBtn').textContent = T.running ? 'Jeda' : left === 0 || left === T.total ? 'Mulai' : 'Lanjut';
  const f = $('#timerFace'); f.classList.toggle('run', T.running); f.classList.toggle('done', T.done);
}
let audioCtx = null;
function unlockAudio() { try { audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)(); audioCtx.resume(); } catch (e) {} }
function beep() {
  if (!audioCtx) return;
  [0, 0.35, 0.7].forEach(at => {
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.frequency.value = 880; o.connect(g); g.connect(audioCtx.destination);
    const s = audioCtx.currentTime + at;
    g.gain.setValueAtTime(0.0001, s); g.gain.exponentialRampToValueAtTime(0.4, s + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, s + 0.25);
    o.start(s); o.stop(s + 0.3);
  });
}
function timerTick() {
  const left = timerLeft();
  if (T.running && left === 0) {
    T.running = false; T.left = 0; T.done = true; clearInterval(T.iv);
    beep(); try { navigator.vibrate && navigator.vibrate([300, 150, 300, 150, 300]); } catch (e) {}
    toast('Istirahat selesai — ayo set berikutnya! 💪');
  }
  document.title = T.running ? `⏱ ${fmtClock(left)} · Ruang Pribadi` : document.title.replace(/^⏱ \S+ · /, '');
  updateTimerDom();
}
function timerStart() {
  unlockAudio();
  if (T.left <= 0) T.left = T.total;
  T.end = Date.now() + T.left * 1000; T.running = true; T.done = false;
  clearInterval(T.iv); T.iv = setInterval(timerTick, 250); timerTick();
}
function timerPause() { T.left = timerLeft(); T.running = false; clearInterval(T.iv); timerTick(); }

const SPORT_ACT = {
  newWorkout(el) {
    wDraft = workoutDraftNew(el.dataset.type || 'lari', el.dataset.date || S.ui.wDay || ymd());
    openModal(workoutModal(wDraft));
  },
  editWorkout(el) {
    const w = find('workouts', el.dataset.id); if (!w) return;
    wDraft = JSON.parse(JSON.stringify(w));
    if (wDraft.type === 'strength' && !(wDraft.exercises || []).length) wDraft.exercises = [{ name: '', sets: 3, reps: 10, kg: '' }];
    openModal(workoutModal(wDraft));
  },
  async deleteWorkout(el) {
    const w = find('workouts', el.dataset.id); if (!w) return;
    if (!confirm(`Hapus catatan ${wLabel(w.type)} tanggal ${fmtFull(w.date)}?`)) return;
    await del('workouts', w.id); closeModal(); render(); toast('Catatan dihapus');
  },
  wExAdd(el) {
    wDraft = readWorkoutForm(el.form);
    wDraft.exercises.push({ name: '', sets: 3, reps: 10, kg: '' });
    rerenderWorkoutModal('.ex-row:last-of-type input[name="ex_name"]');
  },
  wExDel(el) {
    wDraft = readWorkoutForm(el.form);
    wDraft.exercises.splice(+el.dataset.i, 1);
    rerenderWorkoutModal();
  },
  wMonth(el) { const n = +el.dataset.n; S.ui.wMonth = n ? shiftMonth(S.ui.wMonth, n) : monthKey(new Date()); S.ui.wDay = ''; render(); },
  wDay(el) { S.ui.wDay = S.ui.wDay === el.dataset.d ? '' : el.dataset.d; render(); },
  wFilter(el) { S.ui.wType = S.ui.wType === el.dataset.v ? '' : el.dataset.v; render(); },
  timerSet(el) { T.total = +el.dataset.s; T.left = T.total; render(); timerStart(); },
  timerToggle() { T.running ? timerPause() : timerStart(); },
  timerAdd(el) {
    const s = +el.dataset.s;
    if (T.running) { T.end = Math.max(Date.now(), T.end + s * 1000); T.total = Math.max(T.total, timerLeft()); }
    else { T.left = Math.max(0, T.left + s); T.total = Math.max(T.total, T.left); }
    timerTick();
  },
  timerReset() { T.running = false; T.done = false; clearInterval(T.iv); T.left = T.total; timerTick(); },
};
const SPORT_FORM = {
  async saveWorkout(f) {
    const w = normWorkout(readWorkoutForm(f));
    if (f.dataset.id) await patch('workouts', f.dataset.id, w); else await add('workouts', w);
    closeModal();
    S.ui.wMonth = w.date.slice(0, 7);
    if (S.ui.wDay && S.ui.wDay !== w.date) S.ui.wDay = '';
    render(); toast(w.type === 'istirahat' ? 'Hari istirahat dicatat' : 'Olahraga dicatat 💪');
  },
};
const SPORT_CHANGE = {
  wType(el) {
    wDraft = readWorkoutForm(el.form);
    if (wDraft.type === 'strength' && !(wDraft.exercises || []).length) wDraft.exercises = [{ name: '', sets: 3, reps: 10, kg: '' }];
    rerenderWorkoutModal();
  },
};

/* ================================================================ theme */
function getTheme() { try { return localStorage.getItem('rp-theme') || 'light'; } catch (e) { return 'light'; } }
function applyTheme(v) {
  if (v === 'auto') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = v;
  const dark = isDark();
  const b = $('.theme-btn');
  if (b) b.innerHTML = `${dark ? ICON.sun : ICON.moon}<span>${dark ? 'Mode terang' : 'Mode gelap'}</span>`;
}
function isDark() {
  const v = document.documentElement.dataset.theme;
  return v ? v === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
}
function setTheme(v) {
  try { localStorage.setItem('rp-theme', v); } catch (e) {}
  applyTheme(v);
}

async function loadHpInfo() {
  const box = $('#hpInfo'); if (!box) return;
  if (cloud.active) {
    const n = cloud.outbox.length;
    box.innerHTML = `<dl class="kv">
        <dt>Masuk sebagai</dt><dd>${esc(cloud.session && cloud.session.user.email || '-')}</dd>
        <dt>Status</dt><dd>${cloud.state === 'ok' && !n ? 'Tersinkron' : cloud.state === 'offline' ? 'Offline' : n ? n + ' perubahan menunggu' : esc(cloud.state || '-')}</dd>
        <dt>Terakhir sinkron</dt><dd>${cloud.lastSync ? new Date(cloud.lastSync).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}</dd>
      </dl>
      <div class="btn-row"><button class="btn" data-act="syncNow">Sinkron sekarang</button><button class="btn ghost danger" data-act="cloudLogout">Keluar</button></div>
      <p class="muted small">Pasang di HP Android: buka alamat aplikasi ini di Chrome → menu ⋮ → <b>Instal aplikasi</b> / <b>Tambahkan ke layar utama</b>. Di laptop: klik ikon instal di ujung kanan kolom alamat Chrome.</p>`;
    return;
  }
  let info;
  try { info = await api.req('GET', '/api/info'); } catch (e) { box.innerHTML = '<p class="muted">Tidak bisa memeriksa.</p>'; return; }
  const onPhone = !['127.0.0.1', 'localhost', '[::1]'].includes(location.hostname);
  if (info.lan) {
    box.innerHTML = `<p class="muted">Akses HP <b>aktif</b>${info.pin ? ' dan dilindungi PIN' : ''}. Pastikan HP tersambung ke <b>Wi-Fi yang sama</b> dengan laptop, lalu buka alamat ini di browser HP:</p>
      ${info.urls.map(u => `<div class="hp-url"><span>${esc(u)}</span><button class="btn sm" data-act="copyText" data-v="${esc(u)}">Salin</button></div>`).join('')}
      <p class="muted small">Setelah terbuka di HP, pilih <b>Tambahkan ke Layar Utama</b> (Add to Home Screen) supaya muncul seperti aplikasi.${onPhone ? ' Kamu sedang membukanya dari HP sekarang 👍' : ''}</p>`;
  } else {
    box.innerHTML = `<p class="muted">Akses HP <b>belum aktif</b>. Tutup jendela server yang sedang berjalan, lalu jalankan <code>MULAI-Akses-HP</code> (bukan MULAI biasa). Kamu akan diminta membuat PIN, lalu alamat untuk HP muncul di sini.</p>`;
  }
}

/* ================================================================ modal & toast */
function openModal(html) {
  const d = $('#modal'); d.innerHTML = html; d.showModal(); d.scrollTop = 0;
  const f = $('input:not([type="radio"]):not([type="date"]), textarea', d);
  if (f && matchMedia('(hover: hover)').matches) f.focus();
}
function closeModal() { const d = $('#modal'); if (d.open) d.close(); }
let toastTimer;
function toast(msg, type = '') {
  const el = $('#toast');
  el.textContent = msg; el.className = 'show ' + type;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => (el.className = ''), 2400);
}

/* ================================================================ actions */
const newTodo = d => ({ title: String(d.title || '').trim(), due: d.due || '', priority: d.priority || 'sedang', list: String(d.list || '').trim(), notes: '', done: false, done_at: '' });

const FORM = {
  async quickTodo(f, d) {
    if (!d.title.trim()) return;
    await add('todos', newTodo({ title: d.title, due: ymd() }));
    S.ui.focus = '[data-form="quickTodo"] input[name="title"]';
    render(); toast('Tugas ditambahkan untuk hari ini');
  },
  async addTodo(f, d) {
    if (!d.title.trim()) return;
    await add('todos', newTodo(d));
    S.ui.focus = '#todoTitle';
    render(); toast('Tugas ditambahkan');
  },
  async editTodo(f, d) {
    await patch('todos', f.dataset.id, { title: d.title.trim(), notes: d.notes.trim(), due: d.due || '', priority: d.priority, list: d.list.trim() });
    closeModal(); render(); toast('Tugas diperbarui');
  },
  async addTx(f, d) {
    const amount = parseMoney(d.amount);
    if (!amount) throw new Error('Isi jumlah uangnya dulu');
    const date = d.date || ymd();
    await add('transactions', { type: d.type === 'masuk' ? 'masuk' : 'keluar', amount, category: d.category.trim() || 'Lainnya', date, note: d.note.trim() });
    S.ui.txType = d.type; S.ui.month = date.slice(0, 7); S.ui.focus = '#txAmount';
    render(); toast(d.type === 'masuk' ? 'Pemasukan dicatat' : 'Pengeluaran dicatat');
  },
  async addHabit(f, d) {
    if (!d.name.trim()) return;
    await add('habits', { name: d.name.trim(), emoji: d.emoji.trim(), done: [] });
    S.ui.focus = '#habitName'; render(); toast('Kebiasaan ditambahkan');
  },
};

const ACT = {
  /* tugas */
  async toggleTodo(el) {
    const x = find('todos', el.dataset.id); if (!x) return;
    const was = x.done;
    await patch('todos', x.id, { done: !was, done_at: !was ? ymd() : '' });
    render(); if (!was) toast('Selesai! ✓');
  },
  editTodo(el) { const x = find('todos', el.dataset.id); if (x) openModal(todoModal(x)); },
  async deleteTodo(el) {
    const x = find('todos', el.dataset.id); if (!x) return;
    if (!confirm(`Hapus tugas "${x.title}"?`)) return;
    await del('todos', x.id); render(); toast('Tugas dihapus');
  },
  async clearDone() {
    const done = S.todos.filter(x => x.done && (!S.ui.todoList || x.list === S.ui.todoList));
    if (!done.length || !confirm(`Hapus ${done.length} tugas yang sudah selesai?`)) return;
    for (const x of done) await del('todos', x.id);
    render(); toast(`${done.length} tugas dihapus`);
  },
  todoFilter(el) { S.ui.todoFilter = el.dataset.v; render(); },
  todoList(el) { S.ui.todoList = S.ui.todoList === el.dataset.v ? '' : el.dataset.v; render(); },
  closeModal() { closeModal(); },

  /* catatan */
  async newNote() {
    await leaveNote();
    const n = await add('notes', { title: '', content: '', tags: [], pinned: false });
    S.ui.noteId = n.id; S.ui.notePreview = false; S.ui.noteQuery = ''; S.ui.noteTag = '';
    S.ui.focus = '#noteTitle';
    if (S.ui.view !== 'catatan') location.hash = '#catatan'; else render();
  },
  async openNote(el) {
    if (el.dataset.id === S.ui.noteId && S.ui.view === 'catatan') return;
    await leaveNote();
    S.ui.noteId = el.dataset.id; S.ui.notePreview = false;
    if (S.ui.view !== 'catatan') location.hash = '#catatan'; else render();
  },
  async closeNote() { await leaveNote(); S.ui.noteId = null; render(); },
  async togglePin() {
    const n = find('notes', S.ui.noteId); if (!n) return;
    await flushNote(); await patch('notes', n.id, { pinned: !n.pinned }); render();
  },
  togglePreview() { S.ui.notePreview = !S.ui.notePreview; if (!S.ui.notePreview) S.ui.focus = '#noteBody'; render(); },
  async deleteNote() {
    const n = find('notes', S.ui.noteId); if (!n) return;
    if ((n.title || n.content) && !confirm(`Hapus catatan "${n.title || 'Tanpa judul'}"?`)) return;
    clearTimeout(noteSave.timer); noteSave.pending = null;
    await del('notes', n.id); S.ui.noteId = null; render(); toast('Catatan dihapus');
  },
  noteTag(el) { S.ui.noteTag = S.ui.noteTag === el.dataset.v ? '' : el.dataset.v; refreshNoteList(); },
  toggleCheck(el) {
    const n = find('notes', S.ui.noteId); if (!n) return;
    const lines = (n.content || '').split('\n'), i = +el.dataset.line;
    if (lines[i] == null) return;
    lines[i] = lines[i].replace(/\[([ xX])\]/, (_, c) => (c.trim() ? '[ ]' : '[x]'));
    queueNoteSave(n.id, { content: lines.join('\n') }); render();
  },

  /* keuangan */
  monthPrev() { S.ui.month = shiftMonth(S.ui.month, -1); render(); },
  monthNext() { S.ui.month = shiftMonth(S.ui.month, 1); render(); },
  monthNow() { S.ui.month = monthKey(new Date()); render(); },
  async deleteTx(el) {
    const x = find('transactions', el.dataset.id); if (!x) return;
    if (!confirm(`Hapus transaksi ${x.category} ${rupiah(x.amount)}?`)) return;
    await del('transactions', x.id); render(); toast('Transaksi dihapus');
  },

  /* kebiasaan */
  async toggleHabit(el) {
    const h = find('habits', el.dataset.id); if (!h) return;
    const set = new Set(h.done || []), d = el.dataset.date;
    set.has(d) ? set.delete(d) : set.add(d);
    await patch('habits', h.id, { done: [...set].sort() }); render();
  },
  async editHabit(el) {
    const h = find('habits', el.dataset.id); if (!h) return;
    const name = prompt('Nama kebiasaan:', h.name);
    if (name && name.trim()) { await patch('habits', h.id, { name: name.trim() }); render(); }
  },
  async deleteHabit(el) {
    const h = find('habits', el.dataset.id); if (!h) return;
    if (!confirm(`Hapus kebiasaan "${h.name}" beserta riwayatnya?`)) return;
    await del('habits', h.id); render(); toast('Kebiasaan dihapus');
  },

  /* data & tema */
  importClick() { $('#importFile').click(); },
  async copyText(el) {
    try { await navigator.clipboard.writeText(el.dataset.v); toast('Alamat disalin'); }
    catch (e) { prompt('Salin alamat ini:', el.dataset.v); }
  },
  toggleTheme() { setTheme(isDark() ? 'light' : 'dark'); if (S.ui.view === 'data') render(); },
};

const INPUT = {
  noteField(el) {
    if (!S.ui.noteId) return;
    const v = el.name === 'tags' ? parseTags(el.value) : el.value;
    queueNoteSave(S.ui.noteId, { [el.name]: v });
  },
  noteSearch(el) { S.ui.noteQuery = el.value; refreshNoteList(); },
  money(el) { const digits = el.value.replace(/\D/g, '').replace(/^0+/, ''); el.value = digits ? Number(digits).toLocaleString('id-ID') : ''; },
};

const CHANGE = {
  txType(el) { S.ui.txType = el.value; const c = $('#txCategory'); if (c) c.setAttribute('list', el.value === 'masuk' ? 'catIn' : 'catOut'); },
  theme(el) { setTheme(el.value); },
  async importFile(el) {
    const file = el.files[0]; if (!file) return;
    let data;
    try { data = JSON.parse(await file.text()); } catch (e) { el.value = ''; throw new Error('File ini bukan JSON yang valid'); }
    const c = data && data.collections;
    if (!c) { el.value = ''; throw new Error('Ini bukan file cadangan Ruang Pribadi'); }
    const info = `${(c.notes || []).length} catatan, ${(c.todos || []).length} tugas, ${(c.transactions || []).length} transaksi, ${(c.habits || []).length} kebiasaan`;
    if (!confirm(`Pulihkan dari cadangan ini?\n\nIsi file: ${info}.\n\nSemua data sekarang akan DIGANTI. (Salinan data lama tetap disimpan otomatis di folder data/backup.)`)) { el.value = ''; return; }
    if (cloud.active) {
      if (!navigator.onLine) { el.value = ''; throw new Error('Butuh koneksi internet untuk memulihkan data'); }
      toast('Mengunggah data…');
      await cloud.replaceAll(c);
      COLS.forEach(k => (S[k] = []));
      Object.assign(S, await cloud.pullAll()); saveCache();
    } else {
      await api.req('POST', '/api/import', data);
      Object.assign(S, await api.all());
    }
    S.ui.noteId = null; el.value = '';
    render(); toast('Data berhasil dipulihkan');
  },
};

Object.assign(ACT, SPORT_ACT, CLOUD_ACT);
Object.assign(FORM, SPORT_FORM, CLOUD_FORM);
Object.assign(CHANGE, SPORT_CHANGE);

async function run(fn) {
  try { await fn(); } catch (err) { console.error(err); toast(err.message || 'Terjadi kesalahan', 'error'); }
}

/* ================================================================ events */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el || !ACT[el.dataset.act]) return;
  e.preventDefault();
  run(() => ACT[el.dataset.act](el, e));
});
document.addEventListener('submit', e => {
  const f = e.target, fn = FORM[f.dataset.form];
  if (!fn) return;
  e.preventDefault();
  run(() => fn(f, Object.fromEntries(new FormData(f))));
});
document.addEventListener('input', e => { const fn = INPUT[e.target.dataset.input]; if (fn) fn(e.target, e); });
document.addEventListener('change', e => { const fn = CHANGE[e.target.dataset.change]; if (fn) run(() => fn(e.target, e)); });
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's' && S.ui.view === 'catatan') {
    e.preventDefault(); run(flushNote);
  }
});
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });
window.addEventListener('hashchange', () => run(route));
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flushNote(); });
window.addEventListener('pagehide', () => {
  const p = noteSave.pending;
  if (p && cloud.active) { noteSave.pending = null; patch('notes', p.id, p.data); return; }
  if (p) fetch(`/api/notes/${p.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p.data), keepalive: true });
});
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => applyTheme(getTheme()));
/* tanggal berganti saat aplikasi terbuka semalaman → segarkan tampilan */
let lastDay = ymd();
setInterval(() => { if (ymd() !== lastDay) { lastDay = ymd(); if (S.ui.view !== 'catatan') render(); } }, 60000);

/* ================================================================ boot */
(async function boot() {
  buildNav();
  applyTheme(getTheme());
  if ('serviceWorker' in navigator && window.isSecureContext) navigator.serviceWorker.register('sw.js').catch(() => {});
  $('#syncPill').addEventListener('click', () => syncNow());
  cloud.load();
  if (cloud.cfg) {
    cloud.active = true;
    startSyncLoop();
    if (!cloud.session) return showLogin();
    return enterApp();
  }
  try {
    Object.assign(S, await api.all());
  } catch (e) {
    return showSetup(e);
  }
  await route();
})();
