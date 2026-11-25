/**
 * STUDYVERSE – Mistake Notebook Module
 * mistake-notebook.js
 */
window.SV = window.SV || {};

SV.MistakeNotebook = (() => {
  async function render() {
    const user = SV.Auth.getCurrentUser() || { id: 'anon' };
    const mistakes = (await SV.Storage.getMistakes(user.id)) || [];

    return `
      <div class="mistake-container animate-fade-in">

        <div class="page-header">
          <div>
            <h1 class="page-title">CA Final Mistake Notebook</h1>
            <p class="page-subtitle">Track Errors in Mock Tests & Questions · Root Cause Analysis · Prevent Exam Mistakes</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-primary" onclick="SV.MistakeNotebook.addMistake()">
              + Log New Mistake
            </button>
          </div>
        </div>

        <div class="card mb-6" style="background:#FFF1F2; border-left:4px solid #F43F5E;">
          <h3 style="font-size:14px; font-weight:700; color:#BE123C; margin-bottom:4px;">Why maintain a CA Mistake Notebook?</h3>
          <p style="font-size:13px; color:#4C0519; line-height:1.5;">
            Rank holders credit reviewing their mistake notebook 1.5 days before the exam as the highest ROI activity. It directly prevents repeated errors in calculation, interpretation of Ind AS, and tax sections.
          </p>
        </div>

        <div class="grid-auto">
          ${mistakes.length === 0 ? `
            <div class="empty-state" style="grid-column: 1 / -1;">
              <div class="empty-state-icon">📕</div>
              <div class="empty-state-title">No mistakes logged yet!</div>
              <div class="empty-state-desc">Whenever you get an MCQ or question wrong in practice, record it here so you never repeat it.</div>
              <button class="btn btn-primary" onclick="SV.MistakeNotebook.addMistake()">Log First Mistake</button>
            </div>
          ` : mistakes.map(m => `
            <div class="card" style="border-left:4px solid ${m.resolved ? 'var(--brand-success)' : 'var(--brand-danger)'};">
              <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                <span class="badge ${m.resolved ? 'badge-success' : 'badge-danger'}">
                  ${m.resolved ? 'Resolved ✓' : 'Needs Practice'}
                </span>
                <span class="badge badge-muted">${m.paper}</span>
              </div>
              <h4 style="font-weight:700; font-size:15px; margin-bottom:8px;">${m.question}</h4>
              <div style="font-size:13px; margin-bottom:8px;">
                <strong style="color:var(--brand-danger);">My Mistake:</strong> ${m.reason}
              </div>
              <div style="font-size:13px; margin-bottom:12px; background:var(--bg-surface-2); padding:8px; border-radius:6px;">
                <strong style="color:var(--brand-success);">Correct Approach:</strong> ${m.correctApproach}
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-light); padding-top:8px;">
                <span style="font-size:11px; color:var(--text-tertiary);">${m.chapter}</span>
                <button class="btn btn-sm ${m.resolved ? 'btn-secondary' : 'btn-success'}" onclick="SV.MistakeNotebook.toggleResolve('${m.id}')">
                  ${m.resolved ? 'Mark Pending' : 'Mark Resolved'}
                </button>
              </div>
            </div>
          `).join('')}
        </div>

      </div>
    `;
  }

  return {
    render,

    addMistake() {
      const question = prompt('Question description / summary:');
      if (!question || !question.trim()) return;
      const paper = prompt('Subject Paper (FR, AFM, Audit, DT, IDT, IBS):', 'FR') || 'FR';
      const chapter = prompt('Chapter / Standard name:', 'Ind AS 115') || 'General';
      const reason = prompt('What mistake did you make? (e.g., forgot variable consideration constraint):');
      const correctApproach = prompt('What is the correct ICAI approach?');

      SV.Storage.saveMistake({
        id: SV.Utils.uniqueId('mst'),
        userId: SV.Auth.getCurrentUser()?.id || 'anon',
        question: question.trim(),
        paper: paper.trim(),
        chapter: chapter.trim(),
        reason: (reason && reason.trim()) || 'Calculation error',
        correctApproach: (correctApproach && correctApproach.trim()) || 'Follow standard ICAI formula',
        resolved: false,
        createdAt: new Date().toISOString()
      });

      SV.Utils.toast('Recorded in Mistake Notebook!', 'warning');
      SV.Router.refresh();
    },

    async toggleResolve(id) {
      const user = SV.Auth.getCurrentUser() || { id: 'anon' };
      const mistakes = await SV.Storage.getMistakes(user.id);
      const m = mistakes.find(item => item.id === id);
      if (m) {
        m.resolved = !m.resolved;
        await SV.Storage.saveMistake(m);
        SV.Utils.toast(m.resolved ? 'Marked as resolved!' : 'Marked as pending', 'info');
        SV.Router.refresh();
      }
    }
  };
})();
