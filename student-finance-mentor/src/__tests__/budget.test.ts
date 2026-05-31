import { describe, it, expect } from 'vitest';

describe('Budget calculations', () => {
  it('budget percentages correctly calculate to absolute amounts based on income', () => {
    const income = 15000;
    const categories = [
      { name: 'Rent', percentage: 40 },
      { name: 'Food', percentage: 30 },
      { name: 'Misc', percentage: 30 }
    ];

    const amounts = categories.map(c => (c.percentage / 100) * income);

    expect(amounts[0]).toBe(6000); // 40% of 15000
    expect(amounts[1]).toBe(4500); // 30% of 15000
    expect(amounts[2]).toBe(4500); // 30% of 15000

    // Sum to total
    expect(amounts.reduce((a,b) => a+b, 0)).toBe(income);
  });

  it('remaining balance calculates correctly', () => {
    const budgetAmount = 15000;
    const mockExpenses = [
      { amount: 5000 },
      { amount: 2000 }
    ];

    const totalSpent = mockExpenses.reduce((sum, e) => sum + e.amount, 0);
    const remaining = budgetAmount - totalSpent;

    expect(totalSpent).toBe(7000);
    expect(remaining).toBe(8000);
  });
});
