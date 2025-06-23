import React, { useState, useEffect } from 'react';
import AnalyticsDashboard from './AnalyticsDashboard';

/**
 * Campaign Manager Component - Phase 5
 * Manage live campaigns with controls, A/B testing, and optimization
 */

const CampaignManager = ({ campaignData, onCampaignUpdate }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [campaignStatus, setCampaignStatus] = useState('active');
  const [abTests, setAbTests] = useState([]);
  const [optimizations, setOptimizations] = useState([]);
  const [budgetAdjustments, setBudgetAdjustments] = useState({});
  const [notifications, setNotifications] = useState([]);

  // Initialize campaign management data
  useEffect(() => {
    // Simulate loading existing A/B tests
    setAbTests([
      {
        id: 'test_1',
        name: 'Creative Variation Test',
        type: 'creative',
        status: 'running',
        startDate: '2024-01-15',
        endDate: '2024-01-22',
        variants: [
          { id: 'A', name: 'Original Creative', traffic: 50, conversions: 45, conversionRate: 2.1 },
          { id: 'B', name: 'New CTA Creative', traffic: 50, conversions: 58, conversionRate: 2.7 }
        ],
        winner: null,
        confidence: 85
      },
      {
        id: 'test_2',
        name: 'Audience Targeting Test',
        type: 'audience',
        status: 'completed',
        startDate: '2024-01-08',
        endDate: '2024-01-15',
        variants: [
          { id: 'A', name: 'Broad Targeting', traffic: 50, conversions: 38, conversionRate: 1.9 },
          { id: 'B', name: 'Interest-Based', traffic: 50, conversions: 52, conversionRate: 2.6 }
        ],
        winner: 'B',
        confidence: 95
      }
    ]);

    // Simulate optimization suggestions
    setOptimizations([
      {
        id: 'opt_1',
        type: 'budget',
        title: 'Increase Budget for High-Performing Platform',
        description: 'Meta is showing 40% higher ROAS than other platforms',
        action: 'Increase Meta budget by $200/day',
        estimatedImpact: '+$1,200 revenue/week',
        confidence: 'high',
        status: 'pending'
      },
      {
        id: 'opt_2',
        type: 'creative',
        title: 'Refresh Creative Assets',
        description: 'CTR has declined 15% over the past 5 days',
        action: 'Generate 3 new creative variations',
        estimatedImpact: '+0.8% CTR improvement',
        confidence: 'medium',
        status: 'pending'
      }
    ]);

    // Simulate notifications
    setNotifications([
      {
        id: 'notif_1',
        type: 'warning',
        title: 'Budget Pacing Alert',
        message: 'Campaign is spending 20% faster than planned',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: false
      },
      {
        id: 'notif_2',
        type: 'success',
        title: 'A/B Test Winner Detected',
        message: 'Creative Variation B is performing 28% better',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        read: false
      }
    ]);
  }, []);

  // Handle campaign status changes
  const handleStatusChange = (newStatus) => {
    setCampaignStatus(newStatus);
    
    // Add notification for status change
    const notification = {
      id: `notif_${Date.now()}`,
      type: 'info',
      title: 'Campaign Status Updated',
      message: `Campaign is now ${newStatus}`,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    setNotifications(prev => [notification, ...prev]);
    
    if (onCampaignUpdate) {
      onCampaignUpdate({ status: newStatus });
    }
  };

  // Handle budget adjustments
  const handleBudgetAdjustment = (platformId, newBudget) => {
    setBudgetAdjustments(prev => ({
      ...prev,
      [platformId]: newBudget
    }));

    const notification = {
      id: `notif_${Date.now()}`,
      type: 'info',
      title: 'Budget Adjusted',
      message: `${platformId.toUpperCase()} budget updated to $${newBudget}/day`,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    setNotifications(prev => [notification, ...prev]);
  };

  // Apply optimization
  const applyOptimization = (optimizationId) => {
    setOptimizations(prev => 
      prev.map(opt => 
        opt.id === optimizationId 
          ? { ...opt, status: 'applied', appliedAt: new Date().toISOString() }
          : opt
      )
    );

    const notification = {
      id: `notif_${Date.now()}`,
      type: 'success',
      title: 'Optimization Applied',
      message: 'Campaign optimization has been implemented',
      timestamp: new Date().toISOString(),
      read: false
    };
    
    setNotifications(prev => [notification, ...prev]);
  };

  // Create new A/B test
  const createABTest = (testConfig) => {
    const newTest = {
      id: `test_${Date.now()}`,
      ...testConfig,
      status: 'running',
      startDate: new Date().toISOString().split('T')[0],
      variants: testConfig.variants.map(variant => ({
        ...variant,
        traffic: 50, // Equal split
        conversions: 0,
        conversionRate: 0
      })),
      confidence: 0
    };

    setAbTests(prev => [newTest, ...prev]);

    const notification = {
      id: `notif_${Date.now()}`,
      type: 'info',
      title: 'A/B Test Started',
      message: `New ${testConfig.type} test "${testConfig.name}" is now running`,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    setNotifications(prev => [notification, ...prev]);
  };

  // Mark notification as read
  const markNotificationRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Campaign Manager Header */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Campaign Manager</h3>
            <p className="text-sm text-gray-500 mt-1">
              Manage and optimize your live campaign performance
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Campaign Status */}
            <div className="flex items-center space-x-2">
              <span className={`w-3 h-3 rounded-full ${
                campaignStatus === 'active' ? 'bg-green-500 animate-pulse' :
                campaignStatus === 'paused' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></span>
              <span className="text-sm font-medium text-gray-700 capitalize">
                {campaignStatus}
              </span>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <span className="text-xl">🔔</span>
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>
            </div>

            {/* Campaign Controls */}
            <div className="flex space-x-2">
              {campaignStatus === 'active' ? (
                <button
                  onClick={() => handleStatusChange('paused')}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                >
                  Pause
                </button>
              ) : (
                <button
                  onClick={() => handleStatusChange('active')}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Resume
                </button>
              )}
              
              <button
                onClick={() => handleStatusChange('stopped')}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Stop
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: '📊' },
              { id: 'analytics', name: 'Analytics', icon: '📈' },
              { id: 'ab-testing', name: 'A/B Testing', icon: '🧪' },
              { id: 'optimization', name: 'Optimization', icon: '⚡' },
              { id: 'budget', name: 'Budget Control', icon: '💰' }
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
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Campaign Summary Cards */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Performance Summary */}
            <div className="bg-white rounded-lg border p-6">
              <h4 className="font-medium text-gray-900 mb-4">📊 Performance Summary</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Spend</span>
                  <span className="font-medium">$2,847</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ROAS</span>
                  <span className="font-medium text-green-600">4.2x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Conversions</span>
                  <span className="font-medium">156</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">CTR</span>
                  <span className="font-medium">2.1%</span>
                </div>
              </div>
            </div>

            {/* Active Tests */}
            <div className="bg-white rounded-lg border p-6">
              <h4 className="font-medium text-gray-900 mb-4">🧪 Active Tests</h4>
              <div className="space-y-3">
                {abTests.filter(test => test.status === 'running').map(test => (
                  <div key={test.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{test.name}</p>
                      <p className="text-xs text-gray-500">{test.confidence}% confidence</p>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Running
                    </span>
                  </div>
                ))}
                {abTests.filter(test => test.status === 'running').length === 0 && (
                  <p className="text-sm text-gray-500">No active tests</p>
                )}
              </div>
            </div>

            {/* Optimization Opportunities */}
            <div className="bg-white rounded-lg border p-6">
              <h4 className="font-medium text-gray-900 mb-4">⚡ Optimizations</h4>
              <div className="space-y-3">
                {optimizations.filter(opt => opt.status === 'pending').slice(0, 3).map(opt => (
                  <div key={opt.id} className="space-y-2">
                    <p className="text-sm font-medium text-gray-900">{opt.title}</p>
                    <p className="text-xs text-gray-600">{opt.estimatedImpact}</p>
                    <button
                      onClick={() => applyOptimization(opt.id)}
                      className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                    >
                      Apply
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="bg-white rounded-lg border p-6">
            <h4 className="font-medium text-gray-900 mb-4">🔔 Recent Notifications</h4>
            <div className="space-y-3">
              {notifications.slice(0, 5).map(notification => (
                <div 
                  key={notification.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer ${
                    notification.read ? 'bg-gray-50' : 'bg-blue-50 border border-blue-200'
                  }`}
                  onClick={() => markNotificationRead(notification.id)}
                >
                  <span className="text-lg">
                    {notification.type === 'warning' ? '⚠️' :
                     notification.type === 'success' ? '✅' : 'ℹ️'}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                    <p className="text-xs text-gray-600">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.timestamp).toLocaleString()}
                    </p>
                  </div>
                  {!notification.read && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <AnalyticsDashboard campaignData={campaignData} isLive={campaignStatus === 'active'} />
      )}

      {activeTab === 'ab-testing' && (
        <div className="space-y-6">
          {/* A/B Testing Header */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">🧪 A/B Testing</h4>
              <button 
                onClick={() => {
                  // Simulate creating a new test
                  createABTest({
                    name: 'New Creative Test',
                    type: 'creative',
                    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    variants: [
                      { id: 'A', name: 'Current Creative' },
                      { id: 'B', name: 'New Creative Variant' }
                    ]
                  });
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create New Test
              </button>
            </div>

            {/* Active Tests */}
            <div className="space-y-4">
              {abTests.map(test => (
                <div key={test.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h5 className="font-medium text-gray-900">{test.name}</h5>
                      <p className="text-sm text-gray-500">
                        {test.type} test • {test.startDate} to {test.endDate}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      test.status === 'running' ? 'bg-green-100 text-green-800' :
                      test.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {test.status}
                    </span>
                  </div>

                  {/* Test Variants */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {test.variants.map(variant => (
                      <div 
                        key={variant.id}
                        className={`border rounded-lg p-3 ${
                          test.winner === variant.id ? 'border-green-500 bg-green-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h6 className="font-medium text-gray-900">
                            Variant {variant.id}: {variant.name}
                          </h6>
                          {test.winner === variant.id && (
                            <span className="text-green-600 text-sm font-medium">🏆 Winner</span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <p className="text-gray-500">Traffic</p>
                            <p className="font-medium">{variant.traffic}%</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Conversions</p>
                            <p className="font-medium">{variant.conversions}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Conv. Rate</p>
                            <p className="font-medium">{variant.conversionRate}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Test Stats */}
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Statistical Confidence: {test.confidence}%
                    </span>
                    {test.status === 'running' && test.confidence >= 95 && !test.winner && (
                      <button className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700">
                        Declare Winner
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'optimization' && (
        <div className="space-y-6">
          {/* Optimization Recommendations */}
          <div className="bg-white rounded-lg border p-6">
            <h4 className="font-medium text-gray-900 mb-4">⚡ Optimization Recommendations</h4>
            
            <div className="space-y-4">
              {optimizations.map(optimization => (
                <div 
                  key={optimization.id}
                  className={`border rounded-lg p-4 ${
                    optimization.status === 'applied' ? 'border-green-200 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          optimization.type === 'budget' ? 'bg-blue-100 text-blue-800' :
                          optimization.type === 'creative' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {optimization.type}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          optimization.confidence === 'high' ? 'bg-green-100 text-green-800' :
                          optimization.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {optimization.confidence} confidence
                        </span>
                      </div>
                      
                      <h5 className="font-medium text-gray-900 mb-1">{optimization.title}</h5>
                      <p className="text-sm text-gray-600 mb-2">{optimization.description}</p>
                      <p className="text-sm text-gray-800 font-medium mb-2">{optimization.action}</p>
                      <p className="text-sm text-green-600 font-medium">{optimization.estimatedImpact}</p>
                    </div>
                    
                    <div className="ml-4">
                      {optimization.status === 'pending' ? (
                        <button
                          onClick={() => applyOptimization(optimization.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Apply
                        </button>
                      ) : (
                        <span className="px-4 py-2 bg-green-100 text-green-800 rounded-md text-sm">
                          ✅ Applied
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {optimization.status === 'applied' && optimization.appliedAt && (
                    <div className="mt-3 text-xs text-green-700">
                      Applied on {new Date(optimization.appliedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'budget' && (
        <div className="space-y-6">
          {/* Budget Control */}
          <div className="bg-white rounded-lg border p-6">
            <h4 className="font-medium text-gray-900 mb-4">💰 Budget Control</h4>
            
            {/* Platform Budget Adjustments */}
            <div className="space-y-4">
              {campaignData?.platforms?.selectedPlatforms?.map(platformId => {
                const currentBudget = campaignData?.platforms?.budgetAllocation?.[platformId] || 100;
                const adjustedBudget = budgetAdjustments[platformId] || currentBudget;
                
                return (
                  <div key={platformId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">
                          {platformId === 'meta' ? '📘' : 
                           platformId === 'tiktok' ? '🎵' :
                           platformId === 'display' ? '🖼️' : '📺'}
                        </span>
                        <div>
                          <h5 className="font-medium text-gray-900">{platformId.toUpperCase()}</h5>
                          <p className="text-sm text-gray-500">Daily budget allocation</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">${adjustedBudget}</p>
                        <p className="text-sm text-gray-500">per day</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-4">
                        <input
                          type="range"
                          min="50"
                          max="500"
                          value={adjustedBudget}
                          onChange={(e) => handleBudgetAdjustment(platformId, parseInt(e.target.value))}
                          className="flex-1"
                        />
                        <input
                          type="number"
                          value={adjustedBudget}
                          onChange={(e) => handleBudgetAdjustment(platformId, parseInt(e.target.value))}
                          className="w-20 px-2 py-1 border rounded text-sm"
                          min="50"
                          max="500"
                        />
                      </div>
                      
                      {adjustedBudget !== currentBudget && (
                        <div className="text-sm">
                          <span className={`font-medium ${
                            adjustedBudget > currentBudget ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {adjustedBudget > currentBudget ? '+' : ''}
                            ${adjustedBudget - currentBudget} 
                            ({adjustedBudget > currentBudget ? 'increase' : 'decrease'})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Budget Summary */}
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-3">Budget Summary</h5>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div>
                  <p className="text-sm text-gray-500">Total Daily Budget</p>
                  <p className="text-lg font-bold text-gray-900">
                    ${Object.values(budgetAdjustments).reduce((sum, budget) => sum + budget, 0) || 
                      (campaignData?.platforms?.totalBudget / 7) || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Spend Today</p>
                  <p className="text-lg font-bold text-gray-900">$247</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Remaining</p>
                  <p className="text-lg font-bold text-green-600">$153</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pace</p>
                  <p className="text-lg font-bold text-yellow-600">+15%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignManager; 