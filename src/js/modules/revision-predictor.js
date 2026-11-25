/**
 * STUDYVERSE – Smart Revision Predictor Engine
 * revision-predictor.js
 */
window.SV = window.SV || {};

SV.RevisionPredictor = (() => {
  return {
    async analyze(userId) {
      const progress = await SV.Storage.getProgress(userId);
      const testHistory = await SV.Storage.getTestHistory(userId);

      const strongTopics = [];
      const weakTopics = [];
      const needsAttention = [];

      // Loop through syllabus
      if (window.CA_FINAL_SYLLABUS) {
        window.CA_FINAL_SYLLABUS.groups.forEach(g => {
          g.papers.forEach(p => {
            p.chapters.forEach(c => {
              c.units.forEach(u => {
                u.topics.forEach(t => {
                  const key = `${userId}::${p.id}::${c.id}::${u.id}::${t}`;
                  const data = progress[key];
                  if (data) {
                    if (data.status === 'Completed') strongTopics.push({ topic: t, paper: p.shortName });
                    else if (data.status === 'Difficult' || data.status === 'Needs Revision') {
                      weakTopics.push({ topic: t, paper: p.shortName });
                    }
                  }
                });
              });
            });
          });
        });
      }

      return { strongTopics, weakTopics, needsAttention };
    }
  };
})();
