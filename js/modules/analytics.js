/**
 * STUDYVERSE – Analytics Dashboard Module
 * analytics.js
 */
window.SV = window.SV || {};

SV.Analytics = (() => {
  async function render() {
    const user = SV.Auth.getCurrentUser() || { id: 'anon' };
    const progressMap = await SV.Storage.getProgress(user.id);

    return `
      <div class="analytics-container animate-fade-in">

        <div class="page-header">
          <div>
            <h1 class="page-title">CA Final Performance Analytics</h1>
            <p class="page-subtitle">Group & Subject Readiness · MCQ Accuracy · Study Consistency Trends</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-secondary" onclick="SV.Utils.printElement('.analytics-container')">
              🖨️ Export PDF Report
            </button>
            <button class="btn btn-primary" onclick="alert('Exporting full study metrics to Excel (.xlsx)...')">
              📥 Export to Excel
            </button>
          </div>
        </div>

        <!-- 4 Key Metrics -->
        <div class="dashboard-grid mb-6">
          <div class="stat-card">
            <div class="stat-icon" style="background:#EEF0FF; color:#6C63FF;">📈</div>
            <div class="stat-info">
              <div class="stat-value">58%</div>
              <div class="stat-label">Group I Readiness</div>
              <div class="stat-change stat-change--up">Target: 80% by Feb 2027</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background:#FDF2F8; color:#EC4899;">📊</div>
            <div class="stat-info">
              <div class="stat-value">46%</div>
              <div class="stat-label">Group II Readiness</div>
              <div class="stat-change stat-change--up">Target: 80% by March 2027</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background:#DCFCE7; color:#16A34A;">🎯</div>
            <div class="stat-info">
              <div class="stat-value">82.4%</div>
              <div class="stat-label">MCQ Practice Accuracy</div>
              <div class="stat-change stat-change--up">320 MCQs attempted</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background:#EFF6FF; color:#3B82F6;">⏳</div>
            <div class="stat-info">
              <div class="stat-value">342 hrs</div>
              <div class="stat-label">Total Study Time Logged</div>
              <div class="stat-change stat-change--up">Avg 7.2 hrs/day</div>
            </div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="two-panel mb-6">

          <!-- Subject Progress Comparison Bar Chart -->
          <div class="card">
            <h3 class="section-title mb-4">Subject-Wise Completion Matrix</h3>
            <div style="display:flex; flex-direction:column; gap:16px;">
              ${[
                { paper: 'P1: Financial Reporting', pct: 64, color: '#6C63FF' },
                { paper: 'P2: Advanced Financial Management', pct: 58, color: '#3B82F6' },
                { paper: 'P3: Advanced Auditing & Ethics', pct: 52, color: '#22C55E' },
                { paper: 'P4: Direct Tax & Int\'l Tax', pct: 48, color: '#F59E0B' },
                { paper: 'P5: Indirect Tax Laws (GST)', pct: 45, color: '#EF4444' },
                { paper: 'P6: Integrated Business Solutions', pct: 42, color: '#EC4899' },
              ].map(item => `
                <div>
                  <div style="display:flex; justify-content:space-between; font-size:13px; font-weight:600; margin-bottom:6px;">
                    <span>${item.paper}</span>
                    <span>${item.pct}%</span>
                  </div>
                  <div class="progress-container progress-lg">
                    <div class="progress-fill" style="width: ${item.pct}%; background: ${item.color};"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Strong vs Weak Chapters Analysis -->
          <div class="card">
            <h3 class="section-title mb-4">Strong vs Weak Chapters Breakdown</h3>
            <div style="margin-bottom:16px;">
              <div style="font-weight:700; color:var(--brand-success); margin-bottom:8px; font-size:14px;">
                ✅ Strong Chapters (Exemption Level):
              </div>
              <ul style="font-size:13px; line-height:1.6; color:var(--text-secondary); padding-left:16px; list-style:disc;">
                <li>Ind AS 115 Revenue & Ind AS 116 Leases (FR)</li>
                <li>Portfolio Management & CAPM (AFM)</li>
                <li>Audit of Banks & Company Audit CARO 2020 (Audit)</li>
                <li>Input Tax Credit Apportionment Rule 42/43 (GST)</li>
              </ul>
            </div>

            <div>
              <div style="font-weight:700; color:var(--brand-danger); margin-bottom:8px; font-size:14px;">
                ⚠️ Focus Chapters (Need More Revision):
              </div>
              <ul style="font-size:13px; line-height:1.6; color:var(--text-secondary); padding-left:16px; list-style:disc;">
                <li>Financial Instruments Ind AS 109 & 107 (FR)</li>
                <li>Forex Hedging & Cross-Currency Derivatives (AFM)</li>
                <li>International Taxation, BEPS Pillar 2 & Transfer Pricing (DT)</li>
                <li>Multidisciplinary Case Analysis Timing (IBS)</li>
              </ul>
            </div>
          </div>

        </div>

      </div>
    `;
  }

  return { render };
})();
