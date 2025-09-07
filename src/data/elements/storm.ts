import { Element } from '@/types/card';

export const STORM_ELEMENT = {
  name: Element.STORM,
  color: '#FBBF24',
  icon: '⚡',
  strengths: [Element.CRYSTAL, Element.BLOOD],
  weaknesses: [Element.VOID, Element.AETHER],
  description: 'Storm cards focus on speed, chain damage, and unpredictable burst effects.',
  commonEffects: ['chain_lightning', 'haste', 'stun'],
  statBias: {
    health: -10,
    attack: 10,
    defense: -10,
    speed: 20,
    stamina: 5
  }
};
