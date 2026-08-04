const API_BASE = window.location.origin;
const $ = (id) => document.getElementById(id);

const token = localStorage.getItem('auth_token');
if (!token) window.location.href = '/auth';

function authHeaders(extra = {}) {
  return { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json', ...extra };
}

$('logoutBtn').addEventListener('click', async () => {
  try { await fetch(`${API_BASE}/api/logout`, { method: 'POST', headers: authHeaders() }); } catch (_) {}
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
  window.location.href = '/auth';
});

let sportsCache = [];

// ---------- Verificación de rol admin ----------
async function checkAdminAccess() {
  try {
    const res = await fetch(`${API_BASE}/api/user`, { headers: authHeaders() });
    if (!res.ok) throw new Error('sesión inválida');
    const data = await res.json();
    const user = data.data.user;
    const roles = user.roles || [];

    if (!roles.includes('admin')) {
      $('accessDenied').style.display = 'block';
      return false;
    }

    $('appContainer').style.display = 'block';
    return true;
  } catch (err) {
    window.location.href = '/auth';
    return false;
  }
}

// ---------- Deportes ----------
async function loadSports() {
  try {
    const res = await fetch(`${API_BASE}/api/sports`, { headers: authHeaders() });
    const data = await res.json();
    sportsCache = data.data || [];

    renderSportTags();
    renderSportSelect();
  } catch (err) {
    $('sportTags').innerHTML = '<span class="empty-msg">No se pudieron cargar los deportes.</span>';
  }
}

function renderSportTags() {
  if (sportsCache.length === 0) {
    $('sportTags').innerHTML = '<span class="empty-msg">Todavía no hay deportes cargados.</span>';
    return;
  }
  $('sportTags').innerHTML = '';
  sportsCache.forEach(sport => {
    const tag = document.createElement('span');
    tag.className = 'sport-tag';
    tag.innerHTML = `${sport.name} <button data-id="${sport.id}" title="Eliminar">&times;</button>`;
    tag.querySelector('button').addEventListener('click', () => deleteSport(sport.id));
    $('sportTags').appendChild(tag);
  });
}

function renderSportSelect() {
  $('courtSport').innerHTML = sportsCache
    .map(s => `<option value="${s.id}">${s.name}</option>`)
    .join('');
}

$('sportForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = $('sportMsg');
  msg.className = 'msg';

  try {
    const res = await fetch(`${API_BASE}/api/sports`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ name: $('sportName').value }),
    });
    const data = await res.json();

    if (!res.ok) {
      const firstError = data.errors ? Object.values(data.errors)[0][0] : (data.message || 'No se pudo crear.');
      msg.className = 'msg error';
      msg.textContent = firstError;
      return;
    }

    $('sportForm').reset();
    msg.className = 'msg success';
    msg.textContent = 'Deporte agregado.';
    loadSports();
  } catch (err) {
    msg.className = 'msg error';
    msg.textContent = 'Error de conexión.';
  }
});

async function deleteSport(id) {
  if (!confirm('¿Eliminar este deporte? También se eliminan sus canchas.')) return;
  try {
    await fetch(`${API_BASE}/api/sports/${id}`, { method: 'DELETE', headers: authHeaders() });
    loadSports();
    loadCourts();
  } catch (err) {
    alert('No se pudo eliminar.');
  }
}

