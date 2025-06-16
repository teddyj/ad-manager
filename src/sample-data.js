// Sample data for testing product management functionality

export const sampleProducts = [
    {
        id: 'sample-1',
        name: 'Mountain Huckleberry Yogurt',
        description: 'Delicious organic yogurt made with wild mountain huckleberries. Creamy texture with a perfect balance of tart and sweet flavors.',
        brand: 'SPINS Organic',
        category: 'dairy_alternatives',
        productUrl: 'https://www.tillamook.com/products/yogurt/mountain-huckleberry-yogurt',
        status: 'Active',
        images: [
            {
                id: 'img-1',
                url: 'https://placehold.co/400x400/e0f2fe/1e40af?text=Mountain+Huckleberry+Yogurt',
                fileName: 'huckleberry-yogurt.jpg',
                altText: 'Mountain Huckleberry Yogurt container',
                isPrimary: true,
                size: '400x400',
                uploadDate: new Date().toISOString()
            }
        ],
        utmCodes: {
            source: 'newsletter',
            medium: 'email',
            campaign: 'spring_launch',
            term: 'huckleberry',
            content: 'yogurt_promo'
        },
        metadata: {
            sku: 'SPO-YOG-HUCK-001',
            tags: ['organic', 'yogurt', 'huckleberry', 'dairy-free'],
            retailerUrls: [
                { retailer: 'walmart', url: 'https://www.walmart.com/sample-product' },
                { retailer: 'target', url: 'https://www.target.com/sample-product' }
            ]
        },
        settings: {
            defaultAudience: 'working_parent',
            defaultRetailers: ['walmart', 'target'],
            defaultRegions: ['new_york', 'los_angeles']
        },
        created: new Date().toISOString(),
        updated: new Date().toISOString()
    },
    {
        id: 'sample-2',
        name: 'Quinoa Power Bowl Mix',
        description: 'Complete protein-packed quinoa mix with superfood ingredients. Perfect for quick, nutritious meals.',
        brand: 'SPINS Organic',
        category: 'pantry_staples',
        productUrl: 'https://www.example-store.com/products/quinoa-power-bowl-mix',
        status: 'Draft',
        images: [],
        utmCodes: {
            source: 'social',
            medium: 'facebook',
            campaign: 'summer_health',
            term: 'quinoa',
            content: 'power_bowl'
        },
        metadata: {
            sku: 'SPO-QUI-PWR-002',
            tags: ['quinoa', 'protein', 'gluten-free', 'superfood'],
            retailerUrls: []
        },
        settings: {
            defaultAudience: 'at_home_chef',
            defaultRetailers: ['sprouts', 'kroger'],
            defaultRegions: ['chicago', 'san_francisco']
        },
        created: new Date().toISOString(),
        updated: new Date().toISOString()
    }
];

// Function to load sample data into localStorage
export const loadSampleData = () => {
    try {
        // Only load if no products exist
        const existingProducts = JSON.parse(localStorage.getItem('products') || '[]');
        if (existingProducts.length === 0) {
            localStorage.setItem('products', JSON.stringify(sampleProducts));
            console.log('Sample products loaded successfully');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error loading sample data:', error);
        return false;
    }
}; 