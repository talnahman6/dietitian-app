function toggleHelpPopup() {
  const p = document.getElementById('help-modal-overlay');
  p.hidden = !p.hidden;
}

function showCustomFoodHelp() {
  showAutoMissingQty(null, null, null, '׳”׳•׳¡׳£ ׳׳׳›׳ ׳©׳׳ ׳׳¦׳׳× ׳‘׳¨׳©׳™׳׳”.');
}

function openCustomFoodModal() {
  const modal = document.getElementById('custom-food-modal');
  if (!modal) return;
  modal.hidden = false;
  toggleCustomFoodGrams();
}

function closeCustomFoodModal() {
  const modal = document.getElementById('custom-food-modal');
  if (modal) modal.hidden = true;
}

function toggleCustomFoodGrams() {
  const serving = document.getElementById('custom-food-serving');
  const grams = document.getElementById('custom-food-grams');
  if (!serving || !grams) return;
  grams.style.display = serving.value === 'custom' ? '' : 'none';
}

function toggleCustomFoodServingList() {
  const list = document.getElementById('custom-food-serving-list');
  if (list) list.style.display = list.style.display === 'none' ? 'block' : 'none';
}

function selectCustomFoodServing(value, label) {
  const input = document.getElementById('custom-food-serving');
  const btn = document.getElementById('custom-food-serving-btn');
  const list = document.getElementById('custom-food-serving-list');
  if (input) input.value = value;
  if (btn) btn.textContent = label;
  if (list) list.style.display = 'none';
  toggleCustomFoodGrams();
}

async function saveCustomFood() {
  const name = document.getElementById('custom-food-name').value.trim();
  const serving = document.getElementById('custom-food-serving').value;
  const gramsByServing = { '100': 100, small: 80, medium: 120, large: 180 };
  const grams = serving === 'custom'
    ? parseFloat(document.getElementById('custom-food-grams').value)
    : gramsByServing[serving];
  const cal = parseFloat(document.getElementById('custom-food-cal').value);
  const carbs = parseFloat(document.getElementById('custom-food-carbs').value);
  const protein = parseFloat(document.getElementById('custom-food-protein').value);
  const fat = parseFloat(document.getElementById('custom-food-fat').value);
  if (!name || !grams || grams <= 0 || [cal, carbs, protein, fat].some(v => Number.isNaN(v) || v < 0)) {
    showAutoMissingQty(null, null, null, '׳™׳© ׳׳׳׳ ׳©׳ ׳׳׳›׳ ׳•׳›׳ ׳”׳¢׳¨׳›׳™׳ ׳”׳×׳–׳•׳ ׳×׳™׳™׳.');
    return;
  }
  const factor = 100 / grams;
  const food = {
    n: [name],
    cat: '׳׳׳›׳׳™׳ ׳©׳”׳•׳¡׳₪׳•',
    cal: round1(cal * factor),
    c: round1(carbs * factor),
    p: round1(protein * factor),
    f: round1(fat * factor),
    dw: Math.round(grams),
    custom: true
  };
  const latest = await getSupabaseCustomFoods();
  const foods = mergeCustomFoods([food].concat(latest.filter(item => !(item.n && item.n.includes(name)))));
  const savedRemote = await saveSupabaseCustomFoods(foods);
  ['custom-food-name','custom-food-grams','custom-food-cal','custom-food-carbs','custom-food-protein','custom-food-fat'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  closeCustomFoodModal();
  showAutoMissingQty(null, null, null, savedRemote ? '׳”׳׳׳›׳ ׳ ׳•׳¡׳£ ׳׳׳׳’׳¨ ׳•׳ ׳׳¦׳ ׳‘׳—׳™׳₪׳•׳© ׳׳¦׳ ׳›׳•׳׳.' : '׳”׳׳׳›׳ ׳ ׳•׳¡׳£ ׳‘׳׳›׳©׳™׳¨ ׳”׳–׳”. ׳©׳׳™׳¨׳” ׳-Supabase ׳ ׳›׳©׳׳”.');
}

function setSearchMode(mode) {
  const isManual = mode === 'manual';
  document.getElementById('manual-section').style.display = isManual ? '' : 'none';
  document.getElementById('auto-section').style.display = isManual ? 'none' : '';
  document.getElementById('toggle-manual').classList.toggle('stgl-active', isManual);
  document.getElementById('toggle-auto').classList.toggle('stgl-active', !isManual);
  moveMealSelectToMode(mode);
}

/* ג”€ג”€ג”€ AUTH GATE ג”€ג”€ג”€ */
requireAuth();
const _currentUser = getLoggedUser();
document.getElementById('user-name').textContent = '׳©׳׳•׳, ' + ((_currentUser.fullName || '').trim().split(/\s+/)[0] || '');

/* inject avatar into AI message mini icon only */
document.getElementById('mini-av').innerHTML = AVATAR_SVG;

/* ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€
   STATE + STORAGE
   ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ */
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
const CUSTOM_FOODS_KEY = 'miri_custom_foods_v1';
const GLOBAL_CUSTOM_FOODS_USER = '__global_custom_foods__';

function round1(v) {
  return Math.round(v * 10) / 10;
}

function getCustomFoods() {
  try { return JSON.parse(localStorage.getItem(CUSTOM_FOODS_KEY) || '[]'); }
  catch { return []; }
}

function loadCustomFoods() {
  if (typeof DB === 'undefined' || !Array.isArray(DB)) return;
  getCustomFoods().forEach(food => {
    addCustomFoodToDb(food);
  });
}

function addCustomFoodToDb(food) {
  if (typeof DB === 'undefined' || !Array.isArray(DB)) return;
  const name = food && food.n && food.n[0];
  if (!name) return;
  const existing = DB.findIndex(item => item.n && item.n.includes(name));
  if (existing >= 0) DB.splice(existing, 1);
  DB.unshift(food);
}

function mergeCustomFoods(foods) {
  const current = getCustomFoods();
  const byName = new Map();
  current.concat(foods || []).forEach(food => {
    const name = food && food.n && food.n[0];
    if (name) byName.set(name, food);
  });
  const merged = Array.from(byName.values());
  localStorage.setItem(CUSTOM_FOODS_KEY, JSON.stringify(merged));
  merged.forEach(addCustomFoodToDb);
  return merged;
}

async function loadSupabaseCustomFoods() {
  const foods = await getSupabaseCustomFoods();
  if (foods.length) mergeCustomFoods(foods);
}

async function getSupabaseCustomFoods() {
  if (typeof _sbReady === 'undefined') return [];
  const sb = await _sbReady;
  if (!sb) return [];
  try {
    const { data, error } = await sb
      .from('user_data')
      .select('diet_log')
      .eq('username', GLOBAL_CUSTOM_FOODS_USER)
      .maybeSingle();
    if (error || !data || !data.diet_log) return [];
    return data.diet_log.custom_foods || [];
  } catch (err) {
    console.error('Supabase load custom foods:', err);
    return [];
  }
}

async function saveSupabaseCustomFoods(foods) {
  if (typeof _sbReady === 'undefined') return false;
  const sb = await _sbReady;
  if (!sb) return false;
  try {
    const { error } = await sb.from('user_data').upsert({
      username: GLOBAL_CUSTOM_FOODS_USER,
      updated_at: new Date().toISOString(),
      diet_log: { custom_foods: foods }
    }, { onConflict: 'username' });
    if (error) {
      console.error('Supabase save custom foods:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase save custom foods:', err);
    return false;
  }
}

loadCustomFoods();
loadSupabaseCustomFoods();
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
    else if (d.goal === 'gain' || d.goal === '׳¢׳׳™׳™׳” ׳‘׳׳¡׳”') cal = d.tdee + dailyDelta;
  }
  d.dailyCal = cal;
  localStorage.setItem(_DIET_KEY, JSON.stringify(d));
  GOALS.cal     = cal;
  GOALS.protein = Math.round(cal * 0.30 / 4 * 10) / 10;
  GOALS.carbs   = Math.round(cal * 0.40 / 4 * 10) / 10;
  GOALS.fat     = Math.round(cal * 0.30 / 9 * 10) / 10;
  if (typeof saveUserData === 'function') saveUserData(_currentUser.username);
  setMiriGenderUi();
  render();
  showMenuPage(0);
}
_initGoals();

function totals() {
  return log.reduce((a,e)=>({
    cal: a.cal+e.cal, carbs: a.carbs+e.carbs,
    protein: a.protein+e.protein, fat: a.fat+e.fat
  }), {cal:0,carbs:0,protein:0,fat:0});
}

/* ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€
   RENDER
   ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ */
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
    document.getElementById('pt-cal').textContent = r.cal+" ׳§׳'";
    document.getElementById('pt-crb').textContent = r.carbs+'g';
    document.getElementById('pt-prt').textContent = r.protein+'g';
    document.getElementById('pt-fat').textContent = r.fat+'g';
  } else {
    document.getElementById('pt-cal').textContent = Math.round(t.cal)+' / '+GOALS.cal+" ׳§׳'";
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
  renderMealGroups(el);
  return;
  log.forEach((e, i) => {
    const div = document.createElement('div');
    div.className = 'fi';
    div.innerHTML = `
      <div class="fi-info">
        <div class="fi-name">${escHtml(e.food.n[0])}${e.quantityDisplay ? ' - ' + escHtml(e.quantityDisplay) : ''}</div>
        <div class="fi-qty">${Math.round(e.grams)}g ֲ· ${escHtml(e.food.cat)}</div>
      </div>
      <div class="fi-nutrients">
        <div class="nb c"><span class="nb-v">${e.cal}</span><span class="nb-l">׳§׳׳•׳¨׳™׳•׳×</span></div>
        <div class="nb h"><span class="nb-v">${e.carbs}g</span><span class="nb-l">׳₪׳—׳׳™׳׳•׳×</span></div>
        <div class="nb p"><span class="nb-v">${e.protein}g</span><span class="nb-l">׳—׳׳‘׳•׳ ׳™׳</span></div>
        <div class="nb f"><span class="nb-v">${e.fat}g</span><span class="nb-l">׳©׳•׳׳ ׳™׳</span></div>
      </div>
      <button class="btn-del" onclick="deleteItem(${i})" title="׳׳—׳§">ג•</button>`;
    el.appendChild(div);
  });
}

function renderMealGroups(el) {
  const meals = [
    ['breakfast', '׳׳¨׳•׳—׳× ׳‘׳•׳§׳¨'],
    ['lunch', '׳׳¨׳•׳—׳× ׳¦׳”׳¨׳™׳™׳'],
    ['snack', '׳׳¨׳•׳—׳× ׳‘׳™׳ ׳™׳™׳'],
    ['dinner', '׳׳¨׳•׳—׳× ׳¢׳¨׳‘'],
    ['night', '׳׳¨׳•׳—׳× ׳׳™׳׳”'],
    ['none', '׳׳׳ ׳©׳™׳•׳']
  ];
  meals.forEach(([meal, title]) => {
    const items = log.map((entry, index) => ({ entry, index })).filter(item => (item.entry.mealType || 'none') === meal);
    if (!items.length) return;
    const group = document.createElement('div');
    group.className = 'meal-group';
    group.innerHTML = `<div class="meal-group-title">${title}</div>`;
    items.forEach(({ entry: e, index: i }) => {
      const div = document.createElement('div');
      div.className = 'fi';
      div.innerHTML = `
        <div class="fi-info">
          <div class="fi-name">${escHtml(e.food.n[0])}${e.quantityDisplay ? ' - ' + escHtml(e.quantityDisplay) : ''}</div>
        </div>
        <div class="fi-qty">${Math.round(e.grams)} ׳’׳¨׳</div>
        <button class="btn-del" onclick="deleteItem(${i})" title="׳׳—׳§">ג•</button>`;
      group.appendChild(div);
    });
    el.appendChild(group);
  });
}

function getSelectedMealType() {
  return document.getElementById('meal-type')?.value || '';
}

function requireMealType() {
  const mealType = getSelectedMealType();
  if (mealType) return mealType;
  const aiMsg = document.getElementById('ai-msg');
  const aiText = document.getElementById('ai-text');
  const warnBox = document.getElementById('warn-box');
  showAutoMissingQty(aiMsg, aiText, warnBox, '׳™׳© ׳׳‘׳—׳•׳¨ ׳¡׳•׳’ ׳׳¨׳•׳—׳” ׳׳₪׳ ׳™ ׳”׳•׳¡׳₪׳× ׳”׳׳׳›׳');
  return '';
}

function moveMealSelectToMode(mode) {
  const ui = document.getElementById('meal-type-ui');
  const target = mode === 'auto' ? document.getElementById('auto-meal-anchor') : document.getElementById('qty-num');
  if (ui && target) target.insertAdjacentElement(mode === 'auto' ? 'afterend' : 'beforebegin', ui);
}

function escHtml(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}

function _safeDietData() {
  try { return JSON.parse(localStorage.getItem(_DIET_KEY) || '{}'); }
  catch { return {}; }
}

function updateProfileView() {
  const d = _safeDietData();
  const firstName = ((_currentUser.fullName || '').trim().split(/\s+/)[0] || '-');
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val || '-';
  };
  set('profile-name', firstName);
  set('profile-language', d.language || '׳¢׳‘׳¨׳™׳×');
  set('profile-calories', GOALS.cal ? `${GOALS.cal} ׳§׳׳³` : '-');
  set('profile-water', `${getWaterTarget()} ׳›׳•׳¡׳•׳×`);
  renderWaterWidget();
  renderStepsWidget();
  applyLanguage(d.language || '׳¢׳‘׳¨׳™׳×');
}

function openProfileModal(title, bodyHtml) {
  const modal = document.getElementById('profile-modal');
  document.getElementById('profile-modal-title').textContent = title;
  document.getElementById('profile-modal-body').innerHTML = bodyHtml;
  modal.hidden = false;
}
function closeProfileModal(){ document.getElementById('profile-modal').hidden = true; }

