/**
 * Product Composition Service
 * Handles intelligent placement and composition of products within backgrounds
 * Part of Phase 2: Enhanced Background System
 */

export class ProductCompositionService {
  static isEnabled() {
    // Check if composition features are available
    return true; // For now, always enabled since this is client-side logic
  }

  /**
   * Analyze background and suggest optimal product placement
   * @param {string} backgroundUrl - URL of the background image
   * @param {Object} productDimensions - Product image dimensions
   * @param {Object} canvasDimensions - Canvas dimensions
   * @returns {Object} Suggested composition settings
   */
  static async analyzeComposition(backgroundUrl, productDimensions, canvasDimensions) {
    try {
      // For now, implement rule-based composition logic
      // In future, this could use AI/ML for more sophisticated analysis
      
      const suggestions = this.generateCompositionSuggestions(
        productDimensions, 
        canvasDimensions
      );
      
      return {
        success: true,
        suggestions,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Composition analysis error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate smart composition suggestions based on design principles
   */
  static generateCompositionSuggestions(productDimensions, canvasDimensions) {
    const { width: canvasWidth, height: canvasHeight } = canvasDimensions;
    const { width: productWidth, height: productHeight } = productDimensions;
    
    // Rule of thirds positioning
    const thirdWidth = canvasWidth / 3;
    const thirdHeight = canvasHeight / 3;
    
    return {
      // Primary suggestion: Right third, center vertical
      primary: {
        position: {
          x: thirdWidth * 2 - (productWidth / 2),
          y: (canvasHeight / 2) - (productHeight / 2)
        },
        scale: this.calculateOptimalScale(productDimensions, canvasDimensions),
        reasoning: "Right third placement allows space for text on the left"
      },
      
      // Alternative suggestions
      alternatives: [
        {
          name: "Center Focus",
          position: {
            x: (canvasWidth / 2) - (productWidth / 2),
            y: (canvasHeight / 2) - (productHeight / 2)
          },
          scale: this.calculateOptimalScale(productDimensions, canvasDimensions, 0.8),
          reasoning: "Center placement for maximum product focus"
        },
        {
          name: "Left Third", 
          position: {
            x: thirdWidth - (productWidth / 2),
            y: (canvasHeight / 2) - (productHeight / 2)
          },
          scale: this.calculateOptimalScale(productDimensions, canvasDimensions),
          reasoning: "Left placement with space for text on the right"
        },
        {
          name: "Bottom Right",
          position: {
            x: canvasWidth - productWidth - 40,
            y: canvasHeight - productHeight - 40
          },
          scale: this.calculateOptimalScale(productDimensions, canvasDimensions, 0.6),
          reasoning: "Smaller product placement leaving space for content above"
        }
      ]
    };
  }

  /**
   * Calculate optimal scale for product within canvas
   */
  static calculateOptimalScale(productDimensions, canvasDimensions, targetRatio = 0.4) {
    const { width: canvasWidth, height: canvasHeight } = canvasDimensions;
    const { width: productWidth, height: productHeight } = productDimensions;
    
    // Target product to take up specified ratio of canvas
    const targetProductWidth = canvasWidth * targetRatio;
    const targetProductHeight = canvasHeight * targetRatio;
    
    // Calculate scale maintaining aspect ratio
    const scaleX = targetProductWidth / productWidth;
    const scaleY = targetProductHeight / productHeight;
    
    // Use smaller scale to ensure product fits within target dimensions
    return Math.min(scaleX, scaleY, 1); // Don't scale up beyond original size
  }

  /**
   * Generate shadow and lighting effects based on background analysis
   */
  static generateLightingEffects(backgroundContext = 'neutral') {
    const effects = {
      shadow: {
        enabled: true,
        blur: 10,
        offset: { x: 0, y: 4 },
        color: 'rgba(0, 0, 0, 0.2)'
      },
      highlight: {
        enabled: false
      }
    };

    // Adjust effects based on background context
    switch (backgroundContext) {
      case 'kitchen':
      case 'indoor':
        effects.shadow.blur = 8;
        effects.shadow.color = 'rgba(0, 0, 0, 0.15)';
        break;
        
      case 'outdoor':
      case 'bright':
        effects.shadow.blur = 12;
        effects.shadow.offset = { x: 2, y: 6 };
        effects.shadow.color = 'rgba(0, 0, 0, 0.3)';
        effects.highlight.enabled = true;
        effects.highlight.color = 'rgba(255, 255, 255, 0.1)';
        break;
        
      case 'studio':
      case 'minimal':
        effects.shadow.blur = 6;
        effects.shadow.color = 'rgba(0, 0, 0, 0.1)';
        break;
        
      default:
        // Keep default settings
        break;
    }

    return effects;
  }

  /**
   * Apply composition suggestions to a canvas element
   */
  static applyComposition(element, suggestion, effects = null) {
    const updatedElement = {
      ...element,
      position: {
        x: Math.round(suggestion.position.x),
        y: Math.round(suggestion.position.y)
      },
      size: {
        width: Math.round(element.size.width * suggestion.scale),
        height: Math.round(element.size.height * suggestion.scale)
      }
    };

    // Apply lighting effects if provided
    if (effects) {
      updatedElement.styles = {
        ...updatedElement.styles,
        ...(effects.shadow.enabled && {
          boxShadow: `${effects.shadow.offset.x}px ${effects.shadow.offset.y}px ${effects.shadow.blur}px ${effects.shadow.color}`
        })
      };
    }

    return updatedElement;
  }

  /**
   * Get composition presets for quick application
   */
  static getCompositionPresets() {
    return {
      'hero-center': {
        name: 'Hero Center',
        description: 'Large centered product for maximum impact',
        position: { x: '50%', y: '50%' },
        scale: 0.6,
        anchor: 'center'
      },
      'rule-of-thirds-right': {
        name: 'Rule of Thirds (Right)',
        description: 'Product on right third with space for text',
        position: { x: '66%', y: '50%' },
        scale: 0.4,
        anchor: 'center'
      },
      'rule-of-thirds-left': {
        name: 'Rule of Thirds (Left)', 
        description: 'Product on left third with space for text',
        position: { x: '33%', y: '50%' },
        scale: 0.4,
        anchor: 'center'
      },
      'bottom-showcase': {
        name: 'Bottom Showcase',
        description: 'Product in lower portion with content above',
        position: { x: '50%', y: '75%' },
        scale: 0.35,
        anchor: 'center'
      },
      'corner-accent': {
        name: 'Corner Accent',
        description: 'Small product accent in corner',
        position: { x: '85%', y: '85%' },
        scale: 0.25,
        anchor: 'center'
      }
    };
  }

  /**
   * Detect background context for intelligent effect application
   */
  static detectBackgroundContext(backgroundPrompt) {
    const prompt = backgroundPrompt.toLowerCase();
    
    if (prompt.includes('kitchen') || prompt.includes('indoor') || prompt.includes('home')) {
      return 'indoor';
    } else if (prompt.includes('outdoor') || prompt.includes('patio') || prompt.includes('garden')) {
      return 'outdoor';
    } else if (prompt.includes('studio') || prompt.includes('minimal') || prompt.includes('clean')) {
      return 'studio';
    } else if (prompt.includes('bright') || prompt.includes('sunny') || prompt.includes('natural light')) {
      return 'bright';
    }
    
    return 'neutral';
  }

  /**
   * Calculate safe zones for text placement given product position
   */
  static calculateTextSafeZones(productElement, canvasDimensions) {
    const { position, size } = productElement;
    const { width: canvasWidth, height: canvasHeight } = canvasDimensions;
    
    const productLeft = position.x;
    const productRight = position.x + size.width;
    const productTop = position.y;
    const productBottom = position.y + size.height;
    
    const safeZones = [];
    
    // Left zone
    if (productLeft > 100) {
      safeZones.push({
        name: 'left',
        area: {
          x: 20,
          y: 20,
          width: productLeft - 40,
          height: canvasHeight - 40
        },
        recommended: 'headline-left'
      });
    }
    
    // Right zone
    if (canvasWidth - productRight > 100) {
      safeZones.push({
        name: 'right',
        area: {
          x: productRight + 20,
          y: 20,
          width: canvasWidth - productRight - 40,
          height: canvasHeight - 40
        },
        recommended: 'headline-right'
      });
    }
    
    // Top zone
    if (productTop > 80) {
      safeZones.push({
        name: 'top',
        area: {
          x: 20,
          y: 20,
          width: canvasWidth - 40,
          height: productTop - 40
        },
        recommended: 'headline-top'
      });
    }
    
    // Bottom zone
    if (canvasHeight - productBottom > 80) {
      safeZones.push({
        name: 'bottom',
        area: {
          x: 20,
          y: productBottom + 20,
          width: canvasWidth - 40,
          height: canvasHeight - productBottom - 40
        },
        recommended: 'description-bottom'
      });
    }
    
    return safeZones;
  }
} 