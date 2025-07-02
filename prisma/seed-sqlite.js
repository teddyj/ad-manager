import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * SQLite Database Seed Script
 * Populates the SQLite database with initial data for development
 * All JSON fields are converted to strings for SQLite compatibility
 */

// Helper function to convert objects to JSON strings for SQLite
const toJson = (obj) => JSON.stringify(obj)

// Sample user data
const userData = {
  email: 'demo@campaignbuilder.com',
  name: 'Demo User',
  avatarUrl: null,
  settings: toJson({
    theme: 'light',
    notifications: true,
    autoSave: true
  })
}

// Sample product data with JSON fields as strings
const productData = [
  {
    name: 'Organic Protein Powder',
    description: 'Premium organic protein powder made from grass-fed whey. Perfect for post-workout recovery and muscle building.',
    brand: 'FitNutrition',
    category: 'health_wellness',
    price: 49.99,
    sku: 'FN-PROTEIN-001',
    url: 'https://example.com/organic-protein-powder',
    utmCodes: toJson({
      utm_source: 'campaign_builder',
      utm_medium: 'display_ad',
      utm_campaign: 'protein_launch'
    }),
    metadata: toJson({
      targetAge: [25, 45],
      interests: ['fitness', 'health', 'organic', 'nutrition'],
      benefits: ['muscle building', 'post-workout recovery', 'organic ingredients'],
      servingsPerContainer: 30,
      flavors: ['vanilla', 'chocolate', 'strawberry']
    }),
    settings: toJson({
      autoGenerateAds: true,
      preferredFormats: ['1080x1080', '1200x628'],
      brandColors: ['#4CAF50', '#2196F3', '#FFFFFF']
    })
  },
  {
    name: 'Wireless Bluetooth Headphones',
    description: 'Premium wireless headphones with active noise cancellation and 30-hour battery life.',
    brand: 'AudioPro',
    category: 'electronics',
    price: 199.99,
    sku: 'AP-HEADPHONES-002',
    url: 'https://example.com/wireless-headphones',
    utmCodes: toJson({
      utm_source: 'campaign_builder',
      utm_medium: 'social_ad',
      utm_campaign: 'headphones_holiday'
    }),
    metadata: toJson({
      targetAge: [18, 35],
      interests: ['music', 'technology', 'wireless', 'audio'],
      features: ['noise cancellation', '30h battery', 'bluetooth 5.0', 'premium design'],
      colors: ['black', 'white', 'blue']
    }),
    settings: toJson({
      autoGenerateAds: true,
      preferredFormats: ['1080x1920', '1200x628', '300x250'],
      brandColors: ['#000000', '#FF5722', '#FFFFFF']
    })
  },
  {
    name: 'Smart Fitness Watch',
    description: 'Track your fitness goals with GPS, heart rate monitoring, and 7-day battery life.',
    brand: 'TechFit',
    category: 'wearables',
    price: 299.99,
    sku: 'TF-WATCH-003',
    url: 'https://example.com/smart-fitness-watch',
    utmCodes: toJson({
      utm_source: 'campaign_builder',
      utm_medium: 'video_ad',
      utm_campaign: 'fitness_tech'
    }),
    metadata: toJson({
      targetAge: [20, 50],
      interests: ['fitness', 'technology', 'health tracking', 'sports'],
      features: ['GPS tracking', 'heart rate monitor', '7-day battery', 'waterproof'],
      compatibility: ['iOS', 'Android']
    }),
    settings: toJson({
      autoGenerateAds: true,
      preferredFormats: ['1080x1920', '1920x1080', '1080x1080'],
      brandColors: ['#E91E63', '#9C27B0', '#FFFFFF']
    })
  }
]

