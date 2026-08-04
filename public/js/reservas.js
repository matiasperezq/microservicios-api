const API_BASE = window.location.origin;
const $ = (id) => document.getElementById(id);

const SPORT_EMOJI = { 'Fútbol': '⚽', 'Futbol': '⚽', 'Tenis': '🎾', 'Pádel': '🏓', 'Padel': '🏓' };
const OPEN_HOUR = 8;   // la cancha abre 08:00
const CLOSE_HOUR = 23; // último turno empieza 22:00, cierra 23:00

const token = localStorage.getItem('auth_token');
const userRaw = localStorage.getItem('auth_user');

if (!token) {
  window.location.href = '/auth';
}

const user = userRaw ? JSON.parse(userRaw) : null;
if (user) {
  $('userChip').textContent = user.name;
}

let selectedSportId = null;
let selectedCourt = null;
let selectedSlot = null; // { start, end }

// Convierte "2026-08-01" -> "01/08/2026"
function formatDateDMY(isoDate) {
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
}

function authHeaders(extra = {}) {
  return {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
    ...extra,
  };
}

// ---------- Navegación entre vistas ----------
document.querySelectorAll('.nav-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    $('view-' + btn.dataset.view).classList.add('active');

    if (btn.dataset.view === 'misreservas') {
      loadMyReservations();
    }
  });
});

$('logoutBtn').addEventListener('click', async () => {
  try {
    await fetch(`${API_BASE}/api/logout`, { method: 'POST', headers: authHeaders() });
  } catch (_) {}
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
  window.location.href = '/auth';
});

// ---------- Cargar deportes ----------
async function loadSports() {
  try {
    const res = await fetch(`${API_BASE}/api/sports`, { headers: authHeaders() });
    const data = await res.json();
    const sports = data.data || [];

    if (sports.length === 0) {
      $('sportChips').innerHTML = '<span class="empty-msg">Todavía no hay deportes cargados.</span>';
      return;
    }

    $('sportChips').innerHTML = '';
    sports.forEach((sport, i) => {
      const chip = document.createElement('span');
      chip.className = 'sport-chip' + (i === 0 ? ' active' : '');
      chip.textContent = `${SPORT_EMOJI[sport.name] || '🏟️'} ${sport.name}`;
      chip.dataset.sportId = sport.id;
      chip.addEventListener('click', () => selectSport(sport.id, chip));
      $('sportChips').appendChild(chip);
    });

    selectSport(sports[0].id, $('sportChips').firstElementChild);
  } catch (err) {
    $('sportChips').innerHTML = '<span class="empty-msg">No se pudieron cargar los deportes.</span>';
  }
}

function selectSport(sportId, chipEl) {
  selectedSportId = sportId;
  document.querySelectorAll('.sport-chip').forEach(c => c.classList.remove('active'));
  chipEl.classList.add('active');
  hideBookingPanel();
  loadCourts(sportId);
}

// ---------- Cargar canchas de un deporte ----------
async function loadCourts(sportId) {
  $('courtsGrid').innerHTML = '<span class="empty-msg">Cargando canchas…</span>';
  try {
    const res = await fetch(`${API_BASE}/api/courts?sport_id=${sportId}`, { headers: authHeaders() });
    const data = await res.json();
    const courts = data.data || [];

    if (courts.length === 0) {
      $('courtsGrid').innerHTML = '<span class="empty-msg">No hay canchas cargadas para este deporte todavía.</span>';
      return;
    }

    $('courtsGrid').innerHTML = '';
    courts.forEach(court => {
      const card = document.createElement('div');
      card.className = 'court-card';
      const photoStyle = court.photo_url ? `style="background-image:url('${court.photo_url}')"` : '';
      card.innerHTML = `
        <div class="photo" ${photoStyle}>${court.photo_url ? '' : (SPORT_EMOJI[court.sport] || '🏟️')}</div>
        <div class="info">
          <h3>${court.name}</h3>
          <div class="price">$${Number(court.price_per_hour).toLocaleString('es-AR')} / hora</div>
        </div>
      `;
      card.addEventListener('click', () => openBookingPanel(court));
      $('courtsGrid').appendChild(card);
    });
  } catch (err) {
    $('courtsGrid').innerHTML = '<span class="empty-msg">No se pudieron cargar las canchas.</span>';
  }
}

