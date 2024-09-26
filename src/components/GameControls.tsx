import React from 'react';
import { Physics } from '@react-three/cannon';
import { Ground } from './Ground';
import { Character } from './Character';
import { WeaponSystem } from '@/systems/WeaponSystem';
import { WeaponSystemProps, WeaponType, PlayerData } from '../types';
import { Target } from './Target';
import NPC from './NPC';
import { useGameState } from '../hooks/useGameState';
import { ExtendedNPCData } from '../utils/npcUtils';

interface GameControlsProps {
  gameState: ReturnType<typeof useGameState>;
  physicsGravity: [number, number, number];
  isGamePaused: boolean;
  isSettingsOpen: boolean;
  isTransitioning: boolean;
  npcs: ExtendedNPCData[];
  onNPCHit: (npcId: string, damage: number) => void;
  onNPCShoot: (npcId: string) => void;
  mapBounds: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
  };
}

const GameControls: React.FC<GameControlsProps> = ({
  gameState,
  physicsGravity,
  isGamePaused,
  isSettingsOpen,
  isTransitioning,
  npcs,
  onNPCHit,
  onNPCShoot,
  mapBounds,
}) => {
  const isPaused = isGamePaused || isSettingsOpen || isTransitioning;
  const currentGameState = isPaused ? 'paused' : (gameState.isGameRunning ? 'playing' : 'gameOver');

  const playerData: PlayerData = {
    id: 'player',
    username: 'Player',
    position: gameState.playerPosition,
    rotation: gameState.playerRotation,
    health: gameState.playerHealth,
    maxHealth: gameState.playerMaxHealth,
    weapon: gameState.currentWeapon,
    score: gameState.score,
    team: gameState.playerTeam,
  };

  return (
    <Physics gravity={physicsGravity}>
      <Ground />
      <Character
        speed={gameState.settings.speed}
        sensitivity={gameState.settings.sensitivity}
        gravity={gameState.settings.gravity}
        isGamePaused={isPaused}
      />
      {gameState.targets.map((targetData) => (
        <Target
          key={targetData.id}
          data={targetData}
          settings={gameState.settings}
          onHit={gameState.handleTargetHit}
        />
      ))}
      {npcs.map((npcData) => (
        <NPC
          key={npcData.id}
          data={npcData}
          settings={gameState.settings}
          onHit={onNPCHit}
          onShoot={onNPCShoot}
          playerPositions={{ player: gameState.playerPosition }}
          mapBounds={mapBounds}
          gameState={currentGameState}
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
        isGamePaused={isPaused}
        npcs={npcs}
        setNPCs={gameState.setNPCs}
        players={[playerData]}
        setPlayers={undefined}
      />
    </Physics>
  );
};

export default React.memo(GameControls);
