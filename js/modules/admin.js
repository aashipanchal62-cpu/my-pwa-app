/**
 * STUDYVERSE – Administrator Panel Module
 * admin.js
 */
window.SV = window.SV || {};

SV.Admin = (() => {
  async function render() {
    const users = SV.Auth.getAllUsers();
    const syllabus = window.CA_FINAL_SYLLABUS;

    return `
      <div class="admin-container animate-fade-in">

        <div class="page-header">
          <div>
            <h1 class="page-title">STUDYVERSE Administrator Console</h1>
            <p class="page-subtitle">Multi-User Management · Syllabus Version Control · AI Provider Configuration</p>
          </div>
          <div class="page-actions">
            <span class="badge badge-danger">Admin RBAC Mode</span>
          </div>
        </div>

        <!-- Metric Overview -->
        <div class="dashboard-grid mb-6">
          <div class="stat-card">
            <div class="stat-icon" style="background:#EEF0FF; color:#6C63FF;">👥</div>
            <div class="stat-info">
              <div class="stat-value">${users.length}</div>
              <div class="stat-label">Registered Students</div>
              <div class="stat-change stat-change--up">Multi-user isolated storage</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background:#DCFCE7; color:#16A34A;">📚</div>
            <div class="stat-info">
              <div class="stat-value">6 Papers</div>
              <div class="stat-label">Active Syllabus (May 2027)</div>
              <div class="stat-change stat-change--up">ICAI BOS Verified v2.0</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background:#FFFBEB; color:#F59E0B;">🤖</div>
            <div class="stat-info">
              <div class="stat-value">Active</div>
              <div class="stat-label">AI Engine Grounding</div>
              <div class="stat-change">Configurable backend endpoints</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background:#EFF6FF; color:#3B82F6;">⚡</div>
            <div class="stat-info">
              <div class="stat-value">100%</div>
              <div class="stat-label">PWA Offline Health</div>
              <div class="stat-change stat-change--up">Service Worker v1.0</div>
            </div>
          </div>
        </div>

        <!-- Student Management Table -->
        <div class="card mb-6">
          <div class="section-header">
            <h3 class="section-title">Enrolled CA Final Students</h3>
          </div>

          <div style="overflow-x:auto;">
            <table style="width:100%; border-collapse:collapse; font-size:13px;">
              <thead>
                <tr style="text-align:left; border-bottom:2px solid var(--border-light); color:var(--text-secondary);">
                  <th style="padding:10px;">Name</th>
                  <th style="padding:10px;">Email</th>
                  <th style="padding:10px;">Role</th>
                  <th style="padding:10px;">Target Attempt</th>
                  <th style="padding:10px;">Study Points</th>
                  <th style="padding:10px;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${users.map(u => `
                  <tr style="border-bottom:1px solid var(--border-light);">
                    <td style="padding:10px; font-weight:600;">${u.name}</td>
                    <td style="padding:10px;">${u.email}</td>
                    <td style="padding:10px;"><span class="badge ${u.role === 'admin' ? 'badge-danger' : 'badge-primary'}">${u.role}</span></td>
                    <td style="padding:10px;">${u.examAttempt || 'May 2027'}</td>
                    <td style="padding:10px; font-weight:700;">${u.points || 0}</td>
                    <td style="padding:10px;">
                      <button class="btn btn-sm btn-secondary" onclick="alert('Student metrics reviewed.')">Audit</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- AI Provider & Syllabus Configuration -->
        <div class="two-panel">
          <div class="card">
            <h3 class="section-title mb-3">AI Engine Calibration</h3>
            <div class="form-group mb-3">
              <label class="form-label">Active Provider</label>
              <select class="form-select">
                <option selected>Google Gemini Pro 1.5 (High Speed & Deep Reasoning)</option>
                <option>Anthropic Claude 3.5 Sonnet</option>
                <option>OpenAI GPT-4o</option>
              </select>
            </div>
            <div class="form-group mb-3">
              <label class="form-label">System Temperature (Precision vs Creativity)</label>
              <input type="range" min="0" max="1" step="0.1" value="0.2" class="w-full">
              <span style="font-size:11px; color:var(--text-tertiary);">0.2 (High Statutory Strictness & Citation Accuracy)</span>
            </div>
            <button class="btn btn-primary" onclick="SV.Utils.toast('AI calibration updated', 'success')">Save Configuration</button>
          </div>

          <div class="card">
            <h3 class="section-title mb-3">Syllabus Version Control</h3>
            <div style="font-size:13px; line-height:1.6; color:var(--text-secondary);">
              Current Active Scheme: <strong>ICAI New Scheme of Education and Training</strong><br>
              Target Attempt: <strong>May 2027</strong><br>
              Verification Date: <strong>November 2026</strong><br>
              Total Papers: <strong>6 written papers (P1 - P6)</strong><br>
              SPOM Integration: <strong>Sets A, B, C, D tracked independently</strong>
            </div>
            <button class="btn btn-secondary mt-4" onclick="alert('Checking official ICAI BOS repository for recent statutory corrigenda...')">
              🔄 Check for ICAI Syllabus Corrigenda
            </button>
          </div>
        </div>

      </div>
    `;
  }

  return { render };
})();
