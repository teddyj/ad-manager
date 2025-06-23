// Background prompt suggestions organized by category
export const BACKGROUND_PROMPTS = [
  // Lifestyle & Context
  {
    category: "Lifestyle",
    prompts: [
      { prompt: "modern kitchen counter with natural lighting", description: "Kitchen Setting", icon: "🏠" },
      { prompt: "cozy living room with warm lighting", description: "Home Environment", icon: "🛋️" },
      { prompt: "outdoor picnic table in a park", description: "Outdoor Dining", icon: "🌳" },
      { prompt: "dining table with family setting", description: "Family Meal", icon: "👨‍👩‍👧‍👦" },
      { prompt: "breakfast nook with morning sunlight", description: "Morning Scene", icon: "☀️" },
      { prompt: "coffee shop counter with warm ambiance", description: "Café Setting", icon: "☕" }
    ]
  },
  
  // Retail & Commercial
  {
    category: "Retail",
    prompts: [
      { prompt: "clean grocery store shelf background", description: "Store Display", icon: "🏪" },
      { prompt: "premium marble countertop with soft shadows", description: "Luxury Display", icon: "✨" },
      { prompt: "wooden farmhouse table with rustic charm", description: "Artisanal Look", icon: "🌾" },
      { prompt: "modern retail display with spotlighting", description: "Retail Spotlight", icon: "💡" },
      { prompt: "organic market stall with fresh produce", description: "Fresh Market", icon: "🥬" },
      { prompt: "upscale boutique setting with elegant styling", description: "Premium Retail", icon: "💎" }
    ]
  },
  
  // Seasonal & Thematic
  {
    category: "Seasonal",
    prompts: [
      { prompt: "autumn leaves and warm orange tones", description: "Fall Theme", icon: "🍂" },
      { prompt: "fresh spring garden with green plants", description: "Spring Fresh", icon: "🌱" },
      { prompt: "winter holiday scene with snow", description: "Holiday Theme", icon: "❄️" },
      { prompt: "summer beach picnic setting", description: "Summer Vibes", icon: "🏖️" },
      { prompt: "cozy fireplace with winter warmth", description: "Winter Cozy", icon: "🔥" },
      { prompt: "blooming flowers and pastel colors", description: "Spring Bloom", icon: "🌸" }
    ]
  },
  
  // Professional & Clean
  {
    category: "Professional",
    prompts: [
      { prompt: "pure white studio background", description: "Clean Studio", icon: "⚪" },
      { prompt: "soft gradient from white to light gray", description: "Minimalist", icon: "🎨" },
      { prompt: "wooden cutting board with herbs", description: "Culinary Focus", icon: "🌿" },
      { prompt: "neutral beige background with soft lighting", description: "Neutral Tone", icon: "🤎" },
      { prompt: "black background with dramatic lighting", description: "Dramatic", icon: "⚫" },
      { prompt: "textured paper background", description: "Textured Clean", icon: "📄" }
    ]
  },

  // Health & Wellness
  {
    category: "Health",
    prompts: [
      { prompt: "yoga studio with natural light", description: "Wellness Space", icon: "🧘" },
      { prompt: "gym setting with fitness equipment", description: "Fitness Focus", icon: "💪" },
      { prompt: "spa environment with zen elements", description: "Spa Calm", icon: "🛁" },
      { prompt: "outdoor workout in nature", description: "Active Lifestyle", icon: "🏃" },
      { prompt: "healthy ingredients spread on counter", description: "Nutrition Focus", icon: "🥗" }
    ]
  }
];

// Default settings for background changes - absolutely minimal
export const BACKGROUND_CHANGE_DEFAULTS = {
};

// Processing status constants
export const BACKGROUND_STATUS = {
  IDLE: 'idle',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  ERROR: 'error'
}; 

