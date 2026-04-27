/* ─────────────────────────────────────────────────────────
   Local nutrition estimator — finds closest match in DB
   ───────────────────────────────────────────────────────── */

function stripQuantity(text) {
  return text
    .replace(/\d+[\s.,]*(קילוגרם|ק"?ג|גרם|ג'|מיליליטר|מ"?ל|מל|ליטר|כפות?|כפיות?|כוסות?)\s*/gi, '')
    .replace(/^(שלוש(?:\s+)?רבע|שני(?:\s+)?שלישי|שליש|חצי|רבע|שתי)\s+כוס\s+/i, '')
    .replace(/^\d+\s+/, '')
    .trim();
}

function findClosestInDB(foodName) {
  if (!Array.isArray(DB) || DB.length === 0) return null;

  const words = foodName.split(/\s+/).filter(w => w.length > 1);
  let bestMatch = null;
  let bestScore = 0;

  for (const item of DB) {
    for (const alias of item.n) {
      let score = 0;

      if (alias === foodName) {
        score = 100;
      } else if (alias.includes(foodName) || foodName.includes(alias)) {
        score = 50;
      } else {
        for (const word of words) {
          if (alias.includes(word)) score += 10;
        }
        for (const aw of alias.split(/\s+/)) {
          if (aw.length > 1 && foodName.includes(aw)) score += 5;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = item;
      }
    }
  }

  return bestScore > 0 ? bestMatch : null;
}

async function fetchClaudeNutrition(rawText) {
  const foodName = stripQuantity(rawText) || rawText;
  const match = findClosestInDB(foodName);

  const base = match || { cal: 150, c: 15, p: 8, f: 7, dw: 100, cat: 'כללי' };
  const grams = (typeof extractGrams === 'function')
    ? extractGrams(rawText, base)
    : (base.dw || 100);
  const f = grams / 100;

  return {
    food: {
      n: [foodName + ' (ערך משוער)'],
      cat: base.cat || 'משוער',
      cal: base.cal,
      c:   base.c,
      p:   base.p,
      f:   base.f,
      dw:  base.dw || 100,
    },
    grams,
    cal:     Math.round(base.cal * f),
    carbs:   Math.round(base.c * f * 10) / 10,
    protein: Math.round(base.p * f * 10) / 10,
    fat:     Math.round(base.f * f * 10) / 10,
    raw:     rawText,
    estimated: true,
  };
}
