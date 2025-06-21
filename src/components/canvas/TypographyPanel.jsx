import React, { useState, useEffect } from 'react';
import { 
  TEXT_STYLES, 
  FONT_FAMILIES, 
  FONT_WEIGHTS, 
  TEXT_ALIGNMENTS, 
  TEXT_EFFECTS,
  BRAND_COLORS,
  getTextStylesByCategory,
  getFontsByCategory,
  getGoogleFonts,
  generateGoogleFontsUrl
} from '../../constants/textStyles.js';

/**
 * TypographyPanel Component
 * Advanced typography controls for text elements
 * Part of Phase 3: Interactive Text System
 */
function TypographyPanel({ 
  selectedElement, 
  onStyleChange, 
  onApplyPreset 
}) {
  const [activeTab, setActiveTab] = useState('styles');
  const [selectedFont, setSelectedFont] = useState(null);

  // Load Google Fonts when component mounts
  useEffect(() => {
    const googleFonts = getGoogleFonts();
    if (googleFonts.length > 0) {
      const fontUrl = generateGoogleFontsUrl(googleFonts);
      
      // Check if link already exists
      if (!document.querySelector(`link[href="${fontUrl}"]`)) {
        const link = document.createElement('link');
        link.href = fontUrl;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
    }
  }, []);

  if (!selectedElement || (selectedElement.type !== 'text' && selectedElement.type !== 'button')) {
    return (
      <div className="p-4 text-center text-gray-500">
        <div className="text-4xl mb-2">🔤</div>
        <h3 className="font-medium mb-1">Typography Controls</h3>
        <p className="text-sm">Select a text element to access typography options</p>
      </div>
    );
  }

  const handleStyleChange = (property, value) => {
    onStyleChange(property, value);
  };

  const applyPreset = (preset) => {
    onApplyPreset({
      ...preset,
      // Preserve current content and position
      content: selectedElement.content,
      position: selectedElement.position,
      size: selectedElement.size
    });
  };

  const tabs = [
    { id: 'styles', label: 'Styles', icon: '🎨' },
    { id: 'fonts', label: 'Fonts', icon: '🔤' },
    { id: 'effects', label: 'Effects', icon: '✨' },
    { id: 'spacing', label: 'Spacing', icon: '📏' }
  ];

  return (
    <div className="h-full bg-white">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4 overflow-y-auto">
        {/* Text Style Presets Tab */}
        {activeTab === 'styles' && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-800">Text Style Presets</h3>
            
            {/* Headlines */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Headlines</h4>
              <div className="space-y-2">
                {getTextStylesByCategory('headline').map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div 
                      className="font-medium mb-1"
                      style={{
                        fontFamily: preset.fontFamily,
                        fontSize: '14px', // Scaled for preview
                        fontWeight: preset.fontWeight,
                        color: preset.color
                      }}
                    >
                      {preset.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {preset.fontSize} • {preset.fontWeight}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Body Text */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Body Text</h4>
              <div className="space-y-2">
                {getTextStylesByCategory('body').map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div 
                      className="mb-1"
                      style={{
                        fontFamily: preset.fontFamily,
                        fontSize: '12px', // Scaled for preview
                        fontWeight: preset.fontWeight,
                        color: preset.color
                      }}
                    >
                      {preset.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {preset.fontSize} • {preset.fontWeight}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Button Text */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Buttons</h4>
              <div className="space-y-2">
                {getTextStylesByCategory('button').map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div 
                      className="mb-1"
                      style={{
                        fontFamily: preset.fontFamily,
                        fontSize: '12px', // Scaled for preview
                        fontWeight: preset.fontWeight,
                        color: preset.color
                      }}
                    >
                      {preset.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {preset.fontSize} • {preset.fontWeight}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Font Selection Tab */}
        {activeTab === 'fonts' && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-800">Font Selection</h3>

            {/* Font Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Size
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="8"
                  max="72"
                  value={parseInt(selectedElement.styles.fontSize)}
                  onChange={(e) => handleStyleChange('fontSize', `${e.target.value}px`)}
                  className="flex-1"
                />
                <input
                  type="number"
                  min="8"
                  max="72"
                  value={parseInt(selectedElement.styles.fontSize)}
                  onChange={(e) => handleStyleChange('fontSize', `${e.target.value}px`)}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <span className="text-sm text-gray-500">px</span>
              </div>
            </div>

            {/* Font Family */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Family
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {Object.values(FONT_FAMILIES).map(font => (
                  <button
                    key={font.name}
                    onClick={() => {
                      handleStyleChange('fontFamily', font.value);
                      setSelectedFont(font);
                    }}
                    className={`w-full p-2 text-left border rounded-lg transition-colors ${
                      selectedElement.styles.fontFamily === font.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div 
                      className="font-medium text-sm"
                      style={{ fontFamily: font.value }}
                    >
                      {font.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {font.category} {font.googleFont && '• Google Font'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Weight
              </label>
              <select
                value={selectedElement.styles.fontWeight}
                onChange={(e) => handleStyleChange('fontWeight', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {FONT_WEIGHTS.map(weight => (
                  <option key={weight.value} value={weight.value}>
                    {weight.label} ({weight.value})
                  </option>
                ))}
              </select>
            </div>

            {/* Text Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text Color
              </label>
              <div className="space-y-3">
                {/* Color picker */}
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={selectedElement.styles.color}
                    onChange={(e) => handleStyleChange('color', e.target.value)}
                    className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={selectedElement.styles.color}
                    onChange={(e) => handleStyleChange('color', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="#000000"
                  />
                </div>
                
                {/* Brand colors */}
                <div>
                  <div className="text-xs text-gray-600 mb-2">Brand Colors</div>
                  <div className="grid grid-cols-5 gap-2">
                    {BRAND_COLORS.map(color => (
                      <button
                        key={color.name}
                        onClick={() => handleStyleChange('color', color.value)}
                        className="w-8 h-8 rounded border border-gray-300 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Text Alignment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text Alignment
              </label>
              <div className="flex space-x-2">
                {TEXT_ALIGNMENTS.map(alignment => (
                  <button
                    key={alignment.value}
                    onClick={() => handleStyleChange('textAlign', alignment.value)}
                    className={`flex-1 py-2 text-sm rounded ${
                      selectedElement.styles.textAlign === alignment.value
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    title={alignment.label}
                  >
                    {alignment.icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Text Effects Tab */}
        {activeTab === 'effects' && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-800">Text Effects</h3>

            {/* Text Effects Presets */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shadow Effects
              </label>
              <div className="space-y-2">
                {Object.values(TEXT_EFFECTS).map(effect => (
                  <button
                    key={effect.id}
                    onClick={() => {
                      if (effect.styles.textShadow) {
                        handleStyleChange('textShadow', effect.styles.textShadow);
                      } else {
                        handleStyleChange('textShadow', 'none');
                      }
                    }}
                    className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div 
                      className="font-medium mb-1"
                      style={{
                        ...effect.styles,
                        color: selectedElement.styles.color
                      }}
                    >
                      {effect.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Text Decoration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text Decoration
              </label>
              <div className="flex space-x-2">
                {['none', 'underline', 'line-through'].map(decoration => (
                  <button
                    key={decoration}
                    onClick={() => handleStyleChange('textDecoration', decoration)}
                    className={`flex-1 py-2 text-sm rounded ${
                      selectedElement.styles.textDecoration === decoration
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span style={{ textDecoration: decoration }}>
                      {decoration === 'none' ? 'None' : 
                       decoration === 'line-through' ? 'Strike' : 'Under'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Style */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Style
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleStyleChange('fontStyle', 'normal')}
                  className={`flex-1 py-2 text-sm rounded ${
                    selectedElement.styles.fontStyle === 'normal'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Normal
                </button>
                <button
                  onClick={() => handleStyleChange('fontStyle', 'italic')}
                  className={`flex-1 py-2 text-sm rounded ${
                    selectedElement.styles.fontStyle === 'italic'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <em>Italic</em>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Spacing Tab */}
        {activeTab === 'spacing' && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-800">Text Spacing</h3>

            {/* Line Height */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Line Height
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="0.8"
                  max="3"
                  step="0.1"
                  value={selectedElement.styles.lineHeight || 1.4}
                  onChange={(e) => handleStyleChange('lineHeight', parseFloat(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 w-8">
                  {(selectedElement.styles.lineHeight || 1.4).toFixed(1)}
                </span>
              </div>
            </div>

            {/* Letter Spacing */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Letter Spacing
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="-2"
                  max="5"
                  step="0.25"
                  value={parseFloat(selectedElement.styles.letterSpacing) || 0}
                  onChange={(e) => handleStyleChange('letterSpacing', `${e.target.value}px`)}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 w-12">
                  {parseFloat(selectedElement.styles.letterSpacing) || 0}px
                </span>
              </div>
            </div>

            {/* Word Spacing */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Word Spacing
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="-5"
                  max="20"
                  step="1"
                  value={parseFloat(selectedElement.styles.wordSpacing) || 0}
                  onChange={(e) => handleStyleChange('wordSpacing', `${e.target.value}px`)}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 w-12">
                  {parseFloat(selectedElement.styles.wordSpacing) || 0}px
                </span>
              </div>
            </div>

            {/* Text Transform */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text Transform
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['none', 'uppercase', 'lowercase', 'capitalize'].map(transform => (
                  <button
                    key={transform}
                    onClick={() => handleStyleChange('textTransform', transform)}
                    className={`py-2 text-sm rounded ${
                      selectedElement.styles.textTransform === transform
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span style={{ textTransform: transform }}>
                      {transform === 'none' ? 'None' : transform}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TypographyPanel; 