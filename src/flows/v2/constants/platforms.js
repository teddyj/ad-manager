/**
 * Platform Definitions for Campaign Flow V2
 * Defines advertising platforms with their specifications, formats, and capabilities
 */

export const PLATFORMS = {
  META: {
    id: 'meta',
    name: 'Meta (Facebook & Instagram)',
    icon: '📘',
    description: 'Reach billions on Facebook and Instagram with advanced targeting',
    color: '#1877F2',
    
    // Supported ad formats
    formats: ['1080x1080', '1200x628', '1080x1920', '320x400'],
    
    // Platform capabilities
    audienceSync: true,
    minBudget: 5,
    dailyBudgetMin: 1,
    currency: 'USD',
    
    // Creative specifications
    creativeSpecs: {
      maxTextRatio: 0.2, // 20% text overlay limit
      imageFormats: ['jpg', 'png', 'webp'],
      videoFormats: ['mp4', 'mov'],
      maxFileSize: '30MB',
      maxImageSize: '8MB',
      videoLengthMax: 240, // seconds
      videoLengthMin: 1,
      aspectRatios: {
        'square': '1:1',
        'landscape': '1.91:1', 
        'portrait': '4:5',
        'stories': '9:16'
      }
    },
    
    // Available placements
    placements: [
      { id: 'facebook_feed', name: 'Facebook Feed', formats: ['1200x628', '1080x1080'] },
      { id: 'instagram_feed', name: 'Instagram Feed', formats: ['1080x1080', '1200x628'] },
      { id: 'facebook_stories', name: 'Facebook Stories', formats: ['1080x1920'] },
      { id: 'instagram_stories', name: 'Instagram Stories', formats: ['1080x1920'] },
      { id: 'facebook_marketplace', name: 'Facebook Marketplace', formats: ['1200x628'] },
      { id: 'instagram_reels', name: 'Instagram Reels', formats: ['1080x1920'] }
    ],
    
    // Campaign objectives
    objectives: [
      { id: 'awareness', name: 'Brand Awareness' },
      { id: 'traffic', name: 'Traffic' },
      { id: 'engagement', name: 'Engagement' },
      { id: 'conversions', name: 'Conversions' },
      { id: 'catalog_sales', name: 'Catalog Sales' }
    ],
    
    // Targeting capabilities
    targeting: {
      demographics: ['age', 'gender', 'location'],
      interests: true,
      behaviors: true,
      customAudiences: true,
      lookalikAudiences: true
    }
  },

  DISPLAY: {
    id: 'display',
    name: 'Display Network',
    icon: '🖼️',
    description: 'Google Display Network and programmatic advertising',
    color: '#4285F4',
    
    formats: ['300x250', '728x90', '320x50', '160x600', '970x250', '336x280'],
    
    audienceSync: false,
    minBudget: 10,
    dailyBudgetMin: 2,
    currency: 'USD',
    
    creativeSpecs: {
      maxFileSize: '150KB', // Strict file size limits for display
      imageFormats: ['jpg', 'png', 'gif'],
      animationDuration: '30s',
      maxTextLength: 150,
      safeArea: 0.1, // 10% margin from edges
      aspectRatios: {
        'banner': '2.91:1',
        'rectangle': '1.2:1',
        'skyscraper': '0.25:1',
        'mobile_banner': '6.4:1'
      }
    },
    
    placements: [
      { id: 'google_display', name: 'Google Display Network', formats: ['300x250', '728x90', '160x600'] },
      { id: 'youtube', name: 'YouTube', formats: ['300x250', '728x90'] },
      { id: 'gmail', name: 'Gmail Promotions', formats: ['300x250'] },
      { id: 'discover', name: 'Google Discover', formats: ['300x250'] }
    ],
    
    objectives: [
      { id: 'awareness', name: 'Brand Awareness' },
      { id: 'consideration', name: 'Consideration' },
      { id: 'conversions', name: 'Conversions' },
      { id: 'sales', name: 'Sales' }
    ],
    
    targeting: {
      demographics: ['age', 'gender', 'location', 'income'],
      interests: true,
      behaviors: false,
      keywords: true,
      topics: true,
      placements: true
    }
  },

  CTV: {
    id: 'ctv',
    name: 'Connected TV',
    icon: '📺',
    description: 'Streaming TV and over-the-top advertising',
    color: '#FF6B35',
    
    formats: ['1920x1080'], // Standard HD video
    
    audienceSync: true,
    minBudget: 100,
    dailyBudgetMin: 20,
    currency: 'USD',
    
    creativeSpecs: {
      videoLength: [15, 30, 60], // Standard TV ad lengths
      aspectRatio: '16:9',
      videoFormats: ['mp4'],
      resolution: '1920x1080',
      fps: 30,
      maxFileSize: '1GB',
      audioRequired: true,
      closedCaptions: false // Optional but recommended
    },
    
    placements: [
      { id: 'roku', name: 'Roku', formats: ['1920x1080'] },
      { id: 'samsung_tv', name: 'Samsung TV Plus', formats: ['1920x1080'] },
      { id: 'hulu', name: 'Hulu', formats: ['1920x1080'] },
      { id: 'youtube_tv', name: 'YouTube TV', formats: ['1920x1080'] },
      { id: 'pluto_tv', name: 'Pluto TV', formats: ['1920x1080'] }
    ],
    
    objectives: [
      { id: 'awareness', name: 'Brand Awareness' },
      { id: 'reach', name: 'Reach' },
      { id: 'video_views', name: 'Video Views' }
    ],
    
    targeting: {
      demographics: ['age', 'gender', 'location', 'income'],
      interests: true,
      behaviors: true,
      dayparting: true, // Time-based targeting
      deviceType: true,
      contentGenres: true
    }
  },

  TIKTOK: {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🎵',
    description: 'Short-form video advertising on TikTok',
    color: '#000000',
    
    formats: ['1080x1920', '1080x1080'], // Vertical and square video
    
    audienceSync: true,
    minBudget: 20,
    dailyBudgetMin: 5,
    currency: 'USD',
    
    creativeSpecs: {
      videoLength: [9, 15, 30, 60], // TikTok-specific lengths
      aspectRatio: '9:16', // Primarily vertical
      videoFormats: ['mp4', 'mov'],
      maxFileSize: '500MB',
      fps: [23.976, 24, 25, 29.97, 30],
      audioRequired: true,
      captionsRecommended: true,
      verticalOptimized: true
    },
    
    placements: [
      { id: 'in_feed', name: 'In-Feed Video', formats: ['1080x1920'] },
      { id: 'top_view', name: 'TopView', formats: ['1080x1920'] },
      { id: 'brand_takeover', name: 'Brand Takeover', formats: ['1080x1920'] },
      { id: 'spark_ads', name: 'Spark Ads', formats: ['1080x1920'] }
    ],
    
    objectives: [
      { id: 'awareness', name: 'Brand Awareness' },
      { id: 'traffic', name: 'Traffic' },
      { id: 'video_views', name: 'Video Views' },
      { id: 'conversions', name: 'Conversions' },
      { id: 'app_promotion', name: 'App Promotion' }
    ],
    
    targeting: {
      demographics: ['age', 'gender', 'location'],
      interests: true,
      behaviors: true,
      customAudiences: true,
      lookalikAudiences: true,
      deviceType: true,
      operatingSystem: true
    }
  }
};

