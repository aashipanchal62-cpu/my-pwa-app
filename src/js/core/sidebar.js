/**
 * STUDYVERSE – Sidebar & Navigation Component
 * sidebar.js
 */
window.SV = window.SV || {};

SV.Sidebar = (() => {
  function renderNav() {
    const navContainer = document.getElementById('sidebar-nav');
    if (!navContainer) return;

    let html = '';
    const sections = ['main', 'study', 'more'];

    sections.forEach(secKey => {
      html += `<div class="nav-section-title">${SV.Router.SECTIONS[secKey]}</div>`;
      const items = SV.Router.NAV_ITEMS.filter(item => item.section === secKey);

      items.forEach(item => {
        html += `
          <div class="nav-item" data-route="${item.route}" data-id="${item.id}">
            <div class="nav-icon"><i data-lucide="${item.icon}"></i></div>
            <span class="nav-label">${item.label}</span>
            ${item.id === 'spom' ? '<span class="nav-badge">NEW</span>' : ''}
          </div>
        `;
      });
    });

    navContainer.innerHTML = html;

    // Attach click events
    navContainer.querySelectorAll('.nav-item').forEach(el => {
      el.addEventListener('click', () => {
        const route = el.dataset.route;
        SV.Router.navigate(route);
      });
    });

    if (window.lucide) lucide.createIcons();
  }

  function getExamTargetDate(user) {
    if (user?.targetExamDate) return user.targetExamDate;
    const dateMap = {
      'May 2027': '2027-05-02',
      'Nov 2027': '2027-11-02',
      'May 2028': '2028-05-02',
      'Nov 2028': '2028-11-02',
      'May 2029': '2029-05-02',
      'Nov 2029': '2029-11-02',
    };
    return dateMap[user?.examAttempt] || SV.Config.EXAM_DATE || '2027-05-02';
  }

  function updateCountdown() {
    const daysEl = document.getElementById('countdown-days');
    const labelEl = document.querySelector('.countdown-label');
    const user = SV.Auth.getCurrentUser();
    const attempt = user?.examAttempt || 'May 2027';
    const targetDate = getExamTargetDate(user);

    if (labelEl) labelEl.textContent = `${attempt} Exam`;
    if (daysEl) {
      const days = SV.Utils.daysUntil(targetDate);
      daysEl.textContent = `${days} Days`;
    }
  }

  return {
    init() {
      renderNav();
      updateCountdown();

      // Sidebar collapse toggle
      const toggleBtn = document.getElementById('sidebar-toggle');
      const sidebar = document.getElementById('sidebar');
      if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
          sidebar.classList.toggle('collapsed');
          const isCollapsed = sidebar.classList.contains('collapsed');
          const settings = SV.Storage.LS.get('SETTINGS') || SV.Config.DEFAULT_SETTINGS;
          settings.sidebarCollapsed = isCollapsed;
          SV.Storage.LS.set('SETTINGS', settings);
        });
      }

      // Mobile menu toggle
      const mobileBtn = document.getElementById('mobile-menu-btn');
      const overlay = document.getElementById('sidebar-overlay');
      if (mobileBtn && sidebar) {
        mobileBtn.addEventListener('click', () => {
          sidebar.classList.add('mobile-open');
          if (overlay) overlay.classList.add('active');
        });
      }

      if (overlay) {
        overlay.addEventListener('click', () => {
          sidebar.classList.remove('mobile-open');
          overlay.classList.remove('active');
        });
      }

      // Update user info in sidebar & topbar
      this.updateUserDisplay();
    },

    updateUserDisplay() {
      const user = SV.Auth.getCurrentUser();
      const sidebarUser = document.getElementById('sidebar-username');
      const sidebarAvatar = document.getElementById('sidebar-avatar');
      const topbarAvatar = document.getElementById('topbar-avatar');
      const menuAvatar = document.getElementById('user-menu-avatar');
      const menuName = document.getElementById('user-menu-name');
      const menuEmail = document.getElementById('user-menu-email');
      const userPlan = document.querySelector('.user-plan');

      if (user) {
        const initial = user.name ? user.name.charAt(0).toUpperCase() : 'C';
        if (sidebarUser) sidebarUser.textContent = user.name;
        if (userPlan) {
          const idPrefix = user.studentId ? `${user.studentId} · ` : '';
          userPlan.textContent = `${idPrefix}${user.examAttempt || 'May 2027'}`;
        }
        if (sidebarAvatar) sidebarAvatar.textContent = initial;
        if (topbarAvatar) topbarAvatar.textContent = initial;
        if (menuAvatar) menuAvatar.textContent = initial;
        if (menuName) menuName.textContent = user.name;
        if (menuEmail) menuEmail.textContent = user.email || (user.studentId ? `ID: ${user.studentId}` : 'student@ca.org');
      }
    }
  };
})();
