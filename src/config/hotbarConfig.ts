import { WeaponType } from '@/types';

export type Hotkey = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '0';

export interface HotbarSlot {
  key: Hotkey;
  weapon: WeaponType;
}

export const hotbarConfig: HotbarSlot[] = [
  { key: '1', weapon: 'Pistol' },
  { key: '2', weapon: 'Rifle' },
  { key: '3', weapon: 'Shotgun' },
  { key: '4', weapon: 'Sniper' },
  { key: '5', weapon: 'SMG' },
  { key: '6', weapon: 'RocketLauncher' },
  { key: '7', weapon: 'LaserGun' },
  { key: '8', weapon: 'Crossbow' },
  { key: '9', weapon: 'Flamethrower' },
  { key: '0', weapon: 'GrenadeLauncher' },
];
