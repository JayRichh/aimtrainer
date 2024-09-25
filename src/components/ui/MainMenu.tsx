import React, { useEffect, useState, useCallback } from "react";
import { MainMenuProps, GameMode } from "../../types";
import { Star, Play, Users, Settings, Plus, Minus, Target, Clock, Crosshair, Skull, Users2, Info, ChevronRight } from "lucide-react";
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const InfoTooltip: React.FC<{ content: string }> = ({ content }) => (
  <div className="group relative flex flex-col items-center">
    <Info size={16} className="text-gray-400 cursor-help transition-colors duration-200 hover:text-gray-200" />
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-10"
      >
        <div className="relative p-2 text-xs leading-none text-white bg-black bg-opacity-90 shadow-lg rounded-md min-w-[200px] backdrop-blur-sm">
          {content}
        </div>
        <div className="w-3 h-3 -mt-1.5 rotate-45 bg-black bg-opacity-90"></div>
      </motion.div>
    </AnimatePresence>
  </div>
);

export function MainMenu({
  onStartGame,
  onSettingsOpen,
  onJoinLobby,
  highScore,
}: MainMenuProps) {
  const [selectedNpcs, setSelectedNpcs] = useState<number>(0);
  const [selectedPlayers, setSelectedPlayers] = useState<number>(1);
  const [displayScore, setDisplayScore] = useState<number>(0);
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const animateScore = () => {
      const difference = highScore - displayScore;
      if (difference > 0) {
        const increment = Math.ceil(difference / 50);
        setDisplayScore(prev => Math.min(prev + increment, highScore));
        requestAnimationFrame(animateScore);
      }
    };
    requestAnimationFrame(animateScore);
  }, [highScore]);

  useEffect(() => {
    const timer = setTimeout(() => setIsMenuOpen(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const soloModes: { mode: GameMode; label: string; color: string; icon: React.ElementType; description: string }[] = [
    { mode: "timed", label: "Timed", color: "blue", icon: Clock, description: "Race against the clock to hit as many targets as possible." },
    { mode: "endurance", label: "Endurance", color: "green", icon: Target, description: "Test your stamina in an endless target practice session." },
    { mode: "precision", label: "Precision", color: "yellow", icon: Crosshair, description: "Focus on accuracy with smaller, more challenging targets." },
  ];

  const multiplayerModes: { mode: GameMode; label: string; color: string; icon: React.ElementType; description: string }[] = [
    { mode: "deathmatch", label: "Deathmatch", color: "red", icon: Skull, description: "Every player for themselves in this all-out battle." },
    { mode: "teamDeathmatch", label: "Team Deathmatch", color: "purple", icon: Users2, description: "Work together in teams to outscore your opponents." },
  ];

  const GameModeButton: React.FC<{
    mode: GameMode;
    label: string;
    color: string;
    icon: React.ElementType;
    description: string;
  }> = ({ mode, label, color, icon: Icon, description }) => {
    const colorClasses = {
      blue: "from-blue-500 to-blue-600",
      green: "from-green-500 to-green-600",
      yellow: "from-yellow-500 to-yellow-600",
      red: "from-red-500 to-red-600",
      purple: "from-purple-500 to-purple-600",
    };

    const buttonClass = `
      bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]} 
      ${selectedMode === mode ? 'ring-2 ring-white' : ''} 
      text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 transform 
      focus:outline-none focus:ring-2 text-sm w-full flex items-center justify-between 
      shadow-lg hover:shadow-xl group
    `;

    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setSelectedMode(mode === selectedMode ? null : mode)}
        className={buttonClass}
      >
        <Icon size={24} className="mr-2" />
        <span className="flex-grow text-left">{label}</span>
        <ChevronRight size={20} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <InfoTooltip content={description} />
      </motion.button>
    );
  };

  const CounterButton: React.FC<{
    label: string;
    value: number;
    onDecrement: () => void;
    onIncrement: () => void;
    min?: number;
    max?: number;
  }> = ({ label, value, onDecrement, onIncrement, min = 0, max }) => (
    <div className="flex flex-col items-center bg-gray-700 rounded-lg p-3 shadow-md">
      <span className="text-sm mb-2 font-medium">{label}</span>
      <div className="flex items-center">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onDecrement}
          disabled={value <= min}
          className="bg-gray-600 hover:bg-gray-500 text-white font-bold w-10 h-10 rounded-l disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-200"
          aria-label={`Decrease ${label}`}
        >
          <Minus size={16} />
        </motion.button>
        <span className="bg-gray-800 text-white w-16 h-10 flex items-center justify-center font-bold">
          {value}
        </span>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onIncrement}
          disabled={max !== undefined && value >= max}
          className="bg-gray-600 hover:bg-gray-500 text-white font-bold w-10 h-10 rounded-r flex items-center justify-center transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={`Increase ${label}`}
        >
          <Plus size={16} />
        </motion.button>
      </div>
    </div>
  );

  const isMultiplayerMode = selectedMode === 'deathmatch' || selectedMode === 'teamDeathmatch';
  const maxPlayers = isMultiplayerMode ? 8 : 1;
  const maxNpcs = isMultiplayerMode ? 20 : 0;

  const handleStartGame = useCallback(() => {
    if (selectedMode) {
      onStartGame(selectedMode, selectedPlayers > 1, selectedNpcs);
    }
  }, [selectedMode, selectedPlayers, selectedNpcs, onStartGame]);

  const raiseModalTopUpOnSelect = ` ${selectedMode ? 'z-50 ' : ''}`;

  return (
    <div className="relative flex flex-col items-center justify-start min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-4 overflow-hidden text-white">
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl flex flex-col items-center"
      >
        <div className="w-full flex justify-center mb-8 relative z-10">
          <Image
            src='/aimtrain-biglogo.png'
            alt='Aim Trainer Logo'
            className='inverted-logo absolute top-0 left-5 w-full max-w-[300px] transition-all h-auto hover:scale-105 transition-transform duration-300 cursor-pointer hover:filter hover:brightness-125'
            width={300}
            height={150}
            priority
          />
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-800 pt-12 p-8 w-full rounded-2xl shadow-2xl w-full backdrop-blur-sm bg-opacity-90 border border-gray-700 relative z-0"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="flex flex-col items-center mb-20 mt-12 ml-auto w-auto"
              >
                <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-yellow-600 px-8 py-4 rounded-full shadow-lg">
                  <Star className="text-white" size={32} />
                  <span className="font-bold text-4xl text-white">
                    {displayScore}
                  </span>
                </div>
              </motion.div>

              <div className="space-y-8">
                <section>
                  <h2 className="text-2xl font-semibold mb-4 flex items-center">
                    <Target className="mr-2" size={28} />
                    Solo Modes
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {soloModes.map((mode, index) => (
                      <motion.div
                        key={mode.mode}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <GameModeButton {...mode} />
                      </motion.div>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 flex items-center">
                    <Users2 className="mr-2" size={28} />
                    Multiplayer Modes
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {multiplayerModes.map((mode, index) => (
                      <motion.div
                        key={mode.mode}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <GameModeButton {...mode} />
                      </motion.div>
                    ))}
                  </div>
                </section>

                <AnimatePresence>
                  {selectedMode && (
                    <motion.section
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h2 className="text-2xl font-semibold mb-4 flex items-center">
                        <Users className="mr-2" size={28} />
                        Player Setup
                      </h2>
                      <motion.div 
                        className="bg-gray-700 p-6 rounded-xl shadow-inner"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <CounterButton
                            label="Players"
                            value={selectedPlayers}
                            onDecrement={() => setSelectedPlayers(Math.max(1, selectedPlayers - 1))}
                            onIncrement={() => setSelectedPlayers(Math.min(selectedPlayers + 1, maxPlayers))}
                            min={1}
                            max={maxPlayers}
                          />
                          {isMultiplayerMode && (
                            <CounterButton
                              label="NPCs"
                              value={selectedNpcs}
                              onDecrement={() => setSelectedNpcs(Math.max(0, selectedNpcs - 1))}
                              onIncrement={() => setSelectedNpcs(Math.min(selectedNpcs + 1, maxNpcs))}
                              max={maxNpcs}
                            />
                          )}
                        </div>
                      </motion.div>
                    </motion.section>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleStartGame}
                    disabled={!selectedMode}
                    className={`bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-green-500 text-lg flex items-center justify-center shadow-lg ${!selectedMode && 'opacity-50 cursor-not-allowed'}`}
                  >
                    <Play className="mr-2" size={24} />
                    Start Game
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onSettingsOpen}
                    className="bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-gray-500 text-lg flex items-center justify-center shadow-lg"
                  >
                    <Settings className="mr-2" size={24} />
                    Settings
                  </motion.button>
                </div>

{isMultiplayerMode && (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onJoinLobby}
    className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg flex items-center justify-center shadow-lg mt-4"
  >
    <Users className="mr-2" size={24} />
    Join Multiplayer Lobby
  </motion.button>
)}
</div>
</motion.div>
)}
</AnimatePresence>
</motion.div>

{/* Decorative elements */}
<div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
</div>
);
}

// Add these keyframes and classes to your global CSS file
const globalStyles = `
@keyframes blob {
0% {
transform: translate(0px, 0px) scale(1);
}
33% {
transform: translate(30px, -50px) scale(1.1);
}
66% {
transform: translate(-20px, 20px) scale(0.9);
}
100% {
transform: translate(0px, 0px) scale(1);
}
}

.animate-blob {
animation: blob 7s infinite;
}

.animation-delay-2000 {
animation-delay: 2s;
}

.animation-delay-4000 {
animation-delay: 4s;
}
`;