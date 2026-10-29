import type { IconName } from '../../ui/Icon.astro';
import { birthdayCake } from '../../../data/menu';

export const orderPerks: { icon: IconName; lines: [string, string] }[] = [
  { icon: 'cake', lines: [`${birthdayCake.doughs.length} opções`, 'de massa'] },
  { icon: 'rose', lines: [`${birthdayCake.fillings.length} sabores`, 'de recheio'] },
  { icon: 'gift', lines: ['Topo e cores', 'personalizados'] },
];

