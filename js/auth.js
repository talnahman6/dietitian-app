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
function handleRegister(e) {
  e.preventDefault();
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
  if (users.find(u => u.username === username)) {
    return showError(errEl, 'שם המשתמש כבר קיים, בחר שם אחר');
  }

  users.push({ fullName, username, email, phone, password });
  saveUsers(users);

  fetch('https://hook.eu1.make.com/spfr5o7kvmyoh0ke6yphio4tiv99t61d', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: fullName, username, email, phone })
  }).catch(err => console.error('Webhook error:', err));

  sessionStorage.setItem('loggedUser', JSON.stringify({ username, fullName }));
  window.location.href = 'onboarding.html';
}

/* ─── LOGIN ─── */
function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('login-username').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value.trim();
  const remember = document.getElementById('login-remember').checked;
  const errEl    = document.getElementById('login-error');

  errEl.textContent = '';

  const users = getUsers();
  console.log('[AUTH] users:', users);
  console.log('[AUTH] input username:', username, '| password:', password);

  const user = users.find(u => u.username.trim().toLowerCase() === username && u.password.trim() === password);
  console.log('[AUTH] match:', user ? 'found' : 'not found');

  if (!user) return showError(errEl, 'שם משתמש או סיסמא שגויים');

  const payload = JSON.stringify({ username: user.username, fullName: user.fullName });
  localStorage.setItem('loggedUser', payload);
  if (remember) {
    sessionStorage.removeItem('loggedUser');
  } else {
    sessionStorage.setItem('loggedUser', payload);
  }
  const dietData = JSON.parse(localStorage.getItem(dietKey(user.username)) || '{}');
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

function showError(el, msg) {
  el.textContent = msg;
}
