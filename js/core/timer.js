/**
 * STUDYVERSE – Study Timer & Pomodoro Engine
 * timer.js
 */
window.SV = window.SV || {};

SV.Timer = (() => {
  let interval = null;
  let seconds = 0;
  let isRunning = false;
  let mode = 'stopwatch'; // 'stopwatch' | 'pomodoro'
  let pomodoroState = 'work'; // 'work' | 'break'
  let pomodoroTimeLeft = 25 * 60;
  let currentSubject = '';

  function tick() {
    if (mode === 'stopwatch') {
      seconds++;
      updateDisplay(seconds);
    } else {
      if (pomodoroTimeLeft > 0) {
        pomodoroTimeLeft--;
        updateDisplay(pomodoroTimeLeft);
      } else {
        // Pomodoro interval ended
        handlePomodoroEnd();
      }
    }
  }

  function handlePomodoroEnd() {
    clearInterval(interval);
    isRunning = false;
    updateControls();

    const settings = SV.Storage.LS.get('SETTINGS') || SV.Config.DEFAULT_SETTINGS;
    if (pomodoroState === 'work') {
      pomodoroState = 'break';
      pomodoroTimeLeft = (settings.pomodoroBreak || 5) * 60;
      SV.Notifications.toast('Great focus session! Take a 5-minute break now.', 'success', 6000, 'Pomodoro Completed');
      SV.Rewards.awardPoints('DAILY_GOAL_MET', 10);
    } else {
      pomodoroState = 'work';
      pomodoroTimeLeft = (settings.pomodoroWork || 25) * 60;
      SV.Notifications.toast('Break over! Ready for your next study session?', 'info', 6000, 'Back to Study');
    }
    updateDisplay(pomodoroTimeLeft);
  }

  function updateDisplay(sec) {
    const timeFormatted = SV.Utils.formatTime(sec);
    const largeDisplay = document.getElementById('timer-display-large');
    const topbarDisplay = document.getElementById('topbar-timer-display');

    if (largeDisplay) largeDisplay.textContent = timeFormatted;
    if (topbarDisplay) {
      topbarDisplay.textContent = timeFormatted;
      topbarDisplay.style.display = isRunning ? 'inline-block' : 'none';
    }
  }

  function updateControls() {
    const startBtn = document.getElementById('timer-start-btn');
    const pauseBtn = document.getElementById('timer-pause-btn');
    if (!startBtn || !pauseBtn) return;

    if (isRunning) {
      startBtn.style.display = 'none';
      pauseBtn.style.display = 'inline-block';
    } else {
      startBtn.style.display = 'inline-block';
      pauseBtn.style.display = 'none';
    }
  }

  return {
    init() {
      const widget = document.getElementById('study-timer-widget');
      const triggerBtn = document.getElementById('study-timer-btn');
      const closeBtn = document.getElementById('timer-close-btn');
      const startBtn = document.getElementById('timer-start-btn');
      const pauseBtn = document.getElementById('timer-pause-btn');
      const resetBtn = document.getElementById('timer-reset-btn');
      const subjectSelect = document.getElementById('timer-subject-select');
      const modeBtns = document.querySelectorAll('.timer-mode-btn');

      if (triggerBtn) {
        triggerBtn.addEventListener('click', () => {
          widget.classList.toggle('hidden');
        });
      }

      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          widget.classList.add('hidden');
        });
      }

      // Populate subject select
      if (subjectSelect && window.CA_FINAL_SYLLABUS) {
        let optHtml = '<option value="">Select Subject...</option>';
        window.CA_FINAL_SYLLABUS.groups.forEach(g => {
          g.papers.forEach(p => {
            optHtml += `<option value="${p.id}">${p.code}: ${p.shortName}</option>`;
          });
        });
        subjectSelect.innerHTML = optHtml;
        subjectSelect.addEventListener('change', (e) => {
          currentSubject = e.target.value;
        });
      }

      if (startBtn) {
        startBtn.addEventListener('click', () => this.start());
      }

      if (pauseBtn) {
        pauseBtn.addEventListener('click', () => this.pause());
      }

      if (resetBtn) {
        resetBtn.addEventListener('click', () => this.reset());
      }

      modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          modeBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.setMode(btn.dataset.mode);
        });
      });
    },

    start() {
      if (isRunning) return;
      isRunning = true;
      interval = setInterval(tick, 1000);
      updateControls();
      const topbarDisplay = document.getElementById('topbar-timer-display');
      if (topbarDisplay) topbarDisplay.style.display = 'inline-block';
    },

    pause() {
      if (!isRunning) return;
      clearInterval(interval);
      isRunning = false;
      updateControls();

      // Log study time if in stopwatch mode and seconds > 60
      if (mode === 'stopwatch' && seconds >= 60 && currentSubject) {
        const mins = Math.floor(seconds / 60);
        SV.Storage.logActivity({
          id: SV.Utils.uniqueId('act'),
          userId: SV.Auth.getCurrentUser()?.id || 'anon',
          type: 'study_session',
          subjectId: currentSubject,
          durationMins: mins,
          createdAt: new Date().toISOString()
        });
      }
    },

    reset() {
      this.pause();
      if (mode === 'stopwatch') {
        seconds = 0;
        updateDisplay(0);
      } else {
        const settings = SV.Storage.LS.get('SETTINGS') || SV.Config.DEFAULT_SETTINGS;
        pomodoroState = 'work';
        pomodoroTimeLeft = (settings.pomodoroWork || 25) * 60;
        updateDisplay(pomodoroTimeLeft);
      }
    },

    setMode(newMode) {
      this.reset();
      mode = newMode;
      if (mode === 'pomodoro') {
        const settings = SV.Storage.LS.get('SETTINGS') || SV.Config.DEFAULT_SETTINGS;
        pomodoroTimeLeft = (settings.pomodoroWork || 25) * 60;
        updateDisplay(pomodoroTimeLeft);
      } else {
        seconds = 0;
        updateDisplay(0);
      }
    },

    getCurrentSeconds() { return seconds; }
  };
})();
