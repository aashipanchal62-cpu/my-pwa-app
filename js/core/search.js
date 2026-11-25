/**
 * STUDYVERSE – Unified Smart Search Engine
 * search.js
 */
window.SV = window.SV || {};

SV.Search = (() => {
  let searchIndex = [];

  function buildIndex() {
    searchIndex = [];
    if (!window.CA_FINAL_SYLLABUS) return;

    // Index Syllabus (Subjects, Chapters, Units, Topics)
    window.CA_FINAL_SYLLABUS.groups.forEach(group => {
      group.papers.forEach(paper => {
        searchIndex.push({
          id: paper.id,
          title: `${paper.code}: ${paper.name} (${paper.shortName})`,
          category: 'Subject',
          subjectId: paper.id,
          meta: `${group.name} • 100 Marks`,
          route: '/tracker',
          params: { paperId: paper.id }
        });

        paper.chapters.forEach(chap => {
          searchIndex.push({
            id: chap.id,
            title: `Ch ${chap.number}: ${chap.name}`,
            category: 'Chapter',
            subjectId: paper.id,
            meta: `${paper.shortName} • Chapter ${chap.number}`,
            route: '/tracker',
            params: { paperId: paper.id, chapterId: chap.id }
          });

          chap.units.forEach(unit => {
            searchIndex.push({
              id: unit.id,
              title: unit.name,
              category: 'Unit',
              subjectId: paper.id,
              meta: `${paper.shortName} • ${chap.name}`,
              route: '/tracker',
              params: { paperId: paper.id, chapterId: chap.id }
            });

            unit.topics.forEach(topic => {
              searchIndex.push({
                id: SV.Utils.uniqueId('top'),
                title: topic,
                category: 'Topic',
                subjectId: paper.id,
                meta: `${paper.shortName} • ${unit.name}`,
                route: '/tracker',
                params: { paperId: paper.id, chapterId: chap.id, topic }
              });
            });
          });
        });
      });
    });

    // Index SPOM
    if (window.SPOM_MODULES_DATA) {
      window.SPOM_MODULES_DATA.forEach(set => {
        set.modules.forEach(mod => {
          searchIndex.push({
            id: mod.id,
            title: `${set.set}: ${mod.name}`,
            category: 'SPOM Module',
            meta: `Self-Paced Module • ${mod.status}`,
            route: '/spom',
            params: { setId: set.id }
          });
        });
      });
    }

    // Index Resources
    if (window.CA_RESOURCES_DATA) {
      window.CA_RESOURCES_DATA.forEach(res => {
        searchIndex.push({
          id: res.id,
          title: res.name,
          category: 'Resource',
          subjectId: res.paperId,
          meta: `${res.paperName} • ${res.category} • ${res.type}`,
          route: '/library',
          params: { resourceId: res.id, filterPaper: res.paperId }
        });
      });
    }
  }

  function performSearch(query) {
    if (!query || query.trim().length < 2) return [];
    const q = query.toLowerCase().trim();
    return searchIndex.filter(item => {
      return (
        item.title.toLowerCase().includes(q) ||
        (item.meta && item.meta.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q))
      );
    }).slice(0, 15);
  }

  return {
    init() {
      buildIndex();
      const input = document.getElementById('global-search-input');
      const dropdown = document.getElementById('search-results-dropdown');
      if (!input || !dropdown) return;

      input.addEventListener('input', SV.Utils.debounce((e) => {
        const val = e.target.value;
        const results = performSearch(val);
        if (val.trim().length < 2) {
          dropdown.classList.remove('active');
          dropdown.innerHTML = '';
          return;
        }

        if (results.length === 0) {
          dropdown.innerHTML = '<div class="search-no-results">No matching CA topics, resources, or notes found.</div>';
          dropdown.classList.add('active');
          return;
        }

        const groups = SV.Utils.groupBy(results, 'category');
        let html = '';
        Object.keys(groups).forEach(cat => {
          html += `<div class="search-section-title">${cat}</div>`;
          groups[cat].forEach(item => {
            html += `
              <div class="search-result-item" data-route="${item.route}" data-params='${JSON.stringify(item.params || {})}'>
                <div class="search-result-icon">🔍</div>
                <div class="search-result-info">
                  <div class="search-result-title">${SV.Utils.highlight(item.title, val)}</div>
                  <div class="search-result-meta">${item.meta || ''}</div>
                </div>
                <span class="search-result-type">${item.category}</span>
              </div>
            `;
          });
        });

        dropdown.innerHTML = html;
        dropdown.classList.add('active');

        dropdown.querySelectorAll('.search-result-item').forEach(el => {
          el.addEventListener('click', () => {
            const route = el.dataset.route;
            const params = JSON.parse(el.dataset.params || '{}');
            dropdown.classList.remove('active');
            input.value = '';
            SV.Router.navigate(route, params);
          });
        });
      }, 250));

      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!e.target.closest('#global-search-container')) {
          dropdown.classList.remove('active');
        }
      });
    },

    reindex() {
      buildIndex();
    }
  };
})();
