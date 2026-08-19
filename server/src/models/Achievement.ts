import mongoose, { Schema, Document } from 'mongoose';

export interface IAchievement extends Document {
  studentId: mongoose.Types.ObjectId;
  type: string; // 'first_quiz' | '10_quizzes' | 'perfect_score' | '7_streak' | 'quiz_master' | 'speed_demon' | 'top_10'
  earnedAt: Date;
}

const AchievementSchema = new Schema<IAcheivement>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    earnedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Composite unique index to avoid unlocking the same achievement multiple times
AchievementSchema.index({ studentId: 1, type: 1 }, { unique: true });

export default mongoose.model<IAchievement>('Achievement', AchievementSchema);
