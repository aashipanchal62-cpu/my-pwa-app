/**
 * STUDYVERSE – Client-Side Router
 * router.js
 */
SV.Router = (() => {
  const routes = {};
  let currentRoute = null;
  let previousRoute = null;

  const NAV_ITEMS = [
    { id: 'dashboard',   label: 'Dashboard',         icon: 'layout-dashboard',   route: '/dashboard',   section: 'main' },
    { id: 'tracker',     label: 'Study Tracker',      icon: 'check-square',       route: '/tracker',     section: 'main' },
    { id: 'planner',     label: 'Planner',            icon: 'calendar',           route: '/planner',     section: 'main' },
    { id: 'analytics',   label: 'Analytics',          icon: 'bar-chart-2',        route: '/analytics',   section: 'main' },
    { id: 'library',     label: 'Resource Library',   icon: 'book-open',          route: '/library',     section: 'study' },
    { id: 'ai',          label: 'AI Assistant',       icon: 'sparkles',           route: '/ai',          section: 'study' },
    { id: 'ask-library', label: 'Ask My CA Library',  icon: 'message-circle',     route: '/ask-library', section: 'study' },
    { id: 'revision',    label: 'Revision Centre',    icon: 'refresh-cw',         route: '/revision',    section: 'study' },
    { id: 'mocktest',    label: 'Mock Tests',         icon: 'file-text',          route: '/mocktest',    section: 'study' },
    { id: 'notes',       label: 'Notes & Notebook',   icon: 'edit-3',             route: '/notes',       section: 'study' },
    { id: 'flashcards',  label: 'Flashcards',         icon: 'layers',             route: '/flashcards',  section: 'study' },
    { id: 'spom',        label: 'SPOM Tracker',       icon: 'monitor',            route: '/spom',        section: 'study' },
    { id: 'shared-lib',  label: 'Community Library',  icon: 'users',              route: '/shared-lib',  section: 'study' },
    { id: 'reels',       label: 'Instagram Reels',    icon: 'film',               route: '/reels',       section: 'more' },
    { id: 'energy',      label: 'Energy Zone',        icon: 'zap',                route: '/energy',      section: 'more' },
    { id: 'games',       label: 'Gaming Zone',        icon: 'gamepad-2',          route: '/games',       section: 'more' },
    { id: 'rewards',     label: 'Rewards',            icon: 'award',              route: '/rewards',     section: 'more' },
    { id: 'settings',    label: 'Settings',           icon: 'settings',           route: '/settings',    section: 'more' },
  ];

  const SECTIONS = {
    main: 'Main',
    study: 'Study Tools',
    more: 'More',
  };

  function updateActiveNav(route) {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.route === route);
    });
  }

  function updateBreadcrumb(routeId) {
    const item = NAV_ITEMS.find(i => i.id === routeId);
    if (item) {
      SV.Utils.setText('#breadcrumb-text', item.label);
    }
  }

  return {
    NAV_ITEMS,
    SECTIONS,

    register(path, handler) {
      routes[path] = handler;
    },

    async navigate(route, params = {}, options = {}) {
      if (typeof route === 'string' && !route.startsWith('/')) {
        route = '/' + route;
      }
      const isSameRoute = (route === currentRoute);
      previousRoute = currentRoute;
      currentRoute = route;

      updateActiveNav(route);

      // Extract route id
      const routeId = route.replace('/', '');
      updateBreadcrumb(routeId);

      const container = document.getElementById('page-container');
      if (!container) return;

      // Push history state safely (handles file:// protocol and browser security blocks)
      try {
        if (!isSameRoute && !options.replace) {
          window.history.pushState({ route, params }, '', '#' + route);
        } else if (options.replace) {
          window.history.replaceState({ route, params }, '', '#' + route);
        }
      } catch (err) {
        try { window.location.hash = '#' + route; } catch (_) {}
      }

      // Find and execute handler
      const handler = routes[route] || routes['*'];
      if (handler) {
        try {
          // If navigating to a brand new route, show spinner; otherwise update smoothly in place
          if (!isSameRoute && !options.silent) {
            container.innerHTML = '<div class="page-loading" style="display:flex;"><div class="page-spinner"></div></div>';
          }

          const html = await handler(params);
          container.innerHTML = html || '';

          if (!isSameRoute) {
            container.classList.add('page-enter');
            setTimeout(() => container.classList.remove('page-enter'), 400);
          }

          // Re-init lucide icons
          if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
          }

          // Fire route change event
          SV.EventBus.emit('route:changed', { route, params });
        } catch(e) {
          console.error('[Router] Error rendering route:', route, e);
          container.innerHTML = `
            <div class="empty-state">
              <div class="empty-state-icon">⚠️</div>
              <div class="empty-state-title">Something went wrong</div>
              <div class="empty-state-desc">${e.message}</div>
              <button class="btn btn-primary" onclick="SV.Router.navigate('/dashboard')">Go to Dashboard</button>
            </div>
          `;
        }
      }

      // Close mobile sidebar on navigation
      document.getElementById('sidebar')?.classList.remove('mobile-open');
      document.getElementById('sidebar-overlay')?.classList.remove('active');
    },

    refresh(params = {}) {
      return this.navigate(currentRoute || '/dashboard', params, { silent: true });
    },

    getCurrentRoute() { return currentRoute; },
    getPreviousRoute() { return previousRoute; },

    init() {
      // Handle browser back/forward
      window.addEventListener('popstate', (e) => {
        let route = e.state?.route || window.location.hash.replace('#', '') || '/dashboard';
        if (!route.startsWith('/')) route = '/' + route;
        this.navigate(route, e.state?.params);
      });

      // Handle direct hash navigation
      window.addEventListener('hashchange', () => {
        let route = window.location.hash.replace('#', '') || '/dashboard';
        if (!route.startsWith('/')) route = '/' + route;
        if (route !== currentRoute) {
          this.navigate(route);
        }
      });

      // Handle hash
      let hash = window.location.hash.replace('#', '');
      if (hash && !hash.startsWith('/')) hash = '/' + hash;
      return hash && routes[hash] ? hash : '/dashboard';
    },
  };
})();
