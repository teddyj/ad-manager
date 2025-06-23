# New Campaign Creation Flow - Refactor Plan

## Overview
This document outlines the refactor plan for restructuring the campaign creation process into a more professional, platform-oriented flow while maintaining backward compatibility with the existing system.

## Current vs. New Flow

### Current Flow
1. **Create Campaign** - Name, audience, product selection
2. **Select Asset Source** - Upload, URL, or product images
3. **Customize Creative** - Canvas editor with design tools
4. **Publish** - Save campaign and basic platform publishing

### New Flow (Proposed)
1. **Select Product** - Choose or create product to promote
2. **Define Audience** - Detailed audience segmentation and targeting
3. **Select Ad Platforms** - Choose Meta/Instagram, Display, CTV, TikTok
   - Option to send audiences to platforms OR build creatives first
4. **Build Ad Creatives** - Platform-specific creative generation
5. **Save & Publish** - Deploy to selected platforms

## Architecture Strategy

### Migration Approach
- **Parallel Development**: Build new flow alongside existing system
- **Feature Flagging**: Use environment variables to control which flow is active
- **Gradual Migration**: Allow users to switch between flows during transition
- **Component Reuse**: Leverage existing components where possible

### File Structure
```
src/
├── flows/
│   ├── legacy/           # Current flow (moved here)
│   │   ├── LegacyCampaignBuilder.jsx
│   │   └── legacy-constants.js
│   └── v2/               # New flow
│       ├── CampaignFlowV2.jsx
│       ├── steps/
│       │   ├── ProductSelection.jsx
│       │   ├── AudienceBuilder.jsx
│       │   ├── PlatformSelector.jsx
│       │   ├── CreativeBuilder.jsx
│       │   └── PublishManager.jsx
│       ├── constants/
│       │   ├── platforms.js
│       │   ├── audiences.js
│       │   └── creativeSpecs.js
│       └── services/
│           ├── PlatformService.js
│           ├── AudienceService.js
│           └── CreativeOptimizer.js
├── components/
│   ├── shared/           # Reusable across both flows
│   │   ├── ProductAssetManager.jsx (existing)
│   │   ├── CanvasEditor.jsx (existing)
│   │   └── DesignControls.jsx (existing)
│   └── platform/         # New platform-specific components
│       ├── MetaCreativeBuilder.jsx
│       ├── DisplayAdBuilder.jsx
│       ├── CTVCreativeBuilder.jsx
│       └── TikTokCreativeBuilder.jsx
```

## Detailed Implementation Plan

### Phase 1: Foundation Setup (Week 1)

#### 1.1 Create New Flow Structure
```javascript
// src/flows/v2/CampaignFlowV2.jsx
const FLOW_STEPS = {
  PRODUCT_SELECTION: 'product_selection',
  AUDIENCE_BUILDER: 'audience_builder', 
  PLATFORM_SELECTOR: 'platform_selector',
  CREATIVE_BUILDER: 'creative_builder',
  PUBLISH_MANAGER: 'publish_manager'
};

const PLATFORMS = {
  META: {
    id: 'meta',
    name: 'Meta (Facebook & Instagram)',
    icon: '📘',
    formats: ['1080x1080', '1200x628', '1080x1920'],
    audienceSync: true,
    creativeSpecs: {
      maxTextRatio: 0.2,
      imageFormats: ['jpg', 'png'],
      videoFormats: ['mp4', 'mov']
    }
  },
  DISPLAY: {
    id: 'display',
    name: 'Display Network',
    icon: '🖼️',
    formats: ['300x250', '728x90', '320x50', '160x600'],
    audienceSync: false,
    creativeSpecs: {
      maxFileSize: '150kb',
      animationDuration: '30s'
    }
  },
  CTV: {
    id: 'ctv',
    name: 'Connected TV',
    icon: '📺',
    formats: ['1920x1080'],
    audienceSync: true,
    creativeSpecs: {
      videoLength: [15, 30, 60],
      aspectRatio: '16:9'
    }
  },
  TIKTOK: {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🎵',
    formats: ['1080x1920', '1080x1080'],
    audienceSync: true,
    creativeSpecs: {
      videoLength: [9, 15, 30, 60],
      aspectRatio: '9:16'
    }
  }
};
```

