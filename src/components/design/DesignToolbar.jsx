import React from 'react';

/**
 * DesignToolbar - Top toolbar with element addition and canvas controls
 */
function DesignToolbar({ 
  canvasState, 
  onElementAdd, 
  onAdSizeChange, 
  selectedElement 
}) {
  
  const adSizes = [
    { name: 'Medium Rectangle', value: '300x250', description: 'Banner' },
    { name: 'Mobile Rectangle', value: '320x400', description: 'Mobile' },
    { name: 'Banner', value: '320x50', description: 'Mobile Banner' },
    { name: 'Stories/Reels', value: '1080x1920', description: 'Vertical' },
    { name: 'Square', value: '1080x1080', description: 'Social' },
    { name: 'Wide Banner', value: '728x90', description: 'Desktop' }
  ];

  const currentAdSize = adSizes.find(size => size.value === canvasState.meta.adSize) || adSizes[0];

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
      {/* Left Section - Element Tools */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Add:</span>
          
          {/* Text Button */}
          <button
            onClick={() => onElementAdd('text')}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            title="Add Text Element"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            Text
          </button>

          {/* Button Element */}
          <button
            onClick={() => onElementAdd('button')}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            title="Add Button Element"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            Button
          </button>

          {/* Image Element */}
          <button
            onClick={() => onElementAdd('image')}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            title="Add Image Element"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Image
          </button>

          {/* Product Element */}
          <button
            onClick={() => onElementAdd('product')}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
            title="Add Product Element"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 9l3-3 3 3M9 21v-4a2 2 0 012-2h2a2 2 0 012 2v4" />
            </svg>
            Product
          </button>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-300"></div>

        {/* Canvas Controls */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Tools:</span>
          
          {/* Undo */}
          <button
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            title="Undo"
            disabled={canvasState.history.past.length === 0}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>

          {/* Redo */}
          <button
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            title="Redo"
            disabled={canvasState.history.future.length === 0}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6-6m6 6l-6 6" />
            </svg>
          </button>

          {/* Grid Toggle */}
          <button
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            title="Toggle Grid"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Center Section - Ad Size Selector */}
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-700">Ad Size:</span>
        <select
          value={canvasState.meta.adSize}
          onChange={(e) => onAdSizeChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {adSizes.map(size => (
            <option key={size.value} value={size.value}>
              {size.name} ({size.value}) - {size.description}
            </option>
          ))}
        </select>
      </div>

      {/* Right Section - Selected Element Info */}
      <div className="flex items-center space-x-4">
        {selectedElement ? (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
              {selectedElement.type} selected
            </div>
            <div className="text-xs text-gray-500">
              {selectedElement.size.width}×{selectedElement.size.height} at ({selectedElement.position.x}, {selectedElement.position.y})
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            Click an element to select
          </div>
        )}

        {/* Preview Toggle */}
        <button
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          title="Preview Mode"
        >
          <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Preview
        </button>
      </div>
    </div>
  );
}

export default DesignToolbar; 