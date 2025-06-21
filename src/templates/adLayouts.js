/**
 * Ad Layout Templates - Phase 7
 * Pre-optimized layouts for different ad categories and formats
 */

// Layout template categories
export const TEMPLATE_CATEGORIES = {
  PRODUCT_FOCUSED: 'product-focused',
  LIFESTYLE: 'lifestyle', 
  PROMOTIONAL: 'promotional',
  BRAND_AWARENESS: 'brand-awareness',
  VERTICAL_PRODUCT: 'vertical-product',
  SPLIT_LAYOUT: 'split-layout'
};

// Base layout definitions for each template type across formats
export const AD_TEMPLATES = {
  [TEMPLATE_CATEGORIES.PRODUCT_FOCUSED]: {
    name: 'Product Focused',
    description: 'Emphasizes product imagery and key benefits',
    icon: '📦',
    
    '300x250': {
      backgroundPosition: 'right',
      elements: [
        {
          id: 'product-image',
          type: 'product',
          position: { x: 180, y: 50 },
          size: { width: 100, height: 150 },
          zIndex: 3,
          responsive: { anchor: 'center-right', behavior: 'maintain-aspect' }
        },
        {
          id: 'headline',
          type: 'text',
          position: { x: 20, y: 30 },
          size: { width: 150, height: 40 },
          zIndex: 2,
          content: 'Product Name',
          styles: {
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#333333',
            textAlign: 'left'
          },
          responsive: { anchor: 'top-left', behavior: 'scale-text' }
        },
        {
          id: 'description',
          type: 'text',
          position: { x: 20, y: 80 },
          size: { width: 150, height: 60 },
          zIndex: 2,
          content: 'Key benefits and features',
          styles: {
            fontSize: '12px',
            fontWeight: '400',
            color: '#666666',
            textAlign: 'left'
          },
          responsive: { anchor: 'top-left', behavior: 'scale-text' }
        },
        {
          id: 'cta-button',
          type: 'button',
          position: { x: 20, y: 200 },
          size: { width: 100, height: 35 },
          zIndex: 4,
          content: 'Shop Now',
          styles: {
            backgroundColor: '#007bff',
            color: '#ffffff',
            borderRadius: '6px',
            fontWeight: 'bold',
            fontSize: '14px'
          },
          responsive: { anchor: 'bottom-left', behavior: 'maintain-size' }
        }
      ]
    },

    '320x50': {
      backgroundPosition: 'right',
      elements: [
        {
          id: 'product-image',
          type: 'product',
          position: { x: 270, y: 5 },
          size: { width: 40, height: 40 },
          zIndex: 3,
          responsive: { anchor: 'center-right', behavior: 'maintain-aspect' }
        },
        {
          id: 'headline',
          type: 'text',
          position: { x: 10, y: 8 },
          size: { width: 180, height: 20 },
          zIndex: 2,
          content: 'Product Name',
          styles: {
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#333333',
            textAlign: 'left'
          },
          responsive: { anchor: 'top-left', behavior: 'scale-text' }
        },
        {
          id: 'cta-button',
          type: 'button',
          position: { x: 200, y: 10 },
          size: { width: 60, height: 30 },
          zIndex: 4,
          content: 'Shop',
          styles: {
            backgroundColor: '#007bff',
            color: '#ffffff',
            borderRadius: '4px',
            fontWeight: 'bold',
            fontSize: '11px'
          },
          responsive: { anchor: 'center-right', behavior: 'maintain-size' }
        }
      ]
    },

    '320x400': {
      backgroundPosition: 'center',
      elements: [
        {
          id: 'product-image',
          type: 'product',
          position: { x: 60, y: 80 },
          size: { width: 200, height: 200 },
          zIndex: 3,
          responsive: { anchor: 'top-center', behavior: 'maintain-aspect' }
        },
        {
          id: 'headline',
          type: 'text',
          position: { x: 20, y: 30 },
          size: { width: 280, height: 35 },
          zIndex: 2,
          content: 'Product Name',
          styles: {
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#333333',
            textAlign: 'center'
          },
          responsive: { anchor: 'top-center', behavior: 'scale-text' }
        },
        {
          id: 'description',
          type: 'text',
          position: { x: 20, y: 290 },
          size: { width: 280, height: 40 },
          zIndex: 2,
          content: 'Key benefits and features',
          styles: {
            fontSize: '14px',
            fontWeight: '400',
            color: '#666666',
            textAlign: 'center'
          },
          responsive: { anchor: 'bottom-center', behavior: 'scale-text' }
        },
        {
          id: 'cta-button',
          type: 'button',
          position: { x: 110, y: 350 },
          size: { width: 100, height: 40 },
          zIndex: 4,
          content: 'Shop Now',
          styles: {
            backgroundColor: '#007bff',
            color: '#ffffff',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '16px'
          },
          responsive: { anchor: 'bottom-center', behavior: 'maintain-size' }
        }
      ]
    },

    '1080x1920': {
      backgroundPosition: 'center',
      elements: [
        {
          id: 'product-image',
          type: 'product',
          position: { x: 240, y: 600 },
          size: { width: 600, height: 800 },
          zIndex: 3,
          responsive: { anchor: 'center-center', behavior: 'maintain-aspect' }
        },
        {
          id: 'headline',
          type: 'text',
          position: { x: 80, y: 300 },
          size: { width: 920, height: 100 },
          zIndex: 2,
          content: 'Product Name',
          styles: {
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#333333',
            textAlign: 'center'
          },
          responsive: { anchor: 'top-center', behavior: 'scale-text' }
        },
        {
          id: 'description',
          type: 'text',
          position: { x: 140, y: 1500 },
          size: { width: 800, height: 120 },
          zIndex: 2,
          content: 'Key benefits and features',
          styles: {
            fontSize: '32px',
            fontWeight: '400',
            color: '#666666',
            textAlign: 'center'
          },
          responsive: { anchor: 'bottom-center', behavior: 'scale-text' }
        },
        {
          id: 'cta-button',
          type: 'button',
          position: { x: 390, y: 1700 },
          size: { width: 300, height: 80 },
          zIndex: 4,
          content: 'Shop Now',
          styles: {
            backgroundColor: '#007bff',
            color: '#ffffff',
            borderRadius: '16px',
            fontWeight: 'bold',
            fontSize: '28px'
          },
          responsive: { anchor: 'bottom-center', behavior: 'maintain-size' }
        }
      ]
    }
  },

  [TEMPLATE_CATEGORIES.LIFESTYLE]: {
    name: 'Lifestyle',
    description: 'Emphasizes lifestyle and environmental context',
    icon: '🌟',
    
    '300x250': {
      backgroundPosition: 'full',
      elements: [
        {
          id: 'headline',
          type: 'text',
          position: { x: 20, y: 180 },
          size: { width: 260, height: 30 },
          zIndex: 3,
          content: 'Live Your Best Life',
          styles: {
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#ffffff',
            textAlign: 'center',
            textShadow: '2px 2px 4px rgba(0,0,0,0.7)'
          },
          responsive: { anchor: 'bottom-center', behavior: 'scale-text' }
        },
        {
          id: 'subtitle',
          type: 'text',
          position: { x: 20, y: 210 },
          size: { width: 260, height: 20 },
          zIndex: 3,
          content: 'Discover the difference',
          styles: {
            fontSize: '12px',
            fontWeight: '400',
            color: '#ffffff',
            textAlign: 'center',
            textShadow: '1px 1px 2px rgba(0,0,0,0.7)'
          },
          responsive: { anchor: 'bottom-center', behavior: 'scale-text' }
        }
      ]
    },

    '320x400': {
      backgroundPosition: 'full',
      elements: [
        {
          id: 'headline',
          type: 'text',
          position: { x: 20, y: 300 },
          size: { width: 280, height: 40 },
          zIndex: 3,
          content: 'Live Your Best Life',
          styles: {
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#ffffff',
            textAlign: 'center',
            textShadow: '2px 2px 4px rgba(0,0,0,0.7)'
          },
          responsive: { anchor: 'bottom-center', behavior: 'scale-text' }
        },
        {
          id: 'subtitle',
          type: 'text',
          position: { x: 20, y: 340 },
          size: { width: 280, height: 25 },
          zIndex: 3,
          content: 'Discover the difference',
          styles: {
            fontSize: '16px',
            fontWeight: '400',
            color: '#ffffff',
            textAlign: 'center',
            textShadow: '1px 1px 2px rgba(0,0,0,0.7)'
          },
          responsive: { anchor: 'bottom-center', behavior: 'scale-text' }
        }
      ]
    }
  },

  [TEMPLATE_CATEGORIES.PROMOTIONAL]: {
    name: 'Promotional',
    description: 'Focused on sales, offers, and urgency',
    icon: '🏷️',
    
    '300x250': {
      backgroundPosition: 'center',
      elements: [
        {
          id: 'offer-badge',
          type: 'shape',
          position: { x: 20, y: 20 },
          size: { width: 80, height: 40 },
          zIndex: 4,
          shapeType: 'rectangle',
          styles: {
            backgroundColor: '#ff4444',
            borderRadius: '8px',
            color: '#ffffff'
          },
          responsive: { anchor: 'top-left', behavior: 'maintain-size' }
        },
        {
          id: 'offer-text',
          type: 'text',
          position: { x: 25, y: 28 },
          size: { width: 70, height: 24 },
          zIndex: 5,
          content: '50% OFF',
          styles: {
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#ffffff',
            textAlign: 'center'
          },
          responsive: { anchor: 'top-left', behavior: 'scale-text' }
        },
        {
          id: 'main-headline',
          type: 'text',
          position: { x: 120, y: 30 },
          size: { width: 160, height: 35 },
          zIndex: 3,
          content: 'MEGA SALE',
          styles: {
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#333333',
            textAlign: 'center'
          },
          responsive: { anchor: 'top-center', behavior: 'scale-text' }
        },
        {
          id: 'urgency-text',
          type: 'text',
          position: { x: 50, y: 150 },
          size: { width: 200, height: 30 },
          zIndex: 3,
          content: 'Limited Time Only!',
          styles: {
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#ff4444',
            textAlign: 'center'
          },
          responsive: { anchor: 'center-center', behavior: 'scale-text' }
        },
        {
          id: 'cta-button',
          type: 'button',
          position: { x: 100, y: 200 },
          size: { width: 100, height: 40 },
          zIndex: 4,
          content: 'Shop Sale',
          styles: {
            backgroundColor: '#ff4444',
            color: '#ffffff',
            borderRadius: '20px',
            fontWeight: 'bold',
            fontSize: '14px',
            textTransform: 'uppercase'
          },
          responsive: { anchor: 'bottom-center', behavior: 'maintain-size' }
        }
      ]
    }
  },

  [TEMPLATE_CATEGORIES.BRAND_AWARENESS]: {
    name: 'Brand Awareness',
    description: 'Focus on brand recognition and storytelling',
    icon: '🏆',
    
    '300x250': {
      backgroundPosition: 'center',
      elements: [
        {
          id: 'brand-logo',
          type: 'image',
          position: { x: 20, y: 20 },
          size: { width: 80, height: 40 },
          zIndex: 3,
          responsive: { anchor: 'top-left', behavior: 'maintain-aspect' }
        },
        {
          id: 'brand-message',
          type: 'text',
          position: { x: 20, y: 80 },
          size: { width: 260, height: 80 },
          zIndex: 2,
          content: 'Our Brand Story',
          styles: {
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#333333',
            textAlign: 'center'
          },
          responsive: { anchor: 'center', behavior: 'scale-text' }
        },
        {
          id: 'supporting-text',
          type: 'text',
          position: { x: 20, y: 170 },
          size: { width: 260, height: 60 },
          zIndex: 2,
          content: 'Building trust through quality',
          styles: {
            fontSize: '14px',
            fontWeight: '400',
            color: '#666666',
            textAlign: 'center'
          },
          responsive: { anchor: 'bottom-center', behavior: 'scale-text' }
        }
      ]
    },

    '320x400': {
      backgroundPosition: 'center',
      elements: [
        {
          id: 'logo-area',
          type: 'image',
          position: { x: 60, y: 80 },
          size: { width: 200, height: 200 },
          zIndex: 3,
          responsive: { anchor: 'top-center', behavior: 'maintain-aspect' }
        },
        {
          id: 'brand-tagline',
          type: 'text',
          position: { x: 20, y: 30 },
          size: { width: 280, height: 35 },
          zIndex: 2,
          content: 'Experience the Difference',
          styles: {
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#333333',
            textAlign: 'center'
          },
          responsive: { anchor: 'top-center', behavior: 'scale-text' }
        },
        {
          id: 'brand-values',
          type: 'text',
          position: { x: 20, y: 290 },
          size: { width: 280, height: 40 },
          zIndex: 2,
          content: 'Quality • Innovation • Trust',
          styles: {
            fontSize: '14px',
            fontWeight: '400',
            color: '#666666',
            textAlign: 'center',
            letterSpacing: '1px'
          },
          responsive: { anchor: 'bottom-center', behavior: 'scale-text' }
        },
        {
          id: 'cta-button',
          type: 'button',
          position: { x: 110, y: 350 },
          size: { width: 100, height: 40 },
          zIndex: 4,
          content: 'Shop Now',
          styles: {
            backgroundColor: '#007bff',
            color: '#ffffff',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '16px'
          },
          responsive: { anchor: 'bottom-center', behavior: 'maintain-size' }
        }
      ]
    }
  },

  // New template category for user-requested 300x250 layouts
  [TEMPLATE_CATEGORIES.VERTICAL_PRODUCT]: {
    name: 'Vertical Product',
    description: 'Vertical layout with headline, subheadline, product image, and CTA',
    icon: '📱',
    
    '300x250': {
      backgroundPosition: 'center',
      elements: [
        {
          id: 'headline',
          type: 'text',
          position: { x: 20, y: 15 },
          size: { width: 260, height: 35 },
          zIndex: 2,
          content: 'New Product',
          styles: {
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#333333',
            textAlign: 'center'
          },
          responsive: { anchor: 'top-center', behavior: 'scale-text' }
        },
        {
          id: 'subheadline',
          type: 'text',
          position: { x: 20, y: 55 },
          size: { width: 260, height: 25 },
          zIndex: 2,
          content: 'Now Available',
          styles: {
            fontSize: '14px',
            fontWeight: '400',
            color: '#666666',
            textAlign: 'center'
          },
          responsive: { anchor: 'top-center', behavior: 'scale-text' }
        },
        {
          id: 'product-image',
          type: 'product',
          position: { x: 75, y: 90 },
          size: { width: 150, height: 120 },
          zIndex: 3,
          responsive: { anchor: 'center', behavior: 'maintain-aspect' }
        },
        {
          id: 'cta-button',
          type: 'button',
          position: { x: 100, y: 220 },
          size: { width: 100, height: 25 },
          zIndex: 4,
          content: 'Shop Now',
          styles: {
            backgroundColor: '#007bff',
            color: '#ffffff',
            borderRadius: '5px',
            fontWeight: 'bold',
            fontSize: '12px'
          },
          responsive: { anchor: 'bottom-center', behavior: 'maintain-size' }
        }
      ]
    }
  },

  [TEMPLATE_CATEGORIES.SPLIT_LAYOUT]: {
    name: 'Split Layout',
    description: 'Split layout with text on left, image on right, CTA at bottom',
    icon: '🔀',
    
    '300x250': {
      backgroundPosition: 'center',
      elements: [
        {
          id: 'headline',
          type: 'text',
          position: { x: 15, y: 25 },
          size: { width: 140, height: 30 },
          zIndex: 2,
          content: 'Great Product',
          styles: {
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#333333',
            textAlign: 'left'
          },
          responsive: { anchor: 'top-left', behavior: 'scale-text' }
        },
        {
          id: 'subheadline',
          type: 'text',
          position: { x: 15, y: 60 },
          size: { width: 140, height: 60 },
          zIndex: 2,
          content: 'Amazing features and benefits for you',
          styles: {
            fontSize: '12px',
            fontWeight: '400',
            color: '#666666',
            textAlign: 'left'
          },
          responsive: { anchor: 'top-left', behavior: 'scale-text' }
        },
        {
          id: 'product-image',
          type: 'product',
          position: { x: 170, y: 35 },
          size: { width: 110, height: 90 },
          zIndex: 3,
          responsive: { anchor: 'top-right', behavior: 'maintain-aspect' }
        },
        {
          id: 'cta-button',
          type: 'button',
          position: { x: 100, y: 210 },
          size: { width: 100, height: 30 },
          zIndex: 4,
          content: 'Learn More',
          styles: {
            backgroundColor: '#28a745',
            color: '#ffffff',
            borderRadius: '5px',
            fontWeight: 'bold',
            fontSize: '12px'
          },
          responsive: { anchor: 'bottom-center', behavior: 'maintain-size' }
        }
      ]
    }
  }
};

