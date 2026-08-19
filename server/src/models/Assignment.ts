import mongoose, { Schema, Document } from 'mongoose';

export interface IAssignment extends Document {
  quizId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  studentIds: mongoose.Types.ObjectId[];
  deadline: Date;
  attemptLimit: number;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>(
  {
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    studentIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    deadline: { type: Date, required: true },
    attemptLimit: { type: Number, default: 1 }
  },
  { timestamps: true }
);

export default mongoose.model<IAssignment>('Assignment', AssignmentSchema);
