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

// Default settings for background changes
export const BACKGROUND_CHANGE_DEFAULTS = {
  guidance_scale: 3.5,
  num_inference_steps: 30,
  safety_tolerance: "2",
  output_format: "jpeg",
  aspect_ratio: "1:1"
};

// Processing status constants
export const BACKGROUND_STATUS = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  ERROR: 'error'
}; 