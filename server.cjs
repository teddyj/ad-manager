const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

// Simple in-memory cache for product info
const productCache = new Map();
const CACHE_TTL = 3600000; // 1 hour in milliseconds

// Cache helper functions
const getCachedProduct = (url) => {
  const cached = productCache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`Cache hit for URL: ${url}`);
    return cached.data;
  }
  return null;
};

const cacheProduct = (url, data) => {
  productCache.set(url, {
    data,
    timestamp: Date.now()
  });
  console.log(`Cached product info for URL: ${url}`);
};

// Clear expired cache entries periodically
setInterval(() => {
  const now = Date.now();
  let expiredCount = 0;
  
  productCache.forEach((value, key) => {
    if (now - value.timestamp > CACHE_TTL) {
      productCache.delete(key);
      expiredCount++;
    }
  });
  
  if (expiredCount > 0) {
    console.log(`Cleared ${expiredCount} expired cache entries`);
  }
}, 60000); // Check every minute

// Middleware - Increase JSON payload limit for large campaign data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Add more detailed CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    // Allow any origin
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Requested-With', 'X-Custom-Header'],
  credentials: true
}));

// Additional CORS headers for all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, X-Custom-Header');
  res.header('Access-Control-Allow-Credentials', true);
  next();
});

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

// Function to get product info from restricted sites (placeholder for future implementation)
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

/**
 * Endpoint to fetch product image from a given URL
 * POST /api/fetch-product-image
 * Request body: { url: "https://example.com/product/123" }
 * Response: { imageUrl: "https://example.com/images/product123.jpg" }
 */
