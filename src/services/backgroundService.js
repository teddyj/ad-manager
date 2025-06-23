import { fal } from "@fal-ai/client";
import { BACKGROUND_CHANGE_DEFAULTS, BACKGROUND_STATUS } from '../constants/backgroundPrompts.js';

/**
 * Background Service for handling fal.ai background change API
 */
export class BackgroundService {
  static isConfigured = false;
  static requestQueue = new Map();
  static maxRetries = 3;
  static retryDelay = 1000; // 1 second base delay

  /**
   * Initialize the service with API configuration
   */
  static init() {
    if (typeof window !== 'undefined' && import.meta.env.VITE_FAL_API_KEY) {
      const apiKey = import.meta.env.VITE_FAL_API_KEY;
      console.log('🔧 Background Service: Initializing with API key:', apiKey ? `${apiKey.slice(0, 8)}...` : 'missing');
      
      fal.config({
        credentials: apiKey
      });
      this.isConfigured = true;
      
      // Development warning about credentials exposure
      if (import.meta.env.DEV) {
        console.info('🔧 Background Service: Running in development mode. fal credentials are exposed in browser environment. This is normal for development but should not be used in production.');
      }
    } else {
      console.warn('Background Service: FAL_API_KEY not configured');
    }
  }

  /**
   * Check if the background change feature is enabled
   */
  static isEnabled() {
    return this.isConfigured && 
           import.meta.env.VITE_ENABLE_BACKGROUND_CHANGE !== 'false';
  }

