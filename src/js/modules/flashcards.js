/**
 * STUDYVERSE – Flashcards Module
 * flashcards.js
 */
window.SV = window.SV || {};

SV.Flashcards = (() => {
  let currentIndex = 0;
  let isFlipped = false;

  const DEFAULT_FLASHCARDS = [
    {
      id: 'fc-1',
      subject: 'FR',
      front: 'What are the 5 Steps of Revenue Recognition under Ind AS 115?',
      back: '1. Identify contract with customer\n2. Identify performance obligations\n3. Determine transaction price\n4. Allocate transaction price\n5. Recognize revenue when/as obligation satisfied'
    },
    {
      id: 'fc-2',
      subject: 'AFM',
      front: 'Black-Scholes Call Option Pricing Formula (d1 and d2)',
      back: 'C = S*N(d1) - X*e^(-rt)*N(d2)\n\nd1 = [ln(S/X) + (r + σ²/2)t] / [σ√t]\nd2 = d1 - σ√t'
    },
    {
      id: 'fc-3',
      subject: 'Audit',
      front: 'SA 701 – Key Audit Matters (KAM) Criteria',
      back: 'Matters communicated with TCWG that in the auditor\'s professional judgment were of most significance in the audit: high risk of material misstatement, significant management judgment, or significant events/transactions.'
    },
    {
      id: 'fc-4',
      subject: 'DT',
      front: 'Section 115BAC – New Tax Regime Slabs (May 2027 Scheme)',
      back: 'Standard deduction: Rs 75,000 for salaried employees.\nRebate under Section 87A: Up to Rs 7,00,000 taxable income pays zero tax.'
    },
    {
      id: 'fc-5',
      subject: 'IDT',
      front: 'GST Blocked Credit under Section 17(5) – Key Inclusions',
      back: '• Motor vehicles for transportation of persons (capacity ≤ 13) with exceptions\n• Food, beverages, outdoor catering, beauty treatment\n• Membership of club, health & fitness\n• Works contract for construction of immovable property on own account'
    }
  ];

  async function render() {
    const card = DEFAULT_FLASHCARDS[currentIndex];

    return `
      <div class="flashcards-container animate-fade-in">

        <div class="page-header">
          <div>
            <h1 class="page-title">CA Revision Flashcards</h1>
            <p class="page-subtitle">Formulas, Standards, Tax Sections & Rulings · Active Recall Practice</p>
          </div>
          <div class="page-actions">
            <span class="badge badge-primary">Card ${currentIndex + 1} of ${DEFAULT_FLASHCARDS.length}</span>
          </div>
        </div>

        <div style="max-width:600px; margin:40px auto; text-align:center;">
          <div class="flashcard-scene" onclick="SV.Flashcards.flip()">
            <div class="flashcard ${isFlipped ? 'flipped' : ''}" id="current-flashcard">
              <div class="flashcard-front">
                <div>
                  <div class="flashcard-label">${card.subject} · Click to Reveal Solution</div>
                  <div class="flashcard-text">${card.front}</div>
                </div>
              </div>
              <div class="flashcard-back">
                <div>
                  <div class="flashcard-label" style="color:var(--brand-primary);">${card.subject} · Solution & Key Points</div>
                  <div class="flashcard-text" style="font-size:16px; white-space:pre-line; color:var(--text-primary);">${card.back}</div>
                </div>
              </div>
            </div>
          </div>

          <div style="display:flex; justify-content:center; gap:16px; margin-top:32px;">
            <button class="btn btn-secondary" onclick="SV.Flashcards.prev()">← Previous Card</button>
            <button class="btn btn-primary" onclick="SV.Flashcards.flip()">Flip Card 🔄</button>
            <button class="btn btn-secondary" onclick="SV.Flashcards.next()">Next Card →</button>
          </div>
        </div>

      </div>
    `;
  }

  return {
    render,

    flip() {
      isFlipped = !isFlipped;
      const el = document.getElementById('current-flashcard');
      if (el) el.classList.toggle('flipped', isFlipped);
    },

    next() {
      isFlipped = false;
      if (currentIndex < DEFAULT_FLASHCARDS.length - 1) currentIndex++;
      else currentIndex = 0;
      SV.Router.refresh();
    },

    prev() {
      isFlipped = false;
      if (currentIndex > 0) currentIndex--;
      else currentIndex = DEFAULT_FLASHCARDS.length - 1;
      SV.Router.refresh();
    }
  };
})();
