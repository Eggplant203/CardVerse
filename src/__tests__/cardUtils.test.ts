import { getStatRangesString, filterAndClampStats } from '../utils/cardUtils';

describe('cardUtils', () => {
  describe('getStatRangesString', () => {
    it('should return correct stat ranges string with only health, attack, and manaCost', () => {
      const result = getStatRangesString();

      // Check that it contains the correct stats
      expect(result).toContain('health: 1-12');
      expect(result).toContain('attack: 0-12');
      expect(result).toContain('manaCost: 0-10');

      // Check that it does NOT contain removed stats
      expect(result).not.toContain('stamina');
      expect(result).not.toContain('defense');
      expect(result).not.toContain('speed');

      // Check format
      expect(result).toMatch(/health: \d+-\d+, attack: \d+-\d+, manaCost: \d+-\d+/);
    });
  });

  describe('filterAndClampStats', () => {
    it('should return default stats when suggestedStats is undefined', () => {
      const result = filterAndClampStats(undefined);
      expect(result).toEqual({
        health: 6,
        attack: 6,
        manaCost: 5
      });
    });

    it('should filter out invalid stats and keep only valid ones', () => {
      const suggestedStats = {
        health: 10,
        attack: 8,
        manaCost: 6,
        stamina: 15,
        speed: 20,
        defense: 12
      };
      const result = filterAndClampStats(suggestedStats);
      expect(result).toEqual({
        health: 10,
        attack: 8,
        manaCost: 6
      });
      expect(result).not.toHaveProperty('stamina');
      expect(result).not.toHaveProperty('speed');
      expect(result).not.toHaveProperty('defense');
    });

    it('should clamp health to min and max', () => {
      const resultMin = filterAndClampStats({ health: 0 });
      const resultMax = filterAndClampStats({ health: 20 });
      expect(resultMin.health).toBe(1); // min is 1
      expect(resultMax.health).toBe(12); // max is 12
    });

    it('should clamp attack to min and max', () => {
      const resultMin = filterAndClampStats({ attack: -5 });
      const resultMax = filterAndClampStats({ attack: 20 });
      expect(resultMin.attack).toBe(0); // min is 0
      expect(resultMax.attack).toBe(12); // max is 12
    });

    it('should clamp manaCost to min and max', () => {
      const resultMin = filterAndClampStats({ manaCost: -1 });
      const resultMax = filterAndClampStats({ manaCost: 15 });
      expect(resultMin.manaCost).toBe(0); // min is 0
      expect(resultMax.manaCost).toBe(10); // max is 10
    });

    it('should handle mixed valid and invalid stats with clamping', () => {
      const suggestedStats = {
        health: 15, // over max
        attack: -2, // under min
        manaCost: 8, // valid
        stamina: 10, // invalid
        speed: 5 // invalid
      };
      const result = filterAndClampStats(suggestedStats);
      expect(result).toEqual({
        health: 12, // clamped to max
        attack: 0, // clamped to min
        manaCost: 8 // unchanged
      });
    });

    it('should handle non-numeric values by using defaults', () => {
      const suggestedStats = {
        health: 'invalid' as unknown as number,
        attack: NaN,
        manaCost: 7
      };
      const result = filterAndClampStats(suggestedStats);
      expect(result).toEqual({
        health: 6, // default
        attack: 6, // default
        manaCost: 7 // valid
      });
    });
  });
});
