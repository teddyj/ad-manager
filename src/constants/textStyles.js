/**
 * Text Style System for Phase 3: Interactive Text System
 * Provides predefined text styles and typography constants
 */

// Predefined text style presets
export const TEXT_STYLES = {
  HEADLINE_PRIMARY: {
    id: 'headline-primary',
    name: 'Primary Headline',
    fontFamily: 'Inter, sans-serif',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    lineHeight: 1.2,
    letterSpacing: '-0.5px',
    category: 'headline'
  },
  HEADLINE_SECONDARY: {
    id: 'headline-secondary',
    name: 'Secondary Headline',
    fontFamily: 'Inter, sans-serif', 
    fontSize: '18px',
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    lineHeight: 1.3,
    letterSpacing: '-0.25px',
    category: 'headline'
  },
  HEADLINE_LARGE: {
    id: 'headline-large',
    name: 'Large Headline',
    fontFamily: 'Inter, sans-serif',
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    lineHeight: 1.1,
    letterSpacing: '-1px',
    category: 'headline'
  },
  BODY_TEXT: {
    id: 'body-text',
    name: 'Body Text',
    fontFamily: 'Inter, sans-serif',
    fontSize: '14px',
    fontWeight: 'normal',
    color: '#666666',
    textAlign: 'left',
    lineHeight: 1.4,
    letterSpacing: '0px',
    category: 'body'
  },
  BODY_LARGE: {
    id: 'body-large',
    name: 'Large Body Text',
    fontFamily: 'Inter, sans-serif',
    fontSize: '16px',
    fontWeight: 'normal',
    color: '#555555',
    textAlign: 'left',
    lineHeight: 1.5,
    letterSpacing: '0px',
    category: 'body'
  },
  CAPTION: {
    id: 'caption',
    name: 'Caption',
    fontFamily: 'Inter, sans-serif',
    fontSize: '12px',
    fontWeight: 'normal',
    color: '#888888',
    textAlign: 'left',
    lineHeight: 1.3,
    letterSpacing: '0.25px',
    category: 'body'
  },
  CTA_BUTTON: {
    id: 'cta-button',
    name: 'CTA Button',
    fontFamily: 'Inter, sans-serif',
    fontSize: '16px', 
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 1.2,
    letterSpacing: '0.5px',
    category: 'button'
  },
  CTA_LINK: {
    id: 'cta-link',
    name: 'CTA Link',
    fontFamily: 'Inter, sans-serif',
    fontSize: '14px',
    fontWeight: '600',
    color: '#007bff',
    textAlign: 'center',
    lineHeight: 1.3,
    letterSpacing: '0px',
    textDecoration: 'underline',
    category: 'button'
  }
};

// Available font families (web-safe + Google Fonts)
export const FONT_FAMILIES = {
  // Web-safe fonts
  SYSTEM: {
    name: 'System',
    value: 'system-ui, -apple-system, sans-serif',
    category: 'system',
    fallback: true
  },
  INTER: {
    name: 'Inter',
    value: 'Inter, sans-serif',
    category: 'sans-serif',
    googleFont: true,
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900]
  },
  ARIAL: {
    name: 'Arial',
    value: 'Arial, sans-serif',
    category: 'sans-serif',
    fallback: true
  },
  HELVETICA: {
    name: 'Helvetica',
    value: 'Helvetica, Arial, sans-serif',
    category: 'sans-serif',
    fallback: true
  },
  
  // Google Fonts - Sans Serif
  ROBOTO: {
    name: 'Roboto',
    value: 'Roboto, sans-serif',
    category: 'sans-serif',
    googleFont: true,
    weights: [100, 300, 400, 500, 700, 900]
  },
  OPEN_SANS: {
    name: 'Open Sans',
    value: 'Open Sans, sans-serif',
    category: 'sans-serif',
    googleFont: true,
    weights: [300, 400, 500, 600, 700, 800]
  },
  MONTSERRAT: {
    name: 'Montserrat',
    value: 'Montserrat, sans-serif',
    category: 'sans-serif',
    googleFont: true,
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900]
  },
  POPPINS: {
    name: 'Poppins',
    value: 'Poppins, sans-serif',
    category: 'sans-serif',
    googleFont: true,
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900]
  },
  
  // Google Fonts - Serif
  PLAYFAIR: {
    name: 'Playfair Display',
    value: 'Playfair Display, serif',
    category: 'serif',
    googleFont: true,
    weights: [400, 500, 600, 700, 800, 900]
  },
  MERRIWEATHER: {
    name: 'Merriweather',
    value: 'Merriweather, serif',
    category: 'serif',
    googleFont: true,
    weights: [300, 400, 700, 900]
  },
  
  // Google Fonts - Display
  OSWALD: {
    name: 'Oswald',
    value: 'Oswald, sans-serif',
    category: 'display',
    googleFont: true,
    weights: [200, 300, 400, 500, 600, 700]
  },
  BEBAS_NEUE: {
    name: 'Bebas Neue',
    value: 'Bebas Neue, sans-serif',
    category: 'display',
    googleFont: true,
    weights: [400]
  }
};