app.post('/api/fetch-product-image', async (req, res) => {
  console.log('EXPRESS SERVER: Handling request to /api/fetch-product-image');
  console.log('Express server request body:', JSON.stringify(req.body));
  
  const { url } = req.body;

  // Basic URL validation
  if (!url || !url.startsWith('http')) {
    console.log('EXPRESS SERVER: Invalid URL format');
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  // Check cache first
  const cachedProduct = getCachedProduct(url);
  if (cachedProduct) {
    return res.json(cachedProduct);
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
    console.log('OG Image:', imageUrl);
    
    // Try Twitter Card image
    if (!imageUrl) {
      imageUrl = $('meta[name="twitter:image"]').attr('content');
      console.log('Twitter Image:', imageUrl);
    }
    
    // Try product schema markup
    if (!imageUrl) {
      const schemaScript = $('script[type="application/ld+json"]').html();
      if (schemaScript) {
        try {
          const schema = JSON.parse(schemaScript);
          if (schema.image) {
            imageUrl = Array.isArray(schema.image) ? schema.image[0] : schema.image;
            console.log('Schema Image:', imageUrl);
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
          
        // Calculate image area if dimensions are available
        let area = width * height;
        
        // If it seems to be a product image, give it priority
        if (isProductImage) {
          area *= 2;
        }
        
        if (area > maxArea && src) {
          maxArea = area;
          maxSrc = src;
        }
      });
      
      if (maxSrc) {
        imageUrl = maxSrc;
        console.log('Largest Image:', imageUrl);
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
      
      // Cache the result
      cacheProduct(url, productInfo);
      
      // Always set content type explicitly
      res.setHeader('Content-Type', 'application/json');
      res.json(productInfo);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.status(404).json({ error: 'No product image found' });
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
    
    // Always set content type explicitly
    res.setHeader('Content-Type', 'application/json');
    res.status(statusCode).json({ 
      error: errorMessage,
      alternativeSuggestion: 'Try uploading an image directly instead.'
    });
  }
});

// Campaign endpoint for full campaign saves (Campaign Flow V2)
app.all('/api/campaigns', async (req, res) => {
  try {
    // Initialize Supabase client if credentials are available
    let supabase = null;
    console.log('🔍 Environment check:', {
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      nodeEnv: process.env.NODE_ENV
    });
    
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createClient } = require('@supabase/supabase-js');
      supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
      console.log('✅ Supabase client initialized for campaigns endpoint');
    } else {
      console.log('⚠️ Supabase credentials not found, using file system fallback');
    }

    if (req.method === 'POST') {
      // Save complete campaign
      const campaignData = req.body;
      console.log('📋 Saving complete campaign:', campaignData.id || campaignData.name);
      
      // Generate campaign ID if not provided
      const campaignId = campaignData.id || `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('🆔 Campaign ID:', campaignId);
      
      if (supabase) {
        // Use Supabase for production
        try {
          console.log('📝 Preparing campaign record for Supabase...');
          
          // Ensure default user exists
          const defaultUserId = '00000000-0000-0000-0000-000000000001';
          console.log('👤 Ensuring default user exists...');
          
          const { data: existingUser, error: userCheckError } = await supabase
            .from('users')
            .select('id')
            .eq('id', defaultUserId)
            .single();
          
          if (userCheckError && userCheckError.code === 'PGRST116') {
            // User doesn't exist, create it
            console.log('👤 Creating default user...');
            const { error: userCreateError } = await supabase
              .from('users')
              .insert([{
                id: defaultUserId,
                email: 'demo@campaignbuilder.com',
                name: 'Demo User',
                settings: {}
              }]);
            
            if (userCreateError) {
              console.warn('⚠️ Could not create default user:', userCreateError.message);
              // Continue anyway - user might already exist
            } else {
              console.log('✅ Default user created');
            }
          } else if (existingUser) {
            console.log('✅ Default user already exists');
          }
          
          const campaignRecord = {
            id: campaignId,
            userId: defaultUserId,
            name: campaignData.name || 'Untitled Campaign',
            type: campaignData.type || 'Display Campaign',
            status: campaignData.status || 'draft',
            source: campaignData.source || 'campaign-flow-v2',
            legacyData: campaignData.adData || campaignData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          console.log('📋 Campaign record to insert:', {
            id: campaignRecord.id,
            userId: campaignRecord.userId,
            name: campaignRecord.name,
            type: campaignRecord.type,
            status: campaignRecord.status,
            source: campaignRecord.source,
            hasLegacyData: !!campaignRecord.legacyData
          });

          console.log('🚀 Attempting Supabase insert...');
          const { data, error } = await supabase
            .from('campaigns')
            .insert([campaignRecord])
            .select();

          if (error) {
            console.error('❌ Supabase insert error details:', {
              message: error.message,
              details: error.details,
              hint: error.hint,
              code: error.code
            });
            throw new Error(`Database error: ${error.message}`);
          }

          console.log('✅ Campaign saved to Supabase:', data[0]?.id);
          
          const savedCampaign = {
            ...campaignData,
            id: campaignId,
            savedAt: new Date().toISOString(),
            source: 'campaign-flow-v2',
            databaseId: data[0]?.id
          };

          res.json({ success: true, campaign: savedCampaign });
        } catch (error) {
          console.error('❌ Failed to save campaign to Supabase:', error);
          res.status(500).json({ success: false, error: error.message });
        }
      } else {
        // No Supabase credentials available
        console.error('❌ Supabase credentials not found in environment');
        
        // In serverless environments like Vercel, we can't write to filesystem
        if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
          return res.status(500).json({ 
            success: false, 
            error: 'Database connection not available. Please configure Supabase credentials in your environment variables.' 
          });
        }
        
        // Only use file system in local development
        const fs = require('fs');
        const path = require('path');
        
        const campaignsDir = path.join(process.cwd(), 'tmp', 'campaigns');
        if (!fs.existsSync(campaignsDir)) {
          fs.mkdirSync(campaignsDir, { recursive: true });
        }
        
        const campaignFile = path.join(campaignsDir, `${campaignId}.json`);
        const savedCampaign = {
          ...campaignData,
          id: campaignId,
          savedAt: new Date().toISOString(),
          source: 'campaign-flow-v2'
        };
        
        fs.writeFileSync(campaignFile, JSON.stringify(savedCampaign, null, 2));
        console.log('✅ Campaign saved to file:', campaignFile);
        res.json({ success: true, campaign: savedCampaign });
      }
      
    } else if (req.method === 'GET') {
      // Get all campaigns
      if (supabase) {
        // Use Supabase for production
        try {
          const { data, error } = await supabase
            .from('campaigns')
            .select('*')
            .order('createdAt', { ascending: false });

          if (error) {
            console.error('❌ Supabase select error:', error);
            throw new Error(`Database error: ${error.message}`);
          }

          const campaigns = data.map(record => ({
            id: record.id,
            name: record.name,
            status: record.status,
            type: record.type,
            source: record.source,
            created: new Date(record.createdAt).toLocaleDateString(),
            adData: record.legacyData,
            savedAt: record.updatedAt
          }));

          console.log('✅ Loaded campaigns from Supabase:', campaigns.length);
          res.json({ success: true, campaigns });
        } catch (error) {
          console.error('❌ Failed to get campaigns from Supabase:', error);
          res.status(500).json({ success: false, error: error.message });
        }
      } else {
        // No Supabase credentials available
        if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
          return res.status(500).json({ 
            success: false, 
            error: 'Database connection not available. Please configure Supabase credentials.' 
          });
        }
        
        // Only use file system in local development
        const fs = require('fs');
        const path = require('path');
        
        const campaignsDir = path.join(process.cwd(), 'tmp', 'campaigns');
        
        if (!fs.existsSync(campaignsDir)) {
          res.json({ success: true, campaigns: [] });
          return;
        }
        
        const campaignFiles = fs.readdirSync(campaignsDir).filter(f => f.endsWith('.json'));
        const campaigns = campaignFiles.map(file => {
          try {
            const filePath = path.join(campaignsDir, file);
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            return data;
          } catch (error) {
            console.warn('Failed to read campaign file:', file, error);
            return null;
          }
        }).filter(Boolean);
        
        res.json({ success: true, campaigns });
      }
      
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ Campaigns API error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Campaign draft endpoint
app.all('/api/campaign-draft', async (req, res) => {
  try {
    if (req.method === 'POST') {
      // Save campaign draft
      const { action, campaignId, stepData } = req.body;
      
      if (action === 'save') {
        console.log('📄 Saving campaign draft:', campaignId);
        
        // For now, we'll use a simple file-based approach since this runs server-side
        // In production, this would use the actual database
        const fs = require('fs');
        const path = require('path');
        
        // Create drafts directory if it doesn't exist
        const draftsDir = path.join(process.cwd(), 'tmp', 'drafts');
        if (!fs.existsSync(draftsDir)) {
          fs.mkdirSync(draftsDir, { recursive: true });
        }
        
        const draftFile = path.join(draftsDir, `${campaignId}.json`);
        const draftData = {
          campaignId,
          stepData,
          autoSavedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        };
        
        fs.writeFileSync(draftFile, JSON.stringify(draftData, null, 2));
        
        res.json({ success: true, draft: draftData });
      } else {
        res.status(400).json({ error: 'Invalid action' });
      }
    } else if (req.method === 'GET') {
      // Get campaign draft
      const { campaignId } = req.query;
      
      console.log('📄 Loading campaign draft:', campaignId);
      
      const fs = require('fs');
      const path = require('path');
      
      const draftFile = path.join(process.cwd(), 'tmp', 'drafts', `${campaignId}.json`);
      
      if (fs.existsSync(draftFile)) {
        const draftData = JSON.parse(fs.readFileSync(draftFile, 'utf8'));
        
        // Check if draft has expired
        if (draftData.expiresAt && new Date(draftData.expiresAt) < new Date()) {
          fs.unlinkSync(draftFile);
          res.status(404).json({ error: 'Draft not found or expired' });
        } else {
          res.json({ success: true, draft: draftData });
        }
      } else {
        res.status(404).json({ error: 'Draft not found' });
      }
    } else if (req.method === 'DELETE') {
      // Delete campaign draft
      const { campaignId } = req.body;
      
      console.log('📄 Deleting campaign draft:', campaignId);
      
      const fs = require('fs');
      const path = require('path');
      
      const draftFile = path.join(process.cwd(), 'tmp', 'drafts', `${campaignId}.json`);
      
      if (fs.existsSync(draftFile)) {
        fs.unlinkSync(draftFile);
      }
      
      res.json({ success: true });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ Campaign draft API error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        server: {
          status: 'healthy',
          message: 'Express server running',
          uptime: Math.round(process.uptime()) + ' seconds'
        },
        memory: {
          status: 'healthy',
          usage: {
            rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + 'MB',
            heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
            heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB'
          }
        },
        cache: {
          status: 'healthy',
          message: `${productCache.size} items cached`
        }
      }
    };

    res.setHeader('Content-Type', 'application/json');
    res.json(healthStatus);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Serve static files for production
app.use(express.static('dist'));

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 