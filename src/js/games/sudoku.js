/**
 * STUDYVERSE – Sudoku Game
 * sudoku.js
 */
window.SV = window.SV || {};

SV.Sudoku = (() => {
  // 4x4 mini Sudoku for quick study break
  let solution = [
    [1, 2, 3, 4],
    [3, 4, 1, 2],
    [2, 1, 4, 3],
    [4, 3, 2, 1]
  ];
  let puzzle = [
    [1, 0, 3, 0],
    [0, 4, 0, 2],
    [2, 0, 4, 0],
    [0, 3, 0, 1]
  ];
  let boardState = [];

  function renderBoard() {
    return `
      <div style="display:grid; grid-template-columns: repeat(4, 50px); gap:6px; margin:20px auto; justify-content:center;">
        ${boardState.map((row, r) => row.map((val, c) => {
          const isFixed = puzzle[r][c] !== 0;
          return `
            <input type="number" min="1" max="4" value="${val || ''}"
              style="width:50px; height:50px; text-align:center; font-size:20px; font-weight:700; border:2px solid var(--border-medium); border-radius:6px; background:${isFixed ? 'var(--bg-surface-2)' : 'var(--bg-surface)'};"
              ${isFixed ? 'readonly' : ''} oninput="SV.Sudoku.setCell(${r}, ${c}, this.value)">
          `;
        }).join('')).join('')}
      </div>
      <div style="text-align:center; font-size:12px; color:var(--text-secondary); margin-top:8px;">
        Fill digits 1 to 4 so each row, column, and 2x2 box contains every digit once!
      </div>
    `;
  }

  return {
    open() {
      boardState = JSON.parse(JSON.stringify(puzzle));
      const modal = document.createElement('div');
      modal.className = 'modal-backdrop';
      modal.innerHTML = `
        <div class="modal modal-sm">
          <div class="modal-header">
            <h3 class="modal-title">🔢 Sudoku Mind Sharpener</h3>
            <span class="modal-close" onclick="this.closest('.modal-backdrop').remove()">✕</span>
          </div>
          <div class="modal-body" id="sudoku-body">
            ${renderBoard()}
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="SV.Sudoku.reset()">Reset</button>
            <button class="btn btn-primary" onclick="SV.Sudoku.check()">Check Solution</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    },

    setCell(r, c, val) {
      boardState[r][c] = parseInt(val, 10) || 0;
    },

    reset() {
      boardState = JSON.parse(JSON.stringify(puzzle));
      document.getElementById('sudoku-body').innerHTML = renderBoard();
    },

    check() {
      let isCorrect = true;
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (boardState[r][c] !== solution[r][c]) isCorrect = false;
        }
      }
      if (isCorrect) {
        SV.Rewards.awardPoints('DAILY_GOAL_MET', 20);
        alert('🎉 Correct! You solved the Sudoku puzzle and earned 20 Study Points!');
      } else {
        alert('Some numbers are incorrect. Keep trying!');
      }
    }
  };
})();
