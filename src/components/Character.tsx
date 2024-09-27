import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useSphere } from '@react-three/cannon';
import { Vector3, Mesh, Quaternion, Raycaster, Euler } from 'three';
import { useKeyboardControls } from '@react-three/drei';
import { CharacterProps } from '../types';

const JUMP_FORCE = 30;
const GROUND_THRESHOLD = 0.5;

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
  const { camera, scene } = useThree();
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
  const raycaster = new Raycaster(new Vector3(), new Vector3(0, -1, 0), 0, GROUND_THRESHOLD);

  const euler = useRef(new Euler(0, 0, 0, 'YXZ'));
  const PI_2 = Math.PI / 2;

  useEffect(() => {
    if (rotation) {
      euler.current.setFromQuaternion(rotation);
      camera.rotation.copy(euler.current);
    } else {
      euler.current.set(0, Math.PI, 0);
      camera.rotation.copy(euler.current);
    }
  }, [camera, rotation]);

  const isOnGround = () => {
    raycaster.ray.origin.set(pos.current[0], pos.current[1], pos.current[2]);
    const intersects = raycaster.intersectObjects(scene.children, true);
    return intersects.length > 0;
  };

  useFrame((state, delta) => {
    if (isGamePaused) {
      api.velocity.set(0, 0, 0);
      return;
    }

    const { forward, backward, left, right, jump, shoot } = get();
    const direction = new Vector3();

    // Update rotation based on mouse movement
    const movementX = state.mouse.x - state.mouse.x / state.size.width;
    const movementY = state.mouse.y - state.mouse.y / state.size.height;

    euler.current.setFromQuaternion(camera.quaternion);

    euler.current.y -= movementX * sensitivity;
    euler.current.x -= movementY * sensitivity;

    euler.current.x = Math.max(-PI_2, Math.min(PI_2, euler.current.x));

    camera.quaternion.setFromEuler(euler.current);

    // Calculate movement direction
    const rotation = new Euler(0, euler.current.y, 0, 'YXZ');
    const forward_direction = new Vector3(0, 0, -1).applyEuler(rotation);
    const right_direction = new Vector3(1, 0, 0).applyEuler(rotation);

    if (forward) direction.add(forward_direction);
    if (backward) direction.sub(forward_direction);
    if (left) direction.sub(right_direction);
    if (right) direction.add(right_direction);

    direction.normalize().multiplyScalar(speed * delta);

    const onGround = isOnGround();

    api.velocity.set(direction.x, velocity.current[1], direction.z);

    if (jump && onGround) {
      api.velocity.set(velocity.current[0], JUMP_FORCE, velocity.current[2]);
    }

    api.applyForce([0, -gravity * delta, 0], [0, 0, 0]);

    if (shoot && onShoot) {
      onShoot();
    }

    camera.position.set(pos.current[0], pos.current[1] + 1.6, pos.current[2]);

    if (onRotate) {
      onRotate(camera.quaternion);
    }
  });

  useEffect(() => {
    if (health !== undefined && maxHealth !== undefined && onHit) {
      if (health < maxHealth) {
        onHit(maxHealth - health);
      }
    }
  }, [health, maxHealth, onHit]);

  return <mesh ref={ref} />;
}
