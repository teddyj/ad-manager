import React, { useState, useEffect, useMemo } from 'react';

/**
 * Analytics Dashboard Component - Phase 5
 * Real-time campaign performance monitoring and optimization insights
 */

const AnalyticsDashboard = ({ campaignData, isLive = false }) => {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [performanceData, setPerformanceData] = useState(null);
  const [optimizationInsights, setOptimizationInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulated real-time performance data
  const generatePerformanceData = () => {
    const platforms = campaignData?.platforms?.selectedPlatforms || ['meta', 'tiktok'];
    const totalBudget = campaignData?.platforms?.totalBudget || 1000;
    const days = timeRange === '1d' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    
    const baseMetrics = {
      impressions: Math.round(totalBudget * 285 * days * (0.8 + Math.random() * 0.4)),
      clicks: Math.round(totalBudget * 12 * days * (0.8 + Math.random() * 0.4)),
      conversions: Math.round(totalBudget * 0.8 * days * (0.8 + Math.random() * 0.4)),
      spend: Math.round(totalBudget * days * (0.85 + Math.random() * 0.15)),
      reach: Math.round(totalBudget * 180 * days * (0.8 + Math.random() * 0.4))
    };

    // Calculate derived metrics
    const ctr = ((baseMetrics.clicks / baseMetrics.impressions) * 100).toFixed(2);
    const cpc = (baseMetrics.spend / baseMetrics.clicks).toFixed(2);
    const cpm = ((baseMetrics.spend / baseMetrics.impressions) * 1000).toFixed(2);
    const conversionRate = ((baseMetrics.conversions / baseMetrics.clicks) * 100).toFixed(2);
    const costPerConversion = (baseMetrics.spend / baseMetrics.conversions).toFixed(2);
    const roas = (baseMetrics.conversions * (campaignData?.product?.price || 50) / baseMetrics.spend).toFixed(2);

    // Platform breakdown
    const platformData = platforms.map(platform => {
      const platformShare = 0.3 + Math.random() * 0.4; // 30-70% share
      return {
        platform,
        impressions: Math.round(baseMetrics.impressions * platformShare),
        clicks: Math.round(baseMetrics.clicks * platformShare),
        conversions: Math.round(baseMetrics.conversions * platformShare),
        spend: Math.round(baseMetrics.spend * platformShare),
        ctr: (Math.random() * 2 + 1).toFixed(2),
        cpc: (Math.random() * 1 + 0.5).toFixed(2),
        conversionRate: (Math.random() * 3 + 1).toFixed(2)
      };
    });

    // Time series data for charts
    const timeSeriesData = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      
      return {
        date: date.toISOString().split('T')[0],
        impressions: Math.round(baseMetrics.impressions / days * (0.8 + Math.random() * 0.4)),
        clicks: Math.round(baseMetrics.clicks / days * (0.8 + Math.random() * 0.4)),
        conversions: Math.round(baseMetrics.conversions / days * (0.8 + Math.random() * 0.4)),
        spend: Math.round(baseMetrics.spend / days * (0.8 + Math.random() * 0.4))
      };
    });

    return {
      summary: {
        ...baseMetrics,
        ctr,
        cpc,
        cpm,
        conversionRate,
        costPerConversion,
        roas
      },
      platformData,
      timeSeriesData,
      lastUpdated: new Date().toISOString()
    };
  };

  // Generate optimization insights
  const generateOptimizationInsights = (data) => {
    const insights = [];
    
    if (data.summary.ctr < 1.5) {
      insights.push({
        type: 'warning',
        category: 'Creative',
        title: 'Low Click-Through Rate',
        description: `CTR of ${data.summary.ctr}% is below industry average of 2.1%`,
        recommendation: 'Consider testing new creative variations with stronger calls-to-action',
        impact: 'high',
        estimatedImprovement: '+25% CTR'
      });
    }

    if (data.summary.conversionRate < 2.0) {
      insights.push({
        type: 'warning',
        category: 'Landing Page',
        title: 'Low Conversion Rate',
        description: `Conversion rate of ${data.summary.conversionRate}% suggests landing page optimization needed`,
        recommendation: 'A/B test landing page elements: headlines, CTAs, and form fields',
        impact: 'high',
        estimatedImprovement: '+40% conversions'
      });
    }

    if (data.summary.roas > 3.0) {
      insights.push({
        type: 'success',
        category: 'Budget',
        title: 'Strong ROAS Performance',
        description: `ROAS of ${data.summary.roas}x indicates efficient spending`,
        recommendation: 'Consider increasing budget to scale successful campaigns',
        impact: 'medium',
        estimatedImprovement: '+50% revenue'
      });
    }

    // Platform-specific insights
    const bestPlatform = data.platformData.reduce((best, current) => 
      parseFloat(current.conversionRate) > parseFloat(best.conversionRate) ? current : best
    );

    insights.push({
      type: 'info',
      category: 'Platform',
      title: 'Top Performing Platform',
      description: `${bestPlatform.platform.toUpperCase()} shows highest conversion rate at ${bestPlatform.conversionRate}%`,
      recommendation: 'Allocate more budget to this platform for better ROI',
      impact: 'medium',
      estimatedImprovement: '+20% efficiency'
    });

    return insights;
  };

  // Load performance data
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate API call delay
    const timer = setTimeout(() => {
      const data = generatePerformanceData();
      setPerformanceData(data);
      setOptimizationInsights(generateOptimizationInsights(data));
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [timeRange, campaignData]);

  // Real-time updates for live campaigns
  useEffect(() => {
    if (!isLive || !performanceData) return;

    const interval = setInterval(() => {
      const updatedData = generatePerformanceData();
      setPerformanceData(updatedData);
      setOptimizationInsights(generateOptimizationInsights(updatedData));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [isLive, performanceData, timeRange]);

  // Format numbers for display
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Campaign Analytics</h3>
            <p className="text-sm text-gray-500 mt-1">
              {isLive ? (
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  Live Campaign • Updates every 30s
                </span>
              ) : (
                'Campaign Performance Overview'
              )}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Time Range Selector */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[
                { value: '1d', label: '1D' },
                { value: '7d', label: '7D' },
                { value: '30d', label: '30D' },
                { value: '90d', label: '90D' }
              ].map(range => (
                <button
                  key={range.value}
                  onClick={() => setTimeRange(range.value)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    timeRange === range.value
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
            
            {/* Last Updated */}
            <div className="text-sm text-gray-500">
              Updated: {new Date(performanceData.lastUpdated).toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Impressions</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatNumber(performanceData.summary.impressions)}
                </p>
              </div>
              <span className="text-2xl">👁️</span>
            </div>
            <div className="mt-2 text-xs text-blue-700">
              CPM: ${performanceData.summary.cpm}
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Clicks</p>
                <p className="text-2xl font-bold text-green-900">
                  {formatNumber(performanceData.summary.clicks)}
                </p>
              </div>
              <span className="text-2xl">👆</span>
            </div>
            <div className="mt-2 text-xs text-green-700">
              CTR: {performanceData.summary.ctr}% • CPC: ${performanceData.summary.cpc}
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800">Conversions</p>
                <p className="text-2xl font-bold text-purple-900">
                  {formatNumber(performanceData.summary.conversions)}
                </p>
              </div>
              <span className="text-2xl">🎯</span>
            </div>
            <div className="mt-2 text-xs text-purple-700">
              Rate: {performanceData.summary.conversionRate}% • Cost: ${performanceData.summary.costPerConversion}
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-800">ROAS</p>
                <p className="text-2xl font-bold text-orange-900">
                  {performanceData.summary.roas}x
                </p>
              </div>
              <span className="text-2xl">💰</span>
            </div>
            <div className="mt-2 text-xs text-orange-700">
              Spend: {formatCurrency(performanceData.summary.spend)}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-medium text-gray-900">Performance Trends</h4>
          
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { value: 'overview', label: 'Overview' },
              { value: 'impressions', label: 'Impressions' },
              { value: 'clicks', label: 'Clicks' },
              { value: 'conversions', label: 'Conversions' }
            ].map(metric => (
              <button
                key={metric.value}
                onClick={() => setSelectedMetric(metric.value)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  selectedMetric === metric.value
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {metric.label}
              </button>
            ))}
          </div>
        </div>

        {/* Simple Chart Visualization */}
        <div className="space-y-4">
          {performanceData.timeSeriesData.map((day, index) => (
            <div key={day.date} className="flex items-center space-x-4">
              <div className="w-20 text-sm text-gray-600">
                {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              
              {selectedMetric === 'overview' ? (
                <div className="flex-1 grid grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="bg-blue-500 rounded"
                      style={{ 
                        width: `${Math.max(4, (day.impressions / Math.max(...performanceData.timeSeriesData.map(d => d.impressions))) * 60)}px`,
                        height: '8px'
                      }}
                    ></div>
                    <span className="text-xs text-gray-600">{formatNumber(day.impressions)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div 
                      className="bg-green-500 rounded"
                      style={{ 
                        width: `${Math.max(4, (day.clicks / Math.max(...performanceData.timeSeriesData.map(d => d.clicks))) * 60)}px`,
                        height: '8px'
                      }}
                    ></div>
                    <span className="text-xs text-gray-600">{formatNumber(day.clicks)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div 
                      className="bg-purple-500 rounded"
                      style={{ 
                        width: `${Math.max(4, (day.conversions / Math.max(...performanceData.timeSeriesData.map(d => d.conversions))) * 60)}px`,
                        height: '8px'
                      }}
                    ></div>
                    <span className="text-xs text-gray-600">{formatNumber(day.conversions)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div 
                      className="bg-orange-500 rounded"
                      style={{ 
                        width: `${Math.max(4, (day.spend / Math.max(...performanceData.timeSeriesData.map(d => d.spend))) * 60)}px`,
                        height: '8px'
                      }}
                    ></div>
                    <span className="text-xs text-gray-600">{formatCurrency(day.spend)}</span>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center space-x-2">
                  <div 
                    className="bg-blue-500 rounded"
                    style={{ 
                      width: `${Math.max(4, (day[selectedMetric] / Math.max(...performanceData.timeSeriesData.map(d => d[selectedMetric]))) * 200)}px`,
                      height: '12px'
                    }}
                  ></div>
                  <span className="text-sm text-gray-700">
                    {selectedMetric === 'spend' ? formatCurrency(day[selectedMetric]) : formatNumber(day[selectedMetric])}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Platform Performance */}
      <div className="bg-white rounded-lg border p-6">
        <h4 className="font-medium text-gray-900 mb-4">Platform Performance</h4>
        
        <div className="space-y-4">
          {performanceData.platformData.map(platform => (
            <div key={platform.platform} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">
                    {platform.platform === 'meta' ? '📘' : 
                     platform.platform === 'tiktok' ? '🎵' :
                     platform.platform === 'display' ? '🖼️' : '📺'}
                  </span>
                  <div>
                    <h5 className="font-medium text-gray-900">{platform.platform.toUpperCase()}</h5>
                    <p className="text-sm text-gray-500">
                      {formatNumber(platform.impressions)} impressions • {formatNumber(platform.clicks)} clicks
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{platform.conversions}</p>
                  <p className="text-sm text-gray-500">conversions</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">CTR</p>
                  <p className="font-medium">{platform.ctr}%</p>
                </div>
                <div>
                  <p className="text-gray-500">CPC</p>
                  <p className="font-medium">${platform.cpc}</p>
                </div>
                <div>
                  <p className="text-gray-500">Conv. Rate</p>
                  <p className="font-medium">{platform.conversionRate}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Optimization Insights */}
      <div className="bg-white rounded-lg border p-6">
        <h4 className="font-medium text-gray-900 mb-4">🚀 Optimization Insights</h4>
        
        <div className="space-y-4">
          {optimizationInsights.map((insight, index) => (
            <div 
              key={index}
              className={`border rounded-lg p-4 ${
                insight.type === 'success' ? 'border-green-200 bg-green-50' :
                insight.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                'border-blue-200 bg-blue-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      insight.type === 'success' ? 'bg-green-200 text-green-800' :
                      insight.type === 'warning' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-blue-200 text-blue-800'
                    }`}>
                      {insight.category}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      insight.impact === 'high' ? 'bg-red-100 text-red-800' :
                      insight.impact === 'medium' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {insight.impact} impact
                    </span>
                  </div>
                  
                  <h5 className="font-medium text-gray-900 mb-1">{insight.title}</h5>
                  <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                  <p className="text-sm text-gray-800 font-medium">{insight.recommendation}</p>
                </div>
                
                <div className="text-right ml-4">
                  <p className="text-sm font-medium text-green-600">{insight.estimatedImprovement}</p>
                  <button className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700">
                    Apply
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 