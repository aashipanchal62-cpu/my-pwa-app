/**
 * STUDYVERSE – Event Bus
 * eventbus.js
 */
SV.EventBus = (() => {
  const listeners = {};

  return {
    on(event, handler) {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(handler);
      return () => this.off(event, handler);
    },

    off(event, handler) {
      if (listeners[event]) {
        listeners[event] = listeners[event].filter(h => h !== handler);
      }
    },

    emit(event, data) {
      if (listeners[event]) {
        listeners[event].forEach(handler => {
          try { handler(data); }
          catch(e) { console.error(`[EventBus] Error in handler for "${event}":`, e); }
        });
      }
    },

    once(event, handler) {
      const wrapper = (data) => {
        handler(data);
        this.off(event, wrapper);
      };
      this.on(event, wrapper);
    },

    clear(event) {
      if (event) delete listeners[event];
      else Object.keys(listeners).forEach(k => delete listeners[k]);
    },
  };
})();
