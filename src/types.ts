import * as THREE from 'three'

export type Vector3 = THREE.Vector3

export interface CharacterProps {
  speed: number
}

export interface WeaponProps {
  name: string
  model: string
  damage: number
  fireRate: number
  onShoot?: () => void
}

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface GameSettings {
  sensitivity: number
  volume: number
  fov: number
  difficulty: Difficulty
  speed: number
}

export interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  settings: GameSettings
  onSettingsChange: (newSettings: Partial<GameSettings>) => void
}

export type WeaponType = 'Pistol' | 'Rifle' | 'Shotgun'

export interface WeaponSystemProps {
  currentWeapon: WeaponType
  onWeaponChange: (weapon: WeaponType) => void
}

export interface TargetProps {
  position: [number, number, number]
  onHit: () => void
  size: number
  difficulty: Difficulty
}
