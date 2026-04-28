/* ─── SUPABASE ─── */
const _SB_URL = 'https://fujktuwxgzupicyrolwa.supabase.co';
const _SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1amt0dXd4Z3p1cGljeXJvbHdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczNjY2MDIsImV4cCI6MjA5Mjk0MjYwMn0.WffiDP56plkft7lBBD1sYikOzstgONRw7awViO4hwOk';
const _sbReady = new Promise(resolve => {
  if (window.supabase && window.supabase.createClient) {
    console.log('[auth] supabase client ready (inline)');
    resolve(window.supabase.createClient(_SB_URL, _SB_KEY));
  } else {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
    s.onload = () => {
      console.log('[auth] supabase client ready (dynamic)');
      resolve(window.supabase.createClient(_SB_URL, _SB_KEY));
    };
    s.onerror = () => {
      console.error('[auth] supabase CDN failed to load');
      resolve(null);
    };
    document.head.appendChild(s);
  }
});

/* ─── AUTH ─── */

function getUsers() {
  try { return JSON.parse(localStorage.getItem('users') || '[]'); } catch { return []; }
}
function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

/* Returns the currently logged-in user object, or null */
function getLoggedUser() {
  try {
    const u = sessionStorage.getItem('loggedUser') || localStorage.getItem('loggedUser');
    return u ? JSON.parse(u) : null;
  } catch { return null; }
}

/* Called on every page that requires auth (index.html) */
function requireAuth() {
  if (!getLoggedUser()) {
    window.location.href = 'login.html';
  }
}

/* Per-user diet data key */
function dietKey(username) {
  return 'dietData_' + username;
}

/* ─── REGISTER ─── */
async function handleRegister(e) {
  e.preventDefault();
  console.log('[register] submit started');
  const fullName = document.getElementById('reg-fullname').value.trim();
  const username = document.getElementById('reg-username').value.trim().toLowerCase();
  const email    = document.getElementById('reg-email').value.trim();
  const phone    = document.getElementById('reg-phone').value.trim();
  const password = document.getElementById('reg-password').value;
  const confirm  = document.getElementById('reg-confirm').value;
  const errEl    = document.getElementById('reg-error');

  errEl.textContent = '';

  if (!fullName) return showError(errEl, 'יש למלא שם מלא');
  if (!username) return showError(errEl, 'יש למלא שם משתמש');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showError(errEl, 'יש להזין כתובת אימייל תקינה');
  if (!phone) return showError(errEl, 'יש למלא מספר טלפון');
  if (!password) return showError(errEl, 'יש למלא סיסמא');
  if (password.length < 6) return showError(errEl, 'הסיסמא חייבת להכיל לפחות 6 תווים');
  if (password !== confirm) return showError(errEl, 'הסיסמאות אינן תואמות');

  const users = getUsers();
  const sb = await _sbReady;
  console.log('[register] supabase client:', sb ? 'ready' : 'NOT ready');

  if (sb) {
    const { data: existing } = await sb.from('users').select('username').eq('username', username).maybeSingle();
    if (existing) return showError(errEl, 'שם המשתמש כבר קיים, בחר שם אחר');
  } else {
    if (users.find(u => u.username === username)) return showError(errEl, 'שם המשתמש כבר קיים, בחר שם אחר');
  }

  users.push({ fullName, username, email, phone, password });
  saveUsers(users);

  if (sb) {
const insertPayload = { username, password, email, full_name: fullName, phone };

console.log('[register] insert payload:', insertPayload);

const { data: insertData, error: insertError } =
  await sb.from('users').insert([insertPayload]);

console.log('[register] insert result:', insertData);
if (insertError) console.error('[register] insert error:', insertError);
  }

  fetch('https://hook.eu1.make.com/spfr5o7kvmyoh0ke6yphio4tiv99t61d', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: fullName, username, email, phone })
  }).catch(err => console.error('Webhook error:', err));

  sessionStorage.setItem('loggedUser', JSON.stringify({ username, fullName }));
  window.location.href = 'onboarding.html';
}

