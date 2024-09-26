import { useState, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import {
  GameSettings,
  GameMode,
  UserProfile,
  TargetData,
  WeaponType,
  TimeOfDay,
  WeatherCondition,
  Hotkey,
  HotbarSlot,
  PlayerRanking,
  Vector3,
} from '../types';
import {
  generateRandomTargets,
  updateTargetPositions,
  regenerateTarget,
} from '../utils/targetUtils';
import { hotbarConfig } from '../config/hotbarConfig';
import { initSocket, closeSocket, getSocket } from '../utils/socketClient';
import { Socket } from 'socket.io-client';
import { updateNPCMovement, ExtendedNPCData, initializeNPC } from '../utils/npcUtils';

const weaponTypes: WeaponType[] = [
  'Pistol', 'Rifle', 'Shotgun', 'Sniper', 'SMG',
  'LaserGun', 'Crossbow', 'Flamethrower'
];

const generateRandomNPCs = (
  count: number,
  settings: GameSettings,
  gameMode: GameMode,
  isMultiplayer: boolean,
): ExtendedNPCData[] => {
  if (isMultiplayer) {
    return []; // No bots in multiplayer mode
  }

  return Array.from({ length: count }, (_, index) => {
    const baseNPC: ExtendedNPCData = initializeNPC({
      id: `npc-${index}`,
      position: new THREE.Vector3(Math.random() * 100 - 50, 0, Math.random() * 100 - 50),
      rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0),
      health: 100,
      maxHealth: 100,
      weapon: weaponTypes[Math.floor(Math.random() * weaponTypes.length)],
      state: 'idle',
      speed: settings.npcMovementSpeed,
      lastShootTime: Date.now(),
      shootInterval: 1000 / settings.npcAccuracy,
      movementTarget: new THREE.Vector3(Math.random() * 100 - 50, 0, Math.random() * 100 - 50),
      team: gameMode === 'teamDeathmatch' ? (Math.random() > 0.5 ? 'red' : 'blue') : undefined,
      accuracy: settings.npcAccuracy,
      reactionTime: settings.npcReactionTime,
    });
    return baseNPC;
  });
};


// Define fetchPlayerRankings if not imported
async function fetchPlayerRankings(): Promise<PlayerRanking[]> {
  // Fetch logic here
  // Example mock implementation:
  return [
    { id: '1', username: 'player1', score: 1000, kills: 10 },
    { id: '2', username: 'player2', score: 900, kills: 8 },
    // Add more mock user profiles
  ];
}

