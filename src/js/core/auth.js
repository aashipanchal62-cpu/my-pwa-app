/**
 * STUDYVERSE – Authentication Module
 * auth.js
 * Handles login, registration, session management (localStorage-based for standalone mode)
 * When backend is connected, replace LS calls with API calls.
 */
SV.Auth = (() => {
  let currentUser = null;

  const USERS_KEY = 'sv_users_db';
  const TOKEN_KEY = SV.Config.STORAGE_KEYS.TOKEN;
  const USER_KEY  = SV.Config.STORAGE_KEYS.USER;

  /* ── Helpers ── */
  function getUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }
    catch { return []; }
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function hashPassword(password) {
    // Simple base64 encode (replace with bcrypt on backend)
    return btoa(password + '_sv_salt_2027');
  }

  function generateToken(userId) {
    return btoa(`${userId}:${Date.now()}:${Math.random()}`);
  }

  function saveSession(user, token) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  /* ── Public API ── */
  return {
    getCurrentUser() { return currentUser; },
    isAuthenticated() { return !!currentUser; },
    getToken() { return localStorage.getItem(TOKEN_KEY); },

    async init() {
      // Purge any legacy/test session with personal names
      try {
        const savedUserStr = localStorage.getItem(USER_KEY);
        if (savedUserStr && (savedUserStr.toLowerCase().includes('aashi') || savedUserStr.toLowerCase().includes('panchal'))) {
          localStorage.removeItem(USER_KEY);
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USERS_KEY);
        }
        const usersDbStr = localStorage.getItem(USERS_KEY);
        if (usersDbStr && (usersDbStr.toLowerCase().includes('aashi') || usersDbStr.toLowerCase().includes('panchal'))) {
          localStorage.removeItem(USERS_KEY);
        }
      } catch (e) {
        // ignore storage parse issues
      }

      const savedUser = localStorage.getItem(USER_KEY);
      const savedToken = localStorage.getItem(TOKEN_KEY);
      if (savedUser && savedToken) {
        try {
          currentUser = JSON.parse(savedUser);
          return true;
        } catch { return false; }
      }
      return false;
    },

    async quickStart({ name, studentId = '', examAttempt = 'May 2027', targetExamDate = '2027-05-02' }) {
      if (!name || name.trim().length < 2) throw new Error('Please enter your full name to get started.');
      const users = getUsers();
      const safeName = name.trim();
      const user = {
        id: SV.Utils.uniqueId('user'),
        name: safeName,
        studentId: studentId.trim(),
        email: `${safeName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'ca_student'}@studyverse.local`,
        role: users.length === 0 ? 'admin' : 'student',
        examAttempt,
        targetExamDate,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        points: 100,
        level: 1,
        streakDays: 1,
        lastStudyDate: new Date().toISOString().split('T')[0],
      };

      users.push(user);
      saveUsers(users);

      const token = generateToken(user.id);
      saveSession(user, token);
      currentUser = user;

      SV.EventBus.emit('auth:registered', user);
      return user;
    },

    async register({ name, email, password, studentId = '', examAttempt = 'May 2027', targetExamDate = '2027-05-02' }) {
      const users = getUsers();
      if (users.find(u => u.email === email.toLowerCase())) {
        throw new Error('An account with this email already exists.');
      }
      if (!name || name.trim().length < 2) throw new Error('Please enter a valid name.');
      if (!email || !/\S+@\S+\.\S+/.test(email)) throw new Error('Please enter a valid email.');
      if (!password || password.length < 6) throw new Error('Password must be at least 6 characters.');

      const user = {
        id: SV.Utils.uniqueId('user'),
        name: name.trim(),
        studentId: studentId.trim(),
        email: email.toLowerCase().trim(),
        password: hashPassword(password),
        avatar: null,
        role: users.length === 0 ? 'admin' : 'student', // first user is admin
        examAttempt,
        targetExamDate,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        points: 0,
        level: 1,
        streakDays: 0,
        lastStudyDate: null,
      };

      users.push(user);
      saveUsers(users);

      const safeUser = { ...user };
      delete safeUser.password;

      const token = generateToken(user.id);
      saveSession(safeUser, token);
      currentUser = safeUser;

      SV.EventBus.emit('auth:registered', safeUser);
      return safeUser;
    },

    async login({ email, password }) {
      const users = getUsers();
      const user = users.find(u => u.email === email.toLowerCase().trim());

      if (!user) throw new Error('No account found with this email.');
      if (user.password !== hashPassword(password)) throw new Error('Incorrect password.');

      // Update last login
      user.lastLogin = new Date().toISOString();
      saveUsers(users);

      const safeUser = { ...user };
      delete safeUser.password;

      const token = generateToken(user.id);
      saveSession(safeUser, token);
      currentUser = safeUser;

      SV.EventBus.emit('auth:loggedIn', safeUser);
      return safeUser;
    },

    async logout() {
      clearSession();
      currentUser = null;
      SV.EventBus.emit('auth:loggedOut');
    },

    async updateProfile(updates) {
      if (!currentUser) throw new Error('No user currently active.');
      const users = getUsers();
      let idx = users.findIndex(u => u.id === currentUser.id);

      const { password, role, id, ...safeUpdates } = updates;
      if (idx === -1) {
        users.push({ ...currentUser, ...safeUpdates });
      } else {
        users[idx] = { ...users[idx], ...safeUpdates };
      }
      saveUsers(users);

      currentUser = { ...currentUser, ...safeUpdates };
      localStorage.setItem(USER_KEY, JSON.stringify(currentUser));

      SV.EventBus.emit('auth:profileUpdated', currentUser);
      return currentUser;
    },

    async changePassword(currentPassword, newPassword) {
      const users = getUsers();
      const user = users.find(u => u.id === currentUser.id);
      if (!user) throw new Error('User not found.');
      if (user.password !== hashPassword(currentPassword)) throw new Error('Current password is incorrect.');
      if (newPassword.length < 6) throw new Error('New password must be at least 6 characters.');

      user.password = hashPassword(newPassword);
      saveUsers(users);
      return true;
    },

    async resetPassword(email, newPassword) {
      const users = getUsers();
      const idx = users.findIndex(u => u.email === email.toLowerCase());
      if (idx === -1) throw new Error('No account found with this email.');
      if (newPassword.length < 6) throw new Error('Password must be at least 6 characters.');

      users[idx].password = hashPassword(newPassword);
      saveUsers(users);
      return true;
    },

    async deleteAccount() {
      const users = getUsers().filter(u => u.id !== currentUser.id);
      saveUsers(users);
      await SV.Storage.clearUserData(currentUser.id);
      clearSession();
      currentUser = null;
      SV.EventBus.emit('auth:loggedOut');
    },

    // Admin only
    getAllUsers() {
      if (currentUser?.role !== 'admin') return [];
      return getUsers().map(u => { const s = {...u}; delete s.password; return s; });
    },

    isAdmin() {
      return currentUser?.role === 'admin';
    },

    // ── Auth Screen Renderer (multi-user, no hardcoded names) ──
    renderAuthScreen(container) {
      let activeTab = 'welcome';

      const dateMap = {
        'May 2027': '2027-05-02',
        'Nov 2027': '2027-11-02',
        'May 2028': '2028-05-02',
        'Nov 2028': '2028-11-02',
        'May 2029': '2029-05-02',
        'Nov 2029': '2029-11-02',
      };

      const launchApp = () => {
        container.classList.add('hidden');
        const mainApp = document.getElementById('main-app');
        if (mainApp) mainApp.classList.remove('hidden');
        if (window.SV.initAppShell) {
          window.SV.initAppShell();
        } else {
          SV.Notifications.init();
          SV.Search.init();
          SV.Timer.init();
          SV.Sidebar.init();
        }
        const initRoute = SV.Router.init();
        SV.Router.navigate(initRoute || '/dashboard');
      };

      const draw = (tab, errorMsg = '') => {
        activeTab = tab;

        let content = '';

        if (tab === 'welcome') {
          content = `
            <div style="text-align:center; margin-bottom:18px;">
              <span style="display:inline-block; background:rgba(108,99,255,0.12); color:var(--brand-primary); font-size:12px; font-weight:700; padding:4px 14px; border-radius:20px; margin-bottom:10px;">
                ✨ Welcome New CA Aspirant
              </span>
              <h2 style="font-size:20px; font-weight:800; margin-bottom:6px; color:var(--text-primary);">Enter Your Name to Begin</h2>
              <p style="font-size:13px; color:var(--text-secondary); line-height:1.5;">
                Personalize your study tracker, countdown planner, and daily targets in one step.
              </p>
            </div>

            ${errorMsg ? `<div class="auth-error">⚠️ ${errorMsg}</div>` : ''}

            <div class="form-group mb-3">
              <label class="form-label" style="font-weight:600;">Your Full Name <span style="color:#DC2626;">*</span></label>
              <input type="text" class="form-input" id="auth-welcome-name" placeholder="e.g., CA Aspirant / Enter your name" autofocus
                onkeypress="if(event.key==='Enter') SV.Auth._doQuickStart()" style="font-size:15px; padding:12px;">
            </div>

            <div class="form-group mb-3">
              <label class="form-label" style="font-weight:600;">ICAI Student ID / Registration No. <span style="font-weight:normal; color:var(--text-tertiary);">(Optional)</span></label>
              <input type="text" class="form-input" id="auth-welcome-id" placeholder="e.g., WRO0123456 / CRO / NRO / SRO"
                onkeypress="if(event.key==='Enter') SV.Auth._doQuickStart()" style="font-size:14px; padding:10px;">
            </div>

            <div class="form-group mb-4">
              <label class="form-label" style="font-weight:600;">Target Examination Attempt</label>
              <select class="form-select" id="auth-welcome-attempt" style="padding:11px; font-size:14px;">
                <option value="May 2027" selected>CA Final – May 2027 (ICAI New Scheme)</option>
                <option value="Nov 2027">CA Final – Nov 2027</option>
                <option value="May 2028">CA Final – May 2028</option>
                <option value="Nov 2028">CA Final – Nov 2028</option>
                <option value="May 2029">CA Final – May 2029</option>
                <option value="Nov 2029">CA Final – Nov 2029</option>
              </select>
            </div>

            <button class="btn btn-primary" style="width:100%; padding:14px; font-size:16px; font-weight:700; border-radius:10px; box-shadow:0 4px 15px rgba(108,99,255,0.3);" onclick="SV.Auth._doQuickStart()">
              🚀 Start Studying (Launch STUDYVERSE)
            </button>

            <div style="margin-top:16px; text-align:center;">
              <button type="button" class="btn btn-link" style="font-size:12px; color:var(--text-secondary); text-decoration:underline;" onclick="SV.Auth._switchTab('login')">
                Already have an email account? Sign In
              </button>
            </div>

            <p class="auth-privacy-note">
              🔒 <strong>100% Private & Anonymous:</strong> Your profile is saved only in your device's browser.<br>
              Any study materials you upload or share will never disclose your name.
            </p>
          `;
        } else if (tab === 'login') {
          content = `
            <div class="auth-tabs">
              <button class="auth-tab active" onclick="SV.Auth._switchTab('login')">Sign In</button>
              <button class="auth-tab" onclick="SV.Auth._switchTab('register')">Create Account</button>
            </div>
            ${errorMsg ? `<div class="auth-error">⚠️ ${errorMsg}</div>` : ''}
            <div class="form-group mb-3">
              <label class="form-label">Email Address</label>
              <input type="email" class="form-input" id="auth-email" placeholder="your@email.com" autocomplete="email">
            </div>
            <div class="form-group mb-4">
              <label class="form-label">Password</label>
              <input type="password" class="form-input" id="auth-password" placeholder="Your password" autocomplete="current-password"
                onkeypress="if(event.key==='Enter') SV.Auth._doLogin()">
            </div>
            <button class="btn btn-primary" style="width:100%; padding:12px; font-size:15px;" onclick="SV.Auth._doLogin()">
              🔐 Sign In to STUDYVERSE
            </button>
            <div style="margin-top:16px; text-align:center;">
              <button type="button" class="btn btn-link" style="font-size:12px; color:var(--brand-primary); font-weight:600;" onclick="SV.Auth._switchTab('welcome')">
                ← Back to Instant Name Setup
              </button>
            </div>
            <p class="auth-privacy-note">
              🔒 Your personal data is stored only on your device.<br>
              Study materials you share are posted anonymously as "STUDYVERSE Community".
            </p>
          `;
        } else if (tab === 'register') {
          content = `
            <div class="auth-tabs">
              <button class="auth-tab" onclick="SV.Auth._switchTab('login')">Sign In</button>
              <button class="auth-tab active" onclick="SV.Auth._switchTab('register')">Create Account</button>
            </div>
            ${errorMsg ? `<div class="auth-error">⚠️ ${errorMsg}</div>` : ''}
            <div class="form-group mb-3">
              <label class="form-label">Your Full Name</label>
              <input type="text" class="form-input" id="auth-name" placeholder="e.g., CA Aspirant 2027" autocomplete="name">
            </div>
            <div class="form-group mb-3">
              <label class="form-label">ICAI Student ID / Registration No. (Optional)</label>
              <input type="text" class="form-input" id="auth-studentid" placeholder="e.g., CRO1234567 / WRO / SRO">
            </div>
            <div class="form-group mb-3">
              <label class="form-label">Email Address</label>
              <input type="email" class="form-input" id="auth-email" placeholder="your@email.com" autocomplete="email">
            </div>
            <div class="form-group mb-3">
              <label class="form-label">Password (min 6 characters)</label>
              <input type="password" class="form-input" id="auth-password" placeholder="Create a strong password" autocomplete="new-password">
            </div>
            <div class="form-group mb-4">
              <label class="form-label">Target Examination Attempt</label>
              <select class="form-select" id="auth-attempt">
                <option value="May 2027">CA Final – May 2027 (ICAI New Scheme)</option>
                <option value="Nov 2027">CA Final – Nov 2027</option>
                <option value="May 2028">CA Final – May 2028</option>
                <option value="Nov 2028">CA Final – Nov 2028</option>
                <option value="May 2029">CA Final – May 2029</option>
                <option value="Nov 2029">CA Final – Nov 2029</option>
              </select>
            </div>
            <button class="btn btn-primary" style="width:100%; padding:12px; font-size:15px;" onclick="SV.Auth._doRegister()">
              🚀 Create Free Account
            </button>
            <div style="margin-top:16px; text-align:center;">
              <button type="button" class="btn btn-link" style="font-size:12px; color:var(--brand-primary); font-weight:600;" onclick="SV.Auth._switchTab('welcome')">
                ← Back to Instant Name Setup
              </button>
            </div>
            <p class="auth-privacy-note">
              🔒 Your name and email are private and never shown to other users.<br>
              This platform is free & built for every CA aspirant. No personal data is shared.
            </p>
          `;
        }

        container.innerHTML = `
          <div class="auth-box">
            <div class="auth-logo">
              <span class="auth-logo-icon">📚</span>
              <div class="auth-logo-name">STUDYVERSE</div>
              <div class="auth-logo-sub">The Ultimate CA Study Companion · May 2027</div>
            </div>
            ${content}
          </div>
        `;
      };

      this._switchTab = (tab) => draw(tab);

      this._doQuickStart = async () => {
        const nameInput = document.getElementById('auth-welcome-name');
        const idInput   = document.getElementById('auth-welcome-id');
        const attSelect = document.getElementById('auth-welcome-attempt');
        const name      = nameInput?.value?.trim();
        const studentId = idInput?.value?.trim() || '';
        const attempt   = attSelect?.value || 'May 2027';

        if (!name || name.length < 2) {
          draw('welcome', 'Please enter your name to personalize your study platform.');
          return;
        }

        try {
          const targetExamDate = dateMap[attempt] || '2027-05-02';
          await this.quickStart({ name, studentId, examAttempt: attempt, targetExamDate });
          launchApp();
        } catch (e) {
          draw('welcome', e.message);
        }
      };

      this._doLogin = async () => {
        const email    = document.getElementById('auth-email')?.value?.trim();
        const password = document.getElementById('auth-password')?.value;
        if (!email || !password) { draw('login', 'Please enter your email and password.'); return; }
        try {
          await this.login({ email, password });
          launchApp();
        } catch (e) { draw('login', e.message); }
      };

      this._doRegister = async () => {
        const name      = document.getElementById('auth-name')?.value?.trim();
        const studentId = document.getElementById('auth-studentid')?.value?.trim() || '';
        const email     = document.getElementById('auth-email')?.value?.trim();
        const password  = document.getElementById('auth-password')?.value;
        const attempt   = document.getElementById('auth-attempt')?.value || 'May 2027';
        if (!name || !email || !password) { draw('register', 'Please fill in all required fields.'); return; }
        try {
          const targetExamDate = dateMap[attempt] || '2027-05-02';
          await this.register({ name, email, password, studentId, examAttempt: attempt, targetExamDate });
          launchApp();
        } catch (e) { draw('register', e.message); }
      };

      // Draw welcome by default for first-time launch
      draw('welcome');
    },
  };
})();

