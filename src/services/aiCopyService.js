import OpenAI from 'openai';

// Initialize OpenAI client
let openai = null;

const initializeOpenAI = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ OpenAI API key not found. AI copy generation will use fallback templates.');
    return null;
  }
  
  if (!openai) {
    openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true // Required for client-side usage
    });
  }
  
  return openai;
};

// Platform-specific character limits and tone guidelines
const PLATFORM_SPECS = {
  meta: {
    headline: { maxLength: 40, tone: 'engaging' },
    description: { maxLength: 125, tone: 'conversational' }
  },
  google: {
    headline: { maxLength: 30, tone: 'direct' },
    description: { maxLength: 90, tone: 'informative' }
  },
  tiktok: {
    headline: { maxLength: 50, tone: 'trendy' },
    description: { maxLength: 100, tone: 'fun' }
  },
  pinterest: {
    headline: { maxLength: 100, tone: 'inspirational' },
    description: { maxLength: 500, tone: 'descriptive' }
  },
  default: {
    headline: { maxLength: 40, tone: 'engaging' },
    description: { maxLength: 125, tone: 'conversational' }
  }
};

// Cache for generated copy to avoid redundant API calls
const copyCache = new Map();

// Generate cache key for content
const generateCacheKey = (type, productData, audienceData, platformData, settings) => {
  const key = JSON.stringify({
    type,
    product: {
      name: productData?.name,
      brand: productData?.brand,
      category: productData?.category,
      price: productData?.price
    },
    audience: {
      demographics: audienceData?.demographics,
      interests: audienceData?.interests?.slice(0, 3) // Limit for cache efficiency
    },
    platform: platformData?.platform,
    objective: platformData?.campaignObjective,
    settings: {
      creativity: settings?.creativity,
      tone: settings?.tone
    }
  });
  return btoa(key); // Base64 encode for clean cache keys
};

// Build context-aware prompt for OpenAI
const buildPrompt = (type, productData, audienceData, platformData, settings) => {
  const specs = PLATFORM_SPECS[platformData?.platform] || PLATFORM_SPECS.default;
  const limit = specs[type]?.maxLength || 40;
  const tone = settings?.tone || specs[type]?.tone || 'engaging';
  
  const productName = productData?.name || 'Our Product';
  const brand = productData?.brand || '';
  const category = productData?.category || 'product';
  const price = productData?.price;
  
  const audienceAge = audienceData?.demographics?.age?.[0];
  const audienceInterests = audienceData?.interests?.slice(0, 3) || [];
  const audienceLocation = audienceData?.demographics?.location;
  
  const platform = platformData?.platform || 'social media';
  const objective = platformData?.campaignObjective || 'awareness';
  
  const brandedName = brand ? `${brand} ${productName}` : productName;
  
  let basePrompt = '';
  
  if (type === 'headline') {
    basePrompt = `Generate 3 compelling ${tone} headlines for ${platform} ads promoting "${brandedName}".`;
  } else if (type === 'description') {
    basePrompt = `Generate 3 persuasive ${tone} descriptions for ${platform} ads promoting "${brandedName}".`;
  }
  
  basePrompt += `\n\nContext:`;
  basePrompt += `\n- Product: ${productName}`;
  if (brand) basePrompt += `\n- Brand: ${brand}`;
  basePrompt += `\n- Category: ${category}`;
  if (price) basePrompt += `\n- Price: $${price}`;
  
  if (audienceAge) basePrompt += `\n- Target Age: ${audienceAge}+`;
  if (audienceInterests.length > 0) basePrompt += `\n- Interests: ${audienceInterests.join(', ')}`;
  if (audienceLocation) basePrompt += `\n- Location: ${audienceLocation}`;
  
  basePrompt += `\n- Platform: ${platform}`;
  basePrompt += `\n- Campaign Goal: ${objective}`;
  
  basePrompt += `\n\nRequirements:`;
  basePrompt += `\n- Each ${type} must be under ${limit} characters`;
  basePrompt += `\n- Tone: ${tone}`;
  basePrompt += `\n- Focus on product benefits and value`;
  basePrompt += `\n- Avoid generic marketing language`;
  basePrompt += `\n- Make them unique and engaging`;
  
  if (settings?.creativity === 'high') {
    basePrompt += `\n- Be creative and bold with language`;
  } else if (settings?.creativity === 'low') {
    basePrompt += `\n- Keep language straightforward and clear`;
  }
  
  if (settings?.keywords && settings.keywords.trim()) {
    const keywords = settings.keywords.split(',').map(k => k.trim()).filter(k => k);
    if (keywords.length > 0) {
      basePrompt += `\n- Incorporate these keywords naturally: ${keywords.join(', ')}`;
    }
  }
  
  basePrompt += `\n\nReturn exactly 3 options, one per line, no numbering or bullets.`;
  
  return basePrompt;
};

