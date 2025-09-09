import { Element } from '@/types/card';

export const CRYSTAL_ELEMENT = {
  name: Element.CRYSTAL,
  color: '#D53F8C',
  icon: '💎',
  strengths: [Element.VOID, Element.AURORA],
  weaknesses: [Element.STORM, Element.FLORA],
  description: 'Crystal cards excel at defense, reflection, and enhancing other cards with prismatic energy.',
  commonEffects: ['reflect', 'enhance', 'barrier'],
  statBias: {
    health: 0,
    attack: 0
  }
};
