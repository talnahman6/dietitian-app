function toggleHelpPopup() {
  const p = document.getElementById('help-modal-overlay');
  p.hidden = !p.hidden;
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

/* persistent reference — innerHTML clearing must not destroy it */
const _emptyState = document.getElementById('empty-state');

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
let _acSelected = false;
let _acSelectedFood = null;
let selectedManualFood = null;
let selectingAutocomplete = false;
let _acIgnoreNextInput = false;
let _acSuppress = false;
const _acList = document.createElement('div');
_acList.id = 'ac-list';
_acList.className = 'ac-list';
_acList.style.display = 'none';
document.querySelector('.input-row').insertAdjacentElement('afterend', _acList);

function closeAutocomplete() {
  _acList.style.display = 'none';
  _acList.innerHTML = '';
}

function acSearch(val) {
  if (_acSelected && selectedManualFood) { closeAutocomplete(); return; }
  const norm = s => s.toLowerCase().replace(/['"״׳]/g,'').replace(/\s+/g,' ').trim();
  const t = norm(val);
  if (t.length < 2) { _acList.style.display = 'none'; return; }
  const matches = [];
  for (const f of DB) {
    for (const n of f.n) {
      if (norm(n).startsWith(t)) {
        if (!matches.includes(f)) matches.push(f);
        break;
      }
    }
    if (matches.length >= 8) break;
  }
  if (matches.length === 0) { _acList.style.display = 'none'; return; }
  _acList.innerHTML = matches.map(f =>
    `<div class="ac-item" data-name="${escHtml(f.n[0])}">${escHtml(f.n[0])}<span class="ac-cat">${escHtml(f.cat)}</span></div>`
  ).join('');
  _acList.style.display = 'block';
  _acList.querySelectorAll('.ac-item').forEach(item => {
    item.addEventListener('mousedown', e => {
      e.preventDefault();
      selectingAutocomplete = true;
      _acInput.value = item.dataset.name;
      _acSelected = true;
      _acSelectedFood = DB.find(f => f.n && f.n.includes(item.dataset.name)) || null;
      selectedManualFood = _acSelectedFood;
      _acIgnoreNextInput = true;
      closeAutocomplete();
      _acSuppress = true;
      setTimeout(() => { selectingAutocomplete = false; _acSuppress = false; }, 300);
      requestAnimationFrame(() => {
        _acList.style.display = 'none';
        _acList.innerHTML = '';
      });
    });
  });
}

_acInput.addEventListener('input', () => { if (_acSuppress) return; if (_acIgnoreNextInput) { _acIgnoreNextInput = false; return; } if (selectingAutocomplete) return; _acSelected = false; _acSelectedFood = null; selectedManualFood = null; acSearch(_acInput.value); });
_acInput.addEventListener('blur', () => setTimeout(() => { _acList.style.display = 'none'; }, 200));
_acInput.addEventListener('focus', () => { if (_acSuppress) return; if (_acSelected || selectedManualFood) return; if (_acInput.value.trim().length >= 2) acSearch(_acInput.value); });

/* ─────────────────────────────────────────────────────────
   ADD / DELETE / CLEAR
   ─────────────────────────────────────────────────────── */

/* Prepend "1 <unit>" when qty-sel has a volume unit and text has no unit yet */
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

async function addMeal(raw) {
  const aiMsg = document.getElementById('ai-msg');
  const aiText = document.getElementById('ai-text');
  const warnBox = document.getElementById('warn-box');
  const inp = document.getElementById('food-input');

  let cleaned = raw.replace(/^(אכלתי|אכלת|אכל|אכלה|שתיתי|שתית)\s+/, '');
  const rawParts = cleaned.split(/,\s*|,/);
  const parts = [];
  for (const part of rawParts) {
    /* split "X ו-Y" Hebrew conjunction into separate items */
    const subParts = part.split(/\s+ו(?=[א-ת])/);
    for (const sp of subParts) {
      const t = sp.trim();
      if (t) parts.push(t);
    }
  }
  if (parts.length < 2) return false;

  aiMsg.classList.add('show');
  aiText.textContent = '⏳ מוסיף את כל המנות...';

  let added = 0;
  const failed = [];
  for (const part of parts) {
    const result = parseFood(part);
    if (result) { log.push(result); added++; }
    else failed.push(part);
  }
  save();
  render();

  let msg = added > 0 ? `נרשמו ${added} מנות! ` : '';
  if (failed.length > 0) msg += `לא זיהיתי: ${failed.join(', ')}`;
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
  if (!name || typeof DB === 'undefined' || !Array.isArray(DB)) return null;
  const q = name.trim().toLowerCase();
  return DB.find(f => Array.isArray(f.n) && f.n.some(s => s && s.toLowerCase() === q))
      || DB.find(f => Array.isArray(f.n) && f.n.some(s => s && s.toLowerCase().includes(q)))
      || null;
}

function _commitFoodEntry(result) {
  log.push(result);
  save();
  const msgs = [
    `נרשם! ${result.food.n[0]} (${Math.round(result.grams)}g) — ${result.cal} קלוריות, ${result.carbs}g פחמימות, ${result.protein}g חלבונים, ${result.fat}g שומנים.`,
    `מצוין! הוספתי ${result.food.n[0]}. סה"כ ${result.cal} קלוריות על ${Math.round(result.grams)} גרם. 💪`,
    `שמרתי! ${result.food.n[0]} (${Math.round(result.grams)}g) = ${result.cal} קל׳ | 🌾${result.carbs}g | 💪${result.protein}g | 🥑${result.fat}g`,
  ];
  const aiMsg  = document.getElementById('ai-msg');
  const aiText = document.getElementById('ai-text');
  aiMsg.classList.add('show');
  aiText.textContent = msgs[Math.floor(Math.random() * msgs.length)];
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
  if (_acSelected || _acSelectedFood || _isManual) {
    console.log('[manual-add] clicked add');
    console.log('[manual-add] input value:', raw);
    console.log('[manual-add] selectedManualFood:', selectedManualFood);
    console.log('[manual-add] DB length:', typeof DB !== 'undefined' ? DB.length : 'DB not defined');
    if (typeof DB === 'undefined' || !Array.isArray(DB) || DB.length === 0) {
      aiMsg.classList.add('show');
      aiText.textContent = 'מאגר המאכלים לא נטען';
      return;
    }
    const qtyNum = parseFloat(document.getElementById('qty-num').value);
    if (!qtyNum || qtyNum <= 0) {
      aiMsg.classList.add('show');
      aiText.textContent = 'יש להזין כמות לפני הוספת המאכל';
      return;
    }
    const unit = document.getElementById('qty-sel').value;
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
    else if (unit === 'צלחת') {
      const foodName = (food.name || '').trim();
      const spoonFoods = ['אורז','פסטה','פתיתים','קוסקוס','בורגול','קינואה','עדשים','שעועית','גריסים','שיבולת שועל'];
      const potatoFoods = ['תפוח אדמה','תפוחי אדמה','בטטה','סלק','קולורבי','לפת'];
      let fullPlateGrams;
      if (spoonFoods.some(s => foodName.includes(s))) {
        fullPlateGrams = 270;
      } else if (potatoFoods.some(s => foodName.includes(s))) {
        const unitWeight = foodName.includes('בטטה') ? 310 : (food.dw || 170);
        fullPlateGrams = unitWeight * 4;
      } else {
        fullPlateGrams = food.plateGrams || 300;
      }
      const fraction = document.getElementById('plate-fraction') ? document.getElementById('plate-fraction').value : 'שלם';
      if (fraction === 'רבע') grams = fullPlateGrams * 0.25;
      else if (fraction === 'שליש') grams = fullPlateGrams / 3;
      else if (fraction === 'חצי') grams = fullPlateGrams * 0.5;
      else grams = fullPlateGrams;
    }
    else grams = qtyNum;
    const plateFraction = unit === 'צלחת' && document.getElementById('plate-fraction') ? document.getElementById('plate-fraction').value : null;
    const multiplier = grams / 100;
    const entry = {
      food,
      grams,
      cal:     Math.round(food.cal * multiplier),
      carbs:   Math.round(food.c   * multiplier * 10) / 10,
      protein: Math.round(food.p   * multiplier * 10) / 10,
      fat:     Math.round(food.f   * multiplier * 10) / 10,
      raw,
      quantityDisplay: plateFraction ? plateFraction + ' צלחת' : qtyNum + " " + unit,
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
    const handled = await addMeal(raw.replace(/\n/g, ','));
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

function toggleMiriVoice() {
  if (!recognition) {
    if (!initVoice()) {
      alert('הדפדפן שלך לא תומך בהקלטה קולית. נסה Chrome.');
      return;
    }
  }
  if (isRecording) { recognition.stop(); return; }
  const chatInput = document.querySelector('.miri-chat-input');
  const chatBtn = document.querySelector('.miri-chat-voice');
  recognition.onstart = () => {
    isRecording = true;
    chatBtn.classList.add('rec');
    chatBtn.textContent = '⏹ מקליט...';
  };
  recognition.onresult = (e) => {
    let txt = '';
    for (let i = e.resultIndex; i < e.results.length; i++) txt += e.results[i][0].transcript;
    chatInput.value = txt;
  };
  recognition.onend = () => {
    isRecording = false;
    chatBtn.classList.remove('rec');
    chatBtn.textContent = '🎤';
    initVoice();
  };
  recognition.start();
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
  const expectedPct = hour / 24;
  const calPct = GOALS.cal > 0 ? t.cal / GOALS.cal : 0;
  const sentences = [];

  if (t.fat > GOALS.fat) {
    sentences.push('שמי לב — צריכת השומן עברה את היעד היומי, עדיף לבחור מאכלים דלי שומן.');
  } else if (t.carbs > GOALS.carbs) {
    sentences.push('כמות הפחמימות היום גבוהה מהיעד, כדאי להימנע ממזונות עמילניים.');
  } else if (t.cal > GOALS.cal) {
    sentences.push('עברת את יעד הקלוריות היומי — שימי לב לכמויות בשאר היום.');
  }

  if (sentences.length < 2) {
    if (t.protein < GOALS.protein * 0.5) {
      sentences.push('רמת החלבון נמוכה — נסי להוסיף מנת חלבון כמו ביצה, קוטג׳ או עוף.');
    } else if (t.protein >= GOALS.protein * 0.95) {
      sentences.push('כל הכבוד — הגעת ליעד החלבון היומי! 💪');
    }
  }

  if (sentences.length < 2) {
    if (calPct > expectedPct + 0.15) {
      sentences.push('קצב האכילה היום גבוה יחסית לשעה — שימי לב לכמויות בהמשך.');
    } else if (calPct < expectedPct - 0.15 && hour >= 8) {
      sentences.push('עדיין אכלת מעט יחסית לשעה — אל תשכחי לאכול ארוחות מסודרות.');
    } else if (sentences.length === 0) {
      sentences.push('את בדרך הנכונה היום — המשיכי כך! 🌟');
    }
  }

  return sentences.slice(0, 2).join(' ');
}

function getMiriRecommendation(excluded = []) {
  const t = totals();
  const rem = {
    cal:     Math.max(0, GOALS.cal     - t.cal),
    carbs:   Math.max(0, GOALS.carbs   - t.carbs),
    protein: Math.max(0, GOALS.protein - t.protein),
    fat:     Math.max(0, GOALS.fat     - t.fat),
  };

  if (rem.cal < 50) return 'הגעת ליעד הקלוריות שלך להיום! כל הכבוד 💪';

  const proteinLow = t.protein < GOALS.protein * 0.6;
  const fatHigh    = t.fat     > GOALS.fat     * 0.8;
  const carbsHigh  = t.carbs   > GOALS.carbs   * 0.8;

  function scoreFood(f) {
    if (!f.cal) return -1;
    const cal100 = f.cal;
    let s = 5;
    if (proteinLow) s += (f.p / cal100) * 200;
    if (fatHigh)    s -= (f.f / cal100) * 100;
    if (carbsHigh)  s -= (f.c / cal100) * 80;
    return s;
  }

  const _excSet = new Set(excluded.map(f => f.n[0]));
  const picks = DB
    .map(f => ({ f, s: scoreFood(f) }))
    .filter(x => x.s > 0 && !_excSet.has(x.f.n[0]))
    .sort((a, b) => b.s - a.s)
    .slice(0, 3);
  _lastRecommendedFoods = picks.map(x => x.f);

  if (picks.length === 0) return 'כל הכבוד — הגעת ליעדי התזונה שלך!';

  const _mf = getMiriFeedback();
  let msg = (_mf ? _mf + '\n\n' : '') + 'היי! הנה ההמלצות שלי:\n\n';
  let totCal = 0, totProt = 0, totCarbs = 0, totFat = 0;

  for (const { f } of picks) {
    const g = Math.min(Math.max(f.dw || 100, 50), 300);
    const fac = g / 100;
    const c  = Math.round(f.cal * fac);
    const p  = Math.round(f.p   * fac);
    const h  = Math.round(f.c   * fac);
    const ft = Math.round(f.f   * fac);
    msg += `• ${f.n[0]} — ${g}g (${c} קל׳, חלבון ${p}g)\n`;
    totCal += c; totProt += p; totCarbs += h; totFat += ft;
  }

  msg += `\nסה"כ: ${totCal} קל׳ | חלבון ${totProt}g | פחמימות ${totCarbs}g | שומן ${totFat}g`;
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

function miriSend() {
  const input = document.querySelector('.miri-chat-input');
  const msgs = document.getElementById('miri-chat-msgs');
  const text = input.value.trim();
  if (!text) return;

  const userDiv = document.createElement('div');
  userDiv.className = 'miri-msg miri-msg-user';
  userDiv.textContent = text;
  msgs.appendChild(userDiv);

  const replyDiv = document.createElement('div');
  replyDiv.className = 'miri-msg miri-msg-bot';
  replyDiv.textContent = 'אני מחשבת את הנתונים שלך...';
  msgs.appendChild(replyDiv);

  msgs.scrollTop = msgs.scrollHeight;
  input.value = '';

  const isRecommendRequest = /המלצ|מה לאכול|מה כדאי|תמליצ|מה אפשר|תציעי|תציע|מה עוד|מה נשאר/.test(text);

  const isRejection = /לא בא לי|לא רוצה|לא אוהב|אין לי|תחליף|בלי/.test(text);

  if (isRejection && _lastRecommendedFoods.length > 0) {
    replyDiv.textContent = _handleRejection(text);
  } else if (isRecommendRequest) {
    _rejectedFoods = [];
    replyDiv.textContent = getMiriRecommendation();
  } else {
    const t = totals();
    const rem = {
      cal:     Math.max(0, Math.round(GOALS.cal     - t.cal)),
      protein: Math.max(0, Math.round(GOALS.protein - t.protein)),
      fat:     Math.max(0, Math.round(GOALS.fat     - t.fat)),
    };

    let reply = `קלוריות: ${Math.round(t.cal)} מתוך ${GOALS.cal} — נשאר לך ${rem.cal} קל׳.\n`;
    reply += `חלבונים: ${Math.round(t.protein)}g מתוך ${GOALS.protein}g — נשאר ${rem.protein}g.\n`;
    reply += `שומנים: ${Math.round(t.fat)}g מתוך ${GOALS.fat}g.`;

    if (t.fat > GOALS.fat * 0.85) reply += '\n⚠️ שימי לב — צריכת השומן גבוהה.';
    if (t.protein < GOALS.protein * 0.5) reply += '\n💪 כדאי להוסיף מקור חלבון.';

    replyDiv.textContent = reply;
  }

  msgs.scrollTop = msgs.scrollHeight;
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
  if (!qtyNum || qtyNum <= 0) {
    aiMsg.classList.add('show');
    aiText.textContent = 'יש להזין כמות לפני הוספת המאכל';
    return;
  }
  const unit = document.getElementById('qty-sel').value;
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
  else grams = qtyNum;
  const multiplier = grams / 100;
  const entry = {
    food, grams,
    cal:     Math.round(food.cal * multiplier),
    carbs:   Math.round(food.c   * multiplier * 10) / 10,
    protein: Math.round(food.p   * multiplier * 10) / 10,
    fat:     Math.round(food.f   * multiplier * 10) / 10,
    raw,
    quantityDisplay: qtyNum + " " + unit,
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
  const _minp = document.getElementById('food-input');
  const _mbtn = document.querySelector('#manual-section .btn-go');
  if (_mbtn && !_mbtn.dataset.bound) {
    _mbtn.dataset.bound = '1';
    _mbtn.textContent = 'הוספה';
    _mbtn.removeAttribute('onclick');
    _mbtn.addEventListener('click', addFood);
  }
})();
