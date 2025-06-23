/**
 * Audience Configuration Constants
 * Defines audience templates, targeting options, and platform-specific mappings
 */

// Pre-defined audience templates based on common customer segments
export const AUDIENCE_TEMPLATES = {
  // SPINS Custom Templates (shown first)
  SPINS_WORKING_PARENTS: {
    id: 'spins_working_parents',
    name: 'SPINS Custom: Working Parents',
    description: 'Busy parents juggling work and family responsibilities, seeking convenient solutions',
    icon: '👩‍💼',
    demographics: {
      age: [28, 45],
      gender: 'all',
      income: 'middle_upper',
      education: 'college_plus',
      parentalStatus: 'parents'
    },
    interests: [
      { name: 'Parenting', category: 'family', metaId: '6003020634693' },
      { name: 'Time Management', category: 'business', metaId: '6003506769441' },
      { name: 'Healthy Eating', category: 'food', metaId: '6003506769341' },
      { name: 'Family Activities', category: 'family', metaId: '6003344274498' },
      { name: 'Work-Life Balance', category: 'lifestyle', metaId: '6003195617498' }
    ],
    behaviors: ['working_parents', 'convenience_shoppers', 'family_product_buyers', 'time_savers'],
    estimatedSize: 9200000,
    platforms: ['meta', 'display', 'ctv']
  },

  SPINS_DINK: {
    id: 'spins_dink',
    name: 'SPINS Custom: DINK',
    description: 'Dual Income, No Kids - affluent couples with disposable income and lifestyle focus',
    icon: '💑',
    demographics: {
      age: [25, 40],
      gender: 'all',
      income: 'upper',
      education: 'college_plus',
      maritalStatus: 'married',
      parentalStatus: 'no_children'
    },
    interests: [
      { name: 'Travel', category: 'travel', metaId: '6003139266461' },
      { name: 'Fine Dining', category: 'food', metaId: '6003506769341' },
      { name: 'Luxury Goods', category: 'lifestyle', metaId: '6003195617498' },
      { name: 'Fitness', category: 'health', metaId: '6003139266461' },
      { name: 'Career Development', category: 'business', metaId: '6003344874498' }
    ],
    behaviors: ['premium_brand_affinity', 'frequent_travelers', 'luxury_shoppers', 'experience_seekers'],
    estimatedSize: 6800000,
    platforms: ['meta', 'display', 'ctv']
  },

  SPINS_AT_HOME_CHEF: {
    id: 'spins_at_home_chef',
    name: 'SPINS Custom: At Home Chef',
    description: 'Passionate home cooks focused on quality ingredients and culinary experiences',
    icon: '👨‍🍳',
    demographics: {
      age: [30, 55],
      gender: 'all',
      income: 'middle_upper',
      education: 'college_plus'
    },
    interests: [
      { name: 'Cooking', category: 'food', metaId: '6003107902433' },
      { name: 'Organic Food', category: 'food', metaId: '6003107902433' },
      { name: 'Gourmet Food', category: 'food', metaId: '6003506769341' },
      { name: 'Kitchen Equipment', category: 'home', metaId: '6003344317498' },
      { name: 'Food & Wine', category: 'food', metaId: '6003139266461' }
    ],
    behaviors: ['gourmet_food_buyers', 'recipe_seekers', 'kitchen_enthusiasts', 'quality_focused_buyers'],
    estimatedSize: 11500000,
    platforms: ['meta', 'display', 'tiktok']
  },

  HEALTH_CONSCIOUS: {
    id: 'health_conscious',
    name: 'Health Conscious Consumers',
    description: 'People interested in organic, natural, and healthy products',
    icon: '🥗',
    demographics: {
      age: [25, 54],
      gender: 'all',
      income: 'middle_upper',
      education: 'college_plus'
    },
    interests: [
      { name: 'Organic Food', category: 'food', metaId: '6003107902433' },
      { name: 'Fitness', category: 'health', metaId: '6003139266461' },
      { name: 'Wellness', category: 'health', metaId: '6003292107893' },
      { name: 'Nutrition', category: 'health', metaId: '6003344317498' },
      { name: 'Healthy Eating', category: 'food', metaId: '6003506769341' }
    ],
    behaviors: ['organic_food_buyers', 'health_magazine_readers', 'fitness_app_users'],
    estimatedSize: 15000000,
    platforms: ['meta', 'display', 'tiktok']
  },

  BUSY_PROFESSIONALS: {
    id: 'busy_professionals',
    name: 'Busy Professionals',
    description: 'Working professionals looking for convenience and efficiency',
    icon: '💼',
    demographics: {
      age: [28, 45],
      gender: 'all',
      income: 'upper',
      education: 'college_plus'
    },
    interests: [
      { name: 'Productivity', category: 'business', metaId: '6003020034693' },
      { name: 'Career Development', category: 'business', metaId: '6003344874498' },
      { name: 'Time Management', category: 'business', metaId: '6003506769441' },
      { name: 'Business', category: 'business', metaId: '6003195297498' },
      { name: 'Technology', category: 'technology', metaId: '6003195617498' }
    ],
    behaviors: ['frequent_travelers', 'online_shoppers', 'premium_brand_affinity'],
    estimatedSize: 8500000,
    platforms: ['meta', 'display', 'ctv']
  },

  FAMILY_ORIENTED: {
    id: 'family_oriented',
    name: 'Family-Oriented Parents',
    description: 'Parents and caregivers focused on family needs and children',
    icon: '👨‍👩‍👧‍👦',
    demographics: {
      age: [30, 50],
      gender: 'all',
      income: 'middle_upper',
      education: 'any'
    },
    interests: [
      { name: 'Parenting', category: 'family', metaId: '6003020634693' },
      { name: 'Family Activities', category: 'family', metaId: '6003344274498' },
      { name: 'Child Health', category: 'health', metaId: '6003506769241' },
      { name: 'Education', category: 'education', metaId: '6003195297398' },
      { name: 'Family Travel', category: 'travel', metaId: '6003195617398' }
    ],
    behaviors: ['family_product_buyers', 'bulk_shoppers', 'education_focused'],
    estimatedSize: 12000000,
    platforms: ['meta', 'display', 'ctv']
  },

  YOUNG_ADULTS: {
    id: 'young_adults',
    name: 'Young Adults & Gen Z',
    description: 'Digital natives aged 18-34 with modern lifestyle preferences',
    icon: '🎯',
    demographics: {
      age: [18, 34],
      gender: 'all',
      income: 'lower_middle',
      education: 'some_college_plus'
    },
    interests: [
      { name: 'Social Media', category: 'technology', metaId: '6003107902433' },
      { name: 'Music', category: 'entertainment', metaId: '6003139266461' },
      { name: 'Gaming', category: 'entertainment', metaId: '6003292107893' },
      { name: 'Fashion', category: 'fashion', metaId: '6003344317498' },
      { name: 'Sustainability', category: 'lifestyle', metaId: '6003506769341' }
    ],
    behaviors: ['social_media_heavy_users', 'mobile_first_shoppers', 'brand_conscious'],
    estimatedSize: 20000000,
    platforms: ['meta', 'tiktok']
  },

  SENIORS: {
    id: 'seniors',
    name: 'Active Seniors',
    description: 'Adults 55+ with active lifestyles and disposable income',
    icon: '🧓',
    demographics: {
      age: [55, 75],
      gender: 'all',
      income: 'upper',
      education: 'high_school_plus'
    },
    interests: [
      { name: 'Health & Wellness', category: 'health', metaId: '6003107902433' },
      { name: 'Travel', category: 'travel', metaId: '6003139266461' },
      { name: 'Gardening', category: 'hobbies', metaId: '6003292107893' },
      { name: 'Books', category: 'entertainment', metaId: '6003344317498' },
      { name: 'Grandchildren', category: 'family', metaId: '6003506769341' }
    ],
    behaviors: ['traditional_media_consumers', 'quality_focused_buyers', 'brand_loyal'],
    estimatedSize: 18000000,
    platforms: ['meta', 'display', 'ctv']
  }
};

