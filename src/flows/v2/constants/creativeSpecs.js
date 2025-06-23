/**
 * Creative Specifications and Format Definitions
 * Defines creative formats, dimensions, and optimization rules for each platform
 */

// Standard ad format definitions
export const CREATIVE_FORMATS = {
  // Social Media Formats
  SQUARE: {
    id: 'square',
    name: 'Square (1:1)',
    dimensions: '1080x1080',
    aspectRatio: 1,
    width: 1080,
    height: 1080,
    platforms: ['meta', 'tiktok'],
    placements: ['instagram_feed', 'facebook_feed'],
    description: 'Perfect for Instagram and Facebook feed posts',
    icon: '⬜'
  },
  
  LANDSCAPE: {
    id: 'landscape',
    name: 'Landscape (16:9)',
    dimensions: '1200x628',
    aspectRatio: 1.91,
    width: 1200,
    height: 628,
    platforms: ['meta', 'display'],
    placements: ['facebook_feed', 'google_display'],
    description: 'Standard for Facebook posts and display advertising',
    icon: '📺'
  },
  
  PORTRAIT: {
    id: 'portrait',
    name: 'Portrait (4:5)',
    dimensions: '1080x1350',
    aspectRatio: 0.8,
    width: 1080,
    height: 1350,
    platforms: ['meta'],
    placements: ['instagram_feed', 'facebook_feed'],
    description: 'Optimized for mobile Instagram feed',
    icon: '📱'
  },
  
  STORIES: {
    id: 'stories',
    name: 'Stories (9:16)',
    dimensions: '1080x1920',
    aspectRatio: 0.5625,
    width: 1080,
    height: 1920,
    platforms: ['meta', 'tiktok'],
    placements: ['instagram_stories', 'facebook_stories', 'tiktok_feed'],
    description: 'Vertical format for stories and TikTok',
    icon: '📲'
  },
  
  // Display Formats
  MEDIUM_RECTANGLE: {
    id: 'medium_rectangle',
    name: 'Medium Rectangle',
    dimensions: '300x250',
    aspectRatio: 1.2,
    width: 300,
    height: 250,
    platforms: ['display'],
    placements: ['google_display', 'content_sites'],
    description: 'Most popular display ad format',
    icon: '▭'
  },
  
  LEADERBOARD: {
    id: 'leaderboard',
    name: 'Leaderboard',
    dimensions: '728x90',
    aspectRatio: 8.09,
    width: 728,
    height: 90,
    platforms: ['display'],
    placements: ['website_header', 'content_sites'],
    description: 'Top of page banner format',
    icon: '▬'
  },
  
  MOBILE_BANNER: {
    id: 'mobile_banner',
    name: 'Mobile Banner',
    dimensions: '320x50',
    aspectRatio: 6.4,
    width: 320,
    height: 50,
    platforms: ['display'],
    placements: ['mobile_sites', 'apps'],
    description: 'Mobile optimized banner',
    icon: '📱'
  },
  
  SKYSCRAPER: {
    id: 'skyscraper',
    name: 'Wide Skyscraper',
    dimensions: '160x600',
    aspectRatio: 0.27,
    width: 160,
    height: 600,
    platforms: ['display'],
    placements: ['website_sidebar'],
    description: 'Vertical sidebar placement',
    icon: '🏢'
  },
  
  // Connected TV Format
  CTV_HD: {
    id: 'ctv_hd',
    name: 'Connected TV HD',
    dimensions: '1920x1080',
    aspectRatio: 1.78,
    width: 1920,
    height: 1080,
    platforms: ['ctv'],
    placements: ['streaming_services', 'smart_tv'],
    description: 'HD video for connected TV',
    icon: '📺'
  }
};

