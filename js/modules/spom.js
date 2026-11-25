/**
 * STUDYVERSE – SPOM (Self-Paced Online Modules) Tracker
 * spom.js
 */
window.SV = window.SV || {};

SV.SPOM = (() => {
  async function render() {
    const data = window.SPOM_MODULES_DATA || [];

    return `
      <div class="spom-container animate-fade-in">

        <div class="page-header">
          <div>
            <h1 class="page-title">Self-Paced Online Modules (SPOM) Tracker</h1>
            <p class="page-subtitle">Mandatory Qualifying Modules under ICAI New Scheme · Sets A, B, C & D</p>
          </div>
          <div class="page-actions">
            <a href="https://www.icai.org/post/19162" target="_blank" rel="noopener" class="btn btn-primary">
              🌐 Official ICAI SPOM Portal ↗
            </a>
          </div>
        </div>

        <!-- Clarification Banner -->
        <div class="card mb-6" style="background:var(--subject-fr-bg); border-left:4px solid var(--brand-primary);">
          <div style="font-weight:700; color:var(--brand-primary); margin-bottom:4px; font-size:14px;">
            ℹ️ Important ICAI Examination Regulation:
          </div>
          <p style="font-size:13px; color:var(--text-primary); line-height:1.5;">
            SPOM modules are <strong>self-paced qualifying online learning modules</strong> with computer-based tests.
            They are required to qualify <em>before</em> appearing in or receiving your CA Final results, but they are <strong>NOT part of the 6 written examination papers</strong> for May 2027.
          </p>
        </div>

        <!-- 4 Sets Grid -->
        <div style="display:flex; flex-direction:column; gap:20px;">
          ${data.map(set => `
            <div class="card">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                <div>
                  <div style="display:flex; align-items:center; gap:8px;">
                    <span class="badge badge-primary">${set.set}</span>
                    <h3 style="font-weight:700; font-size:18px;">${set.name}</h3>
                  </div>
                  <div style="font-size:12px; color:var(--text-secondary); margin-top:4px;">
                    Type: <strong>${set.type}</strong> · Duration: ${set.totalHours} Hours · Passing: ${set.passingMarks}% · Format: ${set.examType}
                  </div>
                </div>
                <span class="badge badge-warning">${set.status}</span>
              </div>

              <!-- Module Units -->
              <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:10px;">
                ${set.modules.map(m => `
                  <div style="padding:10px 14px; background:var(--bg-surface-2); border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
                    <div style="display:flex; align-items:center; gap:8px;">
                      <input type="checkbox" ${m.completed ? 'checked' : ''} onchange="SV.SPOM.toggleModule('${m.id}', this.checked)">
                      <span style="font-size:13px; font-weight:500;">${m.name}</span>
                    </div>
                    <span style="font-size:11px; color:var(--text-tertiary);">${m.hours} hrs</span>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>

      </div>
    `;
  }

  return {
    render,

    toggleModule(id, completed) {
      SV.Utils.toast(completed ? 'SPOM module lecture marked completed!' : 'Status updated', 'success', 2000);
    }
  };
})();
