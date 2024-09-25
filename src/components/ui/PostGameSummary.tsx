import React from 'react';
import { PostGameSummaryProps, GameMode } from '../../types';
import { Trophy, Target, Zap, RotateCcw, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PlayerRankings: React.FC<{
  playerRankings: PostGameSummaryProps['playerRankings'];
  gameMode: GameMode;
}> = ({ playerRankings, gameMode }) => {
  const showKills = gameMode === 'deathmatch' || gameMode === 'teamDeathmatch';
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mt-8 w-full"
    >
      <h2 className="mb-4 flex items-center text-2xl font-bold text-blue-400">
        <Trophy className="mr-2" size={24} />
        Player Rankings
      </h2>
      <div className="space-y-3">
        {playerRankings.map((player, index) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-center justify-between rounded-lg bg-gray-700 p-3"
          >
            <span className="text-lg font-semibold">
              {index + 1}. {player.username}
            </span>
            <div className="flex items-center space-x-4">
              <span className="text-lg">Score: {player.score}</span>
              {showKills && <span className="text-lg">Kills: {player.kills}</span>}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
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
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="w-full max-w-3xl rounded-xl bg-gray-800 p-8 text-white shadow-2xl"
        >
          <h1 className="mb-8 text-center text-5xl font-bold text-yellow-400">Game Over</h1>
          <div className="mb-10 grid grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-lg bg-gray-700 p-4 text-center"
            >
<p className="mb-2 flex items-center justify-center text-lg uppercase tracking-wide text-gray-400">
                <Target className="mr-2" size={20} />
                Final Score
              </p>
              <p className="text-4xl font-bold text-blue-400">{score}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-lg bg-gray-700 p-4 text-center"
            >
              <p className="mb-2 flex items-center justify-center text-lg uppercase tracking-wide text-gray-400">
                <Zap className="mr-2" size={20} />
                Accuracy
              </p>
              <p className="text-4xl font-bold text-blue-400">{accuracy.toFixed(1)}%</p>
            </motion.div>
            {showKills && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="col-span-2 rounded-lg bg-gray-700 p-4 text-center"
              >
                <p className="mb-2 flex items-center justify-center text-lg uppercase tracking-wide text-gray-400">
                  <Target className="mr-2" size={20} />
                  Total Kills
                </p>
                <p className="text-4xl font-bold text-blue-400">
                  {playerRankings.find((p) => p.id === 'player')?.kills || 0}
                </p>
              </motion.div>
            )}
          </div>
          <PlayerRankings playerRankings={playerRankings} gameMode={gameMode} />
          <div className="mt-10 space-y-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRestart}
              className="flex w-full transform items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-lg font-bold text-white transition duration-200 ease-in-out hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-lg hover:shadow-xl"
            >
              <RotateCcw className="mr-2" size={20} />
              Play Again
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onExit}
              className="flex w-full transform items-center justify-center rounded-lg bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-4 text-lg font-bold text-white transition duration-200 ease-in-out hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 shadow-lg hover:shadow-xl"
            >
              <Home className="mr-2" size={20} />
              Exit to Main Menu
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}