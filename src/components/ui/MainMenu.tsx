import React, { useEffect, useState } from "react";
import { MainMenuProps, GameMode } from "../../types";
import { Star, Play, Users, Settings, Plus, Minus, Target } from "lucide-react";
import Image from 'next/image';

export function MainMenu({
  onStartGame,
  onSettingsOpen,
  onJoinLobby,
  highScore,
}: MainMenuProps) {
  const [selectedNpcs, setSelectedNpcs] = useState<number>(0);
  const [selectedPlayers, setSelectedPlayers] = useState<number>(1);
  const [displayScore, setDisplayScore] = useState<number>(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (displayScore < highScore) {
      timer = setTimeout(() => {
        setDisplayScore((prev) =>
          Math.min(prev + Math.ceil(highScore / 50), highScore),
        );
      }, 20);
    }
    return () => clearTimeout(timer);
  }, [displayScore, highScore]);

  const aimModes: { mode: GameMode; label: string; color: string }[] = [
    { mode: "timed", label: "Timed", color: "blue" },
    { mode: "endurance", label: "Endurance", color: "green" },
    { mode: "precision", label: "Precision", color: "yellow" },
  ];

  const botModes: { mode: GameMode; label: string; color: string }[] = [
    { mode: "deathmatch", label: "Deathmatch", color: "red" },
    { mode: "teamDeathmatch", label: "Team Deathmatch", color: "purple" },
  ];

  const GameModeButton = ({
    mode,
    label,
    color,
  }: {
    mode: GameMode;
    label: string;
    color: string;
  }) => {
    const colorClasses = {
      blue: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
      green: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
      yellow: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
      red: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
      purple: "bg-purple-600 hover:bg-purple-700 focus:ring-purple-500",
    };

    const buttonClass = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;

    return (
      <button
        onClick={() => onStartGame(mode, selectedPlayers > 1, selectedNpcs)}
        className={`${buttonClass} text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 text-sm w-full`}
      >
        {label}
      </button>
    );
  };

  const CounterButton = ({
    label,
    value,
    onDecrement,
    onIncrement,
    min = 0,
  }: {
    label: string;
    value: number;
    onDecrement: () => void;
    onIncrement: () => void;
    min?: number;
  }) => (
    <div className="flex flex-col items-center bg-gray-700 rounded-lg p-2">
      <span className="text-sm mb-1">{label}</span>
      <div className="flex items-center">
        <button
          onClick={onDecrement}
          disabled={value <= min}
          className="bg-gray-600 hover:bg-gray-500 text-white font-bold w-10 h-10 rounded-l disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <Minus size={16} />
        </button>
        <span className="bg-gray-800 text-white w-16 h-10 flex items-center justify-center">
          {value}
        </span>
        <button
          onClick={onIncrement}
          className="bg-gray-600 hover:bg-gray-500 text-white font-bold w-10 h-10 rounded-r flex items-center justify-center"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <div className="bg-gray-800 p-6 pt-0 rounded-xl shadow-2xl w-full max-w-2xl text-white">
        <div className="flex justify-center">
          <Image
            src='/aimtrain-biglogo.png'
            alt='Aim Trainer Logo'
            className='inverted-logo w-full max-w-[300px] h-auto'
            width={300}
            height={150}
          />
        </div>

        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center space-x-2 bg-gray-700 px-4 py-2 rounded-full">
            <Star className="text-yellow-400" size={24} />
            <span className="font-bold text-2xl text-yellow-400">
              {displayScore}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3 flex items-center">
              <Target className="mr-2" size={24} />
              Game Modes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2 text-gray-400">
                  Aim Training
                </h3>
                <div className="space-y-2">
                  {aimModes.map((mode) => (
                    <GameModeButton key={mode.mode} {...mode} />
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2 text-gray-400">
                  Bot Challenge
                </h3>
                <div className="space-y-2">
                  {botModes.map((mode) => (
                    <GameModeButton key={mode.mode} {...mode} />
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 flex items-center">
              <Users className="mr-2" size={24} />
              Multiplayer & Settings
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={onJoinLobby}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm flex items-center justify-center"
              >
                <Play className="mr-2" size={16} />
                Join Multiplayer Lobby
              </button>
              <button
                onClick={onSettingsOpen}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm flex items-center justify-center"
              >
                <Settings className="mr-2" size={16} />
                Settings
              </button>
            </div>
          </section>

          <section className="mt-4">
            <h2 className="text-xl font-semibold mb-3 flex items-center">
              <Users className="mr-2" size={24} />
              Bot/Player Selection
            </h2>
            <div className="bg-gray-700 p-2 rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <CounterButton
                  label="NPCs"
                  value={selectedNpcs}
                  onDecrement={() => setSelectedNpcs(Math.max(0, selectedNpcs - 1))}
                  onIncrement={() => setSelectedNpcs(selectedNpcs + 1)}
                />
                <CounterButton
                  label="Players"
                  value={selectedPlayers}
                  onDecrement={() => setSelectedPlayers(Math.max(1, selectedPlayers - 1))}
                  onIncrement={() => setSelectedPlayers(selectedPlayers + 1)}
                  min={1}
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}