import React, { useState, useEffect, useCallback } from 'react';

/**
 * ButtonEditor - Advanced button customization component for Phase 6
 * Provides comprehensive button styling with presets, custom colors, effects, and icons
 */

// Button Style Presets
const BUTTON_STYLES = {
  PRIMARY: {
    id: 'primary',
    name: 'Primary',
    backgroundColor: '#007bff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '12px 24px',
    fontWeight: 'bold',
    fontSize: '14px',
    boxShadow: '0 2px 4px rgba(0, 123, 255, 0.3)',
    category: 'standard'
  },
  SECONDARY: {
    id: 'secondary',
    name: 'Secondary',
    backgroundColor: 'transparent',
    color: '#007bff',
    border: '2px solid #007bff',
    borderRadius: '6px',
    padding: '10px 22px',
    fontWeight: '600',
    fontSize: '14px',
    boxShadow: 'none',
    category: 'standard'
  },
  OUTLINE: {
    id: 'outline',
    name: 'Outline',
    backgroundColor: 'transparent',
    color: '#6c757d',
    border: '1px solid #6c757d',
    borderRadius: '4px',
    padding: '8px 16px',
    fontWeight: '500',
    fontSize: '14px',
    boxShadow: 'none',
    category: 'outline'
  },
  MINIMAL: {
    id: 'minimal',
    name: 'Minimal',
    backgroundColor: 'transparent',
    color: '#007bff',
    border: 'none',
    borderRadius: '0px',
    padding: '8px 12px',
    fontWeight: '500',
    fontSize: '14px',
    boxShadow: 'none',
    textDecoration: 'underline',
    category: 'minimal'
  },
  GRADIENT: {
    id: 'gradient',
    name: 'Gradient',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontWeight: 'bold',
    fontSize: '14px',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
    category: 'premium'
  },
  SUCCESS: {
    id: 'success',
    name: 'Success',
    backgroundColor: '#28a745',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '12px 24px',
    fontWeight: 'bold',
    fontSize: '14px',
    boxShadow: '0 2px 4px rgba(40, 167, 69, 0.3)',
    category: 'status'
  },
  DANGER: {
    id: 'danger',
    name: 'Danger',
    backgroundColor: '#dc3545',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '12px 24px',
    fontWeight: 'bold',
    fontSize: '14px',
    boxShadow: '0 2px 4px rgba(220, 53, 69, 0.3)',
    category: 'status'
  },
  DARK: {
    id: 'dark',
    name: 'Dark',
    backgroundColor: '#343a40',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '12px 24px',
    fontWeight: 'bold',
    fontSize: '14px',
    boxShadow: '0 2px 4px rgba(52, 58, 64, 0.3)',
    category: 'theme'
  },
  LIGHT: {
    id: 'light',
    name: 'Light',
    backgroundColor: '#f8f9fa',
    color: '#212529',
    border: '1px solid #dee2e6',
    borderRadius: '6px',
    padding: '12px 24px',
    fontWeight: '500',
    fontSize: '14px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    category: 'theme'
  }
};

// Size Presets
const BUTTON_SIZES = {
  SMALL: {
    id: 'small',
    name: 'Small',
    padding: '6px 12px',
    fontSize: '12px',
    minWidth: '60px',
    height: '28px'
  },
  MEDIUM: {
    id: 'medium',
    name: 'Medium',
    padding: '8px 16px',
    fontSize: '14px',
    minWidth: '80px',
    height: '36px'
  },
  LARGE: {
    id: 'large',
    name: 'Large',
    padding: '12px 24px',
    fontSize: '16px',
    minWidth: '100px',
    height: '44px'
  },
  EXTRA_LARGE: {
    id: 'extraLarge',
    name: 'Extra Large',
    padding: '16px 32px',
    fontSize: '18px',
    minWidth: '120px',
    height: '52px'
  }
};

// Icon Options
const BUTTON_ICONS = {
  NONE: { id: 'none', name: 'No Icon', icon: null },
  SHOPPING_CART: { id: 'cart', name: 'Shopping Cart', icon: '🛒' },
  ARROW_RIGHT: { id: 'arrow-right', name: 'Arrow Right', icon: '→' },
  ARROW_LEFT: { id: 'arrow-left', name: 'Arrow Left', icon: '←' },
  DOWNLOAD: { id: 'download', name: 'Download', icon: '⬇️' },
  PLAY: { id: 'play', name: 'Play', icon: '▶️' },
  HEART: { id: 'heart', name: 'Heart', icon: '❤️' },
  STAR: { id: 'star', name: 'Star', icon: '⭐' },
  CHECK: { id: 'check', name: 'Check', icon: '✓' },
  PLUS: { id: 'plus', name: 'Plus', icon: '+' },
  PHONE: { id: 'phone', name: 'Phone', icon: '📞' },
  EMAIL: { id: 'email', name: 'Email', icon: '✉️' },
  SHARE: { id: 'share', name: 'Share', icon: '📤' },
  EXTERNAL_LINK: { id: 'external', name: 'External Link', icon: '🔗' }
};

