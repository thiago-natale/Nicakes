import type { IconName } from '../../ui/Icon.astro';
import { birthdayCake } from '../../../data/menu';

export const orderPerks: { icon: IconName; lines: [string, string] }[] = [
  { icon: 'cake', lines: [`${birthdayCake.doughs.length} opções`, 'de massa'] },
  { icon: 'rose', lines: [`${birthdayCake.fillings.length} sabores`, 'de recheio'] },
  { icon: 'gift', lines: ['Topo e cores', 'personalizados'] },
];

export const ordersImage = {
  src: '/images/custom-birthday-cake.webp',
  alt: 'Bolo de dois andares em tons de rosa com rendas verde-sálvia e rosas, ao lado de caixas de presente',
  width: 1100,
  height: 614,
};

