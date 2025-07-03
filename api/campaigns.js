import fs from 'fs'
import path from 'path'

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
      // Load all campaigns
      console.log('📋 Loading all campaigns')
      
      if (!fs.existsSync(tmpDir)) {
        return res.json({ success: true, campaigns: [] })
      }

      const campaignFiles = fs.readdirSync(tmpDir).filter(file => file.endsWith('.json'))
      const campaigns = campaignFiles.map(file => {
        try {
          const campaignData = JSON.parse(fs.readFileSync(path.join(tmpDir, file), 'utf8'))
          return campaignData
        } catch (error) {
          console.warn('⚠️ Failed to read campaign file:', file, error.message)
          return null
        }
      }).filter(Boolean)

      res.json({ success: true, campaigns })

    } else if (req.method === 'POST') {
      // Save complete campaign
      const campaignData = req.body
      
      if (!campaignData.id) {
        return res.status(400).json({ error: 'Campaign ID required' })
      }

      console.log('📋 Saving complete campaign:', campaignData.id || campaignData.name)
      
      const campaignFile = path.join(tmpDir, `${campaignData.id}.json`)
      const savedCampaign = {
        ...campaignData,
        savedAt: new Date().toISOString()
      }

      fs.writeFileSync(campaignFile, JSON.stringify(savedCampaign, null, 2))
      res.json({ success: true, campaign: savedCampaign })

    } else if (req.method === 'DELETE') {
      // Delete campaign
      const { id } = req.query || req.body
      
      if (!id) {
        return res.status(400).json({ error: 'Campaign ID required' })
      }

      console.log('📋 Deleting campaign:', id)
      
      const campaignFile = path.join(tmpDir, `${id}.json`)
      
      if (fs.existsSync(campaignFile)) {
        fs.unlinkSync(campaignFile)
      }

      res.json({ success: true })

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