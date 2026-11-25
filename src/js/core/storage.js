/**
 * STUDYVERSE – Local Storage Manager
 * storage.js
 * Handles IndexedDB for large data and localStorage for settings/preferences.
 */
SV.Storage = (() => {
  const DB_NAME = 'studyverse_db';
  const DB_VERSION = 2;
  let db = null;

  const STORES = {
    progress: 'progress',
    notes: 'notes',
    resources: 'resources',
    sharedResources: 'shared_resources',
    revisions: 'revisions',
    mistakes: 'mistakes',
    flashcards: 'flashcards',
    testHistory: 'test_history',
    mcqBank: 'mcq_bank',
    planner: 'planner',
    rewards: 'rewards',
    activity: 'activity',
  };

  /* ── LocalStorage helpers ── */
  const LS = {
    get(key, fallback = null) {
      try {
        const val = localStorage.getItem(SV.Config.STORAGE_KEYS[key] || key);
        return val ? JSON.parse(val) : fallback;
      } catch { return fallback; }
    },
    set(key, value) {
      try {
        localStorage.setItem(SV.Config.STORAGE_KEYS[key] || key, JSON.stringify(value));
        return true;
      } catch (e) {
        console.warn('[Storage] localStorage failed:', e);
        return false;
      }
    },
    remove(key) {
      localStorage.removeItem(SV.Config.STORAGE_KEYS[key] || key);
    },
    clear() {
      Object.values(SV.Config.STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    },
  };

  /* ── IndexedDB init ── */
  async function initDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onerror = () => reject(req.error);
      req.onsuccess = () => { db = req.result; resolve(db); };

      req.onupgradeneeded = (e) => {
        const idb = e.target.result;
        Object.values(STORES).forEach(storeName => {
          if (!idb.objectStoreNames.contains(storeName)) {
            const store = idb.createObjectStore(storeName, { keyPath: 'id' });
            if (storeName !== 'shared_resources') {
              store.createIndex('userId', 'userId', { unique: false });
            }
            if (storeName === 'progress') {
              store.createIndex('subjectId', 'subjectId', { unique: false });
            }
            if (storeName === 'notes') {
              store.createIndex('subject', 'subject', { unique: false });
            }
            if (storeName === 'resources') {
              store.createIndex('paperId', 'paperId', { unique: false });
            }
            if (storeName === 'shared_resources') {
              store.createIndex('paperId', 'paperId', { unique: false });
            }
          }
        });
      };
    });
  }

  /* ── IndexedDB CRUD ── */
  async function idbGet(storeName, id) {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const req = tx.objectStore(storeName).get(id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function idbGetAll(storeName, indexName, query) {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = indexName ? store.index(indexName).getAll(query) : store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function idbPut(storeName, item) {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const req = tx.objectStore(storeName).put({ ...item, updatedAt: new Date().toISOString() });
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function idbDelete(storeName, id) {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const req = tx.objectStore(storeName).delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async function idbClear(storeName) {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const req = tx.objectStore(storeName).clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  /* ── Progress management ── */
  function buildProgressKey(userId, paperId, chapterId, unitId, topicId) {
    return [userId, paperId, chapterId, unitId, topicId].filter(Boolean).join('::');
  }

  /* ── Public API ── */
  return {
    LS,
    STORES,
    initDB,

    /* Progress */
    async getProgress(userId) {
      try {
        const all = await idbGetAll(STORES.progress, 'userId', userId);
        const map = {};
        all.forEach(item => { map[item.key] = item; });
        return map;
      } catch { return {}; }
    },

    async setTopicProgress(userId, paperId, chapterId, unitId, topicId, data) {
      const key = buildProgressKey(userId, paperId, chapterId, unitId, topicId);
      return idbPut(STORES.progress, { id: key, key, userId, paperId, chapterId, unitId, topicId, ...data });
    },

    async getTopicProgress(userId, paperId, chapterId, unitId, topicId) {
      const key = buildProgressKey(userId, paperId, chapterId, unitId, topicId);
      return idbGet(STORES.progress, key);
    },

    /* Notes */
    async getNotes(userId, subject = null) {
      const all = await idbGetAll(STORES.notes, 'userId', userId);
      return subject ? all.filter(n => n.subject === subject) : all;
    },

    async saveNote(note) {
      return idbPut(STORES.notes, note);
    },

    async deleteNote(id) {
      return idbDelete(STORES.notes, id);
    },

    /* Revisions */
    async getRevisions(userId) {
      return idbGetAll(STORES.revisions, 'userId', userId);
    },

    async saveRevision(revision) {
      return idbPut(STORES.revisions, revision);
    },

    /* Mistakes */
    async getMistakes(userId) {
      return idbGetAll(STORES.mistakes, 'userId', userId);
    },

    async saveMistake(mistake) {
      return idbPut(STORES.mistakes, mistake);
    },

    async deleteMistake(id) {
      return idbDelete(STORES.mistakes, id);
    },

    /* Flashcards */
    async getFlashcards(userId, subject = null) {
      const all = await idbGetAll(STORES.flashcards, 'userId', userId);
      return subject ? all.filter(f => f.subject === subject) : all;
    },

    async saveFlashcard(fc) {
      return idbPut(STORES.flashcards, fc);
    },

    async deleteFlashcard(id) {
      return idbDelete(STORES.flashcards, id);
    },

    /* Planner */
    async getPlanner(userId) {
      const all = await idbGetAll(STORES.planner, 'userId', userId);
      const map = {};
      all.forEach(item => { map[item.date] = item; });
      return map;
    },

    async savePlannerEntry(entry) {
      return idbPut(STORES.planner, entry);
    },

    /* Rewards */
    async getRewards(userId) {
      return idbGet(STORES.rewards, userId) || { points: 0, level: 1, badges: [], streaks: {} };
    },

    async saveRewards(data) {
      return idbPut(STORES.rewards, data);
    },

    /* Activity Log */
    async logActivity(activity) {
      return idbPut(STORES.activity, activity);
    },

    async getActivity(userId, limit = 50) {
      const all = await idbGetAll(STORES.activity, 'userId', userId);
      return all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, limit);
    },

    /* Test History */
    async getTestHistory(userId) {
      return idbGetAll(STORES.testHistory, 'userId', userId);
    },

    async saveTestResult(result) {
      return idbPut(STORES.testHistory, result);
    },

    /* MCQ Bank */
    async getMCQs(paperId = null) {
      const all = await idbGetAll(STORES.mcqBank);
      return paperId ? all.filter(q => q.paperId === paperId) : all;
    },

    async saveMCQs(questions) {
      return Promise.all(questions.map(q => idbPut(STORES.mcqBank, q)));
    },

    /* User Resources (Personal Library & Uploaded Files) */
    async getUserResources(userId) {
      try {
        if (!db) await initDB();
        const all = (await idbGetAll(STORES.resources, 'userId', userId)) || [];
        // Also check if any legacy exist in localStorage and migrate them
        const lsUploads = LS.get('USER_RESOURCES') || [];
        if (lsUploads.length > 0) {
          for (const item of lsUploads) {
            if (!all.find(x => x.id === item.id)) {
              await idbPut(STORES.resources, { ...item, userId });
              all.unshift(item);
            }
          }
          LS.remove('USER_RESOURCES');
        }
        return all;
      } catch (e) {
        console.warn('[Storage] getUserResources error, falling back to LS:', e);
        return LS.get('USER_RESOURCES') || [];
      }
    },

    async saveUserResource(res) {
      try {
        if (!db) await initDB();
        await idbPut(STORES.resources, res);
        return true;
      } catch (e) {
        console.warn('[Storage] saveUserResource IDB error:', e);
        const all = LS.get('USER_RESOURCES') || [];
        all.unshift(res);
        LS.set('USER_RESOURCES', all);
        return false;
      }
    },

    async deleteUserResource(id) {
      try {
        if (!db) await initDB();
        await idbDelete(STORES.resources, id);
      } catch (e) {
        console.warn('[Storage] deleteUserResource error:', e);
      }
      const all = (LS.get('USER_RESOURCES') || []).filter(x => x.id !== id);
      LS.set('USER_RESOURCES', all);
    },

    /* Shared Resources (Community Library) */
    async getSharedResources() {
      try {
        if (!db) await initDB();
        const all = (await idbGetAll(STORES.sharedResources)) || [];
        // Migrate legacy localStorage shared items
        const lsShared = LS.get('SV_SHARED_LIBRARY') || [];
        if (lsShared.length > 0) {
          for (const item of lsShared) {
            if (!all.find(x => x.id === item.id)) {
              await idbPut(STORES.sharedResources, item);
              all.unshift(item);
            }
          }
          LS.remove('SV_SHARED_LIBRARY');
        }
        return all;
      } catch (e) {
        console.warn('[Storage] getSharedResources error, falling back to LS:', e);
        return LS.get('SV_SHARED_LIBRARY') || [];
      }
    },

    async saveSharedResource(res) {
      try {
        if (!db) await initDB();
        await idbPut(STORES.sharedResources, res);
        return true;
      } catch (e) {
        console.warn('[Storage] saveSharedResource IDB error:', e);
        const all = LS.get('SV_SHARED_LIBRARY') || [];
        all.unshift(res);
        LS.set('SV_SHARED_LIBRARY', all);
        return false;
      }
    },

    async deleteSharedResource(id) {
      try {
        if (!db) await initDB();
        await idbDelete(STORES.sharedResources, id);
      } catch (e) {
        console.warn('[Storage] deleteSharedResource error:', e);
      }
      const all = (LS.get('SV_SHARED_LIBRARY') || []).filter(x => x.id !== id);
      LS.set('SV_SHARED_LIBRARY', all);
    },

    /* Clear all user data */
    async clearUserData(userId) {
      const stores = Object.values(STORES);
      for (const store of stores) {
        const all = await idbGetAll(store, 'userId', userId);
        await Promise.all(all.map(item => idbDelete(store, item.id)));
      }
    },

    /* Export all user data */
    async exportUserData(userId) {
      const data = {};
      for (const [key, store] of Object.entries(STORES)) {
        try {
          data[key] = await idbGetAll(store, 'userId', userId);
        } catch { data[key] = []; }
      }
      return data;
    },
  };
})();
