import React, { useState, useRef, useEffect } from 'react';
import { TEXT_STYLES, getTextStylesByCategory } from '../../constants/textStyles.js';

/**
 * DesignToolbar - Advanced responsive toolbar with floating element selector
 */
function DesignToolbar({ 
  canvasState, 
  onElementAdd, 
  onAdSizeChange, 
  selectedElement,
  isResponsiveMode = false,
  currentFormat = null
}) {
  const [showTextDropdown, setShowTextDropdown] = useState(false);
  const [showToolsDropdown, setShowToolsDropdown] = useState(false);
  const [showElementSelector, setShowElementSelector] = useState(false);
  const [isCompactMode, setIsCompactMode] = useState(false);
  const dropdownRef = useRef(null);
  const toolsDropdownRef = useRef(null);
  const elementSelectorRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowTextDropdown(false);
      }
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(event.target)) {
        setShowToolsDropdown(false);
      }
      if (elementSelectorRef.current && !elementSelectorRef.current.contains(event.target)) {
        setShowElementSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Responsive detection
  useEffect(() => {
    const handleResize = () => {
      setIsCompactMode(window.innerWidth < 1200);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const adSizes = [
    { name: 'Medium Rectangle', value: '300x250', description: 'Banner' },
    { name: 'Mobile Rectangle', value: '320x400', description: 'Mobile' },
    { name: 'Banner', value: '320x50', description: 'Mobile Banner' },
    { name: 'Stories/Reels', value: '1080x1920', description: 'Vertical' },
    { name: 'Square', value: '1080x1080', description: 'Social' },
    { name: 'Wide Banner', value: '728x90', description: 'Desktop' }
  ];

  const currentAdSize = adSizes.find(size => size.value === canvasState?.meta?.adSize) || adSizes[0];

  // Enhanced element type configurations
  const elementTypes = [
    {
      type: 'text',
      label: 'Text',
      icon: '📝',
      description: 'Add text elements with rich formatting',
      className: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
      hasDropdown: true,
      shortcut: 'T'
    },
    {
      type: 'button',
      label: 'Button',
      icon: '🔘',
      description: 'Add interactive call-to-action button',
      className: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
      shortcut: 'B'
    },
    {
      type: 'image',
      label: 'Image',
      icon: '🖼️',
      description: 'Add custom image element',
      className: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
      shortcut: 'I'
    },
    {
      type: 'product',
      label: 'Product',
      icon: '📦',
      description: 'Add product showcase with image and details',
      className: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100',
      shortcut: 'P'
    },
    {
      type: 'shape',
      label: 'Shape',
      icon: '🔷',
      description: 'Add geometric shapes and dividers',
      className: 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100',
      shortcut: 'S'
    }
  ];

  const tools = [
    {
      id: 'undo',
      label: 'Undo',
      icon: '↶',
      disabled: (canvasState?.history?.past || []).length === 0,
      action: 'undo',
      shortcut: 'Ctrl+Z'
    },
    {
      id: 'redo',
      label: 'Redo',
      icon: '↷',
      disabled: (canvasState?.history?.future || []).length === 0,
      action: 'redo',
      shortcut: 'Ctrl+Y'
    },
    {
      id: 'grid',
      label: 'Grid',
      icon: '⊞',
      action: 'toggleGrid',
      shortcut: 'G'
    },
    {
      id: 'guides',
      label: 'Guides',
      icon: '📏',
      action: 'toggleGuides',
      shortcut: 'Ctrl+;'
    }
  ];

  // Floating Element Selector Component
  const FloatingElementSelector = () => (
    <div ref={elementSelectorRef} className="relative">
      <button
        onClick={() => setShowElementSelector(!showElementSelector)}
        className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        title="Add new element (Press '+' key)"
      >
        <span className="text-xl mr-3">➕</span>
        <span className="font-semibold">Add Element</span>
        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {showElementSelector && (
        <div className="absolute top-full left-0 mt-3 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Add Element</h3>
              <button
                onClick={() => setShowElementSelector(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {elementTypes.map(element => (
                <div key={element.type}>
                  {element.hasDropdown ? (
                    <div className="relative">
                      <button
                        onClick={() => setShowTextDropdown(!showTextDropdown)}
                        className={`w-full p-4 border-2 rounded-xl transition-all duration-200 text-left ${element.className} hover:shadow-lg`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">{element.icon}</span>
                            <div>
                              <div className="font-semibold">{element.label}</div>
                              <div className="text-xs opacity-75 mt-1">{element.shortcut}</div>
                            </div>
                          </div>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>
                      
                      {/* Text Style Submenu */}
                      {showTextDropdown && (
                        <div className="absolute top-0 left-full ml-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-60">
                          <div className="p-3">
                            <div className="text-sm font-semibold text-gray-700 mb-3">Text Styles</div>
                            
                            {/* Headlines */}
                            <div className="mb-4">
                              <div className="text-xs font-medium text-gray-500 mb-2">Headlines</div>
                              <div className="space-y-1">
                                {getTextStylesByCategory('headline').map(style => (
                                  <button
                                    key={style.id}
                                    onClick={() => {
                                      onElementAdd('text', undefined, style, null);
                                      setShowTextDropdown(false);
                                      setShowElementSelector(false);
                                    }}
                                    className="w-full px-3 py-2 text-left rounded-lg hover:bg-gray-50 transition-colors"
                                  >
                                    <div style={{ fontFamily: style.fontFamily, fontSize: '14px', fontWeight: style.fontWeight }}>
                                      {style.name}
                                    </div>
                                    <div className="text-xs text-gray-500">{style.fontSize}</div>
                                  </button>
                                ))}
                              </div>
                            </div>
                            
                            {/* Body Text */}
                            <div className="mb-4">
                              <div className="text-xs font-medium text-gray-500 mb-2">Body Text</div>
                              <div className="space-y-1">
                                {getTextStylesByCategory('body').map(style => (
                                  <button
                                    key={style.id}
                                    onClick={() => {
                                      onElementAdd('text', undefined, style, null);
                                      setShowTextDropdown(false);
                                      setShowElementSelector(false);
                                    }}
                                    className="w-full px-3 py-2 text-left rounded-lg hover:bg-gray-50 transition-colors"
                                  >
                                    <div style={{ fontFamily: style.fontFamily, fontSize: '14px', fontWeight: style.fontWeight }}>
                                      {style.name}
                                    </div>
                                    <div className="text-xs text-gray-500">{style.fontSize}</div>
                                  </button>
                                ))}
                              </div>
                            </div>
                            
                            {/* Button Text */}
                            <div>
                              <div className="text-xs font-medium text-gray-500 mb-2">Button Text</div>
                              <div className="space-y-1">
                                {getTextStylesByCategory('button').map(style => (
                                  <button
                                    key={style.id}
                                    onClick={() => {
                                      onElementAdd('text', undefined, style, null);
                                      setShowTextDropdown(false);
                                      setShowElementSelector(false);
                                    }}
                                    className="w-full px-3 py-2 text-left rounded-lg hover:bg-gray-50 transition-colors"
                                  >
                                    <div style={{ fontFamily: style.fontFamily, fontSize: '14px', fontWeight: style.fontWeight }}>
                                      {style.name}
                                    </div>
                                    <div className="text-xs text-gray-500">{style.fontSize}</div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        onElementAdd(element.type, element.type === 'shape' ? 'rectangle' : undefined);
                        setShowElementSelector(false);
                      }}
                      className={`w-full p-4 border-2 rounded-xl transition-all duration-200 text-left ${element.className} hover:shadow-lg`}
                    >
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{element.icon}</span>
                        <div>
                          <div className="font-semibold">{element.label}</div>
                          <div className="text-xs opacity-75 mt-1">{element.shortcut}</div>
                        </div>
                      </div>
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-600">
                💡 <strong>Pro tip:</strong> Use keyboard shortcuts for faster element creation
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Compact mode rendering
  if (isCompactMode || isResponsiveMode) {
    return (
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left - Floating Element Selector */}
            <FloatingElementSelector />

            {/* Center - Current Format Info */}
            {isResponsiveMode && currentFormat && (
              <div className="flex items-center space-x-3">
                <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {currentFormat}
                </div>
              </div>
            )}

            {/* Right - Quick Tools */}
            <div className="flex items-center space-x-2">
              {tools.slice(0, 2).map(tool => (
                <button
                  key={tool.id}
                  disabled={tool.disabled}
                  className={`p-2 rounded-lg transition-colors ${
                    tool.disabled 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                  title={`${tool.label} (${tool.shortcut})`}
                >
                  <span className="text-lg">{tool.icon}</span>
                </button>
              ))}
              
              {/* Tools dropdown for remaining tools */}
              <div className="relative" ref={toolsDropdownRef}>
                <button
                  onClick={() => setShowToolsDropdown(!showToolsDropdown)}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  title="More tools"
                >
                  <span className="text-lg">⋯</span>
                </button>
                
                {showToolsDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                    <div className="p-2">
                      {tools.slice(2).map(tool => (
                        <button
                          key={tool.id}
                          disabled={tool.disabled}
                          className={`w-full flex items-center px-3 py-2 text-left rounded-md transition-colors ${
                            tool.disabled 
                              ? 'text-gray-400 cursor-not-allowed' 
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                          title={tool.shortcut}
                        >
                          <span className="text-lg mr-3">{tool.icon}</span>
                          <span className="font-medium">{tool.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Selection Info */}
          {selectedElement && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                    {String(selectedElement.type || 'Unknown')}
                  </div>
                  <div className="text-xs text-gray-500">
                    {String(selectedElement.size?.width || 0)}×{String(selectedElement.size?.height || 0)}
                  </div>
                </div>
                {selectedElement.locked && (
                  <div className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                    🔒 Locked
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full mode rendering (original expanded design)
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      {/* Main Toolbar */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left Section - Element Selector */}
          <FloatingElementSelector />

          {/* Center Section - Ad Size (Always Visible) */}
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-700">Format:</span>
            <select
                                value={canvasState?.meta?.adSize || '300x250'}
              onChange={(e) => onAdSizeChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              {adSizes.map(size => (
                <option key={size.value} value={size.value}>
                  {size.name} ({size.value})
                </option>
              ))}
            </select>
          </div>

          {/* Right Section - Tools and Info */}
          <div className="flex items-center space-x-4">
            {/* Quick Tools */}
            <div className="flex items-center space-x-1">
              {tools.map(tool => (
                <button
                  key={tool.id}
                  disabled={tool.disabled}
                  className={`p-2 rounded-lg transition-colors ${
                    tool.disabled 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                  title={`${tool.label} (${tool.shortcut})`}
                >
                  <span className="text-lg">{tool.icon}</span>
                </button>
              ))}
            </div>
            
            {/* Selected Element Info */}
            {selectedElement ? (
              <div className="flex items-center space-x-2">
                <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {String(selectedElement.type || 'Unknown')}
                </div>
                <div className="text-xs text-gray-500 hidden lg:block">
                  {String(selectedElement.size?.width || 0)}×{String(selectedElement.size?.height || 0)}
                </div>
                {selectedElement.locked && (
                  <div className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                    🔒
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                No selection
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DesignToolbar; 