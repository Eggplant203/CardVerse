import { Element } from '@/types/card';

export const FLORA_ELEMENT = {
  name: Element.FLORA,
  color: '#059669',
  icon: '🌿',
  strengths: [Element.CRYSTAL, Element.STORM],
  weaknesses: [Element.BLOOD, Element.VOID],
  description: 'Flora cards excel at healing, regeneration, and summoning natural allies.',
  commonEffects: ['heal', 'regenerate', 'summon_nature'],
  statBias: {
    health: 15,
    attack: -5,
    defense: 5,
    speed: -5,
    stamina: 10
  }
};
