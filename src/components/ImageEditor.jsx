import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ImageResizeService } from '../services/imageResizeService.js';

function ImageEditor({ 
  originalImage, 
  targetAdSize, 
  onImageUpdated, 
  onCancel 
}) {
  const [cropArea, setCropArea] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quality, setQuality] = useState(0.9);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [error, setError] = useState(null);

  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  // Parse target dimensions
  const targetDimensions = ImageResizeService.parseAdSize(targetAdSize);

  // Load and display original image
  useEffect(() => {
    if (!originalImage) return;

    const img = new Image();
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height });
      setImageLoaded(true);
      
      // Calculate initial optimal crop area
      const optimalCrop = ImageResizeService.calculateOptimalCrop(
        { width: img.width, height: img.height },
        targetDimensions
      );
      setCropArea(optimalCrop);
      
      // Draw image on canvas
      drawImageOnCanvas(img, optimalCrop);
    };
    
    img.onerror = () => {
      setError('Failed to load image');
    };
    
    img.src = originalImage;
    imageRef.current = img;
  }, [originalImage, targetDimensions]);

  // Draw image on canvas with crop overlay
  const drawImageOnCanvas = useCallback((img, crop = cropArea) => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    const container = containerRef.current;
    
    if (!container) return;

    // Calculate display dimensions (scale to fit container)
    const containerWidth = container.clientWidth - 32; // Account for padding
    const maxHeight = 400;
    
    const scale = Math.min(
      containerWidth / img.width,
      maxHeight / img.height,
      1 // Don't scale up
    );

    const displayWidth = img.width * scale;
    const displayHeight = img.height * scale;

    canvas.width = displayWidth;
    canvas.height = displayHeight;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    // Clear and draw image
    ctx.clearRect(0, 0, displayWidth, displayHeight);
    ctx.drawImage(img, 0, 0, displayWidth, displayHeight);

    // Draw crop overlay
    if (crop) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      
      // Top
      ctx.fillRect(0, 0, displayWidth, crop.y * scale);
      // Bottom
      ctx.fillRect(0, (crop.y + crop.height) * scale, displayWidth, displayHeight - (crop.y + crop.height) * scale);
      // Left
      ctx.fillRect(0, crop.y * scale, crop.x * scale, crop.height * scale);
      // Right
      ctx.fillRect((crop.x + crop.width) * scale, crop.y * scale, displayWidth - (crop.x + crop.width) * scale, crop.height * scale);

      // Draw crop area border
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.strokeRect(crop.x * scale, crop.y * scale, crop.width * scale, crop.height * scale);

      // Draw corner handles
      const handleSize = 8;
      ctx.fillStyle = '#3b82f6';
      const corners = [
        { x: crop.x * scale - handleSize/2, y: crop.y * scale - handleSize/2 },
        { x: (crop.x + crop.width) * scale - handleSize/2, y: crop.y * scale - handleSize/2 },
        { x: crop.x * scale - handleSize/2, y: (crop.y + crop.height) * scale - handleSize/2 },
        { x: (crop.x + crop.width) * scale - handleSize/2, y: (crop.y + crop.height) * scale - handleSize/2 }
      ];
      
      corners.forEach(corner => {
        ctx.fillRect(corner.x, corner.y, handleSize, handleSize);
      });
    }
  }, [cropArea]);

  // Handle mouse events for crop selection
  const handleMouseDown = useCallback((e) => {
    if (!imageLoaded || !imageDimensions) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert display coordinates to image coordinates
    const scale = canvas.width / imageDimensions.width;
    const imageX = x / scale;
    const imageY = y / scale;

    setDragStart({ x: imageX, y: imageY });
    setIsDragging(true);
  }, [imageLoaded, imageDimensions]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !dragStart || !imageDimensions) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert display coordinates to image coordinates
    const scale = canvas.width / imageDimensions.width;
    const imageX = x / scale;
    const imageY = y / scale;

    // Calculate crop area maintaining target aspect ratio
    const deltaX = imageX - dragStart.x;
    const deltaY = imageY - dragStart.y;
    
    let width = Math.abs(deltaX);
    let height = Math.abs(deltaY);
    
    // Maintain aspect ratio
    const targetAspectRatio = targetDimensions.aspectRatio;
    if (width / height > targetAspectRatio) {
      width = height * targetAspectRatio;
    } else {
      height = width / targetAspectRatio;
    }

    const newCropArea = {
      x: Math.min(dragStart.x, imageX),
      y: Math.min(dragStart.y, imageY),
      width,
      height
    };

    // Validate and constrain crop area
    const validatedCrop = ImageResizeService.validateCropArea(newCropArea, imageDimensions);
    setCropArea(validatedCrop);

    // Redraw canvas
    if (imageRef.current) {
      drawImageOnCanvas(imageRef.current, validatedCrop);
    }
  }, [isDragging, dragStart, imageDimensions, targetDimensions, drawImageOnCanvas]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
  }, []);

  // Add event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Generate preview
  const generatePreview = useCallback(async () => {
    if (!originalImage || !cropArea) return;

    try {
      setIsProcessing(true);
      const resizedImage = await ImageResizeService.resizeImage(
        originalImage,
        targetDimensions,
        { quality, cropArea }
      );
      setPreviewImage(resizedImage);
    } catch (error) {
      console.error('Error generating preview:', error);
      setError('Failed to generate preview');
    } finally {
      setIsProcessing(false);
    }
  }, [originalImage, cropArea, targetDimensions, quality]);

  // Auto-generate preview when crop area or quality changes
  useEffect(() => {
    if (cropArea && imageLoaded) {
      const debounceTimer = setTimeout(generatePreview, 300);
      return () => clearTimeout(debounceTimer);
    }
  }, [cropArea, quality, imageLoaded, generatePreview]);

  // Apply resize
  const handleApplyResize = async () => {
    if (!originalImage || !cropArea) return;

    try {
      setIsProcessing(true);
      const resizedImage = await ImageResizeService.resizeImage(
        originalImage,
        targetDimensions,
        { quality, cropArea }
      );
      onImageUpdated(resizedImage);
    } catch (error) {
      console.error('Error applying resize:', error);
      setError('Failed to apply resize');
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset to optimal crop
  const handleResetCrop = () => {
    if (!imageDimensions) return;
    
    const optimalCrop = ImageResizeService.calculateOptimalCrop(
      imageDimensions,
      targetDimensions
    );
    setCropArea(optimalCrop);
    
    if (imageRef.current) {
      drawImageOnCanvas(imageRef.current, optimalCrop);
    }
  };

  const estimatedFileSize = ImageResizeService.estimateFileSize(targetDimensions, quality);

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="h-5 w-5 text-blue-400 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-blue-800">How to crop</h3>
            <p className="text-sm text-blue-700 mt-1">
              Click and drag on the image to select the crop area. The selection will maintain the correct aspect ratio for your target ad size.
            </p>
          </div>
        </div>
      </div>

      {/* Image Canvas */}
      <div ref={containerRef} className="relative border rounded-lg overflow-hidden bg-gray-50">
        {imageLoaded ? (
          <canvas
            ref={canvasRef}
            className="cursor-crosshair mx-auto block"
            onMouseDown={handleMouseDown}
          />
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500">Loading image...</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Target Size</label>
          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
            {targetDimensions.width} × {targetDimensions.height}
            <div className="text-xs text-gray-500">
              Aspect ratio: {targetDimensions.aspectRatio.toFixed(2)}
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quality: {Math.round(quality * 100)}%
          </label>
          <input
            type="range"
            min="0.5"
            max="1"
            step="0.1"
            value={quality}
            onChange={(e) => setQuality(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-gray-500 mt-1">
            Est. size: {ImageResizeService.formatFileSize(estimatedFileSize)}
          </div>
        </div>

        <div className="flex items-end">
          <button
            onClick={handleResetCrop}
            disabled={!imageLoaded}
            className="w-full px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm disabled:opacity-50"
          >
            Reset Crop
          </button>
        </div>
      </div>

      {/* Preview */}
      {previewImage && (
        <div className="border rounded-lg p-4 bg-white">
          <h4 className="font-medium mb-3">Preview</h4>
          <div className="flex justify-center">
            <img 
              src={previewImage} 
              alt="Resized preview"
              className="border rounded shadow-sm"
              style={{ 
                maxWidth: '300px',
                maxHeight: '200px'
              }}
            />
          </div>
          <div className="text-xs text-gray-500 text-center mt-2">
            {targetDimensions.width} × {targetDimensions.height} pixels
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button 
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium"
        >
          Cancel
        </button>
        <button 
          onClick={handleApplyResize}
          disabled={isProcessing || !cropArea || !imageLoaded}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium flex items-center"
        >
          {isProcessing && (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {isProcessing ? 'Processing...' : 'Apply Resize'}
        </button>
      </div>
    </div>
  );
}

export default ImageEditor; 