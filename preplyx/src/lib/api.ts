// API utility functions to connect to backend server

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper function to check if backend is available
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface ExamData {
  subjects: string[];
  color: string;
  years: string;
  desc: string;
  questionCount?: string;
  displayName?: string;
}

export interface Question {
  id?: string;
  exam: string;
  subject: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let message = `HTTP error! status: ${response.status}`;
        try {
          const parsed = JSON.parse(errorText);
          message = parsed?.meta?.error?.message ?? parsed?.error ?? parsed?.message ?? errorText;
        } catch {
          message = errorText || message;
        }
        throw new Error(`HTTP ${response.status}: ${message}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      
      // Provide more specific error messages
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to backend server. Please ensure the backend is running on ' + API_BASE_URL);
      }
      
      throw error;
    }
  }

  // Exam endpoints
  async getExams(): Promise<Record<string, ExamData>> {
    return this.request<Record<string, ExamData>>('/exams');
  }

  async getExamSubjects(exam: string): Promise<ExamData> {
    return this.request<ExamData>(`/exams/${exam}/subjects`);
  }

  async getSubjectCategories(): Promise<Record<string, string[]>> {
    return this.request<Record<string, string[]>>('/exams/categories');
  }

  async getSubjectIcons(): Promise<Record<string, string>> {
    return this.request<Record<string, string>>('/exams/icons');
  }

  async getSubjectTips(): Promise<Record<string, string>> {
    return this.request<Record<string, string>>('/exams/tips');
  }

  // Question endpoints
  async getQuestions(params: {
    exam?: string;
    subject?: string;
    limit?: number;
  }): Promise<Question[]> {
    const queryParams = new URLSearchParams();
    if (params.exam) queryParams.append('exam', params.exam);
    if (params.subject) queryParams.append('subject', params.subject);
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = `/questions?${queryParams.toString()}`;
    return this.request<Question[]>(endpoint);
  }

  // Auth endpoints
  async register(userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<{ token: string; user: any }> {
    return this.request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<{ token: string; user: any }> {
    return this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Data endpoints
  async getStats(token: string): Promise<{
    questionsAnswered: number;
    averageAccuracy: number;
    studyTimeSeconds: number;
    currentStreak: number;
    monthlyStreak: number;
  }> {
    return this.request('/data/stats', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getSessions(token: string): Promise<any[]> {
    return this.request('/data/sessions', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getSubjectMastery(token: string): Promise<{
    subject: string;
    mastery: number;
    averageScore: number;
    totalSessions: number;
    fill: string;
  }[]> {
    return this.request('/data/subject-mastery', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Wallet endpoints
  async getWallet(token: string): Promise<{
    balance: number;
    totalFunded: number;
    totalSpent: number;
    welcomeBonus: number;
  }> {
    return this.request('/wallet', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getTransactions(token: string): Promise<any[]> {
    return this.request('/wallet/transactions', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getVirtualAccount(token: string): Promise<{
    bankName: string | null;
    accountName: string | null;
    accountNumber: string | null;
    hasVirtualAccount?: boolean;
  }> {
    return this.request('/wallet/virtual-account', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async createVirtualAccount(token: string): Promise<{
    bankName: string;
    accountName: string;
    accountNumber: string;
    username?: string;
  }> {
    return this.request('/wallet/virtual-account', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Leaderboard endpoints
  async getLeaderboard(token: string, filter: string = 'weekly'): Promise<any[]> {
    return this.request(`/leaderboard?filter=${filter}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getUserRank(token: string): Promise<{
    rank: number | null;
    points: number;
    exams: number;
    streak: number;
  }> {
    return this.request('/leaderboard/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Session endpoints
  async saveSession(token: string, sessionData: {
    exam: string;
    subject: string;
    score: number;
    total: number;
    percentage: number;
    timeSpentSeconds: number;
    details?: any[];
  }): Promise<any> {
    return this.request('/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(sessionData),
    });
  }

  async getSession(token: string, sessionId: string): Promise<any> {
    return this.request(`/sessions/${sessionId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getReviewedQuestions(token: string): Promise<any[]> {
    return this.request('/sessions/reviewed-questions', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getSessionAnalytics(token: string): Promise<{
    totalSessions: number;
    averageScore: number;
    totalTimeSpent: number;
    streak: number;
    activeDates: string[];
  }> {
    return this.request('/sessions/analytics', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // User profile endpoints
  async getUserProfile(token: string): Promise<{
    _id: string;
    name: string;
    email: string;
    phone?: string;
    exam_type?: string;
    settings?: any;
    achievements?: any[];
    notifications?: any[];
  }> {
    return this.request('/user/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async updateUserProfile(token: string, profileData: {
    name?: string;
    email?: string;
    phone?: string;
    exam_type?: string;
    password?: string;
  }): Promise<any> {
    return this.request('/user/profile', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });
  }

  async updateUserSettings(token: string, settings: any): Promise<any> {
    return this.request('/user/settings', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ settings }),
    });
  }

  // Achievement endpoints
  async getAchievements(token: string): Promise<{
    achievements: any[];
    progress: {
      totalAchievements: number;
      unlocked: number;
      points: number;
      level: number;
    };
  }> {
    return this.request('/achievements', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async unlockAchievement(token: string, achievementId: number): Promise<any> {
    return this.request('/achievements/unlock', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ achievementId }),
    });
  }

  async updateAchievementProgress(token: string, achievementId: number, progress: number): Promise<any> {
    return this.request('/achievements/progress', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ achievementId, progress }),
    });
  }

  // Notification endpoints
  async getNotifications(token: string): Promise<any[]> {
    return this.request('/notifications', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async addNotification(token: string, notification: {
    type: string;
    title: string;
    message: string;
  }): Promise<any> {
    return this.request('/notifications', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(notification),
    });
  }

  async markNotificationAsRead(token: string, notificationId: number): Promise<any> {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async markAllNotificationsAsRead(token: string): Promise<any> {
    return this.request('/notifications/read-all', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async deleteNotification(token: string, notificationId: number): Promise<any> {
    return this.request(`/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async clearAllNotifications(token: string): Promise<any> {
    return this.request('/notifications', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}

export const api = new ApiClient();