// Helper function to get template by category and format
export const getTemplate = (category, format) => {
  const template = AD_TEMPLATES[category];
  if (!template || !template[format]) {
    return null;
  }
  
  return {
    ...template[format],
    meta: {
      category,
      format,
      name: template.name,
      description: template.description,
      icon: template.icon
    }
  };
};

// Get all available templates for a specific format
export const getTemplatesForFormat = (format) => {
  const templates = [];
  
  Object.entries(AD_TEMPLATES).forEach(([category, templateData]) => {
    if (templateData[format]) {
      templates.push({
        category,
        format,
        name: templateData.name,
        description: templateData.description,
        icon: templateData.icon,
        layout: templateData[format]
      });
    }
  });
  
  return templates;
};

// Get all formats available for a template category
export const getFormatsForTemplate = (category) => {
  const template = AD_TEMPLATES[category];
  if (!template) return [];
  
  return Object.keys(template).filter(key => key.match(/^\d+x\d+$/));
};

// Apply template to canvas state
export const applyTemplate = (canvasState, category, format, adData = null) => {
  const template = getTemplate(category, format);
  if (!template) return canvasState;
  
  return {
    ...canvasState,
    meta: {
      ...canvasState.meta,
      template: category,
      backgroundPosition: template.backgroundPosition,
      backgroundImage: null // Clear any existing background image when applying template
    },
    elements: template.elements.map((element, index) => {
      // Ensure we have a valid element object
      if (!element || typeof element !== 'object') {
        console.error('Invalid element in template:', element);
        return null;
      }
      
      // Create a completely fresh object to avoid reference issues
      const newElement = {
        id: String(element.id || `element-${index}`) + `-${Date.now()}`,
        type: String(element.type || 'text'),
        position: JSON.parse(JSON.stringify(element.position || { x: 0, y: 0 })),
        size: JSON.parse(JSON.stringify(element.size || { width: 100, height: 50 })),
        zIndex: Number(element.zIndex || index + 1),
        content: String(element.content || ''),
        styles: JSON.parse(JSON.stringify(element.styles || {})),
        responsive: JSON.parse(JSON.stringify(element.responsive || {})),
        interactive: true,
        locked: false
      };
      
      // Special handling for product elements - set the product image
      if (newElement.type === 'product' && adData) {
        newElement.content = adData.url || adData.imageUrl || '';
        newElement.src = adData.url || adData.imageUrl || '';
      }
      
      // Validate the created element
      if (typeof newElement.id !== 'string' || typeof newElement.type !== 'string') {
        console.error('Element validation failed:', newElement);
        return null;
      }
      
      return newElement;
    }).filter(Boolean) // Remove any null elements
  
  };
};

// Smart template recommendation based on content
export const recommendTemplate = (adData, audienceType) => {
  // Analyze content to recommend best template
  const hasProductImage = adData?.imageUrl || adData?.url;
  const hasPromotion = adData?.title?.toLowerCase().includes('sale') || 
                      adData?.title?.toLowerCase().includes('off') ||
                      adData?.description?.toLowerCase().includes('discount');
  
  if (hasPromotion) {
    return TEMPLATE_CATEGORIES.PROMOTIONAL;
  } else if (hasProductImage) {
    return TEMPLATE_CATEGORIES.PRODUCT_FOCUSED;
  } else if (audienceType === 'lifestyle') {
    return TEMPLATE_CATEGORIES.LIFESTYLE;
  } else {
    return TEMPLATE_CATEGORIES.BRAND_AWARENESS;
  }
};

export default {
  AD_TEMPLATES,
  TEMPLATE_CATEGORIES,
  getTemplate,
  getTemplatesForFormat,
  getFormatsForTemplate,
  applyTemplate,
  recommendTemplate
};