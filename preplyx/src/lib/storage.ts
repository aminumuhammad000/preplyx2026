export interface ActiveSession {
  exam: string;
  subject: string;
  currentQIndex: number;
  answers: Record<number, string>;
  flagged: number[]; // Array instead of Set for JSON serialization
  timeLeft: number;
  lastAccessed: number; // timestamp
  totalQ: number;
}

export interface CompletedSession {
  id: string;
  exam: string;
  subject: string;
  score: number;
  total: number;
  pct: number;
  date: number; // timestamp
  timeSpentSeconds?: number;
  details?: {
    questionId: number;
    questionText: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }[];
}

export interface OverallStats {
  questionsAnswered: number;
  averageAccuracy: number;
  studyTimeSeconds: number;
  currentStreak: number;
  monthlyStreak: number;
}

const ACTIVE_SESSION_KEY = 'preplyx_active_session';
const COMPLETED_SESSIONS_KEY = 'preplyx_completed_sessions';
const ACTIVE_DAYS_KEY = 'preplyx_active_days';

// --- Daily Streak Tracking ---

export function trackDailyActivity() {
  if (typeof window === 'undefined') return;
  const today = new Date().toISOString().split('T')[0];
  const activeDaysStr = localStorage.getItem(ACTIVE_DAYS_KEY);
  let activeDays: string[] = activeDaysStr ? JSON.parse(activeDaysStr) : [];
  
  if (!activeDays.includes(today)) {
    activeDays.push(today);
    localStorage.setItem(ACTIVE_DAYS_KEY, JSON.stringify(activeDays));
  }
}

export function getActiveDays(): string[] {
  if (typeof window === 'undefined') return [];
  const activeDaysStr = localStorage.getItem(ACTIVE_DAYS_KEY);
  return activeDaysStr ? JSON.parse(activeDaysStr) : [];
}

// --- Active Session ---

export function saveActiveSession(session: ActiveSession) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
}

export function getActiveSession(): ActiveSession | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(ACTIVE_SESSION_KEY);
  return data ? JSON.parse(data) : null;
}

export function clearActiveSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACTIVE_SESSION_KEY);
}

// --- Completed Sessions ---

export function saveCompletedSession(session: CompletedSession) {
  if (typeof window === 'undefined') return;
  const sessions = getCompletedSessions();
  sessions.unshift(session); // Add to beginning
  localStorage.setItem(COMPLETED_SESSIONS_KEY, JSON.stringify(sessions));
}

export function getCompletedSessions(): CompletedSession[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(COMPLETED_SESSIONS_KEY);
  return data ? JSON.parse(data) : [];
}

// --- Stats Aggregation ---

export function getOverallStats(): OverallStats {
  const sessions = getCompletedSessions();
  if (sessions.length === 0) {
    return { questionsAnswered: 0, averageAccuracy: 0, studyTimeSeconds: 0 };
  }

  let totalQuestions = 0;
  let totalScore = 0;

  sessions.forEach(s => {
    totalQuestions += s.total;
    totalScore += s.score;
  });

  const accuracy = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
  // Mock study time based on total questions for now (e.g. 1 min per question)
  const studyTimeSeconds = totalQuestions * 60;

  // Streak Calculation (Based on Daily Activity Tracking)
  const activeDays = getActiveDays();
  const uniqueDays = new Set<string>(activeDays);
  
  // Also include days from completed sessions as a fallback
  sessions.forEach(s => {
    const d = new Date(s.date);
    uniqueDays.add(d.toISOString().split('T')[0]);
  });

  const currentMonthDays = new Set<string>();
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  Array.from(uniqueDays).forEach(dateString => {
    const d = new Date(dateString);
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      currentMonthDays.add(dateString);
    }
  });

  const sortedDays = Array.from(uniqueDays).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  let currentStreak = 0;
  const todayStr = now.toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (sortedDays.includes(todayStr) || sortedDays.includes(yesterdayStr)) {
    let checkDate = new Date(sortedDays[0]);
    currentStreak = 1;
    for (let i = 1; i < sortedDays.length; i++) {
      const prevDate = new Date(sortedDays[i]);
      const diffTime = Math.abs(checkDate.getTime() - prevDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      if (diffDays === 1) {
        currentStreak++;
        checkDate = prevDate;
      } else {
        break;
      }
    }
  }

  return {
    questionsAnswered: totalQuestions,
    averageAccuracy: accuracy,
    studyTimeSeconds,
    currentStreak,
    monthlyStreak: currentMonthDays.size
  };
}
