// Costumes, circa 1900 Kansas and Baum's Munchkin country (see ART-REFERENCE.md).
import {Costume} from './human';
import {OZ} from './look';

export const DOROTHY: Costume = {
  kind: 'child',
  female: true,
  skin: OZ.skinG,
  skinShade: OZ.skinGs,
  hair: '#5A3A22',
  hairStyle: 'braids',
  shirt: OZ.gingham,
  sleeve: OZ.gingham,
  shortSleeve: true,
  skirt: OZ.gingham,
  skirtLen: 0.55,
  collar: '#FAF7F0',
  legs: '#3A3A44', // dark cotton stockings
  boots: '#2A221C', // high button boots
  hat: 'none',
};
export const DOROTHY_BONNET: Costume = {...DOROTHY, hat: 'bonnet', hatColor: OZ.bonnet};

export const EM: Costume = {
  kind: 'adult',
  female: true,
  skin: OZ.skinW,
  skinShade: OZ.skinWs,
  hair: '#7B7166',
  hairStyle: 'bun',
  shirt: 'url(#calico)',
  sleeve: 'url(#calico)',
  skirt: 'url(#calico)',
  skirtLen: 0.97,
  apron: OZ.apron,
  collar: '#5A524A',
  legs: '#3A332C',
  boots: OZ.boots,
  wrinkles: true,
};

export const HENRY: Costume = {
  kind: 'adult',
  skin: OZ.skinW,
  skinShade: OZ.skinWs,
  hair: '#9E9A93',
  hairStyle: 'short',
  beard: OZ.beard,
  shirt: OZ.henryShirt,
  trousers: OZ.trousers,
  suspenders: '#3E3329',
  boots: OZ.boots,
  hat: 'brim',
  hatColor: '#6A645B',
  hatBand: '#3A342D',
  wrinkles: true,
};

const munch = (coat: string, beard: string): Costume => ({
  kind: 'small',
  skin: '#EBC09C',
  skinShade: '#CF9E7C',
  hair: beard,
  hairStyle: 'short',
  beard,
  shirt: coat,
  trousers: OZ.munchBlue,
  boots: '#1E1A16',
  bootTop: OZ.munchBlue2, // "well-polished boots with a deep roll of blue at the tops"
  hat: 'point',
  hatColor: OZ.munchBlue,
  bells: true,
  wrinkles: true,
});
export const MUNCH1 = munch('#2F63D0', '#D9D4CC');
export const MUNCH2 = munch('#1F4FB0', '#8E8A84');
export const MUNCH3 = munch('#3A72E0', '#C9C2B8');

// "The little old woman": white gown hung in pleats, sprinkled with little stars, white hair, wrinkled face.
export const OLD_WOMAN: Costume = {
  kind: 'small',
  female: true,
  skin: '#EBC4A6',
  skinShade: '#CFA284',
  hair: '#F2EEE6',
  hairStyle: 'white-long',
  shirt: OZ.witchWhite,
  skirt: OZ.witchWhite,
  skirtLen: 0.96,
  legs: '#DDD8CC',
  boots: '#BFB8AA',
  hat: 'point',
  hatColor: OZ.witchWhite,
  stars: true,
  wrinkles: true,
};
