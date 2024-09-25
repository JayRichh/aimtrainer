import React, { useEffect, useState, useCallback } from 'react';
import { GameSettings, SettingsModalProps, UserProfile, Difficulty, GameMode } from '../../types';
import {
  Mouse,
  Gamepad2,
  Gauge,
  ArrowDown,
  Activity,
  Target,
  Eye,
  Paintbrush,
  Crosshair,
  Palette,
  Zap,
  Volume2,
  RotateCcw,
  X,
  Save,
  Users,
  Cpu,
  Clock,
  Users as Team,
} from 'lucide-react';
import { renderCrosshair } from './HUD';
import { ChromePicker, ColorResult } from 'react-color';
import Image from 'next/image';

const TABS = ['gameplay', 'graphics', 'audio', 'npc'] as const;
type TabType = (typeof TABS)[number];

const CrosshairPreview: React.FC<{ style: string; color: string }> = ({ style, color }) => (
  <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-gray-600 bg-gray-800">
    {renderCrosshair(style, color)}
  </div>
);

const FieldWrapper: React.FC<{
  label: string;
  id: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ label, id, icon, children }) => (
  <div className="mb-4 flex items-center">
    <div className="flex w-48 items-center">
      {icon}
      <label htmlFor={id} className="ml-2 text-lg font-medium text-white">
        {label}
      </label>
    </div>
    <div className="flex-grow">{children}</div>
  </div>
);

const SliderField: React.FC<{
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  label: string;
  id: string;
  icon: React.ReactNode;
}> = ({ value, min, max, step, onChange, label, id, icon }) => (
  <FieldWrapper label={label} id={id} icon={icon}>
    <div className="flex items-center">
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-blue-200"
      />
      <span className="ml-4 w-16 text-right text-lg font-semibold text-blue-400">
        {value.toFixed(2)}
      </span>
    </div>
  </FieldWrapper>
);

const SelectField: React.FC<{
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  label: string;
  id: string;
  icon: React.ReactNode;
}> = ({ value, options, onChange, label, id, icon }) => (
  <FieldWrapper label={label} id={id} icon={icon}>
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-gray-600 bg-gray-700 p-2 text-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </FieldWrapper>
);

