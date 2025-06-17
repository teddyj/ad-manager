# Image Resize & Background Migration Plan

## Overview
This document outlines the plan to implement image resizing functionality in the creative step and migrate the existing background image maker from the product page to the ad creation workflow. This will provide users with more flexible image editing capabilities during campaign creation.

## Current State Analysis

### Existing Components
1. **BackgroundCustomizer** (`src/components/BackgroundCustomizer.jsx`)
   - Currently integrated into ProductDetailsView
   - Uses fal.ai API for background changes
   - Manages background versions and selection
   - Full modal interface with prompt selection

2. **AdCustomization** (`src/App.jsx` lines 2660-2836)
   - Current creative step with headline, description, CTA customization
   - Ad size selection (300x250, 320x50, 320x400, 1080x1920)
   - Preview panel with real-time updates
   - No image editing capabilities

3. **ProductImageManager** (`src/App.jsx` lines 3729-3876)
   - Image upload, alt text, primary image selection
   - Currently only in product creation/editing

## Goals

### Phase 1: Image Resizing Implementation
- Add image resize/crop functionality to the creative step
- Support for different ad sizes with proper aspect ratios
- Maintain image quality during resize operations
- Intuitive drag-and-resize interface

### Phase 2: Background Maker Migration
- Move background customization from product page to creative step
- Integrate with existing background service and prompts
- Maintain version management capabilities
- Streamline workflow for campaign creation

## Technical Implementation Plan

### Phase 1: Image Resizing (Week 1-2)

#### 1.1 Image Resize Service
**New File**: `src/services/imageResizeService.js`

The service will handle canvas-based image resizing with crop support:
- Convert images to canvas for manipulation
- Calculate optimal crop areas for different aspect ratios
- Maintain quality during resize operations
- Support for multiple output formats

#### 1.2 Image Editor Component
**New File**: `src/components/ImageEditor.jsx`

Interactive image editing interface featuring:
- Canvas-based crop selection with mouse/touch support
- Real-time preview of resize operations
- Quality controls (High/Medium/Low)
- Undo/Redo functionality
- Target size display and guidance

#### 1.3 Enhanced AdCustomization
**Modifications to**: `src/App.jsx` (AdCustomization function)

Integration points:
- Add "Edit Image" button to customization panel
- Implement image history for undo/redo
- Modal interface for image editing
- Update preview with edited images

### Phase 2: Background Migration (Week 3-4)

#### 2.1 Dual-Mode Background Customizer
**Extend**: `src/components/BackgroundCustomizer.jsx`

Support both product and creative modes:
- **Product Mode**: Save background versions to product database
- **Creative Mode**: Process images temporarily for campaign use
- Mode-specific UI messaging and behavior
- Temporary image processing workflow

#### 2.2 Tabbed Image Editor
**Extend**: `src/components/ImageEditor.jsx`

Combined interface with tabs:
- **Resize & Crop** tab for size adjustments
- **Change Background** tab for background customization
- Seamless workflow between resize and background operations
- Integrated preview showing all changes

#### 2.3 Enhanced Creative Step
**Further extend**: `src/App.jsx` (AdCustomization)

Advanced image editing controls:
- Background change toggle for product-linked campaigns
- Combined resize and background workflow
- Enhanced preview with all modifications
- Temporary processing for creative-only changes

## Implementation Timeline

### Week 1: Image Resize Foundation
- [ ] Create `ImageResizeService` with canvas-based resize
- [ ] Implement basic crop selection interface
- [ ] Add resize functionality to `AdCustomization`
- [ ] Test with different ad sizes

### Week 2: Image Resize Enhancement
- [ ] Add interactive crop/resize UI
- [ ] Implement undo/redo functionality
- [ ] Add quality controls and preview
- [ ] Polish user experience

### Week 3: Background Migration Setup
- [ ] Extend `ImageEditor` with background change tabs
- [ ] Modify `BackgroundCustomizer` for creative mode
- [ ] Create temporary image processing workflow
- [ ] Test background change in creative step

### Week 4: Integration & Polish
- [ ] Full integration testing
- [ ] Performance optimization
- [ ] User experience refinements
- [ ] Documentation updates

## Technical Considerations

### Image Processing Performance
- Use Web Workers for heavy image processing
- Implement progressive loading for large images
- Cache resized images in sessionStorage
- Optimize canvas operations for smooth interaction

### Memory Management
- Clean up canvas contexts after use
- Limit undo history to reasonable number (10-15 steps)
- Use object URLs efficiently
- Monitor memory usage in browser dev tools

