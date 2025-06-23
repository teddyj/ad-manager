import React, { useState, useCallback, useMemo, useRef } from 'react';
import { ProductCompositionService } from '../../services/productCompositionService.js';
import BackgroundCustomizer from '../BackgroundCustomizer.jsx';
import TypographyPanel from '../canvas/TypographyPanel.jsx';
import AssetLibrary from '../AssetLibrary.jsx';
import ProductAssetManager from '../ProductAssetManager.jsx';
import LayerManager from '../canvas/LayerManager.jsx';
import AlignmentTools from '../canvas/AlignmentTools.jsx';
import ButtonEditor from '../canvas/ButtonEditor.jsx';
import CTAEnhancer from '../canvas/CTAEnhancer.jsx';
import TemplateSelector from '../TemplateSelector.jsx';

/**
 * DesignControls - Right panel with element styling and canvas controls
 * Enhanced for Phase 2 with smart composition and background features
 */

function DesignControls({ 
  canvasState, 
  selectedElement, 
  onElementUpdate, 
  onElementAdd,
  onBackgroundChange,
  onPublish,
  campaignSettings,
  dbOperations, // Add dbOperations for background customizer
  // Phase 5: Advanced Controls props
  selectedElementId,
  selectedElementIds = [],
  onElementSelect,
  onElementDelete,
  onElementDuplicate,
  onElementLock,
  onElementGroup,
  onElementUngroup,
  onLayerReorder,
  onMultiElementUpdate,
  onAlignElements,
  readonly = false
}) {
  
  // Make activeTab persistent across component remounts
  const getInitialTab = () => {
    try {
      const savedTab = localStorage.getItem('designControls-activeTab');
      console.log('📱 Component mounted, initial tab:', savedTab || 'element (default)');
      return savedTab || 'element';
    } catch {
      return 'element';
    }
  };

  const [activeTab, setActiveTab] = useState(() => getInitialTab());
  const [showCompositionSuggestions, setShowCompositionSuggestions] = useState(false);
  const [userProducts, setUserProducts] = useState([]);
  const [assetSubTab, setAssetSubTab] = useState('library');
  // Use canvas background as the single source of truth, with local override during typing
  const [tempBackgroundUrl, setTempBackgroundUrl] = useState('');
  const [isTypingBackground, setIsTypingBackground] = useState(false);
  
  // Clear temp URL when canvas background matches the typed value
  React.useEffect(() => {
    if (tempBackgroundUrl && canvasState?.meta?.backgroundImage === tempBackgroundUrl) {
      setTempBackgroundUrl('');
    }
  }, [tempBackgroundUrl, canvasState?.meta?.backgroundImage]);
  
  // Refs for file inputs
  const productFileInputRef = useRef(null);
  const elementImageFileInputRef = useRef(null);
  const backgroundFileInputRef = useRef(null);

  // Get the current background value from canvas or temporary value during typing
  const currentBackgroundValue = tempBackgroundUrl || (canvasState?.meta?.backgroundImage || '');

  // Save tab changes to localStorage for persistence
  const handleTabChange = React.useCallback((value) => {
    // Only log unexpected tab changes (not during normal clicks)
    if (activeTab !== value) {
      console.log(`🔄 Tab change: "${activeTab}" → "${value}"`);
    }
    try {
      localStorage.setItem('designControls-activeTab', value);
    } catch {}
    setActiveTab(value);
  }, [activeTab]);

  // Debounced background change handler
  const debouncedBackgroundChange = React.useMemo(
    () => {
      let timeoutId;
      
      return (value) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          onBackgroundChange(value);
          setIsTypingBackground(false); // Clear typing flag after canvas update
        }, 300);
      };
    },
    [onBackgroundChange]
  );

  const handleBackgroundUrlChange = React.useCallback((value) => {
    // Set typing flag and store temporary value
    setIsTypingBackground(true);
    setTempBackgroundUrl(value);
    // Trigger debounced canvas update
    debouncedBackgroundChange(value);
  }, [debouncedBackgroundChange]);

  const handleStyleChange = (property, value) => {
    if (!selectedElement || readonly) return;
    
    onElementUpdate(selectedElement.id, {
      styles: {
        ...selectedElement.styles,
        [property]: value
      }
    });
  };

  const handleContentChange = (value) => {
    if (!selectedElement || readonly) return;
    
    onElementUpdate(selectedElement.id, {
      content: value
    });
  };

  const handleSizeChange = (dimension, value) => {
    if (!selectedElement) return;
    
    const numValue = parseInt(value) || 0;
    onElementUpdate(selectedElement.id, {
      size: {
        ...selectedElement.size,
        [dimension]: numValue
      }
    });
  };

  const handlePositionChange = (axis, value) => {
    if (!selectedElement) return;
    
    // More robust parsing - handle empty strings and invalid values
    let numValue;
    if (value === '' || value === null || value === undefined) {
      numValue = 0;
    } else {
      const parsed = parseInt(value, 10);
      numValue = isNaN(parsed) ? 0 : parsed;
    }
    console.log('🔧 Position change requested:', {
      elementId: selectedElement.id,
      elementType: selectedElement.type,
      axis: axis,
      inputValue: value,
      parsedValue: numValue,
      currentPosition: JSON.stringify(selectedElement.position),
      hasContent: !!selectedElement.content
    });
    
    // Ensure we have a valid current position before updating
    const currentPosition = selectedElement.position || { x: 0, y: 0 };
    const newPosition = {
      ...currentPosition,
      [axis]: numValue
    };
    
    console.log('🔧 About to update position:', {
      currentPosition: JSON.stringify(currentPosition),
      newPosition: JSON.stringify(newPosition),
      axis: axis,
      numValue: numValue
    });
    
    onElementUpdate(selectedElement.id, {
      position: newPosition
    });
  };

  // Generate composition suggestions for product elements
  const generateCompositionSuggestions = async () => {
    if (!selectedElement || String(selectedElement.type) !== 'product') return;

    const canvasDimensions = {
      width: canvasState?.meta?.width || 300,
      height: canvasState?.meta?.height || 250
    };

    const productDimensions = {
      width: selectedElement.size.width,
      height: selectedElement.size.height
    };

    const result = await ProductCompositionService.analyzeComposition(
      selectedElement.content, // product image URL
      productDimensions,
      canvasDimensions
    );

    return result.success ? result.suggestions : null;
  };

  // Apply composition suggestion
  const applyCompositionSuggestion = async (suggestion) => {
    if (!selectedElement) return;

    const updatedElement = ProductCompositionService.applyComposition(
      selectedElement,
      suggestion
    );

    onElementUpdate(selectedElement.id, {
      position: updatedElement.position,
      size: updatedElement.size,
      styles: updatedElement.styles
    });

    setShowCompositionSuggestions(false);
  };

  // Product image upload handler
  const handleProductImageUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('File size too large. Please select an image under 10MB');
      return;
    }

    // Create object URL for the uploaded image
    const imageUrl = URL.createObjectURL(file);

    // Create product element with uploaded image
    const productElement = {
      id: `product-${Date.now()}`,
      type: 'product',
      content: imageUrl,
      position: { x: 50, y: 50 },
      size: { width: 120, height: 120 },
      zIndex: 1,
      styles: {
        borderRadius: '8px'
      },
      interactive: true,
      locked: false,
      visible: true,
      name: file.name.replace(/\.[^/.]+$/, '') // Add name from filename
    };

    // Add the product element to canvas
    onElementAdd('product', { x: 50, y: 50 }, null, productElement);

    // Clear the file input for future uploads
    event.target.value = '';
  }, [onElementAdd]);

  // Product management handlers
  const handleProductAdd = useCallback((product) => {
    setUserProducts(prev => [...prev, product]);
  }, []);

  const handleProductUpdate = useCallback((productId, updatedProduct) => {
    setUserProducts(prev => prev.map(p => p.id === productId ? updatedProduct : p));
  }, []);

  const handleProductRemove = useCallback((productId) => {
    setUserProducts(prev => prev.filter(p => p.id !== productId));
  }, []);

  // Phase 7: Template selection handler
  const handleTemplateSelect = useCallback((newCanvasState, template) => {
    // Update the entire canvas state with the new template
    if (onElementUpdate && newCanvasState.elements) {
      // For now, we'll replace all elements with template elements
      // In a real implementation, you might want to preserve user elements or merge
      newCanvasState.elements.forEach((element, index) => {
        // Add new elements from template
        if (onElementAdd) {
          onElementAdd(element);
        }
      });
    }
  }, [onElementUpdate, onElementAdd]);

  // Memoize product element detection for background customizer
  const productElementForBackground = useMemo(() => {
    return canvasState?.elements?.find(el => el.type === 'product' && el.content);
  }, [canvasState?.elements]);

  const tabs = [
    { id: 'templates', label: 'Templates', icon: '📋' },
    { id: 'element', label: 'Element', icon: '🎨' },
    { id: 'typography', label: 'Typography', icon: '🔤' },
    { id: 'buttons', label: 'Buttons', icon: '🔘' },
    { id: 'cta', label: 'CTA', icon: '⚡' },
    { id: 'assets', label: 'Assets', icon: '📁' },
    { id: 'layers', label: 'Layers', icon: '📋' },
    { id: 'background', label: 'Background', icon: '🖼️' },
    { id: 'composition', label: 'Composition', icon: '📐' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },

  ];

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Tab Navigation */}
      <div className="flex flex-wrap border-b border-gray-200 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              handleTabChange(tab.id);
            }}
            className={`px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
              tab.isAction && tab.id === 'publish'
                ? 'text-green-700 bg-green-100 hover:bg-green-200 border-2 border-green-300 rounded-md font-bold'
                : activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-4 overflow-y-auto flex-1">
        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <TemplateSelector 
            currentFormat={canvasState?.meta?.adSize || '300x250'}
            adData={campaignSettings}
            audienceType={campaignSettings?.audienceType}
            onTemplateSelect={handleTemplateSelect}
            canvasState={canvasState}
          />
        )}

        {/* Element Tab */}
        {activeTab === 'element' && (
          <div className="space-y-6">
            {selectedElement ? (
              <>
                {/* Element Info */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">
                    {String(selectedElement.type || 'element').charAt(0).toUpperCase() + String(selectedElement.type || 'element').slice(1)} Element
                  </h3>
                  <p className="text-sm text-blue-600">
                    {selectedElement.size?.width || 0} × {selectedElement.size?.height || 0} px
                  </p>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                  </label>
                  {String(selectedElement.type) === 'text' || String(selectedElement.type) === 'button' ? (
                    <input
                      type="text"
                      value={selectedElement.content || ''}
                      onChange={(e) => handleContentChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter content..."
                    />
                  ) : String(selectedElement.type) === 'image' || String(selectedElement.type) === 'product' ? (
                    <div>
                      <input
                        type="url"
                        value={selectedElement.content || ''}
                        onChange={(e) => handleContentChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                        placeholder="Enter image URL..."
                      />
                      <input
                        type="file"
                        ref={elementImageFileInputRef}
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file && file.type.startsWith('image/')) {
                            const imageUrl = URL.createObjectURL(file);
                            handleContentChange(imageUrl);
                            e.target.value = ''; // Clear for future uploads
                          }
                        }}
                        style={{ display: 'none' }}
                      />
                      <button 
                        onClick={() => elementImageFileInputRef.current?.click()}
                        className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm"
                      >
                        Upload Image
                      </button>
                    </div>
                  ) : null}
                </div>

                {/* Position & Size */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 w-4">X:</span>
                        <input
                          type="number"
                          value={selectedElement.position.x}
                          onChange={(e) => handlePositionChange('x', e.target.value)}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 w-4">Y:</span>
                        <input
                          type="number"
                          value={selectedElement.position.y}
                          onChange={(e) => handlePositionChange('y', e.target.value)}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 w-4">W:</span>
                        <input
                          type="number"
                          value={selectedElement.size.width}
                          onChange={(e) => handleSizeChange('width', e.target.value)}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 w-4">H:</span>
                        <input
                          type="number"
                          value={selectedElement.size.height}
                          onChange={(e) => handleSizeChange('height', e.target.value)}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Text Styles */}
                {(String(selectedElement.type) === 'text' || String(selectedElement.type) === 'button') && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-800">Typography</h4>
                    
                    {/* Font Size */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                      <input
                        type="range"
                        min="8"
                        max="72"
                        value={parseInt(selectedElement.styles.fontSize)}
                        onChange={(e) => handleStyleChange('fontSize', `${e.target.value}px`)}
                        className="w-full"
                      />
                      <div className="text-sm text-gray-500 mt-1">{selectedElement.styles.fontSize}</div>
                    </div>

                    {/* Font Weight */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Font Weight</label>
                      <select
                        value={selectedElement.styles.fontWeight}
                        onChange={(e) => handleStyleChange('fontWeight', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="normal">Normal</option>
                        <option value="bold">Bold</option>
                        <option value="lighter">Light</option>
                        <option value="bolder">Extra Bold</option>
                      </select>
                    </div>

                    {/* Text Color */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          value={selectedElement.styles.color}
                          onChange={(e) => handleStyleChange('color', e.target.value)}
                          className="w-12 h-8 border border-gray-300 rounded"
                        />
                        <input
                          type="text"
                          value={selectedElement.styles.color}
                          onChange={(e) => handleStyleChange('color', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                    </div>

                    {/* Text Alignment */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Text Alignment</label>
                      <div className="flex space-x-2">
                        {['left', 'center', 'right'].map(align => (
                          <button
                            key={align}
                            onClick={() => handleStyleChange('textAlign', align)}
                            className={`flex-1 py-2 text-sm rounded ${
                              selectedElement.styles.textAlign === align
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {align.charAt(0).toUpperCase() + align.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Button Styles - Basic controls with redirect to advanced editor */}
                {String(selectedElement.type) === 'button' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-800">Button Styling</h4>
                      <button
                        onClick={() => setActiveTab('buttons')}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                      >
                        Advanced Editor 🔘
                      </button>
                    </div>
                    
                    {/* Quick Background Color */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          value={selectedElement.styles.backgroundColor}
                          onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                          className="w-12 h-8 border border-gray-300 rounded"
                        />
                        <input
                          type="text"
                          value={selectedElement.styles.backgroundColor}
                          onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                    </div>

                    {/* Quick Border Radius */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Border Radius</label>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={parseInt(selectedElement.styles.borderRadius)}
                        onChange={(e) => handleStyleChange('borderRadius', `${e.target.value}px`)}
                        className="w-full"
                      />
                      <div className="text-sm text-gray-500 mt-1">{selectedElement.styles.borderRadius}</div>
                    </div>

                    {/* CTA Enhancement Quick Access */}
                    <div className="pt-3 border-t border-gray-200">
                      <button
                        onClick={() => setActiveTab('cta')}
                        className="w-full py-2 px-4 bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-700 rounded-md hover:from-orange-200 hover:to-yellow-200 transition-colors text-sm font-medium"
                      >
                        ⚡ Enhance CTA with AI
                      </button>
                    </div>
                  </div>
                )}

                {/* Element Actions */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onElementUpdate(selectedElement.id, { locked: !selectedElement.locked })}
                      className={`flex-1 py-2 text-sm rounded ${
                        selectedElement.locked
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {selectedElement.locked ? '🔒 Unlock' : '🔓 Lock'}
                    </button>
                    <button className="flex-1 py-2 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded">
                      🗑️ Delete
                    </button>
                  </div>
                </div>


              </>
            ) : (
              <div className="space-y-6">
                {/* No Element Selected - Show Quick Add Options */}
                <div className="text-center text-gray-500 py-4">
                  <div className="text-4xl mb-4">🎨</div>
                  <h3 className="text-lg font-medium mb-2">No Element Selected</h3>
                  <p className="text-sm mb-6">Click on an element in the canvas to edit its properties, or add a new element below</p>
                </div>

                {/* Quick Add Elements */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-800">Add New Element</h4>
                  
                  {/* Add Text Element */}
                  <button
                    onClick={() => {
                      const newPosition = { x: 50, y: 50 };
                      onElementAdd('text', newPosition);
                    }}
                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">📝</span>
                      <div>
                        <div className="font-semibold text-gray-800">Text Element</div>
                        <div className="text-xs text-gray-600">Add headlines, descriptions, or any text</div>
                      </div>
                    </div>
                  </button>

                  {/* Add Image Element */}
                  <button
                    onClick={() => {
                      const newPosition = { x: 100, y: 100 };
                      onElementAdd('image', newPosition);
                    }}
                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all text-left"
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">🖼️</span>
                      <div>
                        <div className="font-semibold text-gray-800">Image Element</div>
                        <div className="text-xs text-gray-600">Add photos, graphics, or product images</div>
                      </div>
                    </div>
                  </button>

                  {/* Add Button Element */}
                  <button
                    onClick={() => {
                      const newPosition = { x: 150, y: 200 };
                      onElementAdd('button', newPosition);
                    }}
                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all text-left"
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">🔘</span>
                      <div>
                        <div className="font-semibold text-gray-800">Button Element</div>
                        <div className="text-xs text-gray-600">Add call-to-action buttons</div>
                      </div>
                    </div>
                  </button>

                  {/* Add Product Element with File Upload */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-orange-400 hover:bg-orange-50 transition-all">
                    <div className="flex items-center mb-3">
                      <span className="text-2xl mr-3">📦</span>
                      <div>
                        <div className="font-semibold text-gray-800">Product Image</div>
                        <div className="text-xs text-gray-600">Upload and add product photos</div>
                      </div>
                    </div>
                    
                    <input
                      type="file"
                      ref={productFileInputRef}
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file && file.type.startsWith('image/')) {
                          if (file.size > 10 * 1024 * 1024) { // 10MB limit
                            alert('File size must be less than 10MB');
                            return;
                          }

                          const imageUrl = URL.createObjectURL(file);
                          const newPosition = { x: 75, y: 125 };
                          
                          // Create a product element with the uploaded image
                          const productElement = {
                            id: `product-${Date.now()}`,
                            type: 'product',
                            content: imageUrl,
                            position: newPosition,
                            size: { width: 150, height: 150 },
                            styles: {
                              borderRadius: '8px',
                              objectFit: 'cover'
                            },
                            interactive: true,
                            locked: false
                          };
                          
                          onElementAdd('custom', newPosition, null, productElement);
                          e.target.value = ''; // Clear for future uploads
                        } else {
                          alert('Please select a valid image file');
                        }
                      }}
                      style={{ display: 'none' }}
                    />
                    <button 
                      onClick={() => productFileInputRef.current?.click()}
                      className="w-full px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-md text-sm font-medium"
                    >
                      📤 Select Product Image
                    </button>
                  </div>
                </div>

                {/* Quick Tip */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-xs text-blue-700">
                    💡 <strong>Tip:</strong> After adding an element, click on it to edit its properties, position, and styling options.
                  </div>
                </div>


              </div>
            )}
          </div>
        )}

        {/* Typography Tab */}
        {activeTab === 'typography' && (
          <TypographyPanel
            selectedElement={selectedElement}
            onStyleChange={handleStyleChange}
            onApplyPreset={(preset) => {
              // Apply the complete preset to the selected element
              onElementUpdate(selectedElement.id, {
                styles: {
                  ...selectedElement.styles,
                  ...preset
                }
              });
            }}
          />
        )}

        {/* Buttons Tab - Phase 6 */}
        {activeTab === 'buttons' && (
          <ButtonEditor
            element={selectedElement && String(selectedElement.type) === 'button' ? selectedElement : null}
            onStyleChange={(styles) => {
              if (selectedElement && String(selectedElement.type) === 'button') {
                onElementUpdate(selectedElement.id, {
                  styles: {
                    ...selectedElement.styles,
                    ...styles
                  }
                });
              }
            }}
            onContentChange={(content) => {
              if (selectedElement && String(selectedElement.type) === 'button') {
                onElementUpdate(selectedElement.id, { content });
              }
            }}
            onSizeChange={(size) => {
              if (selectedElement && String(selectedElement.type) === 'button') {
                onElementUpdate(selectedElement.id, { size });
              }
            }}
          />
        )}

        {/* CTA Enhancer Tab - Phase 6 */}
        {activeTab === 'cta' && (
          <CTAEnhancer
            element={selectedElement && String(selectedElement.type) === 'button' ? selectedElement : null}
            onContentChange={(content) => {
              if (selectedElement && String(selectedElement.type) === 'button') {
                onElementUpdate(selectedElement.id, { content });
              }
            }}
            onStyleChange={(styles) => {
              if (selectedElement && String(selectedElement.type) === 'button') {
                onElementUpdate(selectedElement.id, {
                  styles: {
                    ...selectedElement.styles,
                    ...styles
                  }
                });
              }
            }}
            productCategory={campaignSettings?.productCategory || 'ECOMMERCE'}
            audienceType={campaignSettings?.audience?.type || 'general'}
          />
        )}

        {/* Assets Tab */}
        {activeTab === 'assets' && (
          <div className="h-full flex flex-col">
            {/* Asset Sub-tabs */}
            <div className="flex border-b border-gray-200 bg-gray-50">
              <button
                onClick={() => setAssetSubTab('library')}
                className={`flex-1 px-3 py-2 text-xs transition-colors ${
                  assetSubTab === 'library'
                    ? 'text-blue-600 bg-white border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                📁 Library
              </button>
              <button
                onClick={() => setAssetSubTab('products')}
                className={`flex-1 px-3 py-2 text-xs transition-colors ${
                  assetSubTab === 'products'
                    ? 'text-blue-600 bg-white border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                📦 Products
              </button>
            </div>

            {/* Asset Content */}
            <div className="flex-1 overflow-hidden">
              {assetSubTab === 'library' ? (
                <AssetLibrary
                  onAssetAdd={(elementOrAsset) => {
                    // Check if this is already a formatted element or needs conversion
                    if (elementOrAsset.id && elementOrAsset.position && elementOrAsset.size) {
                      // This is already a canvas element - use onElementAdd
                      onElementAdd('custom', elementOrAsset.position, null, elementOrAsset);
                    } else {
                      // This is a raw asset that needs conversion - AssetLibrary already handles this
                      // The createAssetElement function in AssetLibrary creates proper elements
                      console.log('Adding asset element:', elementOrAsset);
                      onElementAdd('custom', { x: 50, y: 50 }, null, elementOrAsset);
                    }
                  }}
                  userAssets={[]} // TODO: Implement user asset management
                  recentAssets={[]} // TODO: Implement recent assets tracking
                  favoriteAssets={[]} // TODO: Implement favorites system
                />
              ) : (
                <ProductAssetManager
                  products={userProducts}
                  onProductAdd={handleProductAdd}
                  onProductUpdate={handleProductUpdate}
                  onProductRemove={handleProductRemove}
                  adFormat={canvasState?.meta?.adSize || '300x250'}
                />
              )}
            </div>
          </div>
        )}

        {/* Layers Tab */}
        {activeTab === 'layers' && (
          <div className="space-y-0">
            {/* Layer Manager */}
            <LayerManager
              elements={canvasState?.elements || []}
              selectedElementId={selectedElementId}
              onElementSelect={onElementSelect}
              onElementUpdate={onElementUpdate}
              onElementDelete={onElementDelete}
              onElementDuplicate={onElementDuplicate}
              onElementLock={onElementLock}
              onLayerReorder={onLayerReorder}
            />
            
            {/* Alignment Tools */}
            <AlignmentTools
              elements={canvasState?.elements || []}
              selectedElementIds={selectedElementIds}
              canvasDimensions={{
                width: parseInt((canvasState?.meta?.adSize || '300x250').split('x')[0]),
                height: parseInt((canvasState?.meta?.adSize || '300x250').split('x')[1])
              }}
              onElementUpdate={onElementUpdate}
              onElementGroup={onElementGroup}
              onElementUngroup={onElementUngroup}
              onMultiElementUpdate={onMultiElementUpdate}
            />
          </div>
        )}

        {/* Background Tab */}
        {activeTab === 'background' && (
          <div className="space-y-6">
            {/* Enhanced Background Customizer */}
            {dbOperations && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Background Generator</h3>
                {productElementForBackground ? (
                  <BackgroundCustomizer
                    key="bg-customizer-creative" // Stable key that doesn't change when product element changes
                    mode="creative"
                    currentImage={productElementForBackground.content} // Use product image, not background
                    imageId={productElementForBackground.id}
                    onBackgroundChange={onBackgroundChange}
                    dbOperations={dbOperations}
                  />
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-yellow-800">
                      <span className="text-lg">⚠️</span>
                      <div>
                        <h4 className="font-medium">Product Image Required</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          Add a product element to the canvas first. The AI will generate backgrounds around your product.
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <input
                        type="file"
                        ref={productFileInputRef}
                        accept="image/*"
                        onChange={handleProductImageUpload}
                        style={{ display: 'none' }}
                      />
                      <button
                        onClick={() => productFileInputRef.current?.click()}
                        className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors flex items-center justify-center space-x-2"
                      >
                        <span>📁</span>
                        <span>Select Product Image</span>
                      </button>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Choose a product image from your computer to add to the canvas
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Manual Background Options */}
            <div className="pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-800 mb-3">Manual Background</h4>
              <div className="space-y-3">
                <input
                  type="url"
                  value={currentBackgroundValue}
                  onChange={(e) => handleBackgroundUrlChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter background image URL..."
                />
                <input
                  type="file"
                  ref={backgroundFileInputRef}
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file && file.type.startsWith('image/')) {
                      const imageUrl = URL.createObjectURL(file);
                      onBackgroundChange(imageUrl);
                      e.target.value = ''; // Clear for future uploads
                    }
                  }}
                  style={{ display: 'none' }}
                />
                <button 
                  onClick={() => backgroundFileInputRef.current?.click()}
                  className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm"
                >
                  Upload Background
                </button>
                {canvasState?.meta?.backgroundImage && (
                  <button
                    onClick={() => {
                      // Clear typing state and remove background
                      setIsTypingBackground(false);
                      setTempBackgroundUrl('');
                      onBackgroundChange(null);
                    }}
                    className="w-full px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm"
                  >
                    Remove Background
                  </button>
                )}
              </div>
            </div>

            {/* Background Preview */}
            {canvasState?.meta?.backgroundImage && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Background</label>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <img
                    src={canvasState.meta.backgroundImage}
                    alt="Background Preview"
                    className="w-full h-32 object-cover"
                  />
                </div>
              </div>
            )}

            {/* Quick Background Colors */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quick Colors</label>
              <div className="grid grid-cols-6 gap-2">
                {['#ffffff', '#f3f4f6', '#1f2937', '#ef4444', '#3b82f6', '#10b981'].map(color => (
                  <button
                    key={color}
                    onClick={() => onBackgroundChange(`data:image/svg+xml;base64,${btoa(`<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="${color}"/></svg>`)}`)}
                    className="w-full h-8 rounded border border-gray-300"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Composition Tab */}
        {activeTab === 'composition' && (
          <div className="space-y-6">
            {selectedElement && String(selectedElement.type) === 'product' ? (
              <>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Smart Composition</h3>
                  <p className="text-sm text-blue-600">
                    AI-powered suggestions for optimal product placement
                  </p>
                </div>

                {/* Composition Presets */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">Quick Layouts</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(ProductCompositionService.getCompositionPresets()).map(([id, preset]) => (
                      <button
                        key={id}
                        onClick={() => {
                          const canvasWidth = canvasState?.meta?.width || 300;
                          const canvasHeight = canvasState?.meta?.height || 250;
                          const suggestion = {
                            position: {
                              x: preset.position.x === '50%' ? canvasWidth * 0.5 - selectedElement.size.width * 0.5 :
                                 preset.position.x === '33%' ? canvasWidth * 0.33 - selectedElement.size.width * 0.5 :
                                 preset.position.x === '66%' ? canvasWidth * 0.66 - selectedElement.size.width * 0.5 :
                                 preset.position.x === '85%' ? canvasWidth * 0.85 - selectedElement.size.width * 0.5 :
                                 canvasWidth * 0.5 - selectedElement.size.width * 0.5,
                              y: preset.position.y === '50%' ? canvasHeight * 0.5 - selectedElement.size.height * 0.5 :
                                 preset.position.y === '75%' ? canvasHeight * 0.75 - selectedElement.size.height * 0.5 :
                                 preset.position.y === '85%' ? canvasHeight * 0.85 - selectedElement.size.height * 0.5 :
                                 canvasHeight * 0.5 - selectedElement.size.height * 0.5
                            },
                            scale: preset.scale
                          };
                          applyCompositionSuggestion(suggestion);
                        }}
                        className="p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                      >
                        <div className="font-medium text-gray-900 text-sm mb-1">
                          {preset.name}
                        </div>
                        <div className="text-xs text-gray-600">
                          {preset.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Smart Composition Analysis */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">Smart Analysis</h4>
                  <button
                    onClick={async () => {
                      setShowCompositionSuggestions(true);
                      const suggestions = await generateCompositionSuggestions();
                      if (suggestions) {
                        // Show suggestions in UI
                        console.log('Generated suggestions:', suggestions);
                      }
                    }}
                    className="w-full px-4 py-3 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-medium transition-colors"
                  >
                    🧠 Analyze & Suggest Layout
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    Analyze current design and suggest optimal product placement
                  </p>
                </div>

                {/* Text Safe Zones */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">Text Placement Zones</h4>
                  <button
                    onClick={() => {
                      const safeZones = ProductCompositionService.calculateTextSafeZones(
                        selectedElement,
                        { width: canvasState?.meta?.width || 300, height: canvasState?.meta?.height || 250 }
                      );
                      console.log('Safe zones for text:', safeZones);
                      // Could highlight these zones on canvas
                    }}
                    className="w-full px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm transition-colors"
                  >
                    📍 Show Text Safe Zones
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    Find optimal areas for headlines and descriptions
                  </p>
                </div>

                {/* Lighting Effects */}
                {canvasState?.meta?.backgroundImage && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-3">Lighting Effects</h4>
                    <div className="space-y-2">
                      {['indoor', 'outdoor', 'studio', 'bright'].map(context => (
                        <button
                          key={context}
                          onClick={() => {
                            const effects = ProductCompositionService.generateLightingEffects(context);
                            const updatedElement = ProductCompositionService.applyComposition(
                              selectedElement,
                              { position: selectedElement.position, scale: 1 },
                              effects
                            );
                            onElementUpdate(selectedElement.id, {
                              styles: updatedElement.styles
                            });
                          }}
                          className="w-full px-3 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded text-sm transition-colors"
                        >
                          ✨ Apply {context.charAt(0).toUpperCase() + context.slice(1)} Lighting
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-4">📐</div>
                <h3 className="text-lg font-medium mb-2">Select a Product Element</h3>
                <p className="text-sm">Smart composition tools are available for product elements</p>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Campaign Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Campaign</h3>
              <p className="text-sm text-gray-600">
                {campaignSettings?.campaign?.name || 'Unnamed Campaign'}
              </p>
            </div>

            {/* Canvas Settings */}
            <div>
              <h4 className="font-medium text-gray-800 mb-3">Canvas Settings</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Show Grid</span>
                  <input type="checkbox" className="toggle" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Snap to Grid</span>
                  <input type="checkbox" className="toggle" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Show Guides</span>
                  <input type="checkbox" className="toggle" />
                </div>
              </div>
            </div>

            {/* Element Count */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Design Stats</h4>
              <div className="text-sm text-blue-600 space-y-1">
                <div>Elements: {(canvasState?.elements || []).length}</div>
                <div>Text Elements: {(canvasState?.elements || []).filter(el => el.type === 'text').length}</div>
                <div>Buttons: {(canvasState?.elements || []).filter(el => el.type === 'button').length}</div>
                <div>Images: {(canvasState?.elements || []).filter(el => el.type === 'image' || el.type === 'product').length}</div>
              </div>
            </div>


          </div>
        )}
      </div>
    </div>
  );
}

export default DesignControls; 