function openProfileNameModal() {
  const first = ((_currentUser.fullName || '').trim().split(/\s+/)[0] || '');
  openProfileModal('׳©׳ ׳׳©׳×׳׳©', `
    <input class="custom-food-field" id="profile-new-name" value="${escHtml(first)}" placeholder="׳©׳ ׳₪׳¨׳˜׳™">
    <div class="profile-modal-actions"><button class="custom-food-save" onclick="saveProfileName()">׳©׳׳™׳¨׳”</button><button class="custom-food-cancel" onclick="closeProfileModal()">׳‘׳™׳˜׳•׳</button></div>`);
}
function saveProfileName() {
  const name = document.getElementById('profile-new-name').value.trim();
  if (!name) return;
  _currentUser.fullName = name;
  localStorage.setItem('loggedUser', JSON.stringify(_currentUser));
  sessionStorage.setItem('loggedUser', JSON.stringify(_currentUser));
  document.getElementById('user-name').textContent = '׳©׳׳•׳, ' + name.split(/\s+/)[0];
  updateProfileView();
  closeProfileModal();
}
function openPasswordModal() {
  openProfileModal('׳©׳™׳ ׳•׳™ ׳¡׳™׳¡׳׳', `
    <input class="custom-food-field" id="old-pass" type="password" placeholder="׳¡׳™׳¡׳׳” ׳™׳©׳ ׳”">
    <input class="custom-food-field" id="new-pass" type="password" placeholder="׳¡׳™׳¡׳׳” ׳—׳“׳©׳”">
    <button class="forgot-password-btn" onclick="window.location.href='login.html?forgot=1'">׳©׳›׳—׳×׳™ ׳¡׳™׳¡׳׳</button>
    <div class="profile-modal-actions"><button class="custom-food-save" onclick="savePasswordChange()">׳©׳׳™׳¨׳”</button><button class="custom-food-cancel" onclick="closeProfileModal()">׳‘׳™׳˜׳•׳</button></div>`);
}
function savePasswordChange() {
  const oldPass = document.getElementById('old-pass').value;
  const newPass = document.getElementById('new-pass').value;
  if (!newPass || (_currentUser.password && oldPass !== _currentUser.password)) {
    showAutoMissingQty(null, null, null, '׳”׳¡׳™׳¡׳׳” ׳”׳™׳©׳ ׳” ׳׳ ׳ ׳›׳•׳ ׳” ׳׳• ׳©׳—׳¡׳¨׳” ׳¡׳™׳¡׳׳” ׳—׳“׳©׳”.');
    return;
  }
  _currentUser.password = newPass;
  localStorage.setItem('loggedUser', JSON.stringify(_currentUser));
  closeProfileModal();
}
function openLanguageModal() {
  const d = _safeDietData();
  openProfileModal('׳©׳₪׳•׳×', `
    <div class="custom-select-wrap">
      <button type="button" class="custom-select-btn" id="profile-lang-btn" onclick="toggleProfileLangList()">${d.language || '׳¢׳‘׳¨׳™׳×'}</button>
      <div class="custom-select-list" id="profile-lang-list" style="display:none">
        ${['׳¢׳‘׳¨׳™׳×','English','׀ ׁƒׁׁ׀÷׀¸׀¹'].map(x => `<div class="custom-select-item" onclick="selectProfileLang('${x}')">${x}</div>`).join('')}
      </div>
      <input type="hidden" id="profile-lang" value="${d.language || '׳¢׳‘׳¨׳™׳×'}">
    </div>
    <div class="profile-modal-actions"><button class="custom-food-save" onclick="saveLanguage()">׳©׳׳™׳¨׳”</button><button class="custom-food-cancel" onclick="closeProfileModal()">׳‘׳™׳˜׳•׳</button></div>`);
}
function toggleProfileLangList() {
  const list = document.getElementById('profile-lang-list');
  if (list) list.style.display = list.style.display === 'none' ? 'block' : 'none';
}
function selectProfileLang(lang) {
  document.getElementById('profile-lang').value = lang;
  document.getElementById('profile-lang-btn').textContent = lang;
  document.getElementById('profile-lang-list').style.display = 'none';
}
function saveLanguage() {
  const d = _safeDietData();
  d.language = document.getElementById('profile-lang').value;
  localStorage.setItem(_DIET_KEY, JSON.stringify(d));
  save();
  applyLanguage(d.language);
  updateProfileView();
  closeProfileModal();
}
function applyLanguage(lang) {
  const isHeb = !lang || lang === '׳¢׳‘׳¨׳™׳×';
  document.documentElement.lang = lang === 'English' ? 'en' : lang === '׀ ׁƒׁׁ׀÷׀¸׀¹' ? 'ru' : 'he';
  document.documentElement.dir = isHeb ? 'rtl' : 'ltr';
  const dict = {
    English: { home:'Home', menus:'Menus', journal:'My diary', profile:'Profile', add:'Add', water:'Water', steps:'Steps' },
    '׀ ׁƒׁׁ׀÷׀¸׀¹': { home:'׀“׀»׀°׀²׀½׀°ׁ', menus:'׀׀µ׀½ׁ', journal:'׀”׀½׀µ׀²׀½׀¸׀÷', profile:'׀ׁ€׀¾ׁ„׀¸׀»ׁ', add:'׀”׀¾׀±׀°׀²׀¸ׁ‚ׁ', water:'׀’׀¾׀´׀°', steps:'׀¨׀°׀³׀¸' },
    '׳¢׳‘׳¨׳™׳×': { home:'׳¨׳׳©׳™', menus:'׳×׳₪׳¨׳™׳˜׳™׳', journal:'׳”׳™׳•׳׳ ׳©׳׳™', profile:'׳׳–׳•׳¨ ׳׳™׳©׳™', add:'׳”׳•׳¡׳₪׳”', water:'׳׳™׳', steps:'׳¦׳¢׳“׳™׳' }
  }[lang || '׳¢׳‘׳¨׳™׳×'];
  const tabs = document.querySelectorAll('.bn-tab span:last-child');
  if (tabs[0]) tabs[0].textContent = dict.home;
  if (tabs[1]) tabs[1].textContent = dict.menus;
  if (tabs[2]) tabs[2].textContent = dict.journal;
  if (tabs[3]) tabs[3].textContent = dict.profile;
  document.querySelectorAll('.btn-go').forEach(btn => { if (btn.textContent.trim() === '׳”׳•׳¡׳₪׳”') btn.textContent = dict.add; });
  const water = document.querySelector('.water-card strong'); if (water) water.textContent = dict.water;
  const steps = document.querySelector('.steps-card strong'); if (steps) steps.textContent = dict.steps;
}
function openBmrModal() {
  const d = _safeDietData();
  openProfileModal('׳—׳™׳©׳•׳‘ BMR ׳׳—׳“׳©', `
    <div class="field-row"><label>׳’׳™׳</label><input class="custom-food-field" id="bmr-age" type="number" placeholder="׳’׳™׳" value="${d.age || ''}"></div>
    <div class="field-row"><label>׳’׳•׳‘׳”</label><input class="custom-food-field" id="bmr-height" type="number" placeholder="׳’׳•׳‘׳”" value="${d.height || ''}"></div>
    <div class="field-row"><label>׳׳©׳§׳</label><input class="custom-food-field" id="bmr-weight" type="number" placeholder="׳׳©׳§׳" value="${d.weight || ''}"></div>
    <div class="field-row"><label>׳™׳¢׳“</label><div class="custom-select-wrap"><button type="button" class="custom-select-btn" id="bmr-goal-btn" onclick="toggleBmrGoalList()">${d.goal === 'gain' ? '׳¢׳׳™׳™׳” ׳‘׳׳¡׳”' : d.goal === 'maintain' ? '׳׳©׳׳•׳¨ ׳¢׳ ׳”׳׳©׳§׳' : '׳™׳¨׳™׳“׳” ׳‘׳׳©׳§׳'}</button><div class="custom-select-list" id="bmr-goal-list" style="display:none"><div class="custom-select-item" onclick="selectBmrGoal('loss','׳™׳¨׳™׳“׳” ׳‘׳׳©׳§׳')">׳™׳¨׳™׳“׳” ׳‘׳׳©׳§׳</div><div class="custom-select-item" onclick="selectBmrGoal('lean','׳׳”׳×׳—׳˜׳‘')">׳׳”׳×׳—׳˜׳‘</div><div class="custom-select-item" onclick="selectBmrGoal('gain','׳¢׳׳™׳™׳” ׳‘׳׳¡׳”')">׳¢׳׳™׳™׳” ׳‘׳׳¡׳”</div><div class="custom-select-item" onclick="selectBmrGoal('maintain','׳׳©׳׳•׳¨ ׳¢׳ ׳”׳׳©׳§׳')">׳׳©׳׳•׳¨ ׳¢׳ ׳”׳׳©׳§׳</div></div><input type="hidden" id="bmr-goal" value="${d.goal || 'loss'}"></div></div>
    <div class="field-row"><label id="bmr-target-label">׳™׳¢׳“ ׳™׳¨׳™׳“׳”</label><input class="custom-food-field" id="bmr-target" type="number" step="0.1" placeholder="׳§׳´׳’" value="${Math.abs(d.totalGoalKg || d.targetKg || 0) || ''}"></div>
    <div class="field-row"><label>׳×׳•׳ ׳›׳׳” ׳–׳׳?</label><input class="custom-food-field" id="bmr-time" type="number" placeholder="0" value="${d.targetTimeAmount || d.goalMonths || ''}"></div>
    <div class="field-row"><label>׳™׳—׳™׳“׳”</label><div class="custom-select-wrap"><button type="button" class="custom-select-btn" id="bmr-time-unit-btn" onclick="toggleBmrTimeList()">${d.targetTimeUnit || '׳—׳•׳“׳©׳™׳'}</button><div class="custom-select-list" id="bmr-time-unit-list" style="display:none"><div class="custom-select-item" onclick="selectBmrTimeUnit('׳™׳׳™׳')">׳™׳׳™׳</div><div class="custom-select-item" onclick="selectBmrTimeUnit('׳©׳‘׳•׳¢׳•׳×')">׳©׳‘׳•׳¢׳•׳×</div><div class="custom-select-item" onclick="selectBmrTimeUnit('׳—׳•׳“׳©׳™׳')">׳—׳•׳“׳©׳™׳</div></div><input type="hidden" id="bmr-time-unit" value="${d.targetTimeUnit || '׳—׳•׳“׳©׳™׳'}"></div></div>
    <div class="profile-modal-actions"><button class="custom-food-save" onclick="saveBmrUpdate()">׳—׳©׳‘</button><button class="custom-food-cancel" onclick="closeProfileModal()">׳‘׳™׳˜׳•׳</button></div>`);
  selectBmrGoal(document.getElementById('bmr-goal').value, document.getElementById('bmr-goal-btn').textContent, true);
}
function toggleBmrGoalList(){ const el=document.getElementById('bmr-goal-list'); if(el) el.style.display=el.style.display==='none'?'block':'none'; }
function selectBmrGoal(value, label, keepOpen) {
  document.getElementById('bmr-goal').value = value;
  document.getElementById('bmr-goal-btn').textContent = label;
  const targetLabel = document.getElementById('bmr-target-label');
  if (targetLabel) targetLabel.textContent = value === 'gain' ? '׳™׳¢׳“ ׳¢׳׳™׳”' : '׳™׳¢׳“ ׳™׳¨׳™׳“׳”';
  const target = document.getElementById('bmr-target');
  if (target) target.parentElement.style.display = value === 'maintain' ? 'none' : 'grid';
  const list = document.getElementById('bmr-goal-list');
  if (list && !keepOpen) list.style.display = 'none';
}
function toggleBmrTimeList(){ const el=document.getElementById('bmr-time-unit-list'); if(el) el.style.display=el.style.display==='none'?'block':'none'; }
function selectBmrTimeUnit(unit){ document.getElementById('bmr-time-unit').value=unit; document.getElementById('bmr-time-unit-btn').textContent=unit; document.getElementById('bmr-time-unit-list').style.display='none'; }
function saveBmrUpdate() {
  const d = _safeDietData();
  d.age = parseFloat(document.getElementById('bmr-age').value) || d.age;
  d.height = parseFloat(document.getElementById('bmr-height').value) || d.height;
  d.weight = parseFloat(document.getElementById('bmr-weight').value) || d.weight;
  d.goal = document.getElementById('bmr-goal').value;
  d.targetKg = parseFloat(document.getElementById('bmr-target').value) || 0;
  d.targetTimeAmount = parseFloat(document.getElementById('bmr-time').value) || 1;
  d.targetTimeUnit = document.getElementById('bmr-time-unit').value;
  const days = d.targetTimeUnit === '׳™׳׳™׳' ? d.targetTimeAmount : d.targetTimeUnit === '׳©׳‘׳•׳¢׳•׳×' ? d.targetTimeAmount * 7 : d.targetTimeAmount * 30;
  const bmr = Math.round(((d.gender === '׳ ׳§׳‘׳”' ? 10 * d.weight + 6.25 * d.height - 5 * d.age - 161 : 10 * d.weight + 6.25 * d.height - 5 * d.age + 5) || 0));
  const tdee = Math.round(bmr * (parseFloat(d.activity) || 1.375));
  const dailyDelta = d.goal === 'maintain' ? 0 : Math.round((7500 * d.targetKg) / Math.max(1, days));
  GOALS.cal = d.goal === 'gain' ? tdee + dailyDelta : d.goal === 'maintain' ? tdee : tdee - dailyDelta;
  GOALS.protein = round1(GOALS.cal * 0.30 / 4);
  GOALS.carbs = round1(GOALS.cal * 0.40 / 4);
  GOALS.fat = round1(GOALS.cal * 0.30 / 9);
  d.bmr = bmr; d.tdee = tdee;
  d.dailyCal = GOALS.cal; d.protein = GOALS.protein; d.carbs = GOALS.carbs; d.fat = GOALS.fat;
  localStorage.setItem(_DIET_KEY, JSON.stringify(d));
  save();
  render();
  updateProfileView();
  showAutoMissingQty(null, null, null, `BMR: ${bmr} | ׳×׳—׳–׳•׳§׳”: ${tdee} | ׳™׳¢׳“ ׳™׳•׳׳™: ${GOALS.cal} ׳§׳׳³`);
  closeProfileModal();
}
function getWaterTarget(){ return parseInt(_safeDietData().waterTarget || localStorage.getItem('miri_water_target') || '8', 10); }
function getWaterCount(){ return parseInt(localStorage.getItem('miri_water_' + TODAY) || '0', 10); }
function renderWaterWidget() {
  const target = Math.max(1, getWaterTarget());
  const count = getWaterCount();
  const wc = document.getElementById('water-count'), wt = document.getElementById('water-target'), wf = document.getElementById('water-fill');
  if (wc) wc.textContent = count;
  if (wt) wt.textContent = target;
  if (wf) wf.style.width = Math.min(100, (count / target) * 100) + '%';
}
function openWaterTargetModal() {
  openProfileModal('׳׳˜׳¨׳× ׳׳™׳', `
    <input class="custom-food-field" id="water-target-input" type="number" min="1" value="${getWaterTarget()}" placeholder="׳›׳׳•׳× ׳›׳•׳¡׳•׳×">
    <div class="profile-modal-actions"><button class="custom-food-save" onclick="saveWaterTarget()">׳©׳׳™׳¨׳”</button><button class="custom-food-cancel" onclick="closeProfileModal()">׳‘׳™׳˜׳•׳</button></div>`);
}
function saveWaterTarget() {
  const target = Math.max(1, parseInt(document.getElementById('water-target-input').value || '8', 10));
  const d = _safeDietData();
  d.waterTarget = target;
  localStorage.setItem(_DIET_KEY, JSON.stringify(d));
  localStorage.setItem('miri_water_target', String(target));
  save();
  updateProfileView();
  closeProfileModal();
}
function openWaterModal(){ document.getElementById('water-modal').hidden = false; }
function closeWaterModal(){ document.getElementById('water-modal').hidden = true; }
function addWaterCup() {
  localStorage.setItem('miri_water_' + TODAY, String(getWaterCount() + 1));
  renderWaterWidget();
  closeWaterModal();
}
function removeWaterCup() {
  localStorage.setItem('miri_water_' + TODAY, String(Math.max(0, getWaterCount() - 1)));
  renderWaterWidget();
  closeWaterModal();
}
function renderStepsWidget() {
  const el = document.getElementById('steps-count');
  if (el) el.textContent = localStorage.getItem('miri_steps_' + TODAY) || '0';
}
function openStepsModal(){ document.getElementById('steps-modal').hidden = false; }
function closeStepsModal(){ document.getElementById('steps-modal').hidden = true; }
function saveManualSteps() {
  const v = Math.max(0, parseInt(document.getElementById('steps-manual-input').value || '0', 10));
  localStorage.setItem('miri_steps_' + TODAY, String(v));
  renderStepsWidget();
  closeStepsModal();
}

function updateJournalDate() {
  const el = document.getElementById('journal-date');
  const now = new Date();
  if (el) el.textContent = now.toLocaleDateString('he-IL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const monthEl = document.getElementById('journal-month');
  const dayEl = document.getElementById('journal-day');
  const monthName = now.toLocaleDateString('he-IL', { month: 'long' }).replace(/^׳‘/, '');
  if (monthEl) monthEl.textContent = monthName;
  if (dayEl) dayEl.textContent = now.getDate();
  const navMonth = document.getElementById('bn-calendar-month');
  const navDay = document.getElementById('bn-calendar-day');
  if (navMonth) navMonth.textContent = monthName;
  if (navDay) navDay.textContent = now.getDate();
}
updateJournalDate();

function moveSearchToView(viewName) {
  const search = document.querySelector('.input-area');
  const target = document.getElementById(viewName === 'journal' ? 'journal-search-anchor' : 'home-search-anchor');
  if (search && target) target.insertAdjacentElement('afterend', search);
}

function showView(viewName) {
  document.querySelectorAll('.app-view').forEach(view => {
    view.classList.toggle('active', view.id === `view-${viewName}`);
  });
  document.querySelectorAll('.bn-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === viewName);
  });
  moveSearchToView(viewName);
  if (viewName === 'journal') updateJournalDate();
  if (viewName === 'menus') showMenuPage(0);
  if (viewName === 'profile') updateProfileView();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€
   AUTO-COMPLETE
   ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ */
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
  const norm = s => s.toLowerCase().replace(/['"׳´׳³]/g,'').replace(/\s+/g,' ').trim();
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

/* ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€
   ADD / DELETE / CLEAR
   ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ */

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
  return unit === 'plate' || unit === '׳¦׳׳—׳×';
}

function getFullPlateGrams(food) {
  const foodText = ((food.n || []).join(' ') + ' ' + (food.cat || '')).trim();
  const cat = food.cat || '';

  if (food.plateGrams) return food.plateGrams;
  if (/(׳—׳–׳” ׳¢׳•׳£|׳¢׳•׳£|׳”׳•׳“׳•|׳‘׳©׳¨|׳“׳’|׳¡׳׳׳•׳|׳˜׳•׳ ׳”|׳˜׳•׳₪׳•|׳‘׳™׳¦׳”|׳§׳¦׳™׳¦׳”|׳©׳ ׳™׳¦׳)/.test(foodText) || /׳‘׳©׳¨|׳“׳’׳™׳|׳—׳׳‘׳•׳/.test(cat)) return 180;
  if (/(׳׳•׳¨׳–|׳₪׳¡׳˜׳”|׳₪׳×׳™׳×׳™׳|׳§׳•׳¡׳§׳•׳¡|׳‘׳•׳¨׳’׳•׳|׳§׳™׳ ׳•׳׳”)/.test(foodText)) return 270;
  if (/(׳¢׳“׳©׳™׳|׳©׳¢׳•׳¢׳™׳×|׳—׳•׳׳•׳¡|׳׳₪׳•׳ ׳”|׳’׳¨׳™׳¡׳™׳)/.test(foodText)) return 250;
  if (/(׳‘׳˜׳˜׳”|׳×׳₪׳•׳—\s*׳׳“׳׳”|׳×׳₪׳•["׳´]?׳|׳×׳₪׳•׳—׳™\s*׳׳“׳׳”|׳₪׳™׳¨׳”)/.test(foodText)) return 300;
  if (/(׳¡׳׳˜|׳™׳¨׳§׳•׳×|׳—׳¡׳”|׳¢׳’׳‘|׳׳׳₪׳₪׳•׳|׳›׳¨׳•׳‘|׳‘׳¨׳•׳§׳•׳׳™|׳›׳¨׳•׳‘׳™׳×|׳§׳™׳©׳•׳|׳—׳¦׳™׳|׳’׳–׳¨)/.test(foodText) || /׳™׳¨׳§׳•׳×/.test(cat)) return 300;
  if (/(׳׳–׳ ׳™׳”|׳׳•׳§׳₪׳¥|׳×׳‘׳©׳™׳|׳§׳“׳¨׳”|׳₪׳©׳˜׳™׳“׳”)/.test(foodText)) return 350;
  return 300;
}

function closeCustomSelect(id) {
  const list = document.getElementById(id + '-list');
  if (list) list.style.display = 'none';
}

function closeAllCustomSelects() {
  closeCustomSelect('qty-unit');
  closeCustomSelect('plate-fraction');
  closeCustomSelect('meal-type');
}

function buildCustomSelect(id, onChange) {
  const select = document.getElementById(id === 'qty-unit' ? 'qty-sel' : id === 'meal-type' ? 'meal-type' : 'plate-fraction');
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
      if (check) check.textContent = active ? 'ג“' : '';
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
  const hasUnit = /׳›׳₪׳™׳×|׳›׳₪׳™׳•׳×|׳›׳£|׳›׳₪׳•׳×|׳›׳•׳¡׳•׳×|׳›׳•׳¡|׳"׳|׳׳™׳׳™׳׳™׳˜׳¨|׳’׳¨׳/.test(raw);
  if (!hasUnit && ['׳›׳₪׳™׳×', '׳›׳£', '׳›׳•׳¡'].includes(unit)) {
    return '1 ' + unit + ' ' + raw;
  }
  return raw;
}

function displayUnit(qty, unit) {
  const n = parseFloat(qty);
  if (n === 1) return unit;
  const plural = {
    '׳›׳£': '׳›׳₪׳•׳×',
    '׳›׳₪׳™׳×': '׳›׳₪׳™׳•׳×',
    '׳›׳•׳¡': '׳›׳•׳¡׳•׳×',
    '׳™׳—׳™׳“׳”': '׳™׳—׳™׳“׳•׳×',
    '׳₪׳¨׳•׳¡׳”': '׳₪׳¨׳•׳¡׳•׳×',
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

function showAutoMissingQty(aiMsg, aiText, warnBox, customMsg) {
  const msg = customMsg || '׳‘׳—׳™׳₪׳•׳© ׳׳•׳˜׳•׳׳˜׳™ ׳™׳© ׳׳¨׳©׳•׳ ׳›׳׳•׳× + ׳™׳—׳™׳“׳× ׳׳©׳§׳. ׳׳׳©׳: ׳׳›׳׳×׳™ 100 ׳’׳¨׳ ׳—׳–׳” ׳¢׳•׳£, ׳׳›׳׳×׳™ ׳¨׳‘׳¢ ׳¦׳׳—׳× ׳׳•׳¨׳–';
  if (warnBox) warnBox.innerHTML = '';
  if (aiMsg) aiMsg.classList.remove('show');
  if (aiText) aiText.textContent = '';
  let toast = document.getElementById('auto-qty-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'auto-qty-toast';
    toast.className = 'auto-qty-toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<div class="auto-qty-toast-box"><div>${escHtml(msg)}</div><button type="button" class="auto-qty-toast-ok">׳׳™׳©׳•׳¨</button></div>`;
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
    quantityDisplay = `${grams} ׳’׳¨׳`;
  } else if (AUTO_PLATE_RE.test(t)) {
    const fraction = AUTO_QUARTER_RE.test(t) ? 0.25 : AUTO_THIRD_RE.test(t) ? 1 / 3 : AUTO_HALF_RE.test(t) ? 0.5 : 1;
    grams = getFullPlateGrams(food) * fraction;
    const fractionText = fraction === 0.25 ? '׳¨׳‘׳¢' : fraction === 1 / 3 ? '׳©׳׳™׳©' : fraction === 0.5 ? '׳—׳¦׳™' : '׳©׳׳';
    quantityDisplay = `${fractionText} ׳¦׳׳—׳×`;
  } else {
    grams = food.dw || 100;
    quantityDisplay = `${grams} ׳’׳¨׳`;
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
    /* split "X ׳•-Y" Hebrew conjunction into separate items */
    const subParts = part.split(AUTO_SPLIT_AND_RE);
    for (const sp of subParts) {
      for (const item of splitAutoQuantityItems(sp.trim())) {
        const t = item.trim();
        if (t) parts.push(t);
      }
    }
  }
  if (parts.length < 2) return false;
  const mealType = requireMealType();
  if (!mealType) return true;
  if (parts.some(part => !hasAutoExplicitQuantity(part))) {
    showAutoMissingQty(aiMsg, aiText, warnBox);
    return true;
  }

  aiMsg.classList.add('show');
  aiText.textContent = 'ג³ ׳׳•׳¡׳™׳£ ׳׳× ׳›׳ ׳”׳׳ ׳•׳×...';

  let added = 0;
  let addedCal = 0;
  const failed = [];
  for (const part of parts) {
    const result = parseAutoFood(part);
    if (result) { result.mealType = mealType; log.push(result); added++; addedCal += result.cal; }
    else failed.push(part);
  }
  save();
  render();
  if (added > 0) playRegisterSound();
  if (failed.length > 0) {
    aiMsg.classList.add('show');
    aiText.textContent = `׳׳ ׳–׳™׳”׳™׳×׳™: ${failed.join(', ')}`;
  } else {
    aiMsg.classList.remove('show');
    aiText.textContent = '';
  }
  warnBox.innerHTML = '';

  const total = totals();
  const warns = [];
  if (total.cal > GOALS.cal) warns.push(`ג ן¸ ׳¢׳‘׳¨׳× ׳׳× ׳™׳¢׳“ ׳”׳§׳׳•׳¨׳™׳•׳× ׳”׳™׳•׳׳™ (${Math.round(total.cal)}/${GOALS.cal} ׳§׳׳³)`);
  if (total.carbs > GOALS.carbs) warns.push(`ג ן¸ ׳¢׳‘׳¨׳× ׳׳× ׳™׳¢׳“ ׳”׳₪׳—׳׳™׳׳•׳× ׳”׳™׳•׳׳™`);
  warnBox.innerHTML = warns.map(w => `<div class="warn-box">${w}</div>`).join('');

  inp.value = '';
  document.getElementById('food-list').scrollTop = document.getElementById('food-list').scrollHeight;
  return true;
}

/* ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€
   LOCAL QUANTITY DETECTION + POPUP
   ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ */
function hasExplicitQty(text) {
  const t = text.trim().toLowerCase();
  if (/\d+(?:[.,]\d+)?\s*(?:׳’׳¨׳|׳’'|׳"?׳|׳׳™׳׳™׳׳™׳˜׳¨|׳׳|׳׳™׳˜׳¨|׳§"?׳’|׳§׳™׳׳•׳’׳¨׳)/.test(t)) return true;
  if (/\d+(?:[.,]\d+)?\s*(?:׳›׳₪׳™׳•׳×?|׳›׳₪׳•׳×?|׳›׳•׳¡׳•׳×?|׳›׳•׳¡)/.test(t)) return true;
  if (/(?:^|\s)(?:׳›׳₪׳™׳•׳×?|׳›׳₪׳•׳×?|׳›׳•׳¡׳•׳×?|׳›׳•׳¡)(?:\s|$)/.test(t)) return true;
  if (/(?:^|\s)׳›׳£(?:\s|$)/.test(t)) return true;
  if (/(?:^|\s)(?:׳—׳¦׳™|׳¨׳‘׳¢|׳©׳׳™׳©)(?:\s|$)/.test(t)) return true;
  if (/׳©׳׳•׳©(?:\s+|-)?׳¨׳‘׳¢|׳©׳ ׳™(?:\s+|-)?׳©׳׳™׳©׳™|׳›׳•׳¡\s+׳•׳—׳¦׳™|׳©׳×׳™\s+׳›׳•׳¡׳•׳×/.test(t)) return true;
  if (/(?:^|\s)(?:׳׳—׳“|׳׳—׳×|׳©׳ ׳™׳™׳|׳©׳×׳™׳™׳|׳©׳ ׳™|׳©׳×׳™|׳©׳׳•׳©׳”|׳©׳׳•׳©|׳׳¨׳‘׳¢׳”|׳׳¨׳‘׳¢|׳—׳׳™׳©׳”|׳—׳׳©|׳©׳™׳©׳”|׳©׳©)(?:\s|$)/.test(t)) return true;
  if (/^\d+(?:[.,]\d+)?(?:\s|$)/.test(t)) return true;
  return false;
}

let _qtyFood = null, _qtyFoodText = null;

function _qtyUnitOptions(food) {
  const name = (food.n[0] || '').toLowerCase();
  const cat  = (food.cat || '').toLowerCase();
  if (/׳׳©׳§׳”|׳©׳×׳™׳™׳”/.test(cat) || /׳׳™׳¥|׳—׳׳‘|׳׳™׳|׳§׳₪׳”|׳×׳”/.test(name))
    return ['׳"׳', '׳›׳•׳¡', '׳›׳£', '׳›׳₪׳™׳×', '׳’׳¨׳'];
  if (/׳׳—׳|׳˜׳•׳¡׳˜|׳‘׳’׳˜|׳—׳׳”|׳׳׳₪׳”|׳₪׳™׳×׳”|׳₪׳¨׳•׳¡׳”/.test(name))
    return ['׳₪׳¨׳•׳¡׳•׳×', '׳’׳¨׳', '׳™׳—׳™׳“׳•׳×'];
  if (/׳©׳׳|׳—׳׳׳×|׳˜׳—׳™׳ ׳”|׳׳׳¨׳—|׳׳׳—|׳§׳׳—|׳¡׳•׳›׳¨|׳“׳‘׳©|׳¨׳™׳‘׳”/.test(name))
    return ['׳›׳£', '׳›׳₪׳™׳×', '׳›׳•׳¡', '׳’׳¨׳'];
  return ['׳’׳¨׳', '׳™׳—׳™׳“׳•׳×', '׳›׳•׳¡', '׳›׳£', '׳›׳₪׳™׳×'];
}

function _qtyQuestion(food) {
  const name    = food.n[0];
  const nameLow = name.toLowerCase();
  const catLow  = (food.cat || '').toLowerCase();
  if (/׳׳—׳|׳˜׳•׳¡׳˜|׳‘׳’׳˜|׳—׳׳”|׳׳׳₪׳”/.test(nameLow)) return `׳›׳׳” ׳₪׳¨׳•׳¡׳•׳× ${name}?`;
  if (/׳₪׳™׳×׳”/.test(nameLow))                   return `׳›׳׳” ׳₪׳™׳×׳•׳×?`;
  if (/׳‘׳™׳¦/.test(nameLow))                    return `׳›׳׳” ׳‘׳™׳¦׳™׳?`;
  if (/׳׳©׳§׳”|׳©׳×׳™׳™׳”/.test(catLow) || /׳׳™׳¥|׳—׳׳‘|׳׳™׳|׳§׳₪׳”|׳×׳”/.test(nameLow)) return `׳›׳׳” ׳"׳ ${name}?`;
  if (/׳™׳¨׳§׳•׳×|׳₪׳™׳¨׳•׳×/.test(catLow))             return `׳›׳׳” ${name}?`;
  return `׳›׳׳” ׳’׳¨׳ ${name}?`;
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
      <input type="number" id="qty-popup-num" min="0.5" step="0.5" placeholder="׳›׳׳•׳×">
      <select id="qty-popup-unit"></select>
    </div>
    <div class="qty-popup-btns">
      <button class="qty-btn-add" onclick="qtyPopupSubmit()">׳”׳•׳¡׳£ ג“</button>
      <button class="qty-btn-cancel" onclick="qtyPopupClose()">׳‘׳™׳˜׳•׳</button>
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
  const rawText = (unit === '׳™׳—׳™׳“׳•׳×' || unit === '׳₪׳¨׳•׳¡׳•׳×')
    ? `${numVal} ${_qtyFoodText}`
    : `${numVal} ${unit} ${_qtyFoodText}`;
  const result = parseFood(rawText);
  if (!result) {
    document.getElementById('ai-msg').classList.add('show');
    document.getElementById('ai-text').textContent = '׳׳ ׳”׳¦׳׳—׳×׳™ ׳׳—׳©׳‘ ׳׳× ׳”׳¢׳¨׳›׳™׳. ׳ ׳¡׳” ׳©׳•׳‘.';
    return;
  }
  qtyPopupClose();
  _commitFoodEntry(result);
}

function manualFindFood(name) {
  if (!name || typeof findFood !== 'function') return null;
  return findFood(name);
}

function playRegisterSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.02);
    master.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.38);
    master.connect(ctx.destination);
    [880, 1320, 1760].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i === 2 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.055);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.055);
      gain.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + i * 0.055 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.055 + 0.16);
      osc.connect(gain);
      gain.connect(master);
      osc.start(ctx.currentTime + i * 0.055);
      osc.stop(ctx.currentTime + i * 0.055 + 0.18);
    });
    setTimeout(() => ctx.close(), 600);
  } catch {}
}

