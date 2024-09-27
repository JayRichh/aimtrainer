import React, { useEffect, useState, useCallback } from "react";
import { MainMenuProps, GameMode } from "../../types";
import {
  Star,
  Play,
  Users,
  Settings,
  Plus,
  Minus,
  Target,
  Clock,
  Crosshair,
  Skull,
  Users2,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import InfoTooltip from "./InfoTooltip";
import SocialLinks from "./SocialLinks";

// GameModeButton Component
const GameModeButton: React.FC<{
  mode: GameMode;
  label: string;
  color: string;
  icon: React.ElementType;
  description: string;
  isSelected: boolean;
  onSelect: (mode: GameMode) => void;
}> = React.memo(
  ({ mode, label, color, icon: Icon, description, isSelected, onSelect }) => {
    const prefersReducedMotion = useReducedMotion();

    const colorClasses: Record<string, string> = {
      blue: "from-blue-200 to-blue-300",
      green: "from-green-200 to-green-300",
      yellow: "from-yellow-200 to-yellow-300",
      red: "from-red-200 to-red-300",
      purple: "from-purple-200 to-purple-300",
    };

    const handleClick = () => onSelect(mode);

    return (
      <motion.button
        whileHover={!prefersReducedMotion ? { scale: 1.03 } : {}}
        whileTap={!prefersReducedMotion ? { scale: 0.97 } : {}}
        onClick={handleClick}
        className={`
          bg-gradient-to-r ${colorClasses[color]} 
          ${isSelected ? "ring-2 ring-white ring-opacity-50" : ""} 
          text-gray-800 font-medium py-3 px-4 rounded-lg transition-all duration-300 transform 
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${color}-400 
          text-sm w-full flex items-center justify-between shadow-md hover:shadow-lg group
          backdrop-filter backdrop-blur-sm bg-opacity-70
        `}
        aria-pressed={isSelected}
        aria-label={`${label} mode`}
      >
        <Icon size={20} className="mr-2 flex-shrink-0 opacity-70" />
        <span className="flex-grow text-left truncate">{label}</span>
        <ChevronRight
          size={16}
          className="opacity-0 group-hover:opacity-50 transition-opacity duration-300 flex-shrink-0"
        />
        <InfoTooltip content={description} />
      </motion.button>
    );
  }
);

GameModeButton.displayName = "GameModeButton";

// CounterButton Component
const CounterButton: React.FC<{
  label: string;
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
  min?: number;
  max?: number;
}> = React.memo(({ label, value, onDecrement, onIncrement, min = 0, max }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="flex flex-col items-center">
      <span className="text-lg text-gray-300 font-medium mb-2">{label}</span>
      <div className="flex items-center">
        <motion.button
          whileHover={!prefersReducedMotion ? { scale: 1.05 } : {}}
          whileTap={!prefersReducedMotion ? { scale: 0.95 } : {}}
          onClick={onDecrement}
          disabled={value <= min}
          className="bg-gray-600 bg-opacity-50 hover:bg-opacity-70 text-white font-medium w-10 h-10 rounded-l-lg disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-200"
          aria-label={`Decrease ${label}`}
        >
          <Minus size={16} />
        </motion.button>
        <span className="bg-gray-700 bg-opacity-50 text-white w-14 h-10 flex items-center justify-center font-medium text-lg">
          {value}
        </span>
        <motion.button
          whileHover={!prefersReducedMotion ? { scale: 1.05 } : {}}
          whileTap={!prefersReducedMotion ? { scale: 0.95 } : {}}
          onClick={onIncrement}
          disabled={max !== undefined && value >= max}
          className="bg-gray-600 bg-opacity-50 hover:bg-opacity-70 text-white font-medium w-10 h-10 rounded-r-lg flex items-center justify-center transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label={`Increase ${label}`}
        >
          <Plus size={16} />
        </motion.button>
      </div>
    </div>
  );
});

