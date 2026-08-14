import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion extends Document {
  exam: string;
  subject: string;
  topic?: string;
  year?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  status?: 'published' | 'draft' | 'archived';
  text: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  qualityFlags?: string[];
  duplicateOf?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema(
  {
    exam: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    topic: {
      type: String,
      default: 'General',
      trim: true,
      index: true,
    },
    year: {
      type: String,
      default: '2024',
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
      index: true,
    },
    status: {
      type: String,
      enum: ['published', 'draft', 'archived'],
      default: 'published',
      index: true,
    },
    text: {
      type: String,
      required: true,
    },
    options: [
      {
        type: String,
        required: true,
      },
    ],
    correctAnswer: {
      type: String,
      required: true,
    },
    explanation: {
      type: String,
    },
    qualityFlags: [
      {
        type: String,
      },
    ],
    duplicateOf: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient quiz generation and adaptive selection
questionSchema.index({ exam: 1, subject: 1, topic: 1, difficulty: 1, status: 1 });

const Question = mongoose.model<IQuestion>('Question', questionSchema);

export default Question;
