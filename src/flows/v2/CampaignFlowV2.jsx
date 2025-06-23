import React, { useState, useCallback, useEffect } from 'react';
import { isFeatureEnabled } from '../../config/features';

// Step Components (to be created)
import ProductSelection from './steps/ProductSelection';
import AudienceBuilder from './steps/AudienceBuilder';
import PlatformSelector from './steps/PlatformSelector';
import CreativeBuilder from './steps/CreativeBuilder';
import PublishManager from './steps/PublishManager';

// Progress and Navigation Components
import FlowProgress from './components/FlowProgress';
import FlowNavigation from './components/FlowNavigation';

/**
 * Campaign Flow V2 - New Multi-Step Campaign Creation
 * 
 * Flow: Product Selection → Audience Building → Platform Selection → Creative Building → Publishing
 * 
 * Features:
 * - Multi-platform support (Meta, Display, CTV, TikTok)
 * - Intelligent audience targeting
 * - Platform-aware creative optimization
 * - Budget allocation and management
 * - Real-time validation and recommendations
 */

const FLOW_STEPS = [
  {
    id: 'product',
    name: 'Product Selection',
    description: 'Choose your product and upload images',
    icon: '📦',
    component: ProductSelection,
    required: true
  },
  {
    id: 'audience',
    name: 'Audience Building',
    description: 'Define your target audience',
    icon: '🎯',
    component: AudienceBuilder,
    required: true
  },
  {
    id: 'platforms',
    name: 'Platform Selection',
    description: 'Choose advertising platforms and budgets',
    icon: '🚀',
    component: PlatformSelector,
    required: true
  },
  {
    id: 'creative',
    name: 'Creative Building',
    description: 'Generate and customize ad creatives',
    icon: '🎨',
    component: CreativeBuilder,
    required: true
  },
  {
    id: 'publish',
    name: 'Publish & Launch',
    description: 'Review and launch your campaign',
    icon: '📢',
    component: PublishManager,
    required: true
  }
];

