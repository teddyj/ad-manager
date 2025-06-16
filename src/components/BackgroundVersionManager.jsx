import React, { useState } from 'react';

/**
 * BackgroundVersionManager Component
 * Displays and manages background versions for an image
 */
function BackgroundVersionManager({ 
  image, 
  onVersionSelect, 
  onVersionDelete, 
  currentActiveVersion = null 
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  if (!image) return null;

  const backgroundVersions = image.backgroundVersions || [];
  const hasVersions = backgroundVersions.length > 0;

  const handleVersionSelect = (versionId) => {
    onVersionSelect(versionId);
  };

  const handleVersionDelete = (versionId) => {
    onVersionDelete(versionId);
    setShowDeleteConfirm(null);
  };

  const formatProcessingTime = (ms) => {
    if (!ms) return 'Unknown';
    const seconds = Math.round(ms / 1000);
    return `${seconds}s`;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
    return `${Math.round(bytes / (1024 * 1024))}MB`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Background Versions
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {backgroundVersions.length} version{backgroundVersions.length !== 1 ? 's' : ''}
        </span>
      </div>

      {!hasVersions ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm">No custom backgrounds created yet</p>
          <p className="text-xs mt-1">Use the background styles above to create variations</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Original image */}
          <div 
            className={`relative border-2 rounded-lg p-3 cursor-pointer transition-all ${
              currentActiveVersion === null 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
            onClick={() => handleVersionSelect(null)}
          >
            <div className="flex items-center gap-3">
              <div className="relative w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={image.url}
                  alt="Original"
                  className="w-full h-full object-cover"
                />
                {currentActiveVersion === null && (
                  <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-white">Original</span>
                  {currentActiveVersion === null && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Original product image
                </p>
              </div>
            </div>
          </div>

          {/* Background versions */}
          {backgroundVersions.map((version) => (
            <div 
              key={version.id}
              className={`relative border-2 rounded-lg p-3 cursor-pointer transition-all ${
                currentActiveVersion === version.id 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
              onClick={() => handleVersionSelect(version.id)}
            >
              <div className="flex items-center gap-3">
                <div className="relative w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={version.url}
                    alt={version.prompt}
                    className="w-full h-full object-cover"
                  />
                  {currentActiveVersion === version.id && (
                    <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-white truncate">
                      {version.prompt.length > 40 ? `${version.prompt.substring(0, 40)}...` : version.prompt}
                    </span>
                    {currentActiveVersion === version.id && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Active
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>Created {new Date(version.created).toLocaleDateString()}</span>
                    {version.processingTime && (
                      <span>Processed in {formatProcessingTime(version.processingTime)}</span>
                    )}
                    {version.metadata?.fileSize && (
                      <span>{formatFileSize(version.metadata.fileSize)}</span>
                    )}
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(version.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
                    title="Delete this version"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Delete Background Version
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to delete this background version? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleVersionDelete(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BackgroundVersionManager; 