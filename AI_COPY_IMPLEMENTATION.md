# AI Copy Generation Implementation

## Overview

This implementation adds AI-powered headline and description generation to the Campaign Builder's CreativeBuilder component using OpenAI's GPT models.

## Features Implemented

### 🤖 AI Copy Service (`src/services/aiCopyService.js`)

- **OpenAI Integration**: Uses OpenAI's chat completion API for dynamic copy generation
- **Platform Optimization**: Adjusts tone and character limits based on target platform (Meta, Google, TikTok, Pinterest)
- **Context-Aware Prompts**: Incorporates product data, audience demographics, and campaign objectives
- **Intelligent Fallback**: Gracefully falls back to template-based generation when AI is unavailable
- **Caching System**: Reduces API calls by caching generated content with intelligent cache keys
- **Error Handling**: Robust error handling with detailed logging

### 🎛️ AI Copy Settings Component (`src/components/AICopySettings.jsx`)

- **Creativity Control**: Low/Medium/High creativity levels affecting AI temperature
- **Tone Override**: Manual tone selection overriding platform defaults
- **Focus Keywords**: Ability to specify keywords to emphasize in generated copy
- **Model Selection**: Choose between GPT-4o Mini, GPT-4o, and GPT-3.5 Turbo
- **Cache Management**: View cache size and clear cached content
- **Configuration Status**: Visual indicator showing AI availability

### 🎨 Enhanced CreativeBuilder Integration

- **Async Copy Generation**: Updated headline and description generation to support AI
- **AI Settings Tab**: New tab in CreativeBuilder for configuring AI copy preferences
- **Seamless Integration**: AI generation works alongside existing template system
- **Progress Feedback**: Loading states and progress indicators during generation

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Enable AI copy generation
VITE_CREATIVE_AI=true

# OpenAI API key (required for AI functionality)
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

### API Key Setup

1. Get an OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add it to your environment variables
3. The system automatically detects availability and shows appropriate UI

## Usage

### For Users

1. **Navigate to Creative Builder**: Go to the CreativeBuilder step in Campaign Flow V2
2. **Configure AI Settings**: Click the "AI Settings" tab to configure:
   - Creativity level (affects how bold/creative the AI is)
   - Tone override (optional platform tone override)
   - Focus keywords (comma-separated keywords to emphasize)
   - AI model selection
3. **Generate Creatives**: The AI will automatically generate headlines and descriptions when you click "Generate Creatives"

### For Developers

```javascript
import { generateAIHeadlines, generateAIDescriptions } from '../services/aiCopyService';

// Generate AI headlines
const headlines = await generateAIHeadlines(
  productData,     // Product information
  audienceData,    // Target audience data
  platformData,    // Platform and campaign objective
  aiSettings       // AI configuration settings
);

// Generate AI descriptions
const descriptions = await generateAIDescriptions(
  productData,
  audienceData,
  platformData,
  aiSettings
);
```

## Technical Architecture

### AI Service Architecture

```
aiCopyService.js
├── OpenAI Client Management
├── Platform-Specific Configurations
├── Prompt Engineering
├── Cache Management
├── Error Handling & Fallbacks
└── Utility Functions
```

### Data Flow

1. **Input Gathering**: CreativeBuilder collects product, audience, and platform data
2. **Prompt Construction**: AI service builds context-aware prompts with platform specifications
3. **API Call**: OpenAI API generates 3 copy variations per request
4. **Validation**: Generated copy is validated against platform character limits
5. **Caching**: Valid results are cached to improve performance
6. **Fallback**: On failure, system falls back to template-based generation

### Platform Specifications

| Platform  | Headline Limit | Description Limit | Default Tone    |
|-----------|---------------|-------------------|-----------------|
| Meta      | 40 chars     | 125 chars        | Engaging        |
| Google    | 30 chars     | 90 chars         | Direct          |
| TikTok    | 50 chars     | 100 chars        | Trendy          |
| Pinterest | 100 chars    | 500 chars        | Inspirational   |

## Error Handling

The system includes comprehensive error handling:

- **API Failures**: Falls back to template generation
- **Invalid Responses**: Validates and filters generated content
- **Character Limits**: Automatically filters content exceeding platform limits
- **Network Issues**: Graceful degradation with user feedback

## Performance Considerations

- **Caching**: Generated content is cached to reduce API calls
- **Async Processing**: Non-blocking generation with progress feedback
- **Rate Limiting**: Built-in considerations for OpenAI API rate limits
- **Efficient Prompts**: Optimized prompts to minimize token usage

## Future Enhancements

### Planned Features

1. **A/B Testing Integration**: Generate copy variations optimized for testing
2. **Brand Voice Training**: Custom fine-tuning for specific brand voices
3. **Multi-Language Support**: Generate copy in multiple languages
4. **Performance Analytics**: Track AI-generated copy performance
5. **Batch Generation**: Generate copy for multiple campaigns simultaneously

### Integration Opportunities

1. **Analytics Dashboard**: Track AI copy performance metrics
2. **Campaign Optimization**: Use performance data to improve prompts
3. **Brand Guidelines**: Integrate brand voice and style guidelines
4. **Competitor Analysis**: Incorporate competitive intelligence into prompts

## Dependencies

- `openai`: OpenAI JavaScript SDK
- `@heroicons/react`: Icons for the AI settings UI

## Testing

The implementation includes fallback systems that ensure functionality even without OpenAI API access:

- Template-based generation when API is unavailable
- Mock data for development and testing
- Error state handling and user feedback

## Troubleshooting

### Common Issues

1. **"AI Copy Generation Unavailable"**
   - Check if `VITE_OPENAI_API_KEY` is set
   - Verify API key is valid
   - Ensure `VITE_CREATIVE_AI=true`

2. **Generated Copy Exceeds Limits**
   - System automatically filters invalid content
   - Falls back to templates if all AI content is invalid

3. **Slow Generation**
   - Check network connectivity
   - Consider using faster model (GPT-3.5 Turbo)
   - Clear cache if performance degrades

## API Usage and Costs

- **Model Costs**: GPT-4o Mini is most cost-effective
- **Token Optimization**: Prompts are optimized for minimal token usage
- **Caching**: Reduces redundant API calls significantly
- **Fallback**: No costs incurred when using template fallback

## Security Considerations

- API keys are environment-based and not exposed in client code
- `dangerouslyAllowBrowser: true` is required for client-side usage
- Consider server-side implementation for production environments
- Cache does not persist sensitive information 