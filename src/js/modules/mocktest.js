/**
 * STUDYVERSE – Mock Test & Practice Centre Module
 * mocktest.js
 */
window.SV = window.SV || {};

SV.MockTest = (() => {
  let isTestRunning = false;
  let testTimer = null;
  let timeRemaining = 180 * 60; // 3 hours
  let currentQuestion = 0;
  let userAnswers = {};
  let markedForReview = new Set();

  const SAMPLE_QUESTIONS = [
    {
      id: 1,
      paper: 'P1: Financial Reporting',
      marks: 4,
      q: 'XYZ Ltd. enters into a contract to construct a custom industrial plant for a customer. The contract specifies milestone payments. Under Ind AS 115, analyze whether revenue should be recognized over time or at a point in time, assuming the plant has no alternative use and XYZ Ltd. has an enforceable right to payment for performance completed to date.',
      type: 'descriptive',
      hint: 'Refer Ind AS 115 Para 35(c).'
    },
    {
      id: 2,
      paper: 'P2: AFM',
      marks: 6,
      q: 'A US company holds a portfolio of UK stocks valued at £5,000,000. Current spot rate is $1.30/£. 6-month forward rate is $1.28/£. The UK interest rate is 6% p.a. and the US interest rate is 3% p.a. Show how the company can execute a Money Market Hedge and compare it with the Forward Contract hedge.',
      type: 'descriptive',
      hint: 'Calculate present value of £ receivable at UK borrowing/lending rate.'
    },
    {
      id: 3,
      paper: 'P3: Advanced Auditing',
      marks: 4,
      q: 'During the audit of a listed company, the statutory auditor discovers that internal financial controls over revenue recognition were severely deficient, leading to premature booking of sales. Management refuses to adjust the statements. Discuss the reporting requirements under SA 705 and CARO 2020.',
      type: 'descriptive',
      hint: 'Consider Qualified/Adverse opinion and Clause (xxi) of CARO 2020.'
    },
    {
      id: 4,
      paper: 'P4: Direct Tax',
      marks: 5,
      q: 'Compute total income and tax payable by an Indian subsidiary that pays royalty to its foreign parent company under Section 115A. Discuss the applicability of Equalisation Levy vs DTAA beneficial rates.',
      type: 'descriptive',
      hint: 'Section 90(2) permits adoption of treaty or domestic law whichever is more beneficial.'
    },
    {
      id: 5,
      paper: 'P5: Indirect Tax',
      marks: 5,
      q: 'A registered supplier in Maharashtra provides architectural services for an immovable property situated in Dubai to a recipient in Delhi. Determine the Place of Supply under IGST Act and whether this qualifies as export of service.',
      type: 'descriptive',
      hint: 'Section 13(4) of IGST Act: location of immovable property.'
    },
    {
      id: 6,
      paper: 'P6: Integrated Business Solutions',
      marks: 10,
      q: 'Omega Corp is considering acquiring Beta Ltd. Evaluated from an AFM perspective (DCF valuation), Tax implications under Section 72A (carry-forward of losses), GST implications on slump sale vs asset sale, and Strategic Management synergy impact (Porter Value Chain). Prepare a multidisciplinary executive recommendation.',
      type: 'descriptive',
      hint: 'Synthesize Papers 1, 2, 4, 5, and Strategic Management.'
    }
  ];

  async function render() {
    const user = SV.Auth.getCurrentUser() || { id: 'anon' };
    const history = (await SV.Storage.getTestHistory(user.id)) || [];

    if (isTestRunning) {
      return renderTestScreen();
    }

    return `
      <div class="mocktest-container animate-fade-in">

        <div class="page-header">
          <div>
            <h1 class="page-title">Mock Test & Examination Simulation Centre</h1>
            <p class="page-subtitle">Strict ICAI Exam Conditions · Full 3-Hour Papers · Case-Study Test Platform</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-secondary" onclick="SV.MockTest.openCustomTestModal()">
              ⚙️ Create Custom Test
            </button>
            <button class="btn btn-primary" onclick="SV.MockTest.startStandardTest()">
              ▶ Start CA Final Simulation Test (100 Marks)
            </button>
          </div>
        </div>

        <!-- Highlights Row -->
        <div class="dashboard-grid mb-6">
          <div class="stat-card">
            <div class="stat-icon" style="background:#EEF0FF; color:#6C63FF;">📝</div>
            <div class="stat-info">
              <div class="stat-value">6 Papers</div>
              <div class="stat-label">Subject-Wise Full Papers</div>
              <div class="stat-change stat-change--up">Updated for May 2027</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background:#F0FDF4; color:#22C55E;">⏱️</div>
            <div class="stat-info">
              <div class="stat-value">3 Hours</div>
              <div class="stat-label">Real Examination Timer</div>
              <div class="stat-change">Includes 15-min reading time mode</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background:#FFFBEB; color:#F59E0B;">📊</div>
            <div class="stat-info">
              <div class="stat-value">84%</div>
              <div class="stat-label">Average Accuracy</div>
              <div class="stat-change stat-change--up">Top 10 percentile</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background:#EFF6FF; color:#3B82F6;">🎯</div>
            <div class="stat-info">
              <div class="stat-value">IBS Multi</div>
              <div class="stat-label">Paper 6 Case Simulation</div>
              <div class="stat-change">Open book scenario mode</div>
            </div>
          </div>
        </div>

        <!-- Available Mock Tests Series -->
        <div class="card mb-6">
          <h2 class="section-title mb-4">Official Mock Test Series – May 2027</h2>
          <div style="display:flex; flex-direction:column; gap:12px;">

            ${[
              { code: 'P1', name: 'Paper 1: Financial Reporting (Full 100M Test)', duration: '180 mins', type: 'Full Syllabus', difficulty: 'Exam Standard' },
              { code: 'P2', name: 'Paper 2: Advanced Financial Management', duration: '180 mins', type: 'Full Syllabus', difficulty: 'Difficult' },
              { code: 'P3', name: 'Paper 3: Advanced Auditing & Professional Ethics', duration: '180 mins', type: 'Full Syllabus', difficulty: 'Exam Standard' },
              { code: 'P4', name: 'Paper 4: Direct Tax Laws & International Taxation', duration: '180 mins', type: 'AY 2027-28', difficulty: 'Comprehensive' },
              { code: 'P5', name: 'Paper 5: Indirect Tax Laws (GST & Customs)', duration: '180 mins', type: 'Latest CBIC Rules', difficulty: 'Exam Standard' },
              { code: 'P6', name: 'Paper 6: Integrated Business Solutions (Multidisciplinary)', duration: '240 mins (4 hrs)', type: 'Open Book Simulation', difficulty: 'Case Study Master' },
            ].map(test => `
              <div style="display:flex; align-items:center; justify-content:space-between; padding:16px; border:1px solid var(--border-light); border-radius:10px; background:var(--bg-surface-2);">
                <div style="display:flex; align-items:center; gap:16px;">
                  <span class="badge badge-primary" style="font-size:13px; padding:6px 12px;">${test.code}</span>
                  <div>
                    <h4 style="font-weight:600; font-size:15px; margin-bottom:4px;">${test.name}</h4>
                    <div style="font-size:12px; color:var(--text-secondary);">Duration: ${test.duration} · ${test.type} · Difficulty: <strong>${test.difficulty}</strong></div>
                  </div>
                </div>
                <button class="btn btn-primary" onclick="SV.MockTest.startStandardTest('${test.code}')">
                  Attempt Test ✍️
                </button>
              </div>
            `).join('')}

          </div>
        </div>

        <!-- Past Test Performance History -->
        <div class="card">
          <h3 class="section-title mb-3">Your Test History & Performance Reports</h3>
          <div style="overflow-x:auto;">
            <table style="width:100%; border-collapse:collapse; font-size:13px;">
              <thead>
                <tr style="text-align:left; border-bottom:2px solid var(--border-light); color:var(--text-secondary);">
                  <th style="padding:10px;">Date</th>
                  <th style="padding:10px;">Test Name</th>
                  <th style="padding:10px;">Score</th>
                  <th style="padding:10px;">Time Spent</th>
                  <th style="padding:10px;">Result</th>
                  <th style="padding:10px;">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom:1px solid var(--border-light);">
                  <td style="padding:10px;">21 Nov 2026</td>
                  <td style="padding:10px; font-weight:600;">Paper 1: Ind AS Diagnostic Test</td>
                  <td style="padding:10px; font-weight:700; color:var(--brand-success);">72 / 100</td>
                  <td style="padding:10px;">165 mins</td>
                  <td style="padding:10px;"><span class="badge badge-success">Exemption (72%)</span></td>
                  <td style="padding:10px;"><button class="btn btn-sm btn-secondary" onclick="alert('Viewing comprehensive evaluation & suggested answers.')">Review</button></td>
                </tr>
                <tr style="border-bottom:1px solid var(--border-light);">
                  <td style="padding:10px;">14 Nov 2026</td>
                  <td style="padding:10px; font-weight:600;">Paper 2: AFM Derivatives & Forex</td>
                  <td style="padding:10px; font-weight:700; color:var(--brand-primary);">64 / 100</td>
                  <td style="padding:10px;">178 mins</td>
                  <td style="padding:10px;"><span class="badge badge-primary">Pass (64%)</span></td>
                  <td style="padding:10px;"><button class="btn btn-sm btn-secondary" onclick="alert('Viewing comprehensive evaluation.')">Review</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  }

  function renderTestScreen() {
    const q = SAMPLE_QUESTIONS[currentQuestion];
    const hrs = Math.floor(timeRemaining / 3600);
    const mins = Math.floor((timeRemaining % 3600) / 60);
    const secs = timeRemaining % 60;
    const timeFormatted = `${String(hrs).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;

    return `
      <div class="mocktest-screen animate-fade-in" style="max-width:1200px; margin:0 auto;">

        <!-- Test Top Bar -->
        <div style="background:var(--bg-surface); border:1px solid var(--border-light); border-radius:12px; padding:16px 24px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; box-shadow:var(--shadow-sm);">
          <div>
            <span class="badge badge-primary">${q.paper}</span>
            <span style="font-weight:700; font-size:16px; margin-left:12px;">CA Final Examination Simulation (May 2027)</span>
          </div>
          <div style="display:flex; align-items:center; gap:20px;">
            <div style="font-size:20px; font-weight:800; font-family:var(--font-mono); color:var(--brand-danger);">
              ⏱️ ${timeFormatted}
            </div>
            <button class="btn btn-danger" onclick="SV.MockTest.submitTest()">Submit Paper</button>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 300px; gap:20px;">

          <!-- Question & Answer Area -->
          <div class="card" style="min-height:550px; display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; justify-content:space-between; margin-bottom:16px;">
                <span style="font-weight:700; font-size:16px;">Question ${currentQuestion + 1} of ${SAMPLE_QUESTIONS.length}</span>
                <span class="badge badge-warning">${q.marks} Marks</span>
              </div>
              <p style="font-size:15px; line-height:1.6; margin-bottom:20px;">${q.q}</p>

              <div class="form-group">
                <label class="form-label">Write / Type Your Solution (or Draft Points):</label>
                <textarea id="test-answer-input" class="form-textarea" rows="12" placeholder="Draft your answer points, journal entries, or calculation steps here..."
                  oninput="SV.MockTest.saveCurrentAnswer(this.value)">${userAnswers[currentQuestion] || ''}</textarea>
              </div>
            </div>

            <div style="display:flex; justify-content:space-between; border-top:1px solid var(--border-light); padding-top:16px; margin-top:20px;">
              <button class="btn btn-secondary" onclick="SV.MockTest.toggleMarkReview()">
                ${markedForReview.has(currentQuestion) ? '★ Marked for Review' : '☆ Mark for Review'}
              </button>
              <div style="display:flex; gap:10px;">
                <button class="btn btn-secondary" onclick="SV.MockTest.prevQ()" ${currentQuestion === 0 ? 'disabled' : ''}>Previous</button>
                <button class="btn btn-primary" onclick="SV.MockTest.nextQ()" ${currentQuestion === SAMPLE_QUESTIONS.length - 1 ? 'disabled' : ''}>Next Question →</button>
              </div>
            </div>
          </div>

          <!-- Question Palette -->
          <div class="card">
            <h3 class="section-title mb-3">Question Palette</h3>
            <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:8px; margin-bottom:20px;">
              ${SAMPLE_QUESTIONS.map((item, idx) => {
                const isAns = userAnswers[idx] && userAnswers[idx].trim().length > 0;
                const isRev = markedForReview.has(idx);
                const isCurr = currentQuestion === idx;

                let bg = 'var(--bg-surface-2)';
                let color = 'var(--text-primary)';
                if (isCurr) { bg = 'var(--brand-primary)'; color = 'white'; }
                else if (isRev) { bg = 'var(--brand-warning)'; color = 'white'; }
                else if (isAns) { bg = 'var(--brand-success)'; color = 'white'; }

                return `
                  <button style="padding:10px; border-radius:6px; border:none; background:${bg}; color:${color}; font-weight:700; cursor:pointer;"
                    onclick="SV.MockTest.jumpToQ(${idx})">
                    ${idx + 1}
                  </button>
                `;
              }).join('')}
            </div>

            <div style="font-size:12px; display:flex; flex-direction:column; gap:6px; color:var(--text-secondary);">
              <div>🟩 Answered</div>
              <div>🟨 Marked for Review</div>
              <div>⬜ Not Answered</div>
              <div>🟦 Current Question</div>
            </div>
          </div>

        </div>

      </div>
    `;
  }

  return {
    render,

    startStandardTest(code = 'P1') {
      isTestRunning = true;
      timeRemaining = 180 * 60;
      currentQuestion = 0;
      userAnswers = {};
      markedForReview.clear();

      if (testTimer) clearInterval(testTimer);
      testTimer = setInterval(() => {
        if (timeRemaining > 0) {
          timeRemaining--;
        } else {
          this.submitTest();
        }
      }, 1000);

      SV.Router.refresh();
    },

    saveCurrentAnswer(text) {
      userAnswers[currentQuestion] = text;
    },

    nextQ() {
      if (currentQuestion < SAMPLE_QUESTIONS.length - 1) {
        currentQuestion++;
        SV.Router.refresh();
      }
    },

    prevQ() {
      if (currentQuestion > 0) {
        currentQuestion--;
        SV.Router.refresh();
      }
    },

    jumpToQ(idx) {
      currentQuestion = idx;
      SV.Router.refresh();
    },

    toggleMarkReview() {
      if (markedForReview.has(currentQuestion)) markedForReview.delete(currentQuestion);
      else markedForReview.add(currentQuestion);
      SV.Router.refresh();
    },

    submitTest() {
      if (confirm('Are you sure you want to submit your examination paper?')) {
        clearInterval(testTimer);
        isTestRunning = false;
        SV.Rewards.awardPoints('MOCK_TEST_COMPLETED', 100);
        alert(
          `🎉 Examination Submitted Successfully!\n\n` +
          `• Questions attempted: ${Object.keys(userAnswers).length} of ${SAMPLE_QUESTIONS.length}\n` +
          `• Time taken: ${180 - Math.floor(timeRemaining / 60)} minutes\n` +
          `• Reward: +100 Study Points awarded!\n` +
          `Detailed solution analysis and model answer keys are now accessible.`
        );
        SV.Router.refresh();
      }
    },

    openCustomTestModal() {
      alert('Custom Test Generator: Choose specific chapters, difficulty level, and duration to auto-generate a custom test paper.');
    }
  };
})();
