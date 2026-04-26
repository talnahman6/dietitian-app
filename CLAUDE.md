# Dietitian App — Noya (נויה)

Hebrew-language personal dietitian web app. Single-page, no build step, no dependencies (vanilla JS + CSS).

## Rules for every session
1. Before making changes, read ONLY the relevant file
2. Never read all files at once
3. Make targeted edits, don't rewrite entire files
4. Confirm before running bash commands
5. When I say "change X" — find and edit only that part
6. Always respond in Hebrew

## File map

| File | Purpose |
|------|---------|
| `index.html` | Full app shell; RTL Hebrew (`dir="rtl"`), loads all scripts in order |
| `css/style.css` | All styling — single file, no preprocessor |
| `data/foods.js` | Exposes global `DB` array — ~370 foods, each `{n, cat, cal, c, p, f, dw, cw?}` |
| `js/avatar.js` | Exposes `AVATAR_SVG` string — inline SVG of the Noya avatar |
| `js/parser.js` | Exposes `parseFood(rawText)` — Hebrew text → entry object; uses `DB` |
| `js/app.js` | App logic: state, render, add/delete/clear, voice recording, food picker |

Script load order matters: `avatar.js` → `foods.js` → `parser.js` → `app.js`.

## Data shape

### `DB` entry (`data/foods.js`)
```js
{
  n:   string[],   // Hebrew name aliases (first is display name)
  cat: string,     // category in Hebrew
  cal: number,     // kcal per 100g
  c:   number,     // carbs per 100g
  p:   number,     // protein per 100g
  f:   number,     // fat per 100g
  dw:  number,     // default weight (g) when no quantity specified
  cw?: number,     // optional: grams per cup (used by parser for כוס units)
}
```

### Log entry (runtime, stored in `localStorage['diet_log']`)
```js
{ food, grams, cal, carbs, protein, fat, raw }
```

## Key globals & functions

- `DB` — food database array (foods.js)
- `AVATAR_SVG` — SVG string (avatar.js)
- `parseFood(rawText)` → entry or null (parser.js)
- `findFood(text)` — fuzzy Hebrew food lookup; 4-stage: exact → starts-with → contains → word-match
- `extractGrams(txt, food)` — resolves Hebrew quantity expressions to grams
- `log` — today's entries array (app.js)
- `GOALS` — daily targets `{cal:2000, carbs:250, protein:60, fat:65}` (app.js)
- `render()` — updates stats, progress bars, and food list DOM
- `addFood()` / `deleteItem(i)` / `clearAll()` — log mutation
- `toggleVoice()` — Web Speech API, `lang:'he-IL'`
- `fpOpen/Close/Add()` — food picker modal (browses DB by category)

## Storage
`localStorage['diet_log']` — object keyed by `new Date().toDateString()`, value is array of log entries. One key per calendar day; old days are never auto-purged.

## Language / locale
All UI text is Hebrew. RTL layout. Voice input uses `he-IL`. No i18n layer — strings are hardcoded.

## How to run
Open `index.html` directly in a browser, or serve with any static file server. No build, no npm.
