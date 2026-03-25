import { calculateProgress } from '../utils/stats.util';

describe('calculateProgress', () => {
  it('should return 50 for 50/100', () => {
    expect(calculateProgress(50, 100)).toBe(50);
  });

  it('should return 0 for 0/100', () => {
    expect(calculateProgress(0, 100)).toBe(0);
  });

  it('should return 0 for 0/0 (edge case)', () => {
    expect(calculateProgress(0, 0)).toBe(0);
  });

  it('should handle large numbers correctly', () => {
    expect(calculateProgress(33, 100)).toBe(33);
    expect(calculateProgress(1, 3)).toBe(33); // Rounding
  });
});
