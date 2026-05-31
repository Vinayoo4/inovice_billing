import { describe, it, expect } from 'vitest';

describe('Lessons and Quiz scoring', () => {
  it('quiz correct answer scores correctly', () => {
    const quiz = [
      { correct: 1 },
      { correct: 2 },
      { correct: 0 }
    ];

    const userAnswers1 = { 0: 1, 1: 2, 2: 0 }; // All correct
    const userAnswers2 = { 0: 1, 1: 0, 2: 0 }; // 2 correct

    const calculateScore = (answers: Record<number, number>) => {
      let score = 0;
      quiz.forEach((q, idx) => {
        if (answers[idx] === q.correct) score++;
      });
      return score;
    };

    expect(calculateScore(userAnswers1)).toBe(3);
    expect(calculateScore(userAnswers2)).toBe(2);
  });
});
