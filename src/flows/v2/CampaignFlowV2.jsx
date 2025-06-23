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
    setStepData(prev => ({
      ...prev,
      [stepId]: data
    }));
    
    // Clear any existing errors for this step
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[stepId];
      return newErrors;
    });
  }, []);
  
  const updateStepValidation = useCallback((stepId, validation) => {
    setStepValidation(prev => ({
      ...prev,
      [stepId]: validation
    }));
  }, []);
  
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