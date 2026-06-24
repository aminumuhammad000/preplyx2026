import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestionDetail {
  questionId: string;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

export interface IExamSession extends Document {
  user: mongoose.Types.ObjectId;
  exam: string;
  subject: string;
  score: number;
  total: number;
  percentage: number;
  timeSpentSeconds: number;
  details: IQuestionDetail[];
  createdAt: Date;
  updatedAt: Date;
}

const questionDetailSchema = new Schema({
  questionId: {
    type: String,
    required: true,
  },
  questionText: {
    type: String,
    required: true,
  },
  userAnswer: {
    type: String,
    required: true,
  },
  correctAnswer: {
    type: String,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    required: true,
  },
  explanation: {
    type: String,
  },
});

const examSessionSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    exam: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    timeSpentSeconds: {
      type: Number,
      required: true,
      default: 0,
    },
    details: [{
      type: questionDetailSchema,
    }],
  },
  {
    timestamps: true,
  }
);

const ExamSession = mongoose.model<IExamSession>('ExamSession', examSessionSchema);

export default ExamSession;