export const useGameState = (
  initialSettings: GameSettings,
  userProfile: UserProfile | null,
  onProfileUpdate: (profile: UserProfile) => void,
) => {
  const [settings, setSettings] = useState<GameSettings>(initialSettings);
  const [currentWeapon, setCurrentWeapon] = useState<WeaponType>('Pistol');
  const [hotbar, setHotbar] = useState<HotbarSlot[]>(hotbarConfig);
  const [targets, setTargets] = useState<TargetData[]>([]);
  const [npcs, setNPCs] = useState<ExtendedNPCData[]>([]);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [isGamePaused, setIsGamePaused] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>('timed');
  const [showMainMenu, setShowMainMenu] = useState(true);
  const [showPostGameSummary, setShowPostGameSummary] = useState(false);
  const [score, setScore] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [timeLeft, setTimeLeft] = useState(60);
  const [shotsFired, setShotsFired] = useState(0);
  const [hits, setHits] = useState(0);
  const [resumeCountdown, setResumeCountdown] = useState(0);
  const [isShowLobby, setIsShowLobby] = useState(false);
  const [playerRankings, setPlayerRankings] = useState<PlayerRanking[]>([]);
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [npcCount, setNpcCount] = useState(0);

  const [playerPosition, setPlayerPosition] = useState<Vector3>(new THREE.Vector3(0, 1.6, 0));
  const [playerRotation, setPlayerRotation] = useState<THREE.Euler>(new THREE.Euler(0, 0, 0));
  const [playerHealth, setPlayerHealth] = useState(100);
  const [playerMaxHealth] = useState(100);
  const [playerKills, setPlayerKills] = useState(0);
  const [playerTeam, setPlayerTeam] = useState<'red' | 'blue' | undefined>(undefined);

  const handleWeaponSwitch = useCallback(
    (key: Hotkey) => {
      const slot = hotbar.find((h) => h.key === key);
      if (slot) {
        setCurrentWeapon(slot.weapon);
      }
    },
    [hotbar],
  );

  const cycleWeapon = useCallback(
    (direction: 'next' | 'prev') => {
      const currentIndex = hotbar.findIndex((slot) => slot.weapon === currentWeapon);
      let newIndex;
      if (direction === 'next') {
        newIndex = (currentIndex + 1) % hotbar.length;
      } else {
        newIndex = (currentIndex - 1 + hotbar.length) % hotbar.length;
      }
      setCurrentWeapon(hotbar[newIndex].weapon);
    },
    [hotbar, currentWeapon],
  );

  const resetGameState = useCallback(
    (selectedMode: GameMode, isMultiplayer: boolean, npcCount: number) => {
      setGameMode(selectedMode);
      setScore(0);
      setAccuracy(100);
      setShotsFired(0);
      setHits(0);
      setPlayerHealth(100);
      setPlayerKills(0);
      setIsMultiplayer(isMultiplayer);
      setNpcCount(npcCount);

      switch (selectedMode) {
        case 'timed':
          setTimeLeft(60);
          setTargets(generateRandomTargets(settings, 10));
          setNPCs([]);
          setPlayerTeam(undefined);
          break;
        case 'endurance':
          setTimeLeft(Infinity);
          setTargets(generateRandomTargets(settings, 10));
          setNPCs([]);
          setPlayerTeam(undefined);
          break;
        case 'precision':
          setTimeLeft(60);
          setTargets(generateRandomTargets(settings, 5));
          setNPCs([]);
          setPlayerTeam(undefined);
          break;
        case 'deathmatch':
          setTimeLeft(300); // 5 minutes for deathmatch modes
          setTargets([]);
          setNPCs(generateRandomNPCs(npcCount, settings, selectedMode, isMultiplayer));
          setPlayerTeam(undefined);
          break;
        case 'teamDeathmatch':
          setTimeLeft(300); // 5 minutes for deathmatch modes
          setTargets([]);
          setNPCs(generateRandomNPCs(npcCount, settings, selectedMode, isMultiplayer));
          setPlayerTeam(Math.random() > 0.5 ? 'red' : 'blue');
          break;
        default:
          console.error('Unknown game mode:', selectedMode);
      }
    },
    [settings],
  );
  

  const startGame = useCallback(
    (selectedMode: GameMode, isMultiplayer: boolean, npcCount: number) => {
      resetGameState(selectedMode, isMultiplayer, npcCount);
      setIsGameRunning(true);
      setIsGamePaused(false);
      setShowMainMenu(false);
      setShowPostGameSummary(false);
  
      // Initialize Socket.IO connection
      if (isMultiplayer) {
        initSocket();
      }
    },
    [resetGameState],
  );
  

  const togglePause = useCallback(() => {
    if (isGameRunning) {
      setIsGamePaused((prev) => !prev);
    }
  }, [isGameRunning]);

  const openSettings = useCallback(() => {
    setIsSettingsOpen(true);
  }, []);

  const openLobby = useCallback(async () => {
    setIsShowLobby(true);
    const fetchedRankings = await fetchPlayerRankings();
    setPlayerRankings(fetchedRankings);
  }, []);

  const endGame = useCallback(() => {
    setIsGameRunning(false);
    setIsGamePaused(false);
    setShowPostGameSummary(true);
    const newHighScore = Math.max(score, userProfile?.highScore || 0);
    const updatedProfile: UserProfile = {
      ...userProfile!,
      highScore: newHighScore,
      settings,
    };
    onProfileUpdate(updatedProfile);
    if (isMultiplayer) {
      closeSocket();
    }
  }, [score, userProfile, settings, onProfileUpdate, isMultiplayer]);

  const handleSettingsChange = useCallback((updatedSettings: Partial<GameSettings>) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      ...updatedSettings,
    }));
  }, []);

  const handlePostGameAction = useCallback((action: 'restart' | 'exit') => {
    if (action === 'restart') {
      startGame(gameMode, isMultiplayer, npcCount);
    } else {
      setShowPostGameSummary(false);
      setShowMainMenu(true);
      setIsGameRunning(false);
    }
  }, [gameMode, isMultiplayer, npcCount, startGame]);

  const handleTargetHit = useCallback(
    (targetId: string, hitScore: number) => {
      setTargets((prevTargets) => {
        return prevTargets.map((target) => {
          if (target.id === targetId) {
            const newHealth = Math.max(0, target.health - hitScore);
            setScore((prevScore) => prevScore + Math.floor(hitScore));
            setHits((prevHits) => prevHits + 1);
  
            if (newHealth === 0) {
              // Target destroyed, generate a new one
              return regenerateTarget(settings);
            } else {
              // Target hit but not destroyed, trigger pop animation
              return { ...target, health: newHealth, isPopping: true };
            }
          }
          return target;
        });
      });
      const socket: Socket | null = getSocket();
      if (isMultiplayer && socket) {
        socket.emit('targetHit', { targetId, hitScore });
      }
  },
    [settings, isMultiplayer]
  );
  
  const handleNPCHit = useCallback((npcId: string, hitScore: number) => {
    setScore((prevScore) => prevScore + Math.floor(hitScore));
    setHits((prevHits) => prevHits + 1);
    setNPCs((prevNPCs) => {
      return prevNPCs.map((npc) => {
        if (npc.id === npcId) {
          const newHealth = Math.max(0, npc.health - hitScore);
          if (newHealth === 0) {
            setPlayerKills((prevKills) => prevKills + 1);
          }
          return { ...npc, health: newHealth };
        }
        return npc;
      });
    });
  }, []);

  const handleShoot = useCallback(() => {
    setShotsFired((prev) => prev + 1);
  }, []);

  const setTimeOfDay = useCallback(
    (newTimeOfDay: TimeOfDay) => {
      handleSettingsChange({ timeOfDay: newTimeOfDay });
    },
    [handleSettingsChange],
  );

  const setWeatherCondition = useCallback(
    (newWeatherCondition: WeatherCondition) => {
      handleSettingsChange({ weatherCondition: newWeatherCondition });
    },
    [handleSettingsChange],
  );

  const handlePlayerDamage = useCallback((damage: number) => {
    setPlayerHealth((prevHealth) => Math.max(0, prevHealth - damage));
  }, []);

  useEffect(() => {
    const socket: Socket | null = getSocket();
    if (isGameRunning && isMultiplayer && socket) {
      socket.emit('gameStart', { gameMode, settings });
    }
  }, [isGameRunning, isMultiplayer, gameMode, settings]);
  
  useEffect(() => {
    const socket = getSocket();
    if (!isGameRunning && isMultiplayer && socket) {
      socket.emit('gameEnd', { score, playerKills });
    }
  }, [isGameRunning, isMultiplayer, score, playerKills]);

  useEffect(() => {
    if (shotsFired > 0) {
      setAccuracy((hits / shotsFired) * 100);
    }
  }, [shotsFired, hits]);

  useEffect(() => {
    const socket = getSocket();
    if (isMultiplayer && socket) {
      socket.on('targetHitUpdate', (data: { targetId: string; hitScore: number }) => {
        // setTargets((prevTargets) => {
        //   // Update target health based on the received event
        //   // Similar logic to handleTargetHit
        //   console.log(prevTargets)
        // });
      });
  
      socket.on('gameStarted', (data: { gameMode: GameMode; settings: GameSettings }) => {
        setGameMode(data.gameMode);
        setSettings(data.settings);
        setIsGameRunning(true);
      });
  
      socket.on('gameEnded', (data: { score: number; playerKills: number }) => {
        setIsGameRunning(false);
        setShowPostGameSummary(true);
        // Update player rankings with the received data
      });
  
      return () => {
        socket.off('targetHitUpdate');
        socket.off('gameStarted');
        socket.off('gameEnded');
      };
    }
  }, [isMultiplayer]);
  

  useEffect(() => {
    if (isGameRunning && !isGamePaused && gameMode !== 'endurance') {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isGameRunning, isGamePaused, gameMode, endGame]);

  useEffect(() => {
    if (isGameRunning && !isGamePaused) {
      const updateInterval = setInterval(() => {
        if (gameMode === 'timed' || gameMode === 'endurance' || gameMode === 'precision') {
          setTargets((prevTargets) =>
            updateTargetPositions(prevTargets, settings.targetSpeed, settings.targetMovementRange),
          );
        }

        setNPCs((prevNPCs) => {
          return prevNPCs.map((npc) => {
            const updatedNPC = updateNPCMovement(npc, playerPosition, settings, 1/60, {
              minX: -50, maxX: 50, minZ: -50, maxZ: 50
            });

            // Randomly change NPC weapon based on probability
            const shouldChangeWeapon = Math.random() < settings.npcWeaponChangeProbability;
            const weapon = shouldChangeWeapon
              ? weaponTypes[Math.floor(Math.random() * weaponTypes.length)]
              : updatedNPC.weapon;

            return {
              ...updatedNPC,
              weapon,
            };
          });
        });

        // Update player rankings
        setPlayerRankings((prevRankings) => {
          const updatedRankings = prevRankings.map((ranking) => {
            if (ranking.id === userProfile?.id) {
              return { ...ranking, score, kills: playerKills };
            }
            return ranking;
          });
          return updatedRankings.sort((a, b) => b.score - a.score);
        });
      }, 1000 / 60); // 60 FPS update rate

      return () => clearInterval(updateInterval);
    }
  }, [
    isGameRunning,
    isGamePaused,
    gameMode,
    settings,
    score,
    playerKills,
    userProfile?.id,
    playerPosition,
  ]);

  return {
    settings,
    currentWeapon,
    hotbar,
    targets,
    npcs,
    isGameRunning,
    isShowLobby,
    setIsShowLobby,
    isGamePaused,
    isSettingsOpen,
    gameMode,
    showMainMenu,
    showPostGameSummary,
    score,
    accuracy,
    timeLeft,
    shotsFired,
    hits,
    resumeCountdown,
    isMultiplayer,
    npcCount,
    setSettings,
    setCurrentWeapon,
    setTargets,
    setNPCs,
    setIsGameRunning,
    setIsGamePaused,
    setIsSettingsOpen,
    setGameMode,
    setShowMainMenu,
    setShowPostGameSummary,
    setScore,
    setAccuracy,
    setTimeLeft,
    setShotsFired,
    setHits,
    setResumeCountdown,
    setIsMultiplayer,
    setNpcCount,
    resetGameState,
    handlePostGameAction,
    startGame,
    togglePause,
    openSettings,
    endGame,
    handleSettingsChange,
    handleTargetHit,
    handleNPCHit,
    handleShoot,
    setTimeOfDay,
    setWeatherCondition,
    handleWeaponSwitch,
    cycleWeapon,
    playerRankings,
    playerPosition,
    playerRotation,
    playerHealth,
    playerMaxHealth,
    playerTeam,
    setPlayerPosition,
    setPlayerRotation,
    handlePlayerDamage,
  };
};