function _commitFoodEntry(result) {
  if (!result.quantityDisplay && result.raw) result.quantityDisplay = extractAutoQuantityDisplay(result.raw);
  const mealType = requireMealType();
  if (!mealType) return false;
  result.mealType = mealType;
  log.push(result);
  save();
  const aiMsg  = document.getElementById('ai-msg');
  const aiText = document.getElementById('ai-text');
  aiMsg.classList.remove('show');
  aiText.textContent = '';
  playRegisterSound();
  const warnBox = document.getElementById('warn-box');
  const total   = totals();
  const warns   = [];
  if (total.cal   > GOALS.cal)   warns.push(`ג ן¸ ׳¢׳‘׳¨׳× ׳׳× ׳™׳¢׳“ ׳”׳§׳׳•׳¨׳™׳•׳× ׳”׳™׳•׳׳™ (${Math.round(total.cal)}/${GOALS.cal} ׳§׳׳³)`);
  if (total.carbs > GOALS.carbs) warns.push(`ג ן¸ ׳¢׳‘׳¨׳× ׳׳× ׳™׳¢׳“ ׳”׳₪׳—׳׳™׳׳•׳× ׳”׳™׳•׳׳™`);
  warnBox.innerHTML = warns.map(w => `<div class="warn-box">${w}</div>`).join('');
  render();
  document.getElementById('food-list').scrollTop = document.getElementById('food-list').scrollHeight;
  return true;
}

async function addFood() {
  const inp = document.getElementById('food-input');
  let raw = inp.value.trim();
  if (!raw) return;

  const aiMsg  = document.getElementById('ai-msg');
  const aiText = document.getElementById('ai-text');
  const warnBox = document.getElementById('warn-box');

  /* ג”€ג”€ Manual search (autocomplete-selected item OR manual mode) ג”€ג”€ */
  const _manualSec = document.getElementById('manual-section');
  const _isManual = _manualSec && _manualSec.style.display !== 'none';
  if (selectedManualFood || _acSelectedFood || _isManual) {
    console.log('[manual-add] clicked add');
    console.log('[manual-add] input value:', raw);
    console.log('[manual-add] selectedManualFood:', selectedManualFood);
    console.log('[manual-add] DB length:', typeof DB !== 'undefined' ? DB.length : 'DB not defined');
    if (typeof DB === 'undefined' || !Array.isArray(DB) || DB.length === 0) {
      aiMsg.classList.add('show');
      aiText.textContent = '׳׳׳’׳¨ ׳”׳׳׳›׳׳™׳ ׳׳ ׳ ׳˜׳¢׳';
      return;
    }
    const unit = document.getElementById('qty-sel').value;
    const qtyNum = parseFloat(document.getElementById('qty-num').value);
    if (!isPlateUnit(unit) && (!qtyNum || qtyNum <= 0)) {
      showAutoMissingQty(aiMsg, aiText, warnBox, '׳™׳© ׳׳”׳–׳™׳ ׳›׳׳•׳× ׳׳₪׳ ׳™ ׳”׳•׳¡׳₪׳× ׳”׳׳׳›׳. ׳׳׳©׳: 100 ׳’׳¨׳ ׳׳•׳¨׳– ׳׳• ׳—׳¦׳™ ׳¦׳׳—׳× ׳׳•׳¨׳–');
      return;
    }
    const food = selectedManualFood || _acSelectedFood || manualFindFood(raw);
    console.log('[manual-add] findFood result:', food);
    if (!food) {
      aiMsg.classList.add('show');
      aiText.textContent = '׳”׳׳׳›׳ ׳׳ ׳ ׳׳¦׳ ׳‘׳׳׳’׳¨';
      _acSelected = false;
      _acSelectedFood = null;
      selectedManualFood = null;
      return;
    }
    if (food.cal === undefined || food.p === undefined || food.c === undefined || food.f === undefined) {
      aiMsg.classList.add('show');
      aiText.textContent = '׳”׳׳׳›׳ ׳׳ ׳ ׳׳¦׳ ׳‘׳׳׳’׳¨';
      return;
    }
    let grams;
    if (unit === '׳’׳¨׳') grams = qtyNum;
    else if (unit === '׳"׳' || unit === '׳׳™׳׳™׳׳™׳˜׳¨') grams = qtyNum;
    else if (unit === '׳™׳—׳™׳“׳•׳×' || unit === '׳™׳—׳™׳“׳”' || unit === '׳₪׳¨׳•׳¡׳•׳×' || unit === '׳₪׳¨׳•׳¡׳”') grams = qtyNum * (food.dw || 100);
    else if (unit === '׳›׳•׳¡' || unit === '׳›׳•׳¡׳•׳×') grams = qtyNum * 240;
    else if (unit === '׳›׳£' || unit === '׳›׳₪׳•׳×') grams = qtyNum * 15;
    else if (unit === '׳›׳₪׳™׳×' || unit === '׳›׳₪׳™׳•׳×') grams = qtyNum * 5;
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
      quantityDisplay: isPlateUnit(unit) ? document.getElementById('plate-fraction').selectedOptions[0].text + " ׳¦׳׳—׳×" : formatQuantityDisplay(qtyNum, unit),
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

  /* ג”€ג”€ Multi-food meal ג”€ג”€ */
  const isMeal = /,|\n|\s+׳•(?=[׳-׳×])/.test(raw) || /^(׳׳›׳׳×׳™|׳׳›׳׳×|׳׳›׳|׳׳›׳׳”|׳©׳×׳™׳×׳™|׳©׳×׳™׳×)\s/.test(raw);
  if (isMeal) {
    const handled = await addMeal(raw.replace(/\n/g, ','), inp);
    if (handled) return;
  }

  /* ג”€ג”€ Single food: local search only ג”€ג”€ */
  const foodText = raw.replace(/^(׳׳›׳׳×׳™|׳׳›׳׳×|׳׳›׳|׳׳›׳׳”|׳©׳×׳™׳×׳™|׳©׳×׳™׳×)\s+/, '').trim();
  const origFoodText = rawOrig.replace(/^(׳׳›׳׳×׳™|׳׳›׳׳×|׳׳›׳|׳׳›׳׳”|׳©׳×׳™׳×׳™|׳©׳×׳™׳×)\s+/, '').trim();

  const food = findFood(foodText);
  if (!food) {
    warnBox.innerHTML = '';
    aiMsg.classList.add('show');
    aiText.textContent = `׳׳ ׳׳¦׳׳×׳™ "${origFoodText}" ׳‘׳׳׳’׳¨. ׳ ׳¡׳” ׳©׳ ׳׳—׳¨.`;
    return;
  }

  if (hasExplicitQty(origFoodText)) {
    const result = parseFood(foodText);
    if (result) { inp.value = ''; _commitFoodEntry(result); return; }
  }

  /* No explicit quantity ג€” open popup */
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
  aiText.textContent = '׳׳—׳₪׳© ׳‘׳׳׳’׳¨ ׳”׳¨׳—׳‘...';
  if (typeof fetchFoodsDict === 'function' && typeof showServingPicker === 'function') {
    const term = cleanAutoText(raw).trim();
    const fd = await fetchFoodsDict(term);
    if (fd && fd.food && fd.per100 && fd.per100.cal) {
      inp.value = '';
      showServingPicker(fd, raw);
      return;
    }
  }
  aiText.textContent = `׳׳ ׳”׳¦׳׳—׳×׳™ ׳׳—׳©׳‘ ׳׳× "${raw}". ׳ ׳¡׳” ׳©׳ ׳׳—׳¨ ׳׳• ׳”׳•׳¡׳£ ׳›׳׳•׳×.`;
}

function deleteItem(i) {
  log.splice(i, 1);
  save();
  render();
}

function clearAll() {
  const modal = document.getElementById('confirm-clear-overlay');
  if (modal) { modal.hidden = false; return; }
  if (!confirm('׳׳׳—׳•׳§ ׳׳× ׳›׳ ׳”׳¨׳©׳•׳׳•׳× ׳©׳ ׳”׳™׳•׳?')) return;
  log = [];
  save();
  document.getElementById('ai-msg').classList.remove('show');
  render();
}

/* ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€
   CAMERA
   ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ */
function closeClearConfirm() {
  const modal = document.getElementById('confirm-clear-overlay');
  if (modal) modal.hidden = true;
}

function confirmClearAll() {
  closeClearConfirm();
  log = [];
  save();
  document.getElementById('ai-msg').classList.remove('show');
  render();
}

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
      aiText.textContent = 'נ“· ׳”׳×׳׳•׳ ׳” ׳ ׳˜׳¢׳ ׳”! ׳›׳×׳‘/׳™ ׳׳× ׳©׳ ׳”׳׳ ׳” ׳‘׳©׳“׳” ׳”׳˜׳§׳¡׳˜ ׳›׳“׳™ ׳׳¨׳©׳•׳ ׳׳•׳×׳”.';
      fileIn.value = '';
    });
  }
  fileIn.click();
}

/* ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€
   VOICE RECORDING
   ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ */
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
    btn.textContent = '׳׳§׳׳™׳˜';
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
    btn.textContent = 'נ₪';
  };

  recognition.onerror = (e) => {
    isRecording = false;
    const btn = document.getElementById('mic-btn');
    btn.classList.remove('rec');
    btn.textContent = 'נ₪';
    if (e.error === 'not-allowed') {
      alert('׳™׳© ׳׳׳©׳¨ ׳’׳™׳©׳” ׳׳׳™׳§׳¨׳•׳₪׳•׳ ׳‘׳“׳₪׳“׳₪׳');
    }
  };
  return true;
}

function toggleVoice() {
  if (!recognition) {
    if (!initVoice()) {
      alert('׳”׳“׳₪׳“׳₪׳ ׳©׳׳ ׳׳ ׳×׳•׳׳ ׳‘׳”׳§׳׳˜׳” ׳§׳•׳׳™׳×. ׳ ׳¡׳” Chrome.');
      return;
    }
  }
  if (isRecording) { recognition.stop(); return; }
  const manualInput = document.getElementById('food-input');
  const manualBtn = document.getElementById('mic-btn');
  recognition.onstart = () => {
    isRecording = true;
    manualBtn.classList.add('rec');
    manualBtn.textContent = '׳׳§׳׳™׳˜';
  };
  recognition.onresult = (e) => {
    let txt = '';
    for (let i = e.resultIndex; i < e.results.length; i++) txt += e.results[i][0].transcript;
    manualInput.value = txt;
  };
  recognition.onend = () => {
    isRecording = false;
    manualBtn.classList.remove('rec');
    manualBtn.textContent = 'נ₪';
  };
  recognition.onerror = (e) => {
    isRecording = false;
    manualBtn.classList.remove('rec');
    manualBtn.textContent = 'נ₪';
    if (e.error === 'not-allowed') alert('׳™׳© ׳׳׳©׳¨ ׳’׳™׳©׳” ׳׳׳™׳§׳¨׳•׳₪׳•׳ ׳‘׳“׳₪׳“׳₪׳');
  };
  manualInput.value = '';
  recognition.start();
}

function toggleAutoVoice() {
  if (!recognition) {
    if (!initVoice()) {
      alert('׳”׳“׳₪׳“׳₪׳ ׳©׳׳ ׳׳ ׳×׳•׳׳ ׳‘׳”׳§׳׳˜׳” ׳§׳•׳׳™׳×. ׳ ׳¡׳” Chrome.');
      return;
    }
  }
  if (isRecording) { recognition.stop(); return; }
  const autoInput = document.getElementById('auto-input');
  const autoBtn = document.getElementById('auto-mic-btn');
  recognition.onstart = () => {
    isRecording = true;
    autoBtn.classList.add('rec');
    autoBtn.textContent = '׳׳§׳׳™׳˜';
  };
  recognition.onresult = (e) => {
    let txt = '';
    for (let i = e.resultIndex; i < e.results.length; i++) txt += e.results[i][0].transcript;
    autoInput.value = txt;
  };
  recognition.onend = () => {
    isRecording = false;
    autoBtn.classList.remove('rec');
    autoBtn.textContent = 'נ₪';
  };
  recognition.onerror = (e) => {
    isRecording = false;
    autoBtn.classList.remove('rec');
    autoBtn.textContent = 'נ₪';
    if (e.error === 'not-allowed') alert('׳™׳© ׳׳׳©׳¨ ׳’׳™׳©׳” ׳׳׳™׳§׳¨׳•׳₪׳•׳ ׳‘׳“׳₪׳“׳₪׳');
  };
  autoInput.value = '';
  recognition.start();
}

let _miriRec = null;
let _miriRecording = false;

function toggleMiriVoice() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { alert('׳”׳“׳₪׳“׳₪׳ ׳©׳׳ ׳׳ ׳×׳•׳׳ ׳‘׳”׳§׳׳˜׳” ׳§׳•׳׳™׳×. ׳ ׳¡׳” Chrome.'); return; }

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
    chatBtn.textContent = '׳׳§׳׳™׳˜';
  };
  _miriRec.onresult = (e) => {
    let txt = '';
    for (let i = e.resultIndex; i < e.results.length; i++) txt += e.results[i][0].transcript;
    chatInput.value = txt;
  };
  _miriRec.onerror = (e) => {
    _miriRecording = false;
    chatBtn.classList.remove('rec');
    chatBtn.textContent = e.error === 'no-speech' ? 'נ₪ ׳׳ ׳©׳׳¢׳×׳™' : 'נ₪';
    setTimeout(() => { chatBtn.textContent = 'נ₪'; }, 2000);
  };
  _miriRec.onend = () => {
    _miriRecording = false;
    chatBtn.classList.remove('rec');
    chatBtn.textContent = 'נ₪';
  };
  try {
    _miriRec.start();
  } catch(e) {
    _miriRecording = false;
    chatBtn.textContent = 'נ₪';
    setTimeout(() => toggleMiriVoice(), 400);
  }
}

/* ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€
   FOOD PICKER
   ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ */
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
  document.getElementById('fp-foodname').textContent = '׳‘׳—׳¨ ׳׳׳›׳';
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
  document.getElementById('fp-grams-note').textContent = g > 0 ? `׳׳—׳•׳©׳‘ ׳¢׳‘׳•׳¨ ${g} ׳’׳¨׳` : '';
}

function fpAdd() {
  if (!fpFood) { alert('׳™׳© ׳׳‘׳—׳•׳¨ ׳׳׳›׳ ׳×׳—׳™׳׳”'); return; }
  const mealType = requireMealType();
  if (!mealType) return;
  const g = parseFloat(document.getElementById('fp-qty').value) || 0;
  if (g <= 0) { alert('׳™׳© ׳׳”׳–׳™׳ ׳›׳׳•׳× ׳—׳™׳•׳‘׳™׳×'); return; }
  const f = g / 100;
  const entry = {
    food: fpFood, grams: g,
    cal: Math.round(fpFood.cal * f),
    carbs: Math.round(fpFood.c * f * 10) / 10,
    protein: Math.round(fpFood.p * f * 10) / 10,
    fat: Math.round(fpFood.f * f * 10) / 10,
    raw: `${fpFood.n[0]} ${g}g`,
    mealType,
  };
  log.push(entry);
  save();
  const aiMsg = document.getElementById('ai-msg');
  const aiText = document.getElementById('ai-text');
  aiMsg.classList.remove('show');
  aiText.textContent = '';
  playRegisterSound();
  document.getElementById('warn-box').innerHTML = '';
  const t = totals();
  let warns = [];
  if (t.cal > GOALS.cal) warns.push(`ג ן¸ ׳¢׳‘׳¨׳× ׳׳× ׳™׳¢׳“ ׳”׳§׳׳•׳¨׳™׳•׳× ׳”׳™׳•׳׳™ (${Math.round(t.cal)}/${GOALS.cal} ׳§׳׳³)`);
  if (t.carbs > GOALS.carbs) warns.push(`ג ן¸ ׳¢׳‘׳¨׳× ׳׳× ׳™׳¢׳“ ׳”׳₪׳—׳׳™׳׳•׳× ׳”׳™׳•׳׳™`);
  document.getElementById('warn-box').innerHTML = warns.map(w => `<div class="warn-box">${w}</div>`).join('');
  render();
  fpClose();
  document.getElementById('food-list').scrollTop = document.getElementById('food-list').scrollHeight;
}

/* ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€
   FOODSDICTIONARY SERVING PICKER
   ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ */
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
      <span class="fd-picker-src">ג— FoodsDictionary</span>
    </div>
    <label>׳‘׳—׳¨ ׳׳ ׳”:</label>
    <select id="fd-serving-sel" onchange="fdServingChange()"></select>
    <input type="number" id="fd-custom-g" placeholder="׳”׳–׳ ׳’׳¨׳׳™׳" min="1" style="display:none" oninput="fdServingChange()">
    <div class="fd-picker-nums">
      <div class="nb c"><span class="nb-v" id="fd-ncal">0</span><span class="nb-l">׳§׳׳•׳¨׳™׳•׳×</span></div>
      <div class="nb h"><span class="nb-v" id="fd-ncarb">0g</span><span class="nb-l">׳₪׳—׳׳™׳׳•׳×</span></div>
      <div class="nb p"><span class="nb-v" id="fd-nprot">0g</span><span class="nb-l">׳—׳׳‘׳•׳ ׳™׳</span></div>
      <div class="nb f"><span class="nb-v" id="fd-nfat">0g</span><span class="nb-l">׳©׳•׳׳ ׳™׳</span></div>
    </div>
    <div class="fd-picker-btns">
      <button class="fd-btn-add" onclick="fdAdd()">׳”׳•׳¡׳£ ׳׳¨׳©׳™׳׳” ג“</button>
      <button class="fd-btn-cancel" onclick="fdClose()">׳‘׳™׳˜׳•׳</button>
    </div>`;
  _acList.insertAdjacentElement('afterend', div);
}

function showServingPicker(fdResult, rawInput) {
  _ensureFdPicker();
  _fdPickerData = { ...fdResult, _rawInput: rawInput };
  document.getElementById('fd-fname').textContent = fdResult.food.n[0];

  const defaults = [
    { label: '100 ׳’׳¨׳', grams: 100 },
    { label: '150 ׳’׳¨׳', grams: 150 },
    { label: '200 ׳’׳¨׳', grams: 200 },
  ];
  const sizes = fdResult.servingSizes.length > 0
    ? [...fdResult.servingSizes, { label: '׳׳•׳×׳׳ ׳׳™׳©׳™׳×', grams: -1 }]
    : [...defaults, { label: '׳׳•׳×׳׳ ׳׳™׳©׳™׳×', grams: -1 }];
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
  const mealType = requireMealType();
  if (!mealType) return;
  const idx  = parseInt(document.getElementById('fd-serving-sel').value);
  const size = _fdPickerData._sizes[idx];

  let grams;
  if (size.grams === -1) {
    grams = parseFloat(document.getElementById('fd-custom-g').value) || 0;
    if (grams <= 0) { alert('׳™׳© ׳׳”׳–׳™׳ ׳›׳׳•׳× ׳—׳™׳•׳‘׳™׳×'); return; }
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
    mealType,
  };
  log.push(entry);
  save();
  fdClose();

  const aiMsg  = document.getElementById('ai-msg');
  const aiText = document.getElementById('ai-text');
  aiMsg.classList.remove('show');
  aiText.textContent = '';
  playRegisterSound();

  const warnBox = document.getElementById('warn-box');
  const total = totals();
  const warns = [];
  if (total.cal   > GOALS.cal)   warns.push(`ג ן¸ ׳¢׳‘׳¨׳× ׳׳× ׳™׳¢׳“ ׳”׳§׳׳•׳¨׳™׳•׳× ׳”׳™׳•׳׳™ (${Math.round(total.cal)}/${GOALS.cal} ׳§׳׳³)`);
  if (total.carbs > GOALS.carbs) warns.push(`ג ן¸ ׳¢׳‘׳¨׳× ׳׳× ׳™׳¢׳“ ׳”׳₪׳—׳׳™׳׳•׳× ׳”׳™׳•׳׳™`);
  warnBox.innerHTML = warns.map(w => `<div class="warn-box">${w}</div>`).join('');

  render();
  document.getElementById('food-list').scrollTop = document.getElementById('food-list').scrollHeight;
}

function fdClose() {
  const picker = document.getElementById('fd-picker');
  if (picker) picker.style.display = 'none';
  _fdPickerData = null;
}

/* ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€
   REMAINING NUTRITION
   ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ */
function renderTracker() {
  const t = totals();
  if (_showRemaining) {
    const r = {
      cal:     Math.max(0, Math.round(GOALS.cal     - t.cal)),
      carbs:   Math.max(0, Math.round(GOALS.carbs   - t.carbs)),
      protein: Math.max(0, Math.round(GOALS.protein - t.protein)),
      fat:     Math.max(0, Math.round(GOALS.fat     - t.fat)),
    };
    document.getElementById('pt-cal').textContent = r.cal+" ׳§׳'";
    document.getElementById('pt-crb').textContent = r.carbs+'g';
    document.getElementById('pt-prt').textContent = r.protein+'g';
    document.getElementById('pt-fat').textContent = r.fat+'g';
  } else {
    document.getElementById('pt-cal').textContent = Math.round(t.cal)+' / '+GOALS.cal+" ׳§׳'";
    document.getElementById('pt-crb').textContent = Math.round(t.carbs)+' / '+GOALS.carbs+'g';
    document.getElementById('pt-prt').textContent = Math.round(t.protein)+' / '+GOALS.protein+'g';
    document.getElementById('pt-fat').textContent = Math.round(t.fat)+' / '+GOALS.fat+'g';
  }
}

function setTrackerMode(mode) {
  _showRemaining = mode === 'remaining';
  document.getElementById('consumed-btn')?.classList.toggle('active', !_showRemaining);
  document.getElementById('remaining-btn')?.classList.toggle('active', _showRemaining);
  renderTracker();
}

function showRemaining() {
  setTrackerMode(_showRemaining ? 'consumed' : 'remaining');
}

/* ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€
   MIRI CHAT
   ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ */
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
    return '׳¢׳‘׳¨׳× ׳׳× ׳”׳™׳¢׳“ ׳”׳§׳׳•׳¨׳™ ׳׳”׳™׳•׳. ׳׳¢׳›׳©׳™׳• ׳¢׳“׳™׳£ ׳׳׳›׳× ׳¢׳ ׳׳–׳•׳ ׳§׳ ׳׳׳•׳“ ׳׳• ׳׳¢׳¦׳•׳¨ ׳›׳׳.';
  }
  if (t.carbs > GOALS.carbs) {
    return '׳¢׳‘׳¨׳× ׳׳× ׳™׳¢׳“ ׳”׳₪׳—׳׳™׳׳•׳× ׳׳”׳™׳•׳. ׳׳¢׳›׳©׳™׳• ׳¢׳“׳™׳£ ׳׳‘׳—׳•׳¨ ׳—׳׳‘׳•׳ ׳¨׳–׳” ׳•׳™׳¨׳§׳•׳×.';
  }
  if (t.fat > GOALS.fat) {
    return '׳¢׳‘׳¨׳× ׳׳× ׳™׳¢׳“ ׳”׳©׳•׳׳ ׳׳”׳™׳•׳. ׳¢׳“׳™׳£ ׳׳”׳׳©׳™׳ ׳¢׳ ׳׳–׳•׳ ׳§׳ ׳•׳“׳ ׳©׳•׳׳.';
  }
  if (t.protein > GOALS.protein) {
    return '׳¢׳‘׳¨׳× ׳׳× ׳™׳¢׳“ ׳”׳—׳׳‘׳•׳ ׳׳”׳™׳•׳. ׳׳™׳ ׳¦׳•׳¨׳ ׳׳”׳•׳¡׳™׳£ ׳¢׳•׳“ ׳—׳׳‘׳•׳ ׳›׳¨׳’׳¢.';
  }
  if (caloriesConsumedPercent > expectedProgress + 0.2) {
    return '׳׳×׳” ׳׳×׳§׳“׳ ׳׳”׳¨ ׳׳“׳™ ׳‘׳™׳—׳¡ ׳׳©׳¢׳”. ׳›׳“׳׳™ ׳׳”׳׳˜ ׳•׳׳‘׳—׳•׳¨ ׳׳–׳•׳ ׳§׳ ׳™׳•׳×׳¨.';
  }
  if (proteinLeft > Math.max(20, GOALS.protein * 0.35)) {
    return '׳—׳¡׳¨ ׳׳ ׳—׳׳‘׳•׳, ׳–׳” ׳–׳׳ ׳˜׳•׳‘ ׳׳”׳•׳¡׳™׳£ ׳׳§׳•׳¨ ׳—׳׳‘׳•׳ ׳׳™׳›׳•׳×׳™ נ’×';
  }
  if (caloriesConsumedPercent < expectedProgress - 0.2 && hour >= 8) {
    return '׳׳×׳” ׳™׳›׳•׳ ׳׳׳›׳•׳ ׳™׳•׳×׳¨ ׳›׳¨׳’׳¢ ׳•׳׳”׳×׳§׳“׳ ׳‘׳§׳¦׳‘ ׳ ׳›׳•׳.';
  }
  if (caloriesLeft <= GOALS.cal * 0.15 && proteinLeft <= GOALS.protein * 0.2 && carbsLeft <= GOALS.carbs * 0.2 && fatLeft <= GOALS.fat * 0.2) {
    return '׳׳×׳” ׳‘׳“׳™׳•׳§ ׳¢׳ ׳”׳׳¡׳׳•׳, ׳×׳׳©׳™׳ ׳›׳›׳” נ‘';
  }
  return '׳׳×׳” ׳‘׳“׳™׳•׳§ ׳¢׳ ׳”׳׳¡׳׳•׳, ׳×׳׳©׳™׳ ׳›׳›׳” נ‘';
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
    return '׳”׳’׳¢׳× ׳׳™׳¢׳“׳™׳ ׳©׳׳ ׳׳”׳™׳•׳. ׳›׳ ׳”׳›׳‘׳•׳“!';
  }

  const options = [
    rem.protein > 0 && { food: findFood(['׳—׳–׳” ׳¢׳•׳£', '׳¢׳•׳£', '׳˜׳•׳ ׳”', '׳‘׳™׳¦׳”']), macro: 'protein', amount: rem.protein },
    rem.carbs > 0 && { food: findFood(['׳׳•׳¨׳–', '׳×׳₪׳•׳— ׳׳“׳׳”', '׳×׳₪׳•"׳', '׳×׳₪׳•׳—׳™ ׳׳“׳׳”']), macro: 'carbs', amount: rem.carbs },
    rem.fat > 0 && { food: findFood(['׳׳‘׳•׳§׳“׳•', '׳˜׳—׳™׳ ׳”']), macro: 'fat', amount: rem.fat },
  ].filter(x => x && x.food).slice(0, 3);

  _lastRecommendedFoods = options.map(x => x.food);

  if (options.length === 0) return '׳׳ ׳׳¦׳׳×׳™ ׳›׳¨׳’׳¢ ׳”׳׳׳¦׳” ׳׳×׳׳™׳׳” ׳׳₪׳™ ׳”׳ ׳×׳•׳ ׳™׳ ׳”׳§׳™׳™׳׳™׳.';

  let msg = `׳ ׳©׳׳¨ ׳׳:\n${rem.cal} ׳§׳׳•׳¨׳™׳•׳×\n${rem.protein} ׳—׳׳‘׳•׳\n${rem.carbs} ׳₪׳—׳׳™׳׳•׳×\n${rem.fat} ׳©׳•׳׳\n\n׳”׳™׳™׳×׳™ ׳׳׳׳™׳¦׳”:`;

  for (const item of options) {
    msg += `\n- ${gramsFor(item.food, item.macro, item.amount)} ׳’׳¨׳ ${item.food.n[0]}`;
  }

  return msg;
}

let _lastRecommendedFoods = [];
let _rejectedFoods = [];

function _getMacroRole(f) {
  const cal = f.cal || 1;
  const cat = (f.cat || '').toLowerCase();
  if (/׳™׳¨׳§/.test(cat)) return 'vegetable';
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
  const prefix = '׳׳™׳ ׳‘׳¢׳™׳” נ˜ ׳׳ ׳™ ׳׳—׳׳™׳₪׳” ׳׳ ׳׳× ׳–׳” ׳׳׳©׳”׳• ׳©׳׳×׳׳™׳ ׳™׳•׳×׳¨ ׳•׳¢׳“׳™׳™׳ ׳©׳•׳׳¨ ׳¢׳ ׳”׳™׳¢׳“׳™׳ ׳©׳׳ ׳׳”׳™׳•׳.\n\n';
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
    return prefix + '׳׳ ׳׳¦׳׳×׳™ ׳×׳—׳׳™׳£ ׳׳×׳׳™׳ ׳‘׳׳׳’׳¨. ׳ ׳¡׳™ ׳׳₪׳ ׳•׳× ׳׳׳™׳™ ׳¢׳ ׳‘׳§׳©׳” ׳׳—׳¨׳×.';

  _lastRecommendedFoods = altFoods;
  let msg = prefix + '׳”׳¦׳¢׳” ׳—׳׳•׳₪׳™׳×:\n';
  let totCal = 0, totProt = 0, totCarbs = 0, totFat = 0;
  for (const f of altFoods) {
    const g = Math.min(Math.max(f.dw || 100, 50), 300);
    const fac = g / 100;
    const c  = Math.round(f.cal * fac);
    const p  = Math.round(f.p   * fac);
    const h  = Math.round(f.c   * fac);
    const ft = Math.round(f.f   * fac);
    msg += `ג€¢ ${f.n[0]} ג€” ${g}g\n`;
    totCal += c; totProt += p; totCarbs += h; totFat += ft;
  }
  msg += `\n׳¡׳™׳›׳•׳:\n${totCal} ׳§׳׳³ | ׳—׳׳‘׳•׳ ${totProt}g | ׳₪׳—׳׳™׳׳•׳× ${totCarbs}g | ׳©׳•׳׳ ${totFat}g`;
  return msg;
}

function _proteinFoodSuggest(grams) {
  if (grams <= 6)  return `׳׳” ׳׳ ׳×׳׳›׳ ׳‘׳™׳¦׳” ׳׳—׳×? ׳‘׳“׳™׳•׳§ ~6g ׳—׳׳‘׳•׳! נ¥`;
  if (grams <= 10) return `׳™׳•׳’׳•׳¨׳˜ ׳™׳•׳•׳ ׳™ 100g ג€” ׳‘׳“׳™׳•׳§ ׳‘׳©׳‘׳™׳׳! ~10g ׳—׳׳‘׳•׳ נ¥›`;
  if (grams <= 12) return `׳׳” ׳׳×׳” ׳׳•׳׳¨ ׳¢׳ ׳§׳•׳˜׳’׳³ 100g? ׳™׳© ׳©׳ ~12g ׳—׳׳‘׳•׳ נ˜`;
  if (grams <= 17) return `׳™׳•׳’׳•׳¨׳˜ ׳™׳•׳•׳ ׳™ 170g ׳™׳¡׳’׳•׳¨ ׳׳ ׳׳× ׳–׳” ׳™׳₪׳”! ~17g נ¥›`;
  if (grams <= 25) return `׳§׳•׳₪׳¡׳× ׳˜׳•׳ ׳” ׳×׳¡׳’׳•׳¨ ׳׳ ׳׳× ׳”׳›׳ ג€” ~25g ׳—׳׳‘׳•׳! נ`;
  if (grams <= 31) return `100g ׳—׳–׳” ׳¢׳•׳£ ׳•׳™׳¡׳™׳™׳! ~31g ׳—׳׳‘׳•׳ נ—`;
  return `׳›׳“׳׳™ ׳׳ ׳× ׳—׳׳‘׳•׳ ׳˜׳•׳‘׳” ג€” ׳¢׳•׳£, ׳˜׳•׳ ׳” ׳׳• ׳‘׳™׳¦׳™׳ נ’×`;
}

function _coachLine(rem, over, pct, t) {
  const hour = new Date().getHours();
  const caloriesConsumedPercent = GOALS.cal > 0 ? t.cal / GOALS.cal : 0;
  const expectedProgress = hour / 24;

  if (t.cal > GOALS.cal) {
    return '׳¢׳‘׳¨׳× ׳׳× ׳”׳™׳¢׳“ ׳”׳§׳׳•׳¨׳™ ׳׳”׳™׳•׳. ׳׳¢׳›׳©׳™׳• ׳¢׳“׳™׳£ ׳׳׳›׳× ׳¢׳ ׳׳–׳•׳ ׳§׳ ׳׳׳•׳“ ׳׳• ׳׳¢׳¦׳•׳¨ ׳›׳׳.';
  }
  if (t.carbs > GOALS.carbs) {
    return '׳¢׳‘׳¨׳× ׳׳× ׳™׳¢׳“ ׳”׳₪׳—׳׳™׳׳•׳× ׳׳”׳™׳•׳. ׳׳¢׳›׳©׳™׳• ׳¢׳“׳™׳£ ׳׳‘׳—׳•׳¨ ׳—׳׳‘׳•׳ ׳¨׳–׳” ׳•׳™׳¨׳§׳•׳×.';
  }
  if (t.fat > GOALS.fat) {
    return '׳¢׳‘׳¨׳× ׳׳× ׳™׳¢׳“ ׳”׳©׳•׳׳ ׳׳”׳™׳•׳. ׳¢׳“׳™׳£ ׳׳”׳׳©׳™׳ ׳¢׳ ׳׳–׳•׳ ׳§׳ ׳•׳“׳ ׳©׳•׳׳.';
  }
  if (t.protein > GOALS.protein) {
    return '׳¢׳‘׳¨׳× ׳׳× ׳™׳¢׳“ ׳”׳—׳׳‘׳•׳ ׳׳”׳™׳•׳. ׳׳™׳ ׳¦׳•׳¨׳ ׳׳”׳•׳¡׳™׳£ ׳¢׳•׳“ ׳—׳׳‘׳•׳ ׳›׳¨׳’׳¢.';
  }
  if (caloriesConsumedPercent > expectedProgress + 0.2) {
    return '׳׳×׳” ׳׳×׳§׳“׳ ׳׳”׳¨ ׳׳“׳™ ׳‘׳™׳—׳¡ ׳׳©׳¢׳”. ׳›׳“׳׳™ ׳׳”׳׳˜ ׳•׳׳‘׳—׳•׳¨ ׳׳–׳•׳ ׳§׳ ׳™׳•׳×׳¨.';
  }
  if (rem.protein > Math.max(20, GOALS.protein * 0.35)) {
    return '׳—׳¡׳¨ ׳׳ ׳—׳׳‘׳•׳, ׳–׳” ׳–׳׳ ׳˜׳•׳‘ ׳׳”׳•׳¡׳™׳£ ׳׳§׳•׳¨ ׳—׳׳‘׳•׳ ׳׳™׳›׳•׳×׳™ נ’×';
  }
  if (caloriesConsumedPercent < expectedProgress - 0.2 && hour >= 8) {
    return '׳׳×׳” ׳™׳›׳•׳ ׳׳׳›׳•׳ ׳™׳•׳×׳¨ ׳›׳¨׳’׳¢ ׳•׳׳”׳×׳§׳“׳ ׳‘׳§׳¦׳‘ ׳ ׳›׳•׳.';
  }
  if (rem.cal <= GOALS.cal * 0.15 && rem.protein <= GOALS.protein * 0.2 && rem.carbs <= GOALS.carbs * 0.2 && rem.fat <= GOALS.fat * 0.2) {
    return '׳׳×׳” ׳‘׳“׳™׳•׳§ ׳¢׳ ׳”׳׳¡׳׳•׳, ׳×׳׳©׳™׳ ׳›׳›׳” נ‘';
  }
  return '׳׳×׳” ׳‘׳“׳™׳•׳§ ׳¢׳ ׳”׳׳¡׳׳•׳, ׳×׳׳©׳™׳ ׳›׳›׳” נ‘';
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
  const name = (_currentUser.fullName || '').split(' ')[0] || '׳—׳‘׳¨';
  const goal = d.goal || 'loss';
  const tdee = d.tdee || GOALS.cal;
  const isLoss = goal === 'loss';
  const timeGreet = hour < 12 ? '׳‘׳•׳§׳¨ ׳˜׳•׳‘' : hour < 17 ? '׳¦׳”׳¨׳™׳™׳ ׳˜׳•׳‘׳™׳' : '׳¢׳¨׳‘ ׳˜׳•׳‘';
  return {t, rem, over, pct, hour, d, name, goal, tdee, isLoss, timeGreet};
}

function _getMiriAnswer(text) {
  const {t, rem, over, pct, hour, d, name, goal, tdee, isLoss, timeGreet} = _miriCtx();
  const calDone = t.cal >= GOALS.cal;
  const calOver = t.cal > GOALS.cal * 1.05;

  const Q = [
    [/׳›׳׳” ׳§׳׳•׳¨׳™.*׳׳›׳׳×׳™|׳›׳׳” ׳׳›׳׳×׳™|׳¡׳”"׳› ׳§׳׳•׳¨׳™|׳¡׳ ׳”׳›׳ ׳§׳׳•׳¨׳™/, () => {
      const coach = _coachLine(rem, over, pct, t);
      let msg = `׳׳›׳׳× ${Math.round(t.cal)} ׳§׳׳³ ׳׳×׳•׳ ${GOALS.cal}. ׳ ׳©׳׳¨ ׳׳ ${rem.cal} ׳§׳׳³ ׳׳”׳™׳•׳.`;
      if (coach) msg += `\n${coach}`;
      return msg;
    }],

    [/׳›׳׳” ׳ ׳©׳׳¨|׳׳” ׳ ׳©׳׳¨|׳¢׳•׳“ ׳›׳׳” ׳§׳׳•׳¨׳™/, () => {
      const coach = _coachLine(rem, over, pct, t);
      if (over.cal > 0) return coach;
      if (rem.cal === 0) return `׳”׳’׳¢׳× ׳׳™׳¢׳“! ${over.cal > 0 ? `׳¢׳‘׳¨׳× ׳‘-${over.cal} ׳§׳׳³.` : '׳‘׳“׳™׳•׳§ ׳¢׳ ׳”׳’׳‘׳•׳'} ${coach || ''}`.trim();
      let msg = `׳ ׳©׳׳¨ ׳׳:\nג€¢ ${rem.cal} ׳§׳׳³\nג€¢ ${rem.protein}g ׳—׳׳‘׳•׳\nג€¢ ${rem.carbs}g ׳₪׳—׳׳™׳׳•׳×\nג€¢ ${rem.fat}g ׳©׳•׳׳`;
      if (coach) msg += `\n\n${coach}`;
      return msg;
    }],

    [/׳›׳׳” ׳₪׳—׳׳™׳.*׳׳›׳׳×׳™|׳₪׳—׳׳™׳׳•׳× ׳©׳׳›׳׳×׳™|׳›׳׳” ׳₪׳—׳׳™׳.*׳”׳™׳•׳/, () =>
      `׳׳›׳׳× ${Math.round(t.carbs)}g ׳₪׳—׳׳™׳׳•׳× ׳׳×׳•׳ ${GOALS.carbs}g. ׳ ׳©׳׳¨ ${rem.carbs}g.`],

    [/׳›׳׳” ׳—׳׳‘׳•׳.*׳׳›׳׳×׳™|׳—׳׳‘׳•׳ ׳™׳ ׳©׳׳›׳׳×׳™|׳›׳׳” ׳—׳׳‘׳•׳.*׳”׳™׳•׳/, () => {
      let msg = `׳׳›׳׳× ${Math.round(t.protein)}g ׳—׳׳‘׳•׳ ׳׳×׳•׳ ${GOALS.protein}g. ׳ ׳©׳׳¨ ${rem.protein}g.`;
      if (rem.protein === 0) msg += `\nג… ׳”׳’׳¢׳× ׳׳—׳׳‘׳•׳ ג€” ׳›׳ ׳”׳›׳‘׳•׳“!`;
      else if (rem.protein <= 30) msg += `\n${_proteinFoodSuggest(rem.protein)}`;
      return msg;
    }],

    [/׳›׳׳” ׳©׳•׳׳.*׳׳›׳׳×׳™|׳©׳•׳׳ ׳™׳ ׳©׳׳›׳׳×׳™|׳›׳׳” ׳©׳•׳׳.*׳”׳™׳•׳/, () =>
      `׳׳›׳׳× ${Math.round(t.fat)}g ׳©׳•׳׳ ׳׳×׳•׳ ${GOALS.fat}g. ׳ ׳©׳׳¨ ${rem.fat}g.`],

    [/׳׳” ׳”׳׳¦׳‘|׳׳™׳ ׳”׳׳¦׳‘|׳¢׳“׳›׳ ׳™|׳¢׳“׳›׳ ׳׳•׳×׳™|׳׳™׳₪׳” ׳׳ ׳™ ׳¢׳•׳׳“|׳׳” ׳”׳¡׳˜׳˜׳•׳¡|׳׳™׳ ׳׳ ׳™ ׳”׳™׳•׳|׳׳™׳ ׳׳ ׳™ ׳¢׳•׳׳“|׳¡׳₪׳¨׳™ ׳׳™|׳׳” ׳§׳•׳¨׳”|׳׳™׳ ׳”׳•׳׳/, () => {
      const coach = _coachLine(rem, over, pct, t);
      let msg = `${timeGreet} ${name}! נ“\nג€¢ ׳§׳׳•׳¨׳™׳•׳×: ${Math.round(t.cal)}/${GOALS.cal} (${pct.cal}%)\nג€¢ ׳—׳׳‘׳•׳: ${Math.round(t.protein)}/${GOALS.protein}g (${pct.protein}%)\nג€¢ ׳₪׳—׳׳™׳׳•׳×: ${Math.round(t.carbs)}/${GOALS.carbs}g\nג€¢ ׳©׳•׳׳: ${Math.round(t.fat)}/${GOALS.fat}g`;
      if (coach) msg += `\n\n${coach}`;
      return msg;
    }],

    [/׳›׳׳” ׳׳—׳•׳–|׳׳” ׳”׳׳—׳•׳–/, () =>
      `׳”׳©׳’׳× ${pct.cal}% ׳׳™׳¢׳“ ׳”׳§׳׳•׳¨׳™׳•׳×. ׳—׳׳‘׳•׳: ${pct.protein}%.`],

    [/׳׳” ׳™׳¢׳“|׳›׳׳” ׳™׳¢׳“|׳™׳¢׳“ ׳©׳׳™|׳™׳¢׳“ ׳§׳׳•׳¨׳™/, () =>
      `׳™׳¢׳“ ׳™׳•׳׳™: ${GOALS.cal} ׳§׳׳³ | ${GOALS.protein}g ׳—׳׳‘׳•׳ | ${GOALS.carbs}g ׳₪׳—׳׳™׳׳•׳× | ${GOALS.fat}g ׳©׳•׳׳.`],

    [/׳׳” ׳”׳׳˜׳¨׳”|׳׳” ׳”׳’׳•׳|׳׳” ׳׳˜׳¨׳×׳™/, () =>
      isLoss
        ? `׳”׳׳˜׳¨׳” ׳©׳׳: ׳™׳¨׳™׳“׳” ׳‘׳׳©׳§׳. ׳™׳¢׳“ ${GOALS.cal} ׳§׳׳³ (׳׳×׳—׳× ׳-TDEE ${tdee} ׳§׳׳³).`
        : `׳”׳׳˜׳¨׳” ׳©׳׳: ׳¢׳׳™׳™׳” ׳‘׳׳¡׳”. ׳™׳¢׳“ ${GOALS.cal} ׳§׳׳³ (׳׳¢׳ TDEE ${tdee} ׳§׳׳³).`],

    [/׳׳” ׳׳›׳׳×׳™|׳¨׳©׳™׳׳× ׳”׳׳•׳›׳|׳׳” ׳”׳•׳¡׳₪׳×׳™ ׳”׳™׳•׳/, () =>
      log.length === 0
        ? `׳¢׳“׳™׳™׳ ׳׳ ׳¨׳©׳׳× ׳׳•׳›׳ ׳”׳™׳•׳.`
        : `׳׳›׳׳× ׳”׳™׳•׳:\n${log.map(e => `ג€¢ ${e.food.n[0]} (${Math.round(e.grams)}g) ג€” ${e.cal} ׳§׳׳³`).join('\n')}`],

    [/׳›׳׳” ׳׳¨׳•׳—׳•׳×|׳›׳׳” ׳₪׳¨׳™׳˜׳™׳|׳›׳׳” ׳׳׳›׳׳™׳/, () =>
      log.length === 0 ? `׳׳ ׳¨׳©׳׳× ׳׳¨׳•׳—׳•׳×.` : `׳¨׳©׳׳× ${log.length} ׳׳׳›׳׳™׳ ׳”׳™׳•׳.`],

    [/׳׳¨׳•׳—׳” ׳׳—׳¨׳•׳ ׳”|׳׳” ׳׳›׳׳×׳™ ׳׳׳—׳¨׳•׳ ׳”/, () =>
      log.length === 0
        ? `׳׳ ׳¨׳©׳׳× ׳׳¨׳•׳—׳” ׳¢׳“׳™׳™׳.`
        : `׳׳¨׳•׳—׳” ׳׳—׳¨׳•׳ ׳”: ${log[log.length-1].food.n[0]} (${Math.round(log[log.length-1].grams)}g) ג€” ${log[log.length-1].cal} ׳§׳׳³.`],

    [/׳”׳›׳™ ׳”׳¨׳‘׳” ׳§׳׳•׳¨׳™|׳׳” ׳”׳›׳™ ׳§׳׳•׳¨׳™|׳׳¨׳•׳—׳” ׳›׳‘׳“׳”/, () => {
      if (log.length === 0) return `׳׳ ׳¨׳©׳׳× ׳›׳׳•׳ ׳¢׳“׳™׳™׳.`;
      const mx = log.reduce((a,b) => a.cal > b.cal ? a : b);
      return `׳”׳׳¨׳•׳—׳” ׳”׳›׳‘׳“׳” ׳”׳™׳•׳: ${mx.food.n[0]} ג€” ${mx.cal} ׳§׳׳³.`;
    }],

    [/׳׳” ׳׳׳›׳•׳.*׳‘׳•׳§׳¨|׳׳¨׳•׳—׳× ׳‘׳•׳§׳¨|׳׳׳›׳•׳.*׳‘׳‘׳•׳§׳¨/, () =>
      `׳׳‘׳•׳§׳¨: ׳‘׳™׳¦׳™׳ + ׳׳—׳ ׳׳—׳™׳˜׳” ׳׳׳׳” + ׳™׳¨׳§׳•׳×, ׳׳• ׳©׳™׳‘׳•׳׳× ׳©׳•׳¢׳ ׳¢׳ ׳₪׳™׳¨׳•׳×.`],

    [/׳׳” ׳׳׳›׳•׳.*׳¦׳”׳¨׳™׳™|׳׳¨׳•׳—׳× ׳¦׳”׳¨׳™׳™׳|׳׳׳›׳•׳.*׳‘׳¦׳”׳¨׳™׳™׳/, () =>
      `׳׳¦׳”׳¨׳™׳™׳: ׳—׳–׳” ׳¢׳•׳£ + ׳׳•׳¨׳– ׳׳׳ + ׳¡׳׳˜. ׳—׳׳‘׳•׳ + ׳₪׳—׳׳™׳׳•׳× + ׳™׳¨׳§׳•׳×.`],

    [/׳׳” ׳׳׳›׳•׳.*׳¢׳¨׳‘|׳׳¨׳•׳—׳× ׳¢׳¨׳‘|׳׳׳›׳•׳.*׳‘׳¢׳¨׳‘/, () =>
      rem.cal < 300
        ? `׳”׳¢׳¨׳‘ ׳ ׳©׳׳¨ ${rem.cal} ׳§׳׳³ ג€” ׳¢׳“׳™׳£ ׳׳¨׳•׳—׳” ׳§׳׳”: ׳¡׳׳˜ + ׳˜׳•׳ ׳” ׳׳• ׳™׳•׳’׳•׳¨׳˜ ׳™׳•׳•׳ ׳™.`
        : `׳׳¢׳¨׳‘: ׳¡׳׳׳•׳ + ׳™׳¨׳§׳•׳× ׳׳₪׳•׳™׳™׳ + ׳‘׳˜׳˜׳”.`],

    [/׳׳₪׳ ׳™ ׳©׳™׳ ׳”|׳׳¨׳•׳—׳× ׳׳™׳׳”|׳׳׳›׳•׳.*׳‘׳׳™׳׳”/, () =>
      rem.protein > 20
        ? `׳׳₪׳ ׳™ ׳©׳™׳ ׳”: ׳™׳•׳’׳•׳¨׳˜ ׳™׳•׳•׳ ׳™ ג€” ׳™׳¢׳–׳•׳¨ ׳׳—׳׳‘׳•׳ ׳©׳ ׳©׳׳¨ (${rem.protein}g).`
        : `׳›׳‘׳¨ ׳”׳’׳¢׳× ׳׳—׳׳‘׳•׳. ׳׳ ׳¨׳¢׳‘ ג€” ׳™׳¨׳§׳•׳× ׳‘׳׳‘׳“.`],

    [/׳׳₪׳ ׳™ ׳׳™׳׳•׳|׳׳׳›׳•׳.*׳׳₪׳ ׳™ ׳¡׳₪׳•׳¨׳˜/, () =>
      `׳׳₪׳ ׳™ ׳׳™׳׳•׳: ׳‘׳ ׳ ׳” + ׳›׳₪׳™׳× ׳—׳׳׳× ׳‘׳•׳˜׳ ׳™׳, 60-90 ׳“׳§׳•׳× ׳׳₪׳ ׳™.`],

    [/׳׳—׳¨׳™ ׳׳™׳׳•׳|׳׳׳›׳•׳.*׳׳—׳¨׳™ ׳¡׳₪׳•׳¨׳˜/, () =>
      rem.protein > 0
        ? `׳׳—׳¨׳™ ׳׳™׳׳•׳: ׳—׳׳‘׳•׳ ׳׳”׳™׳¨ ג€” ׳©׳™׳™׳§ ׳׳• ׳—׳–׳” ׳¢׳•׳£. ׳ ׳©׳׳¨ ׳׳ ${rem.protein}g.`
        : `׳›׳‘׳¨ ׳”׳’׳¢׳× ׳׳—׳׳‘׳•׳, ׳׳‘׳ ׳™׳•׳’׳•׳¨׳˜ ׳™׳•׳•׳ ׳™ ׳׳ ׳™׳–׳™׳§.`],

    [/׳‘׳™׳ ׳׳¨׳•׳—׳•׳×|׳—׳˜׳™׳£|׳ ׳©׳ ׳•׳©/, () =>
      rem.cal > 200
        ? `׳—׳˜׳™׳£ ׳˜׳•׳‘: 15 ׳©׳§׳“׳™׳ (90 ׳§׳׳³), ׳×׳₪׳•׳— + ׳—׳׳׳× ׳‘׳•׳˜׳ ׳™׳, ׳׳• ׳§׳•׳˜׳’׳³.`
        : `׳ ׳©׳׳¨ ${rem.cal} ׳§׳׳³ ג€” ׳¢׳“׳™׳£ ׳™׳¨׳§׳•׳× (׳׳׳₪׳₪׳•׳, ׳’׳׳‘׳”).`],

    [/׳׳” ׳׳׳›׳•׳.*׳¢׳›׳©׳™׳•|׳׳” ׳׳•׳›׳|׳×׳׳׳™׳¦׳™ ׳¢׳›׳©׳™׳•/, () => {
      if (hour < 10) return `׳‘׳•׳§׳¨ ג€” ׳‘׳™׳¦׳™׳ + ׳׳—׳ ׳׳׳ ׳׳×׳—׳™׳ ׳™׳₪׳”.`;
      if (hour < 13) return rem.cal > 400 ? `׳—׳˜׳™׳£: ׳₪׳¨׳™ + ׳’׳‘׳™׳ ׳” ׳׳‘׳ ׳”.` : `׳›׳‘׳¨ ׳׳›׳׳× ׳¨׳•׳‘ ׳”׳§׳׳•׳¨׳™׳•׳×, ׳”׳׳×׳ ׳׳¦׳”׳¨׳™׳™׳.`;
      if (hour < 17) return rem.cal > 300 ? `׳¢׳•׳£ + ׳׳•׳¨׳– + ׳¡׳׳˜.` : `׳׳¨׳•׳—׳” ׳§׳׳” ג€” ׳ ׳©׳׳¨ ${rem.cal} ׳§׳׳³.`;
      if (hour < 20) return rem.cal > 200 ? `׳—׳˜׳™׳£: ׳©׳§׳“׳™׳ ׳׳• ׳₪׳¨׳™.` : `׳§׳¨׳•׳‘ ׳׳™׳¢׳“, ׳”׳׳×׳ ׳׳¢׳¨׳‘.`;
      return rem.cal > 150 ? `׳׳¨׳•׳—׳× ׳¢׳¨׳‘: ׳¡׳׳˜ + ׳—׳׳‘׳•׳.` : `׳™׳¨׳§׳•׳× ׳•׳™׳•׳’׳•׳¨׳˜ ג€” ׳ ׳©׳׳¨ ${rem.cal} ׳§׳׳³.`;
    }],

    [/׳׳¡׳₪׳™׳§ ׳—׳׳‘׳•׳|׳”׳׳ ׳—׳׳‘׳•׳.*׳‘׳¡׳“׳¨|׳—׳׳‘׳•׳.*׳׳¡׳₪׳™׳§/, () =>
      t.protein >= GOALS.protein * 0.9
        ? `׳›׳! ${Math.round(t.protein)}g ג€” ׳›׳׳¢׳˜ ׳‘׳™׳¢׳“ (${GOALS.protein}g). נ’×`
        : `׳¢׳•׳“ ׳׳. ${Math.round(t.protein)}g ׳׳×׳•׳ ${GOALS.protein}g. ׳—׳¡׳¨ ${rem.protein}g.`],

    [/׳×׳׳׳™׳¦׳™.*׳—׳׳‘׳•׳|׳׳§׳•׳¨.*׳—׳׳‘׳•׳|׳׳”.*׳¢׳©׳™׳¨.*׳—׳׳‘׳•׳/, () =>
      `׳׳§׳•׳¨׳•׳× ׳—׳׳‘׳•׳: ׳—׳–׳” ׳¢׳•׳£ (31g/100g), ׳˜׳•׳ ׳” (25g/100g), ׳‘׳™׳¦׳” (6g), ׳§׳•׳˜׳’׳³ (12g/100g), ׳™׳•׳’׳•׳¨׳˜ ׳™׳•׳•׳ ׳™ (10g/100g).`],

    [/׳—׳׳‘׳•׳ ׳‘?׳‘׳™׳¦׳”|׳›׳׳” ׳—׳׳‘׳•׳.*׳‘׳™׳¦׳”/, () => `׳‘׳™׳¦׳” ׳‘׳™׳ ׳•׳ ׳™׳×: ~6g ׳—׳׳‘׳•׳, ~70 ׳§׳׳³.`],
    [/׳—׳׳‘׳•׳ ׳‘?׳¢׳•׳£|׳›׳׳” ׳—׳׳‘׳•׳.*׳¢׳•׳£/, () => `׳—׳–׳” ׳¢׳•׳£ (100g): ~31g ׳—׳׳‘׳•׳, ~165 ׳§׳׳³.`],
    [/׳—׳׳‘׳•׳ ׳‘?׳˜׳•׳ ׳”|׳›׳׳” ׳—׳׳‘׳•׳.*׳˜׳•׳ ׳”/, () => `׳˜׳•׳ ׳” ׳‘׳§׳•׳₪׳¡׳” (100g): ~25g ׳—׳׳‘׳•׳, ~110 ׳§׳׳³.`],
    [/׳—׳׳‘׳•׳ ׳‘?׳¡׳׳׳•׳|׳›׳׳” ׳—׳׳‘׳•׳.*׳¡׳׳׳•׳/, () => `׳¡׳׳׳•׳ (100g): ~25g ׳—׳׳‘׳•׳, ~208 ׳§׳׳³.`],
    [/׳—׳׳‘׳•׳ ׳‘?׳§׳•׳˜׳’|׳›׳׳” ׳—׳׳‘׳•׳.*׳§׳•׳˜׳’/, () => `׳’׳‘׳™׳ ׳× ׳§׳•׳˜׳’׳³ (100g): ~12g ׳—׳׳‘׳•׳, ~72 ׳§׳׳³.`],
    [/׳—׳׳‘׳•׳ ׳‘?׳™׳•׳’׳•׳¨׳˜|׳›׳׳” ׳—׳׳‘׳•׳.*׳™׳•׳’׳•׳¨׳˜/, () => `׳™׳•׳’׳•׳¨׳˜ ׳™׳•׳•׳ ׳™ 0% (100g): ~10g ׳—׳׳‘׳•׳, ~59 ׳§׳׳³.`],

    [/׳™׳•׳×׳¨ ׳׳“׳™ ׳©׳•׳׳|׳¢׳‘׳¨׳×׳™.*׳©׳•׳׳|׳©׳•׳׳ ׳’׳‘׳•׳”/, () =>
      over.fat > 0
        ? `׳›׳, ׳¢׳‘׳¨׳× ׳‘-${over.fat}g ׳©׳•׳׳. ׳©׳׳•׳¨ ׳¢׳ ׳©׳׳¨ ׳”׳™׳•׳.`
        : `׳׳ ג€” ${Math.round(t.fat)}g ׳׳×׳•׳ ${GOALS.fat}g. ׳¢׳•׳“ ${rem.fat}g.`],

    [/׳©׳•׳׳ ׳‘?׳׳‘׳•׳§׳“׳•|׳›׳׳” ׳©׳•׳׳.*׳׳‘׳•׳§׳“׳•/, () => `׳׳‘׳•׳§׳“׳• (~150g): ~21g ׳©׳•׳׳, 240 ׳§׳׳³.`],
    [/׳©׳•׳׳ ׳‘?׳©׳׳ ׳–׳™׳×|׳›׳׳” ׳©׳•׳׳.*׳©׳׳ ׳–׳™׳×/, () => `׳›׳£ ׳©׳׳ ׳–׳™׳×: ~14g ׳©׳•׳׳, 120 ׳§׳׳³.`],

    [/׳™׳•׳×׳¨ ׳׳“׳™ ׳₪׳—׳׳™׳|׳¢׳‘׳¨׳×׳™.*׳₪׳—׳׳™׳|׳₪׳—׳׳™׳׳•׳×.*׳’׳‘׳•׳”/, () =>
      over.carbs > 0
        ? `׳¢׳‘׳¨׳× ׳‘-${over.carbs}g ׳₪׳—׳׳™׳׳•׳×. ׳—׳׳‘׳•׳ ׳•׳©׳•׳׳ ׳‘׳©׳׳¨ ׳”׳™׳•׳.`
        : `׳׳ ג€” ${Math.round(t.carbs)}g ׳׳×׳•׳ ${GOALS.carbs}g.`],

    [/׳₪׳—׳׳™׳׳•׳× ׳‘?׳׳•׳¨׳–|׳›׳׳” ׳₪׳—׳׳™׳.*׳׳•׳¨׳–/, () => `׳׳•׳¨׳– ׳׳‘׳ ׳׳‘׳•׳©׳ (100g): ~28g ׳₪׳—׳׳™׳׳•׳×, ~130 ׳§׳׳³.`],
    [/׳₪׳—׳׳™׳׳•׳× ׳‘?׳׳—׳|׳›׳׳” ׳₪׳—׳׳™׳.*׳׳—׳/, () => `׳₪׳¨׳•׳¡׳× ׳׳—׳ ׳׳—׳™׳˜׳” ׳׳׳׳”: ~13g ׳₪׳—׳׳™׳׳•׳×, ~75 ׳§׳׳³.`],
    [/׳₪׳—׳׳™׳׳•׳× ׳‘?׳‘׳˜׳˜׳”|׳›׳׳” ׳₪׳—׳׳™׳.*׳‘׳˜׳˜׳”/, () => `׳‘׳˜׳˜׳” (100g): ~20g ׳₪׳—׳׳™׳׳•׳×, ~86 ׳§׳׳³.`],
    [/׳₪׳—׳׳™׳׳•׳× ׳‘?׳‘׳ ׳ ׳”|׳›׳׳” ׳₪׳—׳׳™׳.*׳‘׳ ׳ ׳”/, () => `׳‘׳ ׳ ׳” ׳‘׳™׳ ׳•׳ ׳™׳×: ~27g ׳₪׳—׳׳™׳׳•׳×, ~105 ׳§׳׳³.`],

    [/׳¢׳‘׳¨׳×׳™.*׳™׳¢׳“|׳¢׳‘׳¨׳×׳™.*׳§׳׳•׳¨׳™|׳׳›׳׳×׳™ ׳™׳•׳×׳¨ ׳׳“׳™|׳׳›׳׳×׳™ ׳”׳¨׳‘׳”|׳—׳¨׳’׳×׳™|׳—׳¨׳™׳’׳” ׳”׳™׳•׳/, () =>
      calOver
        ? `׳¢׳‘׳¨׳× ׳‘-${over.cal} ׳§׳׳³ ג€” ׳’׳ ׳™׳•׳ ׳›׳–׳” ׳§׳•׳¨׳” נ˜ ׳׳ ׳׳₪׳¦׳•׳× ׳׳—׳¨, ׳₪׳©׳•׳˜ ׳—׳•׳–׳¨׳™׳ ׳׳׳¡׳׳•׳!`
        : calDone
          ? `׳”׳’׳¢׳× ׳‘׳“׳™׳•׳§ ׳׳™׳¢׳“ ג€” ${Math.round(t.cal)} ׳§׳׳³. ׳׳“׳”׳™׳! נ‰נ`
          : `׳׳ ׳¢׳‘׳¨׳× ג€” ׳ ׳©׳׳¨ ׳׳ ׳¢׳•׳“ ${rem.cal} ׳§׳׳³ ׳׳”׳™׳•׳.`],

    [/׳›׳׳” ׳¢׳‘׳¨׳×׳™|׳‘.?׳›׳׳” ׳¢׳‘׳¨׳×׳™/, () =>
      over.cal > 0 ? `׳¢׳‘׳¨׳× ׳‘-${over.cal} ׳§׳׳³.` : `׳׳ ׳¢׳‘׳¨׳×. ׳ ׳©׳׳¨ ${rem.cal} ׳§׳׳³.`],

    [/׳¢׳©׳™׳×׳™ ׳˜׳•׳‘|׳›׳ ׳”׳›׳‘׳•׳“|׳”׳¦׳׳—׳×׳™|׳’׳׳” ׳‘׳™/, () => {
      if (pct.cal >= 90 && t.protein >= GOALS.protein * 0.85)
        return `׳׳׳© ׳›׳ ׳”׳›׳‘׳•׳“ ${name}! ׳™׳•׳ ׳׳¦׳•׳™׳ נ`;
      if (pct.cal < 50)
        return `׳׳×׳” ׳‘׳“׳¨׳! ׳¨׳§ ${Math.round(t.cal)} ׳§׳׳³ ג€” ׳¢׳•׳“ ׳™׳© ׳׳§׳•׳ ׳׳׳›׳•׳.`;
      return `׳™׳•׳₪׳™ ${name}! ׳‘׳›׳™׳•׳•׳. ׳ ׳©׳׳¨ ${rem.cal} ׳§׳׳³.`;
    }],

    [/׳׳ ׳׳¦׳׳™׳—|׳§׳©׳” ׳׳™|׳׳×׳™׳™׳׳©|׳׳•׳•׳×׳¨|׳¢׳™׳™׳£ ׳/, () =>
      isLoss
        ? `׳–׳” ׳ ׳•׳¨׳׳׳™. ׳׳ ׳×׳•׳•׳×׳¨ ׳¢׳ ׳™׳•׳ ׳©׳׳ ׳‘׳’׳׳ ׳׳¨׳•׳—׳” ׳׳—׳×.`
        : `׳¢׳׳™׳™׳” ׳‘׳׳¡׳” ׳׳•׳§׳—׳× ׳–׳׳ ג€” ׳¢׳§׳‘׳™׳•׳× ׳”׳™׳ ׳”׳׳₪׳×׳—.`],

    [/׳׳” ׳”׳¦׳¢׳“ ׳”׳‘׳|׳׳” ׳׳¢׳©׳•׳× ׳¢׳›׳©׳™׳•/, () =>
      rem.protein > 20
        ? `׳”׳•׳¡׳£ ׳—׳׳‘׳•׳ ג€” ׳¢׳•׳“ ${rem.protein}g. ׳¢׳•׳£, ׳‘׳™׳¦׳™׳, ׳˜׳•׳ ׳”.`
        : rem.cal > 200
          ? `׳ ׳©׳׳¨ ${rem.cal} ׳§׳׳³ ג€” ׳׳¨׳•׳—׳” ׳§׳׳” ׳¢׳ ׳™׳¨׳§׳•׳×.`
          : `׳›׳׳¢׳˜ ׳¡׳™׳™׳׳× ׳™׳₪׳”! ׳׳ ׳¨׳¢׳‘ ג€” ׳™׳¨׳§׳•׳× ׳—׳•׳₪׳©׳™׳™׳.`],

    [/׳‘׳¡׳₪׳§|׳׳ ׳‘׳˜׳•׳—|׳׳” ׳¢׳“׳™׳£/, () =>
      `׳×׳׳™׳“ ׳‘׳—׳¨ ׳’׳‘׳•׳” ׳™׳•׳×׳¨ ׳‘׳—׳׳‘׳•׳ ׳•׳ ׳׳•׳ ׳™׳•׳×׳¨ ׳‘׳©׳•׳׳ ׳¨׳•׳•׳™.`],

    [/׳§׳׳•׳¨׳™ ׳‘?׳‘׳™׳¦׳”|׳›׳׳” ׳§׳׳•׳¨׳™.*׳‘׳™׳¦׳”/, () => `׳‘׳™׳¦׳” ׳’׳“׳•׳׳”: ~75 ׳§׳׳³. ׳׳‘׳ ׳” ׳‘׳׳‘׳“: ~17 ׳§׳׳³.`],
    [/׳§׳׳•׳¨׳™ ׳‘?׳¢׳•׳£|׳›׳׳” ׳§׳׳•׳¨׳™.*׳¢׳•׳£/, () => `׳—׳–׳” ׳¢׳•׳£ ׳׳‘׳•׳©׳ (100g): ~165 ׳§׳׳³, 31g ׳—׳׳‘׳•׳.`],
    [/׳§׳׳•׳¨׳™ ׳‘?׳׳•׳¨׳–|׳›׳׳” ׳§׳׳•׳¨׳™.*׳׳•׳¨׳–/, () => `׳׳•׳¨׳– ׳׳‘׳ ׳׳‘׳•׳©׳ (100g): ~130 ׳§׳׳³.`],
    [/׳§׳׳•׳¨׳™ ׳‘?׳₪׳™׳×׳”|׳›׳׳” ׳§׳׳•׳¨׳™.*׳₪׳™׳×׳”/, () => `׳₪׳™׳×׳” (~60g): ~165 ׳§׳׳³, 33g ׳₪׳—׳׳™׳׳•׳×.`],
    [/׳§׳׳•׳¨׳™ ׳‘?׳׳—׳|׳›׳׳” ׳§׳׳•׳¨׳™.*׳׳—׳/, () => `׳₪׳¨׳•׳¡׳× ׳׳—׳ ׳׳—׳™׳˜׳” ׳׳׳׳”: ~75 ׳§׳׳³.`],
    [/׳§׳׳•׳¨׳™ ׳‘?׳‘׳ ׳ ׳”|׳›׳׳” ׳§׳׳•׳¨׳™.*׳‘׳ ׳ ׳”/, () => `׳‘׳ ׳ ׳” ׳‘׳™׳ ׳•׳ ׳™׳×: ~105 ׳§׳׳³.`],
    [/׳§׳׳•׳¨׳™ ׳‘?׳©׳§׳“׳™׳|׳›׳׳” ׳§׳׳•׳¨׳™.*׳©׳§׳“׳™׳/, () => `23 ׳©׳§׳“׳™׳ (28g): ~160 ׳§׳׳³, 6g ׳—׳׳‘׳•׳.`],
    [/׳§׳׳•׳¨׳™ ׳‘?׳׳‘׳•׳§׳“׳•|׳›׳׳” ׳§׳׳•׳¨׳™.*׳׳‘׳•׳§׳“׳•/, () => `׳׳‘׳•׳§׳“׳• (~150g): ~240 ׳§׳׳³, 21g ׳©׳•׳׳.`],
    [/׳§׳׳•׳¨׳™ ׳‘?׳™׳•׳’׳•׳¨׳˜|׳›׳׳” ׳§׳׳•׳¨׳™.*׳™׳•׳’׳•׳¨׳˜/, () => `׳™׳•׳’׳•׳¨׳˜ ׳™׳•׳•׳ ׳™ 0% (100g): ~59 ׳§׳׳³, 10g ׳—׳׳‘׳•׳.`],
    [/׳§׳׳•׳¨׳™ ׳‘?׳’׳‘׳™׳ |׳›׳׳” ׳§׳׳•׳¨׳™.*׳’׳‘׳™׳ /, () => `׳’׳‘׳™׳ ׳” ׳׳‘׳ ׳” 5% (100g): ~90 ׳§׳׳³. ׳’׳‘׳™׳ ׳” ׳¦׳”׳•׳‘׳” (30g): ~100 ׳§׳׳³.`],
    [/׳§׳׳•׳¨׳™ ׳‘?׳˜׳•׳ ׳”|׳›׳׳” ׳§׳׳•׳¨׳™.*׳˜׳•׳ ׳”/, () => `׳˜׳•׳ ׳” ׳‘׳§׳•׳₪׳¡׳” (100g): ~110 ׳§׳׳³, 25g ׳—׳׳‘׳•׳.`],
    [/׳§׳׳•׳¨׳™ ׳‘?׳¡׳׳׳•׳|׳›׳׳” ׳§׳׳•׳¨׳™.*׳¡׳׳׳•׳/, () => `׳¡׳׳׳•׳ (100g): ~208 ׳§׳׳³, 25g ׳—׳׳‘׳•׳.`],
    [/׳§׳׳•׳¨׳™ ׳‘?׳©׳•׳§׳•׳׳“|׳›׳׳” ׳§׳׳•׳¨׳™.*׳©׳•׳§׳•׳׳“/, () => `׳©׳•׳§׳•׳׳“ ׳׳¨׳™׳¨ (30g): ~170 ׳§׳׳³. ׳‘׳׳™׳ ׳•׳ ג€” ׳‘׳¡׳“׳¨.`],
    [/׳§׳׳•׳¨׳™ ׳‘?׳—׳•׳׳•׳¡|׳›׳׳” ׳§׳׳•׳¨׳™.*׳—׳•׳׳•׳¡/, () => `׳—׳•׳׳•׳¡ (100g): ~164 ׳§׳׳³, 9g ׳—׳׳‘׳•׳.`],
    [/׳§׳׳•׳¨׳™ ׳‘?׳˜׳—׳™׳ ׳”|׳›׳׳” ׳§׳׳•׳¨׳™.*׳˜׳—׳™׳ ׳”/, () => `׳›׳£ ׳˜׳—׳™׳ ׳” (15g): ~90 ׳§׳׳³.`],
    [/׳§׳׳•׳¨׳™ ׳‘?׳‘׳™׳¦.*׳§׳©׳”|׳‘׳™׳¦׳” ׳§׳©׳”/, () => `׳‘׳™׳¦׳” ׳§׳©׳”: ~78 ׳§׳׳³, 6g ׳—׳׳‘׳•׳.`],
    [/׳§׳׳•׳¨׳™ ׳‘?׳§׳•׳˜׳’|׳›׳׳” ׳§׳׳•׳¨׳™.*׳§׳•׳˜׳’/, () => `׳§׳•׳˜׳’׳³ 3% (100g): ~72 ׳§׳׳³, 12g ׳—׳׳‘׳•׳.`],

    [/׳›׳׳” ׳׳™׳|׳׳™׳ ׳׳™׳•׳|׳©׳×׳™׳×׳™ ׳׳¡׳₪׳™׳§/, () =>
      `׳׳•׳׳׳¥ 35ml ׳׳›׳ ׳§"׳’ ׳’׳•׳£ ג€” ׳‘׳׳׳•׳¦׳¢ 2.5-3 ׳׳™׳˜׳¨ ׳‘׳™׳•׳.`],

    [/׳׳™׳ ׳׳₪׳ ׳™ ׳׳›׳™׳׳”|׳׳©׳×׳•׳× ׳׳₪׳ ׳™ ׳׳¨׳•׳—׳”/, () =>
      `׳›׳•׳¡ ׳׳™׳ ׳׳₪׳ ׳™ ׳׳¨׳•׳—׳” ׳׳₪׳—׳™׳×׳” ׳×׳™׳׳‘׳•׳ ׳‘׳›-20%.`],

    [/׳׳×׳™ ׳׳¨׳“ ׳§׳™׳׳•|׳›׳׳” ׳–׳׳.*׳׳¨׳“׳×|׳׳×׳™ ׳׳•׳¨׳™׳“ ׳§/, () => {
      const deficit = tdee - GOALS.cal;
      if (deficit <= 0) return `׳׳×׳” ׳‘׳׳¡׳׳•׳ ׳¢׳׳™׳™׳” ג€” ׳׳ ׳™׳¨׳™׳“׳”.`;
      return `׳¢׳ ׳’׳¨׳¢׳•׳ ${deficit} ׳§׳׳³ ׳‘׳™׳•׳ ג€” ׳§"׳’ ׳׳—׳“ ׳‘׳›-${Math.round(7700/deficit)} ׳™׳׳™׳.`;
    }],

    [/׳›׳׳” ׳’׳¨׳¢׳•׳|׳׳” ׳”׳’׳¨׳¢׳•׳|׳’׳™׳¨׳¢׳•׳ ׳§׳׳•׳¨׳™/, () => {
      const deficit = tdee - GOALS.cal;
      return deficit > 0
        ? `׳’׳¨׳¢׳•׳ ׳™׳•׳׳™: ${deficit} ׳§׳׳³ (TDEE ${tdee} גˆ’ ׳™׳¢׳“ ${GOALS.cal}).`
        : `׳׳×׳” ׳‘׳¢׳•׳“׳£ ׳©׳ ${Math.abs(deficit)} ׳§׳׳³ (׳׳¡׳׳•׳ ׳¢׳׳™׳™׳”).`;
    }],

    [/tdee|׳›׳׳” ׳©׳•׳¨׳£|׳§׳¦׳‘ ׳—׳™׳׳•׳£/, () =>
      `׳”-TDEE ׳©׳׳: ${tdee} ׳§׳׳³ ׳‘׳™׳•׳.`],

    [/׳”׳׳ ׳׳ ׳™ ׳‘׳›׳™׳•׳•׳|׳׳ ׳™ ׳‘׳¡׳“׳¨.*׳×׳–׳•׳ ׳”|׳¢׳•׳©׳”.*׳˜׳•׳‘.*׳”׳™׳•׳/, () => {
      const ok = pct.cal <= 105 && t.protein >= GOALS.protein * 0.7;
      return ok
        ? `׳›׳, ׳‘׳›׳™׳•׳•׳ ׳׳¦׳•׳™׳! ג… ${pct.cal}% ׳§׳׳•׳¨׳™׳•׳×, ${Math.round(t.protein)}g ׳—׳׳‘׳•׳.`
        : pct.cal > 105
          ? `׳¢׳‘׳¨׳× ׳׳¢׳˜ (${pct.cal}%). ׳׳—׳¨ ׳×׳₪׳¦׳”.`
          : `׳§׳׳•׳¨׳™׳•׳× ׳‘׳¡׳“׳¨, ׳—׳–׳§ ׳׳× ׳”׳—׳׳‘׳•׳ ג€” ׳¢׳•׳“ ${rem.protein}g.`;
    }],

    [/׳׳” ׳–׳” ׳׳׳§׳¨׳•|׳׳׳§׳¨׳•׳ ׳•׳˜׳¨׳™׳׳ ׳˜/, () =>
      `׳׳׳§׳¨׳• = ׳—׳׳‘׳•׳, ׳₪׳—׳׳™׳׳•׳×, ׳©׳•׳׳ ג€” ׳©׳׳•׳©׳× ׳׳‘׳•׳× ׳”׳׳–׳•׳ ׳©׳׳¡׳₪׳§׳™׳ ׳׳ ׳¨׳’׳™׳”.`],

    [/׳׳” ׳–׳” tdee|׳׳” ׳–׳” ׳׳˜׳‘׳•׳׳™׳–׳/, () =>
      `TDEE = ׳›׳׳•׳× ׳”׳§׳׳•׳¨׳™׳•׳× ׳©׳”׳’׳•׳£ ׳©׳•׳¨׳£ ׳‘׳™׳•׳ ׳›׳•׳׳ ׳₪׳¢׳™׳׳•׳×. ׳©׳׳: ${tdee} ׳§׳׳³.`],

    [/׳׳” ׳–׳” ׳’׳¨׳¢׳•׳|׳׳” ׳–׳” ׳’׳™׳¨׳¢׳•׳/, () =>
      `׳’׳¨׳¢׳•׳ ׳§׳׳•׳¨׳™ = ׳׳›׳™׳׳” ׳₪׳—׳•׳× ׳׳׳” ׳©׳”׳’׳•׳£ ׳©׳•׳¨׳£. ׳׳” ׳©׳’׳•׳¨׳ ׳׳™׳¨׳™׳“׳” ׳‘׳׳©׳§׳.`],

    [/׳׳” ׳–׳” ׳¢׳•׳“׳£ ׳§׳׳•׳¨׳™/, () =>
      `׳¢׳•׳“׳£ = ׳׳›׳™׳׳” ׳™׳•׳×׳¨ ׳׳׳” ׳©׳”׳’׳•׳£ ׳©׳•׳¨׳£. ׳’׳•׳¨׳ ׳׳¢׳׳™׳™׳” ׳‘׳׳¡׳”.`],

    [/׳©׳•׳׳ ׳‘׳¨׳™׳|׳©׳•׳׳ ׳˜׳•׳‘|׳׳•׳׳’׳”/, () =>
      `׳©׳•׳׳ ׳‘׳¨׳™׳: ׳׳‘׳•׳§׳“׳•, ׳©׳׳ ׳–׳™׳×, ׳׳’׳•׳–׳™׳, ׳©׳§׳“׳™׳, ׳¡׳׳׳•׳.`],

    [/׳₪׳—׳׳™׳׳•׳× ׳˜׳•׳‘׳•׳×|׳₪׳—׳׳™׳׳•׳× ׳׳•׳¨׳›׳‘׳•׳×|׳₪׳—׳׳™׳׳” ׳‘׳¨׳™׳/, () =>
      `׳₪׳—׳׳™׳׳•׳× ׳׳•׳¨׳›׳‘׳•׳×: ׳׳•׳¨׳– ׳׳׳, ׳‘׳˜׳˜׳”, ׳©׳™׳‘׳•׳׳× ׳©׳•׳¢׳, ׳׳—׳ ׳׳—׳™׳˜׳” ׳׳׳׳”.`],

    [/׳׳“׳“ ׳’׳׳™׳§׳׳™|׳’׳׳™׳§׳׳™/, () =>
      `׳׳“׳“ ׳’׳׳™׳§׳׳™ ג€” ׳¢׳“ ׳›׳׳” ׳׳”׳¨ ׳”׳׳–׳•׳ ׳׳¢׳׳” ׳¡׳•׳›׳¨. ׳ ׳׳•׳ (׳¢׳“ 55) = ׳˜׳•׳‘ ׳׳“׳™׳׳˜׳”.`],

    [/׳¡׳™׳‘׳™׳ ׳×׳–׳•׳ ׳×׳™׳™׳|׳›׳׳” ׳¡׳™׳‘׳™׳/, () =>
      `׳׳•׳׳׳¥ 25-35g ׳¡׳™׳‘׳™׳ ׳‘׳™׳•׳ ג€” ׳™׳¨׳§׳•׳×, ׳§׳˜׳ ׳™׳•׳×, ׳“׳’׳ ׳™׳ ׳׳׳׳™׳.`],

    [/׳¨׳¢׳‘\b|׳׳¨׳’׳™׳© ׳¨׳¢׳‘|׳׳ ׳™ ׳¨׳¢׳‘/, () => {
      if (rem.cal > 400) return `׳׳•׳§׳™ ׳׳•׳§׳™, ׳׳•׳×׳¨ ׳׳׳›׳•׳! נ˜„ ׳ ׳©׳׳¨ ׳׳ ${rem.cal} ׳§׳׳³ ג€” ׳¢׳“׳™׳£ ׳׳©׳׳‘ ׳—׳׳‘׳•׳ ׳¢׳ ׳™׳¨׳§׳•׳×, ׳–׳” ׳™׳©׳‘׳™׳¢ ׳׳•׳×׳ ׳”׳›׳™ ׳˜׳•׳‘ נ’×`;
      if (rem.cal > 150) return `׳™׳© ׳׳ ׳¢׳•׳“ ${rem.cal} ׳§׳׳³ ג€” ׳׳₪׳©׳¨ ׳׳׳›׳•׳ ׳‘׳”׳—׳׳˜! ${_proteinFoodSuggest(rem.protein > 0 ? rem.protein : 15)}`;
      return `׳׳׳, ׳ ׳©׳׳¨ ׳׳ ׳¨׳§ ${rem.cal} ׳§׳׳³ ׳׳”׳™׳•׳ נ˜ ׳׳₪׳ ׳™ ׳©׳׳×׳” ׳׳•׳›׳ ג€” ׳©׳×׳” ׳›׳•׳¡ ׳׳™׳, ׳׳₪׳¢׳׳™׳ ׳”׳’׳•׳£ ׳׳×׳‘׳׳‘׳ ׳‘׳™׳ ׳¦׳׳ ׳׳¨׳¢׳‘. ׳׳ ׳¢׳“׳™׳™׳ ׳¨׳¢׳‘ ג€” ׳™׳¨׳§׳•׳× ׳—׳•׳₪׳©׳™׳™׳!`;
    }],

    [/׳׳ ׳¨׳¢׳‘|׳׳™׳ ׳×׳™׳׳‘׳•׳/, () =>
      isLoss
        ? `׳׳ ׳׳ ׳¨׳¢׳‘ ג€” ׳׳ ׳—׳™׳™׳‘ ׳׳׳›׳•׳. ׳¨׳§ ׳•׳•׳“׳ ${GOALS.protein}g ׳—׳׳‘׳•׳ ׳‘׳™׳•׳.`
        : `׳‘׳¢׳׳™׳™׳” ׳—׳©׳•׳‘ ׳׳׳›׳•׳ ׳’׳ ׳׳ ׳׳ ׳¨׳¢׳‘ ג€” ׳›׳“׳™ ׳׳ ׳׳₪׳¡׳₪׳¡ ׳§׳׳•׳¨׳™׳•׳×.`],

    [/׳–׳׳׳×׳™|׳׳›׳׳×׳™ ׳™׳•׳×׳¨ ׳׳“׳™.*׳¢׳¨׳‘|׳׳›׳׳×׳™.*׳¡׳•׳£ ׳”׳™׳•׳/, () =>
      `׳–׳” ׳§׳•׳¨׳”. ׳׳—׳¨ ׳‘׳•׳§׳¨ ׳׳×׳—׳™׳׳™׳ ׳׳—׳“׳© ג€” ׳׳ ׳׳₪׳¦׳•׳× ׳‘׳“׳™׳׳˜׳” ׳§׳™׳¦׳•׳ ׳™׳×.`],

    [/׳”׳×׳׳׳ ׳×׳™|׳¢׳©׳™׳×׳™ ׳׳™׳׳•׳|׳׳—׳¨׳™ ׳׳™׳׳•׳/, () =>
      rem.protein > 0
        ? `׳›׳ ׳”׳›׳‘׳•׳“! ׳—׳׳‘׳•׳ ׳×׳•׳ 60 ׳“׳§׳•׳× ג€” ׳ ׳©׳׳¨ ${rem.protein}g.`
        : `׳›׳‘׳¨ ׳”׳’׳¢׳× ׳׳—׳׳‘׳•׳ ג€” ׳׳¦׳•׳™׳! ׳©׳׳•׳¨ ׳¢׳ ׳ ׳•׳–׳׳™׳.`],

    [/׳—׳׳‘׳•׳ ׳׳׳™׳׳•׳|׳—׳׳‘׳•׳ ׳׳‘׳ ׳™׳™׳× ׳©׳¨׳™׳¨׳™׳|׳›׳׳” ׳—׳׳‘׳•׳.*׳¡׳₪׳•׳¨׳˜׳׳™/, () =>
      `׳׳‘׳ ׳™׳™׳× ׳©׳¨׳™׳¨׳™׳: 1.6-2.2g ׳׳›׳ ׳§"׳’ ׳’׳•׳£ ׳‘׳™׳•׳. ׳™׳¢׳“ ׳©׳׳: ${GOALS.protein}g.`],

    [/׳׳›׳׳×׳™ ׳‘׳—׳•׳¥|׳׳¡׳¢׳“׳”|׳׳¨׳•׳—׳” ׳—׳‘׳¨׳×׳™׳×/, () =>
      `׳‘׳—׳•׳¥ ג€” ׳‘׳—׳¨ ׳—׳׳‘׳•׳ ׳¨׳–׳” + ׳™׳¨׳§׳•׳× + ׳›׳׳•׳× ׳׳“׳•׳“׳” ׳©׳ ׳₪׳—׳׳™׳׳•׳×. ׳׳ ׳׳”׳¨׳’׳™׳© ׳׳©׳.`],

    [/׳—׳×׳•׳ ׳”|׳׳™׳¨׳•׳¢|׳©׳‘׳×|׳—׳’/, () =>
      `׳‘׳׳¨׳•׳—׳•׳× ׳—׳’׳™׳’׳™׳•׳× ג€” ׳×׳”׳ ׳”! ׳”׳×׳׳§׳“ ׳‘׳—׳׳‘׳•׳, ׳”׳’׳‘׳ ׳׳—׳ ׳•׳§׳™׳ ׳•׳—, ׳©׳×׳” ׳׳™׳ ׳‘׳™׳ ׳׳ ׳•׳×.`],

    [/׳©׳׳•׳|׳”׳™׳™|׳”׳™\b|׳‘׳•׳§׳¨ ׳˜׳•׳‘|׳¢׳¨׳‘ ׳˜׳•׳‘|׳׳” ׳©׳׳•׳/, () => {
      const coach = _coachLine(rem, over, pct, t);
      let msg = `${timeGreet} ${name}! נ˜ `;
      if (pct.cal === 0) msg += `׳¢׳“׳™׳™׳ ׳׳ ׳¨׳©׳׳× ׳›׳׳•׳ ׳”׳™׳•׳ ג€” ׳‘׳•׳ ׳ ׳×׳—׳™׳!`;
      else if (coach) msg += coach;
      else msg += `׳׳×׳” ׳‘-${pct.cal}% ׳׳”׳™׳¢׳“ ׳”׳™׳•׳׳™. ׳׳™׳ ׳׳ ׳™ ׳™׳›׳•׳׳” ׳׳¢׳–׳•׳¨?`;
      return msg;
    }],

    [/׳×׳•׳“׳”|׳×׳•׳“׳” ׳¨׳‘׳”/, () =>
      `׳‘׳©׳׳—׳” ${name}! נ’ ׳׳ ׳™ ׳›׳׳ ׳׳ ׳×׳¦׳˜׳¨׳ ׳¢׳•׳“.`],

    [/׳׳™׳ ׳׳ ׳™ ׳¡׳•׳’׳¨.*׳—׳׳‘׳•׳|׳׳” ׳׳•׳›׳.*׳׳¡׳’׳•׳¨|׳׳” ׳׳›׳•׳.*׳—׳׳‘׳•׳|׳׳” ׳¢׳•׳“.*׳—׳׳‘׳•׳/, () =>
      rem.protein <= 0
        ? `׳›׳‘׳¨ ׳¡׳’׳¨׳× ׳׳× ׳”׳—׳׳‘׳•׳! ג… ${Math.round(t.protein)}g ג€” ׳™׳•׳₪׳™!`
        : `׳ ׳©׳׳¨ ${rem.protein}g ג€” ${_proteinFoodSuggest(rem.protein)}`],

    [/׳›׳׳” ׳¢׳•׳“.*׳—׳׳‘׳•׳|׳¢׳•׳“ ׳›׳׳”.*׳—׳׳‘׳•׳/, () =>
      rem.protein <= 0
        ? `׳¡׳™׳™׳׳× ׳׳× ׳”׳—׳׳‘׳•׳! ג… ׳›׳ ׳”׳›׳‘׳•׳“!`
        : `׳ ׳©׳׳¨ ${rem.protein}g ׳—׳׳‘׳•׳ ג€” ${_proteinFoodSuggest(rem.protein)}`],

    [/׳¢׳׳“׳×׳™ ׳‘׳™׳¢׳“|׳”׳’׳¢׳×׳™ ׳׳™׳¢׳“/, () =>
      rem.cal === 0
        ? `׳›׳!! ׳¢׳׳“׳× ׳‘׳™׳¢׳“ ׳”׳™׳•׳! ננ‰ ${Math.round(t.cal)} ׳§׳׳³ ג€” ׳׳“׳”׳™׳ ׳׳×׳”!`
        : over.cal > 0
          ? `׳›׳׳¢׳˜ ג€” ׳¢׳‘׳¨׳× ׳‘-${over.cal} ׳§׳׳³ ׳‘׳׳‘׳“. ׳‘׳₪׳¢׳ ׳”׳‘׳׳” ׳×׳”׳™׳” ׳׳“׳•׳™׳§ נ¯`
          : `׳¢׳•׳“ ׳׳ ג€” ׳ ׳©׳׳¨ ${rem.cal} ׳§׳׳³. ׳›׳׳¢׳˜ ׳©׳! נ’×`],

    [/׳”׳׳ ׳׳ ׳™ ׳‘׳›׳™׳•׳•׳|׳׳ ׳™ ׳‘׳¡׳“׳¨.*׳×׳–׳•׳ ׳”|׳¢׳•׳©׳”.*׳˜׳•׳‘.*׳”׳™׳•׳/, () => {
      const ok = pct.cal <= 105 && t.protein >= GOALS.protein * 0.7;
      const coach = _coachLine(rem, over, pct, t);
      let msg = ok
        ? `׳›׳, ׳‘׳›׳™׳•׳•׳ ׳׳¦׳•׳™׳! ג… ${pct.cal}% ׳§׳׳•׳¨׳™׳•׳×, ${Math.round(t.protein)}g ׳—׳׳‘׳•׳.`
        : pct.cal > 105
          ? `׳¢׳‘׳¨׳× ׳׳¢׳˜ (${pct.cal}%). ׳׳ ׳ ׳•׳¨׳ ג€” ׳׳—׳¨ ׳×׳₪׳¦׳” נ˜`
          : `׳§׳׳•׳¨׳™׳•׳× ׳‘׳¡׳“׳¨, ׳—׳–׳§ ׳׳× ׳”׳—׳׳‘׳•׳ ג€” ׳¢׳•׳“ ${rem.protein}g.`;
      if (coach) msg += `\n${coach}`;
      return msg;
    }],

    [/׳›׳\b|׳׳•׳§׳™|׳׳¢׳•׳׳”|׳׳׳©׳™׳›|׳‘׳¡׳“׳¨ ׳’׳׳•׳¨/, () =>
      `׳׳¦׳•׳™׳! ${rem.cal > 0 ? `׳ ׳©׳׳¨ ׳׳ ${rem.cal} ׳§׳׳³ ׳׳”׳™׳•׳.` : `׳”׳’׳¢׳× ׳׳™׳¢׳“! נ‘`}`],
  ];

  for (const [re, fn] of Q) {
    if (re.test(text)) return fn();
  }
  return null;
}

