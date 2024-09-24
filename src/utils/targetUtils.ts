import { GameSettings, TargetData } from '../types'

export function generateRandomTargets(settings: GameSettings, count: number = 1): TargetData[] {
    const targets: TargetData[] = []
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2 // Random angle around the circle
      const radius = Math.random() * 10 + 15 // Random radius between 15 and 25 units
  
      const target: TargetData = {
        id: crypto.randomUUID(),
        position: [
          Math.cos(angle) * radius, // X position
          Math.random() * 2 + 1.5, // Y position between 1.5 and 3.5 units high
          Math.sin(angle) * radius, // Z position
        ],
        size:
          settings.difficulty === 'easy'
            ? 1.5
            : settings.difficulty === 'medium'
            ? 1
            : 0.8,
        speed:
          settings.difficulty === 'easy'
            ? 0.3
            : settings.difficulty === 'medium'
            ? 0.5
            : 0.8,
        health: 100,
        maxHealth: 100,
        seed: Math.random() * 1000, // Add a unique seed for each target
      }
      targets.push(target)
    }
    return targets
  }

export function updateTargetPositions(targets: TargetData[], targetSpeed: number, targetMovementRange: number): TargetData[] {
  const time = Date.now() * 0.001 // Current time in seconds
  const scaledSpeed = targetSpeed * 0.1
  const scaledRange = targetMovementRange * 0.5
  const maxDistance = 20 // Adjust this value based on scene size

  return targets.map(target => {
    const seed = target.seed || 0 // Use the target's seed, or 0 if not set
    const individualTime = time + seed // Create a unique time value for each target

    const originalX = target.position[0]
    const originalY = target.position[1]
    const originalZ = target.position[2]

    // Calculate new position using sine and cosine for smooth circular motion
    const xMovement = Math.sin(individualTime * scaledSpeed) * scaledRange
    const yMovement = Math.abs(Math.sin(individualTime * scaledSpeed * 0.5)) * (scaledRange * 0.5)
    const zMovement = Math.cos(individualTime * scaledSpeed * 0.3) * (scaledRange * 0.3)

    const newX = originalX + xMovement
    const newY = originalY + yMovement
    const newZ = originalZ + zMovement

    // Limit the movement to prevent targets from going off-screen
    const distance = Math.sqrt(newX * newX + newY * newY + newZ * newZ)
    if (distance > maxDistance) {
      const scale = maxDistance / distance
      return {
        ...target,
        position: [newX * scale, newY * scale, newZ * scale]
      }
    } else {
      return {
        ...target,
        position: [newX, newY, newZ]
      }
    }
  })
}

// Add a function to regenerate a single target
export function regenerateTarget(settings: GameSettings): TargetData {
  return generateRandomTargets(settings, 1)[0]
}
