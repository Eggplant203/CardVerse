import { Rarity } from '@/types/card';

export const RARE_RARITY = {
  type: Rarity.RARE,
  color: '#9B59B6',
  dropRate: 8,
  statMultiplier: 1.5,
  effectsCount: { min: 1, max: 2 },
  description: 'Rare cards have substantially better stats and may have up to two different effects.'
};