#### 1.2 Feature Flag System
```javascript
// src/config/features.js
export const FEATURES = {
  NEW_CAMPAIGN_FLOW: process.env.VITE_NEW_CAMPAIGN_FLOW === 'true',
  PLATFORM_INTEGRATIONS: process.env.VITE_PLATFORM_INTEGRATIONS === 'true',
  AUDIENCE_SYNC: process.env.VITE_AUDIENCE_SYNC === 'true'
};

// src/App.jsx updates
import { FEATURES } from './config/features.js';

const handleCreateNewCampaign = () => {
  if (FEATURES.NEW_CAMPAIGN_FLOW) {
    setAppView(APP_VIEW_CAMPAIGN_FLOW_V2);
  } else {
    setAppView(APP_VIEW_CAMPAIGN_BUILDER);
  }
};
```

### Phase 2: Enhanced Product Selection & Audience Building

#### 2.1 Product Selection with Platform Intelligence
- Enhance existing product structure with platform-specific settings
- Add suggested platforms based on product category
- Integrate with existing ProductAssetManager component

#### 2.2 Advanced Audience Builder
- Create sophisticated audience segmentation tools
- Platform-specific audience translation
- Audience templates and presets

### Phase 3: Platform Selection & Creative Generation

#### 3.1 Multi-Platform Creative Builder
- Automatic creative generation for each platform
- Platform-specific format optimization
- Reuse existing CanvasEditor with platform constraints

#### 3.2 Publishing & Integration Management
- Campaign publishing to multiple platforms
- Status tracking and error handling
- Integration with existing database operations

## Key Reusable Components

### Existing Components to Leverage
- `ProductAssetManager.jsx` - Product image management
- `CanvasEditor.jsx` - Creative editing (enhanced)
- `DesignControls.jsx` - Design customization
- `TemplateSelector.jsx` - Layout templates
- `BackgroundCustomizer.jsx` - Background generation

### Platform Service Architecture
- Mock implementations for development
- Real API integrations for production
- Centralized error handling and retry logic

## Implementation Timeline

- **Week 1**: Foundation setup and feature flags
- **Week 2**: Product selection and audience builder
- **Week 3**: Platform selector and configuration
- **Week 4**: Creative builder enhancement
- **Week 5**: Publishing manager and integration
- **Week 6**: Testing, optimization, and documentation

## Migration Strategy

### Phase 1: Parallel Development
- Build new flow alongside existing system
- Feature flag to toggle between flows
- Maintain full backward compatibility

### Phase 2: Beta Testing
- Gradual rollout to select users
- A/B testing between flows
- Feedback collection and iteration

### Phase 3: Full Migration
- Default to new flow
- Legacy flow as fallback
- Gradual deprecation

## Current System Analysis

### Existing Components (Reusable)
Based on analysis of the current codebase, these components can be leveraged:

- **ProductAssetManager.jsx** - Handles product image upload, processing, and management
- **CanvasEditor.jsx** - Rich canvas editing with element manipulation, multi-format support
- **DesignControls.jsx** - Right panel with styling controls and asset management
- **TemplateSelector.jsx** - Pre-designed layout templates with format-specific optimizations
- **BackgroundCustomizer.jsx** - AI-powered background generation using fal.ai
- **ResponsiveCanvas.jsx** - Multi-format canvas support for different ad sizes

### Current Data Flow Analysis
```
CreateCampaignScreen (product + audience) → 
StartScreen (asset source choice) → 
[Upload/URL/ProductImages] (content provision) → 
AdCustomization (ResponsiveCanvas + CanvasEditor) → 
PublishScreen (save + basic platform publishing)
```

### Existing Ad Format Support
- Medium Rectangle (300x250)
- Mobile Banner (320x50)
- Mobile Rectangle (320x400)
- Stories & Reels (1080x1920)

## Enhanced Implementation Details

### Phase 1: Foundation Setup (Week 1)

