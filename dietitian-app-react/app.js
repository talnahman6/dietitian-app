const h = React.createElement;
const SB_URL = 'https://fujktuwxgzupicyrolwa.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1amt0dXd4Z3p1cGljeXJvbHdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczNjY2MDIsImV4cCI6MjA5Mjk0MjYwMn0.WffiDP56plkft7lBBD1sYikOzstgONRw7awViO4hwOk';
const supabaseClient = window.supabase ? window.supabase.createClient(SB_URL, SB_KEY) : null;
const GLOBAL_CUSTOM_FOODS_USER = '__global_custom_foods__';

const baseFoods = [
  { n: 'חזה עוף', cat: 'חלבון', cal: 165, p: 31, c: 0, f: 3.6 },
  { n: 'שניצל', cat: 'חלבון', cal: 245, p: 18, c: 18, f: 12 },
  { n: 'קבב', cat: 'חלבון', cal: 260, p: 17, c: 3, f: 20 },
  { n: 'טונה במים', cat: 'חלבון', cal: 116, p: 26, c: 0, f: 1 },
  { n: 'ביצה קשה', cat: 'חלבון', cal: 155, p: 13, c: 1.1, f: 11 },
  { n: 'חביתה', cat: 'חלבון', cal: 190, p: 13, c: 1.4, f: 15 },
  { n: 'קוטג', cat: 'חלבון', cal: 98, p: 11, c: 3.4, f: 4.3 },
  { n: 'גבינה לבנה', cat: 'חלבון', cal: 95, p: 9, c: 4, f: 5 },
  { n: 'יוגורט', cat: 'חלבון', cal: 70, p: 7, c: 8, f: 1.5 },
  { n: 'מעדן חלבון', cat: 'חלבון', cal: 82, p: 10, c: 8, f: 1.2 },
  { n: 'אורז לבן', cat: 'פחמימה', cal: 130, p: 2.7, c: 28, f: .3 },
  { n: 'פתיתים', cat: 'פחמימה', cal: 150, p: 5, c: 30, f: 1.2 },
  { n: 'קוסקוס', cat: 'פחמימה', cal: 112, p: 3.8, c: 23, f: .2 },
  { n: 'תפוח אדמה', cat: 'פחמימה', cal: 77, p: 2, c: 17, f: .1 },
  { n: 'בטטה', cat: 'פחמימה', cal: 86, p: 1.6, c: 20, f: .1 },
  { n: 'לחם חיטה', cat: 'פחמימה', cal: 250, p: 9, c: 49, f: 3.2 },
  { n: 'פיתה', cat: 'פחמימה', cal: 275, p: 9, c: 56, f: 1.2 },
  { n: 'קלילית', cat: 'פחמימה', cal: 360, p: 8, c: 75, f: 3 },
  { n: 'אבוקדו', cat: 'שומן', cal: 160, p: 2, c: 8.5, f: 14.7 },
  { n: 'טחינה', cat: 'שומן', cal: 595, p: 17, c: 21, f: 53 },
  { n: 'חומוס', cat: 'שומן', cal: 166, p: 8, c: 14, f: 10 },
  { n: 'עגבניה', cat: 'ירקות', cal: 18, p: .9, c: 3.9, f: .2 },
  { n: 'מלפפון', cat: 'ירקות', cal: 16, p: .7, c: 3.6, f: .1 },
  { n: 'גמבה', cat: 'ירקות', cal: 31, p: 1, c: 6, f: .3 },
  { n: 'תפוח', cat: 'פרי', cal: 52, p: .3, c: 13.8, f: .2 },
  { n: 'בננה', cat: 'פרי', cal: 89, p: 1.1, c: 23, f: .3 },
  { n: 'אפרסק', cat: 'פרי', cal: 39, p: .9, c: 9.5, f: .3 },
  { n: 'תפוז', cat: 'פרי', cal: 47, p: .9, c: 11.8, f: .1 },
  { n: 'אבטיח', cat: 'פרי', cal: 30, p: .6, c: 7.6, f: .2 }
];

