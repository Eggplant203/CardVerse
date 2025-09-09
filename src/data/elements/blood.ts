import { Element } from '@/types/card';

export const BLOOD_ELEMENT = {
  name: Element.BLOOD,
  color: '#881337',
  icon: '🩸',
  strengths: [Element.FLORA, Element.AETHER],
  weaknesses: [Element.AURORA, Element.STORM],
  description: 'Blood cards harness life force for powerful abilities at the cost of health, featuring sacrifice mechanics.',
  commonEffects: ['sacrifice', 'leech', 'berserk'],
  statBias: {
    health: 10,
    attack: 15
  }
};