#### 1.1 Platform Definitions (Enhanced)
```javascript
// src/flows/v2/constants/platforms.js
export const PLATFORMS = {
  META: {
    id: 'meta',
    name: 'Meta (Facebook & Instagram)',
    icon: '📘',
    description: 'Reach billions on Facebook and Instagram',
    formats: ['1080x1080', '1200x628', '1080x1920', '320x400'],
    audienceSync: true,
    minBudget: 5,
    dailyBudgetMin: 1,
    creativeSpecs: {
      maxTextRatio: 0.2,
      imageFormats: ['jpg', 'png'],
      videoFormats: ['mp4', 'mov'],
      maxFileSize: '30MB',
      videoLengthMax: 240
    },
    placements: [
      'facebook_feed', 'instagram_feed', 'facebook_stories', 
      'instagram_stories', 'facebook_marketplace', 'instagram_reels'
    ]
  },
  DISPLAY: {
    id: 'display',
    name: 'Display Network',
    icon: '🖼️',
    description: 'Google Display Network and programmatic advertising',
    formats: ['300x250', '728x90', '320x50', '160x600', '970x250'],
    audienceSync: false,
    minBudget: 10,
    creativeSpecs: {
      maxFileSize: '150kb',
      imageFormats: ['jpg', 'png', 'gif'],
      animationDuration: '30s',
      maxTextLength: 150
    }
  },
  CTV: {
    id: 'ctv', 
    name: 'Connected TV',
    icon: '📺',
    description: 'Streaming TV and over-the-top advertising',
    formats: ['1920x1080'],
    audienceSync: true,
    minBudget: 100,
    creativeSpecs: {
      videoLength: [15, 30, 60],
      aspectRatio: '16:9',
      videoFormats: ['mp4'],
      resolution: '1920x1080'
    }
  },
  TIKTOK: {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🎵', 
    description: 'Short-form video advertising on TikTok',
    formats: ['1080x1920', '1080x1080'],
    audienceSync: true,
    minBudget: 20,
    creativeSpecs: {
      videoLength: [9, 15, 30, 60],
      aspectRatio: '9:16',
      videoFormats: ['mp4', 'mov'],
      maxFileSize: '500MB'
    }
  }
};
```

#### 1.2 Enhanced Feature Flag Implementation
```javascript
// src/config/features.js
export const FEATURES = {
  NEW_CAMPAIGN_FLOW: process.env.VITE_NEW_CAMPAIGN_FLOW === 'true',
  PLATFORM_INTEGRATIONS: process.env.VITE_PLATFORM_INTEGRATIONS === 'true',
  AUDIENCE_SYNC: process.env.VITE_AUDIENCE_SYNC === 'true',
  CREATIVE_AI: process.env.VITE_CREATIVE_AI === 'true'
};

// Enhanced App.jsx integration
import { FEATURES } from './config/features.js';

const APP_VIEW_CAMPAIGN_FLOW_V2 = 'campaign_flow_v2';

const handleCreateNewCampaign = () => {
  if (FEATURES.NEW_CAMPAIGN_FLOW) {
    setAppView(APP_VIEW_CAMPAIGN_FLOW_V2);
    // Initialize new flow state
    setCampaignFlowData({
      step: 'product_selection',
      product: null,
      audience: null,
      platforms: [],
      creatives: {}
    });
  } else {
    setAppView(APP_VIEW_CAMPAIGN_BUILDER);
    setCurrentViewWithHistory(VIEW_CREATE_CAMPAIGN);
  }
};
```

### Phase 2: Product Selection Enhancement (Week 1-2)

#### 2.1 Product Enhancement with Platform Intelligence
```javascript
// Enhanced product structure
const enhancedProduct = {
  // Existing fields from current system
  id: 'product_123',
  name: 'Organic Protein Powder',
  brand: 'HealthCorp',
  category: 'health_wellness',
  description: 'Premium organic protein powder',
  images: [], // Existing ProductAssetManager integration
  
  // New platform-specific enhancements
  platformSettings: {
    meta: {
      enabled: true,
      customAudiences: ['lookalike_1percent', 'website_visitors'],
      campaignObjective: 'conversions',
      bidStrategy: 'lowest_cost'
    },
    display: {
      enabled: true,
      targetNetworks: ['google_display', 'youtube'],
      biddingStrategy: 'target_cpa',
      keywords: ['protein', 'organic', 'fitness']
    },
    ctv: {
      enabled: false,
      targetDevices: ['smart_tv', 'streaming_device'],
      dayparting: ['evening', 'weekend']
    },
    tiktok: {
      enabled: true,
      ageRange: [18, 35],
      interests: ['fitness', 'health', 'organic_food'],
      contentStyle: 'authentic'
    }
  },
  
  // AI-generated recommendations
  suggestedPlatforms: [
    { platform: 'meta', confidence: 0.9, reason: 'High engagement for health products' },
    { platform: 'display', confidence: 0.7, reason: 'Good for educational content' },
    { platform: 'tiktok', confidence: 0.8, reason: 'Young demographic matches target' }
  ],
  
  // Default creative preferences
  defaultCreativeStyle: 'product_focused',
  targetAge: [25, 45],
  primaryMessaging: 'health_benefits'
};
```

