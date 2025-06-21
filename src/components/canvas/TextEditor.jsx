import React, { useState, useRef, useEffect } from 'react';

/**
 * TextEditor Component
 * Advanced inline text editing with rich formatting capabilities
 * Part of Phase 3: Interactive Text System
 */
function TextEditor({ 
  element, 
  onContentChange, 
  onStyleChange, 
  onEditComplete,
  isEditing = false,
  position,
  size 
}) {
  const [localContent, setLocalContent] = useState(element.content || '');
  const [isMultiline, setIsMultiline] = useState(element.multiline || false);
  const textareaRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-focus when entering edit mode
  useEffect(() => {
    if (isEditing) {
      if (isMultiline && textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
      } else if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }
  }, [isEditing, isMultiline]);

  // Handle content changes
  const handleContentChange = (value) => {
    setLocalContent(value);
    onContentChange(value);
  };

  // Handle keyboard events
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isMultiline) {
      e.preventDefault();
      onEditComplete();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onEditComplete();
    } else if (e.key === 'Enter' && e.ctrlKey && isMultiline) {
      e.preventDefault();
      onEditComplete();
    }
  };

  // Handle blur event
  const handleBlur = () => {
    onEditComplete();
  };

  // Auto-resize textarea
  const autoResize = (textarea) => {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  };

  // Text formatting functions
  const formatText = (command, value = null) => {
    switch (command) {
      case 'bold':
        const newWeight = element.styles.fontWeight === 'bold' ? 'normal' : 'bold';
        onStyleChange('fontWeight', newWeight);
        break;
      case 'italic':
        const newStyle = element.styles.fontStyle === 'italic' ? 'normal' : 'italic';
        onStyleChange('fontStyle', newStyle);
        break;
      case 'underline':
        const newDecoration = element.styles.textDecoration === 'underline' ? 'none' : 'underline';
        onStyleChange('textDecoration', newDecoration);
        break;
      case 'align':
        onStyleChange('textAlign', value);
        break;
      case 'fontSize':
        onStyleChange('fontSize', `${value}px`);
        break;
      case 'color':
        onStyleChange('color', value);
        break;
      default:
        break;
    }
  };

  if (!isEditing) {
    // Display mode - render the styled text
    return (
      <div
        style={{
          ...element.styles,
          width: size.width,
          height: size.height,
          overflow: 'hidden',
          cursor: 'text',
          padding: '4px',
          border: '1px solid transparent',
          borderRadius: '2px'
        }}
        onDoubleClick={() => {
          // Could trigger edit mode from here if needed
        }}
      >
        {isMultiline ? (
          <div
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              lineHeight: element.styles.lineHeight
            }}
          >
            {localContent}
          </div>
        ) : (
          <span>{localContent}</span>
        )}
      </div>
    );
  }

  // Edit mode - render input/textarea
  return (
    <div
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        width: size.width,
        height: 'auto',
        zIndex: 1000
      }}
    >
      {/* Inline editing toolbar */}
      <div className="absolute -top-12 left-0 bg-white border border-gray-300 rounded-lg shadow-lg p-2 flex items-center space-x-2 z-10">
        {/* Text formatting buttons */}
        <button
          type="button"
          onClick={() => formatText('bold')}
          className={`px-2 py-1 text-sm rounded ${
            element.styles.fontWeight === 'bold' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
          title="Bold"
        >
          <strong>B</strong>
        </button>
        
        <button
          type="button"
          onClick={() => formatText('italic')}
          className={`px-2 py-1 text-sm rounded ${
            element.styles.fontStyle === 'italic' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
          title="Italic"
        >
          <em>I</em>
        </button>
        
        <button
          type="button"
          onClick={() => formatText('underline')}
          className={`px-2 py-1 text-sm rounded ${
            element.styles.textDecoration === 'underline' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
          title="Underline"
        >
          <u>U</u>
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-300"></div>

        {/* Alignment buttons */}
        {['left', 'center', 'right'].map(align => (
          <button
            key={align}
            type="button"
            onClick={() => formatText('align', align)}
            className={`px-2 py-1 text-sm rounded ${
              element.styles.textAlign === align 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
            title={`Align ${align}`}
          >
            {align === 'left' && '⬅️'}
            {align === 'center' && '↔️'}
            {align === 'right' && '➡️'}
          </button>
        ))}

        {/* Divider */}
        <div className="w-px h-6 bg-gray-300"></div>

        {/* Font size control */}
        <input
          type="range"
          min="8"
          max="72"
          value={parseInt(element.styles.fontSize)}
          onChange={(e) => formatText('fontSize', e.target.value)}
          className="w-16 h-2"
          title="Font Size"
        />
        <span className="text-xs text-gray-600 w-8">
          {parseInt(element.styles.fontSize)}
        </span>

        {/* Color picker */}
        <input
          type="color"
          value={element.styles.color}
          onChange={(e) => formatText('color', e.target.value)}
          className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
          title="Text Color"
        />

        {/* Multiline toggle */}
        <button
          type="button"
          onClick={() => setIsMultiline(!isMultiline)}
          className={`px-2 py-1 text-xs rounded ${
            isMultiline 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
          title="Toggle Multiline"
        >
          ↕️
        </button>

        {/* Done button */}
        <button
          type="button"
          onClick={onEditComplete}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          Done
        </button>
      </div>

      {/* Text input/textarea */}
      {isMultiline ? (
        <textarea
          ref={textareaRef}
          value={localContent}
          onChange={(e) => {
            handleContentChange(e.target.value);
            autoResize(e.target);
          }}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="w-full p-2 border-2 border-blue-500 rounded resize-none outline-none"
          style={{
            fontFamily: element.styles.fontFamily,
            fontSize: element.styles.fontSize,
            fontWeight: element.styles.fontWeight,
            fontStyle: element.styles.fontStyle,
            color: element.styles.color,
            textAlign: element.styles.textAlign,
            lineHeight: element.styles.lineHeight,
            letterSpacing: element.styles.letterSpacing,
            textDecoration: element.styles.textDecoration,
            minHeight: '60px',
            background: 'rgba(255, 255, 255, 0.95)'
          }}
          placeholder="Enter text..."
          rows={3}
        />
      ) : (
        <input
          ref={inputRef}
          type="text"
          value={localContent}
          onChange={(e) => handleContentChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="w-full p-2 border-2 border-blue-500 rounded outline-none"
          style={{
            fontFamily: element.styles.fontFamily,
            fontSize: element.styles.fontSize,
            fontWeight: element.styles.fontWeight,
            fontStyle: element.styles.fontStyle,
            color: element.styles.color,
            textAlign: element.styles.textAlign,
            letterSpacing: element.styles.letterSpacing,
            textDecoration: element.styles.textDecoration,
            background: 'rgba(255, 255, 255, 0.95)'
          }}
          placeholder="Enter text..."
        />
      )}

      {/* Helper text */}
      <div className="text-xs text-gray-500 mt-1">
        {isMultiline ? 'Ctrl+Enter to finish editing' : 'Enter to finish editing'} • Esc to cancel
      </div>
    </div>
  );
}

export default TextEditor; 