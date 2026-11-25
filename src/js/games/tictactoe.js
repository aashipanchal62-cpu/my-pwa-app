/**
 * STUDYVERSE – Tic-Tac-Toe Game
 * tictactoe.js
 */
window.SV = window.SV || {};

SV.TicTacToe = (() => {
  let board = Array(9).fill(null);
  let human = 'X';
  let bot = 'O';
  let winner = null;

  function checkWin(b) {
    const lines = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];
    for (let l of lines) {
      if (b[l[0]] && b[l[0]] === b[l[1]] && b[l[0]] === b[l[2]]) return b[l[0]];
    }
    if (b.every(c => c !== null)) return 'Draw';
    return null;
  }

  function renderGrid() {
    return `
      <div style="display:grid; grid-template-columns: repeat(3, 80px); gap:8px; margin:20px auto; justify-content:center;">
        ${board.map((cell, idx) => `
          <button style="width:80px; height:80px; font-size:32px; font-weight:800; border-radius:10px; border:2px solid var(--border-medium); background:var(--bg-surface); cursor:pointer;"
            onclick="SV.TicTacToe.makeMove(${idx})" ${cell || winner ? 'disabled' : ''}>
            ${cell || ''}
          </button>
        `).join('')}
      </div>
      <div style="text-align:center; font-weight:700; margin-top:12px; font-size:16px;">
        ${winner ? (winner === 'Draw' ? 'Match Tied!' : `Winner: ${winner}!`) : 'Your Turn (X)'}
      </div>
    `;
  }

  return {
    open() {
      board = Array(9).fill(null);
      winner = null;

      const modal = document.createElement('div');
      modal.className = 'modal-backdrop';
      modal.id = 'ttt-modal';
      modal.innerHTML = `
        <div class="modal modal-sm">
          <div class="modal-header">
            <h3 class="modal-title">❌ Tic-Tac-Toe vs Bot</h3>
            <span class="modal-close" onclick="this.closest('.modal-backdrop').remove()">✕</span>
          </div>
          <div class="modal-body" id="ttt-body">
            ${renderGrid()}
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="SV.TicTacToe.reset()">Play Again</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    },

    makeMove(idx) {
      if (board[idx] || winner) return;
      board[idx] = human;
      winner = checkWin(board);

      if (!winner) {
        // Bot move
        const emptyIndices = board.map((v, i) => v === null ? i : null).filter(v => v !== null);
        if (emptyIndices.length > 0) {
          const botChoice = SV.Utils.randomItem(emptyIndices);
          board[botChoice] = bot;
          winner = checkWin(board);
        }
      }

      document.getElementById('ttt-body').innerHTML = renderGrid();
    },

    reset() {
      board = Array(9).fill(null);
      winner = null;
      document.getElementById('ttt-body').innerHTML = renderGrid();
    }
  };
})();