// Font weight options
export const FONT_WEIGHTS = [
  { label: 'Thin', value: '100' },
  { label: 'Extra Light', value: '200' },
  { label: 'Light', value: '300' },
  { label: 'Normal', value: '400' },
  { label: 'Medium', value: '500' },
  { label: 'Semi Bold', value: '600' },
  { label: 'Bold', value: '700' },
  { label: 'Extra Bold', value: '800' },
  { label: 'Black', value: '900' }
];

// Text alignment options
export const TEXT_ALIGNMENTS = [
  { label: 'Left', value: 'left', icon: '⬅️' },
  { label: 'Center', value: 'center', icon: '↔️' },
  { label: 'Right', value: 'right', icon: '➡️' },
  { label: 'Justify', value: 'justify', icon: '⚌' }
];

// Text effects presets
export const TEXT_EFFECTS = {
  NONE: {
    id: 'none',
    name: 'None',
    styles: {}
  },
  DROP_SHADOW: {
    id: 'drop-shadow',
    name: 'Drop Shadow',
    styles: {
      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
    }
  },
  SUBTLE_SHADOW: {
    id: 'subtle-shadow',
    name: 'Subtle Shadow',
    styles: {
      textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)'
    }
  },
  STRONG_SHADOW: {
    id: 'strong-shadow',
    name: 'Strong Shadow',
    styles: {
      textShadow: '3px 3px 6px rgba(0, 0, 0, 0.5)'
    }
  },
  OUTLINE: {
    id: 'outline',
    name: 'Outline',
    styles: {
      textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
    }
  },
  GLOW: {
    id: 'glow',
    name: 'Glow',
    styles: {
      textShadow: '0 0 10px currentColor'
    }
  }
};

// Brand color presets
export const BRAND_COLORS = [
  { name: 'Primary', value: '#007bff' },
  { name: 'Secondary', value: '#6c757d' },
  { name: 'Success', value: '#28a745' },
  { name: 'Warning', value: '#ffc107' },
  { name: 'Danger', value: '#dc3545' },
  { name: 'Dark', value: '#343a40' },
  { name: 'Light', value: '#f8f9fa' },
  { name: 'White', value: '#ffffff' },
  { name: 'Black', value: '#000000' }
];

// Typography utility functions
export const getTextStylesByCategory = (category) => {
  return Object.values(TEXT_STYLES).filter(style => style.category === category);
};

export const getFontsByCategory = (category) => {
  return Object.values(FONT_FAMILIES).filter(font => font.category === category);
};

export const getGoogleFonts = () => {
  return Object.values(FONT_FAMILIES).filter(font => font.googleFont);
};

export const generateGoogleFontsUrl = (fonts = []) => {
  if (fonts.length === 0) return '';
  
  const fontParams = fonts.map(font => {
    const weights = font.weights ? font.weights.join(';') : '400';
    return `${font.name.replace(' ', '+')}:wght@${weights}`;
  }).join('&family=');
  
  return `https://fonts.googleapis.com/css2?family=${fontParams}&display=swap`;
};

// Default text element creation
export const createDefaultTextElement = (type = 'BODY_TEXT') => {
  const style = TEXT_STYLES[type];
  return {
    type: 'text',
    content: style.name,
    styles: { ...style },
    editable: true,
    multiline: type === 'BODY_TEXT' || type === 'BODY_LARGE'
  };
}; 