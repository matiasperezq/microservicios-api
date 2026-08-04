<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SportRent — Reservar cancha</title>
<link rel="stylesheet" href="{{ asset('css/reservas.css') }}">
</head>
<body>

<header class="topbar">
  <div class="logo"><span class="dot"></span> SportRent</div>
  <nav>
    <button class="nav-tab active" data-view="reservar">Reservar</button>
    <button class="nav-tab" data-view="misreservas">Mis reservas</button>
  </nav>
  <div>
    <span class="user-chip" id="userChip"></span>
    <button id="logoutBtn">Cerrar sesión</button>
  </div>
</header>

<div class="container">

  <!-- Vista: Reservar -->
  <div class="view active" id="view-reservar">
    <h2 class="section-title">Elegí tu deporte</h2>
    <div class="sport-chips" id="sportChips">
      <span class="empty-msg">Cargando deportes…</span>
    </div>

    <h2 class="section-title">Canchas disponibles</h2>
    <div class="courts-grid" id="courtsGrid">
      <span class="empty-msg">Elegí un deporte para ver las canchas.</span>
    </div>

    <!-- Panel de reserva, se muestra al elegir una cancha -->
    <div class="booking-panel" id="bookingPanel" style="display:none;">
      <div class="bp-header">
        <h3 id="bpCourtName">Reservar cancha</h3>
        <button class="close-panel" id="closePanel">&times;</button>
      </div>

      <div class="date-field">
        <label for="bookingDate">Fecha</label>
        <input type="date" id="bookingDate">
      </div>

      <div class="slots-grid" id="slotsGrid"></div>

      <div class="confirm-row">
        <div class="summary" id="bookingSummary">Elegí un horario</div>
        <button class="confirm-btn" id="confirmBtn" disabled>Confirmar reserva</button>
      </div>

      <div class="msg" id="bookingMsg"></div>
    </div>
  </div>

  <!-- Vista: Mis reservas -->
  <div class="view" id="view-misreservas">
    <h2 class="section-title">Mis reservas</h2>
    <div class="reservation-list" id="reservationList">
      <span class="empty-msg">Cargando tus reservas…</span>
    </div>
  </div>

</div>

<script src="{{ asset('js/reservas.js') }}"></script>
</body>
</html>