// Sample campaign data with JSON fields as strings
const campaignData = [
  {
    name: 'Protein Powder Launch Campaign',
    type: 'Product Launch',
    status: 'draft',
    budget: 1500.00,
    currency: 'USD',
    audienceConfig: toJson({
      demographics: {
        age: [25, 45],
        gender: 'all',
        income: 'middle_upper',
        education: 'any'
      },
      interests: ['fitness', 'health', 'organic', 'nutrition', 'gym', 'workout'],
      behaviors: ['online shoppers', 'health conscious', 'fitness enthusiasts'],
      locations: {
        countries: ['US', 'CA'],
        excludeLocations: []
      }
    }),
    platformConfig: toJson({
      selectedPlatforms: ['meta', 'display'],
      meta: {
        objective: 'conversions',
        optimization: 'purchase',
        bidStrategy: 'lowest_cost',
        placements: ['facebook_feed', 'instagram_feed', 'instagram_stories']
      },
      display: {
        networks: ['google_display'],
        bidStrategy: 'target_cpa',
        keywords: ['protein powder', 'organic supplements', 'fitness nutrition']
      }
    }),
    creativeConfig: toJson({
      formats: ['1080x1080', '1200x628', '300x250'],
      messaging: {
        headline: 'Fuel Your Fitness Journey',
        description: 'Premium organic protein powder for serious athletes',
        cta: 'Shop Now'
      },
      design: {
        style: 'modern_clean',
        colorScheme: 'brand_colors',
        includeProduct: true,
        includeLifestyle: true
      }
    }),
    publishConfig: toJson({
      schedule: 'immediate',
      budget_distribution: {
        meta: 0.7,
        display: 0.3
      }
    })
  },
  {
    name: 'Headphones Holiday Campaign',
    type: 'Seasonal Promotion',
    status: 'published',
    budget: 2000.00,
    currency: 'USD',
    startsAt: new Date('2024-11-15'),
    endsAt: new Date('2024-12-31'),
    audienceConfig: toJson({
      demographics: {
        age: [18, 35],
        gender: 'all',
        income: 'middle_upper'
      },
      interests: ['music', 'technology', 'wireless audio', 'podcasts'],
      behaviors: ['tech early adopters', 'music streaming users'],
      locations: {
        countries: ['US', 'CA', 'UK']
      }
    }),
    platformConfig: toJson({
      selectedPlatforms: ['meta', 'tiktok'],
      meta: {
        objective: 'conversions',
        optimization: 'purchase',
        bidStrategy: 'cost_cap'
      },
      tiktok: {
        objective: 'conversions',
        ageRange: [18, 35],
        interests: ['music', 'technology']
      }
    }),
    creativeConfig: toJson({
      formats: ['1080x1920', '1080x1080', '1200x628'],
      messaging: {
        headline: 'Premium Sound, Holiday Price',
        description: 'Limited time offer on wireless headphones',
        cta: 'Get Yours Now'
      }
    }),
    publishConfig: toJson({
      schedule: 'immediate'
    })
  },
  {
    name: 'Fitness Watch Retargeting',
    type: 'Retargeting',
    status: 'active',
    budget: 800.00,
    currency: 'USD',
    audienceConfig: toJson({
      demographics: {
        age: [20, 50],
        gender: 'all'
      },
      interests: ['fitness', 'technology', 'health tracking'],
      retargeting: {
        websiteVisitors: true,
        lookalikeAudience: true
      }
    }),
    platformConfig: toJson({
      selectedPlatforms: ['meta'],
      meta: {
        objective: 'conversions',
        optimization: 'purchase'
      }
    }),
    creativeConfig: toJson({
      formats: ['1080x1080', '1080x1920'],
      messaging: {
        headline: 'Complete Your Fitness Journey',
        description: 'The smartwatch you were looking at is waiting',
        cta: 'Buy Now'
      }
    }),
    publishConfig: toJson({
      schedule: 'immediate'
    })
  }
]

// Sample product image data
const productImageData = [
  {
    url: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800',
    fileName: 'protein-powder-main.jpg',
    altText: 'Organic protein powder container with scoop',
    isPrimary: true,
    metadata: toJson({
      source: 'unsplash',
      photographer: 'Unsplash',
      tags: ['protein', 'supplement', 'fitness']
    })
  },
  {
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
    fileName: 'headphones-main.jpg',
    altText: 'Premium wireless headphones on white background',
    isPrimary: true,
    metadata: toJson({
      source: 'unsplash',
      photographer: 'Unsplash',
      tags: ['headphones', 'audio', 'technology']
    })
  },
  {
    url: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800',
    fileName: 'smartwatch-main.jpg',
    altText: 'Smart fitness watch showing health metrics',
    isPrimary: true,
    metadata: toJson({
      source: 'unsplash',
      photographer: 'Unsplash',
      tags: ['smartwatch', 'fitness', 'technology']
    })
  }
]

async function createUser() {
  console.log('👤 Creating demo user...')
  
  const user = await prisma.user.upsert({
    where: { email: userData.email },
    update: userData,
    create: userData
  })
  
  console.log(`✅ User created: ${user.name} (${user.id})`)
  return user
}

async function createProducts(userId) {
  console.log('📦 Creating sample products...')
  
  const products = []
  
  for (let i = 0; i < productData.length; i++) {
    const productInfo = productData[i]
    const imageInfo = productImageData[i]
    
    const product = await prisma.product.create({
      data: {
        ...productInfo,
        userId,
        images: {
          create: [imageInfo]
        }
      },
      include: {
        images: true
      }
    })
    
    products.push(product)
    console.log(`✅ Product created: ${product.name}`)
  }
  
  return products
}