// ---------- Canchas ----------
async function loadCourts() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/courts`, { headers: authHeaders() });
    const data = await res.json();
    const courts = data.data || [];

    if (courts.length === 0) {
      $('courtsGrid').innerHTML = '<span class="empty-msg">Todavía no hay canchas cargadas.</span>';
      return;
    }

    $('courtsGrid').innerHTML = '';
    courts.forEach(court => {
      const card = document.createElement('div');
      card.className = 'court-card' + (court.is_active ? '' : ' inactive');
      const photoStyle = court.photo_url ? `style="background-image:url('${court.photo_url}')"` : '';

      card.innerHTML = `
        <div class="photo" ${photoStyle}>
          ${court.photo_url ? '' : '🏟️'}
          <label>Cambiar foto
            <input type="file" accept="image/*" data-id="${court.id}">
          </label>
        </div>
        <div class="info">
          <h3>${court.name}</h3>
          <div class="meta">${court.sport} · $${Number(court.price_per_hour).toLocaleString('es-AR')}/hora</div>
          <div class="row-actions">
            <label class="switch">
              <input type="checkbox" ${court.is_active ? 'checked' : ''} data-id="${court.id}" class="toggle-active">
              <span class="slider"></span>
            </label>
            <button class="icon-btn delete-court" data-id="${court.id}">Eliminar</button>
          </div>
        </div>
      `;
      $('courtsGrid').appendChild(card);
    });

    document.querySelectorAll('.toggle-active').forEach(el => {
      el.addEventListener('change', () => toggleCourtActive(el.dataset.id, el.checked));
    });
    document.querySelectorAll('.delete-court').forEach(el => {
      el.addEventListener('click', () => deleteCourt(el.dataset.id));
    });
    document.querySelectorAll('.photo input[type="file"]').forEach(el => {
      el.addEventListener('change', () => replaceCourtPhoto(el.dataset.id, el.files[0]));
    });
  } catch (err) {
    $('courtsGrid').innerHTML = '<span class="empty-msg">No se pudieron cargar las canchas.</span>';
  }
}

$('courtForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = $('courtMsg');
  msg.className = 'msg';

  const formData = new FormData();
  formData.append('sport_id', $('courtSport').value);
  formData.append('name', $('courtName').value);
  formData.append('price_per_hour', $('courtPrice').value);
  if ($('courtPhoto').files[0]) {
    formData.append('photo', $('courtPhoto').files[0]);
  }

  try {
    const res = await fetch(`${API_BASE}/api/courts`, {
      method: 'POST',
      headers: authHeaders(),
      body: formData,
    });
    const data = await res.json();

    if (!res.ok) {
      const firstError = data.errors ? Object.values(data.errors)[0][0] : (data.message || 'No se pudo crear.');
      msg.className = 'msg error';
      msg.textContent = firstError;
      return;
    }

    $('courtForm').reset();
    msg.className = 'msg success';
    msg.textContent = 'Cancha agregada.';
    loadCourts();
  } catch (err) {
    msg.className = 'msg error';
    msg.textContent = 'Error de conexión.';
  }
});

async function toggleCourtActive(id, isActive) {
  try {
    await fetch(`${API_BASE}/api/courts/${id}`, {
      method: 'PUT',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ is_active: isActive }),
    });
    loadCourts();
  } catch (err) {
    alert('No se pudo actualizar el estado de la cancha.');
  }
}

async function deleteCourt(id) {
  if (!confirm('¿Eliminar esta cancha?')) return;
  try {
    await fetch(`${API_BASE}/api/courts/${id}`, { method: 'DELETE', headers: authHeaders() });
    loadCourts();
  } catch (err) {
    alert('No se pudo eliminar la cancha.');
  }
}

// Laravel no puede leer archivos en un PUT real desde el navegador,
// así que mandamos POST con _method=PUT (spoofing) para poder subir la foto.
async function replaceCourtPhoto(id, file) {
  if (!file) return;
  const formData = new FormData();
  formData.append('_method', 'PUT');
  formData.append('photo', file);

  try {
    const res = await fetch(`${API_BASE}/api/courts/${id}`, {
      method: 'POST',
      headers: authHeaders(),
      body: formData,
    });
    if (!res.ok) throw new Error();
    loadCourts();
  } catch (err) {
    alert('No se pudo actualizar la foto.');
  }
}

// ---------- Init ----------
(async function init() {
  const ok = await checkAdminAccess();
  if (!ok) return;
  await loadSports();
  await loadCourts();
})();
