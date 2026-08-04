<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SportRent — Reservá tu cancha</title>
<link rel="stylesheet" href="{{ asset('css/auth.css') }}">
</head>
<body>

<header class="topbar">
  <div class="logo"><span class="dot"></span> SportRent</div>
  <nav>
    <button class="nav-btn ghost" data-goto="login">Iniciar sesión</button>
    <button class="nav-btn solid" data-goto="register">Registrarme</button>
  </nav>
</header>

<div class="hero">

  <div class="pitch">
    <span class="eyebrow">Club deportivo</span>
    <h1>Reservá tu cancha en segundos.</h1>
    <p>Fútbol, tenis y pádel disponibles todos los días. Elegí el horario, confirmá, y listo — tu cancha queda reservada al instante.</p>
    <div class="sports-row">
      <span class="sport-chip">⚽ Fútbol</span>
      <span class="sport-chip">🎾 Tenis</span>
      <span class="sport-chip">🏓 Pádel</span>
    </div>
    <div class="court-line"></div>
  </div>

  <div id="authCard">
    <div class="card">

      <!-- Tabs -->
      <div class="tabs" id="tabs">
        <button class="active" data-tab="login">Iniciar sesión</button>
        <button data-tab="register">Crear cuenta</button>
      </div>

      <!-- Login form -->
      <form id="loginForm" class="active">
        <div class="field">
          <label for="loginEmail">Email</label>
          <input type="email" id="loginEmail" required autocomplete="email">
        </div>
        <div class="field">
          <label for="loginPassword">Contraseña</label>
          <input type="password" id="loginPassword" required autocomplete="current-password">
        </div>
        <label class="row">
          <input type="checkbox" id="loginRemember" style="width:auto;">
          Recordarme (token válido 30 días)
        </label>
        <button type="submit" class="submit">Ingresar</button>
        <div class="msg" id="loginMsg"></div>
      </form>

      <!-- Register form -->
      <form id="registerForm">
        <div class="field">
          <label for="regName">Nombre</label>
          <input type="text" id="regName" required autocomplete="name">
        </div>
        <div class="field">
          <label for="regEmail">Email</label>
          <input type="email" id="regEmail" required autocomplete="email">
        </div>
        <div class="field">
          <label for="regPassword">Contraseña</label>
          <input type="password" id="regPassword" required minlength="8" autocomplete="new-password">
        </div>
        <div class="field">
          <label for="regPasswordConfirm">Confirmar contraseña</label>
          <input type="password" id="regPasswordConfirm" required minlength="8" autocomplete="new-password">
        </div>
        <button type="submit" class="submit">Registrarme</button>
        <div class="msg" id="registerMsg"></div>
      </form>

      <!-- Profile (logged-in) view -->
      <div id="profile">
        <div class="field-row"><span>Nombre</span><span id="pName"></span></div>
        <div class="field-row"><span>Email</span><span id="pEmail"></span></div>
        <div class="field-row"><span>Roles</span><span id="pRoles"></span></div>
        <div class="field-row"><span>Token (parcial)</span><span id="pToken"></span></div>
        <a href="/reservas" class="nav-btn solid" style="display:block;text-align:center;margin-top:18px;text-decoration:none;">Reservar una cancha</a>
        <button id="logoutBtn">Cerrar sesión</button>
      </div>

    </div>
    <div class="apibase">API_BASE = <span id="apiBaseLabel"></span></div>
  </div>

</div>

<script src="{{ asset('js/auth.js') }}"></script>
</body>
</html>
