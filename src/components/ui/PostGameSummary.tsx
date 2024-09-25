import React from 'react';
import { PostGameSummaryProps, GameMode } from '../../types';
import { Trophy, Target, Zap, RotateCcw, Home } from 'lucide-react';

const PlayerRankings: React.FC<{
  playerRankings: PostGameSummaryProps['playerRankings'];
  gameMode: GameMode;
}> = ({ playerRankings, gameMode }) => {
  const showKills = gameMode === 'deathmatch' || gameMode === 'teamDeathmatch';
  return (
    <div className="mt-8 w-full">
      <h2 className="mb-4 flex items-center text-2xl font-bold text-blue-400">
        <Trophy className="mr-2" size={24} />
        Player Rankings
      </h2>
      <div className="space-y-3">
        {playerRankings.map((player, index) => (
          <div
            key={player.id}
            className="flex items-center justify-between rounded-lg bg-gray-700 p-3"
          >
            <span className="text-lg font-semibold">
              {index + 1}. {player.username}
            </span>
            <div className="flex items-center space-x-4">
              <span className="text-lg">Score: {player.score}</span>
              {showKills && <span className="text-lg">Kills: {player.kills}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export function PostGameSummary({
  score,
  accuracy,
  onRestart,
  onExit,
  playerRankings,
  gameMode,
}: PostGameSummaryProps) {
  const showKills = gameMode === 'deathmatch' || gameMode === 'teamDeathmatch';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-xl bg-gray-800 p-8 text-white shadow-2xl">
        <h1 className="mb-8 text-center text-5xl font-bold text-yellow-400">Game Over</h1>
        <div className="mb-10 grid grid-cols-2 gap-8">
          <div className="rounded-lg bg-gray-700 p-4 text-center">
            <p className="mb-2 flex items-center justify-center text-lg uppercase tracking-wide text-gray-400">
              <Target className="mr-2" size={20} />
              Final Score
            </p>
            <p className="text-4xl font-bold text-blue-400">{score}</p>
          </div>
          <div className="rounded-lg bg-gray-700 p-4 text-center">
            <p className="mb-2 flex items-center justify-center text-lg uppercase tracking-wide text-gray-400">
              <Zap className="mr-2" size={20} />
              Accuracy
            </p>
            <p className="text-4xl font-bold text-blue-400">{accuracy.toFixed(1)}%</p>
          </div>
          {showKills && (
            <div className="col-span-2 rounded-lg bg-gray-700 p-4 text-center">
              <p className="mb-2 flex items-center justify-center text-lg uppercase tracking-wide text-gray-400">
                <Target className="mr-2" size={20} />
                Total Kills
              </p>
              <p className="text-4xl font-bold text-blue-400">
                {playerRankings.find((p) => p.id === 'player')?.kills || 0}
              </p>
            </div>
          )}
        </div>
        <PlayerRankings playerRankings={playerRankings} gameMode={gameMode} />
        <div className="mt-10 space-y-4">
          <button
            onClick={onRestart}
            className="hover:scale-102 flex w-full transform items-center justify-center rounded-lg bg-blue-600 px-6 py-4 text-lg font-bold text-white transition duration-200 ease-in-out hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            <RotateCcw className="mr-2" size={20} />
            Play Again
          </button>
          <button
            onClick={onExit}
            className="hover:scale-102 flex w-full transform items-center justify-center rounded-lg bg-gray-600 px-6 py-4 text-lg font-bold text-white transition duration-200 ease-in-out hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
          >
            <Home className="mr-2" size={20} />
            Exit to Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}