// Helper function to get platform by ID
export const getPlatform = (platformId) => {
  const platform = Object.values(PLATFORMS).find(p => p.id === platformId);
  return platform || null;
};

// Get all platform IDs
export const getPlatformIds = () => {
  return Object.values(PLATFORMS).map(p => p.id);
};

// Get platforms that support a specific format
export const getPlatformsByFormat = (format) => {
  return Object.values(PLATFORMS).filter(platform => 
    platform.formats.includes(format)
  );
};

// Get all available formats across platforms
export const getAllFormats = () => {
  const allFormats = new Set();
  Object.values(PLATFORMS).forEach(platform => {
    platform.formats.forEach(format => allFormats.add(format));
  });
  return Array.from(allFormats);
};

// Check if platform supports audience sync
export const supportsAudienceSync = (platformId) => {
  const platform = getPlatform(platformId);
  return platform?.audienceSync || false;
};

// Get platform color for UI theming
export const getPlatformColor = (platformId) => {
  const platform = getPlatform(platformId);
  return platform?.color || '#666666';
};

// Validate creative specs for platform
export const validateCreativeSpecs = (platformId, creative) => {
  const platform = getPlatform(platformId);
  if (!platform) return { valid: false, errors: ['Invalid platform'] };
  
  const errors = [];
  const specs = platform.creativeSpecs;
  
  // Check file size
  if (creative.fileSize && specs.maxFileSize) {
    const maxSizeBytes = parseFileSize(specs.maxFileSize);
    if (creative.fileSize > maxSizeBytes) {
      errors.push(`File size exceeds ${specs.maxFileSize} limit`);
    }
  }
  
  // Check format support
  if (creative.format && !platform.formats.includes(creative.format)) {
    errors.push(`Format ${creative.format} not supported on ${platform.name}`);
  }
  
  // Check video length for video platforms
  if (creative.videoLength && specs.videoLength) {
    const validLengths = Array.isArray(specs.videoLength) ? specs.videoLength : [specs.videoLength];
    if (!validLengths.includes(creative.videoLength)) {
      errors.push(`Video length must be one of: ${validLengths.join(', ')} seconds`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Helper to parse file size strings like "150KB", "30MB"
const parseFileSize = (sizeString) => {
  const units = { 'KB': 1024, 'MB': 1024 * 1024, 'GB': 1024 * 1024 * 1024 };
  const match = sizeString.match(/^(\d+(?:\.\d+)?)\s*(KB|MB|GB)$/i);
  if (!match) return 0;
  
  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  return value * (units[unit] || 1);
};

// Export default for convenience
export default PLATFORMS; 