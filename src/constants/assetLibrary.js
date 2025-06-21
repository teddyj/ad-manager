/**
 * Asset Library System for Phase 4: Asset Management System
 * Provides asset categories, stock images, and management utilities
 */

// Asset Categories
export const ASSET_CATEGORIES = {
  PRODUCT_IMAGES: {
    id: 'product-images',
    name: 'Product Images',
    icon: '📦',
    description: 'User-uploaded product photos',
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: 10 * 1024 * 1024 // 10MB
  },
  BRAND_ASSETS: {
    id: 'brand-assets',
    name: 'Brand Assets',
    icon: '🏷️',
    description: 'Logos, icons, brand elements',
    allowedTypes: ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'],
    maxSize: 5 * 1024 * 1024 // 5MB
  },
  STOCK_IMAGES: {
    id: 'stock-images',
    name: 'Stock Images',
    icon: '🖼️',
    description: 'Curated library of lifestyle/background images',
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: 15 * 1024 * 1024 // 15MB
  },
  DECORATIVE_ELEMENTS: {
    id: 'decorative-elements',
    name: 'Decorative Elements',
    icon: '✨',
    description: 'Shapes, icons, design elements',
    allowedTypes: ['image/svg+xml', 'image/png'],
    maxSize: 2 * 1024 * 1024 // 2MB
  }
};

// Sample Stock Images Library
export const STOCK_IMAGES = {
  LIFESTYLE: [
    {
      id: 'lifestyle-1',
      name: 'Modern Kitchen',
      url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300',
      category: 'lifestyle',
      tags: ['kitchen', 'modern', 'interior', 'cooking'],
      colors: ['#f5f5f5', '#8b4513', '#000000'],
      dimensions: { width: 800, height: 600 },
      license: 'Unsplash'
    },
    {
      id: 'lifestyle-2',
      name: 'Coffee Shop',
      url: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=300',
      category: 'lifestyle',
      tags: ['coffee', 'shop', 'interior', 'cozy'],
      colors: ['#8b4513', '#f5deb3', '#2f4f4f'],
      dimensions: { width: 800, height: 600 },
      license: 'Unsplash'
    },
    {
      id: 'lifestyle-3',
      name: 'Home Office',
      url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300',
      category: 'lifestyle',
      tags: ['office', 'workspace', 'desk', 'productivity'],
      colors: ['#ffffff', '#f0f0f0', '#2c3e50'],
      dimensions: { width: 800, height: 600 },
      license: 'Unsplash'
    }
  ],
  NATURE: [
    {
      id: 'nature-1',
      name: 'Green Forest',
      url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300',
      category: 'nature',
      tags: ['forest', 'green', 'trees', 'natural'],
      colors: ['#228b22', '#006400', '#2e8b57'],
      dimensions: { width: 800, height: 600 },
      license: 'Unsplash'
    },
    {
      id: 'nature-2',
      name: 'Ocean Waves',
      url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=300',
      category: 'nature',
      tags: ['ocean', 'waves', 'blue', 'water'],
      colors: ['#4682b4', '#0077be', '#87ceeb'],
      dimensions: { width: 800, height: 600 },
      license: 'Unsplash'
    },
    {
      id: 'nature-3',
      name: 'Mountain Sunset',
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300',
      category: 'nature',
      tags: ['mountain', 'sunset', 'landscape', 'golden'],
      colors: ['#ff6347', '#ffa500', '#4169e1'],
      dimensions: { width: 800, height: 600 },
      license: 'Unsplash'
    }
  ],
  BUSINESS: [
    {
      id: 'business-1',
      name: 'Team Meeting',
      url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300',
      category: 'business',
      tags: ['meeting', 'team', 'corporate', 'professional'],
      colors: ['#2c3e50', '#34495e', '#ecf0f1'],
      dimensions: { width: 800, height: 600 },
      license: 'Unsplash'
    },
    {
      id: 'business-2',
      name: 'Modern Office',
      url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=300',
      category: 'business',
      tags: ['office', 'modern', 'workspace', 'clean'],
      colors: ['#ffffff', '#f8f9fa', '#343a40'],
      dimensions: { width: 800, height: 600 },
      license: 'Unsplash'
    }
  ],
  FOOD: [
    {
      id: 'food-1',
      name: 'Fresh Vegetables',
      url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300',
      category: 'food',
      tags: ['vegetables', 'fresh', 'healthy', 'colorful'],
      colors: ['#228b22', '#ff6347', '#ffa500'],
      dimensions: { width: 800, height: 600 },
      license: 'Unsplash'
    },
    {
      id: 'food-2',
      name: 'Gourmet Meal',
      url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300',
      category: 'food',
      tags: ['gourmet', 'restaurant', 'fine dining', 'elegant'],
      colors: ['#8b4513', '#f5deb3', '#000000'],
      dimensions: { width: 800, height: 600 },
      license: 'Unsplash'
    }
  ]
};

