const UNITS = [
  {r:/(\d+(?:[.,]\d+)?)\s*ק"?ג|קילוגרם/,fn:m=>+m.replace(',','.')*1000},
  {r:/(\d+(?:[.,]\d+)?)\s*גרם|ג'|^(\d+(?:[.,]\d+)?)\s*ג(?:\s|$)/,fn:m=>+m.replace(',','.')},
  {r:/(\d+(?:[.,]\d+)?)\s*מ"?ל|מיליליטר|מל(?:\s|$)/,fn:m=>+m.replace(',','.')},
  {r:/(\d+(?:[.,]\d+)?)\s*ליטר/,fn:m=>+m.replace(',','.')*1000},
  {r:/(\d+(?:[.,]\d+)?)\s*כפות?/,fn:m=>+m.replace(',','.')*15},
  {r:/(\d+(?:[.,]\d+)?)\s*כפיות?/,fn:m=>+m.replace(',','.')*5},
  {r:/(\d+(?:[.,]\d+)?)\s*כוסות?/,fn:m=>+m.replace(',','.')*240},
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
