import React from 'react';

// Simple SVG Check Icon Component
const CheckIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

/**
 * Flow Progress Component
 * Displays a horizontal step indicator showing user progress through the campaign flow
 */

const FlowProgress = ({ steps, currentStep, completedSteps = [], onStepClick }) => {
  const getStepStatus = (stepIndex, stepId) => {
    if (completedSteps.includes(stepId)) {
      return 'completed';
    } else if (stepIndex === currentStep) {
      return 'current';
    } else if (stepIndex < currentStep) {
      return 'accessible';
    } else {
      return 'upcoming';
    }
  };

  const getStepClasses = (status) => {
    const baseClasses = "relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200";
    
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-green-500 border-green-500 text-white hover:bg-green-600`;
      case 'current':
        return `${baseClasses} bg-blue-600 border-blue-600 text-white shadow-lg`;
      case 'accessible':
        return `${baseClasses} bg-white border-gray-300 text-gray-600 hover:border-blue-400 cursor-pointer`;
      case 'upcoming':
      default:
        return `${baseClasses} bg-gray-100 border-gray-200 text-gray-400`;
    }
  };

  const getConnectorClasses = (stepIndex) => {
    const isPreviousCompleted = stepIndex > 0 && (
      completedSteps.includes(steps[stepIndex - 1].id) || 
      stepIndex - 1 < currentStep
    );
    
    return `absolute top-5 left-0 w-full h-0.5 transition-colors duration-200 ${
      isPreviousCompleted ? 'bg-green-500' : 'bg-gray-200'
    }`;
  };

  const handleStepClick = (stepIndex, stepId, status) => {
    if ((status === 'completed' || status === 'current' || status === 'accessible') && onStepClick) {
      onStepClick(stepIndex);
    }
  };

  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav aria-label="Campaign creation progress">
          <ol className="flex items-center justify-between">
            {steps.map((step, stepIndex) => {
              const status = getStepStatus(stepIndex, step.id);
              const isClickable = status === 'completed' || status === 'current' || status === 'accessible';
              
              return (
                <li key={step.id} className="relative flex-1">
                  {/* Connector Line */}
                  {stepIndex > 0 && (
                    <div className={getConnectorClasses(stepIndex)} />
                  )}
                  
                  {/* Step Circle and Content */}
                  <div className="relative flex flex-col items-center group">
                    <button
                      onClick={() => handleStepClick(stepIndex, step.id, status)}
                      disabled={!isClickable}
                      className={`${getStepClasses(status)} ${
                        isClickable ? 'cursor-pointer' : 'cursor-default'
                      }`}
                      aria-current={status === 'current' ? 'step' : undefined}
                    >
                      {status === 'completed' ? (
                        <CheckIcon className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-semibold">
                          {step.icon || stepIndex + 1}
                        </span>
                      )}
                    </button>
                    
                    {/* Step Label */}
                    <div className="mt-2 text-center">
                      <p className={`text-sm font-medium transition-colors duration-200 ${
                        status === 'current' 
                          ? 'text-blue-600' 
                          : status === 'completed'
                          ? 'text-green-600'
                          : 'text-gray-600'
                      }`}>
                        {step.name}
                      </p>
                      
                      {/* Step Description - Only show on hover or current */}
                      <p className={`text-xs mt-1 transition-opacity duration-200 ${
                        status === 'current' 
                          ? 'text-gray-500 opacity-100' 
                          : 'text-gray-400 opacity-0 group-hover:opacity-100'
                      }`}>
                        {step.description}
                      </p>
                    </div>
                    
                    {/* Required Indicator */}
                    {step.required && status === 'upcoming' && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full border-2 border-white">
                        <span className="sr-only">Required step</span>
                      </div>
                    )}
                    
                    {/* Current Step Indicator */}
                    {status === 'current' && (
                      <div className="absolute -bottom-2 w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </nav>
        
        {/* Progress Summary */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>
            Step {currentStep + 1} of {steps.length}
          </span>
          
          <span>
            {completedSteps.length} of {steps.length} completed
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
          <div 
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300 ease-out"
            style={{ 
              width: `${((currentStep + completedSteps.length) / steps.length) * 100}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default FlowProgress; 