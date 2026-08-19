import mongoose, { Schema, Document } from 'mongoose';
import { RoomStatus, QuizMode } from '../../../shared/types';

export interface IParticipant {
  studentId: mongoose.Types.ObjectId;
  name: string;
  avatar: string;
  score: number;
  correctAnswers: number;
  streak: number;
  joinedAt: Date;
  completedAt?: Date;
  lastAnsweredIndex?: number;
  isCorrect?: boolean;
}

export interface IRoom extends Document {
  roomCode: string;
  quizId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  status: RoomStatus;
  currentQuestionIndex: number;
  participants: IParticipant[];
  settings: {
    mode: QuizMode;
    timerDuration: number;
    showLeaderboardEveryQuestion: boolean;
  };
  questionStartedAt?: Date;
  createdAt: Date;
  expiresAt: Date;
}

const ParticipantSchema = new Schema<IParticipant>({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  avatar: { type: String, default: 'avatar1' },
  score: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  joinedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  lastAnsweredIndex: { type: Number, default: -1 },
  isCorrect: { type: Boolean }
});

const RoomSchema = new Schema<IRoom>({
  roomCode: { type: String, required: true, unique: true, index: true },
  quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
  teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['WAITING', 'STARTING', 'QUESTION_ACTIVE', 'QUESTION_ENDED', 'RESULTS', 'COMPLETED'],
    default: 'WAITING',
    required: true
  },
  currentQuestionIndex: { type: Number, default: -1 },
  participants: [ParticipantSchema],
  settings: {
    mode: {
      type: String,
      enum: ['classic_live', 'teacher_led', 'student_paced', 'speed_challenge', 'team_mode', 'practice_mode', 'test_mode'],
      default: 'classic_live'
    },
    timerDuration: { type: Number, default: 30 },
    showLeaderboardEveryQuestion: { type: Boolean, default: true }
  },
  questionStartedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) } // expires in 24 hours
});

// Automatically expire documents after expiresAt
RoomSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IRoom>('Room', RoomSchema);
export { ParticipantSchema };
