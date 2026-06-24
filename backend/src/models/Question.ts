import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion extends Document {
  exam: string;
  subject: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

const questionSchema = new Schema(
  {
    exam: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
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
  },
  {
    timestamps: true,
  }
);

const Question = mongoose.model<IQuestion>('Question', questionSchema);

export default Question;
