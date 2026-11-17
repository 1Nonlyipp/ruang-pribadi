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
  image: svg('<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.6"/><path d="m20.5 16-4.5-4.5L6 19.5"/>'),
  heading: svg('<path d="M6 4v16M18 4v16M6 12h12"/>'),
  list: svg('<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>'),
  olist: svg('<path d="M10 6h10M10 12h10M10 18h10"/><path d="M4 4.5h1.5V9M4 9h3M4 14.5c.5-.7 3-.9 3 .6 0 1.2-3 2.1-3 3.4h3"/>'),
  checklist: svg('<rect x="3.5" y="4" width="6" height="6" rx="1.5"/><path d="m4.8 7 1.3 1.3L8.4 5.8"/><rect x="3.5" y="14" width="6" height="6" rx="1.5"/><path d="M13 7h8M13 17h8"/>'),
  quote: svg('<path d="M5 6v12"/><path d="M10 8h10M10 12h10M10 16h7"/>'),
  callout: svg('<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><path d="M8 9.5h1M8 14.5h8M11.5 9.5h4.5"/>'),
  divider: svg('<path d="M3 12h18"/><path d="M8 7h8M8 17h8" opacity=".45"/>'),
  codeblock: svg('<path d="m9 8-4 4 4 4M15 8l4 4-4 4"/>'),
  cap: svg('<path d="M2.5 9.5 12 5l9.5 4.5L12 14z"/><path d="M6.5 11.5V16c0 1.4 2.5 2.8 5.5 2.8s5.5-1.4 5.5-2.8v-4.5"/><path d="M21.5 9.5v5"/>'),
  more: svg('<circle cx="5.5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="18.5" cy="12" r="1.4"/>'),
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
  notes: [], todos: [], transactions: [], habits: [], workouts: [], courses: [], sportlib: [],
  ui: {
    sTab: 'dash', dPeriod: 'week', dAnchor: ymd(), dTrend: 'km', stSub: 'routine', exQuery: '', exMuscle: '', runMore: false,
    todoKind: 'kuliah', lastCourse: '', flash: null, quickKind: 'kuliah',
    hMonth: monthKey(new Date()), kTab: 'semester', kFilter: 'semua', kQuery: '',
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
const COLS = ['notes', 'todos', 'transactions', 'habits', 'workouts', 'courses', 'sportlib'];
const BUCKET = 'ruang';
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
  async upload(blob) {
    const tok = await this.token();
    const ext = { 'image/webp': 'webp', 'image/png': 'png', 'image/gif': 'gif' }[blob.type] || 'jpg';
    const path = `${this.session.user.id}/${uid()}.${ext}`;
    let r;
    try {
      r = await fetch(`${this.cfg.url}/storage/v1/object/${BUCKET}/${path}`, {
        method: 'POST', headers: { apikey: this.cfg.key, Authorization: 'Bearer ' + tok, 'Content-Type': blob.type || 'image/jpeg', 'x-upsert': 'false', 'cache-control': '31536000' }, body: blob,
      });
    } catch (e) { throw Object.assign(new Error('Tidak ada koneksi — gambar belum bisa diunggah'), { network: true }); }
    if (!r.ok) {
      const d = await r.json().catch(() => ({}));
      const raw = JSON.stringify(d);
      throw new Error(/bucket|not found|row-level|policy|unauthorized|403|404/i.test(raw + r.status)
        ? 'Penyimpanan gambar belum disiapkan. Jalankan SETUP-SUPABASE-GAMBAR.sql di Supabase.' : (d.message || d.error || `Unggah gagal (HTTP ${r.status})`));
    }
    return path;
  },
  async signUrls(paths) {
    const tok = await this.token();
    let r;
    try {
      r = await fetch(`${this.cfg.url}/storage/v1/object/sign/${BUCKET}`, {
        method: 'POST', headers: { apikey: this.cfg.key, Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiresIn: 7 * 86400, paths }),
      });
    } catch (e) { throw netError(); }
    if (!r.ok) throw new Error(`Gagal memuat gambar (HTTP ${r.status})`);
    return r.json();
  },
  fullSignedUrl(u) {
    if (/^https?:/.test(u)) return u;
    return this.cfg.url + (u.startsWith('/storage/') ? '' : '/storage/v1') + u;
  },
  async removeFiles(paths) {
    if (!paths.length) return;
    try {
      const tok = await this.token();
      await fetch(`${this.cfg.url}/storage/v1/object/${BUCKET}`, { method: 'DELETE', headers: { apikey: this.cfg.key, Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' }, body: JSON.stringify({ prefixes: paths }) });
    } catch (e) {}
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
  el.hidden = true; /* status sinkron disembunyikan; lihat di menu Data */
  if (!cloud.active || !cloud.session || true) return;
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
/* [kunci, label, ikon, label pendek, tampil di bar bawah HP] */
const NAV = [
  ['beranda', 'Beranda', 'home', '', 1],
  ['tugas', 'Tugas', 'task', '', 1],
  ['catatan', 'Catatan', 'note', '', 1],
  ['kuliah', 'Studi', 'cap', '', 0],
  ['keuangan', 'Keuangan', 'wallet', 'Uang', 1],
  ['olahraga', 'Olahraga', 'run', '', 1],
  ['kebiasaan', 'Kebiasaan', 'habit', 'Habit', 0],
  ['data', 'Data', 'data', '', 0],
];
const VIEWS = {
  beranda: renderHome, catatan: renderNotes, tugas: renderTodos, kuliah: renderKuliah,
  keuangan: renderMoney, olahraga: renderOlahraga, kebiasaan: renderHabits, data: renderData,
};

function buildNav() {
  let mi = NAV.filter(n => !n[4]).length;
  $('#nav').innerHTML = NAV.map(([k, label, ic, short, main]) =>
    `<a href="#${k}" data-view="${k}" class="${main ? '' : 'nav-more'}" ${main ? '' : `style="--i:${--mi}"`}>${ICON[ic]}<span class="nl">${label}</span><span class="ns">${short || label}</span><b class="badge" data-badge="${k}" hidden></b></a>`).join('')
    + `<button type="button" class="nav-more-btn" data-act="navMore" aria-label="Menu lainnya">${ICON.more}<span class="ns">Lainnya</span></button>`;
}

async function route() {
  const v = location.hash.slice(1);
  const next = VIEWS[v] ? v : 'beranda';
  if (S.ui.view === 'catatan' && next !== 'catatan') await leaveNote();
  S.ui.view = next;
  $$('#nav a').forEach(a => a.classList.toggle('active', a.dataset.view === next));
  document.body.classList.remove('more-open');
  const moreBtn = $('.nav-more-btn'); if (moreBtn) moreBtn.classList.toggle('active', !NAV.find(n => n[0] === next)[4]);
  const label = NAV.find(n => n[0] === next)[1];
  document.title = `${label} · Ruang Pribadi`;
  closeSlash(); hideBubble();
  render();
  window.scrollTo(0, 0);
}

function render() {
  $('#view').innerHTML = VIEWS[S.ui.view]();
  updateBadges();
  if (S.ui.view === 'olahraga') updateTimerDom();
  if (S.ui.view === 'data') loadHpInfo();
  if (S.ui.view === 'catatan') mountNoteEditor();
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
  const late = open.filter(isLate).length;
  const kul = open.filter(x => todoKind(x) === 'kuliah').sort(sortTodos);
  const kulSoon = kul.filter(x => x.due && x.due <= addDays(t, 7));
  const kulShow = [...kulSoon, ...kul.filter(x => !kulSoon.includes(x))].slice(0, 6);
  const umumToday = open.filter(x => todoKind(x) === 'umum' && (!x.due || x.due <= t)).sort(sortTodos).slice(0, 6);
  const qk = S.ui.quickKind;

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

  <form class="quick k-${qk}" data-form="quickTodo">
    <div class="seg mini" role="radiogroup" aria-label="Jenis">
      <label><input type="radio" name="kind" value="kuliah" ${qk === 'kuliah' ? 'checked' : ''} data-change="quickKind"><span>📚 Tugas kuliah</span></label>
      <label><input type="radio" name="kind" value="umum" ${qk === 'umum' ? 'checked' : ''} data-change="quickKind"><span>✅ To-do</span></label>
    </div>
    <div class="quick-row">
      <input name="title" placeholder="${qk === 'kuliah' ? 'Tugas kuliah baru… (Enter)' : 'To-do baru untuk hari ini… (Enter)'}" autocomplete="off" aria-label="Judul" required>
      <input class="only-kuliah q-course" name="course" list="qCourses" placeholder="Mata kuliah" value="${esc(S.ui.lastCourse)}" autocomplete="off" aria-label="Mata kuliah">
      <input type="date" name="due" aria-label="Tanggal / deadline" title="${qk === 'kuliah' ? 'Deadline' : 'Tanggal (kosong = hari ini)'}">
      <input type="time" name="time_end" aria-label="Jam" title="${qk === 'kuliah' ? 'Jam deadline' : 'Jam'}">
      <button class="btn primary">${ICON.plus}<span>Tambah</span></button>
    </div>
    <datalist id="qCourses">${courseNames().map(l => `<option value="${esc(l)}">`).join('')}</datalist>
  </form>

  <div class="stats">
    ${stat('Tugas kuliah aktif', kul.length, late ? `${late} terlambat` : kulSoon.length ? `${kulSoon.length} deadline ≤ 7 hari` : 'aman', late ? 'warn' : '')}
    ${stat('Kebiasaan hari ini', `${hbDone}/${hb.length}`, !hb.length ? 'belum ada kebiasaan' : hbDone === hb.length ? 'semua beres 👏' : 'ayo lanjutkan', hb.length && hbDone === hb.length ? 'good' : '')}
    ${stat('Pengeluaran bulan ini', rupiah(out), `hari ini ${rupiah(todayOut)}`)}
    ${stat('Selisih bulan ini', rupiah(inc - out), `pemasukan ${rupiah(inc)}`, inc - out < 0 ? 'warn' : 'good')}
  </div>

  <div class="home-grid">
    <section class="card">
      <div class="card-head"><h2>📚 Deadline tugas kuliah</h2><a class="link" href="#tugas" data-act="goTodos" data-v="kuliah">Semua →</a></div>
      ${kulShow.length ? `<ul class="todo-list">${kulShow.map(x => todoRow(x)).join('')}</ul>` : `<p class="empty">Tidak ada tugas kuliah. 🎉</p>`}
      <div class="card-head sub"><h2>✅ To-do hari ini</h2><a class="link" href="#tugas" data-act="goTodos" data-v="umum">Semua →</a></div>
      ${umumToday.length ? `<ul class="todo-list">${umumToday.map(x => todoRow(x)).join('')}</ul>` : `<p class="empty">Belum ada to-do untuk hari ini.</p>`}
    </section>

    <div class="stack">
    ${homeStudyCard()}
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
const TASK_TYPES = ['Tugas', 'Laporan', 'Kuis', 'Presentasi', 'Praktikum', 'Proyek', 'UTS', 'UAS'];
const typeOptions = sel => `<option value="">—</option>` + TASK_TYPES.map(k => `<option ${k === sel ? 'selected' : ''}>${k}</option>`).join('');

/* tugas lama (sebelum ada pembagian) otomatis dianggap tugas kuliah, kecuali daftarnya jelas non-kuliah */
const todoKind = x => x.kind || (x.list && !/kuliah|tugas|kampus/i.test(x.list) ? 'umum' : 'kuliah');
const fmtTime = s => (s ? s.replace(':', '.') : '');
const nowHM = () => { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
function timeLabel(x) {
  const a = fmtTime(x.time_start), b = fmtTime(x.time_end);
  if (todoKind(x) === 'kuliah') return b ? `pukul ${b}` : '';
  return a && b ? `${a}–${b}` : a ? `${a}` : b ? `s/d ${b}` : '';
}
const deadlineKey = x => `${x.due || '9999-99-99'} ${x.time_start || x.time_end || '99:99'}`;
function isLate(x) {
  if (x.done || !x.due) return false;
  const t = ymd();
  if (x.due < t) return true;
  return x.due === t && !!x.time_end && x.time_end < nowHM();
}
function sortTodos(a, b) {
  const da = deadlineKey(a), db = deadlineKey(b);
  return (a.done - b.done) || (da < db ? -1 : da > db ? 1 : 0)
    || ((PRIO[a.priority] ?? 1) - (PRIO[b.priority] ?? 1)) || (a.created_at - b.created_at);
}
function courseNames() {
  return uniq([
    ...(S.courses || []).filter(c => c.status === 'diambil' && c.name).map(c => c.name).sort(),
    ...S.todos.filter(x => todoKind(x) === 'kuliah').map(x => x.course),
  ]);
}

function todoRow(x, opts = {}) {
  const t = ymd(), kind = todoKind(x);
  const late = isLate(x), today = !x.done && x.due === t;
  const tl = timeLabel(x);
  const dl = x.due && !x.done && kind === 'kuliah' ? daysBetween(t, x.due) : 0;
  const hMinus = dl > 1 && dl <= 14 ? ` · H-${dl}` : '';
  return `<li class="todo ${x.done ? 'done' : ''} prio-${x.priority || 'sedang'} ${S.ui.flash === x.id ? 'flash' : ''}">
    <button class="check" data-act="toggleTodo" data-id="${x.id}" aria-label="${x.done ? 'Batalkan selesai' : 'Tandai selesai'}">${x.done ? ICON.check : ''}</button>
    <div class="todo-main" data-act="editTodo" data-id="${x.id}" title="Klik untuk mengubah">
      <span class="todo-title">${esc(x.title)}</span>
      <span class="meta">
        ${x.due ? `<span class="chip ${late ? 'late' : today ? 'today' : ''}">${late ? 'Terlambat · ' : ''}${relDay(x.due)}${tl ? ' · ' + tl : ''}${hMinus}</span>` : tl ? `<span class="chip">${tl}</span>` : ''}
        ${kind === 'kuliah' && x.course ? `<span class="chip course">${esc(x.course)}</span>` : ''}
        ${kind === 'kuliah' && x.ttype ? `<span class="chip">${esc(x.ttype)}</span>` : ''}
        ${kind === 'umum' && x.list ? `<span class="chip">${esc(x.list)}</span>` : ''}
        ${x.priority === 'tinggi' ? '<span class="chip hi">Penting</span>' : ''}
        ${opts.showKind && kind === 'umum' ? '<span class="chip kind">To-do</span>' : ''}
      </span>
      ${x.notes ? `<span class="todo-notes">${esc(x.notes)}</span>` : ''}
    </div>
    <button class="icon-btn danger" data-act="deleteTodo" data-id="${x.id}" title="Hapus">${ICON.trash}</button>
  </li>`;
}

function todoGroups(items, t) {
  const tm = addDays(t, 1), wk = addDays(t, 7);
  const g = [['Terlambat', []], ['Hari ini', []], ['Besok', []], ['7 hari ke depan', []], ['Nanti', []], ['Tanpa tanggal', []]];
  for (const x of items) {
    const i = !x.due ? 5 : isLate(x) ? 0 : x.due === t ? 1 : x.due === tm ? 2 : x.due <= wk ? 3 : 4;
    g[i][1].push(x);
  }
  return g.filter(([, a]) => a.length);
}

const TODO_FILTERS = t => ({
  aktif: ['Aktif', x => !x.done],
  'hari-ini': ['Hari ini', x => !x.done && x.due && x.due <= t],
  mendatang: ['Mendatang', x => !x.done && x.due > t],
  selesai: ['Selesai', x => x.done],
});
const todoGroupKey = (x, K) => (K === 'kuliah' ? x.course || '' : x.list || '');

function todoFormHtml(K, preset) {
  const lists = uniq(S.todos.filter(x => todoKind(x) === 'umum').map(x => x.list)).sort();
  if (K === 'kuliah') {
    return `<form class="card add-todo" data-form="addTodo">
      <input type="hidden" name="kind" value="kuliah">
      <input id="todoTitle" name="title" placeholder="Tugas apa? mis. Laporan praktikum bab 3" required autocomplete="off" aria-label="Judul tugas">
      <div class="add-row">
        <label class="grow">Mata kuliah<input name="course" list="courseList" placeholder="Pilih / ketik" value="${esc(preset)}" autocomplete="off"></label>
        <label>Jenis<select name="ttype">${typeOptions('')}</select></label>
        <label>Deadline<input type="date" name="due"></label>
        <label>Jam<input type="time" name="time_end"></label>
        <label>Prioritas<select name="priority">${prioOptions('sedang')}</select></label>
        <button class="btn primary">${ICON.plus} Tambah</button>
      </div>
      <datalist id="courseList">${courseNames().map(l => `<option value="${esc(l)}">`).join('')}</datalist>
    </form>`;
  }
  return `<form class="card add-todo" data-form="addTodo">
    <input type="hidden" name="kind" value="umum">
    <input id="todoTitle" name="title" placeholder="Apa yang mau kamu lakukan?" required autocomplete="off" aria-label="Judul to-do">
    <div class="add-row">
      <label>Tanggal<input type="date" name="due"></label>
      <label>Mulai<input type="time" name="time_start"></label>
      <label>Selesai<input type="time" name="time_end"></label>
      <label class="grow">Kategori<input name="list" list="todoLists" placeholder="mis. Pribadi, Rumah" value="${esc(preset)}" autocomplete="off"></label>
      <label>Prioritas<select name="priority">${prioOptions('sedang')}</select></label>
      <button class="btn primary">${ICON.plus} Tambah</button>
    </div>
    <datalist id="todoLists">${lists.map(l => `<option value="${esc(l)}">`).join('')}</datalist>
  </form>`;
}

function renderTodos() {
  const t = ymd(), K = S.ui.todoKind, f = S.ui.todoFilter, L = S.ui.todoList;
  const ofKind = S.todos.filter(x => todoKind(x) === K);
  const openCount = k => S.todos.filter(x => !x.done && todoKind(x) === k).length;
  const lateCount = k => S.todos.filter(x => isLate(x) && todoKind(x) === k).length;
  const lists = uniq(ofKind.map(x => todoGroupKey(x, K))).sort();
  const base = ofKind.filter(x => !L || todoGroupKey(x, K) === L);
  const FILTERS = TODO_FILTERS(t);
  let items = base.filter(FILTERS[f][1]);
  items = f === 'selesai'
    ? items.sort((a, b) => (b.done_at || '').localeCompare(a.done_at || '') || b.updated_at - a.updated_at)
    : items.sort(sortTodos);

  let body;
  if (!items.length) {
    body = `<p class="empty">${f === 'selesai' ? 'Belum ada yang selesai.' : K === 'kuliah' ? 'Tidak ada tugas kuliah di sini. 🎉' : 'Tidak ada to-do di sini.'}</p>`;
  } else if (f === 'aktif') {
    body = todoGroups(items, t).map(([label, arr]) =>
      `<p class="group-label ${label === 'Terlambat' ? 'warn' : ''}">${label} <span>${arr.length}</span></p>
       <ul class="todo-list">${arr.map(x => todoRow(x)).join('')}</ul>`).join('');
  } else {
    body = `<ul class="todo-list">${items.map(x => todoRow(x)).join('')}</ul>`;
  }
  const preset = L || (K === 'kuliah' ? S.ui.lastCourse || '' : '');

  return `
  <header class="page-head"><div><p class="eyebrow">To-do</p><h1>Tugas</h1></div></header>

  <div class="kind-switch" role="tablist">
    <button class="kind-btn ${K === 'kuliah' ? 'on' : ''}" data-act="todoKind" data-v="kuliah">📚 Tugas Kuliah <span>${openCount('kuliah')}</span>${lateCount('kuliah') ? `<i>${lateCount('kuliah')} terlambat</i>` : ''}</button>
    <button class="kind-btn ${K === 'umum' ? 'on' : ''}" data-act="todoKind" data-v="umum">✅ To-do Umum <span>${openCount('umum')}</span></button>
  </div>

  ${todoFormHtml(K, preset)}

  <div class="toolbar">
    <div class="tabs" role="tablist">
      ${Object.entries(FILTERS).map(([k, [label, fn]]) =>
        `<button class="tab ${k === f ? 'on' : ''}" data-act="todoFilter" data-v="${k}">${label}<span class="n">${base.filter(fn).length}</span></button>`).join('')}
    </div>
    ${f === 'selesai' && items.length ? `<button class="btn ghost sm danger" data-act="clearDone">${ICON.trash} Hapus semua yang selesai</button>` : ''}
  </div>
  ${lists.filter(Boolean).length ? `<div class="chips">${lists.filter(Boolean).map(l => `<button class="chip-btn ${l === L ? 'on' : ''}" data-act="todoList" data-v="${esc(l)}">${esc(l)}</button>`).join('')}</div>` : ''}

  <section class="card list-card">${body}</section>`;
}

function todoModal(x) {
  const K = todoKind(x);
  const lists = uniq(S.todos.filter(y => todoKind(y) === 'umum').map(y => y.list)).sort();
  return `<form class="modal-body todo-form k-${K}" data-form="editTodo" data-id="${x.id}">
    <h2>Ubah ${K === 'kuliah' ? 'tugas kuliah' : 'to-do'}</h2>
    <div class="seg" role="radiogroup" aria-label="Jenis">
      <label><input type="radio" name="kind" value="kuliah" ${K === 'kuliah' ? 'checked' : ''} data-change="todoFormKind"><span>📚 Tugas kuliah</span></label>
      <label><input type="radio" name="kind" value="umum" ${K === 'umum' ? 'checked' : ''} data-change="todoFormKind"><span>✅ To-do umum</span></label>
    </div>
    <label>Judul<input name="title" required value="${esc(x.title)}" autocomplete="off"></label>
    <label>Catatan<textarea name="notes" rows="3" placeholder="Detail, link, dll. (opsional)">${esc(x.notes || '')}</textarea></label>
    <div class="row2 only-kuliah">
      <label>Mata kuliah<input name="course" list="courseListM" value="${esc(x.course || '')}" autocomplete="off"></label>
      <label>Jenis<select name="ttype">${typeOptions(x.ttype || '')}</select></label>
    </div>
    <div class="row3">
      <label><span class="only-kuliah">Deadline</span><span class="only-umum">Tanggal</span><input type="date" name="due" value="${esc(x.due || '')}"></label>
      <label class="only-umum">Mulai<input type="time" name="time_start" value="${esc(x.time_start || '')}"></label>
      <label><span class="only-kuliah">Jam deadline</span><span class="only-umum">Selesai</span><input type="time" name="time_end" value="${esc(x.time_end || '')}"></label>
    </div>
    <div class="row2">
      <label>Prioritas<select name="priority">${prioOptions(x.priority)}</select></label>
      <label class="only-umum">Kategori<input name="list" list="todoListsM" value="${esc(x.list || '')}" autocomplete="off"></label>
    </div>
    <datalist id="courseListM">${courseNames().map(l => `<option value="${esc(l)}">`).join('')}</datalist>
    <datalist id="todoListsM">${lists.map(l => `<option value="${esc(l)}">`).join('')}</datalist>
    <div class="modal-actions">
      <button type="button" class="btn ghost" data-act="closeModal">Batal</button>
      <button class="btn primary">Simpan</button>
    </div>
  </form>`;
}

const newTodo = d => {
  const kind = d.kind === 'umum' ? 'umum' : 'kuliah';
  return {
    kind, title: String(d.title || '').trim(), due: d.due || '',
    time_start: kind === 'umum' ? d.time_start || '' : '', time_end: d.time_end || '',
    priority: d.priority || 'sedang',
    course: kind === 'kuliah' ? String(d.course || '').trim() : '',
    ttype: kind === 'kuliah' ? d.ttype || '' : '',
    list: kind === 'umum' ? String(d.list || '').trim() : '',
    notes: '', done: false, done_at: '',
  };
};

/* pastikan item yang baru ditambah terlihat (penyebab "terhapus tapi tidak muncul": tersembunyi oleh filter) */
function revealTodo(x) {
  const t = ymd(), K = todoKind(x);
  S.ui.todoKind = K;
  if (!TODO_FILTERS(t)[S.ui.todoFilter][1](x)) S.ui.todoFilter = 'aktif';
  if (S.ui.todoList && todoGroupKey(x, K) !== S.ui.todoList) S.ui.todoList = '';
  S.ui.flash = x.id;
  setTimeout(() => { if (S.ui.flash === x.id) S.ui.flash = null; }, 2500);
}

/* ================================================================ CATATAN (editor ala Notion) */
const sortedNotes = arr => [...arr].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.updated_at - a.updated_at);
const parseTags = v => uniq(String(v).split(',').map(s => s.trim().replace(/^#/, '').toLowerCase()));
const snippet = s => String(s || '').replace(/^\s*[-*]\s+\[[ xX]\]/gm, '').replace(/[#*`>\[\]_-]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 110);
const noteHasImg = n => /<img/i.test(n.html || '');

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
        <span class="ni-title">${n.pinned ? ICON.pin : ''}<span>${esc(n.title || 'Tanpa judul')}</span>${noteHasImg(n) ? `<i class="ni-img">${ICON.image}</i>` : ''}</span>
        ${n.content ? `<span class="ni-snip">${esc(snippet(n.content))}</span>` : ''}
        <span class="ni-date">${timeAgo(n.updated_at)}</span></button></li>`).join('')}</ul>`
      : `<p class="empty">${q || tag ? 'Tidak ada catatan yang cocok.' : 'Belum ada catatan.'}</p>`}`;
}

const FMT = [
  ['p', 'Teks biasa', '<b class="ft">T</b>'], ['h2', 'Judul 1', '<b class="ft">H1</b>'], ['h3', 'Judul 2', '<b class="ft">H2</b>'], ['h4', 'Judul 3', '<b class="ft">H3</b>'], '|',
  ['bold', 'Tebal (Ctrl+B)', '<b class="ft">B</b>'], ['italic', 'Miring (Ctrl+I)', '<i class="ft serif">I</i>'], ['underline', 'Garis bawah (Ctrl+U)', '<u class="ft">U</u>'],
  ['strikeThrough', 'Coret', '<s class="ft">S</s>'], ['mark', 'Stabilo', '<mark class="ft">A</mark>'], ['code', 'Kode', '<code class="ft">&lt;/&gt;</code>'], '|',
  ['ul', 'Daftar poin', 'list'], ['ol', 'Daftar bernomor', 'olist'], ['check', 'Ceklis', 'checklist'],
  ['blockquote', 'Kutipan', 'quote'], ['callout', 'Callout (kotak sorotan)', 'callout'], ['hr', 'Garis pemisah', 'divider'], '|',
  ['link', 'Link (Ctrl+K)', 'link'], ['image', 'Gambar', 'image'],
];

function noteEditorHtml(n) {
  return `<div class="note-editor">
    <div class="note-toolbar">
      <button class="icon-btn back" data-act="closeNote" title="Kembali ke daftar">${ICON.back}</button>
      <span class="save-status" id="saveStatus">${n.updated_at ? 'Disimpan ' + timeAgo(n.updated_at) : ''}</span>
      <span class="spacer"></span>
      <button class="icon-btn ${n.pinned ? 'on' : ''}" data-act="togglePin" title="${n.pinned ? 'Lepas sematan' : 'Sematkan di atas'}">${ICON.pin}</button>
      <button class="icon-btn danger" data-act="deleteNote" title="Hapus catatan">${ICON.trash}</button>
    </div>
    <input id="noteTitle" class="note-title" name="title" placeholder="Judul" value="${esc(n.title || '')}" data-input="noteField" autocomplete="off" aria-label="Judul catatan">
    <input class="note-tags" name="tags" placeholder="Tag, pisahkan dengan koma — mis. kuliah, ide" value="${esc((n.tags || []).join(', '))}" data-input="noteField" autocomplete="off" aria-label="Tag">
    <div class="fmt-bar" role="toolbar" aria-label="Format teks">${FMT.map(f => f === '|' ? '<span class="fsep"></span>'
      : `<button type="button" class="fb" data-fmt="${f[0]}" title="${f[1]}" aria-label="${f[1]}">${ICON[f[2]] || f[2]}</button>`).join('')}</div>
    <nav class="note-outline" id="noteOutline" aria-label="Daftar isi"></nav>
    <div id="noteDoc" class="doc" contenteditable="true" spellcheck="true" data-placeholder="Mulai menulis… ketik / untuk memilih jenis blok">${noteHtml(n)}</div>
    <div class="note-foot"><span id="wordCount"></span><span class="muted">Ketik <kbd>/</kbd> untuk blok · <kbd>#</kbd> spasi = judul · <kbd>-</kbd> spasi = poin · <kbd>[]</kbd> spasi = ceklis · <kbd>&gt;</kbd> spasi = kutipan</span></div>
  </div>`;
}

/* ---------- konversi catatan lama (markdown) → HTML editor */
function noteHtml(n) {
  if (n.html != null) return n.html;
  return mdToHtml(n.content || '');
}
function mdToHtml(src) {
  const out = [];
  let list = null, code = null;
  const open = type => { if (list !== type) { close(); out.push(type === 'ol' ? '<ol>' : type === 'cl' ? '<ul class="checklist">' : '<ul>'); list = type; } };
  const close = () => { if (list) { out.push(list === 'ol' ? '</ol>' : '</ul>'); list = null; } };
  const inline = s => s
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*\w])\*(?!\s)(.+?)\*(?!\w)/g, '$1<em>$2</em>')
    .replace(/~~(.+?)~~/g, '<s>$1</s>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, '$1<a href="$2">$2</a>');
  esc(src).split('\n').forEach(raw => {
    if (code !== null) { if (/^```/.test(raw)) { out.push(`<pre>${code.join('\n') || '<br>'}</pre>`); code = null; } else code.push(raw); return; }
    let m;
    if (/^```/.test(raw)) { close(); code = []; return; }
    if ((m = raw.match(/^(#{1,3})\s+(.*)$/))) { close(); const l = m[1].length + 1; out.push(`<h${l}>${inline(m[2])}</h${l}>`); return; }
    if (/^\s*(-{3,}|\*{3,})\s*$/.test(raw)) { close(); out.push('<hr>'); return; }
    if ((m = raw.match(/^\s*[-*]\s+\[([ xX])\]\s?(.*)$/))) { open('cl'); out.push(`<li${m[1].trim() ? ' data-checked=""' : ''}>${inline(m[2]) || '<br>'}</li>`); return; }
    if ((m = raw.match(/^\s*[-*]\s+(.*)$/))) { open('ul'); out.push(`<li>${inline(m[1])}</li>`); return; }
    if ((m = raw.match(/^\s*\d+[.)]\s+(.*)$/))) { open('ol'); out.push(`<li>${inline(m[1])}</li>`); return; }
    if ((m = raw.match(/^&gt;\s?(.*)$/))) { close(); out.push(`<blockquote>${inline(m[1])}</blockquote>`); return; }
    if (!raw.trim()) { close(); return; }
    close(); out.push(`<p>${inline(raw)}</p>`);
  });
  if (code !== null) out.push(`<pre>${code.join('\n')}</pre>`);
  close();
  return sanitizeHtml(out.join(''));
}

/* ---------- pembersih HTML (paste dari web, dll.) */
const ALLOWED = {
  P: [], H2: [], H3: [], H4: [], STRONG: [], B: [], EM: [], I: [], U: [], S: [], DEL: [], MARK: [], CODE: [], PRE: [], BLOCKQUOTE: [],
  UL: ['class'], OL: [], LI: ['data-checked'], A: ['href'], IMG: ['src', 'data-path', 'alt'], FIGURE: ['class'], HR: [], BR: [], DIV: ['class'],
};
const RENAME = { H1: 'H2', H5: 'H4', H6: 'H4', STRIKE: 'S' };
const DROP = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'META', 'LINK', 'TITLE', 'svg', 'SVG', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'NOSCRIPT']);
const BLOCKS = new Set(['P', 'H2', 'H3', 'H4', 'UL', 'OL', 'PRE', 'BLOCKQUOTE', 'FIGURE', 'HR', 'DIV', 'TABLE']);
function sanitizeHtml(html) {
  const t = document.createElement('template');
  t.innerHTML = html;
  cleanNode(t.content);
  return t.innerHTML.replace(/<p><\/p>/g, '');
}
function cleanNode(node) {
  for (const el of [...node.childNodes]) {
    if (el.nodeType === 3) continue;
    if (el.nodeType !== 1) { el.remove(); continue; }
    let tag = el.tagName;
    if (DROP.has(tag)) { el.remove(); continue; }
    if (RENAME[tag]) { const n = document.createElement(RENAME[tag]); while (el.firstChild) n.appendChild(el.firstChild); el.replaceWith(n); cleanNode(n.parentNode ? { childNodes: [n] } : n); continue; }
    if (tag === 'DIV' && el.getAttribute('class') !== 'callout') {
      const hasBlock = [...el.children].some(c => BLOCKS.has(c.tagName));
      cleanNode(el);
      if (hasBlock) { el.replaceWith(...el.childNodes); }
      else { const p = document.createElement('p'); while (el.firstChild) p.appendChild(el.firstChild); el.replaceWith(p); }
      continue;
    }
    if (!ALLOWED[tag]) { cleanNode(el); el.replaceWith(...el.childNodes); continue; }
    for (const a of [...el.attributes]) if (!ALLOWED[tag].includes(a.name)) el.removeAttribute(a.name);
    if (tag === 'UL' && el.getAttribute('class') !== 'checklist') el.removeAttribute('class');
    if (tag === 'FIGURE') { const c = (el.getAttribute('class') || '').split(/\s+/).filter(x => /^(img|img-[sml])$/.test(x)); el.setAttribute('class', c.length ? c.join(' ') : 'img img-m'); }
    if (tag === 'A') {
      const h = el.getAttribute('href') || '';
      if (/^(https?:|mailto:|tel:)/i.test(h)) { el.setAttribute('target', '_blank'); el.setAttribute('rel', 'noopener'); }
      else el.removeAttribute('href');
    }
    if (tag === 'IMG') {
      const s = el.getAttribute('src') || '';
      if (!el.getAttribute('data-path') && !/^(https?:|data:image\/)/i.test(s)) { el.remove(); continue; }
      if (el.parentNode && el.parentNode.tagName !== 'FIGURE') {
        const f = document.createElement('figure'); f.className = 'img img-m'; el.replaceWith(f); f.appendChild(el);
      }
    }
    cleanNode(el);
  }
}

/* ---------- editor */
let docTimer = null, savedRange = null, slash = null;
function docEl() { return $('#noteDoc'); }
function mountNoteEditor() {
  const doc = docEl(); if (!doc) return;
  try { document.execCommand('defaultParagraphSeparator', false, 'p'); } catch (e) {}
  if (!doc.innerHTML.trim()) doc.innerHTML = '<p><br></p>';
  doc.addEventListener('input', onDocInput);
  doc.addEventListener('keydown', onDocKeydown);
  doc.addEventListener('paste', onDocPaste);
  doc.addEventListener('drop', onDocDrop);
  doc.addEventListener('click', onDocClick);
  resolveImages(doc);
  updateOutline(); updateWordCount();
}
function noteDocChanged() {
  clearTimeout(docTimer);
  docTimer = setTimeout(() => {
    const doc = docEl(); if (!doc || !S.ui.noteId) return;
    queueNoteSave(S.ui.noteId, { html: serializeDoc(doc), content: doc.innerText.replace(/\n{3,}/g, '\n\n').trim() });
    updateOutline(); updateWordCount();
  }, 350);
}
function serializeDoc(doc) {
  const c = doc.cloneNode(true);
  c.querySelectorAll('figure.uploading').forEach(f => f.remove());
  c.querySelectorAll('img[data-path]').forEach(i => i.removeAttribute('src'));
  return sanitizeHtml(c.innerHTML);
}
function updateWordCount() {
  const doc = docEl(), el = $('#wordCount'); if (!doc || !el) return;
  const w = (doc.innerText.match(/\S+/g) || []).length;
  el.textContent = `${w} kata`;
}
function updateOutline() {
  const doc = docEl(), nav = $('#noteOutline'); if (!doc || !nav) return;
  const hs = [...doc.querySelectorAll('h2, h3, h4')].filter(h => h.textContent.trim());
  nav.innerHTML = hs.length >= 2 ? `<span class="muted">Daftar isi</span>${hs.map((h, i) =>
    `<button type="button" class="ol-${h.tagName.toLowerCase()}" data-act="jumpHeading" data-i="${i}">${esc(h.textContent.trim().slice(0, 40))}</button>`).join('')}` : '';
}

const sel = () => document.getSelection();
function topBlock(node) {
  const doc = docEl();
  while (node && node.parentNode !== doc) node = node.parentNode;
  return node && node.parentNode === doc ? node : null;
}
function currentBlock() {
  const s = sel(); if (!s.rangeCount) return null;
  let n = s.anchorNode, doc = docEl();
  if (!doc || !doc.contains(n)) return null;
  while (n && n !== doc) {
    if (n.nodeType === 1 && /^(P|H2|H3|H4|LI|PRE|BLOCKQUOTE|FIGURE)$/.test(n.tagName)) return n;
    n = n.parentNode;
  }
  return null;
}
function inside(tag, cls) {
  const s = sel(); if (!s.rangeCount) return null;
  let n = s.anchorNode, doc = docEl();
  while (n && n !== doc) { if (n.nodeType === 1 && n.tagName === tag && (!cls || n.classList.contains(cls))) return n; n = n.parentNode; }
  return null;
}
function caretTo(el, atEnd = true) {
  const r = document.createRange(); r.selectNodeContents(el); r.collapse(!atEnd);
  const s = sel(); s.removeAllRanges(); s.addRange(r);
}
function ensureFocus() {
  const doc = docEl(); if (!doc) return false;
  if (!doc.contains(sel().anchorNode)) { doc.focus(); if (savedRange) { sel().removeAllRanges(); sel().addRange(savedRange); } else caretTo(doc.lastElementChild || doc); }
  return true;
}
const exec = (c, v = null) => document.execCommand(c, false, v);

function applyFmt(name) {
  if (!ensureFocus()) return;
  const doc = docEl();
  const cur = currentBlock();
  switch (name) {
    case 'p': case 'h2': case 'h3': case 'h4': case 'pre': case 'blockquote': {
      if (inside('UL', 'checklist') || inside('UL') || inside('OL')) exec(inside('OL') ? 'insertOrderedList' : 'insertUnorderedList');
      const now = currentBlock();
      const same = now && now.tagName.toLowerCase() === name;
      exec('formatBlock', same && name !== 'p' ? '<p>' : `<${name}>`);
      break;
    }
    case 'bold': case 'italic': case 'underline': case 'strikeThrough': exec(name); break;
    case 'mark': toggleInline('MARK'); break;
    case 'code': toggleInline('CODE'); break;
    case 'ul': {
      const cl = inside('UL', 'checklist');
      if (cl) { cl.classList.remove('checklist'); cl.querySelectorAll('li').forEach(li => li.removeAttribute('data-checked')); } else exec('insertUnorderedList');
      break;
    }
    case 'ol': exec('insertOrderedList'); break;
    case 'check': {
      const ul = inside('UL');
      if (ul && ul.classList.contains('checklist')) exec('insertUnorderedList');
      else if (ul) ul.classList.add('checklist');
      else { exec('insertUnorderedList'); const u = inside('UL'); if (u) u.classList.add('checklist'); }
      break;
    }
    case 'callout': {
      const c = inside('DIV', 'callout');
      if (c) { c.replaceWith(...c.childNodes); break; }
      const b = topBlock(sel().anchorNode) || cur;
      const box = document.createElement('div'); box.className = 'callout';
      if (b && b !== doc) { b.replaceWith(box); box.appendChild(b.tagName === 'P' || /^H|UL|OL|PRE/.test(b.tagName) ? b : Object.assign(document.createElement('p'), { innerHTML: b.innerHTML })); }
      else { box.innerHTML = '<p><br></p>'; doc.appendChild(box); }
      caretTo(box.lastElementChild || box);
      break;
    }
    case 'hr': {
      const b = topBlock(sel().anchorNode);
      const hr = document.createElement('hr'), p = document.createElement('p'); p.innerHTML = '<br>';
      if (b && b.tagName === 'P' && !b.textContent.trim() && !b.querySelector('img')) { b.replaceWith(hr); hr.after(p); }
      else if (b) { b.after(hr); hr.after(p); } else { doc.append(hr, p); }
      caretTo(p, false);
      break;
    }
    case 'link': addLink(); return;
    case 'image': savedRange = sel().rangeCount ? sel().getRangeAt(0).cloneRange() : null; openModal(imageModalHtml()); return;
  }
  noteDocChanged();
}
function toggleInline(tag) {
  const s = sel(); if (!s.rangeCount) return;
  const own = inside(tag);
  if (own) { own.replaceWith(...own.childNodes); return; }
  const r = s.getRangeAt(0);
  if (r.collapsed) return toast('Blok dulu teks yang mau diberi format');
  const el = document.createElement(tag);
  el.appendChild(r.extractContents()); r.insertNode(el);
  s.removeAllRanges(); const nr = document.createRange(); nr.selectNodeContents(el); s.addRange(nr);
}
function normUrl(u) { u = String(u || '').trim(); if (!u) return ''; return /^(https?:|mailto:|tel:)/i.test(u) ? u : 'https://' + u; }
function addLink() {
  const s = sel(); const r = s.rangeCount ? s.getRangeAt(0).cloneRange() : null;
  const existing = inside('A');
  const url = normUrl(prompt('Tempel link (mis. https://...)', existing ? existing.getAttribute('href') : ''));
  ensureFocus(); if (r) { s.removeAllRanges(); s.addRange(r); }
  if (!url) return;
  if (existing) existing.setAttribute('href', url);
  else if (!r || r.collapsed) exec('insertHTML', `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(url)}</a>&nbsp;`);
  else exec('createLink', url);
  noteDocChanged();
}

/* slash menu */
const SLASH = [
  ['p', 'Teks', 'paragraf text biasa'], ['h2', 'Judul 1', 'heading h1 judul besar'], ['h3', 'Judul 2', 'heading h2 subjudul'], ['h4', 'Judul 3', 'heading h3'],
  ['ul', 'Daftar poin', 'bullet list poin'], ['ol', 'Daftar bernomor', 'number list angka'], ['check', 'Ceklis / to-do', 'checklist todo centang'],
  ['blockquote', 'Kutipan', 'quote kutip'], ['callout', 'Callout', 'kotak sorotan info penting'], ['hr', 'Garis pemisah', 'divider garis section bagian'],
  ['pre', 'Blok kode', 'code kode'], ['image', 'Gambar', 'image foto upload link'], ['link', 'Link', 'tautan url'],
];
function slashMenuEl() {
  let m = $('#slashMenu');
  if (!m) { m = document.createElement('div'); m.id = 'slashMenu'; m.className = 'slash-menu'; document.body.appendChild(m); }
  return m;
}
function closeSlash() { slash = null; const m = $('#slashMenu'); if (m) m.hidden = true; }
function updateSlash() {
  const b = currentBlock();
  const txt = b ? b.textContent : '';
  if (!b || !/^\/[\w ]{0,18}$/i.test(txt) || b.tagName === 'PRE') return closeSlash();
  const q = txt.slice(1).toLowerCase().trim();
  const items = SLASH.filter(([, l, k]) => !q || l.toLowerCase().includes(q) || k.includes(q));
  if (!items.length) return closeSlash();
  slash = { block: b, items, i: slash && slash.block === b ? Math.min(slash.i, items.length - 1) : 0 };
  const m = slashMenuEl();
  m.innerHTML = items.map(([k, l], i) => `<button type="button" class="${i === slash.i ? 'on' : ''}" data-slash="${k}">${ICON[{ p: 'note', h2: 'heading', h3: 'heading', h4: 'heading', ul: 'list', ol: 'olist', check: 'checklist', blockquote: 'quote', callout: 'callout', hr: 'divider', pre: 'codeblock', image: 'image', link: 'link' }[k]] || ''}<span>${l}</span></button>`).join('');
  const rect = (sel().rangeCount && sel().getRangeAt(0).getBoundingClientRect()) || b.getBoundingClientRect();
  const r = rect.height ? rect : b.getBoundingClientRect();
  m.hidden = false;
  const top = r.bottom + 6 + 260 > innerHeight ? Math.max(8, r.top - 6 - Math.min(260, m.scrollHeight)) : r.bottom + 6;
  m.style.top = top + 'px'; m.style.left = Math.min(Math.max(8, r.left), innerWidth - 240) + 'px';
}
function pickSlash(k) {
  if (!slash) return;
  const b = slash.block; closeSlash();
  b.innerHTML = '<br>'; caretTo(b, false);
  applyFmt(k);
}

/* markdown shortcuts saat mengetik */
const SHORTCUTS = [[/^#\s$/, 'h2'], [/^##\s$/, 'h3'], [/^###\s$/, 'h4'], [/^[-*]\s$/, 'ul'], [/^1[.)]\s$/, 'ol'], [/^\[\s?\]\s$/, 'check'], [/^>\s$/, 'blockquote'], [/^```$/, 'pre']];
function onDocInput(e) {
  const b = currentBlock();
  if (b && e.inputType === 'insertText' && b.tagName === 'P') {
    const txt = b.textContent.replace(/ /g, ' ');
    if (txt === '---') { b.innerHTML = '<br>'; caretTo(b, false); applyFmt('hr'); b.remove(); return; }
    for (const [re, k] of SHORTCUTS) if (re.test(txt)) { b.innerHTML = '<br>'; caretTo(b, false); applyFmt(k); return; }
  }
  if (e.inputType === 'insertParagraph') { const li = inside('LI'); if (li && !li.textContent.trim()) li.removeAttribute('data-checked'); }
  updateSlash();
  noteDocChanged();
}
function onDocKeydown(e) {
  if (slash) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); slash.i = (slash.i + (e.key === 'ArrowDown' ? 1 : -1) + slash.items.length) % slash.items.length; updateSlash(); return; }
    if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); pickSlash(slash.items[slash.i][0]); return; }
    if (e.key === 'Escape') { e.preventDefault(); closeSlash(); return; }
  }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); addLink(); return; }
  if (e.key === 'Tab' && inside('LI')) { e.preventDefault(); exec(e.shiftKey ? 'outdent' : 'indent'); noteDocChanged(); return; }
  if (e.key === 'Enter' && !e.shiftKey) {
    const b = currentBlock();
    const callout = inside('DIV', 'callout');
    /* Enter di baris kosong dalam callout → keluar dari callout */
    if (b && callout && b !== callout && !b.textContent.trim() && !b.querySelector('img')) {
      e.preventDefault();
      const p = document.createElement('p'); p.innerHTML = '<br>';
      b.remove();
      if (!callout.textContent.trim() && !callout.querySelector('img')) callout.replaceWith(p); else callout.after(p);
      caretTo(p, false); noteDocChanged(); return;
    }
    /* Enter di akhir judul / kutipan → paragraf biasa di bawahnya */
    if (b && /^(H2|H3|H4|BLOCKQUOTE)$/.test(b.tagName)) {
      const r = sel().getRangeAt(0);
      const tail = document.createRange(); tail.setStart(r.endContainer, r.endOffset); tail.setEnd(b, b.childNodes.length);
      if (!tail.toString().length) {
        e.preventDefault();
        const p = document.createElement('p'); p.innerHTML = '<br>';
        if (b.tagName === 'BLOCKQUOTE' && !b.textContent.trim()) b.replaceWith(p); else b.after(p);
        caretTo(p, false); noteDocChanged(); return;
      }
    }
  }
  if (e.key === 'Backspace') {
    const b = currentBlock();
    if (b && /^(H2|H3|H4|BLOCKQUOTE|PRE)$/.test(b.tagName)) {
      const r = sel().getRangeAt(0); const head = document.createRange(); head.setStart(b, 0); head.setEnd(r.startContainer, r.startOffset);
      if (r.collapsed && !head.toString().length) { e.preventDefault(); exec('formatBlock', '<p>'); noteDocChanged(); }
    }
  }
}
function onDocClick(e) {
  const li = e.target.closest('ul.checklist > li');
  if (li && e.clientX - li.getBoundingClientRect().left < 30) {
    e.preventDefault();
    li.hasAttribute('data-checked') ? li.removeAttribute('data-checked') : li.setAttribute('data-checked', '');
    noteDocChanged(); return;
  }
  const img = e.target.closest('figure.img');
  if (img) { selectFigure(img); return; }
  const a = e.target.closest('a[href]');
  if (a) { showBubble(a, `<button type="button" data-bub="open">Buka ↗</button><button type="button" data-bub="edit">Ubah</button><button type="button" data-bub="unlink">Lepas</button>`, { a }); return; }
  hideBubble();
}
async function onDocPaste(e) {
  const files = [...(e.clipboardData && e.clipboardData.files || [])].filter(f => f.type.startsWith('image/'));
  if (files.length) { e.preventDefault(); savedRange = sel().rangeCount ? sel().getRangeAt(0).cloneRange() : null; for (const f of files) await insertImageFile(f); return; }
  const html = e.clipboardData && e.clipboardData.getData('text/html');
  const text = e.clipboardData && e.clipboardData.getData('text/plain');
  if (inside('PRE')) { e.preventDefault(); exec('insertText', text || ''); return; }
  if (html) { e.preventDefault(); exec('insertHTML', sanitizeHtml(html)); noteDocChanged(); return; }
  if (text && /^https?:\/\/\S+\.(png|jpe?g|gif|webp)(\?\S*)?$/i.test(text.trim())) { e.preventDefault(); savedRange = sel().getRangeAt(0).cloneRange(); insertFigure({ src: text.trim() }); return; }
  if (text && /^https?:\/\/\S+$/.test(text.trim())) { e.preventDefault(); exec('insertHTML', `<a href="${esc(text.trim())}" target="_blank" rel="noopener">${esc(text.trim())}</a>&nbsp;`); noteDocChanged(); }
}
async function onDocDrop(e) {
  const files = [...(e.dataTransfer && e.dataTransfer.files || [])].filter(f => f.type.startsWith('image/'));
  if (!files.length) return;
  e.preventDefault();
  const r = document.caretRangeFromPoint ? document.caretRangeFromPoint(e.clientX, e.clientY) : null;
  savedRange = r;
  for (const f of files) await insertImageFile(f);
}

