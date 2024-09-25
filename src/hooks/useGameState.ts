import { useState, useCallback, useEffect } from 'react';
import { GameSettings, GameMode, UserProfile, TargetData, WeaponType, TimeOfDay, WeatherCondition, Hotkey, HotbarSlot, NPCData } from '../types';
import { generateRandomTargets, updateTargetPositions, regenerateTarget } from '../utils/targetUtils';
import { hotbarConfig } from '../config/hotbarConfig';

// ... (keep the existing helper functions)
const generateRandomNPCs = (count: number, settings: GameSettings): NPCData[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: `npc-${index}`,
    position: [Math.random() * 100 - 50, 0, Math.random() * 100 - 50],
    rotation: [0, Math.random() * 360, 0], // Example rotation, adjust as needed
    health: 100,
    maxHealth: 100,
    weapon: "Pistol",
    state: "idle",
    speed: 1,
    lastShootTime: Date.now(),
    shootInterval: 1000,
    movementTarget: [Math.random() * 100 - 50, 0, Math.random() * 100 - 50],
}));
};

// Define fetchPlayerRankings if not imported
async function fetchPlayerRankings(): Promise<UserProfile[]> {
  // Fetch logic here
  // Example mock implementation:
  return [
      { id: '1', username: 'player1', highScore: 1000, settings: {} as GameSettings },
      { id: '2', username: 'player2', highScore: 900, settings: {} as GameSettings },
      // Add more mock user profiles
  ];
}

