/* inject avatar */
document.getElementById('main-avatar').innerHTML = AVATAR_SVG;
document.getElementById('mini-av').innerHTML = AVATAR_SVG;

/* ─────────────────────────────────────────────────────────
   STATE + STORAGE
   ─────────────────────────────────────────────────────── */
const TODAY = new Date().toDateString();
let log = (() => {
  try {
    const d = JSON.parse(localStorage.getItem('diet_log') || '{}');
    return d[TODAY] || [];
  } catch { return []; }
})();

function save() {
  try {
    const d = JSON.parse(localStorage.getItem('diet_log') || '{}');
    d[TODAY] = log;
    localStorage.setItem('diet_log', JSON.stringify(d));
  } catch {}
}

const GOALS = {cal:2000,carbs:250,protein:60,fat:65};

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

  function pct(v,g){return Math.min(Math.round(v/g*100),100)}
  document.getElementById('pf-cal').style.width = pct(t.cal,GOALS.cal)+'%';
  document.getElementById('pf-crb').style.width = pct(t.carbs,GOALS.carbs)+'%';
  document.getElementById('pf-prt').style.width = pct(t.protein,GOALS.protein)+'%';
  document.getElementById('pf-fat').style.width = pct(t.fat,GOALS.fat)+'%';
  document.getElementById('pt-cal').textContent = Math.round(t.cal)+' / '+GOALS.cal+" קל'";
  document.getElementById('pt-crb').textContent = Math.round(t.carbs)+' / '+GOALS.carbs+'g';
  document.getElementById('pt-prt').textContent = Math.round(t.protein)+' / '+GOALS.protein+'g';
  document.getElementById('pt-fat').textContent = Math.round(t.fat)+' / '+GOALS.fat+'g';

  const el = document.getElementById('food-list');
  const es = document.getElementById('empty-state');
  if (log.length === 0) {
    el.innerHTML = '';
    el.appendChild(es);
    es.style.display = '';
    return;
  }
  es.style.display = 'none';
  el.innerHTML = '';
  log.forEach((e, i) => {
    const div = document.createElement('div');
    div.className = 'fi';
    div.innerHTML = `
      <div class="fi-info">
        <div class="fi-name">${escHtml(e.food.n[0])}</div>
        <div class="fi-qty">${e.grams}g · ${e.food.cat}</div>
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

function escHtml(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}

/* ─────────────────────────────────────────────────────────
   ADD / DELETE / CLEAR
   ─────────────────────────────────────────────────────── */
function addFood() {
  const inp = document.getElementById('food-input');
  const raw = inp.value.trim();
  if (!raw) return;

  const result = parseFood(raw);
  const aiMsg = document.getElementById('ai-msg');
  const aiText = document.getElementById('ai-text');
  const warnBox = document.getElementById('warn-box');

  if (!result) {
    aiMsg.classList.add('show');
    aiText.textContent = 'לא הצלחתי לזהות את המאכל "'+raw+'". נסה לכתוב בצורה אחרת, למשל: "100 גרם ___" או שם המאכל בלבד.';
    warnBox.innerHTML = '';
    return;
  }

  log.push(result);
  save();

  const msgs = [
    `נרשם! ${result.food.n[0]} (${result.grams}g) — ${result.cal} קלוריות, ${result.carbs}g פחמימות, ${result.protein}g חלבונים, ${result.fat}g שומנים.`,
    `מצוין! הוספתי ${result.food.n[0]}. סה"כ ${result.cal} קלוריות על ${result.grams} גרם. 💪`,
    `שמרתי! ${result.food.n[0]} (${result.grams}g) = ${result.cal} קל׳ | 🌾${result.carbs}g | 💪${result.protein}g | 🥑${result.fat}g`,
  ];
  aiMsg.classList.add('show');
  aiText.textContent = msgs[Math.floor(Math.random()*msgs.length)];

  const total = totals();
  let warns = [];
  if(total.cal > GOALS.cal) warns.push(`⚠️ עברת את יעד הקלוריות היומי (${Math.round(total.cal)}/${GOALS.cal} קל׳)`);
  if(total.carbs > GOALS.carbs) warns.push(`⚠️ עברת את יעד הפחמימות היומי`);
  warnBox.innerHTML = warns.map(w=>`<div class="warn-box">${w}</div>`).join('');

  inp.value = '';
  render();
  const fl = document.getElementById('food-list');
  fl.scrollTop = fl.scrollHeight;
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

function qi(text) {
  document.getElementById('food-input').value = text;
  addFood();
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
    for (const f of DB) {
      if (!cats[f.cat]) cats[f.cat] = [];
      cats[f.cat].push(f);
    }
    for (const cat of Object.keys(cats).sort()) {
      const grp = document.createElement('optgroup');
      grp.label = cat;
      for (const f of cats[cat]) {
        const opt = document.createElement('option');
        opt.value = DB.indexOf(f);
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
   INIT
   ─────────────────────────────────────────────────────── */
render();
initVoice();