#### 2.2 Enhanced Product Selection Component
```javascript
// src/flows/v2/steps/ProductSelection.jsx
function ProductSelection({ onNext, dbOperations }) {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  useEffect(() => {
    // Load and enhance existing products
    const existingProducts = dbOperations.getProducts();
    const enhancedProducts = existingProducts.map(enhanceProductWithPlatformData);
    setProducts(enhancedProducts);
  }, []);
  
  const enhanceProductWithPlatformData = (product) => ({
    ...product,
    platformRecommendations: generatePlatformRecommendations(product),
    suggestedAudiences: generateAudienceSuggestions(product),
    estimatedReach: calculateEstimatedReach(product)
  });
  
  return (
    <div className="product-selection">
      <div className="header">
        <h2>Select Product to Promote</h2>
        <p>Choose a product or create a new one to build your campaign around</p>
      </div>
      
      {/* Product grid with enhanced cards showing platform recommendations */}
      <div className="products-grid">
        {filteredProducts.map(product => (
          <ProductCardV2
            key={product.id}
            product={product}
            selected={selectedProduct?.id === product.id}
            onSelect={() => setSelectedProduct(product)}
            showPlatformRecommendations={true}
          />
        ))}
      </div>
      
      {selectedProduct && (
        <ProductPreview 
          product={selectedProduct}
          onNext={() => onNext({ product: selectedProduct })}
        />
      )}
    </div>
  );
}
```

### Phase 3: Advanced Audience Builder (Week 2-3)

#### 3.1 Sophisticated Audience Configuration
```javascript
// src/flows/v2/steps/AudienceBuilder.jsx
function AudienceBuilder({ productData, onNext, onBack }) {
  const [audienceConfig, setAudienceConfig] = useState({
    name: `${productData.product.name} Audience`,
    primary: {
      demographics: {
        age: productData.product.targetAge || [25, 54],
        gender: 'all',
        income: 'middle_upper',
        education: 'any'
      },
      interests: productData.product.interests || [],
      behaviors: [],
      locations: {
        countries: ['US'],
        regions: [],
        excludeLocations: []
      }
    },
    lookalike: {
      enabled: false,
      source: 'website_visitors',
      similarity: 1,
      size: 1000000
    },
    custom: {
      enabled: false,
      customerList: null,
      websiteVisitors: false,
      appUsers: false
    }
  });
  
  const [audienceSize, setAudienceSize] = useState(null);
  
  // Platform-specific audience translation
  const generatePlatformAudiences = () => ({
    meta: {
      name: audienceConfig.name,
      age_min: audienceConfig.primary.demographics.age[0],
      age_max: audienceConfig.primary.demographics.age[1],
      genders: audienceConfig.primary.demographics.gender === 'all' ? [1, 2] : 
              audienceConfig.primary.demographics.gender === 'male' ? [1] : [2],
      interests: audienceConfig.primary.interests.map(i => ({ id: i.metaId, name: i.name })),
      geo_locations: { countries: audienceConfig.primary.locations.countries }
    },
    display: {
      demographics: {
        age_range: `${audienceConfig.primary.demographics.age[0]}-${audienceConfig.primary.demographics.age[1]}`,
        gender: audienceConfig.primary.demographics.gender
      },
      interests: audienceConfig.primary.interests.map(i => i.name),
      locations: audienceConfig.primary.locations.countries
    },
    tiktok: {
      age: audienceConfig.primary.demographics.age,
      gender: audienceConfig.primary.demographics.gender,
      interests: audienceConfig.primary.interests.map(i => i.name)
    }
  });
  
  return (
    <div className="audience-builder">
      {/* Sophisticated audience building interface */}
      <AudienceConfigurationPanel 
        config={audienceConfig}
        onChange={setAudienceConfig}
        productData={productData}
      />
      
      <AudienceSizeEstimator 
        config={audienceConfig}
        onSizeCalculated={setAudienceSize}
      />
      
      <PlatformAudiencePreview 
        audiences={generatePlatformAudiences()}
      />
    </div>
  );
}
```