let _miriLastSend = { text: '', time: 0 };
let _miriIntroShown = false;

function getUserGender() {
  const d = _safeDietData();
  return d.gender === '׳ ׳§׳‘׳”' ? '׳ ׳§׳‘׳”' : '׳–׳›׳¨';
}

function setMiriGenderUi() {
  const isFemale = getUserGender() === '׳ ׳§׳‘׳”';
  const sendBtn = document.querySelector('.miri-chat-send');
  const input = document.querySelector('.miri-chat-input');
  if (sendBtn) sendBtn.textContent = isFemale ? '׳©׳׳—׳™' : '׳©׳׳—';
  if (input) input.placeholder = isFemale ? '׳›׳×׳‘׳™ ׳”׳•׳“׳¢׳”ג€¦' : '׳›׳×׳•׳‘ ׳”׳•׳“׳¢׳”ג€¦';
}

function openMiriChat() {
  const wrap = document.getElementById('miri-fab-wrap');
  const popup = document.getElementById('miri-popup');
  if (!wrap || !popup) return;
  popup.style.display = 'flex';
  wrap.classList.add('chat-open');
  setMiriGenderUi();
  if (!_miriIntroShown && !document.getElementById('miri-chat-msgs').children.length) {
    _miriIntroShown = true;
    showMiriIntro();
  }
}

