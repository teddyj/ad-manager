import React, { useState } from 'react';
import TextEditor from './TextEditor.jsx';

/**
 * ElementRenderer - Renders individual canvas elements with selection handles
 */
function ElementRenderer({ 
  element, 
  isSelected, 
  onMouseDown, 
  onDoubleClick,
  onElementUpdate
}) {
  const [isEditing, setIsEditing] = useState(false);
  
  const renderElementContent = () => {
    switch (element.type) {
      case 'text':
        if (isEditing) {
          return (
            <TextEditor
              element={element}
              isEditing={true}
              position={element.position}
              size={element.size}
              onContentChange={(content) => {
                onElementUpdate(element.id, { content });
              }}
              onStyleChange={(property, value) => {
                onElementUpdate(element.id, {
                  styles: {
                    ...element.styles,
                    [property]: value
                  }
                });
              }}
              onEditComplete={() => setIsEditing(false)}
            />
          );
        }
        
        return (
          <div
            className="w-full h-full flex items-center justify-center cursor-move select-none"
            style={{
              fontSize: element.styles.fontSize,
              fontWeight: element.styles.fontWeight,
              color: element.styles.color,
              textAlign: element.styles.textAlign,
              fontFamily: element.styles.fontFamily,
              lineHeight: element.styles.lineHeight || '1.2',
              letterSpacing: element.styles.letterSpacing,
              textDecoration: element.styles.textDecoration,
              fontStyle: element.styles.fontStyle,
              textShadow: element.styles.textShadow,
              textTransform: element.styles.textTransform,
              wordSpacing: element.styles.wordSpacing,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: element.multiline ? 'pre-wrap' : 'nowrap',
              padding: '4px'
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
          >
    {String(element.content || 'Text')}
          </div>
        );
      
      case 'button':
        return (
          <button
            className="w-full h-full cursor-move flex items-center justify-center text-sm font-medium transition-all duration-200 hover:opacity-90"
            style={{
              // Support both backgroundColor and gradient backgrounds
              background: element.styles.background || element.styles.backgroundColor,
              backgroundColor: element.styles.background ? 'transparent' : element.styles.backgroundColor,
              color: element.styles.color,
              border: element.styles.border,
              borderRadius: element.styles.borderRadius,
              fontWeight: element.styles.fontWeight,
              fontSize: element.styles.fontSize,
              boxShadow: element.styles.boxShadow,
              textDecoration: element.styles.textDecoration,
              textTransform: element.styles.textTransform,
              letterSpacing: element.styles.letterSpacing,
              padding: element.styles.padding,
              minWidth: element.styles.minWidth
            }}
            onMouseDown={onMouseDown}
            onClick={(e) => e.preventDefault()} // Prevent button click during design
          >
    {String(element.content || 'Button')}
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
      
      case 'decorative':
        return (
          <div 
            className="w-full h-full cursor-move flex items-center justify-center"
            style={{ color: element.styles.color }}
dangerouslySetInnerHTML={{ __html: String(element.content || '') }}
          />
        );
      
      case 'shape':
        const shapeType = element.shapeType || 'rectangle';
        const shapeStyles = {
          width: '100%',
          height: '100%',
          backgroundColor: element.styles.backgroundColor || '#3b82f6',
          border: element.styles.border || 'none',
          borderRadius: element.styles.borderRadius || '0px',
          ...element.styles
        };

        switch (shapeType) {
          case 'circle':
            return (
              <div
                className="w-full h-full cursor-move"
                style={{
                  ...shapeStyles,
                  borderRadius: '50%'
                }}
              />
            );
          case 'triangle':
            return (
              <div
                className="w-full h-full cursor-move flex items-end justify-center"
                style={{ ...element.styles }}
              >
                <div
                  style={{
                    width: '0',
                    height: '0',
                    borderLeft: `${element.size.width/2}px solid transparent`,
                    borderRight: `${element.size.width/2}px solid transparent`,
                    borderBottom: `${element.size.height}px solid ${element.styles.backgroundColor || '#3b82f6'}`
                  }}
                />
              </div>
            );
          case 'line':
            return (
              <div
                className="w-full h-full cursor-move flex items-center"
                style={{ ...element.styles }}
              >
                <div
                  style={{
                    width: '100%',
                    height: element.styles.strokeWidth || '2px',
                    backgroundColor: element.styles.stroke || element.styles.backgroundColor || '#3b82f6',
                    borderRadius: '1px'
                  }}
                />
              </div>
            );
          case 'arrow':
            return (
              <div className="w-full h-full cursor-move">
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 100 100"
                  style={element.styles}
                >
                  <defs>
                    <marker
                      id={`arrowhead-${element.id}`}
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon
                        points="0 0, 10 3.5, 0 7"
                        fill={element.styles.stroke || element.styles.backgroundColor || '#3b82f6'}
                      />
                    </marker>
                  </defs>
                  <line
                    x1="10"
                    y1="50"
                    x2="90"
                    y2="50"
                    stroke={element.styles.stroke || element.styles.backgroundColor || '#3b82f6'}
                    strokeWidth={element.styles.strokeWidth || '2'}
                    markerEnd={`url(#arrowhead-${element.id})`}
                  />
                </svg>
              </div>
            );
          default: // rectangle
            return (
              <div
                className="w-full h-full cursor-move"
                style={shapeStyles}
              />
            );
        }
      
      default:
        return (
          <div className="w-full h-full bg-gray-100 cursor-move flex items-center justify-center text-gray-500 text-xs">
            {String(element.type)}
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
            {String(element.type)} ({element.size.width}×{element.size.height})
          </div>
        </>
      )}
    </div>
  );
}

export default ElementRenderer; 