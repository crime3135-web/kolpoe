'use strict';
// Crystal Deals backend: zero dependencies, Node 18+. Run: node server.js
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const PORT = +process.env.PORT || 3000;
const ADMIN = process.env.ADMIN_PASSWORD || '';
const TONW = process.env.TON_WALLET || 'UQC9Z52pCtofOwqvCA3F9vr3D98b6mqV8gJlSQgIht87FoGm';
let FILE = process.env.DATA_FILE || path.join(__dirname, 'data.json');
try { fs.mkdirSync(path.dirname(FILE), { recursive: true }); fs.accessSync(path.dirname(FILE), fs.constants.W_OK); }
catch (e) { console.log('WARNING: cannot write to', FILE, '-', e.message, '-> using local data.json, data will be LOST on restart. Attach a disk and check DATA_FILE.'); FILE = path.join(__dirname, 'data.json'); }
console.log('Data file:', FILE);
const PUB = path.join(__dirname, 'public');
// Demo rates: units of currency per 1 RUB. Replace with a live source before real use.
const R = { RUB: 1, USDT: .011, EUR: .0095, UAH: .45, KZT: 5.3, TON: .0037, BTC: 1.1e-7, ETH: 3.7e-6, LTC: 1.2e-4, SOL: 7.3e-5, STARS: .85 };

let db = { users: {}, deals: {}, tok: {}, pay: [], wd: [], paid: [] };
try { db = Object.assign(db, JSON.parse(fs.readFileSync(FILE, 'utf8'))); } catch {}
const save = () => { fs.writeFileSync(FILE + '.tmp', JSON.stringify(db)); fs.renameSync(FILE + '.tmp', FILE); };

const E = m => { throw { err: m }; };
const r8 = x => Math.round(x * 1e8) / 1e8;
const bal = u => Object.entries(u.w).reduce((s, [k, v]) => s + v / R[k], 0);
function spend(u, x) { for (const k of [u.cur, ...Object.keys(R)]) { if (x <= 1e-9) break; const t = Math.min(u.w[k] / R[k], x); u.w[k] = r8(u.w[k] - t * R[k]); x -= t; } }
const rid = n => { const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; return Array.from({ length: n }, () => A[crypto.randomInt(A.length)]).join(''); };
const hash = (p, s) => crypto.scryptSync(p, s, 32).toString('hex');
const eq = (a, b) => a.length == b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
const tries = {};
const limited = ip => { const n = Date.now(), a = (tries[ip] = (tries[ip] || []).filter(t => n - t < 6e4)); a.push(n); return a.length > 20; };
const sys = (d, to, x) => d.m.push({ k: 's', to, t: Date.now(), x });
const rdet = r => r.t == 'stars' ? r.a : r.t == 'card' ? (r.sbp ? `СБП +${r.a} · ${r.b}` : `${r.cc} ${r.a}`) : `${r.a} · ${r.b} · ${r.c}`;
const okImg = (i, max) => typeof i == 'string' && i.startsWith('data:image/') && i.length <= max;

function release(d) {
  const s = db.users[d.seller];
  s.w[s.cur] = r8(s.w[s.cur] + d.amt * R[s.cur]);
  d.st = 'done'; sys(d, 'all', 'done'); sys(d, 'buyer', 'done_b'); sys(d, 'seller', 'done_s');
}
const mine = (u, id) => { const d = db.deals[id]; if (!d || (d.seller != u.nick && d.buyer != u.nick)) E('Сделка не найдена'); return d; };
const pub = u => ({ nick: u.nick, cur: u.cur, avatar: u.avatar, since: u.since, w: u.w, reqs: u.reqs });
const dv = (d, u) => { const sel = u.nick == d.seller, x = { ...d, m: d.m.filter(m => m.k == 'm' || m.to == 'all' || m.to == (sel ? 'seller' : 'buyer')) }; if (!sel) delete x.rq; return x; };
function view(u) {
  const users = { [u.nick]: pub(u) }, deals = {};
  for (const d of Object.values(db.deals)) if (d.seller == u.nick || d.buyer == u.nick) {
    deals[d.id] = dv(d, u);
    for (const n of [d.seller, d.buyer]) if (n && !users[n]) users[n] = { nick: n, avatar: db.users[n].avatar };
  }
  return { me: u.nick, users, deals, pay: db.pay.filter(p => p.u == u.nick), wd: db.wd.filter(x => x.u == u.nick) };
}

