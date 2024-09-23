import React from 'react'
import { SettingsModalProps, GameSettings } from '../types'

export function SettingsModal({ isOpen, onClose, settings, onSettingsChange }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = React.useState<GameSettings>(settings)

  if (!isOpen) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    const newValue = e.target.type === 'range' ? parseFloat(value) : value
    setLocalSettings(prev => ({ ...prev, [name]: newValue }))
    onSettingsChange({ [name]: newValue })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-white">Settings</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="sensitivity" className="block text-sm font-medium text-gray-300">
              Mouse Sensitivity: {localSettings.sensitivity.toFixed(2)}
            </label>
            <input
              type="range"
              id="sensitivity"
              name="sensitivity"
              min="0.1"
              max="2"
              step="0.1"
              value={localSettings.sensitivity}
              onChange={handleChange}
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="volume" className="block text-sm font-medium text-gray-300">
              Volume: {localSettings.volume.toFixed(2)}
            </label>
            <input
              type="range"
              id="volume"
              name="volume"
              min="0"
              max="1"
              step="0.1"
              value={localSettings.volume}
              onChange={handleChange}
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="fov" className="block text-sm font-medium text-gray-300">
              Field of View: {localSettings.fov}
            </label>
            <input
              type="range"
              id="fov"
              name="fov"
              min="60"
              max="120"
              step="1"
              value={localSettings.fov}
              onChange={handleChange}
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-300">
              Difficulty
            </label>
            <select
              id="difficulty"
              name="difficulty"
              value={localSettings.difficulty}
              onChange={handleChange}
              className="w-full bg-gray-700 text-white rounded px-2 py-1"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}