/* gelembung untuk link & gambar */
let bubbleCtx = null;
function bubbleEl() { let b = $('#docBubble'); if (!b) { b = document.createElement('div'); b.id = 'docBubble'; b.className = 'doc-bubble'; document.body.appendChild(b); } return b; }
function showBubble(target, html, ctx) {
  const b = bubbleEl(); b.innerHTML = html; b.hidden = false; bubbleCtx = ctx;
  const r = target.getBoundingClientRect();
  b.style.top = Math.max(8, r.top - b.offsetHeight - 8) + 'px';
  b.style.left = Math.min(Math.max(8, r.left + r.width / 2 - b.offsetWidth / 2), innerWidth - b.offsetWidth - 8) + 'px';
}
function hideBubble() { const b = $('#docBubble'); if (b) b.hidden = true; bubbleCtx = null; $$('#noteDoc figure.sel').forEach(f => f.classList.remove('sel')); }
function selectFigure(fig) {
  $$('#noteDoc figure.sel').forEach(f => f !== fig && f.classList.remove('sel'));
  fig.classList.add('sel');
  const size = ['img-s', 'img-m', 'img-l'].find(c => fig.classList.contains(c)) || 'img-m';
  showBubble(fig, `${[['img-s', 'Kecil'], ['img-m', 'Sedang'], ['img-l', 'Penuh']].map(([c, l]) => `<button type="button" class="${c === size ? 'on' : ''}" data-bub="${c}">${l}</button>`).join('')}<button type="button" data-bub="del" class="danger">Hapus</button>`, { fig });
}
document.addEventListener('mousedown', e => { if (e.target.closest('.fb, #docBubble, #slashMenu')) e.preventDefault(); });
document.addEventListener('click', e => {
  const f = e.target.closest('[data-fmt]'); if (f) { e.preventDefault(); closeSlash(); applyFmt(f.dataset.fmt); return; }
  const s = e.target.closest('[data-slash]'); if (s) { e.preventDefault(); pickSlash(s.dataset.slash); return; }
  const bb = e.target.closest('[data-bub]');
  if (bb && bubbleCtx) {
    e.preventDefault();
    const k = bb.dataset.bub, { a, fig } = bubbleCtx;
    if (k === 'open' && a) window.open(a.href, '_blank', 'noopener');
    if (k === 'unlink' && a) { a.replaceWith(...a.childNodes); noteDocChanged(); }
    if (k === 'edit' && a) { const u = normUrl(prompt('Ubah link:', a.getAttribute('href'))); if (u) { a.setAttribute('href', u); noteDocChanged(); } }
    if (fig && /^img-/.test(k)) { fig.classList.remove('img-s', 'img-m', 'img-l'); fig.classList.add(k); noteDocChanged(); selectFigure(fig); return; }
    if (fig && k === 'del') { fig.remove(); noteDocChanged(); }
    hideBubble(); return;
  }
  if (!e.target.closest('#noteDoc, #docBubble')) hideBubble();
  if (!e.target.closest('#slashMenu, #noteDoc')) closeSlash();
});
window.addEventListener('scroll', () => { hideBubble(); closeSlash(); }, true);