const H = {
  logout(u, b, tk) { delete db.tok[tk]; return {}; },
  state: () => ({}),
  avatar(u, b) { if (!okImg(b.img, 200000)) E('Фото слишком большое'); u.avatar = b.img; return {}; },
  setcur(u, b) { if (!R[b.cur]) E('Неверная валюта'); u.cur = b.cur; return {}; },
  passwd(u, b) {
    if (!eq(hash(String(b.old), u.salt), u.pass)) E('Текущий пароль неверный');
    if (String(b.nw).length < 6) E('Новый пароль от 6 символов');
    u.salt = rid(16); u.pass = hash(String(b.nw), u.salt); return {};
  },
  'req.add'(u, b) {
    const r = b.r || {}, t = r.t;
    if (!['stars', 'crypto', 'card'].includes(t)) E('Неверный тип реквизитов');
    if (u.reqs.length >= 10) E('Слишком много реквизитов');
    const x = { id: rid(6), t, a: String(r.a || '').slice(0, 64), main: !u.reqs.length };
    if (t == 'stars') { if (!/^@\w{5,32}$/.test(x.a)) E('Неверный юзернейм'); }
    else if (t == 'crypto') { x.b = String(r.b || '').slice(0, 32); x.c = String(r.c || '').slice(0, 128); if (!x.a || !x.b || x.c.length < 10) E('Заполните кошелёк, сеть и адрес'); }
    else {
      if (!['UA', 'RU', 'BY', 'KZ'].includes(r.cc)) E('Неверная страна'); x.cc = r.cc;
      if (r.sbp) { x.sbp = 1; x.a = x.a.replace(/\D/g, ''); x.b = String(r.b || '').slice(0, 40); if (x.a.length < 10 || !x.b) E('Укажите телефон и банк'); }
      else if (!/^\d{16}$/.test(x.a)) E('Номер карты: 16 цифр');
    }
    u.reqs.push(x); return {};
  },
  'req.main'(u, b) { u.reqs.forEach(r => r.main = r.id == b.id); return {}; },
  'req.del'(u, b) { u.reqs = u.reqs.filter(r => r.id != b.id); if (u.reqs.length && !u.reqs.some(r => r.main)) u.reqs[0].main = true; return {}; },
  'deal.create'(u, b) {
    const amt = +b.amt, lk = String(b.lk || '').slice(0, 300);
    if (!(amt > 0) || amt > 1e9) E('Неверная сумма');
    if (!/\S+\.\S+/.test(lk)) E('Неверная ссылка на товар');
    const d = { id: rid(8), seller: u.nick, type: ['NFT', 'Аккаунт', 'Разное'].includes(b.type) ? b.type : 'Разное', amt: r8(amt), rq: String(b.rq || '').slice(0, 200), lk: /^https?:\/\//.test(lk) ? lk : 'https://' + lk, st: 'wait', buyer: null, t: Date.now(), m: [] };
    sys(d, 'seller', 'created'); db.deals[d.id] = d; return { id: d.id };
  },
  'deal.open'(u, b) {
    const d = db.deals[String(b.id).toUpperCase()];
    if (!d) E('Сделка не найдена');
    if (!d.buyer && u.nick != d.seller && d.st == 'wait') { d.buyer = u.nick; sys(d, 'seller', 'join_s'); sys(d, 'buyer', 'join_b'); }
    if (u.nick != d.seller && u.nick != d.buyer) E('У этой сделки уже есть покупатель');
    return {};
  },
  'deal.send'(u, b) {
    const d = mine(u, b.id), x = String(b.x || '').slice(0, 2000), i = b.i;
    if (!x && !i) E('Пустое сообщение');
    if (i && !okImg(i, 400000)) E('Фото слишком большое');
    if (d.m.length > 2000) E('Лимит сообщений в сделке');
    d.m.push({ k: 'm', f: u.nick, t: Date.now(), x, i }); return {};
  },
  'deal.pay'(u, b) {
    const d = mine(u, b.id);
    if (u.nick == d.seller) E('Нельзя оплатить свою сделку');
    if (d.st != 'wait') E('Сделка уже оплачена или закрыта');
    if (bal(u) < d.amt - 1e-9) E('Недостаточно средств');
    spend(u, d.amt); d.st = 'paid'; sys(d, 'buyer', 'paid_b'); sys(d, 'seller', 'paid_s'); return {};
  },
  'deal.shot'(u, b) {
    const d = mine(u, b.id);
    if (u.nick != d.seller || d.st != 'paid') E('Сейчас это недоступно');
    if (!okImg(b.i, 400000)) E('Нужен скриншот передачи');
    d.m.push({ k: 'm', f: u.nick, t: Date.now(), x: 'Скриншот передачи товара', i: b.i });
    d.st = 'handed'; sys(d, 'seller', 'shot_s'); sys(d, 'buyer', 'shot_b'); return {};
  },
  'deal.fin'(u, b) { const d = mine(u, b.id); if (u.nick != d.buyer || d.st != 'handed') E('Сейчас это недоступно'); release(d); return {}; },
  'deal.cancel'(u, b) { const d = mine(u, b.id); if (u.nick != d.seller || d.st != 'wait') E('Отменить нельзя'); d.st = 'cancel'; sys(d, 'all', 'cancel'); return {}; },
  wd(u, b) {
    const r = u.reqs.find(x => x.id == b.rid), a = +b.amt;
    if (!r) E('Выберите реквизиты'); if (!(a > 0)) E('Неверная сумма'); if (a > bal(u) + 1e-9) E('Недостаточно средств');
    spend(u, a); db.wd.push({ id: rid(6), u: u.nick, amt: r8(a), rq: rdet(r), st: 'pending', t: Date.now() }); return {};
  },
  fx(u, b) {
    const a = +b.amt, f = b.from, t = b.to;
    if (!R[f] || !R[t] || f == t || !(a > 0)) E('Проверьте валюты и сумму');
    if (a > u.w[f] + 1e-9) E('Недостаточно средств');
    u.w[f] = r8(Math.max(0, u.w[f] - a)); u.w[t] = r8(u.w[t] + a * R[t] / R[f]); return {};
  },
  'pay.create'(u, b) {
    const a = +b.amt;
    if (!(a >= 0.5) || a > 100000) E('Минимум 0.5 TON');
    if (db.pay.some(p => p.u == u.nick && p.st == 'wait' && Date.now() - p.t < 18e5)) E('У вас уже есть активная оплата');
    let c; do c = 'CD-' + rid(8); while (db.pay.some(p => p.c == c));
    db.pay.push({ id: c, u: u.nick, amt: r8(a), c, t: Date.now(), st: 'wait' }); return {};
  },
  'pay.cancel'(u) { db.pay.filter(p => p.u == u.nick && p.st == 'wait').forEach(p => p.st = 'cancel'); return {}; },
  async 'pay.check'(u) { await checkPayments(); const p = [...db.pay].reverse().find(x => x.u == u.nick); return { status: p ? p.st : 'none' }; },
};

// TON deposits: match incoming transfers to the wallet by exact comment and amount, credit once per tx hash.
let busy = false;
async function checkPayments() {
  if (busy) return;
  const now = Date.now(); let changed = false;
  db.pay.forEach(p => { if (p.st == 'wait' && now - p.t > 18e5) { p.st = 'exp'; changed = true; } });
  const w = db.pay.filter(p => p.st == 'wait' || (p.st == 'exp' && now - p.t < 864e5)); // expired ones are still credited for 24h
  if (w.length) {
    busy = true;
    try {
      const j = await (await fetch('https://toncenter.com/api/v2/getTransactions?address=' + TONW + '&limit=50', { headers: process.env.TONCENTER_KEY ? { 'X-API-Key': process.env.TONCENTER_KEY } : {} })).json();
      if (j.ok) for (const p of w) {
        const tx = j.result.find(x => x.in_msg && x.in_msg.message === p.c && +x.in_msg.value >= Math.round(p.amt * 1e9) * .995 && x.utime * 1000 >= p.t - 120000 && !db.paid.includes(x.transaction_id.hash));
        if (tx) { const u = db.users[p.u], v = +tx.in_msg.value / 1e9; db.paid.push(tx.transaction_id.hash); u.w.TON = r8(u.w.TON + v); p.st = 'done'; p.got = v; p.hash = tx.transaction_id.hash; changed = true; }
      }
    } catch (e) { console.log('TON check failed:', e.message); }
    busy = false;
  }
  if (changed) save();
}
setInterval(() => checkPayments().catch(() => {}), 30000);

const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };
http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const send = (c, o) => { res.writeHead(c, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(o)); };
  if (req.method == 'POST' && url.pathname.startsWith('/api/')) {
    let body = '';
    for await (const ch of req) { body += ch; if (body.length > 1.5e6) return send(413, { err: 'Слишком большой запрос' }); }
    let b; try { b = JSON.parse(body || '{}'); } catch { return send(400, { err: 'Bad JSON' }); }
    const a = url.pathname.slice(5), ip = req.socket.remoteAddress;
    try {
      if (a.startsWith('admin/')) {
        if (!ADMIN || !eq(String(req.headers['x-admin'] || ''), ADMIN)) return send(401, { err: 'Нет доступа' });
        const m = a.slice(6), find = (arr, id) => arr.find(x => x.id == id);
        if (m == 'list') return send(200, { wd: db.wd.slice(-100).reverse(), pay: db.pay.slice(-100).reverse(), deals: Object.values(db.deals).slice(-100).reverse().map(d => ({ ...d, m: undefined, msgs: d.m.filter(x => x.k == 'm').length })), users: Object.values(db.users).map(u => ({ nick: u.nick, w: u.w, since: u.since })) });
        if (m == 'wd.done') { const x = find(db.wd, b.id); if (x && x.st == 'pending') x.st = 'done'; }
        else if (m == 'wd.reject') { const x = find(db.wd, b.id); if (x && x.st == 'pending') { x.st = 'rejected'; const u = db.users[x.u]; u.w.RUB = r8(u.w.RUB + x.amt); } }
        else if (m == 'credit') { const u = db.users[b.nick]; if (!u || !R[b.cur] || !isFinite(+b.amt)) E('Проверьте данные'); u.w[b.cur] = r8(u.w[b.cur] + +b.amt); }
        else if (m == 'deal.release') { const d = db.deals[b.id]; if (d && (d.st == 'paid' || d.st == 'handed')) release(d); }
        else if (m == 'deal.refund') { const d = db.deals[b.id]; if (d && (d.st == 'paid' || d.st == 'handed')) { const u = db.users[d.buyer]; u.w.RUB = r8(u.w.RUB + d.amt); d.st = 'cancel'; sys(d, 'all', 'refund'); } }
        else E('Unknown');
        save(); return send(200, { ok: 1 });
      }
      if (a == 'register' || a == 'login') {
        if (limited(ip)) E('Слишком много попыток, подождите минуту');
        const n = String(b.nick || '').trim(), p = String(b.pass || '');
        if (a == 'register') {
          if (!/^[A-Za-z0-9_]{3,20}$/.test(n)) E('Ник: 3–20 символов, латиница, цифры и _');
          if (p.length < 6) E('Пароль от 6 символов');
          if (Object.keys(db.users).some(k => k.toLowerCase() == n.toLowerCase())) E('Этот ник занят');
          const salt = rid(16);
          db.users[n] = { nick: n, salt, pass: hash(p, salt), cur: 'RUB', avatar: '', since: Date.now(), w: Object.fromEntries(Object.keys(R).map(k => [k, 0])), reqs: [] };
          db.users[n].w.RUB = +process.env.TEST_BALANCE || 0;
        }
        const k = Object.keys(db.users).find(x => x.toLowerCase() == n.toLowerCase()), u = k && db.users[k];
        if (!u || !eq(hash(p, u.salt), u.pass)) E('Неверный ник или пароль');
        const token = crypto.randomBytes(24).toString('hex'); db.tok[token] = { nick: u.nick, t: Date.now() };
        save(); return send(200, { token, state: view(u) });
      }
      const tk = (req.headers.authorization || '').slice(7), s = db.tok[tk];
      if (s && Date.now() - s.t > 2.6e9) delete db.tok[tk];
      const u = db.tok[tk] && db.users[s.nick];
      if (!u) return send(200, { err: 'auth' });
      const f = H[a]; if (!f) return send(404, { err: 'Unknown' });
      const out = await f(u, b, tk); save();
      return send(200, { ...out, state: db.tok[tk] ? view(u) : undefined });
    } catch (e) { if (e && e.err) return send(200, { err: e.err }); console.error(e); return send(500, { err: 'Ошибка сервера' }); }
  }
  let p = url.pathname == '/' ? '/index.html' : url.pathname;
  const f = path.join(PUB, path.normalize(p));
  if (!f.startsWith(PUB)) { res.writeHead(403); return res.end(); }
  fs.readFile(f, (e, d) => { if (e) { res.writeHead(404); return res.end('Not found'); } res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' }); res.end(d); });
}).listen(PORT, () => console.log('Crystal Deals on http://localhost:' + PORT + (ADMIN ? '' : '  (admin disabled: set ADMIN_PASSWORD)')));
