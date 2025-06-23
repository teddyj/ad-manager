import React, { useState, useRef, useEffect, useCallback } from 'react';
import CanvasWorkspace from './CanvasWorkspace.jsx';
import ElementRenderer from './ElementRenderer.jsx';
import ElementControls from './ElementControls.jsx';
import SnapGuides from './SnapGuides.jsx';
import DesignControls from '../design/DesignControls.jsx';
import DesignToolbar from '../design/DesignToolbar.jsx';
import { TEXT_STYLES, createDefaultTextElement } from '../../constants/textStyles.js';

/**
 * CanvasEditor - Main canvas-based creative builder component
 * Enhanced for Phase 7 with responsive design support
 */
function CanvasEditor({ 
  adData, 
  campaignSettings, 
  onPublish,
  initialAdSize = '300x250',
  dbOperations, // Add dbOperations for background customization
  // Phase 7: Responsive mode props
  isResponsiveMode = false,
  currentFormat = null,
  canvasState: providedCanvasState = null,
  onCanvasStateChange = null,
  readonly = false,
  viewportScale = 1,
  showScaleControls = false,
  onScaleChange = null,
  onFitToScreen = null
}) {
  // Canvas state initialization function
  const getInitialCanvasState = useCallback(() => ({
    meta: {
      adSize: initialAdSize,
      backgroundImage: null, // Don't use product image as background
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
          ...TEXT_STYLES.HEADLINE_SECONDARY,
          // Remove non-CSS properties for styling
          id: undefined,
          name: undefined,
          category: undefined
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
          ...TEXT_STYLES.BODY_TEXT,
          textAlign: 'center', // Override alignment for this specific element
          // Remove non-CSS properties for styling
          id: undefined,
          name: undefined,
          category: undefined
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
  }), [initialAdSize, adData]);

  // Active canvas state management - Fixed for proper callback handling
  const [internalCanvasState, setInternalCanvasState] = useState(providedCanvasState || getInitialCanvasState());
  const activeCanvasState = providedCanvasState || internalCanvasState;
  
  // Add a ref to track the latest state to prevent stale closures
  const latestCanvasStateRef = useRef(activeCanvasState);
  latestCanvasStateRef.current = activeCanvasState;

  // Add debouncing for rapid style changes (like font size adjustments)
  const [pendingUpdates, setPendingUpdates] = useState(new Map());
  const updateTimeoutRef = useRef(null);

  // Fixed setActiveCanvasState to handle both function updaters and direct values
  const setActiveCanvasState = useCallback((newStateOrUpdater) => {
    if (onCanvasStateChange) {
      // When we have an external callback, we need to resolve the updater function first
      if (typeof newStateOrUpdater === 'function') {
        const currentState = latestCanvasStateRef.current;
        const newState = newStateOrUpdater(currentState);
        console.log('🔧 Calling onCanvasStateChange with resolved state:', {
          elementsCount: newState?.elements?.length,
          hasChanges: JSON.stringify(currentState) !== JSON.stringify(newState)
        });
        onCanvasStateChange(newState);
        latestCanvasStateRef.current = newState;
      } else {
        console.log('🔧 Calling onCanvasStateChange with direct state:', {
          elementsCount: newStateOrUpdater?.elements?.length
        });
        onCanvasStateChange(newStateOrUpdater);
        latestCanvasStateRef.current = newStateOrUpdater;
      }
    } else {
      // For internal state, we can use the updater function directly
      console.log('🔧 Using internal state setter');
      setInternalCanvasState(newStateOrUpdater);
      if (typeof newStateOrUpdater !== 'function') {
        latestCanvasStateRef.current = newStateOrUpdater;
      }
    }
  }, [onCanvasStateChange]);

  // Debounced style update handler to prevent rapid successive updates
  const handleStyleUpdate = useCallback((elementId, styleUpdates) => {
    
    // Update pending updates map
    setPendingUpdates(prev => {
      const newUpdates = new Map(prev);
      const existingUpdates = newUpdates.get(elementId) || {};
      newUpdates.set(elementId, { ...existingUpdates, ...styleUpdates });
      return newUpdates;
    });

    // Clear existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Set new timeout for batched updates
    updateTimeoutRef.current = setTimeout(() => {
      setPendingUpdates(currentPending => {
        if (currentPending.size === 0) return currentPending;

        // Apply all pending updates
        setActiveCanvasState(prev => {
          const newElements = (prev?.elements || []).map(el => {
            const updates = currentPending.get(el.id);
            if (updates) {
              return {
                ...el,
                styles: { ...el.styles, ...updates }
              };
            }
            return el;
          });

          return {
            ...prev,
            elements: newElements
          };
        });

        // Clear pending updates
        return new Map();
      });
    }, 50); // Very short debounce for responsiveness
  }, [setActiveCanvasState]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  // Selected element state
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [selectedElementIds, setSelectedElementIds] = useState([]);
  const [snapGuides, setSnapGuides] = useState([]);
  const [showSnapGuides, setShowSnapGuides] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  
  // Canvas dimensions based on ad size
  const getCanvasDimensions = useCallback((adSize) => {
    const [width, height] = adSize.split('x').map(Number);
    return { width, height };
  }, []);

  const canvasDimensions = getCanvasDimensions(activeCanvasState?.meta?.adSize || initialAdSize);

  // Element manipulation handlers
  const handleElementUpdate = useCallback((elementId, updates) => {
    if (readonly) return;

    // Special handling for style-only updates to prevent conflicts
    if (updates.styles && Object.keys(updates).length === 1) {
      handleStyleUpdate(elementId, updates.styles);
      return;
    }
    
    setActiveCanvasState(prev => {
      const currentState = latestCanvasStateRef.current;
      const oldElements = currentState?.elements || [];
      const newElements = oldElements.map(el => {
        if (el.id === elementId) {
          // Deep merge to preserve all properties
          const updatedElement = {
            ...el,
            ...updates,
            // Ensure position and size are properly merged if they exist
            position: updates.position ? { ...el.position, ...updates.position } : el.position,
            size: updates.size ? { ...el.size, ...updates.size } : el.size,
            styles: updates.styles ? { ...el.styles, ...updates.styles } : el.styles
          };
          
          // Validate only the properties being updated
          if (updates.position && (typeof updates.position.x !== 'number' || typeof updates.position.y !== 'number')) {
            console.error('❌ Invalid position update, keeping original:', updates.position);
            return el; // Return original element if position update is invalid
          }
          
          if (updates.size && (typeof updates.size.width !== 'number' || typeof updates.size.height !== 'number')) {
            console.error('❌ Invalid size update, keeping original:', updates.size);
            return el; // Return original element if size update is invalid
          }
          
          return updatedElement;
        }
        return el;
      });
      
      // Return updated canvas state
      
      return {
        ...currentState,
        elements: newElements
      };
    });
  }, [setActiveCanvasState, readonly, handleStyleUpdate]);

  const handleElementSelect = useCallback((elementId) => {
    if (readonly) return;
    // Prevent unnecessary re-selections
    if (selectedElementId === elementId) return;
    setSelectedElementId(elementId);
  }, [readonly, selectedElementId]);

  const handleElementAdd = useCallback((elementType, position = { x: 50, y: 50 }, textStyle = null, customElement = null) => {
    if (readonly) return;
    
    const elements = activeCanvasState?.elements || [];
    
    // If a complete custom element is provided, use it directly
    if (customElement && customElement.id && customElement.type) {
      const elementWithZIndex = {
        ...customElement,
        zIndex: Math.max(...elements.map(el => el.zIndex), 0) + 1
      };

      // Remove the special flag before adding to canvas
      const { _preventAutoSelect, ...cleanElement } = elementWithZIndex;
      setActiveCanvasState(prev => ({
        ...prev,
        elements: [...(prev?.elements || []), cleanElement]
      }));
      
      // Only auto-select if not prevented
      if (!_preventAutoSelect) {
        setSelectedElementId(cleanElement.id);
      }
      
      return;
    }

    // Default element creation for standard types
    const newElement = {
      id: `${elementType}-${Date.now()}`,
      type: elementType,
      content: elementType === 'text' ? 'New Text' : 
               elementType === 'button' ? 'Button' : '',
      position,
      size: elementType === 'text' ? { width: 150, height: 30 } :
            elementType === 'button' ? { width: 100, height: 40 } :
            { width: 100, height: 100 },
      zIndex: Math.max(...elements.map(el => el.zIndex), 0) + 1,
      styles: textStyle ? {
        ...textStyle,
        // Remove non-CSS properties for styling
        id: undefined,
        name: undefined,
        category: undefined
      } : getDefaultStyles(elementType),
      interactive: true,
      locked: false,
      // Add shape-specific properties
      ...(elementType === 'shape' && { shapeType: position || 'rectangle' }) // position parameter used for shapeType when creating shapes
    };

    setActiveCanvasState(prev => ({
      ...prev,
      elements: [...(prev?.elements || []), newElement]
    }));

    setSelectedElementId(newElement.id);
  }, [activeCanvasState?.elements, setActiveCanvasState, readonly]);

  const getDefaultStyles = (elementType) => {
    switch (elementType) {
      case 'text':
        return {
          ...TEXT_STYLES.BODY_TEXT,
          // Remove non-CSS properties for styling
          id: undefined,
          name: undefined,
          category: undefined
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
      case 'shape':
        return {
          backgroundColor: '#3b82f6',
          border: 'none',
          borderRadius: '0px'
        };
      default:
        return {};
    }
  };

  const handleAdSizeChange = useCallback((newAdSize) => {
    if (readonly) return;
    
    setActiveCanvasState(prev => ({
      ...prev,
      meta: { ...prev.meta, adSize: newAdSize }
    }));
  }, [setActiveCanvasState, readonly]);

  const handleBackgroundChange = useCallback((backgroundImage) => {
    if (readonly) return;
    
    setActiveCanvasState(prev => {
      // Ensure we have a valid previous state
      if (!prev || typeof prev !== 'object') {
        console.error('❌ Previous canvas state is invalid:', prev);
        return prev; // Don't update if prev state is invalid
      }
      
      return {
        ...prev,
        meta: { 
          ...prev.meta, 
          backgroundImage 
        }
      };
    });
  }, [setActiveCanvasState, readonly]);

  const handlePublish = useCallback(() => {
    // Convert canvas state back to the format expected by the publish screen
    const elements = activeCanvasState?.elements || [];
    
    // Find text elements more comprehensively
    const textElements = elements.filter(el => el.type === 'text');
    const buttonElements = elements.filter(el => el.type === 'button');
    const imageElements = elements.filter(el => el.type === 'image' || el.type === 'product');
    
    // Extract headline (first large text or text with "headline" in ID/content)
    const headlineElement = textElements.find(el => 
      el.id?.includes('headline') || 
      el.content?.toLowerCase().includes('headline') ||
      (el.styles?.fontSize && parseInt(el.styles.fontSize) > 20)
    ) || textElements[0];
    
    // Extract description (remaining text elements)
    const descriptionElement = textElements.find(el => 
      el.id?.includes('description') || 
      el.id?.includes('desc') ||
      (el !== headlineElement && el.content?.length > 20)
    ) || textElements[1];
    
    // Extract CTA from button
    const ctaElement = buttonElements[0];
    
    // Get primary image
    const primaryImage = imageElements[0];
    
    console.log('🔄 Capturing edited canvas state:', {
      elements: elements.length,
      textElements: textElements.length,
      buttonElements: buttonElements.length,
      imageElements: imageElements.length,
      headline: headlineElement?.content,
      description: descriptionElement?.content,
      cta: ctaElement?.content
    });
    
    const customizedAdData = {
      ...(adData || {}),
      // Capture edited text content
      headline: headlineElement?.content || adData?.headline || '',
      description: descriptionElement?.content || adData?.description || '',
      ctaText: ctaElement?.content || adData?.ctaText || 'Shop Now',
      
      // Capture canvas settings
      adSize: activeCanvasState?.meta?.adSize || initialAdSize,
      backgroundImage: activeCanvasState?.meta?.backgroundImage || adData?.backgroundImage,
      
      // Capture image updates
      imageUrl: primaryImage?.content || primaryImage?.src || adData?.imageUrl || adData?.url,
      url: primaryImage?.content || primaryImage?.src || adData?.url || adData?.imageUrl,
      
      // Include full canvas state for complete editing context
      canvasData: activeCanvasState,
      elements: elements, // Include all elements for rendering
      
      // Preserve campaign info
      campaignName: campaignSettings?.campaign?.name || 'Unnamed Campaign',
      audience: campaignSettings?.audience || {},
      
      // Preserve other original data
      clickUrl: adData?.clickUrl,
      ctaType: adData?.ctaType,
      product: adData?.product,
      productId: adData?.productId,
      utmData: adData?.utmData
    };
    
    console.log('🚀 Publishing customized ad data:', customizedAdData);
    if (onPublish && typeof onPublish === 'function') {
      onPublish(customizedAdData);
    } else {
      console.warn('⚠️ onPublish function not provided to CanvasEditor');
    }
  }, [activeCanvasState, adData, campaignSettings, onPublish, initialAdSize]);

  // Phase 5: Advanced Controls & Interactions handlers
  const handleElementDelete = useCallback((elementId) => {
    if (readonly) return;
    
    setActiveCanvasState(prev => ({
      ...prev,
      elements: (prev?.elements || []).filter(el => el.id !== elementId)
    }));
    
    if (selectedElementId === elementId) {
      setSelectedElementId(null);
    }
    
    setSelectedElementIds(prev => prev.filter(id => id !== elementId));
  }, [selectedElementId, setActiveCanvasState, readonly]);

  const handleElementDuplicate = useCallback((elementId) => {
    if (readonly) return;
    
    const elements = activeCanvasState?.elements || [];
    const element = elements.find(el => el.id === elementId);
    if (element) {
      const duplicatedElement = {
        ...element,
        id: `${element.type}-${Date.now()}`,
        position: {
          x: element.position.x + 20,
          y: element.position.y + 20
        },
        zIndex: Math.max(...elements.map(el => el.zIndex), 0) + 1
      };

      setActiveCanvasState(prev => ({
        ...prev,
        elements: [...(prev?.elements || []), duplicatedElement]
      }));

      setSelectedElementId(duplicatedElement.id);
    }
  }, [activeCanvasState?.elements, setActiveCanvasState, readonly]);

  const handleElementLock = useCallback((elementId, locked) => {
    handleElementUpdate(elementId, { locked });
  }, [handleElementUpdate]);

  const handleElementGroup = useCallback((elementIds) => {
    if (readonly || elementIds.length < 2) return;

    // Implementation would create a group element
    console.log('Grouping elements:', elementIds);
  }, [readonly]);

  const handleElementUngroup = useCallback((groupId) => {
    if (readonly) return;
    
    // Implementation would ungroup elements
    console.log('Ungrouping element:', groupId);
  }, [readonly]);

  const handleLayerReorder = useCallback((elementId, newZIndex) => {
    handleElementUpdate(elementId, { zIndex: newZIndex });
  }, [handleElementUpdate]);

  const handleMultiElementUpdate = useCallback((updates) => {
    if (readonly) return;
    
    setActiveCanvasState(prev => ({
      ...prev,
      elements: (prev?.elements || []).map(el => 
        updates[el.id] ? { ...el, ...updates[el.id] } : el
      )
    }));
  }, [setActiveCanvasState, readonly]);

  const handleSnapGuideCreate = useCallback((guides) => {
    setSnapGuides(guides);
  }, []);

  const selectedElement = activeCanvasState?.elements?.find(el => el.id === selectedElementId);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Design Toolbar - Enhanced for Phase 7 */}
      <div className="w-full fixed top-0 z-40 bg-white border-b border-gray-200">
        <DesignToolbar 
          canvasState={activeCanvasState}
          onElementAdd={handleElementAdd}
          onAdSizeChange={handleAdSizeChange}
          selectedElement={selectedElement}
          isResponsiveMode={isResponsiveMode}
          currentFormat={currentFormat}
        />
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex pt-16">
        {/* Canvas Workspace */}
        <div className="flex-1 flex items-center justify-center p-8 bg-gray-100 relative overflow-auto">
          <div 
            className={`relative ${viewportScale < 1 ? 'shadow-lg rounded-lg overflow-hidden bg-white' : ''}`}
            style={viewportScale < 1 ? {
              transform: `scale(${viewportScale})`,
              transformOrigin: 'center center',
              width: canvasDimensions.width,
              height: canvasDimensions.height
            } : {}}
          >
            <CanvasWorkspace
              canvasState={activeCanvasState}
              canvasDimensions={canvasDimensions}
              selectedElementId={selectedElementId}
              onElementSelect={handleElementSelect}
              onElementUpdate={handleElementUpdate}
              onElementAdd={handleElementAdd}
              readonly={readonly}
            />
            
            {/* Phase 5: Snap Guides */}
            <SnapGuides
              elements={activeCanvasState?.elements || []}
              activeElementId={isDragging ? selectedElementId : null}
              canvasDimensions={canvasDimensions}
              showGuides={showSnapGuides}
              showMeasurements={true}
            />

            {/* Phase 5: Element Controls */}
            {selectedElement && !readonly && (
              <ElementControls
                element={selectedElement}
                canvasDimensions={canvasDimensions}
                isSelected={true}
                onElementUpdate={handleElementUpdate}
                onElementGroup={handleElementGroup}
                onElementUngroup={handleElementUngroup}
                onElementDelete={handleElementDelete}
                onElementDuplicate={handleElementDuplicate}
                onElementLock={handleElementLock}
                snapGuides={snapGuides}
                showSnapGuides={showSnapGuides}
                onSnapGuideCreate={handleSnapGuideCreate}
              />
            )}
          </div>
          
          {/* Continue Button - Bottom Right Corner */}
          {!readonly && (
            <div className="absolute bottom-4 right-4 z-50">
              <button
                onClick={handlePublish}
                className="px-6 py-3 bg-[#F7941D] hover:bg-orange-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
                title="Continue to next step"
              >
                <span>Continue</span>
                <span className="text-lg">→</span>
              </button>
            </div>
          )}

          {/* Scale Controls */}
          {showScaleControls && (
            <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white text-xs px-3 py-2 rounded-lg flex items-center space-x-2 z-50">
              <span>Scale: {Math.round(viewportScale * 100)}%</span>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => {
                    if (onScaleChange) {
                      const newScale = Math.min(viewportScale + 0.1, 1);
                      onScaleChange(newScale);
                    }
                  }}
                  className="text-white hover:text-gray-300 text-sm"
                  title="Zoom In"
                >
                  +
                </button>
                <button
                  onClick={() => {
                    if (onScaleChange) {
                      const newScale = Math.max(viewportScale - 0.1, 0.1);
                      onScaleChange(newScale);
                    }
                  }}
                  className="text-white hover:text-gray-300 text-sm"
                  title="Zoom Out"
                >
                  -
                </button>
                <button
                  onClick={() => {
                    if (onFitToScreen) {
                      onFitToScreen();
                    }
                  }}
                  className="text-white hover:text-gray-300 text-xs px-1"
                  title="Fit to Screen"
                >
                  FIT
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Design Controls Panel - Always show unless readonly */}
        {!readonly && (
          <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
            <DesignControls
              key="design-controls-panel"
              canvasState={activeCanvasState}
              selectedElement={selectedElement}
              onElementUpdate={handleElementUpdate}
              onElementAdd={handleElementAdd}
              onBackgroundChange={handleBackgroundChange}
              onPublish={handlePublish}
              campaignSettings={campaignSettings}
              dbOperations={dbOperations}
              selectedElementId={selectedElementId}
              selectedElementIds={selectedElementIds}
              onElementSelect={handleElementSelect}
              onElementDelete={handleElementDelete}
              onElementDuplicate={handleElementDuplicate}
              onElementLock={handleElementLock}
              onElementGroup={handleElementGroup}
              onElementUngroup={handleElementUngroup}
              onLayerReorder={handleLayerReorder}
              onMultiElementUpdate={handleMultiElementUpdate}
              readonly={readonly}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default CanvasEditor; 