const mealLabels = { breakfast: 'ארוחת בוקר', lunch: 'ארוחת צהריים', snack: 'ארוחת ביניים', dinner: 'ארוחת ערב', night: 'ארוחת לילה' };
const todayKey = () => new Date().toISOString().slice(0, 10);
const round1 = v => Math.round(v * 10) / 10;
const read = (k, fallback) => { try { return JSON.parse(localStorage.getItem(k)) ?? fallback; } catch { return fallback; } };
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const defaultProfile = { firstName: 'טל', gender: 'male', cal: 1800, protein: 135, carbs: 180, fat: 60, waterTarget: 8 };
const calcItem = (food, grams) => ({ id: crypto.randomUUID(), food: food.n, meal: 'breakfast', grams, cal: Math.round(food.cal * grams / 100), p: round1(food.p * grams / 100), c: round1(food.c * grams / 100), f: round1(food.f * grams / 100) });

function App() {
  const [profile, setProfile] = React.useState(() => read('rn-profile', defaultProfile));
  const [onboarding, setOnboarding] = React.useState(() => !read('rn-profile', null));
  const [tab, setTab] = React.useState('home');
  const [log, setLog] = React.useState(() => read('rn-log-' + todayKey(), []));
  const [foods, setFoods] = React.useState(() => baseFoods.concat(read('rn-custom-foods', [])));
  const [modal, setModal] = React.useState(null);
  const [chatOpen, setChatOpen] = React.useState(false);
  const [chat, setChat] = React.useState([]);
  const [water, setWater] = React.useState(() => read('rn-water-' + todayKey(), 0));
  const totals = React.useMemo(() => log.reduce((s, x) => ({ cal: s.cal + x.cal, p: s.p + x.p, c: s.c + x.c, f: s.f + x.f }), { cal: 0, p: 0, c: 0, f: 0 }), [log]);

  React.useEffect(() => write('rn-profile', profile), [profile]);
  React.useEffect(() => write('rn-log-' + todayKey(), log), [log]);
  React.useEffect(() => write('rn-water-' + todayKey(), water), [water]);

  function addFood(food, grams, meal) {
    const item = { ...calcItem(food, grams), meal };
    setLog([item, ...log]);
  }

  async function addCustomFood(food) {
    const next = [food].concat(foods.filter(x => x.n !== food.n));
    setFoods(next);
    write('rn-custom-foods', next.filter(x => !baseFoods.some(b => b.n === x.n)));
    if (supabaseClient) {
      const custom_foods = next.filter(x => !baseFoods.some(b => b.n === x.n)).map(x => ({ n: [x.n], cat: x.cat, cal: x.cal, p: x.p, c: x.c, f: x.f, custom: true }));
      await supabaseClient.from('user_data').upsert({ username: GLOBAL_CUSTOM_FOODS_USER, updated_at: new Date().toISOString(), diet_log: { custom_foods } }, { onConflict: 'username' });
    }
  }

  function answerMiri(q) {
    const left = { cal: Math.round(profile.cal - totals.cal), p: round1(profile.protein - totals.p), c: round1(profile.carbs - totals.c), f: round1(profile.fat - totals.f) };
    const text = q || '';
    let a = 'אני כאן. אפשר לשאול אותי מה נשאר, מה כדאי לאכול או מה חסר לך.';
    if (text.includes('מה המצב')) a = `אכלת ${Math.round(totals.cal)} מתוך ${profile.cal} קל׳.\nחלבון: ${round1(totals.p)}/${profile.protein} גרם\nפחמימות: ${round1(totals.c)}/${profile.carbs} גרם\nשומנים: ${round1(totals.f)}/${profile.fat} גרם`;
    else if (text.includes('מה אפשר') || text.includes('ממליצה')) a = left.p > 25 ? 'ממליצה להוסיף חלבון: חזה עוף, טונה, ביצים או קוטג׳.' : left.c > 40 ? 'ממליצה להוסיף פחמימה טובה: אורז, תפוח אדמה, פיתה או לחם.' : 'אתה די קרוב למסלול. עדיף משהו קל ומאוזן.';
    else if (text.includes('חסר')) a = `חסר לך בערך: ${Math.max(0,left.p)} גרם חלבון, ${Math.max(0,left.c)} גרם פחמימות ו-${Math.max(0,left.f)} גרם שומן.`;
    else if (text.includes('נשאר')) a = `נשאר לך:\n${left.cal} קלוריות\n${left.p} חלבון\n${left.c} פחמימות\n${left.f} שומן`;
    setChat([...chat, { who: 'user', text }, { who: 'bot', text: a }]);
  }

  if (onboarding) return h(Onboarding, { profile, setProfile, finish: () => setOnboarding(false) });

  return h('div', { className: 'phone' },
    h(Home, { active: tab === 'home', profile, totals, foods, addFood, setModal, water, setWater }),
    h(Journal, { active: tab === 'journal', log, setLog, foods, addFood, setModal }),
    h(Menus, { active: tab === 'menus', profile }),
    h(Profile, { active: tab === 'profile', profile, setProfile, setModal }),
    h(MiriFab, { open: () => { setChatOpen(true); if (!chat.length) setChat([{ who: 'bot', text: `היי ${profile.firstName}, כאן מירי הדיאטנית.\nאפשר להתייעץ איתי מתי שרק תרצה.\nנסה אותי עכשיו` }]); } }),
    chatOpen && h(Chat, { close: () => setChatOpen(false), chat, answerMiri }),
    modal === 'custom' && h(CustomFoodModal, { close: () => setModal(null), addCustomFood }),
    modal === 'water' && h(WaterModal, { close: () => setModal(null), water, setWater }),
    h(BottomNav, { tab, setTab })
  );
}

