import { Rarity } from '@/types/card';

export const LEGENDARY_RARITY = {
  type: Rarity.LEGENDARY,
  color: '#F1C40F',
  dropRate: 0.2,
  statMultiplier: 2.2,
  effectsCount: { min: 2, max: 3 },
  description: 'Legendary cards are extremely rare and powerful, with the highest stats and up to three powerful effects.'
};
