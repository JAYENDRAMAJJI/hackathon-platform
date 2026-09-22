export type UserRole = 'STUDENT' | 'FACULTY' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'PENDING' | 'REJECTED' | 'SUSPENDED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  approved: boolean;
  status: UserStatus;
  registrationDate: string;
  lastLogin: string;
  profileImage?: string;
  googleId?: string;
  score?: number;
  rank?: number;
  currentDifficulty?: number;
  highestDifficulty?: number;
  solvedCount?: number;
  skippedCount?: number;
  attemptsCount?: number;
  sessionStatus?: 'ACTIVE' | 'IDLE' | 'OFFLINE' | 'COMPLETED' | 'PAUSED';
  rejectionReason?: string;
  department?: string;
  employeeId?: string;
  assignedFacultyId?: string;
  assignedFacultyName?: string;
  assignedStudentIds?: string[];
}

export type ContestStatus = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'ENDED' | 'CANCELLED';

export interface Contest {
  id: string;
  name: string;
  description: string;
  code?: string;
  accessCode?: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  maxParticipants: number;
  status: ContestStatus;
  isPublished?: boolean;
  difficultyRange: [number, number];
  questionCount: number;
  kotlinOnly: boolean;
  scoringConfig: {
    difficultyWeights: Record<number, number>;
    attemptPenalty: number;
    skipImpact: number;
    tieBreaker: string;
  };
  attemptRules: string;
  skipRules: string;
  leaderboardVisible: boolean;
  autoStart: boolean;
  autoEnd: boolean;
  sessionPolicy: string;
  singleActiveSession: boolean;
  codeExecutionLimits: {
    cpuLimitSec: number;
    memoryLimitMb: number;
    maxCodeSizeKb: number;
    networkDisabled: boolean;
    readOnlyFs: boolean;
  };
  createdBy: string;
  createdAt: string;
  participantsCount?: number;
  participantIds?: string[];
  assignedFacultyIds?: string[];
  assignedFaculty?: {
    id: string;
    name: string;
    email: string;
    department?: string;
  }[];
  questionIds?: string[];
  assignedQuestionsCount?: number;
  isJoined?: boolean;
}

export interface Question {
  id: string;
  title: string;
  problemStatement: string;
  difficulty: number; // 1 - 10
  category: string;
  tags: string[];
  functionSignature: string;
  starterCode: string;
  expectedInput: string;
  expectedOutput: string;
  constraints: string;
  sampleInput: string;
  sampleOutput: string;
  explanation: string;
  visibleTestCasesCount: number;
  hiddenTestCasesCount: number;
  successRate: number;
  averageTimeMinutes: number;
  skipRate: number;
  attemptsCount: number;
  solvesCount: number;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  createdAt: string;
}

export interface TestCase {
  id: string;
  questionId: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  isEnabled: boolean;
  description?: string;
  executionTimeLimitMs?: number;
}

export type SessionState = 'ACTIVE' | 'IDLE' | 'OFFLINE' | 'COMPLETED' | 'PAUSED';

export interface LiveSession {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  contestId: string;
  currentQuestionId: string;
  currentQuestionTitle: string;
  currentDifficulty: number;
  score: number;
  solvedCount: number;
  skippedCount: number;
  attemptsCount: number;
  timeRemainingSeconds: number;
  sessionStatus: SessionState;
  lastActivity: string;
  anomalyStatus: 'HIGH' | 'MEDIUM' | 'NONE';
  anomalyType?: string;
  ipAddress: string;
  device: string;
  browser: string;
  loginTime: string;
  currentCodeSnippet?: string;
}

export type SubmissionResult = 'ACCEPTED' | 'WRONG_ANSWER' | 'COMPILATION_ERROR' | 'TIME_LIMIT' | 'RUNTIME_ERROR' | 'REJECTED';

