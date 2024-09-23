'use client'

import { useState, useEffect } from 'react'
import { SettingsModal } from '../components/SettingsModal'
import { GameSettings } from '../types'
import Game from '@/components/Game'

export default function Home() {
  const defaultSettings: GameSettings = {
    sensitivity: 1,
    volume: 0.5,
    fov: 75,
    difficulty: 'medium',
    speed: 1,
  }

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [gameSettings, setGameSettings] = useState<GameSettings>(defaultSettings)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('gameSettings')
      if (savedSettings) {
        setGameSettings(JSON.parse(savedSettings))
      }
    }
  }, [])

  // Ensure the cursor is unlocked and centered when the settings modal is open
  useEffect(() => {
    if (isSettingsOpen) {
      document.exitPointerLock?.()
    } else {
      // Re-lock pointer when settings are closed
      document.body.requestPointerLock?.()
    }
  }, [isSettingsOpen])

  // Save settings to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gameSettings', JSON.stringify(gameSettings))
    }
  }, [gameSettings])

  const handleSettingsChange = (newSettings: Partial<GameSettings>) => {
    setGameSettings((prevSettings) => ({ ...prevSettings, ...newSettings }))
  }

  return (
    <div className="relative min-h-screen w-screen overflow-hidden">
      {/* Fullscreen canvas for the game */}
      <div className="absolute inset-0">
        <Game gameSettings={gameSettings} />
      </div>

      {/* Crosshair */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="w-2 h-2 border border-white rounded-full"></div>
      </div>

      {/* Top Left Instructions */}
      <div className="absolute top-0 left-0 p-4 text-white bg-black bg-opacity-50 rounded-br-lg z-10">
        <h1 className="text-2xl font-bold mb-2 text-blue-300">Aim Trainer</h1>
        <div className="space-y-1 text-sm">
          <p>
            <span className="font-semibold text-yellow-300">WASD:</span> Move
          </p>
          <p>
            <span className="font-semibold text-yellow-300">Mouse:</span> Look /
            Shoot
          </p>
          <p>
            <span className="font-semibold text-yellow-300">1-3:</span> Switch
            weapons
          </p>
          <p>
            <span className="font-semibold text-yellow-300">ESC:</span> Settings
          </p>
        </div>
      </div>

      {/* Bottom Left Settings Button */}
      <button
        className="absolute bottom-4 left-4 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition duration-200 transform hover:scale-105 z-10"
        onClick={() => setIsSettingsOpen(true)}
      >
        Settings
      </button>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={gameSettings}
        onSettingsChange={handleSettingsChange}
      />
    </div>
  )
}
