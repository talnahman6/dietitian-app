const UNITS = [
  {r:/(\d+(?:[.,]\d+)?)\s*ק"?ג|קילוגרם/,fn:m=>+m.replace(',','.')*1000},
  {r:/(\d+(?:[.,]\d+)?)\s*גרם|ג'|^(\d+(?:[.,]\d+)?)\s*ג(?:\s|$)/,fn:m=>+m.replace(',','.')},
  {r:/(\d+(?:[.,]\d+)?)\s*מ"?ל|מיליליטר|מל(?:\s|$)/,fn:m=>+m.replace(',','.')},
  {r:/(\d+(?:[.,]\d+)?)\s*ליטר/,fn:m=>+m.replace(',','.')*1000},
];

const SPECIAL_QTY = [
  {r:/שלוש(?:\s+|-)?רבע\s+כוס/,g:180},
  {r:/שני(?:\s+|-)?שלישי(?:\s+|-)?כוס/,g:160},
  {r:/שליש\s+כוס/,g:80},
  {r:/חצי\s+כוס/,g:120},
  {r:/רבע\s+כוס/,g:60},
  {r:/כוס\s+וחצי/,g:360},
  {r:/שתי\s+כוסות/,g:480},
];

function extractGrams(txt, food) {
  const t = txt.trim().toLowerCase();
  for (const sq of SPECIAL_QTY) {
    if (sq.r.test(t)) return sq.g;
  }
  for (const u of UNITS) {
    const m = t.match(new RegExp(u.r.source.replace('(\\d+(?:[.,]\\d+)?)', '(\\d+(?:[.,]\\d+)?)')));
    if (m) {
      const val = u.fn(m[1] || m[2] || m[0]);
      if (!isNaN(val) && val > 0) {
        if (u.r.source.includes('כוס') && food && food.cw) return (val / 240) * food.cw;
        return val;
      }
    }
  }
  const heNums = {
    'אחד':1,'אחת':1,
    'שניים':2,'שתיים':2,'שתי':2,'שני':2,
    'שלושה':3,'שלוש':3,
    'ארבעה':4,'ארבע':4,
    'חמישה':5,'חמש':5,
    'שישה':6,'שש':6,
  };
  for (const [w,v] of Object.entries(heNums)) {
    if (t.includes(w)) return (food ? food.dw : 100) * v;
  }
  const nm = t.match(/^(\d+(?:[.,]\d+)?)\s/);
  if (nm) {
    const n = parseFloat(nm[1].replace(',','.'));
    if (n && n > 0) {
      if (n >= 30) return n;
      return (food ? food.dw : 100) * n;
    }
  }
  return food ? food.dw : 100;
}

function normalize(s) {
  return s.toLowerCase().replace(/['"״׳]/g,'').replace(/\s+/g,' ').trim();
}

function findFood(text) {
  const t = normalize(text);
  // 1. Exact
  for (const f of DB) for (const n of f.n) if (normalize(n)===t) return f;
  // 2. Starts-with
  let best=null, bestLen=0;
  for (const f of DB) for (const n of f.n) {
    const fn=normalize(n);
    if (t.startsWith(fn)||fn.startsWith(t)) {
      if(fn.length>bestLen){bestLen=fn.length;best=f}
    }
  }
  if(best) return best;
  // 3. Contains
  for (const f of DB) for (const n of f.n) {
    const fn=normalize(n);
    if (t.includes(fn)||fn.includes(t)) return f;
  }
  // 4. Word match
  const words=t.split(/\s+/).filter(w=>w.length>=2);
  let bestScore=0; best=null;
  for (const f of DB) for (const n of f.n) {
    const fnWords=normalize(n).split(/\s+/);
    let score=0;
    for(const w of words) for(const fw of fnWords) if(fw===w||fw.startsWith(w)||w.startsWith(fw)) score++;
    if(score>bestScore){bestScore=score;best=f}
  }
  if(bestScore>0) return best;
  return null;
}

/* ─── FoodsDictionary fetch ─── */
const _fdCache = {};

async function fetchFoodsDict(term) {
  const key = term.trim().toLowerCase();
  if (_fdCache[key]) return _fdCache[key];

  const base = 'https://www.foodsdictionary.co.il';
  let html = null;

  // 1. Try direct product name URL
  try {
    const r = await fetch(`${base}/Products/1/${encodeURIComponent(term)}`);
    if (r.ok) html = await r.text();
  } catch {}

  // 2. Search fallback
  if (!html) {
    try {
      const sr = await fetch(`${base}/FoodsSearch.php?q=${encodeURIComponent(term)}`);
      if (sr.ok) {
        const sh = await sr.text();
        const m = sh.match(/href="([^"]*\/Products\/[^"#?]+)"/i);
        if (m) {
          const url = m[1].startsWith('http') ? m[1] : base + (m[1].startsWith('/') ? '' : '/') + m[1];
          const pr = await fetch(url);
          if (pr.ok) html = await pr.text();
        }
      }
    } catch {}
  }

  if (!html) return null;

  const doc = new DOMParser().parseFromString(html, 'text/html');
  let cal = 0, carbs = 0, protein = 0, fat = 0;

  // Try JSON-LD structured data
  for (const script of doc.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      const d = JSON.parse(script.textContent);
      const items = Array.isArray(d['@graph']) ? d['@graph'] : [d];
      for (const item of items) {
        const n = item.nutrition;
        if (n) {
          cal     = parseFloat(n.calories)          || cal;
          carbs   = parseFloat(n.carbohydrateContent) || carbs;
          protein = parseFloat(n.proteinContent)    || protein;
          fat     = parseFloat(n.fatContent)        || fat;
        }
      }
    } catch {}
  }

  // Fallback: table rows
  if (!cal) {
    for (const row of doc.querySelectorAll('tr')) {
      const cells = [...row.querySelectorAll('td, th')];
      if (cells.length < 2) continue;
      const label = cells[0].textContent.trim();
      const val   = parseFloat((cells[cells.length - 1].textContent.replace(',', '.').match(/[\d.]+/) || ['0'])[0]);
      if (/קלוריה|קלוריות|אנרג|calori/i.test(label) && !cal)     cal     = val;
      else if (/פחמימ|carbo/i.test(label)              && !carbs)   carbs   = val;
      else if (/חלבון|protein/i.test(label)             && !protein) protein = val;
      else if (/שומן(?!\s*רווי)|^fat/i.test(label)     && !fat)     fat     = val;
    }
  }

  // Fallback: scan body text for Hebrew nutrition labels
  if (!cal) {
    const txt = doc.body?.textContent || '';
    const pairs = [
      [/(?:קלוריות|אנרגיה)[^\d]*(\d+(?:[.,]\d+)?)/i, 'cal'],
      [/פחמימות[^\d]*(\d+(?:[.,]\d+)?)/i,             'carbs'],
      [/חלבונים?[^\d]*(\d+(?:[.,]\d+)?)/i,            'protein'],
      [/שומן[^\d]*(\d+(?:[.,]\d+)?)/i,                'fat'],
    ];
    for (const [re, field] of pairs) {
      const m = txt.match(re);
      if (m) {
        const v = parseFloat(m[1].replace(',', '.'));
        if (field === 'cal'     && !cal)     cal     = v;
        if (field === 'carbs'   && !carbs)   carbs   = v;
        if (field === 'protein' && !protein) protein = v;
        if (field === 'fat'     && !fat)     fat     = v;
      }
    }
  }

  // Food display name
  const nameEl = doc.querySelector('h1, .product-name, .food-name, [itemprop="name"]');
  const foodName = nameEl ? nameEl.textContent.trim() : term;

  // Serving sizes from <select>
  const servingSizes = [];
  for (const sel of doc.querySelectorAll('select')) {
    for (const opt of sel.options) {
      const text = opt.textContent.trim();
      if (!text || text.length < 2) continue;
      let grams = parseFloat(opt.value);
      if (!grams || isNaN(grams) || grams > 5000) {
        const m = text.match(/(\d+(?:[.,]\d+)?)\s*(?:גר|ג'|ג\b|gram|g\b)/i);
        grams = m ? parseFloat(m[1].replace(',', '.')) : 0;
      }
      if (grams > 0) servingSizes.push({ label: text, grams });
    }
    if (servingSizes.length) break;
  }

  // Serving sizes from data attributes
  if (!servingSizes.length) {
    for (const el of doc.querySelectorAll('[data-weight],[data-grams],[data-amount]')) {
      const grams = parseFloat(el.dataset.weight || el.dataset.grams || el.dataset.amount);
      if (grams > 0 && grams < 5000)
        servingSizes.push({ label: el.textContent.trim() || `${grams}g`, grams });
    }
  }

  const result = {
    food: {
      n: [foodName],
      cat: 'חיפוש באינטרנט',
      cal, c: carbs, p: protein, f: fat,
      dw: servingSizes[0]?.grams ?? 100,
    },
    servingSizes,
    per100: { cal, carbs, protein, fat },
  };
  _fdCache[key] = result;
  return result;
}

function parseFood(rawText) {
  const text = rawText.trim();
  const candidates = [text];
  const stripped = text
    .replace(/^[\d.,]+\s*(גרם|ג'|ג\s|קילוגרם|קג|מ"ל|מיליליטר|מל|כפות?|כפיות?|כוסות?|ליטר)\s*/,'')
    .replace(/^(שלוש(?:\s+)?רבע|שני(?:\s+)?שלישי|שליש|חצי|רבע|שתי)\s+כוס\s+/,'')
    .replace(/^(\d+(?:[.,]\d+)?)\s+/,'')
    .trim();
  if(stripped && stripped!==text) candidates.push(stripped);

  let food = null;
  for(const c of candidates){
    food = findFood(c);
    if(food) break;
  }
  if(!food) return null;

  const grams = extractGrams(text, food);
  const f = grams/100;
  return {
    food,
    grams,
    cal: Math.round(food.cal*f),
    carbs: Math.round(food.c*f*10)/10,
    protein: Math.round(food.p*f*10)/10,
    fat: Math.round(food.f*f*10)/10,
    raw: rawText,
  };
}