const CampaignFlowV2 = ({ onComplete, onCancel, initialData = {}, dbOperations }) => {
  // Flow state management
  const [currentStep, setCurrentStep] = useState(0);
  const [campaignData, setCampaignData] = useState({
    id: `campaign_${Date.now()}`,
    name: '',
    createdAt: new Date().toISOString(),
    status: 'draft',
    version: 2,
    ...initialData
  });
  
  const [stepData, setStepData] = useState({
    product: null,
    audience: null,
    platforms: [],
    creative: {},
    publish: null
  });
  
  const [stepValidation, setStepValidation] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saving', 'saved', 'error'
  
  // Check if new flow is enabled
  useEffect(() => {
    if (!isFeatureEnabled('NEW_CAMPAIGN_FLOW')) {
      console.warn('Campaign Flow V2 is not enabled. Redirecting to legacy flow.');
      onCancel?.();
    }
  }, [onCancel]);
  
  // Get current step configuration
  const getCurrentStep = () => FLOW_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === FLOW_STEPS.length - 1;
  
  // Step navigation handlers
  const handleNext = useCallback(async () => {
    const step = getCurrentStep();
    
    // Validate current step before proceeding
    if (!stepValidation[step.id]?.valid) {
      setErrors(prev => ({
        ...prev,
        [step.id]: 'Please complete all required fields before continuing'
      }));
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Perform any async validation or data processing
      await validateStepTransition(step.id, stepData[step.id]);
      
      if (isLastStep) {
        // Complete the flow
        await handleComplete();
      } else {
        // Move to next step
        setCurrentStep(prev => Math.min(prev + 1, FLOW_STEPS.length - 1));
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        [step.id]: error.message || 'An error occurred while proceeding'
      }));
    } finally {
      setIsLoading(false);
    }
  }, [currentStep, stepData, stepValidation, isLastStep]);
  
  const handlePrevious = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
    setErrors({}); // Clear errors when going back
  }, []);
  
  const handleStepJump = useCallback((stepIndex) => {
    // Only allow jumping to completed steps or the next immediate step
    const maxAllowedStep = Math.max(
      ...Object.keys(stepValidation)
        .filter(stepId => stepValidation[stepId]?.valid)
        .map(stepId => FLOW_STEPS.findIndex(step => step.id === stepId))
    ) + 1;
    
    if (stepIndex <= maxAllowedStep) {
      setCurrentStep(stepIndex);
      setErrors({});
    }
  }, [stepValidation]);
  
  // Step data management
  const updateStepData = useCallback((stepId, data) => {
    console.log(`🔄 Updating step data for ${stepId}:`, data);
    
    setStepData(prev => {
      const newStepData = {
        ...prev,
        [stepId]: data
      };
      
      // Auto-save step data changes immediately with optimization
      const updatedCampaignData = {
        ...campaignData,
        ...newStepData,
        updatedAt: new Date().toISOString()
      };
      
      // Optimized save to localStorage (non-blocking)
      setTimeout(() => {
        try {
          setSaveStatus('saving');
          
          // Optimize data before saving
          const optimizedData = optimizeForStorage(updatedCampaignData);
          
          // Check if data fits in localStorage
          const dataString = JSON.stringify(optimizedData);
          const dataSize = new Blob([dataString]).size;
          
          // If data is too large (approaching 5MB limit), use selective saving
          if (dataSize > 4 * 1024 * 1024) { // 4MB threshold
            console.warn('📊 Data size large, using selective save:', {
              sizeKB: Math.round(dataSize / 1024),
              threshold: '4MB'
            });
            
            // Save only essential data
            const essentialData = {
              id: optimizedData.id,
              createdAt: optimizedData.createdAt,
              updatedAt: optimizedData.updatedAt,
              product: optimizedData.product,
              audience: optimizedData.audience,
              platforms: optimizedData.platforms,
              creative: optimizeCreativeData(optimizedData.creative),
              publish: optimizedData.publish
            };
            
            localStorage.setItem(`campaign_draft_${campaignData.id}`, JSON.stringify(essentialData));
          } else {
            localStorage.setItem(`campaign_draft_${campaignData.id}`, dataString);
          }
          
          setSaveStatus('saved');
          console.log('📁 Auto-saved campaign data:', {
            stepId,
            campaignId: campaignData.id,
            dataSizeKB: Math.round(dataSize / 1024),
            hasCreatives: !!optimizedData.creative?.creatives,
            creativesCount: Object.keys(optimizedData.creative?.creatives || {}).length
          });
        } catch (error) {
          console.warn('Failed to auto-save campaign data:', error);
          setSaveStatus('error');
          
          // Try emergency save with minimal data
          try {
            const minimalData = {
              id: campaignData.id,
              updatedAt: new Date().toISOString(),
              [stepId]: data
            };
            localStorage.setItem(`campaign_minimal_${campaignData.id}`, JSON.stringify(minimalData));
            console.log('💾 Emergency minimal save completed');
          } catch (emergencyError) {
            console.error('Emergency save also failed:', emergencyError);
          }
        }
      }, 100);
      
      return newStepData;
    });
    
    // Clear any existing errors for this step
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[stepId];
      return newErrors;
    });
  }, [campaignData]);
  
  // Data optimization functions
  const optimizeForStorage = (data) => {
    // Create a deep copy to avoid mutating original data
    const optimized = JSON.parse(JSON.stringify(data));
    
    // Remove non-essential data
    if (optimized.creative?.creatives) {
      Object.keys(optimized.creative.creatives).forEach(creativeId => {
        const creative = optimized.creative.creatives[creativeId];
        
        // Remove temporary/preview data
        if (creative.previewData) delete creative.previewData;
        if (creative.temporaryState) delete creative.temporaryState;
        
        // Optimize element data
        if (creative.elements) {
          creative.elements = creative.elements.map(element => ({
            ...element,
            // Keep only essential properties, remove computed/cached data
            ...(element.computed && { computed: undefined }),
            ...(element.cached && { cached: undefined })
          }));
        }
      });
    }
    
    return optimized;
  };

  const optimizeCreativeData = (creativeData) => {
    if (!creativeData?.creatives) return creativeData;
    
    const optimized = { ...creativeData };
    const creatives = {};
    
    // Keep only the most recent 3 creatives to save space
    const sortedCreatives = Object.entries(creativeData.creatives)
      .sort(([,a], [,b]) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
      .slice(0, 3);
    
    sortedCreatives.forEach(([id, creative]) => {
      creatives[id] = {
        id: creative.id,
        formatId: creative.formatId,
        elements: creative.elements?.slice(0, 10) || [], // Limit elements
        updatedAt: creative.updatedAt,
        // Keep only essential properties
        ...(creative.selectedFormat && { selectedFormat: creative.selectedFormat })
      };
    });
    
    optimized.creatives = creatives;
    return optimized;
  };
  
  // Storage cleanup and monitoring
  const cleanupOldDrafts = () => {
    try {
      const keys = Object.keys(localStorage);
      const now = new Date();
      let cleanedCount = 0;
      
      keys.forEach(key => {
        if (key.startsWith('campaign_draft_') || key.startsWith('campaign_minimal_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key));
            const updatedAt = new Date(data.updatedAt);
            const daysSinceUpdate = (now - updatedAt) / (1000 * 60 * 60 * 24);
            
            // Remove drafts older than 7 days
            if (daysSinceUpdate > 7) {
              localStorage.removeItem(key);
              cleanedCount++;
            }
          } catch (e) {
            // Remove corrupted entries
            localStorage.removeItem(key);
            cleanedCount++;
          }
        }
      });
      
      if (cleanedCount > 0) {
        console.log(`🧹 Cleaned up ${cleanedCount} old draft entries`);
      }
    } catch (error) {
      console.warn('Failed to cleanup old drafts:', error);
    }
  };

  const getStorageUsage = () => {
    try {
      let totalSize = 0;
      Object.keys(localStorage).forEach(key => {
        totalSize += localStorage.getItem(key).length;
      });
      
      const usagePercent = Math.round((totalSize / (5 * 1024 * 1024)) * 100); // Assume 5MB limit
      return {
        totalSizeKB: Math.round(totalSize / 1024),
        usagePercent,
        approaching: usagePercent > 80
      };
    } catch (error) {
      return { totalSizeKB: 0, usagePercent: 0, approaching: false };
    }
  };
  
  const updateStepValidation = useCallback((stepId, validation) => {
    setStepValidation(prev => ({
      ...prev,
      [stepId]: validation
    }));
  }, []);
  
  // Load saved draft data on component mount
  useEffect(() => {
    const loadSavedDraft = () => {
      try {
        // Cleanup old drafts first
        cleanupOldDrafts();
        
        // Check storage usage
        const storageInfo = getStorageUsage();
        if (storageInfo.approaching) {
          console.warn('⚠️ LocalStorage approaching limit:', storageInfo);
        }
        
        // Try to load full draft first
        let parsedDraft = null;
        const savedDraft = localStorage.getItem(`campaign_draft_${campaignData.id}`);
        
        if (savedDraft) {
          parsedDraft = JSON.parse(savedDraft);
        } else {
          // Fallback to minimal draft if full draft doesn't exist
          const minimalDraft = localStorage.getItem(`campaign_minimal_${campaignData.id}`);
          if (minimalDraft) {
            parsedDraft = JSON.parse(minimalDraft);
            console.log('📂 Loading minimal campaign draft');
          }
        }
        
        if (parsedDraft) {
          console.log('📂 Loading saved campaign draft:', {
            campaignId: campaignData.id,
            lastUpdated: parsedDraft.updatedAt,
            hasCreativeStep: !!parsedDraft.creative,
            creativesCount: Object.keys(parsedDraft.creative?.creatives || {}).length,
            storageUsage: `${storageInfo.totalSizeKB}KB (${storageInfo.usagePercent}%)`
          });
          
          // Restore step data from draft
          setStepData({
            product: parsedDraft.product || null,
            audience: parsedDraft.audience || null,
            platforms: parsedDraft.platforms || [],
            creative: parsedDraft.creative || {},
            publish: parsedDraft.publish || null
          });
          
          // Update campaign data
          setCampaignData(prev => ({
            ...prev,
            ...parsedDraft,
            // Preserve the original ID and creation time
            id: prev.id,
            createdAt: prev.createdAt
          }));
        }
      } catch (error) {
        console.warn('Failed to load saved campaign draft:', error);
        // Try to recover from minimal save
        try {
          const minimalDraft = localStorage.getItem(`campaign_minimal_${campaignData.id}`);
          if (minimalDraft) {
            const parsedMinimal = JSON.parse(minimalDraft);
            console.log('🆘 Recovered from minimal draft');
            setStepData(prev => ({ ...prev, ...parsedMinimal }));
          }
        } catch (recoveryError) {
          console.error('Failed to recover from minimal draft:', recoveryError);
        }
      }
    };
    
    // Load draft after initial mount
    loadSavedDraft();
  }, [campaignData.id]); // Only run when campaign ID changes
  
  // Campaign data management
  const updateCampaignData = useCallback((updates) => {
    setCampaignData(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString()
    }));
  }, []);
  
  // Complete the campaign flow
  const handleComplete = async () => {
    setIsLoading(true);
    
    try {
      // Compile final campaign data
      const finalCampaignData = {
        ...campaignData,
        ...stepData,
        status: 'completed',
        completedAt: new Date().toISOString()
      };
      
      // Save campaign data (placeholder for actual implementation)
      await saveCampaignData(finalCampaignData);
      
      // Notify parent component
      onComplete?.(finalCampaignData);
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        publish: error.message || 'Failed to complete campaign creation'
      }));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Validation helper
  const validateStepTransition = async (stepId, data) => {
    // Implement step-specific validation logic
    switch (stepId) {
      case 'product':
        if (!data?.images?.length) {
          throw new Error('At least one product image is required');
        }
        break;
      
      case 'audience':
        // Much more lenient validation - audience can have default demographics
        if (!data) {
          throw new Error('Audience configuration is required');
        }
        // Allow proceeding with any basic audience data
        break;
      
      case 'platforms':
        // Disable flow-level validation - rely on step validation instead
        // if (!data?.selectedPlatforms?.length) {
        //   throw new Error('At least one platform must be selected');
        // }
        break;
      
      case 'creative':
        // Allow proceeding with minimum creative requirements
        if (!data?.selectedFormats || data.selectedFormats.length === 0) {
          throw new Error('Select at least one creative format to proceed');
        }
        // Allow proceeding without generated creatives - user can generate them later
        break;
      
      default:
        break;
    }
  };
  
  // Save campaign data (placeholder)
  const saveCampaignData = async (data) => {
    // TODO: Implement actual data persistence
    console.log('Saving campaign data:', data);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In real implementation, this would save to database/API
    localStorage.setItem(`campaign_${data.id}`, JSON.stringify(data));
  };
  
  // Manual save function
  const handleManualSave = useCallback(async () => {
    setSaveStatus('saving');
    try {
      const finalCampaignData = {
        ...campaignData,
        ...stepData,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem(`campaign_draft_${campaignData.id}`, JSON.stringify(finalCampaignData));
      setSaveStatus('saved');
      
      console.log('💾 Manual save completed:', {
        campaignId: campaignData.id,
        stepsWithData: Object.keys(stepData).filter(key => stepData[key])
      });
    } catch (error) {
      console.error('Manual save failed:', error);
      setSaveStatus('error');
    }
  }, [campaignData, stepData]);
  
  // Clear draft function (for development/testing)
  const handleClearDraft = useCallback(() => {
    try {
      localStorage.removeItem(`campaign_draft_${campaignData.id}`);
      console.log('🗑️ Cleared draft for campaign:', campaignData.id);
      alert('Draft cleared! Refresh the page to start fresh.');
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  }, [campaignData.id]);
  
  // Render current step component
  const renderCurrentStep = () => {
    const step = getCurrentStep();
    const StepComponent = step.component;
    
    if (!StepComponent) {
      return <div className="p-8 text-center text-gray-500">Step component not found</div>;
    }
    
    return (
      <StepComponent
        data={stepData[step.id]}
        campaignData={{
          ...campaignData,
          product: stepData.product,
          audience: stepData.audience,
          platforms: stepData.platforms,
          creative: stepData.creative
        }}
        allStepData={stepData}
        onDataUpdate={(data) => updateStepData(step.id, data)}
        onValidationUpdate={(validation) => updateStepValidation(step.id, validation)}
        onCampaignUpdate={updateCampaignData}
        isActive={true}
        errors={errors[step.id]}
        dbOperations={dbOperations}
      />
    );
  };
  
  // Handle escape key to cancel
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onCancel?.();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                Create Campaign
              </h1>
              {campaignData.name && (
                <span className="text-sm text-gray-500">
                  - {campaignData.name}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Storage Usage Indicator */}
              {(() => {
                const storageInfo = getStorageUsage();
                return (
                  <div className={`text-xs px-2 py-1 rounded-md ${
                    storageInfo.approaching 
                      ? 'bg-orange-100 text-orange-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    Storage: {storageInfo.totalSizeKB}KB ({storageInfo.usagePercent}%)
                  </div>
                );
              })()}
              
              {/* Save Status Indicator */}
              <div className="flex items-center space-x-2">
                {saveStatus === 'saving' && (
                  <div className="flex items-center space-x-2 text-blue-600">
                    <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">Saving...</span>
                  </div>
                )}
                {saveStatus === 'saved' && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">Saved</span>
                  </div>
                )}
                {saveStatus === 'error' && (
                  <div className="flex items-center space-x-2 text-red-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">Save Error</span>
                  </div>
                )}
                
                {/* Manual Save Button */}
                <button
                  onClick={handleManualSave}
                  disabled={saveStatus === 'saving'}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                  title="Save progress"
                >
                  Save
                </button>
                
                {/* Clear Draft Button (Development only) */}
                {process.env.NODE_ENV === 'development' && (
                  <button
                    onClick={handleClearDraft}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                    title="Clear saved draft (dev only)"
                  >
                    Clear Draft
                  </button>
                )}
              </div>
              
              <button
                onClick={onCancel}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Progress Indicator */}
      <FlowProgress
        steps={FLOW_STEPS}
        currentStep={currentStep}
        completedSteps={Object.keys(stepValidation).filter(stepId => 
          stepValidation[stepId]?.valid
        )}
        onStepClick={handleStepJump}
      />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Step Header */}
          <div className="px-6 py-4 border-b">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getCurrentStep().icon}</span>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {getCurrentStep().name}
                </h2>
                <p className="text-sm text-gray-500">
                  {getCurrentStep().description}
                </p>
              </div>
            </div>
            
            {errors[getCurrentStep().id] && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{errors[getCurrentStep().id]}</p>
              </div>
            )}

          </div>
          
          {/* Step Content */}
          <div className="p-6">
            {renderCurrentStep()}
          </div>
          
          {/* Navigation */}
          <FlowNavigation
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
            isLoading={isLoading}
            canProceed={stepValidation[getCurrentStep().id]?.valid}
            onPrevious={handlePrevious}
            onNext={handleNext}
            nextLabel={isLastStep ? 'Complete Campaign' : 'Continue'}
          />
        </div>
      </div>
    </div>
  );
};

export default CampaignFlowV2; 