  /**
   * Upload an image file to fal.ai storage
   * @param {File} file - The image file to upload
   * @returns {Promise<string>} The uploaded file URL
   */
  static async uploadImage(file) {
    if (!this.isConfigured) {
      throw new Error('Background service not configured');
    }

    try {
      // Validate file
      if (!file || !file.type.startsWith('image/')) {
        throw new Error('Invalid image file');
      }

      // Check file size (limit to 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('Image file too large (max 10MB)');
      }

      console.log('Uploading image to fal.ai storage...');
      const url = await fal.storage.upload(file);
      console.log('Image uploaded successfully:', url);
      
      return url;
    } catch (error) {
      console.error('Failed to upload image:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  /**
   * Change the background of an image
   * @param {string} imageUrl - URL of the image to process
   * @param {string} prompt - Background description prompt
   * @param {Object} options - Additional options for the API call
   * @param {number} productScale - Scale factor for the product (0.1 to 2.0)
   * @returns {Promise<Object>} Result with processed image URL and metadata
   */
  static async changeBackground(imageUrl, prompt, options = {}, productScale = 1.0) {
    if (!this.isConfigured) {
      throw new Error('Background service not configured');
    }

    if (!imageUrl || !prompt) {
      throw new Error('Image URL and prompt are required');
    }

    const requestId = `bg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Track request
      this.requestQueue.set(requestId, {
        status: BACKGROUND_STATUS.PROCESSING,
        startTime: Date.now()
      });

      console.log('Starting background change:', { imageUrl, prompt, requestId });

      // Enhance prompt with product scaling context
      let enhancedPrompt = prompt;
      if (productScale !== 1.0) {
        if (productScale < 0.8) {
          enhancedPrompt += `, with the product appearing smaller and more proportional to the scene`;
        } else if (productScale > 1.2) {
          enhancedPrompt += `, with the product appearing larger and more prominent in the scene`;
        }
      }

      // Prepare API parameters with validation
      const apiParams = {
        image_url: imageUrl,
        prompt: enhancedPrompt,
        ...BACKGROUND_CHANGE_DEFAULTS,
        ...options
      };

      // Validate required parameters
      if (!apiParams.image_url) {
        throw new Error('image_url is required');
      }
      if (!apiParams.prompt || apiParams.prompt.trim().length === 0) {
        throw new Error('prompt is required and cannot be empty');
      }

      // Validate image URL format
      try {
        new URL(apiParams.image_url);
      } catch (e) {
        throw new Error('image_url must be a valid URL');
      }

      // Use apiParams directly - let the API handle validation
      const cleanParams = apiParams;

      // Make the API call with retry logic
      const result = await this.makeApiCallWithRetry(cleanParams, requestId);

      // Update request status
      this.requestQueue.set(requestId, {
        status: BACKGROUND_STATUS.COMPLETED,
        startTime: this.requestQueue.get(requestId).startTime,
        endTime: Date.now(),
        result
      });

      console.log('Background change completed:', result);
      console.log('First image details:', result.images?.[0]);
      console.log('Extracted imageUrl:', result.images?.[0]?.url);

      return {
        success: true,
        requestId,
        imageUrl: result.images?.[0]?.url,
        originalUrl: imageUrl,
        prompt,
        processingTime: Date.now() - this.requestQueue.get(requestId).startTime,
        metadata: {
          width: result.images?.[0]?.width,
          height: result.images?.[0]?.height,
          fileSize: result.images?.[0]?.file_size,
          seed: result.seed
        }
      };

    } catch (error) {
      // Update request status
      this.requestQueue.set(requestId, {
        status: BACKGROUND_STATUS.ERROR,
        error: error.message,
        endTime: Date.now()
      });

      console.error('Background change failed:', error);
      throw new Error(`Background change failed: ${error.message}`);
    }
  }

  /**
   * Make API call with retry logic
   * @private
   */
  static async makeApiCallWithRetry(params, requestId, attempt = 1) {
    try {
      console.log('Making fal.ai API call with parameters:', {
        endpoint: "fal-ai/image-editing/background-change",
        paramCount: Object.keys(params).length,
        paramKeys: Object.keys(params),
        hasImageUrl: !!params.image_url,
        hasPrompt: !!params.prompt,
        promptLength: params.prompt ? params.prompt.length : 0,
        promptValue: params.prompt,
        imageUrlValid: params.image_url ? params.image_url.startsWith('https://') : false,
        otherParams: Object.keys(params).filter(k => !['image_url', 'prompt'].includes(k)),
        allParams: params
      });

      const result = await fal.subscribe("fal-ai/image-editing/background-change", {
        input: params,
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            // Update request status with progress
            const existingRequest = this.requestQueue.get(requestId);
            if (existingRequest) {
              this.requestQueue.set(requestId, {
                ...existingRequest,
                status: BACKGROUND_STATUS.PROCESSING,
                logs: update.logs?.map(log => log.message) || []
              });
            }
          }
        }
      });

      return result.data;
      
    } catch (error) {
      // Enhanced error logging for validation errors
      if (error.message?.includes('422') || error.message?.toLowerCase().includes('validation')) {
        console.error('API Validation Error Details:', {
          errorName: error.name,
          errorMessage: error.message,
          errorStatus: error.status,
          errorBody: error.body,
          params: params,
          hint: 'Check if all required parameters are provided and have valid values'
        });
      }

      if (attempt < this.maxRetries && this.isRetryableError(error)) {
        console.warn(`API call failed (attempt ${attempt}/${this.maxRetries}), retrying...`, error.message);
        
        // Exponential backoff
        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return this.makeApiCallWithRetry(params, requestId, attempt + 1);
      }
      
      throw error;
    }
  }

  /**
   * Check if an error is retryable
   * @private
   */
  static isRetryableError(error) {
    const retryableErrors = [
      'timeout',
      'network',
      'rate limit',
      'temporary',
      'service unavailable',
      'failed to fetch',
      'mixed content',
      '429', // Too Many Requests
      '500', // Internal Server Error
      '502', // Bad Gateway
      '503', // Service Unavailable
      '504'  // Gateway Timeout
    ];

    const errorMessage = error.message?.toLowerCase() || '';
    return retryableErrors.some(keyword => errorMessage.includes(keyword));
  }

  /**
   * Get the status of a background change request
   * @param {string} requestId - The request ID to check
   * @returns {Object|null} Request status and details
   */
  static getRequestStatus(requestId) {
    return this.requestQueue.get(requestId) || null;
  }

  /**
   * Cancel a background change request
   * @param {string} requestId - The request ID to cancel
   */
  static cancelRequest(requestId) {
    if (this.requestQueue.has(requestId)) {
      const request = this.requestQueue.get(requestId);
      if (request.status === BACKGROUND_STATUS.PROCESSING) {
        this.requestQueue.set(requestId, {
          ...request,
          status: BACKGROUND_STATUS.ERROR,
          error: 'Request cancelled by user',
          endTime: Date.now()
        });
      }
    }
  }

  /**
   * Clean up old completed requests (call periodically)
   */
  static cleanup() {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes

    for (const [requestId, request] of this.requestQueue.entries()) {
      if (request.endTime && (now - request.endTime) > maxAge) {
        this.requestQueue.delete(requestId);
      }
    }
  }

  /**
   * Get usage statistics
   */
  static getUsageStats() {
    const requests = Array.from(this.requestQueue.values());
    const now = Date.now();
    const lastHour = now - (60 * 60 * 1000);

    return {
      totalRequests: requests.length,
      recentRequests: requests.filter(r => r.startTime > lastHour).length,
      completedRequests: requests.filter(r => r.status === BACKGROUND_STATUS.COMPLETED).length,
      failedRequests: requests.filter(r => r.status === BACKGROUND_STATUS.ERROR).length,
      processingRequests: requests.filter(r => r.status === BACKGROUND_STATUS.PROCESSING).length
    };
  }
}

// Initialize the service
BackgroundService.init();

// Set up periodic cleanup
if (typeof window !== 'undefined') {
  setInterval(() => {
    BackgroundService.cleanup();
  }, 5 * 60 * 1000); // Every 5 minutes
} 