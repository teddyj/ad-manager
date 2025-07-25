import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BackgroundService } from '../services/backgroundService.js';
import { BACKGROUND_STATUS } from '../constants/backgroundPrompts.js';
import BackgroundPromptSelector from './BackgroundPromptSelector.jsx';
import BackgroundVersionManager from './BackgroundVersionManager.jsx';

/**
 * BackgroundCustomizer Component
 * Main component for customizing product image backgrounds
 */
const BackgroundCustomizer = React.memo(function BackgroundCustomizer({ 
  product, 
  imageId, 
  onBackgroundChange, 
  dbOperations,
  mode = "product", // "product" or "creative"
  currentImage = null, // for creative mode
  onPromptChange = null // callback to report active prompt
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [error, setError] = useState(null);
  const [currentProduct, setCurrentProduct] = useState(product);
  const [latestGeneratedImage, setLatestGeneratedImage] = useState(null); // Track the latest generated image

  // Memoize the working image to prevent unnecessary re-renders
  const workingImage = useMemo(() => {
    return mode === "creative" 
      ? { url: currentImage, id: imageId } // In creative mode, currentImage is the URL
      : currentProduct?.images?.find(img => img.id === imageId); // In product mode, find by ID
  }, [mode, currentImage, imageId, currentProduct]);
  
  // Memoize display image URL to prevent unnecessary re-renders
  const displayImageUrl = useMemo(() => {
    return mode === "creative" 
      ? (latestGeneratedImage || currentImage) // Show latest generated image if available, otherwise original
      : (dbOperations?.getActiveImageUrl?.(currentProduct, imageId) || workingImage?.url);
  }, [mode, latestGeneratedImage, currentImage, dbOperations, currentProduct, imageId, workingImage]);
  
  // Get current active background version (only applies to product mode)
  const activeBackgroundVersion = useMemo(() => {
    return mode === "product" 
      ? workingImage?.backgroundVersions?.find(v => v.isActive)
      : null;
  }, [mode, workingImage]);
  
  const currentActiveVersionId = activeBackgroundVersion?.id || null;

  // Only update currentProduct when product actually changes
  useEffect(() => {
    if (product && product !== currentProduct) {
    setCurrentProduct(product);
    }
  }, [product]);

  // Memoize handlers to prevent unnecessary re-renders
  const handlePromptSelect = useCallback(async (prompt, description) => {
    if (!workingImage || !BackgroundService.isEnabled()) {
      setError('Background change service is not available');
      return;
    }

    // Report the prompt to parent component
    onPromptChange?.(prompt);

    try {
      setIsProcessing(true);
      setError(null);
      setProcessingStatus('Uploading image...');

      // Convert image URL to file for upload
      const response = await fetch(workingImage.url);
      const blob = await response.blob();
      const file = new File([blob], `product-image.jpg`, { type: 'image/jpeg' });

      // Upload the image
      const uploadedUrl = await BackgroundService.uploadImage(file);
      
      setProcessingStatus('Processing background change...');

      // Change the background
      const result = await BackgroundService.changeBackground(uploadedUrl, prompt);
      
      console.log('BackgroundCustomizer received result:', result);
      console.log('Result imageUrl:', result.imageUrl);

      if (result.success) {
        if (mode === "creative") {
          // In creative mode, directly call the callback with the new image URL
          setLatestGeneratedImage(result.imageUrl); // Store the latest generated image locally
          onBackgroundChange?.(result.imageUrl);
          setProcessingStatus('Background change completed!');
          
          // Clear success message after a delay
          setTimeout(() => {
            setProcessingStatus('');
          }, 3000);
        } else {
          // In product mode, save to database
        const saveResult = dbOperations.addBackgroundVersion(
          currentProduct.id,
          imageId,
          result
        );

        if (saveResult.success) {
          setCurrentProduct(saveResult.product);
          onBackgroundChange?.(saveResult.product);
          setProcessingStatus('Background change completed!');
          
          // Clear success message after a delay
          setTimeout(() => {
            setProcessingStatus('');
          }, 3000);
        } else {
          throw new Error(saveResult.error);
          }
        }
      } else {
        throw new Error('Background change failed');
      }

    } catch (error) {
      console.error('Background customization error:', error);
      setError(error.message);
    } finally {
      setIsProcessing(false);
    }
  }, [workingImage, onPromptChange, mode, dbOperations, currentProduct, imageId, onBackgroundChange]);

  const handleCustomPrompt = useCallback(async (customPrompt) => {
    await handlePromptSelect(customPrompt, 'Custom Background');
  }, [handlePromptSelect]);

  const handleResetImage = useCallback(() => {
    if (mode === "creative") {
      setLatestGeneratedImage(null);
      onBackgroundChange?.(currentImage); // Reset to original image
    }
  }, [mode, onBackgroundChange, currentImage]);

  const handleVersionSelect = useCallback(async (versionId) => {
    try {
      const result = dbOperations.setActiveBackgroundVersion(
        currentProduct.id,
        imageId,
        versionId
      );

      if (result.success) {
        setCurrentProduct(result.product);
        onBackgroundChange?.(result.product);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Error selecting background version:', error);
      setError(error.message);
    }
  }, [dbOperations, currentProduct, imageId, onBackgroundChange]);

  const handleVersionDelete = useCallback(async (versionId) => {
    try {
      const result = dbOperations.deleteBackgroundVersion(
        currentProduct.id,
        imageId,
        versionId
      );

      if (result.success) {
        setCurrentProduct(result.product);
        onBackgroundChange?.(result.product);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Error deleting background version:', error);
      setError(error.message);
    }
  }, [dbOperations, currentProduct, imageId, onBackgroundChange]);

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
              Background Customization Unavailable
            </h3>
            <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
              <p>
                Background customization requires API configuration. Please set up your FAL_API_KEY in the environment variables.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!workingImage) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <p className="text-gray-600 dark:text-gray-400">No image selected for background customization.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Background Customization Error
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{error}</p>
              </div>
              <div className="mt-3">
                <button
                  onClick={() => setError(null)}
                  className="text-sm text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 font-medium"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success status */}
      {processingStatus && !isProcessing && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                {processingStatus}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Current image preview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Current Image
        </h3>
          {latestGeneratedImage && mode === "creative" && (
            <button
              onClick={handleResetImage}
              className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 font-medium"
            >
              Reset to Original
            </button>
          )}
        </div>
        <div className="flex justify-center">
          <div className="relative w-64 h-64 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
            <img
              key={displayImageUrl}
              src={displayImageUrl}
              alt={workingImage?.altText || 'Product image'}
              className="w-full h-full object-contain"
            />
            {latestGeneratedImage && mode === "creative" && (
              <div className="absolute top-2 right-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  AI Generated
                </span>
              </div>
            )}
            {activeBackgroundVersion && mode === "product" && (
              <div className="absolute top-2 right-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Custom Background
                </span>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Background prompt selector */}
      <BackgroundPromptSelector
        onPromptSelect={handlePromptSelect}
        onCustomPrompt={handleCustomPrompt}
        isLoading={isProcessing}
      />

      {/* Processing status */}
      {isProcessing && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 dark:border-blue-400 mr-3"></div>
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {processingStatus || 'Processing...'}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                This may take 15-30 seconds to complete
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Background version manager - only show in product mode */}
      {mode === "product" && (
      <BackgroundVersionManager
          image={workingImage}
        onVersionSelect={handleVersionSelect}
        onVersionDelete={handleVersionDelete}
        currentActiveVersion={currentActiveVersionId}
      />
      )}
    </div>
  );
});

export default BackgroundCustomizer; 