import React, { useState } from 'react';

/**
 * DesignControls - Right panel with element styling and canvas controls
 */
function DesignControls({ 
  canvasState, 
  selectedElement, 
  onElementUpdate, 
  onBackgroundChange, 
  onPublish,
  campaignSettings 
}) {
  
  const [activeTab, setActiveTab] = useState('element');

  const handleStyleChange = (property, value) => {
    if (!selectedElement) return;
    
    onElementUpdate(selectedElement.id, {
      styles: {
        ...selectedElement.styles,
        [property]: value
      }
    });
  };

  const handleContentChange = (value) => {
    if (!selectedElement) return;
    
    onElementUpdate(selectedElement.id, {
      content: value
    });
  };

  const handleSizeChange = (dimension, value) => {
    if (!selectedElement) return;
    
    const numValue = parseInt(value) || 0;
    onElementUpdate(selectedElement.id, {
      size: {
        ...selectedElement.size,
        [dimension]: numValue
      }
    });
  };

  const handlePositionChange = (axis, value) => {
    if (!selectedElement) return;
    
    const numValue = parseInt(value) || 0;
    onElementUpdate(selectedElement.id, {
      position: {
        ...selectedElement.position,
        [axis]: numValue
      }
    });
  };

  const tabs = [
    { id: 'element', label: 'Element', icon: '🎨' },
    { id: 'background', label: 'Background', icon: '🖼️' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <div className="h-full bg-white">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6 overflow-y-auto">
        {/* Element Tab */}
        {activeTab === 'element' && (
          <div className="space-y-6">
            {selectedElement ? (
              <>
                {/* Element Info */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">
                    {selectedElement.type.charAt(0).toUpperCase() + selectedElement.type.slice(1)} Element
                  </h3>
                  <p className="text-sm text-blue-600">
                    {selectedElement.size.width} × {selectedElement.size.height} px
                  </p>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                  </label>
                  {selectedElement.type === 'text' || selectedElement.type === 'button' ? (
                    <input
                      type="text"
                      value={selectedElement.content || ''}
                      onChange={(e) => handleContentChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter content..."
                    />
                  ) : selectedElement.type === 'image' || selectedElement.type === 'product' ? (
                    <div>
                      <input
                        type="url"
                        value={selectedElement.content || ''}
                        onChange={(e) => handleContentChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                        placeholder="Enter image URL..."
                      />
                      <button className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm">
                        Upload Image
                      </button>
                    </div>
                  ) : null}
                </div>

                {/* Position & Size */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 w-4">X:</span>
                        <input
                          type="number"
                          value={selectedElement.position.x}
                          onChange={(e) => handlePositionChange('x', e.target.value)}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 w-4">Y:</span>
                        <input
                          type="number"
                          value={selectedElement.position.y}
                          onChange={(e) => handlePositionChange('y', e.target.value)}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 w-4">W:</span>
                        <input
                          type="number"
                          value={selectedElement.size.width}
                          onChange={(e) => handleSizeChange('width', e.target.value)}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 w-4">H:</span>
                        <input
                          type="number"
                          value={selectedElement.size.height}
                          onChange={(e) => handleSizeChange('height', e.target.value)}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Text Styles */}
                {(selectedElement.type === 'text' || selectedElement.type === 'button') && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-800">Typography</h4>
                    
                    {/* Font Size */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                      <input
                        type="range"
                        min="8"
                        max="72"
                        value={parseInt(selectedElement.styles.fontSize)}
                        onChange={(e) => handleStyleChange('fontSize', `${e.target.value}px`)}
                        className="w-full"
                      />
                      <div className="text-sm text-gray-500 mt-1">{selectedElement.styles.fontSize}</div>
                    </div>

                    {/* Font Weight */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Font Weight</label>
                      <select
                        value={selectedElement.styles.fontWeight}
                        onChange={(e) => handleStyleChange('fontWeight', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="normal">Normal</option>
                        <option value="bold">Bold</option>
                        <option value="lighter">Light</option>
                        <option value="bolder">Extra Bold</option>
                      </select>
                    </div>

                    {/* Text Color */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          value={selectedElement.styles.color}
                          onChange={(e) => handleStyleChange('color', e.target.value)}
                          className="w-12 h-8 border border-gray-300 rounded"
                        />
                        <input
                          type="text"
                          value={selectedElement.styles.color}
                          onChange={(e) => handleStyleChange('color', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                    </div>

                    {/* Text Alignment */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Text Alignment</label>
                      <div className="flex space-x-2">
                        {['left', 'center', 'right'].map(align => (
                          <button
                            key={align}
                            onClick={() => handleStyleChange('textAlign', align)}
                            className={`flex-1 py-2 text-sm rounded ${
                              selectedElement.styles.textAlign === align
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {align.charAt(0).toUpperCase() + align.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Button Styles */}
                {selectedElement.type === 'button' && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-800">Button Styling</h4>
                    
                    {/* Background Color */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          value={selectedElement.styles.backgroundColor}
                          onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                          className="w-12 h-8 border border-gray-300 rounded"
                        />
                        <input
                          type="text"
                          value={selectedElement.styles.backgroundColor}
                          onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                    </div>

                    {/* Border Radius */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Border Radius</label>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={parseInt(selectedElement.styles.borderRadius)}
                        onChange={(e) => handleStyleChange('borderRadius', `${e.target.value}px`)}
                        className="w-full"
                      />
                      <div className="text-sm text-gray-500 mt-1">{selectedElement.styles.borderRadius}</div>
                    </div>
                  </div>
                )}

                {/* Element Actions */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onElementUpdate(selectedElement.id, { locked: !selectedElement.locked })}
                      className={`flex-1 py-2 text-sm rounded ${
                        selectedElement.locked
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {selectedElement.locked ? '🔒 Unlock' : '🔓 Lock'}
                    </button>
                    <button className="flex-1 py-2 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded">
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-4">🎨</div>
                <h3 className="text-lg font-medium mb-2">No Element Selected</h3>
                <p className="text-sm">Click on an element in the canvas to edit its properties</p>
              </div>
            )}
          </div>
        )}

        {/* Background Tab */}
        {activeTab === 'background' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Background Image</label>
              <div className="space-y-3">
                <input
                  type="url"
                  value={canvasState.meta.backgroundImage || ''}
                  onChange={(e) => onBackgroundChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter background image URL..."
                />
                <button className="w-full px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md text-sm">
                  Choose from Library
                </button>
                <button className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm">
                  Upload Background
                </button>
                {canvasState.meta.backgroundImage && (
                  <button
                    onClick={() => onBackgroundChange(null)}
                    className="w-full px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm"
                  >
                    Remove Background
                  </button>
                )}
              </div>
            </div>

            {/* Background Preview */}
            {canvasState.meta.backgroundImage && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <img
                    src={canvasState.meta.backgroundImage}
                    alt="Background Preview"
                    className="w-full h-32 object-cover"
                  />
                </div>
              </div>
            )}

            {/* Quick Background Colors */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quick Colors</label>
              <div className="grid grid-cols-6 gap-2">
                {['#ffffff', '#f3f4f6', '#1f2937', '#ef4444', '#3b82f6', '#10b981'].map(color => (
                  <button
                    key={color}
                    onClick={() => onBackgroundChange(`data:image/svg+xml;base64,${btoa(`<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="${color}"/></svg>`)}`)}
                    className="w-full h-8 rounded border border-gray-300"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Campaign Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Campaign</h3>
              <p className="text-sm text-gray-600">
                {campaignSettings?.campaign?.name || 'Unnamed Campaign'}
              </p>
            </div>

            {/* Canvas Settings */}
            <div>
              <h4 className="font-medium text-gray-800 mb-3">Canvas Settings</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Show Grid</span>
                  <input type="checkbox" className="toggle" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Snap to Grid</span>
                  <input type="checkbox" className="toggle" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Show Guides</span>
                  <input type="checkbox" className="toggle" />
                </div>
              </div>
            </div>

            {/* Element Count */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Design Stats</h4>
              <div className="text-sm text-blue-600 space-y-1">
                <div>Elements: {canvasState.elements.length}</div>
                <div>Text Elements: {canvasState.elements.filter(el => el.type === 'text').length}</div>
                <div>Buttons: {canvasState.elements.filter(el => el.type === 'button').length}</div>
                <div>Images: {canvasState.elements.filter(el => el.type === 'image' || el.type === 'product').length}</div>
              </div>
            </div>

            {/* Publish Section */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={onPublish}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                🚀 Publish Ad
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Review and publish your ad design
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DesignControls; 