// Interest categories for audience building
export const INTEREST_CATEGORIES = {
  FOOD_BEVERAGE: {
    name: 'Food & Beverage',
    interests: [
      { name: 'Organic Food', id: 'organic_food' },
      { name: 'Cooking', id: 'cooking' },
      { name: 'Wine', id: 'wine' },
      { name: 'Coffee', id: 'coffee' },
      { name: 'Healthy Eating', id: 'healthy_eating' },
      { name: 'Vegetarian', id: 'vegetarian' },
      { name: 'Vegan', id: 'vegan' }
    ]
  },
  HEALTH_FITNESS: {
    name: 'Health & Fitness',
    interests: [
      { name: 'Fitness', id: 'fitness' },
      { name: 'Yoga', id: 'yoga' },
      { name: 'Running', id: 'running' },
      { name: 'Weight Loss', id: 'weight_loss' },
      { name: 'Meditation', id: 'meditation' },
      { name: 'Wellness', id: 'wellness' }
    ]
  },
  LIFESTYLE: {
    name: 'Lifestyle',
    interests: [
      { name: 'Fashion', id: 'fashion' },
      { name: 'Beauty', id: 'beauty' },
      { name: 'Home Decor', id: 'home_decor' },
      { name: 'Sustainability', id: 'sustainability' },
      { name: 'Luxury Goods', id: 'luxury_goods' }
    ]
  },
  TECHNOLOGY: {
    name: 'Technology',
    interests: [
      { name: 'Smartphones', id: 'smartphones' },
      { name: 'Social Media', id: 'social_media' },
      { name: 'Gaming', id: 'gaming' },
      { name: 'Apps', id: 'apps' },
      { name: 'Innovation', id: 'innovation' }
    ]
  }
};

