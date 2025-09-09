import { generateImageAnalysisPrompt } from '../services/ai/descriptionGenerator';

describe('descriptionGenerator', () => {
  describe('generateImageAnalysisPrompt', () => {
    it('should include BALANCING RULES section', () => {
      const prompt = generateImageAnalysisPrompt();

      expect(prompt).toContain('4. BALANCING RULES:');
      expect(prompt).toContain('Mana Cost ≈ (Attack + Health) / 2');
      expect(prompt).toContain('2 mana → 3/2 or 2/3');
      expect(prompt).toContain('5 mana → 6/6');
      expect(prompt).toContain('8 mana → 10/10');
    });

    it('should not contain removed stats in formatting instructions', () => {
      const prompt = generateImageAnalysisPrompt();

      expect(prompt).toContain('Wrap stat names (health, attack, manaCost)');
      expect(prompt).not.toContain('stamina');
      expect(prompt).not.toContain('defense');
      expect(prompt).not.toContain('speed');
    });

    it('should have correct section numbering', () => {
      const prompt = generateImageAnalysisPrompt();

      expect(prompt).toContain('4. BALANCING RULES:');
      expect(prompt).toContain('5. CREATE CARD TEXT:');
      expect(prompt).toContain('6. SUGGEST 1-3 CARD EFFECTS');
    });

    it('should include mana efficiency guidelines for spells', () => {
      const prompt = generateImageAnalysisPrompt();

      expect(prompt).toContain('1 mana spell ≈ deal 1-2 damage / heal 2 / buff +1/+1');
      expect(prompt).toContain('5 mana spell ≈ deal 6-7 damage / revive a unit / strong control');
    });
  });
});
