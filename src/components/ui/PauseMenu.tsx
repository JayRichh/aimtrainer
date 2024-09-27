import React from 'react';
import { Play, RotateCcw, Settings, LogOut } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

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
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="w-full max-w-md rounded-xl bg-gray-800 p-8 text-white shadow-2xl"
        >
          <div className="mb-6 flex justify-center">
            <Image
              src="/aimtrain-biglogo.png"
              alt="Aim Trainer Logo"
              className="inverted-logo h-auto w-full max-w-[200px]"
              width={200}
              height={100}
              priority
            />
          </div>

          <h2 className="mb-8 text-center text-4xl font-bold text-yellow-400">Game Paused</h2>

          <div className="space-y-4">
            <PauseMenuButton onClick={onResume} icon={Play} color="blue" label="Resume" />
            <PauseMenuButton onClick={onRestart} icon={RotateCcw} color="green" label="Restart" />
            <PauseMenuButton onClick={onSettings} icon={Settings} color="yellow" label="Settings" />
            <PauseMenuButton onClick={onQuit} icon={LogOut} color="red" label="Quit" />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

interface PauseMenuButtonProps {
  onClick: () => void;
  icon: React.ElementType;
  color: string;
  label: string;
}

const PauseMenuButton: React.FC<PauseMenuButtonProps> = ({ onClick, icon: Icon, color, label }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
    yellow: 'from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
    red: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`flex w-full items-center justify-center rounded-lg bg-gradient-to-r px-6 py-4 font-bold text-white ${colorClasses[color as keyof typeof colorClasses]} transform transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-${color}-500 shadow-lg hover:shadow-xl focus:ring-opacity-50`}
      onClick={onClick}
    >
      <Icon className="absolute left-5" size={24} />
      <span className="text-lg">{label}</span>
    </motion.button>
  );
};