function Onboarding({ profile, setProfile, finish }) {
  const [step, setStep] = React.useState(0);
  const [draft, setDraft] = React.useState(profile);
  const steps = [
    h('div', null, h('h1', null, 'מה המין שלך?'), h('div', { className: 'grid2' },
      h('button', { className: 'choice ' + (draft.gender === 'male' ? 'active' : ''), onClick: () => setDraft({ ...draft, gender: 'male' }) }, '👨 זכר'),
      h('button', { className: 'choice ' + (draft.gender === 'female' ? 'active' : ''), onClick: () => setDraft({ ...draft, gender: 'female' }) }, '👩 נקבה'))),
    h('div', null, h('h1', null, 'איך קוראים לך?'), h('input', { className: 'input', value: draft.firstName, onChange: e => setDraft({ ...draft, firstName: e.target.value }), placeholder: 'שם פרטי' })),
    h('div', null, h('h1', null, 'מה היעד היומי?'), h('div', { className: 'grid2' },
      h('input', { className: 'input', type: 'number', value: draft.cal, onChange: e => setDraft({ ...draft, cal: +e.target.value || 0 }), placeholder: 'קלוריות' }),
      h('input', { className: 'input', type: 'number', value: draft.protein, onChange: e => setDraft({ ...draft, protein: +e.target.value || 0 }), placeholder: 'חלבון' }),
      h('input', { className: 'input', type: 'number', value: draft.carbs, onChange: e => setDraft({ ...draft, carbs: +e.target.value || 0 }), placeholder: 'פחמימות' }),
      h('input', { className: 'input', type: 'number', value: draft.fat, onChange: e => setDraft({ ...draft, fat: +e.target.value || 0 }), placeholder: 'שומנים' })))
  ];
  return h('div', { className: 'onboard' },
    h('div', { className: 'progress' }, h('span', { style: { width: ((step + 1) / steps.length * 100) + '%' } })),
    h('div', { className: 'onboard-card' }, steps[step]),
    h('button', { className: 'btn', onClick: () => step < steps.length - 1 ? setStep(step + 1) : (setProfile(draft), finish()) }, step < steps.length - 1 ? 'הבא' : 'התחל לעקוב')
  );
}

function Home({ active, profile, totals, foods, addFood, setModal, water, setWater }) {
  return h('section', { className: 'screen ' + (active ? 'active' : '') },
    h('div', { className: 'hero' },
      h('img', { className: 'miri-face', src: './assets/miri-main.webp' }),
      h('div', { className: 'hero-text' },
        h('h1', null, 'מירי - הדיאטנית האישית שלך'),
        h('div', { className: 'hello-row' }, h('span', { className: 'hello' }, `שלום, ${profile.firstName}`), h('span', { className: 'online' }, 'מירי', h('i', { className: 'dot' }))))),
    h('div', { className: 'stats' },
      stat('🔥', Math.round(totals.cal), 'קלוריות'),
      stat('🌾', round1(totals.c) + 'g', 'פחמימות'),
      stat('💪', round1(totals.p) + 'g', 'חלבונים'),
      stat('🥑', round1(totals.f) + 'g', 'שומנים')),
    h('div', { className: 'top-actions' },
      h('button', { className: 'pill', onClick: () => setModal('water') }, `מים ${water}/${profile.waterTarget}`),
      h('button', { className: 'pill', onClick: () => alert('בגרסת מובייל מלאה הצעדים יחוברו לחיישני הטלפון') }, 'צעדים 0')),
    h('div', { className: 'card' }, h('h2', { className: 'card-title' }, 'חיפשת מאכל ולא מצאת?'), h('button', { className: 'btn', onClick: () => setModal('custom') }, 'הוסף מאכל')),
    h(AddFoodCard, { foods, addFood }),
    h(Progress, { profile, totals })
  );
}

