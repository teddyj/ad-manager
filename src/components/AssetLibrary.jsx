import React, { useState, useRef, useCallback } from 'react';
import { 
  ASSET_CATEGORIES, 
  STOCK_IMAGES, 
  DECORATIVE_ELEMENTS,
  ASSET_FILTERS,
  SORT_OPTIONS,
  getAllStockImages,
  getStockImagesByCategory,
  getAllDecorativeElements,
  getDecorativeElementsByType,
  searchAssets,
  filterAssetsByColor,
  validateFileType,
  validateFileSize,
  formatFileSize,
  createAssetElement
} from '../constants/assetLibrary.js';

/**
 * AssetLibrary Component
 * Comprehensive asset management system for Phase 4
 * Features drag-and-drop, search/filter, upload management, and usage tracking
 */
function AssetLibrary({ 
  onAssetAdd, 
  onAssetDragStart, 
  userAssets = [],
  recentAssets = [],
  favoriteAssets = []
}) {
  const [activeCategory, setActiveCategory] = useState('STOCK_IMAGES');
  const [activeSubCategory, setActiveSubCategory] = useState('ALL');
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [colorFilter, setColorFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [isUploading, setIsUploading] = useState(false);
  const [draggedAsset, setDraggedAsset] = useState(null);
  
  const fileInputRef = useRef(null);

  // Get current assets based on active category and filters
  const getCurrentAssets = useCallback(() => {
    let assets = [];

    // Get base assets by category
    switch (activeCategory) {
      case 'STOCK_IMAGES':
        if (activeSubCategory === 'ALL') {
          assets = getAllStockImages();
        } else {
          assets = getStockImagesByCategory(activeSubCategory);
        }
        break;
      case 'DECORATIVE_ELEMENTS':
        if (activeSubCategory === 'ALL') {
          assets = getAllDecorativeElements();
        } else {
          assets = getDecorativeElementsByType(activeSubCategory);
        }
        break;
      case 'PRODUCT_IMAGES':
        assets = userAssets.filter(asset => asset.category === 'product-images');
        break;
      case 'BRAND_ASSETS':
        assets = userAssets.filter(asset => asset.category === 'brand-assets');
        break;
      default:
        assets = [];
    }

    // Apply filters
    switch (activeFilter) {
      case 'recent':
        assets = assets.filter(asset => 
          recentAssets.some(recent => recent.id === asset.id)
        );
        break;
      case 'favorites':
        assets = assets.filter(asset => 
          favoriteAssets.some(fav => fav.id === asset.id)
        );
        break;
      case 'uploaded':
        assets = userAssets;
        break;
      default:
        // No additional filtering for 'all'
        break;
    }

    // Apply search
    if (searchQuery) {
      assets = searchAssets(assets, searchQuery);
    }

    // Apply color filter
    if (colorFilter) {
      assets = filterAssetsByColor(assets, colorFilter);
    }

    // Apply sorting
    assets.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0);
        case 'usage':
          return (b.usageCount || 0) - (a.usageCount || 0);
        case 'size':
          return (b.fileSize || 0) - (a.fileSize || 0);
        default:
          return 0;
      }
    });

    return assets;
  }, [activeCategory, activeSubCategory, activeFilter, searchQuery, colorFilter, sortBy, userAssets, recentAssets, favoriteAssets]);

  // Handle file upload
  const handleFileUpload = useCallback(async (files) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      for (const file of files) {
        // Validate file type and size
        if (!validateFileType(file, activeCategory)) {
          alert(`Invalid file type for ${ASSET_CATEGORIES[activeCategory].name}. Allowed types: ${ASSET_CATEGORIES[activeCategory].allowedTypes.join(', ')}`);
          continue;
        }

        if (!validateFileSize(file, activeCategory)) {
          alert(`File too large. Maximum size for ${ASSET_CATEGORIES[activeCategory].name}: ${formatFileSize(ASSET_CATEGORIES[activeCategory].maxSize)}`);
          continue;
        }

        // Create file URL for preview
        const fileUrl = URL.createObjectURL(file);
        
        // Create asset object
        const asset = {
          id: `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
          url: fileUrl,
          thumbnail: fileUrl,
          category: ASSET_CATEGORIES[activeCategory].id,
          type: 'uploaded',
          fileSize: file.size,
          fileType: file.type,
          dateAdded: new Date().toISOString(),
          tags: [],
          usageCount: 0,
          originalFile: file
        };

        // Add to user assets (in real app, this would upload to server)
        if (onAssetAdd) {
          onAssetAdd(asset);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading files. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [activeCategory, onAssetAdd]);

  // Handle drag start
  const handleDragStart = useCallback((e, asset) => {
    setDraggedAsset(asset);
    
    // Set drag data
    e.dataTransfer.setData('application/json', JSON.stringify(asset));
    e.dataTransfer.effectAllowed = 'copy';

    // Create drag image
    const dragElement = e.target.cloneNode(true);
    dragElement.style.transform = 'rotate(5deg)';
    dragElement.style.opacity = '0.8';
    document.body.appendChild(dragElement);
    e.dataTransfer.setDragImage(dragElement, 25, 25);
    
    // Clean up drag image after a short delay
    setTimeout(() => {
      if (document.body.contains(dragElement)) {
        document.body.removeChild(dragElement);
      }
    }, 100);

    if (onAssetDragStart) {
      onAssetDragStart(asset);
    }
  }, [onAssetDragStart]);

  // Handle asset click (add to canvas)
  const handleAssetClick = useCallback((asset) => {
    const element = createAssetElement(asset);
    if (onAssetAdd) {
      onAssetAdd(element);
    }
  }, [onAssetAdd]);

  const assets = getCurrentAssets();

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-800">Asset Library</h3>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            disabled={isUploading}
          >
            {isUploading ? '⏳' : '📤'} Upload
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <input
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Filters Row */}
        <div className="flex items-center space-x-2 text-xs">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded text-xs"
          >
            {SORT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <input
            type="text"
            placeholder="Color..."
            value={colorFilter}
            onChange={(e) => setColorFilter(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded text-xs w-16"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {Object.entries(ASSET_CATEGORIES).map(([key, category]) => (
          <button
            key={key}
            onClick={() => {
              setActiveCategory(key);
              setActiveSubCategory('ALL');
            }}
            className={`flex-shrink-0 px-3 py-2 text-xs font-medium transition-colors ${
              activeCategory === key
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <span className="mr-1">{category.icon}</span>
            {category.name}
          </button>
        ))}
      </div>

      {/* Sub-category Tabs */}
      {(activeCategory === 'STOCK_IMAGES' || activeCategory === 'DECORATIVE_ELEMENTS') && (
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setActiveSubCategory('ALL')}
            className={`px-3 py-2 text-xs transition-colors ${
              activeSubCategory === 'ALL'
                ? 'text-blue-600 bg-white border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            All
          </button>
          
          {activeCategory === 'STOCK_IMAGES' && 
            Object.keys(STOCK_IMAGES).map(subCat => (
              <button
                key={subCat}
                onClick={() => setActiveSubCategory(subCat)}
                className={`px-3 py-2 text-xs transition-colors ${
                  activeSubCategory === subCat
                    ? 'text-blue-600 bg-white border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {subCat.charAt(0) + subCat.slice(1).toLowerCase()}
              </button>
            ))
          }
          
          {activeCategory === 'DECORATIVE_ELEMENTS' && 
            Object.keys(DECORATIVE_ELEMENTS).map(subCat => (
              <button
                key={subCat}
                onClick={() => setActiveSubCategory(subCat)}
                className={`px-3 py-2 text-xs transition-colors ${
                  activeSubCategory === subCat
                    ? 'text-blue-600 bg-white border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {subCat.charAt(0) + subCat.slice(1).toLowerCase()}
              </button>
            ))
          }
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        {Object.values(ASSET_FILTERS).map(filter => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`px-3 py-2 text-xs transition-colors ${
              activeFilter === filter.id
                ? 'text-blue-600 bg-white border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <span className="mr-1">{filter.icon}</span>
            {filter.name}
          </button>
        ))}
      </div>

      {/* Assets Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        {assets.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">📁</div>
            <p className="text-sm">No assets found</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-blue-600 text-xs mt-1 hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {assets.map(asset => (
              <div
                key={asset.id}
                className="relative group cursor-pointer border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 hover:shadow-md transition-all duration-200"
                draggable
                onDragStart={(e) => handleDragStart(e, asset)}
                onClick={() => handleAssetClick(asset)}
              >
                {/* Asset Preview */}
                <div className="aspect-square bg-gray-100 flex items-center justify-center p-2">
                  {asset.type === 'shape' || asset.type === 'icon' || asset.type === 'badge' ? (
                    <div 
                      className="w-full h-full flex items-center justify-center"
                      dangerouslySetInnerHTML={{ __html: asset.svg }}
                      style={{ color: '#4a5568' }}
                    />
                  ) : (
                    <img
                      src={asset.thumbnail || asset.url}
                      alt={asset.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                </div>

                {/* Asset Info */}
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-800 truncate">
                    {asset.name}
                  </div>
                  {asset.tags && asset.tags.length > 0 && (
                    <div className="text-xs text-gray-500 truncate mt-1">
                      {asset.tags.slice(0, 2).join(', ')}
                    </div>
                  )}
                  {asset.license && (
                    <div className="text-xs text-gray-400 mt-1">
                      {asset.license}
                    </div>
                  )}
                </div>

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAssetClick(asset);
                      }}
                      className="px-2 py-1 bg-white text-gray-800 text-xs rounded shadow hover:bg-gray-100"
                      title="Add to canvas"
                    >
                      ➕
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle favorite toggle
                      }}
                      className="px-2 py-1 bg-white text-gray-800 text-xs rounded shadow hover:bg-gray-100"
                      title="Add to favorites"
                    >
                      ⭐
                    </button>
                  </div>
                </div>

                {/* Usage Count */}
                {asset.usageCount > 0 && (
                  <div className="absolute top-1 right-1 bg-blue-600 text-white text-xs px-1 rounded">
                    {asset.usageCount}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Instructions */}
      {isUploading && (
        <div className="p-3 bg-blue-50 border-t border-blue-200 text-center">
          <div className="text-sm text-blue-700">
            ⏳ Uploading assets...
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ASSET_CATEGORIES[activeCategory]?.allowedTypes.join(',')}
        onChange={(e) => handleFileUpload(Array.from(e.target.files))}
        className="hidden"
      />
    </div>
  );
}

export default AssetLibrary; 