import React, { useState } from 'react';
import { BackgroundService } from '../services/backgroundService.js';
import { ProductCompositionService } from '../services/productCompositionService.js';

/**
 * ProductSizeControls Component
 * Handles product size adjustments within background scenes
 */
function ProductSizeControls({ 
  currentImage,
  originalProductUrl,
  activeBackgroundPrompt,
  onImageUpdated,
  onError,
  onStatusUpdate
}) {
  const [productImageScale, setProductImageScale] = useState(1.0);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProductComposition = async () => {
    if (!currentImage || !originalProductUrl || !activeBackgroundPrompt) {
      onError?.('Missing required data for product composition');
      return;
    }

    try {
      setIsProcessing(true);
      onError?.(null);
      onStatusUpdate?.('Preparing product composition...');

      console.log('Creating product composition with AI scaling:', {
        originalProductUrl,
        currentImage,
        scale: productImageScale
      });

      onStatusUpdate?.('Processing product composition...');

      // Upload the original product image
      const response = await fetch(originalProductUrl);
      const blob = await response.blob();
      const file = new File([blob], `product-image.jpg`, { type: 'image/jpeg' });
      const uploadedUrl = await BackgroundService.uploadImage(file);

      // Create very specific prompt based on scale
      let sizeInstruction = '';
      if (productImageScale <= 0.3) {
        sizeInstruction = 'tiny, miniature product that appears very small in the scene, like a product sample or small version on a large surface';
      } else if (productImageScale <= 0.6) {
        sizeInstruction = 'small product that looks naturally proportioned for the scene, not dominating the space';
      } else if (productImageScale <= 0.8) {
        sizeInstruction = 'medium-sized product that fits naturally in the scene';
      } else if (productImageScale <= 1.2) {
        sizeInstruction = 'standard product size that is the main focus but not overwhelming';
      } else {
        sizeInstruction = 'large, prominent product that dominates the scene as the hero element';
      }

      // Create enhanced prompt
      const enhancedPrompt = `${activeBackgroundPrompt}, featuring a ${sizeInstruction}. The product should appear ${productImageScale < 0.7 ? 'smaller and more subtle' : productImageScale > 1.3 ? 'larger and more prominent' : 'appropriately sized'} within the scene.`;

      console.log('Enhanced prompt:', enhancedPrompt);
      console.log('Scale factor being used:', productImageScale);

      onStatusUpdate?.('Regenerating with new product size...');

      // Generate new background with size-specific prompt
      const result = await BackgroundService.changeBackground(
        uploadedUrl, 
        enhancedPrompt,
        {} // options
      );

      if (!result.success) {
        throw new Error('Background generation failed');
      }

      const compositeImageUrl = result.imageUrl;

      console.log('Composition completed successfully');
      console.log('New composite image URL:', compositeImageUrl.substring(0, 50) + '...');

      // Update the image
      onImageUpdated?.(compositeImageUrl);
      onStatusUpdate?.('Product composition completed!');
      
      // Reset to defaults since we've applied the change
      setProductImageScale(1.0);

      // Clear success message after delay
      setTimeout(() => {
        onStatusUpdate?.('');
      }, 3000);

    } catch (error) {
      console.error('Error composing product image:', error);
      onError?.(`Failed to compose product: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!BackgroundService.isEnabled()) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Product Sizing Unavailable
            </h3>
            <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
              <p>
                Product sizing requires API configuration. Please set up your FAL_API_KEY in the environment variables.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentImage || !activeBackgroundPrompt) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <p className="text-gray-600 dark:text-gray-400">
          Please select a background style first to adjust product sizing.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Image Preview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Current Image
        </h3>
        <div className="flex justify-center">
          <div className="relative w-80 h-80 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
            <img
              key={currentImage}
              src={currentImage}
              alt="Current product image"
              className="w-full h-full object-contain"
            />
            <div className="absolute top-2 right-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Current Version
              </span>
            </div>
            {productImageScale !== 1.0 && (
              <div className="absolute bottom-2 left-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                  Preview: {Math.round(productImageScale * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>
        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
          Adjust the slider below to preview different product sizes, then click "Apply Product Size" to generate a new image
        </p>
      </div>

      {/* Product Size Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Adjust Product Size in Scene
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Fine-tune how your product appears within the background scene. Make it smaller to look natural on a table, or larger for a hero shot.
        </p>
      
      <div className="space-y-4">
        {/* Composition Presets */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Quick Presets
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(ProductCompositionService.getCompositionPresets()).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => {
                  setProductImageScale(preset.productScale);
                }}
                className="px-3 py-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {preset.description}
              </button>
            ))}
          </div>
        </div>

        {/* Size slider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Product Size: {Math.round(productImageScale * 100)}%
          </label>
          <input
            type="range"
            min="20"
            max="150"
            step="5"
            value={productImageScale * 100}
            onChange={(e) => setProductImageScale(e.target.value / 100)}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>Small (20%)</span>
            <span>Natural (100%)</span>
            <span>Hero (150%)</span>
          </div>
        </div>

        {/* Apply composition button */}
        <div className="flex justify-center">
          <button
            onClick={handleProductComposition}
            disabled={isProcessing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors duration-200 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Composing...
              </div>
            ) : (
              'Apply Product Size'
            )}
          </button>
        </div>

        {/* Reset to defaults */}
        <div className="flex justify-center">
          <button
            onClick={() => {
              setProductImageScale(1.0);
            }}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Reset to Default Size
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}

export default ProductSizeControls; 