function stat(icon, num, label) { return h('div', { className: 'stat' }, h('div', { className: 'icon' }, icon), h('div', { className: 'num' }, num), h('div', { className: 'label' }, label)); }

function AddFoodCard({ foods, addFood }) {
  const [name, setName] = React.useState('');
  const [grams, setGrams] = React.useState(100);
  const [meal, setMeal] = React.useState('');
  const query = name.trim();
  const found = query ? (foods.find(f => f.n === query) || foods.find(f => f.n.includes(query))) : null;
  return h('div', { className: 'card' },
    h('h2', { className: 'card-title' }, 'מה אכלת היום? 😊'),
    h('div', { className: 'grid3' },
      h('select', { className: 'select', value: meal, onChange: e => setMeal(e.target.value) }, h('option', { value: '' }, 'ארוחה'), Object.entries(mealLabels).map(([k, v]) => h('option', { key: k, value: k }, v))),
      h('input', { className: 'input', type: 'number', value: grams, onChange: e => setGrams(+e.target.value || 0), placeholder: 'כמות' }),
      h('select', { className: 'select' }, h('option', null, 'גרם'), h('option', null, 'כף'), h('option', null, 'כפית'))),
    h('div', { className: 'row', style: { marginTop: 10 } },
      h('input', { className: 'input', list: 'foods', value: name, onChange: e => setName(e.target.value), placeholder: 'הוסף מאכל אחד בכל פעם' }),
      h('datalist', { id: 'foods' }, foods.map(f => h('option', { key: f.n, value: f.n }))),
      h('button', { className: 'btn icon-btn', onClick: () => alert('הקלטה תחובר בגרסת Expo') }, '🎤'),
      h('button', { className: 'btn icon-btn', onClick: () => alert('מצלמה תחובר בגרסת Expo') }, '📷')),
    h('button', { className: 'btn', style: { width: '100%', marginTop: 10 }, onClick: () => found && meal ? (addFood(found, grams || 100, meal), setName('')) : alert('בחר מאכל, כמות וארוחה') }, 'הוספה')
  );
}

function Progress({ profile, totals }) {
  const rows = [['קלוריות', totals.cal, profile.cal], ['חלבון', totals.p, profile.protein], ['פחמימות', totals.c, profile.carbs], ['שומן', totals.f, profile.fat]];
  return h('div', { className: 'card progress-line' },
    h('div', { className: 'seg' }, h('button', { className: 'active' }, 'כמה אכלתי היום?'), h('button', null, 'כמה נשאר לי?')),
    rows.map(([l, v, g]) => h('div', { key: l }, h('div', { className: 'progress-head' }, h('span', null, l), h('span', null, `${round1(v)} / ${g}`)), h('div', { className: 'bar' }, h('span', { style: { width: Math.min(100, v / g * 100) + '%' } }))))
  );
}

function Journal({ active, log, setLog, foods, addFood, setModal }) {
  const d = new Date();
  const month = d.toLocaleDateString('he-IL', { month: 'long' });
  return h('section', { className: 'screen ' + (active ? 'active' : '') },
    h('div', { className: 'card date-card' }, h('div', { className: 'cal-badge' }, h('span', null, month), h('strong', null, d.getDate())), h('h2', null, d.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))),
    h('div', { className: 'card' }, h('h2', { className: 'card-title' }, 'חיפשת מאכל ולא מצאת?'), h('button', { className: 'btn', onClick: () => setModal('custom') }, 'הוסף מאכל')),
    h(AddFoodCard, { foods, addFood }),
    h('div', { className: 'card' }, h('div', { className: 'row', style: { justifyContent: 'space-between' } }, h('h2', { className: 'card-title' }, 'יומן האכילה שלי'), h('button', { className: 'btn danger', onClick: () => confirm('למחוק את כל המאכלים?') && setLog([]) }, 'נקה הכל')),
      Object.entries(mealLabels).map(([meal, label]) => h('div', { key: meal, className: 'meal' }, h('h3', null, label), log.filter(x => x.meal === meal).length ? log.filter(x => x.meal === meal).map(x => h('div', { className: 'food-item', key: x.id }, h('div', null, h('div', { className: 'food-name' }, x.food), h('div', { className: 'food-meta' }, `${x.grams} גרם`)), h('strong', null, `${x.cal} קל׳`), h('button', { className: 'delete', onClick: () => setLog(log.filter(y => y.id !== x.id)) }, 'מחק'))) : h('p', { className: 'food-meta' }, 'אין פריטים'))))
  );
}

