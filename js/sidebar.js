// ═══════════════════════════════════════════════════════════
//  SIDEBAR — injected into every page
// ═══════════════════════════════════════════════════════════

function isActivePage(name) {
  return window.location.pathname.toLowerCase().includes(name);
}

function injectSidebar() {
  const sidebar = `
    <!-- Sidebar Overlay -->
    <div class="sidebar-overlay" id="sidebarOverlay" onclick="closeSidebar()"></div>

    <!-- Sidebar -->
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-inner">

        <!-- Close button -->
        <button class="sidebar-close" onclick="closeSidebar()" aria-label="Close sidebar">✕</button>

        <!-- Profile -->
        <div class="sidebar-profile" id="sidebarProfile"></div>

        <div class="sidebar-divider"></div>

        <!-- Navigation -->
        <nav class="sidebar-nav">
          <p class="sidebar-label">Navigation</p>
          <a href="index.html" class="sidebar-item ${isActivePage('index') || window.location.pathname.endsWith('/') || window.location.pathname.endsWith('FilmVault/') ? 'active' : ''}">
            <span class="si-icon">⌂</span><span class="si-text">Home</span>
          </a>
          <a href="watchlist.html" class="sidebar-item ${isActivePage('watchlist') ? 'active' : ''}">
            <span class="si-icon">◷</span><span class="si-text">Watchlist</span>
            <span class="sb-badge teal" id="sbWlCount">0</span>
          </a>
          <a href="favourites.html" class="sidebar-item ${isActivePage('favourites') ? 'active' : ''}">
            <span class="si-icon">♡</span><span class="si-text">Favourites</span>
            <span class="sb-badge purple" id="sbFavCount">0</span>
          </a>
        </nav>

        <div class="sidebar-divider"></div>

        <!-- Settings -->
        <div class="sidebar-section">
          <p class="sidebar-label">Settings</p>
          <div class="sidebar-setting">
            <div class="setting-left">
              <span id="themeIcon">🌙</span>
              <span id="themeLabel">Dark Mode</span>
            </div>
            <button class="toggle-switch" id="themeToggle" onclick="toggleTheme()" aria-label="Toggle theme">
              <span class="toggle-knob"></span>
            </button>
          </div>
        </div>

        <div class="sidebar-divider"></div>

        <!-- Account -->
        <div class="sidebar-section">
          <p class="sidebar-label">Account</p>
          <div id="sidebarAccount"></div>
        </div>

      </div>
    </aside>

    <!-- Login Modal -->
    <div class="login-overlay" id="loginOverlay">
      <div class="login-modal" id="loginModal">
        <button class="login-close" onclick="closeLoginModal()">✕</button>
        <div class="login-header">
          <h2>Welcome to Nightjar</h2>
          <p>Make room for the films you love.</p>
        </div>
        <form class="login-form" id="loginForm" onsubmit="handleLogin(event)">
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" id="loginName" class="form-input" placeholder="Your name" required autocomplete="name">
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" id="loginEmail" class="form-input" placeholder="you@example.com" required autocomplete="email">
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" id="loginPass" class="form-input" placeholder="••••••••" required>
          </div>
          <button type="submit" class="btn btn-primary login-submit">Sign In</button>
        </form>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('afterbegin', sidebar);
  renderSidebarProfile();
  updateSidebarCounts();
  applyTheme();
}

// ─── Sidebar open / close ──────────────────────────────────
function openSidebar() {
  updateSidebarCounts();
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebarOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('open');
  document.body.style.overflow = '';
}
function updateSidebarCounts() {
  const wl = document.getElementById('sbWlCount');
  const fav = document.getElementById('sbFavCount');
  if (wl)  wl.textContent  = getWatchlist().length;
  if (fav) fav.textContent = getFavs().length;
}

// ─── Theme ────────────────────────────────────────────────
function getTheme() { return localStorage.getItem('filmvault_theme') || 'dark'; }
function applyTheme() {
  const light = getTheme() === 'light';
  document.documentElement.classList.toggle('light-mode', light);
  const toggle = document.getElementById('themeToggle');
  const icon   = document.getElementById('themeIcon');
  const label  = document.getElementById('themeLabel');
  if (toggle) toggle.classList.toggle('on', light);
  if (icon)   icon.textContent  = light ? '☀️' : '🌙';
  if (label)  label.textContent = light ? 'Light Mode' : 'Dark Mode';
}
function toggleTheme() {
  const next = getTheme() === 'dark' ? 'light' : 'dark';
  localStorage.setItem('filmvault_theme', next);
  applyTheme();
}

// ─── Auth ─────────────────────────────────────────────────
function getUser()     { return JSON.parse(localStorage.getItem('filmvault_user') || 'null'); }
function saveUser(u)   { localStorage.setItem('filmvault_user', JSON.stringify(u)); }
function clearUser()   { localStorage.removeItem('filmvault_user'); }

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function renderSidebarProfile() {
  const user = getUser();
  const profileEl = document.getElementById('sidebarProfile');
  const accountEl = document.getElementById('sidebarAccount');

  if (user) {
    profileEl.innerHTML = `
      <div class="profile-avatar">${getInitials(user.name)}</div>
      <div class="profile-info">
        <div class="profile-name">${user.name}</div>
        <div class="profile-email">${user.email}</div>
      </div>`;
    accountEl.innerHTML = `
      <button class="sidebar-item logout-btn" onclick="logout()">
        <span class="si-icon">↗</span><span class="si-text">Log Out</span>
      </button>`;
  } else {
    profileEl.innerHTML = `
      <div class="profile-avatar guest" aria-hidden="true"></div>
      <div class="profile-info">
        <div class="profile-name">Guest User</div>
        <div class="profile-email">Not signed in</div>
      </div>`;
    accountEl.innerHTML = `
      <button class="sidebar-item login-btn" onclick="showLoginModal()">
        <span class="si-icon">↪</span><span class="si-text">Log In</span>
      </button>`;
  }
}

function logout() {
  clearUser();
  renderSidebarProfile();
  showToast('Logged out successfully');
}

// ─── Login Modal ──────────────────────────────────────────
function showLoginModal() {
  closeSidebar();
  setTimeout(() => {
    document.getElementById('loginOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  }, 250);
}
function closeLoginModal() {
  document.getElementById('loginOverlay').classList.remove('open');
  document.body.style.overflow = '';
}
function handleLogin(e) {
  e.preventDefault();
  const name  = document.getElementById('loginName').value.trim();
  const email = document.getElementById('loginEmail').value.trim();
  saveUser({ name, email });
  closeLoginModal();
  renderSidebarProfile();
  showToast(`Welcome to Nightjar, ${name}.`);
  document.getElementById('loginForm').reset();
}

// ─── Auto-init on DOM ready ────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectSidebar);
} else {
  injectSidebar();
}