// Platform-specific creative optimization rules
export const CREATIVE_OPTIMIZATION_RULES = {
  meta: {
    textOverlay: {
      maxPercentage: 20,
      recommendation: 'Keep text overlay under 20% for better reach',
      zones: {
        safe: [0, 10],    // 0-10% is safe
        warning: [10, 20], // 10-20% may have reduced reach
        danger: [20, 100]  // 20%+ will have significantly reduced reach
      }
    },
    
    colorPalette: {
      highContrast: true,
      recommendation: 'Use high contrast colors for better mobile visibility',
      preferredColors: ['#1877F2', '#42B883', '#E1306C', '#000000', '#FFFFFF']
    },
    
    callToAction: {
      placement: 'bottom_third',
      maxLength: 25,
      recommended: ['Shop Now', 'Learn More', 'Sign Up', 'Download', 'Get Offer'],
      style: {
        fontSize: 'large',
        fontWeight: 'bold',
        backgroundColor: '#1877F2',
        textColor: '#FFFFFF'
      }
    },
    
    productPlacement: {
      centerFocus: true,
      productRatio: 0.6, // Product should take up 60% of the creative
      backgroundStyle: 'minimal',
      shadowEffect: true
    },
    
    animation: {
      maxDuration: 15, // seconds
      recommended: 'subtle_motion',
      effects: ['fade_in', 'slide_up', 'pulse', 'zoom_in']
    }
  },
  
  display: {
    fileSize: {
      maxSize: '150KB',
      recommendation: 'Keep file size under 150KB for faster loading',
      compression: 'high'
    },
    
    safeArea: {
      margin: 10, // 10% margin from edges
      recommendation: 'Keep important elements 10% from edges'
    },
    
    textOptimization: {
      maxCharacters: 150,
      fontSize: 'medium',
      readabilityScore: 'high',
      fontFamily: 'web_safe'
    },
    
    colorScheme: {
      webSafe: true,
      highContrast: true,
      accessibilityCompliant: true
    },
    
    animation: {
      maxDuration: 30,
      looping: true,
      effects: ['fade', 'slide', 'rotate']
    }
  },
  
  tiktok: {
    verticalOptimization: {
      aspectRatio: '9:16',
      mobileFirst: true,
      thumbStopMoments: 3 // Key moments to grab attention
    },
    
    contentStyle: {
      authentic: true,
      userGenerated: 'preferred',
      trending: true,
      music: 'recommended'
    },
    
    textOverlay: {
      timing: 'auto_captions',
      style: 'casual',
      placement: 'center_bottom',
      animation: 'typewriter'
    },
    
    transitions: {
      quick: true,
      energetic: true,
      effects: ['jump_cut', 'zoom_transition', 'slide_transition']
    },
    
    hookStrategy: {
      firstThreeSeconds: 'critical',
      valueProposition: 'immediate',
      engagement: 'high_energy'
    }
  },
  
  ctv: {
    videoQuality: {
      resolution: '1080p',
      frameRate: 30,
      bitrate: 'high',
      audioQuality: 'cd_quality'
    },
    
    brandingStrategy: {
      logoPlacement: 'bottom_right',
      brandMention: 'first_5_seconds',
      consistency: 'tv_standards'
    },
    
    contentPacing: {
      slower: true,
      clearMessaging: true,
      familyFriendly: true,
      soundOn: true // Always assume sound is on
    },
    
    callToAction: {
      timing: 'last_5_seconds',
      voiceover: 'recommended',
      textSize: 'large',
      actionOriented: true
    }
  }
};

// Creative composition templates
export const COMPOSITION_TEMPLATES = {
  PRODUCT_HERO: {
    id: 'product_hero',
    name: 'Product Hero',
    description: 'Large product image with minimal background',
    elements: {
      product: { size: 0.7, position: 'center', zIndex: 2 },
      background: { size: 1.0, position: 'background', zIndex: 1 },
      text: { size: 0.2, position: 'bottom', zIndex: 3 },
      logo: { size: 0.1, position: 'top_right', zIndex: 3 }
    },
    platforms: ['meta', 'display', 'tiktok']
  },
  
  LIFESTYLE_SCENE: {
    id: 'lifestyle_scene',
    name: 'Lifestyle Scene',
    description: 'Product in natural usage environment',
    elements: {
      scene: { size: 1.0, position: 'background', zIndex: 1 },
      product: { size: 0.4, position: 'center_right', zIndex: 2 },
      person: { size: 0.6, position: 'left', zIndex: 2 },
      text: { size: 0.15, position: 'top_left', zIndex: 3 }
    },
    platforms: ['meta', 'ctv', 'tiktok']
  },
  
  SPLIT_SCREEN: {
    id: 'split_screen',
    name: 'Split Screen',
    description: 'Before/after or comparison layout',
    elements: {
      leftPanel: { size: 0.5, position: 'left', zIndex: 2 },
      rightPanel: { size: 0.5, position: 'right', zIndex: 2 },
      divider: { size: 0.02, position: 'center', zIndex: 3 },
      text: { size: 0.2, position: 'bottom', zIndex: 3 }
    },
    platforms: ['meta', 'display']
  },
  
  MINIMAL_CLEAN: {
    id: 'minimal_clean',
    name: 'Minimal Clean',
    description: 'Clean, minimal design with lots of white space',
    elements: {
      product: { size: 0.5, position: 'center', zIndex: 2 },
      background: { size: 1.0, position: 'background', zIndex: 1, color: '#FFFFFF' },
      headline: { size: 0.15, position: 'top', zIndex: 3 },
      cta: { size: 0.1, position: 'bottom', zIndex: 3 }
    },
    platforms: ['meta', 'display']
  },
  
  STORY_VERTICAL: {
    id: 'story_vertical',
    name: 'Vertical Story',
    description: 'Full-screen vertical layout for stories',
    elements: {
      background: { size: 1.0, position: 'background', zIndex: 1 },
      product: { size: 0.8, position: 'center', zIndex: 2 },
      text: { size: 0.2, position: 'bottom_third', zIndex: 3 },
      profile: { size: 0.1, position: 'top_left', zIndex: 3 }
    },
    platforms: ['meta', 'tiktok']
  }
};

