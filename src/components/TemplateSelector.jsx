import React, { useState, useMemo } from 'react';
import { 
  getTemplatesForFormat, 
  getTemplate, 
  applyTemplate, 
  recommendTemplate,
  TEMPLATE_CATEGORIES 
} from '../templates/adLayouts.js';

/**
 * TemplateSelector - Phase 7
 * Component for selecting and applying layout templates
 */

function TemplateSelector({ 
  currentFormat = '300x250',
  adData,
  audienceType,
  onTemplateSelect,
  canvasState,
  className = ''
}) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Get available templates for current format
  const availableTemplates = useMemo(() => {
    return getTemplatesForFormat(currentFormat);
  }, [currentFormat]);

  // Get recommended template
  const recommendedTemplate = useMemo(() => {
    return recommendTemplate(adData, audienceType);
  }, [adData, audienceType]);

  // Handle template selection
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    
    if (onTemplateSelect) {
      const newCanvasState = applyTemplate(canvasState, template.category, currentFormat, adData);
      onTemplateSelect(newCanvasState, template);
    }
  };

  // Template preview component
  const TemplatePreview = ({ template, isRecommended = false, isSelected = false }) => {
    const templateData = getTemplate(template.category, currentFormat);
    if (!templateData) return null;

    return (
      <div
        className={`relative cursor-pointer transition-all duration-200 ${
          isSelected 
            ? 'ring-2 ring-blue-500 bg-blue-50' 
            : 'hover:shadow-md hover:bg-gray-50'
        }`}
        onClick={() => handleTemplateSelect(template)}
      >
        {/* Compact Template Card for Narrow Panel */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 mb-3">
          {/* Compact Header */}
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{template.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-800 text-sm truncate">{template.name}</h3>
                  {isRecommended && (
                    <div className="inline-flex items-center px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded-full mt-1">
                      ⭐ Recommended
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Compact Description */}
            <p className="text-xs text-gray-500 mb-3 line-clamp-2">{template.description}</p>

            {/* Mini Preview Canvas */}
            <div className="bg-gray-100 rounded p-2 mb-2">
              <div 
                className="relative bg-white border rounded shadow-sm mx-auto"
                style={{
                  width: '100%',
                  height: 60,
                  maxWidth: 120
                }}
              >
                {/* Simplified mini preview - just show element types */}
                <div className="flex items-center justify-center h-full space-x-1">
                  {templateData.elements.slice(0, 3).map((element, index) => (
                    <div key={index} className="flex flex-col items-center">
                      {element.type === 'text' && (
                        <div className="w-2 h-1 bg-gray-400 rounded"></div>
                      )}
                      {element.type === 'button' && (
                        <div className="w-3 h-2 bg-blue-500 rounded"></div>
                      )}
                      {element.type === 'product' && (
                        <div className="w-2 h-3 bg-green-500 rounded"></div>
                      )}
                      {element.type === 'image' && (
                        <div className="w-2 h-2 bg-yellow-500 rounded"></div>
                      )}
                      {element.type === 'shape' && (
                        <div className="w-2 h-2 bg-red-500 rounded"></div>
                      )}
                    </div>
                  ))}
                  {templateData.elements.length > 3 && (
                    <span className="text-xs text-gray-400">+{templateData.elements.length - 3}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Compact Stats & Action */}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>{templateData.elements.length} elements</span>
              <span className="bg-gray-200 px-2 py-1 rounded text-xs">{currentFormat}</span>
            </div>
            
            {/* Apply Button */}
            <button
              className={`w-full py-2 text-xs font-medium rounded transition-colors ${
                isSelected
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isSelected ? 'Applied' : 'Apply Template'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Quick template actions - Compact for narrow panel
  const QuickActions = () => (
    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <span className="text-blue-600 font-medium text-sm">Templates</span>
        <span className="text-xs text-blue-500">{currentFormat}</span>
      </div>
      
      <button
        onClick={() => {
          const recommended = availableTemplates.find(t => t.category === recommendedTemplate);
          if (recommended) handleTemplateSelect(recommended);
        }}
        className="w-full px-3 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors mb-2"
      >
        ⭐ Use Recommended
      </button>
      
      <p className="text-xs text-blue-600">
        Choose a layout optimized for your content and format.
      </p>
    </div>
  );

  return (
    <div className={`template-selector ${className}`}>
      <QuickActions />

      {/* Template List - Single Column for Narrow Panel */}
      <div className="space-y-2">
        {availableTemplates.map((template) => (
          <TemplatePreview
            key={template.category}
            template={template}
            isRecommended={template.category === recommendedTemplate}
            isSelected={selectedTemplate?.category === template.category}
          />
        ))}
      </div>

      {/* Empty State */}
      {availableTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">📐</div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            No Templates Available
          </h3>
          <p className="text-sm text-gray-500">
            No layout templates are available for the {currentFormat} format.
          </p>
        </div>
      )}

      {/* Compact Success Feedback */}
      {selectedTemplate && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-green-600">{selectedTemplate.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-800 truncate">
                {selectedTemplate.name} Applied
              </p>
              <p className="text-xs text-green-600">
                ✓ Ready to customize
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Compact Format Tips */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-yellow-600">💡</span>
          <h4 className="font-medium text-yellow-800 text-sm">
            {currentFormat} Tips
          </h4>
        </div>
        <div className="text-xs text-yellow-700 space-y-1">
          {currentFormat === '300x250' && (
            <>
              <p>• Keep text concise and readable</p>
              <p>• Use bold, contrasting CTA colors</p>
            </>
          )}
          {currentFormat === '320x50' && (
            <>
              <p>• Focus on single, clear message</p>
              <p>• Ensure CTA is prominent</p>
            </>
          )}
          {currentFormat === '320x400' && (
            <>
              <p>• Stack elements vertically</p>
              <p>• Use larger mobile-friendly fonts</p>
            </>
          )}
          {currentFormat === '1080x1920' && (
            <>
              <p>• Design for thumb interactions</p>
              <p>• Use large, bold typography</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default TemplateSelector; 