# Product Hierarchy Implementation Plan

## Overview
This document outlines the implementation plan for adding a **Product** entity as a new top-level hierarchy in the Campaign Builder application. Products will serve as parent entities that contain multiple campaigns, creating a structured approach: **Product → Campaign → Creative**.

## Current Architecture Analysis

### Existing Technology Stack
- **Frontend**: React 18.2.0 with Vite
- **Styling**: Tailwind CSS with dark mode support
- **State Management**: Local React state with localStorage persistence
- **Backend**: Express.js server (server.cjs)
- **Data Storage**: localStorage (temporary solution)
- **UI Components**: Custom component library (Card, Button, InputField, etc.)

### Current Data Flow
```
Campaign → Creative → Ad Assets
```

### Proposed New Data Flow
```
Product → Campaign → Creative → Ad Assets
```

## Product Entity Definition

### Product Schema
```javascript
const productSchema = {
  id: String, // Unique identifier (timestamp-based)
  name: String, // e.g., "Mountain Huckleberry Yogurt"
  description: String, // Product description
  brand: String, // Brand name
  category: String, // Product category
  utmCodes: {
    source: String, // UTM source
    medium: String, // UTM medium
    campaign: String, // UTM campaign
    term: String, // UTM term (optional)
    content: String // UTM content (optional)
  },
  images: [{
    id: String,
    url: String,
    fileName: String,
    altText: String,
    isPrimary: Boolean,
    size: String, // e.g., "300x250"
    uploadDate: Date
  }],
  metadata: {
    sku: String, // Product SKU
    retailerUrls: [{
      retailer: String,
      url: String
    }],
    tags: [String] // Product tags for organization
  },
  settings: {
    defaultAudience: String,
    defaultRetailers: [String],
    defaultRegions: [String]
  },
  created: Date,
  updated: Date,
  status: String // 'Active', 'Draft', 'Archived'
}
```

## Implementation Plan

### Phase 1: Core Product Management (Week 1-2)

#### 1.1 Database Operations Extension
**File**: `src/App.jsx` (dbOperations object)

```javascript
// Add to existing dbOperations
const dbOperations = {
  // ... existing campaign methods ...
  
  // Product operations
  saveProduct: (productData) => {
    try {
      const existingProducts = JSON.parse(localStorage.getItem('products') || '[]');
      const newProduct = {
        id: String(Date.now()),
        ...productData,
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        status: productData.status || 'Draft'
      };
      existingProducts.push(newProduct);
      localStorage.setItem('products', JSON.stringify(existingProducts));
      return { success: true, product: newProduct };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getProducts: () => {
    try {
      return JSON.parse(localStorage.getItem('products') || '[]');
    } catch (error) {
      return [];
    }
  },

  updateProduct: (productId, updates) => {
    try {
      const products = JSON.parse(localStorage.getItem('products') || '[]');
      const productIndex = products.findIndex(p => p.id === productId);
      if (productIndex !== -1) {
        products[productIndex] = {
          ...products[productIndex],
          ...updates,
          updated: new Date().toISOString()
        };
        localStorage.setItem('products', JSON.stringify(products));
        return { success: true, product: products[productIndex] };
      }
      return { success: false, error: 'Product not found' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  deleteProduct: (productId) => {
    try {
      const products = JSON.parse(localStorage.getItem('products') || '[]');
      const filteredProducts = products.filter(p => p.id !== productId);
      localStorage.setItem('products', JSON.stringify(filteredProducts));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Update campaign operations to include productId
  saveAd: (adData) => {
    try {
      const existingCampaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
      const newCampaign = {
        id: String(Date.now()),
        productId: adData.productId || null, // NEW: Link to product
        name: adData.campaignName,
        status: 'Draft',
        info: true,
        created: new Date().toLocaleDateString(),
        type: adData.ctaType === CTA_TYPE_WHERE_TO_BUY ? 'Where to Buy' : 'Add to Cart',
        budget: '$0.00',
        starts: 'Not Set',
        ends: 'Not Set',
        adData: adData
      };
      existingCampaigns.push(newCampaign);
      localStorage.setItem('campaigns', JSON.stringify(existingCampaigns));
      return { success: true, campaign: newCampaign };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
```

