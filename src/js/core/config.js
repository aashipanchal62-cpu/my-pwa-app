/**
 * STUDYVERSE – App Configuration
 * config.js
 */
window.SV = window.SV || {};

SV.Config = {
  APP_NAME: 'STUDYVERSE',
  APP_VERSION: '1.0.0',
  TAGLINE: 'Plan Smart. Study Better. Become a CA.',
  EXAM: 'CA Final – May 2027',
  EXAM_DATE: '2027-05-02', // Approximate – update when official dates announced

  // Backend URL (update with actual deployed backend URL)
  API_BASE_URL: '/api',

  // Storage keys
  STORAGE_KEYS: {
    USER: 'sv_user',
    TOKEN: 'sv_token',
    PROGRESS: 'sv_progress',
    NOTES: 'sv_notes',
    SETTINGS: 'sv_settings',
    PLANNER: 'sv_planner',
    BOOKMARKS: 'sv_bookmarks',
    TIMER: 'sv_timer',
    REWARDS: 'sv_rewards',
    REVISIONS: 'sv_revisions',
    MISTAKES: 'sv_mistakes',
    FLASHCARDS: 'sv_flashcards',
    RESOURCES: 'sv_resources',
    STREAKS: 'sv_streaks',
  },

  // Default settings
  DEFAULT_SETTINGS: {
    theme: 'light',
    fontSize: 'medium',
    fontFamily: 'Inter',
    accentColor: '#6C63FF',
    sidebarCollapsed: false,
    sidebarLayout: 'full',
    spacing: 'comfortable',
    notifications: true,
    gamification: true,
    autoSave: true,
    language: 'English',
    dailyStudyHours: 8,
    pomodoroWork: 25,
    pomodoroBreak: 5,
    pomodoroLongBreak: 15,
  },

  // Subject Colors
  SUBJECT_COLORS: {
    P1: '#6C63FF',
    P2: '#3B82F6',
    P3: '#22C55E',
    P4: '#F59E0B',
    P5: '#EF4444',
    P6: '#EC4899',
  },

  SUBJECT_ICONS: {
    P1: '📊',
    P2: '💰',
    P3: '🔍',
    P4: '📋',
    P5: '🏛️',
    P6: '🎯',
  },

  // Motivational quotes
  QUOTES: [
    { text: "Success is not final, failure is not fatal. It is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" },
    { text: "Dream big. Work hard. Stay focused. And surround yourself with good people.", author: "Unknown" },
    { text: "Every expert was once a beginner. Keep going.", author: "Unknown" },
    { text: "The CA journey is tough, but so are you.", author: "STUDYVERSE" },
    { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
    { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
    { text: "Success comes to those who work for it, not those who wish for it.", author: "Unknown" },
    { text: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki" },
    { text: "One day at a time. One topic at a time. You've got this, CA aspirant!", author: "STUDYVERSE" },
  ],

  // Exam schedule (approximate – verify with ICAI)
  EXAM_SCHEDULE_2027: [
    { date: '2027-05-02', paper: 'P1', name: 'Financial Reporting', group: 1 },
    { date: '2027-05-04', paper: 'P2', name: 'Advanced Financial Management', group: 1 },
    { date: '2027-05-06', paper: 'P3', name: 'Advanced Auditing, Assurance & Professional Ethics', group: 1 },
    { date: '2027-05-09', paper: 'P4', name: 'Direct Tax Laws & International Taxation', group: 2 },
    { date: '2027-05-11', paper: 'P5', name: 'Indirect Tax Laws', group: 2 },
    { date: '2027-05-13', paper: 'P6', name: 'Integrated Business Solutions', group: 2 },
  ],

  // Points system
  POINTS: {
    TOPIC_COMPLETED: 10,
    CHAPTER_COMPLETED: 50,
    SUBJECT_COMPLETED: 500,
    REVISION_DONE: 15,
    MCQ_ATTEMPT: 2,
    MCQ_CORRECT: 5,
    MOCK_TEST_COMPLETED: 100,
    DAILY_GOAL_MET: 30,
    STREAK_BONUS_7: 70,
    STREAK_BONUS_30: 300,
    NOTE_CREATED: 5,
    FLASHCARD_CREATED: 3,
    STUDY_HOUR: 20,
  },
};
