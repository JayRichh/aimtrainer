import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree, extend, ThreeEvent, ReactThreeFiber } from '@react-three/fiber';
import * as THREE from 'three';
import { TargetProps } from '../types';
import { shaderMaterial } from '@react-three/drei';
import { createExplosion } from './ExplosionEffect';

class GlowMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        color: { value: new THREE.Color(0xffffff) },
        time: { value: 0 },
        fadeIn: { value: 0 },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec2 vUv;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        uniform vec3 color;
        uniform float time;
        uniform float fadeIn;
        varying vec3 vNormal;
        varying vec2 vUv;
        void main() {
          float intensity = pow(0.85 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 7.0);
          float pulse = 0.5 + 0.5 * sin(time * 2.0 + vUv.x * 10.0 + vUv.y * 10.0);
          vec3 glow = color * intensity * (0.5 + 0.5 * pulse);
          gl_FragColor = vec4(glow, 1.0) * fadeIn;
        }`,
    });
  }

  get color() {
    return this.uniforms.color.value;
  }

  set color(value) {
    this.uniforms.color.value = value;
  }
}

extend({ GlowMaterial });

declare module '@react-three/fiber' {
  interface ThreeElements {
    glowMaterial: ReactThreeFiber.Object3DNode<GlowMaterial, typeof GlowMaterial>;
  }
}

const getColorForMode = (mode: string): THREE.Color => {
  switch (mode) {
    case 'protanopia':
      return new THREE.Color(0x0080ff);
    case 'deuteranopia':
      return new THREE.Color(0xffff00);
    case 'tritanopia':
      return new THREE.Color(0xff00ff);
    default:
      return new THREE.Color(0xff0000);
  }
};

export const Target: React.FC<TargetProps> = ({ data, settings, onHit }) => {
  const { scene, camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<GlowMaterial>(null);
  const healthBarRef = useRef<THREE.Mesh>(null);
  const [fadeIn, setFadeIn] = useState(0);
  const [popAnimation, setPopAnimation] = useState(0);
  
  const targetColor = useMemo(() => getColorForMode(settings.colorblindMode), [settings.colorblindMode]);
  const healthBarMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: 'limegreen' }), []);

  useEffect(() => {
    if (data.isPopping) {
      setPopAnimation(1);
    }
  }, [data.isPopping]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      groupRef.current.lookAt(camera.position);

      if (glowRef.current) {
        glowRef.current.uniforms.time.value = time;
        glowRef.current.uniforms.fadeIn.value = fadeIn;
      }

      if (healthBarRef.current) {
        const healthPercentage = data.health / data.maxHealth;
        healthBarRef.current.scale.x = healthPercentage;
        healthBarRef.current.position.x = (healthPercentage - 1) * data.size * 0.25;
        healthBarMaterial.color.setHSL(healthPercentage * 0.3, 1, 0.5);
      }

      setFadeIn((prev) => Math.min(prev + delta, 1));

      if (popAnimation > 0) {
        setPopAnimation((prev) => Math.max(0, prev - delta * 5));
        const scale = 1 + Math.sin(popAnimation * Math.PI) * 0.3;
        groupRef.current.scale.setScalar(scale);
      } else {
        groupRef.current.scale.setScalar(1);
      }
    }
  });

  const handleHit = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    setPopAnimation(1);
    const damage = 100; // Increase damage to break targets more quickly
    onHit(data.id, damage);
  };

  return (
    <group ref={groupRef} position={data.position}>
      <mesh>
        <planeGeometry args={[data.size * 1.2, data.size * 1.2]} />
        <glowMaterial ref={glowRef} transparent color={targetColor} />
      </mesh>
      <mesh castShadow receiveShadow onClick={handleHit}>
        <circleGeometry args={[data.size / 2, 32]} />
        <meshStandardMaterial color={targetColor} side={THREE.DoubleSide} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0, 0.01]} onClick={handleHit}>
        <ringGeometry args={[(data.size / 2) * 0.8, data.size / 2, 32]} />
        <meshStandardMaterial color="white" side={THREE.DoubleSide} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0, 0.02]} onClick={handleHit}>
        <circleGeometry args={[(data.size / 2) * 0.4, 32]} />
        <meshStandardMaterial color={targetColor} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, data.size * 0.75, -0.1]} castShadow receiveShadow>
        <cylinderGeometry args={[data.size * 0.05, data.size * 0.1, data.size * 1.5, 8]} />
        <meshStandardMaterial color="gray" metalness={0.6} roughness={0.2} />
      </mesh>
      <mesh position={[0, data.size * 0.6, 0.1]}>
        <planeGeometry args={[data.size * 0.5, data.size * 0.05]} />
        <meshBasicMaterial color="black" transparent opacity={0.5} />
      </mesh>
      <mesh ref={healthBarRef} position={[0, data.size * 0.6, 0.11]}>
        <planeGeometry args={[data.size * 0.5, data.size * 0.05]} />
        <primitive object={healthBarMaterial} />
      </mesh>
    </group>
  );
};