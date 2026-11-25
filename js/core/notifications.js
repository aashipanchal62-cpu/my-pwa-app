/**
 * STUDYVERSE – Notifications Manager
 * notifications.js
 */
SV.Notifications = (() => {
  let notifications = [];

  function saveNotifications() {
    localStorage.setItem('sv_notifications', JSON.stringify(notifications.slice(0, 100)));
  }

  return {
    init() {
      try {
        notifications = JSON.parse(localStorage.getItem('sv_notifications') || '[]');
      } catch { notifications = []; }
      this.updateBadge();
    },

    /* ── Toast ── */
    toast(message, type = 'info', duration = 4000, title = '') {
      const container = document.getElementById('toast-container');
      if (!container) return;

      const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
      const toast = document.createElement('div');
      toast.className = `toast toast--${type}`;
      toast.innerHTML = `
        <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
        <div class="toast-content">
          ${title ? `<div class="toast-title">${title}</div>` : ''}
          <div class="toast-message">${message}</div>
        </div>
        <span class="toast-close">✕</span>
      `;

      toast.querySelector('.toast-close').addEventListener('click', () => removeToast(toast));
      container.appendChild(toast);

      if (duration > 0) {
        setTimeout(() => removeToast(toast), duration);
      }

      return toast;
    },

    /* ── App notifications ── */
    add(notification) {
      const n = {
        id: SV.Utils.uniqueId('notif'),
        ...notification,
        read: false,
        createdAt: new Date().toISOString(),
      };
      notifications.unshift(n);
      saveNotifications();
      this.renderList();
      this.updateBadge();
      return n;
    },

    markRead(id) {
      const n = notifications.find(n => n.id === id);
      if (n) { n.read = true; saveNotifications(); this.updateBadge(); }
    },

    markAllRead() {
      notifications.forEach(n => n.read = true);
      saveNotifications();
      this.renderList();
      this.updateBadge();
    },

    clear() {
      notifications = [];
      saveNotifications();
      this.renderList();
      this.updateBadge();
    },

    getUnreadCount() {
      return notifications.filter(n => !n.read).length;
    },

    updateBadge() {
      const badge = document.getElementById('notification-badge');
      const count = this.getUnreadCount();
      if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
      }
    },

    renderList() {
      const list = document.getElementById('notification-list');
      if (!list) return;

      if (!notifications.length) {
        list.innerHTML = '<div class="notification-empty">No notifications</div>';
        return;
      }

      list.innerHTML = notifications.slice(0, 20).map(n => `
        <div class="notification-item ${n.read ? '' : 'unread'}" data-id="${n.id}">
          <div class="notification-item-icon">${n.icon || '🔔'}</div>
          <div class="notification-item-content">
            <div class="notification-item-text">${n.message}</div>
            <div class="notification-item-time">${SV.Utils.relativeTime(n.createdAt)}</div>
          </div>
        </div>
      `).join('');

      list.querySelectorAll('.notification-item').forEach(item => {
        item.addEventListener('click', () => {
          this.markRead(item.dataset.id);
          item.classList.remove('unread');
          this.updateBadge();
          if (item.dataset.route) SV.Router.navigate(item.dataset.route);
        });
      });
    },
  };

  function removeToast(toast) {
    toast.style.animation = 'fadeInRight 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }
})();
