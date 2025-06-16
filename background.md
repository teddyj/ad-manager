# Background Customization Feature Plan

## Overview
Add a background customization feature that allows users to replace product image backgrounds using the [fal.ai background change API](https://fal.ai/models/fal-ai/image-editing/background-change/api). This will enable users to create more engaging and context-appropriate creative assets for their campaigns.

## Feature Goals
- Allow users to change product image backgrounds during the creative process
- Provide suggested background prompts for common marketing scenarios
- Maintain high-quality output while keeping the process simple
- Integrate seamlessly into existing product image management workflow

## Technical Implementation Plan

### Phase 1: API Integration Setup (Week 1)

#### 1.1 Environment Setup
- [ ] Install fal.ai client: `npm install --save @fal-ai/client`
- [ ] Add FAL_KEY to environment variables
- [ ] Create API service wrapper for background changes
- [ ] Add error handling and rate limiting

#### 1.2 Background API Service
Create `src/services/backgroundService.js`:
```javascript
import { fal } from "@fal-ai/client";

export class BackgroundService {
  static async changeBackground(imageUrl, prompt, options = {}) {
    // API call implementation
  }
  
  static async uploadImage(file) {
    // File upload helper
  }
}
```

#### 1.3 Configuration
Add to environment variables:
- `VITE_FAL_API_KEY` - fal.ai API key
- `VITE_ENABLE_BACKGROUND_CHANGE` - feature flag

### Phase 2: UI Components (Week 2)

#### 2.1 Background Change Modal
Create `src/components/BackgroundChangeModal.jsx`:
- Image preview (before/after)
- Background prompt input with suggestions
- Processing status indicator
- Save/Cancel actions

#### 2.2 Suggested Prompts Component
Pre-defined background options:
```javascript
const BACKGROUND_PROMPTS = [
  // Lifestyle & Context
  { category: "Lifestyle", prompt: "modern kitchen counter with natural lighting", description: "Kitchen Setting" },
  { category: "Lifestyle", prompt: "cozy living room with warm lighting", description: "Home Environment" },
  { category: "Lifestyle", prompt: "outdoor picnic table in a park", description: "Outdoor Dining" },
  
  // Retail & Commercial
  { category: "Retail", prompt: "clean grocery store shelf background", description: "Store Display" },
  { category: "Retail", prompt: "premium marble countertop with soft shadows", description: "Luxury Display" },
  { category: "Retail", prompt: "wooden farmhouse table with rustic charm", description: "Artisanal Look" },
  
  // Seasonal & Thematic
  { category: "Seasonal", prompt: "autumn leaves and warm orange tones", description: "Fall Theme" },
  { category: "Seasonal", prompt: "fresh spring garden with green plants", description: "Spring Fresh" },
  { category: "Seasonal", prompt: "winter holiday scene with snow", description: "Holiday Theme" },
  
  // Professional & Clean
  { category: "Professional", prompt: "pure white studio background", description: "Clean Studio" },
  { category: "Professional", prompt: "soft gradient from white to light gray", description: "Minimalist" },
  { category: "Professional", prompt: "wooden cutting board with herbs", description: "Culinary Focus" }
];
```

#### 2.3 Integration Points
- Add "Change Background" button to ProductImageManager
- Add background change option to asset upload workflow
- Include in ProductFormView image section

### Phase 3: Workflow Integration (Week 3)

#### 3.1 Product Image Management Enhancement
Update `ProductImageManager.jsx`:
- Add background change button to each uploaded image
- Show processing status during API calls
- Handle before/after image versions
- Update image metadata with background change info

#### 3.2 Campaign Asset Workflow
Integrate into existing asset selection:
- Add background customization step after image upload
- Allow background changes during product image selection
- Maintain original images alongside customized versions

#### 3.3 Database Schema Updates
Extend image objects:
```javascript
{
  id: "img_123",
  url: "original_image_url",
  altText: "Product description",
  isPrimary: false,
  backgroundChanged: true,
  originalUrl: "original_image_url", // Keep reference to original
  backgroundPrompt: "modern kitchen counter with natural lighting",
  createdAt: "2024-01-01T00:00:00Z"
}
```

### Phase 4: User Experience & Polish (Week 4)

#### 4.1 Loading States & Feedback
- Progress indicators during API processing
- Preview thumbnails while processing
- Error handling with retry options
- Success notifications

#### 4.2 Performance Optimizations
- Image compression before API calls
- Caching of processed images
- Lazy loading of background suggestions
- Batch processing capabilities

#### 4.3 User Guidance
- Tooltips explaining background change feature
- Sample before/after examples
- Best practices for prompt writing
- Guidelines for image quality

## User Interface Flow

### Background Change Process
1. **Entry Points:**
   - From ProductImageManager: "Change Background" button on uploaded images
   - During asset upload: Optional background customization step
   - In campaign creation: Background options for product images

2. **Background Change Modal:**
   ```
   [Original Image Preview] → [Arrow] → [New Background Preview]
   
   Background Options:
   ○ Suggested Prompts (categorized tabs)
   ○ Custom Prompt Input
   
   [Preview Changes] [Save] [Cancel]
   ```

3. **Processing Flow:**
   - User selects image and background option
   - Show processing spinner with estimated time
   - Display preview when ready
   - Allow user to approve or try different background

### Navigation Integration
- Add "Backgrounds" tab to product image sections
- Include background change history
- Option to revert to original image

## API Usage & Costs

### fal.ai Integration Details
Based on the [fal.ai background change API](https://fal.ai/models/fal-ai/image-editing/background-change/api):

#### API Parameters
```javascript
{
  image_url: "product_image_url",
  prompt: "selected_background_prompt",
  guidance_scale: 3.5, // Default for good quality
  num_inference_steps: 30, // Balance of quality vs speed
  safety_tolerance: "2", // Moderate safety
  output_format: "jpeg", // Optimal for web
  aspect_ratio: "1:1" // Maintain product image format
}
```

#### Cost Considerations
- Estimate API costs per image transformation
- Implement usage tracking and limits
- Consider caching to avoid duplicate processing
- Add user notifications about processing costs

### Rate Limiting & Error Handling
- Implement exponential backoff for retries
- Queue system for multiple background changes
- Graceful degradation when API is unavailable
- User-friendly error messages

## Security & Privacy

### API Key Management
- Server-side proxy for API calls to protect keys
- Environment variable configuration
- Rate limiting per user/session

### Image Handling
- Secure upload and storage of original images
- Temporary URLs for API processing
- Cleanup of intermediate files
- User data privacy compliance

## Testing Strategy

### Unit Tests
- Background service API wrapper
- Prompt suggestion functionality
- Image upload/download helpers
- Error handling scenarios

### Integration Tests
- End-to-end background change workflow
- API response handling
- UI state management during processing
- Image quality validation

### User Testing
- Usability testing of background selection
- Performance testing with various image sizes
- A/B testing of suggested prompts effectiveness

## Future Enhancements

### Phase 5: Advanced Features
- [ ] Batch background changes for multiple images
- [ ] Custom brand-specific background templates
- [ ] AI-suggested backgrounds based on product type
- [ ] Background change analytics and optimization

### Phase 6: Professional Features
- [ ] Brand guidelines integration for backgrounds
- [ ] Team collaboration on background selections
- [ ] Export optimized images for different platforms
- [ ] Custom background prompt libraries

## Success Metrics

### User Engagement
- Percentage of users who try background changes
- Number of background changes per product
- User retention after using feature
- Time spent in background customization

### Quality Metrics
- User satisfaction ratings for generated backgrounds
- Success rate of background change operations
- Image quality scores (manual review)
- API response times and reliability

### Business Impact
- Increase in campaign creation completion rates
- Improvement in ad performance with custom backgrounds
- User upgrade rates (if premium feature)
- Reduction in external image editing tool usage

## Implementation Timeline

| Week | Focus | Deliverables |
|------|-------|--------------|
| 1 | API Setup | fal.ai integration, service layer, environment setup |
| 2 | UI Components | Background change modal, prompt suggestions, integration points |
| 3 | Workflow Integration | Product image management, campaign workflow, database updates |
| 4 | Polish & Testing | UX improvements, performance optimization, testing |

## Resource Requirements

### Development
- 1 Full-stack developer (4 weeks)
- UI/UX design support (1 week)
- QA testing (1 week)

### Infrastructure
- fal.ai API subscription
- Additional storage for image versions
- CDN bandwidth for image processing

### Ongoing
- API usage monitoring
- Customer support for feature questions
- Regular prompt library updates

## Risk Mitigation

### Technical Risks
- **API Reliability:** Implement fallback options and error handling
- **Image Quality:** Add preview and approval steps
- **Performance:** Optimize image sizes and implement caching

### Business Risks
- **API Costs:** Monitor usage and implement limits
- **User Adoption:** Provide clear onboarding and examples
- **Quality Control:** Manual review process for generated backgrounds

## Conclusion

This background customization feature will significantly enhance the creative capabilities of the ad builder platform. By leveraging the fal.ai background change API and providing intuitive suggested prompts, users can create more compelling and contextually appropriate product advertisements without requiring external design tools.

The phased approach ensures a solid foundation while allowing for iterative improvements based on user feedback and usage patterns. 