function Menus({ active, profile }) {
  const [idx, setIdx] = React.useState(0);
  const menus = makeMenus(profile);
  const menu = menus[idx];
  return h('section', { className: 'screen ' + (active ? 'active' : '') },
    h('div', { className: 'card' }, h('div', { className: 'row', style: { justifyContent: 'space-between' } }, h('h2', { className: 'card-title' }, 'התפריטים שלי'), h('button', { className: 'btn secondary', onClick: () => window.print() }, 'הורד לPDF')),
      h('div', { className: 'menu-tabs' }, menus.map((m, i) => h('button', { key: i, className: i === idx ? 'active' : '', onClick: () => setIdx(i) }, `תפריט ${i + 1}`))),
      menu.meals.map(m => h('div', { className: 'meal', key: m.label }, h('h3', null, m.label), h('ul', null, m.items.map(x => h('li', { key: x }, x))))),
      h('div', { className: 'total' }, `סה״כ יומי: ${profile.cal} קל׳ | חלבון ${profile.protein}g | פחמימות ${profile.carbs}g | שומן ${profile.fat}g`))
  );
}

function makeMenus(profile) {
  return [
    [['ביצה קשה 2 יחידות', 'קוטג׳ חצי גביע', '2 פרוסות לחם', 'עגבניה ומלפפון'], ['חזה עוף 160 גרם', 'אורז חצי צלחת', 'אבוקדו', 'סלט ירקות'], ['תפוח', 'מעדן חלבון'], ['טונה במים', 'חצי פיתה', 'גבינה לבנה', 'ירקות'], ['יוגורט וקלילית']],
    [['טונה במים', 'חצי פיתה', 'כף חומוס', 'עגבניה ומלפפון'], ['שניצל 150 גרם', 'פתיתים חצי צלחת', 'סלט ירקות'], ['בננה', 'יוגורט עם גרנולה'], ['חביתה מ-2 ביצים', 'לחם חיטה', 'אבוקדו'], ['מעדן חלבון']],
    [['חביתה', 'גבינה לבנה', 'לחם חיטה', 'מלפפון וגמבה'], ['קבב 150 גרם', 'קוסקוס חצי צלחת', 'סלט ירקות'], ['אפרסק', 'מעדן חלבון'], ['קוטג׳', 'פיתה מלאה', 'אבוקדו ועגבניה'], ['יוגורט ופרוסת לחם']]
  ].map(rows => ({ meals: ['breakfast', 'lunch', 'snack', 'dinner', 'night'].map((k, i) => ({ label: mealLabels[k], items: rows[i] })) }));
}

function Profile({ active, profile, setProfile, setModal }) {
  return h('section', { className: 'screen ' + (active ? 'active' : '') },
    h('div', { className: 'card' }, h('h2', { className: 'card-title' }, 'אזור אישי'),
      profileRow('👤', 'שם משתמש', profile.firstName, () => { const n = prompt('שם פרטי', profile.firstName); if (n) setProfile({ ...profile, firstName: n }); }),
      profileRow('🔒', 'שינוי סיסמא', 'עדכון', () => alert('מסך איפוס סיסמא יתחבר ל-Supabase')),
      profileRow('🌐', 'שפות', 'עברית', () => alert('בגרסה זו עברית פעילה. אנגלית ורוסית מוכנות להמשך')),
      profileRow('🧮', 'חישוב BMR מחדש', 'עדכון יעד', () => alert('מסך BMR ייבנה כשלב הבא בגרסת React Native')),
      profileRow('🔥', 'מטרת קלוריות', profile.cal + ' קל׳'),
      profileRow('💧', 'מטרת מים', profile.waterTarget + ' כוסות', () => setModal('water'))));
}
function profileRow(icon, title, value, onClick) { return h('div', { className: 'profile-row', onClick }, h('span', null, icon), h('strong', null, title), h('em', null, value)); }

