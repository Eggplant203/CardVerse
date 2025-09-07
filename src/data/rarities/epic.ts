import { Rarity } from '@/types/card';

export const EPIC_RARITY = {
  type: Rarity.EPIC,
  color: '#E74C3C',
  dropRate: 1.8,
  statMultiplier: 1.8,
  effectsCount: { min: 2, max: 2 },
  description: 'Epic cards are very powerful with exceptional stats and always have two potent effects.'
};
