/**
 * STUDYVERSE – CA Speed Quiz Game
 * ca-quiz.js
 */
window.SV = window.SV || {};

SV.CAQuiz = (() => {
  const QUESTIONS = [
    { q: 'Which Ind AS deals with Leases?', a: ['Ind AS 116', 'Ind AS 115', 'Ind AS 109', 'Ind AS 19'], c: 0 },
    { q: 'What is the standard deduction limit under Sec 16(ia) in the New Tax Regime?', a: ['Rs 50,000', 'Rs 75,000', 'Rs 1,00,000', 'Rs 40,000'], c: 1 },
    { q: 'Which Standard on Auditing covers Overall Objectives of the Independent Auditor?', a: ['SA 200', 'SA 700', 'SA 315', 'SA 500'], c: 0 },
    { q: 'In AFM, who developed the Portfolio Theory in 1952?', a: ['Harry Markowitz', 'William Sharpe', 'Fisher Black', 'Myron Scholes'], c: 0 },
    { q: 'Under GST, which Schedule deals with activities treated as supply even without consideration?', a: ['Schedule I', 'Schedule II', 'Schedule III', 'Schedule IV'], c: 0 }
  ];

  let currentIdx = 0;
  let score = 0;

  function renderQ() {
    const q = QUESTIONS[currentIdx];
    return `
      <div>
        <div style="font-size:12px; font-weight:700; color:var(--brand-primary); margin-bottom:6px;">Question ${currentIdx + 1} of ${QUESTIONS.length}</div>
        <h4 style="font-size:15px; font-weight:600; margin-bottom:16px;">${q.q}</h4>
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${q.a.map((opt, i) => `
            <button class="btn btn-secondary justify-start" style="text-align:left; padding:10px 14px;"
              onclick="SV.CAQuiz.answer(${i})">
              ${opt}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  return {
    open() {
      currentIdx = 0;
      score = 0;
      const modal = document.createElement('div');
      modal.className = 'modal-backdrop';
      modal.innerHTML = `
        <div class="modal modal-sm">
          <div class="modal-header">
            <h3 class="modal-title">⚡ Speed CA Quiz Challenge</h3>
            <span class="modal-close" onclick="this.closest('.modal-backdrop').remove()">✕</span>
          </div>
          <div class="modal-body" id="ca-quiz-body">
            ${renderQ()}
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    },

    answer(idx) {
      if (idx === QUESTIONS[currentIdx].c) {
        score++;
      }
      currentIdx++;
      if (currentIdx < QUESTIONS.length) {
        document.getElementById('ca-quiz-body').innerHTML = renderQ();
      } else {
        SV.Rewards.awardPoints('DAILY_GOAL_MET', score * 5);
        document.getElementById('ca-quiz-body').innerHTML = `
          <div style="text-align:center; padding:20px;">
            <div style="font-size:48px; margin-bottom:12px;">🏆</div>
            <h3 style="font-size:20px; font-weight:700; margin-bottom:8px;">Quiz Finished!</h3>
            <p style="font-size:15px; margin-bottom:16px;">You scored <strong>${score} / ${QUESTIONS.length}</strong> points!</p>
            <button class="btn btn-primary" onclick="this.closest('.modal-backdrop').remove()">Done</button>
          </div>
        `;
      }
    }
  };
})();
