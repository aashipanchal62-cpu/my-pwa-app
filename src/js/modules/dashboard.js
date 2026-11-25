/**
 * STUDYVERSE – Dashboard Module
 * dashboard.js
 */
window.SV = window.SV || {};

SV.Dashboard = (() => {
  async function render() {
    const user = SV.Auth.getCurrentUser() || { name: 'Future CA', examAttempt: 'May 2027' };
    const progressMap = await SV.Storage.getProgress(user.id);
    const dateMap = {
      'May 2027': '2027-05-02',
      'Nov 2027': '2027-11-02',
      'May 2028': '2028-05-02',
      'Nov 2028': '2028-11-02',
      'May 2029': '2029-05-02',
      'Nov 2029': '2029-11-02',
    };
    const targetDate = user.targetExamDate || dateMap[user.examAttempt] || SV.Config.EXAM_DATE || '2027-05-02';
    const daysLeft = SV.Utils.daysUntil(targetDate);
    const quote = SV.Utils.randomItem(SV.Config.QUOTES);

    // Compute progress stats
    let totalTopics = 0;
    let completedTopics = 0;
    const subjectStats = {};

    if (window.CA_FINAL_SYLLABUS) {
      window.CA_FINAL_SYLLABUS.groups.forEach(group => {
        group.papers.forEach(paper => {
          let paperTotal = 0;
          let paperDone = 0;
          paper.chapters.forEach(chap => {
            chap.units.forEach(unit => {
              unit.topics.forEach(t => {
                totalTopics++;
                paperTotal++;
                const key = `${user.id}::${paper.id}::${chap.id}::${unit.id}::${t}`;
                if (progressMap[key]?.completed) {
                  completedTopics++;
                  paperDone++;
                }
              });
            });
          });
          subjectStats[paper.id] = {
            total: paperTotal,
            done: paperDone,
            pct: paperTotal > 0 ? Math.round((paperDone / paperTotal) * 100) : 0,
            name: paper.name,
            code: paper.code,
            shortName: paper.shortName,
            group: group.name
          };
        });
      });
    }

    const overallPct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
    const strokeDash = 2 * Math.PI * 52;
    const strokeOffset = strokeDash - (overallPct / 100) * strokeDash;

    return `
      <div class="dashboard-container animate-fade-in">

        <!-- Welcome Banner -->
        <div class="welcome-banner">
          <div class="welcome-content">
            <div class="welcome-greeting">👋 Welcome back,</div>
            <h1 class="welcome-name">${user.name}</h1>
            <p class="welcome-quote">"${quote.text}"</p>
            <div class="welcome-actions">
              <button class="welcome-btn welcome-btn-primary" onclick="SV.Router.navigate('/tracker')">
                Continue Studying
              </button>
              <button class="welcome-btn welcome-btn-secondary" onclick="SV.Dashboard.openSpinWheel()">
                🎯 Spin Topic Selector
              </button>
            </div>
          </div>
          <div class="welcome-right">
            <div class="exam-countdown-large">
              <div class="countdown-number">${daysLeft}</div>
              <div class="countdown-unit">Days Remaining</div>
              <div class="countdown-exam-name">CA Final · ${user.examAttempt || 'May 2027'}</div>
            </div>
          </div>
        </div>

        <!-- Top Stats Row -->
        <div class="dashboard-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background:#EEF0FF; color:#6C63FF;">📊</div>
            <div class="stat-info">
              <div class="stat-value">${overallPct}%</div>
              <div class="stat-label">Syllabus Covered</div>
              <div class="stat-change stat-change--up">${completedTopics} of ${totalTopics} Topics</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background:#EFF6FF; color:#3B82F6;">🔥</div>
            <div class="stat-info">
              <div class="stat-value">${user.streakDays || 1} Days</div>
              <div class="stat-label">Active Streak</div>
              <div class="stat-change stat-change--up">Keep going!</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background:#F0FDF4; color:#22C55E;">🏆</div>
            <div class="stat-info">
              <div class="stat-value">${user.points || 120}</div>
              <div class="stat-label">Study Points</div>
              <div class="stat-change stat-change--up">Level ${user.level || 1} Scholar</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background:#FFFBEB; color:#F59E0B;">⏱️</div>
            <div class="stat-info">
              <div class="stat-value" id="dashboard-study-hours">2.5 hrs</div>
              <div class="stat-label">Today's Focus Time</div>
              <div class="stat-change stat-change--up">Target: 8 hrs</div>
            </div>
          </div>
        </div>

        <!-- Main Dashboard Section (2 Columns) -->
        <div class="dashboard-main">

          <!-- Left: Subject Breakdown & Overall Circle -->
          <div class="card">
            <div class="section-header">
              <h2 class="section-title">CA Final New Scheme Papers (May 2027)</h2>
              <span class="section-action" onclick="SV.Router.navigate('/tracker')">Open Full Tracker →</span>
            </div>

            <div class="circular-progress-wrapper" style="margin-bottom: 24px;">
              <div class="circular-progress">
                <svg viewBox="0 0 120 120">
                  <defs>
                    <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#6C63FF" />
                      <stop offset="100%" stop-color="#FF6584" />
                    </linearGradient>
                  </defs>
                  <circle cx="60" cy="60" r="52" class="circular-progress-track"></circle>
                  <circle cx="60" cy="60" r="52" class="circular-progress-fill"
                    style="stroke-dasharray: ${strokeDash}; stroke-dashoffset: ${strokeOffset};">
                  </circle>
                </svg>
                <div class="circular-progress-label">
                  <div class="circular-progress-percent">${overallPct}%</div>
                  <div class="circular-progress-sub">Completed</div>
                </div>
              </div>

              <div class="progress-details">
                <div class="progress-row">
                  <div class="progress-row-header">
                    <span class="progress-row-label">Group I (Papers 1, 2, 3)</span>
                    <span class="progress-row-pct">${Math.round(((subjectStats['P1']?.pct || 0) + (subjectStats['P2']?.pct || 0) + (subjectStats['P3']?.pct || 0)) / 3)}%</span>
                  </div>
                  <div class="progress-container">
                    <div class="progress-fill" style="width: ${Math.round(((subjectStats['P1']?.pct || 0) + (subjectStats['P2']?.pct || 0) + (subjectStats['P3']?.pct || 0)) / 3)}%;"></div>
                  </div>
                </div>

                <div class="progress-row">
                  <div class="progress-row-header">
                    <span class="progress-row-label">Group II (Papers 4, 5, 6)</span>
                    <span class="progress-row-pct">${Math.round(((subjectStats['P4']?.pct || 0) + (subjectStats['P5']?.pct || 0) + (subjectStats['P6']?.pct || 0)) / 3)}%</span>
                  </div>
                  <div class="progress-container">
                    <div class="progress-fill" style="width: ${Math.round(((subjectStats['P4']?.pct || 0) + (subjectStats['P5']?.pct || 0) + (subjectStats['P6']?.pct || 0)) / 3)}%; background: var(--gradient-secondary);"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 6 Subject Cards Grid -->
            <div class="subject-cards-grid">
              ${['P1', 'P2', 'P3', 'P4', 'P5', 'P6'].map(pid => {
                const s = subjectStats[pid] || { name: pid, code: pid, shortName: pid, pct: 0, done: 0, total: 0 };
                return `
                  <div class="subject-card subject-card--${s.shortName.toLowerCase()}" onclick="SV.Router.navigate('/tracker', { paperId: '${pid}' })">
                    <div class="subject-card-header">
                      <span class="subject-code">${s.code} · ${s.shortName}</span>
                      <span class="subject-pct">${s.pct}%</span>
                    </div>
                    <div class="subject-name">${s.name}</div>
                    <div class="progress-container progress-sm">
                      <div class="progress-fill" style="width: ${s.pct}%; background: ${SV.Config.SUBJECT_COLORS[pid]};"></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Right: Today's Action Center & Quick Access -->
          <div style="display:flex; flex-direction:column; gap: var(--space-6);">

            <!-- Today's Tasks -->
            <div class="today-plan-card">
              <div class="section-header">
                <h3 class="section-title">Today's Study Plan</h3>
                <span class="section-action" onclick="SV.Router.navigate('/planner')">Edit Plan</span>
              </div>

              <div id="dashboard-tasks-list">
                <div class="today-plan-item" onclick="SV.Dashboard.toggleTask(this)">
                  <div class="today-plan-check">✓</div>
                  <div class="today-plan-info">
                    <div class="today-plan-task">Ind AS 115: 5-Step Model Revenue Questions</div>
                    <div class="today-plan-meta">Paper 1 · Financial Reporting</div>
                  </div>
                  <div class="today-plan-time">1.5h</div>
                </div>

                <div class="today-plan-item" onclick="SV.Dashboard.toggleTask(this)">
                  <div class="today-plan-check"></div>
                  <div class="today-plan-info">
                    <div class="today-plan-task">Black-Scholes Model & Option Greeks Practice</div>
                    <div class="today-plan-meta">Paper 2 · AFM</div>
                  </div>
                  <div class="today-plan-time">2.0h</div>
                </div>

                <div class="today-plan-item" onclick="SV.Dashboard.toggleTask(this)">
                  <div class="today-plan-check"></div>
                  <div class="today-plan-info">
                    <div class="today-plan-task">Audit SA 701 & CARO 2020 Clause Review</div>
                    <div class="today-plan-meta">Paper 3 · Audit & Ethics</div>
                  </div>
                  <div class="today-plan-time">1.0h</div>
                </div>
              </div>

              <button class="btn btn-secondary w-full mt-2" onclick="SV.Dashboard.addNewTask()">
                + Add Custom Task
              </button>
            </div>

            <!-- Quick Action Hub -->
            <div class="card">
              <h3 class="section-title" style="margin-bottom:12px;">Quick Utilities</h3>
              <div class="quick-actions-grid">
                <div class="quick-action-btn" onclick="SV.Dashboard.openCalculator()">
                  <div class="quick-action-icon">🧮</div>
                  <div class="quick-action-label">CA Calculator</div>
                </div>
                <div class="quick-action-btn" onclick="SV.Router.navigate('/ai')">
                  <div class="quick-action-icon">🤖</div>
                  <div class="quick-action-label">AI Tutor</div>
                </div>
                <div class="quick-action-btn" onclick="SV.Dashboard.openSpinWheel()">
                  <div class="quick-action-icon">🎡</div>
                  <div class="quick-action-label">Spin Topic</div>
                </div>
                <div class="quick-action-btn" onclick="SV.Router.navigate('/games')">
                  <div class="quick-action-icon">🎮</div>
                  <div class="quick-action-label">Play Games</div>
                </div>
                <div class="quick-action-btn" onclick="SV.Router.navigate('/reels')">
                  <div class="quick-action-icon">📱</div>
                  <div class="quick-action-label">CA Reels</div>
                </div>
                <div class="quick-action-btn" onclick="SV.Router.navigate('/shared-lib')">
                  <div class="quick-action-icon">🌐</div>
                  <div class="quick-action-label">Community Lib</div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Bottom Row: Study Heatmap, Revision Recommendation & Daily Quote -->
        <div class="dashboard-bottom">
          <!-- Daily Thought -->
          <div class="daily-thought-card">
            <div class="daily-thought-text">"${quote.text}"</div>
            <div class="daily-thought-author">— ${quote.author}</div>
          </div>

          <!-- Quick Revision Alert -->
          <div class="card">
            <div class="section-header">
              <h3 class="section-title">Smart Revision Radar</h3>
              <span class="section-action" onclick="SV.Router.navigate('/revision')">All Revisions</span>
            </div>
            <p style="font-size:12px; color:var(--text-secondary); margin-bottom:12px;">
              Topics due for spaced repetition today:
            </p>
            <div style="display:flex; flex-direction:column; gap:8px;">
              <div style="display:flex; justify-content:space-between; align-items:center; padding:8px; background:var(--bg-surface-2); border-radius:6px;">
                <div>
                  <div style="font-weight:600; font-size:13px;">Ind AS 116 Leases</div>
                  <div style="font-size:11px; color:var(--text-tertiary);">Last revised 7 days ago</div>
                </div>
                <button class="btn btn-sm btn-primary" onclick="SV.Router.navigate('/tracker', { paperId: 'P1' })">Revise</button>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; padding:8px; background:var(--bg-surface-2); border-radius:6px;">
                <div>
                  <div style="font-weight:600; font-size:13px;">Transfer Pricing Methods</div>
                  <div style="font-size:11px; color:var(--text-tertiary);">High exam weightage</div>
                </div>
                <button class="btn btn-sm btn-primary" onclick="SV.Router.navigate('/tracker', { paperId: 'P4' })">Revise</button>
              </div>
            </div>
          </div>

          <!-- 365 Days Study Heatmap Overview -->
          <div class="card">
            <div class="section-header">
              <h3 class="section-title">Consistency Heatmap</h3>
              <span class="section-action" onclick="SV.Router.navigate('/analytics')">Details</span>
            </div>
            <p style="font-size:12px; color:var(--text-secondary); margin-bottom:8px;">Past 16 weeks study frequency:</p>
            <div class="heatmap-container" style="grid-template-columns: repeat(16, 1fr); max-width: 100%;">
              ${Array.from({ length: 112 }).map((_, i) => {
                const level = (i % 7 === 0 || i % 5 === 0) ? (i % 4) + 1 : (i % 2 === 0 ? 1 : 0);
                return `<div class="heatmap-cell" data-level="${level}" title="Day ${i+1}: ${level > 0 ? level * 2 + ' hrs' : 'Rest day'}"></div>`;
              }).join('')}
            </div>
          </div>
        </div>

      </div>
    `;
  }

  return {
    async init() {
      // Custom listeners if any
    },

    render,

    toggleTask(el) {
      el.classList.toggle('completed');
      const check = el.querySelector('.today-plan-check');
      if (check) {
        check.classList.toggle('checked');
        if (check.classList.contains('checked')) {
          check.textContent = '✓';
          SV.Rewards.awardPoints('DAILY_GOAL_MET', 15);
        } else {
          check.textContent = '';
        }
      }
    },

    addNewTask() {
      const taskName = prompt('Enter new task name for today:');
      if (!taskName) return;
      const list = document.getElementById('dashboard-tasks-list');
      if (!list) return;

      const item = document.createElement('div');
      item.className = 'today-plan-item';
      item.onclick = () => SV.Dashboard.toggleTask(item);
      item.innerHTML = `
        <div class="today-plan-check"></div>
        <div class="today-plan-info">
          <div class="today-plan-task">${taskName}</div>
          <div class="today-plan-meta">Custom Study Target</div>
        </div>
        <div class="today-plan-time">1.0h</div>
      `;
      list.appendChild(item);
      SV.Utils.toast('Task added to today’s study plan!', 'success', 2500);
    },

    openSpinWheel() {
      // Pick random topic from syllabus
      if (!window.CA_FINAL_SYLLABUS) return;
      const allTopics = [];
      window.CA_FINAL_SYLLABUS.groups.forEach(g => {
        g.papers.forEach(p => {
          p.chapters.forEach(c => {
            c.units.forEach(u => {
              u.topics.forEach(t => {
                allTopics.push({ topic: t, paper: p.shortName, chapter: c.name });
              });
            });
          });
        });
      });

      const chosen = SV.Utils.randomItem(allTopics);
      alert(`🎯 Random Topic Selected for Revision:\n\nSubject: ${chosen.paper}\nChapter: ${chosen.chapter}\nTopic: ${chosen.topic}\n\nTime to master this topic!`);
    },

    openCalculator() {
      // Quick standard & CA calculator modal
      const modal = document.createElement('div');
      modal.className = 'modal-backdrop';
      modal.innerHTML = `
        <div class="modal modal-sm">
          <div class="modal-header">
            <h3 class="modal-title">🧮 ICAI Approved Standard Calculator</h3>
            <span class="modal-close" onclick="this.closest('.modal-backdrop').remove()">✕</span>
          </div>
          <div class="modal-body" style="display:flex; justify-content:center;">
            <div class="calculator">
              <div class="calculator-display">
                <div class="calculator-expression" id="calc-expr"></div>
                <div class="calculator-result" id="calc-res">0</div>
              </div>
              <div class="calculator-buttons">
                <button class="calc-btn calc-btn--clear" onclick="SV.Dashboard.calcClear()">C</button>
                <button class="calc-btn" onclick="SV.Dashboard.calcBack()">⌫</button>
                <button class="calc-btn calc-btn--operator" onclick="SV.Dashboard.calcOp('%')">%</button>
                <button class="calc-btn calc-btn--operator" onclick="SV.Dashboard.calcOp('/')">÷</button>
                <button class="calc-btn" onclick="SV.Dashboard.calcNum('7')">7</button>
                <button class="calc-btn" onclick="SV.Dashboard.calcNum('8')">8</button>
                <button class="calc-btn" onclick="SV.Dashboard.calcNum('9')">9</button>
                <button class="calc-btn calc-btn--operator" onclick="SV.Dashboard.calcOp('*')">×</button>
                <button class="calc-btn" onclick="SV.Dashboard.calcNum('4')">4</button>
                <button class="calc-btn" onclick="SV.Dashboard.calcNum('5')">5</button>
                <button class="calc-btn" onclick="SV.Dashboard.calcNum('6')">6</button>
                <button class="calc-btn calc-btn--operator" onclick="SV.Dashboard.calcOp('-')">-</button>
                <button class="calc-btn" onclick="SV.Dashboard.calcNum('1')">1</button>
                <button class="calc-btn" onclick="SV.Dashboard.calcNum('2')">2</button>
                <button class="calc-btn" onclick="SV.Dashboard.calcNum('3')">3</button>
                <button class="calc-btn calc-btn--operator" onclick="SV.Dashboard.calcOp('+')">+</button>
                <button class="calc-btn calc-btn--wide" onclick="SV.Dashboard.calcNum('0')">0</button>
                <button class="calc-btn" onclick="SV.Dashboard.calcNum('.')">.</button>
                <button class="calc-btn calc-btn--equals" onclick="SV.Dashboard.calcEquals()">=</button>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    },

    calcExpr: '',
    calcNum(n) {
      this.calcExpr += n;
      document.getElementById('calc-res').textContent = this.calcExpr;
    },
    calcOp(op) {
      if (!this.calcExpr) return;
      this.calcExpr += ` ${op} `;
      document.getElementById('calc-res').textContent = this.calcExpr;
    },
    calcClear() {
      this.calcExpr = '';
      document.getElementById('calc-res').textContent = '0';
    },
    calcBack() {
      this.calcExpr = this.calcExpr.trim().slice(0, -1);
      document.getElementById('calc-res').textContent = this.calcExpr || '0';
    },
    calcEquals() {
      try {
        const sanitized = this.calcExpr.replace(/×/g, '*').replace(/÷/g, '/');
        // evaluate safely
        const result = Function(`'use strict'; return (${sanitized})`)();
        document.getElementById('calc-res').textContent = result;
        this.calcExpr = String(result);
      } catch {
        document.getElementById('calc-res').textContent = 'Error';
        this.calcExpr = '';
      }
    }
  };
})();