// Generate AI-powered headlines
export const generateAIHeadlines = async (productData, audienceData, platformData, settings = {}) => {
  try {
    // Check cache first
    const cacheKey = generateCacheKey('headline', productData, audienceData, platformData, settings);
    if (copyCache.has(cacheKey)) {
      console.log('📋 Using cached headlines');
      return copyCache.get(cacheKey);
    }
    
    // Initialize OpenAI
    const client = initializeOpenAI();
    if (!client) {
      throw new Error('OpenAI not available');
    }
    
    // Build prompt
    const prompt = buildPrompt('headline', productData, audienceData, platformData, settings);
    
    console.log('🤖 Generating AI headlines...');
    console.log('📝 Prompt:', prompt.substring(0, 200) + '...');
    
    // Call OpenAI API
    const response = await client.chat.completions.create({
      model: settings?.model || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert copywriter specializing in digital advertising. Create compelling, conversion-focused ad copy that resonates with target audiences.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 150,
      temperature: settings?.creativity === 'high' ? 0.9 : settings?.creativity === 'low' ? 0.3 : 0.7
    });
    
    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }
    
    // Parse response into array
    const headlines = content.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .slice(0, 3); // Ensure exactly 3 headlines
    
    // Validate headlines meet character limits
    const specs = PLATFORM_SPECS[platformData?.platform] || PLATFORM_SPECS.default;
    const maxLength = specs.headline?.maxLength || 40;
    
    const validHeadlines = headlines.filter(h => h.length <= maxLength);
    
    if (validHeadlines.length === 0) {
      throw new Error('All generated headlines exceed character limit');
    }
    
    // Pad with fallback if needed
    while (validHeadlines.length < 3) {
      validHeadlines.push(`${productData?.name || 'Our Product'} - Special Offer`);
    }
    
    // Cache the result
    copyCache.set(cacheKey, validHeadlines);
    
    console.log('✅ Generated AI headlines:', validHeadlines);
    return validHeadlines;
    
  } catch (error) {
    console.warn('⚠️ AI headline generation failed:', error.message);
    console.log('🔄 Falling back to template headlines');
    
    // Fallback to template system
    return generateFallbackHeadlines(productData, audienceData, 0);
  }
};

// Generate AI-powered descriptions
export const generateAIDescriptions = async (productData, audienceData, platformData, settings = {}) => {
  try {
    // Check cache first
    const cacheKey = generateCacheKey('description', productData, audienceData, platformData, settings);
    if (copyCache.has(cacheKey)) {
      console.log('📋 Using cached descriptions');
      return copyCache.get(cacheKey);
    }
    
    // Initialize OpenAI
    const client = initializeOpenAI();
    if (!client) {
      throw new Error('OpenAI not available');
    }
    
    // Build prompt
    const prompt = buildPrompt('description', productData, audienceData, platformData, settings);
    
    console.log('🤖 Generating AI descriptions...');
    console.log('📝 Prompt:', prompt.substring(0, 200) + '...');
    
    // Call OpenAI API
    const response = await client.chat.completions.create({
      model: settings?.model || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert copywriter specializing in digital advertising. Create compelling, conversion-focused ad copy that resonates with target audiences.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: settings?.creativity === 'high' ? 0.9 : settings?.creativity === 'low' ? 0.3 : 0.7
    });
    
    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }
    
    // Parse response into array
    const descriptions = content.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .slice(0, 3); // Ensure exactly 3 descriptions
    
    // Validate descriptions meet character limits
    const specs = PLATFORM_SPECS[platformData?.platform] || PLATFORM_SPECS.default;
    const maxLength = specs.description?.maxLength || 125;
    
    const validDescriptions = descriptions.filter(d => d.length <= maxLength);
    
    if (validDescriptions.length === 0) {
      throw new Error('All generated descriptions exceed character limit');
    }
    
    // Pad with fallback if needed
    while (validDescriptions.length < 3) {
      validDescriptions.push(`Experience the best ${productData?.category || 'product'} solution available.`);
    }
    
    // Cache the result
    copyCache.set(cacheKey, validDescriptions);
    
    console.log('✅ Generated AI descriptions:', validDescriptions);
    return validDescriptions;
    
  } catch (error) {
    console.warn('⚠️ AI description generation failed:', error.message);
    console.log('🔄 Falling back to template descriptions');
    
    // Fallback to template system
    return generateFallbackDescriptions(productData, audienceData, 0);
  }
};

// Fallback headline generation using existing templates
const generateFallbackHeadlines = (productData, audienceData, variation) => {
  const productName = productData?.name || 'Our Product';
  const brand = productData?.brand || '';
  const brandedName = brand ? `${brand} ${productName}` : productName;
  const ageQualifier = audienceData?.demographics?.age?.[0] < 30 ? 'Trendy' : 'Quality';
  
  const templates = [
    [`Discover ${brandedName}`, `New ${productName} Available`, `${brandedName} - Limited Time`],
    [`Transform Your ${productName} Experience`, `Upgrade Your ${productName} Experience`, `Premium ${productName} Solution`],
    [`${ageQualifier} ${productName}`, `${brandedName} That Works`, `Why Choose ${brandedName}?`]
  ];
  
  return templates[variation] || templates[0];
};

// Fallback description generation using existing templates
const generateFallbackDescriptions = (productData, audienceData, variation) => {
  const productName = productData?.name || 'Our Product';
  const brand = productData?.brand || '';
  const brandedName = brand ? `${brand} ${productName}` : productName;
  const category = productData?.category || 'product';
  
  const templates = [
    [
      `Experience the difference with ${brandedName}. High quality, great value, reliable performance.`,
      `${productName} designed for modern life. Trusted by customers worldwide.`,
      `Join thousands who trust ${brandedName} for ${category}.`
    ],
    [
      `Professional-grade ${productName} with premium features and exceptional quality.`,
      `Industry-leading ${category} solution. Built for performance and reliability.`,
      `Trusted by professionals worldwide. Experience the ${brandedName} difference.`
    ],
    [
      `Perfect for customers like you. High quality and great value combined.`,
      `${productName} designed with your needs in mind. Trusted worldwide.`,
      `${productName} that understands and delivers on your expectations.`
    ]
  ];
  
  return templates[variation] || templates[0];
};

// Clear cache (useful for testing)
export const clearCopyCache = () => {
  copyCache.clear();
  console.log('🗑️ Copy cache cleared');
};

// Get cache size (for debugging)
export const getCacheSize = () => {
  return copyCache.size;
};

// Check if OpenAI is available
export const isOpenAIAvailable = () => {
  return !!import.meta.env.VITE_OPENAI_API_KEY;
}; 