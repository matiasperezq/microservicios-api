const API_BASE = window.location.origin;
document.getElementById('apiBaseLabel').textContent = API_BASE;

const $ = (id) => document.getElementById(id);

function showMsg(el, text, type) {
  el.textContent = text;
  el.className = 'msg ' + type;
}

function clearMsg(el) {
  el.textContent = '';
  el.className = 'msg';
}


document.querySelectorAll('#tabs button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#tabs button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    $('loginForm').classList.toggle('active', tab === 'login');
    $('registerForm').classList.toggle('active', tab === 'register');
  });
});


function saveSession(token, user) {
  localStorage.setItem('auth_token', token);
  localStorage.setItem('auth_user', JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
}

function getToken() {
  return localStorage.getItem('auth_token');
}

function isAdmin(user) {
  return Array.isArray(user.roles) && user.roles.includes('admin');
}

function renderProfile(user, token) {
  $('tabs').style.display = 'none';
  $('loginForm').classList.remove('active');
  $('registerForm').classList.remove('active');
  $('profile').style.display = 'block';

  $('pName').textContent = user.name;
  $('pEmail').textContent = user.email;
  $('pRoles').textContent = (user.roles || []).join(', ') || '—';
  $('pToken').textContent = token.slice(0, 12) + '...';
}

function renderLoggedOut() {
  $('tabs').style.display = 'flex';
  $('profile').style.display = 'none';
  document.querySelector('#tabs button[data-tab="login"]').click();
}

// ---- Registro ----
$('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = $('registerMsg');
  clearMsg(msg);

  const body = {
    name: $('regName').value,
    email: $('regEmail').value,
    password: $('regPassword').value,
    password_confirmation: $('regPasswordConfirm').value,
  };

  try {
    const res = await fetch(`${API_BASE}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (!res.ok) {
      const firstError = data.errors
        ? Object.values(data.errors)[0][0]
        : (data.message || 'No se pudo registrar');
      showMsg(msg, firstError, 'error');
      return;
    }

    saveSession(data.data.token, data.data.user);
    showMsg(msg, '¡Cuenta creada!', 'success');
    setTimeout(() => renderProfile(data.data.user, data.data.token), 400);
  } catch (err) {
    showMsg(msg, 'No se pudo conectar con la API (' + err.message + ')', 'error');
  }
});

// ---- Login ----
$('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = $('loginMsg');
  clearMsg(msg);

  const body = {
    email: $('loginEmail').value,
    password: $('loginPassword').value,
    remember: $('loginRemember').checked,
  };

  try {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (!res.ok) {
      showMsg(msg, data.message || 'Credenciales incorrectas', 'error');
      return;
    }

    saveSession(data.data.token, data.data.user);
    showMsg(msg, 'Login correcto', 'success');

    if (isAdmin(data.data.user)) {
      setTimeout(() => { window.location.href = '/admin'; }, 300);
    } else {
      setTimeout(() => renderProfile(data.data.user, data.data.token), 300);
    }
  } catch (err) {
    showMsg(msg, 'No se pudo conectar con la API (' + err.message + ')', 'error');
  }
});

// ---- Logout ----
$('logoutBtn').addEventListener('click', async () => {
  const token = getToken();
  try {
    await fetch(`${API_BASE}/api/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
    });
  } catch (_) {
    // aunque falle la llamada, igual limpiamos la sesión local
  }
  clearSession();
  renderLoggedOut();
});

// ---- Al cargar: si ya hay token guardado, validarlo contra /api/user ----
(async function init() {
  const token = getToken();
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/api/user`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
    });
    if (!res.ok) throw new Error('token inválido');
    const data = await res.json();

    if (isAdmin(data.data.user)) {
      window.location.href = '/admin';
      return;
    }

    renderProfile(data.data.user, token);
  } catch (_) {
    clearSession();
  }
})();

// ---- Botones del header (Iniciar sesión / Registrarme) ----
document.querySelectorAll('[data-goto]').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.goto;
    document.querySelector(`#tabs button[data-tab="${tab}"]`)?.click();
    document.getElementById('authCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
