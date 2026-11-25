/**
 * STUDYVERSE – Theme Manager
 * theme.js
 */
SV.Theme = (() => {
  const FONTS = {
    'Inter': "'Inter', sans-serif",
    'Poppins': "'Poppins', sans-serif",
    'System': "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  };

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const icon = document.getElementById('theme-icon');
    if (icon) {
      icon.setAttribute('data-lucide', theme === 'dark' ? 'moon' : 'sun');
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
    }
  }

  function applyFontSize(size) {
    const sizes = { small: '13px', medium: '14px', large: '15px', 'x-large': '16px' };
    document.documentElement.style.setProperty('--text-base', sizes[size] || '14px');
  }

  function applyFontFamily(family) {
    const font = FONTS[family] || FONTS['Inter'];
    document.documentElement.style.setProperty('--font-primary', font);
  }

  function applyAccentColor(color) {
    document.documentElement.style.setProperty('--brand-primary', color);
    // Compute light version
    document.documentElement.style.setProperty('--brand-primary-light', SV.Utils.hexToRgba(color, 0.1));
    document.documentElement.style.setProperty('--gradient-primary', `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`);
  }

  function applySpacing(mode) {
    const values = { compact: { card: '16px', space6: '20px' }, comfortable: { card: '24px', space6: '24px' } };
    const v = values[mode] || values.comfortable;
    document.documentElement.style.setProperty('--card-padding', v.card);
  }

  return {
    init() {
      const settings = SV.Storage.LS.get('SETTINGS') || SV.Config.DEFAULT_SETTINGS;
      this.apply(settings);

      // System theme detection
      if (settings.theme === 'system') {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        applyTheme(mq.matches ? 'dark' : 'light');
        mq.addEventListener('change', e => {
          if ((SV.Storage.LS.get('SETTINGS') || {}).theme === 'system') {
            applyTheme(e.matches ? 'dark' : 'light');
          }
        });
      }
    },

    apply(settings) {
      if (settings.theme && settings.theme !== 'system') applyTheme(settings.theme);
      else if (settings.theme === 'system') {
        applyTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      }
      if (settings.fontSize)    applyFontSize(settings.fontSize);
      if (settings.fontFamily)  applyFontFamily(settings.fontFamily);
      if (settings.accentColor) applyAccentColor(settings.accentColor);
      if (settings.spacing)     applySpacing(settings.spacing);
    },

    toggle() {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      const settings = SV.Storage.LS.get('SETTINGS') || SV.Config.DEFAULT_SETTINGS;
      settings.theme = next;
      SV.Storage.LS.set('SETTINGS', settings);
      SV.EventBus.emit('theme:changed', next);
    },

    getCurrentTheme() {
      return document.documentElement.getAttribute('data-theme') || 'light';
    },
  };
})();
