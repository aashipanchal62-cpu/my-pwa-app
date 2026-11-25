/**
 * STUDYVERSE – Snakes & Ladders (CA Edition)
 * snakes-ladders.js
 */
window.SV = window.SV || {};

SV.SnakesLadders = (() => {
  let playerPos = 1;
  let botPos = 1;
  const ladders = { 4: 14, 9: 31, 20: 38, 28: 84, 40: 59, 51: 67, 63: 81, 71: 91 };
  const snakes = { 17: 7, 54: 34, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 99: 78 };

  function renderGame() {
    return `
      <div style="text-align:center;">
        <div style="display:flex; justify-content:space-around; font-weight:700; margin-bottom:12px;">
          <span style="color:var(--brand-primary);">You: Tile ${playerPos} / 100</span>
          <span style="color:var(--brand-secondary);">Bot: Tile ${botPos} / 100</span>
        </div>

        <div style="width:260px; height:260px; margin:0 auto 16px; border:2px solid var(--border-medium); border-radius:12px; display:grid; grid-template-columns:repeat(10, 1fr); background:var(--bg-surface-2); position:relative; overflow:hidden;">
          ${Array.from({ length: 100 }).map((_, i) => {
            const num = 100 - i;
            const hasPlayer = playerPos === num;
            const hasBot = botPos === num;
            return `
              <div style="font-size:8px; display:flex; align-items:center; justify-content:center; border:0.5px solid rgba(0,0,0,0.05); position:relative; background:${hasPlayer ? '#6C63FF' : (hasBot ? '#FF6584' : '')}; color:${hasPlayer || hasBot ? 'white' : 'var(--text-tertiary)'};">
                ${hasPlayer ? '👤' : (hasBot ? '🤖' : num)}
              </div>
            `;
          }).join('')}
        </div>

        <button class="btn btn-primary" onclick="SV.SnakesLadders.rollDice()" ${playerPos >= 100 ? 'disabled' : ''}>
          🎲 Roll Dice
        </button>
      </div>
    `;
  }

  return {
    open() {
      playerPos = 1;
      botPos = 1;
      const modal = document.createElement('div');
      modal.className = 'modal-backdrop';
      modal.innerHTML = `
        <div class="modal modal-sm">
          <div class="modal-header">
            <h3 class="modal-title">🎲 CA Snakes & Ladders</h3>
            <span class="modal-close" onclick="this.closest('.modal-backdrop').remove()">✕</span>
          </div>
          <div class="modal-body" id="snakes-body">
            ${renderGame()}
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    },

    rollDice() {
      const roll = Math.floor(Math.random() * 6) + 1;
      playerPos += roll;
      if (ladders[playerPos]) {
        SV.Utils.toast(`LADDER! Practiced past RTPs: Climb from ${playerPos} to ${ladders[playerPos]}!`, 'success');
        playerPos = ladders[playerPos];
      } else if (snakes[playerPos]) {
        SV.Utils.toast(`SNAKE! Missed recent amendments: Slid down to ${snakes[playerPos]}!`, 'error');
        playerPos = snakes[playerPos];
      }

      if (playerPos >= 100) {
        playerPos = 100;
        alert('🎉 Congratulations! You reached Tile 100 and Qualified CA Final!');
        SV.Rewards.awardPoints('DAILY_GOAL_MET', 30);
      } else {
        // Bot turn
        const botRoll = Math.floor(Math.random() * 6) + 1;
        botPos += botRoll;
        if (ladders[botPos]) botPos = ladders[botPos];
        else if (snakes[botPos]) botPos = snakes[botPos];
        if (botPos >= 100) botPos = 100;
      }

      document.getElementById('snakes-body').innerHTML = renderGame();
    }
  };
})();
