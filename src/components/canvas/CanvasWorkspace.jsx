import React, { useRef, useCallback, useState } from 'react';
import ElementRenderer from './ElementRenderer.jsx';

/**
 * CanvasWorkspace - The main design surface for drag-and-drop element manipulation
 */
function CanvasWorkspace({
  canvasState,
  canvasDimensions,
  selectedElementId,
  onElementSelect,
  onElementUpdate
}) {
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Handle mouse down on canvas elements
  const handleMouseDown = useCallback((e, elementId) => {
    e.preventDefault();
    e.stopPropagation();
    
    const element = canvasState.elements.find(el => el.id === elementId);
    if (!element || element.locked) return;

    // Select the element
    onElementSelect(elementId);

    // Start dragging
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
  }, [canvasState.elements, onElementSelect]);

  // Handle mouse move for dragging
  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !selectedElementId) return;

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
  }, [isDragging, selectedElementId, dragOffset, canvasDimensions, onElementUpdate]);

  // Handle mouse up to stop dragging
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStart({ x: 0, y: 0 });
    setDragOffset({ x: 0, y: 0 });
  }, []);

  // Handle clicking on empty canvas area
  const handleCanvasClick = useCallback((e) => {
    if (e.target === canvasRef.current) {
      onElementSelect(null); // Deselect all elements
    }
  }, [onElementSelect]);

  // Add global mouse event listeners
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleMouseMove);
      document.addEventListener('touchend', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleMouseMove);
        document.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

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
      >
        {/* Background Image */}
        {canvasState.meta.backgroundImage && (
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
        {canvasState.elements
          .sort((a, b) => a.zIndex - b.zIndex) // Sort by z-index
          .map(element => (
            <ElementRenderer
              key={element.id}
              element={element}
              isSelected={element.id === selectedElementId}
              onMouseDown={(e) => handleMouseDown(e, element.id)}
              onDoubleClick={() => {
                // Handle double-click for inline editing
                if (element.type === 'text') {
                  // TODO: Implement inline text editing
                  console.log('Double-clicked text element:', element.id);
                }
              }}
            />
          ))}

        {/* Canvas Info */}
        <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded pointer-events-none">
          {canvasDimensions.width} × {canvasDimensions.height}
        </div>
      </div>

      {/* Canvas Scale Info */}
      <div className="absolute -bottom-6 left-0 text-xs text-gray-500">
        Ad Size: {canvasState.meta.adSize}
      </div>
    </div>
  );
}

export default CanvasWorkspace; 