// Decorative Elements Library
export const DECORATIVE_ELEMENTS = {
  SHAPES: [
    {
      id: 'shape-circle',
      name: 'Circle',
      type: 'shape',
      svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="40" fill="currentColor"/>
      </svg>`,
      tags: ['circle', 'round', 'basic', 'shape'],
      customizable: true
    },
    {
      id: 'shape-square',
      name: 'Square',
      type: 'shape',
      svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="10" width="80" height="80" fill="currentColor"/>
      </svg>`,
      tags: ['square', 'rectangle', 'basic', 'shape'],
      customizable: true
    },
    {
      id: 'shape-triangle',
      name: 'Triangle',
      type: 'shape',
      svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="50,10 10,90 90,90" fill="currentColor"/>
      </svg>`,
      tags: ['triangle', 'geometric', 'shape'],
      customizable: true
    },
    {
      id: 'shape-star',
      name: 'Star',
      type: 'shape',
      svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" fill="currentColor"/>
      </svg>`,
      tags: ['star', 'rating', 'favorite', 'decoration'],
      customizable: true
    }
  ],
  ICONS: [
    {
      id: 'icon-arrow-right',
      name: 'Arrow Right',
      type: 'icon',
      svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,
      tags: ['arrow', 'direction', 'right', 'navigation'],
      customizable: true
    },
    {
      id: 'icon-heart',
      name: 'Heart',
      type: 'icon',
      svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="currentColor"/>
      </svg>`,
      tags: ['heart', 'love', 'favorite', 'like'],
      customizable: true
    },
    {
      id: 'icon-shopping-cart',
      name: 'Shopping Cart',
      type: 'icon',
      svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z" fill="currentColor"/>
        <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z" fill="currentColor"/>
        <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,
      tags: ['shopping', 'cart', 'ecommerce', 'buy'],
      customizable: true
    },
    {
      id: 'icon-check',
      name: 'Check Mark',
      type: 'icon',
      svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,
      tags: ['check', 'success', 'done', 'verified'],
      customizable: true
    }
  ],
  BADGES: [
    {
      id: 'badge-new',
      name: 'New Badge',
      type: 'badge',
      svg: `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="100" height="40" rx="20" fill="#ff4757"/>
        <text x="50" y="25" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14" font-weight="bold">NEW</text>
      </svg>`,
      tags: ['new', 'badge', 'label', 'promotion'],
      customizable: true
    },
    {
      id: 'badge-sale',
      name: 'Sale Badge',
      type: 'badge',
      svg: `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="100" height="40" rx="20" fill="#ff6b6b"/>
        <text x="50" y="25" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="12" font-weight="bold">SALE</text>
      </svg>`,
      tags: ['sale', 'discount', 'offer', 'promotion'],
      customizable: true
    },
    {
      id: 'badge-limited',
      name: 'Limited Time',
      type: 'badge',
      svg: `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="120" height="40" rx="20" fill="#ffa502"/>
        <text x="60" y="25" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="10" font-weight="bold">LIMITED</text>
      </svg>`,
      tags: ['limited', 'time', 'urgent', 'exclusive'],
      customizable: true
    }
  ]
};

// Asset Management Utilities
export const ASSET_FILTERS = {
  ALL: { id: 'all', name: 'All Assets', icon: '📁' },
  RECENT: { id: 'recent', name: 'Recently Used', icon: '🕒' },
  FAVORITES: { id: 'favorites', name: 'Favorites', icon: '⭐' },
  UPLOADED: { id: 'uploaded', name: 'My Uploads', icon: '📤' }
};

export const SORT_OPTIONS = [
  { value: 'name', label: 'Name A-Z' },
  { value: 'date', label: 'Date Added' },
  { value: 'usage', label: 'Most Used' },
  { value: 'size', label: 'File Size' }
];

// Utility functions
export const getAllStockImages = () => {
  return Object.values(STOCK_IMAGES).flat();
};

export const getStockImagesByCategory = (category) => {
  return STOCK_IMAGES[category.toUpperCase()] || [];
};

export const getAllDecorativeElements = () => {
  return Object.values(DECORATIVE_ELEMENTS).flat();
};

export const getDecorativeElementsByType = (type) => {
  return DECORATIVE_ELEMENTS[type.toUpperCase()] || [];
};

export const searchAssets = (assets, query) => {
  if (!query) return assets;
  
  const lowerQuery = query.toLowerCase();
  return assets.filter(asset => 
    asset.name.toLowerCase().includes(lowerQuery) ||
    asset.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

export const filterAssetsByColor = (assets, color) => {
  if (!color) return assets;
  
  return assets.filter(asset => 
    asset.colors && asset.colors.some(assetColor => 
      assetColor.toLowerCase().includes(color.toLowerCase())
    )
  );
};

export const validateFileType = (file, category) => {
  const categoryConfig = ASSET_CATEGORIES[category];
  if (!categoryConfig) return false;
  
  return categoryConfig.allowedTypes.includes(file.type);
};

export const validateFileSize = (file, category) => {
  const categoryConfig = ASSET_CATEGORIES[category];
  if (!categoryConfig) return false;
  
  return file.size <= categoryConfig.maxSize;
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const generateAssetId = (prefix = 'asset') => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Asset creation helper
export const createAssetElement = (asset, position = { x: 50, y: 50 }) => {
  const baseElement = {
    id: generateAssetId('element'),
    position,
    zIndex: 1,
    interactive: true,
    locked: false
  };

  // Handle different asset types
  if (asset.type === 'shape' || asset.type === 'icon' || asset.type === 'badge') {
    return {
      ...baseElement,
      type: 'decorative',
      content: asset.svg,
      size: { width: 60, height: 60 },
      styles: {
        color: '#007bff' // Default color that can be customized
      },
      assetData: asset
    };
  } else {
    // Image asset
    return {
      ...baseElement,
      type: 'image',
      content: asset.url || asset.thumbnail,
      size: { width: 120, height: 90 },
      styles: {
        borderRadius: '0px',
        opacity: 1
      },
      assetData: asset
    };
  }
}; 