// Enhanced background environment categories for Phase 2
export const BACKGROUND_ENVIRONMENTS = {
  LIFESTYLE: [
    { 
      id: 'modern-kitchen', 
      name: 'Modern Kitchen', 
      prompt: 'modern kitchen with clean lines, granite countertops, stainless steel appliances, natural lighting, minimalist design',
      description: 'Clean, contemporary kitchen setting perfect for food and kitchen products',
      category: 'lifestyle'
    },
    { 
      id: 'outdoor-patio', 
      name: 'Outdoor Patio', 
      prompt: 'beautiful outdoor patio with wooden deck, comfortable seating, plants, warm natural lighting, relaxing atmosphere',
      description: 'Inviting outdoor space ideal for lifestyle and recreational products',
      category: 'lifestyle'
    },
    { 
      id: 'home-office', 
      name: 'Home Office', 
      prompt: 'modern home office with desk, computer, books, plants, natural light from window, organized and inspiring workspace',
      description: 'Professional home office environment for tech and productivity products',
      category: 'lifestyle'
    },
    { 
      id: 'cozy-living-room', 
      name: 'Cozy Living Room', 
      prompt: 'warm and cozy living room with comfortable sofa, soft lighting, throw pillows, coffee table, family-friendly atmosphere',
      description: 'Comfortable living space perfect for home and family products',
      category: 'lifestyle'
    },
    { 
      id: 'bedroom-sanctuary', 
      name: 'Bedroom Sanctuary', 
      prompt: 'peaceful bedroom with soft bedding, natural light, plants, minimalist decor, calming and serene atmosphere',
      description: 'Tranquil bedroom setting ideal for wellness and comfort products',
      category: 'lifestyle'
    }
  ],
  COMMERCIAL: [
    { 
      id: 'retail-store', 
      name: 'Retail Store', 
      prompt: 'modern retail store interior with clean shelving, bright lighting, organized product displays, professional atmosphere',
      description: 'Professional retail environment for commercial product presentations',
      category: 'commercial'
    },
    { 
      id: 'restaurant', 
      name: 'Restaurant', 
      prompt: 'elegant restaurant interior with dining tables, ambient lighting, professional kitchen visible, food service atmosphere',
      description: 'Restaurant setting perfect for food, beverage, and hospitality products',
      category: 'commercial'
    },
    { 
      id: 'gym-fitness', 
      name: 'Gym & Fitness', 
      prompt: 'modern fitness center with exercise equipment, mirrors, energetic lighting, motivational atmosphere',
      description: 'Dynamic fitness environment for health and wellness products',
      category: 'commercial'
    },
    { 
      id: 'coffee-shop', 
      name: 'Coffee Shop', 
      prompt: 'cozy coffee shop with wooden tables, warm lighting, coffee bar, relaxed social atmosphere',
      description: 'Casual cafe environment perfect for food, beverage, and lifestyle products',
      category: 'commercial'
    },
    { 
      id: 'workshop-studio', 
      name: 'Workshop Studio', 
      prompt: 'creative workshop space with tools, workbench, natural lighting, organized craft supplies, maker atmosphere',
      description: 'Creative workspace ideal for tools, crafts, and DIY products',
      category: 'commercial'
    }
  ],
  ABSTRACT: [
    { 
      id: 'gradient-brand', 
      name: 'Brand Gradient', 
      prompt: 'smooth gradient background with modern colors, clean and professional, subtle texture, brand-ready design',
      description: 'Clean gradient background perfect for any brand or product',
      category: 'abstract'
    },
    { 
      id: 'geometric', 
      name: 'Geometric Pattern', 
      prompt: 'modern geometric pattern background with clean lines, subtle shadows, contemporary design, professional look',
      description: 'Contemporary geometric design for modern brand aesthetics',
      category: 'abstract'
    },
    { 
      id: 'texture-paper', 
      name: 'Paper Texture', 
      prompt: 'subtle paper texture background with natural fibers, warm tone, organic feel, elegant and sophisticated',
      description: 'Natural texture background for organic and artisanal products',
      category: 'abstract'
    },
    { 
      id: 'marble-luxury', 
      name: 'Marble Luxury', 
      prompt: 'elegant marble background with natural veining, luxurious appearance, high-end feel, sophisticated lighting',
      description: 'Luxurious marble texture for premium and high-end products',
      category: 'abstract'
    },
    { 
      id: 'wood-natural', 
      name: 'Wood Natural', 
      prompt: 'natural wood background with visible grain, warm tones, organic texture, crafted appearance',
      description: 'Natural wood texture perfect for organic and handcrafted products',
      category: 'abstract'
    }
  ],
  SEASONAL: [
    { 
      id: 'spring-garden', 
      name: 'Spring Garden', 
      prompt: 'beautiful spring garden with blooming flowers, fresh green leaves, natural sunlight, renewal and growth atmosphere',
      description: 'Fresh spring setting ideal for seasonal and outdoor products',
      category: 'seasonal'
    },
    { 
      id: 'summer-beach', 
      name: 'Summer Beach', 
      prompt: 'sunny beach scene with sand, ocean waves, bright blue sky, vacation and relaxation atmosphere',
      description: 'Vibrant summer environment perfect for recreation and travel products',
      category: 'seasonal'
    },
    { 
      id: 'autumn-cozy', 
      name: 'Autumn Cozy', 
      prompt: 'warm autumn scene with fall leaves, cozy blankets, warm lighting, comfort and warmth atmosphere',
      description: 'Cozy autumn setting ideal for comfort and seasonal products',
      category: 'seasonal'
    },
    { 
      id: 'winter-holiday', 
      name: 'Winter Holiday', 
      prompt: 'festive winter scene with snow, warm lighting, holiday decorations, celebration atmosphere',
      description: 'Holiday winter environment perfect for gifts and seasonal products',
      category: 'seasonal'
    }
  ]
};

// Get all backgrounds as flat array for backwards compatibility
export const getAllBackgrounds = () => {
  const allBackgrounds = [];
  Object.values(BACKGROUND_ENVIRONMENTS).forEach(category => {
    allBackgrounds.push(...category);
  });
  return allBackgrounds;
};

// Get backgrounds by category
export const getBackgroundsByCategory = (category) => {
  return BACKGROUND_ENVIRONMENTS[category] || [];
};

// Get background categories for UI
export const getBackgroundCategories = () => {
  return Object.keys(BACKGROUND_ENVIRONMENTS).map(key => ({
    id: key,
    name: key.charAt(0).toUpperCase() + key.slice(1).toLowerCase(),
    count: BACKGROUND_ENVIRONMENTS[key].length
  }));
};

// Legacy background prompts for backwards compatibility
export const BACKGROUND_PROMPTS_LEGACY = [
  {
    id: 'kitchen',
    label: 'Modern Kitchen',
    prompt: 'modern kitchen with clean lines, granite countertops, stainless steel appliances, natural lighting',
    description: 'Perfect for food and kitchen products'
  },
  {
    id: 'outdoor',
    label: 'Outdoor Setting',
    prompt: 'beautiful outdoor setting with natural lighting, plants, and clean background',
    description: 'Great for lifestyle and outdoor products'
  },
  {
    id: 'studio',
    label: 'Clean Studio',
    prompt: 'clean studio background with professional lighting, minimal and modern',
    description: 'Professional look for any product'
  },
  {
    id: 'lifestyle',
    label: 'Lifestyle Scene',
    prompt: 'lifestyle scene with home interior, warm lighting, cozy atmosphere',
    description: 'Perfect for home and lifestyle products'
  }
]; 