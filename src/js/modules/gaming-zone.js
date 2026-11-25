/**
 * STUDYVERSE – Gaming Zone Hub Module
 * gaming-zone.js
 */
window.SV = window.SV || {};

SV.GamingZone = (() => {
  const GAMES = [
    { id: 'chess', name: 'Grandmaster Chess vs AI', desc: 'Real PlayStore-style chess with legal moves, castling, pawn promotion, checkmate detection & minimax AI.', icon: '♟️', banner: 'bg-primary' },
    { id: 'ludo', name: 'Ludo Champions (Board Edition)', desc: 'Authentic 15×15 Ludo board with 4 tokens, animated dice rolls, base/path/home mechanics & AI bot.', icon: '🎲', banner: 'bg-surface-2' },
    { id: 'sudoku', name: 'Sudoku Mind Sharpener', desc: 'Classic numbers logic game to reboot your analytical focus during study breaks.', icon: '🔢', banner: 'bg-primary' },
    { id: 'ca-quiz', name: 'Speed CA Quiz Challenge', desc: 'Rapid-fire 60-second trivia on ICAI standards and case laws.', icon: '⚡', banner: 'bg-surface-2' },
    { id: 'memory', name: 'CA Memory Match', desc: 'Match pairs of Ind AS numbers, Audit standards, and Tax sections.', icon: '🃏', banner: 'bg-primary' },
    { id: 'word', name: 'CA Word Scramble', desc: 'Unscramble key accounting and financial terms before time runs out.', icon: '🔤', banner: 'bg-surface-2' },
    { id: 'snakes-ladders', name: 'Snakes & Ladders (CA Edition)', desc: 'Roll the dice, dodge exam traps, and climb the ladders to become a CA!', icon: '🪜', banner: 'bg-primary' },
    { id: 'number-puzzle', name: '15-Tile Number Slider', desc: 'Reorder scrambled tiles from 1 to 15 in minimal moves.', icon: '🧩', banner: 'bg-surface-2' },
  ];

  async function render() {
    return `
      <div class="gaming-container animate-fade-in">

        <div class="page-header">
          <div>
            <h1 class="page-title">Study Break – Gaming Zone</h1>
            <p class="page-subtitle">Recharge Your Brain · 8 Fully Playable Stress-Relief Games · Zero Gambling</p>
          </div>
          <div class="page-actions">
            <span class="badge badge-success">8 Games Ready to Play</span>
          </div>
        </div>

        <div class="games-grid">
          ${GAMES.map(g => `
            <div class="game-card" onclick="SV.GamingZone.openGame('${g.id}')">
              <div class="game-card-banner ${g.banner}">
                ${g.icon}
              </div>
              <div class="game-card-body">
                <div class="game-card-name">${g.name}</div>
                <div class="game-card-desc">${g.desc}</div>
              </div>
              <div class="game-card-footer">
                <span style="font-size:12px; font-weight:600; color:var(--brand-primary);">Play Now →</span>
                <span class="badge badge-muted">Single / Bot</span>
              </div>
            </div>
          `).join('')}
        </div>

      </div>
    `;
  }

  return {
    render,

    openGame(gameId) {
      if (gameId === 'chess' && window.SV.Chess) window.SV.Chess.open();
      else if (gameId === 'ludo' && window.SV.Ludo) window.SV.Ludo.open();
      else if (gameId === 'sudoku' && window.SV.Sudoku) window.SV.Sudoku.open();
      else if (gameId === 'tictactoe' && window.SV.TicTacToe) window.SV.TicTacToe.open();
      else if (gameId === 'memory' && window.SV.MemoryMatch) window.SV.MemoryMatch.open();
      else if (gameId === 'word' && window.SV.WordPuzzle) window.SV.WordPuzzle.open();
      else if (gameId === 'ca-quiz' && window.SV.CAQuiz) window.SV.CAQuiz.open();
      else if (gameId === 'number-puzzle' && window.SV.NumberPuzzle) window.SV.NumberPuzzle.open();
      else if (gameId === 'snakes-ladders' && window.SV.SnakesLadders) window.SV.SnakesLadders.open();
      else alert(`Starting ${gameId}...`);
    }
  };
})();
