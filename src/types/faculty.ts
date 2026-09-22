import { User, Contest, LiveSession, Submission, Anomaly, ActivityLog, Notification, ContestStatus } from './admin';

export interface FacultyBadges {
  assignedStudents: number;
  activeSessions: number;
  activeAnomalies: number;
  unreadNotifications: number;
}

export interface FacultyDashboardKpis {
  assignedStudents: number;
  activeStudents: number;
  completedStudents: number;
  inactiveStudents: number;
  activeSessions: number;
  totalSubmissions: number;
  averageScore: number;
  anomalies: number;
}

export interface FacultyContestStatus {
  id: string;
  name: string;
  description: string;
  code?: string;
  status: ContestStatus;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  totalParticipants: number;
  activeParticipants: number;
  completedParticipants: number;
  assignedStudentsCount: number;
  assignedActiveParticipants: number;
  assignedCompletedParticipants: number;
  timeRemaining: string;
  timeRemainingSeconds: number;
}

export interface FacultyAlert {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  link: string;
  timestamp: string;
}

export interface StudentPerformanceMetrics {
  totalScore: number;
  questionsSolved: number;
  questionsFailed: number;
  questionsSkipped: number;
  totalAttempts: number;
  successfulAttempts: number;
  averageTime: string;
  currentDifficulty: number;
  highestDifficulty: number;
  successRate: number;
}

export interface StudentPerformanceCharts {
  scoreProgression: { time: string; score: number }[];
  difficultyProgression: { time: string; level: number }[];
  submissionSuccessRate: { name: string; value: number; color: string }[];
  solvingTime: { question: string; minutes: number }[];
}

export interface FacultyReportData {
  reportTitle: string;
  generatedAt: string;
  generatedBy: string;
  type: string;
  summary: Record<string, any>;
  rows: any[];
}
