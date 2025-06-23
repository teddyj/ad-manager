import React, { useState, useEffect, useMemo } from 'react';
import { PLATFORMS } from '../constants/platforms';

/**
 * Enhanced Platform Selector Step - Phase 3
 * Third step in Campaign Flow V2 with multi-platform configuration and budget allocation
 */

const PlatformSelector = ({ 
  data, 
  onDataUpdate, 
  onValidationUpdate, 
  campaignData,
  errors 
}) => {
  const defaultPlatformData = {
    selectedPlatforms: ['meta', 'display'], // Default to Meta and Display platforms
    budgetAllocation: 'auto',
    totalBudget: 1000, // Default to 1000 as requested
    platformConfigs: {},
    campaignObjective: 'awareness',
    duration: 7,
    startDate: new Date().toISOString().split('T')[0],
    bidStrategy: 'automatic'
  };

  const [platformData, setPlatformData] = useState(() => {
    // Merge provided data with defaults, ensuring defaults are always present
    return { ...defaultPlatformData, ...(data || {}) };
  });

  const [activeTab, setActiveTab] = useState('selection');
  const [isCalculating, setIsCalculating] = useState(false);
  const [budgetRecommendations, setBudgetRecommendations] = useState(null);

  // Campaign objectives with platform compatibility
  const campaignObjectives = [
    { 
      value: 'awareness', 
      label: 'Brand Awareness', 
      icon: '👁️',
      description: 'Increase visibility and reach',
      platforms: ['meta', 'display', 'ctv', 'tiktok'],
      budgetWeight: 1.0
    },
    { 
      value: 'traffic', 
      label: 'Drive Traffic', 
      icon: '🚗',
      description: 'Send people to your website',
      platforms: ['meta', 'display', 'tiktok'],
      budgetWeight: 0.8
    },
    { 
      value: 'engagement', 
      label: 'Engagement', 
      icon: '❤️',
      description: 'Increase likes, shares, comments',
      platforms: ['meta', 'tiktok'],
      budgetWeight: 0.6
    },
    { 
      value: 'conversions', 
      label: 'Conversions', 
      icon: '🎯',
      description: 'Drive sales and leads',
      platforms: ['meta', 'display', 'ctv'],
      budgetWeight: 1.2
    },
    { 
      value: 'app_installs', 
      label: 'App Installs', 
      icon: '📱',
      description: 'Promote mobile app downloads',
      platforms: ['meta', 'tiktok'],
      budgetWeight: 1.1
    }
  ];

  // Get available platforms based on previous steps
  const getRecommendedPlatforms = useMemo(() => {
    const productData = campaignData?.product;
    const audienceData = campaignData?.audience;
    
    if (!productData) return Object.values(PLATFORMS);
    
    // Get platform scores from product recommendations
    const platformScores = {};
    
    // Category-based scoring
    if (productData.category) {
      const categoryPlatforms = {
        'fashion': { meta: 3, tiktok: 3, display: 1 },
        'electronics': { display: 3, ctv: 2, meta: 1 },
        'health': { meta: 3, tiktok: 2, display: 1 },
        'food': { meta: 2, display: 2, ctv: 2, tiktok: 1 }
      };
      
      const scores = categoryPlatforms[productData.category] || {};
      Object.entries(scores).forEach(([platform, score]) => {
        platformScores[platform] = (platformScores[platform] || 0) + score;
      });
    }
    
    // Price range scoring
    if (productData.priceRange) {
      const priceScores = {
        'budget': { meta: 2, tiktok: 3 },
        'mid': { meta: 2, display: 2 },
        'premium': { display: 3, ctv: 2, meta: 1 },
        'luxury': { display: 3, ctv: 3 }
      };
      
      const scores = priceScores[productData.priceRange] || {};
      Object.entries(scores).forEach(([platform, score]) => {
        platformScores[platform] = (platformScores[platform] || 0) + score;
      });
    }
    
    // Audience demographic scoring
    if (audienceData?.demographics?.age) {
      const ageRange = audienceData.demographics.age;
      const avgAge = (ageRange[0] + ageRange[1]) / 2;
      
      if (avgAge < 30) {
        platformScores.tiktok = (platformScores.tiktok || 0) + 3;
        platformScores.meta = (platformScores.meta || 0) + 2;
      } else if (avgAge > 45) {
        platformScores.display = (platformScores.display || 0) + 2;
        platformScores.ctv = (platformScores.ctv || 0) + 2;
      } else {
        platformScores.meta = (platformScores.meta || 0) + 2;
        platformScores.display = (platformScores.display || 0) + 1;
      }
    }
    
    // Convert to sorted array with platform details
    return Object.entries(PLATFORMS)
      .map(([key, platform]) => ({
        ...platform,
        id: key.toLowerCase(),
        score: platformScores[key.toLowerCase()] || 0,
        recommended: (platformScores[key.toLowerCase()] || 0) >= 3
      }))
      .sort((a, b) => b.score - a.score);
  }, [campaignData]);

  // Calculate smart budget allocation
  const calculateBudgetAllocation = useMemo(() => {
    if (!platformData?.selectedPlatforms?.length) return {};
    
    const selectedPlatforms = (platformData?.selectedPlatforms || []).map(id => 
      getRecommendedPlatforms.find(p => p.id === id)
    ).filter(Boolean);
    
    const totalScore = selectedPlatforms.reduce((sum, platform) => sum + platform.score, 0);
    const objective = campaignObjectives.find(obj => obj.value === platformData?.campaignObjective);
    
    const allocation = {};
    let remainingBudget = platformData?.totalBudget || 0;
    
    selectedPlatforms.forEach((platform, index) => {
      const isLast = index === selectedPlatforms.length - 1;
      
      if (isLast) {
        // Give remaining budget to last platform
        allocation[platform.id] = Math.max(remainingBudget, platform.minBudget || 100);
      } else {
        // Calculate proportional allocation based on score
        const scoreRatio = platform.score / totalScore;
        const objectiveMultiplier = objective?.budgetWeight || 1;
        let platformBudget = Math.floor((platformData?.totalBudget || 0) * scoreRatio * objectiveMultiplier);
        
        // Ensure minimum budget
        platformBudget = Math.max(platformBudget, platform.minBudget || 100);
        
        allocation[platform.id] = platformBudget;
        remainingBudget -= platformBudget;
      }
    });
    
    return allocation;
  }, [platformData?.selectedPlatforms, platformData?.totalBudget, platformData?.campaignObjective, getRecommendedPlatforms]);

  // Enhanced validation with platform-specific checks
  const validatePlatformData = (data) => {
    const errors = [];
    const warnings = [];
    
    // Use the current platformData if no data provided (for initial validation)
    const validationData = data || platformData;
    

    // More lenient validation - only require platform selection if none are selected
    if (!validationData?.selectedPlatforms || validationData.selectedPlatforms.length === 0) {
      errors.push('At least one platform must be selected');
    }
    
    // Set reasonable minimum budget  
    if (!validationData?.totalBudget || validationData.totalBudget < 100) {
      errors.push('Minimum total budget is $100');
    }
    
    // Check minimum budgets for selected platforms
    (validationData?.selectedPlatforms || []).forEach(platformId => {
      const platform = getRecommendedPlatforms.find(p => p.id === platformId);
      const allocatedBudget = calculateBudgetAllocation[platformId] || 0;
      
      if (platform && allocatedBudget < (platform.minBudget || 100)) {
        warnings.push(`${platform.name} requires minimum $${platform.minBudget || 100} budget`);
      }
    });
    
    // Duration warnings
    if (validationData?.duration && validationData.duration < 3) {
      warnings.push('Campaigns shorter than 3 days may have limited optimization');
    } else if (validationData?.duration && validationData.duration > 30) {
      warnings.push('Long campaigns may require budget adjustments');
    }
    
    // Platform compatibility warnings
    const objective = campaignObjectives.find(obj => obj.value === validationData?.campaignObjective);
    if (objective && validationData?.selectedPlatforms) {
      validationData.selectedPlatforms.forEach(platformId => {
        if (!objective.platforms.includes(platformId)) {
          warnings.push(`${platformId.toUpperCase()} may not be optimal for ${objective.label}`);
        }
      });
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      totalBudget: validationData?.totalBudget || 0,
      dailyBudget: Math.round((validationData?.totalBudget || 0) / (validationData?.duration || 7)),
      platformCount: validationData?.selectedPlatforms?.length || 0
    };
  };

  // Initial validation run on mount to set proper validation state
  useEffect(() => {
    // Only run validation when getRecommendedPlatforms is ready
    if (getRecommendedPlatforms.length > 0) {
      const validation = validatePlatformData(platformData);
      onValidationUpdate(validation);
    }
  }, [getRecommendedPlatforms.length]); // Run when platforms are loaded

  // Update validation when platform data changes
  useEffect(() => {
    const validation = validatePlatformData(platformData);
    onValidationUpdate(validation);
  }, [platformData]); // Removed onValidationUpdate to prevent infinite renders

  // Calculate budget recommendations when selection changes
  useEffect(() => {
    if (platformData?.selectedPlatforms?.length > 0) {
      setIsCalculating(true);
      
      // Simulate AI budget calculation
      setTimeout(() => {
        const allocation = calculateBudgetAllocation;
        const recommendations = {
          allocation,
          totalMinimum: Object.values(allocation).reduce((sum, budget) => sum + budget, 0),
          suggestions: [
            'Consider increasing budget for higher-scoring platforms',
            'Test with smaller budgets initially, then scale successful campaigns',
            'Monitor performance daily and adjust allocation as needed'
          ]
        };
        
        setBudgetRecommendations(recommendations);
        setIsCalculating(false);
      }, 1200);
    } else {
      setBudgetRecommendations(null);
    }
  }, [platformData?.selectedPlatforms, calculateBudgetAllocation]);

  // Handle platform data updates
  const handlePlatformUpdate = (updates) => {
    const newData = { ...platformData, ...updates };
    setPlatformData(newData);
    onDataUpdate(newData);
  };

  // Toggle platform selection
  const togglePlatform = (platformId) => {
    const currentSelected = platformData?.selectedPlatforms || [];
    const newSelected = currentSelected.includes(platformId)
      ? currentSelected.filter(id => id !== platformId)
      : [...currentSelected, platformId];
    
    handlePlatformUpdate({ selectedPlatforms: newSelected });
  };

  // Handle budget allocation method change
  const handleBudgetMethodChange = (method) => {
    const updates = { budgetAllocation: method };
    
    if (method === 'auto') {
      // Reset to automatic allocation
      updates.platformConfigs = {};
    }
    
    handlePlatformUpdate(updates);
  };

  // Handle manual budget allocation
  const handleManualBudgetChange = (platformId, budget) => {
    const newConfigs = {
      ...(platformData?.platformConfigs || {}),
      [platformId]: {
        ...(platformData?.platformConfigs?.[platformId] || {}),
        budget: parseInt(budget) || 0
      }
    };
    
    handlePlatformUpdate({ platformConfigs: newConfigs });
  };

  const selectedObjective = campaignObjectives.find(obj => obj.value === platformData?.campaignObjective);

  return (
    <div className="space-y-6">
      {/* Enhanced Platform Selector Header */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Platform Selection</h3>
            <p className="text-sm text-gray-500 mt-1">Choose where to run your campaign</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Budget</p>
              <span className="text-2xl font-bold text-green-600">
                ${(platformData?.totalBudget || 0).toLocaleString()}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Platforms</p>
              <span className="text-2xl font-bold text-blue-600">
                {platformData?.selectedPlatforms?.length || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'selection', name: 'Platform Selection', icon: '🎯' },
              { id: 'budget', name: 'Budget Allocation', icon: '💰' },
              { id: 'objectives', name: 'Campaign Settings', icon: '⚙️' },
              { id: 'summary', name: 'Summary', icon: '📊' }
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
        {activeTab === 'selection' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Available Platforms</h4>
              <p className="text-sm text-gray-500">
                {platformData?.selectedPlatforms?.length || 0} of {getRecommendedPlatforms.length} selected
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {getRecommendedPlatforms.map((platform) => {
                const isSelected = (platformData?.selectedPlatforms || []).includes(platform.id);
                const isRecommended = platform.recommended;
                
                return (
                  <div
                    key={platform.id}
                    className={`relative border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => togglePlatform(platform.id)}
                  >
                    {isRecommended && (
                      <div className="absolute top-2 right-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Recommended
                      </div>
                    )}
                    
                    <div className="flex items-start space-x-4">
                      <span className="text-4xl">{platform.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h5 className="font-medium text-gray-900">{platform.name}</h5>
                          {platform.score > 0 && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                              Score: {platform.score}/7
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{platform.description}</p>
                        
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center space-x-4 text-xs text-gray-600">
                            <span>Min Budget: ${platform.minimumBudget}</span>
                            <span>Formats: {platform.formats.length}</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            {platform.formats.slice(0, 3).map(format => (
                              <span key={format} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                                {format}
                              </span>
                            ))}
                            {platform.formats.length > 3 && (
                              <span className="text-xs text-gray-400">
                                +{platform.formats.length - 3} more
                              </span>
                            )}
                          </div>
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
            
            {/* Quick Selection Options */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-800 mb-3">Quick Selection</h5>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handlePlatformUpdate({ selectedPlatforms: ['meta', 'tiktok'] })}
                  className="px-3 py-2 bg-white border rounded-md text-sm hover:bg-gray-50"
                >
                  Social Media Focus
                </button>
                <button
                  onClick={() => handlePlatformUpdate({ selectedPlatforms: ['display', 'ctv'] })}
                  className="px-3 py-2 bg-white border rounded-md text-sm hover:bg-gray-50"
                >
                  Display Network
                </button>
                <button
                  onClick={() => handlePlatformUpdate({ selectedPlatforms: getRecommendedPlatforms.filter(p => p.recommended).map(p => p.id) })}
                  className="px-3 py-2 bg-blue-100 border border-blue-200 rounded-md text-sm text-blue-700 hover:bg-blue-200"
                >
                  All Recommended
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'budget' && (
          <div className="space-y-6">
            {(platformData?.selectedPlatforms?.length || 0) === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <span className="text-4xl block mb-2">💰</span>
                <p>Select platforms first to configure budget allocation</p>
              </div>
            ) : (
              <>
                {/* Total Budget */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="total-budget" className="block text-sm font-medium text-gray-700 mb-2">
                      Total Campaign Budget *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        id="total-budget"
                        value={platformData?.totalBudget || 0}
                        onChange={(e) => handlePlatformUpdate({ totalBudget: parseInt(e.target.value) || 0 })}
                        className="block w-full pl-7 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="1000"
                        min="100"
                        step="100"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                      Campaign Duration (days)
                    </label>
                    <input
                      type="number"
                      id="duration"
                      value={platformData?.duration || 7}
                      onChange={(e) => handlePlatformUpdate({ duration: parseInt(e.target.value) || 1 })}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      min="1"
                      max="90"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Daily budget: ${Math.round((platformData?.totalBudget || 0) / (platformData?.duration || 7))}
                    </p>
                  </div>
                </div>

                {/* Budget Allocation Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Budget Allocation Method
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="auto"
                        checked={(platformData?.budgetAllocation || 'auto') === 'auto'}
                        onChange={(e) => handleBudgetMethodChange(e.target.value)}
                        className="mr-3 text-blue-600"
                      />
                      <div>
                        <span className="font-medium">🤖 Automatic (Recommended)</span>
                        <p className="text-sm text-gray-500">AI-optimized allocation based on platform performance</p>
                      </div>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="manual"
                        checked={(platformData?.budgetAllocation || 'auto') === 'manual'}
                        onChange={(e) => handleBudgetMethodChange(e.target.value)}
                        className="mr-3 text-blue-600"
                      />
                      <div>
                        <span className="font-medium">✋ Manual</span>
                        <p className="text-sm text-gray-500">Set custom budget for each platform</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Budget Allocation Display */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="font-medium text-gray-800">Budget Allocation</h5>
                    {isCalculating && (
                      <div className="flex items-center text-blue-600 text-sm">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        Calculating...
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    {(platformData?.selectedPlatforms || []).map(platformId => {
                      const platform = getRecommendedPlatforms.find(p => p.id === platformId);
                      const allocatedBudget = calculateBudgetAllocation[platformId] || 0;
                      const percentage = ((allocatedBudget / (platformData?.totalBudget || 1)) * 100).toFixed(1);
                      
                      return (
                        <div key={platformId} className="flex items-center justify-between p-3 bg-white rounded-md border">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{platform?.icon}</span>
                            <div>
                              <p className="font-medium text-gray-900">{platform?.name}</p>
                              <p className="text-sm text-gray-500">{percentage}% of total budget</p>
                            </div>
                          </div>
                          
                          {(platformData?.budgetAllocation || 'auto') === 'manual' ? (
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-500">$</span>
                              <input
                                type="number"
                                value={platformData?.platformConfigs?.[platformId]?.budget || allocatedBudget}
                                onChange={(e) => handleManualBudgetChange(platformId, e.target.value)}
                                className="w-24 border-gray-300 rounded-md text-sm"
                                min={platform?.minimumBudget || 100}
                              />
                            </div>
                          ) : (
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-600">${allocatedBudget}</p>
                              <p className="text-xs text-gray-500">
                                Min: ${platform?.minimumBudget || 100}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Budget Recommendations */}
                {budgetRecommendations && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-medium text-blue-800 mb-3">💡 Budget Recommendations</h5>
                    <div className="space-y-2">
                      {budgetRecommendations.suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-start">
                          <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></span>
                          <p className="text-sm text-blue-700">{suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'objectives' && (
          <div className="space-y-6">
            {/* Campaign Objective */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Campaign Objective *
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {campaignObjectives.map(objective => (
                  <label
                    key={objective.value}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                      (platformData?.campaignObjective || '') === objective.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      value={objective.value}
                      checked={(platformData?.campaignObjective || '') === objective.value}
                      onChange={(e) => handlePlatformUpdate({ campaignObjective: e.target.value })}
                      className="sr-only"
                    />
                    <span className="text-2xl mr-3">{objective.icon}</span>
                    <div>
                      <p className="font-medium text-gray-900">{objective.label}</p>
                      <p className="text-sm text-gray-500">{objective.description}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {objective.platforms.map(platform => (
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

            {/* Campaign Settings */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  id="start-date"
                  value={platformData?.startDate || ''}
                  onChange={(e) => handlePlatformUpdate({ startDate: e.target.value })}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label htmlFor="bid-strategy" className="block text-sm font-medium text-gray-700 mb-2">
                  Bid Strategy
                </label>
                <select
                  id="bid-strategy"
                  value={platformData?.bidStrategy || 'automatic'}
                  onChange={(e) => handlePlatformUpdate({ bidStrategy: e.target.value })}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="automatic">Automatic (Recommended)</option>
                  <option value="manual_cpc">Manual CPC</option>
                  <option value="target_cpa">Target CPA</option>
                  <option value="maximize_clicks">Maximize Clicks</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="space-y-6">
            <h4 className="font-medium text-gray-900">Campaign Summary</h4>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-2xl font-bold text-green-600">${platformData?.totalBudget || 0}</p>
                <p className="text-sm text-gray-600">Total Budget</p>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-2xl font-bold text-blue-600">{platformData?.selectedPlatforms?.length || 0}</p>
                <p className="text-sm text-gray-600">Platforms</p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-2xl font-bold text-purple-600">{platformData?.duration || 7}</p>
                <p className="text-sm text-gray-600">Days</p>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-2xl font-bold text-orange-600">
                  ${Math.round((platformData?.totalBudget || 0) / (platformData?.duration || 7))}
                </p>
                <p className="text-sm text-gray-600">Daily Budget</p>
              </div>
            </div>

            {/* Selected Platforms Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-800 mb-3">Selected Platforms</h5>
              <div className="space-y-2">
                {(platformData?.selectedPlatforms || []).map(platformId => {
                  const platform = getRecommendedPlatforms.find(p => p.id === platformId);
                  const budget = calculateBudgetAllocation[platformId] || 0;
                  
                  return (
                    <div key={platformId} className="flex items-center justify-between p-3 bg-white rounded-md border">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{platform?.icon}</span>
                        <span className="font-medium">{platform?.name}</span>
                      </div>
                      <span className="text-green-600 font-medium">${budget}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Campaign Objective Summary */}
            {selectedObjective && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{selectedObjective.icon}</span>
                  <div>
                    <p className="font-medium text-blue-900">{selectedObjective.label}</p>
                    <p className="text-sm text-blue-700">{selectedObjective.description}</p>
                  </div>
                </div>
              </div>
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

export default PlatformSelector; 