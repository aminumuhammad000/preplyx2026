import { Request, Response, NextFunction } from 'express';
import Question from '../models/Question';

/**
 * @desc    Get questions based on query (exam, subject)
 * @route   GET /api/questions
 * @access  Private
 */
export const getQuestions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { exam, subject, limit = 50 } = req.query;

    const query: any = {};
    if (exam) query.exam = exam;
    if (subject) query.subject = subject;

    // Use aggregation to fetch random questions
    const questions = await Question.aggregate([
      { $match: query },
      { $sample: { size: Number(limit) } },
    ]);

    if (questions.length === 0) {
      // Return demo questions when no real data exists
      const demoQuestions = [
        {
          _id: 'demo_q1',
          exam: exam || 'JAMB',
          subject: subject || 'Mathematics',
          text: 'Solve for x: 2x + 5 = 15',
          options: ['x = 5', 'x = 10', 'x = 7.5', 'x = 4'],
          correctAnswer: 'x = 5',
          explanation: '2x + 5 = 15, subtract 5 from both sides: 2x = 10, divide by 2: x = 5'
        },
        {
          _id: 'demo_q2',
          exam: exam || 'JAMB',
          subject: subject || 'Mathematics',
          text: 'What is the derivative of f(x) = 3x² + 2x?',
          options: ['f\'(x) = 6x + 2', 'f\'(x) = 6x', 'f\'(x) = 3x + 2', 'f\'(x) = 6x² + 2'],
          correctAnswer: 'f\'(x) = 6x + 2',
          explanation: 'Using the power rule: derivative of 3x² is 6x, derivative of 2x is 2'
        },
        {
          _id: 'demo_q3',
          exam: exam || 'JAMB',
          subject: subject || 'Mathematics',
          text: 'Simplify: (2³)² × 2⁻⁴',
          options: ['8', '16', '32', '64'],
          correctAnswer: '16',
          explanation: '(2³)² = 2⁶, then 2⁶ × 2⁻⁴ = 2² = 4... wait, let me recalculate: (2³)² = 64, then 64 × 2⁻⁴ = 64 × 1/16 = 4. Correct answer is 4, but let me fix this: (2³)² = 2⁶ = 64, 2⁻⁴ = 1/16, 64 × 1/16 = 4. Actually, using exponent rules: (2³)² = 2⁶, 2⁶ × 2⁻⁴ = 2² = 4'
        },
        {
          _id: 'demo_q4',
          exam: exam || 'JAMB',
          subject: subject || 'Mathematics',
          text: 'What is the area of a circle with radius 7cm? (Use π = 22/7)',
          options: ['154 cm²', '44 cm²', '49 cm²', '154π cm²'],
          correctAnswer: '154 cm²',
          explanation: 'Area = πr² = (22/7) × 7² = (22/7) × 49 = 22 × 7 = 154 cm²'
        },
        {
          _id: 'demo_q5',
          exam: exam || 'JAMB',
          subject: subject || 'Mathematics',
          text: 'If log₁₀(x) = 2, what is the value of x?',
          options: ['20', '100', '200', '1000'],
          correctAnswer: '100',
          explanation: 'log₁₀(x) = 2 means 10² = x, so x = 100'
        }
      ];
      
      // Fix the third question's explanation and options
      demoQuestions[2].options = ['4', '8', '16', '32'];
      demoQuestions[2].correctAnswer = '4';
      demoQuestions[2].explanation = 'Using exponent rules: (2³)² = 2⁶, then 2⁶ × 2⁻⁴ = 2² = 4';
      
      res.json(demoQuestions.slice(0, Number(limit)));
      return;
    }

    res.json(questions);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new question
 * @route   POST /api/questions
 * @access  Private/Admin (Assuming private for now, you can restrict to admin later)
 */
export const createQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { exam, subject, text, options, correctAnswer, explanation } = req.body;

    const question = new Question({
      exam,
      subject,
      text,
      options,
      correctAnswer,
      explanation,
    });

    const createdQuestion = await question.save();
    res.status(201).json(createdQuestion);
  } catch (error) {
    next(error);
  }
};
