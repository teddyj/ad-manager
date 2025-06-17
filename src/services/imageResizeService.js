/**
 * ImageResizeService
 * Handles canvas-based image resizing and cropping operations
 */
export class ImageResizeService {
  /**
   * Resize image to specific dimensions
   * @param {File|string} imageSource - File object or data URL
   * @param {Object} targetSize - {width, height}
   * @param {Object} options - {quality, format, cropArea}
   * @returns {Promise<string>} - Resized image data URL
   */
  static async resizeImage(imageSource, targetSize, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
          try {
            const { width: targetWidth, height: targetHeight } = targetSize;
            const { quality = 0.9, format = 'image/jpeg', cropArea } = options;

            // Set canvas dimensions to target size
            canvas.width = targetWidth;
            canvas.height = targetHeight;

            // Clear canvas
            ctx.clearRect(0, 0, targetWidth, targetHeight);

            if (cropArea) {
              // Draw cropped area
              ctx.drawImage(
                img,
                cropArea.x, cropArea.y, cropArea.width, cropArea.height, // Source
                0, 0, targetWidth, targetHeight // Destination
              );
            } else {
              // Calculate optimal crop area if not provided
              const optimalCrop = this.calculateOptimalCrop(
                { width: img.width, height: img.height },
                targetSize
              );
              
              ctx.drawImage(
                img,
                optimalCrop.x, optimalCrop.y, optimalCrop.width, optimalCrop.height,
                0, 0, targetWidth, targetHeight
              );
            }

            // Convert to data URL
            const dataUrl = canvas.toDataURL(format, quality);
            resolve(dataUrl);
          } catch (error) {
            reject(new Error(`Error processing image: ${error.message}`));
          }
        };

        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };

        // Handle different image source types
        if (typeof imageSource === 'string') {
          img.src = imageSource;
        } else if (imageSource instanceof File) {
          const reader = new FileReader();
          reader.onload = (e) => {
            img.src = e.target.result;
          };
          reader.onerror = () => {
            reject(new Error('Failed to read file'));
          };
          reader.readAsDataURL(imageSource);
        } else {
          reject(new Error('Invalid image source type'));
        }
      } catch (error) {
        reject(new Error(`Error setting up image resize: ${error.message}`));
      }
    });
  }

  /**
   * Get optimal crop area for target aspect ratio (center crop)
   * @param {Object} imageSize - {width, height}
   * @param {Object} targetSize - {width, height}
   * @returns {Object} - {x, y, width, height}
   */
  static calculateOptimalCrop(imageSize, targetSize) {
    const { width: imgWidth, height: imgHeight } = imageSize;
    const { width: targetWidth, height: targetHeight } = targetSize;

    const imgAspectRatio = imgWidth / imgHeight;
    const targetAspectRatio = targetWidth / targetHeight;

    let cropWidth, cropHeight, cropX, cropY;

    if (imgAspectRatio > targetAspectRatio) {
      // Image is wider than target - crop width
      cropHeight = imgHeight;
      cropWidth = imgHeight * targetAspectRatio;
      cropX = (imgWidth - cropWidth) / 2;
      cropY = 0;
    } else {
      // Image is taller than target - crop height
      cropWidth = imgWidth;
      cropHeight = imgWidth / targetAspectRatio;
      cropX = 0;
      cropY = (imgHeight - cropHeight) / 2;
    }

    return {
      x: Math.round(cropX),
      y: Math.round(cropY),
      width: Math.round(cropWidth),
      height: Math.round(cropHeight)
    };
  }

  /**
   * Parse ad size string to dimensions
   * @param {string} adSize - "300x250" format
   * @returns {Object} - {width, height, aspectRatio}
   */
  static parseAdSize(adSize) {
    if (!adSize || typeof adSize !== 'string') {
      return { width: 300, height: 250, aspectRatio: 1.2 };
    }

    const parts = adSize.split('x');
    if (parts.length !== 2) {
      return { width: 300, height: 250, aspectRatio: 1.2 };
    }

    const width = parseInt(parts[0], 10);
    const height = parseInt(parts[1], 10);

    if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
      return { width: 300, height: 250, aspectRatio: 1.2 };
    }

    return {
      width,
      height,
      aspectRatio: width / height
    };
  }

  /**
   * Get image dimensions from image source
   * @param {File|string} imageSource - File object or data URL
   * @returns {Promise<Object>} - {width, height}
   */
  static async getImageDimensions(imageSource) {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height
        });
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for dimension calculation'));
      };

      if (typeof imageSource === 'string') {
        img.src = imageSource;
      } else if (imageSource instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => {
          img.src = e.target.result;
        };
        reader.onerror = () => {
          reject(new Error('Failed to read file for dimensions'));
        };
        reader.readAsDataURL(imageSource);
      } else {
        reject(new Error('Invalid image source type'));
      }
    });
  }

  /**
   * Validate crop area against image dimensions
   * @param {Object} cropArea - {x, y, width, height}
   * @param {Object} imageSize - {width, height}
   * @returns {Object} - Validated and adjusted crop area
   */
  static validateCropArea(cropArea, imageSize) {
    const { x, y, width, height } = cropArea;
    const { width: imgWidth, height: imgHeight } = imageSize;

    return {
      x: Math.max(0, Math.min(x, imgWidth - 1)),
      y: Math.max(0, Math.min(y, imgHeight - 1)),
      width: Math.max(1, Math.min(width, imgWidth - x)),
      height: Math.max(1, Math.min(height, imgHeight - y))
    };
  }

  /**
   * Calculate file size of resized image (approximate)
   * @param {Object} targetSize - {width, height}
   * @param {number} quality - Quality factor (0-1)
   * @returns {number} - Estimated file size in bytes
   */
  static estimateFileSize(targetSize, quality = 0.9) {
    const { width, height } = targetSize;
    const pixels = width * height;
    
    // Rough estimation: JPEG compression varies greatly
    // This is a very approximate calculation
    const bytesPerPixel = quality > 0.8 ? 3 : quality > 0.6 ? 2 : 1;
    return Math.round(pixels * bytesPerPixel);
  }

  /**
   * Format file size for display
   * @param {number} bytes - File size in bytes
   * @returns {string} - Formatted size string
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
} 