// Behavioral targeting options
export const BEHAVIORAL_OPTIONS = {
  PURCHASE_BEHAVIOR: [
    { name: 'Frequent Online Shoppers', id: 'frequent_online_shoppers' },
    { name: 'Premium Brand Affinity', id: 'premium_brand_affinity' },
    { name: 'Price-Conscious Shoppers', id: 'price_conscious_shoppers' },
    { name: 'Bulk Buyers', id: 'bulk_buyers' },
    { name: 'Impulse Buyers', id: 'impulse_buyers' }
  ],
  DIGITAL_ACTIVITY: [
    { name: 'Social Media Heavy Users', id: 'social_media_heavy_users' },
    { name: 'Video Streaming Users', id: 'video_streaming_users' },
    { name: 'Mobile App Users', id: 'mobile_app_users' },
    { name: 'Email Subscribers', id: 'email_subscribers' }
  ],
  LIFESTYLE: [
    { name: 'Health & Wellness Focused', id: 'health_wellness_focused' },
    { name: 'Environmentally Conscious', id: 'environmentally_conscious' },
    { name: 'Early Technology Adopters', id: 'early_tech_adopters' },
    { name: 'Travel Enthusiasts', id: 'travel_enthusiasts' }
  ]
};

// Geographic targeting options
export const GEOGRAPHIC_OPTIONS = {
  COUNTRIES: [
    { name: 'United States', code: 'US', id: 'US' },
    { name: 'Canada', code: 'CA', id: 'CA' },
    { name: 'United Kingdom', code: 'GB', id: 'GB' },
    { name: 'Australia', code: 'AU', id: 'AU' },
    { name: 'Germany', code: 'DE', id: 'DE' },
    { name: 'France', code: 'FR', id: 'FR' },
    { name: 'Japan', code: 'JP', id: 'JP' }
  ],
  US_REGIONS: [
    { name: 'Northeast', states: ['NY', 'NJ', 'PA', 'CT', 'MA', 'RI', 'NH', 'VT', 'ME'] },
    { name: 'Southeast', states: ['FL', 'GA', 'SC', 'NC', 'VA', 'WV', 'KY', 'TN', 'AL', 'MS', 'AR', 'LA'] },
    { name: 'Midwest', states: ['OH', 'IN', 'IL', 'MI', 'WI', 'MN', 'IA', 'MO', 'ND', 'SD', 'NE', 'KS'] },
    { name: 'Southwest', states: ['TX', 'OK', 'NM', 'AZ'] },
    { name: 'West', states: ['CA', 'NV', 'UT', 'CO', 'WY', 'MT', 'ID', 'WA', 'OR', 'AK', 'HI'] }
  ],
  MAJOR_CITIES: [
    { name: 'New York', state: 'NY', metro: 'new_york_metro' },
    { name: 'Los Angeles', state: 'CA', metro: 'los_angeles_metro' },
    { name: 'Chicago', state: 'IL', metro: 'chicago_metro' },
    { name: 'Houston', state: 'TX', metro: 'houston_metro' },
    { name: 'Phoenix', state: 'AZ', metro: 'phoenix_metro' },
    { name: 'Philadelphia', state: 'PA', metro: 'philadelphia_metro' },
    { name: 'San Antonio', state: 'TX', metro: 'san_antonio_metro' },
    { name: 'San Diego', state: 'CA', metro: 'san_diego_metro' },
    { name: 'Dallas', state: 'TX', metro: 'dallas_metro' },
    { name: 'San Jose', state: 'CA', metro: 'san_jose_metro' }
  ]
};