// Brand safety and content guidelines
export const CONTENT_GUIDELINES = {
  PROHIBITED_CONTENT: [
    'tobacco',
    'alcohol_excessive',
    'gambling',
    'adult_content',
    'violence',
    'hate_speech',
    'misleading_claims',
    'copyright_violation'
  ],
  
  SENSITIVE_CATEGORIES: [
    'health_claims',
    'financial_services',
    'weight_loss',
    'dating',
    'political_content',
    'religious_content'
  ],
  
  ACCESSIBILITY_REQUIREMENTS: {
    colorContrast: 4.5, // WCAG AA standard
    textSize: 'readable',
    audioAlternatives: 'recommended',
    motionSensitivity: 'considerate'
  },
  
  PLATFORM_POLICIES: {
    meta: {
      textInImage: 'limited',
      beforeAfter: 'restricted',
      personalAttributes: 'prohibited',
      healthClaims: 'medical_disclaimer_required'
    },
    display: {
      interactiveElements: 'limited',
      autoPlay: 'user_initiated',
      dataCollection: 'privacy_compliant'
    },
    tiktok: {
      authenticity: 'required',
      communityGuidelines: 'strict',
      music: 'licensed_only',
      minorSafety: 'strict'
    },
    ctv: {
      familyFriendly: 'preferred',
      volumeLevels: 'broadcast_standards',
      contentRating: 'appropriate'
    }
  }
};

// Helper functions
export const getFormatById = (formatId) => {
  return Object.values(CREATIVE_FORMATS).find(format => format.id === formatId);
};

export const getFormatsByPlatform = (platformId) => {
  return Object.values(CREATIVE_FORMATS).filter(format => 
    format.platforms.includes(platformId)
  );
};

export const getOptimizationRules = (platformId) => {
  return CREATIVE_OPTIMIZATION_RULES[platformId] || {};
};

export const getCompositionTemplate = (templateId) => {
  return COMPOSITION_TEMPLATES[templateId];
};

export const getTemplatesByPlatform = (platformId) => {
  return Object.values(COMPOSITION_TEMPLATES).filter(template =>
    template.platforms.includes(platformId)
  );
};

export const validateCreativeContent = (content, platformId) => {
  const rules = getOptimizationRules(platformId);
  const guidelines = CONTENT_GUIDELINES;
  const warnings = [];
  const errors = [];
  
  // Check text overlay (Meta specific)
  if (platformId === 'meta' && content.textOverlayPercentage > rules.textOverlay?.maxPercentage) {
    warnings.push(`Text overlay ${content.textOverlayPercentage}% exceeds recommended ${rules.textOverlay.maxPercentage}%`);
  }
  
  // Check file size (Display specific)
  if (platformId === 'display' && content.fileSize > '150KB') {
    errors.push('File size exceeds 150KB limit for display advertising');
  }
  
  // Check aspect ratio
  const format = getFormatById(content.formatId);
  if (format && Math.abs(content.aspectRatio - format.aspectRatio) > 0.1) {
    warnings.push(`Aspect ratio ${content.aspectRatio} doesn't match format requirement ${format.aspectRatio}`);
  }
  
  // Check prohibited content
  const hasProhibitedContent = guidelines.PROHIBITED_CONTENT.some(prohibited =>
    content.tags?.includes(prohibited) || content.description?.toLowerCase().includes(prohibited)
  );
  
  if (hasProhibitedContent) {
    errors.push('Content contains prohibited elements');
  }
  
  return {
    valid: errors.length === 0,
    warnings,
    errors,
    recommendations: generateRecommendations(content, platformId)
  };
};

const generateRecommendations = (content, platformId) => {
  const rules = getOptimizationRules(platformId);
  const recommendations = [];
  
  if (platformId === 'meta') {
    recommendations.push('Use high contrast colors for mobile visibility');
    recommendations.push('Keep call-to-action in bottom third of creative');
    if (content.hasProduct) {
      recommendations.push('Center product with shadow effect for depth');
    }
  }
  
  if (platformId === 'tiktok') {
    recommendations.push('Create thumb-stopping moment in first 3 seconds');
    recommendations.push('Use authentic, user-generated style content');
    recommendations.push('Add trending music or sound effects');
  }
  
  if (platformId === 'display') {
    recommendations.push('Maintain 10% safe margin from edges');
    recommendations.push('Use web-safe fonts for compatibility');
    recommendations.push('Optimize file size for fast loading');
  }
  
  if (platformId === 'ctv') {
    recommendations.push('Design for 10-foot viewing distance');
    recommendations.push('Include brand mention in first 5 seconds');
    recommendations.push('Use clear, family-friendly messaging');
  }
  
  return recommendations;
};

export const getRecommendedDimensions = (platformId, placement) => {
  const formats = getFormatsByPlatform(platformId);
  
  if (placement) {
    return formats.filter(format => 
      format.placements?.includes(placement)
    );
  }
  
  return formats;
};

export default {
  CREATIVE_FORMATS,
  CREATIVE_OPTIMIZATION_RULES,
  COMPOSITION_TEMPLATES,
  CONTENT_GUIDELINES
}; 