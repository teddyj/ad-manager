import React, { useState, useEffect, useMemo } from 'react';
import { CREATIVE_FORMATS, getFormatsByPlatform, getFormatById } from '../constants/creativeSpecs';
import CanvasCreativeEditor from '../components/CreativeCanvas/CanvasCreativeEditor.jsx';

/**
 * Enhanced Creative Builder Step - Phase 3
 * Fourth step in Campaign Flow V2 with AI-powered creative generation and multi-format support
 */

const CreativeBuilder = ({ 
  data, 
  onDataUpdate, 
  onValidationUpdate, 
  campaignData,
  errors 
}) => {
  const defaultCreativeData = {
    selectedFormats: [],
    creatives: {},
    generationSettings: {
      style: 'modern',
      tone: 'professional',
      includePrice: true,
      includeCTA: true,
      emphasizeFeatures: true
    },
    variations: 3,
    aiGenerated: false
  };

  const [creativeData, setCreativeData] = useState(() => {
    // Ensure all required properties exist by merging with defaults
    const initialData = { ...defaultCreativeData, ...(data || {}) };
    
    // Debug logging for initialization
    console.log('CreativeBuilder initializing with data:', data);
    console.log('Initial selectedFormats:', initialData.selectedFormats);
    
    // Fix any lowercase format IDs that might be in the data
    if (initialData.selectedFormats && Array.isArray(initialData.selectedFormats)) {
      initialData.selectedFormats = initialData.selectedFormats.map(formatId => {
        const upperFormatId = formatId.toUpperCase();
        if (formatId !== upperFormatId) {
          console.warn(`Converting lowercase format ID '${formatId}' to '${upperFormatId}'`);
        }
        return upperFormatId;
      });
    }
    
    // Validate that creatives object exists and has proper structure
    if (initialData.creatives && typeof initialData.creatives === 'object') {
      const newCreatives = {};
      Object.keys(initialData.creatives).forEach(formatId => {
        const creative = initialData.creatives[formatId];
        if (!creative.format || !creative.variations) {
          console.warn('Invalid creative structure detected for format:', formatId);
          return;
        }
        
        // Fix lowercase format IDs in creatives
        const upperFormatId = formatId.toUpperCase();
        if (formatId !== upperFormatId) {
          console.warn(`Converting lowercase creative format ID '${formatId}' to '${upperFormatId}'`);
        }
        newCreatives[upperFormatId] = creative;
      });
      initialData.creatives = newCreatives;
    }
    
    return initialData;
  });

  const [activeTab, setActiveTab] = useState('formats');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [previewFormat, setPreviewFormat] = useState(null);

  // Define validation function first, before it's used
  const validateCreativeData = (data) => {
    const errors = [];
    const warnings = [];
    
    // Early return if no data provided
    if (!data) {
      return {
        valid: false,
        errors: ['No creative data provided'],
        warnings: [],
        formatCount: 0,
        variationCount: 0,
        totalCreatives: 0
      };
    }
    
    if (!data?.selectedFormats || data.selectedFormats.length === 0) {
      errors.push('Select at least one creative format');
    }
    
    if ((data?.selectedFormats?.length || 0) > 0 && !data?.aiGenerated && Object.keys(data?.creatives || {}).length === 0) {
      warnings.push('Generate creatives or upload custom designs (optional - can be done later)');
    }
    
    if ((data?.variations || 0) < 2) {
      warnings.push('Consider generating multiple variations for A/B testing (optional)');
    } else if ((data?.variations || 0) > 5) {
      warnings.push('Too many variations may complicate testing (optional)');
    }
    
    // Check platform compatibility
    const selectedPlatforms = campaignData?.platforms?.selectedPlatforms || [];
    if (data.selectedFormats && Array.isArray(data.selectedFormats)) {
      data.selectedFormats.forEach(formatId => {
        if (!formatId) return; // Skip empty formatIds
        
        const format = getFormatById(formatId);
        if (format && format.platforms && Array.isArray(format.platforms)) {
          const compatiblePlatforms = format.platforms.filter(p => selectedPlatforms.includes(p));
          
          if (compatiblePlatforms.length === 0) {
            warnings.push(`${format.name} format may not be optimal for selected platforms`);
          }
        }
      });
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      formatCount: data?.selectedFormats?.length || 0,
      variationCount: data?.variations || 0,
      totalCreatives: (data?.selectedFormats?.length || 0) * (data?.variations || 0)
    };
  };

  // Memoize validation to prevent unnecessary recalculations
  const currentValidation = useMemo(() => {
    return validateCreativeData(creativeData);
  }, [
    JSON.stringify(creativeData.selectedFormats), 
    creativeData.variations,
    Object.keys(creativeData.creatives || {}).length,
    creativeData.aiGenerated
  ]);

  // Update parent validation when it changes
  useEffect(() => {
    onValidationUpdate(currentValidation);
  }, [currentValidation]);

  // Update parent data only when necessary (not on every creativeData change to avoid loops)
  useEffect(() => {
    onDataUpdate(creativeData);
  }, [
    JSON.stringify(creativeData.selectedFormats), 
    creativeData.variations, 
    JSON.stringify(creativeData.generationSettings), 
    creativeData.aiGenerated,
    Object.keys(creativeData.creatives || {}).length
  ]);

  // Creative styles with platform optimization
  const creativeStyles = [
    {
      value: 'modern',
      label: 'Modern & Clean',
      icon: '✨',
      description: 'Minimalist design with bold typography',
      platforms: ['meta', 'display', 'ctv']
    },
    {
      value: 'vibrant',
      label: 'Vibrant & Bold',
      icon: '🌈',
      description: 'Eye-catching colors and dynamic layouts',
      platforms: ['tiktok', 'meta']
    },
    {
      value: 'elegant',
      label: 'Elegant & Sophisticated',
      icon: '👑',
      description: 'Premium look with refined aesthetics',
      platforms: ['display', 'ctv']
    },
    {
      value: 'playful',
      label: 'Playful & Fun',
      icon: '🎨',
      description: 'Casual and approachable design',
      platforms: ['tiktok', 'meta']
    },
    {
      value: 'professional',
      label: 'Professional & Trustworthy',
      icon: '💼',
      description: 'Business-focused with credible appearance',
      platforms: ['display', 'ctv', 'meta']
    }
  ];

  const creativeTones = [
    { value: 'professional', label: 'Professional', icon: '💼' },
    { value: 'friendly', label: 'Friendly', icon: '😊' },
    { value: 'urgent', label: 'Urgent', icon: '⚡' },
    { value: 'luxury', label: 'Luxury', icon: '✨' },
    { value: 'casual', label: 'Casual', icon: '👋' }
  ];

  // Get recommended formats based on selected platforms
  const getRecommendedFormats = useMemo(() => {
    const selectedPlatforms = campaignData?.platforms?.selectedPlatforms || [];
    
    if (selectedPlatforms.length === 0) {
      return Object.values(CREATIVE_FORMATS);
    }
    
    const formatScores = {};
    
    selectedPlatforms.forEach(platformId => {
      const platformFormats = getFormatsByPlatform(platformId);
      platformFormats.forEach(format => {
        formatScores[format.id] = (formatScores[format.id] || 0) + 1;
      });
    });
    
    return Object.values(CREATIVE_FORMATS)
      .map(format => ({
        ...format,
        score: formatScores[format.id] || 0,
        recommended: (formatScores[format.id] || 0) >= 2
      }))
      .sort((a, b) => b.score - a.score);
  }, [campaignData?.platforms?.selectedPlatforms]);

  // Generate AI-powered creatives
  const generateCreatives = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    
    const productData = campaignData?.product;
    const audienceData = campaignData?.audience;
    const platformData = campaignData?.platforms;
    
    try {
      // Simulate AI generation process
      const steps = [
        'Analyzing product data...',
        'Understanding target audience...',
        'Optimizing for selected platforms...',
        'Generating creative variations...',
        'Applying brand guidelines...',
        'Finalizing creatives...'
      ];
      
      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setGenerationProgress(((i + 1) / steps.length) * 100);
      }
      
      // Generate creatives for each selected format
      const newCreatives = {};
      
      (creativeData?.selectedFormats || []).forEach(formatId => {
        console.log('Looking for format ID:', formatId);
        const format = getFormatById(formatId);
        
        if (!format) {
          console.error('Format not found for ID:', formatId);
          console.log('Available format IDs:', Object.values(CREATIVE_FORMATS).map(f => f.id));
          console.log('Selected formats array:', creativeData?.selectedFormats);
          return;
        }
        
        const variations = [];
        
        for (let i = 0; i < creativeData.variations; i++) {
          const creative = generateCreativeVariation(format, productData, audienceData, platformData, i);
          if (creative) {
            variations.push(creative);
          }
        }
        
        if (variations.length > 0) {
          newCreatives[formatId] = {
            format,
            variations,
            selectedVariation: 0
          };
        }
      });
      
      setCreativeData(prev => ({
        ...prev,
        creatives: newCreatives,
        aiGenerated: true
      }));
      
      // Auto-switch to preview tab and set preview format
      if (Object.keys(newCreatives).length > 0) {
        const firstFormatId = Object.keys(newCreatives)[0];
        setPreviewFormat(firstFormatId);
        setActiveTab('preview');
        console.log('✅ Generated creatives for formats:', Object.keys(newCreatives));
        console.log('✅ Auto-switched to preview tab');
      }
      
    } catch (error) {
      console.error('Creative generation failed:', error);
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  // Generate a single creative variation
  const generateCreativeVariation = (format, productData, audienceData, platformData, index) => {
    if (!format) {
      console.error('generateCreativeVariation called with undefined format');
      return null;
    }
    
    if (!format.id || !format.name || !format.width || !format.height) {
      console.error('Invalid format object structure:', format);
      return null;
    }
    
    const styles = ['A', 'B', 'C'];
    const currentStyle = styles[index] || 'A';
    
    // Generate headlines based on product and audience
    const headlines = generateHeadlines(productData, audienceData, index);
    const descriptions = generateDescriptions(productData, audienceData, index);
    const ctas = generateCTAs(platformData?.campaignObjective, index);
    
    // Default to saved product data from Product Selection step
    const savedProduct = campaignData?.product || {};
    const productImages = productData?.images || savedProduct?.images || [];
    const productUrl = productData?.url || savedProduct?.url || '';
    const productName = productData?.name || savedProduct?.name || 'Our Product';
    const productBrand = productData?.brand || savedProduct?.brand || '';
    
    // Log when defaulting to saved product data
    if (!productData?.name && savedProduct?.name) {
      console.log('✅ Using saved product name:', savedProduct.name);
    }
    if (!productData?.brand && savedProduct?.brand) {
      console.log('✅ Using saved product brand:', savedProduct.brand);
    }
    if (!productData?.images && savedProduct?.images?.length > 0) {
      console.log('✅ Using saved product images:', savedProduct.images.length, 'images');
    }
    
    // Select product image for this variation (cycle through available images)
    const selectedImage = productImages.length > 0 
      ? productImages[index % productImages.length] 
      : null;
    
    // Generate canvas-compatible creative structure
    const backgroundColor = getBackgroundColor(creativeData.generationSettings.style, index);
    const textColor = getTextColor(creativeData.generationSettings.style, index);
    
    // Canvas element structure for this creative
    const canvasElements = generateCanvasElements(format, {
      headline: headlines[0],
      description: descriptions[0],
      cta: ctas[0],
      productImage: selectedImage,
      productUrl,
      productName,
      productBrand,
      backgroundColor,
      textColor,
      style: creativeData.generationSettings.style
    });
    
    return {
      id: `${format.id}_${currentStyle}`,
      name: `${format.name} - Style ${currentStyle}`,
      style: currentStyle,
      format: format,
      // Legacy structure for compatibility
      elements: {
        headline: headlines[0],
        description: descriptions[0],
        cta: ctas[0],
        productImage: selectedImage,
        productImages: productImages,
        productUrl: productUrl,
        productName: productName,
        productBrand: productBrand,
        backgroundColor,
        textColor
      },
      // New canvas structure
      canvasState: {
        meta: {
          adSize: `${format.width}x${format.height}`,
          format: format.id,
          template: `${creativeData.generationSettings.style}_${index}`,
          backgroundColor
        },
        elements: canvasElements,
        history: {
          past: [],
          future: []
        }
      },
      alternatives: {
        headlines: headlines.slice(1),
        descriptions: descriptions.slice(1),
        ctas: ctas.slice(1)
      },
      performance: {
        estimatedCTR: (Math.random() * 2 + 1).toFixed(2),
        estimatedCPC: (Math.random() * 0.5 + 0.3).toFixed(2),
        brandSafety: Math.floor(Math.random() * 20) + 80
      },
      // Canvas editing capabilities
      canvasEnabled: true,
      lastEdited: new Date().toISOString()
    };
  };

  // Generate canvas elements for the creative
  const generateCanvasElements = (format, content) => {
    // Ensure format has required properties
    if (!format || !format.width || !format.height) {
      console.error('Invalid format provided to generateCanvasElements:', format);
      return [];
    }
    const { width, height } = format;
    const elements = [];
    
    // Background element
    elements.push({
      id: 'background-1',
      type: 'background',
      position: { x: 0, y: 0 },
      size: { width, height },
      zIndex: 0,
      styles: {
        backgroundColor: content.backgroundColor,
        backgroundImage: content.productImage ? `url(${content.productImage})` : null,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      },
      interactive: false,
      locked: false
    });
    
    // Product image element (if separate from background)
    if (content.productImage && format.platforms.includes('meta')) {
      const imageSize = Math.min(width * 0.4, height * 0.4);
      elements.push({
        id: 'product-image-1',
        type: 'image',
        content: content.productImage,
        position: { 
          x: (width - imageSize) / 2, 
          y: height * 0.1 
        },
        size: { width: imageSize, height: imageSize },
        zIndex: 1,
        styles: {
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        },
        interactive: true,
        locked: false
      });
    }
    
    // Headline element
    const headlineY = content.productImage ? height * 0.55 : height * 0.2;
    elements.push({
      id: 'headline-1',
      type: 'text',
      content: content.headline,
      position: { x: width * 0.05, y: headlineY },
      size: { width: width * 0.9, height: height * 0.15 },
      zIndex: 2,
      styles: {
        fontSize: getFontSize(width, 'headline'),
        fontWeight: 'bold',
        color: content.textColor,
        textAlign: 'center',
        fontFamily: getStyleFont(content.style),
        lineHeight: '1.2'
      },
      interactive: true,
      locked: false
    });
    
    // Description element
    const descY = headlineY + (height * 0.18);
    elements.push({
      id: 'description-1',
      type: 'text',
      content: content.description,
      position: { x: width * 0.05, y: descY },
      size: { width: width * 0.9, height: height * 0.2 },
      zIndex: 2,
      styles: {
        fontSize: getFontSize(width, 'body'),
        fontWeight: 'normal',
        color: content.textColor,
        textAlign: 'center',
        fontFamily: getStyleFont(content.style),
        lineHeight: '1.4',
        opacity: 0.9
      },
      interactive: true,
      locked: false
    });
    
    // CTA Button element
    const ctaWidth = Math.min(width * 0.4, 120);
    const ctaHeight = Math.min(height * 0.08, 40);
    elements.push({
      id: 'cta-button-1',
      type: 'button',
      content: content.cta,
      position: { 
        x: (width - ctaWidth) / 2, 
        y: height - (height * 0.15) 
      },
      size: { width: ctaWidth, height: ctaHeight },
      zIndex: 3,
      styles: {
        backgroundColor: getCtaColor(content.style),
        color: '#ffffff',
        fontSize: getFontSize(width, 'button'),
        fontWeight: 'bold',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontFamily: getStyleFont(content.style)
      },
      interactive: true,
      locked: false
    });
    
    return elements;
  };

  // Helper functions for canvas generation
  const getFontSize = (canvasWidth, elementType) => {
    const baseSize = canvasWidth / 20; // Base font size relative to canvas width
    const multipliers = {
      headline: 1.4,
      body: 0.8,
      button: 0.9
    };
    return `${Math.round(baseSize * multipliers[elementType])}px`;
  };

  const getStyleFont = (style) => {
    const fonts = {
      modern: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      vibrant: '"Comic Sans MS", cursive, sans-serif',
      elegant: '"Playfair Display", Georgia, serif',
      playful: '"Fredoka One", cursive, sans-serif',
      professional: '"Inter", "Helvetica Neue", Arial, sans-serif'
    };
    return fonts[style] || fonts.professional;
  };

  const getCtaColor = (style) => {
    const colors = {
      modern: '#007bff',
      vibrant: '#ff6b6b',
      elegant: '#2d3748',
      playful: '#ffd93d',
      professional: '#2b6cb0'
    };
    return colors[style] || colors.professional;
  };

  // Generate smart headlines
  const generateHeadlines = (productData, audienceData, variation) => {
    // Default to saved product data from Product Selection step
    const productName = productData?.name || campaignData?.product?.name || 'Our Product';
    const brand = productData?.brand || campaignData?.product?.brand || '';
    const category = productData?.category || campaignData?.product?.category || 'product';
    const price = productData?.price || campaignData?.product?.price;
    
    // Log when defaulting to saved data in headlines for debugging
    if (!productData?.name && campaignData?.product?.name) {
      console.log('📝 Headlines using saved product name:', campaignData.product.name);
    }
    if (!productData?.brand && campaignData?.product?.brand) {
      console.log('📝 Headlines using saved product brand:', campaignData.product.brand);
    }
    
    // Use brand in headlines when available
    const brandedName = brand && brand !== productName ? `${brand} ${productName}` : productName;
    
    const templates = [
      [`Discover ${brandedName}`, `New ${productName} Available`, `${brandedName} - Limited Time`],
      [`Transform Your ${productName} Experience`, `Upgrade Your ${productName} Experience`, `Premium ${productName} Solution`],
      [`${audienceData?.demographics?.age?.[0] < 30 ? 'Trendy' : 'Quality'} ${productName}`, `${brandedName} That Works`, `Why Choose ${brandedName}?`]
    ];
    
    const selectedTemplate = templates[variation] || templates[0];
    
    if (price && creativeData.generationSettings.includePrice) {
      selectedTemplate.push(`${brandedName} - From $${price}`);
    }
    
    return selectedTemplate;
  };

  // Generate smart descriptions
  const generateDescriptions = (productData, audienceData, variation) => {
    // Default to saved product data from Product Selection step
    const productName = productData?.name || campaignData?.product?.name || 'our product';
    const brand = productData?.brand || campaignData?.product?.brand || '';
    const description = productData?.description || campaignData?.product?.description || 'amazing features';
    const category = productData?.category || campaignData?.product?.category || '';
    
    // Use brand in descriptions when available
    const brandedName = brand && brand !== productName ? `${brand} ${productName}` : productName;
    
    // Log category usage in descriptions
    console.log('🏷️ CreativeBuilder category for descriptions:', category);
    
    // Enhance description with category context
    const enhancedDescription = category && description !== 'amazing features' 
      ? `${description}. Perfect for ${category} enthusiasts.`
      : description;
      
    console.log('📝 Enhanced description with category:', enhancedDescription);
    
    const templates = [
      [
        `Experience the best ${productName} with ${enhancedDescription} Perfect for your lifestyle.`,
        `Get ${brandedName} and discover why thousands love it. ${enhancedDescription}`,
        `${brandedName} - designed for people who value quality. ${enhancedDescription}`
      ],
      [
        `Join the community loving ${productName}. ${enhancedDescription} and more.`,
        `Upgrade your experience with ${brandedName}. ${enhancedDescription}`,
        `${brandedName} brings you ${enhancedDescription} in one package.`
      ],
      [
        `Don't miss out on ${productName}. ${enhancedDescription} awaits you.`,
        `${brandedName} - the smart choice. ${enhancedDescription}`,
        `Experience ${brandedName} today. ${enhancedDescription} guaranteed.`
      ]
    ];
    
    return templates[variation] || templates[0];
  };

  // Generate smart CTAs
  const generateCTAs = (objective, variation) => {
    const ctasByObjective = {
      awareness: ['Learn More', 'Discover Now', 'See Details'],
      traffic: ['Visit Now', 'Explore', 'Check It Out'],
      conversions: ['Buy Now', 'Get Yours', 'Shop Today'],
      engagement: ['Join Us', 'Get Started', 'Try Now'],
      app_installs: ['Download', 'Install Now', 'Get App']
    };
    
    const baseCTAs = ctasByObjective[objective] || ctasByObjective.awareness;
    const variations = [baseCTAs, ['Start Today', 'Act Now', 'Limited Time'], ['Save Now', 'Get Deal', 'Special Offer']];
    
    return variations[variation] || baseCTAs;
  };

  // Get background color based on style
  const getBackgroundColor = (style, variation) => {
    const colorSchemes = {
      modern: ['#ffffff', '#f8fafc', '#e2e8f0'],
      vibrant: ['#ff6b6b', '#4ecdc4', '#45b7d1'],
      elegant: ['#2d3748', '#4a5568', '#718096'],
      playful: ['#ffd93d', '#6bcf7f', '#ff8a95'],
      professional: ['#2b6cb0', '#3182ce', '#4299e1']
    };
    
    const colors = colorSchemes[style] || colorSchemes.modern;
    return colors[variation] || colors[0];
  };

  // Get text color based on style
  const getTextColor = (style, variation) => {
    const lightBackgrounds = ['modern', 'playful'];
    return lightBackgrounds.includes(style) ? '#1a202c' : '#ffffff';
  };

  // Enhanced validation
  // The validateCreativeData function has been moved above and the redundant useEffect has been replaced with useMemo

  // Handle creative data updates
  const handleCreativeUpdate = (updates) => {
    const newData = { ...creativeData, ...updates };
    setCreativeData(newData);
    onDataUpdate(newData);
  };

  // Toggle format selection
  const toggleFormat = (formatId) => {
    const currentSelected = creativeData?.selectedFormats || [];
    const newSelected = currentSelected.includes(formatId)
      ? currentSelected.filter(id => id !== formatId)
      : [...currentSelected, formatId];
    
    handleCreativeUpdate({ selectedFormats: newSelected });
  };

  // Update generation settings
  const updateGenerationSettings = (updates) => {
    const newSettings = { ...creativeData.generationSettings, ...updates };
    handleCreativeUpdate({ generationSettings: newSettings });
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Creative Builder Header */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Creative Builder</h3>
            <p className="text-sm text-gray-500 mt-1">Generate AI-powered creatives for your campaign</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Formats</p>
              <span className="text-2xl font-bold text-blue-600">
                {creativeData?.selectedFormats?.length || 0}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Variations</p>
              <span className="text-2xl font-bold text-purple-600">
                {creativeData?.variations || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'formats', name: 'Format Selection', icon: '📐' },
              { id: 'settings', name: 'AI Settings', icon: '🤖' },
              { id: 'generate', name: 'Generate', icon: '✨' },
              { id: 'preview', name: 'Preview', icon: '👁️' },
              { id: 'canvas', name: 'Canvas Editor', icon: '🎨' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'formats' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Creative Formats</h4>
              <p className="text-sm text-gray-500">
                {creativeData?.selectedFormats?.length || 0} of {getRecommendedFormats.length} selected
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {getRecommendedFormats.map((format) => {
                const isSelected = (creativeData?.selectedFormats || []).includes(format.id);
                const isRecommended = format.recommended;
                
                return (
                  <div
                    key={format.id}
                    className={`relative border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleFormat(format.id)}
                  >
                    {isRecommended && (
                      <div className="absolute top-2 right-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Recommended
                      </div>
                    )}
                    
                    <div className="text-center">
                      <div className="mx-auto mb-3 w-16 h-12 bg-gray-100 rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <span className="text-xs text-gray-500 transform -rotate-90">
                          {format.width}×{format.height}
                        </span>
                      </div>
                      
                      <h5 className="font-medium text-gray-900">{format.name}</h5>
                      <p className="text-sm text-gray-500 mt-1">{format.description}</p>
                      
                      <div className="mt-3 space-y-2">
                        <div className="text-xs text-gray-600">
                          {format.width} × {format.height}px
                        </div>
                        
                        <div className="flex flex-wrap gap-1 justify-center">
                          {(format.platforms || []).slice(0, 3).map(platform => (
                            <span key={platform} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                              {platform.toUpperCase()}
                            </span>
                          ))}
                          {(format.platforms || []).length > 3 && (
                            <span className="text-xs text-gray-400">
                              +{(format.platforms || []).length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {isSelected && (
                      <div className="absolute top-2 left-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Quick Selection */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-800 mb-3">Quick Selection</h5>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleCreativeUpdate({ selectedFormats: ['square', 'landscape'] })}
                  className="px-3 py-2 bg-white border rounded-md text-sm hover:bg-gray-50"
                >
                  Social Media
                </button>
                <button
                  onClick={() => handleCreativeUpdate({ selectedFormats: ['landscape', 'leaderboard'] })}
                  className="px-3 py-2 bg-white border rounded-md text-sm hover:bg-gray-50"
                >
                  Display Ads
                </button>
                <button
                  onClick={() => handleCreativeUpdate({ selectedFormats: getRecommendedFormats.filter(f => f.recommended).map(f => f.id) })}
                  className="px-3 py-2 bg-blue-100 border border-blue-200 rounded-md text-sm text-blue-700 hover:bg-blue-200"
                >
                  All Recommended
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Creative Style */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Creative Style *
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {creativeStyles.map(style => (
                  <label
                    key={style.value}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                      creativeData.generationSettings.style === style.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      value={style.value}
                      checked={creativeData.generationSettings.style === style.value}
                      onChange={(e) => updateGenerationSettings({ style: e.target.value })}
                      className="sr-only"
                    />
                    <span className="text-2xl mr-3">{style.icon}</span>
                    <div>
                      <p className="font-medium text-gray-900">{style.label}</p>
                      <p className="text-sm text-gray-500">{style.description}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {(style.platforms || []).map(platform => (
                          <span key={platform} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            {platform.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Creative Tone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Creative Tone
              </label>
              <div className="flex flex-wrap gap-2">
                {creativeTones.map(tone => (
                  <button
                    key={tone.value}
                    onClick={() => updateGenerationSettings({ tone: tone.value })}
                    className={`flex items-center px-4 py-2 border rounded-lg text-sm transition-colors ${
                      creativeData.generationSettings.tone === tone.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="mr-2">{tone.icon}</span>
                    {tone.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generation Options */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="variations" className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Variations
                </label>
                <input
                  type="range"
                  id="variations"
                  min="1"
                  max="5"
                  value={creativeData.variations}
                  onChange={(e) => handleCreativeUpdate({ variations: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span className="font-medium">{creativeData.variations} variations</span>
                  <span>5</span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Include Elements
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={creativeData.generationSettings.includePrice}
                      onChange={(e) => updateGenerationSettings({ includePrice: e.target.checked })}
                      className="mr-2 text-blue-600"
                    />
                    <span className="text-sm">Include pricing</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={creativeData.generationSettings.includeCTA}
                      onChange={(e) => updateGenerationSettings({ includeCTA: e.target.checked })}
                      className="mr-2 text-blue-600"
                    />
                    <span className="text-sm">Include call-to-action</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={creativeData.generationSettings.emphasizeFeatures}
                      onChange={(e) => updateGenerationSettings({ emphasizeFeatures: e.target.checked })}
                      className="mr-2 text-blue-600"
                    />
                    <span className="text-sm">Emphasize product features</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'generate' && (
          <div className="space-y-6">
            {(creativeData?.selectedFormats?.length || 0) === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <span className="text-4xl block mb-2">📐</span>
                <p>Select creative formats first to generate designs</p>
              </div>
            ) : (
              <>
                {/* Generation Summary */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-medium text-gray-800 mb-4">Generation Summary</h4>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="text-center p-3 bg-white rounded-md border">
                      <p className="text-2xl font-bold text-blue-600">{creativeData?.selectedFormats?.length || 0}</p>
                      <p className="text-sm text-gray-600">Formats</p>
                    </div>
                    
                    <div className="text-center p-3 bg-white rounded-md border">
                      <p className="text-2xl font-bold text-purple-600">{creativeData.variations}</p>
                      <p className="text-sm text-gray-600">Variations Each</p>
                    </div>
                    
                    <div className="text-center p-3 bg-white rounded-md border">
                      <p className="text-2xl font-bold text-green-600">
                        {(creativeData?.selectedFormats?.length || 0) * (creativeData?.variations || 0)}
                      </p>
                      <p className="text-sm text-gray-600">Total Creatives</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
                    <p className="text-sm text-blue-700">
                      <span className="font-medium">Style:</span> {creativeStyles.find(s => s.value === creativeData.generationSettings.style)?.label} • 
                      <span className="font-medium ml-2">Tone:</span> {creativeTones.find(t => t.value === creativeData.generationSettings.tone)?.label}
                    </p>
                  </div>
                </div>

                {/* Generate Button */}
                <div className="text-center">
                  <button
                    onClick={generateCreatives}
                    disabled={isGenerating}
                    className={`inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg shadow-sm text-white transition-colors ${
                      isGenerating
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
                    }`}
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                        Generating Creatives...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">✨</span>
                        Generate AI Creatives
                      </>
                    )}
                  </button>
                  
                  {isGenerating && (
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${generationProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        {Math.round(generationProgress)}% complete
                      </p>
                    </div>
                  )}
                </div>

                {/* AI Insights */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-medium text-blue-800 mb-3">🤖 AI Generation Insights</h5>
                  <div className="space-y-2 text-sm text-blue-700">
                    <p>• Optimizing for {campaignData?.platforms?.selectedPlatforms?.length || 0} selected platforms</p>
                    <p>• Using {campaignData?.product?.category || 'product'} category best practices</p>
                    <p>• Targeting {campaignData?.audience?.demographics?.age ? `${campaignData.audience.demographics.age[0]}-${campaignData.audience.demographics.age[1]} age group` : 'broad audience'}</p>
                    <p>• Applying {creativeData.generationSettings.style} design style with {creativeData.generationSettings.tone} tone</p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="space-y-6">
            {Object.keys(creativeData.creatives).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <span className="text-4xl block mb-2">👁️</span>
                <p>Generate creatives first to preview them here</p>
              </div>
            ) : (
              <>
                {/* Format Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Preview Format
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(creativeData.creatives).map(formatId => {
                      const format = creativeData.creatives[formatId]?.format;
                      if (!format) {
                        console.warn('Missing format for creative:', formatId);
                        return null;
                      }
                      return (
                        <button
                          key={formatId}
                          onClick={() => setPreviewFormat(formatId)}
                          className={`px-3 py-2 border rounded-md text-sm transition-colors ${
                            previewFormat === formatId
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {format.name}
                        </button>
                      );
                    }).filter(Boolean)}
                  </div>
                </div>

                {/* Creative Preview */}
                {previewFormat && creativeData.creatives[previewFormat] && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">
                      {creativeData.creatives[previewFormat].format.name} Variations
                    </h4>
                    
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {creativeData.creatives[previewFormat].variations.map((creative, index) => (
                        <div key={creative.id} className="border rounded-lg p-4 bg-white">
                          <div className="aspect-video bg-gray-100 rounded-md mb-3 p-4 flex flex-col justify-between"
                               style={{ backgroundColor: creative.elements.backgroundColor, color: creative.elements.textColor }}>
                            <div>
                              <h5 className="font-bold text-lg mb-2">{creative.elements.headline}</h5>
                              <p className="text-sm opacity-90">{creative.elements.description}</p>
                            </div>
                            <div className="text-right">
                              <span className="inline-block bg-white bg-opacity-20 px-3 py-1 rounded text-sm font-medium">
                                {creative.elements.cta}
                              </span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Est. CTR:</span>
                              <span className="font-medium text-green-600">{creative.performance.estimatedCTR}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Est. CPC:</span>
                              <span className="font-medium text-blue-600">${creative.performance.estimatedCPC}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Brand Safety:</span>
                              <span className="font-medium text-purple-600">{creative.performance.brandSafety}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'canvas' && (
          <div className="space-y-6">
            {Object.keys(creativeData.creatives).length === 0 ? (
              <div className="space-y-6">
                <div className="text-center py-8 text-gray-500">
                  <span className="text-4xl block mb-2">🎨</span>
                  <p>Generate creatives first to edit them in the canvas editor</p>
                  <p className="text-sm mt-2">You can customize text, images, layout, and styling</p>
                </div>
                
                {/* Demo Creative Button for Testing */}
                <div className="text-center">
                  <button
                    onClick={() => {
                      try {
                        // Create a demo creative for testing
                        const demoFormat = getFormatById('square');
                        console.log('Demo format retrieved:', demoFormat);
                        
                        if (!demoFormat) {
                          console.error('Square format not found');
                          console.log('Available format IDs:', Object.values(CREATIVE_FORMATS).map(f => f.id));
                          alert('Error: Cannot find square format definition');
                          return;
                        }
                        
                        console.log('Generating demo creative...');
                        // Use real product data if available, otherwise use enhanced demo data
                        const demoProductData = campaignData?.product || { 
                          name: 'Premium Wireless Headphones', 
                          brand: 'TechPro',
                          description: 'Experience crystal-clear audio with our latest wireless technology. Perfect for music lovers and professionals.',
                          category: 'electronics',
                          price: '199',
                          url: 'https://example.com/headphones',
                          images: ['https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400']
                        };
                        
                        const demoCreative = generateCreativeVariation(demoFormat, 
                          demoProductData, 
                          campaignData?.audience || { demographics: { age: [25, 45] } }, 
                          campaignData?.platforms || { campaignObjective: 'conversions' }, 
                          0);
                        
                        if (!demoCreative) {
                          console.error('Failed to generate demo creative');
                          alert('Error: Failed to generate demo creative');
                          return;
                        }
                        
                        console.log('Demo creative generated:', demoCreative);
                        
                        const newCreatives = {
                          [demoFormat.id]: {
                            format: demoFormat,
                            variations: [demoCreative],
                            selectedVariation: 0
                          }
                        };
                        
                        handleCreativeUpdate({ 
                          creatives: newCreatives, 
                          selectedFormats: [demoFormat.id],
                          aiGenerated: true 
                        });
                        setPreviewFormat(demoFormat.id);
                        
                        console.log('Demo creative setup complete!');
                      } catch (error) {
                        console.error('Error creating demo creative:', error);
                        alert('Error creating demo creative: ' + error.message);
                      }
                    }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    🚀 Create Demo Creative for Testing
                  </button>
                  <p className="text-sm text-gray-500 mt-2">
                    This will create a sample creative so you can test the canvas editor
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Canvas Editor Introduction */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">🎨 Canvas Editor</h4>
                  <p className="text-sm text-blue-700">
                    Use the canvas editor to customize your generated creatives. You can modify text, 
                    reposition elements, change colors, and fine-tune the design for each format.
                  </p>
                </div>

                {/* Format Selector for Canvas Editing */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Format to Edit
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(creativeData.creatives).map(formatId => {
                      const format = creativeData.creatives[formatId]?.format;
                      if (!format) {
                        console.warn('Missing format for creative in canvas editor:', formatId);
                        return null;
                      }
                      return (
                        <button
                          key={formatId}
                          onClick={() => setPreviewFormat(formatId)}
                          className={`px-4 py-2 border rounded-lg text-sm transition-colors ${
                            previewFormat === formatId
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className="mr-2">{format.icon}</span>
                          {format.name}
                          <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                            {format.dimensions}
                          </span>
                        </button>
                      );
                    }).filter(Boolean)}
                  </div>
                </div>

                {/* Canvas Editor Interface */}
                {previewFormat && creativeData.creatives[previewFormat] && (
                  <div className="space-y-6">
                    {/* Variation Selector */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Select Variation to Edit
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {creativeData.creatives[previewFormat].variations.map((creative, index) => (
                          <button
                            key={creative.id}
                            onClick={() => {
                              const updatedCreatives = { ...creativeData.creatives };
                              updatedCreatives[previewFormat].selectedVariation = index;
                              handleCreativeUpdate({ creatives: updatedCreatives });
                            }}
                            className={`px-3 py-2 border rounded-md text-sm transition-colors ${
                              creativeData.creatives[previewFormat].selectedVariation === index
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            Style {creative.style}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Canvas Editor Component */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <CanvasCreativeEditor
                        creative={creativeData.creatives[previewFormat].variations[creativeData.creatives[previewFormat].selectedVariation]}
                        format={creativeData.creatives[previewFormat].format}
                        onCreativeUpdate={(updatedCreative) => {
                          const updatedCreatives = { ...creativeData.creatives };
                          const selectedVariation = updatedCreatives[previewFormat].selectedVariation;
                          updatedCreatives[previewFormat].variations[selectedVariation] = updatedCreative;
                          handleCreativeUpdate({ creatives: updatedCreatives });
                        }}
                        readonly={false}
                        className="w-full"
                      />
                    </div>

                    {/* Canvas Editor Tips */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-medium text-gray-800 mb-3">💡 Canvas Editor Tips</h5>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-sm text-gray-600">
                        <div className="flex items-start space-x-2">
                          <span className="text-blue-500">•</span>
                          <span>Click "Edit" to enter canvas editing mode</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-blue-500">•</span>
                          <span>Drag elements to reposition them</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-blue-500">•</span>
                          <span>Double-click text to edit content</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-blue-500">•</span>
                          <span>Use scale controls to fit the canvas</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-blue-500">•</span>
                          <span>Changes are automatically saved</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-blue-500">•</span>
                          <span>Use "Preview" to see final result</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Error Display */}
      {errors && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-700">{errors}</p>
        </div>
      )}
    </div>
  );
};

export default CreativeBuilder; 