/* ---------- gambar */
function imageModalHtml() {
  return `<div class="modal-body">
    <h2>Tambah gambar</h2>
    <label class="dropzone">${ICON.upload}<b>Pilih foto / gambar dari perangkat</b><span class="muted small">JPG, PNG, WebP, GIF · otomatis dikecilkan</span>
      <input type="file" accept="image/*" multiple data-change="imgFile" hidden></label>
    <p class="muted small center">atau tempel link gambar dari internet</p>
    <form class="inline-form" data-form="imgUrl"><input name="url" placeholder="https://…/gambar.jpg" autocomplete="off" inputmode="url"><button class="btn">Sisipkan</button></form>
    <p class="muted small">Tips: gambar juga bisa langsung di-<b>paste</b> (Ctrl+V) atau diseret ke dalam catatan.</p>
    <div class="modal-actions"><button type="button" class="btn ghost" data-act="closeModal">Tutup</button></div>
  </div>`;
}
function insertFigure({ src, path, uploading }) {
  const doc = docEl(); if (!doc) return null;
  const fig = document.createElement('figure'); fig.className = 'img img-m' + (uploading ? ' uploading' : '');
  const img = document.createElement('img'); img.alt = '';
  if (src) img.src = src; if (path) img.dataset.path = path;
  fig.appendChild(img);
  let b = savedRange && doc.contains(savedRange.startContainer) ? topBlock(savedRange.startContainer) : null;
  const p = document.createElement('p'); p.innerHTML = '<br>';
  if (b && b.tagName === 'P' && !b.textContent.trim() && !b.querySelector('img')) { b.replaceWith(fig); fig.after(p); }
  else if (b) { b.after(fig); fig.after(p); }
  else { doc.append(fig, p); }
  savedRange = document.createRange(); savedRange.selectNodeContents(p); savedRange.collapse(true);
  try { doc.focus({ preventScroll: true }); sel().removeAllRanges(); sel().addRange(savedRange.cloneRange()); } catch (e) {}
  if (!uploading) noteDocChanged();
  return fig;
}
async function compressImage(file, max = 1600, q = 0.82) {
  if (file.type === 'image/gif' && file.size < 4e6) return file;
  let src;
  try { src = await createImageBitmap(file); }
  catch (e) { src = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(file); }); }
  const w = src.width, h = src.height, k = Math.min(1, max / Math.max(w, h));
  const c = document.createElement('canvas'); c.width = Math.round(w * k); c.height = Math.round(h * k);
  c.getContext('2d').drawImage(src, 0, 0, c.width, c.height);
  const blob = await new Promise(r => c.toBlob(r, 'image/webp', q));
  if (blob && blob.type === 'image/webp') return blob;
  return new Promise(r => c.toBlob(r, 'image/jpeg', q));
}
const blobToDataUrl = b => new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(b); });
async function insertImageFile(file) {
  closeModal();
  if (file.size > 25e6) return toast('Gambar terlalu besar (maks 25 MB)', 'error');
  const preview = URL.createObjectURL(file);
  const fig = insertFigure({ src: preview, uploading: true });
  if (!fig) return;
  try {
    if (cloud.active) {
      const blob = await compressImage(file);
      const path = await cloud.upload(blob);
      const img = fig.querySelector('img'); img.dataset.path = path;
      imgCacheSet(path, null);
    } else {
      const blob = await compressImage(file, 1200, 0.75);
      fig.querySelector('img').src = await blobToDataUrl(blob);
    }
    fig.classList.remove('uploading');
    noteDocChanged();
  } catch (e) {
    fig.remove(); noteDocChanged();
    toast(e.message || 'Gagal mengunggah gambar', 'error');
  }
}
/* URL gambar privat (signed URL) di-cache supaya tidak minta ulang terus */
const IMG_KEY = 'rp-imgurls';
const imgCache = lsGet(IMG_KEY, {});
function imgCacheSet(path, url, exp) { if (url) imgCache[path] = { url, exp }; lsSet(IMG_KEY, imgCache); }
async function resolveImages(root) {
  const imgs = [...root.querySelectorAll('img[data-path]')].filter(i => !i.getAttribute('src') || i.src.startsWith('blob:') === false);
  if (!imgs.length || !cloud.active) return;
  const now = Date.now() / 1000;
  const need = [];
  imgs.forEach(i => { const c = imgCache[i.dataset.path]; if (c && c.exp - 86400 > now) i.src = c.url; else need.push(i.dataset.path); });
  if (!need.length) return;
  try {
    const res = await cloud.signUrls(uniq(need));
    res.forEach(x => { if (x.signedURL || x.signedUrl) imgCacheSet(x.path, cloud.fullSignedUrl(x.signedURL || x.signedUrl), now + 6.5 * 86400); });
    imgs.forEach(i => { const c = imgCache[i.dataset.path]; if (c) i.src = c.url; else i.closest('figure') && i.closest('figure').classList.add('missing'); });
  } catch (e) {
    imgs.forEach(i => { if (!i.getAttribute('src')) i.closest('figure') && i.closest('figure').classList.add('missing'); });
  }
}

/* ---------- autosave catatan */
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
  if (docTimer && docEl() && S.ui.noteId) {
    clearTimeout(docTimer); docTimer = null;
    const doc = docEl(), n = find('notes', S.ui.noteId);
    if (n) { const html = serializeDoc(doc); if (html !== n.html) queueNoteSave(n.id, { html, content: doc.innerText.trim() }); clearTimeout(noteSave.timer); }
  }
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
  closeSlash(); hideBubble();
  await flushNote();
  const n = S.ui.noteId && find('notes', S.ui.noteId);
  if (n && !(n.title || '').trim() && !(n.content || '').trim() && !(n.tags || []).length && !noteHasImg(n)) {
    try { await del('notes', n.id); } catch (e) {}
    S.ui.noteId = null;
  }
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

/* ================================================================ KEBIASAAN (tampilan bulanan + riwayat) */
function streak(h) {
  const set = new Set(h.done || []);
  let d = ymd();
  if (!set.has(d)) d = addDays(d, -1);
  let n = 0;
  while (set.has(d)) { n++; d = addDays(d, -1); }
  return n;
}
function bestStreak(h) {
  const ds = [...new Set(h.done || [])].sort();
  let best = 0, cur = 0, prev = null;
  for (const d of ds) { cur = prev && addDays(prev, 1) === d ? cur + 1 : 1; best = Math.max(best, cur); prev = d; }
  return best;
}
/* hitung hari yang "berlaku" di bulan m: sejak kebiasaan dibuat s/d hari ini */
function monthStat(h, m) {
  const t = ymd(), [y, mo] = m.split('-').map(Number), days = new Date(y, mo, 0).getDate();
  const first = `${m}-01`, last = `${m}-${pad(days)}`;
  const created = h.created_at ? ymd(new Date(h.created_at * 1000)) : first;
  const doneIn = (h.done || []).filter(d => d.startsWith(m));
  const firstDone = doneIn.length ? doneIn.slice().sort()[0] : null;
  let from = created > first ? created : first;
  if (firstDone && firstDone < from) from = firstDone;
  const to = last < t ? last : t;
  const span = from > to ? 0 : daysBetween(from, to) + 1;
  return { done: doneIn.length, span, pct: span ? Math.round(doneIn.length / span * 100) : null };
}

function renderHabits() {
  const m = S.ui.hMonth, t = ymd(), prev = shiftMonth(m, -1);
  const isNow = m === monthKey(new Date());
  const [y, mo] = m.split('-').map(Number);
  const days = new Date(y, mo, 0).getDate(), startDow = (new Date(y, mo - 1, 1).getDay() + 6) % 7;
  const stats = S.habits.map(h => monthStat(h, m)).filter(s => s.pct != null);
  const avg = stats.length ? Math.round(stats.reduce((a, s) => a + s.pct, 0) / stats.length) : null;
  const pstats = S.habits.map(h => monthStat(h, prev)).filter(s => s.pct != null);
  const pavg = pstats.length ? Math.round(pstats.reduce((a, s) => a + s.pct, 0) / pstats.length) : null;
  const doneToday = S.habits.filter(h => (h.done || []).includes(t)).length;

  return `
  <header class="page-head">
    <div><p class="eyebrow">Kebiasaan</p><h1>Sedikit demi sedikit</h1></div>
    <div class="month-nav">
      <button class="icon-btn" data-act="hMonth" data-n="-1" title="Bulan sebelumnya">${ICON.left}</button>
      <b>${monthLabel(m)}</b>
      <button class="icon-btn" data-act="hMonth" data-n="1" title="Bulan berikutnya" ${isNow ? 'disabled' : ''}>${ICON.right}</button>
      ${isNow ? '' : `<button class="btn ghost sm" data-act="hMonth" data-n="0">Bulan ini</button>`}
    </div>
  </header>

  ${S.habits.length ? `<div class="stats three">
    ${stat(isNow ? 'Hari ini' : 'Kebiasaan', isNow ? `${doneToday}/${S.habits.length}` : S.habits.length, isNow ? (doneToday === S.habits.length ? 'semua beres 👏' : 'ayo lanjutkan') : 'yang dilacak')}
    ${stat(`Konsistensi ${monthLabel(m).split(' ')[0]}`, avg == null ? '—' : avg + '%', 'rata-rata semua kebiasaan', avg != null && avg >= 70 ? 'good' : '')}
    ${stat(`Dibanding ${monthLabel(prev).split(' ')[0]}`, avg == null || pavg == null ? '—' : `${avg - pavg >= 0 ? '+' : '−'}${Math.abs(avg - pavg)}%`, pavg == null ? 'belum ada data' : `bulan lalu ${pavg}%`, avg != null && pavg != null ? (avg >= pavg ? 'good' : 'warn') : '')}
  </div>` : ''}

  <form class="card add-habit" data-form="addHabit">
    <input name="emoji" class="emoji-in" maxlength="4" placeholder="🌱" aria-label="Emoji (opsional)" autocomplete="off">
    <input id="habitName" name="name" placeholder="Kebiasaan baru — mis. Minum 8 gelas air, Baca 10 halaman" required autocomplete="off" aria-label="Nama kebiasaan">
    <button class="btn primary">${ICON.plus} Tambah</button>
  </form>

  ${S.habits.length ? `<div class="habit-grid">${S.habits.map(h => {
    const set = new Set(h.done || []), st = monthStat(h, m), pst = monthStat(h, prev);
    const created = h.created_at ? ymd(new Date(h.created_at * 1000)) : '0000';
    let cells = '';
    for (let i = 0; i < startDow; i++) cells += '<span></span>';
    for (let d = 1; d <= days; d++) {
      const ds = `${m}-${pad(d)}`, on = set.has(ds), fut = ds > t;
      cells += `<button class="hday ${on ? 'on' : ''} ${ds === t ? 'today' : ''} ${ds < created && !on ? 'pre' : ''}" ${fut ? 'disabled' : ''} data-act="toggleHabit" data-id="${h.id}" data-date="${ds}" title="${fmtFull(ds)}" aria-pressed="${on}">${d}</button>`;
    }
    const delta = st.pct != null && pst.pct != null ? st.pct - pst.pct : null;
    return `<section class="card habit-card">
      <div class="hc-head">
        ${h.emoji ? `<span class="em">${esc(h.emoji)}</span>` : ''}<b>${esc(h.name)}</b><span class="spacer"></span>
        <button class="icon-btn" data-act="editHabit" data-id="${h.id}" title="Ganti nama">${ICON.edit}</button>
        <button class="icon-btn danger" data-act="deleteHabit" data-id="${h.id}" title="Hapus">${ICON.trash}</button>
      </div>
      <div class="hc-stats">
        <span><b>${st.done}</b>${st.span ? '/' + st.span : ''} hari</span>
        <span class="bar"><i style="width:${st.pct || 0}%"></i></span>
        <span><b>${st.pct == null ? '—' : st.pct + '%'}</b>${delta == null ? '' : ` <small class="${delta >= 0 ? 'up' : 'down'}">${delta >= 0 ? '▲' : '▼'} ${Math.abs(delta)}%</small>`}</span>
      </div>
      <div class="hcal">${['S', 'S', 'R', 'K', 'J', 'S', 'M'].map(x => `<span class="hh">${x}</span>`).join('')}${cells}</div>
      <div class="hc-foot muted small"><span>🔥 ${streak(h)} hari beruntun</span><span>Rekor ${bestStreak(h)} hari</span><span>Total ${(h.done || []).length}×</span></div>
    </section>`;
  }).join('')}</div>`
    : `<section class="card"><p class="empty">Belum ada kebiasaan. Mulai dari satu yang kecil saja.</p></section>`}`;
}

/* ================================================================ KULIAH (rencana studi) */
/* Sumber: Pedoman Pelaksanaan Kurikulum PSSI FILKOM UB 2024–2027 (Jalur A, reguler).
   Format wajib: [semester, kode, nama, sks, praktikum, prasyarat]. Semester 4.5 = semester antara. */
const KURIKULUM_SI_2024 = {
  label: 'S1 Sistem Informasi FILKOM UB · Kurikulum 2024',
  total: 145, wajib: 117, pilihan: 28, maxTotal: 160,
  courses: [
    [1, 'COM60014', 'Pemrograman Dasar', 5, 1, ''],
    [1, 'COM60016', 'Pengantar Keilmuan Komputer', 2, 0, ''],
    [1, 'CSD60704', 'Desain Basis Data', 2, 0, ''],
    [1, 'CIS61102', 'Infrastruktur Teknologi Informasi', 2, 0, ''],
    [1, 'CIS61103', 'Manajemen Bisnis', 2, 0, ''],
    [1, 'CIS61104', 'Pengantar Sistem Informasi', 2, 0, ''],
    [1, 'CIS61106', 'Keamanan dan Data Privasi', 2, 0, ''],
    [1, 'COM60015', 'Matematika Diskrit', 2, 0, ''],
    [1, 'MPK60006', 'Pendidikan Kewarganegaraan', 2, 0, ''],
    [2, 'COM60024', 'Pemrograman Lanjut', 5, 1, 'COM60014'],
    [2, 'CSD60705', 'Pemrograman SQL', 3, 1, 'CSD60704'],
    [2, 'CIS62102', 'Desain Antar Muka Pengguna', 3, 0, ''],
    [2, 'CIS62103', 'Jaringan dan Komputasi Awan', 2, 0, ''],
    [2, 'CIS62104', 'Pemodelan Proses Bisnis', 3, 1, 'CIS61103'],
    [2, 'CIS62106', 'Pemrograman Web', 4, 0, ''],
    [3, 'CSD60712', 'Probabilitas dan Statistika', 3, 0, ''],
    [3, 'CIS61111', 'Sistem Informasi berbasis Kecerdasan Buatan', 2, 0, ''],
    [3, 'CSD60706', 'Administrasi Basis Data', 3, 1, 'CSD60705'],
    [3, 'CIS61108', 'Rekayasa Sistem Informasi', 5, 1, 'CIS61104'],
    [3, 'CSD60703', 'Tata Kelola Teknologi Informasi', 3, 0, ''],
    [3, 'CIS61115', 'Komunikasi Profesional', 2, 0, ''],
    [3, 'CIS61116', 'Manajemen Keuangan', 2, 0, ''],
    [4, 'CIS62112', 'Kecerdasan Bisnis dan Analitik', 3, 0, 'CSD60705'],
    [4, 'CSD60711', 'Perancangan Pengalaman Pengguna', 3, 0, 'CIS62102'],
    [4, 'CIS62108', 'Enterprise Architecture I', 2, 0, ''],
    [4, 'CSD60715', 'Analisis Data Penelitian Kuantitatif', 3, 0, 'CSD60712'],
    [4, 'CIS62105', 'Pengantar Sains Data', 2, 0, 'CSD60712'],
    [4, 'UBU60003', 'Kewirausahaan', 2, 0, ''],
    [4, 'MPK60008', 'Pendidikan Pancasila', 2, 0, ''],
    [4, 'UBU60004', 'Bahasa Inggris', 2, 0, ''],
    [4.5, 'UBU60005', 'PKM / KKN / KKNT / Mahasiswa Membangun Desa', 4, 0, ''],
    [5, 'MPK60007', 'Bahasa Indonesia', 2, 0, ''],
    [5, 'COM60051', 'Metodologi Penelitian dan Penulisan Ilmiah', 3, 0, 'min. 60 SKS'],
    [5, 'COM60052', 'Etika Profesi', 2, 0, ''],
    [5, 'CIS61110', 'Pengembangan Aplikasi Mobile', 3, 1, 'COM60024'],
    [5, 'CIS61112', 'Dasar Manajemen Proyek', 2, 0, ''],
    [5, 'CIS61113', 'Sistem Enterprise', 3, 0, ''],
    [5, 'CIS61107', 'Manajemen Produk', 3, 0, ''],
    [6, 'MPK60001', 'Pendidikan Agama', 2, 0, ''],
    [6, 'COM60061', 'Capstone Project', 3, 0, ''],
    [7, 'UBU60002', 'Praktik Kerja Lapang / Magang', 4, 0, 'min. 90 SKS'],
    [8, 'UBU60001', 'Skripsi', 6, 0, 'min. 120 SKS'],
  ],
  /* [kode, nama, sks, praktikum, penawaran, prasyarat] */
  electives: [
    ['CIS62110', 'Perencanaan Strategis Sistem Informasi', 3, 0, 'Genap', ''],
    ['CIS62126', 'Evaluasi Pengalaman dan Antarmuka Pengguna', 3, 0, 'Genap', 'CIS62102'],
    ['CIS61128', 'Keamanan Jaringan dan Siber', 3, 0, 'Ganjil & Genap', 'CIS62103'],
    ['CIS60102', 'Pengembangan Aplikasi Multiplatform', 2, 0, 'Ganjil & Genap', 'COM60024'],
    ['CIS61118', 'Rekayasa Kebutuhan Sistem Informasi', 2, 0, 'Ganjil', 'CIS61104'],
    ['CIS61127', 'Pengembangan Berorientasi Penggunaan Ulang', 2, 0, 'Genap', 'COM60024'],
    ['CIS62113', 'Pola-Pola Perancangan', 2, 0, 'Genap', 'COM60024'],
    ['CIS62114', 'Pengembangan Aplikasi Mobile Lanjut', 3, 0, 'Genap', 'CIS61110'],
    ['CIS62115', 'Manajemen Investasi Teknologi Informasi', 3, 0, 'Genap', 'CSD60703'],
    ['CSD60701', 'Manajemen Layanan Teknologi Informasi', 2, 0, 'Genap', 'CSD60703'],
    ['CIS61119', 'Manajemen Risiko dan Kontrol Sistem Informasi', 2, 0, 'Ganjil', 'CSD60703'],
    ['CIS62117', 'Manajemen Rantai Suplai', 2, 0, 'Genap', 'CSD60703'],
    ['CIS61120', 'Perbaikan Bisnis Proses', 2, 0, 'Ganjil', 'CIS62104'],
    ['CSD60702', 'Sistem Pendukung Keputusan', 3, 0, 'Genap', ''],
    ['CSD60716', 'Analisis Data Penelitian Kualitatif', 3, 0, 'Genap', 'CSD60712'],
    ['CSD60707', 'Big Data dan Analitik', 2, 0, 'Genap', 'CSD60705'],
    ['CSD60709', 'Gudang Data', 3, 0, 'Genap', 'CSD60705'],
    ['CSD60708', 'Penambangan Data', 3, 0, 'Genap', 'CSD60705'],
    ['CIS61123', 'Enterprise Architecture II', 3, 1, 'Ganjil', 'CIS62108'],
    ['CIS61124', 'Pengembangan Gim', 2, 0, 'Ganjil', 'COM60024'],
    ['CIS60101', 'Perkembangan dan Tren Teknologi Dijital', 2, 0, 'Ganjil & Genap', ''],
    ['CSD60717', 'Teknologi Blockchain dan Platform Keuangan Dijital', 2, 0, 'Genap', 'CIS61103'],
    ['CIS61125', 'Pengantar GeoInformasi', 3, 1, 'Ganjil', ''],
    ['CIS62125', 'GeoInformasi Lanjut', 3, 1, 'Genap', 'CIS61125'],
    ['CSD60710', 'Sistem Informasi Geografis', 3, 1, 'Ganjil', ''],
    ['CIS60104', 'Transformasi Pemerintah', 2, 0, 'Ganjil & Genap', ''],
    ['CIS62109', 'Pengujian dan Evaluasi Sistem Informasi', 2, 0, 'Ganjil', ''],
    ['CIS60103', 'Pemrograman Web Lanjut', 3, 0, 'Ganjil & Genap', 'CIS62106'],
    ['CIS60105', 'Strategi Transformasi Digital', 2, 0, 'Ganjil & Genap', ''],
    ['CIS60106', 'Sistem Informasi Berkelanjutan', 2, 0, 'Ganjil & Genap', ''],
  ],
};
const GRADES = { A: 4, 'B+': 3.5, B: 3, 'C+': 2.5, C: 2, 'D+': 1.5, D: 1, E: 0 };
const C_STATUS = { belum: 'Belum', rencana: 'Direncanakan', diambil: 'Sedang diambil', lulus: 'Lulus' };
const semLabel = s => (s === 4.5 || s === '4.5' ? 'Semester antara' : s ? `Semester ${s}` : 'Belum dijadwalkan');
const courseList = () => (S.courses || []).filter(c => c.type !== 'meta');
const courseMeta = () => (S.courses || []).find(c => c.type === 'meta') || null;
const passed = c => c.status === 'lulus' && c.grade !== 'E';

