# AI-Powered Copy Generation Requirements

## Overview
Replace the current template-based headline and description generation system in the CreativeBuilder with OpenAI API-powered content generation. This will provide more dynamic, contextual, and persuasive ad copy tailored to specific products, audiences, and campaign objectives.

## Current State Analysis

### Existing System
- **Location**: `src/flows/v2/steps/CreativeBuilder.jsx`
- **Functions**: `generateHeadlines()`, `generateDescriptions()`, `generateCTAs()`
- **Method**: Static template-based generation with variable substitution
- **Limitations**:
  - Limited variety (3 templates per function)
  - No contextual understanding
  - No audience-specific messaging
  - No platform optimization
  - No brand voice adaptation

### Current Template Examples
```javascript
// Headlines
[`Discover ${brandedName}`, `New ${productName} Available`, `${brandedName} - Limited Time`]

// Descriptions  
[`Experience the best ${productName} with ${enhancedDescription} Perfect for your lifestyle.`]
```

## Requirements Specification

### 1. API Integration

#### 1.1 OpenAI Configuration
- **Model**: GPT-4 or GPT-3.5-turbo (configurable)
- **Environment Variables**:
  ```
  VITE_OPENAI_API_KEY=sk-...
  VITE_OPENAI_MODEL=gpt-4
  VITE_OPENAI_MAX_TOKENS=150
  VITE_AI_COPY_ENABLED=true
  ```
- **Fallback**: Maintain existing template system as fallback when AI is disabled/fails

#### 1.2 Service Architecture
- **Location**: `src/services/aiCopyService.js`
- **Error Handling**: Graceful degradation to template system
- **Rate Limiting**: Implement request throttling
- **Caching**: Cache responses by input hash to reduce API calls
- **Timeout**: 10-second timeout for API requests

### 2. Prompt Engineering

#### 2.1 Headline Generation Prompt
```
Generate 3 compelling advertising headlines for the following product:

Product Details:
- Name: {productName}
- Brand: {productBrand}
- Category: {productCategory}
- Description: {productDescription}
- Price: {productPrice}

Campaign Context:
- Objective: {campaignObjective}
- Platform: {targetPlatform}
- Format: {adFormat}

Audience Profile:
- Demographics: {audienceDemographics}
- Interests: {audienceInterests}
- Behaviors: {audienceBehaviors}

Requirements:
- Each headline must be under 40 characters for {adFormat} format
- Focus on {campaignObjective} messaging
- Use {audienceTone} tone (professional/casual/trendy/luxury)
- Include brand name when possible
- Emphasize unique value proposition
- Create urgency when appropriate for {campaignObjective}

Return exactly 3 headlines, one per line, no numbering or bullets.
```

#### 2.2 Description Generation Prompt
```
Generate 3 persuasive ad descriptions for the following product:

Product Details:
- Name: {productName}
- Brand: {productBrand}
- Category: {productCategory}
- Description: {productDescription}
- Key Features: {productFeatures}
- Price: {productPrice}

Campaign Context:
- Objective: {campaignObjective}
- Platform: {targetPlatform}
- Format: {adFormat}
- Character Limit: {characterLimit}

Audience Profile:
- Demographics: {audienceDemographics}
- Pain Points: {audiencePainPoints}
- Motivations: {audienceMotivations}

Requirements:
- Each description must be under {characterLimit} characters
- Focus on benefits over features
- Address audience pain points
- Include compelling call-to-action language
- Match {audienceTone} tone
- Emphasize social proof when relevant
- Create emotional connection

Return exactly 3 descriptions, one per line, no formatting.
```

### 3. Data Integration

#### 3.1 Input Data Sources
```javascript
// Product Data (from Product Selection step)
{
  name: string,
  brand: string,
  category: string,
  description: string,
  features: string[],
  price: number,
  images: string[],
  url: string
}

// Audience Data (from Audience Builder step)
{
  demographics: {
    age: string[],
    gender: string[],
    income: string[],
    location: string[]
  },
  interests: string[],
  behaviors: string[],
  painPoints: string[],
  motivations: string[]
}

// Campaign Data
{
  objective: string, // awareness|traffic|conversions|engagement|app_installs
  platforms: string[], // meta|google|tiktok|pinterest
  budget: number,
  duration: number
}

// Creative Context
{
  format: string, // square|landscape|portrait|stories
  platform: string,
  characterLimits: {
    headline: number,
    description: number
  }
}
```

#### 3.2 Platform-Specific Character Limits
```javascript
const PLATFORM_LIMITS = {
  meta: {
    headline: 40,
    description: 125,
    tone: 'conversational'
  },
  google: {
    headline: 30,
    description: 90,
    tone: 'professional'
  },
  tiktok: {
    headline: 50,
    description: 100,
    tone: 'trendy'
  },
  pinterest: {
    headline: 45,
    description: 110,
    tone: 'inspirational'
  }
}
```

### 4. Implementation Details

#### 4.1 Service Structure
```javascript
// src/services/aiCopyService.js
export class AICopyService {
  constructor(apiKey, model = 'gpt-3.5-turbo') {}
  
  async generateHeadlines(productData, audienceData, campaignData, formatData) {}
  async generateDescriptions(productData, audienceData, campaignData, formatData) {}
  
  // Utility methods
  buildHeadlinePrompt(data) {}
  buildDescriptionPrompt(data) {}
  callOpenAI(prompt, maxTokens) {}
  parseResponse(response) {}
  
  // Caching
  getCacheKey(data) {}
  getCachedResponse(key) {}
  setCachedResponse(key, response) {}
}
```

