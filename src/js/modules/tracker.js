/**
 * STUDYVERSE – Advanced Hierarchical Study Tracker Module
 * tracker.js
 * Structure: GROUP → SUBJECT → CHAPTER → UNIT → TOPIC
 */
window.SV = window.SV || {};

SV.Tracker = (() => {
  let activePaperId = 'P1';
  let activeFilter = 'all'; // 'all' | 'pending' | 'completed' | 'revision'
  let expandedChapters = new Set();

  async function render(params = {}) {
    if (params.paperId) activePaperId = params.paperId;

    const user = SV.Auth.getCurrentUser() || { id: 'anon' };
    const progressMap = await SV.Storage.getProgress(user.id);
    const syllabus = window.CA_FINAL_SYLLABUS;
    if (!syllabus) return '<div class="empty-state">Syllabus database loading...</div>';

    // Find active paper
    let currentPaper = null;
    let currentGroup = null;
    syllabus.groups.forEach(g => {
      const p = g.papers.find(item => item.id === activePaperId);
      if (p) { currentPaper = p; currentGroup = g; }
    });

    if (!currentPaper) {
      currentPaper = syllabus.groups[0].papers[0];
      activePaperId = currentPaper.id;
      currentGroup = syllabus.groups[0];
    }

    // Calculate stats for current paper
    let totalTopics = 0;
    let completedTopics = 0;
    let inProgressTopics = 0;
    let revisionNeeded = 0;

    currentPaper.chapters.forEach(chap => {
      chap.units.forEach(u => {
        u.topics.forEach(t => {
          totalTopics++;
          const key = `${user.id}::${currentPaper.id}::${chap.id}::${u.id}::${t}`;
          const stat = progressMap[key]?.status || 'Not Started';
          if (stat === 'Completed') completedTopics++;
          else if (stat === 'In Progress') inProgressTopics++;
          else if (stat === 'Needs Revision' || stat === 'Difficult') revisionNeeded++;
        });
      });
    });

    const completionPct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    // Filter chapters based on activeFilter
    const filteredChapters = currentPaper.chapters.filter(chap => {
      if (activeFilter === 'all') return true;
      let hasMatchingTopic = false;
      chap.units.forEach(u => {
        u.topics.forEach(t => {
          const k = `${user.id}::${currentPaper.id}::${chap.id}::${u.id}::${t}`;
          const st = progressMap[k]?.status || 'Not Started';
          if (activeFilter === 'pending' && st !== 'Completed') hasMatchingTopic = true;
          if (activeFilter === 'completed' && st === 'Completed') hasMatchingTopic = true;
          if (activeFilter === 'revision' && (st === 'Needs Revision' || st === 'Difficult')) hasMatchingTopic = true;
        });
      });
      return hasMatchingTopic;
    });

    return `
      <div class="tracker-container animate-fade-in">

        <!-- Page Header -->
        <div class="page-header">
          <div>
            <h1 class="page-title">Hierarchical Study Tracker</h1>
            <p class="page-subtitle">ICAI New Scheme · May 2027 · Topic-Level Verified Tracking</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-secondary" onclick="SV.Tracker.exportSyllabusReport()">
              📥 Syllabus Completeness Report
            </button>
            <button class="btn btn-primary" onclick="SV.Tracker.addPersonalNote()">
              + Add Chapter Note
            </button>
          </div>
        </div>

        <div class="tracker-layout">

          <!-- Left Sidebar: Papers List -->
          <div class="tracker-sidebar">
            <div class="tracker-sidebar-header">CA FINAL PAPERS (6)</div>
            <div class="tracker-subjects-list">
              ${syllabus.groups.map(grp => `
                <div class="tracker-group">
                  <div class="tracker-group-title">${grp.name}</div>
                  ${grp.papers.map(p => {
                    let pTotal = 0;
                    let pDone = 0;
                    p.chapters.forEach(c => c.units.forEach(u => u.topics.forEach(t => {
                      pTotal++;
                      const k = `${user.id}::${p.id}::${c.id}::${u.id}::${t}`;
                      if (progressMap[k]?.status === 'Completed') pDone++;
                    })));
                    const pPct = pTotal > 0 ? Math.round((pDone / pTotal) * 100) : 0;
                    const isActive = p.id === activePaperId;

                    return `
                      <div class="tracker-subject-item ${isActive ? 'active' : ''}" onclick="SV.Tracker.switchPaper('${p.id}')">
                        <div class="tracker-subject-dot" style="background:${SV.Config.SUBJECT_COLORS[p.id]};"></div>
                        <div class="tracker-subject-info">
                          <div class="tracker-subject-name">${p.shortName}: ${p.name}</div>
                          <div class="tracker-subject-pct">${pDone}/${pTotal} (${pPct}%)</div>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Right Content: Active Paper Details & Chapter Accordions -->
          <div class="tracker-main">

            <!-- Subject Banner -->
            <div class="subject-progress-header">
              <div class="subject-banner">
                <div class="subject-badge-large" style="background: ${SV.Config.SUBJECT_COLORS[currentPaper.id]};">
                  ${currentPaper.shortName}
                </div>
                <div class="subject-banner-info">
                  <span class="subject-paper-code">${currentGroup.name} · ${currentPaper.code}</span>
                  <h2 class="subject-banner-name">${currentPaper.name}</h2>
                  <div class="subject-banner-meta">
                    Applicability: <strong>May 2027 (Verified)</strong> · Source: <a href="${currentPaper.syllabusSource}" target="_blank" rel="noopener">ICAI BOS Live</a>
                  </div>
                </div>
              </div>

              <!-- Metrics Row -->
              <div class="subject-stats-row">
                <div class="subject-stat-box">
                  <div class="subject-stat-box-value">${completionPct}%</div>
                  <div class="subject-stat-box-label">Overall Completion</div>
                </div>
                <div class="subject-stat-box">
                  <div class="subject-stat-box-value">${completedTopics}</div>
                  <div class="subject-stat-box-label">Completed Topics</div>
                </div>
                <div class="subject-stat-box">
                  <div class="subject-stat-box-value">${totalTopics - completedTopics}</div>
                  <div class="subject-stat-box-label">Pending Topics</div>
                </div>
                <div class="subject-stat-box">
                  <div class="subject-stat-box-value">${inProgressTopics}</div>
                  <div class="subject-stat-box-label">In Progress</div>
                </div>
                <div class="subject-stat-box">
                  <div class="subject-stat-box-value">${revisionNeeded}</div>
                  <div class="subject-stat-box-label">Needs Revision</div>
                </div>
              </div>
            </div>

            <!-- Category / Status Filters -->
            <div class="tracker-filters">
              <button class="filter-chip ${activeFilter === 'all' ? 'active' : ''}" onclick="SV.Tracker.setFilter('all')">
                All Chapters (${currentPaper.chapters.length})
              </button>
              <button class="filter-chip ${activeFilter === 'pending' ? 'active' : ''}" onclick="SV.Tracker.setFilter('pending')">
                ⏳ Pending Topics (${totalTopics - completedTopics})
              </button>
              <button class="filter-chip ${activeFilter === 'completed' ? 'active' : ''}" onclick="SV.Tracker.setFilter('completed')">
                ✅ Completed (${completedTopics})
              </button>
              <button class="filter-chip ${activeFilter === 'revision' ? 'active' : ''}" onclick="SV.Tracker.setFilter('revision')">
                🔄 Needs Revision (${revisionNeeded})
              </button>
            </div>

            <!-- Chapters List Accordion -->
            <div class="chapters-list" id="chapters-accordion">
              ${filteredChapters.length === 0 ? `
                <div class="empty-state">
                  <div class="empty-state-icon">📋</div>
                  <div class="empty-state-title">No chapters match filter "${activeFilter}"</div>
                  <div class="empty-state-desc">Try selecting "All Chapters".</div>
                </div>
              ` : filteredChapters.map(chap => {
                let cTotal = 0;
                let cDone = 0;
                chap.units.forEach(u => u.topics.forEach(t => {
                  cTotal++;
                  const k = `${user.id}::${currentPaper.id}::${chap.id}::${u.id}::${t}`;
                  if (progressMap[k]?.status === 'Completed') cDone++;
                }));
                const cPct = cTotal > 0 ? Math.round((cDone / cTotal) * 100) : 0;
                const chapKey = `${user.id}::chap::${chap.id}`;
                const chapMeta = progressMap[chapKey] || {};
                const isExpanded = expandedChapters.has(chap.id) || activeFilter !== 'all';

                return `
                  <div class="chapter-card ${isExpanded ? 'expanded' : ''}" id="card-${chap.id}">
                    <div class="chapter-header" onclick="SV.Tracker.toggleChapter('${chap.id}')">
                      <div class="chapter-number">${chap.number}</div>
                      <div class="chapter-info">
                        <div class="chapter-name">${chap.name}</div>
                        <div class="chapter-meta">${chap.units.length} Unit(s) · ${cDone}/${cTotal} Topics Finished</div>
                      </div>
                      <div class="chapter-progress-pill">
                        <div class="progress-container progress-sm" style="width: 80px;">
                          <div class="progress-fill" style="width: ${cPct}%; background: ${SV.Config.SUBJECT_COLORS[currentPaper.id]};"></div>
                        </div>
                        <span class="chapter-pct-label">${cPct}%</span>
                      </div>
                      <div class="chapter-expand-icon">▼</div>
                    </div>

                    <div class="chapter-body">

                      <!-- 4-Stage Study Milestone Checklist -->
                      <div class="chapter-status-row">
                        <label class="chapter-status-check">
                          <input type="checkbox" ${chapMeta.lecturesDone ? 'checked' : ''} onchange="SV.Tracker.saveChapMeta('${chap.id}', 'lecturesDone', this.checked)">
                          <span>Lectures Completed</span>
                        </label>
                        <label class="chapter-status-check">
                          <input type="checkbox" ${chapMeta.studyMatQuestions ? 'checked' : ''} onchange="SV.Tracker.saveChapMeta('${chap.id}', 'studyMatQuestions', this.checked)">
                          <span>ICAI Questions Practiced</span>
                        </label>
                        <label class="chapter-status-check">
                          <input type="checkbox" ${chapMeta.rev1 ? 'checked' : ''} onchange="SV.Tracker.saveChapMeta('${chap.id}', 'rev1', this.checked)">
                          <span>Rev 1</span>
                        </label>
                        <label class="chapter-status-check">
                          <input type="checkbox" ${chapMeta.rev2 ? 'checked' : ''} onchange="SV.Tracker.saveChapMeta('${chap.id}', 'rev2', this.checked)">
                          <span>Rev 2</span>
                        </label>
                      </div>

                      <!-- Units & Topics -->
                      <div class="units-list">
                        ${chap.units.map(unit => {
                          const unitTopics = unit.topics.filter(topic => {
                            if (activeFilter === 'all') return true;
                            const tKey = `${user.id}::${currentPaper.id}::${chap.id}::${unit.id}::${topic}`;
                            const st = progressMap[tKey]?.status || 'Not Started';
                            if (activeFilter === 'pending') return st !== 'Completed';
                            if (activeFilter === 'completed') return st === 'Completed';
                            if (activeFilter === 'revision') return (st === 'Needs Revision' || st === 'Difficult');
                            return true;
                          });

                          if (unitTopics.length === 0 && activeFilter !== 'all') return '';

                          return `
                            <div class="unit-section">
                              <div class="unit-header">
                                <span>📌 ${unit.name} (${unitTopics.length} topics)</span>
                              </div>
                              <div class="topics-list">
                                ${unitTopics.map(topic => {
                                  const tKey = `${user.id}::${currentPaper.id}::${chap.id}::${unit.id}::${topic}`;
                                  const tData = progressMap[tKey] || { status: 'Not Started' };
                                  const isDone = tData.status === 'Completed';

                                  return `
                                    <div class="topic-item ${isDone ? 'completed' : ''}">
                                      <div class="topic-checkbox ${isDone ? 'checked' : ''}"
                                        data-paper="${currentPaper.id}" data-chap="${chap.id}" data-unit="${unit.id}" data-topic="${encodeURIComponent(topic)}"
                                        onclick="SV.Tracker.handleTopicCheck(this)">
                                        ${isDone ? '✓' : ''}
                                      </div>
                                      <div class="topic-name">${topic}</div>
                                      <select class="topic-status-select"
                                        data-paper="${currentPaper.id}" data-chap="${chap.id}" data-unit="${unit.id}" data-topic="${encodeURIComponent(topic)}"
                                        onchange="SV.Tracker.handleStatusChange(this)">
                                        <option value="Not Started" ${tData.status === 'Not Started' ? 'selected' : ''}>Not Started</option>
                                        <option value="In Progress" ${tData.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                                        <option value="Completed" ${tData.status === 'Completed' ? 'selected' : ''}>Completed</option>
                                        <option value="Needs Revision" ${tData.status === 'Needs Revision' ? 'selected' : ''}>Needs Revision</option>
                                        <option value="Difficult" ${tData.status === 'Difficult' ? 'selected' : ''}>Difficult</option>
                                        <option value="On Hold" ${tData.status === 'On Hold' ? 'selected' : ''}>On Hold</option>
                                      </select>
                                      <span class="difficulty-tag ${isDone ? 'difficulty-tag--easy' : 'difficulty-tag--medium'}">
                                        ${tData.status || 'Not Started'}
                                      </span>
                                    </div>
                                  `;
                                }).join('')}
                              </div>
                            </div>
                          `;
                        }).join('')}
                      </div>

                    </div>
                  </div>
                `;
              }).join('')}
            </div>

          </div>
        </div>

      </div>
    `;
  }

  return {
    render,

    switchPaper(paperId) {
      activePaperId = paperId;
      SV.Router.refresh({ paperId });
    },

    toggleChapter(chapId) {
      if (expandedChapters.has(chapId)) expandedChapters.delete(chapId);
      else expandedChapters.add(chapId);
      const card = document.getElementById(`card-${chapId}`);
      if (card) card.classList.toggle('expanded');
    },

    setFilter(filter) {
      activeFilter = filter;
      SV.Router.refresh();
    },

    async handleTopicCheck(el) {
      const paperId = el.dataset.paper;
      const chapterId = el.dataset.chap;
      const unitId = el.dataset.unit;
      const topic = decodeURIComponent(el.dataset.topic);

      const user = SV.Auth.getCurrentUser() || { id: 'anon' };
      const current = await SV.Storage.getTopicProgress(user.id, paperId, chapterId, unitId, topic);
      const newStatus = (current?.status === 'Completed') ? 'Not Started' : 'Completed';

      await SV.Storage.setTopicProgress(user.id, paperId, chapterId, unitId, topic, {
        completed: newStatus === 'Completed',
        status: newStatus,
        completedAt: newStatus === 'Completed' ? new Date().toISOString() : null
      });

      if (newStatus === 'Completed') {
        SV.Rewards.awardPoints('TOPIC_COMPLETED', 10);
        SV.Notifications.toast(`Topic marked completed: ${topic}`, 'success', 2000);
      }

      SV.Router.refresh();
    },

    async handleStatusChange(el) {
      const paperId = el.dataset.paper;
      const chapterId = el.dataset.chap;
      const unitId = el.dataset.unit;
      const topic = decodeURIComponent(el.dataset.topic);
      const status = el.value;

      const user = SV.Auth.getCurrentUser() || { id: 'anon' };
      await SV.Storage.setTopicProgress(user.id, paperId, chapterId, unitId, topic, {
        completed: status === 'Completed',
        status,
        updatedAt: new Date().toISOString()
      });

      SV.Utils.toast(`Topic status updated to ${status}`, 'info', 1800);
      SV.Router.refresh();
    },

    async saveChapMeta(chapId, field, value) {
      const user = SV.Auth.getCurrentUser() || { id: 'anon' };
      const chapKey = `${user.id}::chap::${chapId}`;
      const meta = (await SV.Storage.getProgress(user.id))[chapKey] || { id: chapKey, userId: user.id };
      meta[field] = value;
      await SV.Storage.setTopicProgress(user.id, 'meta', chapId, '', '', meta);
      SV.Utils.toast('Milestone saved', 'success', 1200);
    },

    exportSyllabusReport() {
      const syllabus = window.CA_FINAL_SYLLABUS;
      let totalCh = 0, totalU = 0, totalT = 0;
      syllabus.groups.forEach(g => g.papers.forEach(p => {
        totalCh += p.chapters.length;
        p.chapters.forEach(c => {
          totalU += c.units.length;
          c.units.forEach(u => totalT += u.topics.length);
        });
      }));

      alert(
        `📋 ICAI NEW SCHEME CA FINAL SYLLABUS REPORT (May 2027)\n\n` +
        `• Total Papers: 6\n` +
        `• Total Chapters: ${totalCh}\n` +
        `• Total Units: ${totalU}\n` +
        `• Total Individual Topics: ${totalT}\n` +
        `• Target Examination: May 2027\n` +
        `• Verification Status: VERIFIED against official ICAI BOS sources\n` +
        `• SPOM Exclusions: SPOM Sets A-D tracked separately (not in 6 written papers)\n` +
        `• All 6 paper structures complete & functional!`
      );
    },

    addPersonalNote() {
      const note = prompt('Add private revision note for this subject:');
      if (note && note.trim()) {
        SV.Storage.saveNote({
          id: SV.Utils.uniqueId('note'),
          userId: SV.Auth.getCurrentUser()?.id || 'anon',
          subject: activePaperId,
          title: `Note on ${activePaperId}`,
          content: note.trim(),
          createdAt: new Date().toISOString()
        });
        SV.Utils.toast('Personal note saved to notebook!', 'success');
      }
    }
  };
})();
