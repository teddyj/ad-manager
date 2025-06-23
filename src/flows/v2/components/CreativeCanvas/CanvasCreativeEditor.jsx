import React, { useState, useCallback, useMemo } from 'react';
import CanvasEditor from '../../../../components/canvas/CanvasEditor.jsx';
import { PencilIcon, EyeIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/react/24/outline';

/**
 * Canvas Creative Editor for Campaign Flow V2
 * Integrates the existing canvas editor with the new campaign flow
 */
const CanvasCreativeEditor = ({ 
  creative, 
  onCreativeUpdate, 
  format,
  readonly = false,
  className = '' 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState('preview'); // 'preview' | 'edit'
  const [canvasScale, setCanvasScale] = useState(1);

  // Convert creative data to canvas-compatible format
  const canvasData = useMemo(() => {
    if (creative?.canvasState) {
      return creative.canvasState;
    }
    
    // Fallback: convert legacy creative format to canvas
    return {
      meta: {
        adSize: `${format.width}x${format.height}`,
        format: format.id,
        backgroundColor: creative?.elements?.backgroundColor || '#ffffff'
      },
      elements: [
        {
          id: 'headline-1',
          type: 'text',
          content: creative?.elements?.headline || 'Your Headline',
          position: { x: 20, y: 30 },
          size: { width: format.width - 40, height: 40 },
          zIndex: 2,
          styles: {
            fontSize: '18px',
            fontWeight: 'bold',
            color: creative?.elements?.textColor || '#000000',
            textAlign: 'center'
          }
        },
        {
          id: 'description-1',
          type: 'text',
          content: creative?.elements?.description || 'Your description',
          position: { x: 20, y: 80 },
          size: { width: format.width - 40, height: 60 },
          zIndex: 2,
          styles: {
            fontSize: '14px',
            color: creative?.elements?.textColor || '#000000',
            textAlign: 'center'
          }
        },
        {
          id: 'cta-1',
          type: 'button',
          content: creative?.elements?.cta || 'Shop Now',
          position: { x: (format.width - 100) / 2, y: format.height - 60 },
          size: { width: 100, height: 40 },
          zIndex: 3,
          styles: {
            backgroundColor: '#007bff',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '6px'
          }
        }
      ]
    };
  }, [creative, format]);

  // Handle canvas state changes
  const handleCanvasStateChange = useCallback((newCanvasState) => {
    const updatedCreative = {
      ...creative,
      canvasState: newCanvasState,
      lastEdited: new Date().toISOString(),
      // Update legacy format for compatibility
      elements: {
        ...creative?.elements,
        headline: newCanvasState.elements?.find(el => el.type === 'text' && el.id.includes('headline'))?.content || creative?.elements?.headline,
        description: newCanvasState.elements?.find(el => el.type === 'text' && el.id.includes('description'))?.content || creative?.elements?.description,
        cta: newCanvasState.elements?.find(el => el.type === 'button')?.content || creative?.elements?.cta
      }
    };
    
    onCreativeUpdate?.(updatedCreative);
  }, [creative, onCreativeUpdate]);

  // Toggle between preview and edit modes
  const toggleEditMode = () => {
    setViewMode(prev => prev === 'preview' ? 'edit' : 'preview');
    setIsEditing(prev => !prev);
  };

  // Fit canvas to container
  const fitToScreen = () => {
    setCanvasScale(0.6); // Smaller scale for better editing
  };

  // Reset canvas scale
  const resetScale = () => {
    setCanvasScale(1);
  };

  // Shrink canvas for editing
  const shrinkForEditing = () => {
    setCanvasScale(0.4); // Very small for element access
  };

  return (
    <div className={`creative-canvas-editor ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-3">
          <h3 className="font-medium text-gray-900">
            {creative?.name || `${format.name} Creative`}
          </h3>
          <span className="text-sm text-gray-500">
            {format.dimensions}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Scale Controls */}
          <button
            onClick={shrinkForEditing}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors"
            title="Shrink for editing (40%)"
          >
            <span className="text-xs font-mono">40%</span>
          </button>
          
          <button
            onClick={fitToScreen}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors"
            title="Fit to screen (60%)"
          >
            <ArrowsPointingInIcon className="w-4 h-4" />
          </button>
          
          <button
            onClick={resetScale}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors"
            title="Reset scale (100%)"
          >
            <ArrowsPointingOutIcon className="w-4 h-4" />
          </button>
          
          {/* View Mode Toggle */}
          {!readonly && (
            <button
              onClick={toggleEditMode}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md font-medium transition-colors ${
                isEditing
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {isEditing ? (
                <>
                  <EyeIcon className="w-4 h-4" />
                  <span>Preview</span>
                </>
              ) : (
                <>
                  <PencilIcon className="w-4 h-4" />
                  <span>Edit</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Canvas Container */}
      <div className="canvas-container border border-gray-200 rounded-lg overflow-hidden bg-white">
        {viewMode === 'edit' && !readonly ? (
          /* Edit Mode - Scalable Canvas Editor */
          <div 
            className="flex items-center justify-center p-4"
            style={{ 
              minHeight: '500px',
              height: 'auto' // Allow dynamic height
            }}
          >
            <div 
              style={{
                transform: `scale(${canvasScale})`,
                transformOrigin: 'center',
                width: format.width,
                height: format.height
              }}
            >
              <CanvasEditor
                adData={{
                  title: creative?.elements?.headline,
                  description: creative?.elements?.description
                }}
                campaignSettings={{}}
                initialAdSize={`${format.width}x${format.height}`}
                canvasState={canvasData}
                onCanvasStateChange={handleCanvasStateChange}
                readonly={false}
                viewportScale={1} // Set to 1 since we're handling scaling externally
                showScaleControls={false}
                onScaleChange={setCanvasScale}
                onFitToScreen={fitToScreen}
                isResponsiveMode={false}
                currentFormat={format}
              />
            </div>
          </div>
        ) : (
          /* Preview Mode - Static Preview */
          <div className="flex items-center justify-center p-8 min-h-[400px]">
            <div 
              className="creative-preview border border-gray-300 rounded-lg overflow-hidden shadow-sm"
              style={{
                width: format.width * canvasScale,
                height: format.height * canvasScale,
                transform: `scale(${Math.min(canvasScale, 0.8)})`,
                transformOrigin: 'center'
              }}
            >
              <CreativePreview 
                creative={creative}
                format={format}
                canvasState={canvasData}
              />
            </div>
          </div>
        )}
      </div>

      {/* Creative Info */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="font-medium text-gray-900">Format</div>
          <div className="text-gray-600">{format.name}</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="font-medium text-gray-900">Style</div>
          <div className="text-gray-600 capitalize">{creative?.style || 'A'}</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="font-medium text-gray-900">Last Edited</div>
          <div className="text-gray-600">
            {creative?.lastEdited 
              ? new Date(creative.lastEdited).toLocaleDateString() 
              : 'Never'
            }
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Creative Preview Component
 * Renders a static preview of the creative
 */
const CreativePreview = ({ creative, format, canvasState }) => {
  const renderElement = (element) => {
    const commonStyles = {
      position: 'absolute',
      left: element.position.x,
      top: element.position.y,
      width: element.size.width,
      height: element.size.height,
      zIndex: element.zIndex,
      ...element.styles
    };

    switch (element.type) {
      case 'background':
        return (
          <div
            key={element.id}
            style={{
              ...commonStyles,
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%'
            }}
          />
        );
      
      case 'text':
        return (
          <div
            key={element.id}
            style={commonStyles}
            className="flex items-center justify-center"
          >
            <span style={{ textAlign: element.styles.textAlign || 'center' }}>
              {element.content}
            </span>
          </div>
        );
      
      case 'button':
        return (
          <button
            key={element.id}
            style={{
              ...commonStyles,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: element.styles.border || '2px solid #1e40af',
              borderRadius: element.styles.borderRadius || '8px',
              backgroundColor: element.styles.backgroundColor || '#1e40af',
              color: element.styles.color || '#ffffff',
              fontSize: element.styles.fontSize || '16px',
              fontWeight: element.styles.fontWeight || '700',
              fontFamily: element.styles.fontFamily || 'Inter, sans-serif',
              cursor: 'pointer',
              outline: 'none',
              textAlign: 'center',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
              padding: '12px 20px',
              letterSpacing: '0.025em',
              textTransform: 'uppercase',
              transition: 'all 0.2s ease',
              minHeight: '44px' // Ensure minimum touch target
            }}
            disabled
          >
            {element.content}
          </button>
        );
      
      case 'image':
        return (
          <div
            key={element.id}
            style={{
              ...commonStyles,
              backgroundImage: element.content ? `url(${element.content})` : 'none',
              backgroundSize: element.styles.objectFit || 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              borderRadius: element.styles.borderRadius || '8px',
              boxShadow: element.styles.boxShadow || '0 4px 12px rgba(0,0,0,0.1)',
              border: element.content ? 'none' : '2px dashed #d1d5db',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {!element.content && (
              <span style={{ 
                color: '#9ca3af', 
                fontSize: '12px', 
                textAlign: 'center',
                fontFamily: 'Inter, sans-serif'
              }}>
                Product Image
              </span>
            )}
          </div>
        );
      
      default:
        return (
          <div key={element.id} style={commonStyles}>
            {element.content}
          </div>
        );
    }
  };

  // Use canvasState.elements if available, otherwise fall back to creative.canvasState
  const elements = canvasState?.elements || creative?.canvasState?.elements || [];
  const backgroundColor = canvasState?.meta?.backgroundColor || creative?.canvasState?.meta?.backgroundColor || creative?.elements?.backgroundColor || '#ffffff';

  console.log('🎨 CreativePreview rendering:', {
    elementsCount: elements.length,
    backgroundColor: backgroundColor,
    formatSize: `${format.width}x${format.height}`,
    canvasStateProvided: !!canvasState,
    creativeCanvasStateProvided: !!creative?.canvasState,
    elements: elements.map(el => ({ 
      id: el.id, 
      type: el.type, 
      content: el.type === 'image' ? (el.content || 'No image URL') : (el.content ? 'Has content' : 'No content'),
      imageUrl: el.type === 'image' ? el.content : undefined
    }))
  });
  
  // Debug image elements specifically
  const imageElements = elements.filter(el => el.type === 'image');
  if (imageElements.length > 0) {
    console.log('🖼️ Image elements found:', imageElements.map(img => ({
      id: img.id,
      content: img.content,
      hasContent: !!img.content,
      position: img.position,
      size: img.size
    })));
  }

  return (
    <div 
      className="relative overflow-hidden"
      style={{
        width: format.width,
        height: format.height,
        backgroundColor: backgroundColor
      }}
    >
      {elements.map(renderElement)}
    </div>
  );
};

export default CanvasCreativeEditor; 