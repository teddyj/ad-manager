import React, { useState, useCallback, useRef, useEffect } from 'react';

/**
 * ElementControls Component
 * Advanced element manipulation for Phase 5: Advanced Controls & Interactions
 * Features transform handles, snap guides, grouping, layering, and lock/unlock
 */
function ElementControls({ 
  element, 
  canvasDimensions,
  isSelected,
  onElementUpdate,
  onElementGroup,
  onElementUngroup,
  onElementDelete,
  onElementDuplicate,
  onElementLock,
  snapGuides = [],
  showSnapGuides = true,
  onSnapGuideCreate
}) {
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [initialState, setInitialState] = useState(null);
  const [rotation, setRotation] = useState(element.rotation || 0);
  
  const controlsRef = useRef(null);

  // Handle sizes and positions
  const handleSize = 8;
  const rotateHandleDistance = 20;

  // Calculate transform handles positions
  const getHandlePositions = useCallback(() => {
    const { position, size } = element;
    const { x, y } = position;
    const { width, height } = size;

    return {
      // Corner handles
      topLeft: { x: x - handleSize/2, y: y - handleSize/2 },
      topRight: { x: x + width - handleSize/2, y: y - handleSize/2 },
      bottomLeft: { x: x - handleSize/2, y: y + height - handleSize/2 },
      bottomRight: { x: x + width - handleSize/2, y: y + height - handleSize/2 },
      
      // Side handles
      topCenter: { x: x + width/2 - handleSize/2, y: y - handleSize/2 },
      bottomCenter: { x: x + width/2 - handleSize/2, y: y + height - handleSize/2 },
      leftCenter: { x: x - handleSize/2, y: y + height/2 - handleSize/2 },
      rightCenter: { x: x + width - handleSize/2, y: y + height/2 - handleSize/2 },
      
      // Rotation handle
      rotate: { 
        x: x + width/2 - handleSize/2, 
        y: y - rotateHandleDistance - handleSize/2 
      }
    };
  }, [element.position, element.size, handleSize, rotateHandleDistance]);

  // Start resize operation
  const handleResizeStart = useCallback((e, handle) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (element.locked) return;

    setIsResizing(true);
    setResizeHandle(handle);
    setInitialState({
      position: { ...element.position },
      size: { ...element.size },
      mouseX: e.clientX,
      mouseY: e.clientY
    });
  }, [element]);

  // Handle resize
  const handleResize = useCallback((e) => {
    if (!isResizing || !initialState || !resizeHandle) return;

    const deltaX = e.clientX - initialState.mouseX;
    const deltaY = e.clientY - initialState.mouseY;
    
    let newPosition = { ...initialState.position };
    let newSize = { ...initialState.size };

    // Calculate new dimensions based on handle
    switch (resizeHandle) {
      case 'topLeft':
        newPosition.x = Math.max(0, initialState.position.x + deltaX);
        newPosition.y = Math.max(0, initialState.position.y + deltaY);
        newSize.width = Math.max(20, initialState.size.width - deltaX);
        newSize.height = Math.max(20, initialState.size.height - deltaY);
        break;
      
      case 'topRight':
        newPosition.y = Math.max(0, initialState.position.y + deltaY);
        newSize.width = Math.max(20, initialState.size.width + deltaX);
        newSize.height = Math.max(20, initialState.size.height - deltaY);
        break;
      
      case 'bottomLeft':
        newPosition.x = Math.max(0, initialState.position.x + deltaX);
        newSize.width = Math.max(20, initialState.size.width - deltaX);
        newSize.height = Math.max(20, initialState.size.height + deltaY);
        break;
      
      case 'bottomRight':
        newSize.width = Math.max(20, initialState.size.width + deltaX);
        newSize.height = Math.max(20, initialState.size.height + deltaY);
        break;
      
      case 'topCenter':
        newPosition.y = Math.max(0, initialState.position.y + deltaY);
        newSize.height = Math.max(20, initialState.size.height - deltaY);
        break;
      
      case 'bottomCenter':
        newSize.height = Math.max(20, initialState.size.height + deltaY);
        break;
      
      case 'leftCenter':
        newPosition.x = Math.max(0, initialState.position.x + deltaX);
        newSize.width = Math.max(20, initialState.size.width - deltaX);
        break;
      
      case 'rightCenter':
        newSize.width = Math.max(20, initialState.size.width + deltaX);
        break;
    }

    // Ensure element stays within canvas bounds
    newPosition.x = Math.max(0, Math.min(newPosition.x, canvasDimensions.width - newSize.width));
    newPosition.y = Math.max(0, Math.min(newPosition.y, canvasDimensions.height - newSize.height));

    // Apply snap guides if enabled
    if (showSnapGuides && onSnapGuideCreate) {
      const snapResult = applySnapGuides(newPosition, newSize);
      newPosition = snapResult.position;
    }

    onElementUpdate(element.id, {
      position: newPosition,
      size: newSize
    });
  }, [isResizing, initialState, resizeHandle, canvasDimensions, element.id, onElementUpdate, showSnapGuides, onSnapGuideCreate]);

  // Start rotation
  const handleRotateStart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (element.locked) return;

    setIsRotating(true);
    setInitialState({
      rotation: rotation,
      centerX: element.position.x + element.size.width / 2,
      centerY: element.position.y + element.size.height / 2,
      mouseX: e.clientX,
      mouseY: e.clientY
    });
  }, [element, rotation]);

  // Handle rotation
  const handleRotate = useCallback((e) => {
    if (!isRotating || !initialState) return;

    const centerX = initialState.centerX;
    const centerY = initialState.centerY;
    
    const initialAngle = Math.atan2(initialState.mouseY - centerY, initialState.mouseX - centerX);
    const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    
    const deltaAngle = (currentAngle - initialAngle) * (180 / Math.PI);
    const newRotation = (initialState.rotation + deltaAngle) % 360;
    
    setRotation(newRotation);
    onElementUpdate(element.id, { rotation: newRotation });
  }, [isRotating, initialState, element.id, onElementUpdate]);

  // Stop manipulations
  const handleManipulationEnd = useCallback(() => {
    setIsResizing(false);
    setIsRotating(false);
    setResizeHandle(null);
    setInitialState(null);
  }, []);

  // Apply snap guides
  const applySnapGuides = useCallback((position, size) => {
    if (!snapGuides.length) return { position };

    const snapThreshold = 5;
    let snappedPosition = { ...position };
    
    // Check for snap positions
    snapGuides.forEach(guide => {
      // Horizontal snapping
      if (Math.abs(position.x - guide.x) < snapThreshold) {
        snappedPosition.x = guide.x;
      }
      if (Math.abs(position.x + size.width - guide.x) < snapThreshold) {
        snappedPosition.x = guide.x - size.width;
      }
      if (Math.abs(position.x + size.width/2 - guide.x) < snapThreshold) {
        snappedPosition.x = guide.x - size.width/2;
      }
      
      // Vertical snapping
      if (Math.abs(position.y - guide.y) < snapThreshold) {
        snappedPosition.y = guide.y;
      }
      if (Math.abs(position.y + size.height - guide.y) < snapThreshold) {
        snappedPosition.y = guide.y - size.height;
      }
      if (Math.abs(position.y + size.height/2 - guide.y) < snapThreshold) {
        snappedPosition.y = guide.y - size.height/2;
      }
    });

    return { position: snappedPosition };
  }, [snapGuides]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isSelected) return;

      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          if (onElementDelete) onElementDelete(element.id);
          break;
        case 'd':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (onElementDuplicate) onElementDuplicate(element.id);
          }
          break;
        case 'l':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (onElementLock) onElementLock(element.id, !element.locked);
          }
          break;
        case 'g':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (onElementGroup) onElementGroup([element.id]);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isSelected, element.id, element.locked, onElementDelete, onElementDuplicate, onElementLock, onElementGroup]);

  // Global mouse events
  useEffect(() => {
    if (isResizing || isRotating) {
      const handleMouseMove = (e) => {
        if (isResizing) handleResize(e);
        if (isRotating) handleRotate(e);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleManipulationEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleManipulationEnd);
      };
    }
  }, [isResizing, isRotating, handleResize, handleRotate, handleManipulationEnd]);

  if (!isSelected || element.locked) {
    return null;
  }

  const handles = getHandlePositions();

  return (
    <div
      ref={controlsRef}
      className="absolute pointer-events-none"
      style={{
        left: 0,
        top: 0,
        width: canvasDimensions.width,
        height: canvasDimensions.height,
        zIndex: 1000
      }}
    >
      {/* Selection Outline */}
      <div
        className="absolute border-2 border-blue-500 pointer-events-none"
        style={{
          left: element.position.x - 1,
          top: element.position.y - 1,
          width: element.size.width + 2,
          height: element.size.height + 2,
          transform: `rotate(${rotation}deg)`,
          transformOrigin: `${element.size.width/2 + 1}px ${element.size.height/2 + 1}px`
        }}
      />

      {/* Corner Handles */}
      {['topLeft', 'topRight', 'bottomLeft', 'bottomRight'].map(handle => (
        <div
          key={handle}
          className="absolute bg-blue-500 border border-white cursor-nw-resize pointer-events-auto hover:bg-blue-600 transition-colors"
          style={{
            left: handles[handle].x,
            top: handles[handle].y,
            width: handleSize,
            height: handleSize,
            cursor: handle.includes('top') 
              ? (handle.includes('Left') ? 'nw-resize' : 'ne-resize')
              : (handle.includes('Left') ? 'sw-resize' : 'se-resize')
          }}
          onMouseDown={(e) => handleResizeStart(e, handle)}
        />
      ))}

      {/* Side Handles */}
      {['topCenter', 'bottomCenter', 'leftCenter', 'rightCenter'].map(handle => (
        <div
          key={handle}
          className="absolute bg-blue-500 border border-white pointer-events-auto hover:bg-blue-600 transition-colors"
          style={{
            left: handles[handle].x,
            top: handles[handle].y,
            width: handleSize,
            height: handleSize,
            cursor: handle.includes('Center') 
              ? (handle.includes('top') || handle.includes('bottom') ? 'n-resize' : 'e-resize')
              : 'move'
          }}
          onMouseDown={(e) => handleResizeStart(e, handle)}
        />
      ))}

      {/* Rotation Handle */}
      <div
        className="absolute bg-green-500 border border-white rounded-full cursor-crosshair pointer-events-auto hover:bg-green-600 transition-colors"
        style={{
          left: handles.rotate.x,
          top: handles.rotate.y,
          width: handleSize,
          height: handleSize
        }}
        onMouseDown={handleRotateStart}
      />

      {/* Rotation Line */}
      <div
        className="absolute border-l border-green-500 pointer-events-none"
        style={{
          left: element.position.x + element.size.width/2,
          top: element.position.y - rotateHandleDistance,
          height: rotateHandleDistance
        }}
      />

      {/* Action Buttons */}
      <div
        className="absolute flex space-x-1 pointer-events-auto"
        style={{
          left: element.position.x + element.size.width + 8,
          top: element.position.y
        }}
      >
        {/* Lock/Unlock Button */}
        <button
          onClick={() => onElementLock && onElementLock(element.id, !element.locked)}
          className="w-6 h-6 bg-white border border-gray-300 rounded text-xs hover:bg-gray-50 transition-colors"
          title={element.locked ? 'Unlock element' : 'Lock element'}
        >
          {element.locked ? '🔒' : '🔓'}
        </button>

        {/* Duplicate Button */}
        <button
          onClick={() => onElementDuplicate && onElementDuplicate(element.id)}
          className="w-6 h-6 bg-white border border-gray-300 rounded text-xs hover:bg-gray-50 transition-colors"
          title="Duplicate element (Ctrl+D)"
        >
          📋
        </button>

        {/* Delete Button */}
        <button
          onClick={() => onElementDelete && onElementDelete(element.id)}
          className="w-6 h-6 bg-white border border-gray-300 rounded text-xs hover:bg-red-50 hover:text-red-600 transition-colors"
          title="Delete element (Delete)"
        >
          🗑️
        </button>
      </div>

      {/* Element Info */}
      <div
        className="absolute bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded pointer-events-none"
        style={{
          left: element.position.x,
          top: element.position.y - 20
        }}
      >
        {element.size.width} × {element.size.height}
        {rotation !== 0 && ` • ${Math.round(rotation)}°`}
      </div>
    </div>
  );
}

export default ElementControls; 