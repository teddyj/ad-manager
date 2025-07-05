import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabase = null
if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey)
  console.log('✅ Supabase client initialized for campaigns API')
} else {
  console.warn('⚠️ Supabase credentials not found, falling back to file system')
}

// Create tmp directory in serverless environment
const ensureTmpDir = () => {
  const tmpDir = '/tmp/campaigns'
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true })
  }
  return tmpDir
}

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  const tmpDir = ensureTmpDir()

  try {
    if (req.method === 'GET') {
      // Get all campaigns
      if (supabase) {
        // Use Supabase for production
        getCampaignsFromSupabase(req, res)
      } else {
        // No Supabase credentials available
        if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
          return res.status(500).json({ 
            success: false, 
            error: 'Database connection not available. Please configure Supabase credentials.' 
          });
        }
        
        // Only use file system in local development
        getCampaignsFromFiles(req, res)
      }
    } else if (req.method === 'POST') {
      // Save complete campaign
      const campaignData = req.body
      
      if (!campaignData.id) {
        return res.status(400).json({ error: 'Campaign ID required' })
      }

      console.log('📋 Saving complete campaign:', campaignData.id || campaignData.name)
      
      if (supabase) {
        // Use Supabase for production
        saveCampaignToSupabase(campaignData, req, res)
      } else {
        // No Supabase credentials available
        console.error('❌ Supabase credentials not found in environment');
        console.log('Environment check:', {
          hasSupabaseUrl: !!supabaseUrl,
          hasServiceKey: !!supabaseServiceKey,
          nodeEnv: process.env.NODE_ENV
        });
        
        // In serverless environments like Vercel, we can't write to filesystem
        if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
          return res.status(500).json({ 
            success: false, 
            error: 'Database connection not available. Please configure Supabase credentials.' 
          });
        }
        
        // Only use file system in local development
        saveCampaignToFiles(campaignData, req, res)
      }
    } else if (req.method === 'PUT') {
      // Update existing campaign
      const campaignData = req.body
      
      if (!campaignData.id) {
        return res.status(400).json({ error: 'Campaign ID required' })
      }

      console.log('📋 Updating campaign:', campaignData.id || campaignData.name)
      
      if (supabase) {
        // Use Supabase for production
        updateCampaignInSupabase(campaignData, req, res)
      } else {
        // No Supabase credentials available
        if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
          return res.status(500).json({ 
            success: false, 
            error: 'Database connection not available. Please configure Supabase credentials.' 
          });
        }
        
        // Only use file system in local development
        updateCampaignInFiles(campaignData, req, res)
      }
    } else if (req.method === 'DELETE') {
      // Delete campaign
      const { id } = req.query || req.body
      
      if (!id) {
        return res.status(400).json({ error: 'Campaign ID required' })
      }

      console.log('📋 Deleting campaign:', id)
      
      if (supabase) {
        // Use Supabase for production
        deleteCampaignFromSupabase(id, req, res)
      } else {
        // No Supabase credentials available
        if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
          return res.status(500).json({ 
            success: false, 
            error: 'Database connection not available. Please configure Supabase credentials.' 
          });
        }
        
        // Only use file system in local development
        deleteCampaignFromFiles(id, req, res)
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('❌ Campaigns API error:', error)
    res.status(500).json({ 
      success: false, 
      error: error.message 
    })
  }
}

