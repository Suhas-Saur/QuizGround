import mongoose, { Schema, Document } from 'mongoose';

export interface IAttemptAnswer {
  questionIndex: number;
  questionId: mongoose.Types.ObjectId;
  studentAnswer: string | string[];
  isCorrect: boolean;
  pointsEarned: number;
  timeTaken: number;
}

export interface IAttempt extends Document {
  studentId: mongoose.Types.ObjectId;
  quizId: mongoose.Types.ObjectId;
  answers: IAttemptAnswer[];
  score: number;
  accuracy: number;
  timeTaken: number;
  completedAt: Date;
}

const AttemptAnswerSchema = new Schema<IAttemptAnswer>({
  questionIndex: { type: Number, required: true },
  questionId: { type: Schema.Types.ObjectId, required: true },
  studentAnswer: { type: Schema.Types.Mixed, required: true },
  isCorrect: { type: Boolean, required: true },
  pointsEarned: { type: Number, required: true },
  timeTaken: { type: Number, required: true }
});

const AttemptSchema = new Schema<IAttempt>({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
  answers: [AttemptAnswerSchema],
  score: { type: Number, required: true },
  accuracy: { type: Number, required: true }, // percentage 0-100
  timeTaken: { type: Number, required: true }, // total duration in seconds
  completedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IAttempt>('Attempt', AttemptSchema);
export { AttemptAnswerSchema };
