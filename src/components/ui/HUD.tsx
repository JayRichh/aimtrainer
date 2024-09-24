import React, { useEffect, useRef, useMemo } from 'react'
import { HUDProps, HotbarSlot, Hotkey, PlayerData, WeaponType } from '../../types'

const getColorForMode = (mode: string): string => {
  switch (mode) {
    case 'protanopia':
      return '#0080FF' // Blue
    case 'deuteranopia':
      return '#FFFF00' // Yellow
    case 'tritanopia':
      return '#FF00FF' // Magenta
    default:
      return '#FF0000' // Red (default)
  }
}

const PlayerList: React.FC<{ players: PlayerData[] }> = ({ players }) => {
  return (
    <div className="bg-black bg-opacity-80 p-3 rounded-lg text-center shadow-lg max-w-xs">
      <div className="mb-2 text-xl font-bold">Players</div>
      {players.map(player => (
        <div key={player.id} className="mb-1">
          <div className="text-sm">{player.username}</div>
          <div className="flex justify-between">
            <span className="text-xs">Score: {player.score}</span>
            <span className="text-xs">Health: {player.health}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const ProgressBar: React.FC<{ value: number; max: number; color: string; label: string }> = ({ value, max, color, label }) => {
  const percentage = (value / max) * 100
  return (
    <div className="w-full h-8 bg-gray-800 rounded-full overflow-hidden border border-gray-700 shadow-inner">
      <div
        className="h-full transition-all duration-300 ease-out flex items-center pl-2 text-xs font-semibold"
        style={{ width: `${percentage}%`, backgroundColor: color }}
      >
        {label}: {Math.round(value)}
      </div>
    </div>
  )
}

const Hotbar: React.FC<{ hotbar: HotbarSlot[]; currentWeapon: WeaponType; onWeaponSwitch: (key: Hotkey) => void }> = ({ hotbar, currentWeapon, onWeaponSwitch }) => {
  return (
    <div className="flex space-x-2">
      {hotbar.map((slot) => (
        <div
          key={slot.key}
          className={`w-16 h-16 bg-gray-800 rounded-lg flex flex-col items-center justify-center cursor-pointer ${
            currentWeapon === slot.weapon ? 'border-2 border-white' : ''
          }`}
          onClick={() => onWeaponSwitch(slot.key)}
        >
          <span className="text-xs absolute top-1 left-1">{slot.key}</span>
          <span className="text-sm font-bold">{slot.weapon}</span>
        </div>
      ))}
    </div>
  )
}

export const renderCrosshair = (style: string) => {
  switch (style) {
    case 'dot':
      return <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
    case 'cross':
      return (
        <div className="relative w-6 h-6">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white transform -translate-y-1/2"></div>
          <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white transform -translate-x-1/2"></div>
        </div>
      )
    case 'circle':
      return <div className="w-5 h-5 border-2 border-white rounded-full"></div>
    default:
      return <div className="w-2 h-2 bg-white rounded-full"></div>
  }
}

export function HUD({ score, timeLeft, accuracy, health, settings, currentWeapon, isPaused, hotbar, onWeaponSwitch, cycleWeapon, players }: HUDProps) {
  const healthColor = useMemo(() => getColorForMode(settings.colorblindMode), [settings.colorblindMode])

  const renderCrosshair = () => {
    switch (settings.crosshairStyle) {
      case 'dot':
        return <div className="w-1.5 h-1.5 bg-white rounded-full filter-invert"></div>
      case 'cross':
        return (
          <div className="relative w-6 h-6 filter-invert">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white transform -translate-y-1/2"></div>
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white transform -translate-x-1/2"></div>
          </div>
        )
      case 'circle':
        return <div className="w-5 h-5 border-2 border-white rounded-full filter-invert"></div>
      default:
        return <div className="w-2 h-2 bg-white rounded-full filter-invert"></div>
    }
  }

  // const renderPlayers = () => {
  //   if (!players || players.length <= 1) return null;
  //   return (
  //     <div className="bg-black bg-opacity-80 p-3 rounded-lg text-center shadow-lg max-w-xs">
  //       <div className="mb-2 text-xl font-bold">Players</div>
  //       {players.map((player) => (
  //         <div key={player.id} className="mb-1">
  //           <div className="text-sm">{player.username}</div>
  //           <div className="flex justify-between">
  //             <span className="text-xs">Score: {player.score}</span>
  //             <span className="text-xs">Health: {player.health}</span>
  //           </div>
  //         </div>
  //       ))}
  //     </div>
  //   );
  // };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const key = event.key as Hotkey
      if (hotbar.some(slot => slot.key === key)) {
        onWeaponSwitch(key)
      }
    }

    const handleWheel = (event: WheelEvent) => {
      if (event.deltaY < 0) {
        cycleWeapon('prev')
      } else {
        cycleWeapon('next')
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    window.addEventListener('wheel', handleWheel)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
      window.removeEventListener('wheel', handleWheel)
    }
  }, [hotbar, onWeaponSwitch, cycleWeapon])

  return (
    <div className="absolute inset-0 pointer-events-none font-sans text-white">
      {/* Top HUD: Score, Time, and Accuracy */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 p-4 rounded-lg text-center shadow-lg">
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-sm uppercase tracking-wide mb-1">Score</p>
            <p className="text-3xl font-bold">{score}</p>
          </div>
          <div>
            <p className="text-sm uppercase tracking-wide mb-1">Time</p>
            <p className="text-3xl font-bold">{timeLeft}s</p>
          </div>
          <div>
            <p className="text-sm uppercase tracking-wide mb-1">Accuracy</p>
            <p className="text-3xl font-bold">{accuracy.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Crosshair */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="filter-invert">
          {renderCrosshair()}
        </div>
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
        <div className="bg-black bg-opacity-80 p-3 rounded-lg text-center shadow-lg">
          <p className="text-sm uppercase tracking-wide mb-1">Current Weapon</p>
          <p className="text-xl font-bold">{currentWeapon}</p>
        </div>
      </div>

      {/* Pause Overlay */}
      {isPaused && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
          <div className="text-white text-6xl font-bold tracking-widest animate-pulse">PAUSED</div>
        </div>
        )}
        {/* {players && players.length > 0 && (
          renderPlayers()
        )} */}
    </div>
  )
}