// Supabase Operations
async function saveCampaignToSupabase(campaignData, req, res) {
  try {
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

    // Map campaign data to database schema (using snake_case column names)
    // Note: Let database generate UUID for id, store original ID in legacy_id
    const campaignRecord = {
      user_id: defaultUserId,
      name: campaignData.name || 'Untitled Campaign',
      type: campaignData.type || 'Display Campaign',
      status: campaignData.status || 'draft',
      source: campaignData.source || 'v2',
      legacy_data: campaignData.adData || campaignData,
      legacy_id: campaignData.id, // Store original campaign ID here
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Insert campaign into Supabase
    const { data, error } = await supabase
      .from('campaigns')
      .insert([campaignRecord])
      .select()

    if (error) {
      console.error('❌ Supabase insert error:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    console.log('✅ Campaign saved to Supabase:', data[0]?.id)
    
    const savedCampaign = {
      ...campaignData,
      savedAt: new Date().toISOString(),
      databaseId: data[0]?.id
    }

    res.json({ success: true, campaign: savedCampaign })
  } catch (error) {
    console.error('❌ Failed to save campaign to Supabase:', error)
    res.status(500).json({ 
      success: false, 
      error: error.message 
    })
  }
}

async function updateCampaignInSupabase(campaignData, req, res) {
  try {
    console.log('📝 Updating campaign in Supabase:', campaignData.id);

    // Map campaign data to database schema (using snake_case column names)
    const campaignRecord = {
      name: campaignData.name || 'Untitled Campaign',
      type: campaignData.type || 'Display Campaign',
      status: campaignData.status || 'draft',
      source: campaignData.source || 'v2',
      legacy_data: campaignData.adData || campaignData,
      updated_at: new Date().toISOString()
    }

    // Update campaign in Supabase using legacy_id (original campaign ID)
    const { data, error } = await supabase
      .from('campaigns')
      .update(campaignRecord)
      .eq('legacy_id', campaignData.id)
      .select()

    if (error) {
      console.error('❌ Supabase update error:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    if (!data || data.length === 0) {
      console.warn('⚠️ No campaign found with ID:', campaignData.id);
      return res.status(404).json({ 
        success: false, 
        error: 'Campaign not found' 
      });
    }

    console.log('✅ Campaign updated in Supabase:', data[0]?.id)
    
    const updatedCampaign = {
      ...campaignData,
      updatedAt: new Date().toISOString(),
      databaseId: data[0]?.id
    }

    res.json({ success: true, campaign: updatedCampaign })
  } catch (error) {
    console.error('❌ Failed to update campaign in Supabase:', error)
    res.status(500).json({ 
      success: false, 
      error: error.message 
    })
  }
}

async function getCampaignsFromSupabase(req, res) {
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Supabase select error:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    // Transform database records back to expected format (snake_case to camelCase)
    const campaigns = data.map(record => ({
      id: record.legacy_id || record.id, // Use original campaign ID from legacy_id
      name: record.name,
      status: record.status,
      type: record.type,
      source: record.source,
      created: new Date(record.created_at).toLocaleDateString(),
      adData: record.legacy_data,
      savedAt: record.updated_at,
      databaseId: record.id // Keep database UUID for reference
    }))

    console.log('✅ Loaded campaigns from Supabase:', campaigns.length)
    res.json({ success: true, campaigns })
  } catch (error) {
    console.error('❌ Failed to get campaigns from Supabase:', error)
    res.status(500).json({ 
      success: false, 
      error: error.message 
    })
  }
}

async function deleteCampaignFromSupabase(id, req, res) {
  try {
    // Delete by legacy_id (original campaign ID) since that's what the frontend uses
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('legacy_id', id)

    if (error) {
      console.error('❌ Supabase delete error:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    console.log('✅ Campaign deleted from Supabase:', id)
    res.json({ success: true })
  } catch (error) {
    console.error('❌ Failed to delete campaign from Supabase:', error)
    res.status(500).json({ 
      success: false, 
      error: error.message 
    })
  }
}

// File System Operations (Fallback for development)
function saveCampaignToFiles(campaignData, req, res) {
  const tmpDir = path.join(process.cwd(), 'tmp')
  
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true })
  }

  const campaignFile = path.join(tmpDir, `${campaignData.id}.json`)
  const savedCampaign = {
    ...campaignData,
    savedAt: new Date().toISOString()
  }

  fs.writeFileSync(campaignFile, JSON.stringify(savedCampaign, null, 2))
  console.log('✅ Campaign saved to file:', campaignFile)
  res.json({ success: true, campaign: savedCampaign })
}

function getCampaignsFromFiles(req, res) {
  const tmpDir = path.join(process.cwd(), 'tmp')
  
  if (!fs.existsSync(tmpDir)) {
    res.json({ success: true, campaigns: [] })
    return
  }
  
  const campaignFiles = fs.readdirSync(tmpDir).filter(f => f.endsWith('.json'))
  const campaigns = campaignFiles.map(file => {
    try {
      const filePath = path.join(tmpDir, file)
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
      return data
    } catch (error) {
      console.warn('Failed to read campaign file:', file, error)
      return null
    }
  }).filter(Boolean)
  
  res.json({ success: true, campaigns })
}

function deleteCampaignFromFiles(id, req, res) {
  const tmpDir = path.join(process.cwd(), 'tmp')
  const campaignFile = path.join(tmpDir, `${id}.json`)
  
  if (fs.existsSync(campaignFile)) {
    fs.unlinkSync(campaignFile)
  }

  res.json({ success: true })
} 