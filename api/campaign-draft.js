import fs from 'fs'
import path from 'path'

// Create tmp directory in serverless environment
const ensureTmpDir = () => {
  const tmpDir = '/tmp/campaign-drafts'
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
      // Load campaign draft
      const { campaignId } = req.query
      
      if (!campaignId) {
        return res.status(400).json({ error: 'Campaign ID required' })
      }

      console.log('📄 Loading campaign draft:', campaignId)
      
      const draftFile = path.join(tmpDir, `${campaignId}.json`)
      
      if (!fs.existsSync(draftFile)) {
        return res.status(404).json({ error: 'Draft not found' })
      }

      const draftData = JSON.parse(fs.readFileSync(draftFile, 'utf8'))
      res.json({ success: true, draft: draftData })

    } else if (req.method === 'POST') {
      // Save campaign draft
      const { action, campaignId, stepData } = req.body
      
      if (!campaignId) {
        return res.status(400).json({ error: 'Campaign ID required' })
      }

      console.log('📄 Saving campaign draft:', campaignId)
      
      const draftFile = path.join(tmpDir, `${campaignId}.json`)
      const draftData = {
        campaignId,
        stepData,
        savedAt: new Date().toISOString(),
        action
      }

      fs.writeFileSync(draftFile, JSON.stringify(draftData, null, 2))
      res.json({ success: true, draft: draftData })

    } else if (req.method === 'DELETE') {
      // Delete campaign draft
      const { campaignId } = req.query || req.body
      
      if (!campaignId) {
        return res.status(400).json({ error: 'Campaign ID required' })
      }

      console.log('📄 Deleting campaign draft:', campaignId)
      
      const draftFile = path.join(tmpDir, `${campaignId}.json`)
      
      if (fs.existsSync(draftFile)) {
        fs.unlinkSync(draftFile)
      }

      res.json({ success: true })

    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }

  } catch (error) {
    console.error('❌ Campaign draft API error:', error)
    res.status(500).json({ 
      success: false, 
      error: error.message 
    })
  }
} 