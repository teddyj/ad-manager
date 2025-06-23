import React, { useRef, useCallback, useState } from 'react';
import ElementRenderer from './ElementRenderer.jsx';
import { createAssetElement } from '../../constants/assetLibrary.js';

/**
 * CanvasWorkspace - The main design surface for drag-and-drop element manipulation
 */
function CanvasWorkspace({
  canvasState,
  canvasDimensions,
  selectedElementId,
  onElementSelect,
  onElementUpdate,
  onElementAdd,
  readonly = false
}) {
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Handle mouse down on canvas elements
  const handleMouseDown = useCallback((e, elementId) => {
    if (readonly) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🖱️ Mouse down on element:', elementId);
    const element = canvasState?.elements?.find(el => el.id === elementId);
    
    if (!element) {
      console.warn('❌ Element not found for drag:', elementId);
      return;
    }
    
    if (element.locked) {
      console.warn('🔒 Element is locked:', elementId);
      return;
    }
    
    console.log('✅ Starting drag for element:', {
      id: elementId,
      type: element.type,
      position: element.position
    });

    // Select the element
    onElementSelect(elementId);

    // Start dragging
    if (!canvasRef.current) {
      console.warn('Canvas ref is null during mouse down');
      return;
    }
    
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    const canvasX = clientX - rect.left;
    const canvasY = clientY - rect.top;

    setIsDragging(true);
    setDragStart({ x: canvasX, y: canvasY });
    setDragOffset({
      x: canvasX - element.position.x,
      y: canvasY - element.position.y
    });
  }, [canvasState?.elements, onElementSelect, readonly]);



  // Handle clicking on empty canvas area
  const handleCanvasClick = useCallback((e) => {
    if (readonly) return;
    
    if (e.target === canvasRef.current) {
      onElementSelect(null); // Deselect all elements
    }
  }, [onElementSelect, readonly]);

  // Handle drag over for asset drop
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  // Handle asset drop
  const handleDrop = useCallback((e) => {
    if (readonly) return;
    
    e.preventDefault();
    
    try {
      const assetData = e.dataTransfer.getData('application/json');
      if (assetData) {
        const asset = JSON.parse(assetData);
        
        // Calculate drop position relative to canvas
        if (!canvasRef.current) {
          console.warn('Canvas ref is null during drop');
          return;
        }
        
        const rect = canvasRef.current.getBoundingClientRect();
        const dropX = Math.max(0, Math.min(e.clientX - rect.left - 30, canvasDimensions.width - 60));
        const dropY = Math.max(0, Math.min(e.clientY - rect.top - 30, canvasDimensions.height - 60));
        
        // Create element from asset
        const element = createAssetElement(asset, { x: dropX, y: dropY });
        
        // Add to canvas using onElementAdd
        if (onElementAdd) {
          onElementAdd('custom', { x: dropX, y: dropY }, null, element);
        }
      }
    } catch (error) {
      console.error('Error handling asset drop:', error);
    }
  }, [canvasDimensions, onElementAdd, readonly]);

  // Add global mouse event listeners
  React.useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e) => {
      if (!selectedElementId || !canvasRef.current) return;
      
      const rect = canvasRef.current.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      
      const canvasX = clientX - rect.left;
      const canvasY = clientY - rect.top;

      // Calculate new position
      const newX = Math.max(0, Math.min(canvasX - dragOffset.x, canvasDimensions.width - 50));
      const newY = Math.max(0, Math.min(canvasY - dragOffset.y, canvasDimensions.height - 20));

      // Update element position
      onElementUpdate(selectedElementId, {
        position: { x: newX, y: newY }
      });
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      setDragStart({ x: 0, y: 0 });
      setDragOffset({ x: 0, y: 0 });
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('touchmove', handleGlobalMouseMove);
    document.addEventListener('touchend', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchmove', handleGlobalMouseMove);
      document.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, [isDragging, selectedElementId, dragOffset, canvasDimensions, onElementUpdate]);

  return (
    <div className="relative">
      {/* Canvas Container */}
      <div
        ref={canvasRef}
        className="relative bg-white shadow-lg border border-gray-300 overflow-hidden cursor-default"
        style={{
          width: `${canvasDimensions.width}px`,
          height: `${canvasDimensions.height}px`,
          minWidth: `${canvasDimensions.width}px`,
          minHeight: `${canvasDimensions.height}px`
        }}
        onClick={handleCanvasClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Background Image */}
        {canvasState?.meta?.backgroundImage && (
          <img
            src={canvasState.meta.backgroundImage}
            alt="Background"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ zIndex: 0 }}
            draggable={false}
          />
        )}

        {/* Canvas Grid (optional helper) */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, #666 1px, transparent 1px),
              linear-gradient(to bottom, #666 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
            zIndex: 1
          }}
        />

        {/* Render All Elements */}
        {(canvasState?.elements || [])
          .filter(element => {
            // More thorough element validation with better debugging
            if (!element || typeof element !== 'object') {
              console.warn('❌ Invalid element (not object):', element);
              return false;
            }
            if (!element.id || typeof element.id !== 'string') {
              console.warn('❌ Invalid element.id (not string):', {
                id: element.id,
                idType: typeof element.id,
                element: element
              });
              return false;
            }
            if (!element.type || typeof element.type !== 'string') {
              console.warn('❌ Invalid element.type (not string):', {
                type: element.type,
                typeType: typeof element.type,
                element: element
              });
              return false;
            }
            
            // Additional validation for common issues
            if (element.id.includes('[object Object]')) {
              console.warn('❌ Element ID contains object reference:', element.id);
              return false;
            }
            
            // Debug position/size issues with more defensive checks
            if (!element.position || typeof element.position !== 'object' || 
                typeof element.position.x !== 'number' || typeof element.position.y !== 'number') {
              console.warn('❌ Invalid element.position for element:', element.id, {
                position: JSON.stringify(element.position),
                positionType: typeof element.position,
                hasX: element.position?.x,
                hasY: element.position?.y,
                xType: typeof element.position?.x,
                yType: typeof element.position?.y,
                xValue: element.position?.x,
                yValue: element.position?.y
              });
              return false;
            }
            
            if (!element.size || typeof element.size !== 'object' ||
                typeof element.size.width !== 'number' || typeof element.size.height !== 'number') {
              console.warn('❌ Invalid element.size:', {
                id: element.id,
                size: element.size,
                sizeType: typeof element.size,
                hasWidth: element.size?.width,
                hasHeight: element.size?.height,
                widthType: typeof element.size?.width,
                heightType: typeof element.size?.height
              });
              return false;
            }
            
            console.log('✅ Valid element:', {
              id: element.id,
              type: element.type,
              position: JSON.stringify(element.position),
              size: JSON.stringify(element.size),
              content: element.content ? 'HAS_CONTENT' : 'NO_CONTENT'
            });
            
            return true;
          })
          .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)) // Sort by z-index with fallback
          .map((element, index) => {
            // Ensure element.id is a string
            const elementId = String(element.id);
            return (
              <ElementRenderer
                key={`element-${elementId}`}
                element={element}
                isSelected={elementId === selectedElementId}
                onMouseDown={(e) => handleMouseDown(e, elementId)}
                onDoubleClick={() => {
                  // Handle double-click for inline editing
                  if (element.type === 'text') {
                    console.log('Double-clicked text element:', elementId);
                  }
                }}
                onElementUpdate={onElementUpdate}
              />
            );
          })}

        {/* Canvas Info */}
        <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded pointer-events-none">
          {canvasDimensions.width} × {canvasDimensions.height}
        </div>
      </div>

      {/* Canvas Scale Info */}
      <div className="absolute -bottom-6 left-0 text-xs text-gray-500">
        Ad Size: {canvasState?.meta?.adSize || 'Unknown'}
      </div>
    </div>
  );
}

export default CanvasWorkspace; 