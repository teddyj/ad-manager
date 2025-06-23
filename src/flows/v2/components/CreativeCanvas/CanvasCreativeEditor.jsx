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
    setCanvasScale(0.8);
  };

  // Reset canvas scale
  const resetScale = () => {
    setCanvasScale(1);
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
            onClick={fitToScreen}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors"
            title="Fit to screen"
          >
            <ArrowsPointingInIcon className="w-4 h-4" />
          </button>
          
          <button
            onClick={resetScale}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors"
            title="Reset scale"
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
          /* Edit Mode - Full Canvas Editor */
          <div className="h-[600px]">
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
              viewportScale={canvasScale}
              showScaleControls={false}
              onScaleChange={setCanvasScale}
              onFitToScreen={fitToScreen}
              isResponsiveMode={false}
              currentFormat={format}
            />
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
            style={commonStyles}
            className="flex items-center justify-center"
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
              backgroundImage: `url(${element.content})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
        );
      
      default:
        return (
          <div key={element.id} style={commonStyles}>
            {element.content}
          </div>
        );
    }
  };

  return (
    <div 
      className="relative"
      style={{
        width: format.width,
        height: format.height,
        backgroundColor: canvasState.meta?.backgroundColor || '#ffffff'
      }}
    >
      {canvasState.elements?.map(renderElement)}
    </div>
  );
};

export default CanvasCreativeEditor; 