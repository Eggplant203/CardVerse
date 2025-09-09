import { getStatRangesString } from '../utils/cardUtils';

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
});