CounterButton.displayName = "CounterButton";

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
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const animateScore = () => {
      const difference = highScore - displayScore;
      if (difference > 0) {
        const increment = Math.ceil(difference / 50);
        setDisplayScore((prev) => Math.min(prev + increment, highScore));
        requestAnimationFrame(animateScore);
      }
    };
    requestAnimationFrame(animateScore);
  }, [highScore, displayScore]);

  useEffect(() => {
    const timer = setTimeout(() => setIsMenuOpen(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const soloModes: {
    mode: GameMode;
    label: string;
    color: string;
    icon: React.ElementType;
    description: string;
  }[] = [
    {
      mode: "timed",
      label: "Timed",
      color: "blue",
      icon: Clock,
      description: "Race against the clock to hit as many targets as possible.",
    },
    {
      mode: "endurance",
      label: "Endurance",
      color: "green",
      icon: Target,
      description: "Test your stamina in an endless target practice session.",
    },
    {
      mode: "precision",
      label: "Precision",
      color: "yellow",
      icon: Crosshair,
      description: "Focus on accuracy with smaller, more challenging targets.",
    },
  ];

  const multiplayerModes: {
    mode: GameMode;
    label: string;
    color: string;
    icon: React.ElementType;
    description: string;
  }[] = [
    {
      mode: "deathmatch",
      label: "Deathmatch",
      color: "red",
      icon: Skull,
      description: "Every player for themselves in this all-out battle.",
    },
    {
      mode: "teamDeathmatch",
      label: "Team Deathmatch",
      color: "purple",
      icon: Users2,
      description: "Work together in teams to outscore your opponents.",
    },
  ];

  const isMultiplayerMode =
    selectedMode === "deathmatch" || selectedMode === "teamDeathmatch";
  const maxPlayers = isMultiplayerMode ? 8 : 1;
  const maxNpcs = isMultiplayerMode ? 20 : 0;

  const handleStartGame = useCallback(() => {
    if (selectedMode) {
      onStartGame(selectedMode, selectedPlayers > 1, selectedNpcs);
    }
  }, [selectedMode, selectedPlayers, selectedNpcs, onStartGame]);

  const handleSelectMode = useCallback((mode: GameMode) => {
    setSelectedMode((prev) => (prev === mode ? null : mode));
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-start min-h-screen bg-gradient-to-b from-gray-800 via-gray-900 to-gray-950 p-4 overflow-hidden text-gray-200">
      <motion.div
        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-7xl flex flex-col items-center"
      >
        <div className="w-full flex justify-center mb-4 relative z-10">
          <Image
            src="/aimtrain-biglogo.png"
            alt="Aim Trainer Logo"
            className="inverted-logo w-full max-w-[250px] transition-transform duration-300 cursor-pointer hover:scale-105 hover:filter hover:brightness-110"
            width={250}
            height={125}
            priority
          />
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: prefersReducedMotion ? 0 : 50 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-800 bg-opacity-40 w-full rounded-2xl shadow-2xl backdrop-filter backdrop-blur-lg border border-gray-700 border-opacity-50 relative z-0 flex flex-col max-h-[calc(100vh-200px)]"
            >
              <div className="overflow-hidden flex-grow p-6">
                <div className="flex flex-col lg:flex-row lg:space-x-6">
                  <div className="flex-grow space-y-6">
                    <motion.div
                      initial={{ scale: prefersReducedMotion ? 1 : 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: prefersReducedMotion ? 0 : 0.2, duration: 0.3 }}
                      className="flex flex-col items-center mb-6"
                    >
                      <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-300 to-yellow-400 bg-opacity-70 px-6 py-2 rounded-full shadow-md">
                        <Star className="text-gray-800" size={24} />
                        <span className="font-bold text-2xl text-gray-800">
                          {displayScore}
                        </span>
                      </div>
                    </motion.div>

                    <div className="space-y-6">
                      {/* Solo Modes section */}
                      <section>
                        <h2 className="text-xl font-semibold mb-3 flex items-center text-gray-300">
                          <Target className="mr-2 opacity-70" size={24} />
                          Solo Modes
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {soloModes.map((mode, index) => (
                            <motion.div
                              key={mode.mode}
                              initial={{
                                opacity: 0,
                                y: prefersReducedMotion ? 0 : 20,
                              }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                delay: prefersReducedMotion ? 0 : index * 0.1,
                              }}
                            >
                              <GameModeButton
                                {...mode}
                                isSelected={selectedMode === mode.mode}
                                onSelect={handleSelectMode}
                              />
                            </motion.div>
                          ))}
                        </div>
                      </section>

                      {/* Multiplayer Modes section */}
                      <section>
                        <h2 className="text-xl font-semibold mb-3 flex items-center text-gray-300">
                          <Users2 className="mr-2 opacity-70" size={24} />
                          Multiplayer Modes
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {multiplayerModes.map((mode, index) => (
                            <motion.div
                              key={mode.mode}
                              initial={{
                                opacity: 0,
                                y: prefersReducedMotion ? 0 : 20,
                              }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                delay: prefersReducedMotion ? 0 : index * 0.1,
                              }}
                            >
                              <GameModeButton
                                {...mode}
                                isSelected={selectedMode === mode.mode}
                                onSelect={handleSelectMode}
                              />
                            </motion.div>
                          ))}
                        </div>
                      </section>
                    </div>

                    {/* Social Links */}
                    <SocialLinks />
                  </div>

                  {/* Player Setup section */}
                  <AnimatePresence>
                    {selectedMode && (
                      <motion.section
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden lg:w-64 lg:flex-shrink-0"
                      >
                        <h2 className="text-xl font-semibold mb-3 flex items-center text-gray-300">
                          <Users className="mr-2 opacity-70" size={24} />
                          Player Setup
                        </h2>
                        <motion.div
                          className="bg-gray-700 bg-opacity-30 p-4 rounded-xl shadow-inner backdrop-filter backdrop-blur-sm"
                          initial={{
                            opacity: 0,
                            scale: prefersReducedMotion ? 1 : 0.95,
                          }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="space-y-4">
                            <CounterButton
                              label="Players"
                              value={selectedPlayers}
                              onDecrement={() =>
                                setSelectedPlayers((prev) =>
                                  Math.max(1, prev - 1)
                                )
                              }
                              onIncrement={() =>
                                setSelectedPlayers((prev) =>
                                  Math.min(prev + 1, maxPlayers)
                                )
                              }
                              min={1}
                              max={maxPlayers}
                            />
                            {isMultiplayerMode && (
                              <CounterButton
                                label="NPCs"
                                value={selectedNpcs}
                                onDecrement={() =>
                                  setSelectedNpcs((prev) =>
                                    Math.max(0, prev - 1)
                                  )
                                }
                                onIncrement={() =>
                                  setSelectedNpcs((prev) =>
                                    Math.min(prev + 1, maxNpcs)
                                  )
                                }
                                max={maxNpcs}
                              />
                            )}
                          </div>
                        </motion.div>
                      </motion.section>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Fixed buttons at the bottom */}
              <div className="p-4 border-t border-gray-700 border-opacity-50">
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <motion.button
                    whileHover={!prefersReducedMotion ? { scale: 1.03 } : {}}
                    whileTap={!prefersReducedMotion ? { scale: 0.97 } : {}}
                    onClick={handleStartGame}
                    disabled={!selectedMode}
                    className={`
                      flex-grow bg-gradient-to-r from-green-400 to-green-500 
                      text-gray-900 font-medium py-3 px-6 rounded-lg 
                      transition-all duration-300 transform 
                      focus:outline-none focus:ring-2 focus:ring-green-400 
                      text-lg flex items-center justify-center shadow-md 
                      ${!selectedMode ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg"}
                      backdrop-filter backdrop-blur-sm bg-opacity-70
                    `}
                    aria-disabled={!selectedMode}
                    aria-label="Start Game"
                  >
                    <Play className="mr-2 opacity-70" size={24} />
                    Start Game
                  </motion.button>
                  <motion.button
                    whileHover={!prefersReducedMotion ? { scale: 1.03 } : {}}
                    whileTap={!prefersReducedMotion ? { scale: 0.97 } : {}}
                    onClick={onSettingsOpen}
                    className="flex-grow bg-gradient-to-r from-gray-500 to-gray-600 bg-opacity-70 text-gray-200 font-medium py-3 px-6 rounded-lg transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-gray-400 text-lg flex items-center justify-center shadow-md hover:shadow-lg backdrop-filter backdrop-blur-sm"
                    aria-label="Open Settings"
                  >
                    <Settings className="mr-2 opacity-70" size={24} />
                    Settings
                  </motion.button>
                  {isMultiplayerMode && (
                    <motion.button
                      whileHover={!prefersReducedMotion ? { scale: 1.03 } : {}}
                      whileTap={!prefersReducedMotion ? { scale: 0.97 } : {}}
                      onClick={onJoinLobby}
                      className="flex-grow bg-gradient-to-r from-indigo-400 to-indigo-500 bg-opacity-70 text-gray-900 font-medium py-3 px-6 rounded-lg transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-indigo-400 text-lg flex items-center justify-center shadow-md hover:shadow-lg backdrop-filter backdrop-blur-sm"
                      aria-label="Join Multiplayer Lobby"
                    >
                      <Users className="mr-2 opacity-70" size={24} />
                      Join Lobby
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>
    </div>
  );
}

export default MainMenu;
