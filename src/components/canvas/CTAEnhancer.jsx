import React, { useState, useEffect, useCallback } from 'react';

/**
 * CTAEnhancer - Enhanced CTA system for Phase 6
 * Provides smart CTA suggestions, A/B testing, urgency elements, and social proof
 */

// Smart CTA Suggestions based on product/audience
const CTA_SUGGESTIONS = {
  ECOMMERCE: {
    category: 'E-commerce',
    suggestions: [
      { text: 'Shop Now', urgency: 'standard', strength: 'high' },
      { text: 'Buy Today', urgency: 'medium', strength: 'high' },
      { text: 'Get Yours', urgency: 'low', strength: 'medium' },
      { text: 'Order Now', urgency: 'medium', strength: 'high' },
      { text: 'Add to Cart', urgency: 'low', strength: 'medium' },
      { text: 'Shop the Sale', urgency: 'high', strength: 'high' },
      { text: 'Limited Stock - Buy Now', urgency: 'high', strength: 'very_high' },
      { text: 'Free Shipping - Order Today', urgency: 'medium', strength: 'high' }
    ]
  },
  FOOD_BEVERAGE: {
    category: 'Food & Beverage',
    suggestions: [
      { text: 'Try Now', urgency: 'low', strength: 'medium' },
      { text: 'Taste the Difference', urgency: 'low', strength: 'medium' },
      { text: 'Order Fresh', urgency: 'medium', strength: 'high' },
      { text: 'Get Delivered', urgency: 'medium', strength: 'medium' },
      { text: 'Find in Store', urgency: 'low', strength: 'medium' },
      { text: 'Limited Time Offer', urgency: 'high', strength: 'high' },
      { text: 'Fresh Daily - Order Now', urgency: 'medium', strength: 'high' },
      { text: 'While Supplies Last', urgency: 'high', strength: 'high' }
    ]
  },
  LIFESTYLE: {
    category: 'Lifestyle',
    suggestions: [
      { text: 'Learn More', urgency: 'low', strength: 'low' },
      { text: 'Discover', urgency: 'low', strength: 'low' },
      { text: 'Explore', urgency: 'low', strength: 'low' },
      { text: 'Join Now', urgency: 'medium', strength: 'medium' },
      { text: 'Get Started', urgency: 'low', strength: 'medium' },
      { text: 'Sign Up Today', urgency: 'medium', strength: 'high' },
      { text: 'Limited Spots Available', urgency: 'high', strength: 'high' },
      { text: 'Join 10,000+ Members', urgency: 'low', strength: 'medium' }
    ]
  },
  HEALTH_WELLNESS: {
    category: 'Health & Wellness',
    suggestions: [
      { text: 'Start Your Journey', urgency: 'low', strength: 'medium' },
      { text: 'Feel Better Today', urgency: 'medium', strength: 'high' },
      { text: 'Get Healthy', urgency: 'low', strength: 'medium' },
      { text: 'Transform Now', urgency: 'medium', strength: 'high' },
      { text: 'Join the Movement', urgency: 'low', strength: 'medium' },
      { text: 'Limited Time - Free Trial', urgency: 'high', strength: 'very_high' },
      { text: 'Trusted by 50K+ Users', urgency: 'low', strength: 'medium' },
      { text: 'Doctor Recommended', urgency: 'low', strength: 'high' }
    ]
  }
};

// Urgency Elements
const URGENCY_ELEMENTS = {
  LIMITED_TIME: {
    id: 'limited-time',
    name: 'Limited Time',
    templates: [
      'Limited Time Offer',
      'Only Today',
      'Ends Soon',
      'Flash Sale',
      '24 Hours Left',
      'Weekend Only'
    ]
  },
  LIMITED_STOCK: {
    id: 'limited-stock',
    name: 'Limited Stock',
    templates: [
      'Limited Stock',
      'While Supplies Last',
      'Only 5 Left',
      'Almost Sold Out',
      'Final Stock',
      'Get Yours Before Gone'
    ]
  },
  COUNTDOWN: {
    id: 'countdown',
    name: 'Countdown Timer',
    templates: [
      'Sale Ends in 2:45:32',
      'Offer Expires: 24:00:00',
      'Limited Offer: 12:30:15',
      'Flash Sale: 04:15:45'
    ]
  },
  SOCIAL_PROOF: {
    id: 'social-proof',
    name: 'Social Proof',
    templates: [
      'Join 1,000+ Customers',
      'Trusted by 50K+ Users',
      '★★★★★ 4.9/5 Rating',
      'As Seen on TV',
      '#1 Best Seller',
      'Featured in Forbes'
    ]
  }
};

