import { Rarity } from '@/types/card';

export const UNCOMMON_RARITY = {
  type: Rarity.UNCOMMON,
  color: '#3498DB',
  dropRate: 25,
  statMultiplier: 1.2,
  effectsCount: { min: 1, max: 1 },
  description: 'Uncommon cards have slightly better stats than common cards and always include at least one effect.'
};