function studyStats() {
  const cs = courseList(), meta = courseMeta() || {};
  const target = num(meta.target) || KURIKULUM_SI_2024.total;
  const lulus = cs.filter(passed);
  const sks = arr => arr.reduce((a, c) => a + num(c.sks), 0);
  const graded = cs.filter(c => c.status === 'lulus' && c.grade in GRADES);
  const gSks = sks(graded);
  const ipk = gSks ? graded.reduce((a, c) => a + GRADES[c.grade] * num(c.sks), 0) / gSks : null;
  return {
    target, cur: num(meta.cur_sem) || 1,
    lulusSks: sks(lulus), diambilSks: sks(cs.filter(c => c.status === 'diambil')), rencanaSks: sks(cs.filter(c => c.status === 'rencana')),
    wajibLulus: sks(lulus.filter(c => c.type === 'wajib')), pilihanLulus: sks(lulus.filter(c => c.type === 'pilihan')),
    pilihanPlan: sks(cs.filter(c => c.type === 'pilihan' && c.status !== 'belum')),
    ipk, gradedSks: gSks, nDiambil: cs.filter(c => c.status === 'diambil').length,
  };
}
function ips(list) {
  const g = list.filter(c => c.status === 'lulus' && c.grade in GRADES);
  const s = g.reduce((a, c) => a + num(c.sks), 0);
  return s ? g.reduce((a, c) => a + GRADES[c.grade] * num(c.sks), 0) / s : null;
}
const fmtIp = v => (v == null ? '—' : v.toFixed(2).replace('.', ','));
function prereqMissing(c) {
  if (!c.prereq || !/^[A-Z]{3}\d/.test(c.prereq)) return null;
  const p = courseList().find(x => x.code === c.prereq);
  if (p && passed(p)) return null;
  return p ? p.name : c.prereq;
}