function ButtonEditor({ 
  element, 
  onStyleChange, 
  onContentChange,
  onSizeChange 
}) {
  const [activeTab, setActiveTab] = useState('presets');
  const [selectedPreset, setSelectedPreset] = useState('primary');
  const [customStyles, setCustomStyles] = useState({});
  const [selectedSize, setSelectedSize] = useState('medium');
  const [selectedIcon, setSelectedIcon] = useState('none');
  const [iconPosition, setIconPosition] = useState('left');
  const [hoverEffect, setHoverEffect] = useState('opacity');

  // Initialize component state from element
  useEffect(() => {
    if (element) {
      // Try to detect current preset
      const detectedPreset = Object.values(BUTTON_STYLES).find(preset => 
        preset.backgroundColor === element.styles.backgroundColor &&
        preset.color === element.styles.color
      );
      
      if (detectedPreset) {
        setSelectedPreset(detectedPreset.id);
      }

      // Initialize custom styles
      setCustomStyles(element.styles || {});

      // Detect size
      const detectedSize = Object.values(BUTTON_SIZES).find(size => 
        size.fontSize === element.styles.fontSize
      );
      if (detectedSize) {
        setSelectedSize(detectedSize.id);
      }
    }
  }, [element]);

  // Apply preset styles
  const applyPreset = useCallback((presetId) => {
    const preset = BUTTON_STYLES[presetId.toUpperCase()];
    if (preset && onStyleChange) {
      const styles = { ...preset };
      delete styles.id;
      delete styles.name;
      delete styles.category;
      
      onStyleChange(styles);
      setSelectedPreset(presetId);
      setCustomStyles(styles);
    }
  }, [onStyleChange]);

  // Apply size preset
  const applySize = useCallback((sizeId) => {
    const size = BUTTON_SIZES[sizeId.toUpperCase()];
    if (size && onStyleChange && onSizeChange) {
      const styles = {
        padding: size.padding,
        fontSize: size.fontSize,
        minWidth: size.minWidth
      };
      
      onStyleChange(styles);
      onSizeChange({ width: parseInt(size.minWidth), height: parseInt(size.height) });
      setSelectedSize(sizeId);
    }
  }, [onStyleChange, onSizeChange]);

  // Handle custom style changes
  const handleCustomStyleChange = useCallback((property, value) => {
    const newStyles = { ...customStyles, [property]: value };
    setCustomStyles(newStyles);
    onStyleChange && onStyleChange({ [property]: value });
  }, [customStyles, onStyleChange]);

  // Handle icon selection
  const handleIconChange = useCallback((iconId) => {
    setSelectedIcon(iconId);
    const icon = BUTTON_ICONS[iconId.toUpperCase()];
    
    if (element && onContentChange) {
      const baseText = element.content.replace(/^[^\w\s]+\s*/, '').replace(/\s*[^\w\s]+$/, '');
      let newContent = baseText;
      
      if (icon && icon.icon) {
        newContent = iconPosition === 'left' 
          ? `${icon.icon} ${baseText}`
          : `${baseText} ${icon.icon}`;
      }
      
      onContentChange(newContent);
    }
  }, [element, onContentChange, iconPosition]);

  // Handle icon position change
  const handleIconPositionChange = useCallback((position) => {
    setIconPosition(position);
    if (selectedIcon !== 'none') {
      handleIconChange(selectedIcon);
    }
  }, [selectedIcon, handleIconChange]);

  // Get preset categories
  const getPresetsByCategory = (category) => {
    return Object.values(BUTTON_STYLES).filter(preset => preset.category === category);
  };

  if (!element) {
    return (
      <div className="p-4 text-center text-gray-500">
        Select a button element to customize
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Button Editor</h3>
        <div className="text-sm text-gray-500">
          Editing: {element.content || 'Button'}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'presets', name: 'Presets', icon: '🎨' },
          { id: 'custom', name: 'Custom', icon: '⚙️' },
          { id: 'effects', name: 'Effects', icon: '✨' },
          { id: 'icons', name: 'Icons', icon: '🔸' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {/* Presets Tab */}
        {activeTab === 'presets' && (
          <div className="space-y-6">
            {/* Style Presets */}
            <div>
              <h4 className="font-medium text-gray-800 mb-3">Style Presets</h4>
              
              {/* Standard Styles */}
              <div className="space-y-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-600 mb-2">Standard</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {getPresetsByCategory('standard').map(preset => (
                      <button
                        key={preset.id}
                        onClick={() => applyPreset(preset.id)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          selectedPreset === preset.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div
                          className="w-full py-2 px-3 rounded text-sm font-medium mb-2"
                          style={{
                            backgroundColor: preset.backgroundColor,
                            color: preset.color,
                            border: preset.border,
                            borderRadius: preset.borderRadius
                          }}
                        >
                          {preset.name}
                        </div>
                        <div className="text-xs text-gray-500">{preset.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Premium Styles */}
                <div>
                  <h5 className="text-sm font-medium text-gray-600 mb-2">Premium</h5>
                  <div className="grid grid-cols-1 gap-2">
                    {getPresetsByCategory('premium').map(preset => (
                      <button
                        key={preset.id}
                        onClick={() => applyPreset(preset.id)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          selectedPreset === preset.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div
                          className="w-full py-2 px-3 rounded text-sm font-medium mb-2"
                          style={{
                            background: preset.background || preset.backgroundColor,
                            color: preset.color,
                            border: preset.border,
                            borderRadius: preset.borderRadius,
                            boxShadow: preset.boxShadow
                          }}
                        >
                          {preset.name}
                        </div>
                        <div className="text-xs text-gray-500">{preset.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Styles */}
                <div>
                  <h5 className="text-sm font-medium text-gray-600 mb-2">Status Colors</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {getPresetsByCategory('status').map(preset => (
                      <button
                        key={preset.id}
                        onClick={() => applyPreset(preset.id)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          selectedPreset === preset.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div
                          className="w-full py-2 px-3 rounded text-sm font-medium mb-2"
                          style={{
                            backgroundColor: preset.backgroundColor,
                            color: preset.color,
                            border: preset.border,
                            borderRadius: preset.borderRadius
                          }}
                        >
                          {preset.name}
                        </div>
                        <div className="text-xs text-gray-500">{preset.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Size Presets */}
            <div>
              <h4 className="font-medium text-gray-800 mb-3">Size Presets</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(BUTTON_SIZES).map(size => (
                  <button
                    key={size.id}
                    onClick={() => applySize(size.id)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedSize === size.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-800">{size.name}</div>
                    <div className="text-xs text-gray-500">{size.fontSize} • {size.padding}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Custom Tab */}
        {activeTab === 'custom' && (
          <div className="space-y-4">
            {/* Background Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
              <div className="flex space-x-2">
                <input
                  type="color"
                  value={customStyles.backgroundColor || '#007bff'}
                  onChange={(e) => handleCustomStyleChange('backgroundColor', e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={customStyles.backgroundColor || '#007bff'}
                  onChange={(e) => handleCustomStyleChange('backgroundColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="#007bff"
                />
              </div>
            </div>

            {/* Text Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
              <div className="flex space-x-2">
                <input
                  type="color"
                  value={customStyles.color || '#ffffff'}
                  onChange={(e) => handleCustomStyleChange('color', e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={customStyles.color || '#ffffff'}
                  onChange={(e) => handleCustomStyleChange('color', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="#ffffff"
                />
              </div>
            </div>

            {/* Border */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Border</label>
              <input
                type="text"
                value={customStyles.border || 'none'}
                onChange={(e) => handleCustomStyleChange('border', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="1px solid #ccc or none"
              />
            </div>

            {/* Border Radius */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Border Radius: {customStyles.borderRadius || '6px'}
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={parseInt(customStyles.borderRadius) || 6}
                onChange={(e) => handleCustomStyleChange('borderRadius', `${e.target.value}px`)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Font Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Font Weight</label>
              <select
                value={customStyles.fontWeight || 'bold'}
                onChange={(e) => handleCustomStyleChange('fontWeight', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="300">Light (300)</option>
                <option value="400">Normal (400)</option>
                <option value="500">Medium (500)</option>
                <option value="600">Semi Bold (600)</option>
                <option value="bold">Bold (700)</option>
                <option value="800">Extra Bold (800)</option>
              </select>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Size: {customStyles.fontSize || '14px'}
              </label>
              <input
                type="range"
                min="10"
                max="24"
                value={parseInt(customStyles.fontSize) || 14}
                onChange={(e) => handleCustomStyleChange('fontSize', `${e.target.value}px`)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Padding */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Padding</label>
              <input
                type="text"
                value={customStyles.padding || '12px 24px'}
                onChange={(e) => handleCustomStyleChange('padding', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="12px 24px"
              />
            </div>
          </div>
        )}

        {/* Effects Tab */}
        {activeTab === 'effects' && (
          <div className="space-y-4">
            {/* Box Shadow */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Box Shadow</label>
              <select
                value={customStyles.boxShadow || 'none'}
                onChange={(e) => handleCustomStyleChange('boxShadow', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="none">No Shadow</option>
                <option value="0 1px 3px rgba(0, 0, 0, 0.1)">Light Shadow</option>
                <option value="0 2px 4px rgba(0, 0, 0, 0.1)">Medium Shadow</option>
                <option value="0 4px 6px rgba(0, 0, 0, 0.1)">Strong Shadow</option>
                <option value="0 8px 16px rgba(0, 0, 0, 0.15)">Deep Shadow</option>
                <option value="0 2px 4px rgba(0, 123, 255, 0.3)">Blue Glow</option>
                <option value="0 2px 4px rgba(40, 167, 69, 0.3)">Green Glow</option>
                <option value="0 2px 4px rgba(220, 53, 69, 0.3)">Red Glow</option>
              </select>
            </div>

            {/* Hover Effects */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hover Effect</label>
              <select
                value={hoverEffect}
                onChange={(e) => setHoverEffect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="opacity">Opacity Change</option>
                <option value="scale">Scale Transform</option>
                <option value="darken">Darken Background</option>
                <option value="lighten">Lighten Background</option>
                <option value="shadow">Enhanced Shadow</option>
              </select>
              <div className="mt-2 text-sm text-gray-500">
                Hover effects are applied automatically in the published ad
              </div>
            </div>

            {/* Text Decoration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Text Decoration</label>
              <select
                value={customStyles.textDecoration || 'none'}
                onChange={(e) => handleCustomStyleChange('textDecoration', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="none">None</option>
                <option value="underline">Underline</option>
                <option value="overline">Overline</option>
                <option value="line-through">Strikethrough</option>
              </select>
            </div>

            {/* Text Transform */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Text Transform</label>
              <select
                value={customStyles.textTransform || 'none'}
                onChange={(e) => handleCustomStyleChange('textTransform', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="none">None</option>
                <option value="uppercase">UPPERCASE</option>
                <option value="lowercase">lowercase</option>
                <option value="capitalize">Capitalize</option>
              </select>
            </div>

            {/* Letter Spacing */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Letter Spacing: {customStyles.letterSpacing || '0px'}
              </label>
              <input
                type="range"
                min="-2"
                max="5"
                step="0.5"
                value={parseFloat(customStyles.letterSpacing) || 0}
                onChange={(e) => handleCustomStyleChange('letterSpacing', `${e.target.value}px`)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Icons Tab */}
        {activeTab === 'icons' && (
          <div className="space-y-4">
            {/* Icon Position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Icon Position</label>
              <div className="flex space-x-2">
                {[
                  { id: 'left', name: 'Left', icon: '← Text' },
                  { id: 'right', name: 'Right', icon: 'Text →' }
                ].map(position => (
                  <button
                    key={position.id}
                    onClick={() => handleIconPositionChange(position.id)}
                    className={`flex-1 py-2 px-3 text-sm rounded-md border transition-colors ${
                      iconPosition === position.id
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {position.icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Icon Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Choose Icon</label>
              <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                {Object.values(BUTTON_ICONS).map(icon => (
                  <button
                    key={icon.id}
                    onClick={() => handleIconChange(icon.id)}
                    className={`p-3 rounded-lg border-2 transition-all text-center ${
                      selectedIcon === icon.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-lg mb-1">{icon.icon || '∅'}</div>
                    <div className="text-xs text-gray-600">{icon.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="pt-4 border-t border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
        <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
          <button
            className="transition-all duration-200"
            style={{
              ...customStyles,
              cursor: 'default',
              minWidth: customStyles.minWidth || 'auto'
            }}
            disabled
          >
            {element.content || 'Button Text'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ButtonEditor;