import mongoose, { Schema, Document } from 'mongoose';

export interface IClass extends Document {
  teacherId: mongoose.Types.ObjectId;
  name: string;
  subject: string;
  joinCode: string;
  students: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ClassSchema = new Schema<IClass>(
  {
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    joinCode: { type: String, required: true, unique: true, index: true },
    students: [{ type: Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

export default mongoose.model<IClass>('Class', ClassSchema);