const SwitchField: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  id: string;
  icon: React.ReactNode;
}> = ({ checked, onChange, label, id, icon }) => (
  <FieldWrapper label={label} id={id} icon={icon}>
    <div className="relative inline-flex cursor-pointer items-center">
      <input
        id={id}
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className="h-6 w-11 rounded-full bg-gray-600 peer-focus:ring-4 peer-focus:ring-blue-300">
        <div
          className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-full transform' : ''
          }`}
        ></div>
      </div>
    </div>
  </FieldWrapper>
);

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  userProfile,
  onProfileUpdate,
}: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<GameSettings>(settings);
  const [activeTab, setActiveTab] = useState<TabType>('gameplay');
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
    }
  }, [isOpen, settings]);

  const handleChange = useCallback(
    (name: keyof GameSettings, value: any) => {
      setLocalSettings((prev) => ({ ...prev, [name]: value }));
      onSettingsChange({ [name]: value });
    },
    [onSettingsChange],
  );

  const handleClose = useCallback(() => {
    if (userProfile) {
      const updatedProfile: UserProfile = {
        ...userProfile,
        settings: localSettings,
      };
      onProfileUpdate(updatedProfile);
    }
    onClose();
  }, [userProfile, localSettings, onProfileUpdate, onClose]);

  const handleReset = useCallback(() => {
    setLocalSettings(settings);
  }, [settings]);

  if (!isOpen) return null;

  const renderTabContent = (tab: TabType) => {
    switch (tab) {
      case 'gameplay':
        return (
          <>
            <SliderField
              id="sensitivity"
              label="Mouse Sensitivity"
              value={localSettings.sensitivity}
              min={0.1}
              max={5}
              step={0.1}
              onChange={(value) => handleChange('sensitivity', value)}
              icon={<Mouse size={20} className="text-blue-400" />}
            />
            <SelectField
              id="difficulty"
              label="Difficulty"
              value={localSettings.difficulty}
              options={[
                { value: 'easy', label: 'Easy' },
                { value: 'medium', label: 'Medium' },
                { value: 'hard', label: 'Hard' },
              ]}
              onChange={(value) => handleChange('difficulty', value as Difficulty)}
              icon={<Gamepad2 size={20} className="text-blue-400" />}
            />
            <SliderField
              id="speed"
              label="Movement Speed"
              value={localSettings.speed}
              min={1}
              max={10}
              step={0.1}
              onChange={(value) => handleChange('speed', value)}
              icon={<Gauge size={20} className="text-blue-400" />}
            />
            <SliderField
              id="gravity"
              label="Gravity"
              value={localSettings.gravity}
              min={1}
              max={20}
              step={0.1}
              onChange={(value) => handleChange('gravity', value)}
              icon={<ArrowDown size={20} className="text-blue-400" />}
            />
            <SliderField
              id="targetSpeed"
              label="Target Speed"
              value={localSettings.targetSpeed}
              min={0.5}
              max={3}
              step={0.1}
              onChange={(value) => handleChange('targetSpeed', value)}
              icon={<Activity size={20} className="text-blue-400" />}
            />
            <SliderField
              id="targetMovementRange"
              label="Target Movement Range"
              value={localSettings.targetMovementRange}
              min={1}
              max={10}
              step={0.1}
              onChange={(value) => handleChange('targetMovementRange', value)}
              icon={<Target size={20} className="text-blue-400" />}
            />
          </>
        );
      case 'graphics':
        return (
          <>
            <SliderField
              id="fov"
              label="Field of View"
              value={localSettings.fov}
              min={60}
              max={120}
              step={1}
              onChange={(value) => handleChange('fov', value)}
              icon={<Eye size={20} className="text-blue-400" />}
            />
            <SliderField
              id="graphicsQuality"
              label="Graphics Quality"
              value={localSettings.graphicsQuality}
              min={1}
              max={5}
              step={1}
              onChange={(value) => handleChange('graphicsQuality', value)}
              icon={<Paintbrush size={20} className="text-blue-400" />}
            />
            <FieldWrapper
              label="Crosshair"
              id="crosshairStyle"
              icon={<Crosshair size={20} className="text-blue-400" />}
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex space-x-4">
                  <select
                    id="crosshairStyle"
                    value={localSettings.crosshairStyle}
                    onChange={(e) => handleChange('crosshairStyle', e.target.value)}
                    className="rounded-md border border-gray-600 bg-gray-700 p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="default">Default</option>
                    <option value="dot">Dot</option>
                    <option value="cross">Cross</option>
                    <option value="circle">Circle</option>
                  </select>
                  <button
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="flex items-center space-x-2 rounded-md border border-gray-600 bg-gray-700 p-2 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <div
                      className="h-6 w-6 rounded-full border border-gray-500"
                      style={{
                        backgroundColor: localSettings.crosshairColor,
                      }}
                    ></div>
                    <span className="text-sm text-white">Pick Color</span>
                  </button>
                  {showColorPicker && (
                    <div className="absolute z-10 mt-1">
                      <ChromePicker
                        color={localSettings.crosshairColor}
                        onChange={(color: ColorResult) => handleChange('crosshairColor', color.hex)}
                      />
                    </div>
                  )}
                </div>
                <CrosshairPreview
                  style={localSettings.crosshairStyle}
                  color={localSettings.crosshairColor}
                />
              </div>
            </FieldWrapper>
            <SelectField
              id="colorblindMode"
              label="Colorblind Mode"
              value={localSettings.colorblindMode}
              options={[
                { value: 'none', label: 'None' },
                { value: 'protanopia', label: 'Protanopia' },
                { value: 'deuteranopia', label: 'Deuteranopia' },
                { value: 'tritanopia', label: 'Tritanopia' },
              ]}
              onChange={(value) => handleChange('colorblindMode', value)}
              icon={<Palette size={20} className="text-blue-400" />}
            />
            <SwitchField
              id="bulletTrailEnabled"
              label="Enable Bullet Trails"
              checked={localSettings.bulletTrailEnabled}
              onChange={(checked) => handleChange('bulletTrailEnabled', checked)}
              icon={<Zap size={20} className="text-blue-400" />}
            />
          </>
        );
      case 'audio':
        return (
          <>
            <SliderField
              id="volume"
              label="Master Volume"
              value={localSettings.volume}
              min={0}
              max={1}
              step={0.01}
              onChange={(value) => handleChange('volume', value)}
              icon={<Volume2 size={20} className="text-blue-400" />}
            />
          </>
        );
      case 'npc':
        return (
          <>
            <SliderField
              id="npcCount"
              label="NPC Count"
              value={localSettings.npcCount}
              min={0}
              max={20}
              step={1}
              onChange={(value) => handleChange('npcCount', value)}
              icon={<Users size={20} className="text-blue-400" />}
            />
            <SelectField
              id="npcDifficulty"
              label="NPC Difficulty"
              value={localSettings.npcDifficulty}
              options={[
                { value: 'easy', label: 'Easy' },
                { value: 'medium', label: 'Medium' },
                { value: 'hard', label: 'Hard' },
              ]}
              onChange={(value) => handleChange('npcDifficulty', value as Difficulty)}
              icon={<Cpu size={20} className="text-blue-400" />}
            />
            <SwitchField
              id="npcShootBack"
              label="NPCs Shoot Back"
              checked={localSettings.npcShootBack}
              onChange={(checked) => handleChange('npcShootBack', checked)}
              icon={<Zap size={20} className="text-blue-400" />}
            />
            <SliderField
              id="npcMovementSpeed"
              label="NPC Movement Speed"
              value={localSettings.npcMovementSpeed}
              min={1}
              max={10}
              step={0.1}
              onChange={(value) => handleChange('npcMovementSpeed', value)}
              icon={<Gauge size={20} className="text-blue-400" />}
            />
            <SliderField
              id="npcAccuracy"
              label="NPC Accuracy"
              value={localSettings.npcAccuracy}
              min={0}
              max={1}
              step={0.01}
              onChange={(value) => handleChange('npcAccuracy', value)}
              icon={<Target size={20} className="text-blue-400" />}
            />
            <SliderField
              id="npcReactionTime"
              label="NPC Reaction Time (ms)"
              value={localSettings.npcReactionTime}
              min={100}
              max={2000}
              step={50}
              onChange={(value) => handleChange('npcReactionTime', value)}
              icon={<Clock size={20} className="text-blue-400" />}
            />
            <SwitchField
              id="npcTeamMode"
              label="NPC Team Mode"
              checked={localSettings.npcTeamMode}
              onChange={(checked) => handleChange('npcTeamMode', checked)}
              icon={<Team size={20} className="text-blue-400" />}
            />
          </>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4">
      <div className="flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-gray-800 text-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-600 bg-gray-700 p-6">
          <h2 className="text-3xl font-bold text-yellow-400">Game Settings</h2>
          <div className="flex items-center justify-center">
            <Image
              src="/aimtrain-biglogo.png"
              alt="Aim Trainer Logo"
              className="inverted-logo h-auto w-auto"
              width={240}
              height={120}
              style={{ maxHeight: '70px', width: 'auto' }}
            />
          </div>
        </div>
        <div className="flex flex-grow flex-col overflow-hidden">
          <div className="flex border-b border-gray-600">
            {TABS.map((tab) => (
              <button
                key={tab}
                className={`flex-1 px-6 py-4 text-lg font-medium transition-colors focus:outline-none ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-500 bg-gray-700 text-blue-400'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex-grow overflow-y-auto bg-gray-800 p-6">
            <div className="space-y-6">{renderTabContent(activeTab)}</div>
          </div>
        </div>
        <div className="flex justify-between border-t border-gray-600 bg-gray-700 p-6">
          <button
            onClick={handleReset}
            className="flex items-center rounded-lg bg-gray-600 px-6 py-3 text-white transition-colors hover:bg-gray-500"
          >
            <RotateCcw size={20} className="mr-2" />
            Reset to Defaults
          </button>
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex items-center rounded-lg bg-gray-600 px-6 py-3 text-white transition-colors hover:bg-gray-500"
            >
              <X size={20} className="mr-2" />
              Cancel
            </button>
            <button
              onClick={handleClose}
              className="flex items-center rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
            >
              <Save size={20} className="mr-2" />
              Save & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
