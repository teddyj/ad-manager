import React, { useState } from 'react';
import { CogIcon, SparklesIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { isOpenAIAvailable, clearCopyCache, getCacheSize } from '../services/aiCopyService';

const AICopySettings = ({ settings, onSettingsChange, className = '' }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const isAIAvailable = isOpenAIAvailable();

  const handleSettingChange = (key, value) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  const handleClearCache = () => {
    clearCopyCache();
    // Show a brief notification or update UI
    alert('AI copy cache cleared!');
  };

  if (!isAIAvailable) {
    return (
      <div className={`bg-amber-50 border border-amber-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <SparklesIcon className="h-5 w-5 text-amber-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-amber-800">
              AI Copy Generation Unavailable
            </h3>
            <div className="mt-2 text-sm text-amber-700">
              <p>OpenAI API key not configured. Using template-based copy generation.</p>
              <p className="mt-1">
                Add <code className="bg-amber-100 px-1 rounded">VITE_OPENAI_API_KEY</code> to your environment variables to enable AI-powered copy.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <SparklesIcon className="h-5 w-5 text-purple-500 mr-2" />
            <h3 className="text-sm font-medium text-gray-900">AI Copy Settings</h3>
          </div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            {showAdvanced ? 'Simple' : 'Advanced'}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Creativity Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Creativity Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['low', 'medium', 'high'].map((level) => (
              <button
                key={level}
                onClick={() => handleSettingChange('creativity', level)}
                className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                  settings.creativity === level
                    ? 'bg-purple-50 border-purple-200 text-purple-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {settings.creativity === 'low' && 'Straightforward, clear language'}
            {settings.creativity === 'medium' && 'Balanced creativity and clarity'}
            {settings.creativity === 'high' && 'Bold, creative language'}
          </p>
        </div>

        {/* Tone Override */}
        {showAdvanced && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tone Override
            </label>
            <select
              value={settings.tone || ''}
              onChange={(e) => handleSettingChange('tone', e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Auto (platform-based)</option>
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
              <option value="urgent">Urgent</option>
              <option value="luxurious">Luxurious</option>
              <option value="playful">Playful</option>
              <option value="authoritative">Authoritative</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Override the automatic tone selection based on platform
            </p>
          </div>
        )}

        {/* Focus Keywords */}
        {showAdvanced && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Focus Keywords
            </label>
            <input
              type="text"
              value={settings.keywords || ''}
              onChange={(e) => handleSettingChange('keywords', e.target.value)}
              placeholder="e.g., premium, fast, reliable"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">
              Comma-separated keywords to emphasize in generated copy
            </p>
          </div>
        )}

        {/* Model Selection */}
        {showAdvanced && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AI Model
            </label>
            <select
              value={settings.model || 'gpt-4o-mini'}
              onChange={(e) => handleSettingChange('model', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="gpt-4o-mini">GPT-4o Mini (Recommended)</option>
              <option value="gpt-4o">GPT-4o (More Creative)</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster)</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Different models offer varying levels of creativity and speed
            </p>
          </div>
        )}

        {/* Cache Management */}
        {showAdvanced && (
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Cache Management</h4>
                <p className="text-xs text-gray-500">
                  {getCacheSize()} items cached to improve performance
                </p>
              </div>
              <button
                onClick={handleClearCache}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                Clear Cache
              </button>
            </div>
          </div>
        )}

        {/* Status Indicator */}
        <div className="flex items-center text-xs text-gray-500">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            AI Copy Generation Active
          </div>
          <ChatBubbleLeftIcon className="h-4 w-4 ml-auto" />
        </div>
      </div>
    </div>
  );
};

export default AICopySettings; 