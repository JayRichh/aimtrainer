import * as THREE from 'three';
import { NPCData, GameSettings, WeaponType, Vector3, Euler } from '../types';

const GRAVITY = -9.8;
const JUMP_VELOCITY = 5;
const MAX_DISTANCE_FROM_PLAYER = 20; // Maximum distance NPCs can be from the player
const MIN_DISTANCE_FROM_PLAYER = 5; // Minimum distance NPCs should keep from the player

export interface ExtendedNPCData extends NPCData {
  velocity: Vector3;
  isGrounded: boolean;
  targetPosition: Vector3;
  lastMoveTime: number;
  moveInterval: number;
  state: 'idle' | 'moving' | 'attacking';
}

export const updateNPCMovement = (
  npc: ExtendedNPCData,
  playerPosition: Vector3,
  settings: GameSettings,
  delta: number,
  mapBounds: { minX: number; maxX: number; minZ: number; maxZ: number }
): ExtendedNPCData => {
  const npcPosition = npc.position.clone();
  const playerPos = playerPosition.clone();
  const currentTime = Date.now();
  const distanceToPlayer = npcPosition.distanceTo(playerPos);

  // Update target position if it's time to move or if NPC is too far from or too close to the player
  if (currentTime - npc.lastMoveTime > npc.moveInterval || 
      distanceToPlayer > MAX_DISTANCE_FROM_PLAYER || 
      distanceToPlayer < MIN_DISTANCE_FROM_PLAYER) {
    npc.targetPosition = getRandomPositionAroundPlayer(playerPos, MIN_DISTANCE_FROM_PLAYER, MAX_DISTANCE_FROM_PLAYER, mapBounds);
    npc.lastMoveTime = currentTime;
    npc.moveInterval = Math.random() * 2000 + 1000; // Random interval between 1-3 seconds
    npc.state = 'moving';
  }

  // Calculate direction to target position
  const direction = new THREE.Vector3().subVectors(npc.targetPosition, npcPosition).setY(0).normalize();

  // Apply movement based on game settings and NPC state
  let speed = settings.npcMovementSpeed;
  if (npc.state === 'attacking') {
    speed *= 0.5; // Slow down when attacking
  } else if (npc.state === 'idle') {
    speed *= 0.1; // Very slow movement when idle
  }
  const newPosition = npcPosition.clone().add(direction.multiplyScalar(speed * delta));

  // Apply gravity
  npc.velocity.y += GRAVITY * delta;
  newPosition.y += npc.velocity.y * delta;

  // Ensure NPC stays within map bounds
  newPosition.x = Math.max(mapBounds.minX, Math.min(mapBounds.maxX, newPosition.x));
  newPosition.z = Math.max(mapBounds.minZ, Math.min(mapBounds.maxZ, newPosition.z));

  // Handle ground collision (assuming ground is at y=0)
  const groundLevel = 0;
  if (newPosition.y < groundLevel) {
    newPosition.y = groundLevel;
    npc.velocity.y = 0;
    npc.isGrounded = true;
  } else {
    npc.isGrounded = false;
  }

  // Random jumping (you can adjust the probability)
  if (npc.isGrounded && Math.random() < 0.005) {
    npc.velocity.y = JUMP_VELOCITY;
  }

  // Rotate NPC towards movement direction
  const targetRotation = Math.atan2(direction.x, direction.z);
  const newRotation = new THREE.Euler(0, targetRotation, 0);

  // Update NPC state
  if (npcPosition.distanceTo(npc.targetPosition) < 0.5) {
    npc.state = 'idle';
  }

  return {
    ...npc,
    position: newPosition,
    rotation: newRotation,
    velocity: npc.velocity,
    isGrounded: npc.isGrounded,
    targetPosition: npc.targetPosition,
    lastMoveTime: npc.lastMoveTime,
    moveInterval: npc.moveInterval,
    state: npc.state,
  };
};

const getRandomPositionAroundPlayer = (
  playerPosition: Vector3, 
  minDistance: number,
  maxDistance: number, 
  mapBounds: { minX: number; maxX: number; minZ: number; maxZ: number }
): Vector3 => {
  const angle = Math.random() * Math.PI * 2;
  const distance = Math.random() * (maxDistance - minDistance) + minDistance;
  let x = playerPosition.x + Math.cos(angle) * distance;
  let z = playerPosition.z + Math.sin(angle) * distance;

  // Ensure the position is within map bounds
  x = Math.max(mapBounds.minX, Math.min(mapBounds.maxX, x));
  z = Math.max(mapBounds.minZ, Math.min(mapBounds.maxZ, z));

  return new THREE.Vector3(x, playerPosition.y, z);
};

export const updateNPCShooting = (
  npc: ExtendedNPCData,
  playerPosition: Vector3,
  settings: GameSettings,
  delta: number,
  onHit: (hitScore: number) => void,
): void => {
  const currentTime = Date.now();
  const timeSinceLastShot = currentTime - npc.lastShootTime;

  if (timeSinceLastShot >= npc.shootInterval) {
    const npcPos = npc.position;
    const playerPos = playerPosition;
    const distance = npcPos.distanceTo(playerPos);

    // Check if player is within shooting range (assuming a default range if not specified in settings)
    const shootingRange = (settings as any).npcShootingRange || 50; // Default to 50 units if not specified
    if (distance <= shootingRange) {
      // Calculate hit probability based on NPC accuracy and distance
      const hitProbability = calculateHitProbability(npc.accuracy, distance);

      if (Math.random() < hitProbability) {
        const hitScore = calculateHitScore(npc, playerPosition, settings);
        onHit(hitScore);
        npc.state = 'attacking';
      }

      // Update last shoot time
      npc.lastShootTime = currentTime;
    }
  }
};

// Helper function to calculate hit probability
const calculateHitProbability = (accuracy: number, distance: number): number => {
  // Decrease hit probability as distance increases
  return accuracy * Math.exp(-distance / 100);
};

// Helper function to calculate hit score
const calculateHitScore = (
  npc: ExtendedNPCData,
  playerPosition: Vector3,
  settings: GameSettings,
): number => {
  const baseScore = getWeaponBaseScore(npc.weapon);
  const distance = npc.position.distanceTo(playerPosition);
  return baseScore * Math.exp(-distance / 100);
};

// Helper function to get base score for each weapon type
const getWeaponBaseScore = (weaponType: WeaponType): number => {
  switch (weaponType) {
    case 'Pistol':
      return 10;
    case 'Rifle':
      return 20;
    case 'Shotgun':
      return 30;
    case 'Sniper':
      return 40;
    case 'SMG':
      return 15;
    case 'RocketLauncher':
      return 50;
    case 'LaserGun':
      return 35;
    case 'Crossbow':
      return 25;
    case 'Flamethrower':
      return 30;
    case 'GrenadeLauncher':
      return 45;
    default:
      return 10;
  }
};

export const initializeNPC = (npc: NPCData): ExtendedNPCData => {
  return {
    ...npc,
    velocity: new THREE.Vector3(0, 0, 0),
    isGrounded: false,
    targetPosition: npc.position.clone(),
    lastMoveTime: Date.now(),
    moveInterval: Math.random() * 2000 + 1000, // Random interval between 1-3 seconds
    state: 'idle',
  };
};

export default { initializeNPC, updateNPCMovement, updateNPCShooting };