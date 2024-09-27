import * as THREE from 'three';
import { NPCData, GameSettings, WeaponType, Vector3, ExtendedNPCData } from '../types';

const GRAVITY = -9.8;
const JUMP_VELOCITY = 5;
const MAX_DISTANCE_FROM_PLAYER = 30;
const MIN_DISTANCE_FROM_PLAYER = 3;
const POSITION_UPDATE_THRESHOLD = 0.05;

export const updateNPCShooting = (
  npc: NPCData,
  playerPosition: Vector3,
  settings: GameSettings,
  delta: number,
  onHit: (hitScore: number) => void,
): void => {
  const currentTime = Date.now();
  const timeSinceLastShot = currentTime - (npc.lastShootTime || 0);

  if (timeSinceLastShot >= (npc.shootInterval || 1000)) {
    const npcPos = npc.position;
    const distance = npcPos.distanceTo(playerPosition);

    const shootingRange = settings.npcAccuracy * 50; // Use npcAccuracy to determine shooting range
    if (distance <= shootingRange) {
      npc.state = 'attacking';

      const hitProbability = calculateHitProbability(npc.accuracy, distance);

      if (Math.random() < hitProbability) {
        const hitScore = calculateHitScore(npc, playerPosition, settings);
        onHit(hitScore);
      }

      npc.lastShootTime = currentTime;
      npc.shootInterval = (1000 / settings.npcAccuracy) * (0.8 + Math.random() * 0.4);
    }
  }
};

const calculateHitProbability = (accuracy: number, distance: number): number => {
  return accuracy * Math.exp(-distance / 80);
};

const calculateHitScore = (
  npc: NPCData,
  playerPosition: Vector3,
  settings: GameSettings,
): number => {
  const baseScore = getWeaponBaseScore(npc.weapon);
  const distance = npc.position.distanceTo(playerPosition);
  return baseScore * Math.exp(-distance / 80);
};

const getWeaponBaseScore = (weaponType: WeaponType): number => {
  switch (weaponType) {
    case 'Pistol': return 10;
    case 'Rifle': return 20;
    case 'Shotgun': return 30;
    case 'Sniper': return 40;
    case 'SMG': return 15;
    case 'RocketLauncher': return 50;
    case 'LaserGun': return 35;
    case 'Crossbow': return 25;
    case 'Flamethrower': return 30;
    case 'GrenadeLauncher': return 45;
    default: return 10;
  }
};

export const initializeNPC = (npc: NPCData): ExtendedNPCData => {
  return {
    ...npc,
    velocity: new THREE.Vector3(0, 0, 0),
    isGrounded: false,
    targetPosition: npc.position.clone(),
    lastMoveTime: Date.now(),
    moveInterval: Math.random() * 1500 + 500,
    state: 'idle',
    stuckCounter: 0,
    updateNPCShooting: updateNPCShooting,
  };
};

export const updateNPCMovement = (
  npc: ExtendedNPCData,
  playerPosition: Vector3,
  delta: number,
  settings: GameSettings
): ExtendedNPCData => {
  const currentTime = Date.now();
  const timeSinceLastMove = currentTime - (npc.lastMoveTime || 0);

  if (timeSinceLastMove >= (npc.moveInterval || 0)) {
    const distanceToPlayer = npc.position.distanceTo(playerPosition);
    const directionToPlayer = new THREE.Vector3().subVectors(playerPosition, npc.position).normalize();

    let targetPosition: THREE.Vector3;

    if (distanceToPlayer > MAX_DISTANCE_FROM_PLAYER) {
      targetPosition = npc.position.clone().add(directionToPlayer.multiplyScalar(5));
      npc.state = 'moving';
    } else if (distanceToPlayer < MIN_DISTANCE_FROM_PLAYER) {
      targetPosition = npc.position.clone().sub(directionToPlayer.multiplyScalar(5));
      npc.state = 'evading';
    } else {
      const randomOffset = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        0,
        (Math.random() - 0.5) * 10
      );
      targetPosition = npc.position.clone().add(randomOffset);
      npc.state = 'patrolling';
    }

    const distanceToTarget = targetPosition.distanceTo(playerPosition);
    if (distanceToTarget > MAX_DISTANCE_FROM_PLAYER) {
      targetPosition.sub(playerPosition).normalize().multiplyScalar(MAX_DISTANCE_FROM_PLAYER).add(playerPosition);
    }

    npc.targetPosition = targetPosition;
    npc.lastMoveTime = currentTime;
    npc.moveInterval = Math.random() * 1500 + 500;
  }

  if (npc.targetPosition) {
    const moveDirection = new THREE.Vector3().subVectors(npc.targetPosition, npc.position).normalize();
    const speed = settings.npcMovementSpeed || 2;
    const movement = moveDirection.multiplyScalar(speed * delta);

    npc.position.add(movement);
  }

  if (npc.velocity) {
    if (!npc.isGrounded) {
      npc.velocity.y += GRAVITY * delta;
    } else if (Math.random() < 0.01) {
      npc.velocity.y = JUMP_VELOCITY;
      npc.isGrounded = false;
    }

    npc.position.y += npc.velocity.y * delta;

    if (npc.position.y <= 0) {
      npc.position.y = 0;
      npc.velocity.y = 0;
      npc.isGrounded = true;
    }
  }

  return npc;
};

export default { initializeNPC, updateNPCShooting, updateNPCMovement };