import React from 'react';
import { Play, RotateCcw, Settings, LogOut } from 'lucide-react';
import Image from 'next/image';

interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
  onSettings: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  onResume,
  onRestart,
  onQuit,
  onSettings,
}) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-gray-800 p-8 text-white shadow-2xl">
        <div className="mb-6 flex justify-center">
          <Image
            src="/aimtrain-biglogo.png"
            alt="Aim Trainer Logo"
            className="inverted-logo h-auto w-full max-w-[200px]"
            width={200}
            height={100}
          />
        </div>

        <h2 className="mb-8 text-center text-4xl font-bold text-yellow-400">Game Paused</h2>

        <div className="space-y-4">
          <PauseMenuButton onClick={onResume} icon={Play} color="blue" label="Resume" />
          <PauseMenuButton onClick={onRestart} icon={RotateCcw} color="green" label="Restart" />
          <PauseMenuButton onClick={onSettings} icon={Settings} color="yellow" label="Settings" />
          <PauseMenuButton onClick={onQuit} icon={LogOut} color="red" label="Quit" />
        </div>
      </div>
    </div>
  );
};

interface PauseMenuButtonProps {
  onClick: () => void;
  icon: React.ElementType;
  color: string;
  label: string;
}

const PauseMenuButton: React.FC<PauseMenuButtonProps> = ({ onClick, icon: Icon, color, label }) => (
  <button
    className={`w-full bg-${color}-600 hover:bg-${color}-700 transform rounded-lg px-6 py-3 font-bold text-white transition duration-200 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-${color}-500 flex items-center justify-center focus:ring-opacity-50`}
    onClick={onClick}
  >
    <Icon className="mr-3" size={24} />
    <span className="text-lg">{label}</span>
  </button>
);