### Phase 4: Platform Selection & Configuration (Week 3-4)

#### 4.1 Multi-Platform Selector with Budget Allocation
```javascript
// src/flows/v2/steps/PlatformSelector.jsx
function PlatformSelector({ productData, audienceData, onNext, onBack }) {
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [platformConfigs, setPlatformConfigs] = useState({});
  const [deploymentOption, setDeploymentOption] = useState('creative_first');
  const [budgetAllocation, setBudgetAllocation] = useState({});
  
  const renderPlatformCard = (platform) => (
    <PlatformCard
      platform={platform}
      selected={selectedPlatforms.includes(platform.id)}
      onToggle={() => handlePlatformToggle(platform.id)}
      onConfigChange={(config) => setPlatformConfigs(prev => ({ ...prev, [platform.id]: config }))}
      budgetShare={budgetAllocation[platform.id] || 0}
      onBudgetChange={(share) => setBudgetAllocation(prev => ({ ...prev, [platform.id]: share }))}
      recommendation={productData.product.platformRecommendations?.find(r => r.platform === platform.id)}
    />
  );
  
  return (
    <div className="platform-selector">
      <div className="deployment-strategy">
        <h3>Deployment Strategy</h3>
        <div className="strategy-options">
          <label>
            <input type="radio" value="creative_first" checked={deploymentOption === 'creative_first'} 
                   onChange={(e) => setDeploymentOption(e.target.value)} />
            <div>
              <strong>Create Ads First</strong>
              <p>Build creatives, then publish to platforms</p>
            </div>
          </label>
          <label>
            <input type="radio" value="audience_first" checked={deploymentOption === 'audience_first'}
                   onChange={(e) => setDeploymentOption(e.target.value)} />
            <div>
              <strong>Sync Audiences First</strong>
              <p>Send audience data to platforms, build ads later</p>
            </div>
          </label>
        </div>
      </div>
      
      <div className="platforms-grid">
        {Object.values(PLATFORMS).map(renderPlatformCard)}
      </div>
    </div>
  );
}
```

### Phase 5: Enhanced Creative Builder (Week 4-5)

#### 5.1 Platform-Aware Creative Generation
```javascript
// src/flows/v2/steps/CreativeBuilder.jsx
function CreativeBuilder({ campaignData, onNext, onBack }) {
  const [creatives, setCreatives] = useState({});
  const [currentPlatform, setCurrentPlatform] = useState(campaignData.platforms[0]);
  const [editingCreative, setEditingCreative] = useState(null);
  
  useEffect(() => {
    generateAllCreatives();
  }, []);
  
  const generateAllCreatives = async () => {
    for (const platformId of campaignData.platforms) {
      const platform = PLATFORMS[platformId.toUpperCase()];
      const platformCreatives = await Promise.all(
        platform.formats.map(async (format) => {
          const creative = await CreativeOptimizer.generateCreativeForFormat(
            campaignData.product,
            campaignData.audience,
            platform,
            format
          );
          return { format, ...creative };
        })
      );
      
      setCreatives(prev => ({ ...prev, [platformId]: platformCreatives }));
    }
  };
  
  const editCreative = (platformId, format) => {
    setEditingCreative({ platformId, format });
  };
  
  return (
    <div className="creative-builder">
      {editingCreative ? (
        <EnhancedCanvasEditor
          campaignData={campaignData}
          platform={PLATFORMS[editingCreative.platformId.toUpperCase()]}
          format={editingCreative.format}
          initialCanvasState={creatives[editingCreative.platformId]?.find(c => c.format === editingCreative.format)?.canvasState}
          onSave={(canvasState) => saveCreativeEdit(editingCreative, canvasState)}
          onClose={() => setEditingCreative(null)}
        />
      ) : (
        <CreativeGrid
          creatives={creatives}
          currentPlatform={currentPlatform}
          onPlatformChange={setCurrentPlatform}
          onEditCreative={editCreative}
        />
      )}
    </div>
  );
}
```

