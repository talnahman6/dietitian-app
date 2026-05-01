function toggleHelpPopup() {
  const p = document.getElementById('help-modal-overlay');
  p.hidden = !p.hidden;
}

function syncDevMobileButton(active) {
  const btn = document.getElementById('dev-mobile-toggle');
  if (!btn) return;
  btn.textContent = active ? '\u05ea\u05e6\u05d5\u05d2\u05ea \u05de\u05d7\u05e9\u05d1' : '\u05ea\u05e6\u05d5\u05d2\u05ea \u05e0\u05d9\u05d9\u05d3';
  btn.classList.toggle('is-active', active);
}

function toggleDevMobileView() {
  const existing = document.getElementById('dev-mobile-frame-overlay');
  if (existing) {
    existing.remove();
    syncDevMobileButton(false);
    return;
  }
  const overlay = document.createElement('div');
  overlay.id = 'dev-mobile-frame-overlay';
  overlay.className = 'dev-mobile-frame-overlay';
  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'dev-mobile-frame-close';
  closeBtn.textContent = '\u05ea\u05e6\u05d5\u05d2\u05ea \u05de\u05d7\u05e9\u05d1';
  closeBtn.addEventListener('click', toggleDevMobileView);
  const frame = document.createElement('iframe');
  frame.className = 'dev-mobile-frame';
  const url = new URL(window.location.href);
  url.searchParams.set('devMobileFrame', '1');
  url.searchParams.set('v', Date.now().toString());
  frame.src = url.toString();
  overlay.appendChild(closeBtn);
  overlay.appendChild(frame);
  document.body.appendChild(overlay);
  syncDevMobileButton(true);
}

function setSearchMode(mode) {
  const isManual = mode === 'manual';
  document.getElementById('manual-section').style.display = isManual ? '' : 'none';
  document.getElementById('auto-section').style.display = isManual ? 'none' : '';
  document.getElementById('toggle-manual').classList.toggle('stgl-active', isManual);
  document.getElementById('toggle-auto').classList.toggle('stgl-active', !isManual);
}

/* ─── AUTH GATE ─── */
requireAuth();
const _currentUser = getLoggedUser();
document.getElementById('user-name').textContent = 'שלום, ' + _currentUser.fullName;

/* inject avatar into AI message mini icon only */
document.getElementById('mini-av').innerHTML = AVATAR_SVG;

/* ─────────────────────────────────────────────────────────
   STATE + STORAGE
   ─────────────────────────────────────────────────────── */
const TODAY = new Date().toDateString();
const _DIET_KEY = dietKey(_currentUser.username);

let log = (() => {
  try {
    const d = JSON.parse(localStorage.getItem(_DIET_KEY) || '{}');
    return d[TODAY] || [];
  } catch { return []; }
})();

function save() {
  try {
    const d = JSON.parse(localStorage.getItem(_DIET_KEY) || '{}');
    d[TODAY] = log;
    localStorage.setItem(_DIET_KEY, JSON.stringify(d));
    if (typeof saveUserData === 'function') saveUserData(_currentUser.username);
  } catch {}
}

const GOALS = {cal:2000,carbs:250,protein:60,fat:65};
let _showRemaining = false;
const _emptyState = document.getElementById('empty-state');
/* load calorie goal from onboarding; redirect if profile not set */
async function _initGoals() {
  let d = JSON.parse(localStorage.getItem(_DIET_KEY) || '{}');
  if (!d.tdee && typeof loadUserData === 'function') {
    await loadUserData(_currentUser.username);
    d = JSON.parse(localStorage.getItem(_DIET_KEY) || '{}');
  }
  if (!d.tdee) { window.location.href = 'onboarding.html'; return; }
  let cal = d.tdee;
  if (d.weeklyGoal && d.goal) {
    const dailyDelta = Math.round((7500 * d.weeklyGoal) / 7);
    if (d.goal === 'loss') cal = d.tdee - dailyDelta;
    else if (d.goal === 'gain') cal = d.tdee + dailyDelta;
  }
  d.dailyCal = cal;
  localStorage.setItem(_DIET_KEY, JSON.stringify(d));
  GOALS.cal     = cal;
  GOALS.protein = Math.round(cal * 0.30 / 4 * 10) / 10;
  GOALS.carbs   = Math.round(cal * 0.40 / 4 * 10) / 10;
  GOALS.fat     = Math.round(cal * 0.30 / 9 * 10) / 10;
  if (typeof saveUserData === 'function') saveUserData(_currentUser.username);
  render();
}
_initGoals();

function totals() {
  return log.reduce((a,e)=>({
    cal: a.cal+e.cal, carbs: a.carbs+e.carbs,
    protein: a.protein+e.protein, fat: a.fat+e.fat
  }), {cal:0,carbs:0,protein:0,fat:0});
}

/* ─────────────────────────────────────────────────────────
   RENDER
   ─────────────────────────────────────────────────────── */
function render() {
  const t = totals();

  document.getElementById('s-cal').innerHTML = Math.round(t.cal);
  document.getElementById('s-crb').innerHTML = Math.round(t.carbs)+'<span class="sc-unit">g</span>';
  document.getElementById('s-prt').innerHTML = Math.round(t.protein)+'<span class="sc-unit">g</span>';
  document.getElementById('s-fat').innerHTML = Math.round(t.fat)+'<span class="sc-unit">g</span>';

  if (_showRemaining) {
    const r = {
      cal:     Math.max(0, Math.round(GOALS.cal     - t.cal)),
      carbs:   Math.max(0, Math.round(GOALS.carbs   - t.carbs)),
      protein: Math.max(0, Math.round(GOALS.protein - t.protein)),
      fat:     Math.max(0, Math.round(GOALS.fat     - t.fat)),
    };
    document.getElementById('pt-cal').textContent = r.cal+" קל'";
    document.getElementById('pt-crb').textContent = r.carbs+'g';
    document.getElementById('pt-prt').textContent = r.protein+'g';
    document.getElementById('pt-fat').textContent = r.fat+'g';
  } else {
    document.getElementById('pt-cal').textContent = Math.round(t.cal)+' / '+GOALS.cal+" קל'";
    document.getElementById('pt-crb').textContent = Math.round(t.carbs)+' / '+GOALS.carbs+'g';
    document.getElementById('pt-prt').textContent = Math.round(t.protein)+' / '+GOALS.protein+'g';
    document.getElementById('pt-fat').textContent = Math.round(t.fat)+' / '+GOALS.fat+'g';
  }

  function pct(v,g){return Math.min(Math.round(v/g*100),100)}
  document.getElementById('pf-cal').style.width = pct(t.cal,GOALS.cal)+'%';
  document.getElementById('pf-crb').style.width = pct(t.carbs,GOALS.carbs)+'%';
  document.getElementById('pf-prt').style.width = pct(t.protein,GOALS.protein)+'%';
  document.getElementById('pf-fat').style.width = pct(t.fat,GOALS.fat)+'%';

  const el = document.getElementById('food-list');
  _emptyState.remove();
  if (log.length === 0) {
    el.innerHTML = '';
    el.appendChild(_emptyState);
    _emptyState.style.display = '';
    return;
  }
  el.innerHTML = '';
  log.forEach((e, i) => {
    const div = document.createElement('div');
    div.className = 'fi';
    div.innerHTML = `
      <div class="fi-info">
        <div class="fi-name">${escHtml(e.food.n[0])}${e.quantityDisplay ? ' - ' + escHtml(e.quantityDisplay) : ''}</div>
        <div class="fi-qty">${Math.round(e.grams)}g · ${escHtml(e.food.cat)}</div>
      </div>
      <div class="fi-nutrients">
        <div class="nb c"><span class="nb-v">${e.cal}</span><span class="nb-l">קלוריות</span></div>
        <div class="nb h"><span class="nb-v">${e.carbs}g</span><span class="nb-l">פחמימות</span></div>
        <div class="nb p"><span class="nb-v">${e.protein}g</span><span class="nb-l">חלבונים</span></div>
        <div class="nb f"><span class="nb-v">${e.fat}g</span><span class="nb-l">שומנים</span></div>
      </div>
      <button class="btn-del" onclick="deleteItem(${i})" title="מחק">✕</button>`;
    el.appendChild(div);
  });
}

function escHtml(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}

/* ─────────────────────────────────────────────────────────
   AUTO-COMPLETE
   ─────────────────────────────────────────────────────── */
const _acInput = document.getElementById('food-input');
const _acList = document.getElementById('ac-list');
let _acSelected = false;
let _acSelectedFood = null;
let selectedManualFood = null;
let selectingAutocomplete = false;
let _acIgnoreNextInput = false;
let _acSuppress = false;

function closeAutocomplete() {
  _acList.style.display = 'none';
  _acList.innerHTML = '';
}

function acSearch(val) {
  if (_acSelected && selectedManualFood) { closeAutocomplete(); return; }
  const norm = s => s.toLowerCase().replace(/['"״׳]/g,'').replace(/\s+/g,' ').trim();
  const t = norm(val);
  if (t.length < 2) { _acList.style.display = 'none'; return; }
  const scored = [];
  for (const f of DB) {
    let score = 0;
    for (const n of f.n) {
      const name = norm(n);
      if (name === t) { score = Math.max(score, 100); continue; }
      if (name.startsWith(t)) { score = Math.max(score, 80); continue; }
      if (name.includes(t)) { score = Math.max(score, 60); continue; }
      const words = name.split(' ');
      if (words.some(w => w.startsWith(t))) score = Math.max(score, 50);
    }
    if (score > 0) scored.push({ f, score });
  }
  const matches = scored
    .sort((a, b) => b.score - a.score || a.f.n[0].localeCompare(b.f.n[0], 'he'))
    .slice(0, 8)
    .map(x => x.f);
  if (matches.length === 0) { _acList.style.display = 'none'; return; }
  _acList.innerHTML = matches.map(f =>
    `<div class="ac-item" data-name="${escHtml(f.n[0])}">${escHtml(f.n[0])}<span class="ac-cat">${escHtml(f.cat)}</span></div>`
  ).join('');
  _acList.style.setProperty('display', 'block', 'important');
  _acList.style.setProperty('position', 'absolute', 'important');
  _acList.style.setProperty('top', 'calc(100% + 6px)', 'important');
  _acList.style.setProperty('left', '0', 'important');
  _acList.style.setProperty('right', '0', 'important');
  _acList.style.setProperty('width', '100%', 'important');
  _acList.style.setProperty('background', 'var(--card2)', 'important');
  _acList.style.setProperty('border', '1px solid var(--bdr2)', 'important');
  _acList.style.setProperty('border-radius', '10px', 'important');
  _acList.style.setProperty('box-shadow', 'var(--sh)', 'important');
  _acList.style.setProperty('max-height', '240px', 'important');
  _acList.style.setProperty('overflow-y', 'auto', 'important');
  _acList.style.setProperty('-webkit-overflow-scrolling', 'touch', 'important');
  _acList.style.setProperty('z-index', '999999', 'important');
  function selectAutocompleteItem(item) {
    if (selectedManualFood && _acInput.value === item.dataset.name) return;
    selectingAutocomplete = true;
    _acInput.value = item.dataset.name;
    _acSelected = true;
    _acSelectedFood = DB.find(f => f.n && f.n.includes(item.dataset.name)) || null;
    selectedManualFood = _acSelectedFood;
    _acIgnoreNextInput = true;
    closeAutocomplete();
    _acSuppress = true;
    setTimeout(() => { selectingAutocomplete = false; _acSuppress = false; }, 300);
  }

  _acList.querySelectorAll('.ac-item').forEach(item => {
    item.addEventListener('mousedown', e => { e.preventDefault(); selectAutocompleteItem(item); });
    item.addEventListener('touchstart', e => { e.preventDefault(); selectAutocompleteItem(item); });
  });
}

_acInput.addEventListener('input', () => { if (_acSuppress) return; if (_acIgnoreNextInput) { _acIgnoreNextInput = false; return; } if (selectingAutocomplete) return; _acSelected = false; _acSelectedFood = null; selectedManualFood = null; acSearch(_acInput.value); });
_acInput.addEventListener('blur', () => {
  setTimeout(() => {
    if (selectingAutocomplete) return;
    _acList.style.display = 'none';
  }, 800);
});
_acInput.addEventListener('focus', () => { if (_acSuppress) return; if (_acSelected || selectedManualFood) return; if (_acInput.value.trim().length >= 2) acSearch(_acInput.value); });

/* ─────────────────────────────────────────────────────────
   ADD / DELETE / CLEAR
   ─────────────────────────────────────────────────────── */

/* Prepend "1 <unit>" when qty-sel has a volume unit and text has no unit yet */
function handleQtyUnitChange(sel) {
  const qtyNum = document.getElementById('qty-num');
  const plateFraction = document.getElementById('plate-fraction');
  const plateUi = document.getElementById('plate-fraction-ui');
  if (!qtyNum || !plateFraction || !sel) return;
  const isPlate = isPlateUnit(sel.value);
  document.getElementById('manual-section')?.classList.toggle('is-plate-unit', isPlate);
  qtyNum.style.setProperty('display', isPlate ? 'none' : 'block', 'important');
  plateFraction.style.setProperty('display', 'none', 'important');
  if (plateUi) plateUi.style.setProperty('display', isPlate ? 'block' : 'none', 'important');
  if (!isPlate) closeCustomSelect('plate-fraction');
}

function isPlateUnit(unit) {
  return unit === 'plate' || unit === 'צלחת';
}

function getFullPlateGrams(food) {
  const foodText = ((food.n || []).join(' ') + ' ' + (food.cat || '')).trim();
  const cat = food.cat || '';

  if (food.plateGrams) return food.plateGrams;
  if (/(חזה עוף|עוף|הודו|בשר|דג|סלמון|טונה|טופו|ביצה|קציצה|שניצל)/.test(foodText) || /בשר|דגים|חלבון/.test(cat)) return 180;
  if (/(אורז|פסטה|פתיתים|קוסקוס|בורגול|קינואה)/.test(foodText)) return 270;
  if (/(עדשים|שעועית|חומוס|אפונה|גריסים)/.test(foodText)) return 250;
  if (/(בטטה|תפוח\s*אדמה|תפו["״]?א|תפוחי\s*אדמה|פירה)/.test(foodText)) return 300;
  if (/(סלט|ירקות|חסה|עגב|מלפפון|כרוב|ברוקולי|כרובית|קישוא|חציל|גזר)/.test(foodText) || /ירקות/.test(cat)) return 300;
  if (/(לזניה|מוקפץ|תבשיל|קדרה|פשטידה)/.test(foodText)) return 350;
  return 300;
}

function closeCustomSelect(id) {
  const list = document.getElementById(id + '-list');
  if (list) list.style.display = 'none';
}

function closeAllCustomSelects() {
  closeCustomSelect('qty-unit');
  closeCustomSelect('plate-fraction');
}

function buildCustomSelect(id, onChange) {
  const select = document.getElementById(id === 'qty-unit' ? 'qty-sel' : 'plate-fraction');
  const btn = document.getElementById(id + '-btn');
  const list = document.getElementById(id + '-list');
  if (!select || !btn || !list || btn.dataset.bound) return;
  btn.dataset.bound = '1';

  function sync(value) {
    select.value = value;
    btn.textContent = select.selectedOptions[0]?.text || '';
    list.querySelectorAll('.custom-select-item').forEach(item => {
      const active = item.dataset.value === value;
      item.classList.toggle('active', active);
      const check = item.querySelector('.custom-select-check');
      if (check) check.textContent = active ? '✓' : '';
    });
    if (onChange) onChange(select);
  }

  list.innerHTML = Array.from(select.options).map(opt =>
    `<button type="button" class="custom-select-item" data-value="${escHtml(opt.value)}">${escHtml(opt.text)}<span class="custom-select-check"></span></button>`
  ).join('');

  list.addEventListener('pointerdown', e => {
    e.stopPropagation();
  });

  list.querySelectorAll('.custom-select-item').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      sync(item.dataset.value);
      closeCustomSelect(id);
    });
  });

  btn.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    const open = list.style.display === 'block';
    closeAllCustomSelects();
    list.style.display = open ? 'none' : 'block';
  });

  sync(select.value);
}

