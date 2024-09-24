import React from 'react'
import { PostGameSummaryProps } from '../../types'

export function PostGameSummary({ score, accuracy, onRestart, onExit }: PostGameSummaryProps) {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-90 backdrop-blur-sm flex flex-col items-center justify-center text-white">
      <div className="bg-gray-800 p-10 rounded-xl shadow-2xl max-w-md w-full text-center">
        <h1 className="text-5xl font-bold mb-8 text-yellow-400">Game Over</h1>
        <div className="space-y-6 mb-10">
          <div>
            <p className="text-lg uppercase tracking-wide mb-1 text-gray-400">Final Score</p>
            <p className="text-4xl font-bold">{score}</p>
          </div>
          <div>
            <p className="text-lg uppercase tracking-wide mb-1 text-gray-400">Accuracy</p>
            <p className="text-4xl font-bold">{accuracy.toFixed(1)}%</p>
          </div>
        </div>
        <div className="space-y-4">
          <button
            onClick={onRestart}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Play Again
          </button>
          <button
            onClick={onExit}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
          >
            Exit to Main Menu
          </button>
        </div>
      </div>
    </div>
  )
}