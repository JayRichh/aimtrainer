import React, { useEffect, useRef, useMemo } from 'react';
import {
  HUDProps,
  HotbarSlot,
  Hotkey,
  PlayerRanking,
  WeaponType,
  NPCData,
  GameMode,
} from '../../types';

const getColorForMode = (mode: string): string => {
  switch (mode) {
    case 'protanopia':
      return '#0080FF'; // Blue
    case 'deuteranopia':
      return '#FFFF00'; // Yellow
    case 'tritanopia':
      return '#FF00FF'; // Magenta
    default:
      return '#FF0000'; // Red (default)
  }
};

const PlayerList: React.FC<{
  players: PlayerRanking[];
  gameMode: GameMode;
}> = ({ players, gameMode }) => {
  return (
    <div className="max-w-xs rounded-lg bg-gray-800 bg-opacity-90 p-4 text-center shadow-lg">
      <div className="mb-3 text-xl font-bold text-blue-400">Players</div>
      {players.map((player) => (
        <div key={player.id} className="mb-2 rounded bg-gray-700 p-2">
          <div className="text-sm font-semibold">{player.username}</div>
          <div className="flex justify-between text-xs">
            <span>Score: {player.score}</span>
            {(gameMode === 'deathmatch' || gameMode === 'teamDeathmatch') && (
              <span>Kills: {player.kills}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const NPCList: React.FC<{ npcs: NPCData[]; gameMode: GameMode }> = ({ npcs, gameMode }) => {
  if (gameMode !== 'deathmatch' && gameMode !== 'teamDeathmatch') return null;

  return (
    <div className="max-w-xs rounded-lg bg-gray-800 bg-opacity-90 p-4 text-center shadow-lg">
      <div className="mb-3 text-xl font-bold text-blue-400">NPCs</div>
      <div className="mb-2 text-sm">Active NPCs: {npcs.length}</div>
      {npcs.slice(0, 5).map((npc) => (
        <div key={npc.id} className="mb-2 rounded bg-gray-700 p-2">
          <div className="flex justify-between text-xs">
            <span>ID: {npc.id.slice(0, 4)}</span>
            <span>
              Health: {npc.health}/{npc.maxHealth}
            </span>
          </div>
        </div>
      ))}
      {npcs.length > 5 && <div className="mt-2 text-xs italic">...and {npcs.length - 5} more</div>}
    </div>
  );
};

const ProgressBar: React.FC<{
  value: number;
  max: number;
  color: string;
  label: string;
}> = ({ value, max, color, label }) => {
  const percentage = (value / max) * 100;
  return (
    <div className="h-8 w-full overflow-hidden rounded-full border border-gray-600 bg-gray-700 shadow-inner">
      <div
        className="flex h-full items-center pl-2 text-xs font-semibold transition-all duration-300 ease-out"
        style={{ width: `${percentage}%`, backgroundColor: color }}
      >
        {label}: {Math.round(value)}
      </div>
    </div>
  );
};

const Hotbar: React.FC<{
  hotbar: HotbarSlot[];
  currentWeapon: WeaponType;
  onWeaponSwitch: (key: Hotkey) => void;
}> = ({ hotbar, currentWeapon, onWeaponSwitch }) => {
  return (
    <div className="flex space-x-2">
      {hotbar.map((slot) => (
        <div
          key={slot.key}
          className={`flex h-16 w-16 cursor-pointer flex-col items-center justify-center rounded-lg bg-gray-700 transition-all duration-200 ${
            currentWeapon === slot.weapon
              ? 'border-2 border-blue-400 bg-gray-600'
              : 'hover:bg-gray-600'
          }`}
          onClick={() => onWeaponSwitch(slot.key)}
        >
          <span className="absolute left-1 top-1 text-xs text-blue-300">{slot.key}</span>
          <span className="text-sm font-bold">{slot.weapon}</span>
        </div>
      ))}
    </div>
  );
};

export const renderCrosshair = (style: string, color: string) => {
  switch (style) {
    case 'dot':
      return <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }}></div>;
    case 'cross':
      return (
        <div className="relative h-6 w-6">
          <div
            className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 transform"
            style={{ backgroundColor: color }}
          ></div>
          <div
            className="absolute bottom-0 left-1/2 top-0 w-0.5 -translate-x-1/2 transform"
            style={{ backgroundColor: color }}
          ></div>
        </div>
      );
    case 'circle':
      return <div className="h-5 w-5 rounded-full" style={{ border: `2px solid ${color}` }}></div>;
    default:
      return <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }}></div>;
  }
};

export function HUD({
  score,
  timeLeft,
  accuracy,
  health,
  settings,
  currentWeapon,
  isPaused,
  hotbar,
  onWeaponSwitch,
  cycleWeapon,
  players,
  npcs,
  gameMode,
}: HUDProps) {
  const healthColor = useMemo(
    () => getColorForMode(settings.colorblindMode),
    [settings.colorblindMode],
  );

  const getCrosshair = () => {
    return renderCrosshair(settings.crosshairStyle, settings.crosshairColor);
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const key = event.key as Hotkey;
      if (hotbar.some((slot) => slot.key === key)) {
        onWeaponSwitch(key);
      }
    };

    const handleWheel = (event: WheelEvent) => {
      if (event.deltaY < 0) {
        cycleWeapon('prev');
      } else {
        cycleWeapon('next');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('wheel', handleWheel);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [hotbar, onWeaponSwitch, cycleWeapon]);

  return (
    <div className="pointer-events-none absolute inset-0 font-sans text-white">
      {/* Top HUD: Game Mode, Score, Time, and Accuracy */}
      <div className="absolute left-1/2 top-4 -translate-x-1/2 transform rounded-lg bg-gray-800 bg-opacity-90 p-4 text-center shadow-lg">
        <div className="mb-2 text-xl font-bold text-blue-400">
          {gameMode.charAt(0).toUpperCase() + gameMode.slice(1)} Mode
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="mb-1 text-sm uppercase tracking-wide text-gray-300">Score</p>
            <p className="text-3xl font-bold">{score}</p>
          </div>
          {gameMode !== 'endurance' && (
            <div>
              <p className="mb-1 text-sm uppercase tracking-wide text-gray-300">Time</p>
              <p className="text-3xl font-bold">{timeLeft}s</p>
            </div>
          )}
          <div>
            <p className="mb-1 text-sm uppercase tracking-wide text-gray-300">Accuracy</p>
            <p className="text-3xl font-bold">{accuracy.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Crosshair */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div>{getCrosshair()}</div>
      </div>

      {/* Bottom HUD: Health, Weapon, and Hotbar */}
      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
        {/* Health Bar */}
        <div className="w-1/3 max-w-xs">
          <ProgressBar value={health} max={100} color={healthColor} label="Health" />
        </div>

        {/* Hotbar */}
        <div className="pointer-events-auto">
          <Hotbar hotbar={hotbar} currentWeapon={currentWeapon} onWeaponSwitch={onWeaponSwitch} />
        </div>

        {/* Weapon Info */}
        <div className="rounded-lg bg-gray-800 bg-opacity-90 p-3 text-center shadow-lg">
          <p className="mb-1 text-sm uppercase tracking-wide text-gray-300">Current Weapon</p>
          <p className="text-xl font-bold text-blue-400">{currentWeapon}</p>
        </div>
      </div>

      {/* Player List */}
      {players && players.length > 0 && (
        <div className="absolute left-4 top-4">
          <PlayerList players={players} gameMode={gameMode} />
        </div>
      )}

      {/* NPC List */}
      {npcs && npcs.length > 0 && (
        <div className="absolute right-4 top-4">
          <NPCList npcs={npcs} gameMode={gameMode} />
        </div>
      )}

      {/* Pause Overlay */}
      {isPaused && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
          <div className="animate-pulse text-6xl font-bold tracking-widest text-white">PAUSED</div>
        </div>
      )}
    </div>
  );
}