export interface Submission {
  id: string;
  studentId: string;
  studentName: string;
  questionId: string;
  questionTitle: string;
  difficulty: number;
  submittedAt: string;
  result: SubmissionResult;
  executionTimeMs: number;
  memoryUsedMb: string;
  testCasesPassed: number;
  totalTestCases: number;
  scoreAwarded: number;
  language: string;
  sessionId: string;
  code: string;
  compilerOutput?: string;
  testCaseResults?: Array<{
    id: number;
    passed: boolean;
    inputPreview: string;
    expectedOutputPreview: string;
    actualOutputPreview: string;
    timeMs: number;
  }>;
}

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  studentName: string;
  studentEmail: string;
  score: number;
  solved: number;
  attempts: number;
  skipped: number;
  currentDifficulty: number;
  highestDifficulty: number;
  averageTimeMinutes: number;
  lastSubmission: string;
  isOnline: boolean;
}

export type AnomalyType = 
  | 'INSTANT_SOLVE'
  | 'DIFFICULTY_JUMP'
  | 'RAPID_SUBMISSIONS'
  | 'SUCCESS_RATE_ANOMALY'
  | 'TIME_SYNC_ANOMALY'
  | 'MULTIPLE_LOGIN'
  | 'SESSION_ANOMALY';

export interface Anomaly {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  type: AnomalyType;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  timestamp: string;
  sessionId: string;
  questionId?: string;
  questionTitle?: string;
  status: 'NEW' | 'UNDER_REVIEW' | 'REVIEWED' | 'DISMISSED';
  supportingData: Record<string, any>;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  studentId: string;
  studentName: string;
  action: 'LOGIN' | 'LOGOUT' | 'QUESTION_OPENED' | 'SUBMISSION' | 'QUESTION_SKIPPED' | 'DIFFICULTY_CHANGED' | 'SESSION_START' | 'SESSION_END' | 'ADMIN_INTERVENTION';
  details: string;
  ipAddress: string;
  device: string;
  sessionId: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: string;
  action: string;
  details: string;
  ipAddress: string;
  sessionId: string;
  result: 'SUCCESS' | 'FAILED';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  category: 'APPROVAL' | 'CONTEST' | 'SYSTEM' | 'ANOMALY' | 'SESSION' | 'SUBMISSION';
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface AdminSettings {
  contest: {
    defaultDurationMinutes: number;
    maxParticipants: number;
    autoStart: boolean;
    autoEnd: boolean;
  };
  difficulty: {
    levelsCount: number;
    dynamicCalibration: boolean;
    promotionThreshold: number;
    demotionThreshold: number;
  };
  scoring: {
    difficultyWeights: Record<number, number>;
    tieBreakerRule: string;
    maxAttemptPenalty: number;
    skipScorePenalty: number;
  };
  codeExecution: {
    language: string;
    cpuLimitSec: number;
    memoryLimitMb: number;
    maxCodeSizeKb: number;
    networkDisabled: boolean;
    readOnlyFs: boolean;
  };
  authentication: {
    googleOauthStatus: string;
    jwtExpirationHours: number;
    sessionPolicy: string;
    singleActiveSessionEnforced: boolean;
  };
}

export interface DashboardKpis {
  users: {
    total: number;
    approvedStudents: number;
    pendingApprovals: number;
    rejectedUsers: number;
    facultyCount: number;
    activeUsers: number;
  };
  contest: {
    status: ContestStatus;
    name: string;
    totalRegistered: number;
    activeParticipants: number;
    completedParticipants: number;
    notStarted: number;
    timeRemainingSeconds: number;
    startTime: string;
    endTime: string;
  };
  questions: {
    total: number;
    countByLevel: Record<number, number>;
  };
  submissions: {
    total: number;
    successful: number;
    failed: number;
    compilationErrors: number;
    timeouts: number;
    skipped: number;
  };
  security: {
    activeAnomalies: number;
    highPriorityAnomalies: number;
    multipleLoginAlerts: number;
    rapidSubmissionsAlerts: number;
    timeSyncAlerts: number;
  };
}

export interface BadgeCounts {
  pendingApprovals: number;
  activeAnomalies: number;
  unreadNotifications: number;
  activeSessions: number;
}
