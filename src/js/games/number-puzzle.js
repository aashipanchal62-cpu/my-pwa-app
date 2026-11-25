/**
 * STUDYVERSE – 15 Number Slider Puzzle
 * number-puzzle.js
 */
window.SV = window.SV || {};

SV.NumberPuzzle = (() => {
  let grid = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, null, 15]; // one move away

  function renderGrid() {
    return `
      <div style="display:grid; grid-template-columns: repeat(4, 60px); gap:6px; margin:20px auto; justify-content:center;">
        ${grid.map((num, i) => `
          <button style="width:60px; height:60px; font-size:18px; font-weight:700; border-radius:8px; border:2px solid var(--border-medium);
            background:${num ? 'var(--brand-primary)' : 'transparent'}; color:white; cursor:${num ? 'pointer' : 'default'};"
            onclick="SV.NumberPuzzle.clickTile(${i})" ${!num ? 'disabled' : ''}>
            ${num || ''}
          </button>
        `).join('')}
      </div>
      <div style="text-align:center; font-size:12px; color:var(--text-secondary);">
        Slide tiles to order numbers from 1 to 15!
      </div>
    `;
  }

  return {
    open() {
      const modal = document.createElement('div');
      modal.className = 'modal-backdrop';
      modal.innerHTML = `
        <div class="modal modal-sm">
          <div class="modal-header">
            <h3 class="modal-title">🧩 15-Tile Number Slider</h3>
            <span class="modal-close" onclick="this.closest('.modal-backdrop').remove()">✕</span>
          </div>
          <div class="modal-body" id="number-puzzle-body">
            ${renderGrid()}
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="SV.NumberPuzzle.shuffle()">Shuffle</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    },

    clickTile(idx) {
      const nullIdx = grid.indexOf(null);
      const validMoves = [nullIdx - 1, nullIdx + 1, nullIdx - 4, nullIdx + 4];
      if (validMoves.includes(idx)) {
        grid[nullIdx] = grid[idx];
        grid[idx] = null;
        document.getElementById('number-puzzle-body').innerHTML = renderGrid();
        // Check win
        let won = true;
        for (let i = 0; i < 15; i++) {
          if (grid[i] !== i + 1) won = false;
        }
        if (won) {
          SV.Rewards.awardPoints('DAILY_GOAL_MET', 20);
          alert('🎉 Puzzle Solved! +20 Study Points earned!');
        }
      }
    },

    shuffle() {
      for (let i = 0; i < 30; i++) {
        const nullIdx = grid.indexOf(null);
        const validMoves = [nullIdx - 1, nullIdx + 1, nullIdx - 4, nullIdx + 4].filter(m => m >= 0 && m < 16);
        const randMove = SV.Utils.randomItem(validMoves);
        grid[nullIdx] = grid[randMove];
        grid[randMove] = null;
      }
      document.getElementById('number-puzzle-body').innerHTML = renderGrid();
    }
  };
})();