#### 4.2 Integration Points

**Replace in CreativeBuilder.jsx:**
```javascript
// OLD: Template-based generation
const generateHeadlines = (productData, audienceData, variation) => {
  // Template logic...
}

// NEW: AI-powered generation
const generateHeadlines = async (productData, audienceData, campaignData, formatData) => {
  try {
    if (aiCopyEnabled) {
      return await aiCopyService.generateHeadlines(productData, audienceData, campaignData, formatData);
    }
  } catch (error) {
    console.warn('AI copy generation failed, falling back to templates:', error);
  }
  
  // Fallback to existing template system
  return generateHeadlinesTemplate(productData, audienceData, variation);
}
```

### 5. User Experience

#### 5.1 Loading States
- Show "Generating AI copy..." spinner during API calls
- Display estimated time remaining (typically 3-5 seconds)
- Allow cancellation of generation process

#### 5.2 User Controls
```javascript
// AI Settings in Creative Builder
{
  aiCopyEnabled: boolean,
  creativityLevel: 'conservative' | 'balanced' | 'creative',
  brandVoice: 'professional' | 'friendly' | 'luxury' | 'edgy',
  includeEmojis: boolean,
  emphasizeBenefits: boolean,
  includeCallToAction: boolean
}
```

#### 5.3 Copy Management
- **Regenerate Button**: Allow users to generate new variations
- **Edit Capability**: Users can manually edit AI-generated copy
- **Favorites**: Save preferred headlines/descriptions for reuse
- **A/B Testing**: Generate multiple variations for testing

### 6. Quality Assurance

#### 6.1 Content Validation
- Check character limits for each platform
- Validate no inappropriate content
- Ensure brand name inclusion when required
- Verify call-to-action presence in descriptions

#### 6.2 Fallback Scenarios
1. **API Failure**: Use template system
2. **Rate Limiting**: Queue requests and show wait time
3. **Invalid Response**: Retry with simplified prompt
4. **Character Limit Exceeded**: Truncate intelligently or regenerate

#### 6.3 Content Guidelines
- Brand safety checks
- Compliance with advertising policies
- Avoid superlatives without proof
- Include disclaimers when required

### 7. Performance Considerations

#### 7.1 Optimization Strategies
- **Batch Requests**: Generate headlines and descriptions together
- **Caching**: Cache by product + audience + objective combination
- **Preloading**: Generate copy when user navigates to Creative Builder
- **Progressive Loading**: Show template copy first, replace with AI copy when ready

#### 7.2 Monitoring
- Track API response times
- Monitor success/failure rates
- Measure user satisfaction with AI vs template copy
- Cost tracking per campaign

### 8. Testing Strategy

#### 8.1 Unit Tests
- Mock OpenAI API responses
- Test fallback scenarios
- Validate prompt generation
- Test character limit enforcement

#### 8.2 Integration Tests
- End-to-end creative generation flow
- Cross-platform copy generation
- Error handling scenarios

#### 8.3 User Testing
- A/B test AI vs template copy performance
- Gather feedback on copy quality
- Test with different product categories
- Validate across different audience segments

### 9. Security & Privacy

#### 9.1 Data Handling
- Never send sensitive user data to OpenAI
- Anonymize product data when possible
- Implement request sanitization
- Log only non-sensitive metadata

#### 9.2 API Security
- Secure API key storage
- Environment-based configuration
- Rate limiting to prevent abuse
- Monitor for unusual usage patterns

### 10. Configuration & Rollout

#### 10.1 Feature Flags
```javascript
// src/config/features.js
export const FEATURES = {
  AI_COPY_GENERATION: {
    enabled: process.env.VITE_AI_COPY_ENABLED === 'true',
    model: process.env.VITE_OPENAI_MODEL || 'gpt-3.5-turbo',
    maxTokens: parseInt(process.env.VITE_OPENAI_MAX_TOKENS) || 150,
    cacheDuration: 24 * 60 * 60 * 1000, // 24 hours
    fallbackToTemplates: true
  }
}
```

#### 10.2 Rollout Plan
1. **Phase 1**: Internal testing with limited product categories
2. **Phase 2**: Beta release to select users
3. **Phase 3**: Gradual rollout with A/B testing
4. **Phase 4**: Full deployment with monitoring

### 11. Success Metrics

#### 11.1 Performance Metrics
- API response time < 5 seconds (95th percentile)
- Success rate > 95%
- User satisfaction score > 4.0/5.0
- Character limit compliance > 99%

#### 11.2 Business Metrics
- Increased creative generation completion rate
- Improved ad performance metrics (CTR, conversion rate)
- Reduced time spent on manual copy editing
- Higher user engagement with Creative Builder

### 12. Future Enhancements

#### 12.1 Advanced Features
- Brand voice training with custom examples
- Industry-specific copy templates
- Multilingual copy generation
- Integration with brand style guides
- Competitive analysis integration

#### 12.2 Machine Learning
- Learn from user edits to improve prompts
- Track which AI-generated copy performs best
- Personalization based on user preferences
- Predictive copy performance scoring

## Implementation Timeline

- **Week 1-2**: Service setup and basic API integration
- **Week 3**: Prompt engineering and testing
- **Week 4**: CreativeBuilder integration and UI updates
- **Week 5**: Testing and refinement
- **Week 6**: Beta deployment and monitoring
- **Week 7-8**: Full rollout and optimization

## Dependencies

- OpenAI API access and billing setup
- Environment variable configuration
- Caching infrastructure (Redis/LocalStorage)
- Error monitoring service (Sentry)
- A/B testing framework 