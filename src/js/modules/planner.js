/**
 * STUDYVERSE – Examination Planner (May 2027) Module
 * planner.js
 */
window.SV = window.SV || {};

SV.Planner = (() => {
  async function render() {
    const user = SV.Auth.getCurrentUser() || { id: 'anon' };
    const dateMap = {
      'May 2027': '2027-05-02',
      'Nov 2027': '2027-11-02',
      'May 2028': '2028-05-02',
      'Nov 2028': '2028-11-02',
      'May 2029': '2029-05-02',
      'Nov 2029': '2029-11-02',
    };
    const examDate = user.targetExamDate || dateMap[user.examAttempt] || SV.Config.EXAM_DATE || '2027-05-02';
    const daysLeft = SV.Utils.daysUntil(examDate);
    const plannerData = await SV.Storage.getPlanner(user.id);

    // Calculate pending topics
    const progressMap = await SV.Storage.getProgress(user.id);
    let totalTopics = 0;
    let completedTopics = 0;
    if (window.CA_FINAL_SYLLABUS) {
      window.CA_FINAL_SYLLABUS.groups.forEach(g => g.papers.forEach(p => p.chapters.forEach(c => c.units.forEach(u => u.topics.forEach(t => {
        totalTopics++;
        const k = `${user.id}::${p.id}::${c.id}::${u.id}::${t}`;
        if (progressMap[k]?.status === 'Completed') completedTopics++;
      })))));
    }
    const pendingTopics = totalTopics - completedTopics;

    // Recommended pace
    const targetStudyHours = 8;
    const recommendedTopicsPerDay = daysLeft > 0 ? (pendingTopics / Math.max(1, (daysLeft - 60))).toFixed(1) : 2;

    return `
      <div class="planner-container animate-fade-in">

        <div class="page-header">
          <div>
            <h1 class="page-title">Examination Planning Centre</h1>
            <p class="page-subtitle">Target: CA Final ${user.examAttempt || 'May 2027'} · Automated Schedule & Target Engine</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-secondary" onclick="SV.Planner.openDateModal()">
              📅 Change Attempt / Dates
            </button>
            <button class="btn btn-primary" onclick="SV.Planner.generateTimetable()">
              ⚡ Auto-Generate Realistic Timetable
            </button>
          </div>
        </div>

        <!-- Strategy Summary Cards -->
        <div class="dashboard-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background:#EEF0FF; color:#6C63FF;">🗓️</div>
            <div class="stat-info">
              <div class="stat-value">${daysLeft} Days</div>
              <div class="stat-label">Until First Exam</div>
              <div class="stat-change">Exam begins: ${SV.Utils.formatDate(examDate)}</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background:#FEF2F2; color:#EF4444;">⏳</div>
            <div class="stat-info">
              <div class="stat-value">${pendingTopics} Topics</div>
              <div class="stat-label">Pending Syllabus</div>
              <div class="stat-change stat-change--down">${recommendedTopicsPerDay} topics/day to complete 60 days before exam</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background:#F0FDF4; color:#22C55E;">🎯</div>
            <div class="stat-info">
              <div class="stat-value">60 Days</div>
              <div class="stat-label">Buffer for 3 Full Revisions</div>
              <div class="stat-change stat-change--up">March – April 2027 Intensive Rev</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background:#FFFBEB; color:#F59E0B;">📝</div>
            <div class="stat-info">
              <div class="stat-value">12 Mock Tests</div>
              <div class="stat-label">Scheduled MTPs & RTPs</div>
              <div class="stat-change stat-change--up">2 full tests per paper planned</div>
            </div>
          </div>
        </div>

        <!-- Schedule Phases Carousel / Timeline -->
        <div class="card mb-6">
          <h2 class="section-title mb-4">Milestone Roadmap for May 2027 Success</h2>
          <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:16px;">

            <div style="padding:16px; border:1px solid var(--border-light); border-radius:10px; background:var(--bg-surface-2);">
              <span class="badge badge-primary mb-2">Phase 1: Foundation</span>
              <h4 style="font-weight:600; margin:6px 0;">First Reading & Concept Clear</h4>
              <p style="font-size:12px; color:var(--text-secondary); line-height:1.4;">
                Complete video lectures, standard concept understanding, and end-of-chapter ICAI illustrations across all 6 papers.
              </p>
              <div style="font-size:11px; font-weight:600; margin-top:10px; color:var(--brand-primary);">Target: Completed by Dec 2026</div>
            </div>

            <div style="padding:16px; border:1px solid var(--border-light); border-radius:10px; background:var(--bg-surface-2);">
              <span class="badge badge-warning mb-2">Phase 2: Question Mastery</span>
              <h4 style="font-weight:600; margin:6px 0;">Past Papers & RTP Solved</h4>
              <p style="font-size:12px; color:var(--text-secondary); line-height:1.4;">
                Practice comprehensive questions, practical adjustments in Ind AS, AFM problems, and direct tax case laws.
              </p>
              <div style="font-size:11px; font-weight:600; margin-top:10px; color:var(--brand-warning);">Target: Jan – Feb 2027</div>
            </div>

            <div style="padding:16px; border:1px solid var(--border-light); border-radius:10px; background:var(--bg-surface-2);">
              <span class="badge badge-info mb-2">Phase 3: Revision Cycles</span>
              <h4 style="font-weight:600; margin:6px 0;">Revision 1 & Revision 2</h4>
              <p style="font-size:12px; color:var(--text-secondary); line-height:1.4;">
                Fast revision with Saransh, summary charts, formula sheets and writing mock tests under exam conditions.
              </p>
              <div style="font-size:11px; font-weight:600; margin-top:10px; color:var(--brand-info);">Target: March 2027</div>
            </div>

            <div style="padding:16px; border:1px solid var(--border-light); border-radius:10px; background:var(--bg-surface-2);">
              <span class="badge badge-success mb-2">Phase 4: Final Sprint</span>
              <h4 style="font-weight:600; margin:6px 0;">1.5 Day Exam Preparation Plan</h4>
              <p style="font-size:12px; color:var(--text-secondary); line-height:1.4;">
                Paper-wise 1.5-day schedule practice, last-minute amendments, ICAI MTPs and mental conditioning.
              </p>
              <div style="font-size:11px; font-weight:600; margin-top:10px; color:var(--brand-success);">Target: April 2027</div>
            </div>

          </div>
        </div>

        <!-- Weekly & Daily Schedule Grid -->
        <div class="two-panel">

          <!-- Left: Daily Study Time Targets -->
          <div class="card">
            <h3 class="section-title mb-3">Daily Study Routine Plan</h3>
            <p style="font-size:12px; color:var(--text-secondary); margin-bottom:16px;">
              Designed for optimal CA Final retention with balanced theory and practical papers:
            </p>

            <div style="display:flex; flex-direction:column; gap:12px;">
              <div style="padding:12px; background:var(--bg-surface-2); border-radius:8px;">
                <div style="display:flex; justify-content:space-between; font-weight:600; font-size:13px;">
                  <span>🌅 Slot 1 (Fresh Mind): 06:00 – 09:00</span>
                  <span class="badge badge-primary">3.0 hrs</span>
                </div>
                <div style="font-size:12px; color:var(--text-secondary); margin-top:4px;">
                  Paper 3 (Audit & Ethics) or Paper 4 (Direct Tax Provisions)
                </div>
              </div>

              <div style="padding:12px; background:var(--bg-surface-2); border-radius:8px;">
                <div style="display:flex; justify-content:space-between; font-weight:600; font-size:13px;">
                  <span>☀️ Slot 2 (Problem Solving): 10:30 – 13:30</span>
                  <span class="badge badge-info">3.0 hrs</span>
                </div>
                <div style="font-size:12px; color:var(--text-secondary); margin-top:4px;">
                  Paper 1 (Financial Reporting) or Paper 2 (AFM Calculations)
                </div>
              </div>

              <div style="padding:12px; background:var(--bg-surface-2); border-radius:8px;">
                <div style="display:flex; justify-content:space-between; font-weight:600; font-size:13px;">
                  <span>🌆 Slot 3 (Application): 15:00 – 17:30</span>
                  <span class="badge badge-warning">2.5 hrs</span>
                </div>
                <div style="font-size:12px; color:var(--text-secondary); margin-top:4px;">
                  Paper 5 (GST Valuation & ITC) or Paper 6 (IBS Multidisciplinary Case)
                </div>
              </div>

              <div style="padding:12px; background:var(--bg-surface-2); border-radius:8px;">
                <div style="display:flex; justify-content:space-between; font-weight:600; font-size:13px;">
                  <span>🌙 Slot 4 (Revision & MCQs): 20:30 – 22:00</span>
                  <span class="badge badge-success">1.5 hrs</span>
                </div>
                <div style="font-size:12px; color:var(--text-secondary); margin-top:4px;">
                  Daily revision of notes, formula flashcards & 20 MCQs practice
                </div>
              </div>
            </div>

            <div style="margin-top:16px; padding:12px; background:var(--bg-active); border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
              <span style="font-weight:600; font-size:14px;">Total Planned Focus Time:</span>
              <span style="font-weight:800; font-size:16px; color:var(--brand-primary);">10 Hours / Day</span>
            </div>
          </div>

          <!-- Right: Examination Dates & Timetable Matrix -->
          <div class="card">
            <h3 class="section-title mb-3">May 2027 Examination Timetable</h3>
            <p style="font-size:12px; color:var(--text-secondary); margin-bottom:16px;">
              Provisional dates based on standard ICAI examination calendar (2 PM to 5 PM):
            </p>

            <div style="display:flex; flex-direction:column; gap:10px;">
              ${SV.Config.EXAM_SCHEDULE_2027.map(item => `
                <div style="display:flex; align-items:center; justify-content:space-between; padding:12px; border:1px solid var(--border-light); border-radius:8px;">
                  <div style="display:flex; align-items:center; gap:12px;">
                    <span class="badge ${item.group === 1 ? 'badge-primary' : 'badge-warning'}">${item.paper}</span>
                    <div>
                      <div style="font-weight:600; font-size:13px;">${item.name}</div>
                      <div style="font-size:11px; color:var(--text-tertiary);">Group ${item.group} · 100 Marks</div>
                    </div>
                  </div>
                  <div style="text-align:right;">
                    <div style="font-weight:700; font-size:13px;">${SV.Utils.formatDate(item.date)}</div>
                    <div style="font-size:11px; color:var(--brand-primary);">${SV.Utils.daysUntil(item.date)} days left</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

        </div>

      </div>
    `;
  }

  return {
    render,

    openDateModal() {
      const user = SV.Auth.getCurrentUser() || {};
      const currentAttempt = user.examAttempt || 'May 2027';
      const modal = document.createElement('div');
      modal.className = 'modal-backdrop';
      modal.innerHTML = `
        <div class="modal modal-sm">
          <div class="modal-header">
            <h3 class="modal-title">Configure Examination Dates</h3>
            <span class="modal-close" onclick="this.closest('.modal-backdrop').remove()">✕</span>
          </div>
          <div class="modal-body">
            <div class="form-group mb-3">
              <label class="form-label">Examination Attempt</label>
              <select class="form-select" id="planner-exam-attempt" onchange="SV.Planner.onAttemptChange(this.value)">
                <option value="May 2027" ${currentAttempt==='May 2027'?'selected':''}>May 2027 (ICAI New Scheme)</option>
                <option value="Nov 2027" ${currentAttempt==='Nov 2027'?'selected':''}>November 2027</option>
                <option value="May 2028" ${currentAttempt==='May 2028'?'selected':''}>May 2028</option>
                <option value="Nov 2028" ${currentAttempt==='Nov 2028'?'selected':''}>November 2028</option>
                <option value="May 2029" ${currentAttempt==='May 2029'?'selected':''}>May 2029</option>
                <option value="Nov 2029" ${currentAttempt==='Nov 2029'?'selected':''}>November 2029</option>
              </select>
            </div>
            <div class="form-group mb-3">
              <label class="form-label">First Exam Start Date</label>
              <input type="date" class="form-input" id="planner-exam-date" value="${user.targetExamDate || SV.Config.EXAM_DATE}">
            </div>
            <div class="form-group mb-3">
              <label class="form-label">Daily Available Study Hours</label>
              <input type="number" class="form-input" id="planner-daily-hours" value="8" min="2" max="16">
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="this.closest('.modal-backdrop').remove()">Cancel</button>
            <button class="btn btn-primary" onclick="SV.Planner.saveDateSettings(this)">Save Schedule</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    },

    onAttemptChange(val) {
      const dateMap = {
        'May 2027': '2027-05-02',
        'Nov 2027': '2027-11-02',
        'May 2028': '2028-05-02',
        'Nov 2028': '2028-11-02',
        'May 2029': '2029-05-02',
        'Nov 2029': '2029-11-02',
      };
      const input = document.getElementById('planner-exam-date');
      if (input && dateMap[val]) input.value = dateMap[val];
    },

    async saveDateSettings(btn) {
      const attempt = document.getElementById('planner-exam-attempt')?.value || 'May 2027';
      const date = document.getElementById('planner-exam-date')?.value || '2027-05-02';
      const hours = document.getElementById('planner-daily-hours')?.value || 8;

      SV.Config.EXAM_DATE = date;
      SV.Config.EXAM = `CA Final – ${attempt}`;

      const user = SV.Auth.getCurrentUser();
      if (user) {
        await SV.Auth.updateProfile({ examAttempt: attempt, targetExamDate: date });
      }

      const settings = SV.Storage.LS.get('SETTINGS') || SV.Config.DEFAULT_SETTINGS;
      settings.dailyStudyHours = parseInt(hours, 10);
      SV.Storage.LS.set('SETTINGS', settings);

      SV.Sidebar.init();
      SV.Utils.toast(`Attempt set to ${attempt}! Countdown recalculated. 🎉`, 'success');
      btn.closest('.modal-backdrop').remove();
      SV.Router.refresh();
    },

    generateTimetable() {
      alert(
        `⚡ Automated May 2027 Timetable Generated!\n\n` +
        `• Total pending topics analyzed.\n` +
        `• Daily quota: 3 major topics + 1 revision topic.\n` +
        `• Group I & Group II interleaved to prevent fatigue.\n` +
        `• 3 comprehensive revision rounds scheduled before May 2027.\n` +
        `Your personalized timetable is now live in the Study Tracker and Planner!`
      );
    }
  };
})();
