/**
 * STUDYVERSE – Personal Notes Module
 * notes.js
 */
window.SV = window.SV || {};

SV.Notes = (() => {
  let activeSubjectFilter = 'all';

  async function render(params = {}) {
    const user = SV.Auth.getCurrentUser() || { id: 'anon' };
    const notes = (await SV.Storage.getNotes(user.id)) || [];

    const filtered = notes.filter(n => {
      return activeSubjectFilter === 'all' || n.subject === activeSubjectFilter;
    });

    return `
      <div class="notes-container animate-fade-in">

        <div class="page-header">
          <div>
            <h1 class="page-title">Digital CA Notebook & Case Law Repository</h1>
            <p class="page-subtitle">Organized by Subject & Chapter · Formula Sheets · Case Law Summaries</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-secondary" onclick="SV.Router.navigate('/mistakes')">
              📕 Open Mistake Notebook
            </button>
            <button class="btn btn-primary" onclick="SV.Notes.createNewNote()">
              + Create New Note
            </button>
          </div>
        </div>

        <!-- Filter bar -->
        <div class="card mb-6">
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button class="filter-chip ${activeSubjectFilter === 'all' ? 'active' : ''}" onclick="SV.Notes.filter('all')">All Notes (${notes.length})</button>
            <button class="filter-chip ${activeSubjectFilter === 'P1' ? 'active' : ''}" onclick="SV.Notes.filter('P1')">FR (P1)</button>
            <button class="filter-chip ${activeSubjectFilter === 'P2' ? 'active' : ''}" onclick="SV.Notes.filter('P2')">AFM (P2)</button>
            <button class="filter-chip ${activeSubjectFilter === 'P3' ? 'active' : ''}" onclick="SV.Notes.filter('P3')">Audit (P3)</button>
            <button class="filter-chip ${activeSubjectFilter === 'P4' ? 'active' : ''}" onclick="SV.Notes.filter('P4')">Direct Tax (P4)</button>
            <button class="filter-chip ${activeSubjectFilter === 'P5' ? 'active' : ''}" onclick="SV.Notes.filter('P5')">Indirect Tax (P5)</button>
            <button class="filter-chip ${activeSubjectFilter === 'P6' ? 'active' : ''}" onclick="SV.Notes.filter('P6')">IBS (P6)</button>
          </div>
        </div>

        <!-- Notes Grid -->
        <div class="grid-auto">
          ${filtered.length === 0 ? `
            <div class="empty-state" style="grid-column: 1 / -1;">
              <div class="empty-state-icon">📝</div>
              <div class="empty-state-title">No notes found</div>
              <div class="empty-state-desc">Create your first subject-wise note or formula summary!</div>
              <button class="btn btn-primary" onclick="SV.Notes.createNewNote()">Create Note</button>
            </div>
          ` : filtered.map(note => `
            <div class="card" style="display:flex; flex-direction:column; justify-content:space-between;">
              <div>
                <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                  <span class="badge badge-primary">${note.subject || 'General'}</span>
                  <span style="font-size:11px; color:var(--text-tertiary);">${SV.Utils.formatDate(note.createdAt)}</span>
                </div>
                <h3 style="font-weight:600; font-size:16px; margin-bottom:8px;">${note.title}</h3>
                <p style="font-size:13px; color:var(--text-secondary); line-height:1.5; white-space:pre-line; max-height:150px; overflow:hidden;">
                  ${note.content}
                </p>
              </div>
              <div style="display:flex; gap:8px; border-top:1px solid var(--border-light); padding-top:12px; margin-top:12px;">
                <button class="btn btn-sm btn-secondary flex-1" onclick="SV.Notes.editNote('${note.id}')">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="SV.Notes.deleteNote('${note.id}')">Delete</button>
              </div>
            </div>
          `).join('')}
        </div>

      </div>
    `;
  }

  return {
    render,

    filter(subj) {
      activeSubjectFilter = subj;
      SV.Router.refresh();
    },

    createNewNote() {
      const title = prompt('Enter Note Title (e.g., Ind AS 116 Lease Modifications Summary):');
      if (!title || !title.trim()) return;
      const content = prompt('Enter your notes / provisions:');
      if (!content || !content.trim()) return;
      const subject = prompt('Enter Subject Code (P1, P2, P3, P4, P5, P6):', 'P1') || 'P1';

      SV.Storage.saveNote({
        id: SV.Utils.uniqueId('note'),
        userId: SV.Auth.getCurrentUser()?.id || 'anon',
        title: title.trim(),
        content: content.trim(),
        subject,
        createdAt: new Date().toISOString()
      });

      SV.Rewards.awardPoints('NOTE_CREATED', 5);
      SV.Utils.toast('Note saved to notebook!', 'success');
      SV.Router.refresh();
    },

    async deleteNote(id) {
      if (confirm('Delete this note?')) {
        await SV.Storage.deleteNote(id);
        SV.Utils.toast('Note deleted', 'info');
        SV.Router.refresh();
      }
    },

    async editNote(id) {
      const user = SV.Auth.getCurrentUser() || { id: 'anon' };
      const notes = await SV.Storage.getNotes(user.id);
      const note = notes.find(n => n.id === id);
      if (!note) return;

      const newContent = prompt('Edit note content:', note.content);
      if (newContent !== null) {
        note.content = newContent;
        await SV.Storage.saveNote(note);
        SV.Utils.toast('Note updated', 'success');
        SV.Router.refresh();
      }
    }
  };
})();
