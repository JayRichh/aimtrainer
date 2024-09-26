'use client';

import React, { useCallback, useRef, useEffect, useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { PointerLockControls, KeyboardControls, SoftShadows } from '@react-three/drei';

import { HUD } from './ui/HUD';
import { SettingsModal } from './ui/SettingsModal';
import { MainMenu } from './ui/MainMenu';
import { PostGameSummary } from './ui/PostGameSummary';
import { PauseMenu } from './ui/PauseMenu';
import {
  GameMode,
  GameProps,
  GameSettings,
  TimeOfDay,
  WeatherCondition,
  PlayerRanking,
  Vector3,
} from '../types';
import { ExtendedNPCData } from '../utils/npcUtils';
import { useGameState } from '../hooks/useGameState';
import { audioManager } from '../utils/audioManager';
import CameraController from './CameraController';
import GraphicsController from './GraphicsController';
import ColorblindController from './ColorblindController';
import GameControls from './GameControls';
import SceneSetup from './SceneSetup';
import * as THREE from 'three';

const keyboardMap = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right', keys: ['ArrowRight', 'KeyD'] },
  { name: 'jump', keys: ['Space'] },
  { name: 'quickTurn', keys: ['KeyQ'] },
];

const Game: React.FC<GameProps> = ({ initialSettings, userProfile, onProfileUpdate }) => {
  const gameState = useGameState(initialSettings, userProfile, onProfileUpdate);
  const controlsRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sunPosition = useMemo<Vector3>(() => new THREE.Vector3(100, 50, 100), []);

  const [isTransitioning, setIsTransitioning] = useState(false);
  const mapBounds = useMemo(() => ({
    minX: -50,
    maxX: 50,
    minZ: -50,
    maxZ: 50
  }), []);

  const isUIOpen = useMemo(
    () =>
      gameState.showMainMenu ||
      gameState.showPostGameSummary ||
      gameState.isSettingsOpen ||
      gameState.isGamePaused ||
      isTransitioning,
    [
      gameState.showMainMenu,
      gameState.showPostGameSummary,
      gameState.isSettingsOpen,
      gameState.isGamePaused,
      isTransitioning,
    ],
  );

  const lockControls = useCallback(() => {
    if (controlsRef.current && !isUIOpen && gameState.isGameRunning) {
      controlsRef.current.lock();
    }
  }, [isUIOpen, gameState.isGameRunning]);

  const unlockControls = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.unlock();
    }
  }, []);

  const handleSettingsChange = useCallback(
    (newSettings: Partial<GameSettings>) => {
      gameState.handleSettingsChange(newSettings);
      if (newSettings.volume !== undefined) {
        audioManager.setVolume(newSettings.volume);
      }
    },
    [gameState],
  );

  const handleTimeOfDayChange = useCallback(
    (newTimeOfDay: TimeOfDay) => {
      handleSettingsChange({ timeOfDay: newTimeOfDay });
    },
    [handleSettingsChange],
  );

  const handleWeatherConditionChange = useCallback(
    (newWeatherCondition: WeatherCondition) => {
      handleSettingsChange({ weatherCondition: newWeatherCondition });
    },
    [handleSettingsChange],
  );

  const startCountdown = useCallback(
    (callback: () => void) => {
      setIsTransitioning(true);
      gameState.setResumeCountdown(3);
      const countdownInterval = setInterval(() => {
        gameState.setResumeCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            setIsTransitioning(false);
            gameState.setIsGamePaused(false);
            callback();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [gameState, setIsTransitioning],
  );

  const handlePostGameRestart = useCallback(() => {
    gameState.handlePostGameAction('restart');
  }, [gameState]);

  const handlePostGameExit = useCallback(() => {
    gameState.handlePostGameAction('exit');
  }, [gameState]);

  const handleSettingsClose = useCallback(() => {
    gameState.setIsSettingsOpen(false);
    if (gameState.isGameRunning && !gameState.isGamePaused) {
      startCountdown(lockControls);
    }
  }, [gameState, lockControls, startCountdown]);

  const handleStartGame = useCallback(
    (selectedMode: GameMode, isMultiplayer: boolean, npcCount: number) => {
      gameState.startGame(selectedMode, isMultiplayer, npcCount);
      startCountdown(() => {
        lockControls();
      });
    },
    [gameState, lockControls, startCountdown],
  );

  const handlePauseToggle = useCallback(() => {
    if (gameState.isGameRunning && !isTransitioning && !gameState.isSettingsOpen) {
      if (gameState.isGamePaused) {
        startCountdown(lockControls);
      } else {
        unlockControls();
        gameState.togglePause();
      }
    }
  }, [gameState, isTransitioning, lockControls, unlockControls, startCountdown]);

  const handleRestart = useCallback(() => {
    gameState.togglePause();
    gameState.resetGameState(gameState.gameMode, gameState.isMultiplayer, gameState.npcCount);
    gameState.setIsGameRunning(true);
    gameState.setIsGamePaused(false);
    handleStartGame(gameState.gameMode, gameState.isMultiplayer, gameState.npcCount);
  }, [gameState, handleStartGame]);

  const handleQuit = useCallback(() => {
    gameState.togglePause();
    gameState.setShowMainMenu(true);
    gameState.setIsGameRunning(false);
    unlockControls();
  }, [gameState, unlockControls]);

  const handleNPCShoot = useCallback(
    (npcId: string) => {
      const hitChance = gameState.settings.npcAccuracy;
      if (Math.random() < hitChance) {
        const damage = 10; // You might want to make this dynamic based on NPC weapon or difficulty
        gameState.handlePlayerDamage(damage);
      }
    },
    [gameState],
  );

  const handleNPCHit = useCallback(
    (npcId: string, damage: number) => {
      gameState.handleNPCHit(npcId, damage);
      // Dispatch a custom event for the NPC component to handle
      const event = new CustomEvent('npcHit', { detail: { npcId, damage } });
      window.dispatchEvent(event);
    },
    [gameState],
  );

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handlePauseToggle();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handlePauseToggle]);

  useEffect(() => {
    if (gameState.isGameRunning && !isUIOpen) {
      lockControls();
    } else {
      unlockControls();
    }
  }, [gameState.isGameRunning, isUIOpen, lockControls, unlockControls]);

  useEffect(() => {
    const handlePointerLockChange = () => {
      if (document.pointerLockElement === null && gameState.isGameRunning && !isUIOpen) {
        handlePauseToggle();
      }
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
    };
  }, [gameState, isUIOpen, handlePauseToggle]);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
    }
  }, []);

  const physicsGravity = useMemo<[number, number, number]>(
    () => [0, -gameState.settings.gravity, 0],
    [gameState.settings.gravity],
  );

  const handleCanvasClick = useCallback(() => {
    if (gameState.isGameRunning && !isUIOpen) {
      lockControls();
    }
  }, [gameState.isGameRunning, isUIOpen, lockControls]);

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <KeyboardControls map={keyboardMap}>
        <Canvas
          ref={canvasRef}
          shadows
          camera={{
            fov: gameState.settings.fov,
            position: [0, 1.6, 0],
            near: 0.1,
            far: 1000,
          }}
          onClick={handleCanvasClick}
        >
          <CameraController fov={gameState.settings.fov} />
          <GraphicsController quality={gameState.settings.graphicsQuality} />
          <ColorblindController mode={gameState.settings.colorblindMode} />
          <SoftShadows size={10} samples={gameState.settings.graphicsQuality * 5} focus={0.5} />
          <SceneSetup
            sunPosition={sunPosition}
            graphicsQuality={gameState.settings.graphicsQuality}
            timeOfDay={gameState.settings.timeOfDay}
            weatherCondition={gameState.settings.weatherCondition}
          />
          {gameState.isGameRunning && (
            <GameControls
              gameState={gameState}
              physicsGravity={physicsGravity}
              isGamePaused={gameState.isGamePaused}
              isSettingsOpen={gameState.isSettingsOpen}
              isTransitioning={isTransitioning}
              npcs={gameState.npcs as ExtendedNPCData[]}
              onNPCHit={handleNPCHit}
              onNPCShoot={handleNPCShoot}
              mapBounds={mapBounds}
            />
          )}
          {gameState.isGameRunning && !isUIOpen && <PointerLockControls ref={controlsRef} />}
        </Canvas>
      </KeyboardControls>

      {gameState.showMainMenu && (
        <div className="absolute inset-0">
          <MainMenu
            onStartGame={handleStartGame}
            onSettingsOpen={() => gameState.setIsSettingsOpen(true)}
            highScore={userProfile?.highScore || 0}
            onJoinLobby={() => gameState.setIsShowLobby(true)}
            npcCount={gameState.npcCount}
            setNpcCount={gameState.setNpcCount}
          />
        </div>
      )}

      {gameState.showPostGameSummary && (
        <div className="absolute inset-0">
          <PostGameSummary
            score={gameState.score}
            accuracy={gameState.accuracy}
            onRestart={() =>
              handleStartGame(gameState.gameMode, gameState.isMultiplayer, gameState.npcCount)
            }
            onExit={() => gameState.setShowMainMenu(true)}
            playerRankings={gameState.playerRankings}
            gameMode={gameState.gameMode}
          />
        </div>
      )}

      {gameState.isGameRunning && (
        <div className="absolute inset-0">
          <HUD
            score={gameState.score}
            timeLeft={gameState.timeLeft}
            accuracy={gameState.accuracy}
            health={gameState.playerHealth}
            settings={gameState.settings}
            currentWeapon={gameState.currentWeapon}
            isPaused={gameState.isGamePaused || isTransitioning}
            hotbar={gameState.hotbar}
            onWeaponSwitch={gameState.handleWeaponSwitch}
            cycleWeapon={gameState.cycleWeapon}
            npcs={gameState.npcs as ExtendedNPCData[]}
            players={gameState.playerRankings}
            gameMode={gameState.gameMode}
          />
        </div>
      )}

      {gameState.isGamePaused && !gameState.isSettingsOpen && !isTransitioning && (
        <PauseMenu
          onResume={handlePauseToggle}
          onRestart={handleRestart}
          onQuit={handleQuit}
          onSettings={() => {
            gameState.setIsSettingsOpen(true);
            unlockControls();
          }}
        />
      )}

      {(gameState.resumeCountdown > 0 || isTransitioning) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-6xl font-bold text-white">
          {gameState.resumeCountdown > 0 ? gameState.resumeCountdown : 'Applying settings...'}
        </div>
      )}

      <SettingsModal
        isOpen={gameState.isSettingsOpen}
        onClose={handleSettingsClose}
        settings={gameState.settings}
        onSettingsChange={handleSettingsChange}
        userProfile={userProfile}
        onProfileUpdate={onProfileUpdate}
      />
    </div>
  );
};

export default Game;