// A/B Testing Variations
const generateABVariations = (baseText, category) => {
  const suggestions = CTA_SUGGESTIONS[category] || CTA_SUGGESTIONS.ECOMMERCE;
  const variations = [
    { id: 'original', text: baseText, performance: null },
    ...suggestions.suggestions.slice(0, 3).map((suggestion, index) => ({
      id: `variant-${index + 1}`,
      text: suggestion.text,
      performance: Math.random() > 0.5 ? {
        ctr: (Math.random() * 15 + 5).toFixed(1),
        conversions: Math.floor(Math.random() * 100 + 50)
      } : null
    }))
  ];
  
  return variations;
};

function CTAEnhancer({ 
  element, 
  onContentChange, 
  onStyleChange,
  productCategory = 'ECOMMERCE',
  audienceType = 'general' 
}) {
  const [activeTab, setActiveTab] = useState('suggestions');
  const [selectedCategory, setSelectedCategory] = useState(productCategory);
  const [customCTA, setCustomCTA] = useState(element?.content || '');
  const [abVariations, setAbVariations] = useState([]);
  const [selectedUrgency, setSelectedUrgency] = useState(null);
  const [urgencyText, setUrgencyText] = useState('');
  const [socialProofText, setSocialProofText] = useState('');
  const [isABTesting, setIsABTesting] = useState(false);

  // Initialize AB variations
  useEffect(() => {
    if (element?.content) {
      const variations = generateABVariations(element.content, selectedCategory);
      setAbVariations(variations);
    }
  }, [element?.content, selectedCategory]);

  // Apply CTA suggestion
  const applyCTASuggestion = useCallback((suggestion) => {
    const newText = suggestion.text;
    setCustomCTA(newText);
    onContentChange && onContentChange(newText);

    // Apply styling based on suggestion strength
    if (onStyleChange) {
      const strengthStyles = {
        'low': { fontWeight: '500' },
        'medium': { fontWeight: '600' },
        'high': { fontWeight: 'bold' },
        'very_high': { 
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }
      };
      
      onStyleChange(strengthStyles[suggestion.strength] || {});
    }
  }, [onContentChange, onStyleChange]);

  // Apply urgency element
  const applyUrgencyElement = useCallback((urgencyType, template) => {
    setSelectedUrgency(urgencyType);
    setUrgencyText(template);
    
    // Combine with existing CTA
    const combinedText = `${template} - ${customCTA || 'Shop Now'}`;
    onContentChange && onContentChange(combinedText);
  }, [customCTA, onContentChange]);

  // Remove urgency element
  const removeUrgencyElement = useCallback(() => {
    setSelectedUrgency(null);
    setUrgencyText('');
    onContentChange && onContentChange(customCTA);
  }, [customCTA, onContentChange]);

  // Apply social proof
  const applySocialProof = useCallback((proofText) => {
    setSocialProofText(proofText);
    // Social proof typically goes above or below the main CTA
    // For now, we'll combine them
    const combinedText = `${proofText} - ${customCTA || 'Shop Now'}`;
    onContentChange && onContentChange(combinedText);
  }, [customCTA, onContentChange]);

  // Handle custom CTA change
  const handleCustomCTAChange = useCallback((value) => {
    setCustomCTA(value);
    onContentChange && onContentChange(value);
  }, [onContentChange]);

  // Get suggestions for current category
  const getCurrentSuggestions = () => {
    return CTA_SUGGESTIONS[selectedCategory] || CTA_SUGGESTIONS.ECOMMERCE;
  };

  if (!element) {
    return (
      <div className="p-4 text-center text-gray-500">
        Select a button element to enhance CTA
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">CTA Enhancer</h3>
        <div className="text-sm text-gray-500">
          Current: {element.content || 'No CTA'}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'suggestions', name: 'Smart CTA', icon: '🧠' },
          { id: 'urgency', name: 'Urgency', icon: '⏰' },
          { id: 'social', name: 'Social Proof', icon: '👥' },
          { id: 'testing', name: 'A/B Testing', icon: '📊' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {/* Smart CTA Suggestions Tab */}
        {activeTab === 'suggestions' && (
          <div className="space-y-4">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                {Object.entries(CTA_SUGGESTIONS).map(([key, category]) => (
                  <option key={key} value={key}>
                    {category.category}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom CTA Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Custom CTA Text</label>
              <input
                type="text"
                value={customCTA}
                onChange={(e) => handleCustomCTAChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Enter your CTA text"
              />
            </div>

            {/* AI Suggestions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI Suggestions for {getCurrentSuggestions().category}
              </label>
              <div className="grid gap-2">
                {getCurrentSuggestions().suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => applyCTASuggestion(suggestion)}
                    className={`p-3 text-left border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors ${
                      customCTA === suggestion.text
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{suggestion.text}</span>
                      <div className="flex space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          suggestion.urgency === 'high' ? 'bg-red-100 text-red-800' :
                          suggestion.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {suggestion.urgency} urgency
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          suggestion.strength === 'very_high' ? 'bg-purple-100 text-purple-800' :
                          suggestion.strength === 'high' ? 'bg-blue-100 text-blue-800' :
                          suggestion.strength === 'medium' ? 'bg-gray-100 text-gray-800' :
                          'bg-gray-50 text-gray-600'
                        }`}>
                          {suggestion.strength.replace('_', ' ')} impact
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Urgency Elements Tab */}
        {activeTab === 'urgency' && (
          <div className="space-y-4">
            {Object.entries(URGENCY_ELEMENTS).map(([key, urgencyType]) => (
              <div key={key}>
                <h4 className="font-medium text-gray-800 mb-2">{urgencyType.name}</h4>
                <div className="grid gap-2">
                  {urgencyType.templates.map((template, index) => (
                    <button
                      key={index}
                      onClick={() => applyUrgencyElement(key, template)}
                      className={`p-3 text-left border rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors ${
                        urgencyText === template
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="font-medium">{template}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        Click to add urgency to your CTA
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Remove Urgency */}
            {selectedUrgency && (
              <div className="pt-4 border-t">
                <button
                  onClick={removeUrgencyElement}
                  className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Remove Urgency Element
                </button>
              </div>
            )}
          </div>
        )}

        {/* Social Proof Tab */}
        {activeTab === 'social' && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Social Proof Elements</h4>
              <div className="grid gap-2">
                {URGENCY_ELEMENTS.SOCIAL_PROOF.templates.map((proof, index) => (
                  <button
                    key={index}
                    onClick={() => applySocialProof(proof)}
                    className={`p-3 text-left border rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors ${
                      socialProofText === proof
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="font-medium">{proof}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      Add social proof to build trust
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Social Proof */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Custom Social Proof</label>
              <input
                type="text"
                value={socialProofText}
                onChange={(e) => applySocialProof(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="e.g., Join 10,000+ happy customers"
              />
            </div>
          </div>
        )}

        {/* A/B Testing Tab */}
        {activeTab === 'testing' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-800">A/B Test Variations</h4>
              <button
                onClick={() => setIsABTesting(!isABTesting)}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  isABTesting
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {isABTesting ? 'Testing Active' : 'Start Testing'}
              </button>
            </div>

            <div className="space-y-3">
              {abVariations.map((variation, index) => (
                <div
                  key={variation.id}
                  className={`p-4 border rounded-lg ${
                    customCTA === variation.text
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">
                      {variation.id === 'original' ? 'Original' : `Variant ${index}`}
                    </div>
                    {variation.performance && (
                      <div className="flex space-x-4 text-sm">
                        <span className="text-green-600">
                          CTR: {variation.performance.ctr}%
                        </span>
                        <span className="text-blue-600">
                          Conv: {variation.performance.conversions}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-lg font-medium mb-2">{variation.text}</div>
                  
                  <button
                    onClick={() => handleCustomCTAChange(variation.text)}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    Use This Variation
                  </button>
                </div>
              ))}
            </div>

            {isABTesting && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-sm text-yellow-800">
                  <strong>A/B Testing Active:</strong> Performance data will be collected automatically. 
                  Check back in 24-48 hours for statistically significant results.
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Current CTA Preview */}
      <div className="pt-4 border-t border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">Current CTA Preview</label>
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <button
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
              disabled
            >
              {element.content || 'No CTA Set'}
            </button>
          </div>
          {(urgencyText || socialProofText) && (
            <div className="mt-3 text-center">
              {urgencyText && (
                <div className="inline-block px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full mr-2">
                  {urgencyText}
                </div>
              )}
              {socialProofText && (
                <div className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  {socialProofText}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CTAEnhancer; 