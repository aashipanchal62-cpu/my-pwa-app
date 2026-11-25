/**
 * STUDYVERSE – Full Chess Game
 * Real piece movement, legal moves, castling, en passant, pawn promotion,
 * check/checkmate detection, and a minimax AI opponent.
 */
window.SV = window.SV || {};

SV.Chess = (() => {
  // ── Piece constants ───────────────────────────────────────────────────────
  const EMPTY = 0;
  const PAWN = 1, KNIGHT = 2, BISHOP = 3, ROOK = 4, QUEEN = 5, KING = 6;
  const WHITE = 1, BLACK = -1;

  // Unicode symbols
  const SYMBOLS = {
    [WHITE * KING]:   '♔', [WHITE * QUEEN]:  '♕', [WHITE * ROOK]:   '♖',
    [WHITE * BISHOP]: '♗', [WHITE * KNIGHT]: '♘', [WHITE * PAWN]:   '♙',
    [BLACK * KING]:   '♚', [BLACK * QUEEN]:  '♛', [BLACK * ROOK]:   '♜',
    [BLACK * BISHOP]: '♝', [BLACK * KNIGHT]: '♞', [BLACK * PAWN]:   '♟',
  };

  // Piece values for AI
  const PIECE_VALUE = { [PAWN]: 100, [KNIGHT]: 320, [BISHOP]: 330, [ROOK]: 500, [QUEEN]: 900, [KING]: 20000 };

  let state = null;

  function initBoard() {
    // 8×8 array: positive = white, negative = black
    const b = Array.from({length:8}, () => Array(8).fill(0));
    // Back ranks
    const backRank = [ROOK, KNIGHT, BISHOP, QUEEN, KING, BISHOP, KNIGHT, ROOK];
    for (let c = 0; c < 8; c++) {
      b[0][c] =  BLACK * backRank[c];  // row 0 = rank 8 (black)
      b[1][c] =  BLACK * PAWN;
      b[6][c] =  WHITE * PAWN;
      b[7][c] =  WHITE * backRank[c];
    }
    return b;
  }

  function newGame() {
    state = {
      board: initBoard(),
      turn: WHITE,              // Human = White
      selected: null,           // { r, c }
      legalMoves: [],           // [{r,c}] for selected piece
      status: 'playing',        // 'playing' | 'check' | 'checkmate' | 'stalemate' | 'draw'
      message: "Your turn! You play White ♔",
      enPassant: null,          // {r, c} target square
      castling: { W: {K: true, Q: true}, B: {K: true, Q: true} },
      halfMoves: 0,
      fullMoves: 1,
      promotion: null,          // pending promotion
      moveHistory: [],
      capturedW: [],
      capturedB: [],
    };
  }

  // ── Move generation ────────────────────────────────────────────────────────
  function inBounds(r, c) { return r >= 0 && r < 8 && c >= 0 && c < 8; }
  function pieceColor(val) { return val > 0 ? WHITE : val < 0 ? BLACK : 0; }
  function pieceType(val)  { return Math.abs(val); }

  function getRawMoves(board, r, c, enPassant, castling) {
    const piece = board[r][c];
    if (!piece) return [];
    const color = pieceColor(piece);
    const type  = pieceType(piece);
    const moves = [];
    const opp   = -color;

    const addSlide = (dr, dc) => {
      let nr = r + dr, nc = c + dc;
      while (inBounds(nr, nc)) {
        if (!board[nr][nc]) { moves.push({r: nr, c: nc}); }
        else {
          if (pieceColor(board[nr][nc]) === opp) moves.push({r: nr, c: nc});
          break;
        }
        nr += dr; nc += dc;
      }
    };

    if (type === PAWN) {
      const dir = color === WHITE ? -1 : 1;  // White moves up (decreasing row)
      const startRow = color === WHITE ? 6 : 1;
      // Forward
      if (inBounds(r+dir, c) && !board[r+dir][c]) {
        moves.push({r: r+dir, c});
        if (r === startRow && !board[r+2*dir][c]) moves.push({r: r+2*dir, c});
      }
      // Captures
      [-1,1].forEach(dc => {
        const nr = r+dir, nc = c+dc;
        if (!inBounds(nr, nc)) return;
        if (board[nr][nc] && pieceColor(board[nr][nc]) === opp) moves.push({r:nr, c:nc});
        // En passant
        if (enPassant && nr === enPassant.r && nc === enPassant.c) moves.push({r:nr, c:nc, ep: true});
      });
    }

    if (type === KNIGHT) {
      [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].forEach(([dr,dc]) => {
        const nr = r+dr, nc = c+dc;
        if (inBounds(nr,nc) && pieceColor(board[nr][nc]) !== color) moves.push({r:nr,c:nc});
      });
    }

    if (type === BISHOP || type === QUEEN) {
      [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([dr,dc]) => addSlide(dr,dc));
    }

    if (type === ROOK || type === QUEEN) {
      [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr,dc]) => addSlide(dr,dc));
    }

    if (type === KING) {
      [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(([dr,dc]) => {
        const nr = r+dr, nc = c+dc;
        if (inBounds(nr,nc) && pieceColor(board[nr][nc]) !== color) moves.push({r:nr,c:nc});
      });
      // Castling
      const row = color === WHITE ? 7 : 0;
      if (r === row && c === 4 && castling) {
        const side = color === WHITE ? 'W' : 'B';
        if (castling[side].K && !board[row][5] && !board[row][6] &&
            pieceType(board[row][7]) === ROOK && pieceColor(board[row][7]) === color) {
          moves.push({r: row, c: 6, castle: 'K'});
        }
        if (castling[side].Q && !board[row][3] && !board[row][2] && !board[row][1] &&
            pieceType(board[row][0]) === ROOK && pieceColor(board[row][0]) === color) {
          moves.push({r: row, c: 2, castle: 'Q'});
        }
      }
    }

    return moves;
  }

  function copyBoard(board) { return board.map(row => [...row]); }

  function applyMove(board, from, to, enPassant, castling, promoteTo = QUEEN) {
    const nb = copyBoard(board);
    const piece = nb[from.r][from.c];
    const color = pieceColor(piece);
    const type  = pieceType(piece);
    const newCastling = {
      W: {...castling.W},
      B: {...castling.B},
    };
    let newEP = null;
    let captured = 0;

    // En passant capture
    if (to.ep) {
      const captureRow = from.r;
      captured = nb[captureRow][to.c];
      nb[captureRow][to.c] = 0;
    } else {
      captured = nb[to.r][to.c];
    }

    nb[to.r][to.c] = piece;
    nb[from.r][from.c] = 0;

    // Castling rook move
    if (type === KING) {
      const side = color === WHITE ? 'W' : 'B';
      newCastling[side].K = false;
      newCastling[side].Q = false;
      if (to.castle === 'K') { nb[from.r][5] = nb[from.r][7]; nb[from.r][7] = 0; }
      if (to.castle === 'Q') { nb[from.r][3] = nb[from.r][0]; nb[from.r][0] = 0; }
    }

    // Update castling rights for rooks
    if (type === ROOK) {
      if (from.r === 7 && from.c === 7) newCastling.W.K = false;
      if (from.r === 7 && from.c === 0) newCastling.W.Q = false;
      if (from.r === 0 && from.c === 7) newCastling.B.K = false;
      if (from.r === 0 && from.c === 0) newCastling.B.Q = false;
    }

    // Pawn double push — set en passant
    if (type === PAWN && Math.abs(to.r - from.r) === 2) {
      newEP = { r: (from.r + to.r) / 2, c: from.c };
    }

    // Pawn promotion
    if (type === PAWN && (to.r === 0 || to.r === 7)) {
      nb[to.r][to.c] = color * promoteTo;
    }

    return { board: nb, enPassant: newEP, castling: newCastling, captured };
  }

  function findKing(board, color) {
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++)
        if (board[r][c] === color * KING) return {r, c};
    return null;
  }

  function isSquareAttacked(board, r, c, byColor) {
    // Check if square (r,c) is attacked by byColor
    for (let fr = 0; fr < 8; fr++) {
      for (let fc = 0; fc < 8; fc++) {
        const piece = board[fr][fc];
        if (pieceColor(piece) !== byColor) continue;
        const moves = getRawMoves(board, fr, fc, null, null);
        if (moves.some(m => m.r === r && m.c === c)) return true;
      }
    }
    return false;
  }

  function isInCheck(board, color) {
    const king = findKing(board, color);
    if (!king) return false;
    return isSquareAttacked(board, king.r, king.c, -color);
  }

  function getLegalMoves(board, r, c, enPassant, castling) {
    const piece = board[r][c];
    if (!piece) return [];
    const color = pieceColor(piece);
    const raw = getRawMoves(board, r, c, enPassant, castling);
    const legal = [];

    for (const move of raw) {
      // For castling, also check that king doesn't pass through check
      if (move.castle) {
        const colStep = move.castle === 'K' ? 1 : -1;
        // King must not be in check at start, intermediate, or destination
        const startInCheck = isInCheck(board, color);
        if (startInCheck) continue;
        const midC = c + colStep;
        const tempBoard = copyBoard(board);
        tempBoard[r][midC] = piece; tempBoard[r][c] = 0;
        if (isSquareAttacked(tempBoard, r, midC, -color)) continue;
      }

      const { board: nb } = applyMove(board, {r,c}, move, enPassant, castling);
      if (!isInCheck(nb, color)) legal.push(move);
    }

    return legal;
  }

  function getAllLegalMoves(board, color, enPassant, castling) {
    const all = [];
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++)
        if (pieceColor(board[r][c]) === color)
          getLegalMoves(board, r, c, enPassant, castling).forEach(m => all.push({from:{r,c}, to:m}));
    return all;
  }

  // ── AI (Minimax with alpha-beta) ─────────────────────────────────────────
  const PST = {
    [PAWN]: [
      [0,0,0,0,0,0,0,0],
      [50,50,50,50,50,50,50,50],
      [10,10,20,30,30,20,10,10],
      [5,5,10,25,25,10,5,5],
      [0,0,0,20,20,0,0,0],
      [5,-5,-10,0,0,-10,-5,5],
      [5,10,10,-20,-20,10,10,5],
      [0,0,0,0,0,0,0,0],
    ],
    [KNIGHT]: [
      [-50,-40,-30,-30,-30,-30,-40,-50],
      [-40,-20,0,0,0,0,-20,-40],
      [-30,0,10,15,15,10,0,-30],
      [-30,5,15,20,20,15,5,-30],
      [-30,0,15,20,20,15,0,-30],
      [-30,5,10,15,15,10,5,-30],
      [-40,-20,0,5,5,0,-20,-40],
      [-50,-40,-30,-30,-30,-30,-40,-50],
    ],
    [BISHOP]: [
      [-20,-10,-10,-10,-10,-10,-10,-20],
      [-10,0,0,0,0,0,0,-10],
      [-10,0,5,10,10,5,0,-10],
      [-10,5,5,10,10,5,5,-10],
      [-10,0,10,10,10,10,0,-10],
      [-10,10,10,10,10,10,10,-10],
      [-10,5,0,0,0,0,5,-10],
      [-20,-10,-10,-10,-10,-10,-10,-20],
    ],
    [ROOK]: [
      [0,0,0,0,0,0,0,0],
      [5,10,10,10,10,10,10,5],
      [-5,0,0,0,0,0,0,-5],
      [-5,0,0,0,0,0,0,-5],
      [-5,0,0,0,0,0,0,-5],
      [-5,0,0,0,0,0,0,-5],
      [-5,0,0,0,0,0,0,-5],
      [0,0,0,5,5,0,0,0],
    ],
    [QUEEN]: [
      [-20,-10,-10,-5,-5,-10,-10,-20],
      [-10,0,0,0,0,0,0,-10],
      [-10,0,5,5,5,5,0,-10],
      [-5,0,5,5,5,5,0,-5],
      [0,0,5,5,5,5,0,-5],
      [-10,5,5,5,5,5,0,-10],
      [-10,0,5,0,0,0,0,-10],
      [-20,-10,-10,-5,-5,-10,-10,-20],
    ],
    [KING]: [
      [-30,-40,-40,-50,-50,-40,-40,-30],
      [-30,-40,-40,-50,-50,-40,-40,-30],
      [-30,-40,-40,-50,-50,-40,-40,-30],
      [-30,-40,-40,-50,-50,-40,-40,-30],
      [-20,-30,-30,-40,-40,-30,-30,-20],
      [-10,-20,-20,-20,-20,-20,-20,-10],
      [20,20,0,0,0,0,20,20],
      [20,30,10,0,0,10,30,20],
    ],
  };

  function evaluate(board) {
    let score = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (!p) continue;
        const color = pieceColor(p);
        const type  = pieceType(p);
        const baseVal = PIECE_VALUE[type] || 0;
        const tableRow = color === WHITE ? r : 7 - r;
        const pst = PST[type] ? (PST[type][tableRow]?.[c] || 0) : 0;
        score += color * (baseVal + pst);
      }
    }
    return score;
  }

  function minimax(board, depth, alpha, beta, maximizing, enPassant, castling) {
    const color = maximizing ? BLACK : WHITE;
    const moves = getAllLegalMoves(board, color, enPassant, castling);

    if (moves.length === 0) {
      if (isInCheck(board, color)) return maximizing ? -Infinity : Infinity;
      return 0; // stalemate
    }
    if (depth === 0) return evaluate(board);

    if (maximizing) {
      let best = -Infinity;
      for (const mv of moves) {
        const { board: nb, enPassant: nEP, castling: nC } = applyMove(board, mv.from, mv.to, enPassant, castling);
        best = Math.max(best, minimax(nb, depth-1, alpha, beta, false, nEP, nC));
        alpha = Math.max(alpha, best);
        if (beta <= alpha) break;
      }
      return best;
    } else {
      let best = Infinity;
      for (const mv of moves) {
        const { board: nb, enPassant: nEP, castling: nC } = applyMove(board, mv.from, mv.to, enPassant, castling);
        best = Math.min(best, minimax(nb, depth-1, alpha, beta, true, nEP, nC));
        beta = Math.min(beta, best);
        if (beta <= alpha) break;
      }
      return best;
    }
  }

  function getBotMove() {
    const moves = getAllLegalMoves(state.board, BLACK, state.enPassant, state.castling);
    if (moves.length === 0) return null;
    let best = -Infinity, bestMove = null;
    for (const mv of moves) {
      const { board: nb, enPassant: nEP, castling: nC } = applyMove(state.board, mv.from, mv.to, state.enPassant, state.castling);
      const score = minimax(nb, 2, -Infinity, Infinity, false, nEP, nC);
      if (score > best) { best = score; bestMove = mv; }
    }
    return bestMove;
  }

  // ── Render ───────────────────────────────────────────────────────────────
  function renderModal() {
    const existing = document.getElementById('chess-modal-backdrop');
    if (existing) existing.remove();

    const backdrop = document.createElement('div');
    backdrop.id = 'chess-modal-backdrop';
    backdrop.style.cssText = `
      position:fixed; inset:0; background:rgba(0,0,0,0.9);
      display:flex; align-items:center; justify-content:center;
      z-index:9999; overflow:auto; padding:16px;
    `;
    backdrop.innerHTML = buildHTML();
    document.body.appendChild(backdrop);
    attachBoardEvents();
  }

  function buildHTML() {
    const inCheck = state.status === 'check';
    const over    = ['checkmate','stalemate','draw'].includes(state.status);
    const msgColor = state.status === 'check' ? '#FCA5A5' :
                     over ? '#FDE68A' : '#D1FAE5';

    return `
      <div style="background:#1a1a2e; border-radius:20px; padding:24px; max-width:620px; width:100%;
                  box-shadow:0 20px 60px rgba(0,0,0,0.6); font-family:Inter,sans-serif;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <h2 style="margin:0; font-size:1.4rem; color:#fff;">♟ Chess vs AI</h2>
          <div style="display:flex; gap:8px; align-items:center;">
            <button onclick="SV.Chess.newGame()"
                    style="background:#374151; color:#fff; border:none; border-radius:8px;
                           padding:6px 12px; font-size:0.8rem; cursor:pointer;">🔄 New</button>
            <button onclick="document.getElementById('chess-modal-backdrop').remove()"
                    style="background:none; border:none; font-size:22px; cursor:pointer; color:#aaa;">✕</button>
          </div>
        </div>

        <!-- Status bar -->
        <div style="background:#2d2d4e; border-radius:10px; padding:10px 14px; margin-bottom:14px;
                    font-size:0.85rem; color:${msgColor}; font-weight:600;">
          ${state.message}
        </div>

        <!-- Captured pieces -->
        <div style="display:flex; gap:8px; margin-bottom:10px; font-size:1rem;">
          <div style="flex:1; background:#2d2d4e; border-radius:8px; padding:6px 10px;">
            <span style="font-size:0.65rem; color:#888;">BLACK CAPTURED</span><br/>
            <span>${state.capturedB.map(p => SYMBOLS[-WHITE*p]).join(' ') || '—'}</span>
          </div>
          <div style="flex:1; background:#2d2d4e; border-radius:8px; padding:6px 10px;">
            <span style="font-size:0.65rem; color:#888;">WHITE CAPTURED</span><br/>
            <span>${state.capturedW.map(p => SYMBOLS[-BLACK*p]).join(' ') || '—'}</span>
          </div>
        </div>

        <!-- Board -->
        <div style="display:flex; gap:12px; align-items:flex-start; flex-wrap:wrap;">
          <div>
            <!-- Rank labels -->
            ${renderBoardHTML()}
          </div>
        </div>

        ${state.promotion ? renderPromotionDialog() : ''}
        ${over ? `
          <div style="text-align:center; margin-top:16px;">
            <button onclick="SV.Chess.newGame()"
                    style="background:linear-gradient(135deg,#6C63FF,#8B5CF6); color:#fff;
                           border:none; border-radius:10px; padding:12px 24px; font-size:0.95rem;
                           font-weight:700; cursor:pointer;">
              🔄 Play Again
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }

  function renderBoardHTML() {
    const CELL = 54;
    const files = ['a','b','c','d','e','f','g','h'];
    let html = `<div style="display:inline-block; position:relative;">`;

    // Rank numbers (8 down to 1)
    html += `<div style="display:flex; flex-direction:column; position:absolute; left:-20px; top:0; height:${8*CELL}px;">
      ${Array.from({length:8},(_,i)=>`<div style="height:${CELL}px; display:flex; align-items:center;
        font-size:0.7rem; color:#888; font-weight:600;">${8-i}</div>`).join('')}
    </div>`;

    html += `<div id="chess-board" style="display:grid; grid-template-columns:repeat(8,${CELL}px);
              grid-template-rows:repeat(8,${CELL}px); border:2px solid #374151; border-radius:4px;
              overflow:hidden;">`;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const isLight = (r + c) % 2 === 0;
        const piece = state.board[r][c];
        const isSelected = state.selected && state.selected.r === r && state.selected.c === c;
        const isLegal = state.legalMoves.some(m => m.r === r && m.c === c);
        const isKingInCheck = piece === WHITE * KING && state.status === 'check';

        let bg = isLight ? '#F0D9B5' : '#B58863';
        if (isSelected) bg = '#7FC97F';
        if (isLegal) bg = isLight ? '#CDD16E' : '#AAA23A';
        if (isKingInCheck) bg = '#FF6B6B';

        const symbol = piece ? (SYMBOLS[piece] || '') : '';
        const pieceColor_cls = piece > 0 ? 'white' : 'black';

        html += `
          <div data-r="${r}" data-c="${c}" data-square="1"
               style="width:${CELL}px; height:${CELL}px; background:${bg};
                      display:flex; align-items:center; justify-content:center;
                      font-size:${CELL*0.65}px; cursor:pointer; position:relative;
                      user-select:none; transition:background 0.1s;
                      text-shadow:${piece > 0 ? '0 1px 2px rgba(0,0,0,0.5)' : '0 1px 2px rgba(255,255,255,0.3)'};">
            ${isLegal && !piece ? `<div style="width:30%; height:30%; border-radius:50%;
              background:rgba(0,0,0,0.25); position:absolute;"></div>` : ''}
            ${isLegal && piece ? `<div style="position:absolute; inset:0; border:3px solid rgba(0,0,0,0.3);
              border-radius:0; box-sizing:border-box;"></div>` : ''}
            <span style="line-height:1; z-index:1;">${symbol}</span>
          </div>`;
      }
    }

    html += `</div>`;

    // File letters
    html += `<div style="display:flex; padding-left:0; margin-top:4px;">
      ${files.map(f=>`<div style="width:${CELL}px; text-align:center; font-size:0.7rem; color:#888; font-weight:600;">${f}</div>`).join('')}
    </div>`;

    html += `</div>`;
    return html;
  }

  function renderPromotionDialog() {
    const color = state.turn;
    const pieces = [QUEEN, ROOK, BISHOP, KNIGHT];
    return `
      <div style="position:fixed; inset:0; background:rgba(0,0,0,0.7); display:flex;
                  align-items:center; justify-content:center; z-index:10000;">
        <div style="background:#1a1a2e; border-radius:16px; padding:24px; text-align:center;">
          <h3 style="color:#fff; margin:0 0 16px;">👑 Promote Pawn</h3>
          <div style="display:flex; gap:16px;">
            ${pieces.map(p => `
              <div onclick="SV.Chess.promote(${p})"
                   style="font-size:3rem; cursor:pointer; background:#2d2d4e; border-radius:12px;
                          padding:12px; transition:transform 0.1s;"
                   onmouseenter="this.style.transform='scale(1.15)'"
                   onmouseleave="this.style.transform='scale(1)'">
                ${SYMBOLS[color * p]}
              </div>
            `).join('')}
          </div>
        </div>
      </div>`;
  }

  function attachBoardEvents() {
    const board = document.getElementById('chess-board');
    if (!board) return;
    board.addEventListener('click', (e) => {
      const cell = e.target.closest('[data-square]');
      if (!cell) return;
      const r = parseInt(cell.dataset.r);
      const c = parseInt(cell.dataset.c);
      SV.Chess.handleClick(r, c);
    });
  }

  function updateView() {
    const existing = document.getElementById('chess-modal-backdrop');
    if (!existing) return;
    existing.innerHTML = buildHTML();
    attachBoardEvents();
  }

  // ── Game logic ─────────────────────────────────────────────────────────────
  function checkGameStatus() {
    const moves = getAllLegalMoves(state.board, state.turn, state.enPassant, state.castling);
    if (moves.length === 0) {
      if (isInCheck(state.board, state.turn)) {
        state.status = 'checkmate';
        const winner = state.turn === WHITE ? 'Black AI wins!' : 'You win! 🎉';
        state.message = `Checkmate! ${winner}`;
        if (state.turn !== WHITE) SV.Rewards && SV.Rewards.awardPoints('DAILY_GOAL_MET', 50);
      } else {
        state.status = 'stalemate';
        state.message = "Stalemate! It's a draw.";
      }
      return;
    }
    if (isInCheck(state.board, state.turn)) {
      state.status = 'check';
      state.message = state.turn === WHITE ? '⚠ You are in check!' : '⚠ AI is in check!';
    } else {
      state.status = 'playing';
    }
  }

  // ── Public ─────────────────────────────────────────────────────────────────
  return {
    open() {
      newGame();
      renderModal();
    },

    newGame() {
      newGame();
      updateView();
    },

    handleClick(r, c) {
      if (['checkmate','stalemate','draw'].includes(state.status)) return;
      if (state.turn !== WHITE) return;  // Not player's turn
      if (state.promotion) return;

      const piece = state.board[r][c];

      if (state.selected) {
        // Try to move
        const move = state.legalMoves.find(m => m.r === r && m.c === c);
        if (move) {
          const { board: nb, enPassant: nEP, castling: nC, captured } = applyMove(
            state.board, state.selected, move, state.enPassant, state.castling
          );
          if (captured) state.capturedW.push(Math.abs(captured));

          // Check pawn promotion
          const movedPiece = nb[move.r][move.c];
          if (pieceType(movedPiece) === PAWN && (move.r === 0 || move.r === 7)) {
            // Need promotion dialog
            state.board = nb;
            state.enPassant = nEP;
            state.castling = nC;
            state.promotion = { r: move.r, c: move.c };
            state.selected = null;
            state.legalMoves = [];
            updateView();
            return;
          }

          state.board = nb;
          state.enPassant = nEP;
          state.castling = nC;
          state.selected = null;
          state.legalMoves = [];
          state.turn = BLACK;
          state.message = "AI is thinking...";

          checkGameStatus();
          updateView();

          if (!['checkmate','stalemate'].includes(state.status)) {
            setTimeout(() => this.doBotMove(), 300);
          }
          return;
        }

        // Clicked elsewhere — deselect or select new piece
        if (piece && pieceColor(piece) === WHITE) {
          state.selected = {r, c};
          state.legalMoves = getLegalMoves(state.board, r, c, state.enPassant, state.castling);
          updateView();
          return;
        }
        state.selected = null;
        state.legalMoves = [];
        updateView();
        return;
      }

      // Select piece
      if (piece && pieceColor(piece) === WHITE) {
        state.selected = {r, c};
        state.legalMoves = getLegalMoves(state.board, r, c, state.enPassant, state.castling);
        updateView();
      }
    },

    promote(type) {
      if (!state.promotion) return;
      const {r, c} = state.promotion;
      state.board[r][c] = WHITE * type;
      state.promotion = null;
      state.turn = BLACK;
      checkGameStatus();
      updateView();
      if (!['checkmate','stalemate'].includes(state.status)) {
        setTimeout(() => this.doBotMove(), 300);
      }
    },

    doBotMove() {
      const mv = getBotMove();
      if (!mv) {
        checkGameStatus();
        updateView();
        return;
      }
      const { board: nb, enPassant: nEP, castling: nC, captured } = applyMove(
        state.board, mv.from, mv.to, state.enPassant, state.castling
      );
      if (captured) state.capturedB.push(Math.abs(captured));

      // Bot pawn promotion — always queen
      const movedPiece = nb[mv.to.r][mv.to.c];
      if (pieceType(movedPiece) === PAWN && (mv.to.r === 0 || mv.to.r === 7)) {
        nb[mv.to.r][mv.to.c] = BLACK * QUEEN;
      }

      state.board = nb;
      state.enPassant = nEP;
      state.castling = nC;
      state.turn = WHITE;
      state.message = "Your turn!";

      checkGameStatus();
      if (state.status === 'playing' || state.status === 'check') {
        state.message = state.status === 'check'
          ? '⚠ You are in check! Make a legal move.'
          : "Your turn — click a piece to select it.";
      }
      updateView();
    }
  };
})();
