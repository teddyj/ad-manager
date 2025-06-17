/**
 * ProductCompositionService
 * Handles precise product placement and scaling within background scenes
 */
export class ProductCompositionService {
  
  /**
   * Create a composite image with scaled product and background
   * @param {string} productImageUrl - URL of the product image
   * @param {string} backgroundImageUrl - URL of the background image
   * @param {Object} options - Composition options
   * @returns {Promise<string>} - Composite image data URL
   */
  static async composeProductWithBackground(productImageUrl, backgroundImageUrl, options = {}) {
    const {
      productScale = 1.0,           // Scale factor for product (0.1 - 3.0)
      productPositionX = 0.5,       // X position (0-1, 0.5 = center)
      productPositionY = 0.5,       // Y position (0-1, 0.5 = center)
      canvasWidth = 1024,           // Output canvas width
      canvasHeight = 1024,          // Output canvas height
      removeBackground = true,      // Whether to remove product background
      quality = 0.9                 // Output quality
    } = options;

    return new Promise(async (resolve, reject) => {
      try {
        // Load both images
        const [productImg, backgroundImg] = await Promise.all([
          this.loadImage(productImageUrl),
          this.loadImage(backgroundImageUrl)
        ]);

        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // Draw background (scaled to fill canvas)
        const bgScale = Math.max(canvasWidth / backgroundImg.width, canvasHeight / backgroundImg.height);
        const bgWidth = backgroundImg.width * bgScale;
        const bgHeight = backgroundImg.height * bgScale;
        const bgX = (canvasWidth - bgWidth) / 2;
        const bgY = (canvasHeight - bgHeight) / 2;
        
        ctx.drawImage(backgroundImg, bgX, bgY, bgWidth, bgHeight);

        // Process product image (remove background if needed)
        let processedProductImg = productImg;
        if (removeBackground) {
          processedProductImg = await this.removeBackground(productImg);
        }

        // Calculate product dimensions and position with more dramatic scaling
        const baseProductSize = Math.min(canvasWidth, canvasHeight) * 0.5; // Base size 50% of canvas
        const productRatio = processedProductImg.width / processedProductImg.height;
        
        let productWidth, productHeight;
        if (productRatio > 1) {
          // Landscape product
          productWidth = baseProductSize * productScale;
          productHeight = productWidth / productRatio;
        } else {
          // Portrait product
          productHeight = baseProductSize * productScale;
          productWidth = productHeight * productRatio;
        }

        console.log('Product composition details:', {
          originalSize: `${processedProductImg.width}x${processedProductImg.height}`,
          targetSize: `${productWidth}x${productHeight}`,
          scale: productScale,
          position: `${productPositionX}, ${productPositionY}`,
          canvasSize: `${canvasWidth}x${canvasHeight}`
        });

        // Position product
        const productX = (canvasWidth * productPositionX) - (productWidth / 2);
        const productY = (canvasHeight * productPositionY) - (productHeight / 2);

        // Draw product with shadow/depth effect
        this.drawProductWithEffects(ctx, processedProductImg, productX, productY, productWidth, productHeight);

        // Convert to data URL
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);

      } catch (error) {
        reject(new Error(`Composition failed: ${error.message}`));
      }
    });
  }

  /**
   * Load an image from URL (with CORS handling)
   * @private
   */
  static async loadImage(imageUrl) {
    return new Promise(async (resolve, reject) => {
      try {
        // Convert to data URL to avoid CORS issues
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
        
        const blob = await response.blob();
        const dataUrl = await new Promise((res, rej) => {
          const reader = new FileReader();
          reader.onload = () => res(reader.result);
          reader.onerror = () => rej(new Error('Failed to read blob'));
          reader.readAsDataURL(blob);
        });

        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = dataUrl;
        
      } catch (error) {
        reject(new Error(`Image loading failed: ${error.message}`));
      }
    });
  }

  /**
   * Remove background from product image using edge detection and color similarity
   * @private
   */
  static async removeBackground(productImg) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = productImg.width;
      canvas.height = productImg.height;

      // Draw original image
      ctx.drawImage(productImg, 0, 0);

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const width = canvas.width;
      const height = canvas.height;

      // Sample corner pixels to determine background color
      const corners = [
        [0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1]
      ];
      
      let bgR = 0, bgG = 0, bgB = 0, cornerCount = 0;
      
      corners.forEach(([x, y]) => {
        const idx = (y * width + x) * 4;
        bgR += data[idx];
        bgG += data[idx + 1];
        bgB += data[idx + 2];
        cornerCount++;
      });
      
      bgR = Math.round(bgR / cornerCount);
      bgG = Math.round(bgG / cornerCount);
      bgB = Math.round(bgB / cornerCount);

      // Remove background based on color similarity
      const tolerance = 30; // Adjustable tolerance
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Calculate color distance from background
        const distance = Math.sqrt(
          Math.pow(r - bgR, 2) + 
          Math.pow(g - bgG, 2) + 
          Math.pow(b - bgB, 2)
        );
        
        // If pixel is similar to background color, make it transparent
        if (distance < tolerance) {
          data[i + 3] = 0; // Set alpha to 0 (transparent)
        }
      }

      // Apply flood fill from edges to catch any missed background areas
      this.floodFillBackground(data, width, height, bgR, bgG, bgB, tolerance);

      ctx.putImageData(imageData, 0, 0);

      // Convert back to image
      const processedImg = new Image();
      processedImg.onload = () => resolve(processedImg);
      processedImg.src = canvas.toDataURL();
    });
  }

  /**
   * Flood fill algorithm to remove background from edges
   * @private
   */
  static floodFillBackground(data, width, height, bgR, bgG, bgB, tolerance) {
    const visited = new Set();
    const stack = [];
    
    // Add edge pixels to stack
    for (let x = 0; x < width; x++) {
      stack.push([x, 0]); // Top edge
      stack.push([x, height - 1]); // Bottom edge
    }
    for (let y = 0; y < height; y++) {
      stack.push([0, y]); // Left edge
      stack.push([width - 1, y]); // Right edge
    }
    
    while (stack.length > 0) {
      const [x, y] = stack.pop();
      const key = `${x},${y}`;
      
      if (visited.has(key) || x < 0 || x >= width || y < 0 || y >= height) {
        continue;
      }
      
      visited.add(key);
      const idx = (y * width + x) * 4;
      
      // Skip if already transparent
      if (data[idx + 3] === 0) continue;
      
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      // Calculate distance from background color
      const distance = Math.sqrt(
        Math.pow(r - bgR, 2) + 
        Math.pow(g - bgG, 2) + 
        Math.pow(b - bgB, 2)
      );
      
      if (distance < tolerance) {
        // Make transparent
        data[idx + 3] = 0;
        
        // Add neighboring pixels
        stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
      }
    }
  }

  /**
   * Draw product with realistic effects (shadow, lighting)
   * @private
   */
  static drawProductWithEffects(ctx, productImg, x, y, width, height) {
    // Save context
    ctx.save();

    // Add subtle shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;

    // Draw product
    ctx.drawImage(productImg, x, y, width, height);

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Restore context
    ctx.restore();
  }

  /**
   * Generate different composition presets
   */
  static getCompositionPresets() {
    return {
      'table-small': {
        productScale: 0.4,
        productPositionX: 0.5,
        productPositionY: 0.7,
        description: 'Small product on table'
      },
      'table-medium': {
        productScale: 0.6,
        productPositionX: 0.5,
        productPositionY: 0.65,
        description: 'Medium product on table'
      },
      'table-large': {
        productScale: 0.8,
        productPositionX: 0.5,
        productPositionY: 0.6,
        description: 'Large product on table'
      },
      'shelf-small': {
        productScale: 0.3,
        productPositionX: 0.3,
        productPositionY: 0.4,
        description: 'Small product on shelf'
      },
      'shelf-medium': {
        productScale: 0.5,
        productPositionX: 0.4,
        productPositionY: 0.45,
        description: 'Medium product on shelf'
      },
      'hero-large': {
        productScale: 1.0,
        productPositionX: 0.5,
        productPositionY: 0.5,
        description: 'Hero product shot'
      },
      'lifestyle-small': {
        productScale: 0.25,
        productPositionX: 0.7,
        productPositionY: 0.6,
        description: 'Product in lifestyle scene'
      }
    };
  }
} 