// Platform-specific audience mapping
export const PLATFORM_AUDIENCE_MAPPING = {
  meta: {
    ageMapping: (age) => ({ age_min: age[0], age_max: age[1] }),
    genderMapping: {
      'all': [1, 2],
      'male': [1],
      'female': [2]
    },
    interestMapping: (interests) => interests.map(i => ({ id: i.metaId || i.id, name: i.name })),
    locationMapping: (locations) => ({
      countries: locations.countries || [],
      regions: locations.regions || [],
      cities: locations.cities || []
    })
  },
  
  display: {
    ageMapping: (age) => `${age[0]}-${age[1]}`,
    genderMapping: {
      'all': 'all',
      'male': 'male',
      'female': 'female'
    },
    interestMapping: (interests) => interests.map(i => i.name),
    locationMapping: (locations) => locations.countries || []
  },
  
  tiktok: {
    ageMapping: (age) => ({ min_age: age[0], max_age: age[1] }),
    genderMapping: {
      'all': ['MALE', 'FEMALE'],
      'male': ['MALE'],
      'female': ['FEMALE']
    },
    interestMapping: (interests) => interests.map(i => ({ 
      interest_category: i.category, 
      interest_name: i.name 
    })),
    locationMapping: (locations) => ({
      location_type: 'COUNTRY',
      location_codes: locations.countries || []
    })
  },
  
  ctv: {
    ageMapping: (age) => ({ age_min: age[0], age_max: age[1] }),
    genderMapping: {
      'all': 'all',
      'male': 'male',
      'female': 'female'
    },
    interestMapping: (interests) => interests.map(i => i.name),
    locationMapping: (locations) => ({
      countries: locations.countries || [],
      dma_codes: locations.dmas || []
    })
  }
};

// Helper functions
export const getAudienceTemplate = (templateId) => {
  return AUDIENCE_TEMPLATES[templateId.toUpperCase()] || null;
};

export const getAllAudienceTemplates = () => {
  const templates = Object.values(AUDIENCE_TEMPLATES);
  
  // Sort to show SPINS Custom templates first
  return templates.sort((a, b) => {
    const aIsSpins = a.name.startsWith('SPINS Custom:');
    const bIsSpins = b.name.startsWith('SPINS Custom:');
    
    if (aIsSpins && !bIsSpins) return -1;
    if (!aIsSpins && bIsSpins) return 1;
    
    // Within SPINS Custom templates, maintain the order: Working Parents, DINK, At Home Chef
    if (aIsSpins && bIsSpins) {
      const spinsOrder = ['Working Parents', 'DINK', 'At Home Chef'];
      const aIndex = spinsOrder.findIndex(name => a.name.includes(name));
      const bIndex = spinsOrder.findIndex(name => b.name.includes(name));
      return aIndex - bIndex;
    }
    
    return 0; // Keep original order for non-SPINS templates
  });
};

export const getInterestsByCategory = (category) => {
  return INTEREST_CATEGORIES[category]?.interests || [];
};

export const getAllInterestCategories = () => {
  return Object.keys(INTEREST_CATEGORIES);
};

export const mapAudienceForPlatform = (audienceConfig, platformId) => {
  const mapping = PLATFORM_AUDIENCE_MAPPING[platformId];
  if (!mapping) return null;
  
  return {
    demographics: {
      age: mapping.ageMapping(audienceConfig.demographics.age),
      gender: mapping.genderMapping[audienceConfig.demographics.gender],
    },
    interests: mapping.interestMapping(audienceConfig.interests),
    locations: mapping.locationMapping(audienceConfig.locations),
    behaviors: audienceConfig.behaviors || []
  };
};

export const estimateAudienceSize = (audienceConfig) => {
  // Simplified estimation logic
  const baseSize = 50000000; // 50M base
  const ageRange = audienceConfig.demographics.age[1] - audienceConfig.demographics.age[0];
  const ageFactor = ageRange / 60; // Normalize to 0-1
  
  const genderFactor = audienceConfig.demographics.gender === 'all' ? 1 : 0.5;
  const interestFactor = Math.max(0.1, 1 - (audienceConfig.interests.length * 0.1));
  
  return Math.floor(baseSize * ageFactor * genderFactor * interestFactor);
};

export const validateAudienceConfig = (audienceConfig) => {
  const errors = [];
  
  if (!audienceConfig.name || audienceConfig.name.trim().length === 0) {
    errors.push('Audience name is required');
  }
  
  if (!audienceConfig.demographics?.age || audienceConfig.demographics.age.length !== 2) {
    errors.push('Valid age range is required');
  }
  
  if (audienceConfig.demographics?.age && audienceConfig.demographics.age[0] >= audienceConfig.demographics.age[1]) {
    errors.push('Age range minimum must be less than maximum');
  }
  
  if (!audienceConfig.locations?.countries || audienceConfig.locations.countries.length === 0) {
    errors.push('At least one country must be selected');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

export default {
  AUDIENCE_TEMPLATES,
  INTEREST_CATEGORIES,
  BEHAVIORAL_OPTIONS,
  GEOGRAPHIC_OPTIONS,
  PLATFORM_AUDIENCE_MAPPING
}; 