function showMiriIntro() {
  const msgs = document.getElementById('miri-chat-msgs');
  const name = ((_currentUser.fullName || '').trim().split(/\s+/)[0] || '');
  const isFemale = getUserGender() === '׳ ׳§׳‘׳”';
  const text = isFemale
    ? `׳”׳™׳™, ${name}, ׳›׳׳ ׳׳™׳¨׳™ ׳”׳“׳™׳׳˜׳ ׳™׳×. ׳‘׳¨׳•׳›׳” ׳”׳‘׳׳” ׳׳׳₪׳׳™׳§׳¦׳™׳” ׳©׳׳™, ׳×׳•׳›׳׳™ ׳׳”׳×׳™׳™׳¢׳¥ ׳׳™׳×׳™ ׳׳×׳™ ׳©׳¨׳§ ׳×׳¨׳¦׳™.\n׳×׳•׳›׳׳™ ׳׳©׳׳•׳ ׳׳•׳×׳™ ׳©׳׳׳•׳× ׳›׳׳•: ׳׳” ׳”׳׳¦׳‘ ׳©׳׳™ ׳ ׳›׳•׳ ׳׳¢׳›׳©׳™׳•? ׳׳” ׳׳₪׳©׳¨ ׳׳׳›׳•׳? ׳׳” ׳—׳¡׳¨ ׳׳™? ׳׳” ׳׳× ׳׳׳׳™׳¦׳”? ׳•׳›׳• ׳•׳›׳•.\n׳ ׳¡׳™ ׳׳•׳×׳™ ׳¢׳›׳©׳™׳•`
    : `׳”׳™׳™, ${name}, ׳›׳׳ ׳׳™׳¨׳™ ׳”׳“׳™׳׳˜׳ ׳™׳×. ׳‘׳¨׳•׳›׳™׳ ׳”׳‘׳׳™׳ ׳׳׳₪׳׳™׳§׳¦׳™׳” ׳©׳׳™, ׳×׳•׳›׳ ׳׳”׳×׳™׳™׳¢׳¥ ׳׳™׳×׳™ ׳׳×׳™ ׳©׳¨׳§ ׳×׳¨׳¦׳”.\n׳×׳•׳›׳ ׳׳©׳׳•׳ ׳׳•׳×׳™ ׳©׳׳׳•׳× ׳›׳׳•: ׳׳” ׳”׳׳¦׳‘ ׳©׳׳™ ׳ ׳›׳•׳ ׳׳¢׳›׳©׳™׳•? ׳׳” ׳׳₪׳©׳¨ ׳׳׳›׳•׳? ׳׳” ׳—׳¡׳¨ ׳׳™? ׳׳” ׳׳× ׳׳׳׳™׳¦׳”? ׳•׳›׳• ׳•׳›׳•.\n׳ ׳¡׳” ׳׳•׳×׳™ ׳¢׳›׳©׳™׳•`;
  const typingDiv = document.createElement('div');
  typingDiv.className = 'miri-msg miri-msg-bot';
  typingDiv.innerHTML = '<div class="miri-msg-bot-inner"><span class="miri-msg-name-row"><img class="miri-msg-avatar" src="images/miri-fab.webp"><span class="miri-msg-label">׳׳™׳¨׳™:</span></span><span class="miri-dots"><span>.</span><span>.</span><span>.</span></span></div>';
  msgs.appendChild(typingDiv);
  msgs.scrollTop = msgs.scrollHeight;
  setTimeout(() => {
    typingDiv.innerHTML = `<div class="miri-msg-bot-inner"><span class="miri-msg-name-row"><img class="miri-msg-avatar" src="images/miri-fab.webp"><span class="miri-msg-label">׳׳™׳¨׳™:</span></span><span class="miri-msg-text"></span><div class="miri-quick-actions">
      <button class="miri-quick-btn" onclick="miriSend('׳׳” ׳”׳׳¦׳‘ ׳©׳׳™ ׳ ׳›׳•׳ ׳׳¢׳›׳©׳™׳•?')">׳׳” ׳”׳׳¦׳‘ ׳©׳׳™?</button>
      <button class="miri-quick-btn" onclick="miriSend('׳׳” ׳׳₪׳©׳¨ ׳׳׳›׳•׳?')">׳׳” ׳׳₪׳©׳¨ ׳׳׳›׳•׳?</button>
      <button class="miri-quick-btn" onclick="miriSend('׳׳” ׳—׳¡׳¨ ׳׳™?')">׳׳” ׳—׳¡׳¨ ׳׳™?</button>
      <button class="miri-quick-btn" onclick="miriSend('׳׳” ׳׳× ׳׳׳׳™׳¦׳”?')">׳׳” ׳׳× ׳׳׳׳™׳¦׳”?</button>
    </div></div>`;
    typingDiv.querySelector('.miri-msg-text').textContent = text;
    msgs.scrollTop = msgs.scrollHeight;
  }, 3000);
}

