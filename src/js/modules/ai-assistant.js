/**
 * STUDYVERSE – AI Study Assistant & Ask My CA Library Module
 * ai-assistant.js
 */
window.SV = window.SV || {};

SV.AIAssistant = (() => {
  let activeTab = 'chat'; // 'chat' | 'summarizer' | 'mcq' | 'tools'
  let chatHistory = [];
  let generatedMCQs = [];
  let userMCQAnswers = {};
  let currentMCQIndex = 0;

  async function render(params = {}) {
    const initialPrompt = params.prompt || '';

    return `
      <div class="ai-assistant-container animate-fade-in">

        <div class="page-header">
          <div>
            <h1 class="page-title">STUDYVERSE AI – The Ultimate CA Study Brain</h1>
            <p class="page-subtitle">Exclusively calibrated for ICAI New Scheme · May 2027 Syllabus · Document-Grounding & Citations</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-secondary" onclick="SV.AIAssistant.clearChat()">
              🗑️ Clear Conversation
            </button>
            <button class="btn btn-primary" onclick="SV.AIAssistant.exportNotes()">
              📥 Export AI Summary to Notes
            </button>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="tabs-nav mb-6">
          <button class="tab-btn ${activeTab === 'chat' ? 'active' : ''}" onclick="SV.AIAssistant.switchTab('chat')">
            💬 Ask My CA Library
          </button>
          <button class="tab-btn ${activeTab === 'summarizer' ? 'active' : ''}" onclick="SV.AIAssistant.switchTab('summarizer')">
            📑 Topic & Document Summarizer
          </button>
          <button class="tab-btn ${activeTab === 'mcq' ? 'active' : ''}" onclick="SV.AIAssistant.switchTab('mcq')">
            🎯 Smart MCQ Generator & Test
          </button>
          <button class="tab-btn ${activeTab === 'tools' ? 'active' : ''}" onclick="SV.AIAssistant.switchTab('tools')">
            ⚡ 13 Special CA AI Tools
          </button>
        </div>

        <!-- Tab 1: Chat with Library -->
        <div class="tab-panel ${activeTab === 'chat' ? 'active' : ''}" id="ai-panel-chat" style="display:${activeTab === 'chat' ? 'block' : 'none'};">
          <div class="two-panel">

            <!-- Chat Area -->
            <div class="card" style="display:flex; flex-direction:column; height: 600px;">
              <div id="ai-chat-messages" style="flex:1; overflow-y:auto; padding:12px; display:flex; flex-direction:column; gap:16px;">
                <div style="display:flex; gap:12px; align-items:flex-start;">
                  <div style="width:36px; height:36px; border-radius:50%; background:var(--gradient-primary); color:white; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0;">🤖</div>
                  <div style="background:var(--bg-surface-2); padding:16px; border-radius:12px; max-width:85%;">
                    <div style="font-weight:600; font-size:13px; margin-bottom:4px; color:var(--brand-primary);">STUDYVERSE AI (Chartered Companion)</div>
                    <p style="font-size:14px; line-height:1.5;">
                      Hello CA Aspirant! I am your AI assistant trained on the <strong>ICAI New Scheme May 2027</strong> study materials for all 6 papers (FR, AFM, Audit & Ethics, DT, IDT, and IBS).
                      <br><br>
                      Ask me any complex question, case law, Ind AS provision, or formula. I will provide accurate answers with ICAI citations!
                    </p>
                  </div>
                </div>

                ${chatHistory.map(msg => `
                  <div style="display:flex; gap:12px; align-items:flex-start; ${msg.role === 'user' ? 'flex-direction:row-reverse;' : ''}">
                    <div style="width:36px; height:36px; border-radius:50%; background:${msg.role === 'user' ? 'var(--brand-secondary)' : 'var(--gradient-primary)'}; color:white; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0;">
                      ${msg.role === 'user' ? '👤' : '🤖'}
                    </div>
                    <div style="background:${msg.role === 'user' ? 'var(--brand-primary-light)' : 'var(--bg-surface-2)'}; padding:16px; border-radius:12px; max-width:85%;">
                      <div style="font-weight:600; font-size:12px; margin-bottom:4px; color:var(--brand-primary);">
                        ${msg.role === 'user' ? 'You' : 'STUDYVERSE AI'}
                      </div>
                      <div style="font-size:14px; line-height:1.6; white-space:pre-wrap;">${msg.content}</div>
                      ${msg.citations ? `
                        <div style="margin-top:10px; padding:8px 12px; background:rgba(108,99,255,0.08); border-left:3px solid var(--brand-primary); font-size:11px; border-radius:4px;">
                          <strong>Official Source Citations:</strong><br>${msg.citations}
                        </div>
                      ` : ''}
                    </div>
                  </div>
                `).join('')}
              </div>

              <!-- Input bar -->
              <div style="display:flex; gap:8px; padding-top:16px; border-top:1px solid var(--border-light);">
                <input type="text" id="ai-chat-input" class="form-input" placeholder="Ask anything, e.g., 'Explain the difference between Ind AS 12 and AS 22'..."
                  value="${initialPrompt}" onkeypress="if(event.key==='Enter') SV.AIAssistant.sendMessage()">
                <button class="btn btn-primary" onclick="SV.AIAssistant.sendMessage()">Send</button>
              </div>
            </div>

            <!-- Library Context & Document Selector -->
            <div class="card">
              <h3 class="section-title mb-3">Grounding Context</h3>
              <p style="font-size:12px; color:var(--text-secondary); margin-bottom:16px;">
                Select which ICAI materials or personal documents the AI should prioritize for answers:
              </p>
              <div style="display:flex; flex-direction:column; gap:8px;">
                <label class="form-checkbox">
                  <input type="checkbox" checked> <span>Paper 1: Financial Reporting (Ind AS 1-116)</span>
                </label>
                <label class="form-checkbox">
                  <input type="checkbox" checked> <span>Paper 2: AFM (Forex, Derivatives, Mergers)</span>
                </label>
                <label class="form-checkbox">
                  <input type="checkbox" checked> <span>Paper 3: Advanced Auditing & Code of Ethics</span>
                </label>
                <label class="form-checkbox">
                  <input type="checkbox" checked> <span>Paper 4: Direct Tax (AY 2027-28 & Int'l Tax)</span>
                </label>
                <label class="form-checkbox">
                  <input type="checkbox" checked> <span>Paper 5: Indirect Tax (GST, Customs, FTP 2023)</span>
                </label>
                <label class="form-checkbox">
                  <input type="checkbox" checked> <span>Paper 6: Integrated Business Solutions</span>
                </label>
                <label class="form-checkbox">
                  <input type="checkbox" checked> <span>My Personal Uploaded Notes & PDFs</span>
                </label>
              </div>

              <div style="margin-top:20px; padding:12px; background:var(--bg-surface-2); border-radius:8px;">
                <div style="font-weight:600; font-size:12px; margin-bottom:4px;">💡 Pro-tip:</div>
                <div style="font-size:11px; color:var(--text-secondary); line-height:1.4;">
                  Our AI is strictly instructed to avoid inventing statutory provisions, cite ICAI sections, and warn if tax amendments apply.
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Tab 2: Summarizer -->
        <div class="tab-panel ${activeTab === 'summarizer' ? 'active' : ''}" id="ai-panel-summarizer" style="display:${activeTab === 'summarizer' ? 'block' : 'none'};">
          <div class="card">
            <h3 class="section-title mb-3">AI Topic & Document Summarizer</h3>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
              <div>
                <div class="form-group mb-3">
                  <label class="form-label">Select CA Topic or Paste Text</label>
                  <textarea id="summarizer-input" class="form-textarea" rows="6" placeholder="Enter topic name (e.g., 'Ind AS 115 5-Step Model') or paste document excerpt..."></textarea>
                </div>
                <div class="form-group mb-3">
                  <label class="form-label">Summary Type</label>
                  <select class="form-select" id="summarizer-type">
                    <option value="exam-notes">Exam-Oriented Revision Notes</option>
                    <option value="detailed">Detailed Conceptual Explanation</option>
                    <option value="definitions">Key Definitions & Important Provisions</option>
                    <option value="illustrations">Practical Exam Illustrations</option>
                    <option value="mindmap">Textual Mind Map & Flowchart</option>
                  </select>
                </div>
                <button class="btn btn-primary" onclick="SV.AIAssistant.generateSummary()">Generate Intelligent Summary</button>
              </div>

              <div style="background:var(--bg-surface-2); border-radius:8px; padding:16px; min-height:280px;" id="summarizer-output">
                <div style="color:var(--text-tertiary); font-style:italic;">Your AI summary will appear here with instant formatting, flowcharts and takeaways.</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 3: MCQ Generator & Interactive Practice -->
        <div class="tab-panel ${activeTab === 'mcq' ? 'active' : ''}" id="ai-panel-mcq" style="display:${activeTab === 'mcq' ? 'block' : 'none'};">
          <div class="card">
            <div class="section-header">
              <h3 class="section-title">Automatic MCQ Generator & Test Engine</h3>
              <div style="display:flex; gap:10px;">
                <select class="form-select-sm" id="mcq-paper-select">
                  <option value="P1">Paper 1: Financial Reporting</option>
                  <option value="P2">Paper 2: AFM</option>
                  <option value="P3">Paper 3: Advanced Auditing</option>
                  <option value="P4">Paper 4: Direct Tax</option>
                  <option value="P5">Paper 5: Indirect Tax</option>
                  <option value="P6">Paper 6: IBS Case Study</option>
                </select>
                <select class="form-select-sm" id="mcq-count-select">
                  <option value="5">5 Questions (Quick)</option>
                  <option value="10" selected>10 Questions</option>
                  <option value="20">20 Questions</option>
                </select>
                <button class="btn btn-sm btn-primary" onclick="SV.AIAssistant.generateMCQs()">Generate Questions</button>
              </div>
            </div>

            <div id="mcq-quiz-container" style="margin-top:20px;">
              <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <div class="empty-state-title">Ready to Test Your CA Concepts</div>
                <div class="empty-state-desc">Click 'Generate Questions' to practice case-scenario and analytical MCQs with automatic scoring!</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 4: 13 Special CA AI Tools -->
        <div class="tab-panel ${activeTab === 'tools' ? 'active' : ''}" id="ai-panel-tools" style="display:${activeTab === 'tools' ? 'block' : 'none'};">
          <div class="grid-auto">
            ${[
              { icon: '💡', title: 'Explain Like a Beginner', desc: 'Simplifies difficult Ind AS and corporate law concepts using plain everyday analogies.' },
              { icon: '⭐', title: 'Important Question Finder', desc: 'Pinpoints historically frequent exam topics and high-weightage ICAI problems.' },
              { icon: '📇', title: 'Flashcard Generator', desc: 'Auto-converts lengthy standards into bite-sized Q&A memory cards.' },
              { icon: '🗺️', title: 'Mind Map Generator', desc: 'Structures broad chapters into hierarchical concept trees.' },
              { icon: '💼', title: 'Case Study Generator', desc: 'Crafts integrated multidisciplinary scenarios modeled on Paper 6 IBS.' },
              { icon: '📐', title: 'Formula Sheet Generator', desc: 'Extracts every quantitative equation from AFM and valuation chapters.' },
              { icon: '⚖️', title: 'Difference Between Concepts', desc: 'Side-by-side comparative matrices (e.g., Ind AS 116 vs AS 19).' },
              { icon: '📜', title: 'Important Provision Finder', desc: 'Lists critical Sections of Income Tax, CGST Act, and Companies Act 2013.' },
              { icon: '🔄', title: 'Amendment Comparison', desc: 'Highlights what changed between past finance acts and May 2027 applicability.' },
              { icon: '✍️', title: 'Answer Structuring Coach', desc: 'Teaches you how to frame answers with Provision, Facts, Analysis, and Conclusion.' },
            ].map(tool => `
              <div class="card cursor-pointer" onclick="SV.AIAssistant.useTool('${tool.title}')" style="transition:transform 0.2s;" onmouseenter="this.style.transform='translateY(-3px)'" onmouseleave="this.style.transform='none'">
                <div style="font-size:32px; margin-bottom:8px;">${tool.icon}</div>
                <h4 style="font-weight:600; font-size:15px; margin-bottom:6px;">${tool.title}</h4>
                <p style="font-size:12px; color:var(--text-secondary); line-height:1.4;">${tool.desc}</p>
                <div style="margin-top:12px; font-size:12px; font-weight:600; color:var(--brand-primary);">Launch Tool →</div>
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    `;
  }

  return {
    render,

    switchTab(tab) {
      activeTab = tab;
      SV.Router.refresh();
    },

    clearChat() {
      chatHistory = [];
      SV.Router.refresh();
    },

    sendMessage() {
      const input = document.getElementById('ai-chat-input');
      if (!input || !input.value.trim()) return;

      const userText = input.value.trim();
      input.value = '';

      chatHistory.push({ role: 'user', content: userText });

      let responseText = '';
      let citations = '';

      const lower = userText.toLowerCase();
      if (lower.includes('ind as 12') || lower.includes('deferred tax')) {
        responseText =
          `### Core Conceptual Comparison: Ind AS 12 vs AS 22\n\n` +
          `1. **Approach**:\n` +
          `   - **Ind AS 12**: Balance Sheet Liability Approach focusing on temporary differences between the carrying amount of an asset/liability and its tax base.\n` +
          `   - **AS 22**: Income Statement Approach focusing on timing differences between accounting income and taxable income.\n\n` +
          `2. **Virtual Certainty Requirement**:\n` +
          `   - **Ind AS 12**: Deferred tax asset is recognized when it is *probable* (more likely than not) that future taxable profits will be available.\n` +
          `   - **AS 22**: Requires *virtual certainty* supported by convincing evidence in case of unabsorbed depreciation or carry-forward losses.\n\n` +
          `3. **Presentation**:\n` +
          `   - Ind AS 12 prohibits classification of deferred tax assets/liabilities as current. They are always non-current.`;
        citations = `• ICAI CA Final Paper 1 Study Material, Chapter 2 (Ind AS 12: Income Taxes, Paras 5-15)\n• Applicable for May 2027 Examination`;
      } else if (lower.includes('115') || lower.includes('revenue')) {
        responseText =
          `### Ind AS 115: 5-Step Model for Revenue Recognition\n\n` +
          `1. **Step 1: Identify the Contract** with the customer (enforceable rights & payment terms).\n` +
          `2. **Step 2: Identify Performance Obligations** (distinct goods or services promises).\n` +
          `3. **Step 3: Determine Transaction Price** (fixed consideration, variable consideration, significant financing component).\n` +
          `4. **Step 4: Allocate Transaction Price** to performance obligations on relative stand-alone selling price basis.\n` +
          `5. **Step 5: Recognize Revenue** when (or as) the entity satisfies a performance obligation (over time or at a point in time).`;
        citations = `• ICAI CA Final Paper 1 Study Material (Ind AS 115: Revenue from Contracts with Customers)\n• Section 5 & Appendix B Guidance`;
      } else {
        responseText =
          `### ICAI CA Final Analysis for: "${userText}"\n\n` +
          `1. **Statutory Framework**: In accordance with the ICAI New Scheme guidelines applicable for May 2027, this concept requires strict adherence to prescribed standards and judicial precedents.\n\n` +
          `2. **Exam Orientation & Key Points**:\n` +
          `   - Always state the applicable provision/standard number first.\n` +
          `   - Show calculations step-by-step with assumptions explicitly highlighted.\n` +
          `   - In case of tax, ensure assessment year AY 2027-28 provisions are incorporated.\n\n` +
          `3. **Model Answer Structure**:\n` +
          `   - Heading / Legal Provision\n` +
          `   - Application to the Given Facts\n` +
          `   - Final Conclusion & Financial Impact`;
        citations = `• ICAI Official Board of Studies Study Modules for May 2027\n• Relevant RTP & Suggested Answers Compendium`;
      }

      chatHistory.push({ role: 'assistant', content: responseText, citations });
      SV.Router.refresh();
    },

    generateSummary() {
      const input = document.getElementById('summarizer-input')?.value.trim();
      const type = document.getElementById('summarizer-type')?.value;
      const out = document.getElementById('summarizer-output');
      if (!input) { alert('Please enter a topic or paste text.'); return; }

      out.innerHTML = `
        <div style="font-weight:700; font-size:16px; margin-bottom:8px; color:var(--brand-primary);">Summary for: ${input}</div>
        <div style="font-size:13px; line-height:1.6; color:var(--text-primary);">
          <strong>1. Key Conceptual Essence:</strong><br>
          Under the ICAI New Scheme syllabus (May 2027), this topic requires mastery of fundamental recognition criteria and practical balance sheet impact.
          <br><br>
          <strong>2. Important Provisions & Rules:</strong><br>
          • Specific applicability conditions must be met prior to recognition.<br>
          • Detailed disclosures must be provided in the financial notes.<br>
          • Measurement follows fair value hierarchy or amortized cost methodology.<br><br>
          <strong>3. Common Pitfalls in Examinations:</strong><br>
          Students often miss the transitional provisions and presentation adjustments required under recent regulatory circulars.
        </div>
      `;
    },

    generateMCQs() {
      const paper = document.getElementById('mcq-paper-select')?.value || 'P1';

      generatedMCQs = [
        {
          q: "Under Ind AS 115, when is revenue recognized over time?",
          options: [
            "A) Only when goods are physically delivered to customer premises",
            "B) When customer simultaneously receives and consumes benefits, or entity creates asset with no alternative use and has enforceable right to payment",
            "C) Only after full consideration is received in bank",
            "D) When title of goods passes as per Sale of Goods Act"
          ],
          correct: 1,
          explanation: "Ind AS 115 Para 35 stipulates three criteria for over-time recognition including simultaneous consumption or asset with no alternative use and enforceable right to payment."
        },
        {
          q: "What is the consequence under Section 115JB (MAT) for a domestic company choosing Section 115BAA?",
          options: [
            "A) MAT rate is reduced to 9%",
            "B) MAT provisions cease to apply entirely",
            "C) MAT credit can be carried forward for 20 years",
            "D) MAT rate remains 15% without change"
          ],
          correct: 1,
          explanation: "Section 115JB(5A) explicitly states that MAT provisions do not apply to a person who has exercised the option referred to under Section 115BAA or 115BAB."
        },
        {
          q: "In AFM, if the spot exchange rate is USD 1 = INR 84.00, 3-month forward is INR 84.60, and US interest rate is 5% p.a., what does Interest Rate Parity imply about Indian interest rates?",
          options: [
            "A) Indian interest rates are lower than US interest rates",
            "B) Indian interest rates are higher than US interest rates",
            "C) Both interest rates must be identical",
            "D) Exchange rates have no relation to interest rate differentials"
          ],
          correct: 1,
          explanation: "Under IRP, the currency trading at a forward discount (USD at premium, INR at discount) must have a higher nominal interest rate to prevent arbitrage."
        }
      ];

      userMCQAnswers = {};
      currentMCQIndex = 0;
      this.renderQuizCard();
    },

    renderQuizCard() {
      const container = document.getElementById('mcq-quiz-container');
      if (!container || !generatedMCQs.length) return;

      const q = generatedMCQs[currentMCQIndex];
      const selected = userMCQAnswers[currentMCQIndex];

      container.innerHTML = `
        <div style="background:var(--bg-surface-2); padding:20px; border-radius:12px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
            <span class="badge badge-primary">Question ${currentMCQIndex + 1} of ${generatedMCQs.length}</span>
            <span style="font-size:12px; color:var(--text-secondary);">Score: ${Object.keys(userMCQAnswers).filter(i => userMCQAnswers[i] === generatedMCQs[i].correct).length} / ${generatedMCQs.length}</span>
          </div>

          <h3 style="font-size:16px; font-weight:600; margin-bottom:16px; line-height:1.4;">${q.q}</h3>

          <div style="display:flex; flex-direction:column; gap:10px;">
            ${q.options.map((opt, optIdx) => `
              <div class="today-plan-item" style="cursor:pointer; ${selected !== undefined ? (optIdx === q.correct ? 'background:#DCFCE7; border:1px solid #16A34A;' : (selected === optIdx ? 'background:#FEE2E2; border:1px solid #DC2626;' : '')) : ''}"
                onclick="SV.AIAssistant.selectAnswer(${optIdx})">
                <span style="font-weight:500; font-size:14px;">${opt}</span>
              </div>
            `).join('')}
          </div>

          ${selected !== undefined ? `
            <div style="margin-top:16px; padding:12px; background:var(--bg-surface); border-radius:8px; border-left:4px solid var(--brand-primary);">
              <div style="font-weight:600; font-size:13px; color:var(--brand-primary);">Explanation & ICAI Source:</div>
              <div style="font-size:13px; line-height:1.4; margin-top:4px;">${q.explanation}</div>
            </div>
          ` : ''}

          <div style="display:flex; justify-content:space-between; margin-top:20px;">
            <button class="btn btn-secondary" onclick="SV.AIAssistant.prevMCQ()" ${currentMCQIndex === 0 ? 'disabled' : ''}>← Previous</button>
            <button class="btn btn-primary" onclick="SV.AIAssistant.nextMCQ()" ${currentMCQIndex === generatedMCQs.length - 1 ? 'disabled' : ''}>Next →</button>
          </div>
        </div>
      `;
    },

    selectAnswer(optIdx) {
      if (userMCQAnswers[currentMCQIndex] !== undefined) return;
      userMCQAnswers[currentMCQIndex] = optIdx;
      if (optIdx === generatedMCQs[currentMCQIndex].correct) {
        SV.Rewards.awardPoints('MCQ_CORRECT', 5);
      }
      this.renderQuizCard();
    },

    prevMCQ() {
      if (currentMCQIndex > 0) { currentMCQIndex--; this.renderQuizCard(); }
    },

    nextMCQ() {
      if (currentMCQIndex < generatedMCQs.length - 1) { currentMCQIndex++; this.renderQuizCard(); }
    },

    useTool(toolName) {
      activeTab = 'chat';
      SV.Router.refresh();
      setTimeout(() => {
        const input = document.getElementById('ai-chat-input');
        if (input) {
          input.value = `Please execute tool [${toolName}] for my CA Final May 2027 studies: `;
          input.focus();
        }
      }, 50);
    },

    exportNotes() {
      if (!chatHistory.length) { alert('No conversation to export yet.'); return; }
      const text = chatHistory.map(m => `${m.role.toUpperCase()}:\n${m.content}\n`).join('\n---\n');
      SV.Storage.saveNote({
        id: SV.Utils.uniqueId('note-ai'),
        userId: SV.Auth.getCurrentUser()?.id || 'anon',
        subject: 'General',
        title: 'Exported Studyverse AI Summary',
        content: text,
        createdAt: new Date().toISOString()
      });
      SV.Utils.toast('Conversation saved to your Notes & Mistake Notebook!', 'success');
    }
  };
})();
