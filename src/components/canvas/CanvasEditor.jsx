import React, { useState, useRef, useEffect, useCallback } from 'react';
import CanvasWorkspace from './CanvasWorkspace.jsx';
import ElementRenderer from './ElementRenderer.jsx';
import DesignControls from '../design/DesignControls.jsx';
import DesignToolbar from '../design/DesignToolbar.jsx';

/**
 * CanvasEditor - Main canvas-based creative builder component
 * Replaces the old AdCustomization interface with a modern design canvas
 */
function CanvasEditor({ 
  adData, 
  campaignSettings, 
  onPublish,
  initialAdSize = '300x250'
}) {
  // Canvas state management
  const [canvasState, setCanvasState] = useState(() => ({
    meta: {
      adSize: initialAdSize,
      backgroundImage: adData?.url || adData?.imageUrl || null,
      template: 'product-focused'
    },
    elements: [
      // Initialize with basic elements from existing adData
      {
        id: 'headline-1',
        type: 'text',
        content: adData?.title || adData?.headline || 'Your Headline Here',
        position: { x: 20, y: 30 },
        size: { width: 260, height: 40 },
        zIndex: 2,
        styles: {
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#1a1a1a',
          textAlign: 'center',
          fontFamily: 'Inter, sans-serif'
        },
        interactive: true,
        locked: false
      },
      {
        id: 'description-1',
        type: 'text',
        content: adData?.description || 'Your description here',
        position: { x: 20, y: 80 },
        size: { width: 260, height: 30 },
        zIndex: 2,
        styles: {
          fontSize: '14px',
          fontWeight: 'normal',
          color: '#666666',
          textAlign: 'center',
          fontFamily: 'Inter, sans-serif'
        },
        interactive: true,
        locked: false
      },
      {
        id: 'cta-1',
        type: 'button',
        content: 'Shop Now',
        position: { x: 100, y: 200 },
        size: { width: 100, height: 40 },
        zIndex: 3,
        styles: {
          backgroundColor: '#007bff',
          color: '#ffffff',
          border: 'none',
          borderRadius: '6px',
          fontWeight: 'bold',
          fontSize: '14px'
        },
        interactive: true,
        locked: false
      }
    ],
    history: {
      past: [],
      future: []
    }
  }));

  // Selected element state
  const [selectedElementId, setSelectedElementId] = useState(null);
  
  // Canvas dimensions based on ad size
  const getCanvasDimensions = useCallback((adSize) => {
    const [width, height] = adSize.split('x').map(Number);
    return { width, height };
  }, []);

  const canvasDimensions = getCanvasDimensions(canvasState.meta.adSize);

  // Element manipulation handlers
  const handleElementUpdate = useCallback((elementId, updates) => {
    setCanvasState(prev => ({
      ...prev,
      elements: prev.elements.map(el => 
        el.id === elementId ? { ...el, ...updates } : el
      )
    }));
  }, []);

  const handleElementSelect = useCallback((elementId) => {
    setSelectedElementId(elementId);
  }, []);

  const handleElementAdd = useCallback((elementType, position = { x: 50, y: 50 }) => {
    const newElement = {
      id: `${elementType}-${Date.now()}`,
      type: elementType,
      content: elementType === 'text' ? 'New Text' : 
               elementType === 'button' ? 'Button' : '',
      position,
      size: elementType === 'text' ? { width: 150, height: 30 } :
            elementType === 'button' ? { width: 100, height: 40 } :
            { width: 100, height: 100 },
      zIndex: Math.max(...canvasState.elements.map(el => el.zIndex), 0) + 1,
      styles: getDefaultStyles(elementType),
      interactive: true,
      locked: false
    };

    setCanvasState(prev => ({
      ...prev,
      elements: [...prev.elements, newElement]
    }));

    setSelectedElementId(newElement.id);
  }, [canvasState.elements]);

  const getDefaultStyles = (elementType) => {
    switch (elementType) {
      case 'text':
        return {
          fontSize: '16px',
          fontWeight: 'normal',
          color: '#333333',
          textAlign: 'left',
          fontFamily: 'Inter, sans-serif'
        };
      case 'button':
        return {
          backgroundColor: '#007bff',
          color: '#ffffff',
          border: 'none',
          borderRadius: '6px',
          fontWeight: 'bold',
          fontSize: '14px'
        };
      default:
        return {};
    }
  };

  const handleAdSizeChange = useCallback((newAdSize) => {
    setCanvasState(prev => ({
      ...prev,
      meta: { ...prev.meta, adSize: newAdSize }
    }));
  }, []);

  const handleBackgroundChange = useCallback((backgroundImage) => {
    setCanvasState(prev => ({
      ...prev,
      meta: { ...prev.meta, backgroundImage }
    }));
  }, []);

  const handlePublish = useCallback(() => {
    // Convert canvas state back to the format expected by the publish screen
    const customizedAdData = {
      ...adData,
      headline: canvasState.elements.find(el => el.id === 'headline-1')?.content || '',
      description: canvasState.elements.find(el => el.id === 'description-1')?.content || '',
      ctaText: canvasState.elements.find(el => el.type === 'button')?.content || 'Shop Now',
      adSize: canvasState.meta.adSize,
      backgroundImage: canvasState.meta.backgroundImage,
      canvasData: canvasState, // Include full canvas state for future editing
      campaignName: campaignSettings?.campaign?.name || 'Unnamed Campaign',
      audience: campaignSettings?.audience || {}
    };

    onPublish(customizedAdData);
  }, [canvasState, adData, campaignSettings, onPublish]);

  const selectedElement = canvasState.elements.find(el => el.id === selectedElementId);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Design Toolbar */}
      <div className="w-full fixed top-0 z-40 bg-white border-b border-gray-200">
        <DesignToolbar 
          canvasState={canvasState}
          onElementAdd={handleElementAdd}
          onAdSizeChange={handleAdSizeChange}
          selectedElement={selectedElement}
        />
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex pt-16">
        {/* Canvas Workspace */}
        <div className="flex-1 flex items-center justify-center p-8 bg-gray-100">
          <div className="relative">
            <CanvasWorkspace
              canvasState={canvasState}
              canvasDimensions={canvasDimensions}
              selectedElementId={selectedElementId}
              onElementSelect={handleElementSelect}
              onElementUpdate={handleElementUpdate}
            />
          </div>
        </div>

        {/* Design Controls Panel */}
        <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
          <DesignControls
            canvasState={canvasState}
            selectedElement={selectedElement}
            onElementUpdate={handleElementUpdate}
            onBackgroundChange={handleBackgroundChange}
            onPublish={handlePublish}
            campaignSettings={campaignSettings}
          />
        </div>
      </div>
    </div>
  );
}

export default CanvasEditor; 