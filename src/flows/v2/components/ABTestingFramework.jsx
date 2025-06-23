import React, { useState, useEffect } from 'react';

/**
 * A/B Testing Framework Component - Phase 5
 * Advanced testing capabilities for campaign optimization
 */

const ABTestingFramework = ({ campaignData, onTestUpdate }) => {
  const [activeTests, setActiveTests] = useState([]);
  const [testHistory, setTestHistory] = useState([]);
  const [isCreatingTest, setIsCreatingTest] = useState(false);
  const [newTestConfig, setNewTestConfig] = useState({
    name: '',
    type: 'creative',
    hypothesis: '',
    variants: [
      { id: 'A', name: 'Control', description: '' },
      { id: 'B', name: 'Variant', description: '' }
    ],
    duration: 7,
    trafficSplit: 50,
    successMetric: 'conversions',
    minimumSampleSize: 1000
  });

  // Initialize with sample tests
  useEffect(() => {
    setActiveTests([
      {
        id: 'test_001',
        name: 'Creative CTA Optimization',
        type: 'creative',
        status: 'running',
        hypothesis: 'Adding urgency words to CTA will increase conversion rate',
        startDate: '2024-01-15',
        endDate: '2024-01-22',
        successMetric: 'conversions',
        variants: [
          {
            id: 'A',
            name: 'Control - "Shop Now"',
            description: 'Original CTA button',
            traffic: 50,
            impressions: 15420,
            clicks: 324,
            conversions: 45,
            ctr: 2.1,
            conversionRate: 13.9,
            cost: 486.50
          },
          {
            id: 'B',
            name: 'Variant - "Limited Time - Shop Now!"',
            description: 'CTA with urgency messaging',
            traffic: 50,
            impressions: 15680,
            clicks: 376,
            conversions: 58,
            ctr: 2.4,
            conversionRate: 15.4,
            cost: 492.30
          }
        ],
        confidence: 87,
        significance: 0.13,
        winner: null,
        insights: [
          'Variant B shows 28% higher conversion rate',
          'CTR improvement of 14% with urgency messaging',
          'Cost per conversion decreased by $2.15'
        ]
      },
      {
        id: 'test_002',
        name: 'Audience Targeting Comparison',
        type: 'audience',
        status: 'running',
        hypothesis: 'Interest-based targeting will outperform broad demographic targeting',
        startDate: '2024-01-12',
        endDate: '2024-01-19',
        successMetric: 'ctr',
        variants: [
          {
            id: 'A',
            name: 'Broad Demographics',
            description: 'Age 25-45, All genders',
            traffic: 50,
            impressions: 28450,
            clicks: 512,
            conversions: 38,
            ctr: 1.8,
            conversionRate: 7.4,
            cost: 768.90
          },
          {
            id: 'B',
            name: 'Interest-Based',
            description: 'Technology enthusiasts, Early adopters',
            traffic: 50,
            impressions: 12680,
            clicks: 456,
            conversions: 52,
            ctr: 3.6,
            conversionRate: 11.4,
            cost: 634.20
          }
        ],
        confidence: 95,
        significance: 0.05,
        winner: 'B',
        insights: [
          'Interest-based targeting achieved 100% higher CTR',
          '54% improvement in conversion rate',
          '17% lower cost per conversion'
        ]
      }
    ]);

    setTestHistory([
      {
        id: 'test_h001',
        name: 'Landing Page Headline Test',
        type: 'landing_page',
        status: 'completed',
        completedDate: '2024-01-10',
        winner: 'B',
        improvement: '+23% conversions',
        confidence: 98
      },
      {
        id: 'test_h002',
        name: 'Budget Allocation Test',
        type: 'budget',
        status: 'completed',
        completedDate: '2024-01-05',
        winner: 'A',
        improvement: '+15% ROAS',
        confidence: 92
      }
    ]);
  }, []);

  // Statistical significance calculation
  const calculateSignificance = (variantA, variantB, metric = 'conversionRate') => {
    const aConversions = variantA.conversions;
    const aVisitors = variantA.clicks;
    const bConversions = variantB.conversions;
    const bVisitors = variantB.clicks;

    if (aVisitors === 0 || bVisitors === 0) return { confidence: 0, significance: 1 };

    const aRate = aConversions / aVisitors;
    const bRate = bConversions / bVisitors;
    
    const pooledRate = (aConversions + bConversions) / (aVisitors + bVisitors);
    const standardError = Math.sqrt(pooledRate * (1 - pooledRate) * (1/aVisitors + 1/bVisitors));
    
    if (standardError === 0) return { confidence: 0, significance: 1 };
    
    const zScore = Math.abs(aRate - bRate) / standardError;
    const pValue = 2 * (1 - normalCDF(Math.abs(zScore)));
    
    return {
      confidence: Math.round((1 - pValue) * 100),
      significance: pValue,
      zScore
    };
  };

  // Normal cumulative distribution function approximation
  const normalCDF = (x) => {
    return 0.5 * (1 + erf(x / Math.sqrt(2)));
  };

  // Error function approximation
  const erf = (x) => {
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  };

  // Create new A/B test
  const createTest = () => {
    const newTest = {
      id: `test_${Date.now()}`,
      ...newTestConfig,
      status: 'running',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + newTestConfig.duration * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      variants: newTestConfig.variants.map(variant => ({
        ...variant,
        traffic: newTestConfig.trafficSplit,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        ctr: 0,
        conversionRate: 0,
        cost: 0
      })),
      confidence: 0,
      significance: 1,
      winner: null,
      insights: []
    };

    setActiveTests(prev => [newTest, ...prev]);
    setIsCreatingTest(false);
    
    // Reset form
    setNewTestConfig({
      name: '',
      type: 'creative',
      hypothesis: '',
      variants: [
        { id: 'A', name: 'Control', description: '' },
        { id: 'B', name: 'Variant', description: '' }
      ],
      duration: 7,
      trafficSplit: 50,
      successMetric: 'conversions',
      minimumSampleSize: 1000
    });

    if (onTestUpdate) {
      onTestUpdate(newTest);
    }
  };

  // Stop test and declare winner
  const stopTest = (testId, winnerId) => {
    setActiveTests(prev => 
      prev.map(test => {
        if (test.id === testId) {
          const updatedTest = {
            ...test,
            status: 'completed',
            winner: winnerId,
            completedDate: new Date().toISOString().split('T')[0]
          };
          
          // Move to history
          setTestHistory(prevHistory => [updatedTest, ...prevHistory]);
          
          return updatedTest;
        }
        return test;
      })
    );
  };

  // Add variant to test
  const addVariant = () => {
    const nextLetter = String.fromCharCode(65 + newTestConfig.variants.length);
    setNewTestConfig(prev => ({
      ...prev,
      variants: [...prev.variants, {
        id: nextLetter,
        name: `Variant ${nextLetter}`,
        description: ''
      }]
    }));
  };

  // Remove variant from test
  const removeVariant = (variantId) => {
    if (newTestConfig.variants.length <= 2) return; // Minimum 2 variants
    
    setNewTestConfig(prev => ({
      ...prev,
      variants: prev.variants.filter(v => v.id !== variantId)
    }));
  };

  return (
    <div className="space-y-6">
      {/* A/B Testing Header */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">🧪 A/B Testing Framework</h3>
            <p className="text-sm text-gray-500 mt-1">
              Design and manage experiments to optimize campaign performance
            </p>
          </div>
          
          <button
            onClick={() => setIsCreatingTest(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create New Test
          </button>
        </div>

        {/* Testing Overview */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Active Tests</p>
                <p className="text-2xl font-bold text-blue-900">
                  {activeTests.filter(t => t.status === 'running').length}
                </p>
              </div>
              <span className="text-2xl">🔬</span>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Completed</p>
                <p className="text-2xl font-bold text-green-900">
                  {testHistory.length}
                </p>
              </div>
              <span className="text-2xl">✅</span>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800">Avg Improvement</p>
                <p className="text-2xl font-bold text-purple-900">+18%</p>
              </div>
              <span className="text-2xl">📈</span>
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-800">Confidence</p>
                <p className="text-2xl font-bold text-orange-900">91%</p>
              </div>
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Create New Test Modal */}
      {isCreatingTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-semibold text-gray-900">Create New A/B Test</h4>
              <button
                onClick={() => setIsCreatingTest(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Test Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Name *
                </label>
                <input
                  type="text"
                  value={newTestConfig.name}
                  onChange={(e) => setNewTestConfig(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border-gray-300 rounded-md"
                  placeholder="e.g., Creative CTA Optimization"
                />
              </div>

              {/* Test Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Type *
                </label>
                <select
                  value={newTestConfig.type}
                  onChange={(e) => setNewTestConfig(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full border-gray-300 rounded-md"
                >
                  <option value="creative">Creative/Copy</option>
                  <option value="audience">Audience Targeting</option>
                  <option value="budget">Budget Allocation</option>
                  <option value="landing_page">Landing Page</option>
                  <option value="bidding">Bidding Strategy</option>
                </select>
              </div>

              {/* Hypothesis */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hypothesis
                </label>
                <textarea
                  value={newTestConfig.hypothesis}
                  onChange={(e) => setNewTestConfig(prev => ({ ...prev, hypothesis: e.target.value }))}
                  className="w-full border-gray-300 rounded-md"
                  rows="3"
                  placeholder="What do you expect to happen and why?"
                />
              </div>

              {/* Test Variants */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Test Variants
                  </label>
                  <button
                    onClick={addVariant}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Add Variant
                  </button>
                </div>
                
                <div className="space-y-3">
                  {newTestConfig.variants.map((variant, index) => (
                    <div key={variant.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h6 className="font-medium text-gray-900">Variant {variant.id}</h6>
                        {newTestConfig.variants.length > 2 && (
                          <button
                            onClick={() => removeVariant(variant.id)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        <input
                          type="text"
                          value={variant.name}
                          onChange={(e) => {
                            const updatedVariants = [...newTestConfig.variants];
                            updatedVariants[index].name = e.target.value;
                            setNewTestConfig(prev => ({ ...prev, variants: updatedVariants }));
                          }}
                          className="border-gray-300 rounded-md text-sm"
                          placeholder="Variant name"
                        />
                        <input
                          type="text"
                          value={variant.description}
                          onChange={(e) => {
                            const updatedVariants = [...newTestConfig.variants];
                            updatedVariants[index].description = e.target.value;
                            setNewTestConfig(prev => ({ ...prev, variants: updatedVariants }));
                          }}
                          className="border-gray-300 rounded-md text-sm"
                          placeholder="Description"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Test Settings */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (days)
                  </label>
                  <input
                    type="number"
                    value={newTestConfig.duration}
                    onChange={(e) => setNewTestConfig(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="w-full border-gray-300 rounded-md"
                    min="1"
                    max="30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Traffic Split (%)
                  </label>
                  <input
                    type="number"
                    value={newTestConfig.trafficSplit}
                    onChange={(e) => setNewTestConfig(prev => ({ ...prev, trafficSplit: parseInt(e.target.value) }))}
                    className="w-full border-gray-300 rounded-md"
                    min="10"
                    max="90"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Success Metric
                  </label>
                  <select
                    value={newTestConfig.successMetric}
                    onChange={(e) => setNewTestConfig(prev => ({ ...prev, successMetric: e.target.value }))}
                    className="w-full border-gray-300 rounded-md"
                  >
                    <option value="conversions">Conversions</option>
                    <option value="ctr">Click-Through Rate</option>
                    <option value="cpc">Cost Per Click</option>
                    <option value="roas">Return on Ad Spend</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Sample Size
                  </label>
                  <input
                    type="number"
                    value={newTestConfig.minimumSampleSize}
                    onChange={(e) => setNewTestConfig(prev => ({ ...prev, minimumSampleSize: parseInt(e.target.value) }))}
                    className="w-full border-gray-300 rounded-md"
                    min="100"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsCreatingTest(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={createTest}
                disabled={!newTestConfig.name}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                Create Test
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Tests */}
      <div className="bg-white rounded-lg border p-6">
        <h4 className="font-medium text-gray-900 mb-4">🔬 Active Tests</h4>
        
        <div className="space-y-6">
          {activeTests.filter(test => test.status === 'running').map(test => {
            const stats = calculateSignificance(test.variants[0], test.variants[1]);
            
            return (
              <div key={test.id} className="border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h5 className="font-medium text-gray-900">{test.name}</h5>
                    <p className="text-sm text-gray-500 mt-1">{test.hypothesis}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {test.startDate} to {test.endDate} • Success metric: {test.successMetric}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium mb-2 ${
                      stats.confidence >= 95 ? 'bg-green-100 text-green-800' :
                      stats.confidence >= 80 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {stats.confidence}% confidence
                    </div>
                    
                    {stats.confidence >= 95 && (
                      <button
                        onClick={() => {
                          const winner = test.variants[0].conversionRate > test.variants[1].conversionRate ? 'A' : 'B';
                          stopTest(test.id, winner);
                        }}
                        className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                      >
                        Declare Winner
                      </button>
                    )}
                  </div>
                </div>

                {/* Test Results */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {test.variants.map(variant => (
                    <div 
                      key={variant.id}
                      className={`border rounded-lg p-4 ${
                        test.winner === variant.id ? 'border-green-500 bg-green-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h6 className="font-medium text-gray-900">
                          {variant.name}
                        </h6>
                        {test.winner === variant.id && (
                          <span className="text-green-600 text-sm font-medium">🏆 Winner</span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500">Impressions</p>
                          <p className="font-medium">{variant.impressions.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Clicks</p>
                          <p className="font-medium">{variant.clicks.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">CTR</p>
                          <p className="font-medium">{variant.ctr}%</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Conversions</p>
                          <p className="font-medium">{variant.conversions}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Conv. Rate</p>
                          <p className="font-medium">{variant.conversionRate}%</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Cost</p>
                          <p className="font-medium">${variant.cost.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Test Insights */}
                {test.insights.length > 0 && (
                  <div className="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h6 className="font-medium text-blue-900 mb-2">📊 Key Insights</h6>
                    <ul className="space-y-1">
                      {test.insights.map((insight, index) => (
                        <li key={index} className="text-sm text-blue-800">
                          • {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}

          {activeTests.filter(test => test.status === 'running').length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl block mb-2">🧪</span>
              <p>No active tests. Create your first A/B test to start optimizing!</p>
            </div>
          )}
        </div>
      </div>

      {/* Test History */}
      <div className="bg-white rounded-lg border p-6">
        <h4 className="font-medium text-gray-900 mb-4">📈 Test History</h4>
        
        <div className="space-y-3">
          {testHistory.map(test => (
            <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h6 className="font-medium text-gray-900">{test.name}</h6>
                <p className="text-sm text-gray-500">
                  {test.type} • Completed {test.completedDate}
                </p>
              </div>
              
              <div className="text-right">
                <p className="text-sm font-medium text-green-600">{test.improvement}</p>
                <p className="text-xs text-gray-500">{test.confidence}% confidence</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ABTestingFramework; 