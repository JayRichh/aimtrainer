import React, { useState, useCallback, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/cannon'
import { Sky, KeyboardControls, PointerLockControls } from '@react-three/drei'
import { Ground } from './Ground'
import { Character } from './Character'
import { WeaponSystem } from '../systems/WeaponSystem'
import { Target } from './Target'
import { WeaponType, GameSettings } from '../types'

const keyboardMap = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right', keys: ['ArrowRight', 'KeyD'] },
  { name: 'jump', keys: ['Space'] },
]

const NUM_TARGETS = 10
const GAME_DURATION = 60 // seconds

interface GameProps {
  gameSettings: GameSettings;
}

export default function Game({ gameSettings }: GameProps) {
  const [currentWeapon, setCurrentWeapon] = useState<WeaponType>('Pistol')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [isGameRunning, setIsGameRunning] = useState(false)
  const [highScore, setHighScore] = useState(0)

  const handleWeaponChange = useCallback((weapon: WeaponType) => {
    setCurrentWeapon(weapon)
  }, [])

  const generateTarget = useCallback(() => ({
    position: [
      (Math.random() - 0.5) * 20,
      Math.random() * 5 + 1,
      (Math.random() - 0.5) * 20
    ] as [number, number, number],
    size: gameSettings.difficulty === 'easy' ? 1.2 : gameSettings.difficulty === 'medium' ? 1 : 0.8,
  }), [gameSettings.difficulty])

  const [targets, setTargets] = useState(() => Array(NUM_TARGETS).fill(null).map(generateTarget))

  const handleTargetHit = useCallback((index: number) => {
    setScore(prevScore => prevScore + 1)
    setTargets(prevTargets => {
      const newTargets = [...prevTargets]
      newTargets[index] = generateTarget()
      return newTargets
    })
  }, [generateTarget])

  useEffect(() => {
    if (isGameRunning && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(time => time - 1), 1000)
      return () => clearInterval(timer)
    } else if (timeLeft === 0) {
      setIsGameRunning(false)
      setHighScore(prevHighScore => Math.max(prevHighScore, score))
    }
  }, [isGameRunning, timeLeft, score])

  const startGame = useCallback(() => {
    setScore(0)
    setTimeLeft(GAME_DURATION)
    setTargets(Array(NUM_TARGETS).fill(null).map(generateTarget))
    setIsGameRunning(true)
  }, [generateTarget])

  return (
    <>
      <KeyboardControls map={keyboardMap}>
        <Canvas shadows camera={{ fov: gameSettings.fov, position: [0, 1.6, 0] }}>
          <Sky sunPosition={[100, 20, 100]} />
          <ambientLight intensity={0.3} />
          <pointLight castShadow intensity={0.8} position={[100, 100, 100]} />
          <Physics>
            <Ground />
            <Character speed={5} />
            {targets.map((target, index) => (
              <Target
                key={index}
                position={target.position}
                size={target.size}
                onHit={() => handleTargetHit(index)}
                difficulty={gameSettings.difficulty}
              />
            ))}
            <WeaponSystem currentWeapon={currentWeapon} onWeaponChange={handleWeaponChange} />
          </Physics>
          <PointerLockControls />
        </Canvas>
      </KeyboardControls>
      {/* UI Overlay */}
      <div className="absolute top-0 right-0 p-4 text-white bg-black bg-opacity-50 rounded-bl-lg">
        <p>Score: {score}</p>
        <p>Time: {timeLeft}s</p>
        <p>High Score: {highScore}</p>
      </div>
      {!isGameRunning && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-70 p-6 rounded-lg text-white text-center">
          <h2 className="text-3xl font-bold mb-4">
            {timeLeft === GAME_DURATION ? 'Aim Trainer' : 'Game Over'}
          </h2>
          {timeLeft !== GAME_DURATION && (
            <p className="text-xl mb-4">Final Score: {score}</p>
          )}
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded text-lg transition duration-200 transform hover:scale-105"
            onClick={startGame}
          >
            {timeLeft === GAME_DURATION ? 'Start Game' : 'Play Again'}
          </button>
        </div>
      )}
    </>
  )
}