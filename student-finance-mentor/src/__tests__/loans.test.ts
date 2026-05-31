import { describe, it, expect } from 'vitest';

describe('Loan EMI calculations', () => {
  const calculateEMI = (principal: number, annualRate: number, termYears: number) => {
    if (annualRate === 0) return principal / (termYears * 12);
    const monthlyRate = annualRate / 12 / 100;
    const months = termYears * 12;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(emi);
  };

  it('EMI formula calculates correctly for known inputs', () => {
    // 1 Lakh @ 10% for 1 year -> EMI should be ~8792
    const emi1 = calculateEMI(100000, 10, 1);
    expect(emi1).toBe(8792);

    // 5 Lakhs @ 8.5% for 5 years -> EMI should be ~10258
    const emi2 = calculateEMI(500000, 8.5, 5);
    expect(emi2).toBe(10258);
  });

  it('Total interest is correct given EMI', () => {
    const principal = 100000;
    const termYears = 1;
    const emi = calculateEMI(principal, 10, termYears);

    const totalPayable = emi * (termYears * 12);
    const totalInterest = totalPayable - principal;

    // 8792 * 12 = 105504
    // 105504 - 100000 = 5504
    expect(totalInterest).toBe(5504);
  });
});
