<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SportRent — Admin</title>
<link rel="stylesheet" href="{{ asset('css/admin.css') }}">
</head>
<body>

<header class="topbar">
  <div class="logo"><span class="dot"></span> SportRent <span class="badge">Admin</span></div>
  <div class="actions">
    <a href="/reservas" class="link-btn">Ir a Reservar</a>
    <button id="logoutBtn">Cerrar sesión</button>
  </div>
</header>

<div class="container" id="appContainer" style="display:none;">

  <!-- Deportes -->
  <section class="admin-section">
    <h2 class="section-title">Deportes</h2>

    <div class="form-card">
      <form id="sportForm" class="form-row">
        <div class="field">
          <label for="sportName">Nombre del deporte</label>
          <input type="text" id="sportName" placeholder="Ej: Básquet" required>
        </div>
        <button type="submit" class="primary-btn">Agregar deporte</button>
      </form>
      <div class="msg" id="sportMsg"></div>
    </div>

    <div class="sport-tags" id="sportTags">
      <span class="empty-msg">Cargando…</span>
    </div>
  </section>

  <!-- Canchas -->
  <section class="admin-section">
    <h2 class="section-title">Canchas</h2>

    <div class="form-card">
      <form id="courtForm" class="form-row" enctype="multipart/form-data">
        <div class="field">
          <label for="courtSport">Deporte</label>
          <select id="courtSport" required></select>
        </div>
        <div class="field">
          <label for="courtName">Nombre</label>
          <input type="text" id="courtName" placeholder="Ej: Cancha 2" required>
        </div>
        <div class="field">
          <label for="courtPrice">Precio por hora</label>
          <input type="number" id="courtPrice" min="0" step="100" placeholder="5000" required>
        </div>
        <div class="field">
          <label for="courtPhoto">Foto (opcional)</label>
          <input type="file" id="courtPhoto" accept="image/*">
        </div>
        <button type="submit" class="primary-btn">Agregar cancha</button>
      </form>
      <div class="msg" id="courtMsg"></div>
    </div>

    <div class="courts-grid" id="courtsGrid">
      <span class="empty-msg">Cargando…</span>
    </div>
  </section>

</div>

<div class="access-denied" id="accessDenied" style="display:none;">
  <h2>Acceso restringido</h2>
  <p>Esta sección es solo para administradores.</p>
  <a href="/reservas" class="link-btn" style="border-color:#1F7A4D;color:#1F7A4D;">Volver a Reservar</a>
</div>

<script src="{{ asset('js/admin.js') }}"></script>
</body>
</html>