#### 1.2 New App Views and Constants
**File**: `src/App.jsx` (Constants section)

```javascript
// Add new view constants
const APP_VIEW_PRODUCT_MANAGER = 'product_manager';
const APP_VIEW_PRODUCT_DETAILS = 'product_details';
const APP_VIEW_PRODUCT_FORM = 'product_form';

// Update navigation structure
const NAV_ITEMS = [
  { name: 'Products', view: APP_VIEW_PRODUCT_MANAGER, icon: 'package' },
  { name: 'Campaigns', view: APP_VIEW_CAMPAIGN_MANAGER, icon: 'megaphone' },
  { name: 'Ad Platforms', view: APP_VIEW_AD_PLATFORMS, icon: 'share' }
];

// Product categories
const PRODUCT_CATEGORIES = [
  { label: 'Dairy & Alternatives', value: 'dairy_alternatives' },
  { label: 'Beverages', value: 'beverages' },
  { label: 'Snacks', value: 'snacks' },
  { label: 'Pantry Staples', value: 'pantry_staples' },
  { label: 'Fresh Produce', value: 'fresh_produce' },
  { label: 'Frozen Foods', value: 'frozen_foods' },
  { label: 'Health & Wellness', value: 'health_wellness' }
];
```

#### 1.3 Product Manager View Component
**New Component**: Add to `src/App.jsx`

```javascript
function ProductManagerView({ onCreateNew, onProductClick, onEditProduct }) {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadedProducts = dbOperations.getProducts();
    setProducts(loadedProducts);
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <svg className="w-6 h-6 text-[#F7941D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Products</h1>
          <span className="text-gray-500 dark:text-gray-400">Manage Product Library</span>
        </div>
        <Button variant="primary" onClick={onCreateNew}>
          Add Product
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <InputField
          id="productSearch"
          label="Search Products"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by product name or brand..."
          className="max-w-md"
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard 
            key={product.id}
            product={product}
            onView={() => onProductClick(product)}
            onEdit={() => onEditProduct(product)}
          />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Products Found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first product.'}
          </p>
          {!searchTerm && (
            <Button variant="primary" onClick={onCreateNew}>
              Add Your First Product
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
```

#### 1.4 Product Card Component
**New Component**: Add to `src/App.jsx`

```javascript
function ProductCard({ product, onView, onEdit }) {
  const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
  const campaignCount = dbOperations.getCampaigns().filter(c => c.productId === product.id).length;

  return (
    <div className="bg-white rounded-lg shadow dark:bg-gray-800 overflow-hidden">
      <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700">
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={primaryImage.altText || product.name}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-48">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
            {product.name}
          </h3>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            product.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
            product.status === 'Draft' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
            'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
          }`}>
            {product.status}
          </span>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{product.brand}</p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mb-4 line-clamp-2">{product.description}</p>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {campaignCount} campaign{campaignCount !== 1 ? 's' : ''}
          </span>
          <div className="flex space-x-2">
            <Button variant="light" size="small" onClick={onEdit}>
              Edit
            </Button>
            <Button variant="primary" size="small" onClick={onView}>
              View
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Phase 2: Product Form and Details (Week 2-3)

#### 2.1 Product Form Component
**New Component**: Add to `src/App.jsx`

