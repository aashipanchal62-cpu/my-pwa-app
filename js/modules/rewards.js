/**
 * STUDYVERSE – Rewards & Gamification Module
 * rewards.js
 */
window.SV = window.SV || {};

SV.Rewards = (() => {
  const BADGES = [
    { id: 'first_topic', name: 'First Topic Mastered', desc: 'Completed your very first syllabus topic in the tracker.', icon: '🌱' },
    { id: 'rev_champ', name: 'Revision Champion', desc: 'Completed 10 spaced revision cycles on schedule.', icon: '🔄' },
    { id: 'consistency_star', name: 'Consistency Star', desc: 'Maintained a 7-day continuous study streak.', icon: '⭐' },
    { id: 'mcq_master', name: 'MCQ Master', desc: 'Achieved >80% accuracy in over 50 practice questions.', icon: '🎯' },
    { id: 'mock_achiever', name: 'Mock Test Achiever', desc: 'Completed a full-length 3-hour examination simulation.', icon: '📝' },
    { id: 'group1_done', name: 'Group I Conquered', desc: 'Completed 100% of Papers 1, 2, and 3 syllabus.', icon: '🥇' },
    { id: 'group2_done', name: 'Group II Conquered', desc: 'Completed 100% of Papers 4, 5, and 6 syllabus.', icon: '🏆' },
    { id: 'ca_ready', name: 'CA Final Ready', desc: 'All 6 papers, SPOM modules, and mock tests accomplished!', icon: '🎓' }
  ];

  async function render() {
    const user = SV.Auth.getCurrentUser() || { points: 150, level: 2 };
    const points = user.points || 150;
    const level = Math.floor(points / 200) + 1;
    const nextLevelPoints = level * 200;
    const progressInLevel = points % 200;
    const levelPct = Math.round((progressInLevel / 200) * 100);

    return `
      <div class="rewards-container animate-fade-in">

        <div class="page-header">
          <div>
            <h1 class="page-title">Study Rewards & Milestones</h1>
            <p class="page-subtitle">Gamified Academic Progress · Meaningful Learning Badges · Non-Intrusive Motivation</p>
          </div>
          <div class="page-actions">
            <span class="badge badge-primary">Level ${level} Scholar</span>
          </div>
        </div>

        <!-- Level Card -->
        <div class="card mb-6" style="background:var(--gradient-hero); color:white;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:13px; opacity:0.85;">CURRENT STATUS</div>
              <h2 style="font-size:28px; font-weight:800; margin:4px 0;">Level ${level} CA Scholar</h2>
              <div style="font-size:14px; opacity:0.9;">${points} Total Study Points Earned</div>
            </div>
            <div style="font-size:56px;">🏅</div>
          </div>

          <div style="margin-top:20px;">
            <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:6px;">
              <span>Progress to Level ${level + 1}</span>
              <span>${progressInLevel} / 200 XP</span>
            </div>
            <div class="progress-container progress-lg" style="background:rgba(255,255,255,0.2);">
              <div class="progress-fill" style="width:${levelPct}%; background:white;"></div>
            </div>
          </div>
        </div>

        <!-- Badges Grid -->
        <div class="section">
          <h2 class="section-title mb-4">Achievement Badges Showcase</h2>
          <div class="grid-auto">
            ${BADGES.map((b, idx) => {
              const unlocked = idx <= level;
              return `
                <div class="reward-badge ${unlocked ? '' : 'locked'}">
                  <div class="reward-badge-icon">${b.icon}</div>
                  <div class="reward-badge-name">${b.name}</div>
                  <div class="reward-badge-desc">${b.desc}</div>
                  <span class="badge ${unlocked ? 'badge-success' : 'badge-muted'}" style="margin-top:8px;">
                    ${unlocked ? 'Unlocked ✓' : 'In Progress'}
                  </span>
                </div>
              `;
            }).join('')}
          </div>
        </div>

      </div>
    `;
  }

  return {
    render,

    awardPoints(key, amount) {
      const user = SV.Auth.getCurrentUser();
      if (!user) return;
      user.points = (user.points || 0) + (amount || 10);
      user.level = Math.floor(user.points / 200) + 1;
      SV.Auth.updateProfile({ points: user.points, level: user.level });
    }
  };
})();
