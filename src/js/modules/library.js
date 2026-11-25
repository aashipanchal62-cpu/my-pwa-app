/**
 * STUDYVERSE – Resource Library (ICAI & CA Study Materials) Module
 * library.js
 * Exclusively calibrated for CA Final May 2027 (ICAI New Scheme)
 * Supports manual file upload (PDF/images/docs), anonymous community sharing,
 * and resilient multi-category filtering.
 */
window.SV = window.SV || {};

SV.Library = (() => {
  let activePaperFilter = 'all'; // 'all' | 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6'
  let activeCategoryFilter = 'all'; // 'all' | 'Official ICAI Material' | 'Additional Study Resources' | 'Personal Library' | 'Bookmarks'
  let activeTypeFilter = 'all'; // 'all' | specific type string
  let searchQuery = '';
  let cachedUserUploads = [];

  async function loadUserUploads() {
    try {
      const user = SV.Auth.getCurrentUser() || { id: 'anon' };
      cachedUserUploads = (await SV.Storage.getUserResources(user.id)) || [];
    } catch {
      cachedUserUploads = SV.Storage.LS.get('USER_RESOURCES') || [];
    }
    return cachedUserUploads;
  }

  function getCombinedResources() {
    const list = [...(window.CA_RESOURCES_DATA || [])];

    // Read stored user uploads from IndexedDB cache
    list.unshift(...cachedUserUploads);

    // Read stored user bookmarks
    const bookmarks = SV.Storage.LS.get('BOOKMARKS') || {};
    list.forEach(r => {
      if (bookmarks[r.id] !== undefined) {
        r.bookmark = bookmarks[r.id];
      }
    });

    return list;
  }

  function filterResources(all) {
    return all.filter(res => {
      // 1. Paper filter
      if (activePaperFilter !== 'all' && res.paperId !== activePaperFilter) return false;

      // 2. Category filter
      if (activeCategoryFilter === 'Bookmarks') {
        if (!res.bookmark) return false;
      } else if (activeCategoryFilter !== 'all') {
        const normResCat = (res.category || '').trim().toLowerCase();
        const normFilter = activeCategoryFilter.trim().toLowerCase();
        if (normResCat !== normFilter) return false;
      }

      // 3. Resource Type filter
      if (activeTypeFilter !== 'all' && activeTypeFilter !== 'All Types') {
        if (res.type !== activeTypeFilter) return false;
      }

      // 4. Keyword search
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = res.name && res.name.toLowerCase().includes(q);
        const matchType = res.type && res.type.toLowerCase().includes(q);
        const matchDesc = res.description && res.description.toLowerCase().includes(q);
        const matchPaper = res.paperName && res.paperName.toLowerCase().includes(q);
        if (!matchName && !matchType && !matchDesc && !matchPaper) return false;
      }

      return true;
    });
  }

  function getCategoryCounts(all) {
    const pool = activePaperFilter === 'all' ? all : all.filter(r => r.paperId === activePaperFilter);
    const match = (cat) => pool.filter(r => (r.category || '').trim().toLowerCase() === cat.trim().toLowerCase()).length;
    return {
      all: pool.length,
      official: match('Official ICAI Material'),
      additional: match('Additional Study Resources'),
      personal: match('Personal Library'),
      bookmarks: pool.filter(r => r.bookmark).length
    };
  }

  function getAvailableTypes(all) {
    let pool = all;
    if (activePaperFilter !== 'all') {
      pool = pool.filter(r => r.paperId === activePaperFilter);
    }
    if (activeCategoryFilter === 'Bookmarks') {
      pool = pool.filter(r => r.bookmark);
    } else if (activeCategoryFilter !== 'all') {
      const normFilter = activeCategoryFilter.trim().toLowerCase();
      pool = pool.filter(r => (r.category || '').trim().toLowerCase() === normFilter);
    }

    const types = ['All Types'];
    pool.forEach(r => {
      if (r.type && !types.includes(r.type)) {
        types.push(r.type);
      }
    });
    return types;
  }

  function renderCardHTML(item, query = '') {
    const isPersonal = item.category === 'Personal Library';
    return `
      <div class="card" style="display:flex; flex-direction:column; justify-content:space-between; transition:transform 0.2s;" onmouseenter="this.style.transform='translateY(-3px)'" onmouseleave="this.style.transform='none'">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <span class="badge ${item.isOfficial ? 'badge-primary' : 'badge-info'}">${item.type}</span>
            <span class="badge badge-muted">${item.paperName || item.paperId}</span>
          </div>
          <h3 style="font-size:15px; font-weight:600; margin-bottom:8px; line-height:1.4;">
            ${query ? SV.Utils.highlight(item.name, query) : item.name}
          </h3>
          <p style="font-size:12px; color:var(--text-secondary); line-height:1.5; margin-bottom:12px;">
            ${item.description || 'Comprehensive study resource for CA Final preparation.'}
          </p>
          <div style="font-size:11px; color:var(--text-tertiary); margin-bottom:12px;">
            Category: <strong>${item.category}</strong><br>
            Source: <strong>${item.source || 'ICAI'}</strong> · Applicability: ${item.attempt || 'May 2027'}
            ${item.fileName ? `<br>File: <span style="color:var(--brand-primary); font-weight:600;">📎 ${item.fileName}</span>` : ''}
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:8px; border-top:1px solid var(--border-light); padding-top:12px;">
          <div style="display:flex; gap:6px;">
            ${item.fileData ? `
              <button class="btn btn-sm btn-primary flex-1 justify-center" onclick="SV.Library.viewUploadedFile('${item.id}')">
                👁 View File
              </button>
              <button class="btn btn-sm btn-secondary" onclick="SV.Library.downloadUploadedFile('${item.id}')" title="Download File">
                ⬇ Download
              </button>
            ` : (item.link && item.link !== '#' ? `
              <a href="${item.link}" target="_blank" rel="noopener" class="btn btn-sm btn-primary flex-1 justify-center">
                Official Link ↗
              </a>
            ` : `
              <button class="btn btn-sm btn-primary flex-1 justify-center" onclick="SV.Library.openViewer('${item.name.replace(/'/g, "\\'")}', '${item.id}')">
                Open Document
              </button>
            `)}
            <button class="btn btn-sm ${item.bookmark ? 'btn-primary' : 'btn-secondary'}" onclick="SV.Library.toggleBookmark('${item.id}')" title="Bookmark Resource">
              ${item.bookmark ? '★' : '☆'}
            </button>
            <button class="btn btn-sm btn-secondary" onclick="SV.Library.summarizeWithAI('${item.name.replace(/'/g, "\\'")}')" title="Summarize with Studyverse AI">
              🤖 AI
            </button>
          </div>
          ${isPersonal ? `
            <button class="btn btn-sm btn-secondary w-full" style="font-size:11px;" onclick="SV.Library.quickShareToCommunity('${item.id}')">
              🌐 Share Anonymously to Community Library
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  async function render(params = {}) {
    if (params.filterPaper) activePaperFilter = params.filterPaper;
    if (params.filterCategory) {
      activeCategoryFilter = params.filterCategory;
      activeTypeFilter = 'all';
    }

    await loadUserUploads();
    const allResources = getCombinedResources();
    const counts = getCategoryCounts(allResources);
    const availableTypes = getAvailableTypes(allResources);
    const filtered = filterResources(allResources);

    return `
      <div class="library-container animate-fade-in">

        <div class="page-header">
          <div>
            <h1 class="page-title">CA Final Resource Library</h1>
            <p class="page-subtitle">Official ICAI BoS Material · Authorized Links · May 2027 Syllabus · Personal Library</p>
          </div>
          <div class="page-actions" style="display:flex; gap:10px; flex-wrap:wrap;">
            <button class="btn btn-primary" onclick="SV.Library.openUploadModal()">
              📤 Upload Personal Note / PDF
            </button>
            <button class="btn btn-secondary" onclick="SV.Router.navigate('/shared-lib')">
              🌐 Open Community Library
            </button>
            <a href="https://boslive.icai.org/" target="_blank" rel="noopener" class="btn btn-secondary">
              ICAI BOS Live ↗
            </a>
          </div>
        </div>

        <!-- Filter Controls Bar -->
        <div class="card mb-6" style="padding: 20px;">
          <div style="display:flex; flex-direction:column; gap:16px;">

            <!-- Search input -->
            <div style="display:flex; gap:12px; align-items:center;">
              <div style="position:relative; flex:1;">
                <input type="text" id="library-search-input" class="form-input"
                  placeholder="Search by topic, Ind AS standard, RTP, MTP, Saransh, formula..."
                  value="${searchQuery}" oninput="SV.Library.handleSearch(this.value)">
              </div>
              <button class="btn btn-secondary" onclick="SV.Library.resetFilters()">Reset All Filters</button>
            </div>

            <!-- Subject Paper Filters -->
            <div>
              <div style="font-size:11px; font-weight:700; text-transform:uppercase; color:var(--text-tertiary); letter-spacing:1px; margin-bottom:8px;">
                Filter By Subject Paper:
              </div>
              <div id="lib-paper-chips" style="display:flex; gap:8px; flex-wrap:wrap;">
                <button type="button" class="filter-chip ${activePaperFilter === 'all' ? 'active' : ''}" onclick="SV.Library.setPaperFilter('all')">All Papers (6)</button>
                <button type="button" class="filter-chip ${activePaperFilter === 'P1' ? 'active' : ''}" onclick="SV.Library.setPaperFilter('P1')">P1: FR</button>
                <button type="button" class="filter-chip ${activePaperFilter === 'P2' ? 'active' : ''}" onclick="SV.Library.setPaperFilter('P2')">P2: AFM</button>
                <button type="button" class="filter-chip ${activePaperFilter === 'P3' ? 'active' : ''}" onclick="SV.Library.setPaperFilter('P3')">P3: Audit & Ethics</button>
                <button type="button" class="filter-chip ${activePaperFilter === 'P4' ? 'active' : ''}" onclick="SV.Library.setPaperFilter('P4')">P4: Direct Tax</button>
                <button type="button" class="filter-chip ${activePaperFilter === 'P5' ? 'active' : ''}" onclick="SV.Library.setPaperFilter('P5')">P5: Indirect Tax</button>
                <button type="button" class="filter-chip ${activePaperFilter === 'P6' ? 'active' : ''}" onclick="SV.Library.setPaperFilter('P6')">P6: Integrated Business Solutions</button>
              </div>
            </div>

            <!-- Primary Category Options -->
            <div style="border-top:1px solid var(--border-light); padding-top:14px;">
              <div style="font-size:11px; font-weight:700; text-transform:uppercase; color:var(--text-tertiary); letter-spacing:1px; margin-bottom:8px;">
                Category Options:
              </div>
              <div id="lib-category-chips" style="display:flex; gap:8px; flex-wrap:wrap;">
                <button type="button" class="filter-chip ${activeCategoryFilter === 'all' ? 'active' : ''}" onclick="SV.Library.setCatFilter('all')">
                  📁 All Categories (${counts.all})
                </button>
                <button type="button" class="filter-chip ${activeCategoryFilter === 'Official ICAI Material' ? 'active' : ''}" onclick="SV.Library.setCatFilter('Official ICAI Material')">
                  🏛️ Official ICAI Materials (${counts.official})
                </button>
                <button type="button" class="filter-chip ${activeCategoryFilter === 'Additional Study Resources' ? 'active' : ''}" onclick="SV.Library.setCatFilter('Additional Study Resources')">
                  📚 Additional Study Resources (${counts.additional})
                </button>
                <button type="button" class="filter-chip ${activeCategoryFilter === 'Personal Library' ? 'active' : ''}" onclick="SV.Library.setCatFilter('Personal Library')">
                  📂 Personal Library & Uploads (${counts.personal})
                </button>
                <button type="button" class="filter-chip ${activeCategoryFilter === 'Bookmarks' ? 'active' : ''}" onclick="SV.Library.setCatFilter('Bookmarks')">
                  ⭐ Bookmarks (${counts.bookmarks})
                </button>
              </div>
            </div>

            <!-- Secondary Resource Type Filter -->
            <div style="border-top:1px solid var(--border-light); padding-top:14px;">
              <div style="font-size:11px; font-weight:700; text-transform:uppercase; color:var(--text-tertiary); letter-spacing:1px; margin-bottom:8px;">
                Resource Type:
              </div>
              <div id="lib-type-chips" style="display:flex; gap:8px; flex-wrap:wrap;">
                ${availableTypes.map(t => {
                  const isAct = (activeTypeFilter === t) || (activeTypeFilter === 'all' && t === 'All Types');
                  return `
                    <button type="button" class="filter-chip ${isAct ? 'active' : ''}" style="font-size:11px; padding:4px 10px;" onclick="SV.Library.setTypeFilter('${t}')">
                      ${t}
                    </button>
                  `;
                }).join('')}
              </div>
            </div>

          </div>
        </div>

        <!-- Result Status Banner -->
        <div id="library-status-banner" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <div style="font-size:13px; color:var(--text-secondary);">
            Showing <strong>${filtered.length}</strong> resources in 
            <span class="badge badge-primary">${activeCategoryFilter === 'all' ? 'All Categories' : activeCategoryFilter}</span>
            ${activeTypeFilter !== 'all' && activeTypeFilter !== 'All Types' ? `<span class="badge badge-info">${activeTypeFilter}</span>` : ''}
            ${activePaperFilter !== 'all' ? `<span class="badge badge-muted">${activePaperFilter}</span>` : ''}
          </div>
        </div>

        <!-- Resources Cards Grid -->
        <div class="grid-auto" id="library-cards-grid">
          ${filtered.length === 0 ? `
            <div class="empty-state" style="grid-column: 1 / -1; padding:40px 20px;">
              <div class="empty-state-icon">📂</div>
              <div class="empty-state-title">No resources match your active filters</div>
              <div class="empty-state-desc">Try clearing your search query or selecting "All Categories" / "All Papers".</div>
              <div style="display:flex; gap:10px; justify-content:center; margin-top:12px;">
                <button class="btn btn-primary" onclick="SV.Library.resetFilters()">Reset All Filters</button>
                <button class="btn btn-secondary" onclick="SV.Library.openUploadModal()">Upload to this Category</button>
              </div>
            </div>
          ` : filtered.map(item => renderCardHTML(item, searchQuery)).join('')}
        </div>

      </div>
    `;
  }

  function applyFiltersInPlace() {
    const grid = document.getElementById('library-cards-grid');
    if (!grid) {
      SV.Router.navigate('/library');
      return;
    }

    const allResources = getCombinedResources();
    const counts = getCategoryCounts(allResources);
    const availableTypes = getAvailableTypes(allResources);
    const filtered = filterResources(allResources);

    // 1. Update Paper Chips
    const paperChips = document.getElementById('lib-paper-chips');
    if (paperChips) {
      const papers = [
        { id: 'all', label: 'All Papers (6)' },
        { id: 'P1', label: 'P1: FR' },
        { id: 'P2', label: 'P2: AFM' },
        { id: 'P3', label: 'P3: Audit & Ethics' },
        { id: 'P4', label: 'P4: Direct Tax' },
        { id: 'P5', label: 'P5: Indirect Tax' },
        { id: 'P6', label: 'P6: Integrated Business Solutions' },
      ];
      paperChips.innerHTML = papers.map(p => `
        <button type="button" class="filter-chip ${activePaperFilter === p.id ? 'active' : ''}" onclick="SV.Library.setPaperFilter('${p.id}')">
          ${p.label}
        </button>
      `).join('');
    }

    // 2. Update Category Chips
    const catChips = document.getElementById('lib-category-chips');
    if (catChips) {
      catChips.innerHTML = `
        <button type="button" class="filter-chip ${activeCategoryFilter === 'all' ? 'active' : ''}" onclick="SV.Library.setCatFilter('all')">
          📁 All Categories (${counts.all})
        </button>
        <button type="button" class="filter-chip ${activeCategoryFilter === 'Official ICAI Material' ? 'active' : ''}" onclick="SV.Library.setCatFilter('Official ICAI Material')">
          🏛️ Official ICAI Materials (${counts.official})
        </button>
        <button type="button" class="filter-chip ${activeCategoryFilter === 'Additional Study Resources' ? 'active' : ''}" onclick="SV.Library.setCatFilter('Additional Study Resources')">
          📚 Additional Study Resources (${counts.additional})
        </button>
        <button type="button" class="filter-chip ${activeCategoryFilter === 'Personal Library' ? 'active' : ''}" onclick="SV.Library.setCatFilter('Personal Library')">
          📂 Personal Library & Uploads (${counts.personal})
        </button>
        <button type="button" class="filter-chip ${activeCategoryFilter === 'Bookmarks' ? 'active' : ''}" onclick="SV.Library.setCatFilter('Bookmarks')">
          ⭐ Bookmarks (${counts.bookmarks})
        </button>
      `;
    }

    // 3. Update Type Chips
    const typeChips = document.getElementById('lib-type-chips');
    if (typeChips) {
      typeChips.innerHTML = availableTypes.map(t => {
        const isAct = (activeTypeFilter === t) || (activeTypeFilter === 'all' && t === 'All Types');
        return `
          <button type="button" class="filter-chip ${isAct ? 'active' : ''}" style="font-size:11px; padding:4px 10px;" onclick="SV.Library.setTypeFilter('${t}')">
            ${t}
          </button>
        `;
      }).join('');
    }

    // 4. Update Status Banner
    const banner = document.getElementById('library-status-banner');
    if (banner) {
      banner.innerHTML = `
        <div style="font-size:13px; color:var(--text-secondary);">
          Showing <strong>${filtered.length}</strong> resources in 
          <span class="badge badge-primary">${activeCategoryFilter === 'all' ? 'All Categories' : activeCategoryFilter}</span>
          ${activeTypeFilter !== 'all' && activeTypeFilter !== 'All Types' ? `<span class="badge badge-info">${activeTypeFilter}</span>` : ''}
          ${activePaperFilter !== 'all' ? `<span class="badge badge-muted">${activePaperFilter}</span>` : ''}
        </div>
      `;
    }

    // 5. Update Grid
    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1; padding:40px 20px;">
          <div class="empty-state-icon">📂</div>
          <div class="empty-state-title">No resources match your active filters</div>
          <div class="empty-state-desc">Try clearing your search query or selecting "All Categories" / "All Papers".</div>
          <div style="display:flex; gap:10px; justify-content:center; margin-top:12px;">
            <button class="btn btn-primary" onclick="SV.Library.resetFilters()">Reset All Filters</button>
            <button class="btn btn-secondary" onclick="SV.Library.openUploadModal()">Upload to this Category</button>
          </div>
        </div>
      `;
    } else {
      grid.innerHTML = filtered.map(item => renderCardHTML(item, searchQuery)).join('');
    }
  }

  return {
    render,

    setPaperFilter(paper) {
      activePaperFilter = paper;
      applyFiltersInPlace();
    },

    setCatFilter(cat) {
      activeCategoryFilter = cat;
      activeTypeFilter = 'all'; // Always reset type filter when switching categories
      applyFiltersInPlace();
    },

    setTypeFilter(type) {
      activeTypeFilter = (type === 'All Types') ? 'all' : type;
      applyFiltersInPlace();
    },

    handleSearch(query) {
      searchQuery = query;
      applyFiltersInPlace();
    },

    resetFilters() {
      activePaperFilter = 'all';
      activeCategoryFilter = 'all';
      activeTypeFilter = 'all';
      searchQuery = '';
      const input = document.getElementById('library-search-input');
      if (input) input.value = '';
      applyFiltersInPlace();
    },

    toggleBookmark(resId) {
      const bookmarks = SV.Storage.LS.get('BOOKMARKS') || {};
      bookmarks[resId] = !bookmarks[resId];
      SV.Storage.LS.set('BOOKMARKS', bookmarks);

      const all = getCombinedResources();
      const res = all.find(r => r.id === resId);
      if (res) res.bookmark = bookmarks[resId];

      SV.Utils.toast(bookmarks[resId] ? 'Added to Bookmarks ⭐' : 'Removed from Bookmarks', 'info', 1500);
      applyFiltersInPlace();
    },

    openViewer(title, id) {
      const all = getCombinedResources();
      const res = all.find(r => r.id === id);
      if (res && res.fileData) {
        this.viewUploadedFile(id);
        return;
      }

      const modal = document.createElement('div');
      modal.className = 'modal-backdrop';
      modal.innerHTML = `
        <div class="modal modal-lg">
          <div class="modal-header">
            <h3 class="modal-title">📖 ${title}</h3>
            <span class="modal-close" onclick="this.closest('.modal-backdrop').remove()">✕</span>
          </div>
          <div class="modal-body">
            <div style="background:var(--bg-surface-2); padding:20px; border-radius:8px; margin-bottom:16px;">
              <h4 style="font-weight:700; margin-bottom:8px;">ICAI May 2027 Authorized Study Module</h4>
              <p style="font-size:13px; line-height:1.6; color:var(--text-secondary);">
                This study resource incorporates the complete conceptual provisions, statutory references, and practical illustrations specified by the ICAI Board of Studies for May 2027.
              </p>
            </div>
            <div style="font-size:13px; line-height:1.6;">
              <strong>Key Study Guidelines:</strong><br>
              • Complete all End-of-Chapter illustrations.<br>
              • Focus on practical adjustments and presentation standards.<br>
              • Test yourself using the STUDYVERSE Mock Test & Practice Centre.
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="this.closest('.modal-backdrop').remove()">Close</button>
            <a href="https://boslive.icai.org/" target="_blank" rel="noopener" class="btn btn-primary">Open on ICAI BOS Live ↗</a>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    },

    viewUploadedFile(id) {
      const all = getCombinedResources();
      const r = all.find(x => x.id === id);
      if (!r || !r.fileData) { alert('No attached file found for this resource.'); return; }

      if (r.fileType && r.fileType.startsWith('image/')) {
        const modal = document.createElement('div');
        modal.className = 'modal-backdrop';
        modal.innerHTML = `
          <div class="modal modal-lg">
            <div class="modal-header">
              <h3 class="modal-title">🖼️ ${r.name}</h3>
              <span class="modal-close" onclick="this.closest('.modal-backdrop').remove()">✕</span>
            </div>
            <div class="modal-body" style="text-align:center; padding:16px;">
              <img src="${r.fileData}" alt="${r.name}" style="max-width:100%; max-height:75vh; border-radius:8px; object-fit:contain;">
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" onclick="this.closest('.modal-backdrop').remove()">Close</button>
              <button class="btn btn-primary" onclick="SV.Library.downloadUploadedFile('${id}')">⬇ Download</button>
            </div>
          </div>`;
        document.body.appendChild(modal);
      } else if (r.fileType === 'application/pdf') {
        const modal = document.createElement('div');
        modal.className = 'modal-backdrop';
        modal.innerHTML = `
          <div class="modal" style="width:90vw; max-width:950px;">
            <div class="modal-header">
              <h3 class="modal-title">📄 ${r.name}</h3>
              <span class="modal-close" onclick="this.closest('.modal-backdrop').remove()">✕</span>
            </div>
            <div class="modal-body" style="padding:0; height:75vh;">
              <iframe src="${r.fileData}" style="width:100%; height:100%; border:none;"></iframe>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" onclick="this.closest('.modal-backdrop').remove()">Close</button>
              <button class="btn btn-primary" onclick="SV.Library.downloadUploadedFile('${id}')">⬇ Download PDF</button>
            </div>
          </div>`;
        document.body.appendChild(modal);
      } else {
        this.downloadUploadedFile(id);
      }
    },

    downloadUploadedFile(id) {
      const all = getCombinedResources();
      const r = all.find(x => x.id === id);
      if (!r || !r.fileData) { alert('No file available to download.'); return; }
      const a = document.createElement('a');
      a.href = r.fileData;
      a.download = r.fileName || `${r.name}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      SV.Utils.toast('Download started...', 'info', 1500);
    },

    async quickShareToCommunity(id) {
      const all = getCombinedResources();
      const r = all.find(x => x.id === id);
      if (!r) return;

      const shared = (await SV.Storage.getSharedResources()) || [];
      const already = shared.find(s => s.title === r.name && s.paperId === r.paperId);
      if (already) {
        SV.Utils.toast('Already shared to Community Library! 🌐', 'info', 2000);
        return;
      }

      const item = {
        id: SV.Utils.uniqueId('shared'),
        title: r.name,
        paperId: r.paperId,
        paperName: r.paperName || `Paper ${r.paperId.replace('P','')}`,
        type: r.type || 'Summary Notes',
        description: r.description || 'Uploaded from student library.',
        chapter: r.chapter || '',
        fileData: r.fileData || null,
        fileName: r.fileName || null,
        fileType: r.fileType || null,
        sharedAt: new Date().toISOString()
        // STRICT PRIVACY: Zero personal info included
      };

      await SV.Storage.saveSharedResource(item);
      SV.Utils.toast('Shared anonymously to Community Library! 🎉', 'success', 3000);
    },

    summarizeWithAI(title) {
      SV.Router.navigate('/ai', { prompt: `Summarize the core exam-oriented concepts of "${title}" for CA Final May 2027.` });
    },

    openUploadModal() {
      const modal = document.createElement('div');
      modal.className = 'modal-backdrop';
      modal.innerHTML = `
        <div class="modal modal-md">
          <div class="modal-header">
            <h3 class="modal-title">📤 Upload Personal Study Material</h3>
            <span class="modal-close" onclick="this.closest('.modal-backdrop').remove()">✕</span>
          </div>
          <div class="modal-body">
            <div class="card mb-3" style="background:#EFF6FF; border-left:3px solid #3B82F6; padding:12px;">
              <div style="font-size:12px; color:#1E3A8A; line-height:1.5;">
                🔒 <strong>Privacy Assured:</strong> Uploaded materials are stored in your private device database (IndexedDB).
                If you choose to share with the Community Library, your upload is posted <strong>100% anonymously</strong> as "STUDYVERSE Community" — your name and email are never shown.
              </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
              <div class="form-group">
                <label class="form-label">Subject Paper *</label>
                <select class="form-select" id="upload-paper">
                  <option value="P1">Paper 1: Financial Reporting</option>
                  <option value="P2">Paper 2: Advanced Financial Management</option>
                  <option value="P3">Paper 3: Advanced Auditing & Ethics</option>
                  <option value="P4">Paper 4: Direct Tax & Int'l Tax</option>
                  <option value="P5">Paper 5: Indirect Tax Laws</option>
                  <option value="P6">Paper 6: Integrated Business Solutions</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Resource Type *</label>
                <select class="form-select" id="upload-type">
                  <option value="Personal Note">Personal Note</option>
                  <option value="Handwritten Note">Handwritten Note</option>
                  <option value="Summary PDF">Summary PDF</option>
                  <option value="Formula Sheet">Formula Sheet</option>
                  <option value="Question Bank">Personal Question Bank</option>
                  <option value="Case Law Summary">Case Law Summary</option>
                </select>
              </div>
            </div>

            <div class="form-group mb-3">
              <label class="form-label">Resource Title *</label>
              <input type="text" class="form-input" id="upload-title" placeholder="e.g., My Handwritten Notes on Ind AS 116 Leases">
            </div>

            <div class="form-group mb-3">
              <label class="form-label">Description (Optional)</label>
              <textarea class="form-textarea" id="upload-desc" rows="2" placeholder="Key concepts, important exam adjustments, summary points..."></textarea>
            </div>

            <div class="form-group mb-3">
              <label class="form-label">Attach File (PDF, Image, Word DOCX, Excel, PPT, TXT)</label>
              <input type="file" class="form-input" id="upload-file" accept=".pdf,.png,.jpg,.jpeg,.webp,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.txt">
              <div style="font-size:11px; color:var(--text-tertiary); margin-top:4px;">
                All file formats supported with no file size limit. Stored securely in your device's IndexedDB.
              </div>
            </div>

            <div class="form-group mb-2" style="background:var(--bg-surface-2); padding:10px 12px; border-radius:8px;">
              <label style="display:flex; align-items:flex-start; gap:8px; cursor:pointer; font-size:13px; font-weight:500;">
                <input type="checkbox" id="upload-share-community" checked style="margin-top:3px;">
                <span>
                  🌐 <strong>Also share anonymously to Community Library</strong><br>
                  <span style="font-size:11px; color:var(--text-secondary); font-weight:normal;">
                    Help fellow CA aspirants! Your name/email will NOT be disclosed; posted as "STUDYVERSE Community".
                  </span>
                </span>
              </label>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="this.closest('.modal-backdrop').remove()">Cancel</button>
            <button class="btn btn-primary" id="upload-save-btn" onclick="SV.Library.saveUpload(this)">Upload & Save</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    },

    saveUpload(btn) {
      const title = document.getElementById('upload-title')?.value?.trim();
      const paper = document.getElementById('upload-paper')?.value || 'P1';
      const type  = document.getElementById('upload-type')?.value  || 'Personal Note';
      const desc  = document.getElementById('upload-desc')?.value?.trim() || 'Uploaded study material in personal student library.';
      const fileInput = document.getElementById('upload-file');
      const shareComm = document.getElementById('upload-share-community')?.checked;

      if (!title) { alert('Please enter a resource title.'); return; }

      const paperNames = {
        P1: 'Paper 1: Financial Reporting',
        P2: 'Paper 2: AFM',
        P3: 'Paper 3: Advanced Auditing & Ethics',
        P4: 'Paper 4: Direct Tax & Int\'l Tax',
        P5: 'Paper 5: Indirect Tax Laws',
        P6: 'Paper 6: Integrated Business Solutions'
      };

      const file = fileInput?.files?.[0];
      const user = SV.Auth.getCurrentUser() || { id: 'anon' };

      btn.textContent = 'Saving...';
      btn.disabled = true;

      const finishSave = async (fileData, fileName, fileType) => {
        try {
          const newRes = {
            id: SV.Utils.uniqueId('res-user'),
            userId: user.id,
            paperId: paper,
            paperName: paperNames[paper] || `Paper ${paper}`,
            name: title,
            category: 'Personal Library',
            type: type,
            source: 'Personal Upload',
            link: '#',
            attempt: user.examAttempt || 'May 2027',
            version: 'Personal v1',
            description: desc,
            isOfficial: false,
            bookmark: true,
            fileData: fileData || null,
            fileName: fileName || null,
            fileType: fileType || null,
            uploadedAt: new Date().toISOString()
          };

          // 1. Save to personal IndexedDB
          await SV.Storage.saveUserResource(newRes);
          cachedUserUploads.unshift(newRes);

          // 2. If community share was checked, push anonymously to shared_resources IndexedDB
          if (shareComm) {
            await SV.Storage.saveSharedResource({
              id: SV.Utils.uniqueId('shared'),
              title: title,
              paperId: paper,
              paperName: paperNames[paper] || paper,
              type: type,
              description: desc,
              chapter: '',
              fileData: fileData || null,
              fileName: fileName || null,
              fileType: fileType || null,
              sharedAt: new Date().toISOString()
              // STRICT PRIVACY: Zero personal info included
            });
          }

          activeCategoryFilter = 'Personal Library';
          activeTypeFilter = 'all';

          SV.Search.reindex();
          SV.Utils.toast(shareComm ? 'Uploaded & shared anonymously with community! 🎉' : 'Uploaded to your personal library! 📁', 'success', 3000);
          btn.closest('.modal-backdrop').remove();
          SV.Router.refresh();
        } catch (err) {
          console.error('[Library] Save upload failed:', err);
          alert('Could not save file: ' + err.message);
          btn.textContent = 'Upload & Save';
          btn.disabled = false;
        }
      };

      if (file) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        btn.textContent = `Reading file (${sizeMb} MB)...`;
        const reader = new FileReader();
        reader.onload = (e) => finishSave(e.target.result, file.name, file.type);
        reader.onerror = () => {
          alert('Error reading file from disk. Please try again.');
          btn.textContent = 'Upload & Save';
          btn.disabled = false;
        };
        reader.readAsDataURL(file);
      } else {
        finishSave(null, null, null);
      }
    }
  };
})();
