import { GameSettings, TargetData } from '../types';
import { Vector3 } from 'three'; // Assuming you're using Three.js for Vector3

export function generateRandomTargets(settings: GameSettings, count: number = 1): TargetData[] {
  const targets: TargetData[] = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 10 + 15;
    const target: TargetData = {
      id: crypto.randomUUID(),
      position: new Vector3(
        Math.cos(angle) * radius,
        Math.random() * 2 + 1.5,
        Math.sin(angle) * radius,
      ),
      size: settings.difficulty === 'easy' ? 1.5 : settings.difficulty === 'medium' ? 1 : 0.8,
      speed: settings.difficulty === 'easy' ? 0.3 : settings.difficulty === 'medium' ? 0.5 : 0.8,
      health: 100,
      maxHealth: 100,
      seed: Math.random() * 1000,
    };
    targets.push(target);
  }
  return targets;
}

export function updateTargetPositions(
  targets: TargetData[],
  targetSpeed: number,
  targetMovementRange: number,
): TargetData[] {
  const time = Date.now() * 0.001;
  const scaledSpeed = targetSpeed * 0.1;
  const scaledRange = targetMovementRange * 0.5;
  const maxDistance = 20;

  return targets.map((target) => {
    const seed = target.seed || 0;
    const individualTime = time + seed;
    const originalPosition = target.position.clone();

    const xMovement = Math.sin(individualTime * scaledSpeed) * scaledRange;
    const yMovement = Math.abs(Math.sin(individualTime * scaledSpeed * 0.5)) * (scaledRange * 0.5);
    const zMovement = Math.cos(individualTime * scaledSpeed * 0.3) * (scaledRange * 0.3);

    const newPosition = originalPosition.add(new Vector3(xMovement, yMovement, zMovement));

    if (newPosition.length() > maxDistance) {
      newPosition.normalize().multiplyScalar(maxDistance);
    }

    return {
      ...target,
      position: newPosition,
    };
  });
}

export function regenerateTarget(settings: GameSettings): TargetData {
  return generateRandomTargets(settings, 1)[0];
}
