import mongoose, { Schema, Document } from 'mongoose';
import { Difficulty, QuestionType } from '../shared/types';

export interface IQuestion {
  type: QuestionType;
  question: string;
  options: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
  difficulty: Difficulty;
  order: number;
}

export interface IQuiz extends Document {
  creatorId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  subject: string;
  topic: string;
  difficulty: Difficulty;
  coverImage?: string;
  questions: IQuestion[];
  settings: {
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
  };
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  type: {
    type: String,
    enum: ['multiple_choice', 'true_false', 'multiple_select', 'fill_in_the_blank', 'short_answer', 'matching', 'ordering'],
    required: true
  },
  question: { type: String, required: true },
  options: [{ type: String }],
  correctAnswer: { type: Schema.Types.Mixed, required: true }, // string, string[], or boolean
  explanation: { type: String, default: '' },
  points: { type: Number, default: 100 },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'expert'], default: 'medium' },
  order: { type: Number, required: true }
});

const QuizSchema = new Schema<IQuiz>(
  {
    creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    subject: { type: String, required: true, trim: true },
    topic: { type: String, default: '' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'expert'], default: 'medium' },
    coverImage: { type: String, default: '' },
    questions: [QuestionSchema],
    settings: {
      shuffleQuestions: { type: Boolean, default: false },
      shuffleAnswers: { type: Boolean, default: false },
      timerMode: { type: String, enum: ['off', 'question', 'quiz'], default: 'question' },
      timerDuration: { type: Number, default: 30 },
      showCorrectAnswers: { type: String, enum: ['immediately', 'after_quiz', 'never'], default: 'immediately' },
      showExplanations: { type: String, enum: ['immediately', 'after_quiz', 'never'], default: 'immediately' },
      enableLeaderboard: { type: Boolean, default: true },
      enableSpeedBonus: { type: Boolean, default: true },
      allowRetry: { type: Boolean, default: true },
      allowLateJoining: { type: Boolean, default: true }
    },
    published: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model<IQuiz>('Quiz', QuizSchema);
export { QuestionSchema };