async function createCampaigns(userId, products) {
  console.log('🎯 Creating sample campaigns...')
  
  const campaigns = []
  
  for (let i = 0; i < campaignData.length; i++) {
    const campaignInfo = campaignData[i]
    const product = products[i] // Associate first campaign with first product, etc.
    
    const campaign = await prisma.campaign.create({
      data: {
        ...campaignInfo,
        userId,
        productId: product.id
      },
      include: {
        product: {
          select: { name: true, brand: true }
        }
      }
    })
    
    campaigns.push(campaign)
    console.log(`✅ Campaign created: ${campaign.name}`)
  }
  
  return campaigns
}

async function createSampleCreatives(campaigns) {
  console.log('🎨 Creating sample creatives...')
  
  for (const campaign of campaigns) {
    const creativeConfig = JSON.parse(campaign.creativeConfig)
    const formats = creativeConfig.formats || ['1080x1080']
    
    for (const format of formats) {
      const [width, height] = format.split('x').map(Number)
      
      await prisma.creative.create({
        data: {
          campaignId: campaign.id,
          name: `${campaign.name} - ${format}`,
          formatId: format,
          formatName: `${width}x${height}`,
          width,
          height,
          elements: toJson([
            {
              id: 'headline',
              type: 'text',
              content: creativeConfig.messaging?.headline || 'Your Headline Here',
              position: { x: 50, y: 100 },
              styles: {
                fontSize: width > 800 ? 32 : 24,
                fontWeight: 'bold',
                color: '#333333',
                textAlign: 'center'
              }
            },
            {
              id: 'description',
              type: 'text',
              content: creativeConfig.messaging?.description || 'Your description here',
              position: { x: 50, y: height - 200 },
              styles: {
                fontSize: width > 800 ? 18 : 16,
                color: '#666666',
                textAlign: 'center'
              }
            },
            {
              id: 'cta',
              type: 'button',
              content: creativeConfig.messaging?.cta || 'Learn More',
              position: { x: 50, y: height - 100 },
              styles: {
                backgroundColor: '#007bff',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '6px',
                fontSize: 16,
                fontWeight: 'bold'
              }
            }
          ]),
          metadata: toJson({
            generatedAt: new Date().toISOString(),
            platform: 'multi',
            version: '1.0'
          })
        }
      })
    }
  }
  
  console.log('✅ Sample creatives created')
}

async function createAIGenerationHistory(userId) {
  console.log('🤖 Creating AI generation history...')
  
  const aiGenerations = [
    {
      userId,
      type: 'background',
      prompt: 'Modern gym environment with natural lighting',
      provider: 'fal-ai',
      requestId: 'fal_req_001',
      result: 'https://example.com/generated-bg-1.jpg',
      status: 'completed',
      parameters: toJson({
        model: 'flux-realism',
        image_size: '1024x1024',
        guidance_scale: 7.5
      }),
      processingTime: 15500,
      cost: 0.25
    },
    {
      userId,
      type: 'copy',
      prompt: 'Write compelling ad copy for organic protein powder',
      provider: 'openai',
      requestId: 'openai_req_001',
      result: toJson({
        headline: 'Fuel Your Fitness Journey',
        description: 'Premium organic protein powder for serious athletes',
        variations: ['Power Up Naturally', 'Organic Excellence']
      }),
      status: 'completed',
      parameters: toJson({
        model: 'gpt-4',
        max_tokens: 150,
        temperature: 0.7
      }),
      processingTime: 3200,
      cost: 0.10
    }
  ]
  
  for (const generation of aiGenerations) {
    await prisma.aiGeneration.create({
      data: generation
    })
  }
  
  console.log('✅ AI generation history created')
}

async function main() {
  console.log('🌱 Starting SQLite database seeding...')
  console.log('=========================================')
  
  try {
    // Create user
    const user = await createUser()
    
    // Create products with images
    const products = await createProducts(user.id)
    
    // Create campaigns
    const campaigns = await createCampaigns(user.id, products)
    
    // Create sample creatives
    await createSampleCreatives(campaigns)
    
    // Create AI generation history
    await createAIGenerationHistory(user.id)
    
    console.log('\n🎉 Database seeding completed successfully!')
    console.log('==========================================')
    console.log('📊 Summary:')
    console.log(`   👤 Users: 1`)
    console.log(`   📦 Products: ${products.length}`)
    console.log(`   🎯 Campaigns: ${campaigns.length}`)
    console.log(`   🎨 Creatives: ${campaigns.reduce((acc, c) => acc + JSON.parse(c.creativeConfig).formats.length, 0)}`)
    console.log(`   🤖 AI Generations: 2`)
    console.log('\n💡 Next steps:')
    console.log('   npm run db:dev:studio  # Browse your data')
    console.log('   npm run dev:full       # Start the application')
    
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  }) 