// ---------- Panel de reserva ----------
function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function openBookingPanel(court) {
  selectedCourt = court;
  selectedSlot = null;
  $('bpCourtName').textContent = `Reservar — ${court.name}`;
  $('bookingPanel').style.display = 'block';
  $('bookingDate').min = todayISO();
  $('bookingDate').value = todayISO();
  $('bookingMsg').className = 'msg';
  $('bookingMsg').textContent = '';
  updateSummary();
  loadAvailability();
  $('bookingPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function hideBookingPanel() {
  $('bookingPanel').style.display = 'none';
  selectedCourt = null;
  selectedSlot = null;
}

$('closePanel').addEventListener('click', hideBookingPanel);
$('bookingDate').addEventListener('change', loadAvailability);

async function loadAvailability() {
  if (!selectedCourt) return;
  selectedSlot = null;
  updateSummary();

  const date = $('bookingDate').value;
  $('slotsGrid').innerHTML = '<span class="empty-msg">Cargando horarios…</span>';

  try {
    const res = await fetch(
      `${API_BASE}/api/courts/${selectedCourt.id}/availability?date=${date}`,
      { headers: authHeaders() }
    );
    const data = await res.json();
    const reserved = data.data || [];

    renderSlots(reserved);
  } catch (err) {
    $('slotsGrid').innerHTML = '<span class="empty-msg">No se pudo cargar la disponibilidad.</span>';
  }
}

function renderSlots(reserved) {
  $('slotsGrid').innerHTML = '';

  const selectedDate = $('bookingDate').value;
  const isToday = selectedDate === todayISO();
  const currentHour = new Date().getHours();

  let visibleCount = 0;

  for (let hour = OPEN_HOUR; hour < CLOSE_HOUR; hour++) {
    if (isToday && hour <= currentHour) continue;

    visibleCount++;
    const start = `${String(hour).padStart(2, '0')}:00`;
    const end = `${String(hour + 1).padStart(2, '0')}:00`;

    const isOccupied = reserved.some(r => start < r.end_time && end > r.start_time);

    const btn = document.createElement('button');
    btn.className = 'slot-btn' + (isOccupied ? ' occupied' : '');
    btn.textContent = start;
    btn.disabled = isOccupied;

    if (!isOccupied) {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedSlot = { start, end };
        updateSummary();
      });
    }

    $('slotsGrid').appendChild(btn);
  }

  if (visibleCount === 0) {
    $('slotsGrid').innerHTML = '<span class="empty-msg">No quedan horarios disponibles para hoy.</span>';
  }
}

function updateSummary() {
  if (selectedSlot && selectedCourt) {
    $('bookingSummary').innerHTML =
      `<strong>${selectedCourt.name}</strong> — ${formatDateDMY($('bookingDate').value)} de ${selectedSlot.start} a ${selectedSlot.end}`;
    $('confirmBtn').disabled = false;
  } else {
    $('bookingSummary').textContent = 'Elegí un horario';
    $('confirmBtn').disabled = true;
  }
}

$('confirmBtn').addEventListener('click', async () => {
  if (!selectedSlot || !selectedCourt) return;

  $('confirmBtn').disabled = true;
  const msg = $('bookingMsg');
  msg.className = 'msg';

  try {
    const res = await fetch(`${API_BASE}/api/reservations`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        court_id: selectedCourt.id,
        date: $('bookingDate').value,
        start_time: selectedSlot.start,
        end_time: selectedSlot.end,
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      msg.className = 'msg error';
      msg.textContent = data.message || 'No se pudo confirmar la reserva.';
      $('confirmBtn').disabled = false;
      return;
    }

    msg.className = 'msg success';
    msg.textContent = '¡Reserva confirmada!';
    selectedSlot = null;
    updateSummary();
    loadAvailability();
  } catch (err) {
    msg.className = 'msg error';
    msg.textContent = 'Error de conexión al confirmar la reserva.';
    $('confirmBtn').disabled = false;
  }
});

// ---------- Mis reservas ----------
async function loadMyReservations() {
  $('reservationList').innerHTML = '<span class="empty-msg">Cargando tus reservas…</span>';
  try {
    const res = await fetch(`${API_BASE}/api/my-reservations`, { headers: authHeaders() });
    const data = await res.json();
    const reservations = data.data || [];

    if (reservations.length === 0) {
      $('reservationList').innerHTML = '<span class="empty-msg">Todavía no reservaste ninguna cancha.</span>';
      return;
    }

    $('reservationList').innerHTML = '';
    reservations.forEach(r => {
      const item = document.createElement('div');
      item.className = 'reservation-item';
      const sportName = r.court?.sport?.name || '';
      const courtName = r.court?.name || `Cancha #${r.court_id}`;
      const emoji = SPORT_EMOJI[sportName] || '🏟️';

      item.innerHTML = `
        <div class="r-info">
          <h4>${emoji} ${courtName}</h4>
          <p>${formatDateDMY(r.date)} · ${r.start_time.slice(0,5)} a ${r.end_time.slice(0,5)}</p>
        </div>
        <span class="r-status ${r.status}">${r.status === 'confirmed' ? 'Confirmada' : 'Cancelada'}</span>
        ${r.status === 'confirmed' ? `<button class="cancel-btn" data-id="${r.id}">Cancelar</button>` : ''}
      `;
      $('reservationList').appendChild(item);
    });

    document.querySelectorAll('.cancel-btn').forEach(btn => {
      btn.addEventListener('click', () => cancelReservation(btn.dataset.id));
    });
  } catch (err) {
    $('reservationList').innerHTML = '<span class="empty-msg">No se pudieron cargar tus reservas.</span>';
  }
}

async function cancelReservation(id) {
  if (!confirm('¿Cancelar esta reserva?')) return;
  try {
    await fetch(`${API_BASE}/api/reservations/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    loadMyReservations();
  } catch (err) {
    alert('No se pudo cancelar la reserva.');
  }
}

// ---------- Init ----------
loadSports();
