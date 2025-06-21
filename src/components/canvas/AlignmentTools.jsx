import React, { useCallback, useMemo } from 'react';

/**
 * AlignmentTools Component
 * Alignment and distribution tools for Phase 5: Advanced Controls & Interactions
 * Features element alignment, distribution, spacing, and grouping operations
 */
function AlignmentTools({ 
  elements, 
  selectedElementIds = [],
  canvasDimensions,
  onElementUpdate,
  onElementGroup,
  onElementUngroup,
  onMultiElementUpdate
}) {
  // Get selected elements
  const selectedElements = useMemo(() => {
    return elements.filter(el => selectedElementIds.includes(el.id));
  }, [elements, selectedElementIds]);

  const hasMultipleSelected = selectedElements.length > 1;
  const hasSelection = selectedElements.length > 0;

  // Calculate bounding box of selected elements
  const getBoundingBox = useCallback((elements) => {
    if (elements.length === 0) return null;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    elements.forEach(element => {
      const { x, y } = element.position;
      const { width, height } = element.size;
      
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + width);
      maxY = Math.max(maxY, y + height);
    });

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      centerX: (minX + maxX) / 2,
      centerY: (minY + maxY) / 2
    };
  }, []);

  // Align elements
  const alignElements = useCallback((alignment) => {
    if (!hasMultipleSelected) return;

    const boundingBox = getBoundingBox(selectedElements);
    if (!boundingBox) return;

    const updates = {};

    selectedElements.forEach(element => {
      const { x, y } = element.position;
      const { width, height } = element.size;
      let newPosition = { ...element.position };

      switch (alignment) {
        case 'left':
          newPosition.x = boundingBox.x;
          break;
        case 'center':
          newPosition.x = boundingBox.centerX - width / 2;
          break;
        case 'right':
          newPosition.x = boundingBox.x + boundingBox.width - width;
          break;
        case 'top':
          newPosition.y = boundingBox.y;
          break;
        case 'middle':
          newPosition.y = boundingBox.centerY - height / 2;
          break;
        case 'bottom':
          newPosition.y = boundingBox.y + boundingBox.height - height;
          break;
        case 'canvas-center-horizontal':
          newPosition.x = (canvasDimensions.width - width) / 2;
          break;
        case 'canvas-center-vertical':
          newPosition.y = (canvasDimensions.height - height) / 2;
          break;
        case 'canvas-center':
          newPosition.x = (canvasDimensions.width - width) / 2;
          newPosition.y = (canvasDimensions.height - height) / 2;
          break;
      }

      updates[element.id] = { position: newPosition };
    });

    onMultiElementUpdate(updates);
  }, [hasMultipleSelected, selectedElements, getBoundingBox, canvasDimensions, onMultiElementUpdate]);

  // Distribute elements
  const distributeElements = useCallback((direction) => {
    if (selectedElements.length < 3) return;

    const sortedElements = [...selectedElements].sort((a, b) => {
      if (direction === 'horizontal') {
        return a.position.x - b.position.x;
      } else {
        return a.position.y - b.position.y;
      }
    });

    const first = sortedElements[0];
    const last = sortedElements[sortedElements.length - 1];
    
    const totalSpace = direction === 'horizontal'
      ? (last.position.x + last.size.width) - first.position.x
      : (last.position.y + last.size.height) - first.position.y;

    const totalElementSize = sortedElements.reduce((sum, el) => {
      return sum + (direction === 'horizontal' ? el.size.width : el.size.height);
    }, 0);

    const availableSpace = totalSpace - totalElementSize;
    const gap = availableSpace / (sortedElements.length - 1);

    const updates = {};
    let currentPosition = direction === 'horizontal' ? first.position.x : first.position.y;

    sortedElements.forEach((element, index) => {
      if (index === 0 || index === sortedElements.length - 1) {
        // Don't move first and last elements
        return;
      }

      currentPosition += direction === 'horizontal' 
        ? sortedElements[index - 1].size.width + gap
        : sortedElements[index - 1].size.height + gap;

      const newPosition = { ...element.position };
      if (direction === 'horizontal') {
        newPosition.x = currentPosition;
      } else {
        newPosition.y = currentPosition;
      }

      updates[element.id] = { position: newPosition };
    });

    onMultiElementUpdate(updates);
  }, [selectedElements, onMultiElementUpdate]);

  // Space elements evenly
  const spaceElements = useCallback((spacing) => {
    if (selectedElements.length < 2) return;

    const sortedElements = [...selectedElements].sort((a, b) => {
      return a.position.x - b.position.x; // Sort by horizontal position
    });

    const updates = {};
    let currentX = sortedElements[0].position.x;

    sortedElements.forEach((element, index) => {
      if (index === 0) return; // Skip first element

      currentX += sortedElements[index - 1].size.width + spacing;
      
      updates[element.id] = {
        position: { ...element.position, x: currentX }
      };
    });

    onMultiElementUpdate(updates);
  }, [selectedElements, onMultiElementUpdate]);

  // Resize elements to same size
  const resizeToSame = useCallback((dimension) => {
    if (!hasMultipleSelected) return;

    // Use the first selected element as reference
    const reference = selectedElements[0];
    const updates = {};

    selectedElements.slice(1).forEach(element => {
      const newSize = { ...element.size };
      
      if (dimension === 'width' || dimension === 'both') {
        newSize.width = reference.size.width;
      }
      if (dimension === 'height' || dimension === 'both') {
        newSize.height = reference.size.height;
      }

      updates[element.id] = { size: newSize };
    });

    onMultiElementUpdate(updates);
  }, [hasMultipleSelected, selectedElements, onMultiElementUpdate]);

  return (
    <div className="p-4 bg-white border-t border-gray-200">
      <h4 className="font-medium text-gray-800 mb-3">Alignment Tools</h4>

      {!hasSelection && (
        <div className="text-sm text-gray-500 text-center py-4">
          Select elements to use alignment tools
        </div>
      )}

      {hasSelection && (
        <div className="space-y-4">
          {/* Alignment Controls */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Align</div>
            
            {/* Horizontal Alignment */}
            <div className="mb-2">
              <div className="text-xs text-gray-600 mb-1">Horizontal</div>
              <div className="flex space-x-1">
                <button
                  onClick={() => alignElements('left')}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  title="Align left"
                  disabled={!hasMultipleSelected}
                >
                  ⫸ Left
                </button>
                <button
                  onClick={() => alignElements('center')}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  title="Align center"
                  disabled={!hasMultipleSelected}
                >
                  ⫶ Center
                </button>
                <button
                  onClick={() => alignElements('right')}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  title="Align right"
                  disabled={!hasMultipleSelected}
                >
                  ⫷ Right
                </button>
              </div>
            </div>

            {/* Vertical Alignment */}
            <div className="mb-2">
              <div className="text-xs text-gray-600 mb-1">Vertical</div>
              <div className="flex space-x-1">
                <button
                  onClick={() => alignElements('top')}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  title="Align top"
                  disabled={!hasMultipleSelected}
                >
                  ⫹ Top
                </button>
                <button
                  onClick={() => alignElements('middle')}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  title="Align middle"
                  disabled={!hasMultipleSelected}
                >
                  ⫽ Middle
                </button>
                <button
                  onClick={() => alignElements('bottom')}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  title="Align bottom"
                  disabled={!hasMultipleSelected}
                >
                  ⫼ Bottom
                </button>
              </div>
            </div>

            {/* Canvas Alignment */}
            <div>
              <div className="text-xs text-gray-600 mb-1">Canvas</div>
              <div className="flex space-x-1">
                <button
                  onClick={() => alignElements('canvas-center-horizontal')}
                  className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded transition-colors"
                  title="Center horizontally in canvas"
                >
                  ⟷ H-Center
                </button>
                <button
                  onClick={() => alignElements('canvas-center-vertical')}
                  className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded transition-colors"
                  title="Center vertically in canvas"
                >
                  ⟸ V-Center
                </button>
                <button
                  onClick={() => alignElements('canvas-center')}
                  className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded transition-colors"
                  title="Center in canvas"
                >
                  ⊞ Center
                </button>
              </div>
            </div>
          </div>

          {/* Distribution Controls */}
          {selectedElements.length >= 3 && (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Distribute</div>
              <div className="flex space-x-1">
                <button
                  onClick={() => distributeElements('horizontal')}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  title="Distribute horizontally"
                >
                  ⟷ Horizontal
                </button>
                <button
                  onClick={() => distributeElements('vertical')}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  title="Distribute vertically"
                >
                  ⟸ Vertical
                </button>
              </div>
            </div>
          )}

          {/* Spacing Controls */}
          {selectedElements.length >= 2 && (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Spacing</div>
              <div className="flex space-x-1">
                <button
                  onClick={() => spaceElements(10)}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  title="10px spacing"
                >
                  10px
                </button>
                <button
                  onClick={() => spaceElements(20)}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  title="20px spacing"
                >
                  20px
                </button>
                <button
                  onClick={() => spaceElements(0)}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  title="No spacing"
                >
                  0px
                </button>
              </div>
            </div>
          )}

          {/* Size Controls */}
          {hasMultipleSelected && (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Size</div>
              <div className="flex space-x-1">
                <button
                  onClick={() => resizeToSame('width')}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  title="Same width"
                >
                  ⟷ Width
                </button>
                <button
                  onClick={() => resizeToSame('height')}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  title="Same height"
                >
                  ⟸ Height
                </button>
                <button
                  onClick={() => resizeToSame('both')}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  title="Same size"
                >
                  ⊞ Both
                </button>
              </div>
            </div>
          )}

          {/* Grouping Controls */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Grouping</div>
            <div className="flex space-x-1">
              <button
                onClick={() => onElementGroup && onElementGroup(selectedElementIds)}
                className="px-2 py-1 text-xs bg-green-100 hover:bg-green-200 rounded transition-colors"
                title="Group selected elements (Ctrl+G)"
                disabled={!hasMultipleSelected}
              >
                📦 Group
              </button>
              <button
                onClick={() => onElementUngroup && onElementUngroup(selectedElementIds[0])}
                className="px-2 py-1 text-xs bg-orange-100 hover:bg-orange-200 rounded transition-colors"
                title="Ungroup selected element (Ctrl+Shift+G)"
                disabled={selectedElements.length !== 1 || !selectedElements[0]?.isGroup}
              >
                📋 Ungroup
              </button>
            </div>
          </div>

          {/* Selection Info */}
          <div className="pt-2 border-t border-gray-200">
            <div className="text-xs text-gray-600">
              Selected: {selectedElements.length} element{selectedElements.length !== 1 ? 's' : ''}
              {hasMultipleSelected && (
                <div className="mt-1">
                  Use Shift+Click to select multiple elements
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AlignmentTools; 