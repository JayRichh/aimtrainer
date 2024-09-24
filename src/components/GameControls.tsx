import React from 'react';
import { Physics } from '@react-three/cannon';
import { Ground } from './Ground';
import { Character } from './Character';
import { WeaponSystem } from '@/systems/WeaponSystem';
import { WeaponSystemProps, WeaponType } from '../types'
import { Target } from './Target';
import { useGameState } from '../hooks/useGameState';

interface GameControlsProps {
  gameState: ReturnType<typeof useGameState>;
  physicsGravity: [number, number, number];
  isGamePaused: boolean;
  isSettingsOpen: boolean;
  isTransitioning: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({
  gameState,
  physicsGravity,
  isGamePaused,
  isSettingsOpen,
  isTransitioning,
}) => {
  return (
    <Physics gravity={physicsGravity}>
      <Ground />
      <Character
        speed={gameState.settings.speed}
        sensitivity={gameState.settings.sensitivity}
        gravity={gameState.settings.gravity}
        isGamePaused={isGamePaused || isSettingsOpen || isTransitioning}
      />
      {gameState.targets.map((targetData) => (
        <Target
          key={targetData.id}
          data={targetData}
          settings={gameState.settings}
          onHit={gameState.handleTargetHit}
        />
      ))}
      <WeaponSystem
        currentWeapon={gameState.currentWeapon}
        onWeaponChange={gameState.setCurrentWeapon}
        onShoot={gameState.handleShoot}
        settings={gameState.settings}
        targets={gameState.targets}
        setTargets={gameState.setTargets}
        onHit={gameState.handleTargetHit}
        isGamePaused={isGamePaused || isSettingsOpen || isTransitioning}
      />
    </Physics>
  );
};

export default React.memo(GameControls);
