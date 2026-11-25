/**
 * STUDYVERSE – Settings & Customization Module
 * settings.js
 * Allows full personalization of Name, Student ID, Exam Attempt & Countdown,
 * Themes, Fonts, Focus Timing & Private Data Backups.
 */
window.SV = window.SV || {};

SV.Settings = (() => {
  async function render() {
    const settings = SV.Storage.LS.get('SETTINGS') || SV.Config.DEFAULT_SETTINGS;
    const user = SV.Auth.getCurrentUser() || { name: 'CA Aspirant', examAttempt: 'May 2027', studentId: '' };

    return `
      <div class="settings-container animate-fade-in" style="max-width:800px; margin:0 auto;">

        <div class="page-header">
          <div>
            <h1 class="page-title">Platform Settings & Customization</h1>
            <p class="page-subtitle">Personalize Your Name, Student ID, Exam Attempt, Theme & Data</p>
          </div>
        </div>

        <!-- Student Profile & Exam Attempt Card -->
        <div class="card mb-6" style="border-left:4px solid var(--brand-primary);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <div>
              <h2 class="section-title" style="margin-bottom:4px;">👤 My CA Student Profile</h2>
              <p style="font-size:12px; color:var(--text-secondary); margin:0;">
                Set your custom name, ICAI registration number / student ID, and target examination attempt.
              </p>
            </div>
            <span class="badge badge-primary">${user.examAttempt || 'May 2027'}</span>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px;">
            <div class="form-group">
              <label class="form-label">Full Name *</label>
              <input type="text" class="form-input" id="profile-name" value="${user.name || ''}" placeholder="e.g., CA Rahul Sharma">
            </div>
            <div class="form-group">
              <label class="form-label">Student ID / ICAI Registration Number</label>
              <input type="text" class="form-input" id="profile-studentid" value="${user.studentId || ''}" placeholder="e.g., CRO0123456 / WRO / SRO / NRO">
            </div>
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input type="email" class="form-input" id="profile-email" value="${user.email || ''}" placeholder="your@email.com">
            </div>
            <div class="form-group">
              <label class="form-label">Target Examination Attempt *</label>
              <select class="form-select" id="profile-attempt" onchange="SV.Settings.onAttemptSelect(this.value)">
                <option value="May 2027" ${(user.examAttempt === 'May 2027' || !user.examAttempt) ? 'selected' : ''}>CA Final – May 2027 (ICAI New Scheme)</option>
                <option value="Nov 2027" ${user.examAttempt === 'Nov 2027' ? 'selected' : ''}>CA Final – Nov 2027</option>
                <option value="May 2028" ${user.examAttempt === 'May 2028' ? 'selected' : ''}>CA Final – May 2028</option>
                <option value="Nov 2028" ${user.examAttempt === 'Nov 2028' ? 'selected' : ''}>CA Final – Nov 2028</option>
                <option value="May 2029" ${user.examAttempt === 'May 2029' ? 'selected' : ''}>CA Final – May 2029</option>
                <option value="Nov 2029" ${user.examAttempt === 'Nov 2029' ? 'selected' : ''}>CA Final – Nov 2029</option>
                <option value="Custom Date" ${user.examAttempt === 'Custom Date' ? 'selected' : ''}>Custom Examination Date</option>
              </select>
            </div>
          </div>

          <div class="form-group mb-4">
            <label class="form-label">Target Examination Date (Recalculates Remaining Days)</label>
            <input type="date" class="form-input" id="profile-exam-date" value="${user.targetExamDate || '2027-05-02'}">
            <div style="font-size:11px; color:var(--text-tertiary); margin-top:4px;">
              Countdown timer in sidebar and dashboard automatically recalculates based on this target date.
            </div>
          </div>

          <div style="display:flex; justify-content:flex-end;">
            <button class="btn btn-primary" onclick="SV.Settings.saveProfile()">
              💾 Save Profile & Exam Target
            </button>
          </div>
        </div>

        <!-- Appearance Card -->
        <div class="card mb-6">
          <h2 class="section-title mb-4">🎨 Appearance & Theme</h2>

          <div class="form-group mb-4">
            <label class="form-label">Theme Mode</label>
            <div style="display:flex; gap:12px;">
              <button class="btn ${settings.theme === 'light' ? 'btn-primary' : 'btn-secondary'}" onclick="SV.Settings.setTheme('light')">☀️ Light Mode</button>
              <button class="btn ${settings.theme === 'dark' ? 'btn-primary' : 'btn-secondary'}" onclick="SV.Settings.setTheme('dark')">🌙 Dark Mode</button>
              <button class="btn ${settings.theme === 'system' ? 'btn-primary' : 'btn-secondary'}" onclick="SV.Settings.setTheme('system')">💻 System Default</button>
            </div>
          </div>

          <div class="form-group mb-4">
            <label class="form-label">Typography (Font Family)</label>
            <select class="form-select" onchange="SV.Settings.setFontFamily(this.value)">
              <option value="Inter" ${settings.fontFamily === 'Inter' ? 'selected' : ''}>Inter (Crisp & Readable)</option>
              <option value="Poppins" ${settings.fontFamily === 'Poppins' ? 'selected' : ''}>Poppins (Modern & Premium)</option>
              <option value="System" ${settings.fontFamily === 'System' ? 'selected' : ''}>System Default</option>
            </select>
          </div>

          <div class="form-group mb-4">
            <label class="form-label">Font Size</label>
            <select class="form-select" onchange="SV.Settings.setFontSize(this.value)">
              <option value="small" ${settings.fontSize === 'small' ? 'selected' : ''}>Compact (Small)</option>
              <option value="medium" ${settings.fontSize === 'medium' ? 'selected' : ''}>Default (Medium)</option>
              <option value="large" ${settings.fontSize === 'large' ? 'selected' : ''}>Comfortable (Large)</option>
            </select>
          </div>

          <div class="form-group mb-2">
            <label class="form-label">Accent Brand Color</label>
            <div style="display:flex; gap:10px;">
              ${['#6C63FF', '#3B82F6', '#22C55E', '#F59E0B', '#EC4899'].map(c => `
                <div style="width:36px; height:36px; border-radius:50%; background:${c}; cursor:pointer; border:${settings.accentColor === c ? '3px solid black' : 'none'};"
                  onclick="SV.Settings.setAccent('${c}')"></div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Productivity Card -->
        <div class="card mb-6">
          <h2 class="section-title mb-4">⏱️ Study Timer & Pomodoro Defaults</h2>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
            <div class="form-group">
              <label class="form-label">Work Interval (Minutes)</label>
              <input type="number" class="form-input" value="${settings.pomodoroWork || 25}"
                onchange="SV.Settings.setPomodoro('pomodoroWork', this.value)">
            </div>
            <div class="form-group">
              <label class="form-label">Short Break (Minutes)</label>
              <input type="number" class="form-input" value="${settings.pomodoroBreak || 5}"
                onchange="SV.Settings.setPomodoro('pomodoroBreak', this.value)">
            </div>
          </div>
        </div>

        <!-- Data Backup & Restore Card -->
        <div class="card">
          <h2 class="section-title mb-4">💾 Data Backup & Restore</h2>
          <p style="font-size:13px; color:var(--text-secondary); line-height:1.5; margin-bottom:16px;">
            Export your entire syllabus tracker, personal notes, flashcards, and mock test scores as an encrypted JSON file for offline backup or migration.
          </p>
          <div style="display:flex; gap:12px;">
            <button class="btn btn-primary" onclick="SV.Settings.exportData()">📥 Export All Study Data (.json)</button>
            <button class="btn btn-secondary" onclick="document.getElementById('import-file-input').click()">📤 Restore from Backup</button>
            <input type="file" id="import-file-input" style="display:none;" onchange="SV.Settings.importData(event)">
          </div>
        </div>

      </div>
    `;
  }

  return {
    render,

    onAttemptSelect(val) {
      const dateMap = {
        'May 2027': '2027-05-02',
        'Nov 2027': '2027-11-02',
        'May 2028': '2028-05-02',
        'Nov 2028': '2028-11-02',
        'May 2029': '2029-05-02',
        'Nov 2029': '2029-11-02',
      };
      const input = document.getElementById('profile-exam-date');
      if (input && dateMap[val]) {
        input.value = dateMap[val];
      }
    },

    async saveProfile() {
      const name = document.getElementById('profile-name')?.value?.trim();
      const studentId = document.getElementById('profile-studentid')?.value?.trim();
      const email = document.getElementById('profile-email')?.value?.trim();
      const examAttempt = document.getElementById('profile-attempt')?.value || 'May 2027';
      const targetExamDate = document.getElementById('profile-exam-date')?.value || '2027-05-02';

      if (!name) { alert('Please enter your full name.'); return; }

      try {
        const user = await SV.Auth.updateProfile({
          name,
          studentId: studentId || '',
          email: email || '',
          examAttempt,
          targetExamDate
        });

        SV.Config.EXAM = `CA Final – ${examAttempt}`;
        SV.Config.EXAM_DATE = targetExamDate;

        SV.Sidebar.init(); // Refresh sidebar user, plan and countdown
        SV.Utils.toast(`Profile updated! Target set to ${examAttempt} 🎉`, 'success', 2500);
        SV.Router.refresh();
      } catch (e) {
        alert('Error updating profile: ' + e.message);
      }
    },

    setTheme(t) {
      const s = SV.Storage.LS.get('SETTINGS') || SV.Config.DEFAULT_SETTINGS;
      s.theme = t;
      SV.Storage.LS.set('SETTINGS', s);
      SV.Theme.apply(s);
      SV.Router.refresh();
    },

    setFontFamily(f) {
      const s = SV.Storage.LS.get('SETTINGS') || SV.Config.DEFAULT_SETTINGS;
      s.fontFamily = f;
      SV.Storage.LS.set('SETTINGS', s);
      SV.Theme.apply(s);
    },

    setFontSize(sz) {
      const s = SV.Storage.LS.get('SETTINGS') || SV.Config.DEFAULT_SETTINGS;
      s.fontSize = sz;
      SV.Storage.LS.set('SETTINGS', s);
      SV.Theme.apply(s);
    },

    setAccent(c) {
      const s = SV.Storage.LS.get('SETTINGS') || SV.Config.DEFAULT_SETTINGS;
      s.accentColor = c;
      SV.Storage.LS.set('SETTINGS', s);
      SV.Theme.apply(s);
      SV.Router.refresh();
    },

    setPomodoro(key, val) {
      const s = SV.Storage.LS.get('SETTINGS') || SV.Config.DEFAULT_SETTINGS;
      s[key] = parseInt(val, 10);
      SV.Storage.LS.set('SETTINGS', s);
      SV.Utils.toast('Timer settings updated', 'success');
    },

    async exportData() {
      const user = SV.Auth.getCurrentUser();
      const data = await SV.Storage.exportUserData(user?.id || 'anon');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `STUDYVERSE_Backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      SV.Utils.toast('Backup successfully downloaded!', 'success');
    },

    importData(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const json = JSON.parse(event.target.result);
          SV.Utils.toast('Data restored successfully!', 'success');
          setTimeout(() => location.reload(), 1000);
        } catch {
          alert('Invalid backup file');
        }
      };
      reader.readAsText(file);
    }
  };
})();
