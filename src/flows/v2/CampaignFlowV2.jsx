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
  
  // Debug/diagnostics panel
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  
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
      setTimeout(async () => {
        try {
          setSaveStatus('saving');
          
          // Check current storage usage first
          const storageInfo = getStorageUsage();
          if (storageInfo.critical) {
            console.warn('🚨 Storage usage critical, cleaning up first...');
            cleanupOldDrafts();
          }
          
          // Optimize data before saving
          const optimizedData = optimizeForStorage(updatedCampaignData);
          
          // Check if data fits in localStorage
          const dataString = JSON.stringify(optimizedData);
          const dataSize = new Blob([dataString]).size;
          
          // If data is too large (approaching 3MB limit), use selective saving
          if (dataSize > 3 * 1024 * 1024) { // Reduced from 4MB to 3MB
            console.warn('📊 Data size large, using selective save:', {
              sizeKB: Math.round(dataSize / 1024),
              threshold: '3MB',
              storageUsage: `${storageInfo.usagePercent}%`
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
            creativesCount: Object.keys(optimizedData.creative?.creatives || {}).length,
            storageUsage: `${storageInfo.usagePercent}%`
          });
        } catch (error) {
          console.warn('Failed to auto-save campaign data:', error);
          setSaveStatus('error');
          
          // Enhanced error handling for quota exceeded
          if (error.name === 'QuotaExceededError') {
            const recoveryResult = await handleStorageQuotaError(campaignData, stepId, data);
            if (recoveryResult.success) {
              setSaveStatus(recoveryResult.type === 'minimal' ? 'saved-minimal' : 'saved-recovery');
              console.log(`✅ Recovery save successful (${recoveryResult.type})`);
            } else {
              setSaveStatus('error-quota');
              console.error('❌ All save attempts failed:', recoveryResult.error);
            }
          } else {
            // Try emergency save with minimal data for other errors
            try {
              const minimalData = {
                id: campaignData.id,
                updatedAt: new Date().toISOString(),
                [stepId]: data
              };
              localStorage.setItem(`campaign_minimal_${campaignData.id}`, JSON.stringify(minimalData));
              setSaveStatus('saved-minimal');
              console.log('💾 Emergency minimal save completed');
            } catch (emergencyError) {
              console.error('Emergency save also failed:', emergencyError);
              setSaveStatus('error');
            }
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
          creative.elements = creative.elements.map(element => {
            const optimizedElement = {
              ...element,
              // Keep only essential properties, remove computed/cached data
              ...(element.computed && { computed: undefined }),
              ...(element.cached && { cached: undefined })
            };
            
            // Optimize image content - replace base64 with placeholders in storage
            if (element.type === 'image' || element.type === 'product') {
              if (element.content && element.content.startsWith('data:')) {
                // Store image metadata instead of full base64
                optimizedElement.content = '[IMAGE_DATA_PLACEHOLDER]';
                optimizedElement.imageMetadata = {
                  hasImage: true,
                  type: element.content.substring(5, element.content.indexOf(';')),
                  size: element.content.length
                };
              }
            }
            
            return optimizedElement;
          });
        }
      });
    }
    
    // Optimize product data - remove large image data
    if (optimized.product?.images) {
      optimized.product.images = optimized.product.images.map(img => ({
        ...img,
        // Replace base64 URLs with placeholders to save space
        url: img.url && img.url.startsWith('data:') ? '[IMAGE_DATA_PLACEHOLDER]' : img.url,
        originalUrl: img.originalUrl && img.originalUrl.startsWith('blob:') ? '[BLOB_URL_PLACEHOLDER]' : img.originalUrl,
        processedUrl: img.processedUrl && img.processedUrl.startsWith('data:') ? '[IMAGE_DATA_PLACEHOLDER]' : img.processedUrl,
        thumbnailUrl: img.thumbnailUrl && img.thumbnailUrl.startsWith('data:') ? '[IMAGE_DATA_PLACEHOLDER]' : img.thumbnailUrl
      }));
    }
    
    return optimized;
  };

  const optimizeCreativeData = (creativeData) => {
    if (!creativeData?.creatives) return creativeData;
    
    const optimized = { ...creativeData };
    const creatives = {};
    
    // Keep only the most recent 2 creatives to save space (reduced from 3)
    const sortedCreatives = Object.entries(creativeData.creatives)
      .sort(([,a], [,b]) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
      .slice(0, 2);
    
    sortedCreatives.forEach(([id, creative]) => {
      creatives[id] = {
        id: creative.id,
        formatId: creative.formatId,
        elements: creative.elements?.slice(0, 5) || [], // Further limit elements to 5
        updatedAt: creative.updatedAt,
        // Keep only essential properties
        ...(creative.selectedFormat && { selectedFormat: creative.selectedFormat })
      };
      
      // Remove image content from elements in storage
      if (creatives[id].elements) {
        creatives[id].elements = creatives[id].elements.map(el => {
          if ((el.type === 'image' || el.type === 'product') && el.content && el.content.startsWith('data:')) {
            return {
              ...el,
              content: '[IMAGE_DATA_PLACEHOLDER]',
              imageMetadata: {
                hasImage: true,
                type: el.content.substring(5, el.content.indexOf(';')),
                originalSize: el.content.length
              }
            };
          }
          return el;
        });
      }
    });
    
    optimized.creatives = creatives;
    return optimized;
  };
  
  // Enhanced storage cleanup and monitoring
  const cleanupOldDrafts = () => {
    try {
      const keys = Object.keys(localStorage);
      const now = new Date();
      let cleanedCount = 0;
      let reclaimedSize = 0;
      
      keys.forEach(key => {
        if (key.startsWith('campaign_draft_') || key.startsWith('campaign_minimal_')) {
          try {
            const data = localStorage.getItem(key);
            const parsed = JSON.parse(data);
            const updatedAt = new Date(parsed.updatedAt);
            const daysSinceUpdate = (now - updatedAt) / (1000 * 60 * 60 * 24);
            
            // Remove drafts older than 3 days (reduced from 7)
            if (daysSinceUpdate > 3) {
              reclaimedSize += data.length;
              localStorage.removeItem(key);
              cleanedCount++;
            }
          } catch (e) {
            // Remove corrupted entries
            const data = localStorage.getItem(key);
            if (data) reclaimedSize += data.length;
            localStorage.removeItem(key);
            cleanedCount++;
          }
        }
      });
      
      if (cleanedCount > 0) {
        console.log(`🧹 Cleaned up ${cleanedCount} old draft entries, reclaimed ${Math.round(reclaimedSize / 1024)}KB`);
      }
      
      return { cleanedCount, reclaimedSize };
    } catch (error) {
      console.warn('Failed to cleanup old drafts:', error);
      return { cleanedCount: 0, reclaimedSize: 0 };
    }
  };

  const getStorageUsage = () => {
    try {
      let totalSize = 0;
      let campaignDraftSize = 0;
      let campaignDraftCount = 0;
      
      Object.keys(localStorage).forEach(key => {
        const itemSize = localStorage.getItem(key).length;
        totalSize += itemSize;
        
        if (key.startsWith('campaign_draft_') || key.startsWith('campaign_minimal_')) {
          campaignDraftSize += itemSize;
          campaignDraftCount++;
        }
      });
      
      const maxSize = 5 * 1024 * 1024; // 5MB limit
      const usagePercent = Math.round((totalSize / maxSize) * 100);
      
      return {
        totalSizeKB: Math.round(totalSize / 1024),
        campaignDraftSizeKB: Math.round(campaignDraftSize / 1024),
        campaignDraftCount,
        usagePercent,
        approaching: usagePercent > 70, // Lower threshold for better UX
        critical: usagePercent > 90
      };
    } catch (error) {
      return { 
        totalSizeKB: 0, 
        campaignDraftSizeKB: 0,
        campaignDraftCount: 0,
        usagePercent: 0, 
        approaching: false,
        critical: false 
      };
    }
  };
  
  // Enhanced emergency storage management
  const handleStorageQuotaError = async (campaignData, stepId, data) => {
    console.warn('🚨 Storage quota exceeded, attempting recovery...');
    
    // Step 1: Clean up old drafts
    const cleanup = cleanupOldDrafts();
    
    // Step 2: Try minimal essential data save
    try {
      const minimalData = {
        id: campaignData.id,
        updatedAt: new Date().toISOString(),
        // Only save the most critical current step data
        [stepId]: {
          // Extract only non-image data for most steps
          ...(stepId === 'product' && data?.name && { 
            name: data.name,
            category: data.category,
            brand: data.brand,
            imageCount: data?.images?.length || 0
          }),
          ...(stepId === 'audience' && data && { 
            ...data 
          }),
          ...(stepId === 'platforms' && data && { 
            selectedPlatforms: data.selectedPlatforms?.map(p => p.id) || [],
            count: data.selectedPlatforms?.length || 0
          }),
          ...(stepId === 'creative' && data && { 
            selectedFormats: data.selectedFormats || [],
            creativesCount: Object.keys(data.creatives || {}).length,
            lastGenerated: data.lastGenerated
          }),
          ...(stepId === 'publish' && data && { 
            ...data 
          })
        }
      };
      
      localStorage.setItem(`campaign_minimal_${campaignData.id}`, JSON.stringify(minimalData));
      console.log('💾 Emergency minimal save completed:', {
        stepId,
        dataSizeKB: Math.round(JSON.stringify(minimalData).length / 1024),
        cleanedItems: cleanup.cleanedCount,
        reclaimedKB: Math.round(cleanup.reclaimedSize / 1024)
      });
      
      return { success: true, type: 'minimal' };
    } catch (emergencyError) {
      console.error('💥 Emergency save failed:', emergencyError);
      
      // Step 3: Last resort - store only step ID and timestamp
      try {
        const lastResortData = {
          id: campaignData.id,
          updatedAt: new Date().toISOString(),
          lastStep: stepId,
          stepTimestamp: Date.now()
        };
        
        localStorage.setItem(`campaign_recovery_${campaignData.id}`, JSON.stringify(lastResortData));
        console.log('🆘 Last resort recovery save completed');
        
        return { success: true, type: 'recovery' };
      } catch (lastResortError) {
        console.error('💀 All save attempts failed:', lastResortError);
        return { success: false, error: 'Storage completely exhausted' };
      }
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
  const runDiagnostics = () => {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      storage: getStorageUsage(),
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
      localStorage: {
        keys: Object.keys(localStorage).filter(key => key.includes('campaign')),
        sizes: Object.keys(localStorage).reduce((acc, key) => {
          if (key.includes('campaign')) {
            acc[key] = Math.round(localStorage.getItem(key).length / 1024);
          }
          return acc;
        }, {})
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
  
  const clearAllDrafts = () => {
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith('campaign_draft_') || 
      key.startsWith('campaign_minimal_') || 
      key.startsWith('campaign_recovery_')
    );
    
    keys.forEach(key => localStorage.removeItem(key));
    console.log(`🗑️ Cleared ${keys.length} draft entries`);
    alert(`Cleared ${keys.length} draft entries. Refresh to see storage changes.`);
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
                const statusClasses = storageInfo.critical 
                  ? 'bg-red-100 text-red-700 border border-red-200' 
                  : storageInfo.approaching 
                    ? 'bg-orange-100 text-orange-700 border border-orange-200' 
                    : 'bg-gray-100 text-gray-600';
                
                return (
                  <div className={`text-xs px-3 py-2 rounded-md ${statusClasses} cursor-help`}
                       title={`Total: ${storageInfo.totalSizeKB}KB | Drafts: ${storageInfo.campaignDraftSizeKB}KB (${storageInfo.campaignDraftCount} drafts)`}>
                    {storageInfo.critical ? '🚨' : storageInfo.approaching ? '⚠️' : '💾'} 
                    Storage: {storageInfo.usagePercent}%
                    {storageInfo.critical && ' (Critical!)'}
                    {storageInfo.approaching && !storageInfo.critical && ' (High)'}
                  </div>
                );
              })()}
              
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
      
      {/* User Notifications Banner */}
      {(() => {
        const storageInfo = getStorageUsage();
        const showStorageWarning = storageInfo.approaching || storageInfo.critical;
        const showQuotaError = saveStatus === 'error-quota';
        const showMinimalSave = saveStatus === 'saved-minimal' || saveStatus === 'saved-recovery';
        
        if (!showStorageWarning && !showQuotaError && !showMinimalSave) return null;
        
        return (
          <div className={`border-l-4 p-4 mb-4 ${
            showQuotaError || storageInfo.critical 
              ? 'bg-red-50 border-red-400' 
              : showMinimalSave || storageInfo.approaching 
                ? 'bg-yellow-50 border-yellow-400' 
                : 'bg-blue-50 border-blue-400'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {showQuotaError || storageInfo.critical ? '🚨' : '⚠️'}
              </div>
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${
                  showQuotaError || storageInfo.critical ? 'text-red-800' : 'text-yellow-800'
                }`}>
                  {showQuotaError ? 'Storage Full - Save Failed' :
                   storageInfo.critical ? 'Storage Critical' :
                   showMinimalSave ? 'Limited Save Mode' :
                   'Storage Warning'}
                </h3>
                <div className={`mt-2 text-sm ${
                  showQuotaError || storageInfo.critical ? 'text-red-700' : 'text-yellow-700'
                }`}>
                  {showQuotaError && (
                    <div className="space-y-2">
                      <p>Your browser storage is full. Your work could not be saved completely.</p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={clearAllDrafts}
                          className="inline-flex items-center px-3 py-1 border border-red-300 text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
                        >
                          Clear Old Drafts
                        </button>
                        <button
                          onClick={() => setShowDiagnostics(true)}
                          className="inline-flex items-center px-3 py-1 border border-red-300 text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {storageInfo.critical && !showQuotaError && (
                    <div className="space-y-2">
                      <p>Browser storage is nearly full ({storageInfo.usagePercent}%). Consider clearing old data.</p>
                      <button
                        onClick={clearAllDrafts}
                        className="inline-flex items-center px-3 py-1 border border-yellow-300 text-xs font-medium rounded text-yellow-700 bg-yellow-100 hover:bg-yellow-200"
                      >
                        Clear Old Drafts
                      </button>
                    </div>
                  )}
                  
                  {showMinimalSave && (
                    <div className="space-y-2">
                      <p>Your work was saved in minimal mode due to storage constraints. Some data may not persist.</p>
                      <div className="text-xs">
                        <p>• Product images may not appear after refresh</p>
                        <p>• Some creative elements may be missing</p>
                        <p>• Consider clearing old drafts to improve saving</p>
                      </div>
                    </div>
                  )}
                  
                  {storageInfo.approaching && !storageInfo.critical && !showQuotaError && (
                    <div>
                      <p>Browser storage is getting full ({storageInfo.usagePercent}%). You may want to clear old campaign drafts.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
      
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