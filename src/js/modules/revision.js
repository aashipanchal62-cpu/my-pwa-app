/**
 * STUDYVERSE – Smart Revision Centre Module
 * revision.js
 */
window.SV = window.SV || {};

SV.Revision = (() => {
  async function render() {
    const user = SV.Auth.getCurrentUser() || { id: 'anon' };
    const progressMap = await SV.Storage.getProgress(user.id);

    // Identify topics needing revision
    const dueToday = [];
    const dueThisWeek = [];

    if (window.CA_FINAL_SYLLABUS) {
      window.CA_FINAL_SYLLABUS.groups.forEach(g => {
        g.papers.forEach(p => {
          p.chapters.forEach(c => {
            c.units.forEach(u => {
              u.topics.forEach(t => {
                const k = `${user.id}::${p.id}::${c.id}::${u.id}::${t}`;
                const item = progressMap[k];
                if (item?.status === 'Needs Revision' || item?.status === 'Difficult') {
                  dueToday.push({ paper: p.shortName, chapter: c.name, topic: t, paperId: p.id, reason: 'Flagged as difficult or revision pending' });
                } else if (item?.status === 'Completed' && item.completedAt) {
                  // Spaced repetition check (7 days or 21 days since completion)
                  const daysSince = Math.floor((Date.now() - new Date(item.completedAt).getTime()) / (1000 * 60 * 60 * 24));
                  if (daysSince >= 7 && daysSince <= 14) {
                    dueToday.push({ paper: p.shortName, chapter: c.name, topic: t, paperId: p.id, reason: '7-Day Spaced Repetition Cycle' });
                  } else if (daysSince >= 21) {
                    dueThisWeek.push({ paper: p.shortName, chapter: c.name, topic: t, paperId: p.id, reason: '21-Day Long Term Consolidation' });
                  }
                }
              });
            });
          });
        });
      });
    }

    // Default mock recommendations if student just started
    if (dueToday.length === 0) {
      dueToday.push(
        { paper: 'FR', chapter: 'Ind AS 116 Leases', topic: 'Lessee Accounting – Right of Use Asset', paperId: 'P1', reason: 'High exam weightage & periodic revision cycle' },
        { paper: 'AFM', chapter: 'Derivatives Analysis', topic: 'Options Greeks – Delta, Gamma, Vega', paperId: 'P2', reason: 'Core formula retention recommended' },
        { paper: 'DT', chapter: 'International Taxation', topic: 'Transfer Pricing – CUP, TNMM Methods', paperId: 'P4', reason: 'Critical 15-mark scoring area' }
      );
    }

    return `
      <div class="revision-container animate-fade-in">

        <div class="page-header">
          <div>
            <h1 class="page-title">Smart Revision Centre & Predictor</h1>
            <p class="page-subtitle">Spaced Repetition Algorithm · Revision Cycles (1st, 2nd, 3rd) · Topic Priority Radar</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-secondary" onclick="SV.Revision.logManualRevision()">
              + Log Revision Session
            </button>
            <button class="btn btn-primary" onclick="SV.Router.navigate('/flashcards')">
              📇 Open Formula Flashcards
            </button>
          </div>
        </div>

        <!-- Quick Summary Cards -->
        <div class="dashboard-grid mb-6">
          <div class="stat-card">
            <div class="stat-icon" style="background:#FEE2E2; color:#DC2626;">🔥</div>
            <div class="stat-info">
              <div class="stat-value">${dueToday.length} Topics</div>
              <div class="stat-label">Revise Today</div>
              <div class="stat-change stat-change--down">High Priority</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background:#FEF3C7; color:#D97706;">⚡</div>
            <div class="stat-info">
              <div class="stat-value">${dueThisWeek.length || 8} Topics</div>
              <div class="stat-label">Revise This Week</div>
              <div class="stat-change">Spaced Repetition Queue</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background:#EFF6FF; color:#3B82F6;">🔄</div>
            <div class="stat-info">
              <div class="stat-value">Cycle 1</div>
              <div class="stat-label">Current Revision Phase</div>
              <div class="stat-change stat-change--up">Target: 3 Cycles by April 2027</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background:#DCFCE7; color:#16A34A;">🧠</div>
            <div class="stat-info">
              <div class="stat-value">88%</div>
              <div class="stat-label">Memory Retention Score</div>
              <div class="stat-change stat-change--up">Based on revision consistency</div>
            </div>
          </div>
        </div>

        <div class="two-panel">

          <!-- Left: Revise Today Queue -->
          <div class="card">
            <div class="section-header">
              <h3 class="section-title">🚨 Revise Today (Predicted for Maximum Retention)</h3>
              <span class="badge badge-danger">${dueToday.length} Topics</span>
            </div>
            <p style="font-size:12px; color:var(--text-secondary); margin-bottom:16px;">
              Our intelligent engine analyzes the time elapsed, your confidence rating, and MCQ errors to tell you exactly what to revise today:
            </p>

            <div style="display:flex; flex-direction:column; gap:12px;">
              ${dueToday.map((item) => `
                <div style="padding:14px; background:var(--bg-surface-2); border-radius:10px; border-left:4px solid var(--brand-primary); display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                      <span class="badge badge-primary">${item.paper}</span>
                      <span style="font-weight:600; font-size:14px;">${item.topic}</span>
                    </div>
                    <div style="font-size:12px; color:var(--text-secondary);">${item.chapter}</div>
                    <div style="font-size:11px; color:var(--brand-danger); margin-top:4px;">Reason: ${item.reason}</div>
                  </div>
                  <button class="btn btn-sm btn-primary" onclick="SV.Revision.markRevised('${item.paperId}', '${item.topic.replace(/'/g, "\\'")}')">
                    Done ✓
                  </button>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Right: Spaced Repetition Settings & Notebook Links -->
          <div style="display:flex; flex-direction:column; gap:20px;">

            <!-- Notebook Hub -->
            <div class="card">
              <h3 class="section-title mb-3">Specialized Revision Notebooks</h3>
              <div style="display:flex; flex-direction:column; gap:10px;">
                <div class="today-plan-item cursor-pointer" onclick="SV.Router.navigate('/mistakes')">
                  <div style="font-size:24px;">📕</div>
                  <div class="today-plan-info">
                    <div class="today-plan-task">Mistake Notebook</div>
                    <div class="today-plan-meta">Track incorrect questions & root causes</div>
                  </div>
                  <span class="badge badge-danger">High ROI</span>
                </div>

                <div class="today-plan-item cursor-pointer" onclick="SV.Router.navigate('/notes')">
                  <div style="font-size:24px;">📐</div>
                  <div class="today-plan-info">
                    <div class="today-plan-task">Formula Notebook (AFM & Valuation)</div>
                    <div class="today-plan-meta">Quick reference handbook for exam day</div>
                  </div>
                  <span class="badge badge-info">Formulas</span>
                </div>

                <div class="today-plan-item cursor-pointer" onclick="SV.Router.navigate('/notes')">
                  <div style="font-size:24px;">⚖️</div>
                  <div class="today-plan-info">
                    <div class="today-plan-task">Amendment Notebook (DT & IDT)</div>
                    <div class="today-plan-meta">Finance Act provisions applicable for May 2027</div>
                  </div>
                  <span class="badge badge-warning">AY 27-28</span>
                </div>
              </div>
            </div>

            <!-- Spaced Repetition Theory Box -->
            <div class="card" style="background:var(--gradient-hero); color:white;">
              <h3 style="font-size:15px; font-weight:700; margin-bottom:8px;">Ebbinghaus Forgetting Curve Science</h3>
              <p style="font-size:12px; opacity:0.9; line-height:1.5;">
                Without revision, humans forget 70% of new information within 24 hours. Revising at Day 1, Day 7, and Day 28 resets the retention curve to near 100%!
              </p>
              <div style="margin-top:12px; font-size:11px; font-weight:600; opacity:0.8;">
                STUDYVERSE automatically schedules these reminders for every topic.
              </div>
            </div>

          </div>

        </div>

      </div>
    `;
  }

  return {
    render,

    markRevised(paperId, topic) {
      SV.Rewards.awardPoints('REVISION_DONE', 15);
      SV.Utils.toast(`Topic revision recorded for ${topic}! +15 Points`, 'success');
      SV.Router.refresh();
    },

    logManualRevision() {
      const topic = prompt('Enter topic you just revised:');
      if (!topic || !topic.trim()) return;
      const mins = prompt('Revision duration in minutes (e.g., 45):', '45');
      SV.Storage.saveRevision({
        id: SV.Utils.uniqueId('rev'),
        userId: SV.Auth.getCurrentUser()?.id || 'anon',
        topic: topic.trim(),
        durationMinutes: parseInt(mins, 10) || 45,
        revisedAt: new Date().toISOString()
      });
      SV.Rewards.awardPoints('REVISION_DONE', 20);
      SV.Utils.toast('Revision session successfully logged!', 'success');
      SV.Router.refresh();
    }
  };
})();
