import React from 'react';

/**
 * ElementRenderer - Renders individual canvas elements with selection handles
 */
function ElementRenderer({ 
  element, 
  isSelected, 
  onMouseDown, 
  onDoubleClick 
}) {
  
  const renderElementContent = () => {
    switch (element.type) {
      case 'text':
        return (
          <div
            className="w-full h-full flex items-center justify-center cursor-move select-none"
            style={{
              fontSize: element.styles.fontSize,
              fontWeight: element.styles.fontWeight,
              color: element.styles.color,
              textAlign: element.styles.textAlign,
              fontFamily: element.styles.fontFamily,
              lineHeight: '1.2',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {element.content || 'Text'}
          </div>
        );
      
      case 'button':
        return (
          <button
            className="w-full h-full cursor-move flex items-center justify-center text-sm font-medium transition-all duration-200 hover:opacity-90"
            style={{
              backgroundColor: element.styles.backgroundColor,
              color: element.styles.color,
              border: element.styles.border,
              borderRadius: element.styles.borderRadius,
              fontWeight: element.styles.fontWeight,
              fontSize: element.styles.fontSize
            }}
            onMouseDown={onMouseDown}
            onClick={(e) => e.preventDefault()} // Prevent button click during design
          >
            {element.content || 'Button'}
          </button>
        );
      
      case 'image':
        return (
          <div className="w-full h-full cursor-move overflow-hidden">
            {element.content ? (
              <img
                src={element.content}
                alt="Element"
                className="w-full h-full object-cover"
                draggable={false}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                Image
              </div>
            )}
          </div>
        );
      
      case 'product':
        return (
          <div className="w-full h-full cursor-move overflow-hidden border border-dashed border-gray-300">
            {element.content ? (
              <img
                src={element.content}
                alt="Product"
                className="w-full h-full object-contain"
                draggable={false}
              />
            ) : (
              <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-500 text-xs">
                Product
              </div>
            )}
          </div>
        );
      
      default:
        return (
          <div className="w-full h-full bg-gray-100 cursor-move flex items-center justify-center text-gray-500 text-xs">
            {element.type}
          </div>
        );
    }
  };

  return (
    <div
      className={`absolute ${isSelected ? 'z-50' : ''}`}
      style={{
        left: `${element.position.x}px`,
        top: `${element.position.y}px`,
        width: `${element.size.width}px`,
        height: `${element.size.height}px`,
        zIndex: isSelected ? 999 : element.zIndex,
        pointerEvents: element.locked ? 'none' : 'auto'
      }}
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
    >
      {/* Element Content */}
      <div className="relative w-full h-full">
        {renderElementContent()}
        
        {/* Locked indicator */}
        {element.locked && (
          <div className="absolute top-0 right-0 w-4 h-4 bg-gray-500 text-white text-xs flex items-center justify-center">
            🔒
          </div>
        )}
      </div>

      {/* Selection Handles */}
      {isSelected && !element.locked && (
        <>
          {/* Selection Border */}
          <div className="absolute inset-0 border-2 border-blue-500 pointer-events-none" />
          
          {/* Corner Resize Handles */}
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border border-white cursor-nw-resize" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border border-white cursor-ne-resize" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border border-white cursor-sw-resize" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white cursor-se-resize" />
          
          {/* Edge Resize Handles */}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 border border-white cursor-n-resize" />
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 border border-white cursor-s-resize" />
          <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 border border-white cursor-w-resize" />
          <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 border border-white cursor-e-resize" />
          
          {/* Element Info */}
          <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
            {element.type} ({element.size.width}×{element.size.height})
          </div>
        </>
      )}
    </div>
  );
}

export default ElementRenderer; 