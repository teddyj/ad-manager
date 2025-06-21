import React, { useState, useCallback, useMemo } from 'react';

/**
 * LayerManager Component
 * Layer management and z-index controls for Phase 5: Advanced Controls & Interactions
 * Features visual layer panel, drag reordering, visibility toggles, and layer operations
 */
function LayerManager({ 
  elements, 
  selectedElementId,
  onElementSelect,
  onElementUpdate,
  onElementDelete,
  onElementDuplicate,
  onElementLock,
  onLayerReorder
}) {
  const [draggedLayer, setDraggedLayer] = useState(null);
  const [dragOverLayer, setDragOverLayer] = useState(null);

  // Sort elements by z-index (highest first)
  const sortedElements = useMemo(() => {
    return [...elements].sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));
  }, [elements]);

  // Get element type icon
  const getElementIcon = useCallback((element) => {
    switch (element.type) {
      case 'text': return '📝';
      case 'image': return '🖼️';
      case 'product': return '📦';
      case 'button': return '🔘';
      case 'decorative': return '✨';
      default: return '📄';
    }
  }, []);

  // Get element display name
  const getElementName = useCallback((element) => {
    if (element.name) return element.name;
    
    switch (element.type) {
      case 'text':
        const content = element.content || 'Text';
        return content.length > 20 ? content.substring(0, 20) + '...' : content;
      case 'image':
      case 'product':
        return element.assetData?.name || 'Image';
      case 'button':
        return element.content || 'Button';
      case 'decorative':
        return element.assetData?.name || 'Decorative';
      default:
        return `${String(element.type || 'element').charAt(0).toUpperCase() + String(element.type || 'element').slice(1)}`;
    }
  }, []);

  // Handle layer drag start
  const handleDragStart = useCallback((e, element) => {
    setDraggedLayer(element.id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', element.id);
  }, []);

  // Handle drag over
  const handleDragOver = useCallback((e, targetElement) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverLayer(targetElement.id);
  }, []);

  // Handle drop
  const handleDrop = useCallback((e, targetElement) => {
    e.preventDefault();
    
    if (draggedLayer && draggedLayer !== targetElement.id) {
      const draggedElement = elements.find(el => el.id === draggedLayer);
      if (draggedElement && onLayerReorder) {
        onLayerReorder(draggedElement.id, targetElement.zIndex);
      }
    }
    
    setDraggedLayer(null);
    setDragOverLayer(null);
  }, [draggedLayer, elements, onLayerReorder]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setDraggedLayer(null);
    setDragOverLayer(null);
  }, []);

  // Move layer up/down
  const moveLayer = useCallback((elementId, direction) => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    const currentIndex = sortedElements.findIndex(el => el.id === elementId);
    let newZIndex = element.zIndex || 0;

    if (direction === 'up' && currentIndex > 0) {
      // Move up (increase z-index)
      const elementAbove = sortedElements[currentIndex - 1];
      newZIndex = (elementAbove.zIndex || 0) + 1;
    } else if (direction === 'down' && currentIndex < sortedElements.length - 1) {
      // Move down (decrease z-index)
      const elementBelow = sortedElements[currentIndex + 1];
      newZIndex = (elementBelow.zIndex || 0) - 1;
    } else if (direction === 'top') {
      // Move to top
      const maxZIndex = Math.max(...elements.map(el => el.zIndex || 0));
      newZIndex = maxZIndex + 1;
    } else if (direction === 'bottom') {
      // Move to bottom
      const minZIndex = Math.min(...elements.map(el => el.zIndex || 0));
      newZIndex = minZIndex - 1;
    }

    onElementUpdate(elementId, { zIndex: newZIndex });
  }, [elements, sortedElements, onElementUpdate]);

  // Toggle element visibility
  const toggleVisibility = useCallback((elementId) => {
    const element = elements.find(el => el.id === elementId);
    if (element) {
      onElementUpdate(elementId, { 
        visible: element.visible !== false ? false : true 
      });
    }
  }, [elements, onElementUpdate]);

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-200">
        <h3 className="font-medium text-gray-800">Layers</h3>
        <div className="text-xs text-gray-500 mt-1">
          {elements.length} element{elements.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Layers List */}
      <div className="flex-1 overflow-y-auto">
        {sortedElements.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <div className="text-2xl mb-2">📄</div>
            <p className="text-sm">No elements</p>
          </div>
        ) : (
          <div className="p-2">
            {sortedElements.map((element, index) => (
              <div
                key={element.id}
                draggable
                onDragStart={(e) => handleDragStart(e, element)}
                onDragOver={(e) => handleDragOver(e, element)}
                onDrop={(e) => handleDrop(e, element)}
                onDragEnd={handleDragEnd}
                className={`
                  relative group mb-1 p-2 rounded border transition-all cursor-pointer
                  ${selectedElementId === element.id 
                    ? 'border-blue-300 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                  ${draggedLayer === element.id ? 'opacity-50' : ''}
                  ${dragOverLayer === element.id ? 'border-blue-400 bg-blue-100' : ''}
                `}
                onClick={() => onElementSelect(element.id)}
              >
                {/* Layer Content */}
                <div className="flex items-center space-x-2">
                  {/* Drag Handle */}
                  <div className="text-gray-400 cursor-move">
                    ⋮⋮
                  </div>

                  {/* Element Icon */}
                  <div className="text-sm">
                    {getElementIcon(element)}
                  </div>

                  {/* Element Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">
                      {getElementName(element)}
                    </div>
                    <div className="text-xs text-gray-500">
                      z: {element.zIndex || 0} • {String(element.type || 'element')}
                      {element.locked && ' • Locked'}
                      {element.visible === false && ' • Hidden'}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Visibility Toggle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleVisibility(element.id);
                      }}
                      className="w-5 h-5 text-xs hover:bg-gray-200 rounded transition-colors"
                      title={element.visible === false ? 'Show element' : 'Hide element'}
                    >
                      {element.visible === false ? '👁️‍🗨️' : '👁️'}
                    </button>

                    {/* Lock Toggle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onElementLock(element.id, !element.locked);
                      }}
                      className="w-5 h-5 text-xs hover:bg-gray-200 rounded transition-colors"
                      title={element.locked ? 'Unlock element' : 'Lock element'}
                    >
                      {element.locked ? '🔒' : '🔓'}
                    </button>

                    {/* Duplicate */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onElementDuplicate(element.id);
                      }}
                      className="w-5 h-5 text-xs hover:bg-gray-200 rounded transition-colors"
                      title="Duplicate element"
                    >
                      📋
                    </button>

                    {/* Delete */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onElementDelete(element.id);
                      }}
                      className="w-5 h-5 text-xs hover:bg-red-200 rounded transition-colors"
                      title="Delete element"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Layer Controls */}
                {selectedElementId === element.id && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-600">Layer Controls:</div>
                      <div className="flex space-x-1">
                        {/* Move to Top */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveLayer(element.id, 'top');
                          }}
                          className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                          title="Move to top"
                          disabled={index === 0}
                        >
                          ⤴️
                        </button>

                        {/* Move Up */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveLayer(element.id, 'up');
                          }}
                          className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                          title="Move up"
                          disabled={index === 0}
                        >
                          ⬆️
                        </button>

                        {/* Move Down */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveLayer(element.id, 'down');
                          }}
                          className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                          title="Move down"
                          disabled={index === sortedElements.length - 1}
                        >
                          ⬇️
                        </button>

                        {/* Move to Bottom */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveLayer(element.id, 'bottom');
                          }}
                          className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                          title="Move to bottom"
                          disabled={index === sortedElements.length - 1}
                        >
                          ⤵️
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Layer Statistics */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600 space-y-1">
          <div>Visible: {elements.filter(el => el.visible !== false).length}</div>
          <div>Locked: {elements.filter(el => el.locked).length}</div>
          <div>Selected: {selectedElementId ? '1' : '0'}</div>
        </div>
      </div>
    </div>
  );
}

export default LayerManager; 