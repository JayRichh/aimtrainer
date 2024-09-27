import React, { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useSphere } from '@react-three/cannon';
import { Vector3, Mesh, Quaternion, Raycaster } from 'three';
import { useKeyboardControls } from '@react-three/drei';
import { CharacterProps } from '../types';

const JUMP_FORCE = 30;
const GROUND_THRESHOLD = 0.5;
const JUMP_COOLDOWN = 250;

export function Character({ 
  speed, 
  sensitivity, 
  gravity, 
  isGamePaused, 
  position, 
  rotation, 
  health, 
  maxHealth, 
  weapon,
  onMove,
  onRotate,
  onShoot,
  onHit
}: CharacterProps) {
  const { camera, scene, mouse } = useThree();
  const [ref, api] = useSphere<Mesh>(() => ({
    mass: 1,
    type: 'Dynamic',
    position: position ? [position.x, position.y, position.z] : [0, 1, 0],
    args: [0.5],
  }));

  const velocity = useRef([0, 0, 0]);
  useEffect(() => api.velocity.subscribe((v) => (velocity.current = v)), [api.velocity]);

  const pos = useRef(position ? [position.x, position.y, position.z] : [0, 1, 0]);
  useEffect(() => api.position.subscribe((p) => {
    pos.current = p;
    if (onMove) {
      onMove(new Vector3(p[0], p[1], p[2]));
    }
  }), [api.position, onMove]);

  const [, get] = useKeyboardControls();
  const [canJump, setCanJump] = useState(true);
  const raycaster = new Raycaster(new Vector3(), new Vector3(0, -1, 0), 0, GROUND_THRESHOLD);

  const lastMouseX = useRef(0);
  const lastMouseY = useRef(0);

  useEffect(() => {
    if (rotation) {
      camera.quaternion.copy(rotation);
    } else {
      camera.rotation.set(0, Math.PI, 0);
    }
  }, [camera, rotation]);

  const isOnGround = () => {
    raycaster.ray.origin.set(pos.current[0], pos.current[1], pos.current[2]);
    const intersects = raycaster.intersectObjects(scene.children, true);
    return intersects.length > 0;
  };

  useFrame(() => {
    if (isGamePaused) {
      api.velocity.set(0, 0, 0);
      return;
    }

    const { forward, backward, left, right, jump, quickTurn, shoot } = get();
    const direction = new Vector3();

    const cameraQuaternion = new Quaternion();
    camera.getWorldQuaternion(cameraQuaternion);
    const cameraFront = new Vector3(0, 0, -1).applyQuaternion(cameraQuaternion);
    const cameraRight = new Vector3(1, 0, 0).applyQuaternion(cameraQuaternion);

    if (forward) direction.add(cameraFront);
    if (backward) direction.sub(cameraFront);
    if (left) direction.sub(cameraRight);
    if (right) direction.add(cameraRight);

    direction.y = 0;
    direction.normalize().multiplyScalar(speed);

    const onGround = isOnGround();

    api.velocity.set(direction.x, velocity.current[1], direction.z);

    if (jump && onGround && canJump) {
      api.velocity.set(velocity.current[0], JUMP_FORCE, velocity.current[2]);
      setCanJump(false);
      setTimeout(() => setCanJump(true), JUMP_COOLDOWN);
    }

    api.applyForce([0, -gravity, 0], [0, 0, 0]);

    if (quickTurn) {
      camera.rotation.y += Math.PI;
      if (onRotate) {
        onRotate(camera.quaternion);
      }
    }

    if (shoot && onShoot) {
      onShoot();
    }

    camera.position.set(pos.current[0], pos.current[1] + 1.6, pos.current[2]);

    // Apply sensitivity to mouse movement
    const deltaX = mouse.x - lastMouseX.current;
    const deltaY = mouse.y - lastMouseY.current;
    camera.rotation.y -= sensitivity * deltaX;
    camera.rotation.x -= sensitivity * deltaY;
    camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));

    lastMouseX.current = mouse.x;
    lastMouseY.current = mouse.y;
  });

  useEffect(() => {
    if (health !== undefined && maxHealth !== undefined && onHit) {
      // This is a simple health check. You might want to implement more complex logic.
      if (health < maxHealth) {
        onHit(maxHealth - health);
      }
    }
  }, [health, maxHealth, onHit]);

  // Log weapon changes
  useEffect(() => {
    console.log('Current weapon:', weapon);
  }, [weapon]);

  return <mesh ref={ref} />;
}