function applyQtyUnit(raw) {
  const qtySel = document.getElementById('qty-sel');
  if (!qtySel) return raw;
  const unit = qtySel.value;
  const hasUnit = /כפית|כפיות|כף|כפות|כוסות|כוס|מ"ל|מיליליטר|גרם/.test(raw);
  if (!hasUnit && ['כפית', 'כף', 'כוס'].includes(unit)) {
    return '1 ' + unit + ' ' + raw;
  }
  return raw;
}

function displayUnit(qty, unit) {
  const n = parseFloat(qty);
  if (n === 1) return unit;
  const plural = {
    'כף': 'כפות',
    'כפית': 'כפיות',
    'כוס': 'כוסות',
    'יחידה': 'יחידות',
    'פרוסה': 'פרוסות',
  };
  return plural[unit] || unit;
}

function formatQuantityDisplay(qty, unit) {
  return `${qty} ${displayUnit(qty, unit)}`;
}

function extractAutoQuantityDisplay(text) {
  const t = text.trim().toLowerCase();
  const plateM = t.match(/(?:^|\s)(\u05e8\u05d1\u05e2|\u05e9\u05dc\u05d9\u05e9|\u05d7\u05e6\u05d9|\u05e9\u05dc\u05dd)\s+\u05e6\u05dc\u05d7\u05ea(?:\s|$)/);
  if (plateM) return plateM[1] + ' \u05e6\u05dc\u05d7\u05ea';
  const qtyM = t.match(/(\d+(?:[.,]\d+)?)\s*(\u05d2\u05e8\u05dd|\u05d2|\u05de\"\u05dc|\u05de\u05d9\u05dc\u05d9\u05dc\u05d9\u05d8\u05e8|\u05de\u05dc|\u05db\u05e3|\u05db\u05e4\u05d5\u05ea|\u05db\u05e4\u05d9\u05ea|\u05db\u05e4\u05d9\u05d5\u05ea|\u05db\u05d5\u05e1|\u05db\u05d5\u05e1\u05d5\u05ea|\u05d9\u05d7\u05d9\u05d3\u05d4|\u05d9\u05d7\u05d9\u05d3\u05d5\u05ea|\u05e4\u05e8\u05d5\u05e1\u05d4|\u05e4\u05e8\u05d5\u05e1\u05d5\u05ea)(?:\s|$)/);
  if (!qtyM) return '';
  const qty = qtyM[1].replace(',', '.');
  const unit = qtyM[2] === '\u05d2' ? '\u05d2\u05e8\u05dd' : qtyM[2];
  return formatQuantityDisplay(qty, unit);
}

const AUTO_PREFIX_RE = /^(?:\u05d0\u05db\u05dc\u05ea\u05d9|\u05d0\u05db\u05dc\u05ea|\u05d0\u05db\u05dc|\u05d0\u05db\u05dc\u05d4|\u05e9\u05ea\u05d9\u05ea\u05d9|\u05e9\u05ea\u05d9\u05ea)\s+/;
const AUTO_PLATE_RE = /(^|\s)\u05e6\u05dc\u05d7\u05ea(?=\s|$)/;
const AUTO_QUARTER_RE = /(^|\s)\u05e8\u05d1\u05e2(?=\s|$)/;
const AUTO_THIRD_RE = /(^|\s)\u05e9\u05dc\u05d9\u05e9(?=\s|$)/;
const AUTO_HALF_RE = /(^|\s)\u05d7\u05e6\u05d9(?=\s|$)/;
const AUTO_QTY_WORDS_RE = /(^|\s)(?:\u05e8\u05d1\u05e2|\u05e9\u05dc\u05d9\u05e9|\u05d7\u05e6\u05d9|\u05e9\u05dc\u05dd|\u05e6\u05dc\u05d7\u05ea|\u05d2\u05e8\u05dd|\u05d2|\u05de\"\u05dc|\u05de\u05d9\u05dc\u05d9\u05dc\u05d9\u05d8\u05e8|\u05de\u05dc|\u05db\u05e3|\u05db\u05e4\u05d5\u05ea|\u05db\u05e4\u05d9\u05ea|\u05db\u05e4\u05d9\u05d5\u05ea|\u05db\u05d5\u05e1|\u05db\u05d5\u05e1\u05d5\u05ea|\u05d9\u05d7\u05d9\u05d3\u05d4|\u05d9\u05d7\u05d9\u05d3\u05d5\u05ea)(?=\s|$)/g;
const AUTO_QTY_NUM_RE = /\d+(?:[.,]\d+)?\s*(?:\u05d2\u05e8\u05dd|\u05d2|\u05de\"\u05dc|\u05de\u05d9\u05dc\u05d9\u05dc\u05d9\u05d8\u05e8|\u05de\u05dc|\u05db\u05e3|\u05db\u05e4\u05d5\u05ea|\u05db\u05e4\u05d9\u05ea|\u05db\u05e4\u05d9\u05d5\u05ea|\u05db\u05d5\u05e1|\u05db\u05d5\u05e1\u05d5\u05ea|\u05d9\u05d7\u05d9\u05d3\u05d4|\u05d9\u05d7\u05d9\u05d3\u05d5\u05ea)/g;
const AUTO_GRAMS_RE = /(\d+(?:[.,]\d+)?)\s*(?:\u05d2\u05e8\u05dd|\u05d2)(?=\s|$)/;
const AUTO_SPLIT_AND_RE = /\s+\u05d5(?=[\u05d0-\u05ea])/;
const AUTO_ITEM_QTY_START_RE = /(^|\s)\u05d5?\d+(?:[.,]\d+)?\s*(?:\u05d2\u05e8\u05dd|\u05d2|\u05de\"\u05dc|\u05de\u05d9\u05dc\u05d9\u05dc\u05d9\u05d8\u05e8|\u05de\u05dc|\u05db\u05e3|\u05db\u05e4\u05d5\u05ea|\u05db\u05e4\u05d9\u05ea|\u05db\u05e4\u05d9\u05d5\u05ea|\u05db\u05d5\u05e1|\u05db\u05d5\u05e1\u05d5\u05ea|\u05d9\u05d7\u05d9\u05d3\u05d4|\u05d9\u05d7\u05d9\u05d3\u05d5\u05ea)(?=\s|$)/g;
const AUTO_EXPLICIT_QTY_RE = /(?:\d+(?:[.,]\d+)?\s*(?:\u05d2\u05e8\u05dd|\u05d2|\u05de\"\u05dc|\u05de\u05d9\u05dc\u05d9\u05dc\u05d9\u05d8\u05e8|\u05de\u05dc|\u05db\u05e3|\u05db\u05e4\u05d5\u05ea|\u05db\u05e4\u05d9\u05ea|\u05db\u05e4\u05d9\u05d5\u05ea|\u05db\u05d5\u05e1|\u05db\u05d5\u05e1\u05d5\u05ea|\u05d9\u05d7\u05d9\u05d3\u05d4|\u05d9\u05d7\u05d9\u05d3\u05d5\u05ea)|(?:\u05e8\u05d1\u05e2|\u05e9\u05dc\u05d9\u05e9|\u05d7\u05e6\u05d9|\u05e9\u05dc\u05dd)\s+\u05e6\u05dc\u05d7\u05ea)/;

function cleanAutoText(raw) {
  return raw.replace(AUTO_PREFIX_RE, '').trim();
}

function hasAutoExplicitQuantity(text) {
  return AUTO_EXPLICIT_QTY_RE.test(text.trim().toLowerCase());
}

function showAutoMissingQty(aiMsg, aiText, warnBox) {
  const msg = 'בחיפוש אוטומטי יש לרשום כמות + יחידת משקל. למשל: אכלתי 100 גרם חזה עוף, אכלתי רבע צלחת אורז';
  if (warnBox) warnBox.innerHTML = '';
  aiMsg.classList.add('show');
  aiText.textContent = msg;
  let toast = document.getElementById('auto-qty-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'auto-qty-toast';
    toast.className = 'auto-qty-toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<div class="auto-qty-toast-box"><div>${escHtml(msg)}</div><button type="button" class="auto-qty-toast-ok">אישור</button></div>`;
  toast.querySelector('.auto-qty-toast-ok').addEventListener('click', () => toast.classList.remove('show'));
  toast.classList.add('show');
}

function splitAutoQuantityItems(text) {
  const starts = [];
  let match;
  AUTO_ITEM_QTY_START_RE.lastIndex = 0;
  while ((match = AUTO_ITEM_QTY_START_RE.exec(text)) !== null) {
    let start = match.index + match[1].length;
    if (text[start] === '\u05d5') start++;
    starts.push(start);
  }
  if (starts.length < 2) return [text];
  return starts.map((start, i) => text.slice(start, starts[i + 1] || text.length).trim()).filter(Boolean);
}

function parseAutoFood(part) {
  const t = part.trim().toLowerCase();
  if (!hasAutoExplicitQuantity(t)) return null;
  if (!AUTO_PLATE_RE.test(t)) {
    let result = parseFood(part);
    if (result) {
      result.quantityDisplay = result.quantityDisplay || extractAutoQuantityDisplay(part);
      return result;
    }
  }
  const cleaned = cleanAutoText(part)
    .replace(AUTO_QTY_WORDS_RE, ' ')
    .replace(AUTO_QTY_NUM_RE, ' ')
    .replace(/\d+(?:[.,]\d+)?/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const food = findFood(cleaned);
  if (!food) return null;
  let grams = 0;
  let quantityDisplay = '';
  const gramMatch = t.match(AUTO_GRAMS_RE);
  if (gramMatch) {
    grams = parseFloat(gramMatch[1].replace(',', '.'));
    quantityDisplay = `${grams} גרם`;
  } else if (AUTO_PLATE_RE.test(t)) {
    const fraction = AUTO_QUARTER_RE.test(t) ? 0.25 : AUTO_THIRD_RE.test(t) ? 1 / 3 : AUTO_HALF_RE.test(t) ? 0.5 : 1;
    grams = getFullPlateGrams(food) * fraction;
    const fractionText = fraction === 0.25 ? 'רבע' : fraction === 1 / 3 ? 'שליש' : fraction === 0.5 ? 'חצי' : 'שלם';
    quantityDisplay = `${fractionText} צלחת`;
  } else {
    grams = food.dw || 100;
    quantityDisplay = `${grams} גרם`;
  }
  const f = grams / 100;
  return {
    food,
    grams,
    cal: Math.round(food.cal * f),
    carbs: Math.round(food.c * f * 10) / 10,
    protein: Math.round(food.p * f * 10) / 10,
    fat: Math.round(food.f * f * 10) / 10,
    raw: part,
    quantityDisplay,
  };
}

async function addMeal(raw, sourceInput) {
  const aiMsg = document.getElementById('ai-msg');
  const aiText = document.getElementById('ai-text');
  const warnBox = document.getElementById('warn-box');
  const inp = sourceInput || document.getElementById('food-input');

  let cleaned = cleanAutoText(raw);
  const rawParts = cleaned.split(/,\s*|,/);
  const parts = [];
  for (const part of rawParts) {
    /* split "X ו-Y" Hebrew conjunction into separate items */
    const subParts = part.split(AUTO_SPLIT_AND_RE);
    for (const sp of subParts) {
      for (const item of splitAutoQuantityItems(sp.trim())) {
        const t = item.trim();
        if (t) parts.push(t);
      }
    }
  }
  if (parts.length < 2) return false;
  if (parts.some(part => !hasAutoExplicitQuantity(part))) {
    showAutoMissingQty(aiMsg, aiText, warnBox);
    return true;
  }

  aiMsg.classList.add('show');
  aiText.textContent = '⏳ מוסיף את כל המנות...';

  let added = 0;
  let addedCal = 0;
  const failed = [];
  for (const part of parts) {
    const result = parseAutoFood(part);
    if (result) { log.push(result); added++; addedCal += result.cal; }
    else failed.push(part);
  }
  save();
  render();

  let msg = added > 0 ? `נוספו ${added} מאכלים | סה״כ ${Math.round(addedCal)} קלוריות` : '';
  if (failed.length > 0) msg += `${msg ? ' | ' : ''}לא זיהיתי: ${failed.join(', ')}`;
  aiText.textContent = msg;
  warnBox.innerHTML = '';

  const total = totals();
  const warns = [];
  if (total.cal > GOALS.cal) warns.push(`⚠️ עברת את יעד הקלוריות היומי (${Math.round(total.cal)}/${GOALS.cal} קל׳)`);
  if (total.carbs > GOALS.carbs) warns.push(`⚠️ עברת את יעד הפחמימות היומי`);
  warnBox.innerHTML = warns.map(w => `<div class="warn-box">${w}</div>`).join('');

  inp.value = '';
  document.getElementById('food-list').scrollTop = document.getElementById('food-list').scrollHeight;
  return true;
}

/* ─────────────────────────────────────────────────────────
   LOCAL QUANTITY DETECTION + POPUP
   ─────────────────────────────────────────────────────── */
function hasExplicitQty(text) {
  const t = text.trim().toLowerCase();
  if (/\d+(?:[.,]\d+)?\s*(?:גרם|ג'|מ"?ל|מיליליטר|מל|ליטר|ק"?ג|קילוגרם)/.test(t)) return true;
  if (/\d+(?:[.,]\d+)?\s*(?:כפיות?|כפות?|כוסות?|כוס)/.test(t)) return true;
  if (/(?:^|\s)(?:כפיות?|כפות?|כוסות?|כוס)(?:\s|$)/.test(t)) return true;
  if (/(?:^|\s)כף(?:\s|$)/.test(t)) return true;
  if (/(?:^|\s)(?:חצי|רבע|שליש)(?:\s|$)/.test(t)) return true;
  if (/שלוש(?:\s+|-)?רבע|שני(?:\s+|-)?שלישי|כוס\s+וחצי|שתי\s+כוסות/.test(t)) return true;
  if (/(?:^|\s)(?:אחד|אחת|שניים|שתיים|שני|שתי|שלושה|שלוש|ארבעה|ארבע|חמישה|חמש|שישה|שש)(?:\s|$)/.test(t)) return true;
  if (/^\d+(?:[.,]\d+)?(?:\s|$)/.test(t)) return true;
  return false;
}

let _qtyFood = null, _qtyFoodText = null;

function _qtyUnitOptions(food) {
  const name = (food.n[0] || '').toLowerCase();
  const cat  = (food.cat || '').toLowerCase();
  if (/משקה|שתייה/.test(cat) || /מיץ|חלב|מים|קפה|תה/.test(name))
    return ['מ"ל', 'כוס', 'כף', 'כפית', 'גרם'];
  if (/לחם|טוסט|בגט|חלה|לאפה|פיתה|פרוסה/.test(name))
    return ['פרוסות', 'גרם', 'יחידות'];
  if (/שמן|חמאת|טחינה|ממרח|מלח|קמח|סוכר|דבש|ריבה/.test(name))
    return ['כף', 'כפית', 'כוס', 'גרם'];
  return ['גרם', 'יחידות', 'כוס', 'כף', 'כפית'];
}

function _qtyQuestion(food) {
  const name    = food.n[0];
  const nameLow = name.toLowerCase();
  const catLow  = (food.cat || '').toLowerCase();
  if (/לחם|טוסט|בגט|חלה|לאפה/.test(nameLow)) return `כמה פרוסות ${name}?`;
  if (/פיתה/.test(nameLow))                   return `כמה פיתות?`;
  if (/ביצ/.test(nameLow))                    return `כמה ביצים?`;
  if (/משקה|שתייה/.test(catLow) || /מיץ|חלב|מים|קפה|תה/.test(nameLow)) return `כמה מ"ל ${name}?`;
  if (/ירקות|פירות/.test(catLow))             return `כמה ${name}?`;
  return `כמה גרם ${name}?`;
}

function _ensureQtyPopup() {
  if (document.getElementById('qty-popup')) return;
  const style = document.createElement('style');
  style.textContent = `
    .qty-popup{background:#fff;border-radius:16px;padding:16px;margin:10px 0;box-shadow:0 2px 12px rgba(0,0,0,.12);direction:rtl}
    .qty-popup-q{font-weight:700;font-size:1rem;margin-bottom:12px;color:#333}
    .qty-popup-row{display:flex;gap:8px;margin-bottom:10px}
    .qty-popup-row input[type=number]{flex:1;min-width:0;padding:8px 10px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:1rem;font-family:inherit;box-sizing:border-box;background:#fafafa}
    .qty-popup-row select{padding:8px 10px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:1rem;font-family:inherit;background:#fafafa}
    .qty-popup-btns{display:flex;gap:8px}
    .qty-popup-btns button{flex:1;padding:9px;border:none;border-radius:10px;font-size:.95rem;cursor:pointer;font-family:inherit;font-weight:600}
    .qty-btn-add{background:#4caf50;color:#fff}
    .qty-btn-add:hover{background:#43a047}
    .qty-btn-cancel{background:#f0f0f0;color:#555}
  `;
  document.head.appendChild(style);
  const div = document.createElement('div');
  div.id = 'qty-popup';
  div.className = 'qty-popup';
  div.style.display = 'none';
  div.innerHTML = `
    <div class="qty-popup-q" id="qty-popup-q"></div>
    <div class="qty-popup-row">
      <input type="number" id="qty-popup-num" min="0.5" step="0.5" placeholder="כמות">
      <select id="qty-popup-unit"></select>
    </div>
    <div class="qty-popup-btns">
      <button class="qty-btn-add" onclick="qtyPopupSubmit()">הוסף ✓</button>
      <button class="qty-btn-cancel" onclick="qtyPopupClose()">ביטול</button>
    </div>`;
  _acList.insertAdjacentElement('afterend', div);
}

function showQtyPopup(food, foodText) {
  _ensureQtyPopup();
  _qtyFood = food;
  _qtyFoodText = foodText;
  document.getElementById('qty-popup-q').textContent = _qtyQuestion(food);
  const sel = document.getElementById('qty-popup-unit');
  sel.innerHTML = _qtyUnitOptions(food).map(u => `<option value="${u}">${u}</option>`).join('');
  const numIn = document.getElementById('qty-popup-num');
  numIn.value = '';
  document.getElementById('qty-popup').style.display = '';
  numIn.focus();
  document.getElementById('qty-popup').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function qtyPopupClose() {
  const p = document.getElementById('qty-popup');
  if (p) p.style.display = 'none';
  _qtyFood = null;
  _qtyFoodText = null;
}

function qtyPopupSubmit() {
  const numVal = parseFloat(document.getElementById('qty-popup-num').value);
  const unit   = document.getElementById('qty-popup-unit').value;
  if (!numVal || numVal <= 0) { document.getElementById('qty-popup-num').focus(); return; }
  if (!_qtyFood || !_qtyFoodText) return;
  const rawText = (unit === 'יחידות' || unit === 'פרוסות')
    ? `${numVal} ${_qtyFoodText}`
    : `${numVal} ${unit} ${_qtyFoodText}`;
  const result = parseFood(rawText);
  if (!result) {
    document.getElementById('ai-msg').classList.add('show');
    document.getElementById('ai-text').textContent = 'לא הצלחתי לחשב את הערכים. נסה שוב.';
    return;
  }
  qtyPopupClose();
  _commitFoodEntry(result);
}

function manualFindFood(name) {
  if (!name || typeof findFood !== 'function') return null;
  return findFood(name);
}

function _commitFoodEntry(result) {
  if (!result.quantityDisplay && result.raw) result.quantityDisplay = extractAutoQuantityDisplay(result.raw);
  log.push(result);
  save();
  const aiMsg  = document.getElementById('ai-msg');
  const aiText = document.getElementById('ai-text');
  aiMsg.classList.add('show');
  aiText.textContent = `נרשם! ${result.food.n[0]} (${Math.round(result.grams)}g) — ${result.cal} קלוריות, ${result.carbs}g פחמימות, ${result.protein}g חלבונים, ${result.fat}g שומנים.\n${getMiriFeedback()}`;
  const warnBox = document.getElementById('warn-box');
  const total   = totals();
  const warns   = [];
  if (total.cal   > GOALS.cal)   warns.push(`⚠️ עברת את יעד הקלוריות היומי (${Math.round(total.cal)}/${GOALS.cal} קל׳)`);
  if (total.carbs > GOALS.carbs) warns.push(`⚠️ עברת את יעד הפחמימות היומי`);
  warnBox.innerHTML = warns.map(w => `<div class="warn-box">${w}</div>`).join('');
  render();
  document.getElementById('food-list').scrollTop = document.getElementById('food-list').scrollHeight;
}

async function addFood() {
  const inp = document.getElementById('food-input');
  let raw = inp.value.trim();
  if (!raw) return;

  const aiMsg  = document.getElementById('ai-msg');
  const aiText = document.getElementById('ai-text');
  const warnBox = document.getElementById('warn-box');

  /* ── Manual search (autocomplete-selected item OR manual mode) ── */
  const _manualSec = document.getElementById('manual-section');
  const _isManual = _manualSec && _manualSec.style.display !== 'none';
  if (selectedManualFood || _acSelectedFood || _isManual) {
    console.log('[manual-add] clicked add');
    console.log('[manual-add] input value:', raw);
    console.log('[manual-add] selectedManualFood:', selectedManualFood);
    console.log('[manual-add] DB length:', typeof DB !== 'undefined' ? DB.length : 'DB not defined');
    if (typeof DB === 'undefined' || !Array.isArray(DB) || DB.length === 0) {
      aiMsg.classList.add('show');
      aiText.textContent = 'מאגר המאכלים לא נטען';
      return;
    }
    const unit = document.getElementById('qty-sel').value;
    const qtyNum = parseFloat(document.getElementById('qty-num').value);
    if (!isPlateUnit(unit) && (!qtyNum || qtyNum <= 0)) {
      aiMsg.classList.add('show');
      aiText.textContent = 'יש להזין כמות לפני הוספת המאכל';
      return;
    }
    const food = selectedManualFood || _acSelectedFood || manualFindFood(raw);
    console.log('[manual-add] findFood result:', food);
    if (!food) {
      aiMsg.classList.add('show');
      aiText.textContent = 'המאכל לא נמצא במאגר';
      _acSelected = false;
      _acSelectedFood = null;
      selectedManualFood = null;
      return;
    }
    if (food.cal === undefined || food.p === undefined || food.c === undefined || food.f === undefined) {
      aiMsg.classList.add('show');
      aiText.textContent = 'המאכל לא נמצא במאגר';
      return;
    }
    let grams;
    if (unit === 'גרם') grams = qtyNum;
    else if (unit === 'מ"ל' || unit === 'מיליליטר') grams = qtyNum;
    else if (unit === 'יחידות' || unit === 'יחידה' || unit === 'פרוסות' || unit === 'פרוסה') grams = qtyNum * (food.dw || 100);
    else if (unit === 'כוס' || unit === 'כוסות') grams = qtyNum * 240;
    else if (unit === 'כף' || unit === 'כפות') grams = qtyNum * 15;
    else if (unit === 'כפית' || unit === 'כפיות') grams = qtyNum * 5;
    else if (isPlateUnit(unit)) {
      const fullPlateGrams = getFullPlateGrams(food);
      const fraction = document.getElementById('plate-fraction') ? document.getElementById('plate-fraction').value : '1';
      const f = parseFloat(fraction) || 1;
      grams = fullPlateGrams * f;
    }
    else grams = qtyNum;
    const multiplier = grams / 100;
    const entry = {
      food,
      grams,
      cal:     Math.round(food.cal * multiplier),
      carbs:   Math.round(food.c   * multiplier * 10) / 10,
      protein: Math.round(food.p   * multiplier * 10) / 10,
      fat:     Math.round(food.f   * multiplier * 10) / 10,
      raw,
      quantityDisplay: isPlateUnit(unit) ? document.getElementById('plate-fraction').selectedOptions[0].text + " צלחת" : formatQuantityDisplay(qtyNum, unit),
    };
    console.log('[manual-add] created entry:', entry);
    _acSelected = false;
    _acSelectedFood = null;
    selectedManualFood = null;
    inp.value = '';
    _acList.style.display = 'none';
    const _qn = document.getElementById('qty-num');
    if (_qn) _qn.value = '';
    _commitFoodEntry(entry);
    return;
  }

  const rawOrig = raw;
  raw = applyQtyUnit(raw);

  /* ── Multi-food meal ── */
  const isMeal = /,|\n|\s+ו(?=[א-ת])/.test(raw) || /^(אכלתי|אכלת|אכל|אכלה|שתיתי|שתית)\s/.test(raw);
  if (isMeal) {
    const handled = await addMeal(raw.replace(/\n/g, ','), inp);
    if (handled) return;
  }

  /* ── Single food: local search only ── */
  const foodText = raw.replace(/^(אכלתי|אכלת|אכל|אכלה|שתיתי|שתית)\s+/, '').trim();
  const origFoodText = rawOrig.replace(/^(אכלתי|אכלת|אכל|אכלה|שתיתי|שתית)\s+/, '').trim();

  const food = findFood(foodText);
  if (!food) {
    warnBox.innerHTML = '';
    aiMsg.classList.add('show');
    aiText.textContent = `לא מצאתי "${origFoodText}" במאגר. נסה שם אחר.`;
    return;
  }

  if (hasExplicitQty(origFoodText)) {
    const result = parseFood(foodText);
    if (result) { inp.value = ''; _commitFoodEntry(result); return; }
  }

  /* No explicit quantity — open popup */
  inp.value = '';
  warnBox.innerHTML = '';
  aiMsg.classList.remove('show');
  showQtyPopup(food, origFoodText);
}

async function addAutoFood() {
  const inp = document.getElementById('auto-input');
  const aiMsg = document.getElementById('ai-msg');
  const aiText = document.getElementById('ai-text');
  const warnBox = document.getElementById('warn-box');
  const raw = inp ? inp.value.trim() : '';
  if (!raw) return;

  if (!hasAutoExplicitQuantity(cleanAutoText(raw))) {
    showAutoMissingQty(aiMsg, aiText, warnBox);
    return;
  }

  const handled = await addMeal(raw.replace(/\n/g, ','), inp);
  if (handled) return;

  const result = parseAutoFood(cleanAutoText(raw));
  if (result) {
    inp.value = '';
    _commitFoodEntry(result);
    return;
  }

  warnBox.innerHTML = '';
  aiMsg.classList.add('show');
  aiText.textContent = 'מחפש במאגר הרחב...';
  if (typeof fetchFoodsDict === 'function' && typeof showServingPicker === 'function') {
    const term = cleanAutoText(raw).trim();
    const fd = await fetchFoodsDict(term);
    if (fd && fd.food && fd.per100 && fd.per100.cal) {
      inp.value = '';
      showServingPicker(fd, raw);
      return;
    }
  }
  aiText.textContent = `לא הצלחתי לחשב את "${raw}". נסה שם אחר או הוסף כמות.`;
}

function deleteItem(i) {
  log.splice(i, 1);
  save();
  render();
}

function clearAll() {
  if (!confirm('למחוק את כל הרשומות של היום?')) return;
  log = [];
  save();
  document.getElementById('ai-msg').classList.remove('show');
  render();
}

/* ─────────────────────────────────────────────────────────
   CAMERA
   ─────────────────────────────────────────────────────── */
function openCamera() {
  let fileIn = document.getElementById('_cam-input');
  if (!fileIn) {
    fileIn = document.createElement('input');
    fileIn.type = 'file';
    fileIn.id = '_cam-input';
    fileIn.accept = 'image/*';
    fileIn.capture = 'environment';
    fileIn.style.display = 'none';
    document.body.appendChild(fileIn);
    fileIn.addEventListener('change', () => {
      if (!fileIn.files[0]) return;
      const aiMsg = document.getElementById('ai-msg');
      const aiText = document.getElementById('ai-text');
      aiMsg.classList.add('show');
      aiText.textContent = '📷 התמונה נטענה! כתב/י את שם המנה בשדה הטקסט כדי לרשום אותה.';
      fileIn.value = '';
    });
  }
  fileIn.click();
}

/* ─────────────────────────────────────────────────────────
   VOICE RECORDING
   ─────────────────────────────────────────────────────── */
let recognition = null;
let isRecording = false;

function initVoice() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return false;
  recognition = new SR();
  recognition.lang = 'he-IL';
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 3;

  recognition.onstart = () => {
    isRecording = true;
    const btn = document.getElementById('mic-btn');
    btn.classList.add('rec');
    btn.textContent = '⏹ מקליט...';
  };

  recognition.onresult = (e) => {
    let txt = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      txt += e.results[i][0].transcript;
    }
    document.getElementById('food-input').value = txt;
  };

  recognition.onend = () => {
    isRecording = false;
    const btn = document.getElementById('mic-btn');
    btn.classList.remove('rec');
    btn.textContent = '🎤';
    const val = document.getElementById('food-input').value.trim();
    if (val) addFood();
  };

  recognition.onerror = (e) => {
    isRecording = false;
    const btn = document.getElementById('mic-btn');
    btn.classList.remove('rec');
    btn.textContent = '🎤';
    if (e.error === 'not-allowed') {
      alert('יש לאשר גישה למיקרופון בדפדפן');
    }
  };
  return true;
}

function toggleVoice() {
  if (!recognition) {
    if (!initVoice()) {
      alert('הדפדפן שלך לא תומך בהקלטה קולית. נסה Chrome.');
      return;
    }
  }
  if (isRecording) {
    recognition.stop();
  } else {
    document.getElementById('food-input').value = '';
    recognition.start();
  }
}

function toggleAutoVoice() {
  if (!recognition) {
    if (!initVoice()) {
      alert('הדפדפן שלך לא תומך בהקלטה קולית. נסה Chrome.');
      return;
    }
  }
  if (isRecording) { recognition.stop(); return; }
  const autoInput = document.getElementById('auto-input');
  const autoBtn = document.getElementById('auto-mic-btn');
  recognition.onstart = () => {
    isRecording = true;
    autoBtn.classList.add('rec');
    autoBtn.textContent = '⏹ מקליט...';
  };
  recognition.onresult = (e) => {
    let txt = '';
    for (let i = e.resultIndex; i < e.results.length; i++) txt += e.results[i][0].transcript;
    autoInput.value = txt;
  };
  recognition.onend = () => {
    isRecording = false;
    autoBtn.classList.remove('rec');
    autoBtn.textContent = '🎤';
    if (autoInput.value.trim()) addAutoFood();
  };
  recognition.onerror = (e) => {
    isRecording = false;
    autoBtn.classList.remove('rec');
    autoBtn.textContent = '🎤';
    if (e.error === 'not-allowed') alert('יש לאשר גישה למיקרופון בדפדפן');
  };
  autoInput.value = '';
  recognition.start();
}

let _miriRec = null;
let _miriRecording = false;

function toggleMiriVoice() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { alert('הדפדפן שלך לא תומך בהקלטה קולית. נסה Chrome.'); return; }

  const chatInput = document.querySelector('.miri-chat-input');
  const chatBtn = document.querySelector('.miri-chat-voice');

  if (_miriRecording && _miriRec) { _miriRec.stop(); return; }

  _miriRec = new SR();
  _miriRec.lang = 'he-IL';
  _miriRec.continuous = false;
  _miriRec.interimResults = true;

  _miriRec.onstart = () => {
    _miriRecording = true;
    chatBtn.classList.add('rec');
    chatBtn.textContent = '⏹ מקליט...';
  };
  _miriRec.onresult = (e) => {
    let txt = '';
    for (let i = e.resultIndex; i < e.results.length; i++) txt += e.results[i][0].transcript;
    chatInput.value = txt;
  };
  _miriRec.onerror = (e) => {
    _miriRecording = false;
    chatBtn.classList.remove('rec');
    chatBtn.textContent = e.error === 'no-speech' ? '🎤 לא שמעתי' : '🎤';
    setTimeout(() => { chatBtn.textContent = '🎤'; }, 2000);
  };
  _miriRec.onend = () => {
    _miriRecording = false;
    chatBtn.classList.remove('rec');
    chatBtn.textContent = '🎤';
    const val = chatInput.value.trim();
    if (val) setTimeout(() => miriSend(), 100);
  };
  try {
    _miriRec.start();
  } catch(e) {
    _miriRecording = false;
    chatBtn.textContent = '🎤';
    setTimeout(() => toggleMiriVoice(), 400);
  }
}

/* ─────────────────────────────────────────────────────────
   FOOD PICKER
   ─────────────────────────────────────────────────────── */
let fpFood = null;

function fpOpen() {
  const picker = document.getElementById('food-picker');
  const sel = document.getElementById('fp-sel');
  if (sel.options.length <= 1) {
    const cats = {};
    DB.forEach((f, i) => {
      if (!cats[f.cat]) cats[f.cat] = [];
      cats[f.cat].push([i, f]);
    });
    for (const cat of Object.keys(cats).sort()) {
      const grp = document.createElement('optgroup');
      grp.label = cat;
      for (const [i, f] of cats[cat]) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = f.n[0];
        grp.appendChild(opt);
      }
      sel.appendChild(grp);
    }
  }
  picker.style.display = '';
  picker.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function fpClose() {
  document.getElementById('food-picker').style.display = 'none';
  fpFood = null;
  document.getElementById('fp-sel').value = '';
  document.getElementById('fp-foodname').textContent = 'בחר מאכל';
  document.getElementById('fp-catbadge').textContent = '';
  fpClear();
}

function fpClear() {
  document.getElementById('fpn-cal').textContent = '0';
  document.getElementById('fpn-carbs').textContent = '0g';
  document.getElementById('fpn-prot').textContent = '0g';
  document.getElementById('fpn-fat2').textContent = '0g';
  document.getElementById('fp-grams-note').textContent = '';
}

function fpFoodChange() {
  const idx = parseInt(document.getElementById('fp-sel').value);
  if (isNaN(idx)) { fpFood = null; fpClear(); return; }
  fpFood = DB[idx];
  document.getElementById('fp-foodname').textContent = fpFood.n[0];
  document.getElementById('fp-catbadge').textContent = fpFood.cat;
  document.getElementById('fp-qty').value = fpFood.dw || 100;
  fpUpdate();
}

function fpUpdate() {
  if (!fpFood) return;
  const g = parseFloat(document.getElementById('fp-qty').value) || 0;
  const f = g / 100;
  document.getElementById('fpn-cal').textContent = Math.round(fpFood.cal * f);
  document.getElementById('fpn-carbs').textContent = (Math.round(fpFood.c * f * 10) / 10) + 'g';
  document.getElementById('fpn-prot').textContent = (Math.round(fpFood.p * f * 10) / 10) + 'g';
  document.getElementById('fpn-fat2').textContent = (Math.round(fpFood.f * f * 10) / 10) + 'g';
  document.getElementById('fp-grams-note').textContent = g > 0 ? `מחושב עבור ${g} גרם` : '';
}

function fpAdd() {
  if (!fpFood) { alert('יש לבחור מאכל תחילה'); return; }
  const g = parseFloat(document.getElementById('fp-qty').value) || 0;
  if (g <= 0) { alert('יש להזין כמות חיובית'); return; }
  const f = g / 100;
  const entry = {
    food: fpFood, grams: g,
    cal: Math.round(fpFood.cal * f),
    carbs: Math.round(fpFood.c * f * 10) / 10,
    protein: Math.round(fpFood.p * f * 10) / 10,
    fat: Math.round(fpFood.f * f * 10) / 10,
    raw: `${fpFood.n[0]} ${g}g`,
  };
  log.push(entry);
  save();
  const aiMsg = document.getElementById('ai-msg');
  const aiText = document.getElementById('ai-text');
  aiMsg.classList.add('show');
  aiText.textContent = `נרשם! ${fpFood.n[0]} (${g}g) — ${entry.cal} קלוריות, ${entry.carbs}g פחמימות, ${entry.protein}g חלבונים, ${entry.fat}g שומנים.`;
  document.getElementById('warn-box').innerHTML = '';
  const t = totals();
  let warns = [];
  if (t.cal > GOALS.cal) warns.push(`⚠️ עברת את יעד הקלוריות היומי (${Math.round(t.cal)}/${GOALS.cal} קל׳)`);
  if (t.carbs > GOALS.carbs) warns.push(`⚠️ עברת את יעד הפחמימות היומי`);
  document.getElementById('warn-box').innerHTML = warns.map(w => `<div class="warn-box">${w}</div>`).join('');
  render();
  fpClose();
  document.getElementById('food-list').scrollTop = document.getElementById('food-list').scrollHeight;
}

/* ─────────────────────────────────────────────────────────
   FOODSDICTIONARY SERVING PICKER
   ─────────────────────────────────────────────────────── */
let _fdPickerData = null;

function _ensureFdPicker() {
  if (document.getElementById('fd-picker')) return;
  const style = document.createElement('style');
  style.textContent = `
    .fd-picker{background:#fff;border-radius:16px;padding:16px;margin:10px 0;box-shadow:0 2px 12px rgba(0,0,0,.12);direction:rtl}
    .fd-picker-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
    .fd-picker-name{font-weight:700;font-size:1.05rem}
    .fd-picker-src{font-size:.72rem;color:#aaa;white-space:nowrap}
    .fd-picker label{font-size:.83rem;color:#666;display:block;margin-bottom:4px}
    .fd-picker select,.fd-picker input[type=number]{width:100%;padding:8px 10px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:1rem;margin-bottom:8px;direction:rtl;font-family:inherit;box-sizing:border-box;background:#fafafa}
    .fd-picker-nums{display:flex;gap:8px;margin:6px 0 10px}
    .fd-picker-btns{display:flex;gap:8px}
    .fd-picker-btns button{flex:1;padding:9px;border:none;border-radius:10px;font-size:.95rem;cursor:pointer;font-family:inherit;font-weight:600}
    .fd-btn-add{background:#4caf50;color:#fff}
    .fd-btn-add:hover{background:#43a047}
    .fd-btn-cancel{background:#f0f0f0;color:#555}
  `;
  document.head.appendChild(style);

  const div = document.createElement('div');
  div.id = 'fd-picker';
  div.className = 'fd-picker';
  div.style.display = 'none';
  div.innerHTML = `
    <div class="fd-picker-head">
      <span class="fd-picker-name" id="fd-fname">-</span>
      <span class="fd-picker-src">● FoodsDictionary</span>
    </div>
    <label>בחר מנה:</label>
    <select id="fd-serving-sel" onchange="fdServingChange()"></select>
    <input type="number" id="fd-custom-g" placeholder="הזן גרמים" min="1" style="display:none" oninput="fdServingChange()">
    <div class="fd-picker-nums">
      <div class="nb c"><span class="nb-v" id="fd-ncal">0</span><span class="nb-l">קלוריות</span></div>
      <div class="nb h"><span class="nb-v" id="fd-ncarb">0g</span><span class="nb-l">פחמימות</span></div>
      <div class="nb p"><span class="nb-v" id="fd-nprot">0g</span><span class="nb-l">חלבונים</span></div>
      <div class="nb f"><span class="nb-v" id="fd-nfat">0g</span><span class="nb-l">שומנים</span></div>
    </div>
    <div class="fd-picker-btns">
      <button class="fd-btn-add" onclick="fdAdd()">הוסף לרשימה ✓</button>
      <button class="fd-btn-cancel" onclick="fdClose()">ביטול</button>
    </div>`;
  _acList.insertAdjacentElement('afterend', div);
}

function showServingPicker(fdResult, rawInput) {
  _ensureFdPicker();
  _fdPickerData = { ...fdResult, _rawInput: rawInput };
  document.getElementById('fd-fname').textContent = fdResult.food.n[0];

  const defaults = [
    { label: '100 גרם', grams: 100 },
    { label: '150 גרם', grams: 150 },
    { label: '200 גרם', grams: 200 },
  ];
  const sizes = fdResult.servingSizes.length > 0
    ? [...fdResult.servingSizes, { label: 'מותאם אישית', grams: -1 }]
    : [...defaults, { label: 'מותאם אישית', grams: -1 }];
  _fdPickerData._sizes = sizes;

  const sel = document.getElementById('fd-serving-sel');
  sel.innerHTML = '';
  sizes.forEach((s, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = s.label;
    sel.appendChild(opt);
  });

  document.getElementById('fd-custom-g').style.display = 'none';
  document.getElementById('fd-picker').style.display = '';
  fdServingChange();
  document.getElementById('fd-picker').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function fdServingChange() {
  if (!_fdPickerData) return;
  const idx = parseInt(document.getElementById('fd-serving-sel').value);
  const size = _fdPickerData._sizes[idx];
  const customInput = document.getElementById('fd-custom-g');

  let grams;
  if (size.grams === -1) {
    customInput.style.display = '';
    grams = parseFloat(customInput.value) || 0;
  } else {
    customInput.style.display = 'none';
    grams = size.grams;
  }

  const p = _fdPickerData.per100;
  const f = grams / 100;
  document.getElementById('fd-ncal').textContent  = Math.round(p.cal * f);
  document.getElementById('fd-ncarb').textContent = (Math.round(p.carbs   * f * 10) / 10) + 'g';
  document.getElementById('fd-nprot').textContent = (Math.round(p.protein * f * 10) / 10) + 'g';
  document.getElementById('fd-nfat').textContent  = (Math.round(p.fat     * f * 10) / 10) + 'g';
}

function fdAdd() {
  if (!_fdPickerData) return;
  const idx  = parseInt(document.getElementById('fd-serving-sel').value);
  const size = _fdPickerData._sizes[idx];

  let grams;
  if (size.grams === -1) {
    grams = parseFloat(document.getElementById('fd-custom-g').value) || 0;
    if (grams <= 0) { alert('יש להזין כמות חיובית'); return; }
  } else {
    grams = size.grams;
  }

  const p = _fdPickerData.per100;
  const f = grams / 100;
  const entry = {
    food:    _fdPickerData.food,
    grams,
    cal:     Math.round(p.cal * f),
    carbs:   Math.round(p.carbs   * f * 10) / 10,
    protein: Math.round(p.protein * f * 10) / 10,
    fat:     Math.round(p.fat     * f * 10) / 10,
    raw:     _fdPickerData._rawInput,
  };
  log.push(entry);
  save();
  fdClose();

  const aiMsg  = document.getElementById('ai-msg');
  const aiText = document.getElementById('ai-text');
  aiMsg.classList.add('show');
  aiText.textContent = `נרשם! ${entry.food.n[0]} (${grams}g) — ${entry.cal} קלוריות, ${entry.carbs}g פחמימות, ${entry.protein}g חלבונים, ${entry.fat}g שומנים.`;

  const warnBox = document.getElementById('warn-box');
  const total = totals();
  const warns = [];
  if (total.cal   > GOALS.cal)   warns.push(`⚠️ עברת את יעד הקלוריות היומי (${Math.round(total.cal)}/${GOALS.cal} קל׳)`);
  if (total.carbs > GOALS.carbs) warns.push(`⚠️ עברת את יעד הפחמימות היומי`);
  warnBox.innerHTML = warns.map(w => `<div class="warn-box">${w}</div>`).join('');

  render();
  document.getElementById('food-list').scrollTop = document.getElementById('food-list').scrollHeight;
}

function fdClose() {
  const picker = document.getElementById('fd-picker');
  if (picker) picker.style.display = 'none';
  _fdPickerData = null;
}

/* ─────────────────────────────────────────────────────────
   REMAINING NUTRITION
   ─────────────────────────────────────────────────────── */
function renderTracker() {
  const t = totals();
  if (_showRemaining) {
    const r = {
      cal:     Math.max(0, Math.round(GOALS.cal     - t.cal)),
      carbs:   Math.max(0, Math.round(GOALS.carbs   - t.carbs)),
      protein: Math.max(0, Math.round(GOALS.protein - t.protein)),
      fat:     Math.max(0, Math.round(GOALS.fat     - t.fat)),
    };
    document.getElementById('pt-cal').textContent = r.cal+" קל'";
    document.getElementById('pt-crb').textContent = r.carbs+'g';
    document.getElementById('pt-prt').textContent = r.protein+'g';
    document.getElementById('pt-fat').textContent = r.fat+'g';
  } else {
    document.getElementById('pt-cal').textContent = Math.round(t.cal)+' / '+GOALS.cal+" קל'";
    document.getElementById('pt-crb').textContent = Math.round(t.carbs)+' / '+GOALS.carbs+'g';
    document.getElementById('pt-prt').textContent = Math.round(t.protein)+' / '+GOALS.protein+'g';
    document.getElementById('pt-fat').textContent = Math.round(t.fat)+' / '+GOALS.fat+'g';
  }
}

function showRemaining() {
  _showRemaining = !_showRemaining;
  const btn = document.getElementById('remaining-btn');
  btn.textContent = _showRemaining ? 'כמה אכלתי היום?' : 'כמה נשאר לי לאכול היום?';
  document.getElementById('tracker-title').textContent = _showRemaining ? 'כמה נשאר לי לאכול היום?' : 'כמה אכלתי היום?';
  renderTracker();
}

/* ─────────────────────────────────────────────────────────
   MIRI CHAT
   ─────────────────────────────────────────────────────── */
function getMiriFeedback() {
  const t = totals();
  const hour = new Date().getHours();
  const caloriesLeft = Math.max(0, GOALS.cal - t.cal);
  const proteinLeft = Math.max(0, GOALS.protein - t.protein);
  const carbsLeft = Math.max(0, GOALS.carbs - t.carbs);
  const fatLeft = Math.max(0, GOALS.fat - t.fat);
  const caloriesConsumedPercent = GOALS.cal > 0 ? t.cal / GOALS.cal : 0;
  const expectedProgress = hour / 24;

  if (t.cal > GOALS.cal) {
    return 'עברת את היעד הקלורי להיום. מעכשיו עדיף ללכת על מזון קל מאוד או לעצור כאן.';
  }
  if (t.carbs > GOALS.carbs) {
    return 'עברת את יעד הפחמימות להיום. מעכשיו עדיף לבחור חלבון רזה וירקות.';
  }
  if (t.fat > GOALS.fat) {
    return 'עברת את יעד השומן להיום. עדיף להמשיך עם מזון קל ודל שומן.';
  }
  if (t.protein > GOALS.protein && caloriesLeft < GOALS.cal * 0.25) {
    return 'החלבון כבר גבוה והקלוריות כמעט נגמרו. עדיף להמשיך קל עם ירקות או לעצור כאן.';
  }
  if (caloriesConsumedPercent > expectedProgress + 0.2) {
    return 'אתה מתקדם מהר מדי ביחס לשעה. כדאי להאט ולבחור מזון קל יותר.';
  }
  if (proteinLeft > Math.max(20, GOALS.protein * 0.35)) {
    return 'חסר לך חלבון, זה זמן טוב להוסיף מקור חלבון איכותי 💪';
  }
  if (caloriesConsumedPercent < expectedProgress - 0.2 && hour >= 8) {
    return 'אתה יכול לאכול יותר כרגע ולהתקדם בקצב נכון.';
  }
  if (caloriesLeft <= GOALS.cal * 0.15 && proteinLeft <= GOALS.protein * 0.2 && carbsLeft <= GOALS.carbs * 0.2 && fatLeft <= GOALS.fat * 0.2) {
    return 'אתה בדיוק על המסלול, תמשיך ככה 👌';
  }
  return 'אתה בדיוק על המסלול, תמשיך ככה 👌';
}

function getMiriRecommendation(excluded = []) {
  const t = totals();
  const rem = {
    cal:     Math.max(0, Math.round(GOALS.cal     - t.cal)),
    carbs:   Math.max(0, Math.round(GOALS.carbs   - t.carbs)),
    protein: Math.max(0, Math.round(GOALS.protein - t.protein)),
    fat:     Math.max(0, Math.round(GOALS.fat     - t.fat)),
  };

  const excludedNames = new Set(excluded.map(f => f.n[0]));
  const findFood = names => DB.find(f =>
    !excludedNames.has(f.n[0]) && names.some(name => f.n.some(n => n.includes(name)))
  );
  const gramsFor = (food, macro, amount) => {
    const per100 = macro === 'protein' ? food.p : macro === 'carbs' ? food.c : food.f;
    if (!per100) return 100;
    const byMacro = amount / per100 * 100;
    const byCal = rem.cal > 0 && food.cal ? rem.cal / food.cal * 100 : byMacro;
    return Math.max(30, Math.min(300, Math.round(Math.min(byMacro, byCal) / 10) * 10));
  };

  if (rem.cal < 50 && rem.protein < 5 && rem.carbs < 10 && rem.fat < 5) {
    return 'הגעת ליעדים שלך להיום. כל הכבוד!';
  }

  const options = [
    rem.protein > 0 && { food: findFood(['חזה עוף', 'עוף', 'טונה', 'ביצה']), macro: 'protein', amount: rem.protein },
    rem.carbs > 0 && { food: findFood(['אורז', 'תפוח אדמה', 'תפו"א', 'תפוחי אדמה']), macro: 'carbs', amount: rem.carbs },
    rem.fat > 0 && { food: findFood(['אבוקדו', 'טחינה']), macro: 'fat', amount: rem.fat },
  ].filter(x => x && x.food).slice(0, 3);

  _lastRecommendedFoods = options.map(x => x.food);

  if (options.length === 0) return 'לא מצאתי כרגע המלצה מתאימה לפי הנתונים הקיימים.';

  let msg = `נשאר לך:\n${rem.cal} קלוריות\n${rem.protein} חלבון\n${rem.carbs} פחמימות\n${rem.fat} שומן\n\nהייתי ממליצה:`;

  for (const item of options) {
    msg += `\n- ${gramsFor(item.food, item.macro, item.amount)} גרם ${item.food.n[0]}`;
  }

  return msg;
}

let _lastRecommendedFoods = [];
let _rejectedFoods = [];

function _getMacroRole(f) {
  const cal = f.cal || 1;
  const cat = (f.cat || '').toLowerCase();
  if (/ירק/.test(cat)) return 'vegetable';
  if ((f.p * 4) / cal >= 0.3) return 'protein';
  if ((f.c * 4) / cal >= 0.5) return 'carbs';
  return 'other';
}

function _findAltFood(target, excluded) {
  const excSet = new Set(excluded.map(f => f.n[0]));
  const role = _getMacroRole(target);
  const calTarget = target.cal || 100;
  return DB.find(f =>
    !excSet.has(f.n[0]) &&
    _getMacroRole(f) === role &&
    Math.abs(f.cal - calTarget) / calTarget <= 0.5
  ) || null;
}

function _handleRejection(text) {
  const prefix = 'אין בעיה 😊 אני מחליפה לך את זה למשהו שמתאים יותר ועדיין שומר על היעדים שלך להיום.\n\n';
  let rejectedFood = null;
  for (const f of _lastRecommendedFoods) {
    if (f.n.some(name => text.includes(name))) { rejectedFood = f; break; }
  }

  if (rejectedFood) _rejectedFoods.push(rejectedFood);
  else _rejectedFoods.push(..._lastRecommendedFoods);

  let altFoods;
  if (rejectedFood) {
    const alt = _findAltFood(rejectedFood, _rejectedFoods);
    altFoods = alt ? [alt] : [];
  } else {
    const excSet = new Set(_rejectedFoods.map(f => f.n[0]));
    const t = totals();
    const proteinLow = t.protein < GOALS.protein * 0.6;
    const fatHigh    = t.fat     > GOALS.fat     * 0.8;
    const carbsHigh  = t.carbs   > GOALS.carbs   * 0.8;
    altFoods = DB
      .filter(f => !excSet.has(f.n[0]) && f.cal > 0)
      .map(f => {
        let s = 5;
        if (proteinLow) s += (f.p / f.cal) * 200;
        if (fatHigh)    s -= (f.f / f.cal) * 100;
        if (carbsHigh)  s -= (f.c / f.cal) * 80;
        return { f, s };
      })
      .filter(x => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 3)
      .map(x => x.f);
  }

  if (altFoods.length === 0)
    return prefix + 'לא מצאתי תחליף מתאים במאגר. נסי לפנות אליי עם בקשה אחרת.';

  _lastRecommendedFoods = altFoods;
  let msg = prefix + 'הצעה חלופית:\n';
  let totCal = 0, totProt = 0, totCarbs = 0, totFat = 0;
  for (const f of altFoods) {
    const g = Math.min(Math.max(f.dw || 100, 50), 300);
    const fac = g / 100;
    const c  = Math.round(f.cal * fac);
    const p  = Math.round(f.p   * fac);
    const h  = Math.round(f.c   * fac);
    const ft = Math.round(f.f   * fac);
    msg += `• ${f.n[0]} — ${g}g\n`;
    totCal += c; totProt += p; totCarbs += h; totFat += ft;
  }
  msg += `\nסיכום:\n${totCal} קל׳ | חלבון ${totProt}g | פחמימות ${totCarbs}g | שומן ${totFat}g`;
  return msg;
}

function _proteinFoodSuggest(grams) {
  if (grams <= 6)  return `מה אם תאכל ביצה אחת? בדיוק ~6g חלבון! 🥚`;
  if (grams <= 10) return `יוגורט יווני 100g — בדיוק בשבילך! ~10g חלבון 🥛`;
  if (grams <= 12) return `מה אתה אומר על קוטג׳ 100g? יש שם ~12g חלבון 😊`;
  if (grams <= 17) return `יוגורט יווני 170g יסגור לך את זה יפה! ~17g 🥛`;
  if (grams <= 25) return `קופסת טונה תסגור לך את הכל — ~25g חלבון! 🐟`;
  if (grams <= 31) return `100g חזה עוף ויסיים! ~31g חלבון 🍗`;
  return `כדאי מנת חלבון טובה — עוף, טונה או ביצים 💪`;
}

function _coachLine(rem, over, pct, t) {
  const hour = new Date().getHours();
  const caloriesConsumedPercent = GOALS.cal > 0 ? t.cal / GOALS.cal : 0;
  const expectedProgress = hour / 24;

  if (t.cal > GOALS.cal) {
    return 'עברת את היעד הקלורי להיום. מעכשיו עדיף ללכת על מזון קל מאוד או לעצור כאן.';
  }
  if (t.carbs > GOALS.carbs) {
    return 'עברת את יעד הפחמימות להיום. מעכשיו עדיף לבחור חלבון רזה וירקות.';
  }
  if (t.fat > GOALS.fat) {
    return 'עברת את יעד השומן להיום. עדיף להמשיך עם מזון קל ודל שומן.';
  }
  if (t.protein > GOALS.protein && rem.cal < GOALS.cal * 0.25) {
    return 'החלבון כבר גבוה והקלוריות כמעט נגמרו. עדיף להמשיך קל עם ירקות או לעצור כאן.';
  }
  if (caloriesConsumedPercent > expectedProgress + 0.2) {
    return 'אתה מתקדם מהר מדי ביחס לשעה. כדאי להאט ולבחור מזון קל יותר.';
  }
  if (rem.protein > Math.max(20, GOALS.protein * 0.35)) {
    return 'חסר לך חלבון, זה זמן טוב להוסיף מקור חלבון איכותי 💪';
  }
  if (caloriesConsumedPercent < expectedProgress - 0.2 && hour >= 8) {
    return 'אתה יכול לאכול יותר כרגע ולהתקדם בקצב נכון.';
  }
  if (rem.cal <= GOALS.cal * 0.15 && rem.protein <= GOALS.protein * 0.2 && rem.carbs <= GOALS.carbs * 0.2 && rem.fat <= GOALS.fat * 0.2) {
    return 'אתה בדיוק על המסלול, תמשיך ככה 👌';
  }
  return 'אתה בדיוק על המסלול, תמשיך ככה 👌';
}

function _miriCtx() {
  const t = totals();
  const rem = {
    cal:     Math.max(0, Math.round(GOALS.cal     - t.cal)),
    protein: Math.max(0, Math.round(GOALS.protein - t.protein)),
    carbs:   Math.max(0, Math.round(GOALS.carbs   - t.carbs)),
    fat:     Math.max(0, Math.round(GOALS.fat     - t.fat)),
  };
  const over = {
    cal:     Math.max(0, Math.round(t.cal     - GOALS.cal)),
    protein: Math.max(0, Math.round(t.protein - GOALS.protein)),
    carbs:   Math.max(0, Math.round(t.carbs   - GOALS.carbs)),
    fat:     Math.max(0, Math.round(t.fat     - GOALS.fat)),
  };
  const pct = {
    cal:     Math.round(t.cal     / GOALS.cal     * 100),
    protein: Math.round(t.protein / GOALS.protein * 100),
  };
  const hour = new Date().getHours();
  const d = JSON.parse(localStorage.getItem(_DIET_KEY) || '{}');
  const name = (_currentUser.fullName || '').split(' ')[0] || 'חבר';
  const goal = d.goal || 'loss';
  const tdee = d.tdee || GOALS.cal;
  const isLoss = goal === 'loss';
  const timeGreet = hour < 12 ? 'בוקר טוב' : hour < 17 ? 'צהריים טובים' : 'ערב טוב';
  return {t, rem, over, pct, hour, d, name, goal, tdee, isLoss, timeGreet};
}

function _getMiriAnswer(text) {
  const {t, rem, over, pct, hour, d, name, goal, tdee, isLoss, timeGreet} = _miriCtx();
  const calDone = t.cal >= GOALS.cal;
  const calOver = t.cal > GOALS.cal * 1.05;

  const Q = [
    [/כמה קלורי.*אכלתי|כמה אכלתי|סה"כ קלורי|סך הכל קלורי/, () => {
      const coach = _coachLine(rem, over, pct, t);
      let msg = `אכלת ${Math.round(t.cal)} קל׳ מתוך ${GOALS.cal}. נשאר לך ${rem.cal} קל׳ להיום.`;
      if (coach) msg += `\n${coach}`;
      return msg;
    }],

    [/כמה נשאר|מה נשאר|עוד כמה קלורי/, () => {
      const coach = _coachLine(rem, over, pct, t);
      if (over.cal > 0) return coach;
      if (rem.cal === 0) return `הגעת ליעד! ${over.cal > 0 ? `עברת ב-${over.cal} קל׳.` : 'בדיוק על הגבול'} ${coach || ''}`.trim();
      let msg = `נשאר לך:\n• ${rem.cal} קל׳\n• ${rem.protein}g חלבון\n• ${rem.carbs}g פחמימות\n• ${rem.fat}g שומן`;
      if (coach) msg += `\n\n${coach}`;
      return msg;
    }],

    [/כמה פחמימ.*אכלתי|פחמימות שאכלתי|כמה פחמימ.*היום/, () =>
      `אכלת ${Math.round(t.carbs)}g פחמימות מתוך ${GOALS.carbs}g. נשאר ${rem.carbs}g.`],

    [/כמה חלבון.*אכלתי|חלבונים שאכלתי|כמה חלבון.*היום/, () => {
      let msg = `אכלת ${Math.round(t.protein)}g חלבון מתוך ${GOALS.protein}g. נשאר ${rem.protein}g.`;
      if (rem.protein === 0) msg += `\n✅ הגעת לחלבון — כל הכבוד!`;
      else if (rem.protein <= 30) msg += `\n${_proteinFoodSuggest(rem.protein)}`;
      return msg;
    }],

    [/כמה שומן.*אכלתי|שומנים שאכלתי|כמה שומן.*היום/, () =>
      `אכלת ${Math.round(t.fat)}g שומן מתוך ${GOALS.fat}g. נשאר ${rem.fat}g.`],

    [/מה המצב|איך המצב|עדכני|עדכן אותי|איפה אני עומד|מה הסטטוס|איך אני היום|איך אני עומד|ספרי לי|מה קורה|איך הולך/, () => {
      const coach = _coachLine(rem, over, pct, t);
      let msg = `${timeGreet} ${name}! 📊\n• קלוריות: ${Math.round(t.cal)}/${GOALS.cal} (${pct.cal}%)\n• חלבון: ${Math.round(t.protein)}/${GOALS.protein}g (${pct.protein}%)\n• פחמימות: ${Math.round(t.carbs)}/${GOALS.carbs}g\n• שומן: ${Math.round(t.fat)}/${GOALS.fat}g`;
      if (coach) msg += `\n\n${coach}`;
      return msg;
    }],

    [/כמה אחוז|מה האחוז/, () =>
      `השגת ${pct.cal}% מיעד הקלוריות. חלבון: ${pct.protein}%.`],

    [/מה יעד|כמה יעד|יעד שלי|יעד קלורי/, () =>
      `יעד יומי: ${GOALS.cal} קל׳ | ${GOALS.protein}g חלבון | ${GOALS.carbs}g פחמימות | ${GOALS.fat}g שומן.`],

    [/מה המטרה|מה הגול|מה מטרתי/, () =>
      isLoss
        ? `המטרה שלך: ירידה במשקל. יעד ${GOALS.cal} קל׳ (מתחת ל-TDEE ${tdee} קל׳).`
        : `המטרה שלך: עלייה במסה. יעד ${GOALS.cal} קל׳ (מעל TDEE ${tdee} קל׳).`],

    [/מה אכלתי|רשימת האוכל|מה הוספתי היום/, () =>
      log.length === 0
        ? `עדיין לא רשמת אוכל היום.`
        : `אכלת היום:\n${log.map(e => `• ${e.food.n[0]} (${Math.round(e.grams)}g) — ${e.cal} קל׳`).join('\n')}`],

    [/כמה ארוחות|כמה פריטים|כמה מאכלים/, () =>
      log.length === 0 ? `לא רשמת ארוחות.` : `רשמת ${log.length} מאכלים היום.`],

    [/ארוחה אחרונה|מה אכלתי לאחרונה/, () =>
      log.length === 0
        ? `לא רשמת ארוחה עדיין.`
        : `ארוחה אחרונה: ${log[log.length-1].food.n[0]} (${Math.round(log[log.length-1].grams)}g) — ${log[log.length-1].cal} קל׳.`],

    [/הכי הרבה קלורי|מה הכי קלורי|ארוחה כבדה/, () => {
      if (log.length === 0) return `לא רשמת כלום עדיין.`;
      const mx = log.reduce((a,b) => a.cal > b.cal ? a : b);
      return `הארוחה הכבדה היום: ${mx.food.n[0]} — ${mx.cal} קל׳.`;
    }],

    [/מה לאכול.*בוקר|ארוחת בוקר|לאכול.*בבוקר/, () =>
      `לבוקר: ביצים + לחם מחיטה מלאה + ירקות, או שיבולת שועל עם פירות.`],

    [/מה לאכול.*צהריי|ארוחת צהריים|לאכול.*בצהריים/, () =>
      `לצהריים: חזה עוף + אורז מלא + סלט. חלבון + פחמימות + ירקות.`],

    [/מה לאכול.*ערב|ארוחת ערב|לאכול.*בערב/, () =>
      rem.cal < 300
        ? `הערב נשאר ${rem.cal} קל׳ — עדיף ארוחה קלה: סלט + טונה או יוגורט יווני.`
        : `לערב: סלמון + ירקות אפויים + בטטה.`],

    [/לפני שינה|ארוחת לילה|לאכול.*בלילה/, () =>
      rem.protein > 20
        ? `לפני שינה: יוגורט יווני — יעזור לחלבון שנשאר (${rem.protein}g).`
        : `כבר הגעת לחלבון. אם רעב — ירקות בלבד.`],

    [/לפני אימון|לאכול.*לפני ספורט/, () =>
      `לפני אימון: בננה + כפית חמאת בוטנים, 60-90 דקות לפני.`],

    [/אחרי אימון|לאכול.*אחרי ספורט/, () =>
      rem.protein > 0
        ? `אחרי אימון: חלבון מהיר — שייק או חזה עוף. נשאר לך ${rem.protein}g.`
        : `כבר הגעת לחלבון, אבל יוגורט יווני לא יזיק.`],

    [/בין ארוחות|חטיף|נשנוש/, () =>
      rem.cal > 200
        ? `חטיף טוב: 15 שקדים (90 קל׳), תפוח + חמאת בוטנים, או קוטג׳.`
        : `נשאר ${rem.cal} קל׳ — עדיף ירקות (מלפפון, גמבה).`],

    [/מה לאכול.*עכשיו|מה אוכל|תמליצי עכשיו/, () => {
      if (hour < 10) return `בוקר — ביצים + לחם מלא מתחיל יפה.`;
      if (hour < 13) return rem.cal > 400 ? `חטיף: פרי + גבינה לבנה.` : `כבר אכלת רוב הקלוריות, המתן לצהריים.`;
      if (hour < 17) return rem.cal > 300 ? `עוף + אורז + סלט.` : `ארוחה קלה — נשאר ${rem.cal} קל׳.`;
      if (hour < 20) return rem.cal > 200 ? `חטיף: שקדים או פרי.` : `קרוב ליעד, המתן לערב.`;
      return rem.cal > 150 ? `ארוחת ערב: סלט + חלבון.` : `ירקות ויוגורט — נשאר ${rem.cal} קל׳.`;
    }],

    [/מספיק חלבון|האם חלבון.*בסדר|חלבון.*מספיק/, () =>
      t.protein >= GOALS.protein * 0.9
        ? `כן! ${Math.round(t.protein)}g — כמעט ביעד (${GOALS.protein}g). 💪`
        : `עוד לא. ${Math.round(t.protein)}g מתוך ${GOALS.protein}g. חסר ${rem.protein}g.`],

    [/תמליצי.*חלבון|מקור.*חלבון|מה.*עשיר.*חלבון/, () =>
      `מקורות חלבון: חזה עוף (31g/100g), טונה (25g/100g), ביצה (6g), קוטג׳ (12g/100g), יוגורט יווני (10g/100g).`],

    [/חלבון ב?ביצה|כמה חלבון.*ביצה/, () => `ביצה בינונית: ~6g חלבון, ~70 קל׳.`],
    [/חלבון ב?עוף|כמה חלבון.*עוף/, () => `חזה עוף (100g): ~31g חלבון, ~165 קל׳.`],
    [/חלבון ב?טונה|כמה חלבון.*טונה/, () => `טונה בקופסה (100g): ~25g חלבון, ~110 קל׳.`],
    [/חלבון ב?סלמון|כמה חלבון.*סלמון/, () => `סלמון (100g): ~25g חלבון, ~208 קל׳.`],
    [/חלבון ב?קוטג|כמה חלבון.*קוטג/, () => `גבינת קוטג׳ (100g): ~12g חלבון, ~72 קל׳.`],
    [/חלבון ב?יוגורט|כמה חלבון.*יוגורט/, () => `יוגורט יווני 0% (100g): ~10g חלבון, ~59 קל׳.`],

    [/יותר מדי שומן|עברתי.*שומן|שומן גבוה/, () =>
      over.fat > 0
        ? `כן, עברת ב-${over.fat}g שומן. שמור על שאר היום.`
        : `לא — ${Math.round(t.fat)}g מתוך ${GOALS.fat}g. עוד ${rem.fat}g.`],

    [/שומן ב?אבוקדו|כמה שומן.*אבוקדו/, () => `אבוקדו (~150g): ~21g שומן, 240 קל׳.`],
    [/שומן ב?שמן זית|כמה שומן.*שמן זית/, () => `כף שמן זית: ~14g שומן, 120 קל׳.`],

    [/יותר מדי פחמימ|עברתי.*פחמימ|פחמימות.*גבוה/, () =>
      over.carbs > 0
        ? `עברת ב-${over.carbs}g פחמימות. חלבון ושומן בשאר היום.`
        : `לא — ${Math.round(t.carbs)}g מתוך ${GOALS.carbs}g.`],

    [/פחמימות ב?אורז|כמה פחמימ.*אורז/, () => `אורז לבן מבושל (100g): ~28g פחמימות, ~130 קל׳.`],
    [/פחמימות ב?לחם|כמה פחמימ.*לחם/, () => `פרוסת לחם מחיטה מלאה: ~13g פחמימות, ~75 קל׳.`],
    [/פחמימות ב?בטטה|כמה פחמימ.*בטטה/, () => `בטטה (100g): ~20g פחמימות, ~86 קל׳.`],
    [/פחמימות ב?בננה|כמה פחמימ.*בננה/, () => `בננה בינונית: ~27g פחמימות, ~105 קל׳.`],

    [/עברתי.*יעד|עברתי.*קלורי|אכלתי יותר מדי|אכלתי הרבה|חרגתי|חריגה היום/, () =>
      calOver
        ? `עברת ב-${over.cal} קל׳ — גם יום כזה קורה 😊 לא לפצות מחר, פשוט חוזרים למסלול!`
        : calDone
          ? `הגעת בדיוק ליעד — ${Math.round(t.cal)} קל׳. מדהים! 🎉🌟`
          : `לא עברת — נשאר לך עוד ${rem.cal} קל׳ להיום.`],

    [/כמה עברתי|ב.?כמה עברתי/, () =>
      over.cal > 0 ? `עברת ב-${over.cal} קל׳.` : `לא עברת. נשאר ${rem.cal} קל׳.`],

    [/עשיתי טוב|כל הכבוד|הצלחתי|גאה בי/, () => {
      if (pct.cal >= 90 && t.protein >= GOALS.protein * 0.85)
        return `ממש כל הכבוד ${name}! יום מצוין 🌟`;
      if (pct.cal < 50)
        return `אתה בדרך! רק ${Math.round(t.cal)} קל׳ — עוד יש מקום לאכול.`;
      return `יופי ${name}! בכיוון. נשאר ${rem.cal} קל׳.`;
    }],

    [/לא מצליח|קשה לי|מתייאש|לוותר|עייף מ/, () =>
      isLoss
        ? `זה נורמלי. אל תוותר על יום שלם בגלל ארוחה אחת.`
        : `עלייה במסה לוקחת זמן — עקביות היא המפתח.`],

    [/מה הצעד הבא|מה לעשות עכשיו/, () =>
      rem.protein > 20
        ? `הוסף חלבון — עוד ${rem.protein}g. עוף, ביצים, טונה.`
        : rem.cal > 200
          ? `נשאר ${rem.cal} קל׳ — ארוחה קלה עם ירקות.`
          : `כמעט סיימת יפה! אם רעב — ירקות חופשיים.`],

    [/בספק|לא בטוח|מה עדיף/, () =>
      `תמיד בחר גבוה יותר בחלבון ונמוך יותר בשומן רווי.`],

    [/קלורי ב?ביצה|כמה קלורי.*ביצה/, () => `ביצה גדולה: ~75 קל׳. לבנה בלבד: ~17 קל׳.`],
    [/קלורי ב?עוף|כמה קלורי.*עוף/, () => `חזה עוף מבושל (100g): ~165 קל׳, 31g חלבון.`],
    [/קלורי ב?אורז|כמה קלורי.*אורז/, () => `אורז לבן מבושל (100g): ~130 קל׳.`],
    [/קלורי ב?פיתה|כמה קלורי.*פיתה/, () => `פיתה (~60g): ~165 קל׳, 33g פחמימות.`],
    [/קלורי ב?לחם|כמה קלורי.*לחם/, () => `פרוסת לחם מחיטה מלאה: ~75 קל׳.`],
    [/קלורי ב?בננה|כמה קלורי.*בננה/, () => `בננה בינונית: ~105 קל׳.`],
    [/קלורי ב?שקדים|כמה קלורי.*שקדים/, () => `23 שקדים (28g): ~160 קל׳, 6g חלבון.`],
    [/קלורי ב?אבוקדו|כמה קלורי.*אבוקדו/, () => `אבוקדו (~150g): ~240 קל׳, 21g שומן.`],
    [/קלורי ב?יוגורט|כמה קלורי.*יוגורט/, () => `יוגורט יווני 0% (100g): ~59 קל׳, 10g חלבון.`],
    [/קלורי ב?גבינ|כמה קלורי.*גבינ/, () => `גבינה לבנה 5% (100g): ~90 קל׳. גבינה צהובה (30g): ~100 קל׳.`],
    [/קלורי ב?טונה|כמה קלורי.*טונה/, () => `טונה בקופסה (100g): ~110 קל׳, 25g חלבון.`],
    [/קלורי ב?סלמון|כמה קלורי.*סלמון/, () => `סלמון (100g): ~208 קל׳, 25g חלבון.`],
    [/קלורי ב?שוקולד|כמה קלורי.*שוקולד/, () => `שוקולד מריר (30g): ~170 קל׳. במינון — בסדר.`],
    [/קלורי ב?חומוס|כמה קלורי.*חומוס/, () => `חומוס (100g): ~164 קל׳, 9g חלבון.`],
    [/קלורי ב?טחינה|כמה קלורי.*טחינה/, () => `כף טחינה (15g): ~90 קל׳.`],
    [/קלורי ב?ביצ.*קשה|ביצה קשה/, () => `ביצה קשה: ~78 קל׳, 6g חלבון.`],
    [/קלורי ב?קוטג|כמה קלורי.*קוטג/, () => `קוטג׳ 3% (100g): ~72 קל׳, 12g חלבון.`],

    [/כמה מים|מים ליום|שתיתי מספיק/, () =>
      `מומלץ 35ml לכל ק"ג גוף — בממוצע 2.5-3 ליטר ביום.`],

    [/מים לפני אכילה|לשתות לפני ארוחה/, () =>
      `כוס מים לפני ארוחה מפחיתה תיאבון בכ-20%.`],

    [/מתי ארד קילו|כמה זמן.*לרדת|מתי אוריד ק/, () => {
      const deficit = tdee - GOALS.cal;
      if (deficit <= 0) return `אתה במסלול עלייה — לא ירידה.`;
      return `עם גרעון ${deficit} קל׳ ביום — ק"ג אחד בכ-${Math.round(7700/deficit)} ימים.`;
    }],

    [/כמה גרעון|מה הגרעון|גירעון קלורי/, () => {
      const deficit = tdee - GOALS.cal;
      return deficit > 0
        ? `גרעון יומי: ${deficit} קל׳ (TDEE ${tdee} − יעד ${GOALS.cal}).`
        : `אתה בעודף של ${Math.abs(deficit)} קל׳ (מסלול עלייה).`;
    }],

    [/tdee|כמה שורף|קצב חילוף/, () =>
      `ה-TDEE שלך: ${tdee} קל׳ ביום.`],

    [/האם אני בכיוון|אני בסדר.*תזונה|עושה.*טוב.*היום/, () => {
      const ok = pct.cal <= 105 && t.protein >= GOALS.protein * 0.7;
      return ok
        ? `כן, בכיוון מצוין! ✅ ${pct.cal}% קלוריות, ${Math.round(t.protein)}g חלבון.`
        : pct.cal > 105
          ? `עברת מעט (${pct.cal}%). מחר תפצה.`
          : `קלוריות בסדר, חזק את החלבון — עוד ${rem.protein}g.`;
    }],

    [/מה זה מאקרו|מאקרונוטריאנט/, () =>
      `מאקרו = חלבון, פחמימות, שומן — שלושת אבות המזון שמספקים אנרגיה.`],

    [/מה זה tdee|מה זה מטבוליזם/, () =>
      `TDEE = כמות הקלוריות שהגוף שורף ביום כולל פעילות. שלך: ${tdee} קל׳.`],

    [/מה זה גרעון|מה זה גירעון/, () =>
      `גרעון קלורי = אכילה פחות ממה שהגוף שורף. מה שגורם לירידה במשקל.`],

    [/מה זה עודף קלורי/, () =>
      `עודף = אכילה יותר ממה שהגוף שורף. גורם לעלייה במסה.`],

    [/שומן בריא|שומן טוב|אומגה/, () =>
      `שומן בריא: אבוקדו, שמן זית, אגוזים, שקדים, סלמון.`],

    [/פחמימות טובות|פחמימות מורכבות|פחמימה בריא/, () =>
      `פחמימות מורכבות: אורז מלא, בטטה, שיבולת שועל, לחם מחיטה מלאה.`],

    [/מדד גליקמי|גליקמי/, () =>
      `מדד גליקמי — עד כמה מהר המזון מעלה סוכר. נמוך (עד 55) = טוב לדיאטה.`],

    [/סיבים תזונתיים|כמה סיבים/, () =>
      `מומלץ 25-35g סיבים ביום — ירקות, קטניות, דגנים מלאים.`],

    [/רעב\b|מרגיש רעב|אני רעב/, () => {
      if (rem.cal > 400) return `אוקי אוקי, מותר לאכול! 😄 נשאר לך ${rem.cal} קל׳ — עדיף לשלב חלבון עם ירקות, זה ישביע אותך הכי טוב 💪`;
      if (rem.cal > 150) return `יש לך עוד ${rem.cal} קל׳ — אפשר לאכול בהחלט! ${_proteinFoodSuggest(rem.protein > 0 ? rem.protein : 15)}`;
      return `אממ, נשאר לך רק ${rem.cal} קל׳ להיום 😊 לפני שאתה אוכל — שתה כוס מים, לפעמים הגוף מתבלבל בין צמא לרעב. אם עדיין רעב — ירקות חופשיים!`;
    }],

    [/לא רעב|אין תיאבון/, () =>
      isLoss
        ? `אם לא רעב — לא חייב לאכול. רק וודא ${GOALS.protein}g חלבון ביום.`
        : `בעלייה חשוב לאכול גם אם לא רעב — כדי לא לפספס קלוריות.`],

    [/זללתי|אכלתי יותר מדי.*ערב|אכלתי.*סוף היום/, () =>
      `זה קורה. מחר בוקר מתחילים מחדש — לא לפצות בדיאטה קיצונית.`],

    [/התאמנתי|עשיתי אימון|אחרי אימון/, () =>
      rem.protein > 0
        ? `כל הכבוד! חלבון תוך 60 דקות — נשאר ${rem.protein}g.`
        : `כבר הגעת לחלבון — מצוין! שמור על נוזלים.`],

    [/חלבון לאימון|חלבון לבניית שרירים|כמה חלבון.*ספורטאי/, () =>
      `לבניית שרירים: 1.6-2.2g לכל ק"ג גוף ביום. יעד שלך: ${GOALS.protein}g.`],

    [/אכלתי בחוץ|מסעדה|ארוחה חברתית/, () =>
      `בחוץ — בחר חלבון רזה + ירקות + כמות מדודה של פחמימות. לא להרגיש אשם.`],

    [/חתונה|אירוע|שבת|חג/, () =>
      `בארוחות חגיגיות — תהנה! התמקד בחלבון, הגבל לחם וקינוח, שתה מים בין מנות.`],

    [/שלום|היי|הי\b|בוקר טוב|ערב טוב|מה שלומ/, () => {
      const coach = _coachLine(rem, over, pct, t);
      let msg = `${timeGreet} ${name}! 😊 `;
      if (pct.cal === 0) msg += `עדיין לא רשמת כלום היום — בוא נתחיל!`;
      else if (coach) msg += coach;
      else msg += `אתה ב-${pct.cal}% מהיעד היומי. איך אני יכולה לעזור?`;
      return msg;
    }],

    [/תודה|תודה רבה/, () =>
      `בשמחה ${name}! 💚 אני כאן אם תצטרך עוד.`],

    [/איך אני סוגר.*חלבון|מה אוכל.*לסגור|מה אכול.*חלבון|מה עוד.*חלבון/, () =>
      rem.protein <= 0
        ? `כבר סגרת את החלבון! ✅ ${Math.round(t.protein)}g — יופי!`
        : `נשאר ${rem.protein}g — ${_proteinFoodSuggest(rem.protein)}`],

    [/כמה עוד.*חלבון|עוד כמה.*חלבון/, () =>
      rem.protein <= 0
        ? `סיימת את החלבון! ✅ כל הכבוד!`
        : `נשאר ${rem.protein}g חלבון — ${_proteinFoodSuggest(rem.protein)}`],

    [/עמדתי ביעד|הגעתי ליעד/, () =>
      rem.cal === 0
        ? `כן!! עמדת ביעד היום! 🌟🎉 ${Math.round(t.cal)} קל׳ — מדהים אתה!`
        : over.cal > 0
          ? `כמעט — עברת ב-${over.cal} קל׳ בלבד. בפעם הבאה תהיה מדויק 🎯`
          : `עוד לא — נשאר ${rem.cal} קל׳. כמעט שם! 💪`],

    [/האם אני בכיוון|אני בסדר.*תזונה|עושה.*טוב.*היום/, () => {
      const ok = pct.cal <= 105 && t.protein >= GOALS.protein * 0.7;
      const coach = _coachLine(rem, over, pct, t);
      let msg = ok
        ? `כן, בכיוון מצוין! ✅ ${pct.cal}% קלוריות, ${Math.round(t.protein)}g חלבון.`
        : pct.cal > 105
          ? `עברת מעט (${pct.cal}%). לא נורא — מחר תפצה 😊`
          : `קלוריות בסדר, חזק את החלבון — עוד ${rem.protein}g.`;
      if (coach) msg += `\n${coach}`;
      return msg;
    }],

    [/כן\b|אוקי|מעולה|ממשיכ|בסדר גמור/, () =>
      `מצוין! ${rem.cal > 0 ? `נשאר לך ${rem.cal} קל׳ להיום.` : `הגעת ליעד! 👏`}`],
  ];

  for (const [re, fn] of Q) {
    if (re.test(text)) return fn();
  }
  return null;
}

function miriSend() {
  const input = document.querySelector('.miri-chat-input');
  const msgs = document.getElementById('miri-chat-msgs');
  const text = input.value.trim();
  if (!text) return;

  const userDiv = document.createElement('div');
  userDiv.className = 'miri-msg miri-msg-user';
  userDiv.innerHTML = '<span class="miri-msg-label">אתה:</span><span class="miri-msg-text"></span>';
  userDiv.querySelector('.miri-msg-text').textContent = text;
  msgs.appendChild(userDiv);

  const sep = document.createElement('div');
  sep.className = 'miri-msg-sep';
  msgs.appendChild(sep);

  const typingDiv = document.createElement('div');
  typingDiv.className = 'miri-msg miri-msg-bot';
  typingDiv.innerHTML = '<div class="miri-msg-bot-inner"><span class="miri-msg-name-row"><img class="miri-msg-avatar" src="images/מירי ממליצה חיוך 2.png"><span class="miri-msg-label">מירי:</span></span><span class="miri-dots"><span>.</span><span>.</span><span>.</span></span></div>';
  msgs.appendChild(typingDiv);

  msgs.scrollTop = msgs.scrollHeight;
  input.value = '';

  const isRejection = /לא בא לי|לא רוצה|לא אוהב|אין לי|תחליף|בלי/.test(text);
  const isRecommendRequest = /המלצ|מה לאכול|מה כדאי|תמליצ|מה אפשר|תציעי|תציע|מה עוד/.test(text);

  let replyText;
  if (isRejection && _lastRecommendedFoods.length > 0) {
    replyText = _handleRejection(text);
  } else {
    replyText = _getMiriAnswer(text);
    if (replyText === null) {
      if (isRecommendRequest) {
        _rejectedFoods = [];
        replyText = getMiriRecommendation();
      } else {
        const t = totals();
        const rem = {
          cal:     Math.max(0, Math.round(GOALS.cal     - t.cal)),
          protein: Math.max(0, Math.round(GOALS.protein - t.protein)),
          fat:     Math.max(0, Math.round(GOALS.fat     - t.fat)),
        };
        const _t = totals();
        const _rem = {
          cal:     Math.max(0, Math.round(GOALS.cal     - _t.cal)),
          protein: Math.max(0, Math.round(GOALS.protein - _t.protein)),
          carbs:   Math.max(0, Math.round(GOALS.carbs   - _t.carbs)),
          fat:     Math.max(0, Math.round(GOALS.fat     - _t.fat)),
        };
        const _over = {
          cal: Math.max(0, Math.round(_t.cal - GOALS.cal)),
          fat: Math.max(0, Math.round(_t.fat - GOALS.fat)),
        };
        const _pct = { cal: Math.round(_t.cal / GOALS.cal * 100), protein: Math.round(_t.protein / GOALS.protein * 100) };
        let reply = `הנה הסיכום שלך ${_currentUser.fullName.split(' ')[0]} 📊\n`;
        reply += `• קלוריות: ${Math.round(_t.cal)} / ${GOALS.cal} קל׳\n`;
        reply += `• חלבון: ${Math.round(_t.protein)}g / ${GOALS.protein}g\n`;
        reply += `• פחמימות: ${Math.round(_t.carbs)}g / ${GOALS.carbs}g\n`;
        reply += `• שומן: ${Math.round(_t.fat)}g / ${GOALS.fat}g`;
        const coach = _coachLine(_rem, _over, _pct, _t);
        if (coach) reply += `\n\n${coach}`;
        replyText = reply;
      }
    }
  }

  setTimeout(() => {
    typingDiv.innerHTML = '<div class="miri-msg-bot-inner"><span class="miri-msg-name-row"><img class="miri-msg-avatar" src="images/מירי ממליצה חיוך 2.png"><span class="miri-msg-label">מירי:</span></span><span class="miri-msg-text"></span></div>';
    typingDiv.querySelector('.miri-msg-text').textContent = replyText;
    msgs.scrollTop = msgs.scrollHeight;
  }, 3000);
}

document.querySelector('.miri-chat-voice').addEventListener('click', toggleMiriVoice);
document.querySelector('.miri-chat-send').addEventListener('click', miriSend);
document.querySelector('.miri-chat-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') miriSend();
});

/* ─────────────────────────────────────────────────────────
   ONBOARDING — GOAL SELECTION
   ─────────────────────────────────────────────────────── */
function selectGoal(goal) {
  const d = JSON.parse(localStorage.getItem(_DIET_KEY) || '{}');
  d.goal = goal;
  localStorage.setItem(_DIET_KEY, JSON.stringify(d));
  showWeeklyGoalStep();
}

function showWeeklyGoalStep() {
  document.querySelectorAll('.goal-card').forEach(c => c.style.display = 'none');
  let step = document.getElementById('weekly-goal-step');
  if (!step) {
    step = document.createElement('div');
    step.id = 'weekly-goal-step';
    step.className = 'onb-step';
    step.innerHTML = `
      <div class="onb-q">מה היעד השבועי שלך?</div>
      <input type="number" id="weekly-goal-input" min="0.1" max="2" step="0.1" placeholder="ק״ג בשבוע">
      <button class="onb-btn" onclick="submitWeeklyGoal()">המשך</button>`;
    document.body.appendChild(step);
  }
  step.style.display = '';
}

function submitWeeklyGoal() {
  const val = parseFloat(document.getElementById('weekly-goal-input').value);
  if (!val || val <= 0) return;
  const d = JSON.parse(localStorage.getItem(_DIET_KEY) || '{}');
  d.weeklyGoal = val;
  localStorage.setItem(_DIET_KEY, JSON.stringify(d));
}

function saveMealTimes(selected) {
  const valid = ['breakfast','lunch','snack','dinner','night'];
  const times = selected.filter(t => valid.includes(t));
  localStorage.setItem('mealTimes', JSON.stringify(times));
}

/* ─────────────────────────────────────────────────────────
   FOOD PREFERENCES
   ─────────────────────────────────────────────────────── */
function saveFoodPreferences(selected) {
  const d = JSON.parse(localStorage.getItem('foodPreferences') || '{}');
  d.selected = Array.isArray(selected) ? selected : [];
  d.all = [...d.selected, ...(d.freeText || [])];
  localStorage.setItem('foodPreferences', JSON.stringify(d));
}

function submitFoodFreeText() {
  const inp = document.getElementById('food-pref-text');
  if (!inp) return;
  const items = inp.value.split(/[,،\n،]+/).map(s => s.trim()).filter(Boolean);
  const d = JSON.parse(localStorage.getItem('foodPreferences') || '{}');
  d.freeText = items;
  d.all = [...(d.selected || []), ...items];
  localStorage.setItem('foodPreferences', JSON.stringify(d));
  inp.value = '';
  const box = document.getElementById('food-pref-box');
  if (box) box.style.display = 'none';
}

function showFoodFreeTextPrompt() {
  let box = document.getElementById('food-pref-box');
  if (!box) {
    box = document.createElement('div');
    box.id = 'food-pref-box';
    box.style.cssText = 'background:#fff;border-radius:14px;padding:14px;margin:10px 0;box-shadow:0 2px 10px rgba(0,0,0,.1);direction:rtl';
    box.innerHTML = `
      <div style="font-weight:700;margin-bottom:8px">יש עוד דברים שאתה אוהב?</div>
      <textarea id="food-pref-text" rows="2" placeholder="לדוגמה: תפוח, גבינה, אורז" style="width:100%;border:1.5px solid #e0e0e0;border-radius:8px;padding:8px;font-size:1rem;font-family:inherit;box-sizing:border-box;resize:none"></textarea>
      <button onclick="submitFoodFreeText()" style="margin-top:8px;padding:8px 18px;background:#4caf50;color:#fff;border:none;border-radius:8px;font-size:.95rem;cursor:pointer;font-family:inherit;font-weight:600">שמור</button>`;
    document.body.appendChild(box);
  }
  box.style.display = '';
}

/* ─────────────────────────────────────────────────────────
   DAILY MENUS GENERATOR
   ─────────────────────────────────────────────────────── */
function generateDailyMenus() {
  const mealTimes = (() => { try { return JSON.parse(localStorage.getItem('mealTimes') || '["breakfast","lunch","dinner"]'); } catch { return ['breakfast','lunch','dinner']; } })();
  const prefData  = (() => { try { return JSON.parse(localStorage.getItem('foodPreferences') || '{}'); } catch { return {}; } })();
  const prefs = (prefData.all || []).map(s => s.toLowerCase());

  const calShareBase = { breakfast:0.25, lunch:0.40, snack:0.10, dinner:0.30, night:0.05 };
  const mealLabel = { breakfast:'ארוחת בוקר', lunch:'ארוחת צהריים', snack:'חטיף', dinner:'ארוחת ערב', night:'ארוחת לילה' };

  const totalShare = mealTimes.reduce((s, t) => s + (calShareBase[t] || 0.2), 0);
  const calShare = {};
  mealTimes.forEach(t => { calShare[t] = (calShareBase[t] || 0.2) / totalShare; });

  function macroRole(f) {
    const cal = f.cal || 1;
    const cat = (f.cat || '').toLowerCase();
    if (/ירק/.test(cat)) return 'vegetable';
    if ((f.p * 4) / cal >= 0.30) return 'protein';
    if ((f.c * 4) / cal >= 0.50) return 'carbs';
    if ((f.f * 9) / cal >= 0.40) return 'fat';
    return 'other';
  }

  function isPreferred(f) {
    const name = (f.n[0] || '').toLowerCase();
    return prefs.some(p => name.includes(p) || p.includes(name));
  }

  function sortedByPref(foods) {
    return [...foods].sort((a, b) => (isPreferred(b) ? 1 : 0) - (isPreferred(a) ? 1 : 0));
  }

  const proteins = sortedByPref(DB.filter(f => macroRole(f) === 'protein' && f.cal > 0));
  const carbs    = sortedByPref(DB.filter(f => macroRole(f) === 'carbs'   && f.cal > 0));
  const fats     = sortedByPref(DB.filter(f => macroRole(f) === 'fat'     && f.cal > 0));

  const menus = [];
  for (let m = 0; m < 3; m++) {
    let pi = m, ci = m, fi = m;
    const meals = [];
    let menuTotCal = 0, menuTotProt = 0, menuTotCarbs = 0, menuTotFat = 0;
    for (const type of mealTimes) {
      const share = calShare[type];
      const protTarget = Math.round(GOALS.protein * share);
      const carbTarget = Math.round(GOALS.carbs   * share);
      const fatTarget  = Math.round(GOALS.fat     * share);

      const pf = proteins[pi % proteins.length];
      const cf = carbs[ci % carbs.length];
      const ff = fats[fi % fats.length];
      pi++; ci++; fi++;

      const items = [];
      if (pf && pf.p > 0) {
        const grams = Math.max(30, Math.min(250, Math.round(protTarget * 100 / pf.p)));
        const r = grams / 100;
        items.push({ name: pf.n[0], grams, cal: Math.round(pf.cal * r), protein: Math.round(pf.p * r), carbs: Math.round(pf.c * r), fat: Math.round(pf.f * r) });
      }
      if (cf && cf.c > 0) {
        const grams = Math.max(30, Math.min(300, Math.round(carbTarget * 100 / cf.c)));
        const r = grams / 100;
        items.push({ name: cf.n[0], grams, cal: Math.round(cf.cal * r), protein: Math.round(cf.p * r), carbs: Math.round(cf.c * r), fat: Math.round(cf.f * r) });
      }
      if (ff && ff.f > 0) {
        const grams = Math.max(10, Math.min(100, Math.round(fatTarget * 100 / ff.f)));
        const r = grams / 100;
        items.push({ name: ff.n[0], grams, cal: Math.round(ff.cal * r), protein: Math.round(ff.p * r), carbs: Math.round(ff.c * r), fat: Math.round(ff.f * r) });
      }

      const mealCal   = items.reduce((s, it) => s + it.cal,     0);
      const mealProt  = items.reduce((s, it) => s + it.protein,  0);
      const mealCarbs = items.reduce((s, it) => s + it.carbs,    0);
      const mealFat   = items.reduce((s, it) => s + it.fat,      0);
      menuTotCal += mealCal; menuTotProt += mealProt; menuTotCarbs += mealCarbs; menuTotFat += mealFat;

      meals.push({ type, label: mealLabel[type] || type, items });
    }
    menus.push({ index: m + 1, meals, total: { cal: menuTotCal, protein: menuTotProt, carbs: menuTotCarbs, fat: menuTotFat } });
  }
  return menus;
}

let _currentMenuData = null;

function openMenuModal(idx) {
  const menus = generateDailyMenus();
  const menu = menus[idx];
  if (!menu) return;
  _currentMenuData = menu;
  document.getElementById('menu-modal-title').textContent = 'תפריט ' + menu.index;
  const body = document.getElementById('menu-modal-body');
  body.innerHTML = menu.meals.map(meal => {
    const mealCal   = meal.items.reduce((s, it) => s + it.cal,     0);
    const mealProt  = meal.items.reduce((s, it) => s + it.protein,  0);
    const mealCarbs = meal.items.reduce((s, it) => s + it.carbs,    0);
    const mealFat   = meal.items.reduce((s, it) => s + it.fat,      0);
    return `<div class="menu-meal">
      <div class="menu-meal-label">${escHtml(meal.label)}</div>
      ${meal.items.map(it => `<div class="menu-meal-item">• ${escHtml(it.name)} — ${it.grams}g (${it.cal} קל׳, חלבון ${it.protein}g, פחמ׳ ${it.carbs}g, שומן ${it.fat}g)</div>`).join('')}
      <div class="menu-meal-total">סה"כ: ${mealCal} קל׳ | חלבון ${mealProt}g | פחמ׳ ${mealCarbs}g | שומן ${mealFat}g</div>
    </div>`;
  }).join('') + (menu.total ? `<div class="menu-meal" style="background:#f0f0ff"><div class="menu-meal-label">סה״כ יומי</div><div class="menu-meal-total">${menu.total.cal} קל׳ | חלבון ${menu.total.protein}g | פחמ׳ ${menu.total.carbs}g | שומן ${menu.total.fat}g</div></div>` : '');
  document.getElementById('menu-modal-overlay').hidden = false;
}

function closeMenuModal() {
  document.getElementById('menu-modal-overlay').hidden = true;
}

function downloadMenuPDF() {
  if (!_currentMenuData) return;
  const menu = _currentMenuData;
  const html = `<!DOCTYPE html><html dir="rtl" lang="he"><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;direction:rtl;padding:24px;color:#333}h2{color:#6366f1;margin-bottom:16px;font-size:1.2rem}.meal{margin-bottom:12px;border:1px solid #ddd;border-radius:8px;padding:10px 14px}.meal-lbl{font-weight:700;color:#6366f1;margin-bottom:6px;font-size:.95rem}.meal-item{font-size:.88rem;color:#333;padding:3px 0;border-bottom:1px solid #f0f0f0}.meal-item:last-child{border:none}.meal-total{font-size:.78rem;color:#888;margin-top:6px;padding-top:4px;border-top:1px solid #f0f0f0}.footer{font-size:.78rem;color:#aaa;text-align:center;margin-top:16px}</style></head><body><h2>תפריט ${menu.index} — מירי הדיאטנית</h2>${menu.meals.map(meal=>{const t=meal.items.reduce((s,it)=>s+it.cal,0);return`<div class="meal"><div class="meal-lbl">${meal.label}</div>${meal.items.map(it=>`<div class="meal-item">• ${it.name} — ${it.grams}g (${it.cal} קל׳, חלבון ${it.protein}g, פחמ׳ ${it.carbs}g, שומן ${it.fat}g)</div>`).join('')}<div class="meal-total">סה"כ: ${t} קל׳</div></div>`}).join('')}<div class="footer">יעד יומי: ${GOALS.cal} קל׳ | מירי הדיאטנית</div></body></html>`;
  const w = window.open('', '_blank', 'width=620,height=780');
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 400);
}

function showDailyMenus() { openMenuModal(0); }

function addManualFood() {
  const inp = document.getElementById('food-input');
  const raw = inp.value.trim();
  const aiMsg = document.getElementById('ai-msg');
  const aiText = document.getElementById('ai-text');
  if (!raw && !selectedManualFood) return;
  const qtyNum = parseFloat(document.getElementById('qty-num').value);
  const unit = document.getElementById('qty-sel').value;
  if (!isPlateUnit(unit) && (!qtyNum || qtyNum <= 0)) {
    aiMsg.classList.add('show');
    aiText.textContent = 'יש להזין כמות לפני הוספת המאכל';
    return;
  }
  const food = selectedManualFood || manualFindFood(raw);
  if (!food) {
    aiMsg.classList.add('show');
    aiText.textContent = 'המאכל לא נמצא במאגר';
    return;
  }
  let grams;
  if (unit === 'גרם') grams = qtyNum;
  else if (unit === 'מ"ל' || unit === 'מיליליטר') grams = qtyNum;
  else if (unit === 'יחידות' || unit === 'יחידה' || unit === 'פרוסות' || unit === 'פרוסה') grams = qtyNum * (food.dw || 100);
  else if (unit === 'כוס' || unit === 'כוסות') grams = qtyNum * 240;
  else if (unit === 'כף' || unit === 'כפות') grams = qtyNum * 15;
  else if (unit === 'כפית' || unit === 'כפיות') grams = qtyNum * 5;
  else if (isPlateUnit(unit)) {
    const fullPlateGrams = getFullPlateGrams(food);
    const fraction = document.getElementById('plate-fraction') ? document.getElementById('plate-fraction').value : '1';
    const f = parseFloat(fraction) || 1;
    grams = fullPlateGrams * f;
  }
  else grams = qtyNum;
  const multiplier = grams / 100;
  const entry = {
    food, grams,
    cal:     Math.round(food.cal * multiplier),
    carbs:   Math.round(food.c   * multiplier * 10) / 10,
    protein: Math.round(food.p   * multiplier * 10) / 10,
    fat:     Math.round(food.f   * multiplier * 10) / 10,
    raw,
    quantityDisplay: isPlateUnit(unit) ? document.getElementById('plate-fraction').selectedOptions[0].text + " צלחת" : formatQuantityDisplay(qtyNum, unit),
  };
  selectedManualFood = null;
  _acSelected = false;
  _acSelectedFood = null;
  inp.value = '';
  _acList.style.display = 'none';
  const _qn2 = document.getElementById('qty-num');
  if (_qn2) _qn2.value = '';
  _commitFoodEntry(entry);
}

/* ─────────────────────────────────────────────────────────
   INIT
   ─────────────────────────────────────────────────────── */
render();
initVoice();
(function() {
  const isDevMobileFrame = new URLSearchParams(window.location.search).get('devMobileFrame') === '1';
  if (isDevMobileFrame) {
    document.body.classList.add('dev-mobile-frame-page');
    const devBtn = document.getElementById('dev-mobile-toggle');
    if (devBtn) devBtn.style.display = 'none';
  }
  syncDevMobileButton(false);
  const _minp = document.getElementById('food-input');
  const _qtySel = document.getElementById('qty-sel');
  if (_qtySel && !_qtySel.dataset.plateBound) {
    _qtySel.dataset.plateBound = '1';
    _qtySel.addEventListener('change', () => handleQtyUnitChange(_qtySel));
    handleQtyUnitChange(_qtySel);
  }
  buildCustomSelect('qty-unit', handleQtyUnitChange);
  buildCustomSelect('plate-fraction');
  document.addEventListener('click', closeAllCustomSelects);
  const _mbtn = document.querySelector('#manual-section .btn-go');
  if (_mbtn && !_mbtn.dataset.bound) {
    _mbtn.dataset.bound = '1';
    _mbtn.textContent = 'הוספה';
    _mbtn.removeAttribute('onclick');
    _mbtn.addEventListener('click', addFood);
  }
  const _autoBtn = document.getElementById('auto-submit-btn');
  const _autoInp = document.getElementById('auto-input');
  const _autoMic = document.getElementById('auto-mic-btn');
  if (_autoBtn && !_autoBtn.dataset.bound) {
    _autoBtn.dataset.bound = '1';
    _autoBtn.textContent = 'הוספה';
    _autoBtn.addEventListener('click', addAutoFood);
  }
  if (_autoMic && !_autoMic.dataset.bound) {
    _autoMic.dataset.bound = '1';
    _autoMic.addEventListener('click', toggleAutoVoice);
  }
  if (_autoInp && !_autoInp.dataset.bound) {
    _autoInp.dataset.bound = '1';
    _autoInp.addEventListener('keydown', e => { if (e.key === 'Enter') addAutoFood(); });
  }
})();
