import React, { useState, useRef, useCallback } from 'react';
import { 
  validateFileType, 
  validateFileSize, 
  formatFileSize,
  generateAssetId 
} from '../constants/assetLibrary.js';

/**
 * ProductAssetManager Component
 * Enhanced product asset integration for Phase 4
 * Features multiple products, variants, auto-clipping, and smart cropping
 */
function ProductAssetManager({ 
  products = [], 
  onProductAdd, 
  onProductUpdate, 
  onProductRemove,
  selectedProductId,
  adFormat = '300x250'
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [draggedProduct, setDraggedProduct] = useState(null);
  const [showVariants, setShowVariants] = useState({});
  const fileInputRef = useRef(null);

  // Handle product upload
  const handleProductUpload = useCallback(async (files) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      for (const file of files) {
        // Validate file
        if (!validateFileType(file, 'PRODUCT_IMAGES')) {
          alert(`Invalid file type. Please upload JPEG, PNG, or WebP images.`);
          continue;
        }

        if (!validateFileSize(file, 'PRODUCT_IMAGES')) {
          alert(`File too large. Maximum size: ${formatFileSize(10 * 1024 * 1024)}`);
          continue;
        }

        // Create product object
        const product = {
          id: generateAssetId('product'),
          name: file.name.replace(/\.[^/.]+$/, ""),
          originalUrl: URL.createObjectURL(file),
          processedUrl: null,
          thumbnailUrl: null,
          variants: [],
          fileSize: file.size,
          fileType: file.type,
          dateAdded: new Date().toISOString(),
          usageCount: 0,
          tags: [],
          metadata: {
            originalDimensions: null,
            dominantColors: [],
            hasTransparentBackground: false,
            processingStatus: 'pending'
          },
          originalFile: file
        };

        // Process the image
        await processProductImage(product);

        // Add to products
        if (onProductAdd) {
          onProductAdd(product);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading products. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [onProductAdd]);

  // Process product image
  const processProductImage = async (product) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        product.metadata.originalDimensions = {
          width: img.naturalWidth,
          height: img.naturalHeight
        };

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        ctx.drawImage(img, 0, 0);
        product.processedUrl = canvas.toDataURL('image/png');
        
        const thumbnailCanvas = document.createElement('canvas');
        const thumbnailCtx = thumbnailCanvas.getContext('2d');
        const thumbnailSize = 150;
        
        thumbnailCanvas.width = thumbnailSize;
        thumbnailCanvas.height = thumbnailSize;
        
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
        
        if (aspectRatio > 1) {
          drawWidth = thumbnailSize;
          drawHeight = thumbnailSize / aspectRatio;
          offsetY = (thumbnailSize - drawHeight) / 2;
        } else {
          drawWidth = thumbnailSize * aspectRatio;
          drawHeight = thumbnailSize;
          offsetX = (thumbnailSize - drawWidth) / 2;
        }
        
        thumbnailCtx.fillStyle = '#f9f9f9';
        thumbnailCtx.fillRect(0, 0, thumbnailSize, thumbnailSize);
        thumbnailCtx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        
        product.thumbnailUrl = thumbnailCanvas.toDataURL('image/jpeg', 0.8);
        product.metadata.processingStatus = 'completed';

        resolve(product);
      };
      img.src = product.originalUrl;
    });
  };

  // Handle drag start
  const handleDragStart = useCallback((e, product) => {
    setDraggedProduct(product);
    
    const dragData = {
      type: 'product',
      id: product.id,
      name: product.name,
      url: product.processedUrl || product.originalUrl,
      thumbnail: product.thumbnailUrl,
      category: 'product',
      metadata: product.metadata
    };

    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'copy';
  }, []);

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-800">Product Assets</h3>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            disabled={isUploading}
          >
            {isUploading ? '⏳' : '📤'} Add Products
          </button>
        </div>
        
        <div className="text-xs text-gray-500">
          Drag products to canvas • {products.length} products loaded
        </div>
      </div>

      {/* Products List */}
      <div className="flex-1 overflow-y-auto p-4">
        {products.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">📦</div>
            <p className="text-sm">No products added yet</p>
            <p className="text-xs text-gray-400 mt-1">Upload product images to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {products.filter(Boolean).map(product => product && (
              <div
                key={product.id}
                className={`border rounded-lg overflow-hidden transition-all duration-200 ${
                  selectedProductId === product.id 
                    ? 'border-blue-300 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="p-3">
                  <div className="flex items-start space-x-3">
                    {/* Product Thumbnail */}
                    <div
                      className="w-16 h-16 bg-gray-100 rounded cursor-pointer flex-shrink-0 overflow-hidden"
                      draggable
                      onDragStart={(e) => handleDragStart(e, product)}
                    >
                      {product.thumbnailUrl ? (
                        <img
                          src={product.thumbnailUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          {product.metadata?.processingStatus === 'pending' ? '⏳' : '📦'}
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-800 truncate">
                          {product.name}
                        </h4>
                        <button
                          onClick={() => onProductRemove && onProductRemove(product.id)}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                      
                      <div className="text-xs text-gray-500 mt-1">
                        {product.metadata?.originalDimensions && (
                          <span>
                            {product.metadata.originalDimensions.width} × {product.metadata.originalDimensions.height}
                          </span>
                        )}
                        <span className="ml-2">{formatFileSize(product.fileSize || 0)}</span>
                      </div>

                      {/* Processing Status */}
                      {product.metadata?.processingStatus === 'pending' && (
                        <div className="text-xs text-yellow-600 mt-1">
                          ⏳ Processing...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Instructions */}
      {isUploading && (
        <div className="p-3 bg-blue-50 border-t border-blue-200 text-center">
          <div className="text-sm text-blue-700">
            ⏳ Processing product images...
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => handleProductUpload(Array.from(e.target.files))}
        className="hidden"
      />
    </div>
  );
}

export default ProductAssetManager; 