import { Rarity } from '@/types/card';

export const COMMON_RARITY = {
  type: Rarity.COMMON,
  color: '#95A5A6',
  dropRate: 65, // Percentage chance in card packs
  statMultiplier: 1.0, // Base stats
  effectsCount: { min: 0, max: 1 },
  description: 'Common cards are the most frequently found cards with basic stats and simple effects.'
};
