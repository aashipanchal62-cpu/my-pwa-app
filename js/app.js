/**
 * STUDYVERSE – Application Bootstrapper
 * app.js — Multi-user, no hardcoded names
 */
window.SV = window.SV || {};

(async function() {
  'use strict';

  const splashScreen   = document.getElementById('splash-screen');
  const loaderFill     = document.getElementById('loader-fill');
  const loaderText     = document.getElementById('loader-text');
  const mainApp        = document.getElementById('main-app');

  function updateLoader(pct, text) {
    if (loaderFill) loaderFill.style.width = `${pct}%`;
    if (loaderText) loaderText.textContent = text;
  }

  try {
    updateLoader(20, 'Initializing database & local storage...');
    await SV.Storage.initDB();

    updateLoader(40, 'Verifying CA Final May 2027 syllabus...');
    if (!window.CA_FINAL_SYLLABUS) console.warn('[App] Syllabus data still mounting');

    updateLoader(60, 'Loading theme & student configurations...');
    SV.Theme.init();

    updateLoader(80, 'Configuring study modules & router...');

    // ── Register all routes ──
    SV.Router.register('/dashboard',   ()       => SV.Dashboard.render());
    SV.Router.register('/tracker',     (p)      => SV.Tracker.render(p));
    SV.Router.register('/planner',     ()       => SV.Planner.render());
    SV.Router.register('/analytics',   ()       => SV.Analytics.render());
    SV.Router.register('/library',     (p)      => SV.Library.render(p));
    SV.Router.register('/ai',          (p)      => SV.AIAssistant.render(p));
    SV.Router.register('/ask-library', (p)      => SV.AIAssistant.render(p));
    SV.Router.register('/revision',    ()       => SV.Revision.render());
    SV.Router.register('/mocktest',    ()       => SV.MockTest.render());
    SV.Router.register('/notes',       (p)      => SV.Notes.render(p));
    SV.Router.register('/mistakes',    ()       => SV.MistakeNotebook.render());
    SV.Router.register('/flashcards',  ()       => SV.Flashcards.render());
    SV.Router.register('/spom',        ()       => SV.SPOM.render());
    SV.Router.register('/energy',      ()       => SV.EnergyZone.render());
    SV.Router.register('/reels',       ()       => SV.EnergyZone.render({ tab: 'reels' }));
    SV.Router.register('/games',       ()       => SV.GamingZone.render());
    SV.Router.register('/rewards',     ()       => SV.Rewards.render());
    SV.Router.register('/settings',    ()       => SV.Settings.render());
    SV.Router.register('/admin',       ()       => SV.Admin.render());
    SV.Router.register('/shared-lib',  ()       => SV.SharedLibrary.render());

    // ── App Shell UI Initializer (Reusable on login & boot) ──
    SV.initAppShell = function() {
      if (SV._appShellInitialized) return;
      SV._appShellInitialized = true;

      // ── Initialize Components ──
      SV.Notifications.init();
      SV.Search.init();
      SV.Timer.init();
      SV.Sidebar.init();

      // Theme toggle
      document.getElementById('theme-toggle-btn')?.addEventListener('click', () => SV.Theme.toggle());

      // Notifications toggle
      const notifBtn       = document.getElementById('notification-btn');
      const notifDropdown  = document.getElementById('notification-dropdown');
      if (notifBtn && notifDropdown) {
        notifBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          notifDropdown.classList.toggle('hidden');
        });
        document.addEventListener('click', () => notifDropdown.classList.add('hidden'));
      }

      // User menu toggle
      const userMenuTrigger  = document.getElementById('user-menu-trigger');
      const userMenuDropdown = document.getElementById('user-menu-dropdown');
      if (userMenuTrigger && userMenuDropdown) {
        userMenuTrigger.addEventListener('click', (e) => {
          e.stopPropagation();
          userMenuDropdown.classList.toggle('hidden');
        });
        document.addEventListener('click', () => userMenuDropdown.classList.add('hidden'));
        userMenuDropdown.querySelectorAll('.user-menu-item').forEach(item => {
          item.addEventListener('click', () => {
            const action = item.dataset.action;
            userMenuDropdown.classList.add('hidden');
            if (action === 'profile')   SV.Router.navigate('/settings');
            if (action === 'settings')  SV.Router.navigate('/settings');
            if (action === 'export')    SV.Settings.exportData();
            if (action === 'logout')    { SV.Auth.logout(); location.reload(); }
          });
        });
      }
    };

    // ── Auth init — NO hardcoded demo account ──
    const isAuthed = await SV.Auth.init();

    // Show proper auth screen if not logged in
    if (!isAuthed) {
      updateLoader(100, 'Ready — Please enter your name to begin.');
      setTimeout(() => {
        if (splashScreen) {
          splashScreen.classList.add('hiding');
          setTimeout(() => splashScreen.remove(), 500);
        }
        // Show auth layer instead of main app
        const authLayer = document.getElementById('auth-layer');
        if (authLayer) {
          authLayer.classList.remove('hidden');
          SV.Auth.renderAuthScreen(authLayer);
        }
      }, 400);
      return;
    }

    updateLoader(100, 'STUDYVERSE is ready!');

    // Initialize UI Shell
    SV.initAppShell();

    // Dismiss splash & show app
    setTimeout(() => {
      if (splashScreen) {
        splashScreen.classList.add('hiding');
        setTimeout(() => splashScreen.remove(), 500);
      }
      if (mainApp) mainApp.classList.remove('hidden');
      const initialRoute = SV.Router.init();
      SV.Router.navigate(initialRoute || '/dashboard');
    }, 400);

  } catch (err) {
    console.error('[App] Bootstrap error:', err);
    if (loaderText) loaderText.textContent = `Error: ${err.message}`;
  }
})();