const transformRankings = (profiles: UserProfile[]) => {
  return profiles.map(profile => ({
      id: profile.id,
      username: profile.username,
      score: profile.highScore, // Use highScore as score
  }));
};
export const useGameState = (initialSettings: GameSettings, userProfile: UserProfile | null, onProfileUpdate: (profile: UserProfile) => void) => {
  const [settings, setSettings] = useState<GameSettings>(initialSettings);
  const [currentWeapon, setCurrentWeapon] = useState<WeaponType>('Pistol');
  const [hotbar, setHotbar] = useState<HotbarSlot[]>(hotbarConfig);
  const [targets, setTargets] = useState<TargetData[]>([]);
  const [npcs, setNPCs] = useState<NPCData[]>([]);
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
  const [playerRankings, setPlayerRankings] = useState<{ id: string, username: string, score: number }[]>([]);  // Adjusted type


  const [playerPosition, setPlayerPosition] = useState<[number, number, number]>([0, 1.6, 0]);
  const [playerRotation, setPlayerRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [playerMaxHealth] = useState(100);

  const handleWeaponSwitch = useCallback((key: Hotkey) => {
    const slot = hotbar.find(h => h.key === key);
    if (slot) {
      setCurrentWeapon(slot.weapon);
    }
  }, [hotbar]);

  const cycleWeapon = useCallback((direction: 'next' | 'prev') => {
    const currentIndex = hotbar.findIndex(slot => slot.weapon === currentWeapon);
    let newIndex;
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % hotbar.length;
    } else {
      newIndex = (currentIndex - 1 + hotbar.length) % hotbar.length;
    }
    setCurrentWeapon(hotbar[newIndex].weapon);
  }, [hotbar, currentWeapon]);

  const resetGameState = useCallback((selectedMode: GameMode) => {
    setGameMode(selectedMode);
    setScore(0);
    setAccuracy(100);
    setTimeLeft(selectedMode === 'endurance' ? Infinity : 60);
    setShotsFired(0);
    setHits(0);
    setTargets(generateRandomTargets(settings, 10));
    setNPCs(generateRandomNPCs(settings.npcCount, settings));
  }, [settings]);

  const startGame = useCallback((selectedMode: GameMode) => {
    resetGameState(selectedMode);
    setIsGameRunning(true);
    setIsGamePaused(false);
    setShowMainMenu(false);
    setShowPostGameSummary(false);
  }, [resetGameState]);

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
    const transformedRankings = transformRankings(fetchedRankings);
    setPlayerRankings(transformedRankings);
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
  }, [score, userProfile, settings, onProfileUpdate]);

  const handleSettingsChange = useCallback((updatedSettings: Partial<GameSettings>) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      ...updatedSettings,
    }));
  }, []);

  const handleTargetHit = useCallback((targetId: string, hitScore: number) => {
    setScore((prevScore) => prevScore + Math.floor(hitScore));
    setHits((prevHits) => prevHits + 1);
    setTargets((prevTargets) => {
      const newTargets = prevTargets.filter((t) => t.id !== targetId);
      return [...newTargets, regenerateTarget(settings)];
    });
  }, [settings]);

  const handleNPCHit = useCallback((npcId: string, hitScore: number) => {
    setScore((prevScore) => prevScore + Math.floor(hitScore));
    setHits((prevHits) => prevHits + 1);
    setNPCs((prevNPCs) => {
      return prevNPCs.map((npc) => {
        if (npc.id === npcId) {
          const newHealth = Math.max(0, npc.health - hitScore);
          return { ...npc, health: newHealth };
        }
        return npc;
      });
    });
  }, []);

  const handleShoot = useCallback(() => {
    setShotsFired((prev) => prev + 1);
  }, []);

  const setTimeOfDay = useCallback((newTimeOfDay: TimeOfDay) => {
    handleSettingsChange({ timeOfDay: newTimeOfDay });
  }, [handleSettingsChange]);

  const setWeatherCondition = useCallback((newWeatherCondition: WeatherCondition) => {
    handleSettingsChange({ weatherCondition: newWeatherCondition });
  }, [handleSettingsChange]);

  useEffect(() => {
    if (shotsFired > 0) {
      setAccuracy((hits / shotsFired) * 100);
    }
  }, [shotsFired, hits]);

  useEffect(() => {
    if (isGameRunning && !isGamePaused && gameMode === 'timed') {
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
        setTargets((prevTargets) => 
          updateTargetPositions(prevTargets, settings.targetSpeed, settings.targetMovementRange)
        );
        // Update NPC positions and states here
        setNPCs((prevNPCs) => {
          return prevNPCs.map((npc) => {
            // Implement NPC movement and state changes based on settings.npcDifficulty
            // This is a placeholder and should be replaced with actual AI logic
            const newX = npc.position[0] + (Math.random() - 0.5) * settings.targetSpeed;
            const newZ = npc.position[2] + (Math.random() - 0.5) * settings.targetSpeed;
            return {
              ...npc,
              position: [newX, 0, newZ],
              state: Math.random() > 0.8 ? 'attacking' : 'moving',
            };
          });
        });
      }, 1000 / 60); // 60 FPS update rate

      return () => clearInterval(updateInterval);
    }
  }, [isGameRunning, isGamePaused, settings.targetSpeed, settings.targetMovementRange, settings.npcDifficulty]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const pressedKey = event.key as Hotkey;
      if (hotbar.some(slot => slot.key === pressedKey)) {
        handleWeaponSwitch(pressedKey);
      }
    };

    const handleWheel = (event: WheelEvent) => {
      if (isGameRunning && !isGamePaused) {
        if (event.deltaY < 0) {
          cycleWeapon('prev');
        } else {
          cycleWeapon('next');
        }
      }
    };
  
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [handleWeaponSwitch, cycleWeapon, hotbar, isGameRunning, isGamePaused]);

  const handlePlayerMove = useCallback((newPosition: [number, number, number]) => {
    setPlayerPosition(newPosition);
  }, []);

  const handlePlayerRotate = useCallback((newRotation: [number, number, number]) => {
    setPlayerRotation(newRotation);
  }, []);

  const handlePlayerDamage = useCallback((damage: number) => {
    setPlayerHealth((prevHealth) => Math.max(0, prevHealth - damage));
  }, []);


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
    resetGameState,
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
    setPlayerPosition: handlePlayerMove,
    setPlayerRotation: handlePlayerRotate,
    handlePlayerDamage,
  };
};