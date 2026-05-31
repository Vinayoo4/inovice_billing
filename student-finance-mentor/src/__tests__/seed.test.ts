import { describe, it, expect } from 'vitest';
import seedData from '../data/seed.json';

describe('Seed Data Verification', () => {
  it('contains correct number of initial seed data items', () => {
    // 3 templates, 5 scenarios, 8 lessons
    expect(seedData.budgetTemplates.length).toBe(3);
    expect(seedData.scenarios.length).toBe(5);
    expect(seedData.lessons.length).toBe(8);
  });

  it('lessons contain quizzes with correct structure', () => {
    const lesson = seedData.lessons[0];
    expect(lesson.quiz).toBeDefined();
    expect(lesson.quiz.length).toBeGreaterThan(0);
    expect(lesson.quiz[0].options.length).toBe(4);
  });
});
