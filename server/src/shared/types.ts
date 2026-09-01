export type UserRole = 'student' | 'teacher';

export type QuestionType =
  | 'multiple_choice'
  | 'true_false'
  | 'multiple_select'
  | 'fill_in_the_blank'
  | 'short_answer'
  | 'matching'
  | 'ordering';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export type RoomStatus =
  | 'WAITING'
  | 'STARTING'
  | 'QUESTION_ACTIVE'
  | 'QUESTION_ENDED'
  | 'RESULTS'
  | 'COMPLETED';

export type QuizMode =
  | 'classic_live'
  | 'teacher_led'
  | 'student_paced'
  | 'speed_challenge'
  | 'team_mode'
  | 'practice_mode'
  | 'test_mode';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  institution?: string;
  class?: string;
  subject?: string;
  avatar?: string;
  xp: number;
  level: number;
  streak: number;
  lastStreakUpdate?: string;
  createdAt: string;
}

export interface Question {
  _id?: string;
  type: QuestionType;
  question: string;
  options: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
  difficulty: Difficulty;
  order: number;
}

export interface QuizSettings {
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  timerMode: 'off' | 'question' | 'quiz';
  timerDuration: number;
  showCorrectAnswers: 'immediately' | 'after_quiz' | 'never';
  showExplanations: 'immediately' | 'after_quiz' | 'never';
  enableLeaderboard: boolean;
  enableSpeedBonus: boolean;
  allowRetry: boolean;
  allowLateJoining: boolean;
}

export interface Quiz {
  _id: string;
  creatorId: string;
  creatorName?: string;
  title: string;
  description: string;
  subject: string;
  topic: string;
  difficulty: Difficulty;
  coverImage?: string;
  questions: Question[];
  settings: QuizSettings;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  attemptsCount?: number;
  rating?: number;
}

export interface Participant {
  studentId: string;
  name: string;
  avatar: string;
  score: number;
  correctAnswers: number;
  streak: number;
  joinedAt: string;
  completedAt?: string;
  lastAnsweredIndex?: number;
  isCorrect?: boolean;
}

export interface Room {
  _id: string;
  roomCode: string;
  quizId: Quiz;
  teacherId: string;
  status: RoomStatus;
  currentQuestionIndex: number;
  participants: Participant[];
  settings: {
    mode: QuizMode;
    timerDuration: number;
    showLeaderboardEveryQuestion: boolean;
  };
  questionStartedAt?: string;
  createdAt: string;
  expiresAt: string;
}

export interface Class {
  _id: string;
  teacherId: string;
  name: string;
  subject: string;
  joinCode: string;
  students: string[];
  studentCount?: number;
  createdAt: string;
}

export interface Assignment {
  _id: string;
  quizId: string | Quiz;
  teacherId: string;
  classId: string | Class;
  studentIds: string[];
  deadline: string;
  attemptLimit: number;
  createdAt: string;
}

export interface Attempt {
  _id: string;
  studentId: string;
  quizId: string | Quiz;
  answers: {
    questionIndex: number;
    questionId: string;
    studentAnswer: string | string[];
    isCorrect: boolean;
    pointsEarned: number;
    timeTaken: number;
  }[];
  score: number;
  accuracy: number;
  timeTaken: number;
  completedAt: string;
}

export interface Achievement {
  _id: string;
  studentId: string;
  type: string;
  earnedAt: string;
}

export interface Notification {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
