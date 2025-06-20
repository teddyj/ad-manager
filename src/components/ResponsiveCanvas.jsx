import React, { useState } from 'react';
import CanvasEditor from './canvas/CanvasEditor.jsx';

/**
 * ResponsiveCanvas - Multi-format canvas system for Phase 7
 * Handles automatic layout adaptation across different ad formats
 */

// Ad format definitions with responsive breakpoints
const AD_FORMATS = {
  '300x250': {
    id: '300x250',
    name: 'Medium Rectangle',
    width: 300,
    height: 250,
    category: 'banner',
    aspectRatio: 1.2,
    scaleFactor: 1.0,
    contentArea: { width: 280, height: 230 }, // Safe area for content
    priority: 1
  },
  '320x50': {
    id: '320x50',
    name: 'Mobile Banner',
    width: 320,
    height: 50,
    category: 'banner',
    aspectRatio: 6.4,
    scaleFactor: 0.8,
    contentArea: { width: 300, height: 40 },
    priority: 2
  },
  '320x400': {
    id: '320x400',
    name: 'Mobile Rectangle',
    width: 320,
    height: 400,
    category: 'mobile',
    aspectRatio: 0.8,
    scaleFactor: 1.1,
    contentArea: { width: 300, height: 380 },
    priority: 3
  },
  '1080x1920': {
    id: '1080x1920',
    name: 'Stories & Reels',
    width: 1080,
    height: 1920,
    category: 'vertical',
    aspectRatio: 0.5625,
    scaleFactor: 2.0,
    contentArea: { width: 1000, height: 1800 },
    priority: 4
  }
};



function ResponsiveCanvas({ 
  initialAdData,
  campaignSettings,
  onPublish,
  primaryFormat = '300x250',
  dbOperations
}) {
  const [activeFormat, setActiveFormat] = useState(primaryFormat);
  const [canvasState, setCanvasState] = useState({
    meta: { adSize: primaryFormat },
    elements: [],
    history: { past: [], future: [] }
  });

  // Handle format changes
  const handleFormatChange = (newFormat) => {
    setActiveFormat(newFormat);
    setCanvasState(prev => ({
      ...prev,
      meta: { ...prev.meta, adSize: newFormat }
    }));
  };

  // Simplified format selector (no view modes)
  const FormatSelector = () => (
    <div className="flex items-center space-x-4 p-4 bg-gray-50 border-b">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Format:</span>
        {Object.values(AD_FORMATS).map(format => (
          <button
            key={format.id}
            onClick={() => handleFormatChange(format.id)}
            className={`px-3 py-2 text-sm rounded-md transition-colors ${
              activeFormat === format.id
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            {format.name}
            <div className="text-xs opacity-75">{format.id}</div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-white">
      <FormatSelector />
      
      {/* Single canvas editor only */}
      <div className="flex-1 bg-gray-100">
        <CanvasEditor
          adData={initialAdData}
          campaignSettings={campaignSettings}
          onPublish={onPublish}
          initialAdSize={activeFormat}
          dbOperations={dbOperations}
        />
      </div>
    </div>
  );
}

export default ResponsiveCanvas; 