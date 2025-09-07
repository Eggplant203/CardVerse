import { AURORA_ELEMENT } from './aurora';
import { VOID_ELEMENT } from './void';
import { CRYSTAL_ELEMENT } from './crystal';
import { BLOOD_ELEMENT } from './blood';
import { STORM_ELEMENT } from './storm';
import { FLORA_ELEMENT } from './flora';
import { AETHER_ELEMENT } from './aether';

export const ELEMENTS = {
  AURORA: AURORA_ELEMENT,
  VOID: VOID_ELEMENT,
  CRYSTAL: CRYSTAL_ELEMENT,
  BLOOD: BLOOD_ELEMENT,
  STORM: STORM_ELEMENT,
  FLORA: FLORA_ELEMENT,
  AETHER: AETHER_ELEMENT,
};

export const getElementByName = (name: string) => {
  const normalizedName = name.toLowerCase();
  return Object.values(ELEMENTS).find(
    element => element.name.toLowerCase() === normalizedName
  );
};