```javascript
function ProductFormView({ product = null, onSave, onCancel }) {
  const isEditing = !!product;
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    brand: product?.brand || '',
    category: product?.category || '',
    utmCodes: {
      source: product?.utmCodes?.source || '',
      medium: product?.utmCodes?.medium || '',
      campaign: product?.utmCodes?.campaign || '',
      term: product?.utmCodes?.term || '',
      content: product?.utmCodes?.content || ''
    },
    settings: {
      defaultAudience: product?.settings?.defaultAudience || DEFAULT_AUDIENCE_TYPE,
      defaultRetailers: product?.settings?.defaultRetailers || [],
      defaultRegions: product?.settings?.defaultRegions || []
    },
    metadata: {
      sku: product?.metadata?.sku || '',
      tags: product?.metadata?.tags || [],
      retailerUrls: product?.metadata?.retailerUrls || []
    },
    status: product?.status || 'Draft'
  });
  
  const [images, setImages] = useState(product?.images || []);
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleNestedInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
    if (!formData.category) newErrors.category = 'Category is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const productData = {
      ...formData,
      images
    };

    try {
      const result = isEditing 
        ? await dbOperations.updateProduct(product.id, productData)
        : await dbOperations.saveProduct(productData);
      
      if (result.success) {
        onSave(result.product);
      }
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          {isEditing ? `Edit ${product.name}` : 'Add New Product'}
        </h1>
        <Button variant="light" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Information */}
        <Card title="Basic Information">
          <div className="space-y-4">
            <InputField
              id="productName"
              label="Product Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Mountain Huckleberry Yogurt"
              error={errors.name}
            />
            
            <InputField
              id="brand"
              label="Brand"
              value={formData.brand}
              onChange={(e) => handleInputChange('brand', e.target.value)}
              placeholder="e.g., SPINS Organic"
              error={errors.brand}
            />
            
            <SelectDropdown
              id="category"
              label="Category"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              options={PRODUCT_CATEGORIES}
              error={errors.category}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F7941D] focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                rows="3"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of the product..."
              />
            </div>
          </div>
        </Card>

        {/* UTM Codes */}
        <Card title="UTM Tracking Codes">
          <div className="space-y-4">
            <InputField
              id="utmSource"
              label="UTM Source"
              value={formData.utmCodes.source}
              onChange={(e) => handleNestedInputChange('utmCodes', 'source', e.target.value)}
              placeholder="e.g., newsletter"
            />
            
            <InputField
              id="utmMedium"
              label="UTM Medium"
              value={formData.utmCodes.medium}
              onChange={(e) => handleNestedInputChange('utmCodes', 'medium', e.target.value)}
              placeholder="e.g., email"
            />
            
            <InputField
              id="utmCampaign"
              label="UTM Campaign"
              value={formData.utmCodes.campaign}
              onChange={(e) => handleNestedInputChange('utmCodes', 'campaign', e.target.value)}
              placeholder="e.g., spring_launch"
            />
          </div>
        </Card>
      </div>

      {/* Image Management Section */}
      <Card title="Product Images" className="mt-8">
        <ProductImageManager images={images} setImages={setImages} />
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 mt-8">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          {isEditing ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </div>
  );
}
```

#### 2.2 Product Image Manager Component
**New Component**: Add to `src/App.jsx`

