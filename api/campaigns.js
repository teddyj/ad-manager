import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL
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
        // Fallback to file system for development
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
        // Fallback to file system for development
        saveCampaignToFiles(campaignData, req, res)
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
        // Fallback to file system for development
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
    // Map campaign data to database schema
    const campaignRecord = {
      id: campaignData.id,
      user_id: 'default-user', // TODO: Replace with actual user ID from auth
      name: campaignData.name || 'Untitled Campaign',
      type: campaignData.type || 'Display Campaign',
      status: campaignData.status || 'draft',
      source: campaignData.source || 'v2',
      legacy_data: campaignData.adData || campaignData,
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

    // Transform database records back to expected format
    const campaigns = data.map(record => ({
      id: record.id,
      name: record.name,
      status: record.status,
      type: record.type,
      source: record.source,
      created: new Date(record.created_at).toLocaleDateString(),
      adData: record.legacy_data,
      savedAt: record.updated_at
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
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id)

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