#### 5.2 Creative Optimization Service
```javascript
// src/flows/v2/services/CreativeOptimizer.js
export class CreativeOptimizer {
  static async generateCreativeForFormat(productData, audienceData, platform, format) {
    const [width, height] = format.split('x').map(Number);
    
    // Platform-specific optimizations
    const optimizations = this.getPlatformOptimizations(platform.id, audienceData);
    
    // Generate optimal layout
    const layout = this.generateOptimalLayout(width, height, platform, productData);
    
    // Audience-specific messaging
    const messaging = this.generateAudienceMessaging(audienceData, productData);
    
    // Create canvas state compatible with existing CanvasEditor
    const canvasState = {
      meta: {
        adSize: format,
        width,
        height,
        platform: platform.id,
        backgroundImage: productData.backgroundImage || ''
      },
      elements: this.generateElements(layout, messaging, platform)
    };
    
    return { canvasState, messaging, optimizations };
  }
  
  static generateElements(layout, messaging, platform) {
    return [
      {
        id: 'headline',
        type: 'text',
        content: messaging.headline,
        position: layout.headlinePosition,
        size: layout.headlineSize,
        styles: this.getTextStyles(platform, 'headline')
      },
      {
        id: 'description', 
        type: 'text',
        content: messaging.description,
        position: layout.descriptionPosition,
        size: layout.descriptionSize,
        styles: this.getTextStyles(platform, 'description')
      },
      {
        id: 'cta',
        type: 'button',
        content: messaging.cta,
        position: layout.ctaPosition,
        size: layout.ctaSize,
        styles: this.getButtonStyles(platform)
      }
    ];
  }
}
```

### Phase 6: Publishing & Integration (Week 5-6)

#### 6.1 Multi-Platform Publishing Manager
```javascript
// src/flows/v2/steps/PublishManager.jsx
function PublishManager({ campaignData, onComplete, onBack }) {
  const [publishStatus, setPublishStatus] = useState({});
  const [publishing, setPublishing] = useState(false);
  
  const handlePublishToPlatforms = async () => {
    setPublishing(true);
    
    // Save campaign first
    const savedCampaign = await dbOperations.saveCampaignV2({
      ...campaignData,
      status: 'publishing',
      created: new Date().toISOString()
    });
    
    // Publish to each platform
    const publishPromises = campaignData.platforms.map(async (platformId) => {
      try {
        const result = await PlatformService.publishCampaign(platformId, {
          product: campaignData.product,
          audience: campaignData.platformAudiences[platformId],
          creatives: campaignData.creatives[platformId],
          config: campaignData.platformConfigs[platformId]
        });
        return { platformId, success: true, result };
      } catch (error) {
        return { platformId, success: false, error: error.message };
      }
    });
    
    const results = await Promise.all(publishPromises);
    const statusMap = results.reduce((acc, { platformId, success, result, error }) => {
      acc[platformId] = { success, result, error };
      return acc;
    }, {});
    
    setPublishStatus(statusMap);
    setPublishing(false);
    
    // Update campaign with publish results
    await dbOperations.updateCampaignV2(savedCampaign.id, {
      status: 'published',
      publishStatus: statusMap,
      published: new Date().toISOString()
    });
  };
  
  return (
    <div className="publish-manager">
      <CampaignSummaryCard campaignData={campaignData} />
      <PlatformStatusGrid 
        platforms={campaignData.platforms}
        publishStatus={publishStatus}
      />
      <PublishActions
        onPublish={handlePublishToPlatforms}
        onBack={onBack}
        publishing={publishing}
        hasErrors={Object.values(publishStatus).some(s => !s.success)}
      />
    </div>
  );
}
```