### User Experience
- Provide clear visual feedback during processing
- Maintain aspect ratio guidelines
- Show file size implications of quality settings
- Implement keyboard shortcuts for common actions

### Error Handling
- Handle unsupported image formats gracefully
- Provide fallbacks for canvas API issues
- Show meaningful error messages
- Implement retry mechanisms for API calls

## Migration Strategy

### Background Customizer Migration
1. **Dual Mode Support**: Modify existing component to support both product and creative modes
2. **Temporary Processing**: Create workflow for temporary image processing in creative mode
3. **Gradual Migration**: Keep existing product page functionality while adding creative step
4. **User Testing**: A/B test to ensure workflow improvement

### Data Flow Changes
- **Product Mode**: Save background versions to product database
- **Creative Mode**: Process images temporarily, apply to ad preview only
- **Workflow Integration**: Seamless handoff between resize and background change

## User Interface Mockup

### Enhanced Creative Step Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Step 4: Customize Your Ad                    │ Ad Preview        │
├─────────────────────────────────────────────┼───────────────────┤
│ Campaign: Spring Launch 2024                │                   │
│ Audience: Working Parent                    │   [Image Preview] │
│                                             │                   │
│ ┌─ Image Editing ─────────────────────────┐ │   Headline        │
│ │ [Edit Image] [🎨 Background: ON]        │ │   Description     │
│ │ [↶ Undo] [↷ Redo]                      │ │   [CTA Button]    │
│ └─────────────────────────────────────────┘ │                   │
│                                             │                   │
│ ┌─ Ad Size ───────────────────────────────┐ │                   │
│ │ ○ Medium Rectangle (300x250)            │ │                   │
│ │ ○ Mobile Leaderboard (320x50)           │ │                   │
│ └─────────────────────────────────────────┘ │                   │
│                                             │                   │
│ [Headline Input]                            │                   │
│ [Description Input]                         │                   │
│ [CTA Configuration]                         │                   │
│                                             │                   │
│ [Preview & Publish]                         │                   │
└─────────────────────────────────────────────┴───────────────────┘
```

### Image Editor Modal
```
┌─────────────────────────────────────────────────────────────────┐
│ Resize Image for 300x250                                    [×] │
├─────────────────────────────────────────────────────────────────┤
│ [Resize & Crop] [Change Background]                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────┐  ┌─ Controls ────────┐ │
│  │                                     │  │ Target: 300×250   │ │
│  │        [Image Canvas]               │  │ Quality: High     │ │
│  │     [Crop Selection Overlay]        │  │                   │ │
│  │                                     │  │ ┌─ Preview ─────┐ │ │
│  └─────────────────────────────────────┘  │ │   [Preview]   │ │ │
│                                           │ └───────────────┘ │ │
│                                           └───────────────────┘ │
│                                                                 │
│                                    [Cancel] [Apply Resize]      │
└─────────────────────────────────────────────────────────────────┘
```

## Success Metrics

### User Experience
- Reduced time to create campaigns with custom images
- Increased usage of background customization features
- Higher user satisfaction scores for creative tools

### Technical Performance
- Image processing time < 3 seconds for standard operations
- Memory usage stays within browser limits
- No performance degradation in existing workflows

## Future Enhancements

### Advanced Image Editing
- Filters and color adjustments
- Text overlay capabilities
- Brand element integration
- Batch processing for multiple ad sizes

### AI-Powered Features
- Automatic crop suggestions based on ad size
- Smart background recommendations
- Content-aware resizing
- Brand guideline compliance checking

## Risk Mitigation

### Technical Risks
- **Canvas API limitations**: Implement fallbacks for older browsers
- **Memory constraints**: Add progressive processing for large images
- **API rate limits**: Implement queuing and retry logic

### User Experience Risks
- **Complexity**: Provide guided tours and tooltips
- **Performance**: Show progress indicators and loading states
- **Learning curve**: Create video tutorials and documentation

## Dependencies

### External Libraries
- Consider adding `fabric.js` for advanced canvas manipulation
- Evaluate `cropperjs` for crop selection interface
- Research `pica.js` for high-quality image resizing

### API Dependencies
- fal.ai background change API (existing)
- Potential integration with additional image processing APIs
- CDN for optimized image delivery

## Conclusion

This plan provides a comprehensive approach to adding image resizing capabilities and migrating background customization to the creative step. The phased implementation allows for iterative testing and refinement, ensuring a smooth user experience while maintaining system performance and reliability.

The migration will significantly enhance the campaign creation workflow by providing powerful image editing tools at the point of creative development, reducing the need to switch between different parts of the application and enabling more efficient campaign creation. 