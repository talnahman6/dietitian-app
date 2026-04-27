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
  const password = document.getElementById('reg-password').value;
  const confirm  = document.getElementById('reg-confirm').value;
  const errEl    = document.getElementById('reg-error');

  errEl.textContent = '';

  if (!fullName) return showError(errEl, 'יש למלא שם מלא');
  if (!username) return showError(errEl, 'יש למלא שם משתמש');
  if (password.length < 6) return showError(errEl, 'הסיסמא חייבת להכיל לפחות 6 תווים');
  if (password !== confirm) return showError(errEl, 'הסיסמאות אינן תואמות');

  const users = getUsers();
  if (users.find(u => u.username === username)) {
    return showError(errEl, 'שם המשתמש כבר קיים, בחר שם אחר');
  }

  users.push({ fullName, username, password });
  saveUsers(users);
  sessionStorage.setItem('loggedUser', JSON.stringify({ username, fullName }));
  window.location.href = 'onboarding.html';
}

/* ─── LOGIN ─── */
function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('login-username').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;
  const remember = document.getElementById('login-remember').checked;
  const errEl    = document.getElementById('login-error');

  errEl.textContent = '';

  const users = getUsers();
  const user  = users.find(u => u.username === username && u.password === password);

  if (!user) return showError(errEl, 'שם משתמש או סיסמא שגויים');

  const payload = JSON.stringify({ username: user.username, fullName: user.fullName });
  if (remember) {
    localStorage.setItem('loggedUser', payload);
    sessionStorage.removeItem('loggedUser');
  } else {
    sessionStorage.setItem('loggedUser', payload);
    localStorage.removeItem('loggedUser');
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

function showError(el, msg) {
  el.textContent = msg;
}
