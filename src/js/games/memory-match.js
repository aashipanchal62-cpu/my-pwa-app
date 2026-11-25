/**
 * STUDYVERSE – Memory Match Game
 * memory-match.js
 */
window.SV = window.SV || {};

SV.MemoryMatch = (() => {
  const PAIRS = [
    { id: 1, text: 'Ind AS 115', match: 'Revenue' },
    { id: 2, text: 'Ind AS 116', match: 'Leases' },
    { id: 3, text: 'Ind AS 109', match: 'Financial Instruments' },
    { id: 4, text: 'SA 700', match: 'Audit Opinion' },
    { id: 5, text: 'Sec 115BAC', match: 'New Tax Regime' },
    { id: 6, text: 'CARO 2020', match: 'Audit Clauses' }
  ];

  let cards = [];
  let flipped = [];
  let matched = new Set();

  function initCards() {
    cards = [];
    PAIRS.forEach(p => {
      cards.push({ uid: `${p.id}-a`, pairId: p.id, text: p.text });
      cards.push({ uid: `${p.id}-b`, pairId: p.id, text: p.match });
    });
    cards.sort(() => Math.random() - 0.5);
    flipped = [];
    matched.clear();
  }

  function renderGrid() {
    return `
      <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:10px; margin:20px 0;">
        ${cards.map((c, i) => {
          const isFlipped = flipped.includes(i) || matched.has(c.pairId);
          return `
            <div style="height:70px; background:${isFlipped ? 'var(--brand-primary)' : 'var(--bg-surface-2)'}; color:${isFlipped ? 'white' : 'transparent'};
              display:flex; align-items:center; justify-content:center; text-align:center; padding:6px; font-size:12px; font-weight:700; border-radius:8px; cursor:pointer; user-select:none; transition:all 0.2s;"
              onclick="SV.MemoryMatch.flip(${i})">
              ${isFlipped ? c.text : '❓'}
            </div>
          `;
        }).join('')}
      </div>
      <div style="text-align:center; font-size:13px; font-weight:600;">
        Matched: ${matched.size} of ${PAIRS.length} Pairs
      </div>
    `;
  }

  return {
    open() {
      initCards();
      const modal = document.createElement('div');
      modal.className = 'modal-backdrop';
      modal.innerHTML = `
        <div class="modal modal-sm">
          <div class="modal-header">
            <h3 class="modal-title">🃏 CA Memory Match</h3>
            <span class="modal-close" onclick="this.closest('.modal-backdrop').remove()">✕</span>
          </div>
          <div class="modal-body" id="memory-body">
            ${renderGrid()}
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    },

    flip(idx) {
      if (flipped.includes(idx) || matched.has(cards[idx].pairId) || flipped.length >= 2) return;
      flipped.push(idx);
      document.getElementById('memory-body').innerHTML = renderGrid();

      if (flipped.length === 2) {
        const c1 = cards[flipped[0]];
        const c2 = cards[flipped[1]];
        if (c1.pairId === c2.pairId) {
          matched.add(c1.pairId);
          flipped = [];
          document.getElementById('memory-body').innerHTML = renderGrid();
          if (matched.size === PAIRS.length) {
            SV.Rewards.awardPoints('DAILY_GOAL_MET', 25);
            alert('🎉 Outstanding! You matched all CA standards and earned 25 points!');
          }
        } else {
          setTimeout(() => {
            flipped = [];
            const body = document.getElementById('memory-body');
            if (body) body.innerHTML = renderGrid();
          }, 800);
        }
      }
    }
  };
})();
