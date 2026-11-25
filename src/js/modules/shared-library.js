/**
 * STUDYVERSE – Shared Community Library
 * Uploaded resources are shared anonymously as "STUDYVERSE Community"
 * Personal info (uploader name/email) is NEVER disclosed
 */
window.SV = window.SV || {};

SV.SharedLibrary = (() => {
  let activeFilter = 'all';
  let searchQ = '';
  let cachedShared = [];

  async function loadShared() {
    try {
      cachedShared = (await SV.Storage.getSharedResources()) || [];
    } catch {
      cachedShared = SV.Storage.LS.get('SV_SHARED_LIBRARY') || [];
    }
    return cachedShared;
  }

  function getShared() {
    return cachedShared;
  }

  function filter(all) {
    return all.filter(r => {
      if (activeFilter !== 'all' && r.paperId !== activeFilter) return false;
      if (searchQ.trim()) {
        const q = searchQ.toLowerCase();
        return (r.title + r.description + r.paperName + r.type).toLowerCase().includes(q);
      }
      return true;
    });
  }

  async function render() {
    await loadShared();
    const all = getShared();
    const filtered = filter(all);

    return `
      <div class="library-container animate-fade-in">
        <div class="page-header">
          <div>
            <h1 class="page-title">🌐 Shared Community Library</h1>
            <p class="page-subtitle">Study materials shared by STUDYVERSE users · All uploads are anonymous · May 2027</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-primary" onclick="SV.SharedLibrary.openUploadModal()">
              📤 Share Your Study Material
            </button>
          </div>
        </div>

        <!-- Privacy Banner -->
        <div class="card mb-4" style="background:linear-gradient(135deg,#EEF0FF,#F0FDF4); border-left:4px solid var(--brand-primary);">
          <div style="display:flex; align-items:center; gap:14px;">
            <span style="font-size:28px;">🔒</span>
            <div>
              <div style="font-weight:700; font-size:14px; color:var(--brand-primary); margin-bottom:4px;">Your Privacy is Protected</div>
              <div style="font-size:13px; color:var(--text-secondary); line-height:1.5;">
                All shared materials appear as <strong>"STUDYVERSE Community"</strong>. Your name, email, and personal details are <strong>never visible</strong> to anyone.
                You retain full control — delete your uploads anytime from Settings.
              </div>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="card mb-4" style="padding:16px;">
          <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
            <input type="text" class="form-input" id="shared-search" placeholder="Search by topic, standard, keyword..."
              value="${searchQ}" oninput="SV.SharedLibrary.handleSearch(this.value)" style="max-width:260px;">
            <button class="filter-chip ${activeFilter==='all'?'active':''}" onclick="SV.SharedLibrary.setFilter('all')">All Papers</button>
            <button class="filter-chip ${activeFilter==='P1'?'active':''}" onclick="SV.SharedLibrary.setFilter('P1')">P1: FR</button>
            <button class="filter-chip ${activeFilter==='P2'?'active':''}" onclick="SV.SharedLibrary.setFilter('P2')">P2: AFM</button>
            <button class="filter-chip ${activeFilter==='P3'?'active':''}" onclick="SV.SharedLibrary.setFilter('P3')">P3: Audit</button>
            <button class="filter-chip ${activeFilter==='P4'?'active':''}" onclick="SV.SharedLibrary.setFilter('P4')">P4: DT</button>
            <button class="filter-chip ${activeFilter==='P5'?'active':''}" onclick="SV.SharedLibrary.setFilter('P5')">P5: IDT</button>
            <button class="filter-chip ${activeFilter==='P6'?'active':''}" onclick="SV.SharedLibrary.setFilter('P6')">P6: IBS</button>
          </div>
        </div>

        <!-- Cards -->
        <div class="grid-auto" id="shared-grid">
          ${filtered.length === 0 ? `
            <div class="empty-state" style="grid-column:1/-1; padding:60px 20px;">
              <div class="empty-state-icon">📚</div>
              <div class="empty-state-title">No shared materials yet!</div>
              <div class="empty-state-desc">Be the first to contribute. Your upload will help thousands of CA aspirants — anonymously.</div>
              <button class="btn btn-primary mt-3" onclick="SV.SharedLibrary.openUploadModal()">Share a Resource</button>
            </div>
          ` : filtered.map(r => `
            <div class="card" style="display:flex; flex-direction:column; justify-content:space-between; transition:transform 0.2s;"
              onmouseenter="this.style.transform='translateY(-3px)'" onmouseleave="this.style.transform='none'">
              <div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                  <span class="badge badge-primary">${r.type}</span>
                  <span class="badge badge-muted">${r.paperName}</span>
                </div>
                <h3 style="font-size:15px; font-weight:600; margin-bottom:8px; line-height:1.4;">${r.title}</h3>
                <p style="font-size:12px; color:var(--text-secondary); line-height:1.5; margin-bottom:12px;">${r.description || 'Community uploaded study resource.'}</p>
                <div style="font-size:11px; color:var(--text-tertiary); margin-bottom:4px;">
                  Shared by: <strong>STUDYVERSE Community</strong> · ${r.sharedAt ? SV.Utils.formatDate(r.sharedAt) : 'Recently'}
                </div>
              </div>
              <div style="display:flex; gap:8px; border-top:1px solid var(--border-light); padding-top:12px; margin-top:12px;">
                ${r.fileData ? `
                  <button class="btn btn-sm btn-primary flex-1" onclick="SV.SharedLibrary.viewFile('${r.id}')">
                    👁 View Resource
                  </button>
                  <button class="btn btn-sm btn-secondary" onclick="SV.SharedLibrary.downloadFile('${r.id}')">
                    ⬇ Download
                  </button>
                ` : `
                  <span class="btn btn-sm btn-secondary flex-1" style="text-align:center; cursor:default; opacity:0.7;">Notes Only</span>
                `}
                <button class="btn btn-sm btn-secondary" onclick="SV.SharedLibrary.summarizeAI('${r.title.replace(/'/g,"\\'")}')">
                  🤖 AI
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  return {
    render,

    setFilter(f) { activeFilter = f; SV.Router.refresh(); },

    handleSearch(q) {
      searchQ = q;
      const filtered = filter(getShared());
      const grid = document.getElementById('shared-grid');
      if (!grid) return;
      if (filtered.length === 0) {
        grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1; padding:40px;">
          <div class="empty-state-icon">🔍</div>
          <div class="empty-state-title">No results for "${q}"</div>
          <button class="btn btn-secondary mt-3" onclick="document.getElementById('shared-search').value=''; SV.SharedLibrary.handleSearch('')">Clear</button>
        </div>`;
        return;
      }
      grid.innerHTML = filtered.map(r => `
        <div class="card">
          <span class="badge badge-primary">${r.type}</span>
          <h3 style="font-weight:600; margin:8px 0 4px;">${r.title}</h3>
          <p style="font-size:12px; color:var(--text-secondary);">${r.description || ''}</p>
          <div style="font-size:11px; color:var(--text-tertiary); margin-top:6px;">Shared by: <strong>STUDYVERSE Community</strong></div>
        </div>
      `).join('');
    },

    openUploadModal() {
      const modal = document.createElement('div');
      modal.className = 'modal-backdrop';
      modal.innerHTML = `
        <div class="modal modal-lg">
          <div class="modal-header">
            <h3 class="modal-title">📤 Share Study Material Anonymously</h3>
            <span class="modal-close" onclick="this.closest('.modal-backdrop').remove()">✕</span>
          </div>
          <div class="modal-body">
            <div class="card mb-3" style="background:#EFF6FF; border-left:3px solid #3B82F6; padding:12px;">
              <div style="font-size:13px; color:#1E3A8A; line-height:1.5;">
                🔒 <strong>Privacy guaranteed:</strong> Your name and email will NOT be shown. 
                Your upload appears as <strong>"STUDYVERSE Community"</strong> to all other users.
              </div>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px;">
              <div class="form-group">
                <label class="form-label">Resource Title *</label>
                <input type="text" class="form-input" id="share-title" placeholder="e.g., Ind AS 116 Lease Modifications Summary">
              </div>
              <div class="form-group">
                <label class="form-label">Subject Paper *</label>
                <select class="form-select" id="share-paper">
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
                <select class="form-select" id="share-type">
                  <option value="Summary Notes">Summary Notes</option>
                  <option value="Formula Sheet">Formula Sheet</option>
                  <option value="Revision Chart">Revision Chart</option>
                  <option value="Question Bank">Question Bank</option>
                  <option value="Handwritten Notes">Handwritten Notes</option>
                  <option value="Mnemonics">Mnemonics / Memory Aids</option>
                  <option value="Case Study">Case Study</option>
                  <option value="Study Plan">Study Plan / Schedule</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Chapter / Topic</label>
                <input type="text" class="form-input" id="share-chapter" placeholder="e.g., Ind AS 115, Transfer Pricing">
              </div>
            </div>
            <div class="form-group mb-3">
              <label class="form-label">Description (what does this cover?)</label>
              <textarea class="form-textarea" id="share-desc" rows="3" placeholder="Brief description of the content..."></textarea>
            </div>
            <div class="form-group mb-3">
              <label class="form-label">Upload File (PDF / Image / DOCX / All formats)</label>
              <input type="file" class="form-input" id="share-file" accept=".pdf,.png,.jpg,.jpeg,.webp,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.txt">
              <div style="font-size:11px; color:var(--text-tertiary); margin-top:6px;">
                No file size limit. All study formats supported. Files are stored securely in IndexedDB.
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="this.closest('.modal-backdrop').remove()">Cancel</button>
            <button class="btn btn-primary" onclick="SV.SharedLibrary.submitUpload(this)">
              🌐 Share Anonymously with Community
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    },

    submitUpload(btn) {
      const title   = document.getElementById('share-title')?.value?.trim();
      const paperId = document.getElementById('share-paper')?.value || 'P1';
      const type    = document.getElementById('share-type')?.value  || 'Summary Notes';
      const desc    = document.getElementById('share-desc')?.value?.trim();
      const chapter = document.getElementById('share-chapter')?.value?.trim();
      const file    = document.getElementById('share-file')?.files?.[0];

      if (!title) { alert('Please enter a title.'); return; }

      const paperNames = {
        P1:'Paper 1: Financial Reporting',
        P2:'Paper 2: AFM',
        P3:'Paper 3: Advanced Auditing & Ethics',
        P4:'Paper 4: Direct Tax & Int\'l Tax',
        P5:'Paper 5: Indirect Tax Laws',
        P6:'Paper 6: Integrated Business Solutions'
      };

      btn.textContent = 'Saving to database...';
      btn.disabled = true;

      const proceed = async (fileData, fileName, fileType) => {
        try {
          const newItem = {
            id: SV.Utils.uniqueId('shared'),
            title,
            paperId,
            paperName: paperNames[paperId] || paperId,
            type,
            description: desc || '',
            chapter: chapter || '',
            fileData: fileData || null,
            fileName: fileName || null,
            fileType: fileType || null,
            sharedAt: new Date().toISOString(),
            // STRICT PRIVACY: Zero personal info included
          };
          await SV.Storage.saveSharedResource(newItem);
          cachedShared.unshift(newItem);
          SV.Utils.toast('Resource shared anonymously with community! 🎉', 'success', 3000);
          btn.closest('.modal-backdrop').remove();
          SV.Router.navigate('/shared-lib');
        } catch (err) {
          console.error('[SharedLibrary] Save failed:', err);
          alert('Could not save file to database: ' + err.message);
          btn.textContent = 'Share';
          btn.disabled = false;
        }
      };

      if (file) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        btn.textContent = `Reading file (${sizeMb} MB)...`;
        const reader = new FileReader();
        reader.onload = (e) => proceed(e.target.result, file.name, file.type);
        reader.onerror = () => {
          alert('Error reading file from disk.');
          btn.textContent = 'Share';
          btn.disabled = false;
        };
        reader.readAsDataURL(file);
      } else {
        proceed(null, null, null);
      }
    },

    viewFile(id) {
      const r = getShared().find(x => x.id === id);
      if (!r || !r.fileData) { alert('No file attached to this resource.'); return; }

      if (r.fileType && r.fileType.startsWith('image/')) {
        const modal = document.createElement('div');
        modal.className = 'modal-backdrop';
        modal.innerHTML = `
          <div class="modal modal-lg">
            <div class="modal-header">
              <h3 class="modal-title">📄 ${r.title}</h3>
              <span class="modal-close" onclick="this.closest('.modal-backdrop').remove()">✕</span>
            </div>
            <div class="modal-body" style="text-align:center;">
              <img src="${r.fileData}" alt="${r.title}" style="max-width:100%; border-radius:8px;">
            </div>
          </div>`;
        document.body.appendChild(modal);
      } else if (r.fileType === 'application/pdf') {
        const modal = document.createElement('div');
        modal.className = 'modal-backdrop';
        modal.innerHTML = `
          <div class="modal" style="width:90vw; max-width:900px;">
            <div class="modal-header">
              <h3 class="modal-title">📄 ${r.title}</h3>
              <span class="modal-close" onclick="this.closest('.modal-backdrop').remove()">✕</span>
            </div>
            <div class="modal-body" style="padding:0; height:70vh;">
              <iframe src="${r.fileData}" style="width:100%; height:100%; border:none;"></iframe>
            </div>
          </div>`;
        document.body.appendChild(modal);
      } else {
        this.downloadFile(id);
      }
    },

    downloadFile(id) {
      const r = getShared().find(x => x.id === id);
      if (!r || !r.fileData) { alert('No file to download.'); return; }
      const a = document.createElement('a');
      a.href = r.fileData;
      a.download = r.fileName || `${r.title}.pdf`;
      a.click();
      SV.Utils.toast('File downloading...', 'info', 1500);
    },

    summarizeAI(title) {
      SV.Router.navigate('/ai', { prompt: `Summarize "${title}" for CA Final May 2027 preparation.` });
    }
  };
})();
