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
 * - Browser back button support with URL fragments
 */

const FLOW_STEPS = [
  {
    id: 'product',
    name: 'Product Selection',
    description: 'Choose your product and upload images',
    icon: '📦',
    component: ProductSelection,
    required: true,
    urlFragment: '#step-product'
  },
  {
    id: 'audience',
    name: 'Audience Building',
    description: 'Define your target audience',
    icon: '🎯',
    component: AudienceBuilder,
    required: true,
    urlFragment: '#step-audience'
  },
  {
    id: 'platforms',
    name: 'Platform Selection',
    description: 'Choose advertising platforms and budgets',
    icon: '🚀',
    component: PlatformSelector,
    required: true,
    urlFragment: '#step-platforms'
  },
  {
    id: 'creative',
    name: 'Creative Building',
    description: 'Generate and customize ad creatives',
    icon: '🎨',
    component: CreativeBuilder,
    required: true,
    urlFragment: '#step-creative'
  },
  {
    id: 'publish',
    name: 'Publish & Launch',
    description: 'Review and launch your campaign',
    icon: '📢',
    component: PublishManager,
    required: true,
    urlFragment: '#step-publish'
  }
];

const CampaignFlowV2 = ({ onComplete, onCancel, initialData = {}, dbOperations }) => {
  // Flow state management
  const [currentStep, setCurrentStep] = useState(0);
  
  // Edit mode detection - check if we have an existing campaign ID
  const isEditMode = initialData?.id && !initialData.id.startsWith(`campaign_${Date.now()}`);
  
  const [campaignData, setCampaignData] = useState({
    id: initialData?.id || `campaign_${Date.now()}`, // Preserve existing ID if available
    name: initialData?.name || '',
    createdAt: initialData?.createdAt || new Date().toISOString(),
    status: initialData?.status || 'draft',
    version: 2,
    isEditMode, // Add edit mode flag
    ...initialData
  });
  
  // Initialize step data - restore from initialData if in edit mode
  const [stepData, setStepData] = useState(() => {
    if (isEditMode && initialData) {
      console.log('🔄 Restoring step data for edit mode:', {
        campaignId: initialData.id,
        campaignName: initialData.name,
        hasProduct: !!initialData.product,
        hasAudience: !!initialData.audience,
        hasPlatforms: !!initialData.platforms,
        hasCreative: !!initialData.creative,
        hasPublish: !!initialData.publish
      });
      
      const restoredData = {
        product: initialData.product || null,
        audience: initialData.audience || null,
        platforms: initialData.platforms || [],
        creative: initialData.creative || {},
        publish: initialData.publish || null
      };
      
      console.log('📋 Restored step data details:', restoredData);
      return restoredData;
    }
    
    // Default for new campaigns
    console.log('🆕 Initializing new campaign step data');
    return {
      product: initialData?.product || null, // Support product selection from manager
      audience: null,
      platforms: [],
      creative: {},
      publish: null
    };
  });
  
  const [stepValidation, setStepValidation] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saving', 'saved', 'error'
  
  // Debug/diagnostics panel
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  
  // Note: Feature flag check is now handled at the App level

  // Browser history management for Campaign Flow V2
  const updateUrlFragment = useCallback((stepIndex) => {
    const step = FLOW_STEPS[stepIndex];
    if (step?.urlFragment && window.location.hash !== step.urlFragment) {
      // Use replaceState to avoid creating too many history entries during initial setup
      const method = window.location.hash ? 'pushState' : 'replaceState';
      window.history[method](null, '', step.urlFragment);
    }
  }, []);

  // Validate if a step transition is allowed based on current progress
  const validateStepTransition = useCallback((fromStepIndex, toStepIndex) => {
    // Allow going backward to any previous step
    if (toStepIndex <= fromStepIndex) {
      return true;
    }
    
    // Allow going forward only to the next step if current step is valid
    if (toStepIndex === fromStepIndex + 1) {
      const currentStepId = FLOW_STEPS[fromStepIndex]?.id;
      return stepValidation[currentStepId]?.valid || false;
    }
    
    // Don't allow skipping steps forward
    return false;
  }, [stepValidation]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash;
      
      // Find step index from URL fragment
      const stepIndex = FLOW_STEPS.findIndex(step => step.urlFragment === hash);
      
      if (stepIndex !== -1 && stepIndex !== currentStep) {
        // Validate if the transition is allowed
        const isValidTransition = validateStepTransition(currentStep, stepIndex);
        
        if (isValidTransition) {
          setCurrentStep(stepIndex);
          setErrors({}); // Clear errors when navigating via browser
        } else {
          // If transition is not valid, update URL to match current valid state
          updateUrlFragment(currentStep);
        }
      }
    };

    // Set initial fragment when component mounts or step changes
    updateUrlFragment(currentStep);

    // Listen for browser navigation events
    window.addEventListener('popstate', handlePopState);
    
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentStep, updateUrlFragment, validateStepTransition]);
  
  // Get current step configuration
  const getCurrentStep = () => FLOW_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === FLOW_STEPS.length - 1;
  
  // Enhanced step navigation handlers with URL updates
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
      await validateStepData(step.id, stepData[step.id]);
      
      if (isLastStep) {
        // Complete the flow
        await handleComplete();
      } else {
        // Move to next step and update URL
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        updateUrlFragment(nextStep);
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        [step.id]: error.message || 'An error occurred while proceeding'
      }));
    } finally {
      setIsLoading(false);
    }
  }, [currentStep, stepData, stepValidation, isLastStep, updateUrlFragment]);
  
  const handlePrevious = useCallback(() => {
    const previousStep = Math.max(currentStep - 1, 0);
    setCurrentStep(previousStep);
    updateUrlFragment(previousStep);
    setErrors({}); // Clear errors when going back
  }, [currentStep, updateUrlFragment]);
  
  const handleStepJump = useCallback((stepIndex) => {
    // Validate step transition
    const isValidTransition = validateStepTransition(currentStep, stepIndex);
    
    if (isValidTransition) {
      setCurrentStep(stepIndex);
      updateUrlFragment(stepIndex);
      setErrors({});
    }
  }, [currentStep, validateStepTransition, updateUrlFragment]);

  // Validation helper for step data (used in handleNext)
  const validateStepData = async (stepId, data) => {
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
      
      // Auto-save using database adapter (non-blocking)
      setTimeout(async () => {
        try {
          setSaveStatus('saving');
          
          // Use database adapter for saving
          const result = await dbOperations.saveCampaignDraft(campaignData.id, updatedCampaignData);
          
          if (result.success) {
            setSaveStatus('saved');
            console.log('📁 Auto-saved campaign data to database:', {
              stepId,
              campaignId: campaignData.id,
              hasCreatives: !!updatedCampaignData.creative?.creatives,
              creativesCount: Object.keys(updatedCampaignData.creative?.creatives || {}).length,
              autoSavedAt: result.draft?.autoSavedAt
            });
          } else {
            throw new Error(result.error || 'Failed to save draft');
          }
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
            
            // Try to save minimal data to database, fallback to localStorage
            try {
              await dbOperations.saveCampaignDraft(`${campaignData.id}_minimal`, minimalData);
              setSaveStatus('saved-minimal');
              console.log('💾 Emergency minimal save completed (database)');
            } catch (dbError) {
              console.warn('Database emergency save failed, but localStorage fallback removed to prevent quota errors');
              setSaveStatus('error');
            }
          } catch (emergencyError) {
            console.error('Emergency save also failed:', emergencyError);
            setSaveStatus('error');
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
  
  // Note: Data optimization functions removed since database can handle larger data efficiently
  
  // Note: Storage management functions removed since database handles persistence efficiently
  
  const updateStepValidation = useCallback((stepId, validation) => {
    setStepValidation(prev => ({
      ...prev,
      [stepId]: validation
    }));
  }, []);
  
  // Load saved draft data on component mount
  useEffect(() => {
    const loadSavedDraft = async () => {
      try {
        // Try to load draft from database first
        const savedDraft = await dbOperations.getCampaignDraft(campaignData.id);
        
        if (savedDraft && savedDraft.stepData) {
          console.log('📂 Loading saved campaign draft from database:', {
            campaignId: campaignData.id,
            lastUpdated: savedDraft.autoSavedAt,
            hasCreativeStep: !!savedDraft.stepData.creative,
            creativesCount: Object.keys(savedDraft.stepData.creative?.creatives || {}).length
          });
          
          // Restore step data from draft
          setStepData({
            product: savedDraft.stepData.product || null,
            audience: savedDraft.stepData.audience || null,
            platforms: savedDraft.stepData.platforms || [],
            creative: savedDraft.stepData.creative || {},
            publish: savedDraft.stepData.publish || null
          });
          
          // Update campaign data
          setCampaignData(prev => ({
            ...prev,
            ...savedDraft.stepData,
            // Preserve the original ID and creation time
            id: prev.id,
            createdAt: prev.createdAt
          }));
        } else {
          // Fallback: try to load from minimal draft
          try {
            const minimalDraft = await dbOperations.getCampaignDraft(`${campaignData.id}_minimal`);
            if (minimalDraft && minimalDraft.stepData) {
              console.log('📂 Loading minimal campaign draft from database');
              setStepData(prev => ({ ...prev, ...minimalDraft.stepData }));
            } else {
              // Final fallback: check localStorage for legacy drafts
              const localDraft = localStorage.getItem(`campaign_draft_${campaignData.id}`);
              if (localDraft) {
                const parsedDraft = JSON.parse(localDraft);
                console.log('📂 Loading legacy draft from localStorage');
                setStepData({
                  product: parsedDraft.product || null,
                  audience: parsedDraft.audience || null,
                  platforms: parsedDraft.platforms || [],
                  creative: parsedDraft.creative || {},
                  publish: parsedDraft.publish || null
                });
                setCampaignData(prev => ({
                  ...prev,
                  ...parsedDraft,
                  id: prev.id,
                  createdAt: prev.createdAt
                }));
              }
            }
          } catch (minimalError) {
            console.warn('Failed to load minimal draft:', minimalError);
          }
        }
      } catch (error) {
        console.warn('Failed to load saved campaign draft:', error);
        // Final fallback to localStorage
        try {
          const localDraft = localStorage.getItem(`campaign_draft_${campaignData.id}`);
          const minimalLocalDraft = localStorage.getItem(`campaign_minimal_${campaignData.id}`);
          
          if (localDraft) {
            const parsedDraft = JSON.parse(localDraft);
            console.log('🆘 Recovered from localStorage draft');
            setStepData({
              product: parsedDraft.product || null,
              audience: parsedDraft.audience || null,
              platforms: parsedDraft.platforms || [],
              creative: parsedDraft.creative || {},
              publish: parsedDraft.publish || null
            });
          } else if (minimalLocalDraft) {
            const parsedMinimal = JSON.parse(minimalLocalDraft);
            console.log('🆘 Recovered from minimal localStorage draft');
            setStepData(prev => ({ ...prev, ...parsedMinimal }));
          }
        } catch (recoveryError) {
          console.error('Failed to recover from localStorage:', recoveryError);
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
  
  // Save campaign data using database adapter
  const saveCampaignData = async (data) => {
    console.log('Saving final campaign data:', data);
    console.log('🔄 Edit mode:', data.isEditMode ? 'UPDATE existing campaign' : 'CREATE new campaign');
    
    try {
      let result;
      
      if (data.isEditMode) {
        // Update existing campaign
        console.log('📝 Updating existing campaign:', data.id);
        result = await dbOperations.updateCampaign(data.id, data);
      } else {
        // Create new campaign
        console.log('🆕 Creating new campaign:', data.id);
        result = await dbOperations.saveAd(data);
      }
      
      if (result.success) {
        console.log('✅ Campaign saved successfully to database');
        
        // Clean up the draft after successful save
        try {
          await dbOperations.deleteCampaignDraft(data.id);
          await dbOperations.deleteCampaignDraft(`${data.id}_minimal`);
          localStorage.removeItem(`campaign_draft_${data.id}`);
          localStorage.removeItem(`campaign_minimal_${data.id}`);
          console.log('🧹 Cleaned up draft after successful save');
        } catch (cleanupError) {
          console.warn('Failed to clean up draft:', cleanupError);
        }
        
        return result;
      } else {
        throw new Error(result.error || 'Failed to save campaign');
      }
    } catch (error) {
      console.error('❌ Failed to save campaign:', error);
      throw error;
    }
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
      
      const result = await dbOperations.saveCampaignDraft(campaignData.id, finalCampaignData);
      
      if (result.success) {
        setSaveStatus('saved');
        console.log('💾 Manual save completed:', {
          campaignId: campaignData.id,
          stepsWithData: Object.keys(stepData).filter(key => stepData[key])
        });
      } else {
        throw new Error(result.error || 'Failed to save manually');
      }
    } catch (error) {
      console.error('Manual save failed:', error);
      setSaveStatus('error');
    }
  }, [campaignData, stepData, dbOperations]);
  
  // Clear draft function (for development/testing)
  const handleClearDraft = useCallback(async () => {
    try {
      // Clear from database
      await dbOperations.deleteCampaignDraft(campaignData.id);
      // Clear minimal draft too
      await dbOperations.deleteCampaignDraft(`${campaignData.id}_minimal`);
      // Clear any legacy localStorage entries
      localStorage.removeItem(`campaign_draft_${campaignData.id}`);
      localStorage.removeItem(`campaign_minimal_${campaignData.id}`);
      
      console.log('🗑️ Cleared draft for campaign:', campaignData.id);
      alert('Draft cleared! Refresh the page to start fresh.');
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  }, [campaignData.id, dbOperations]);
  
  // Keyboard shortcut for diagnostics (Ctrl+Shift+D)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setShowDiagnostics(prev => !prev);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // Diagnostics functions
  const runDiagnostics = async () => {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      databaseMode: dbOperations.isUsingDatabase ? dbOperations.isUsingDatabase() : 'unknown',
      campaignData: {
        id: campaignData.id,
        stepsWithData: Object.keys(stepData).filter(key => stepData[key]),
        stepDataSizes: Object.keys(stepData).reduce((acc, key) => {
          if (stepData[key]) {
            acc[key] = Math.round(JSON.stringify(stepData[key]).length / 1024);
          }
          return acc;
        }, {})
      },
      storage: {
        localStorage: {
          keys: Object.keys(localStorage).filter(key => key.includes('campaign')),
          sizes: Object.keys(localStorage).reduce((acc, key) => {
            if (key.includes('campaign')) {
              try {
                acc[key] = Math.round(localStorage.getItem(key).length / 1024);
              } catch (e) {
                acc[key] = 'error';
              }
            }
            return acc;
          }, {}),
          totalSizeKB: Object.keys(localStorage).reduce((total, key) => {
            try {
              return total + localStorage.getItem(key).length;
            } catch (e) {
              return total;
            }
          }, 0) / 1024
        }
      },
      database: {
        available: dbOperations.isUsingDatabase ? dbOperations.isUsingDatabase() : false,
        draftsStored: 'checking...' // Could be async checked
      },
      images: {
        productImages: stepData.product?.images?.length || 0,
        creativeImages: (() => {
          let count = 0;
          if (stepData.creative?.creatives) {
            Object.values(stepData.creative.creatives).forEach(creative => {
              creative.elements?.forEach(el => {
                if ((el.type === 'image' || el.type === 'product') && el.content) {
                  count++;
                }
              });
            });
          }
          return count;
        })()
      }
    };
    
    console.log('🔍 Campaign Diagnostics:', diagnostics);
    return diagnostics;
  };
  
  const clearAllDrafts = async () => {
    let clearedCount = 0;
    
    try {
      // Clear database drafts if available
      if (dbOperations.isUsingDatabase && dbOperations.isUsingDatabase()) {
        try {
          await dbOperations.deleteCampaignDraft(campaignData.id);
          await dbOperations.deleteCampaignDraft(`${campaignData.id}_minimal`);
          clearedCount += 2;
          console.log('🗑️ Cleared database drafts');
        } catch (dbError) {
          console.warn('Failed to clear database drafts:', dbError);
        }
      }
      
      // Clear localStorage drafts as fallback/legacy cleanup
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith('campaign_draft_') || 
        key.startsWith('campaign_minimal_') || 
        key.startsWith('campaign_recovery_')
      );
      
      keys.forEach(key => localStorage.removeItem(key));
      clearedCount += keys.length;
      
      console.log(`🗑️ Cleared ${clearedCount} total draft entries`);
      alert(`Cleared ${clearedCount} draft entries. Using database for better storage management.`);
    } catch (error) {
      console.error('Error clearing drafts:', error);
      alert('Failed to clear some drafts. Please try again.');
    }
  };
  
  const exportDiagnostics = () => {
    const diagnostics = runDiagnostics();
    const blob = new Blob([JSON.stringify(diagnostics, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaign-diagnostics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
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

  // Cleanup URL fragment when component unmounts
  useEffect(() => {
    return () => {
      // Reset to the main campaign flow hash when leaving the component
      if (window.location.hash.startsWith('#step-')) {
        window.history.replaceState(null, '', '#campaign-flow-v2');
      }
    };
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                {isEditMode ? 'Edit Campaign' : 'Create Campaign'}
              </h1>
              {campaignData.name && (
                <span className="text-sm text-gray-500">
                  - {campaignData.name}
                </span>
              )}
              {isEditMode && (
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Edit Mode
                  </span>
                  <span className="text-xs text-gray-500">
                    Created: {new Date(campaignData.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Database Status Indicator */}
              <div className="text-xs px-3 py-2 rounded-md bg-green-100 text-green-700 cursor-help"
                   title="Using database for reliable data storage">
                🗄️ Database Mode
              </div>
              
              {/* Save Status Indicator */}
              <div className={`text-xs px-3 py-2 rounded-md transition-all duration-200 ${
                saveStatus === 'saving' ? 'bg-blue-100 text-blue-700 animate-pulse' :
                saveStatus === 'saved' ? 'bg-green-100 text-green-700' :
                saveStatus === 'saved-minimal' ? 'bg-yellow-100 text-yellow-700' :
                saveStatus === 'saved-recovery' ? 'bg-orange-100 text-orange-700' :
                saveStatus === 'error-quota' ? 'bg-red-100 text-red-700' :
                saveStatus === 'error' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                {saveStatus === 'saving' && '💾 Saving...'}
                {saveStatus === 'saved' && '✅ Saved'}
                {saveStatus === 'saved-minimal' && '⚠️ Saved (Minimal)'}
                {saveStatus === 'saved-recovery' && '🆘 Saved (Recovery)'}
                {saveStatus === 'error-quota' && '🚨 Storage Full'}
                {saveStatus === 'error' && '❌ Save Error'}
                {!saveStatus && '💾 Auto-Save'}
              </div>
              
              {/* Diagnostics Button (Development) */}
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={() => setShowDiagnostics(true)}
                  className="text-xs px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  title="Open diagnostics panel (Ctrl+Shift+D)"
                >
                  🔍 Debug
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
      
      {/* Save Error Notifications */}
      {saveStatus === 'error' && (
        <div className="border-l-4 p-4 mb-4 bg-red-50 border-red-400">
          <div className="flex">
            <div className="flex-shrink-0">🚨</div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Save Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Failed to save your work. Your changes may not persist.</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <button
                    onClick={handleManualSave}
                    className="inline-flex items-center px-3 py-1 border border-red-300 text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
                  >
                    Retry Save
                  </button>
                  <button
                    onClick={() => setShowDiagnostics(true)}
                    className="inline-flex items-center px-3 py-1 border border-red-300 text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
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
      
      {/* Development Diagnostics Panel */}
      {showDiagnostics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">🔍 Campaign Diagnostics</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={exportDiagnostics}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Export JSON
                </button>
                <button
                  onClick={clearAllDrafts}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Clear All Drafts
                </button>
                <button
                  onClick={() => setShowDiagnostics(false)}
                  className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              {(() => {
                const diagnostics = runDiagnostics();
                return (
                  <div className="space-y-6">
                    {/* Storage Usage */}
                    <div>
                      <h4 className="font-semibold mb-2">💾 Storage Usage</h4>
                      <div className="bg-gray-50 p-3 rounded text-sm">
                        <div>Total: {diagnostics.storage.totalSizeKB}KB ({diagnostics.storage.usagePercent}%)</div>
                        <div>Campaign Drafts: {diagnostics.storage.campaignDraftSizeKB}KB ({diagnostics.storage.campaignDraftCount} drafts)</div>
                        <div className={`${diagnostics.storage.critical ? 'text-red-600' : diagnostics.storage.approaching ? 'text-orange-600' : 'text-green-600'}`}>
                          Status: {diagnostics.storage.critical ? 'Critical' : diagnostics.storage.approaching ? 'Approaching Limit' : 'Healthy'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Current Campaign */}
                    <div>
                      <h4 className="font-semibold mb-2">📋 Current Campaign</h4>
                      <div className="bg-gray-50 p-3 rounded text-sm">
                        <div>ID: {diagnostics.campaignData.id}</div>
                        <div>Steps with data: {diagnostics.campaignData.stepsWithData.join(', ') || 'None'}</div>
                        <div>Step data sizes (KB): {JSON.stringify(diagnostics.campaignData.stepDataSizes, null, 2)}</div>
                      </div>
                    </div>
                    
                    {/* LocalStorage Keys */}
                    <div>
                      <h4 className="font-semibold mb-2">🗂️ LocalStorage Campaign Keys</h4>
                      <div className="bg-gray-50 p-3 rounded text-sm">
                        <div>Count: {diagnostics.localStorage.keys.length}</div>
                        <div className="mt-2">
                          {diagnostics.localStorage.keys.length > 0 ? (
                            <details>
                              <summary className="cursor-pointer">View keys and sizes</summary>
                              <pre className="mt-2 text-xs overflow-x-auto">
                                {JSON.stringify(diagnostics.localStorage.sizes, null, 2)}
                              </pre>
                            </details>
                          ) : (
                            <div className="text-gray-500">No campaign keys found</div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Images */}
                    <div>
                      <h4 className="font-semibold mb-2">🖼️ Images</h4>
                      <div className="bg-gray-50 p-3 rounded text-sm">
                        <div>Product images: {diagnostics.images.productImages}</div>
                        <div>Creative images: {diagnostics.images.creativeImages}</div>
                      </div>
                    </div>
                    
                    {/* Product Step Details */}
                    {stepData.product && (
                      <div>
                        <h4 className="font-semibold mb-2">📦 Product Details</h4>
                        <div className="bg-gray-50 p-3 rounded text-sm">
                          <div>Name: {stepData.product.name || 'N/A'}</div>
                          <div>Images count: {stepData.product.images?.length || 0}</div>
                          {stepData.product.images?.length > 0 && (
                            <details className="mt-2">
                              <summary className="cursor-pointer">View image details</summary>
                              <div className="mt-2 space-y-2">
                                {stepData.product.images.map((img, idx) => (
                                  <div key={idx} className="text-xs bg-white p-2 rounded border">
                                    <div>ID: {img.id}</div>
                                    <div>URL Type: {
                                      img.url?.startsWith('data:') ? 'Base64' :
                                      img.url?.startsWith('blob:') ? 'Blob' :
                                      img.url?.startsWith('http') ? 'HTTP' : 'Unknown'
                                    }</div>
                                    <div>Size: {img.fileSize ? Math.round(img.fileSize / 1024) + 'KB' : 'Unknown'}</div>
                                    <div>Status: {img.metadata?.processingStatus || 'Unknown'}</div>
                                  </div>
                                ))}
                              </div>
                            </details>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Instructions */}
                    <div>
                      <h4 className="font-semibold mb-2">ℹ️ Instructions</h4>
                      <div className="bg-blue-50 p-3 rounded text-sm">
                        <div>• Press <kbd className="bg-gray-200 px-1 rounded">Ctrl+Shift+D</kbd> to toggle this panel</div>
                        <div>• Export JSON to share diagnostics with support</div>
                        <div>• Clear drafts to free up storage space</div>
                        <div>• Check console for detailed logging</div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignFlowV2; 