import React, { useState, useEffect, useMemo } from 'react';
import { getAllAudienceTemplates, estimateAudienceSize, validateAudienceConfig } from '../constants/audiences';

/**
 * Enhanced Audience Builder Step - Phase 2
 * Second step in Campaign Flow V2 with interactive targeting and real-time estimation
 */

const AudienceBuilder = ({ 
  data, 
  onDataUpdate, 
  onValidationUpdate, 
  campaignData,
  errors 
}) => {
  const [audienceData, setAudienceData] = useState(data || {
    name: 'General Audience', // Provide default name
    template: null,
    demographics: {
      age: [25, 54], // Good default age range
      gender: 'all',
      income: 'any',
      education: 'any',
      maritalStatus: 'any',
      parentalStatus: 'any'
    },
    locations: {
      countries: ['US'],
      regions: [],
      cities: [],
      excludeLocations: []
    },
    interests: [], // Optional - not required
    behaviors: [], // Optional - not required
    dietType: {
      overlay: false,
      types: [] // Will contain selected diet types: 'plant-based', 'gluten-free', 'lactose-free', 'keto', 'kosher'
    },
    retailers: {
      overlay: false,
      types: [] // Will contain selected retailers: 'walmart', 'publix', 'target', 'sprouts', 'kroger'
    },
    customAudience: null,
    estimatedSize: 0,
    platforms: [],
    excludeAudiences: []
  });

  const [activeTab, setActiveTab] = useState('templates');
  const [isEstimating, setIsEstimating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const audienceTemplates = getAllAudienceTemplates();

  // Interest categories for detailed targeting
  const interestCategories = {
    'Fashion & Beauty': [
      'Fashion', 'Beauty products', 'Makeup', 'Skincare', 'Luxury goods', 'Street fashion'
    ],
    'Health & Fitness': [
      'Fitness and wellness', 'Yoga', 'Running', 'Weight training', 'Nutrition', 'Mental health'
    ],
    'Technology': [
      'Consumer electronics', 'Mobile phones', 'Social media', 'Gaming', 'Software', 'AI and automation'
    ],
    'Food & Dining': [
      'Cooking', 'Restaurants', 'Organic food', 'Vegetarian', 'Wine', 'Coffee culture'
    ],
    'Lifestyle': [
      'Home and garden', 'Travel', 'Photography', 'Art and culture', 'Music', 'Books'
    ]
  };

  // Behavioral targeting options
  const behaviorOptions = {
    'Purchase Behavior': [
      'Frequent online shoppers', 'Premium brand affinity', 'Price-conscious shoppers', 'Impulse buyers'
    ],
    'Digital Activity': [
      'Social media heavy users', 'Video streaming users', 'Mobile app users', 'Email subscribers'
    ],
    'Lifestyle Patterns': [
      'Frequent travelers', 'Health and wellness focused', 'Early technology adopters', 'Environmentally conscious'
    ]
  };

  // Diet type options
  const dietTypeOptions = [
    { value: 'plant-based', label: 'Plant-based', icon: '🌱' },
    { value: 'gluten-free', label: 'Gluten Free', icon: '🚫🌾' },
    { value: 'lactose-free', label: 'Lactose-Free', icon: '🥛❌' },
    { value: 'keto', label: 'Keto', icon: '🥑' },
    { value: 'kosher', label: 'Kosher', icon: '✡️' }
  ];

  // Retailer options
  const retailerOptions = [
    { value: 'walmart', label: 'Walmart', icon: '🛒' },
    { value: 'publix', label: 'Publix', icon: '🛍️' },
    { value: 'target', label: 'Target', icon: '🎯' },
    { value: 'sprouts', label: 'Sprouts', icon: '🌿' },
    { value: 'kroger', label: 'Kroger', icon: '🏪' }
  ];

  // Calculate estimated audience size with better logic
  const calculateAudienceSize = useMemo(() => {
    let baseSize = 280000000; // US population base
    
    // Age targeting multiplier
    const ageRange = audienceData.demographics.age[1] - audienceData.demographics.age[0];
    const ageMultiplier = Math.min(ageRange / 50, 1);
    baseSize *= ageMultiplier;
    
    // Gender multiplier
    if (audienceData.demographics.gender !== 'all') {
      baseSize *= 0.5;
    }
    
    // Interest targeting reduces audience
    const interestMultiplier = Math.max(0.1, 1 - (audienceData.interests.length * 0.15));
    baseSize *= interestMultiplier;
    
    // Behavior targeting further refines
    const behaviorMultiplier = Math.max(0.05, 1 - (audienceData.behaviors.length * 0.2));
    baseSize *= behaviorMultiplier;
    
    // Diet type targeting (if overlay is enabled)
    if (audienceData.dietType.overlay && audienceData.dietType.types.length > 0) {
      const dietMultiplier = Math.max(0.02, 1 - (audienceData.dietType.types.length * 0.25));
      baseSize *= dietMultiplier;
    }
    
    // Retailer targeting (if overlay is enabled)
    if (audienceData.retailers.overlay && audienceData.retailers.types.length > 0) {
      const retailerMultiplier = Math.max(0.03, 1 - (audienceData.retailers.types.length * 0.2));
      baseSize *= retailerMultiplier;
    }
    
    // Income/education targeting
    if (audienceData.demographics.income !== 'any') baseSize *= 0.6;
    if (audienceData.demographics.education !== 'any') baseSize *= 0.7;
    
    return Math.floor(baseSize);
  }, [audienceData]);

  // Enhanced validation with platform-specific feedback - Made more lenient
  const validateAudienceData = (data) => {
    const errors = [];
    const warnings = [];
    
    // Only require name if user has interacted with the field or no default exists
    if (!data.name || data.name.trim().length === 0) {
      // Only show a warning if user cleared the name and has no targeting
      if (data.name === '' && !data.template && data.interests.length === 0 && data.behaviors.length === 0) {
        warnings.push('Consider adding an audience name for better organization');
      }
      // Don't call handleAudienceUpdate here as it causes infinite re-renders
    }
    
    const estimatedSize = calculateAudienceSize;
    
    // More lenient size validation
    if (estimatedSize < 500) {
      warnings.push('Very narrow audience - consider broadening targeting for better reach');
    } else if (estimatedSize < 5000) {
      warnings.push('Small audience size may limit ad delivery optimization');
    }
    
    // Optional targeting suggestions (not requirements)
    if (data.interests.length === 0 && data.behaviors.length === 0 && !data.template) {
      warnings.push('Consider adding interests or behaviors for more precise targeting');
    }
    
    if (data.demographics.age[1] - data.demographics.age[0] < 5) {
      warnings.push('Narrow age range detected - consider broadening for larger reach');
    }
    
    // Much more lenient validation - only fail on critical issues
    const hasBasicTargeting = data.template || 
                             data.interests.length > 0 || 
                             data.behaviors.length > 0 || 
                             (data.dietType.overlay && data.dietType.types.length > 0) ||
                             (data.retailers.overlay && data.retailers.types.length > 0) ||
                             data.demographics.age[1] - data.demographics.age[0] > 0 ||
                             data.demographics.gender !== 'all' ||
                             data.demographics.income !== 'any' ||
                             data.demographics.education !== 'any';
    
    // Always consider valid if we have any targeting at all (even just age range)
    const isValid = hasBasicTargeting && estimatedSize >= 50; // Very minimal requirements
    
    return {
      valid: isValid,
      errors,
      warnings,
      estimatedSize,
      message: isValid ? 
        `Audience configured with estimated reach of ${(estimatedSize / 1000000).toFixed(1)}M people` :
        'Basic audience targeting is configured'
    };
  };

  // Auto-generate name when targeting changes but name is empty
  useEffect(() => {
    if (!audienceData.name && (audienceData.template || audienceData.interests.length > 0 || audienceData.behaviors.length > 0 || (audienceData.dietType.overlay && audienceData.dietType.types.length > 0) || (audienceData.retailers.overlay && audienceData.retailers.types.length > 0))) {
      const autoName = generateAudienceName(audienceData);
      setAudienceData(prev => ({ ...prev, name: autoName }));
    }
  }, [audienceData.template, audienceData.interests.length, audienceData.behaviors.length, audienceData.dietType.overlay, audienceData.dietType.types.length, audienceData.retailers.overlay, audienceData.retailers.types.length]);

  // Update validation when audience data changes
  useEffect(() => {
    const validation = validateAudienceData(audienceData);
    setAudienceData(prev => ({ ...prev, estimatedSize: validation.estimatedSize }));
    onValidationUpdate(validation);
  }, [audienceData.demographics, audienceData.interests, audienceData.behaviors, audienceData.dietType, audienceData.retailers, audienceData.name]);

  // Real-time audience estimation
  useEffect(() => {
    setIsEstimating(true);
    const timer = setTimeout(() => {
      setIsEstimating(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [audienceData.demographics, audienceData.interests, audienceData.behaviors, audienceData.dietType, audienceData.retailers]);

  // Handle audience data updates
  const handleAudienceUpdate = (updates) => {
    const newData = { ...audienceData, ...updates };
    setAudienceData(newData);
    onDataUpdate(newData);
  };

  // Apply audience template with enhanced data
  const applyTemplate = (template) => {
    const enhancedTemplate = {
      template: template.id,
      name: template.name,
      demographics: {
        ...audienceData.demographics,
        ...template.demographics
      },
      interests: template.interests?.map(i => i.name) || [],
      behaviors: template.behaviors || [],
      locations: audienceData.locations,
      platforms: template.platforms || []
    };
    
    handleAudienceUpdate(enhancedTemplate);
    setActiveTab('demographics');
  };

  // Toggle interest selection
  const toggleInterest = (interest) => {
    const newInterests = audienceData.interests.includes(interest)
      ? audienceData.interests.filter(i => i !== interest)
      : [...audienceData.interests, interest];
    
    handleAudienceUpdate({ interests: newInterests });
  };

  // Toggle behavior selection
  const toggleBehavior = (behavior) => {
    const newBehaviors = audienceData.behaviors.includes(behavior)
      ? audienceData.behaviors.filter(b => b !== behavior)
      : [...audienceData.behaviors, behavior];
    handleAudienceUpdate({ behaviors: newBehaviors });
  };

  // Toggle diet type overlay
  const toggleDietTypeOverlay = () => {
    const newDietType = {
      ...audienceData.dietType,
      overlay: !audienceData.dietType.overlay,
      types: !audienceData.dietType.overlay ? [] : audienceData.dietType.types // Clear types when disabling overlay
    };
    handleAudienceUpdate({ dietType: newDietType });
  };

  // Toggle individual diet type
  const toggleDietType = (dietType) => {
    const currentTypes = audienceData.dietType.types;
    const newTypes = currentTypes.includes(dietType)
      ? currentTypes.filter(type => type !== dietType)
      : [dietType]; // Only allow one diet type at a time (radio button behavior)
    
    handleAudienceUpdate({
      dietType: { ...audienceData.dietType, types: newTypes }
    });
  };

  const toggleRetailersOverlay = () => {
    const newOverlay = !audienceData.retailers.overlay;
    handleAudienceUpdate({
      retailers: {
        overlay: newOverlay,
        types: newOverlay ? audienceData.retailers.types : [] // Clear types when disabling
      }
    });
  };

  const toggleRetailer = (retailer) => {
    const currentTypes = audienceData.retailers.types;
    const newTypes = currentTypes.includes(retailer)
      ? currentTypes.filter(type => type !== retailer)
      : [retailer]; // Only allow one retailer at a time (radio button behavior)
    
    handleAudienceUpdate({
      retailers: { ...audienceData.retailers, types: newTypes }
    });
  };

  // Auto-generate audience name based on targeting
  const generateAudienceName = (data) => {
    const parts = [];
    
    // Add age range if customized
    const ageRange = data.demographics.age[1] - data.demographics.age[0];
    if (ageRange < 40) {
      parts.push(`${data.demographics.age[0]}-${data.demographics.age[1]}`);
    }
    
    // Add gender if specific
    if (data.demographics.gender !== 'all') {
      parts.push(data.demographics.gender.charAt(0).toUpperCase() + data.demographics.gender.slice(1));
    }
    
    // Add template name
    if (data.template) {
      const template = audienceTemplates.find(t => t.id === data.template);
      if (template) parts.push(template.name.split(' ')[0]);
    }
    
    // Add top interest
    if (data.interests.length > 0) {
      parts.push(data.interests[0]);
    }
    
    // Add top behavior
    if (data.behaviors.length > 0) {
      parts.push(data.behaviors[0].split(' ')[0]); // First word of behavior
    }
    
    // Add diet type if enabled
    if (data.dietType.overlay && data.dietType.types.length > 0) {
      parts.push(data.dietType.types[0].charAt(0).toUpperCase() + data.dietType.types[0].slice(1));
    }
    
    // Add retailer if enabled
    if (data.retailers.overlay && data.retailers.types.length > 0) {
      parts.push(data.retailers.types[0].charAt(0).toUpperCase() + data.retailers.types[0].slice(1));
    }
    
    return parts.length > 0 ? parts.slice(0, 3).join(' + ') + ' Audience' : 'Custom Audience';
  };

  const selectedTemplate = audienceTemplates.find(t => t.id === audienceData.template);

  return (
    <div className="space-y-6">
      {/* Enhanced Audience Builder Header */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Audience Builder</h3>
            <p className="text-sm text-gray-500 mt-1">Define your target audience with precision</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Estimated Reach</p>
              <div className="flex items-center">
                {isEstimating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                ) : (
                  <span className="text-2xl font-bold text-blue-600">
                    {(calculateAudienceSize / 1000000).toFixed(1)}M
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Optional Info Banner */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-blue-700">
              <p className="font-medium">Flexible Audience Targeting</p>
              <p className="mt-1">All targeting options are optional. You can proceed with just the default settings or customize as needed for better precision.</p>
            </div>
          </div>
        </div>

        {/* Audience Name */}
        <div className="mb-6">
          <label htmlFor="audience-name" className="block text-sm font-medium text-gray-700 mb-2">
            Audience Name <span className="text-gray-400 font-normal">(optional - will auto-generate if empty)</span>
          </label>
          <input
            type="text"
            id="audience-name"
            value={audienceData.name}
            onChange={(e) => handleAudienceUpdate({ name: e.target.value })}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Auto-generated based on your targeting selections..."
          />
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'templates', name: 'Templates', icon: '🎯' },
              { id: 'demographics', name: 'Demographics', icon: '👥' },
              { id: 'interests', name: 'Interests', icon: '❤️' },
              { id: 'behaviors', name: 'Behaviors', icon: '📊' },
              { id: 'dietType', name: 'Diet Type', icon: '🥗' },
              { id: 'retailers', name: 'Retailers', icon: '🏬' },
              { id: 'locations', name: 'Locations', icon: '📍' }
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
        {activeTab === 'templates' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Quick Start Templates</h4>
              <p className="text-sm text-gray-500">Pre-built audiences for common demographics</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {audienceTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`relative border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                    audienceData.template === template.id
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => applyTemplate(template)}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-3xl">{template.icon}</span>
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{template.name}</h5>
                      <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-400">
                        <span>Age: {template.demographics.age[0]}-{template.demographics.age[1]}</span>
                        <span>~{(template.estimatedSize / 1000000).toFixed(1)}M people</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {template.platforms.slice(0, 3).map(platform => (
                          <span key={platform} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                            {platform}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {audienceData.template === template.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'demographics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Age Range Slider */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Age Range: {audienceData.demographics.age[0]} - {audienceData.demographics.age[1]} years old
                </label>
                <div className="px-3">
                  <input
                    type="range"
                    min="13"
                    max="75"
                    value={audienceData.demographics.age[0]}
                    onChange={(e) => handleAudienceUpdate({
                      demographics: {
                        ...audienceData.demographics,
                        age: [parseInt(e.target.value), audienceData.demographics.age[1]]
                      }
                    })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="range"
                    min="13"
                    max="75"
                    value={audienceData.demographics.age[1]}
                    onChange={(e) => handleAudienceUpdate({
                      demographics: {
                        ...audienceData.demographics,
                        age: [audienceData.demographics.age[0], parseInt(e.target.value)]
                      }
                    })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-1"
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'All', icon: '👥' },
                    { value: 'male', label: 'Male', icon: '👨' },
                    { value: 'female', label: 'Female', icon: '👩' }
                  ].map(option => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        value={option.value}
                        checked={audienceData.demographics.gender === option.value}
                        onChange={(e) => handleAudienceUpdate({
                          demographics: {
                            ...audienceData.demographics,
                            gender: e.target.value
                          }
                        })}
                        className="mr-3 text-blue-600"
                      />
                      <span className="mr-2">{option.icon}</span>
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Income Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Income Level</label>
                <select
                  value={audienceData.demographics.income}
                  onChange={(e) => handleAudienceUpdate({
                    demographics: {
                      ...audienceData.demographics,
                      income: e.target.value
                    }
                  })}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="any">Any Income</option>
                  <option value="lower">Lower Income (Bottom 25%)</option>
                  <option value="middle">Middle Income (25-75%)</option>
                  <option value="upper">Upper Income (Top 25%)</option>
                </select>
              </div>

              {/* Education */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
                <select
                  value={audienceData.demographics.education}
                  onChange={(e) => handleAudienceUpdate({
                    demographics: {
                      ...audienceData.demographics,
                      education: e.target.value
                    }
                  })}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="any">Any Education</option>
                  <option value="high_school">High School</option>
                  <option value="some_college">Some College</option>
                  <option value="college_plus">College Graduate+</option>
                </select>
              </div>

              {/* Parental Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parental Status</label>
                <select
                  value={audienceData.demographics.parentalStatus}
                  onChange={(e) => handleAudienceUpdate({
                    demographics: {
                      ...audienceData.demographics,
                      parentalStatus: e.target.value
                    }
                  })}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="any">Any</option>
                  <option value="parents">Parents</option>
                  <option value="not_parents">Not Parents</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'interests' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Interest Categories</h4>
              <span className="text-sm text-gray-500">{audienceData.interests.length} selected</span>
            </div>
            
            {Object.entries(interestCategories).map(([category, interests]) => (
              <div key={category} className="border rounded-lg p-4">
                <h5 className="font-medium text-gray-800 mb-3">{category}</h5>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {interests.map(interest => (
                    <label key={interest} className="flex items-center p-2 border rounded cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={audienceData.interests.includes(interest)}
                        onChange={() => toggleInterest(interest)}
                        className="mr-2 text-blue-600"
                      />
                      <span className="text-sm">{interest}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'behaviors' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Behavioral Targeting</h4>
              <span className="text-sm text-gray-500">{audienceData.behaviors.length} selected</span>
            </div>
            
            {Object.entries(behaviorOptions).map(([category, behaviors]) => (
              <div key={category} className="border rounded-lg p-4">
                <h5 className="font-medium text-gray-800 mb-3">{category}</h5>
                <div className="space-y-2">
                  {behaviors.map(behavior => (
                    <label key={behavior} className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={audienceData.behaviors.includes(behavior)}
                        onChange={() => toggleBehavior(behavior)}
                        className="mr-3 text-blue-600"
                      />
                      <span className="text-sm">{behavior}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'dietType' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Diet Type Targeting</h4>
              <span className="text-sm text-gray-500">
                {audienceData.dietType.overlay && audienceData.dietType.types.length > 0 ? 
                  `${audienceData.dietType.types.length} selected` : 
                  'Disabled'
                }
              </span>
            </div>
            
            {/* Overlay Diet Type Toggle */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-gray-800">Overlay Diet Type</h5>
                  <p className="text-sm text-gray-500 mt-1">Target users based on their dietary preferences</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`text-sm font-medium ${audienceData.dietType.overlay ? 'text-green-600' : 'text-gray-500'}`}>
                    {audienceData.dietType.overlay ? 'YES' : 'NO'}
                  </span>
                  <button
                    onClick={toggleDietTypeOverlay}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      audienceData.dietType.overlay ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        audienceData.dietType.overlay ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
              
              {/* Diet Type Options */}
              {audienceData.dietType.overlay && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm font-medium text-gray-700 mb-3">Select diet types to target:</p>
                  {dietTypeOptions.map(option => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        value={option.value}
                        checked={audienceData.dietType.types.includes(option.value)}
                        onChange={() => toggleDietType(option.value)}
                        className="mr-3 text-blue-600"
                        name="dietType"
                      />
                      <span className="mr-2">{option.icon}</span>
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'retailers' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Specific Retailers</h4>
              <span className="text-sm text-gray-500">
                {audienceData.retailers.overlay && audienceData.retailers.types.length > 0 ? 
                  `${audienceData.retailers.types.length} selected` : 
                  'Disabled'
                }
              </span>
            </div>
            
            {/* Overlay Retailers Toggle */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-gray-800">Specific Retailers</h5>
                  <p className="text-sm text-gray-500 mt-1">Target users who shop at specific retail stores</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`text-sm font-medium ${audienceData.retailers.overlay ? 'text-green-600' : 'text-gray-500'}`}>
                    {audienceData.retailers.overlay ? 'YES' : 'NO'}
                  </span>
                  <button
                    onClick={toggleRetailersOverlay}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      audienceData.retailers.overlay ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        audienceData.retailers.overlay ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
              
              {/* Retailer Options */}
              {audienceData.retailers.overlay && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm font-medium text-gray-700 mb-3">Select retailers to target:</p>
                  {retailerOptions.map(option => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        value={option.value}
                        checked={audienceData.retailers.types.includes(option.value)}
                        onChange={() => toggleRetailer(option.value)}
                        className="mr-3 text-blue-600"
                        name="retailer"
                      />
                      <span className="mr-2">{option.icon}</span>
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'locations' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Country</label>
              <select
                value={audienceData.locations.countries[0] || ''}
                onChange={(e) => handleAudienceUpdate({
                  locations: {
                    ...audienceData.locations,
                    countries: [e.target.value]
                  }
                })}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="US">🇺🇸 United States</option>
                <option value="CA">🇨🇦 Canada</option>
                <option value="GB">🇬🇧 United Kingdom</option>
                <option value="AU">🇦🇺 Australia</option>
                <option value="DE">🇩🇪 Germany</option>
                <option value="FR">🇫🇷 France</option>
              </select>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h5 className="font-medium text-blue-800 mb-2">Geographic Targeting</h5>
              <p className="text-sm text-blue-700">
                Advanced location targeting (states, cities, radius) will be available in the platform-specific configuration step.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Audience Summary */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 p-6">
        <h4 className="font-medium text-green-800 mb-4">Audience Summary</h4>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="text-center p-3 bg-white rounded-md border">
            <p className="text-2xl font-bold text-green-600">{(calculateAudienceSize / 1000000).toFixed(1)}M</p>
            <p className="text-sm text-gray-600">Estimated Reach</p>
          </div>
          
          <div className="text-center p-3 bg-white rounded-md border">
            <p className="text-2xl font-bold text-blue-600">{audienceData.interests.length}</p>
            <p className="text-sm text-gray-600">Interests</p>
          </div>
          
          <div className="text-center p-3 bg-white rounded-md border">
            <p className="text-2xl font-bold text-purple-600">{audienceData.behaviors.length}</p>
            <p className="text-sm text-gray-600">Behaviors</p>
          </div>
          
          <div className="text-center p-3 bg-white rounded-md border">
            <p className="text-2xl font-bold text-orange-600">
              {audienceData.dietType.overlay ? audienceData.dietType.types.length : 0}
            </p>
            <p className="text-sm text-gray-600">Diet Types</p>
          </div>
          
          <div className="text-center p-3 bg-white rounded-md border">
            <p className="text-2xl font-bold text-teal-600">
              {audienceData.retailers.overlay ? audienceData.retailers.types.length : 0}
            </p>
            <p className="text-sm text-gray-600">Retailers</p>
          </div>
          
          <div className="text-center p-3 bg-white rounded-md border">
            <p className="text-2xl font-bold text-indigo-600">
              {audienceData.demographics.age[1] - audienceData.demographics.age[0]}
            </p>
            <p className="text-sm text-gray-600">Age Range</p>
          </div>
        </div>

        {selectedTemplate && (
          <div className="mt-4 p-3 bg-white rounded-md border">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Based on template:</span> {selectedTemplate.name}
            </p>
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

export default AudienceBuilder; 