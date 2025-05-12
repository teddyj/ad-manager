const axios = require('axios');
const cheerio = require('cheerio');

// Cache helper functions (simplified for serverless)
const productCache = new Map();
const CACHE_TTL = 3600000; // 1 hour in milliseconds

// List of common user agents to rotate through
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15'
];

// Get a random user agent
const getRandomUserAgent = () => {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
};

// Function to check if a site is blocked or requires special handling
const isBlockedSite = (url) => {
  const blockedDomains = [
    'amazon.com', 'amazon.co.uk', 'amazon.ca', 'amazon.de', 
    'walmart.com', 'bestbuy.com', 'costco.com',
    'target.com/s/', 'amazon.com/s' // Search results pages
  ];
  const urlObj = new URL(url);
  
  // Check against blocked domains
  if (blockedDomains.some(domain => urlObj.hostname.includes(domain))) {
    return true;
  }
  
  // Check if it's a search results page
  if (urlObj.pathname.includes('/search') || 
      urlObj.pathname.includes('/s/') || 
      urlObj.search.includes('searchTerm=') ||
      urlObj.search.includes('q=')) {
    return true;
  }
  
  return false;
};

// Function to get product info from restricted sites
const getRestrictedSiteProductInfo = async (url) => {
  // Extract the domain for site-specific handling
  const domain = new URL(url).hostname;
  
  if (domain.includes('amazon')) {
    throw new Error('Amazon blocks automated image extraction. Please try a different retailer or upload an image directly.');
  } else if (domain.includes('walmart')) {
    throw new Error('Walmart product images cannot be automatically extracted. Please try a different retailer.');
  } else if (domain.includes('search') || url.includes('?q=')) {
    throw new Error('Search results pages are not supported. Please use a direct product page URL.');
  }
  
  // Generic message for other blocked sites
  throw new Error('This site restricts automated access to product images. Please try a different URL or upload an image directly.');
};

module.exports = async (req, res) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  // Basic URL validation
  if (!url || !url.startsWith('http')) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  try {
    console.log(`Fetching product page: ${url}`);
    
    // Check if it's a site that typically blocks scraping
    if (isBlockedSite(url)) {
      try {
        // Try specialized handler
        const restrictedData = await getRestrictedSiteProductInfo(url);
        return res.json(restrictedData);
      } catch (error) {
        return res.status(403).json({ 
          error: error.message,
          alternativeSuggestion: 'Try using a direct product URL from a different retailer, or upload an image directly.'
        });
      }
    }
    
    // For other sites, proceed with normal scraping
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.google.com/',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0',
      },
      timeout: 8000 // 8 second timeout
    });
    
    const $ = cheerio.load(html);
    
    // Try Open Graph image (usually high quality)
    let imageUrl = $('meta[property="og:image"]').attr('content');
    
    // Try Twitter Card image
    if (!imageUrl) {
      imageUrl = $('meta[name="twitter:image"]').attr('content');
    }
    
    // Try product schema markup
    if (!imageUrl) {
      const schemaScript = $('script[type="application/ld+json"]').html();
      if (schemaScript) {
        try {
          const schema = JSON.parse(schemaScript);
          if (schema.image) {
            imageUrl = Array.isArray(schema.image) ? schema.image[0] : schema.image;
          }
        } catch (e) {
          console.log('Error parsing schema:', e.message);
        }
      }
    }
    
    // Fallback: look for largest image or product-related images
    if (!imageUrl) {
      let maxArea = 0;
      let maxSrc = '';
      
      $('img').each((i, el) => {
        const src = $(el).attr('src');
        if (!src) return;
        
        // Skip tiny images, icons, logos, etc.
        const width = parseInt($(el).attr('width')) || 0;
        const height = parseInt($(el).attr('height')) || 0;
        
        // Check for product-related classes or alt text
        const alt = $(el).attr('alt') || '';
        const className = $(el).attr('class') || '';
        
        const isProductImage = 
          alt.toLowerCase().includes('product') || 
          className.toLowerCase().includes('product') ||
          src.toLowerCase().includes('product');
        
        const area = width * height;
        
        // Prioritize product images, but also consider image size
        if ((isProductImage && area > maxArea / 2) || area > maxArea) {
          maxArea = area;
          maxSrc = src;
        }
      });
      
      if (maxSrc) {
        imageUrl = maxSrc;
      }
    }
    
    // Ensure the image URL is absolute
    if (imageUrl && !imageUrl.startsWith('http')) {
      try {
        const baseUrl = new URL(url).origin;
        // Handle different types of relative URLs
        if (imageUrl.startsWith('//')) {
          // Protocol-relative URL
          imageUrl = `https:${imageUrl}`;
        } else if (imageUrl.startsWith('/')) {
          // Root-relative URL
          imageUrl = `${baseUrl}${imageUrl}`;
        } else {
          // Regular relative URL
          const urlPath = new URL(url).pathname;
          const urlDir = urlPath.substring(0, urlPath.lastIndexOf('/') + 1);
          imageUrl = new URL(imageUrl, `${baseUrl}${urlDir}`).toString();
        }
      } catch (e) {
        console.error('Error converting to absolute URL:', e.message);
      }
    }
    
    if (imageUrl) {
      const description = $('meta[name="description"]').attr('content') || 
                        $('meta[property="og:description"]').attr('content') || '';
      
      // Limit description to 125 characters
      const truncatedDescription = description.length > 125 ? 
        description.substring(0, 125) + '...' : 
        description;
      
      const productInfo = { 
        imageUrl,
        title: $('title').text() || $('meta[property="og:title"]').attr('content') || '',
        description: truncatedDescription
      };
            
      return res.json(productInfo);
    } else {
      return res.status(404).json({ error: 'No product image found' });
    }
  } catch (error) {
    console.error('Error fetching product page:', error.message);
    
    // Provide more helpful error response
    let statusCode = 500;
    let errorMessage = `Failed to fetch product page: ${error.message}`;
    
    if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Could not connect to the website. The site may be down or blocking our request.';
    } else if (error.code === 'ENOTFOUND') {
      statusCode = 404;
      errorMessage = 'Website not found. Please check the URL and try again.';
    } else if (error.response) {
      statusCode = error.response.status;
      if (statusCode === 403) {
        errorMessage = 'Access denied by the website. This site may block automated requests.';
      } else if (statusCode === 404) {
        errorMessage = 'Page not found. Please check the URL and try again.';
      }
    } else if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
      errorMessage = 'Request timed out. The website may be slow or blocking our request.';
    }
    
    return res.status(statusCode).json({ 
      error: errorMessage,
      alternativeSuggestion: 'Try uploading an image directly instead.'
    });
  }
}; 