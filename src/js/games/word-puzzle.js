/**
 * STUDYVERSE – CA Word Puzzle Game
 * word-puzzle.js
 */
window.SV = window.SV || {};

SV.WordPuzzle = (() => {
  const WORDS = [
    { word: 'DEPRECIATION', clue: 'Systematic allocation of the depreciable amount of an asset over useful life.' },
    { word: 'AMORTISATION', clue: 'Systematic write-off of an intangible asset.' },
    { word: 'DERIVATIVE', clue: 'Financial instrument whose value derives from an underlying asset.' },
    { word: 'MATERIALITY', clue: 'Misstatements that could reasonably influence economic decisions of users.' },
    { word: 'ASSESSMENT', clue: 'Determination of tax liability by income tax authorities.' }
  ];

  let currentWordIdx = 0;
  let scrambled = '';

  function scramble(w) {
    const a = w.split('');
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a.join('');
  }

  function renderPuzzle() {
    const item = WORDS[currentWordIdx];
    scrambled = scramble(item.word);
    return `
      <div style="text-align:center; padding:10px;">
        <div style="font-size:12px; color:var(--brand-primary); font-weight:700; margin-bottom:8px;">Clue:</div>
        <p style="font-size:14px; color:var(--text-secondary); line-height:1.4; margin-bottom:20px;">${item.clue}</p>

        <div style="font-size:28px; font-weight:800; letter-spacing:6px; color:var(--brand-primary); margin-bottom:20px; font-family:var(--font-mono);">
          ${scrambled}
        </div>

        <input type="text" id="word-guess-input" class="form-input" placeholder="Type your un-scrambled answer here..."
          style="text-transform:uppercase; text-align:center; font-weight:700; font-size:16px;" onkeypress="if(event.key==='Enter') SV.WordPuzzle.submitGuess()">
      </div>
    `;
  }

  return {
    open() {
      currentWordIdx = Math.floor(Math.random() * WORDS.length);
      const modal = document.createElement('div');
      modal.className = 'modal-backdrop';
      modal.innerHTML = `
        <div class="modal modal-sm">
          <div class="modal-header">
            <h3 class="modal-title">🔤 CA Word Scramble</h3>
            <span class="modal-close" onclick="this.closest('.modal-backdrop').remove()">✕</span>
          </div>
          <div class="modal-body" id="word-puzzle-body">
            ${renderPuzzle()}
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" onclick="SV.WordPuzzle.submitGuess()">Submit Answer</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    },

    submitGuess() {
      const input = document.getElementById('word-guess-input');
      if (!input) return;
      const guess = input.value.trim().toUpperCase();
      const actual = WORDS[currentWordIdx].word;

      if (guess === actual) {
        SV.Rewards.awardPoints('DAILY_GOAL_MET', 15);
        alert(`🎉 Correct! The word was ${actual}! +15 Study Points awarded.`);
        currentWordIdx = (currentWordIdx + 1) % WORDS.length;
        document.getElementById('word-puzzle-body').innerHTML = renderPuzzle();
      } else {
        alert('Not quite right. Try again!');
      }
    }
  };
})();