/* ─── LOGIN ─── */
async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('login-username').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value.trim();
  const remember = document.getElementById('login-remember').checked;
  const errEl    = document.getElementById('login-error');

  errEl.textContent = '';

  let user = null;
  const sb = await _sbReady;

  if (sb) {
    try {
      const { data } = await sb.from('users').select('*').eq('username', username).eq('password', password).maybeSingle();
      if (data) user = data;
    } catch(err) { console.error('Supabase login:', err); }
  }

  if (!user) {
    const users = getUsers();
    user = users.find(u => u.username.trim().toLowerCase() === username && u.password.trim() === password);
  }

  if (!user) return showError(errEl, 'שם משתמש או סיסמא שגויים');

  const fullName = user.fullName || user.full_name || user.username;
  const uname = user.username;
  const payload = JSON.stringify({ username: uname, fullName });
  localStorage.setItem('loggedUser', payload);
  if (remember) {
    sessionStorage.removeItem('loggedUser');
  } else {
    sessionStorage.setItem('loggedUser', payload);
  }

  if (sb) await loadUserData(uname);

  const dietData = JSON.parse(localStorage.getItem(dietKey(uname)) || '{}');
  window.location.href = dietData.tdee ? 'index.html' : 'onboarding.html';
}

/* ─── LOGOUT ─── */
function logout() {
  sessionStorage.removeItem('loggedUser');
  localStorage.removeItem('loggedUser');
  window.location.href = 'login.html';
}

/* ─── RESET PASSWORD ─── */
function updatePassword(username, newPassword) {
  const users = getUsers();
  const idx = users.findIndex(u => u.username === username);
  if (idx === -1) return false;
  users[idx].password = newPassword;
  saveUsers(users);
  return true;
}

function updateCredentials(oldUsername, newUsername, newPassword) {
  const users = getUsers();
  const idx = users.findIndex(u => u.username === oldUsername);
  if (idx === -1) return false;
  const oldKey = dietKey(oldUsername);
  users[idx].username = newUsername;
  users[idx].password = newPassword;
  saveUsers(users);
  if (oldUsername !== newUsername) {
    const data = localStorage.getItem(oldKey);
    if (data) {
      localStorage.setItem(dietKey(newUsername), data);
      localStorage.removeItem(oldKey);
    }
  }
  return true;
}

/* ─── SUPABASE USER DATA ─── */
async function saveUserData(username) {
  const sb = await _sbReady;
  if (!sb) return;
  try {
    const key = dietKey(username);
    const d = JSON.parse(localStorage.getItem(key) || '{}');
    const mealTimes = JSON.parse(localStorage.getItem('mealTimes') || 'null');
    const foodPrefs = JSON.parse(localStorage.getItem('foodPreferences') || 'null');
    const dietLog = {};
    for (const k of Object.keys(d)) {
      if (!['tdee','goal','weeklyGoal','dailyCal','bmr'].includes(k)) dietLog[k] = d[k];
    }
    const payload = { username, updated_at: new Date().toISOString() };
    if (d.tdee)       payload.tdee             = d.tdee;
    if (d.goal)       payload.goal             = d.goal;
    if (d.weeklyGoal) payload.weekly_goal      = d.weeklyGoal;
    if (d.dailyCal)   payload.daily_calories   = d.dailyCal;
    if (mealTimes)    payload.meal_times       = mealTimes;
    if (foodPrefs)    payload.food_preferences = foodPrefs;
    if (Object.keys(dietLog).length) payload.diet_log = dietLog;
    await sb.from('user_data').upsert(payload, { onConflict: 'username' });
  } catch(err) { console.error('Supabase saveUserData:', err); }
}

async function loadUserData(username) {
  const sb = await _sbReady;
  if (!sb) return;
  try {
    const { data, error } = await sb.from('user_data').select('*').eq('username', username).maybeSingle();
    if (error || !data) return;
    const key = dietKey(username);
    const local = JSON.parse(localStorage.getItem(key) || '{}');
    if (data.tdee)           local.tdee       = data.tdee;
    if (data.goal)           local.goal       = data.goal;
    if (data.weekly_goal)    local.weeklyGoal = data.weekly_goal;
    if (data.daily_calories) local.dailyCal   = data.daily_calories;
    if (data.diet_log)       Object.assign(local, data.diet_log);
    localStorage.setItem(key, JSON.stringify(local));
    if (data.meal_times)       localStorage.setItem('mealTimes', JSON.stringify(data.meal_times));
    if (data.food_preferences) localStorage.setItem('foodPreferences', JSON.stringify(data.food_preferences));
  } catch(err) { console.error('Supabase loadUserData:', err); }
}

function showError(el, msg) {
  el.textContent = msg;
}
window.handleRegister = handleRegister;