function MiriFab({ open }) { return h('div', { className: 'fab-wrap' }, h('span', { className: 'fab-label' }, 'מירי ממליצה'), h('button', { className: 'fab', onClick: open }, h('img', { src: './assets/miri-fab.webp' }))); }
function Chat({ close, chat, answerMiri }) {
  const [text, setText] = React.useState('');
  const send = q => { if (!q.trim()) return; answerMiri(q); setText(''); };
  return h('div', { className: 'chat' },
    h('div', { className: 'chat-head' }, h('button', { className: 'close', onClick: close }, '×'), h('span', null, 'מירי ממליצה'), h('img', { src: './assets/miri-fab.webp' })),
    h('div', { className: 'chat-body' }, chat.map((m, i) => h('div', { key: i, className: 'bubble ' + m.who }, m.text)), h('div', { className: 'quick' }, ['מה המצב שלי נכון לעכשיו?', 'מה אפשר לאכול?', 'מה חסר לי?', 'מה את ממליצה?'].map(q => h('button', { key: q, onClick: () => send(q) }, q)))),
    h('div', { className: 'chat-input' }, h('button', { className: 'btn icon-btn' }, '🎤'), h('input', { className: 'input', value: text, onChange: e => setText(e.target.value), placeholder: 'כתבי הודעה...' }), h('button', { className: 'btn', onClick: () => send(text) }, 'שלח'))
  );
}

function CustomFoodModal({ close, addCustomFood }) {
  const [f, setF] = React.useState({ n: '', serving: '100 גרם', grams: 100, cal: '', c: '', p: '', fat: '' });
  const save = () => {
    const grams = +f.grams || 100;
    if (!f.n || !f.cal) return alert('יש למלא שם מאכל וערכים');
    addCustomFood({ n: f.n, cat: 'מאכלים שהוספו', cal: round1(+f.cal * 100 / grams), c: round1((+f.c || 0) * 100 / grams), p: round1((+f.p || 0) * 100 / grams), f: round1((+f.fat || 0) * 100 / grams) });
    close();
  };
  return h('div', { className: 'modal' }, h('div', { className: 'modal-card' }, h('button', { className: 'modal-close', onClick: close }, '×'), h('h3', { className: 'modal-title' }, 'הוסף מאכל'),
    h('input', { className: 'input', placeholder: 'שם מאכל', value: f.n, onChange: e => setF({ ...f, n: e.target.value }) }),
    h('div', { className: 'grid2', style: { marginTop: 10 } }, h('select', { className: 'select', value: f.serving, onChange: e => setF({ ...f, serving: e.target.value }) }, ['100 גרם', 'יחידה קטנה', 'יחידה בינונית', 'יחידה גדולה', 'מותאם אישית'].map(x => h('option', { key: x }, x))), h('input', { className: 'input', type: 'number', placeholder: 'גרמים', value: f.grams, onChange: e => setF({ ...f, grams: e.target.value }) })),
    h('div', { className: 'grid2', style: { marginTop: 10 } }, ['cal:קלוריות', 'p:חלבון', 'c:פחמימות', 'fat:שומנים'].map(x => { const [k, label] = x.split(':'); return h('input', { key: k, className: 'input', type: 'number', placeholder: label, value: f[k], onChange: e => setF({ ...f, [k]: e.target.value }) }); })),
    h('div', { className: 'modal-actions' }, h('button', { className: 'btn', onClick: save }, 'הוספה'), h('button', { className: 'btn secondary', onClick: close }, 'ביטול'))));
}

function WaterModal({ close, water, setWater }) {
  return h('div', { className: 'modal' }, h('div', { className: 'modal-card' }, h('button', { className: 'modal-close', onClick: close }, '×'), h('h3', { className: 'modal-title' }, 'עדכון כוסות מים'), h('p', { style: { textAlign: 'center', fontWeight: 900 } }, 'להוסיף כוס מים?'), h('div', { className: 'modal-actions' }, h('button', { className: 'btn', onClick: () => (setWater(water + 1), close()) }, 'הוספה'), h('button', { className: 'btn secondary', onClick: () => (setWater(Math.max(0, water - 1)), close()) }, 'הסרה'))));
}

function BottomNav({ tab, setTab }) {
  const tabs = [['home', '🏠', 'ראשי'], ['menus', '📋', 'תפריטים'], ['journal', '📅', 'היומן שלי'], ['profile', '👤', 'אזור אישי']];
  return h('nav', { className: 'bottom-nav' }, h('div', { className: 'nav-inner' }, tabs.map(([id, icon, label]) => h('button', { key: id, className: 'nav-item ' + (tab === id ? 'active' : ''), onClick: () => setTab(id) }, h('span', null, icon), h('span', null, label)))));
}

ReactDOM.createRoot(document.getElementById('root')).render(h(App));
