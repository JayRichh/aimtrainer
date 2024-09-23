'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/cannon'
import { Sky, KeyboardControls, PointerLockControls } from '@react-three/drei'
import { Ground } from './Ground'
import { Character } from './Character'
import { WeaponSystem } from '../systems/WeaponSystem'
import { Target } from './Target'
import { WeaponType, GameSettings } from '../types'
import { SettingsModal } from './SettingsModal'

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
  gameSettings: GameSettings
}

export default function Game({ gameSettings }: GameProps) {
  const [currentWeapon, setCurrentWeapon] = useState<WeaponType>('Pistol')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [isGameRunning, setIsGameRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [highScores, setHighScores] = useState<number[]>(() => {
    if (typeof window !== 'undefined') {
      const savedScores = localStorage.getItem('highScores')
      return savedScores ? JSON.parse(savedScores) : []
    }
    return []
  })
  const [settings, setSettings] = useState<GameSettings>(gameSettings)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Update high scores and save them to localStorage
  const updateHighScores = useCallback((newScore: number) => {
    setHighScores(prevScores => {
      const updatedScores = [...prevScores, newScore].sort((a, b) => b - a).slice(0, 5) // Top 5 scores
      if (typeof window !== 'undefined') {
        localStorage.setItem('highScores', JSON.stringify(updatedScores))
      }
      return updatedScores
    })
  }, [])

  const handleWeaponChange = useCallback((weapon: WeaponType) => {
    setCurrentWeapon(weapon)
  }, [])

  const generateTarget = useCallback(() => ({
    position: [
      (Math.random() - 0.5) * 20,
      Math.random() * 5 + 1,
      (Math.random() - 0.5) * 20,
    ] as [number, number, number],
    size: settings.difficulty === 'easy' ? 1.2 : settings.difficulty === 'medium' ? 1 : 0.8,
  }), [settings.difficulty])

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
    if (isGameRunning && !isPaused && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(time => time - 1), 1000)
      return () => clearInterval(timer)
    } else if (isGameRunning && timeLeft === 0) {
      setIsGameRunning(false)
      updateHighScores(score)
    }
  }, [isGameRunning, timeLeft, score, isPaused, updateHighScores])

  const startGame = useCallback(() => {
    setScore(0)
    setTimeLeft(GAME_DURATION)
    setTargets(Array(NUM_TARGETS).fill(null).map(generateTarget))
    setIsGameRunning(true)
    setIsPaused(false)
  }, [generateTarget])

  const pauseGame = () => {
    setIsPaused(prev => !prev)
  }

  const resetScores = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('highScores')
    }
    setHighScores([])
  }

  const handleSettingsChange = (updatedSettings: Partial<GameSettings>) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      ...updatedSettings,
    }))
  }

  return (
    <>
      <KeyboardControls map={keyboardMap}>
        <Canvas shadows camera={{ fov: settings.fov, position: [0, 1.6, 0] }}>
          <Sky sunPosition={[100, 20, 100]} />
          <ambientLight intensity={0.3} />
          <pointLight castShadow intensity={0.8} position={[100, 100, 100]} />
          <Physics>
            <Ground />
            <Character speed={settings.speed || 5} />
            {targets.map((target, index) => (
              <Target
                key={index}
                position={target.position}
                size={target.size}
                onHit={() => handleTargetHit(index)}
                difficulty={settings.difficulty}
              />
            ))}
            <WeaponSystem currentWeapon={currentWeapon} onWeaponChange={handleWeaponChange} />
          </Physics>
          {isGameRunning && <PointerLockControls scale={settings.sensitivity} />}
        </Canvas>
      </KeyboardControls>

      {/* UI Overlay */}
      <div className="absolute top-0 right-0 p-4 text-white bg-black bg-opacity-50 rounded-bl-lg">
        <p>Score: {score}</p>
        <p>Time: {timeLeft}s</p>
        <p>High Score: {highScores.length > 0 ? Math.max(...highScores) : 0}</p>
      </div>

      {/* Game Over / Start Screen */}
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

      {/* Settings Button */}
      <div className="absolute top-4 left-4 z-10">
        <button
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition duration-200"
          onClick={() => setIsSettingsOpen(true)}
        >
          Settings
        </button>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />

      {/* Pause, Reset, and Scoreboard Buttons */}
      {isGameRunning && (
        <div className="absolute bottom-4 right-4 flex space-x-4 z-10">
          <button
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded transition duration-200"
            onClick={pauseGame}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition duration-200"
            onClick={resetScores}
          >
            Reset Scores
          </button>
          <button
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition duration-200"
            onClick={() => alert(`High Scores: ${highScores.join(', ')}`)}
          >
            View Scoreboard
          </button>
        </div>
      )}
    </>
  )
}
