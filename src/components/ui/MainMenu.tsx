import React from 'react'
import { MainMenuProps } from '../../types'

export function MainMenu({ onStartGame, onSettingsOpen, highScore }: MainMenuProps) {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-90 backdrop-blur-sm flex flex-col items-center justify-center text-white">
      <div className="bg-gray-800 p-10 rounded-xl shadow-2xl max-w-md w-full text-center">
        <h1 className="text-5xl font-bold mb-8 text-blue-400">Aim Trainer</h1>
        <div className="mb-8">
          <p className="text-lg uppercase tracking-wide mb-1 text-gray-400">High Score</p>
          <p className="text-4xl font-bold">{highScore}</p>
        </div>
        <div className="space-y-4">
          <button
            onClick={() => onStartGame('timed')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Timed Mode
          </button>
          <button
            onClick={() => onStartGame('endurance')}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
          >
            Endurance Mode
          </button>
          <button
            onClick={onSettingsOpen}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
          >
            Settings
          </button>
        </div>
      </div>
    </div>
  )
}