'use client';

import { useState, useEffect } from 'react';
import { GameSettings, UserProfile } from '../types';
import Game from '@/components/Game';
import { loadUserProfile } from '@/utils/profileUtils';

export default function Home() {
  const defaultSettings: GameSettings = {
    // targetPosition: { x: 0, y: 0, z: 0 },
    sensitivity: 1,
    volume: 0.5,
    fov: 85,
    difficulty: 'medium',
    speed: 5,
    graphicsQuality: 1,
    gravity: 9.8,
    crosshairStyle: 'default',
    crosshairColor: '#42f56f',
    colorblindMode: 'none',
    bulletTrailEnabled: true,
    targetSpeed: 1,
    targetMovementRange: 5,
    timeOfDay: 'day',
    weatherCondition: 'clear',
    npcCount: 0,
    npcDifficulty: 'medium',
    npcShootBack: false,
    npcMovementSpeed: 3,
    npcAccuracy: 0.5,
    npcReactionTime: 1000,
    npcTeamMode: false,
    npcWeaponChangeProbability: 0.1,
  };

  const [gameSettings, setGameSettings] = useState<GameSettings>(defaultSettings);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const profile = loadUserProfile();
    if (profile) {
      setUserProfile(profile);
      setGameSettings(profile.settings);
    }
  }, []);

  useEffect(() => {
    if (userProfile) {
      setGameSettings(userProfile.settings);
    }
  }, [userProfile]);

  return (
    <div className="relative min-h-screen w-screen overflow-hidden">
      <div className="absolute inset-0">
        <Game
          initialSettings={gameSettings}
          userProfile={userProfile}
          onProfileUpdate={setUserProfile}
          isMultiplayer={false}
        />
      </div>
    </div>
  );
}