#### 6.2 Platform Service Architecture
```javascript
// src/flows/v2/services/PlatformService.js
export class PlatformService {
  static async publishCampaign(platformId, campaignData) {
    switch (platformId) {
      case 'meta':
        return this.publishToMeta(campaignData);
      case 'display':
        return this.publishToDisplay(campaignData);
      case 'ctv':
        return this.publishToCTV(campaignData);
      case 'tiktok':
        return this.publishToTikTok(campaignData);
      default:
        throw new Error(`Unsupported platform: ${platformId}`);
    }
  }
  
  // Mock implementations for development
  static async publishToMeta(campaignData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          campaignId: `meta_${Date.now()}`,
          status: 'active',
          reach: Math.floor(Math.random() * 10000) + 1000,
          spend: 0,
          impressions: 0
        });
      }, 2000);
    });
  }
  
  // ... other platform implementations
}
```

## Integration with Existing System

### Enhanced Database Operations
```javascript
// Extend existing dbOperations for V2 campaigns
const enhancedDbOperations = {
  ...dbOperations,
  
  saveCampaignV2: (campaignData) => {
    const campaigns = JSON.parse(localStorage.getItem('campaignsV2') || '[]');
    const campaign = { id: `v2_${Date.now()}`, ...campaignData };
    campaigns.push(campaign);
    localStorage.setItem('campaignsV2', JSON.stringify(campaigns));
    return { success: true, campaign };
  },
  
  getCampaignsV2: () => JSON.parse(localStorage.getItem('campaignsV2') || '[]'),
  
  updateCampaignV2: (id, updates) => {
    const campaigns = JSON.parse(localStorage.getItem('campaignsV2') || '[]');
    const index = campaigns.findIndex(c => c.id === id);
    if (index !== -1) {
      campaigns[index] = { ...campaigns[index], ...updates };
      localStorage.setItem('campaignsV2', JSON.stringify(campaigns));
    }
    return { success: true };
  }
};
```

### Component Enhancement Strategy
- **Reuse CanvasEditor**: Enhance with platform constraints and validation
- **Extend ProductAssetManager**: Add platform recommendation features
- **Leverage TemplateSelector**: Create platform-specific templates
- **Enhance DesignControls**: Add platform-specific design options

## Success Metrics & KPIs

### User Experience Metrics
- **Campaign Creation Time**: Target 50% reduction from current flow
- **Completion Rate**: Target 85%+ campaign completion rate
- **User Satisfaction**: Target 4.5/5 rating on new flow
- **Error Rate**: Target <5% error rate during campaign creation

### Technical Performance
- **Component Reusability**: Target 80% component reuse
- **Load Time**: Target <2s initial load, <1s navigation
- **Memory Usage**: Target <100MB peak memory usage
- **API Response Time**: Target <500ms for platform operations

### Business Impact
- **Multi-Platform Adoption**: Track % of campaigns using multiple platforms
- **Campaign Performance**: Monitor CTR/conversion improvements
- **Platform Coverage**: Track distribution across Meta/Display/CTV/TikTok
- **User Retention**: Monitor DAU/WAU improvements

## Risk Mitigation

### Technical Risks
- **Legacy Compatibility**: Maintain parallel systems during transition
- **Performance Impact**: Incremental loading and code splitting
- **Data Migration**: Automated conversion between legacy and V2 formats

### User Experience Risks  
- **Learning Curve**: Comprehensive onboarding and documentation
- **Feature Parity**: Ensure V2 has all critical legacy features
- **Fallback Options**: Easy switching between flows

### Business Risks
- **Platform Dependencies**: Mock services for development, gradual real integration
- **Scalability**: Modular architecture supporting additional platforms
- **Maintenance**: Clear separation of concerns and comprehensive testing

This comprehensive plan provides a roadmap for creating a professional, platform-aware campaign creation system that builds upon existing infrastructure while introducing modern advertising workflows.
- Feature flag to toggle between flows
- Maintain full backward compatibility

### Phase 2: Beta Testing
- Gradual rollout to select users
- A/B testing between flows
- Feedback collection and iteration

### Phase 3: Full Migration
- Default to new flow
- Legacy flow as fallback
- Gradual deprecation

## Success Metrics

### User Experience
- 50% reduction in campaign creation time
- Increased completion rates
- Higher user satisfaction

### Technical Metrics
- 80% component reuse
- 30% performance improvement
- Better code maintainability

This comprehensive plan provides a roadmap for creating a more professional, platform-aware campaign creation system while preserving existing functionality and ensuring a smooth transition. 