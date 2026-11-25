/**
 * STUDYVERSE – Full Ludo Game
 * Real board with 4 colored tokens, dice animation, capture mechanic
 * 2-player mode: Red (Human) vs Blue (Bot)
 */
window.SV = window.SV || {};

SV.Ludo = (() => {
  // ── Ludo board path ─────────────────────────────────────────────────────
  // Standard Ludo uses a 15×15 board. Main path = 52 squares (0-51).
  // Each color has a home column of 5 squares (52-56) and a base of 4 tokens.
  // Tokens start at "base" (-1 = not yet entered) and need a 6 to enter.
  // Colors: RED (0), GREEN (1), YELLOW (2), BLUE (3)

  const COLORS = ['red', 'green', 'yellow', 'blue'];
  const COLOR_HEX  = { red: '#EF4444', green: '#22C55E', yellow: '#EAB308', blue: '#3B82F6' };
  const COLOR_DARK = { red: '#B91C1C', green: '#15803D', yellow: '#A16207', blue: '#1D4ED8' };
  const TOKEN_EMOJI = { red: '🔴', green: '🟢', yellow: '🟡', blue: '🔵' };

  // Entry squares (where token enters the main path when 6 is rolled)
  const ENTRY_SQUARE = { red: 0, green: 13, yellow: 26, blue: 39 };
  // Safe squares on main path
  const SAFE_SQUARES = new Set([0, 8, 13, 21, 26, 34, 39, 47]);
  // Home column start (after index 51, token enters color-specific home column)
  const HOME_COL_ENTRY = { red: 51, green: 12, yellow: 25, blue: 38 };
  // After main path position HOME_COL_ENTRY[color], token moves to home col 52–56

  let gameState = null;

  function initGame() {
    gameState = {
      tokens: {
        red:    [{ pos: -1 }, { pos: -1 }, { pos: -1 }, { pos: -1 }],
        green:  [{ pos: -1 }, { pos: -1 }, { pos: -1 }, { pos: -1 }],
        yellow: [{ pos: -1 }, { pos: -1 }, { pos: -1 }, { pos: -1 }],
        blue:   [{ pos: -1 }, { pos: -1 }, { pos: -1 }, { pos: -1 }],
      },
      currentPlayer: 'red',      // Red = Human
      dice: null,
      diceRolled: false,
      selectedToken: -1,
      status: 'roll',            // 'roll' | 'move' | 'gameover'
      winner: null,
      extraTurn: false,          // extra turn on 6
      message: "Your turn! Roll the dice.",
      moveHistory: [],
      humanColor: 'red',
      botColor:   'blue',
    };
  }

  // Convert logical position to board coordinates (for display)
  // pos -1 = base, 0-51 = main path, 52-56 = home column
  function mainPathCoords() {
    // 15×15 board; path goes clockwise starting from bottom-left after red base
    // We define the 52 path squares as [col, row] in a 15×15 grid (0-indexed)
    return [
      // Bottom row (left → right, row 14 to row 8 going up on col 6)
      [6,14],[6,13],[6,12],[6,11],[6,10],[6,9],      // 0-5  (red entry = 0)
      [6,8],                                          // 6
      [5,8],[4,8],[3,8],[2,8],[1,8],[0,8],            // 7-12
      [0,7],                                          // 13 (green entry)
      [0,6],[1,6],[2,6],[3,6],[4,6],[5,6],            // 14-19
      [6,6],                                          // 20
      [6,5],[6,4],[6,3],[6,2],[6,1],[6,0],            // 21-26 (yellow entry = 26)
      [7,0],                                          // 27
      [8,0],[8,1],[8,2],[8,3],[8,4],[8,5],            // 28-33
      [8,6],                                          // 34
      [9,6],[10,6],[11,6],[12,6],[13,6],[14,6],       // 35-40
      [14,7],                                         // 41
      [14,8],[13,8],[12,8],[11,8],[10,8],[9,8],       // 42-47
      [8,8],                                          // 48
      [8,9],[8,10],[8,11],[8,12],[8,13],[8,14],       // 49-54 — wait, only 52 squares
    ].slice(0, 52);
  }

  const PATH = mainPathCoords();

  // Home column coords for each color (squares 52-56)
  const HOME_COLS = {
    red:    [[7,13],[7,12],[7,11],[7,10],[7,9],[7,8]],   // 52-57
    green:  [[1,7],[2,7],[3,7],[4,7],[5,7],[6,7]],
    yellow: [[7,1],[7,2],[7,3],[7,4],[7,5],[7,6]],
    blue:   [[13,7],[12,7],[11,7],[10,7],[9,7],[8,7]],
  };

  // Base positions for tokens not yet entered (shown in colored base area)
  const BASE_POSITIONS = {
    red:    [[1,13],[3,13],[1,11],[3,11]],
    green:  [[11,1],[13,1],[11,3],[13,3]],
    yellow: [[11,11],[13,11],[11,13],[13,13]],
    blue:   [[1,1],[3,1],[1,3],[3,3]],
  };

  function getTokenCoords(color, token) {
    if (token.pos === -1) {
      // In base
      const idx = gameState.tokens[color].indexOf(token);
      return BASE_POSITIONS[color][idx];
    }
    if (token.pos >= 52) {
      // Home column
      const homeIdx = token.pos - 52;
      return HOME_COLS[color][homeIdx] || HOME_COLS[color][HOME_COLS[color].length - 1];
    }
    return PATH[token.pos % 52];
  }

  function rollDice() {
    return Math.floor(Math.random() * 6) + 1;
  }

  // Convert position relative to a color's perspective
  function relPos(color, absPos) {
    const entry = ENTRY_SQUARE[color];
    if (absPos < 0) return -1;
    return (absPos - entry + 52) % 52;
  }

  // Advance token on main path
  function moveToken(color, tokenIdx, steps) {
    const token = gameState.tokens[color][tokenIdx];
    if (token.pos === -1) {
      if (steps === 6) {
        token.pos = ENTRY_SQUARE[color];
        return { captured: checkCapture(color, tokenIdx) };
      }
      return { captured: false };
    }

    // Check if token is on home col
    if (token.pos >= 52) {
      const newHomePos = token.pos + steps;
      if (newHomePos <= 57) {   // 52+5 = 57 max
        token.pos = newHomePos;
      }
      return { captured: false };
    }

    // On main path
    const homeColEntry = HOME_COL_ENTRY[color];
    const curAbs = token.pos;
    const curRel = relPos(color, curAbs);
    const newRel = curRel + steps;

    if (newRel >= 50) {
      // Enter home column
      const homeStep = newRel - 50;   // 0=first home col sq
      token.pos = 52 + homeStep;
      return { captured: false };
    } else {
      const newAbs = (curAbs + steps) % 52;
      token.pos = newAbs;
      return { captured: checkCapture(color, tokenIdx) };
    }
  }

  function checkCapture(color, tokenIdx) {
    const myToken = gameState.tokens[color][tokenIdx];
    if (myToken.pos < 0 || myToken.pos >= 52) return false;
    if (SAFE_SQUARES.has(myToken.pos)) return false;

    let captured = false;
    COLORS.forEach(c => {
      if (c === color) return;
      gameState.tokens[c].forEach(t => {
        if (t.pos === myToken.pos) {
          t.pos = -1;    // Send back to base
          captured = true;
        }
      });
    });
    return captured;
  }

  function checkWin(color) {
    return gameState.tokens[color].every(t => t.pos >= 57);
  }

  function getMovableTokens(color, dice) {
    return gameState.tokens[color].map((t, i) => {
      if (t.pos === -1 && dice === 6) return i;
      if (t.pos === -1) return -1;
      if (t.pos >= 52) {
        // In home col — can move if won't overshoot
        if (t.pos + dice <= 57) return i;
        return -1;
      }
      // On main path — always movable
      return i;
    }).filter(i => i >= 0);
  }

  // ── Bot AI ───────────────────────────────────────────────────────────────
  function botMove(dice) {
    const movable = getMovableTokens(gameState.botColor, dice);
    if (movable.length === 0) return;

    // Priority: capture > enter home > enter base > advance
    let chosen = movable[0];
    // Simple heuristic — pick token closest to home
    movable.forEach(idx => {
      const t = gameState.tokens[gameState.botColor][idx];
      const chosenT = gameState.tokens[gameState.botColor][chosen];
      const tRel = t.pos < 0 ? -1 : (t.pos >= 52 ? 60 + t.pos : relPos(gameState.botColor, t.pos));
      const cRel = chosenT.pos < 0 ? -1 : (chosenT.pos >= 52 ? 60 + chosenT.pos : relPos(gameState.botColor, chosenT.pos));
      if (tRel > cRel) chosen = idx;
    });

    moveToken(gameState.botColor, chosen, dice);
    if (checkWin(gameState.botColor)) {
      gameState.status = 'gameover';
      gameState.winner = gameState.botColor;
      gameState.message = `🤖 Blue Bot wins! Better luck next time.`;
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────
  function renderModal() {
    const existing = document.getElementById('ludo-modal-backdrop');
    if (existing) existing.remove();

    const backdrop = document.createElement('div');
    backdrop.id = 'ludo-modal-backdrop';
    backdrop.style.cssText = `
      position:fixed; inset:0; background:rgba(0,0,0,0.85);
      display:flex; align-items:center; justify-content:center;
      z-index:9999; overflow:auto; padding:16px;
    `;
    backdrop.innerHTML = `
      <div style="background:var(--bg-surface,#1a1a2e); border-radius:20px; padding:24px;
                  max-width:600px; width:100%; box-shadow:0 20px 60px rgba(0,0,0,0.5);
                  font-family:Inter,sans-serif;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <h2 style="margin:0; font-size:1.4rem; color:var(--text-primary,#fff);">🎲 Ludo Champions</h2>
          <button onclick="document.getElementById('ludo-modal-backdrop').remove()"
                  style="background:none; border:none; font-size:24px; cursor:pointer; color:#aaa; line-height:1;">✕</button>
        </div>

        <div style="display:flex; gap:16px; flex-wrap:wrap;">
          <!-- Board -->
          <div id="ludo-board-wrap" style="flex:1; min-width:280px;">
            ${renderBoard()}
          </div>

          <!-- Panel -->
          <div style="width:160px; display:flex; flex-direction:column; gap:12px;">
            <div id="ludo-msg" style="background:#2d2d4e; border-radius:10px; padding:12px;
                 font-size:0.8rem; color:#ccc; min-height:60px; line-height:1.5;">
              ${gameState.message}
            </div>

            <div style="font-size:0.75rem; color:#888; font-weight:600;">DICE</div>
            <div id="ludo-dice-display" style="font-size:3rem; text-align:center; line-height:1;">
              ${gameState.dice ? diceFace(gameState.dice) : '🎲'}
            </div>

            ${gameState.status === 'roll' ? `
            <button onclick="SV.Ludo.handleRoll()"
                    style="background:linear-gradient(135deg,#6C63FF,#8B5CF6); color:#fff;
                           border:none; border-radius:10px; padding:12px; font-size:0.9rem;
                           font-weight:700; cursor:pointer; transition:transform 0.1s;"
                    onmousedown="this.style.transform='scale(0.95)'"
                    onmouseup="this.style.transform='scale(1)'">
              🎲 Roll Dice
            </button>
            ` : ''}

            ${gameState.status === 'gameover' ? `
            <button onclick="SV.Ludo.newGame()"
                    style="background:linear-gradient(135deg,#22C55E,#16A34A); color:#fff;
                           border:none; border-radius:10px; padding:12px; font-size:0.9rem;
                           font-weight:700; cursor:pointer;">
              🔄 New Game
            </button>
            ` : ''}

            <!-- Tokens status -->
            <div style="font-size:0.75rem; color:#888; font-weight:600; margin-top:4px;">TOKENS</div>
            ${COLORS.map(c => `
              <div style="display:flex; align-items:center; gap:6px;">
                <span style="color:${COLOR_HEX[c]}; font-size:1rem;">${TOKEN_EMOJI[c]}</span>
                <span style="font-size:0.7rem; color:#ccc;">${c.toUpperCase()}: ${
                  gameState.tokens[c].filter(t => t.pos >= 57).length}/4 home</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);
    attachTokenClickHandlers();
  }

  function diceFace(n) {
    const faces = ['⚀','⚁','⚂','⚃','⚄','⚅'];
    return `<span style="font-size:3rem;">${faces[n-1]}</span>`;
  }

  function renderBoard() {
    const CELL = 28;  // px per cell
    const SIZE = 15 * CELL;
    // Build a grid representation
    // Colors of base zones: red=bottom-left, green=top-left, yellow=top-right, blue=bottom-right (wait — standard ludo)
    // Standard: Red=bottom-left, Green=top-left, Yellow=top-right, Blue=bottom-right
    // We simplify rendering with an SVG board

    let svgTokens = '';
    COLORS.forEach(color => {
      gameState.tokens[color].forEach((token, i) => {
        const [col, row] = getTokenCoords(color, token);
        const cx = col * CELL + CELL / 2;
        const cy = row * CELL + CELL / 2;
        const isMovable = gameState.status === 'move' &&
                          gameState.currentPlayer === color &&
                          color === gameState.humanColor &&
                          getMovableTokens(color, gameState.dice).includes(i);
        const sel = gameState.selectedToken === i && gameState.currentPlayer === color;
        svgTokens += `
          <circle cx="${cx}" cy="${cy}" r="${CELL*0.38}"
                  fill="${COLOR_HEX[color]}" stroke="${sel ? '#fff' : COLOR_DARK[color]}"
                  stroke-width="${sel ? 3 : 1.5}"
                  id="ludo-token-${color}-${i}"
                  style="cursor:${isMovable ? 'pointer' : 'default'}; filter:${isMovable ? 'drop-shadow(0 0 6px '+COLOR_HEX[color]+')' : 'none'};"
                  ${isMovable ? `onclick="SV.Ludo.selectToken('${color}', ${i})"` : ''}>
          </circle>
          <text x="${cx}" y="${cy+1}" font-size="${CELL*0.4}" text-anchor="middle" dominant-baseline="middle"
                fill="white" font-weight="800" pointer-events="none">${i+1}</text>
        `;
      });
    });

    return `
      <svg width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}"
           style="border-radius:12px; max-width:100%; height:auto; display:block; margin:0 auto;">

        <!-- Background -->
        <rect width="${SIZE}" height="${SIZE}" fill="#f0ede8" rx="8"/>

        <!-- Base zones -->
        <!-- RED base (bottom-left) rows 9-15, cols 0-6 → 9*CELL to 15*CELL -->
        <rect x="0" y="${9*CELL}" width="${6*CELL}" height="${6*CELL}" fill="#FECACA" rx="4"/>
        <!-- GREEN base (top-left) -->
        <rect x="0" y="0" width="${6*CELL}" height="${6*CELL}" fill="#BBF7D0" rx="4"/>
        <!-- YELLOW base (top-right) -->
        <rect x="${9*CELL}" y="0" width="${6*CELL}" height="${6*CELL}" fill="#FEF08A" rx="4"/>
        <!-- BLUE base (bottom-right) -->
        <rect x="${9*CELL}" y="${9*CELL}" width="${6*CELL}" height="${6*CELL}" fill="#BFDBFE" rx="4"/>

        <!-- Home center -->
        <polygon points="${7.5*CELL},${7*CELL} ${8*CELL},${7.5*CELL} ${7.5*CELL},${8*CELL} ${7*CELL},${7.5*CELL}"
                 fill="#6C63FF"/>

        <!-- Safe squares highlight -->
        ${Array.from(SAFE_SQUARES).map(sq => {
          if (sq >= PATH.length) return '';
          const [c, r] = PATH[sq];
          return `<rect x="${c*CELL+1}" y="${r*CELL+1}" width="${CELL-2}" height="${CELL-2}"
                        fill="#A7F3D0" rx="3"/>`;
        }).join('')}

        <!-- Home column coloring -->
        ${HOME_COLS.red.slice(0,5).map(([c,r]) => `<rect x="${c*CELL}" y="${r*CELL}" width="${CELL}" height="${CELL}" fill="#FCA5A5"/>`).join('')}
        ${HOME_COLS.green.slice(0,5).map(([c,r]) => `<rect x="${c*CELL}" y="${r*CELL}" width="${CELL}" height="${CELL}" fill="#86EFAC"/>`).join('')}
        ${HOME_COLS.yellow.slice(0,5).map(([c,r]) => `<rect x="${c*CELL}" y="${r*CELL}" width="${CELL}" height="${CELL}" fill="#FDE047"/>`).join('')}
        ${HOME_COLS.blue.slice(0,5).map(([c,r]) => `<rect x="${c*CELL}" y="${r*CELL}" width="${CELL}" height="${CELL}" fill="#93C5FD"/>`).join('')}

        <!-- Grid lines -->
        ${Array.from({length:16},(_,i) => `<line x1="${i*CELL}" y1="0" x2="${i*CELL}" y2="${SIZE}" stroke="#ccc" stroke-width="0.5"/>`).join('')}
        ${Array.from({length:16},(_,i) => `<line x1="0" y1="${i*CELL}" x2="${SIZE}" y2="${i*CELL}" stroke="#ccc" stroke-width="0.5"/>`).join('')}

        <!-- Path squares -->
        ${PATH.map(([c,r], i) => `<rect x="${c*CELL+0.5}" y="${r*CELL+0.5}" width="${CELL-1}" height="${CELL-1}" fill="${SAFE_SQUARES.has(i)?'#A7F3D0':'#fff'}" rx="2"/>`).join('')}

        <!-- Tokens -->
        ${svgTokens}
      </svg>
    `;
  }

  function attachTokenClickHandlers() {
    // Already handled inline in SVG
  }

  function updateBoard() {
    const wrap = document.getElementById('ludo-board-wrap');
    const msg  = document.getElementById('ludo-msg');
    const dice = document.getElementById('ludo-dice-display');
    if (wrap) wrap.innerHTML = renderBoard();
    if (msg)  msg.textContent = gameState.message;
    if (dice) dice.innerHTML  = gameState.dice ? diceFace(gameState.dice) : '🎲';

    // Update roll button visibility
    const backdrop = document.getElementById('ludo-modal-backdrop');
    if (!backdrop) return;
    // Re-render the whole panel to update button
    renderModal();
  }

  // ── Public API ────────────────────────────────────────────────────────────
  return {
    open() {
      initGame();
      renderModal();
    },

    newGame() {
      initGame();
      renderModal();
    },

    handleRoll() {
      if (gameState.status !== 'roll') return;
      const dice = rollDice();
      gameState.dice = dice;
      gameState.diceRolled = true;

      // Animate dice briefly
      let frames = 0;
      const diceEl = document.getElementById('ludo-dice-display');
      const anim = setInterval(() => {
        if (diceEl) diceEl.innerHTML = diceFace(Math.ceil(Math.random()*6));
        frames++;
        if (frames >= 8) {
          clearInterval(anim);
          if (diceEl) diceEl.innerHTML = diceFace(dice);
          this.afterRoll(dice);
        }
      }, 80);
    },

    afterRoll(dice) {
      const color = gameState.currentPlayer;
      const movable = getMovableTokens(color, dice);

      if (movable.length === 0) {
        gameState.message = `Rolled ${dice} — no moves available. Turn passes.`;
        this.endTurn(dice);
        return;
      }

      if (color === gameState.humanColor) {
        gameState.status = 'move';
        gameState.message = `Rolled ${dice}! Click a glowing token to move it.`;
        updateBoard();
      } else {
        // Bot moves automatically
        setTimeout(() => {
          botMove(dice);
          if (gameState.status !== 'gameover') {
            this.endTurn(dice);
          } else {
            updateBoard();
          }
        }, 600);
      }
    },

    selectToken(color, tokenIdx) {
      if (gameState.status !== 'move') return;
      if (color !== gameState.humanColor) return;
      const movable = getMovableTokens(color, gameState.dice);
      if (!movable.includes(tokenIdx)) return;

      const result = moveToken(color, tokenIdx, gameState.dice);

      if (checkWin(color)) {
        gameState.status = 'gameover';
        gameState.winner = color;
        gameState.message = `🏆 You won! Congratulations!`;
        SV.Rewards && SV.Rewards.awardPoints('DAILY_GOAL_MET', 50);
        updateBoard();
        return;
      }

      const captureMsg = result.captured ? ' — Captured an opponent token! 🎉' : '';
      const extraTurn  = gameState.dice === 6 || result.captured;
      gameState.message = extraTurn
        ? `Moved! You get an extra turn!${captureMsg}`
        : `Moved!${captureMsg} Now Blue Bot's turn...`;

      this.endTurn(gameState.dice, extraTurn);
    },

    endTurn(dice, extraTurn = (dice === 6)) {
      if (gameState.status === 'gameover') { updateBoard(); return; }

      if (!extraTurn) {
        // Switch player
        const idx = COLORS.indexOf(gameState.currentPlayer);
        // Only 2 active players: red and blue
        gameState.currentPlayer = gameState.currentPlayer === gameState.humanColor
          ? gameState.botColor : gameState.humanColor;
      }

      gameState.status = 'roll';
      gameState.dice = null;
      gameState.selectedToken = -1;

      if (gameState.currentPlayer === gameState.humanColor) {
        gameState.message = extraTurn ? `Bonus turn! Roll again.` : `Your turn! Roll the dice.`;
        updateBoard();
      } else {
        gameState.message = `Blue Bot is thinking...`;
        updateBoard();
        // Auto-roll for bot
        setTimeout(() => { this.handleRoll(); }, 900);
      }
    }
  };
})();
