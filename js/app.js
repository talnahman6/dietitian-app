function toggleHelpPopup() {
  const p = document.getElementById('help-popup');
  p.hidden = !p.hidden;
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
  } catch {}
}

const GOALS = {cal:2000,carbs:250,protein:60,fat:65};
let _showRemaining = false;

/* load calorie goal from onboarding; redirect if profile not set */
(function() {
  const d = JSON.parse(localStorage.getItem(_DIET_KEY) || '{}');
  if (!d.tdee) { window.location.href = 'onboarding.html'; return; }
  GOALS.cal = d.tdee;
})();

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
  if (log.length === 0) {
    el.innerHTML = '';
    el.appendChild(_emptyState);
    _emptyState.style.display = '';
    return;
  }
  _emptyState.style.display = 'none';
  el.innerHTML = '';
  log.forEach((e, i) => {
    const div = document.createElement('div');
    div.className = 'fi';
    div.innerHTML = `
      <div class="fi-info">
        <div class="fi-name">${escHtml(e.food.n[0])}</div>
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
const _acList = document.createElement('div');
_acList.id = 'ac-list';
_acList.className = 'ac-list';
_acList.style.display = 'none';
document.querySelector('.input-row').insertAdjacentElement('afterend', _acList);

function acSearch(val) {
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
  _acList.style.display = '';
  _acList.querySelectorAll('.ac-item').forEach(item => {
    item.addEventListener('mousedown', e => {
      e.preventDefault();
      _acInput.value = item.dataset.name;
      _acSelected = true;
      _acList.style.display = 'none';
    });
  });
}

_acInput.addEventListener('input', () => { _acSelected = false; acSearch(_acInput.value); });
_acInput.addEventListener('blur', () => setTimeout(() => { _acList.style.display = 'none'; }, 200));
_acInput.addEventListener('focus', () => { if (_acInput.value.trim().length >= 2) acSearch(_acInput.value); });

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

  /* ── Manual search (autocomplete-selected item) ── */
  if (_acSelected) {
    const qtyNum = document.getElementById('qty-num').value.trim();
    if (!qtyNum || isNaN(+qtyNum) || +qtyNum <= 0) {
      aiMsg.classList.add('show');
      aiText.textContent = 'יש להזין כמות לפני הוספת המאכל';
      return;
    }
    const qtySel = document.getElementById('qty-sel').value;
    raw = `${qtyNum} ${qtySel} ${raw}`;
    _acSelected = false;
    const result = parseFood(raw);
    if (result) { inp.value = ''; _commitFoodEntry(result); }
    return;
  }

  raw = applyQtyUnit(raw);

  /* ── Multi-food meal ── */
  const isMeal = /,/.test(raw) || /^(אכלתי|אכלת|אכל|אכלה|שתיתי|שתית)\s/.test(raw);
  if (isMeal) {
    const handled = await addMeal(raw);
    if (handled) return;
  }

  /* ── Single food: local search only ── */
  const foodText = raw.replace(/^(אכלתי|אכלת|אכל|אכלה|שתיתי|שתית)\s+/, '').trim();

  const food = findFood(foodText);
  if (!food) {
    warnBox.innerHTML = '';
    aiMsg.classList.add('show');
    aiText.textContent = `לא מצאתי "${foodText}" במאגר. נסה שם אחר.`;
    return;
  }

  if (hasExplicitQty(foodText)) {
    const result = parseFood(foodText);
    if (result) { inp.value = ''; _commitFoodEntry(result); return; }
  }

  /* No explicit quantity — ask */
  inp.value = '';
  warnBox.innerHTML = '';
  aiMsg.classList.remove('show');
  showQtyPopup(food, foodText);
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
   INIT
   ─────────────────────────────────────────────────────── */
render();
initVoice();
