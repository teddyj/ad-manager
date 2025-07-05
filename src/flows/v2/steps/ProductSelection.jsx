import React, { useState, useEffect, useMemo } from 'react';
import ProductAssetManager from '../../../components/ProductAssetManager';
import { PLATFORMS } from '../constants/platforms';

/**
 * Enhanced Product Selection Step - Phase 2
 * First step in Campaign Flow V2 with platform intelligence and smart recommendations
 */

const ProductSelection = ({ 
  data, 
  onDataUpdate, 
  onValidationUpdate, 
  onCampaignUpdate,
  errors,
  dbOperations 
}) => {
  // State for product selection mode
  const [selectionMode, setSelectionMode] = useState('existing'); // 'existing' or 'new'
  const [existingProducts, setExistingProducts] = useState([]);
  const [selectedExistingProductId, setSelectedExistingProductId] = useState('');
  
  const [productData, setProductData] = useState(data || {
    name: '',
    description: '',
    category: '',
    images: [],
    url: '',
    price: '',
    brand: '',
    tags: [],
    targetDemographic: '',
    seasonality: '',
    priceRange: 'mid'
  });

  const [products, setProducts] = useState(Array.isArray(productData.images) ? productData.images.filter(Boolean) : []);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState(null);

  // Load existing products on component mount
  useEffect(() => {
    console.log('🔄 ProductSelection useEffect triggered');
    console.log('🔧 dbOperations available:', !!dbOperations);
    console.log('📋 Initial data received:', data);
    
    if (dbOperations) {
      try {
        const loadedProducts = dbOperations.getProducts();
        console.log('📦 Loaded products from dbOperations:', loadedProducts);
        console.log('📊 Number of products loaded:', loadedProducts.length);
        
        setExistingProducts(loadedProducts);
        
        // If we have existing product data (from campaign editing), set it up
        if (data && data.name) {
          console.log('🔄 Setting up existing product data for editing');
          console.log('📋 Product data details:', {
            name: data.name,
            category: data.category,
            url: data.url,
            brand: data.brand,
            price: data.price,
            description: data.description,
            hasImages: !!data.images && data.images.length > 0,
            imageCount: data.images?.length || 0
          });
          
          // Set to edit mode for existing product
          setSelectionMode('existing');
          setProductData(data);
          
          // Convert images if available
          if (data.images && data.images.length > 0) {
            convertImagesToProductAssets(data.images, data.name, data.id || 'existing').then(convertedAssets => {
              setProducts(convertedAssets);
            });
          }
          
          // Try to find matching product ID if available
          if (data.id) {
            const matchingProduct = loadedProducts.find(p => p.id === data.id);
            if (matchingProduct) {
              setSelectedExistingProductId(data.id);
              console.log('✅ Found matching product in library:', matchingProduct.name);
            }
          }
        } else if (loadedProducts.length > 0 && !data?.name) {
          console.log('🎯 Setting mode to existing (products available, no current data)');
          setSelectionMode('existing');
        } else {
          console.log('🔄 No products available, staying in current mode:', selectionMode);
        }
      } catch (error) {
        console.error('❌ Error loading products:', error);
        setExistingProducts([]);
      }
    } else {
      console.warn('⚠️ dbOperations not available');
    }
  }, [dbOperations, data]);

  // Enhanced product categories with platform mapping
  const productCategories = [
    { value: 'fashion', label: 'Fashion & Apparel', platforms: ['meta', 'tiktok'], icon: '👕' },
    { value: 'electronics', label: 'Electronics', platforms: ['display', 'ctv'], icon: '📱' },
    { value: 'home', label: 'Home & Garden', platforms: ['meta', 'display'], icon: '🏠' },
    { value: 'health', label: 'Health & Beauty', platforms: ['meta', 'tiktok'], icon: '💄' },
    { value: 'food', label: 'Food & Beverage', platforms: ['meta', 'display', 'ctv'], icon: '🍕' },
    { value: 'dairy_alternatives', label: 'Dairy & Alternatives', platforms: ['meta', 'display'], icon: '🥛' },
    { value: 'beverages', label: 'Beverages', platforms: ['meta', 'display', 'ctv'], icon: '🥤' },
    { value: 'snacks', label: 'Snacks', platforms: ['meta', 'tiktok'], icon: '🍿' },
    { value: 'pantry_staples', label: 'Pantry Staples', platforms: ['meta', 'display'], icon: '🥫' },
    { value: 'fresh_produce', label: 'Fresh Produce', platforms: ['meta', 'display'], icon: '🥬' },
    { value: 'frozen_foods', label: 'Frozen Foods', platforms: ['meta', 'display'], icon: '🧊' },
    { value: 'health_wellness', label: 'Health & Wellness', platforms: ['meta', 'tiktok'], icon: '💊' },
    { value: 'sports', label: 'Sports & Recreation', platforms: ['meta', 'tiktok'], icon: '⚽' },
    { value: 'toys', label: 'Toys & Games', platforms: ['meta', 'ctv'], icon: '🎮' },
    { value: 'automotive', label: 'Automotive', platforms: ['display', 'ctv'], icon: '🚗' },
    { value: 'books', label: 'Books & Media', platforms: ['display', 'meta'], icon: '📚' },
    { value: 'travel', label: 'Travel & Tourism', platforms: ['meta', 'display'], icon: '✈️' },
    { value: 'finance', label: 'Financial Services', platforms: ['display', 'ctv'], icon: '💳' },
    { value: 'other', label: 'Other', platforms: ['meta', 'display'], icon: '📦' }
  ];

  const priceRanges = [
    { value: 'budget', label: 'Budget ($1-25)', platforms: ['meta', 'tiktok'] },
    { value: 'mid', label: 'Mid-range ($26-100)', platforms: ['meta', 'display'] },
    { value: 'premium', label: 'Premium ($101-500)', platforms: ['meta', 'display', 'ctv'] },
    { value: 'luxury', label: 'Luxury ($500+)', platforms: ['display', 'ctv'] }
  ];

  const targetDemographics = [
    { value: 'gen_z', label: 'Gen Z (18-26)', platforms: ['tiktok', 'meta'] },
    { value: 'millennials', label: 'Millennials (27-42)', platforms: ['meta', 'display'] },
    { value: 'gen_x', label: 'Gen X (43-58)', platforms: ['meta', 'display', 'ctv'] },
    { value: 'boomers', label: 'Baby Boomers (59+)', platforms: ['display', 'ctv'] },
    { value: 'all', label: 'All Ages', platforms: ['meta', 'display'] }
  ];

  // Convert existing product images to ProductAssetManager format
  const convertImagesToProductAssets = async (images, productName, productId) => {
    if (!Array.isArray(images) || images.length === 0) {
      return [];
    }

    console.log('🔄 Converting images to product assets:', images);
    
    const convertedAssets = [];
    
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const imageUrl = image.url || image.src || image.originalUrl || image.processedUrl;
      
      if (!imageUrl) {
        console.warn('⚠️ Skipping image without URL:', image);
        continue;
      }

      try {
        // Create a product asset object compatible with ProductAssetManager
        const productAsset = {
          id: image.id || `existing-${productId}-${Date.now()}-${i}`,
          name: image.altText || image.alt || `${productName} - Image ${i + 1}`,
          originalUrl: imageUrl,
          processedUrl: imageUrl, // Use the same URL as processed
          thumbnailUrl: imageUrl, // Use the same URL as thumbnail for now
          variants: [],
          fileSize: image.fileSize || 0,
          fileType: image.fileType || 'image/jpeg',
          dateAdded: image.dateAdded || new Date().toISOString(),
          usageCount: image.usageCount || 0,
          tags: image.tags || [],
          metadata: {
            originalDimensions: image.metadata?.originalDimensions || null,
            dominantColors: image.metadata?.dominantColors || [],
            hasTransparentBackground: image.metadata?.hasTransparentBackground || false,
            processingStatus: 'completed',
            isPrimary: image.isPrimary || false,
            sourceType: 'existing_product'
          }
        };

        // Try to get image dimensions if not available
        if (!productAsset.metadata.originalDimensions) {
          try {
            const img = new Image();
            await new Promise((resolve, reject) => {
              img.onload = () => {
                productAsset.metadata.originalDimensions = {
                  width: img.naturalWidth,
                  height: img.naturalHeight
                };
                resolve();
              };
              img.onerror = reject;
              img.src = imageUrl;
            });
          } catch (error) {
            console.warn('⚠️ Could not load image dimensions for:', imageUrl);
          }
        }

        convertedAssets.push(productAsset);
        console.log('✅ Converted image to product asset:', productAsset);
      } catch (error) {
        console.error('❌ Error converting image to product asset:', error, image);
      }
    }

    console.log('🎯 Final converted assets:', convertedAssets);
    return convertedAssets;
  };

  // Handle existing product selection
  const handleExistingProductSelect = async (productId) => {
    console.log('🔍 Selecting product ID:', productId);
    console.log('📦 Available products:', existingProducts);
    
    setSelectedExistingProductId(productId);
    
    if (productId) {
      const selectedProduct = existingProducts.find(p => p.id === productId);
      console.log('🎯 Found selected product:', selectedProduct);
      
      if (selectedProduct) {
        // Enhanced mapping with better field handling
        const mappedData = {
          id: selectedProduct.id,
          name: selectedProduct.name || '',
          description: selectedProduct.description || '',
          category: selectedProduct.category || '',
          images: Array.isArray(selectedProduct.images) ? selectedProduct.images : [],
          // Enhanced URL mapping - try multiple possible field names
          url: selectedProduct.url || 
               selectedProduct.productUrl || 
               selectedProduct.metadata?.url || 
               selectedProduct.metadata?.productUrl || 
               selectedProduct.settings?.url || '',
          // Enhanced price mapping
          price: selectedProduct.price || 
                 selectedProduct.metadata?.price || 
                 selectedProduct.settings?.price || '',
          brand: selectedProduct.brand || '',
          // Enhanced tags mapping
          tags: Array.isArray(selectedProduct.tags) ? selectedProduct.tags : 
                Array.isArray(selectedProduct.metadata?.tags) ? selectedProduct.metadata.tags : [],
          // Enhanced demographic mapping
          targetDemographic: selectedProduct.targetDemographic || 
                            selectedProduct.metadata?.targetDemographic || 
                            selectedProduct.settings?.targetDemographic || '',
          seasonality: selectedProduct.seasonality || 
                      selectedProduct.metadata?.seasonality || 
                      selectedProduct.settings?.seasonality || '',
          priceRange: selectedProduct.priceRange || 
                     selectedProduct.metadata?.priceRange || 
                     selectedProduct.settings?.priceRange || 'mid'
        };
        
        console.log('✅ Enhanced mapped product data:', mappedData);
        console.log('🏷️ Category mapping:', {
          originalCategory: selectedProduct.category,
          mappedCategory: mappedData.category,
          categoryExists: productCategories.some(c => c.value === mappedData.category)
        });
        console.log('🔗 Enhanced Product URL mapping:', {
          url: selectedProduct.url,
          productUrl: selectedProduct.productUrl,
          metadataUrl: selectedProduct.metadata?.url,
          metadataProductUrl: selectedProduct.metadata?.productUrl,
          settingsUrl: selectedProduct.settings?.url,
          finalUrl: mappedData.url
        });
        console.log('💰 Enhanced Price mapping:', {
          price: selectedProduct.price,
          metadataPrice: selectedProduct.metadata?.price,
          settingsPrice: selectedProduct.settings?.price,
          finalPrice: mappedData.price
        });
        console.log('🖼️ Product Images mapping:', {
          originalImages: selectedProduct.images,
          isArray: Array.isArray(selectedProduct.images),
          imageCount: selectedProduct.images?.length || 0,
          mappedImages: mappedData.images,
          finalImageCount: mappedData.images.length
        });
        
        // Convert images to ProductAssetManager compatible format
        const convertedAssets = await convertImagesToProductAssets(mappedData.images, mappedData.name, mappedData.id);
        
        setProductData(mappedData);
        setProducts(convertedAssets); // Use converted assets instead of raw images
        onDataUpdate(mappedData);
        
        // Log final data for debugging
        console.log('📋 Final product data set in state:', mappedData);
        console.log('🏷️ Category value being passed to parent:', mappedData.category);
        console.log('🔗 URL value being passed to parent:', mappedData.url);
        console.log('🎨 Product assets converted for ProductAssetManager:', convertedAssets);
        
        // Update campaign name
        const campaignName = `${selectedProduct.name} Campaign`;
        onCampaignUpdate({ name: campaignName });
        
        console.log('✅ Selected existing product:', selectedProduct.name);
        console.log('📊 Updated campaign name:', campaignName);
      } else {
        console.error('❌ Product not found with ID:', productId);
      }
    } else {
      // Reset to empty data if no product selected
      console.log('🧹 Resetting product data');
      const emptyData = {
        name: '',
        description: '',
        category: '',
        images: [],
        url: '',
        price: '',
        brand: '',
        tags: [],
        targetDemographic: '',
        seasonality: '',
        priceRange: 'mid'
      };
      setProductData(emptyData);
      setProducts([]);
      onDataUpdate(emptyData);
    }
  };

  // Get recommended platforms based on product data
  const getRecommendedPlatforms = useMemo(() => {
    const category = productCategories.find(c => c.value === productData.category);
    const price = priceRanges.find(p => p.value === productData.priceRange);
    const demo = targetDemographics.find(d => d.value === productData.targetDemographic);
    
    const platformScores = {};
    
    // Score platforms based on category
    if (category) {
      category.platforms.forEach(platform => {
        platformScores[platform] = (platformScores[platform] || 0) + 3;
      });
    }
    
    // Score platforms based on price range
    if (price) {
      price.platforms.forEach(platform => {
        platformScores[platform] = (platformScores[platform] || 0) + 2;
      });
    }
    
    // Score platforms based on demographics
    if (demo) {
      demo.platforms.forEach(platform => {
        platformScores[platform] = (platformScores[platform] || 0) + 2;
      });
    }
    
    // Convert to sorted array
    return Object.entries(platformScores)
      .sort(([,a], [,b]) => b - a)
      .map(([platform, score]) => ({
        id: platform,
        ...PLATFORMS[platform.toUpperCase()],
        score
      }));
  }, [productData.category, productData.priceRange, productData.targetDemographic]);

  // Enhanced validation with better feedback
  const validateProductData = (data) => {
    const errors = [];
    const warnings = [];
    
    if (!data.name || data.name.trim().length === 0) {
      errors.push('Product name is required');
    } else if (data.name.length < 3) {
      warnings.push('Product name should be at least 3 characters');
    }
    
    if (!data.images || data.images.length === 0) {
      errors.push('At least one product image is required');
    } else if (data.images.length < 2) {
      warnings.push('Multiple images help create better ads');
    }
    
    if (!data.category) {
      errors.push('Product category is required');
    }
    
    if (!data.targetDemographic) {
      warnings.push('Target demographic helps optimize platform selection');
    }
    
    if (!data.description || data.description.length < 10) {
      warnings.push('A detailed description improves ad quality');
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  };

  // Update validation status when product data changes
  useEffect(() => {
    const validation = validateProductData(productData);
    onValidationUpdate(validation);
  }, [productData]); // Removed onValidationUpdate from dependencies to prevent infinite renders

  // Generate AI recommendations when we have enough data - separate effect
  useEffect(() => {
    if (productData.category && productData.images.length > 0) {
      generateRecommendations();
    }
  }, [productData.category, productData.images.length]); // Only depend on specific fields

  // Generate AI-powered recommendations
  const generateRecommendations = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const category = productCategories.find(c => c.value === productData.category);
    const recommendedPlatforms = getRecommendedPlatforms.slice(0, 3);
    
    const newRecommendations = {
      platforms: recommendedPlatforms,
      insights: [
        `Based on ${category?.label} category, ${recommendedPlatforms[0]?.name} typically performs 40% better`,
        `Your product images are well-suited for ${productData.images.length > 1 ? 'multiple formats' : 'square format'}`,
        productData.price ? `At $${productData.price}, consider value-focused messaging` : 'Add pricing for budget optimization tips',
        productData.targetDemographic ? `${targetDemographics.find(d => d.value === productData.targetDemographic)?.label} audiences respond well to social proof` : 'Define target demographic for personalized strategies'
      ].filter(Boolean),
      formats: productData.images.length > 0 ? ['1080x1080', '1200x628', '1080x1920'] : [],
      estimatedReach: Math.floor(Math.random() * 5000000) + 1000000
    };
    
    setRecommendations(newRecommendations);
    setIsAnalyzing(false);
  };

  // Handle product data updates with smarter defaults
  const handleProductUpdate = (updates) => {
    const newData = { ...productData, ...updates };
    
    // Auto-set price range based on price
    if (updates.price && !updates.priceRange) {
      const price = parseFloat(updates.price);
      if (price <= 25) newData.priceRange = 'budget';
      else if (price <= 100) newData.priceRange = 'mid';
      else if (price <= 500) newData.priceRange = 'premium';
      else newData.priceRange = 'luxury';
    }
    
    setProductData(newData);
    onDataUpdate(newData);
    
    // Update campaign name with more context
    if (updates.name) {
      const category = productCategories.find(c => c.value === newData.category);
      const campaignName = `${newData.name}${category ? ` - ${category.label}` : ''} Campaign`;
      onCampaignUpdate({ name: campaignName });
    }
  };

  // Enhanced product management
  const handleProductAdd = (product) => {
    const newProducts = [...products, product];
    setProducts(newProducts);
    handleProductUpdate({ images: newProducts });
  };

  const handleProductUpdateFromManager = (updatedProduct) => {
    if (!updatedProduct || !updatedProduct.id) {
      console.warn('Invalid product update:', updatedProduct);
      return;
    }
    
    const newProducts = products.filter(Boolean).map(p => 
      p && p.id === updatedProduct.id ? updatedProduct : p
    );
    setProducts(newProducts);
    handleProductUpdate({ images: newProducts });
  };

  const handleProductRemove = (productId) => {
    const newProducts = products.filter(p => p && p.id !== productId);
    setProducts(newProducts);
    handleProductUpdate({ images: newProducts });
  };

  const selectedCategory = productCategories.find(c => c.value === productData.category);

  return (
    <div className="space-y-6">
      {/* Product Selection Mode Toggle */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Choose Product Source
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Existing Products Option */}
          <div 
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectionMode === 'existing' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectionMode('existing')}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full border-2 ${
                selectionMode === 'existing' 
                  ? 'border-blue-500 bg-blue-500' 
                  : 'border-gray-300'
              }`}>
                {selectionMode === 'existing' && (
                  <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                )}
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Use Existing Product</h4>
                <p className="text-sm text-gray-500">
                  Select from {existingProducts.length} products in your library
                </p>
              </div>
            </div>
          </div>

          {/* New Product Option */}
          <div 
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectionMode === 'new' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectionMode('new')}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full border-2 ${
                selectionMode === 'new' 
                  ? 'border-blue-500 bg-blue-500' 
                  : 'border-gray-300'
              }`}>
                {selectionMode === 'new' && (
                  <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                )}
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Create New Product</h4>
                <p className="text-sm text-gray-500">
                  Enter product details manually
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Existing Product Selector */}
        {selectionMode === 'existing' && existingProducts.length > 0 && (
          <div className="space-y-4">
            <div>
              <label htmlFor="existing-product" className="block text-sm font-medium text-gray-700 mb-2">
                Select Product
              </label>
              <select
                id="existing-product"
                value={selectedExistingProductId}
                onChange={(e) => handleExistingProductSelect(e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Choose a product...</option>
                {existingProducts.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.brand ? `${product.brand} - ` : ''}{product.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Show selected product preview */}
            {selectedExistingProductId && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Selected Product Preview</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600"><strong>Name:</strong> {productData.name}</p>
                    <p className="text-sm text-gray-600"><strong>Brand:</strong> {productData.brand || 'Not specified'}</p>
                    <p className="text-sm text-gray-600"><strong>Category:</strong> {productData.category || 'Not specified'}</p>
                    <p className="text-sm text-gray-600"><strong>Images:</strong> {productData.images?.length || 0} uploaded</p>
                  </div>
                  <div>
                    {productData.images && productData.images.length > 0 && (
                      <img 
                        src={productData.images[0].url} 
                        alt={productData.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* No existing products message */}
        {selectionMode === 'existing' && existingProducts.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📦</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Products Found</h4>
            <p className="text-gray-500 mb-4">
              You haven't created any products yet. Create your first product to get started.
            </p>
            <div className="space-x-2">
              <button
                onClick={() => {
                  // Load sample data for testing
                  const sampleProducts = [
                    {
                      id: 'sample-1',
                      name: 'Mountain Huckleberry Yogurt',
                      description: 'Delicious organic yogurt made with wild mountain huckleberries. Creamy texture with a perfect balance of tart and sweet flavors.',
                      brand: 'SPINS Organic',
                      category: 'dairy_alternatives',
                      url: 'https://www.tillamook.com/products/yogurt/mountain-huckleberry-yogurt',
                      price: '$4.99',
                      status: 'Active',
                      images: [
                        {
                          id: 'img-1',
                          url: 'https://placehold.co/400x400/e0f2fe/1e40af?text=Mountain+Huckleberry+Yogurt',
                          fileName: 'huckleberry-yogurt.jpg',
                          altText: 'Mountain Huckleberry Yogurt container',
                          isPrimary: true
                        }
                      ],
                      metadata: {
                        tags: ['organic', 'yogurt', 'huckleberry', 'dairy-free'],
                        targetDemographic: 'millennials',
                        priceRange: 'mid'
                      },
                      created: new Date().toISOString(),
                      updated: new Date().toISOString()
                    },
                    {
                      id: 'sample-2',
                      name: 'Premium Wireless Headphones',
                      description: 'Experience crystal-clear audio with our latest wireless technology. Features active noise cancellation, 30-hour battery life, and premium comfort padding.',
                      brand: 'AudioTech',
                      category: 'electronics',
                      url: 'https://audiotech.com/premium-headphones',
                      price: '$199',
                      status: 'Active',
                      images: [
                        {
                          id: 'img-2',
                          url: 'https://placehold.co/400x400/1f2937/f3f4f6?text=Premium+Headphones',
                          fileName: 'headphones.jpg',
                          altText: 'Premium Wireless Headphones',
                          isPrimary: true
                        }
                      ],
                      metadata: {
                        tags: ['wireless', 'audio', 'noise-cancellation', 'premium'],
                        targetDemographic: 'millennials',
                        priceRange: 'premium'
                      },
                      created: new Date().toISOString(),
                      updated: new Date().toISOString()
                    }
                  ];
                  
                  // Save to localStorage
                  localStorage.setItem('products', JSON.stringify(sampleProducts));
                  
                  // Reload products
                  if (dbOperations) {
                    const loadedProducts = dbOperations.getProducts();
                    setExistingProducts(loadedProducts);
                    console.log('🎉 Sample products loaded:', loadedProducts);
                  }
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors mr-2"
              >
                📝 Load Sample Products
              </button>
              <button
                onClick={() => setSelectionMode('new')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Create New Product
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Product Information Form - Only show for new products or when existing product is selected */}
      {(selectionMode === 'new' || (selectionMode === 'existing' && (selectedExistingProductId || productData.name))) && (
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectionMode === 'existing' ? 'Product Information' : 'Product Information'}
            </h3>
            <div className="flex items-center space-x-2 text-sm">
              {/* Show data source indicator */}
              {selectionMode === 'existing' && productData.name && (
                <span className="inline-flex items-center px-2 py-1 bg-blue-100 rounded-full text-blue-600 text-xs">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                  {selectedExistingProductId ? 'From Product Library' : 'Campaign Data'}
                </span>
              )}
              
              {/* Demo Data Button - Only show for new products */}
              {selectionMode === 'new' && (
                <button
                  onClick={() => {
                    const demoData = {
                      name: 'Premium Wireless Headphones',
                      brand: 'AudioTech',
                      description: 'Experience crystal-clear audio with our latest wireless technology. Features active noise cancellation, 30-hour battery life, and premium comfort padding. Perfect for music lovers, professionals, and anyone who values quality sound.',
                      category: 'electronics',
                      price: '199',
                      url: 'https://audiotech.com/premium-headphones',
                      targetDemographic: 'millennials',
                      priceRange: 'premium'
                    };
                    handleProductUpdate(demoData);
                    console.log('🚀 Demo product data filled:', demoData);
                  }}
                  className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors"
                >
                  📝 Fill Demo Data
                </button>
              )}
              <span className="inline-flex items-center px-2 py-1 bg-blue-100 rounded-full text-blue-600">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                Platform Intelligence Active
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Product Name */}
            <div>
              <label htmlFor="product-name" className="block text-sm font-medium text-gray-700">
                Product Name *
              </label>
              <input
                type="text"
                id="product-name"
                value={productData.name}
                onChange={(e) => handleProductUpdate({ name: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter product name"
              />
            </div>

            {/* Enhanced Product Category */}
            <div>
              <label htmlFor="product-category" className="block text-sm font-medium text-gray-700">
                Category * {selectedCategory && <span className="text-lg">{selectedCategory.icon}</span>}
              </label>
              <select
                id="product-category"
                value={productData.category}
                onChange={(e) => handleProductUpdate({ category: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Select category</option>
                {productCategories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>
              {selectedCategory && (
                <p className="mt-1 text-xs text-gray-500">
                  Recommended platforms: {selectedCategory.platforms.map(p => PLATFORMS[p.toUpperCase()]?.name).join(', ')}
                </p>
              )}
            </div>

            {/* Product Brand */}
            <div>
              <label htmlFor="product-brand" className="block text-sm font-medium text-gray-700">
                Brand
              </label>
              <input
                type="text"
                id="product-brand"
                value={productData.brand}
                onChange={(e) => handleProductUpdate({ brand: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Brand name"
              />
            </div>

            {/* Enhanced Price with Range */}
            <div>
              <label htmlFor="product-price" className="block text-sm font-medium text-gray-700">
                Price
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="product-price"
                  value={productData.price}
                  onChange={(e) => handleProductUpdate({ price: e.target.value })}
                  className="block w-full pl-7 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              {productData.priceRange && (
                <p className="mt-1 text-xs text-gray-500">
                  {priceRanges.find(p => p.value === productData.priceRange)?.label} range
                </p>
              )}
            </div>

            {/* Target Demographic */}
            <div>
              <label htmlFor="target-demographic" className="block text-sm font-medium text-gray-700">
                Target Demographic
              </label>
              <select
                id="target-demographic"
                value={productData.targetDemographic}
                onChange={(e) => handleProductUpdate({ targetDemographic: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Select demographic</option>
                {targetDemographics.map(demo => (
                  <option key={demo.value} value={demo.value}>
                    {demo.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Override */}
            <div>
              <label htmlFor="price-range" className="block text-sm font-medium text-gray-700">
                Price Range
              </label>
              <select
                id="price-range"
                value={productData.priceRange}
                onChange={(e) => handleProductUpdate({ priceRange: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {priceRanges.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Enhanced Product Description */}
          <div className="mt-6">
            <label htmlFor="product-description" className="block text-sm font-medium text-gray-700">
              Product Description
            </label>
            <textarea
              id="product-description"
              rows={4}
              value={productData.description}
              onChange={(e) => handleProductUpdate({ description: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Describe your product's key features, benefits, and unique selling points..."
            />
            <p className="mt-1 text-xs text-gray-500">
              {productData.description.length}/500 characters - Detailed descriptions improve ad quality
            </p>
          </div>

          {/* Product URL */}
          <div className="mt-6">
            <label htmlFor="product-url" className="block text-sm font-medium text-gray-700">
              Product URL
            </label>
            <input
              type="url"
              id="product-url"
              value={productData.url}
              onChange={(e) => handleProductUpdate({ url: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="https://example.com/product"
            />
          </div>
        </div>
      )}

      {/* Product Image Management - Show when we have product data */}
      {(productData.name || selectedExistingProductId) && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Product Images
          </h3>
          
          {/* Show ProductAssetManager for both existing and new products */}
          <div className="space-y-4">
            {selectionMode === 'existing' && productData.images?.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-blue-600">📦</span>
                  <h4 className="text-sm font-medium text-blue-800">
                    Product Assets from Library
                  </h4>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                    {products.length} assets loaded
                  </span>
                </div>
                <p className="text-sm text-blue-700">
                  Images from "{productData.name}" have been converted to draggable product assets. 
                  You can drag these to the canvas in the Creative Builder step.
                </p>
              </div>
            )}
            
            <ProductAssetManager 
              products={products.filter(Boolean)}
              onProductAdd={handleProductAdd}
              onProductUpdate={handleProductUpdateFromManager}
              onProductRemove={handleProductRemove}
              allowUpload={selectionMode === 'new'}
            />
            
            {selectionMode === 'existing' && products.length === 0 && productData.images?.length === 0 && (
              // Show message when no images are available for existing product
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🖼️</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Images Available</h4>
                <p className="text-gray-500">
                  This product doesn't have any images yet. You can add images by editing the product in the Product Manager.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Recommendations Panel */}
      {recommendations && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-2xl">🤖</span>
            <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              Based on your product
            </span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Platform Recommendations */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Recommended Platforms</h4>
              <div className="space-y-2">
                {recommendations.platforms.map((platform, index) => (
                  <div key={platform.id} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{platform.icon}</span>
                      <span className="font-medium">{platform.name}</span>
                      {index === 0 && <span className="text-xs bg-green-100 text-green-800 px-1 rounded">Best Match</span>}
                    </div>
                    <div className="text-sm text-gray-500">Score: {platform.score}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Insights */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Key Insights</h4>
              <ul className="space-y-2">
                {recommendations.insights.map((insight, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span className="text-gray-700">{insight}</span>
                  </li>
                ))}
              </ul>
              
              {recommendations.estimatedReach && (
                <div className="mt-4 p-3 bg-white rounded border">
                  <div className="text-sm text-gray-600">Estimated Reach</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {recommendations.estimatedReach.toLocaleString()} people
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Analysis Loading State */}
      {isAnalyzing && (
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">Analyzing your product for platform recommendations...</span>
          </div>
        </div>
      )}

      {/* Instructions for testing */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <span className="text-yellow-600 text-xl">💡</span>
          <div>
            <h4 className="font-medium text-yellow-800 mb-1">How to Test Product Defaulting</h4>
            <ol className="text-sm text-yellow-700 space-y-1">
              <li>1. <strong>Existing Products:</strong> Select "Use Existing Product" and choose from your library</li>
              <li>2. <strong>New Products:</strong> Select "Create New Product" and use "Fill Demo Data" button</li>
              <li>3. <strong>Navigate:</strong> Go to Creative Builder to see product data automatically populate headlines, descriptions, and canvas elements</li>
              <li>4. <strong>Check Console:</strong> Look for "✅ Using saved product..." messages in browser console</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSelection; 