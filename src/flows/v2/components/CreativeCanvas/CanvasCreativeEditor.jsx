import React, { useState, useCallback, useRef, useEffect } from 'react';
import CanvasEditor from '../../../../components/canvas/CanvasEditor.jsx';
import { PencilIcon, EyeIcon, CheckIcon, XMarkIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/react/24/outline';

/**
 * Simple Creative Preview Component - renders creative elements without editing capabilities
 * Shows the actual rendered creative (headline, description, product image, CTA) in a clean format
 * Always renders as a clean preview, never shows editing interface
 */
const CreativePreview = ({ canvasState, format, scale = 0.5, creative }) => {
  const elements = canvasState?.elements || [];
  const backgroundColor = canvasState?.meta?.backgroundColor || creative?.elements?.backgroundColor || '#ffffff';
  
  // Debug logging
  console.log('🎨 CreativePreview received:', {
    hasCanvasElements: elements.length > 0,
    canvasElementsCount: elements.length,
    hasCreativeElements: !!creative?.elements,
    creativeElementsStructure: creative?.elements ? Object.keys(creative.elements) : null,
    format: format,
    scale: scale
  });

  // Always try to extract content from both canvas elements and legacy structure
  const extractedContent = {
    headline: null,
    description: null,
    productImage: null,
    cta: null,
    backgroundColor: backgroundColor,
    textColor: '#333333'
  };

  // Extract from canvas elements if they exist
  if (elements.length > 0) {
    elements.forEach(element => {
      switch (element.type) {
        case 'text':
          if (element.id.includes('headline') && !extractedContent.headline) {
            extractedContent.headline = element.content;
          } else if (element.id.includes('description') && !extractedContent.description) {
            extractedContent.description = element.content;
          }
          break;
        case 'button':
          if (!extractedContent.cta) {
            extractedContent.cta = element.content;
          }
          break;
        case 'image':
        case 'product':
          if (!extractedContent.productImage && element.content) {
            extractedContent.productImage = element.content;
          }
          break;
      }
    });
  }

  // Fall back to legacy creative structure if canvas extraction didn't work
  if (creative?.elements) {
    extractedContent.headline = extractedContent.headline || creative.elements.headline;
    extractedContent.description = extractedContent.description || creative.elements.description;
    extractedContent.cta = extractedContent.cta || creative.elements.cta;
    extractedContent.productImage = extractedContent.productImage || creative.elements.productImage;
    extractedContent.textColor = creative.elements.textColor || extractedContent.textColor;
  }

  console.log('📊 Extracted content for preview:', extractedContent);

  // Calculate responsive sizing
  const containerWidth = format.width * scale;
  const containerHeight = format.height * scale;
  const padding = Math.max(12, containerWidth * 0.04);
  const gap = Math.max(8, containerHeight * 0.03);

  return (
    <div
      style={{
        width: `${containerWidth}px`,
        height: `${containerHeight}px`,
        backgroundColor: extractedContent.backgroundColor,
        position: 'relative',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${padding}px`,
        gap: `${gap}px`,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Headline */}
      {extractedContent.headline && (
        <div
          style={{
            fontSize: `${Math.max(14, containerWidth / 18)}px`,
            fontWeight: 'bold',
            color: extractedContent.textColor,
            textAlign: 'center',
            lineHeight: '1.2',
            maxWidth: '100%',
            wordWrap: 'break-word',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {extractedContent.headline}
        </div>
      )}
      
      {/* Description */}
      {extractedContent.description && (
        <div
          style={{
            fontSize: `${Math.max(11, containerWidth / 24)}px`,
            color: extractedContent.textColor,
            textAlign: 'center',
            lineHeight: '1.4',
            maxWidth: '100%',
            wordWrap: 'break-word',
            opacity: 0.85,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {extractedContent.description}
        </div>
      )}
      
      {/* Product Image */}
      {extractedContent.productImage && (
        <div
          style={{
            width: `${Math.min(containerWidth * 0.6, containerHeight * 0.5)}px`,
            height: `${Math.min(containerWidth * 0.6, containerHeight * 0.5)}px`,
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            flexShrink: 0
          }}
        >
          <img
            src={extractedContent.productImage}
            alt="Product"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            draggable={false}
            onError={(e) => {
              // Replace with placeholder if image fails to load
              e.target.style.display = 'none';
              e.target.parentNode.style.backgroundColor = '#f3f4f6';
              e.target.parentNode.style.display = 'flex';
              e.target.parentNode.style.alignItems = 'center';
              e.target.parentNode.style.justifyContent = 'center';
              e.target.parentNode.innerHTML = '<div style="color: #6b7280; font-size: 12px;">Product Image</div>';
            }}
          />
        </div>
      )}
      
      {/* CTA Button */}
      {extractedContent.cta && (
        <div
          style={{
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            padding: `${Math.max(6, containerHeight * 0.02)}px ${Math.max(12, containerWidth * 0.04)}px`,
            borderRadius: '6px',
            fontSize: `${Math.max(11, containerWidth / 26)}px`,
            fontWeight: '600',
            cursor: 'default',
            boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
            textAlign: 'center',
            maxWidth: '90%',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            marginTop: 'auto'
          }}
        >
          {extractedContent.cta}
        </div>
      )}
      
      {/* Fallback content if no data extracted */}
      {!extractedContent.headline && !extractedContent.description && !extractedContent.productImage && !extractedContent.cta && (
        <div style={{
          color: '#9ca3af',
          fontSize: `${Math.max(12, containerWidth / 20)}px`,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: `${gap}px`
        }}>
          <div style={{ fontSize: `${Math.max(24, containerWidth / 12)}px` }}>📄</div>
          <div>Creative Preview</div>
          <div style={{ fontSize: `${Math.max(10, containerWidth / 30)}px`, opacity: 0.7 }}>
            {format.width} × {format.height}px
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Canvas Creative Editor with Full-Screen Modal
 * FIXED: Canvas controls, state synchronization, and prop interface
 */
const CanvasCreativeEditor = ({ 
  creative, 
  onCreativeUpdate, 
  format,
  readonly = false,
  className = '' 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved');
  
  // Use a local state to track canvas changes
  const [localCanvasState, setLocalCanvasState] = useState(creative?.canvasState || {
    elements: [],
    meta: { backgroundColor: '#ffffff' }
  });

  // Sync local state with creative prop when it changes externally
  useEffect(() => {
    if (creative?.canvasState) {
      // Only update if there's a meaningful difference (prevent loops)
      const currentElements = localCanvasState?.elements || [];
      const newElements = creative.canvasState?.elements || [];
      
      if (newElements.length !== currentElements.length || 
          JSON.stringify(newElements) !== JSON.stringify(currentElements)) {
        setLocalCanvasState(creative.canvasState);
      }
    }
  }, [creative?.id]); // Only sync when creative ID changes, not canvas state

  // FIXED: Canvas state change handler with proper debouncing
  const saveTimeoutRef = useRef(null);
  
  const handleCanvasStateChange = useCallback((newCanvasState) => {
    // Update local state immediately for responsive UI
    setLocalCanvasState(newCanvasState);
    setSaveStatus('saving');
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Debounce the save to prevent rapid updates
    saveTimeoutRef.current = setTimeout(() => {
      const updatedCreative = {
        ...creative,
        canvasState: newCanvasState,
        lastEdited: Date.now()
      };
      
      // Call the parent update function
      onCreativeUpdate(updatedCreative);
      setSaveStatus('saved');
    }, 300); // 300ms debounce
  }, [creative, onCreativeUpdate]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Open modal for editing
  const openModal = useCallback(() => {
    if (!readonly) {
      setIsModalOpen(true);
    }
  }, [readonly]);

  // Close modal
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Handle backdrop click (only close if clicking the backdrop, not the modal content)
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  }, [closeModal]);

  return (
    <>
      {/* Preview Mode - Click to Edit */}
      <div className={`border border-gray-200 rounded-lg overflow-hidden bg-white ${className}`}>
        {/* Header */}
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <EyeIcon className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Creative Preview</span>
          </div>
          {!readonly && (
            <button
              onClick={openModal}
              className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              <PencilIcon className="w-4 h-4" />
              Edit Canvas
            </button>
          )}
        </div>

        {/* Preview Canvas - Now shows actual rendered creative */}
        <div 
          className="p-6 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors flex items-center justify-center"
          onClick={!readonly ? openModal : undefined}
          style={{ minHeight: '400px' }}
        >
          {(localCanvasState.elements?.length > 0 || creative?.elements) ? (
            <CreativePreview 
              canvasState={localCanvasState} 
              format={format}
              scale={Math.min(350 / format.width, 300 / format.height, 0.8)}
              creative={creative}
            />
          ) : (
            <div className="text-gray-400 text-sm text-center">
              <ArrowsPointingOutIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <div>Click to create your ad</div>
              <div className="text-xs text-gray-400 mt-1">
                {format.width} × {format.height}px
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full-Screen Modal for Editing */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50"
          onClick={handleBackdropClick}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black bg-opacity-75" />
          
          {/* Modal Content */}
          <div 
            className="relative w-full h-full bg-white flex flex-col"
            onClick={(e) => e.stopPropagation()} // Prevent modal close when clicking inside
          >
            {/* Modal Header */}
            <div className="bg-gray-800 text-white px-6 py-4 flex items-center justify-between border-b flex-shrink-0 z-50">
              <div className="flex items-center gap-3">
                <PencilIcon className="w-5 h-5" />
                <h2 className="text-lg font-semibold">Canvas Editor</h2>
                <div className="ml-4 flex items-center gap-2">
                  {saveStatus === 'saving' && (
                    <div className="flex items-center gap-2 text-blue-400">
                      <div className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm">Saving...</span>
                    </div>
                  )}
                  {saveStatus === 'saved' && (
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckIcon className="w-4 h-4" />
                      <span className="text-sm">Saved</span>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Canvas Container - FIXED: Proper event handling and positioning */}
            <div className="flex-1 bg-gray-100 relative">
              <CanvasEditor
                key={`canvas-modal-${creative?.id}`}
                canvasState={localCanvasState}
                onCanvasStateChange={handleCanvasStateChange}
                onPublish={(publishedData) => {
                  // Handle publish by closing modal and updating creative
                  closeModal();
                  if (onCreativeUpdate) {
                    onCreativeUpdate({
                      ...creative,
                      ...publishedData,
                      canvasState: localCanvasState
                    });
                  }
                }}
                format={format}
                viewportScale={1.0}
                showToolbar={true}
                showScaleControls={true}
                readonly={false}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CanvasCreativeEditor; 