import { Element } from '@/types/card';

export const AETHER_ELEMENT = {
  name: Element.AETHER,
  color: '#6366F1',
  icon: '🔮',
  strengths: [Element.STORM, Element.AURORA],
  weaknesses: [Element.BLOOD, Element.FLORA],
  description: 'Aether cards manipulate arcane energy for powerful spells and magical transformations.',
  commonEffects: ['spellcast', 'transform', 'mana_manipulation'],
  statBias: {
    health: -5,
    attack: 5,
    defense: 0,
    speed: 5,
    stamina: 15
  }
};
