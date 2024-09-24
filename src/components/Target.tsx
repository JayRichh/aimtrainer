import React, { useRef, useEffect, useMemo } from 'react'
import { useFrame, useThree, extend, ThreeEvent, ReactThreeFiber } from '@react-three/fiber'
import * as THREE from 'three'
import { TargetProps } from '../types'
import { shaderMaterial } from '@react-three/drei'
class GlowMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        color: { value: new THREE.Color(0xffffff) }
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        uniform vec3 color;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.85 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 7.0);
          gl_FragColor = vec4(color * intensity, 1.0);
        }`
    });
  }

  get color() {
    return this.uniforms.color.value;
  }

  set color(value) {
    this.uniforms.color.value.set(value);
  }
}

// Register the material with react-three-fiber
extend({ GlowMaterial });

declare module '@react-three/fiber' {
  interface ThreeElements {
    glowMaterial: ReactThreeFiber.Object3DNode<GlowMaterial, typeof GlowMaterial>;
  }
}

const getColorForMode = (mode: string): THREE.Color => {
  switch (mode) {
    case 'protanopia':
      return new THREE.Color(0x0080FF) // Blue
    case 'deuteranopia':
      return new THREE.Color(0xFFFF00) // Yellow
    case 'tritanopia':
      return new THREE.Color(0xFF00FF) // Magenta
    default:
      return new THREE.Color(0xFF0000) // Red (default)
  }
}

export const Target: React.FC<TargetProps> = ({ data, settings, onHit }) => {
  const groupRef = useRef<THREE.Group>(null)
  const glowRef = useRef<any>()
  const healthBarRef = useRef<THREE.Mesh>(null)
  const { camera } = useThree()
  const [fadeIn, setFadeIn] = React.useState(0)
  const [isHit, setIsHit] = React.useState(false)

  const targetColor = useMemo(() => getColorForMode(settings.colorblindMode), [settings.colorblindMode])
  const healthBarMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: 'limegreen' }), [])

  useFrame((state, delta) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime()

      // Ensure the target always faces the camera
      groupRef.current.lookAt(camera.position)

      // Update shader time and fade-in
      if (glowRef.current) {
        glowRef.current.uniforms.time.value = time
        glowRef.current.uniforms.fadeIn.value = fadeIn
      }

      // Update health bar
      if (healthBarRef.current) {
        const healthPercentage = data.health / data.maxHealth
        healthBarRef.current.scale.x = healthPercentage
        healthBarRef.current.position.x = (healthPercentage - 1) * data.size * 0.25
        healthBarMaterial.color.setHSL(
          healthPercentage * 0.3, // Hue: 0 (red) to 0.3 (green)
          1, // Saturation
          0.5 // Lightness
        )
      }

      // Increment fade-in
      setFadeIn(prev => Math.min(prev + delta, 1))

      // Handle hit animation
      if (isHit) {
        groupRef.current.scale.setScalar(1 + Math.sin(time * 20) * 0.05)
        setTimeout(() => setIsHit(false), 200)
      } else {
        groupRef.current.scale.setScalar(1)
      }
    }
  })

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    setIsHit(true)
    onHit(data.id, 10) // Assuming 10 points per hit, adjust as needed
  }

  return (
    <group ref={groupRef} position={data.position}>
      {/* Glow effect */}
      <mesh>
        <planeGeometry args={[data.size * 1.2, data.size * 1.2]} />
        <glowMaterial ref={glowRef} transparent color={targetColor} />
      </mesh>

      {/* Target face */}
      <mesh castShadow receiveShadow onClick={handleClick}>
        <circleGeometry args={[data.size / 2, 32]} />
        <meshStandardMaterial color={targetColor} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Outer ring */}
      <mesh castShadow receiveShadow position={[0, 0, 0.01]} onClick={handleClick}>
        <ringGeometry args={[data.size / 2 * 0.8, data.size / 2, 32]} />
        <meshStandardMaterial color="white" side={THREE.DoubleSide} />
      </mesh>
      
      {/* Inner circle */}
      <mesh castShadow receiveShadow position={[0, 0, 0.02]} onClick={handleClick}>
        <circleGeometry args={[data.size / 2 * 0.4, 32]} />
        <meshStandardMaterial color={targetColor} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Enhanced stand */}
      <mesh position={[0, -data.size * 0.75, -0.1]} castShadow receiveShadow>
        <cylinderGeometry args={[data.size * 0.05, data.size * 0.1, data.size * 1.5, 8]} />
        <meshStandardMaterial color="gray" metalness={0.6} roughness={0.2} />
      </mesh>

      {/* Health bar background */}
      <mesh position={[0, data.size * 0.6, 0.1]}>
        <planeGeometry args={[data.size * 0.5, data.size * 0.05]} />
        <meshBasicMaterial color="black" transparent opacity={0.5} />
      </mesh>

      {/* Health bar fill */}
      <mesh 
        ref={healthBarRef}
        position={[0, data.size * 0.6, 0.11]}
      >
        <planeGeometry args={[data.size * 0.5, data.size * 0.05]} />
        <primitive object={healthBarMaterial} />
      </mesh>
    </group>
  )
}