function miriSend(forcedText) {
  const input = document.querySelector('.miri-chat-input');
  const msgs = document.getElementById('miri-chat-msgs');
  if (typeof forcedText !== 'string') forcedText = '';
  const text = (forcedText || input.value).trim();
  if (!text) return;
  const now = Date.now();
  if (_miriLastSend.text === text && now - _miriLastSend.time < 900) return;
  _miriLastSend = { text, time: now };

  const userDiv = document.createElement('div');
  userDiv.className = 'miri-msg miri-msg-user';
  userDiv.innerHTML = `<span class="miri-msg-label">${getUserGender() === '׳ ׳§׳‘׳”' ? '׳׳×:' : '׳׳×׳”:'}</span><span class="miri-msg-text"></span>`;
  userDiv.querySelector('.miri-msg-text').textContent = text;
  msgs.appendChild(userDiv);

  const sep = document.createElement('div');
  sep.className = 'miri-msg-sep';
  msgs.appendChild(sep);

  const typingDiv = document.createElement('div');
  typingDiv.className = 'miri-msg miri-msg-bot';
  typingDiv.innerHTML = '<div class="miri-msg-bot-inner"><span class="miri-msg-name-row"><img class="miri-msg-avatar" src="images/miri-fab.webp"><span class="miri-msg-label">׳׳™׳¨׳™:</span></span><span class="miri-dots"><span>.</span><span>.</span><span>.</span></span></div>';
  msgs.appendChild(typingDiv);

  msgs.scrollTop = msgs.scrollHeight;
  if (!forcedText) input.value = '';

  const isRejection = /׳׳ ׳‘׳ ׳׳™|׳׳ ׳¨׳•׳¦׳”|׳׳ ׳׳•׳”׳‘|׳׳™׳ ׳׳™|׳×׳—׳׳™׳£|׳‘׳׳™/.test(text);
  const isRecommendRequest = /׳”׳׳׳¦|׳׳” ׳׳׳›׳•׳|׳׳” ׳›׳“׳׳™|׳×׳׳׳™׳¦|׳׳” ׳׳₪׳©׳¨|׳×׳¦׳™׳¢׳™|׳×׳¦׳™׳¢|׳׳” ׳¢׳•׳“/.test(text);

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
        let reply = `׳”׳ ׳” ׳”׳¡׳™׳›׳•׳ ׳©׳׳ ${_currentUser.fullName.split(' ')[0]} נ“\n`;
        reply += `ג€¢ ׳§׳׳•׳¨׳™׳•׳×: ${Math.round(_t.cal)} / ${GOALS.cal} ׳§׳׳³\n`;
        reply += `ג€¢ ׳—׳׳‘׳•׳: ${Math.round(_t.protein)}g / ${GOALS.protein}g\n`;
        reply += `ג€¢ ׳₪׳—׳׳™׳׳•׳×: ${Math.round(_t.carbs)}g / ${GOALS.carbs}g\n`;
        reply += `ג€¢ ׳©׳•׳׳: ${Math.round(_t.fat)}g / ${GOALS.fat}g`;
        const coach = _coachLine(_rem, _over, _pct, _t);
        if (coach) reply += `\n\n${coach}`;
        replyText = reply;
      }
    }
  }

  setTimeout(() => {
    typingDiv.innerHTML = '<div class="miri-msg-bot-inner"><span class="miri-msg-name-row"><img class="miri-msg-avatar" src="images/miri-fab.webp"><span class="miri-msg-label">׳׳™׳¨׳™:</span></span><span class="miri-msg-text"></span></div>';
    typingDiv.querySelector('.miri-msg-text').textContent = replyText;
    msgs.scrollTop = msgs.scrollHeight;
  }, 3000);
}

