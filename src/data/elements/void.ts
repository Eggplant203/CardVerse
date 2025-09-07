import { Element } from '@/types/card';

export const VOID_ELEMENT = {
  name: Element.VOID,
  color: '#1E1E1E',
  icon: '⚫',
  strengths: [Element.FLORA, Element.AETHER],
  weaknesses: [Element.AURORA, Element.CRYSTAL],
  description: 'Void cards focus on draining resources, weakening opponents, and shadow manipulation.',
  commonEffects: ['drain', 'weaken', 'silence'],
  statBias: {
    health: 5,
    attack: -5,
    defense: 10,
    speed: -5,
    stamina: 0
  }
};
