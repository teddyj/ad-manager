import React from 'react';

// Simple SVG Icon Components
const ChevronLeftIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
  </svg>
);

const CheckIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

/**
 * Flow Navigation Component
 * Provides Previous/Next navigation buttons for the campaign flow
 */

const FlowNavigation = ({ 
  isFirstStep, 
  isLastStep, 
  isLoading, 
  canProceed, 
  onPrevious, 
  onNext,
  nextLabel = 'Continue',
  previousLabel = 'Previous',
  showProgress = false
}) => {
  const getNextButtonClasses = () => {
    const baseClasses = "inline-flex items-center px-4 py-2 border font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
    
    if (isLoading) {
      return `${baseClasses} border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed`;
    } else if (canProceed) {
      return `${baseClasses} border-transparent text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 shadow-sm`;
    } else {
      return `${baseClasses} border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed`;
    }
  };

  const getPreviousButtonClasses = () => {
    const baseClasses = "inline-flex items-center px-4 py-2 border font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
    
    if (isFirstStep) {
      return `${baseClasses} border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed`;
    } else {
      return `${baseClasses} border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500 shadow-sm`;
    }
  };

  const LoadingSpinner = () => (
    <svg 
      className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  return (
    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
      <div className="flex items-center justify-between">
        {/* Previous Button */}
        <button
          type="button"
          onClick={onPrevious}
          disabled={isFirstStep || isLoading}
          className={getPreviousButtonClasses()}
        >
          <ChevronLeftIcon className="w-4 h-4 mr-2" />
          {previousLabel}
        </button>

        {/* Progress Info (Optional) */}
        {showProgress && (
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            {canProceed && (
              <div className="flex items-center text-green-600">
                <CheckIcon className="w-4 h-4 mr-1" />
                <span>Ready to continue</span>
              </div>
            )}
            {!canProceed && !isLoading && (
              <span className="text-amber-600">
                Complete required fields to continue
              </span>
            )}
            {isLoading && (
              <div className="flex items-center text-blue-600">
                <LoadingSpinner />
                <span>Processing...</span>
              </div>
            )}
          </div>
        )}

        {/* Next Button */}
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed || isLoading}
          className={getNextButtonClasses()}
        >
          {isLoading ? (
            <>
              <LoadingSpinner />
              Processing...
            </>
          ) : (
            <>
              {nextLabel}
              {!isLastStep && <ChevronRightIcon className="w-4 h-4 ml-2" />}
              {isLastStep && <CheckIcon className="w-4 h-4 ml-2" />}
            </>
          )}
        </button>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="mt-3 flex items-center justify-center space-x-6 text-xs text-gray-400">
        <div className="flex items-center space-x-1">
          <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-gray-600">
            ←
          </kbd>
          <span>Previous</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-gray-600">
            →
          </kbd>
          <span>Next</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-gray-600">
            Esc
          </kbd>
          <span>Cancel</span>
        </div>
      </div>
    </div>
  );
};

export default FlowNavigation; 