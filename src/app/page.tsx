'use client'

import { useState } from 'react'
import { SettingsModal } from '../components/SettingsModal'
import { GameSettings } from '../types'
import Game from '@/components/Game'

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    sensitivity: 1,
    volume: 0.5,
    fov: 75,
    difficulty: 'medium',
  })

  const handleSettingsChange = (newSettings: Partial<GameSettings>) => {
    setGameSettings(prevSettings => ({ ...prevSettings, ...newSettings }))
  }

  return (
    <div className="min-h-100vh w-screen overflow-hidden">
      <Game gameSettings={gameSettings} />
      <div className="absolute top-0 left-0 p-4 text-white bg-black bg-opacity-50 rounded-br-lg">
        <h1 className="text-2xl font-bold mb-2 text-blue-300">Aim Trainer</h1>
        <div className="space-y-1 text-sm">
          <p><span className="font-semibold text-yellow-300">WASD:</span> Move</p>
          <p><span className="font-semibold text-yellow-300">Mouse:</span> Look / Shoot</p>
          <p><span className="font-semibold text-yellow-300">1-3:</span> Switch weapons</p>
          <p><span className="font-semibold text-yellow-300">ESC:</span> Settings</p>
        </div>
      </div>
      <button
        className="absolute top-4 right-4 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition duration-200 transform hover:scale-105"
        onClick={() => setIsSettingsOpen(true)}
      >
        Settings
      </button>
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={gameSettings}
        onSettingsChange={handleSettingsChange}
      />
    </div>
  )
}