function renderKuliah() {
  const cs = courseList();
  if (!cs.length) return kuliahOnboarding();
  const st = studyStats(), tab = S.ui.kTab;
  const pct = Math.min(100, Math.round(st.lulusSks / st.target * 100));
  const pctPlan = Math.min(100 - pct, Math.round(st.diambilSks / st.target * 100));
  return `
  <header class="page-head">
    <div><p class="eyebrow">Rencana kuliah</p><h1>Studi</h1></div>
    <label class="cur-sem">Semester sekarang<select data-change="curSem">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(n => `<option ${n === st.cur ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
  </header>

  <section class="card progress-card">
    <div class="pc-top">
      <div><span class="pc-big">${st.lulusSks}</span><span class="pc-of">/ ${st.target} SKS lulus</span></div>
      <div class="pc-right"><span class="muted small">Sisa</span><b>${Math.max(0, st.target - st.lulusSks)} SKS</b></div>
    </div>
    <div class="pbar"><i style="width:${pct}%"></i><i class="plan" style="width:${pctPlan}%"></i></div>
    <div class="legend"><span><i style="--c:var(--mint)"></i>Lulus ${pct}%</span><span><i style="--c:var(--accent)"></i>Sedang diambil ${st.diambilSks} SKS</span>${st.rencanaSks ? `<span><i style="--c:var(--faint)"></i>Direncanakan ${st.rencanaSks} SKS</span>` : ''}</div>
  </section>

  <div class="stats">
    ${stat('IPK', fmtIp(st.ipk), st.gradedSks ? `dari ${st.gradedSks} SKS bernilai` : 'isi nilai MK yang sudah lulus', st.ipk != null && st.ipk >= 3 ? 'good' : '')}
    ${stat('Sedang diambil', `${st.diambilSks} SKS`, `${st.nDiambil} mata kuliah`)}
    ${stat('Wajib lulus', `${st.wajibLulus}/${KURIKULUM_SI_2024.wajib}`, 'SKS mata kuliah wajib')}
    ${stat('Pilihan', `${st.pilihanLulus}/${KURIKULUM_SI_2024.pilihan}`, `SKS lulus · ${st.pilihanPlan} SKS dipilih`)}
  </div>

  <div class="toolbar">
    <div class="tabs">
      ${[['semester', 'Per semester'], ['semua', 'Semua MK'], ['pilihan', 'MK Pilihan']].map(([k, l]) => `<button class="tab ${tab === k ? 'on' : ''}" data-act="kTab" data-v="${k}">${l}</button>`).join('')}
    </div>
    <button class="btn sm" data-act="courseNew">${ICON.plus} MK lain</button>
  </div>

  ${tab === 'semester' ? kuliahSemesters(st) : tab === 'semua' ? kuliahAll() : kuliahElectives()}`;
}

function kuliahOnboarding() {
  return `
  <header class="page-head"><div><p class="eyebrow">Rencana kuliah</p><h1>Studi</h1></div></header>
  <section class="card onboard">
    <h2>Mulai rencana kuliahmu</h2>
    <p class="muted">Muat daftar mata kuliah resmi <b>S1 Sistem Informasi FILKOM UB, Kurikulum 2024–2027</b>: total <b>145 SKS</b> (117 SKS wajib + 28 SKS pilihan dari 30 MK pilihan). Semua data bisa diubah setelah dimuat.</p>
    <form class="seed-form" data-form="seedKurikulum">
      <label>Sekarang kamu semester berapa?<select name="cur">${[1, 2, 3, 4, 5, 6, 7, 8].map(n => `<option ${n === 5 ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
      <label class="checkline"><input type="checkbox" name="markPast" checked><span>Tandai MK wajib di semester sebelumnya sebagai <b>lulus</b> (nilainya diisi belakangan)</span></label>
      <label class="checkline"><input type="checkbox" name="markCur" checked><span>Tandai MK wajib semester ini sebagai <b>sedang diambil</b></span></label>
      <button class="btn primary">Muat kurikulum</button>
    </form>
    <p class="muted small">Sumber: Pedoman Pelaksanaan Kurikulum Program Studi S1 Sistem Informasi FILKOM UB 2024–2027 (jalur reguler).</p>
    <button class="btn ghost sm" data-act="courseNew">Atau tambah mata kuliah manual</button>
  </section>`;
}

function courseRow(c) {
  const miss = (c.status === 'diambil' || c.status === 'rencana') ? prereqMissing(c) : null;
  return `<li class="crow st-${c.status}" data-act="courseEdit" data-id="${c.id}">
    <span class="cdot" title="${C_STATUS[c.status]}"></span>
    <span class="cname">${esc(c.name)}<small>${esc(c.code || '')}${c.type === 'pilihan' ? ' · pilihan' : ''}${c.prak ? ' · praktikum' : ''}</small>
      ${miss ? `<em class="cwarn">⚠ prasyarat: ${esc(miss)}</em>` : ''}</span>
    <span class="csks">${num(c.sks)} SKS</span>
    ${c.status === 'lulus' && c.grade ? `<span class="cgrade g-${c.grade.replace('+', 'p')}">${esc(c.grade)}</span>` : c.status === 'diambil' ? '<span class="cgrade now">•</span>' : '<span class="cgrade"></span>'}
  </li>`;
}

function kuliahSemesters(st) {
  const cs = courseList();
  const sems = uniq([1, 2, 3, 4, 4.5, 5, 6, 7, 8, ...cs.map(c => num(c.sem)).filter(Boolean)]).sort((a, b) => a - b);
  const unplanned = cs.filter(c => !num(c.sem));
  return `<div class="sem-grid">${sems.map(s => {
    const list = cs.filter(c => num(c.sem) === s).sort((a, b) => (a.type === b.type ? 0 : a.type === 'wajib' ? -1 : 1) || a.name.localeCompare(b.name));
    const sks = list.reduce((a, c) => a + num(c.sks), 0);
    const isCur = s === st.cur, ip = ips(list);
    const recPil = s === 6 ? 15 : s === 7 ? 13 : 0;
    const pil = list.filter(c => c.type === 'pilihan').reduce((a, c) => a + num(c.sks), 0);
    return `<section class="card sem-card ${isCur ? 'cur' : ''} ${s === 4.5 ? 'antara' : ''}">
      <div class="sem-head"><h3>${semLabel(s)}</h3>${isCur ? '<span class="chip today">Sekarang</span>' : ''}<span class="spacer"></span>
        <span class="muted small">${sks} SKS${ip != null ? ` · IPS ${fmtIp(ip)}` : ''}</span></div>
      ${list.length ? `<ul class="clist">${list.map(courseRow).join('')}</ul>` : '<p class="empty small">Belum ada mata kuliah.</p>'}
      ${recPil ? `<button class="slot ${pil >= recPil ? 'ok' : ''}" data-act="kTab" data-v="pilihan">Slot MK pilihan: ${pil}/${recPil} SKS (rekomendasi) → pilih</button>` : ''}
      <button class="btn ghost sm add-c" data-act="courseNew" data-sem="${s}">${ICON.plus} Tambah MK</button>
    </section>`;
  }).join('')}</div>
  ${unplanned.filter(c => c.type !== 'pilihan' || c.status !== 'belum').length ? `<section class="card"><h3>Belum dijadwalkan</h3><ul class="clist">${unplanned.filter(c => c.type !== 'pilihan' || c.status !== 'belum').map(courseRow).join('')}</ul></section>` : ''}`;
}

function kuliahAll() {
  const q = S.ui.kQuery.toLowerCase(), f = S.ui.kFilter;
  const F = { semua: () => true, wajib: c => c.type === 'wajib', pilihan: c => c.type === 'pilihan', belum: c => c.status === 'belum', diambil: c => c.status === 'diambil', lulus: c => c.status === 'lulus' };
  const list = courseList().filter(F[f]).filter(c => !q || `${c.name} ${c.code}`.toLowerCase().includes(q))
    .sort((a, b) => (num(a.sem) || 99) - (num(b.sem) || 99) || a.name.localeCompare(b.name));
  return `<section class="card">
    <div class="all-tools">
      <label class="search">${ICON.search}<input type="search" placeholder="Cari mata kuliah / kode…" value="${esc(S.ui.kQuery)}" data-input="kQuery"></label>
      <div class="chips">${Object.keys(F).map(k => `<button class="chip-btn ${k === f ? 'on' : ''}" data-act="kFilter" data-v="${k}">${k[0].toUpperCase() + k.slice(1)}</button>`).join('')}</div>
    </div>
    <div id="kAll">${list.length ? `<ul class="clist">${list.map(c => courseRow(c).replace('</small>', ` · ${semLabel(c.sem)}</small>`)).join('')}</ul>` : '<p class="empty">Tidak ada yang cocok.</p>'}</div>
  </section>`;
}

function kuliahElectives() {
  const st = studyStats();
  const el = courseList().filter(c => c.type === 'pilihan').sort((a, b) => a.name.localeCompare(b.name));
  const opts = (c) => [5, 6, 7, 8, 9, 10].map(n => `<option value="${n}" ${num(c.sem) === n ? 'selected' : ''}>Sem ${n}</option>`).join('');
  return `<section class="card">
    <div class="card-head"><h2>Mata kuliah pilihan</h2><span class="muted small">Dipilih ${st.pilihanPlan}/${KURIKULUM_SI_2024.pilihan} SKS · rekomendasi: semester 6 (15 SKS) & 7 (13 SKS)</span></div>
    <div class="pbar slim"><i style="width:${Math.min(100, st.pilihanLulus / 28 * 100)}%"></i><i class="plan" style="width:${Math.min(100, Math.max(0, st.pilihanPlan - st.pilihanLulus) / 28 * 100)}%"></i></div>
    ${el.length ? `<ul class="elist">${el.map(c => {
      const chosen = c.status !== 'belum';
      const miss = prereqMissing(c);
      return `<li class="${chosen ? 'chosen' : ''}">
        <div class="el-main" data-act="courseEdit" data-id="${c.id}"><b>${esc(c.name)}</b>
          <small>${esc(c.code)} · ${num(c.sks)} SKS · ${esc(c.offer || '')}${c.prak ? ' · praktikum' : ''}${c.prereq ? ` · prasyarat ${esc(courseList().find(x => x.code === c.prereq)?.name || c.prereq)}` : ''}</small>
          ${miss && !chosen ? '' : miss ? `<em class="cwarn">⚠ prasyarat belum lulus</em>` : ''}</div>
        ${chosen ? `<span class="chip ${c.status === 'lulus' ? 'today' : ''}">${C_STATUS[c.status]}${num(c.sem) ? ' · Sem ' + num(c.sem) : ''}</span>
          <button class="btn ghost sm" data-act="electiveDrop" data-id="${c.id}">Batal</button>`
        : `<select data-change="electivePlan" data-id="${c.id}" aria-label="Rencanakan di semester"><option value="">+ Rencanakan…</option>${opts(c)}</select>`}
      </li>`;
    }).join('')}</ul>` : '<p class="empty">Belum ada MK pilihan. Tambahkan lewat “MK lain”.</p>'}
  </section>`;
}

function courseModal(c) {
  const isNew = !c.id;
  const semOpts = [['', 'Belum dijadwalkan'], ...[1, 2, 3, 4].map(n => [n, `Semester ${n}`]), [4.5, 'Semester antara'], ...[5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(n => [n, `Semester ${n}`])];
  return `<form class="modal-body" data-form="saveCourse" data-id="${c.id || ''}">
    <h2>${isNew ? 'Tambah mata kuliah' : esc(c.name)}</h2>
    ${isNew ? '' : `<p class="muted small">${esc(c.code || '')}${c.prereq ? ` · prasyarat: ${esc(courseList().find(x => x.code === c.prereq)?.name || c.prereq)}` : ''}${c.offer ? ` · ditawarkan ${esc(c.offer)}` : ''}</p>`}
    <label>Nama mata kuliah<input name="name" required value="${esc(c.name || '')}" autocomplete="off"></label>
    <div class="row3">
      <label>Kode<input name="code" value="${esc(c.code || '')}" autocomplete="off"></label>
      <label>SKS<input name="sks" inputmode="numeric" required value="${esc(c.sks ?? '')}"></label>
      <label>Sifat<select name="type"><option value="wajib" ${c.type !== 'pilihan' ? 'selected' : ''}>Wajib</option><option value="pilihan" ${c.type === 'pilihan' ? 'selected' : ''}>Pilihan</option></select></label>
    </div>
    <div class="row3">
      <label>Semester<select name="sem">${semOpts.map(([v, l]) => `<option value="${v}" ${String(num(c.sem) || '') === String(v) ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
      <label>Status<select name="status">${Object.entries(C_STATUS).map(([k, l]) => `<option value="${k}" ${k === (c.status || 'belum') ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
      <label>Nilai<select name="grade"><option value="">—</option>${Object.keys(GRADES).map(g => `<option ${g === c.grade ? 'selected' : ''}>${g}</option>`).join('')}</select></label>
    </div>
    <label>Catatan<input name="note" value="${esc(c.note || '')}" placeholder="mis. dosen, kelas, jadwal" autocomplete="off"></label>
    <div class="modal-actions">
      ${isNew ? '' : `<button type="button" class="btn ghost danger" data-act="courseDelete" data-id="${c.id}">${ICON.trash} Hapus</button><span class="spacer"></span>`}
      <button type="button" class="btn ghost" data-act="closeModal">Batal</button>
      <button class="btn primary">Simpan</button>
    </div>
  </form>`;
}

function homeStudyCard() {
  if (!courseList().length) return '';
  const st = studyStats(), pct = Math.min(100, Math.round(st.lulusSks / st.target * 100));
  return `<section class="card">
    <div class="card-head"><h2>Studi</h2><a class="link" href="#kuliah">Rencana →</a></div>
    <div class="study-mini"><b>${st.lulusSks}</b><span>/ ${st.target} SKS</span><span class="spacer"></span><span class="muted small">IPK</span><b>${fmtIp(st.ipk)}</b></div>
    <div class="pbar slim"><i style="width:${pct}%"></i><i class="plan" style="width:${Math.min(100 - pct, st.diambilSks / st.target * 100)}%"></i></div>
    <p class="muted small" style="margin:8px 0 0">Semester ${st.cur} · sedang mengambil ${st.diambilSks} SKS · sisa ${Math.max(0, st.target - st.lulusSks)} SKS</p>
  </section>`;
}

const KULIAH_FORM = {
  async seedKurikulum(f, d) {
    const cur = +d.cur || 1, markPast = !!d.markPast, markCur = !!d.markCur;
    const K = KURIKULUM_SI_2024;
    if (!courseMeta()) await add('courses', { type: 'meta', code: '__meta', name: K.label, cur_sem: cur, target: K.total, curriculum: 'SI-2024' });
    for (const [sem, code, name, sks, prak, prereq] of K.courses) {
      const status = markPast && sem < cur ? 'lulus' : markCur && sem === cur ? 'diambil' : 'belum';
      await add('courses', { type: 'wajib', code, name, sks, sem, prak: !!prak, prereq, offer: '', status, grade: '', note: '' });
    }
    for (const [code, name, sks, prak, offer, prereq] of K.electives)
      await add('courses', { type: 'pilihan', code, name, sks, sem: '', prak: !!prak, prereq, offer, status: 'belum', grade: '', note: '' });
    render(); toast(`${K.courses.length + K.electives.length} mata kuliah dimuat`);
  },
  async saveCourse(f, d) {
    const data = { name: d.name.trim(), code: d.code.trim(), sks: num(d.sks), type: d.type, sem: d.sem === '' ? '' : num(d.sem), status: d.status, grade: d.grade, note: d.note.trim() };
    if (data.grade && data.status !== 'lulus' && data.grade !== 'E') data.status = 'lulus';
    if (f.dataset.id) await patch('courses', f.dataset.id, data);
    else await add('courses', { ...data, prak: false, prereq: '', offer: '' });
    closeModal(); render(); toast('Mata kuliah disimpan');
  },
};
const KULIAH_ACT = {
  kTab(el) { S.ui.kTab = el.dataset.v; render(); },
  kFilter(el) { S.ui.kFilter = el.dataset.v; render(); },
  courseEdit(el) { const c = find('courses', el.dataset.id); if (c) openModal(courseModal(c)); },
  courseNew(el) { openModal(courseModal({ sem: el.dataset.sem ? num(el.dataset.sem) : '', type: 'wajib', status: el.dataset.sem && num(el.dataset.sem) === studyStats().cur ? 'diambil' : 'rencana' })); },
  async courseDelete(el) {
    const c = find('courses', el.dataset.id); if (!c) return;
    if (!confirm(`Hapus mata kuliah "${c.name}"?`)) return;
    await del('courses', c.id); closeModal(); render();
  },
  async electiveDrop(el) { await patch('courses', el.dataset.id, { status: 'belum', sem: '', grade: '' }); render(); },
};
const KULIAH_CHANGE = {
  async curSem(el) {
    const m = courseMeta();
    if (m) await patch('courses', m.id, { cur_sem: +el.value });
    else await add('courses', { type: 'meta', code: '__meta', name: KURIKULUM_SI_2024.label, cur_sem: +el.value, target: KURIKULUM_SI_2024.total });
    render();
  },
  async electivePlan(el) {
    if (!el.value) return;
    const s = num(el.value);
    await patch('courses', el.dataset.id, { sem: s, status: s === studyStats().cur ? 'diambil' : 'rencana' });
    render(); toast('MK pilihan direncanakan');
  },
};

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
        <dt>Tugas & to-do (aktif / selesai)</dt><dd>${S.todos.filter(x => !x.done).length} / ${S.todos.filter(x => x.done).length}</dd>
        <dt>Transaksi</dt><dd>${S.transactions.length}</dd>
        <dt>Kebiasaan</dt><dd>${S.habits.length}</dd>
        <dt>Catatan olahraga</dt><dd>${S.workouts.length}</dd>
        <dt>Mata kuliah</dt><dd>${courseList().length}</dd>
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
const volume = w => (w.exercises || []).reduce((a, e) => a + exVolume(e), 0);

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
  const ring = $('#timerRing'); if (ring) ring.style.strokeDashoffset = String(RING * (1 - left / Math.max(1, T.total)));
  const btn = $('#timerBtn'); if (btn) btn.textContent = T.running ? 'Jeda' : left === 0 || left === T.total ? 'Mulai' : 'Lanjut';
  const f = $('#timerFace'); if (f) { f.classList.toggle('run', T.running); f.classList.toggle('done', T.done); }
  const rb = $('#restBar'); if (rb) { rb.classList.toggle('run', T.running); rb.classList.toggle('done', T.done); }
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

/* ================================================================ PUSTAKA GERAKAN + DIAGRAM OTOT */
const MUSCLES = {
  chest: 'Dada', shoulders: 'Bahu depan', rear_delts: 'Bahu belakang', biceps: 'Biseps', triceps: 'Triseps', forearms: 'Lengan bawah',
  abs: 'Perut', obliques: 'Perut samping', traps: 'Trapezius', lats: 'Punggung (lats)', upper_back: 'Punggung atas', lower_back: 'Punggung bawah',
  glutes: 'Bokong', quads: 'Paha depan', hamstrings: 'Paha belakang', adductors: 'Paha dalam', calves: 'Betis',
};
/* [id, nama, alat, otot utama, otot pendukung, cara, tips] */
const EXLIB = [
  ['bench_press', 'Bench Press', 'Barbell', ['chest'], ['shoulders', 'triceps'],
    'Berbaring di bench, mata sejajar bar. Pegang bar sedikit lebih lebar dari bahu. Turunkan bar terkontrol ke dada tengah, lalu dorong lurus ke atas.',
    'Rapatkan tulang belikat dan jaga kaki menapak lantai. Siku ±45° dari badan, jangan melebar 90°.'],
  ['incline_db_press', 'Incline Dumbbell Press', 'Dumbbell + bench miring', ['chest'], ['shoulders', 'triceps'],
    'Atur bench 30–45°. Mulai dengan dumbbell di samping dada atas, dorong ke atas hingga lengan hampir lurus, turunkan pelan.',
    'Jangan terlalu curam (bahu jadi dominan). Kontrol fase turun 2–3 detik.'],
  ['push_up', 'Push Up', 'Berat badan', ['chest'], ['shoulders', 'triceps', 'abs'],
    'Tangan selebar bahu, badan lurus dari kepala ke tumit. Turunkan dada hingga hampir menyentuh lantai, dorong kembali.',
    'Kencangkan perut dan bokong agar pinggul tidak turun. Versi lutut untuk pemula.'],
  ['dips', 'Dips', 'Parallel bar', ['chest', 'triceps'], ['shoulders'],
    'Tumpu di parallel bar dengan lengan lurus. Turunkan badan hingga siku ±90°, dorong kembali ke atas.',
    'Condong ke depan = dada lebih kerja; badan tegak = triseps. Hindari turun terlalu dalam jika bahu sakit.'],
  ['ohp', 'Overhead Press', 'Barbell / dumbbell', ['shoulders'], ['triceps', 'traps', 'abs'],
    'Berdiri, bar di depan bahu. Dorong bar lurus ke atas kepala hingga lengan lurus, turunkan kembali ke bahu.',
    'Kencangkan perut dan bokong, jangan melengkungkan punggung bawah. Kepala sedikit mundur saat bar lewat.'],
  ['lateral_raise', 'Lateral Raise', 'Dumbbell', ['shoulders'], ['traps'],
    'Berdiri dengan dumbbell di samping badan. Angkat ke samping hingga setinggi bahu dengan siku sedikit ditekuk, turunkan pelan.',
    'Pakai beban ringan dan kontrol; jangan mengayun badan. Bayangkan mendorong dumbbell menjauh ke samping.'],
  ['tricep_pushdown', 'Triceps Pushdown', 'Cable', ['triceps'], ['forearms'],
    'Pegang tali/bar cable, siku menempel di samping badan. Dorong ke bawah hingga lengan lurus, kembali pelan.',
    'Siku tetap diam, hanya lengan bawah yang bergerak.'],
  ['pull_up', 'Pull Up', 'Pull-up bar', ['lats'], ['biceps', 'upper_back', 'forearms'],
    'Gantung dengan genggaman sedikit lebih lebar dari bahu. Tarik badan hingga dagu melewati bar, turun terkontrol.',
    'Mulai gerakan dari menarik bahu ke bawah. Pakai band/assisted machine jika belum kuat.'],
  ['lat_pulldown', 'Lat Pulldown', 'Mesin cable', ['lats'], ['biceps', 'upper_back'],
    'Duduk, genggam bar lebar. Tarik bar ke dada atas sambil membusungkan dada, lalu kembalikan pelan.',
    'Jangan menarik ke belakang kepala. Hindari mengayun badan ke belakang terlalu jauh.'],
  ['barbell_row', 'Barbell Row', 'Barbell', ['upper_back', 'lats'], ['biceps', 'rear_delts', 'lower_back'],
    'Badan condong ±45°, punggung lurus. Tarik bar ke perut bagian bawah, rapatkan belikat, turunkan pelan.',
    'Jaga punggung netral (tidak membungkuk). Lutut sedikit ditekuk.'],
  ['seated_row', 'Seated Cable Row', 'Cable', ['upper_back', 'lats'], ['biceps', 'rear_delts'],
    'Duduk tegak, tarik handle ke perut sambil merapatkan belikat, kembalikan dengan lengan lurus.',
    'Badan jangan ikut maju-mundur berlebihan; fokus di punggung.'],
  ['face_pull', 'Face Pull', 'Cable + tali', ['rear_delts', 'upper_back'], ['traps'],
    'Cable setinggi wajah. Tarik tali ke arah wajah dengan siku tinggi, pisahkan ujung tali di samping telinga.',
    'Bagus untuk kesehatan bahu dan postur. Gunakan beban ringan-sedang.'],
  ['db_curl', 'Dumbbell Curl', 'Dumbbell', ['biceps'], ['forearms'],
    'Berdiri, telapak menghadap depan. Tekuk siku mengangkat dumbbell ke bahu, turunkan pelan.',
    'Siku tetap di samping badan, jangan mengayun.'],
  ['hammer_curl', 'Hammer Curl', 'Dumbbell', ['biceps', 'forearms'], [],
    'Seperti curl biasa tapi telapak saling berhadapan (seperti memegang palu).',
    'Melatih lengan bawah dan otot brachialis.'],
  ['deadlift', 'Deadlift', 'Barbell', ['hamstrings', 'glutes', 'lower_back'], ['traps', 'forearms', 'quads'],
    'Kaki selebar pinggul, bar di atas tengah kaki. Pegang bar, punggung lurus, dorong lantai dan berdiri tegak sambil mendorong pinggul ke depan.',
    'Bar tetap dekat dengan kaki. Jangan membungkukkan punggung — belajar dengan beban ringan dulu.'],
  ['rdl', 'Romanian Deadlift', 'Barbell / dumbbell', ['hamstrings', 'glutes'], ['lower_back'],
    'Berdiri memegang beban, lutut sedikit ditekuk. Dorong pinggul ke belakang sambil menurunkan beban di sepanjang kaki hingga paha belakang terasa tertarik, lalu berdiri.',
    'Gerakan dari pinggul, bukan membungkuk. Punggung tetap lurus.'],
  ['squat', 'Back Squat', 'Barbell', ['quads', 'glutes'], ['hamstrings', 'adductors', 'lower_back'],
    'Bar di punggung atas, kaki selebar bahu. Turun seperti duduk hingga paha sejajar lantai, dorong kembali berdiri.',
    'Lutut searah ujung kaki, dada tegak, tumit tetap menapak.'],
  ['goblet_squat', 'Goblet Squat', 'Dumbbell / kettlebell', ['quads', 'glutes'], ['abs', 'adductors'],
    'Pegang dumbbell di depan dada. Squat turun dengan siku di antara lutut, lalu berdiri.',
    'Pilihan bagus untuk belajar teknik squat.'],
  ['leg_press', 'Leg Press', 'Mesin', ['quads', 'glutes'], ['hamstrings'],
    'Duduk di mesin, kaki di platform selebar bahu. Turunkan platform hingga lutut ±90°, dorong kembali tanpa mengunci lutut.',
    'Punggung bawah tetap menempel sandaran.'],
  ['lunge', 'Lunges', 'Berat badan / dumbbell', ['quads', 'glutes'], ['hamstrings', 'calves'],
    'Langkah besar ke depan, turunkan badan hingga kedua lutut ±90°, dorong kembali. Ganti kaki.',
    'Badan tegak, lutut depan tidak jatuh ke dalam.'],
  ['bulgarian', 'Bulgarian Split Squat', 'Bench + dumbbell', ['quads', 'glutes'], ['adductors', 'hamstrings'],
    'Satu kaki belakang ditumpu di bench. Turunkan badan dengan kaki depan hingga paha sejajar lantai, lalu naik.',
    'Sangat bagus untuk pelari (kekuatan satu kaki).'],
  ['hip_thrust', 'Hip Thrust', 'Barbell + bench', ['glutes'], ['hamstrings'],
    'Punggung atas bersandar di bench, bar di pinggul. Dorong pinggul ke atas hingga badan lurus, tahan sebentar, turunkan.',
    'Dagu sedikit menunduk, jangan melengkungkan punggung di atas.'],
  ['glute_bridge', 'Glute Bridge', 'Berat badan', ['glutes'], ['hamstrings', 'lower_back'],
    'Berbaring, lutut ditekuk. Angkat pinggul hingga lurus dari lutut ke bahu, tahan 1–2 detik, turunkan.',
    'Latihan aktivasi bokong yang bagus sebelum lari.'],
  ['leg_curl', 'Leg Curl', 'Mesin', ['hamstrings'], ['calves'],
    'Di mesin, tekuk lutut menarik bantalan ke arah bokong, kembalikan pelan.',
    'Kontrol fase kembali, jangan dihentak.'],
  ['leg_extension', 'Leg Extension', 'Mesin', ['quads'], [],
    'Duduk di mesin, luruskan lutut mengangkat bantalan, turunkan pelan.',
    'Beban sedang, rentang gerak penuh tanpa hentakan.'],
  ['calf_raise', 'Calf Raise', 'Berat badan / mesin', ['calves'], [],
    'Berdiri di tepi tangga/step, naikkan tumit setinggi mungkin, turunkan hingga betis teregang.',
    'Penting untuk pelari: kuatkan betis dan tendon Achilles.'],
  ['plank', 'Plank', 'Berat badan', ['abs'], ['obliques', 'shoulders'],
    'Tumpu pada lengan bawah dan ujung kaki, badan lurus. Tahan sesuai target waktu.',
    'Jangan pinggul terlalu tinggi atau turun. Isi "reps" dengan detik.'],
  ['crunch', 'Crunch', 'Berat badan', ['abs'], [],
    'Berbaring, lutut ditekuk. Angkat bahu dari lantai dengan mengencangkan perut, turunkan pelan.',
    'Jangan menarik leher dengan tangan.'],
  ['russian_twist', 'Russian Twist', 'Berat badan / plate', ['obliques'], ['abs'],
    'Duduk dengan badan condong ke belakang, kaki terangkat/menapak. Putar badan ke kiri-kanan bergantian.',
    'Gerakan dari badan, bukan hanya lengan.'],
  ['hanging_leg_raise', 'Hanging Leg Raise', 'Pull-up bar', ['abs'], ['obliques', 'forearms'],
    'Gantung di bar, angkat kaki (lurus atau ditekuk) hingga sejajar pinggul, turunkan pelan.',
    'Hindari mengayun badan.'],
  ['shrug', 'Shrug', 'Dumbbell / barbell', ['traps'], ['forearms'],
    'Berdiri memegang beban, angkat bahu lurus ke atas ke arah telinga, tahan sebentar, turunkan.',
    'Jangan memutar bahu.'],
];
const exLibMap = Object.fromEntries(EXLIB.map(([id, name, equip, primary, secondary, how, tips]) => [id, { id, name, equip, primary, secondary, how, tips, builtin: true }]));
const sportlib = kind => (S.sportlib || []).filter(x => x.kind === kind);
function exAll() {
  const over = Object.fromEntries(sportlib('exercise').filter(x => x.ex_id).map(x => [x.ex_id, x]));
  const lib = Object.values(exLibMap).map(e => over[e.id] ? { ...e, youtube: over[e.id].youtube || '', overId: over[e.id].id } : e);
  const custom = sportlib('exercise').filter(x => !x.ex_id).map(x => ({ id: x.id, name: x.name, equip: x.equip || '', primary: x.primary || [], secondary: x.secondary || [], how: x.how || '', tips: x.tips || '', youtube: x.youtube || '', custom: true }));
  return [...lib, ...custom].sort((a, b) => a.name.localeCompare(b.name));
}
function exGet(idOrName) {
  if (!idOrName) return null;
  const all = exAll();
  return all.find(e => e.id === idOrName) || all.find(e => e.name.toLowerCase() === String(idOrName).toLowerCase()) || null;
}
const ytLink = e => (e && e.youtube) || `https://www.youtube.com/results?search_query=${encodeURIComponent(`cara ${e ? e.name : ''} yang benar`)}`;

/* diagram tubuh: depan (kiri) & belakang (kanan). otot utama = warna kuat, pendukung = warna muda */
function muscleSvg(primary = [], secondary = [], cls = '') {
  const P = new Set(primary), Sx = new Set(secondary);
  const c = m => `mu ${P.has(m) ? 'p' : Sx.has(m) ? 's' : ''}`;
  return `<svg class="muscle-svg ${cls}" viewBox="0 0 200 214" role="img" aria-label="Otot: ${esc([...primary, ...secondary].map(m => MUSCLES[m]).join(', '))}">
  <g class="body">
    <circle cx="50" cy="15" r="10"/><rect x="45" y="24" width="10" height="8" rx="3"/>
    <path d="M28 34 Q50 28 72 34 L74 96 Q50 104 26 96 Z"/>
    <path d="M26 36 Q16 40 15 56 L12 104 Q16 108 20 104 L26 60 Z"/><path d="M74 36 Q84 40 85 56 L88 104 Q84 108 80 104 L74 60 Z"/>
    <path d="M32 96 L49 100 L48 196 Q42 202 37 196 L31 140 Z"/><path d="M68 96 L51 100 L52 196 Q58 202 63 196 L69 140 Z"/>
    <circle cx="150" cy="15" r="10"/><rect x="145" y="24" width="10" height="8" rx="3"/>
    <path d="M128 34 Q150 28 172 34 L174 96 Q150 104 126 96 Z"/>
    <path d="M126 36 Q116 40 115 56 L112 104 Q116 108 120 104 L126 60 Z"/><path d="M174 36 Q184 40 185 56 L188 104 Q184 108 180 104 L174 60 Z"/>
    <path d="M132 96 L149 100 L148 196 Q142 202 137 196 L131 140 Z"/><path d="M168 96 L151 100 L152 196 Q158 202 163 196 L169 140 Z"/>
  </g>
  <g class="${c('traps')}"><path d="M42 30 L36 36 L44 36 Z"/><path d="M58 30 L64 36 L56 36 Z"/><path d="M150 28 L134 38 L150 60 L166 38 Z"/></g>
  <g class="${c('shoulders')}"><ellipse cx="29" cy="41" rx="7.5" ry="7"/><ellipse cx="71" cy="41" rx="7.5" ry="7"/></g>
  <g class="${c('chest')}"><path d="M34 38 Q42 36 49 39 L49 54 Q40 58 33 52 Z"/><path d="M66 38 Q58 36 51 39 L51 54 Q60 58 67 52 Z"/></g>
  <g class="${c('biceps')}"><ellipse cx="22.5" cy="60" rx="4.6" ry="10"/><ellipse cx="77.5" cy="60" rx="4.6" ry="10"/></g>
  <g class="${c('forearms')}"><ellipse cx="17.5" cy="84" rx="4" ry="11"/><ellipse cx="82.5" cy="84" rx="4" ry="11"/><ellipse cx="117.5" cy="84" rx="4" ry="11"/><ellipse cx="182.5" cy="84" rx="4" ry="11"/></g>
  <g class="${c('abs')}"><rect x="43" y="58" width="14" height="34" rx="4"/></g>
  <g class="${c('obliques')}"><path d="M35 60 L41 60 L41 90 L36 92 Z"/><path d="M65 60 L59 60 L59 90 L64 92 Z"/></g>
  <g class="${c('quads')}"><ellipse cx="40" cy="124" rx="7.5" ry="20"/><ellipse cx="60" cy="124" rx="7.5" ry="20"/></g>
  <g class="${c('adductors')}"><ellipse cx="46.5" cy="112" rx="2.6" ry="10"/><ellipse cx="53.5" cy="112" rx="2.6" ry="10"/></g>
  <g class="${c('calves')}"><ellipse cx="40.5" cy="170" rx="5" ry="15"/><ellipse cx="59.5" cy="170" rx="5" ry="15"/><ellipse cx="140.5" cy="168" rx="6.2" ry="15"/><ellipse cx="159.5" cy="168" rx="6.2" ry="15"/></g>
  <g class="${c('rear_delts')}"><ellipse cx="129" cy="41" rx="7.5" ry="7"/><ellipse cx="171" cy="41" rx="7.5" ry="7"/></g>
  <g class="${c('triceps')}"><ellipse cx="122.5" cy="60" rx="4.6" ry="10"/><ellipse cx="177.5" cy="60" rx="4.6" ry="10"/></g>
  <g class="${c('upper_back')}"><path d="M140 42 L150 62 L160 42 L163 54 L150 68 L137 54 Z"/></g>
  <g class="${c('lats')}"><path d="M131 48 L141 58 L147 82 L134 86 L130 66 Z"/><path d="M169 48 L159 58 L153 82 L166 86 L170 66 Z"/></g>
  <g class="${c('lower_back')}"><rect x="143" y="76" width="14" height="18" rx="4"/></g>
  <g class="${c('glutes')}"><ellipse cx="141.5" cy="105" rx="9" ry="9"/><ellipse cx="158.5" cy="105" rx="9" ry="9"/></g>
  <g class="${c('hamstrings')}"><ellipse cx="140.5" cy="133" rx="7.2" ry="18"/><ellipse cx="159.5" cy="133" rx="7.2" ry="18"/></g>
  <text x="50" y="212" text-anchor="middle">Depan</text><text x="150" y="212" text-anchor="middle">Belakang</text>
  </svg>`;
}
const muscleChips = (e) => `${e.primary.map(m => `<span class="mchip p">${MUSCLES[m] || m}</span>`).join('')}${e.secondary.map(m => `<span class="mchip s">${MUSCLES[m] || m}</span>`).join('')}`;

function exerciseModal(e) {
  return `<div class="modal-body ex-modal">
    <div class="ex-top">
      ${muscleSvg(e.primary, e.secondary, 'big')}
      <div>
        <h2>${esc(e.name)}</h2>
        <p class="muted small">${esc(e.equip || '')}</p>
        <div class="mchips">${muscleChips(e)}</div>
        <p class="legend-mini"><i class="lp"></i>otot utama <i class="ls"></i>otot pendukung</p>
      </div>
    </div>
    ${e.how ? `<h3>Cara melakukan</h3><p>${esc(e.how)}</p>` : ''}
    ${e.tips ? `<h3>Tips</h3><p class="muted">${esc(e.tips)}</p>` : ''}
    <div class="btn-row">
      <a class="btn primary yt" href="${esc(ytLink(e))}" target="_blank" rel="noopener">▶ ${e.youtube ? 'Tonton video' : 'Cari video di YouTube'}</a>
      <button class="btn" data-act="exSetYt" data-id="${esc(e.id)}">${e.youtube ? 'Ganti link video' : 'Simpan link video sendiri'}</button>
      ${e.custom ? `<button class="btn ghost danger" data-act="exDelete" data-id="${esc(e.id)}">Hapus gerakan</button>` : ''}
    </div>
    <div class="modal-actions"><button type="button" class="btn ghost" data-act="closeModal">Tutup</button></div>
  </div>`;
}
function exerciseNewModal() {
  const box = (name) => Object.entries(MUSCLES).map(([k, l]) => `<label class="mpick"><input type="checkbox" name="${name}" value="${k}"><span>${l}</span></label>`).join('');
  return `<form class="modal-body" data-form="exCreate">
    <h2>Gerakan baru</h2>
    <div class="row2"><label>Nama gerakan<input name="name" required autocomplete="off"></label><label>Alat<input name="equip" placeholder="mis. Dumbbell" autocomplete="off"></label></div>
    <label>Otot utama</label><div class="mpicks">${box('primary')}</div>
    <label>Otot pendukung</label><div class="mpicks">${box('secondary')}</div>
    <label>Cara melakukan<textarea name="how" rows="2"></textarea></label>
    <label>Link video YouTube (opsional)<input name="youtube" inputmode="url" placeholder="https://youtu.be/..." autocomplete="off"></label>
    <div class="modal-actions"><button type="button" class="btn ghost" data-act="closeModal">Batal</button><button class="btn primary">Simpan</button></div>
  </form>`;
}

/* ================================================================ OLAHRAGA v2: Dashboard · Running · Strength */
const RUN_TYPES = {
  easy: { label: 'Easy run', color: '#16a37f', zone: [1.20, 1.30], desc: 'Santai, masih bisa ngobrol. Membangun daya tahan dasar.' },
  long: { label: 'Long run', color: '#2f6fe4', zone: [1.15, 1.25], desc: 'Lari terjauh minggu ini dengan pace santai & stabil.' },
  tempo: { label: 'Tempo run', color: '#e0874f', zone: [1.05, 1.10], desc: '"Comfortably hard" 20–40 menit, napas berat tapi terkontrol.' },
  interval: { label: 'Interval', color: '#e0604a', zone: [0.95, 1.00], desc: 'Repetisi cepat (mis. 400–1000 m) dengan jeda pemulihan.' },
  hard: { label: 'Hard run', color: '#b4232a', zone: [1.00, 1.05], desc: 'Lari cepat berkelanjutan / simulasi race pace.' },
  recovery: { label: 'Recovery run', color: '#64a8a0', zone: [1.30, 1.40], desc: 'Sangat pelan & pendek, untuk pemulihan setelah sesi berat.' },
};
const RUN_WARMUP = ['Jalan cepat 3–5 menit', 'Jogging sangat ringan 5–10 menit', 'Dynamic stretching: leg swing, hip circle, high knees, butt kicks (10–15× masing-masing)', 'Strides 4 × 80 m (khusus tempo/interval/hard)'];
const RUN_COOLDOWN = ['Jogging / jalan santai 5–10 menit', 'Stretching statis 30 detik/sisi: betis, hamstring, paha depan, hip flexor, bokong', 'Minum air & catat rasanya'];
const ST_WARMUP = ['Kardio ringan 5 menit (jalan cepat / sepeda / skipping)', 'Mobilitas: putar bahu, pinggul, pergelangan', '1–2 set pemanasan ringan (±50% beban) untuk gerakan pertama'];
const ST_COOLDOWN = ['Jalan santai 3–5 menit', 'Stretching statis otot yang dilatih, 30 detik/otot', 'Foam rolling (opsional)'];
const RPE = ['', '1 · sangat ringan', '2', '3 · ringan', '4', '5 · sedang', '6', '7 · berat', '8', '9 · sangat berat', '10 · maksimal'];

const fmtPace = s => { s = Math.round(s || 0); return s ? `${Math.floor(s / 60)}:${pad(s % 60)}` : ''; };
const parsePace = v => { v = String(v || '').trim(); if (!v) return 0; if (v.includes(':')) { const [m, s] = v.split(':').map(Number); return (m || 0) * 60 + (s || 0); } return Math.round(num(v) * 60); };
const linesOf = v => String(v || '').split('\n').map(s => s.trim()).filter(Boolean);
const runTypeLabel = t => (RUN_TYPES[t] || {}).label || 'Lari';
const runColor = t => (RUN_TYPES[t] || {}).color || '#2f6fe4';
function runProfile() { return sportlib('run_profile')[0] || null; }
function zonePaces(type) {
  const p = runProfile(); if (!p || !p.ref5k) return null;
  const p5 = p.ref5k / 5, z = (RUN_TYPES[type] || RUN_TYPES.easy).zone;
  return [Math.round(p5 * z[0]), Math.round(p5 * z[1])];
}
const zoneMid = type => { const z = zonePaces(type); return z ? Math.round((z[0] + z[1]) / 2) : 0; };
function planTime(pl) { return pl.time_sec || (num(pl.dist_km) && pl.pace_sec ? Math.round(num(pl.dist_km) * pl.pace_sec) : 0); }
function exVolume(e) {
  if (Array.isArray(e.log) && e.log.length) return e.log.reduce((a, s) => a + num(s.reps) * num(s.kg), 0);
  return num(e.sets) * num(e.reps) * num(e.kg);
}
const woVolume = w => (w.exercises || []).reduce((a, e) => a + exVolume(e), 0);
const woSets = w => (w.exercises || []).reduce((a, e) => a + (Array.isArray(e.log) ? e.log.length : num(e.sets)), 0);

function renderOlahraga() {
  const tab = S.ui.sTab;
  const live = stSession();
  return `
  <header class="page-head">
    <div><p class="eyebrow">Olahraga</p><h1>${tab === 'run' ? 'Running' : tab === 'st' ? 'Strength training' : 'Dashboard'}</h1></div>
  </header>
  <div class="sport-tabs" role="tablist">
    ${[['dash', '📊', 'Dashboard'], ['run', '🏃', 'Running'], ['st', '🏋️', 'Strength']].map(([k, ic, l]) =>
      `<button class="sport-tab ${tab === k ? 'on' : ''}" data-act="sTab" data-v="${k}"><span>${ic}</span>${l}${k === 'st' && live ? '<i class="live-dot" title="Sesi berjalan"></i>' : ''}</button>`).join('')}
  </div>
  ${live && tab !== 'st' ? `<button class="live-banner" data-act="sTab" data-v="st"><span class="live-dot"></span><b>${esc(live.name)}</b> sedang berjalan · ketuk untuk lanjutkan</button>` : ''}
  ${tab === 'run' ? renderRunTab() : tab === 'st' ? renderStTab() : renderDash()}`;
}

/* ---------------------------------------------------------------- DASHBOARD */
function periodRange() {
  const P = S.ui.dPeriod, a = S.ui.dAnchor;
  if (P === 'week') { const d = parseYmd(a); const start = addDays(a, -((d.getDay() + 6) % 7)); return { start, end: addDays(start, 6) }; }
  const m = a.slice(0, 7), [y, mo] = m.split('-').map(Number);
  return { start: `${m}-01`, end: `${m}-${pad(new Date(y, mo, 0).getDate())}` };
}
function shiftPeriod(n) {
  if (S.ui.dPeriod === 'week') S.ui.dAnchor = addDays(S.ui.dAnchor, 7 * n);
  else S.ui.dAnchor = shiftMonth(S.ui.dAnchor.slice(0, 7), n) + '-01';
}
function periodLabel(r) {
  if (S.ui.dPeriod === 'month') return monthLabel(r.start.slice(0, 7));
  const o = { day: 'numeric', month: 'short' };
  return `${fmtDate(r.start, o)} – ${fmtDate(r.end, { ...o, year: 'numeric' })}`;
}
function sumUp(list) {
  const act = list.filter(w => w.type !== 'istirahat');
  return {
    n: act.length, days: new Set(act.map(w => w.date)).size,
    dur: act.reduce((a, w) => a + (w.duration_sec || 0), 0),
    km: list.filter(w => w.type === 'lari').reduce((a, w) => a + num(w.distance_km), 0),
    runs: list.filter(w => w.type === 'lari').length,
    st: list.filter(w => w.type === 'strength').length,
    vol: list.filter(w => w.type === 'strength').reduce((a, w) => a + woVolume(w), 0),
    rest: list.filter(w => w.type === 'istirahat').length,
  };
}
const catOf = w => (w.type === 'lari' ? 'run' : w.type === 'strength' ? 'st' : w.type === 'istirahat' ? 'rest' : 'other');
const CAT_COLOR = { run: 'var(--accent)', st: '#7c5cdb', other: 'var(--mint)' };
function deltaTxt(a, b, fmt) {
  if (!b && !a) return 'sama seperti sebelumnya';
  if (!b) return 'naik dari 0';
  const d = a - b;
  return `${d >= 0 ? '▲' : '▼'} ${fmt(Math.abs(d))} vs periode lalu`;
}
function barChart(cols, { h = 120, fmt = v => v, hi = -1 } = {}) {
  const max = Math.max(1, ...cols.map(c => c.segs.reduce((a, s) => a + s.v, 0)));
  const W = 100 / cols.length;
  return `<div class="bchart" style="--h:${h}px">${cols.map((c, i) => {
    const tot = c.segs.reduce((a, s) => a + s.v, 0);
    return `<div class="bcol ${i === hi ? 'hi' : ''}" title="${esc(c.title || '')}${tot ? ': ' + fmt(tot) : ''}">
      <div class="bstack">${c.segs.filter(s => s.v).map(s => `<i style="height:${s.v / max * 100}%;background:${s.c}"></i>`).join('')}</div>
      <span class="blabel">${esc(c.label)}</span></div>`;
  }).join('')}</div>`;
}
function renderDash() {
  const r = periodRange(), t = ymd();
  const inR = w => w.date >= r.start && w.date <= r.end;
  const list = S.workouts.filter(inR);
  const sm = sumUp(list);
  const prevAnchor = S.ui.dPeriod === 'week' ? addDays(r.start, -7) : shiftMonth(r.start.slice(0, 7), -1) + '-01';
  const pr = (() => { const keep = S.ui.dAnchor; S.ui.dAnchor = prevAnchor; const x = periodRange(); S.ui.dAnchor = keep; return x; })();
  const ps = sumUp(S.workouts.filter(w => w.date >= pr.start && w.date <= pr.end));
  const isNow = t >= r.start && t <= r.end;

  /* grafik per hari */
  const days = []; for (let d = r.start; d <= r.end; d = addDays(d, 1)) days.push(d);
  const cols = days.map(d => {
    const ws = list.filter(w => w.date === d);
    const seg = k => ws.filter(w => catOf(w) === k).reduce((a, w) => a + Math.round((w.duration_sec || 0) / 60), 0);
    const p = parseYmd(d);
    return { label: S.ui.dPeriod === 'week' ? p.toLocaleDateString('id-ID', { weekday: 'short' }) : (p.getDate() % 5 === 1 || p.getDate() === 1 ? String(p.getDate()) : ''), title: fmtFull(d),
      segs: [{ v: seg('run'), c: CAT_COLOR.run }, { v: seg('st'), c: CAT_COLOR.st }, { v: seg('other'), c: CAT_COLOR.other }] };
  });
  /* tren 12 minggu */
  const wk0 = addDays(t, -((parseYmd(t).getDay() + 6) % 7));
  const weeks = []; for (let i = 11; i >= 0; i--) weeks.push(addDays(wk0, -7 * i));
  const trendKm = weeks.map((ws, i) => {
    const we = addDays(ws, 6);
    const km = S.workouts.filter(w => w.type === 'lari' && w.date >= ws && w.date <= we).reduce((a, w) => a + num(w.distance_km), 0);
    return { label: i % 2 === (weeks.length - 1) % 2 ? fmtDate(ws, { day: 'numeric', month: 'short' }).replace(' ', ' ') : '', title: `Minggu ${fmtDate(ws, { day: 'numeric', month: 'short' })}`, segs: [{ v: Math.round(km * 10) / 10, c: CAT_COLOR.run }] };
  });
  const trendMin = weeks.map((ws, i) => {
    const we = addDays(ws, 6);
    const ww = S.workouts.filter(w => w.date >= ws && w.date <= we);
    const seg = k => ww.filter(w => catOf(w) === k).reduce((a, w) => a + Math.round((w.duration_sec || 0) / 60), 0);
    return { label: trendKm[i].label, title: trendKm[i].title, segs: [{ v: seg('run'), c: CAT_COLOR.run }, { v: seg('st'), c: CAT_COLOR.st }, { v: seg('other'), c: CAT_COLOR.other }] };
  });
  const feed = [...list].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.created_at - a.created_at));
  const byDate = {}; feed.forEach(w => (byDate[w.date] = byDate[w.date] || []).push(w));

  return `
  <div class="period-bar">
    <div class="tabs">${[['week', 'Minggu'], ['month', 'Bulan']].map(([k, l]) => `<button class="tab ${S.ui.dPeriod === k ? 'on' : ''}" data-act="dPeriod" data-v="${k}">${l}</button>`).join('')}</div>
    <div class="month-nav">
      <button class="icon-btn" data-act="dShift" data-n="-1" title="Sebelumnya">${ICON.left}</button>
      <b>${periodLabel(r)}</b>
      <button class="icon-btn" data-act="dShift" data-n="1" title="Berikutnya" ${isNow ? 'disabled' : ''}>${ICON.right}</button>
      ${isNow ? '' : `<button class="btn ghost sm" data-act="dShift" data-n="0">Sekarang</button>`}
    </div>
  </div>

  <div class="stats">
    ${stat('Aktivitas', sm.n, `${sm.days} hari aktif · ${deltaTxt(sm.n, ps.n, v => v)}`)}
    ${stat('Total waktu', fmtDur(sm.dur) || '0 mnt', deltaTxt(sm.dur, ps.dur, v => fmtDur(v) || '0 mnt'))}
    ${stat('Jarak lari', `${fmtKm(sm.km)} km`, `${sm.runs}× lari · ${deltaTxt(sm.km, ps.km, v => fmtKm(v) + ' km')}`, 'good')}
    ${stat('Strength', `${sm.st} sesi`, sm.vol ? `volume ${Math.round(sm.vol).toLocaleString('id-ID')} kg` : `${sm.rest} hari istirahat`)}
  </div>

  <div class="dash-grid">
    <section class="card">
      <div class="card-head"><h2>Menit latihan per hari</h2><div class="legend">${[['run', 'Lari'], ['st', 'Strength'], ['other', 'Lainnya']].map(([k, l]) => `<span><i style="--c:${CAT_COLOR[k]}"></i>${l}</span>`).join('')}</div></div>
      ${barChart(cols, { h: 130, fmt: v => v + ' mnt', hi: days.indexOf(t) })}
    </section>
    <section class="card">
      <div class="card-head"><h2>Tren 12 minggu</h2><div class="tabs mini">${[['km', 'Km lari'], ['min', 'Menit']].map(([k, l]) => `<button class="tab ${S.ui.dTrend === k ? 'on' : ''}" data-act="dTrend" data-v="${k}">${l}</button>`).join('')}</div></div>
      ${S.ui.dTrend === 'km' ? barChart(trendKm, { h: 130, fmt: v => fmtKm(v) + ' km', hi: 11 }) : barChart(trendMin, { h: 130, fmt: v => v + ' mnt', hi: 11 })}
    </section>
  </div>

  <div class="sport-layout">
    <section class="card">
      <div class="card-head"><h2>Aktivitas</h2>
        <div class="btn-row tight"><button class="btn sm" data-act="newWorkout" data-type="sepeda">${ICON.plus} Aktivitas lain</button><button class="btn ghost sm" data-act="newWorkout" data-type="istirahat">${ICON.moon} Istirahat</button></div></div>
      ${Object.keys(byDate).length ? Object.keys(byDate).map(d => `<div class="day-group"><h3><span>${fmtFull(d)}</span><span>${d === t ? 'Hari ini' : d === addDays(t, -1) ? 'Kemarin' : ''}</span></h3>${byDate[d].map(feedItem).join('')}</div>`).join('')
        : `<p class="empty">Belum ada aktivitas di periode ini.</p>`}
    </section>
    <div class="stack">${recordsHtml()}</div>
  </div>`;
}
function feedItem(w) {
  if (w.type === 'lari') {
    const pc = pace(w.duration_sec, w.distance_km);
    const diff = w.target_pace && w.duration_sec && num(w.distance_km) ? Math.round(w.duration_sec / num(w.distance_km)) - w.target_pace : null;
    return `<article class="feed run" style="--c:${runColor(w.run_type)}" data-act="openWorkout" data-id="${w.id}">
      <div class="feed-ic">🏃</div>
      <div class="feed-body">
        <div class="feed-top"><b>${esc(w.title || runTypeLabel(w.run_type))}</b>${w.run_type && w.title ? `<span class="rchip" style="--c:${runColor(w.run_type)}">${runTypeLabel(w.run_type)}</span>` : ''}</div>
        <div class="feed-stats">
          <div><span>Jarak</span><b>${fmtKm(w.distance_km) || '–'} km</b></div>
          <div><span>Pace</span><b>${pc ? pc.replace(' /km', '') : '–'}<small>/km</small></b></div>
          <div><span>Waktu</span><b>${durInput(w.duration_sec) ? fmtClockLong(w.duration_sec) : '–'}</b></div>
          ${w.hr ? `<div><span>HR</span><b>${num(w.hr)}</b></div>` : ''}
        </div>
        ${diff != null ? `<p class="feed-note ${diff <= 0 ? 'good' : 'warn'}">${diff <= 0 ? `${fmtPace(-diff) || '0:00'} /km lebih cepat` : `${fmtPace(diff)} /km lebih lambat`} dari target ${fmtPace(w.target_pace)}</p>` : ''}
        ${w.note ? `<p class="feed-note">${esc(w.note)}</p>` : ''}
      </div></article>`;
  }
  if (w.type === 'strength') {
    const v = woVolume(w);
    return `<article class="feed st" style="--c:#7c5cdb" data-act="openWorkout" data-id="${w.id}">
      <div class="feed-ic">🏋️</div>
      <div class="feed-body">
        <div class="feed-top"><b>${esc(w.title || 'Strength training')}</b></div>
        <div class="feed-stats">
          <div><span>Waktu</span><b>${w.duration_sec ? fmtClockLong(w.duration_sec) : '–'}</b></div>
          <div><span>Gerakan</span><b>${(w.exercises || []).length}</b></div>
          <div><span>Set</span><b>${woSets(w)}</b></div>
          <div><span>Volume</span><b>${v ? Math.round(v).toLocaleString('id-ID') : '–'}<small> kg</small></b></div>
        </div>
        ${(w.exercises || []).length ? `<p class="feed-note">${w.exercises.slice(0, 5).map(e => esc(e.name)).join(' · ')}${w.exercises.length > 5 ? ' …' : ''}</p>` : ''}
      </div></article>`;
  }
  return `<div data-act="openWorkout" data-id="${w.id}" class="feed-wrap">${workoutItem(w)}</div>`;
}
const fmtClockLong = s => { s = Math.round(s || 0); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return h ? `${h}:${pad(m)}:${pad(x)}` : `${m}:${pad(x)}`; };

/* ---------------------------------------------------------------- RUNNING */
function renderRunTab() {
  const plans = sportlib('run_plan');
  const prof = runProfile();
  const m = monthKey(new Date());
  const runs = S.workouts.filter(w => w.type === 'lari').sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.created_at - a.created_at));
  const monthRuns = runs.filter(w => w.date.startsWith(m));
  const byType = Object.keys(RUN_TYPES).map(k => {
    const rs = monthRuns.filter(w => w.run_type === k && w.duration_sec && num(w.distance_km));
    const km = rs.reduce((a, w) => a + num(w.distance_km), 0), sec = rs.reduce((a, w) => a + w.duration_sec, 0);
    return { k, n: rs.length, km, pace: km ? sec / km : 0 };
  }).filter(x => x.n);
  return `
  <div class="w-actions">
    <button class="btn primary" data-act="runLog">${ICON.plus} Catat lari</button>
    <button class="btn" data-act="runPlanNew">${ICON.plus} Rencana lari baru</button>
  </div>
  <div class="sport-layout">
    <div class="stack">
      <section class="card">
        <div class="card-head"><h2>Rencana lari</h2><span class="muted small">klik “Lari sekarang” untuk mencatat hasilnya</span></div>
        ${plans.length ? `<div class="plan-grid">${plans.map(runPlanCard).join('')}</div>`
          : `<div class="empty-cta"><p class="muted">Belum ada rencana. Mulai dari contoh: easy run, tempo, interval, dan long run${prof ? ' dengan pace dari zona kamu' : ''}.</p>
              <button class="btn" data-act="runSeed">Buat 4 rencana contoh</button></div>`}
      </section>
      <section class="card">
        <div class="card-head"><h2>Riwayat lari</h2><span class="muted small">${runs.length} lari tercatat</span></div>
        ${byType.length ? `<div class="type-sum">${byType.map(x => `<div style="--c:${runColor(x.k)}"><span>${runTypeLabel(x.k)}</span><b>${fmtKm(x.km)} km</b><small>${x.n}× · ${fmtPace(x.pace)}/km</small></div>`).join('')}</div><p class="muted small">Ringkasan bulan ini per jenis lari</p>` : ''}
        ${runs.length ? runs.slice(0, S.ui.runMore ? 200 : 12).map(feedItem).join('') + (runs.length > 12 && !S.ui.runMore ? `<button class="btn ghost sm" data-act="runMore">Tampilkan semua</button>` : '') : '<p class="empty">Belum ada lari tercatat.</p>'}
      </section>
    </div>
    <div class="stack">
      <section class="card">
        <div class="card-head"><h2>Zona pace kamu</h2></div>
        <form class="inline-form" data-form="runProfile">
          <label class="grow">Waktu 5K terbaik / terbaru<input name="ref5k" placeholder="mis. 28:30" value="${prof && prof.ref5k ? fmtClockLong(prof.ref5k) : ''}" autocomplete="off" inputmode="numeric"></label>
          <button class="btn">Hitung</button>
        </form>
        ${prof && prof.ref5k ? `<table class="zones">${Object.entries(RUN_TYPES).map(([k, v]) => { const z = zonePaces(k); return `<tr><td><i style="background:${v.color}"></i>${v.label}</td><td><b>${fmtPace(z[0])}–${fmtPace(z[1])}</b> /km</td></tr>`; }).join('')}</table>
          <p class="muted small">Perkiraan kasar dari pace 5K (${fmtPace(prof.ref5k / 5)}/km). Sesuaikan dengan rasa badan & detak jantung.</p>`
          : `<p class="muted small">Isi waktu 5K kamu (misalnya dari Huawei Health/Strava) untuk mendapat rekomendasi pace tiap jenis lari.</p>`}
      </section>
      <section class="card">
        <div class="card-head"><h2>Jenis lari</h2></div>
        <ul class="rtype-list">${Object.entries(RUN_TYPES).map(([k, v]) => `<li><i style="background:${v.color}"></i><div><b>${v.label}</b><span>${v.desc}</span></div></li>`).join('')}</ul>
      </section>
    </div>
  </div>`;
}
function runPlanCard(p) {
  const tt = planTime(p);
  return `<article class="plan-card" style="--c:${runColor(p.run_type)}">
    <div class="pc-head"><span class="rchip" style="--c:${runColor(p.run_type)}">${runTypeLabel(p.run_type)}</span><span class="spacer"></span>
      <button class="icon-btn" data-act="runPlanEdit" data-id="${p.id}" title="Ubah">${ICON.edit}</button></div>
    <h3>${esc(p.name)}</h3>
    <div class="feed-stats">
      ${num(p.dist_km) ? `<div><span>Target jarak</span><b>${fmtKm(p.dist_km)} km</b></div>` : ''}
      ${p.pace_sec ? `<div><span>Target pace</span><b>${fmtPace(p.pace_sec)}<small>/km</small></b></div>` : ''}
      ${tt ? `<div><span>Target waktu</span><b>${fmtClockLong(tt)}</b></div>` : ''}
    </div>
    ${p.run_type === 'interval' && p.iv && num(p.iv.reps) ? `<p class="iv">${num(p.iv.reps)} × ${esc(p.iv.work)} ${p.iv.work_unit === 'dtk' ? 'detik' : 'm'}${p.iv.pace_sec ? ` @ ${fmtPace(p.iv.pace_sec)}/km` : ''} · jeda ${esc(p.iv.rest || '–')} ${p.iv.rest_unit === 'm' ? 'm' : 'detik'} ${p.iv.rest_type || 'jog'}</p>` : ''}
    <p class="muted small">Warm-up ${(p.warmup || []).length} langkah · Cool-down ${(p.cooldown || []).length} langkah</p>
    <div class="btn-row tight"><button class="btn primary sm" data-act="runPlanGo" data-id="${p.id}">▶ Lari sekarang</button><button class="btn ghost sm" data-act="runPlanView" data-id="${p.id}">Detail</button></div>
  </article>`;
}
function runPlanModal(p) {
  const iv = p.iv || {};
  return `<form class="modal-body w-form" data-form="runPlanSave" data-id="${p.id || ''}">
    <h2>${p.id ? 'Ubah rencana lari' : 'Rencana lari baru'}</h2>
    <div class="type-grid">${Object.entries(RUN_TYPES).map(([k, v]) => `<label class="type-pill"><input type="radio" name="run_type" value="${k}" ${k === (p.run_type || 'easy') ? 'checked' : ''} data-change="runPlanType"><span style="--c:${v.color}">${v.label}</span></label>`).join('')}</div>
    <label>Nama rencana<input name="name" required value="${esc(p.name || '')}" placeholder="mis. Easy 5K pagi" autocomplete="off"></label>
    <div class="row3">
      <label>Target jarak (km)<input name="dist_km" inputmode="decimal" value="${esc(p.dist_km || '')}" placeholder="5" data-input="runCalc" autocomplete="off"></label>
      <label>Target pace (/km)<input name="pace" value="${fmtPace(p.pace_sec)}" placeholder="6:30" data-input="runCalc" autocomplete="off"></label>
      <label>Target waktu<input name="time" value="${p.time_sec ? fmtClockLong(p.time_sec) : ''}" placeholder="otomatis" data-input="runCalc" autocomplete="off"></label>
    </div>
    <p class="muted small" id="runCalcOut">${zonePaces(p.run_type || 'easy') ? `Zona ${runTypeLabel(p.run_type || 'easy')} kamu: ${fmtPace(zonePaces(p.run_type || 'easy')[0])}–${fmtPace(zonePaces(p.run_type || 'easy')[1])}/km · <button type="button" class="linkbtn" data-act="runUseZone">pakai</button>` : 'Isi dua dari tiga (jarak, pace, waktu) — sisanya dihitung otomatis.'}</p>
    <fieldset class="iv-box ${(p.run_type || 'easy') === 'interval' ? '' : 'hide'}"><legend>Struktur interval</legend>
      <div class="row3">
        <label>Repetisi<input name="iv_reps" inputmode="numeric" value="${esc(iv.reps || '')}" placeholder="6"></label>
        <label>Kerja<input name="iv_work" inputmode="numeric" value="${esc(iv.work || '')}" placeholder="400"></label>
        <label>Satuan<select name="iv_work_unit"><option value="m" ${iv.work_unit !== 'dtk' ? 'selected' : ''}>meter</option><option value="dtk" ${iv.work_unit === 'dtk' ? 'selected' : ''}>detik</option></select></label>
      </div>
      <div class="row3">
        <label>Pace kerja (/km)<input name="iv_pace" value="${fmtPace(iv.pace_sec)}" placeholder="5:00"></label>
        <label>Jeda<input name="iv_rest" inputmode="numeric" value="${esc(iv.rest || '')}" placeholder="90"></label>
        <label>Jeda dengan<select name="iv_rest_type">${['jog', 'jalan', 'diam'].map(x => `<option ${x === (iv.rest_type || 'jog') ? 'selected' : ''}>${x}</option>`).join('')}</select></label>
      </div>
      <input type="hidden" name="iv_rest_unit" value="dtk">
    </fieldset>
    <label>Warming up <small class="muted">(satu langkah per baris)</small><textarea name="warmup" rows="4">${esc((p.warmup || RUN_WARMUP).join('\n'))}</textarea></label>
    <label>Cooling down <small class="muted">(satu langkah per baris)</small><textarea name="cooldown" rows="3">${esc((p.cooldown || RUN_COOLDOWN).join('\n'))}</textarea></label>
    <label>Catatan<input name="note" value="${esc(p.note || '')}" placeholder="mis. rute, fokus napas" autocomplete="off"></label>
    <div class="modal-actions">
      ${p.id ? `<button type="button" class="btn ghost danger" data-act="libDelete" data-id="${p.id}">${ICON.trash} Hapus</button><span class="spacer"></span>` : ''}
      <button type="button" class="btn ghost" data-act="closeModal">Batal</button><button class="btn primary">Simpan</button>
    </div>
  </form>`;
}
function runPlanView(p) {
  const tt = planTime(p);
  return `<div class="modal-body">
    <span class="rchip" style="--c:${runColor(p.run_type)}">${runTypeLabel(p.run_type)}</span>
    <h2>${esc(p.name)}</h2>
    <div class="feed-stats">${num(p.dist_km) ? `<div><span>Jarak</span><b>${fmtKm(p.dist_km)} km</b></div>` : ''}${p.pace_sec ? `<div><span>Pace</span><b>${fmtPace(p.pace_sec)}/km</b></div>` : ''}${tt ? `<div><span>Waktu</span><b>${fmtClockLong(tt)}</b></div>` : ''}</div>
    ${p.run_type === 'interval' && p.iv && num(p.iv.reps) ? `<p class="iv">${num(p.iv.reps)} × ${esc(p.iv.work)} ${p.iv.work_unit === 'dtk' ? 'detik' : 'm'}${p.iv.pace_sec ? ` @ ${fmtPace(p.iv.pace_sec)}/km` : ''} · jeda ${esc(p.iv.rest || '–')} detik ${esc(p.iv.rest_type || 'jog')}</p>` : ''}
    <h3>🔥 Warming up</h3><ol class="steps">${(p.warmup || []).map(x => `<li>${esc(x)}</li>`).join('')}</ol>
    <h3>🏃 Inti</h3><p>${p.run_type === 'interval' ? 'Ikuti struktur interval di atas.' : `${num(p.dist_km) ? fmtKm(p.dist_km) + ' km' : 'Lari'}${p.pace_sec ? ` dengan pace sekitar ${fmtPace(p.pace_sec)}/km` : ''}.`} ${esc((RUN_TYPES[p.run_type] || {}).desc || '')}</p>
    <h3>🧊 Cooling down</h3><ol class="steps">${(p.cooldown || []).map(x => `<li>${esc(x)}</li>`).join('')}</ol>
    ${p.note ? `<p class="muted">${esc(p.note)}</p>` : ''}
    <div class="modal-actions"><button type="button" class="btn ghost" data-act="closeModal">Tutup</button><button class="btn primary" data-act="runPlanGo" data-id="${p.id}">Catat hasil lari</button></div>
  </div>`;
}
function runLogModal(w) {
  const tp = w.target_pace;
  return `<form class="modal-body" data-form="runLogSave" data-id="${w.id || ''}">
    <h2>${w.id ? 'Ubah catatan lari' : 'Catat lari'}</h2>
    <div class="type-grid">${Object.entries(RUN_TYPES).map(([k, v]) => `<label class="type-pill"><input type="radio" name="run_type" value="${k}" ${k === (w.run_type || 'easy') ? 'checked' : ''}><span style="--c:${v.color}">${v.label}</span></label>`).join('')}</div>
    <div class="row2">
      <label>Tanggal<input type="date" name="date" value="${esc(w.date || ymd())}" required></label>
      <label>Judul<input name="title" value="${esc(w.title || '')}" placeholder="mis. Easy run pagi" autocomplete="off"></label>
    </div>
    <div class="row3">
      <label>Jarak (km)<input name="distance_km" inputmode="decimal" value="${esc(w.distance_km || '')}" placeholder="5,2" data-input="runLogCalc" autocomplete="off" required></label>
      <label>Waktu<input name="duration" value="${w.duration_sec ? fmtClockLong(w.duration_sec) : ''}" placeholder="32:15" data-input="runLogCalc" autocomplete="off"></label>
      <label>Avg HR<input name="hr" inputmode="numeric" value="${esc(w.hr || '')}" placeholder="opsional" autocomplete="off"></label>
    </div>
    <p class="muted small" id="runLogOut">${tp ? `Target pace: <b>${fmtPace(tp)}/km</b>${num(w.target_dist) ? ` · target jarak ${fmtKm(w.target_dist)} km` : ''}` : 'Pace dihitung otomatis dari jarak & waktu.'}</p>
    <input type="hidden" name="target_pace" value="${tp || ''}"><input type="hidden" name="target_dist" value="${esc(w.target_dist || '')}"><input type="hidden" name="plan_id" value="${esc(w.plan_id || '')}">
    <div class="row2">
      <label>Seberapa berat? (RPE)<select name="rpe">${RPE.map((l, i) => `<option value="${i || ''}" ${String(i) === String(w.rpe || '') ? 'selected' : ''}>${i ? l : '—'}</option>`).join('')}</select></label>
      <label>Kondisi badan<select name="feel">${optList(FEEL, w.feel)}</select></label>
    </div>
    <div class="checks">
      <label class="checkline"><input type="checkbox" name="warmup_done" ${w.warmup_done ? 'checked' : ''}><span>Warming up dilakukan</span></label>
      <label class="checkline"><input type="checkbox" name="cooldown_done" ${w.cooldown_done ? 'checked' : ''}><span>Cooling down dilakukan</span></label>
    </div>
    <label>Catatan<textarea name="note" rows="2" placeholder="rute, cuaca, rasanya…">${esc(w.note || '')}</textarea></label>
    <div class="modal-actions">
      ${w.id ? `<button type="button" class="btn ghost danger" data-act="deleteWorkout" data-id="${w.id}">${ICON.trash} Hapus</button><span class="spacer"></span>` : ''}
      <button type="button" class="btn ghost" data-act="closeModal">Batal</button><button class="btn primary">Simpan</button>
    </div>
  </form>`;
}

/* ---------------------------------------------------------------- STRENGTH */
const ST_KEY = 'rp-st-session';
function stSession() { return lsGet(ST_KEY, null); }
function stSave(s) { if (s) lsSet(ST_KEY, s); else localStorage.removeItem(ST_KEY); }
function renderStTab() {
  const live = stSession();
  if (live) return renderSession(live);
  const sub = S.ui.stSub;
  return `
  <div class="toolbar">
    <div class="tabs">${[['routine', 'Rutinitas'], ['lib', 'Pustaka gerakan'], ['hist', 'Riwayat']].map(([k, l]) => `<button class="tab ${sub === k ? 'on' : ''}" data-act="stSub" data-v="${k}">${l}</button>`).join('')}</div>
    ${sub === 'lib' ? `<button class="btn sm" data-act="exNew">${ICON.plus} Gerakan sendiri</button>` : `<button class="btn primary sm" data-act="routineNew">${ICON.plus} Rutinitas baru</button>`}
  </div>
  ${sub === 'lib' ? renderExLib() : sub === 'hist' ? renderStHist() : renderRoutines()}`;
}
function renderRoutines() {
  const rs = sportlib('routine');
  return `<div class="sport-layout">
    <div class="stack">
      ${rs.length ? `<div class="plan-grid">${rs.map(r => {
        const items = r.items || [];
        const sets = items.reduce((a, it) => a + num(it.sets), 0);
        const mus = uniq(items.flatMap(it => { const e = exGet(it.ex); return e ? e.primary : []; }));
        return `<article class="plan-card st" style="--c:#7c5cdb">
          <div class="pc-head"><b class="rt-name">${esc(r.name)}</b><span class="spacer"></span><button class="icon-btn" data-act="routineEdit" data-id="${r.id}" title="Ubah">${ICON.edit}</button></div>
          <div class="rt-body">
            ${muscleSvg(mus, [], 'mini')}
            <ul class="rt-ex">${items.slice(0, 7).map(it => `<li><span>${esc((exGet(it.ex) || {}).name || it.name || it.ex)}</span><small>${num(it.sets)}×${esc(it.reps || '')}${num(it.kg) ? ` · ${fmtKm(it.kg)} kg` : ''}</small></li>`).join('')}${items.length > 7 ? `<li class="muted small">+${items.length - 7} lagi</li>` : ''}</ul>
          </div>
          <p class="muted small">${items.length} gerakan · ${sets} set · ±${Math.max(10, Math.round(sets * 2.5 + 10))} menit</p>
          <div class="btn-row tight"><button class="btn primary sm" data-act="sessionStart" data-id="${r.id}">▶ Mulai sesi</button></div>
        </article>`;
      }).join('')}</div>`
        : `<section class="card"><div class="empty-cta"><p class="muted">Belum ada rutinitas. Buat sendiri atau mulai dari contoh Push / Pull / Legs / Full body.</p><button class="btn" data-act="routineSeed">Buat 4 rutinitas contoh</button></div></section>`}
    </div>
    <div class="stack">${timerHtml()}</div>
  </div>`;
}
function renderExLib() {
  const q = S.ui.exQuery.toLowerCase(), mf = S.ui.exMuscle;
  const list = exAll().filter(e => (!q || e.name.toLowerCase().includes(q)) && (!mf || e.primary.includes(mf) || e.secondary.includes(mf)));
  return `<section class="card">
    <div class="all-tools">
      <label class="search">${ICON.search}<input type="search" placeholder="Cari gerakan…" value="${esc(S.ui.exQuery)}" data-input="exQuery"></label>
      <div class="chips">${Object.entries(MUSCLES).map(([k, l]) => `<button class="chip-btn ${mf === k ? 'on' : ''}" data-act="exMuscle" data-v="${k}">${l}</button>`).join('')}</div>
    </div>
  </section>
  <div class="ex-grid">${list.map(e => `<button class="ex-card" data-act="exOpen" data-id="${esc(e.id)}">
      ${muscleSvg(e.primary, e.secondary, 'card')}
      <b>${esc(e.name)}</b><span class="mchips">${muscleChips(e)}</span>
      <small class="muted">${esc(e.equip || '')}${e.youtube ? ' · ▶ video tersimpan' : ''}</small>
    </button>`).join('') || '<p class="empty">Tidak ada gerakan yang cocok.</p>'}</div>`;
}
function renderStHist() {
  const ws = S.workouts.filter(w => w.type === 'strength').sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.created_at - a.created_at));
  /* progres per gerakan: beban terberat tiap sesi */
  const prog = {};
  [...ws].reverse().forEach(w => (w.exercises || []).forEach(e => {
    const k = (e.name || '').toLowerCase(); if (!k) return;
    const mx = Array.isArray(e.log) && e.log.length ? Math.max(...e.log.map(s => num(s.kg))) : num(e.kg);
    if (!mx) return;
    (prog[k] = prog[k] || { name: e.name, pts: [] }).pts.push({ d: w.date, kg: mx });
  }));
  const top = Object.values(prog).filter(p => p.pts.length).sort((a, b) => b.pts.length - a.pts.length).slice(0, 6);
  return `<div class="sport-layout">
    <section class="card"><div class="card-head"><h2>Sesi strength</h2><span class="muted small">${ws.length} sesi</span></div>
      ${ws.length ? ws.map(feedItem).join('') : '<p class="empty">Belum ada sesi. Mulai dari tab Rutinitas.</p>'}</section>
    <section class="card"><div class="card-head"><h2>Progres beban</h2></div>
      ${top.length ? top.map(p => { const f = p.pts[0].kg, l = p.pts[p.pts.length - 1].kg; return `<div class="prog-row"><span>${esc(p.name)}</span>
        ${barChart(p.pts.slice(-10).map(x => ({ label: '', title: fmtDate(x.d), segs: [{ v: x.kg, c: '#7c5cdb' }] })), { h: 34, fmt: v => v + ' kg' })}
        <b>${fmtKm(l)} kg</b><small class="${l >= f ? 'up' : 'down'}">${l >= f ? '▲' : '▼'} ${fmtKm(Math.abs(l - f))}</small></div>`; }).join('') : '<p class="empty">Progres muncul setelah beberapa sesi.</p>'}
    </section></div>`;
}

/* sesi strength berjalan */
function renderSession(s) {
  const done = s.items.reduce((a, it) => a + it.sets.filter(x => x.done).length, 0);
  const total = s.items.reduce((a, it) => a + it.sets.length, 0);
  const el = Math.floor((Date.now() - s.started) / 1000);
  return `<section class="card session">
    <div class="sess-head">
      <div><span class="live-dot"></span> <b>${esc(s.name)}</b><p class="muted small">Mulai ${new Date(s.started).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} · <span id="sessElapsed">${fmtClockLong(el)}</span> · ${done}/${total} set</p></div>
      <div class="btn-row tight"><button class="btn ghost sm danger" data-act="sessionCancel">Batalkan</button><button class="btn primary sm" data-act="sessionFinish">Selesai & simpan</button></div>
    </div>
    <div class="pbar slim"><i style="width:${total ? done / total * 100 : 0}%"></i></div>
    <div class="rest-bar ${T.running ? 'run' : ''}" id="restBar">
      <span>⏱ Istirahat</span><b id="timerTime">${fmtClock(timerLeft())}</b>
      <button class="btn sm" data-act="timerAdd" data-s="-15">−15</button><button class="btn sm primary" data-act="timerToggle" id="timerBtn">Mulai</button><button class="btn sm" data-act="timerAdd" data-s="15">+15</button>
    </div>
  </section>

  <section class="card sess-block">
    <h3>🔥 Warming up</h3>
    ${s.warmup.map((x, i) => `<label class="checkline"><input type="checkbox" data-change="sessCheck" data-k="warm" data-i="${i}" ${s.warmDone[i] ? 'checked' : ''}><span>${esc(x)}</span></label>`).join('') || '<p class="muted small">—</p>'}
  </section>

  ${s.items.map((it, ii) => { const e = exGet(it.ex) || { name: it.name, primary: [], secondary: [] }; return `<section class="card sess-ex">
    <div class="sx-head">
      ${muscleSvg(e.primary, e.secondary, 'mini')}
      <div class="sx-title"><b>${ii + 1}. ${esc(e.name)}</b><span class="mchips">${muscleChips(e)}</span>
        <div class="btn-row tight"><a class="btn sm" href="${esc(ytLink(e))}" target="_blank" rel="noopener">▶ Lihat cara</a>${e.id && !e.id.includes(' ') ? `<button class="btn ghost sm" data-act="exOpen" data-id="${esc(e.id)}">Info</button>` : ''}<span class="muted small">istirahat ${fmtRest(it.rest || 90)}</span></div></div>
    </div>
    <table class="sets"><thead><tr><th>Set</th><th>Target</th><th>Reps</th><th>kg</th><th></th></tr></thead><tbody>
      ${it.sets.map((x, si) => `<tr class="${x.done ? 'done' : ''}"><td>${si + 1}</td><td class="muted">${esc(x.tr || '')}${num(x.tk) ? ` × ${fmtKm(x.tk)}` : ''}</td>
        <td><input inputmode="numeric" value="${esc(x.reps ?? '')}" data-input="sessSet" data-ii="${ii}" data-si="${si}" data-f="reps" aria-label="Reps"></td>
        <td><input inputmode="decimal" value="${esc(x.kg ?? '')}" data-input="sessSet" data-ii="${ii}" data-si="${si}" data-f="kg" aria-label="Beban"></td>
        <td><button class="setchk ${x.done ? 'on' : ''}" data-act="sessDone" data-ii="${ii}" data-si="${si}" aria-label="Set selesai">${ICON.check}</button></td></tr>`).join('')}
    </tbody></table>
    <button class="btn ghost sm" data-act="sessAddSet" data-ii="${ii}">${ICON.plus} Tambah set</button>
  </section>`; }).join('')}

  <section class="card sess-block">
    <h3>🧊 Cooling down</h3>
    ${s.cooldown.map((x, i) => `<label class="checkline"><input type="checkbox" data-change="sessCheck" data-k="cool" data-i="${i}" ${s.coolDone[i] ? 'checked' : ''}><span>${esc(x)}</span></label>`).join('') || '<p class="muted small">—</p>'}
    <label>Catatan sesi<textarea data-input="sessNote" rows="2" placeholder="rasanya gimana, ada yang sakit?">${esc(s.note || '')}</textarea></label>
    <button class="btn primary" data-act="sessionFinish">Selesai & simpan</button>
  </section>`;
}
setInterval(() => { const el = $('#sessElapsed'), s = el && stSession(); if (s) el.textContent = fmtClockLong(Math.floor((Date.now() - s.started) / 1000)); }, 1000);

let rDraft = null;
function routineModal(r) {
  const opts = exAll().map(e => `<option value="${esc(e.id)}">${esc(e.name)}</option>`).join('');
  return `<form class="modal-body w-form" data-form="routineSave" data-id="${r.id || ''}">
    <h2>${r.id ? 'Ubah rutinitas' : 'Rutinitas baru'}</h2>
    <label>Nama rutinitas<input name="name" required value="${esc(r.name || '')}" placeholder="mis. Push day, Leg day" autocomplete="off"></label>
    <label>Warming up <small class="muted">(satu per baris)</small><textarea name="warmup" rows="3">${esc((r.warmup || ST_WARMUP).join('\n'))}</textarea></label>
    <div class="ex-block">
      <div class="ex-head rt"><span>Gerakan</span><span>Set</span><span>Reps</span><span>kg</span><span>Istirahat</span><span></span></div>
      ${(r.items || []).map((it, i) => `<div class="ex-row rt">
        <select name="it_ex" aria-label="Gerakan">${opts.replace(`value="${esc(it.ex)}"`, `value="${esc(it.ex)}" selected`)}</select>
        <input name="it_sets" inputmode="numeric" value="${esc(it.sets ?? '')}" aria-label="Set">
        <input name="it_reps" value="${esc(it.reps ?? '')}" placeholder="8-12" aria-label="Reps">
        <input name="it_kg" inputmode="decimal" value="${esc(it.kg ?? '')}" placeholder="0" aria-label="Beban">
        <input name="it_rest" inputmode="numeric" value="${esc(it.rest ?? 90)}" aria-label="Istirahat detik">
        <span class="row-acts"><button type="button" class="icon-btn" data-act="rtMove" data-i="${i}" data-d="-1" title="Naik">↑</button><button type="button" class="icon-btn danger" data-act="rtDel" data-i="${i}" title="Hapus">${ICON.trash}</button></span>
      </div>`).join('')}
      <button type="button" class="btn ghost sm add-ex" data-act="rtAdd">${ICON.plus} Tambah gerakan</button>
      <p class="muted small">Istirahat dalam detik. Reps boleh rentang (8-12) atau detik untuk plank.</p>
    </div>
    <label>Cooling down <small class="muted">(satu per baris)</small><textarea name="cooldown" rows="3">${esc((r.cooldown || ST_COOLDOWN).join('\n'))}</textarea></label>
    <div class="modal-actions">
      ${r.id ? `<button type="button" class="btn ghost danger" data-act="libDelete" data-id="${r.id}">${ICON.trash} Hapus</button><span class="spacer"></span>` : ''}
      <button type="button" class="btn ghost" data-act="closeModal">Batal</button><button class="btn primary">Simpan</button>
    </div>
  </form>`;
}
function readRoutineForm(f) {
  const fd = new FormData(f);
  const g = k => fd.getAll(k);
  const ex = g('it_ex'), sets = g('it_sets'), reps = g('it_reps'), kg = g('it_kg'), rest = g('it_rest');
  return {
    ...rDraft, name: String(fd.get('name') || '').trim(),
    warmup: linesOf(fd.get('warmup')), cooldown: linesOf(fd.get('cooldown')),
    items: ex.map((e, i) => ({ ex: e, name: (exGet(e) || {}).name || e, sets: num(sets[i]) || 3, reps: String(reps[i] || '').trim(), kg: num(kg[i]) || '', rest: num(rest[i]) || 90 })),
  };
}
function strengthLogView(w) {
  return `<div class="modal-body">
    <h2>${esc(w.title || 'Strength training')}</h2>
    <p class="muted">${fmtFull(w.date)}${w.duration_sec ? ' · ' + fmtClockLong(w.duration_sec) : ''} · volume ${Math.round(woVolume(w)).toLocaleString('id-ID')} kg</p>
    ${(w.exercises || []).map(e => `<div class="log-ex"><b>${esc(e.name)}</b>
      ${Array.isArray(e.log) && e.log.length ? `<div class="log-sets">${e.log.map((s, i) => `<span>${i + 1}. ${num(s.reps)}×${fmtKm(s.kg)} kg</span>`).join('')}</div>` : `<div class="log-sets"><span>${num(e.sets)} × ${num(e.reps)}${num(e.kg) ? ` @ ${fmtKm(e.kg)} kg` : ''}</span></div>`}</div>`).join('')}
    ${w.note ? `<p class="muted">${esc(w.note)}</p>` : ''}
    <div class="modal-actions"><button type="button" class="btn ghost danger" data-act="deleteWorkout" data-id="${w.id}">${ICON.trash} Hapus</button><span class="spacer"></span>
      ${Array.isArray((w.exercises || [])[0] && w.exercises[0].log) ? '' : `<button type="button" class="btn" data-act="editWorkout" data-id="${w.id}">Ubah</button>`}
      <button type="button" class="btn primary" data-act="closeModal">Tutup</button></div>
  </div>`;
}

const RUN_PRESETS = [
  ['easy', 'Easy run 5K', 5, 420], ['tempo', 'Tempo 20 menit', 4, 360],
  ['interval', 'Interval 6 × 400 m', 5, 0, { reps: 6, work: 400, work_unit: 'm', pace_sec: 300, rest: 90, rest_unit: 'dtk', rest_type: 'jog' }],
  ['long', 'Long run 10K', 10, 450],
];
const ROUTINE_PRESETS = [
  ['Push day (dada, bahu, triseps)', [['bench_press', 4, '6-8'], ['incline_db_press', 3, '8-10'], ['ohp', 3, '8-10'], ['lateral_raise', 3, '12-15', 60], ['tricep_pushdown', 3, '10-12', 60], ['dips', 2, 'maks']]],
  ['Pull day (punggung, biseps)', [['pull_up', 4, '5-8'], ['barbell_row', 4, '8-10'], ['lat_pulldown', 3, '10-12'], ['face_pull', 3, '12-15', 60], ['db_curl', 3, '10-12', 60], ['hammer_curl', 2, '12', 60]]],
  ['Leg day (kaki, untuk pelari)', [['squat', 4, '6-8', 120], ['rdl', 3, '8-10', 120], ['bulgarian', 3, '8/sisi'], ['hip_thrust', 3, '10-12'], ['calf_raise', 4, '15', 60], ['plank', 3, '45 dtk', 60]]],
  ['Full body (pemula)', [['goblet_squat', 3, '10-12'], ['push_up', 3, 'maks'], ['seated_row', 3, '10-12'], ['glute_bridge', 3, '15', 60], ['lateral_raise', 2, '12-15', 60], ['plank', 3, '30 dtk', 60]]],
];

const SPORT2_ACT = {
  sTab(el) { S.ui.sTab = el.dataset.v; render(); },
  dPeriod(el) { S.ui.dPeriod = el.dataset.v; render(); },
  dShift(el) { const n = +el.dataset.n; if (!n) S.ui.dAnchor = ymd(); else shiftPeriod(n); if (S.ui.dAnchor > ymd()) S.ui.dAnchor = ymd(); render(); },
  dTrend(el) { S.ui.dTrend = el.dataset.v; render(); },
  runMore() { S.ui.runMore = true; render(); },
  openWorkout(el) {
    const w = find('workouts', el.dataset.id); if (!w) return;
    if (w.type === 'lari') return openModal(runLogModal(w));
    if (w.type === 'strength') return openModal(strengthLogView(w));
    SPORT_ACT.editWorkout(el);
  },
  runLog() { openModal(runLogModal({ date: ymd(), run_type: 'easy' })); },
  runPlanNew() { openModal(runPlanModal({ run_type: 'easy', pace_sec: zoneMid('easy') })); },
  runPlanEdit(el) { const p = find('sportlib', el.dataset.id); if (p) openModal(runPlanModal(p)); },
  runPlanView(el) { const p = find('sportlib', el.dataset.id); if (p) openModal(runPlanView(p)); },
  runPlanGo(el) {
    const p = find('sportlib', el.dataset.id); if (!p) return;
    openModal(runLogModal({ date: ymd(), run_type: p.run_type, title: p.name, target_pace: p.pace_sec || '', target_dist: p.dist_km || '', plan_id: p.id, distance_km: p.dist_km || '' }));
  },
  runUseZone() {
    const f = $('#modal form'); if (!f) return;
    const type = (f.querySelector('input[name="run_type"]:checked') || {}).value || 'easy';
    const z = zoneMid(type); if (!z) return;
    f.pace.value = fmtPace(z); INPUT.runCalc(f.pace);
  },
  async runSeed() {
    for (const [run_type, name, dist_km, pace0, iv] of RUN_PRESETS)
      await add('sportlib', { kind: 'run_plan', run_type, name, dist_km, pace_sec: zoneMid(run_type) || pace0, time_sec: 0, iv: iv || null, warmup: RUN_WARMUP, cooldown: RUN_COOLDOWN, note: '' });
    render(); toast('4 rencana lari dibuat');
  },
  async libDelete(el) {
    const x = find('sportlib', el.dataset.id); if (!x) return;
    if (!confirm(`Hapus "${x.name}"?`)) return;
    await del('sportlib', x.id); closeModal(); render();
  },
  stSub(el) { S.ui.stSub = el.dataset.v; render(); },
  exMuscle(el) { S.ui.exMuscle = S.ui.exMuscle === el.dataset.v ? '' : el.dataset.v; render(); },
  exOpen(el) { const e = exGet(el.dataset.id); if (e) openModal(exerciseModal(e)); },
  exNew() { openModal(exerciseNewModal()); },
  async exSetYt(el) {
    const e = exGet(el.dataset.id); if (!e) return;
    const u = prompt('Tempel link video YouTube untuk gerakan ini:', e.youtube || '');
    if (u === null) return;
    const link = u.trim() ? normUrl(u) : '';
    if (e.custom) await patch('sportlib', e.id, { youtube: link });
    else if (e.overId) await patch('sportlib', e.overId, { youtube: link });
    else await add('sportlib', { kind: 'exercise', ex_id: e.id, youtube: link });
    openModal(exerciseModal(exGet(e.id))); if (S.ui.view === 'olahraga') render();
    toast(link ? 'Link video disimpan' : 'Link video dihapus');
  },
  async exDelete(el) { const e = exGet(el.dataset.id); if (!e || !confirm(`Hapus gerakan "${e.name}"?`)) return; await del('sportlib', e.id); closeModal(); render(); },
  routineNew() { rDraft = { items: [{ ex: 'bench_press', sets: 3, reps: '8-12', kg: '', rest: 90 }] }; openModal(routineModal(rDraft)); },
  routineEdit(el) { const r = find('sportlib', el.dataset.id); if (!r) return; rDraft = JSON.parse(JSON.stringify(r)); openModal(routineModal(rDraft)); },
  rtAdd(el) { rDraft = readRoutineForm(el.form); rDraft.items.push({ ex: 'push_up', sets: 3, reps: '10', kg: '', rest: 90 }); $('#modal').innerHTML = routineModal(rDraft); },
  rtDel(el) { rDraft = readRoutineForm(el.form); rDraft.items.splice(+el.dataset.i, 1); $('#modal').innerHTML = routineModal(rDraft); },
  rtMove(el) { rDraft = readRoutineForm(el.form); const i = +el.dataset.i; if (i > 0) { const [x] = rDraft.items.splice(i, 1); rDraft.items.splice(i - 1, 0, x); } $('#modal').innerHTML = routineModal(rDraft); },
  async routineSeed() {
    for (const [name, list] of ROUTINE_PRESETS)
      await add('sportlib', { kind: 'routine', name, warmup: ST_WARMUP, cooldown: ST_COOLDOWN, items: list.map(([ex, sets, reps, rest]) => ({ ex, name: exLibMap[ex].name, sets, reps, kg: '', rest: rest || 90 })) });
    render(); toast('4 rutinitas contoh dibuat');
  },
  sessionStart(el) {
    const r = find('sportlib', el.dataset.id); if (!r) return;
    if (stSession() && !confirm('Masih ada sesi yang berjalan. Ganti dengan sesi baru?')) return;
    const last = name => { /* beban terakhir untuk gerakan ini */
      const w = S.workouts.filter(x => x.type === 'strength').sort((a, b) => b.created_at - a.created_at).find(x => (x.exercises || []).some(e => e.name === name));
      const e = w && w.exercises.find(e => e.name === name);
      return e ? (Array.isArray(e.log) && e.log.length ? num(e.log[e.log.length - 1].kg) : num(e.kg)) : 0;
    };
    stSave({
      routine_id: r.id, name: r.name, started: Date.now(), note: '',
      warmup: r.warmup || [], cooldown: r.cooldown || [], warmDone: [], coolDone: [],
      items: (r.items || []).map(it => { const nm = (exGet(it.ex) || {}).name || it.name; const kg = num(it.kg) || last(nm); const rp = parseInt(it.reps, 10) || '';
        return { ex: it.ex, name: nm, rest: num(it.rest) || 90, sets: Array.from({ length: num(it.sets) || 3 }, () => ({ tr: it.reps || '', tk: kg, reps: rp, kg: kg || '', done: false })) }; }),
    });
    S.ui.sTab = 'st'; render(); window.scrollTo(0, 0); toast('Sesi dimulai. Semangat! 💪');
  },
  sessDone(el) {
    const s = stSession(); if (!s) return;
    const set = s.items[+el.dataset.ii].sets[+el.dataset.si];
    set.done = !set.done;
    const nx = s.items[+el.dataset.ii].sets[+el.dataset.si + 1];
    if (set.done && nx && !nx.done) { if (!String(nx.kg).trim()) nx.kg = set.kg; if (!String(nx.reps).trim()) nx.reps = set.reps; }
    stSave(s);
    if (set.done) { T.total = s.items[+el.dataset.ii].rest || 90; T.left = T.total; timerStart(); }
    render();
  },
  sessAddSet(el) { const s = stSession(); if (!s) return; const it = s.items[+el.dataset.ii]; const l = it.sets[it.sets.length - 1] || {}; it.sets.push({ tr: l.tr || '', tk: l.tk || '', reps: l.reps || '', kg: l.kg || '', done: false }); stSave(s); render(); },
  sessionCancel() { if (!confirm('Batalkan sesi ini? Data set yang sudah dicentang tidak disimpan.')) return; stSave(null); render(); },
  async sessionFinish() {
    const s = stSession(); if (!s) return;
    const exercises = s.items.map(it => { const log = it.sets.filter(x => x.done).map(x => ({ reps: num(x.reps), kg: num(x.kg) }));
      return { ex: it.ex, name: it.name, sets: log.length, reps: log.length ? Math.round(log.reduce((a, x) => a + x.reps, 0) / log.length) : 0, kg: log.length ? Math.max(...log.map(x => x.kg)) : 0, log }; }).filter(e => e.log.length);
    if (!exercises.length && !confirm('Belum ada set yang dicentang. Tetap simpan sesi?')) return;
    const restAvg = Math.round(s.items.reduce((a, it) => a + (it.rest || 90), 0) / Math.max(1, s.items.length));
    await add('workouts', { type: 'strength', date: ymd(new Date(s.started)), title: s.name, duration_sec: Math.round((Date.now() - s.started) / 1000), intensity: 'sedang', feel: '',
      distance_km: '', exercises, rest_sec: restAvg, sleep_h: '', note: s.note || '', routine_id: s.routine_id,
      warmup_done: s.warmDone.filter(Boolean).length > 0, cooldown_done: s.coolDone.filter(Boolean).length > 0 });
    stSave(null); T.running = false; clearInterval(T.iv);
    S.ui.stSub = 'hist'; render(); toast('Sesi tersimpan 🎉');
  },
};
const SPORT2_FORM = {
  async runProfile(f, d) {
    const sec = parseDur(d.ref5k) || 0;
    if (!sec || sec < 600) throw new Error('Isi waktu 5K dalam format menit:detik, mis. 28:30');
    const p = runProfile();
    if (p) await patch('sportlib', p.id, { ref5k: sec }); else await add('sportlib', { kind: 'run_profile', name: 'Profil lari', ref5k: sec });
    render(); toast('Zona pace diperbarui');
  },
  async runPlanSave(f, d) {
    const dist = num(d.dist_km), pace = parsePace(d.pace), time = parseDur(d.time);
    const data = { kind: 'run_plan', name: d.name.trim(), run_type: d.run_type || 'easy', dist_km: dist || '', pace_sec: pace || (dist && time ? Math.round(time / dist) : 0), time_sec: time || 0,
      iv: d.run_type === 'interval' ? { reps: num(d.iv_reps), work: num(d.iv_work), work_unit: d.iv_work_unit, pace_sec: parsePace(d.iv_pace), rest: num(d.iv_rest), rest_unit: 'dtk', rest_type: d.iv_rest_type } : null,
      warmup: linesOf(d.warmup), cooldown: linesOf(d.cooldown), note: d.note.trim() };
    if (f.dataset.id) await patch('sportlib', f.dataset.id, data); else await add('sportlib', data);
    closeModal(); render(); toast('Rencana lari disimpan');
  },
  async runLogSave(f, d) {
    const fd = new FormData(f);
    const w = { type: 'lari', run_type: d.run_type || 'easy', date: d.date || ymd(), title: d.title.trim(), distance_km: num(d.distance_km) || '', duration_sec: parseDur(d.duration),
      hr: num(d.hr) || '', rpe: num(d.rpe) || '', feel: d.feel || '', intensity: num(d.rpe) >= 7 ? 'berat' : num(d.rpe) >= 4 ? 'sedang' : 'ringan',
      target_pace: num(d.target_pace) || '', target_dist: num(d.target_dist) || '', plan_id: d.plan_id || '',
      warmup_done: fd.has('warmup_done'), cooldown_done: fd.has('cooldown_done'), note: d.note.trim(), exercises: [], rest_sec: 0, sleep_h: '' };
    if (f.dataset.id) await patch('workouts', f.dataset.id, w); else await add('workouts', w);
    closeModal(); render(); toast('Lari tercatat 🏃');
  },
  async routineSave(f) {
    const r = readRoutineForm(f);
    if (!r.items.length) throw new Error('Tambahkan minimal satu gerakan');
    const data = { kind: 'routine', name: r.name, warmup: r.warmup, cooldown: r.cooldown, items: r.items };
    if (f.dataset.id) await patch('sportlib', f.dataset.id, data); else await add('sportlib', data);
    closeModal(); render(); toast('Rutinitas disimpan');
  },
  async exCreate(f, d) {
    const fd = new FormData(f);
    const primary = fd.getAll('primary'), secondary = fd.getAll('secondary').filter(x => !primary.includes(x));
    if (!primary.length) throw new Error('Pilih minimal satu otot utama');
    await add('sportlib', { kind: 'exercise', name: d.name.trim(), equip: d.equip.trim(), primary, secondary, how: d.how.trim(), tips: '', youtube: d.youtube.trim() ? normUrl(d.youtube) : '' });
    closeModal(); render(); toast('Gerakan ditambahkan');
  },
};
const SPORT2_INPUT = {
  runCalc(el) {
    const f = el.form, dist = num(f.dist_km.value), pace = parsePace(f.pace.value), time = parseDur(f.time.value);
    const out = $('#runCalcOut'); if (!out) return;
    if (el.name !== 'time' && dist && pace) { out.innerHTML = `Perkiraan waktu: <b>${fmtClockLong(dist * pace)}</b>`; }
    else if (el.name !== 'pace' && dist && time) { out.innerHTML = `Pace yang dibutuhkan: <b>${fmtPace(time / dist)}/km</b>`; }
  },
  runLogCalc(el) {
    const f = el.form, dist = num(f.distance_km.value), time = parseDur(f.duration.value), tp = num(f.target_pace.value);
    const out = $('#runLogOut'); if (!out || !dist || !time) return;
    const p = time / dist;
    out.innerHTML = `Pace: <b>${fmtPace(p)}/km</b>${tp ? ` · target ${fmtPace(tp)}/km → <b class="${p <= tp ? 'up' : 'down'}">${p <= tp ? fmtPace(tp - p) + ' lebih cepat' : fmtPace(p - tp) + ' lebih lambat'}</b>` : ''}`;
  },
  exQuery(el) { S.ui.exQuery = el.value; S.ui.focus = '[data-input="exQuery"]'; render(); },
  sessSet(el) { const s = stSession(); if (!s) return; s.items[+el.dataset.ii].sets[+el.dataset.si][el.dataset.f] = el.value; stSave(s); },
  sessNote(el) { const s = stSession(); if (!s) return; s.note = el.value; stSave(s); },
};
const SPORT2_CHANGE = {
  runPlanType(el) {
    const f = el.form; const box = f.querySelector('.iv-box'); if (box) box.classList.toggle('hide', el.value !== 'interval');
    const z = zonePaces(el.value), out = $('#runCalcOut');
    if (out) out.innerHTML = z ? `Zona ${runTypeLabel(el.value)} kamu: ${fmtPace(z[0])}–${fmtPace(z[1])}/km · <button type="button" class="linkbtn" data-act="runUseZone">pakai</button>` : 'Isi dua dari tiga (jarak, pace, waktu) — sisanya dihitung otomatis.';
  },
  sessCheck(el) { const s = stSession(); if (!s) return; (el.dataset.k === 'warm' ? s.warmDone : s.coolDone)[+el.dataset.i] = el.checked; stSave(s); },
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

const FORM = {
  async quickTodo(f, d) {
    if (!d.title.trim()) return;
    const kind = d.kind === 'umum' ? 'umum' : 'kuliah';
    S.ui.quickKind = kind;
    const x = await add('todos', newTodo({ ...d, kind, due: d.due || (kind === 'umum' ? ymd() : ''),
      time_start: kind === 'umum' ? d.time_end : '', time_end: kind === 'kuliah' ? d.time_end : '' }));
    if (kind === 'kuliah' && x.course) S.ui.lastCourse = x.course;
    S.ui.flash = x.id; setTimeout(() => { if (S.ui.flash === x.id) S.ui.flash = null; }, 2500);
    S.ui.focus = '[data-form="quickTodo"] input[name="title"]';
    render(); toast(kind === 'kuliah' ? 'Tugas kuliah ditambahkan' : 'To-do ditambahkan');
  },
  async addTodo(f, d) {
    if (!d.title.trim()) return;
    const x = await add('todos', newTodo(d));
    if (x.kind === 'kuliah' && x.course) S.ui.lastCourse = x.course;
    revealTodo(x);
    S.ui.focus = '#todoTitle';
    render(); toast(x.kind === 'kuliah' ? 'Tugas kuliah ditambahkan' : 'To-do ditambahkan');
  },
  async editTodo(f, d) {
    const x = newTodo(d);
    delete x.done; delete x.done_at;
    x.notes = String(d.notes || '').trim();
    await patch('todos', f.dataset.id, x);
    closeModal(); render(); toast('Tersimpan');
  },
  async imgUrl(f, d) {
    const u = normUrl(d.url);
    if (!u) return;
    closeModal(); insertFigure({ src: u });
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
    const K = S.ui.todoKind;
    const done = S.todos.filter(x => x.done && todoKind(x) === K && (!S.ui.todoList || todoGroupKey(x, K) === S.ui.todoList));
    if (!done.length || !confirm(`Hapus ${done.length} tugas yang sudah selesai?`)) return;
    for (const x of done) await del('todos', x.id);
    render(); toast(`${done.length} tugas dihapus`);
  },
  todoFilter(el) { S.ui.todoFilter = el.dataset.v; render(); },
  todoKind(el) { if (S.ui.todoKind !== el.dataset.v) { S.ui.todoKind = el.dataset.v; S.ui.todoList = ''; } render(); },
  goTodos(el) { S.ui.todoKind = el.dataset.v; S.ui.todoList = ''; S.ui.todoFilter = 'aktif'; if (location.hash === '#tugas') render(); else location.hash = '#tugas'; },
  navMore() { document.body.classList.toggle('more-open'); },
  hMonth(el) { const n = +el.dataset.n; S.ui.hMonth = n ? shiftMonth(S.ui.hMonth, n) : monthKey(new Date()); if (S.ui.hMonth > monthKey(new Date())) S.ui.hMonth = monthKey(new Date()); render(); },
  jumpHeading(el) { const h = [...$$('#noteDoc h2, #noteDoc h3, #noteDoc h4')].filter(x => x.textContent.trim())[+el.dataset.i]; if (h) h.scrollIntoView({ behavior: 'smooth', block: 'center' }); },
  todoList(el) { S.ui.todoList = S.ui.todoList === el.dataset.v ? '' : el.dataset.v; render(); },
  closeModal() { closeModal(); },

  /* catatan */
  async newNote() {
    await leaveNote();
    const n = await add('notes', { title: '', html: '', content: '', tags: [], pinned: false });
    S.ui.noteId = n.id; S.ui.noteQuery = ''; S.ui.noteTag = '';
    S.ui.focus = '#noteTitle';
    if (S.ui.view !== 'catatan') location.hash = '#catatan'; else render();
  },
  async openNote(el) {
    if (el.dataset.id === S.ui.noteId && S.ui.view === 'catatan') return;
    await leaveNote();
    S.ui.noteId = el.dataset.id;
    if (S.ui.view !== 'catatan') location.hash = '#catatan'; else render();
  },
  async closeNote() { await leaveNote(); S.ui.noteId = null; render(); },
  async togglePin() {
    const n = find('notes', S.ui.noteId); if (!n) return;
    await flushNote(); await patch('notes', n.id, { pinned: !n.pinned }); render();
  },
  async deleteNote() {
    const n = find('notes', S.ui.noteId); if (!n) return;
    if ((n.title || n.content || noteHasImg(n)) && !confirm(`Hapus catatan "${n.title || 'Tanpa judul'}"?`)) return;
    clearTimeout(noteSave.timer); clearTimeout(docTimer); docTimer = null; noteSave.pending = null;
    const paths = [...(n.html || '').matchAll(/data-path="([^"]+)"/g)].map(m => m[1]);
    await del('notes', n.id); S.ui.noteId = null; render(); toast('Catatan dihapus');
    if (cloud.active) cloud.removeFiles(paths);
  },
  noteTag(el) { S.ui.noteTag = S.ui.noteTag === el.dataset.v ? '' : el.dataset.v; refreshNoteList(); },

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
  kQuery(el) { S.ui.kQuery = el.value; S.ui.focus = '[data-input="kQuery"]'; render(); },
  money(el) { const digits = el.value.replace(/\D/g, '').replace(/^0+/, ''); el.value = digits ? Number(digits).toLocaleString('id-ID') : ''; },
};

const CHANGE = {
  txType(el) { S.ui.txType = el.value; const c = $('#txCategory'); if (c) c.setAttribute('list', el.value === 'masuk' ? 'catIn' : 'catOut'); },
  theme(el) { setTheme(el.value); },
  todoFormKind(el) { const f = el.form; f.classList.remove('k-kuliah', 'k-umum'); f.classList.add('k-' + el.value); },
  quickKind(el) { S.ui.quickKind = el.value; const f = el.form; f.classList.remove('k-kuliah', 'k-umum'); f.classList.add('k-' + el.value); const i = $('input[name="title"]', f); if (i) { i.placeholder = el.value === 'kuliah' ? 'Tugas kuliah baru… (Enter)' : 'To-do baru untuk hari ini… (Enter)'; i.focus(); } },
  async imgFile(el) { const files = [...el.files]; for (const f of files) await insertImageFile(f); },
  async importFile(el) {
    const file = el.files[0]; if (!file) return;
    let data;
    try { data = JSON.parse(await file.text()); } catch (e) { el.value = ''; throw new Error('File ini bukan JSON yang valid'); }
    const c = data && data.collections;
    if (!c) { el.value = ''; throw new Error('Ini bukan file cadangan Ruang Pribadi'); }
    const info = `${(c.notes || []).length} catatan, ${(c.todos || []).length} tugas, ${(c.transactions || []).length} transaksi, ${(c.habits || []).length} kebiasaan, ${(c.workouts || []).length} olahraga, ${(c.courses || []).filter(x => x.type !== 'meta').length} mata kuliah`;
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

Object.assign(ACT, SPORT_ACT, CLOUD_ACT, KULIAH_ACT, SPORT2_ACT);
Object.assign(FORM, SPORT_FORM, CLOUD_FORM, KULIAH_FORM, SPORT2_FORM);
Object.assign(CHANGE, SPORT_CHANGE, KULIAH_CHANGE, SPORT2_CHANGE);
Object.assign(INPUT, SPORT2_INPUT);

function run(fn) {
  return Promise.resolve().then(fn).catch(err => { console.error(err); toast(err.message || 'Terjadi kesalahan', 'error'); });
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
  if (f.dataset.busy) return;
  f.dataset.busy = '1';
  const data = Object.fromEntries(new FormData(f));
  run(() => fn(f, data)).finally(() => { delete f.dataset.busy; });
});
document.addEventListener('input', e => { const fn = INPUT[e.target.dataset.input]; if (fn) fn(e.target, e); });
document.addEventListener('change', e => { const fn = CHANGE[e.target.dataset.change]; if (fn) run(() => fn(e.target, e)); });
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's' && S.ui.view === 'catatan') {
    e.preventDefault(); run(flushNote);
  }
});
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });
document.addEventListener('click', e => { if (document.body.classList.contains('more-open') && !e.target.closest('#nav')) document.body.classList.remove('more-open'); });
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
  if (stSession()) S.ui.sTab = 'st';
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
