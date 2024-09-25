import * as THREE from 'three';

export interface PlayerRanking {
  id: string;
  username: string;
  score: number;
  kills: number; // Add this line
}

export type Vector3 = THREE.Vector3;

export interface CharacterProps {
  speed: number;
  sensitivity: number;
  gravity: number;
  isGamePaused: boolean;
}

export type Difficulty = 'easy' | 'medium' | 'hard';
export type TimeOfDay = 'day' | 'night';
export type WeatherCondition = 'clear' | 'cloudy' | 'rainy';

export interface GameSettings {
  targetPosition: any;
  sensitivity: number;
  volume: number;
  fov: number;
  difficulty: Difficulty;
  speed: number;
  graphicsQuality: number;
  gravity: number;
  targetSpeed: number;
  targetMovementRange: number;
  crosshairStyle: string;
  crosshairColor: string;
  colorblindMode: string;
  bulletTrailEnabled: boolean;
  timeOfDay: TimeOfDay;
  weatherCondition: WeatherCondition;
  npcCount: number;
  npcDifficulty: Difficulty;
  npcShootBack: boolean;
  npcMovementSpeed: number;
  npcAccuracy: number;
  npcReactionTime: number;
  npcTeamMode: boolean;
}

export interface UserProfile {
  id: string;
  username: string;
  highScore: number;
  settings: GameSettings;
}

export type Hotkey = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '0';

export type WeaponType =
  | 'Pistol'
  | 'Rifle'
  | 'Shotgun'
  | 'Sniper'
  | 'SMG'
  | 'RocketLauncher'
  | 'LaserGun'
  | 'Crossbow'
  | 'Flamethrower'
  | 'GrenadeLauncher';

export interface HotbarSlot {
  key: Hotkey;
  weapon: WeaponType;
}

export interface WeaponSystemProps {
  currentWeapon: WeaponType;
  onWeaponChange: (weapon: WeaponType) => void;
  onShoot: () => void;
  settings: GameSettings;
  targets: TargetData[];
  setTargets: React.Dispatch<React.SetStateAction<TargetData[]>>;
  onHit: (targetId: string, hitScore: number) => void;
  isGamePaused: boolean;
  npcs: NPCData[];
  setNPCs: React.Dispatch<React.SetStateAction<NPCData[]>>;
  players?: PlayerData[];
  setPlayers?: React.Dispatch<React.SetStateAction<PlayerData[]>>; // Made optional
}

export interface WeaponProps {
  currentWeapon: WeaponType;
  isSwapping: boolean;
}

export interface TargetData {
  id: string;
  position: [number, number, number];
  size: number;
  speed: number;
  health: number;
  maxHealth: number;
  seed: number;
  isPopping?: boolean;
}

export type NPCState = 'idle' | 'moving' | 'attacking' | 'evading' | 'patrolling';

export interface NPCData {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  health: number;
  maxHealth: number;
  weapon: WeaponType;
  state: NPCState;
  speed: number;
  lastShootTime: number;
  shootInterval: number;
  movementTarget: [number, number, number] | null;
  team?: string;
  accuracy: number;
  reactionTime: number;
  patrolPoints?: [number, number, number][];
}

export interface PlayerData {
  id: string;
  username: string;
  position: [number, number, number];
  rotation: [number, number, number];
  health: number;
  maxHealth: number;
  weapon: WeaponType;
  score: number;
  team?: string;
}

export interface TargetProps {
  data: TargetData;
  settings: GameSettings;
  onHit: (targetId: string, hitScore: number) => void;
}

export interface NPCProps {
  data: NPCData;
  settings: GameSettings;
  onHit: (npcId: string, hitScore: number) => void;
  onShoot: (npcId: string) => void;
  playerPositions: { [playerId: string]: [number, number, number] };
}
export type GameMode = 'timed' | 'endurance' | 'precision' | 'deathmatch' | 'teamDeathmatch';
export type GraphicsQuality = 'Low' | 'Medium' | 'High';

export interface MainMenuProps {
  onStartGame: (mode: GameMode, isMultiplayer: boolean, npcCount: number) => void;
  onJoinLobby: () => void;
  onSettingsOpen: () => void;
  highScore: number;
  npcCount: number; // New prop for NPC count
  setNpcCount: (count: number) => void; // New prop for setting NPC count
}

export interface PostGameSummaryProps {
  score: number;
  accuracy: number;
  playerRankings: PlayerRanking[];
  onRestart: () => void;
  onExit: () => void;
  gameMode: GameMode;
}

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onSettingsChange: (newSettings: Partial<GameSettings>) => void;
  userProfile: UserProfile | null;
  onProfileUpdate: (profile: UserProfile) => void;
}

export interface HUDProps {
  score: number;
  timeLeft: number;
  accuracy: number;
  health: number;
  settings: GameSettings;
  currentWeapon: WeaponType;
  isPaused: boolean;
  hotbar: HotbarSlot[];
  onWeaponSwitch: (key: Hotkey) => void;
  cycleWeapon: (direction: 'next' | 'prev') => void;
  players: PlayerRanking[];
  npcs: NPCData[];
  gameMode: GameMode;
}

// ... (keep all other existing types)

export interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
  onSettings: () => void;
}

export interface GameProps {
  initialSettings: GameSettings;
  userProfile: UserProfile | null;
  onProfileUpdate: (profile: UserProfile) => void;
  isMultiplayer: boolean;
  lobbyId?: string;
}

// ... (keep all other existing types)
export interface SceneSetupProps {
  sunPosition: [number, number, number];
  graphicsQuality: number;
  timeOfDay: TimeOfDay;
  weatherCondition: WeatherCondition;
}

export interface SocketMessage {
  type: 'playerUpdate' | 'npcUpdate' | 'targetUpdate' | 'gameStateUpdate' | 'chat';
  data: any;
}

export interface LobbyData {
  id: string;
  host: string;
  players: string[];
  gameMode: GameMode;
  maxPlayers: number;
}

export interface ChatMessage {
  senderId: string;
  senderName: string;
  message: string;
  timestamp: number;
}

export interface AIBehavior {
  difficulty: Difficulty;
  accuracy: number;
  reactionTime: number;
  movementPattern: 'random' | 'patrol' | 'follow' | 'ambush';
  aggressiveness: number;
}

export interface GameState {
  players: PlayerData[];
  npcs: NPCData[];
  npcCount: number;
  npcDifficulty: Difficulty;
  targets: TargetData[];
  gameMode: GameMode;
  timeRemaining: number;
  isGameOver: boolean;
}