```javascript
function ProductImageManager({ images, setImages }) {
  const [uploadError, setUploadError] = useState('');

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage = {
            id: String(Date.now() + Math.random()),
            url: e.target.result,
            fileName: file.name,
            altText: '',
            isPrimary: images.length === 0, // First image is primary by default
            size: '300x250', // Default size
            uploadDate: new Date().toISOString()
          };
          setImages(prev => [...prev, newImage]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleImageDelete = (imageId) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleSetPrimary = (imageId) => {
    setImages(prev => prev.map(img => ({
      ...img,
      isPrimary: img.id === imageId
    })));
  };

  const handleAltTextChange = (imageId, altText) => {
    setImages(prev => prev.map(img => 
      img.id === imageId ? { ...img, altText } : img
    ));
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          id="imageUpload"
        />
        <label
          htmlFor="imageUpload"
          className="cursor-pointer flex flex-col items-center"
        >
          <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400">
            Click to upload product images
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            PNG, JPG, GIF up to 10MB each
          </p>
        </label>
      </div>

      {/* Uploaded Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image) => (
            <div key={image.id} className="relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
              <img
                src={image.url}
                alt={image.altText || 'Product image'}
                className="w-full h-32 object-cover"
              />
              
              {/* Primary Badge */}
              {image.isPrimary && (
                <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 text-xs rounded">
                  Primary
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="absolute top-2 right-2 flex space-x-1">
                {!image.isPrimary && (
                  <button
                    onClick={() => handleSetPrimary(image.id)}
                    className="bg-blue-500 text-white p-1 rounded text-xs hover:bg-blue-600"
                    title="Set as primary"
                  >
                    ★
                  </button>
                )}
                <button
                  onClick={() => handleImageDelete(image.id)}
                  className="bg-red-500 text-white p-1 rounded text-xs hover:bg-red-600"
                  title="Delete image"
                >
                  ×
                </button>
              </div>
              
              {/* Alt Text Input */}
              <div className="p-2">
                <input
                  type="text"
                  value={image.altText}
                  onChange={(e) => handleAltTextChange(image.id, e.target.value)}
                  placeholder="Alt text for accessibility..."
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Phase 3: Integration with Campaign Flow (Week 3-4)

#### 3.1 Update Campaign Creation Flow
**Modify**: `CreateCampaignScreen` component in `src/App.jsx`

```javascript
function CreateCampaignScreen({ onCampaignCreated, onSaveAndExit, selectedProduct = null }) {
  const [productId, setProductId] = useState(selectedProduct?.id || '');
  const [campaignName, setCampaignName] = useState(() => {
    if (selectedProduct) {
      return generateNextCampaignName(selectedProduct.name);
    }
    return generateNextCampaignName();
  });
  
  // ... existing state variables ...

  // Load products for selection
  const [products] = useState(() => dbOperations.getProducts());

  const handleContinue = () => {
    const trimmedCampaignName = campaignName.trim();
    if (!trimmedCampaignName) {
      setCampaignNameError('Campaign Name is required.');
      return;
    }
    if (!productId && products.length > 0) {
      // Require product selection if products exist
      setCampaignNameError('Please select a product for this campaign.');
      return;
    }
    setCampaignNameError('');

    const campaignSettings = {
      campaign: {
        name: trimmedCampaignName,
        productId // NEW: Include product ID
      },
      audience: {
        type: audienceSegment,
        dietOverlay: showDietOverlay ? selectedDietTypes : [],
        specificRetailers: showSpecificRetailers ? selectedRetailers : [],
        specificRegions: showSpecificRegions ? selectedRegions : []
      }
    };
    onCampaignCreated(campaignSettings);
  };

  return (
    <Card title="Step 1: Create Campaign" className="max-w-lg mx-auto">
      <p className="text-gray-600 mb-6 dark:text-gray-400">Define your campaign name and audience details.</p>

      {/* Product Selection - NEW */}
      {products.length > 0 && (
        <div className="mb-6">
          <SelectDropdown
            id="productSelection"
            label="Select Product"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            options={[
              { label: selectedProduct ? selectedProduct.name : 'Choose a product...', value: '' },
              ...products.map(p => ({ label: p.name, value: p.id }))
            ]}
            disabled={!!selectedProduct} // Disable if product pre-selected
          />
          {selectedProduct && (
            <p className="text-sm text-gray-500 mt-1">
              Product: {selectedProduct.name} (pre-selected)
            </p>
          )}
        </div>
      )}

      {/* Campaign Name Input */}
      <div className="mb-6">
        <InputField
          id="campaignName"
          label="Campaign Name"
          value={campaignName}
          onChange={(e) => { setCampaignName(e.target.value); setCampaignNameError(''); }}
          placeholder="e.g., Summer Sale 2025"
          error={campaignNameError}
        />
      </div>

      {/* ... rest of existing component ... */}
    </Card>
  );
}
```

#### 3.2 Product Details View
**New Component**: Add to `src/App.jsx`

```javascript
function ProductDetailsView({ product, onBack, onEdit, onCreateCampaign }) {
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    const allCampaigns = dbOperations.getCampaigns();
    const productCampaigns = allCampaigns.filter(c => c.productId === product.id);
    setCampaigns(productCampaigns);
  }, [product.id]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Button variant="light" onClick={onBack} className="mr-2">
            ← Back to Products
          </Button>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">{product.name}</h1>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            product.status === 'Active' ? 'bg-green-100 text-green-800' :
            product.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {product.status}
          </span>
        </div>
        <div className="flex space-x-2">
          <Button variant="light" onClick={() => onEdit(product)}>
            Edit Product
          </Button>
          <Button variant="primary" onClick={() => onCreateCampaign(product)}>
            Create Campaign
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Information */}
        <div className="lg:col-span-2">
          <Card title="Product Information">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Brand</p>
                <p className="font-medium dark:text-gray-100">{product.brand}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
                <p className="font-medium dark:text-gray-100">
                  {PRODUCT_CATEGORIES.find(c => c.value === product.category)?.label || product.category}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
                <p className="font-medium dark:text-gray-100">{product.description}</p>
              </div>
            </div>
          </Card>

          {/* UTM Codes */}
          {product.utmCodes && Object.values(product.utmCodes).some(v => v) && (
            <Card title="UTM Tracking Codes" className="mt-6">
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(product.utmCodes).map(([key, value]) => (
                  value && (
                    <div key={key}>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                        UTM {key}
                      </p>
                      <p className="font-mono text-sm dark:text-gray-100">{value}</p>
                    </div>
                  )
                ))}
              </div>
            </Card>
          )}

          {/* Campaigns */}
          <Card title={`Campaigns (${campaigns.length})`} className="mt-6">
            {campaigns.length > 0 ? (
              <div className="space-y-3">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <div>
                      <h4 className="font-medium dark:text-gray-100">{campaign.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Created {campaign.created} • {campaign.status}
                      </p>
                    </div>
                    <Button variant="light" size="small">
                      View
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 dark:text-gray-400 mb-4">No campaigns created yet</p>
                <Button variant="primary" onClick={() => onCreateCampaign(product)}>
                  Create First Campaign
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Product Images */}
        <div>
          <Card title="Product Images">
            {product.images && product.images.length > 0 ? (
              <div className="space-y-3">
                {product.images.map((image) => (
                  <div key={image.id} className="relative">
                    <img
                      src={image.url}
                      alt={image.altText || product.name}
                      className="w-full h-32 object-cover rounded"
                    />
                    {image.isPrimary && (
                      <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 text-xs rounded">
                        Primary
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-500 dark:text-gray-400">No images uploaded</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
```

### Phase 4: Navigation and UI Updates (Week 4)

#### 4.1 Update Left Navigation
**Modify**: `LeftNav` component in `src/App.jsx`

```javascript
function LeftNav({ onNavigate }) {
  const navItems = [
    {
      name: 'Products',
      view: APP_VIEW_PRODUCT_MANAGER,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    {
      name: 'Campaigns',
      view: APP_VIEW_CAMPAIGN_MANAGER,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    {
      name: 'Ad Platforms',
      view: APP_VIEW_AD_PLATFORMS,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
        </svg>
      )
    }
  ];

  // ... rest of component with updated navItems
}
```

#### 4.2 Update Main App Component Render Logic
**Modify**: `App` component render logic in `src/App.jsx`

```javascript
// Add new state for product management
const [selectedProduct, setSelectedProduct] = useState(null);

// Add new event handlers
const handleCreateNewProduct = () => {
  setAppView(APP_VIEW_PRODUCT_FORM);
  setSelectedProduct(null);
};

const handleProductClick = (product) => {
  setSelectedProduct(product);
  setAppView(APP_VIEW_PRODUCT_DETAILS);
};

const handleEditProduct = (product) => {
  setSelectedProduct(product);
  setAppView(APP_VIEW_PRODUCT_FORM);
};

const handleProductSaved = (product) => {
  setAppView(APP_VIEW_PRODUCT_MANAGER);
  setSelectedProduct(null);
};

const handleCreateCampaignFromProduct = (product) => {
  setSelectedProduct(product);
  setAppView(APP_VIEW_CAMPAIGN_BUILDER);
  setCurrentView(VIEW_CREATE_CAMPAIGN);
  setAdData(null);
  setCampaignSettings(null);
};

// Update main render logic
{appView === APP_VIEW_PRODUCT_MANAGER ? (
  <ProductManagerView 
    onCreateNew={handleCreateNewProduct}
    onProductClick={handleProductClick}
    onEditProduct={handleEditProduct}
  />
) : appView === APP_VIEW_PRODUCT_DETAILS ? (
  <ProductDetailsView 
    product={selectedProduct}
    onBack={() => setAppView(APP_VIEW_PRODUCT_MANAGER)}
    onEdit={handleEditProduct}
    onCreateCampaign={handleCreateCampaignFromProduct}
  />
) : appView === APP_VIEW_PRODUCT_FORM ? (
  <ProductFormView 
    product={selectedProduct}
    onSave={handleProductSaved}
    onCancel={() => setAppView(selectedProduct ? APP_VIEW_PRODUCT_DETAILS : APP_VIEW_PRODUCT_MANAGER)}
  />
) : appView === APP_VIEW_CAMPAIGN_MANAGER ? (
  // ... existing campaign manager logic
) : // ... rest of existing views
}
```

## Benefits and Features

### Key Benefits
1. **Organized Hierarchy**: Product → Campaign → Creative structure provides clear organization
2. **Reusable Assets**: Product images and UTM codes can be reused across campaigns
3. **Centralized Management**: Single place to manage all product information
4. **Scalability**: Easy to add new products and track their campaign performance
5. **UTM Consistency**: Predefined UTM codes ensure consistent tracking

### Product Features
- **Image Library**: Multiple images per product with primary image designation
- **UTM Code Management**: Predefined UTM parameters for consistent tracking
- **Product Metadata**: SKU, tags, retailer URLs for comprehensive product data
- **Default Settings**: Audience, retailer, and region defaults for quick campaign creation
- **Status Management**: Draft, Active, Archived states for product lifecycle
- **Search and Filter**: Easy product discovery and organization

## Technical Considerations

### Data Migration
- Products will be stored in localStorage under the 'products' key
- Existing campaigns will continue to work without productId (backward compatibility)
- New campaigns will include productId for proper hierarchy

### Performance
- Implement caching for product lists and images
- Consider pagination for large product catalogs
- Optimize image loading with lazy loading for product grids

### Future Enhancements
- **API Integration**: Replace localStorage with proper backend database
- **Advanced Filtering**: Category, brand, status filters for product management
- **Bulk Operations**: Bulk product import/export capabilities
- **Analytics**: Product performance tracking across campaigns
- **Team Collaboration**: Product sharing and permissions

## Implementation Timeline

- **Week 1**: Core product data model and basic CRUD operations
- **Week 2**: Product form and image management
- **Week 3**: Campaign integration and product details view
- **Week 4**: Navigation updates and final integration testing

## Next Steps

1. Review and approve this plan
2. Begin Phase 1 implementation with core product management
3. Test each phase thoroughly before proceeding
4. Gather user feedback during development for UX improvements
5. Plan for eventual backend integration and API development

This implementation will transform the campaign builder into a comprehensive product marketing platform, providing the hierarchy and organization needed for managing multiple products and their associated marketing campaigns. 