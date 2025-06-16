import React, { useState } from 'react';
import { BACKGROUND_PROMPTS } from '../constants/backgroundPrompts.js';

/**
 * BackgroundPromptSelector Component
 * Displays categorized background prompts for users to select from
 */
function BackgroundPromptSelector({ onPromptSelect, onCustomPrompt, isLoading = false }) {
  const [selectedCategory, setSelectedCategory] = useState('Lifestyle');
  const [customPrompt, setCustomPrompt] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const selectedCategoryData = BACKGROUND_PROMPTS.find(cat => cat.category === selectedCategory);

  const handlePromptClick = (prompt) => {
    if (!isLoading) {
      onPromptSelect(prompt.prompt, prompt.description);
    }
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (customPrompt.trim() && !isLoading) {
      onCustomPrompt(customPrompt.trim());
      setCustomPrompt('');
      setShowCustomInput(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Background Styles
        </h3>
        <button
          type="button"
          onClick={() => setShowCustomInput(!showCustomInput)}
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          disabled={isLoading}
        >
          {showCustomInput ? 'Use Presets' : 'Custom Prompt'}
        </button>
      </div>

      {showCustomInput ? (
        // Custom prompt input
        <form onSubmit={handleCustomSubmit} className="space-y-4">
          <div>
            <label htmlFor="custom-prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Describe your ideal background
            </label>
            <textarea
              id="custom-prompt"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g., cozy coffee shop with warm lighting and wooden tables"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!customPrompt.trim() || isLoading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? 'Processing...' : 'Apply Custom Background'}
            </button>
            <button
              type="button"
              onClick={() => setShowCustomInput(false)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        // Preset prompts
        <>
          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {BACKGROUND_PROMPTS.map((category) => (
              <button
                key={category.category}
                onClick={() => setSelectedCategory(category.category)}
                disabled={isLoading}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.category
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {category.category}
              </button>
            ))}
          </div>

          {/* Prompt grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {selectedCategoryData?.prompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handlePromptClick(prompt)}
                disabled={isLoading}
                className={`text-left p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0" role="img" aria-label={prompt.description}>
                    {prompt.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300 mb-1">
                      {prompt.description}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {prompt.prompt}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Processing indicator */}
      {isLoading && (
        <div className="mt-4 flex items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 dark:border-blue-400 mr-3"></div>
          <span className="text-blue-700 dark:text-blue-300 font-medium">
            Processing background change...
          </span>
        </div>
      )}
    </div>
  );
}

export default BackgroundPromptSelector; 