/**
 * STUDYVERSE – Utility Functions
 * utils.js
 */
SV.Utils = {

  /* ── Date & Time ── */
  formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  },

  formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
    return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
  },

  formatDuration(minutes) {
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  },

  daysUntil(dateStr) {
    const target = new Date(dateStr);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    return Math.max(0, Math.ceil((target - now) / (1000 * 60 * 60 * 24)));
  },

  relativeTime(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return this.formatDate(dateStr);
  },

  today() {
    return new Date().toISOString().split('T')[0];
  },

  /* ── Numbers ── */
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  },

  percentage(value, total) {
    if (!total) return 0;
    return Math.round((value / total) * 100);
  },

  formatNumber(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  },

  round(n, decimals = 0) {
    return Math.round(n * Math.pow(10, decimals)) / Math.pow(10, decimals);
  },

  /* ── Strings ── */
  capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  truncate(str, maxLen = 50) {
    if (!str || str.length <= maxLen) return str;
    return str.substring(0, maxLen) + '…';
  },

  slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  },

  highlight(text, query) {
    if (!query) return text;
    const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(re, '<mark>$1</mark>');
  },

  /* ── DOM ── */
  el(selector, context = document) {
    return context.querySelector(selector);
  },

  els(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
  },

  createElement(tag, props = {}, children = []) {
    const el = document.createElement(tag);
    Object.entries(props).forEach(([key, value]) => {
      if (key === 'className') el.className = value;
      else if (key === 'innerHTML') el.innerHTML = value;
      else if (key === 'textContent') el.textContent = value;
      else if (key.startsWith('on')) el.addEventListener(key.slice(2).toLowerCase(), value);
      else el.setAttribute(key, value);
    });
    children.forEach(child => {
      if (typeof child === 'string') el.appendChild(document.createTextNode(child));
      else if (child) el.appendChild(child);
    });
    return el;
  },

  show(el) { if (el) el.classList.remove('hidden'); },
  hide(el) { if (el) el.classList.add('hidden'); },
  toggle(el) { if (el) el.classList.toggle('hidden'); },

  setHTML(selector, html, context = document) {
    const el = context.querySelector(selector);
    if (el) el.innerHTML = html;
  },

  setText(selector, text, context = document) {
    const el = context.querySelector(selector);
    if (el) el.textContent = text;
  },

  /* ── Events ── */
  on(el, event, handler, options) {
    if (typeof el === 'string') el = document.querySelector(el);
    if (el) el.addEventListener(event, handler, options);
    return el;
  },

  delegate(parent, selector, event, handler) {
    if (typeof parent === 'string') parent = document.querySelector(parent);
    if (!parent) return;
    parent.addEventListener(event, (e) => {
      const target = e.target.closest(selector);
      if (target && parent.contains(target)) handler(e, target);
    });
  },

  debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  },

  throttle(fn, limit = 100) {
    let lastCall = 0;
    return (...args) => {
      const now = Date.now();
      if (now - lastCall >= limit) {
        lastCall = now;
        fn(...args);
      }
    };
  },

  /* ── Arrays / Objects ── */
  groupBy(arr, key) {
    return arr.reduce((acc, item) => {
      const group = typeof key === 'function' ? key(item) : item[key];
      if (!acc[group]) acc[group] = [];
      acc[group].push(item);
      return acc;
    }, {});
  },

  deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  uniqueId(prefix = 'sv') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  },

  /* ── UI ── */
  toast(message, type = 'info', duration = 4000, title = '') {
    SV.Notifications.toast(message, type, duration, title);
  },

  confirm(message, title = 'Confirm') {
    return new Promise(resolve => {
      SV.Modal.confirm(message, title, resolve);
    });
  },

  randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  /* ── File ── */
  formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  },

  getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
  },

  isValidFileType(filename, allowed) {
    return allowed.includes(this.getFileExtension(filename));
  },

  /* ── Color ── */
  hexToRgba(hex, alpha = 1) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  },

  /* ── Scroll ── */
  scrollToTop(container = window) {
    container.scrollTo({ top: 0, behavior: 'smooth' });
  },

  scrollTo(el) {
    if (typeof el === 'string') el = document.querySelector(el);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  /* ── Clipboard ── */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      SV.Utils.toast('Copied to clipboard!', 'success', 2000);
      return true;
    } catch (e) {
      return false;
    }
  },

  /* ── Print / Export ── */
  printElement(el) {
    if (typeof el === 'string') el = document.querySelector(el);
    if (!el) return;
    const w = window.open('', '_blank');
    w.document.write(`
      <html><head><title>Print – STUDYVERSE</title>
      <style>body{font-family:sans-serif;padding:20px;}</style></head>
      <body>${el.innerHTML}</body></html>
    `);
    w.document.close();
    w.print();
  },
};
