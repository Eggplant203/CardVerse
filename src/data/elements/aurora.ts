import { Element } from '@/types/card';

export const AURORA_ELEMENT = {
  name: Element.AURORA,
  color: '#8B5CF6',
  icon: '🌈',
  strengths: [Element.VOID, Element.BLOOD],
  weaknesses: [Element.CRYSTAL, Element.AETHER],
  description: 'Aurora cards feature rare, mystical abilities with unpredictable effects. They represent prismatic energy.',
  commonEffects: ['transform', 'charm', 'random_power'],
  statBias: {
    health: 0,
    attack: 5,
    defense: 5,
    speed: 10,
    stamina: 0
  }
};
