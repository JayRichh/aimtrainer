// Player.tsx
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Vector3 } from '../types';

export interface PlayerProps {
    position: [number, number, number]
    rotation: [number, number, number]
    speed: number
}

const createSmileyTexture = () => {
  const canvas = document.createElement('canvas');
  const size = 128;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Draw a yellow circle for the face
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw the eyes
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(size * 0.3, size * 0.35, size * 0.1, 0, Math.PI * 2);
    ctx.arc(size * 0.7, size * 0.35, size * 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Draw the smile
    ctx.beginPath();
    ctx.arc(size / 2, size * 0.55, size * 0.3, 0, Math.PI, false);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 5;
    ctx.stroke();
  }

  return new THREE.CanvasTexture(canvas);
};

const Player: React.FC<PlayerProps> = ({ position, rotation, speed }) => {
  const playerRef = useRef<THREE.Group>(null);
  const smileyTexture = useRef(createSmileyTexture());

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.position.set(position[0], position[1], position[2]);
      playerRef.current.rotation.set(rotation[0], rotation[1], rotation[2]);
    }
  }, [position, rotation]);

  useFrame((state, delta) => {
    if (!playerRef.current) return;

    // Example of updating player position in case you want to move it
    const direction = new THREE.Vector3(0, 0, -1).normalize();
    playerRef.current.position.add(direction.multiplyScalar(speed * delta));

    // Update game state or other logic...
  });

  return (
    <group ref={playerRef}>
      {/* Head - Sphere with smiley texture */}
      <mesh position={[0, 1.6, 0]} rotation={[0, 0, 0]} castShadow>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial map={smileyTexture.current} />
      </mesh>

      {/* Body - Cylinder */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 1.6, 32]} />
        <meshStandardMaterial color="blue" />
      </mesh>

      {/* Arms - Cylinders */}
      <mesh position={[-0.7, 1, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 1.2, 16]} />
        <meshStandardMaterial color="blue" />
      </mesh>
      <mesh position={[0.7, 1, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 1.2, 16]} />
        <meshStandardMaterial color="blue" />
      </mesh>

      {/* Legs - Cylinders */}
      <mesh position={[-0.3, 0, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 1.2, 16]} />
        <meshStandardMaterial color="blue" />
      </mesh>
      <mesh position={[0.3, 0, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 1.2, 16]} />
        <meshStandardMaterial color="blue" />
      </mesh>
    </group>
  );
};

export default Player;