document.querySelector('.miri-chat-voice').addEventListener('click', toggleMiriVoice);
document.querySelector('.miri-chat-send').addEventListener('click', miriSend);
document.querySelector('.miri-chat-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') miriSend();
});
setMiriGenderUi();

function bindPressEffect(selector, cls) {
  document.querySelectorAll(selector).forEach(el => {
    const clear = () => el.classList.remove(cls);
    el.addEventListener('pointerdown', () => el.classList.add(cls));
    ['pointerup','pointercancel','pointerleave'].forEach(evt => el.addEventListener(evt, clear));
  });
}

bindPressEffect('.bn-tab', 'nav-press');
bindPressEffect('.profile-row', 'row-press');

/* ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€
   ONBOARDING ג€” GOAL SELECTION
   ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ */
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
      <div class="onb-q">׳׳” ׳”׳™׳¢׳“ ׳”׳©׳‘׳•׳¢׳™ ׳©׳׳?</div>
      <input type="number" id="weekly-goal-input" min="0.1" max="2" step="0.1" placeholder="׳§׳´׳’ ׳‘׳©׳‘׳•׳¢">
      <button class="onb-btn" onclick="submitWeeklyGoal()">׳”׳׳©׳</button>`;
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

/* ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€
   FOOD PREFERENCES
   ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ */
function saveFoodPreferences(selected) {
  const d = JSON.parse(localStorage.getItem('foodPreferences') || '{}');
  d.selected = Array.isArray(selected) ? selected : [];
  d.all = [...d.selected, ...(d.freeText || [])];
  localStorage.setItem('foodPreferences', JSON.stringify(d));
}

function submitFoodFreeText() {
  const inp = document.getElementById('food-pref-text');
  if (!inp) return;
  const items = inp.value.split(/[,״\n״]+/).map(s => s.trim()).filter(Boolean);
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
      <div style="font-weight:700;margin-bottom:8px">׳™׳© ׳¢׳•׳“ ׳“׳‘׳¨׳™׳ ׳©׳׳×׳” ׳׳•׳”׳‘?</div>
      <textarea id="food-pref-text" rows="2" placeholder="׳׳“׳•׳’׳׳”: ׳×׳₪׳•׳—, ׳’׳‘׳™׳ ׳”, ׳׳•׳¨׳–" style="width:100%;border:1.5px solid #e0e0e0;border-radius:8px;padding:8px;font-size:1rem;font-family:inherit;box-sizing:border-box;resize:none"></textarea>
      <button onclick="submitFoodFreeText()" style="margin-top:8px;padding:8px 18px;background:#4caf50;color:#fff;border:none;border-radius:8px;font-size:.95rem;cursor:pointer;font-family:inherit;font-weight:600">׳©׳׳•׳¨</button>`;
    document.body.appendChild(box);
  }
  box.style.display = '';
}

/* ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€
   DAILY MENUS GENERATOR
   ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ */
function generateDailyMenus() {
  const mealLabel = { breakfast:'׳׳¨׳•׳—׳× ׳‘׳•׳§׳¨', lunch:'׳׳¨׳•׳—׳× ׳¦׳”׳¨׳™׳™׳', snack:'׳׳¨׳•׳—׳× ׳‘׳™׳ ׳™׳™׳', dinner:'׳׳¨׳•׳—׳× ׳¢׳¨׳‘', night:'׳׳¨׳•׳—׳× ׳׳™׳׳”' };
  const shares = { breakfast:.24, lunch:.34, snack:.12, dinner:.22, night:.08 };
  const templates = [
    {
      breakfast:{ protein:'׳‘׳™׳¦׳” ׳§׳©׳”', carb:'׳׳—׳ ׳—׳™׳˜׳”', fat:'׳׳‘׳•׳§׳“׳•', extras:['׳¢׳’׳‘׳ ׳™׳™׳”','׳׳׳₪׳₪׳•׳'] },
      lunch:{ protein:'׳—׳–׳” ׳¢׳•׳£', carb:'׳׳•׳¨׳– ׳‘׳¡׳׳˜׳™', fat:'׳׳‘׳•׳§׳“׳•', extras:['׳¡׳׳˜ ׳¢׳’׳‘׳ ׳™׳•׳× ׳•׳׳׳₪׳₪׳•׳ ׳™׳'] },
      snack:{ protein:'׳™׳•׳’׳•׳¨׳˜', carb:'׳‘׳ ׳ ׳”', fat:'׳—׳•׳׳•׳¡ ׳׳׳¨׳—', extras:[] },
      dinner:{ protein:'׳˜׳•׳ ׳” ׳‘׳׳™׳', carb:'׳₪׳™׳×׳” ׳׳׳׳”', fat:'׳׳‘׳•׳§׳“׳•', extras:['׳׳׳₪׳₪׳•׳','׳¢׳’׳‘׳ ׳™׳™׳”'] },
      night:{ protein:'׳™׳•׳’׳•׳¨׳˜', carb:'׳׳—׳ ׳₪׳¨׳™׳', fat:'׳’׳‘׳™׳ ׳” ׳׳‘׳ ׳”', extras:[] }
    },
    {
      breakfast:{ protein:'׳˜׳•׳ ׳” ׳‘׳׳™׳', carb:'׳₪׳™׳×׳”', fat:'׳—׳•׳׳•׳¡ ׳׳׳¨׳—', extras:['׳¢׳’׳‘׳ ׳™׳™׳”','׳׳׳₪׳₪׳•׳'] },
      lunch:{ protein:'׳©׳ ׳™׳¦׳', carb:'׳₪׳×׳™׳×׳™׳', fat:'׳׳‘׳•׳§׳“׳•', extras:['׳¡׳׳˜ ׳¢׳’׳‘׳ ׳™׳•׳× ׳•׳׳׳₪׳₪׳•׳ ׳™׳'] },
      snack:{ protein:'׳™׳•׳’׳•׳¨׳˜ ׳¢׳ ׳₪׳™׳¨׳•׳×', carb:'׳×׳₪׳•׳—', fat:'׳—׳•׳׳•׳¡ ׳׳׳¨׳—', extras:[] },
      dinner:{ protein:'׳§׳•׳˜׳’', carb:'׳׳—׳ ׳©׳™׳₪׳•׳', fat:'׳׳‘׳•׳§׳“׳•', extras:['׳׳׳₪׳₪׳•׳','׳¢׳’׳‘׳ ׳™׳™׳”'] },
      night:{ protein:'׳’׳‘׳™׳ ׳” ׳׳‘׳ ׳”', carb:'׳׳—׳ ׳₪׳¨׳™׳', fat:'׳׳‘׳•׳§׳“׳•', extras:[] }
    },
    {
      breakfast:{ protein:'׳—׳‘׳™׳×׳” ׳׳׳׳”', carb:'׳׳—׳', fat:'׳׳‘׳•׳§׳“׳•', extras:['׳¢׳’׳‘׳ ׳™׳™׳”','׳׳׳₪׳₪׳•׳'] },
      lunch:{ protein:'׳§׳‘׳‘', carb:'׳§׳•׳¡׳§׳•׳¡', fat:'׳׳‘׳•׳§׳“׳•', extras:['׳¡׳׳˜ ׳¢׳’׳‘׳ ׳™׳•׳× ׳•׳׳׳₪׳₪׳•׳ ׳™׳'] },
      snack:{ protein:'׳™׳•׳’׳•׳¨׳˜', carb:'׳׳₪׳¨׳¡׳§', fat:'׳—׳•׳׳•׳¡ ׳׳׳¨׳—', extras:[] },
      dinner:{ protein:'׳‘׳™׳¦׳” ׳§׳©׳”', carb:'׳₪׳™׳×׳” ׳׳׳׳”', fat:'׳’׳‘׳™׳ ׳” ׳׳‘׳ ׳”', extras:['׳׳׳₪׳₪׳•׳','׳¢׳’׳‘׳ ׳™׳™׳”'] },
      night:{ protein:'׳§׳•׳˜׳’', carb:'׳׳—׳ ׳₪׳¨׳™׳', fat:'׳׳‘׳•׳§׳“׳•', extras:[] }
    }
  ];
  const find = name => DB.find(f => f.n && f.n.some(n => n === name || n.includes(name) || name.includes(n)));
  const calc = (food, grams) => {
    const r = grams / 100;
    return { name: food.n[0], grams: Math.max(5, Math.round(grams)), cal: Math.round(food.cal * r), protein: round1(food.p * r), carbs: round1(food.c * r), fat: round1(food.f * r) };
  };
  const sum = items => items.reduce((s, it) => ({ cal:s.cal+it.cal, protein:s.protein+it.protein, carbs:s.carbs+it.carbs, fat:s.fat+it.fat }), { cal:0, protein:0, carbs:0, fat:0 });
  return templates.map((tpl, idx) => {
    const meals = [];
    for (const type of ['breakfast','lunch','snack','dinner','night']) {
      const targetP = GOALS.protein * shares[type];
      const targetC = GOALS.carbs * shares[type];
      const targetF = GOALS.fat * shares[type];
      const plan = tpl[type];
      const items = [];
      (plan.extras || []).forEach(x => { const f = find(x); if (f) items.push(calc(f, x.includes('׳¡׳׳˜') ? 100 : 80)); });
      const pf = find(plan.protein), cf = find(plan.carb), ff = find(plan.fat);
      let current = sum(items);
      if (pf && pf.p > 0) items.push(calc(pf, Math.min(260, Math.max(40, (Math.max(3, targetP - current.protein) * 100) / pf.p))));
      current = sum(items);
      if (cf && cf.c > 0) items.push(calc(cf, Math.min(320, Math.max(20, (Math.max(4, targetC - current.carbs) * 100) / cf.c))));
      current = sum(items);
      if (ff && ff.f > 0) items.push(calc(ff, Math.min(120, Math.max(10, (Math.max(2, targetF - current.fat) * 100) / ff.f))));
      meals.push({ type, label: mealLabel[type], items });
    }
    return { index: idx + 1, meals, total: { cal: Math.round(GOALS.cal), protein: round1(GOALS.protein), carbs: round1(GOALS.carbs), fat: round1(GOALS.fat) } };
  });
}

let _currentMenuData = null;

function showMenuPage(idx) {
  const menus = generateDailyMenus();
  const menu = menus[idx] || menus[0];
  if (!menu) return;
  _currentMenuData = menu;
  document.querySelectorAll('.menus-page-tabs .menu-btn').forEach((btn, i) => {
    btn.classList.toggle('active', i === idx);
  });
  const body = document.getElementById('menu-page-body');
  if (!body) return;
  body.innerHTML = menu.meals.map(meal => {
    const mealCal   = meal.items.reduce((s, it) => s + it.cal,     0);
    const mealProt  = meal.items.reduce((s, it) => s + it.protein,  0);
    const mealCarbs = meal.items.reduce((s, it) => s + it.carbs,    0);
    const mealFat   = meal.items.reduce((s, it) => s + it.fat,      0);
    return `<div class="menu-meal">
      <div class="menu-meal-label">${escHtml(meal.label)}</div>
      ${meal.items.map(it => `<div class="menu-meal-item">ג€¢ ${escHtml(it.name)} - ${it.grams}g (${it.cal} ׳§׳׳³, ׳—׳׳‘׳•׳ ${it.protein}g, ׳₪׳—׳׳³ ${it.carbs}g, ׳©׳•׳׳ ${it.fat}g)</div>`).join('')}
      <div class="menu-meal-total">׳¡׳”׳´׳›: ${mealCal} ׳§׳׳³ | ׳—׳׳‘׳•׳ ${mealProt}g | ׳₪׳—׳׳³ ${mealCarbs}g | ׳©׳•׳׳ ${mealFat}g</div>
    </div>`;
  }).join('') + (menu.total ? `<div class="menu-meal menu-day-total"><div class="menu-meal-label">׳¡׳”׳´׳› ׳™׳•׳׳™</div><div class="menu-meal-total">${menu.total.cal} ׳§׳׳³ | ׳—׳׳‘׳•׳ ${menu.total.protein}g | ׳₪׳—׳׳³ ${menu.total.carbs}g | ׳©׳•׳׳ ${menu.total.fat}g</div></div>` : '');
}

function openMenuModal(idx) {
  const menus = generateDailyMenus();
  const menu = menus[idx];
  if (!menu) return;
  _currentMenuData = menu;
  document.getElementById('menu-modal-title').textContent = '׳×׳₪׳¨׳™׳˜ ' + menu.index;
  const body = document.getElementById('menu-modal-body');
  body.innerHTML = menu.meals.map(meal => {
    const mealCal   = meal.items.reduce((s, it) => s + it.cal,     0);
    const mealProt  = meal.items.reduce((s, it) => s + it.protein,  0);
    const mealCarbs = meal.items.reduce((s, it) => s + it.carbs,    0);
    const mealFat   = meal.items.reduce((s, it) => s + it.fat,      0);
    return `<div class="menu-meal">
      <div class="menu-meal-label">${escHtml(meal.label)}</div>
      ${meal.items.map(it => `<div class="menu-meal-item">ג€¢ ${escHtml(it.name)} ג€” ${it.grams}g (${it.cal} ׳§׳׳³, ׳—׳׳‘׳•׳ ${it.protein}g, ׳₪׳—׳׳³ ${it.carbs}g, ׳©׳•׳׳ ${it.fat}g)</div>`).join('')}
      <div class="menu-meal-total">׳¡׳”"׳›: ${mealCal} ׳§׳׳³ | ׳—׳׳‘׳•׳ ${mealProt}g | ׳₪׳—׳׳³ ${mealCarbs}g | ׳©׳•׳׳ ${mealFat}g</div>
    </div>`;
  }).join('') + (menu.total ? `<div class="menu-meal" style="background:#f0f0ff"><div class="menu-meal-label">׳¡׳”׳´׳› ׳™׳•׳׳™</div><div class="menu-meal-total">${menu.total.cal} ׳§׳׳³ | ׳—׳׳‘׳•׳ ${menu.total.protein}g | ׳₪׳—׳׳³ ${menu.total.carbs}g | ׳©׳•׳׳ ${menu.total.fat}g</div></div>` : '');
  document.getElementById('menu-modal-overlay').hidden = false;
}

function closeMenuModal() {
  document.getElementById('menu-modal-overlay').hidden = true;
}

function downloadMenuPDF() {
  if (!_currentMenuData) return;
  const menu = _currentMenuData;
  const html = `<!DOCTYPE html><html dir="rtl" lang="he"><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;direction:rtl;padding:24px;color:#333}.pdf-head{display:flex;align-items:center;gap:12px;margin-bottom:16px}.pdf-head img{width:54px;height:54px;border-radius:50%;object-fit:cover}h2{color:#4a9b7f;margin:0;font-size:1.35rem}.meal{margin-bottom:12px;border:1px solid #ddd;border-radius:10px;padding:10px 14px;box-shadow:0 12px 18px -16px rgba(0,0,0,.35)}.meal-lbl{font-weight:700;color:#4a9b7f;margin-bottom:6px;font-size:.95rem}.meal-item{font-size:.88rem;color:#333;padding:3px 0;border-bottom:1px solid #f0f0f0}.meal-item:last-child{border:none}.meal-total{font-size:.78rem;color:#777;margin-top:6px;padding-top:4px;border-top:1px solid #f0f0f0}.footer{font-size:.78rem;color:#aaa;text-align:center;margin-top:16px}</style></head><body><div class="pdf-head"><img src="images/miri-fab.webp"><h2>׳×׳₪׳¨׳™׳˜ ׳׳¡ ${menu.index}</h2></div>${menu.meals.map(meal=>{const t=meal.items.reduce((s,it)=>s+it.cal,0);return`<div class="meal"><div class="meal-lbl">${meal.label}</div>${meal.items.map(it=>`<div class="meal-item">ג€¢ ${it.name} ג€” ${it.grams}g (${it.cal} ׳§׳׳³, ׳—׳׳‘׳•׳ ${it.protein}g, ׳₪׳—׳׳³ ${it.carbs}g, ׳©׳•׳׳ ${it.fat}g)</div>`).join('')}<div class="meal-total">׳¡׳”"׳›: ${t} ׳§׳׳³</div></div>`}).join('')}<div class="footer">׳™׳¢׳“ ׳™׳•׳׳™: ${GOALS.cal} ׳§׳׳³ | ׳—׳׳‘׳•׳ ${GOALS.protein}g | ׳₪׳—׳׳³ ${GOALS.carbs}g | ׳©׳•׳׳ ${GOALS.fat}g</div></body></html>`;
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
    showAutoMissingQty(aiMsg, aiText, document.getElementById('warn-box'), '׳™׳© ׳׳”׳–׳™׳ ׳›׳׳•׳× ׳׳₪׳ ׳™ ׳”׳•׳¡׳₪׳× ׳”׳׳׳›׳. ׳׳׳©׳: 100 ׳’׳¨׳ ׳׳•׳¨׳– ׳׳• ׳—׳¦׳™ ׳¦׳׳—׳× ׳׳•׳¨׳–');
    return;
  }
  const food = selectedManualFood || manualFindFood(raw);
  if (!food) {
    aiMsg.classList.add('show');
    aiText.textContent = '׳”׳׳׳›׳ ׳׳ ׳ ׳׳¦׳ ׳‘׳׳׳’׳¨';
    return;
  }
  let grams;
  if (unit === '׳’׳¨׳') grams = qtyNum;
  else if (unit === '׳"׳' || unit === '׳׳™׳׳™׳׳™׳˜׳¨') grams = qtyNum;
  else if (unit === '׳™׳—׳™׳“׳•׳×' || unit === '׳™׳—׳™׳“׳”' || unit === '׳₪׳¨׳•׳¡׳•׳×' || unit === '׳₪׳¨׳•׳¡׳”') grams = qtyNum * (food.dw || 100);
  else if (unit === '׳›׳•׳¡' || unit === '׳›׳•׳¡׳•׳×') grams = qtyNum * 240;
  else if (unit === '׳›׳£' || unit === '׳›׳₪׳•׳×') grams = qtyNum * 15;
  else if (unit === '׳›׳₪׳™׳×' || unit === '׳›׳₪׳™׳•׳×') grams = qtyNum * 5;
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
    quantityDisplay: isPlateUnit(unit) ? document.getElementById('plate-fraction').selectedOptions[0].text + " ׳¦׳׳—׳×" : formatQuantityDisplay(qtyNum, unit),
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

/* ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€
   INIT
   ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ */
render();
initVoice();
updateProfileView();
(function() {
  const _minp = document.getElementById('food-input');
  const _qtySel = document.getElementById('qty-sel');
  if (_qtySel && !_qtySel.dataset.plateBound) {
    _qtySel.dataset.plateBound = '1';
    _qtySel.addEventListener('change', () => handleQtyUnitChange(_qtySel));
    handleQtyUnitChange(_qtySel);
  }
  buildCustomSelect('qty-unit', handleQtyUnitChange);
  buildCustomSelect('plate-fraction');
  buildCustomSelect('meal-type');
  moveMealSelectToMode('manual');
  document.addEventListener('click', closeAllCustomSelects);
  const _mbtn = document.querySelector('#manual-section .btn-go');
  if (_mbtn && !_mbtn.dataset.bound) {
    _mbtn.dataset.bound = '1';
    _mbtn.textContent = '׳”׳•׳¡׳₪׳”';
    _mbtn.removeAttribute('onclick');
    _mbtn.addEventListener('click', addFood);
  }
  const _autoBtn = document.getElementById('auto-submit-btn');
  const _autoInp = document.getElementById('auto-input');
  const _autoMic = document.getElementById('auto-mic-btn');
  if (_autoBtn && !_autoBtn.dataset.bound) {
    _autoBtn.dataset.bound = '1';
    _autoBtn.textContent = '׳”׳•׳¡׳₪׳”';
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

