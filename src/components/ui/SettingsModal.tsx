import React, { useEffect, useState, useCallback } from 'react'
import { GameSettings, SettingsModalProps, UserProfile, Difficulty } from '../../types'
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
  Save
} from 'lucide-react'
import { renderCrosshair } from './HUD'

const CrosshairPreview: React.FC<{ style: string }> = ({ style }) => {
  return (
    <div className="w-16 h-16 ml-8 bg-gray-800 rounded-lg flex items-center justify-center">
      {renderCrosshair(style)}
    </div>
  )
}

const CustomSlider: React.FC<{
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  label: string;
  id: string;
  icon: React.ReactNode;
}> = ({ value, min, max, step, onChange, label, id, icon }) => {
  return (
    <div className="flex items-center mb-4 bg-gray-50 p-3 rounded-lg">
      <div className="flex items-center w-48 mr-4">
        {icon}
        <label htmlFor={id} className="ml-2 text-sm font-medium text-gray-700">
          {label}
        </label>
      </div>
      <div className="flex-grow flex items-center">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
        />
        <span className="ml-4 text-sm font-semibold text-blue-700 w-12 text-right">
          {value.toFixed(2)}
        </span>
      </div>
    </div>
  )
}

const CustomSelect: React.FC<{
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  label: string;
  id: string;
  icon: React.ReactNode;
}> = ({ value, options, onChange, label, id, icon }) => {
  return (
    <div className="flex items-center mb-4 bg-gray-50 p-3 rounded-lg">
      <div className="flex items-center w-48 mr-4">
        {icon}
        <label htmlFor={id} className="ml-2 text-sm font-medium text-gray-700">
          {label}
        </label>
      </div>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-grow p-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

const CustomSwitch: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  id: string;
  icon: React.ReactNode;
}> = ({ checked, onChange, label, id, icon }) => {
  return (
    <div className="flex items-center justify-between mb-4 bg-gray-50 p-3 rounded-lg">
      <div className="flex items-center">
        {icon}
        <label htmlFor={id} className="ml-2 text-sm font-medium text-gray-700">
          {label}
        </label>
      </div>
      <div className="relative inline-flex items-center cursor-pointer">
        <input
          id={id}
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
      </div>
    </div>
  )
}

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  userProfile,
  onProfileUpdate
}: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<GameSettings>(settings)
  const [activeTab, setActiveTab] = useState<'gameplay' | 'graphics' | 'audio'>('gameplay')

  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings)
    }
  }, [isOpen, settings])

  const handleChange = useCallback((name: string, value: string | number | boolean) => {
    setLocalSettings((prev) => ({ ...prev, [name]: value }))
    onSettingsChange({ [name]: value })
  }, [onSettingsChange])

  const handleClose = useCallback(() => {
    if (userProfile) {
      const updatedProfile: UserProfile = {
        ...userProfile,
        settings: localSettings,
      }
      onProfileUpdate(updatedProfile)
    }
    onClose()
  }, [userProfile, localSettings, onProfileUpdate, onClose])

  const handleReset = useCallback(() => {
    setLocalSettings(settings)
  }, [settings])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl h-[80vh] overflow-hidden flex flex-col shadow-xl">
        <div className="p-6 bg-gray-100 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Game Settings</h2>
        </div>
        <div className="flex-grow flex flex-col overflow-hidden">
          <div className="flex border-b border-gray-200">
            {(['gameplay', 'graphics', 'audio'] as const).map((tab) => (
              <button
                key={tab}
                className={`flex-1 px-4 py-3 font-medium text-sm focus:outline-none transition-colors ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-500 text-blue-700 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex-grow overflow-y-auto p-6 bg-white">
            <div className="space-y-2 min-h-[400px]">
              {activeTab === 'gameplay' && (
                <>
                  <CustomSlider
                    id="sensitivity"
                    label="Mouse Sensitivity"
                    value={localSettings.sensitivity}
                    min={0.1}
                    max={5}
                    step={0.1}
                    onChange={(value) => handleChange('sensitivity', value)}
                    icon={<Mouse size={18} className="text-gray-500" />}
                  />
                  <CustomSelect
                    id="difficulty"
                    label="Difficulty"
                    value={localSettings.difficulty}
                    options={[
                      { value: 'easy', label: 'Easy' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'hard', label: 'Hard' },
                    ]}
                    onChange={(value) => handleChange('difficulty', value as Difficulty)}
                    icon={<Gamepad2 size={18} className="text-gray-500" />}
                  />
                  <CustomSlider
                    id="speed"
                    label="Movement Speed"
                    value={localSettings.speed}
                    min={1}
                    max={10}
                    step={0.1}
                    onChange={(value) => handleChange('speed', value)}
                    icon={<Gauge size={18} className="text-gray-500" />}
                  />
                  <CustomSlider
                    id="gravity"
                    label="Gravity"
                    value={localSettings.gravity}
                    min={1}
                    max={20}
                    step={0.1}
                    onChange={(value) => handleChange('gravity', value)}
                    icon={<ArrowDown size={18} className="text-gray-500" />}
                  />
                  <CustomSlider
                    id="targetSpeed"
                    label="Target Speed"
                    value={localSettings.targetSpeed}
                    min={0.5}
                    max={3}
                    step={0.1}
                    onChange={(value) => handleChange('targetSpeed', value)}
                    icon={<Activity size={18} className="text-gray-500" />}
                  />
                  <CustomSlider
                    id="targetMovementRange"
                    label="Target Movement Range"
                    value={localSettings.targetMovementRange}
                    min={1}
                    max={10}
                    step={0.1}
                    onChange={(value) => handleChange('targetMovementRange', value)}
                    icon={<Target size={18} className="text-gray-500" />}
                  />
                </>
              )}
              {activeTab === 'graphics' && (
                <>
                  <CustomSlider
                    id="fov"
                    label="Field of View"
                    value={localSettings.fov}
                    min={60}
                    max={120}
                    step={1}
                    onChange={(value) => handleChange('fov', value)}
                    icon={<Eye size={18} className="text-gray-500" />}
                  />
                  <CustomSlider
                    id="graphicsQuality"
                    label="Graphics Quality"
                    value={localSettings.graphicsQuality}
                    min={1}
                    max={5}
                    step={1}
                    onChange={(value) => handleChange('graphicsQuality', value)}
                    icon={<Paintbrush size={18} className="text-gray-500" />}
                  />
<div className="flex items-center mb-4 bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center w-48 mr-4">
                      <Crosshair size={18} className="text-gray-500" />
                      <label htmlFor="crosshairStyle" className="ml-2 text-sm font-medium text-gray-700">
                        Crosshair Style
                      </label>
                    </div>
                    <select
                      id="crosshairStyle"
                      value={localSettings.crosshairStyle}
                      onChange={(e) => handleChange('crosshairStyle', e.target.value)}
                      className="flex-grow p-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="default">Default</option>
                      <option value="dot">Dot</option>
                      <option value="cross">Cross</option>
                      <option value="circle">Circle</option>
                    </select>
                    <CrosshairPreview style={localSettings.crosshairStyle} />
                  </div>
                  <CustomSelect
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
                    icon={<Palette size={18} className="text-gray-500" />}
                  />
                  <CustomSwitch
                    id="bulletTrailEnabled"
                    label="Enable Bullet Trails"
                    checked={localSettings.bulletTrailEnabled}
                    onChange={(checked) => handleChange('bulletTrailEnabled', checked)}
                    icon={<Zap size={18} className="text-gray-500" />}
                  />
                </>
              )}
              {activeTab === 'audio' && (
                <>
                  <CustomSlider
                    id="volume"
                    label="Master Volume"
                    value={localSettings.volume}
                    min={0}
                    max={1}
                    step={0.01}
                    onChange={(value) => handleChange('volume', value)}
                    icon={<Volume2 size={18} className="text-gray-500" />}
                  />
                </>
              )}
            </div>
          </div>
        </div>
        <div className="p-6 bg-gray-100 border-t border-gray-200 flex justify-between">
          <button
            onClick={handleReset}
            className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-colors"
          >
            <RotateCcw size={16} className="mr-2" />
            Reset to Defaults
          </button>
          <div className='flex flex-row gap-4'>
            <button
              onClick={onClose}
              className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-colors mr-2"
            >
              <X size={16} className="mr-2" />
              Cancel
            </button>
            <button
              onClick={handleClose}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
            >
              <Save size={16} className="mr-2" />
              Save & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}