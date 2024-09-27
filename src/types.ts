import * as THREE from 'three';

export type Vector3 = THREE.Vector3;
export type Quaternion = THREE.Quaternion;
export type Euler = THREE.Euler;

export type Difficulty = 'easy' | 'medium' | 'hard';
export type TimeOfDay = 'day' | 'night';
export type WeatherCondition = 'clear' | 'cloudy' | 'rainy';
export type GameMode = 'timed' | 'endurance' | 'precision' | 'deathmatch' | 'teamDeathmatch';
export type GraphicsQuality = 1 | 2 | 3 | 4 | 5;
export type NPCState = 'idle' | 'moving' | 'attacking' | 'evading' | 'patrolling';
export type Hotkey = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '0';

export interface CharacterData {
  id: string;
  position: Vector3;
  rotation: Quaternion;
  eulerRotation: Euler;
  health: number;
  maxHealth: number;
  weapon: WeaponType;
  speed: number;
  lastShootTime: number;
  shootInterval: number;
}

export interface PlayerData extends CharacterData {
  username: string;
  score: number;
  team?: string;
}

export interface NPCData extends CharacterData {
  state: NPCState;
  movementTarget: Vector3 | null;
  team?: string;
  accuracy: number;
  reactionTime: number;
  patrolPoints?: Vector3[];
  velocity?: Vector3;
  isGrounded?: boolean;
  targetPosition?: Vector3;
  lastMoveTime?: number;
  moveInterval?: number;
  stuckCounter?: number;
  aiBehavior: AIBehavior;
  initializeNPC?: (npc: NPCData) => NPCData;
}

export interface ExtendedNPCData extends NPCData {
  updateNPCShooting: (npc: NPCData, playerPosition: Vector3, settings: GameSettings, delta: number, onHit: (hitScore: number) => void) => void;
}

export interface GameSettings {
  sensitivity: number;
  volume: number;
  fov: number;
  difficulty: Difficulty;
  speed: number;
  graphicsQuality: GraphicsQuality;
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
  npcWeaponChangeProbability: number;
}

export interface UserProfile {
  id: string;
  username: string;
  highScore: number;
  settings: GameSettings;
}

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
  setPlayers?: React.Dispatch<React.SetStateAction<PlayerData[]>>;
}

export interface WeaponProps {
  currentWeapon: WeaponType;
  isSwapping: boolean;
  isShooting: boolean;
  onShoot: () => void;
  muzzleFlashRef: React.MutableRefObject<THREE.Mesh | null>;
  isNPC?: boolean;
  parentRef?: React.RefObject<THREE.Object3D>;
}

export interface TargetData {
  id: string;
  position: Vector3;
  size: number;
  speed: number;
  health: number;
  maxHealth: number;
  seed: number;
  isPopping?: boolean;
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
  playerPositions: { [playerId: string]: Vector3 };
  mapBounds: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
  };
  gameMode: GameMode;
  gameState: 'playing' | 'paused' | 'gameOver';
}

export interface PlayerRanking {
  id: string;
  username: string;
  score: number;
  kills: number;
}

export interface MainMenuProps {
  onStartGame: (mode: GameMode, isMultiplayer: boolean, npcCount: number) => void;
  onJoinLobby: () => void;
  onSettingsOpen: () => void;
  highScore: number;
  npcCount: number;
  setNpcCount: (count: number) => void;
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

export interface SceneSetupProps {
  sunPosition: Vector3;
  graphicsQuality: GraphicsQuality;
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
