import React, { useState, useEffect, useContext, createContext } from 'react';
import spinsLogo from './assets/spins-logo.jpg';

// Create AppContext for sharing app state
const AppContext = createContext({
    appView: null,
    setAppView: () => {},
});

// --- Constants ---
// Renamed first view constant
const VIEW_CREATE_CAMPAIGN = 'create_campaign';
const VIEW_START = 'start'; // Now the step after campaign creation
const VIEW_UPLOAD = 'upload';
const VIEW_URL = 'url';
const VIEW_CUSTOMIZE = 'customize';
const VIEW_PUBLISH = 'publish';

// Define CTA types
const CTA_TYPE_TEXT = 'text';
const CTA_TYPE_WHERE_TO_BUY = 'whereToBuy';

// Define Ad Sizes
const AD_SIZES = [
    { label: 'Medium Rectangle (300x250)', value: '300x250' },
    { label: 'Mobile Leaderboard (320x50)', value: '320x50' },
    { label: 'Mobile Rectangle (320x400)', value: '320x400' },
];
const DEFAULT_AD_SIZE = '300x250'; // Default size

// Define Audience Options (Example) - Updated for Dropdown
const AUDIENCE_OPTIONS = [
    { label: 'Working Parent', value: 'working_parent' },
    { label: 'DINK', value: 'dink' },
    { label: 'At Home Chef', value: 'at_home_chef' }
];
const DEFAULT_AUDIENCE_TYPE = 'working_parent'; // Default audience type

// Define Diet Type Options
const DIET_TYPE_OPTIONS = [
    { label: 'Plant-based', value: 'plant_based' },
    { label: 'Gluten Free', value: 'gluten_free' },
    { label: 'Lactose-Free', value: 'lactose_free' },
    { label: 'Keto', value: 'keto' },
    { label: 'Kosher', value: 'kosher' }
];

// Define Specific Region Options
const SPECIFIC_REGION_OPTIONS = [
    { label: 'New York', value: 'new_york' },
    { label: 'Los Angeles', value: 'los_angeles' },
    { label: 'Chicago', value: 'chicago' },
    { label: 'Dallas-Fort Worth', value: 'dallas' },
    { label: 'Philadelphia', value: 'philadelphia' },
    { label: 'Houston', value: 'houston' },
    { label: 'Atlanta', value: 'atlanta' },
    { label: 'Washington, D.C. (Hagerstown)', value: 'washington_dc' },
    { label: 'Boston (Manchester)', value: 'boston' },
    { label: 'San Francisco-Oakland-San Jose', value: 'san_francisco' }
];

// Define Specific Retailer Options
const SPECIFIC_RETAILER_OPTIONS = [
    { label: 'Walmart', value: 'walmart' },
    { label: 'Publix', value: 'publix' },
    { label: 'Target', value: 'target' },
    { label: 'Sprouts', value: 'sprouts' },
    { label: 'Kroger', value: 'kroger' }
];

// Define Retailer Options (Example)
const RETAILER_OPTIONS = [
    { label: 'All Retailers', value: 'all' },
    { label: 'Retailer A (Online)', value: 'retailer_a' },
    { label: 'Retailer B (Local)', value: 'retailer_b' },
    { label: 'Retailer C (National)', value: 'retailer_c' },
];
const DEFAULT_RETAILER = 'all'; // Default retailer value

// --- Steps Definition for Navigation (Updated to 3 Steps) ---
const STEPS = [
  { name: 'Audiences', views: [VIEW_CREATE_CAMPAIGN], id: 1 },
  { name: 'Assets', views: [VIEW_START, VIEW_UPLOAD, VIEW_URL], id: 2 }, // Group source choice and content provision
  { name: 'Creative Review', views: [VIEW_CUSTOMIZE, VIEW_PUBLISH], id: 3 }, // Group customization and final review
];

// Placeholder Online Retailer Data - Kept for potential future use
const ONLINE_RETAILERS = [
    { name: 'Walmart', logo: 'https://placehold.co/60x30/0071ce/ffffff?text=WMT', url: '#' },
    { name: 'Target', logo: 'https://placehold.co/60x30/cc0000/ffffff?text=TGT', url: '#' },
    { name: 'Amazon', logo: 'https://placehold.co/60x30/ff9900/000000?text=AMZ', url: '#' },
];

// Placeholder Nearby Store Data - Kept for potential future use
const NEARBY_STORES = [
    { name: 'CVS', address: '859 Manhattan Ave., Brooklyn, NY 11222', distance: '0.2mi', productCount: 2, logo: 'https://placehold.co/40x20/d91f2c/ffffff?text=CVS' },
    { name: 'Key Food', address: '224 Mcguinness Boulevard, Brooklyn, NY 11222', distance: '0.2mi', productCount: 10, logo: 'https://placehold.co/40x20/e30613/ffffff?text=KeyFood' },
    { name: 'Walgreens', address: '123 Main St, Brooklyn, NY 11222', distance: '0.5mi', productCount: 5, logo: 'https://placehold.co/40x20/d91f2c/ffffff?text=Walgreens' },
];

// Add new constants for view switching
const APP_VIEW_CAMPAIGN_MANAGER = 'campaign_manager';
const APP_VIEW_CAMPAIGN_BUILDER = 'campaign_builder';
const APP_VIEW_CAMPAIGN_DETAILS = 'campaign_details';
const APP_VIEW_AD_PLATFORMS = 'ad_platforms';

// Database Operations (using localStorage as temporary storage)
const dbOperations = {
    saveAd: (adData) => {
        try {
            // Get existing campaigns
            const existingCampaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
            
            // Create a new campaign entry
            const newCampaign = {
                id: String(Date.now()), // Generate a unique ID
                name: adData.campaignName,
                status: 'Draft',
                info: true,
                created: new Date().toLocaleDateString(),
                type: adData.ctaType === CTA_TYPE_WHERE_TO_BUY ? 'Where to Buy' : 'Add to Cart',
                budget: '$0.00', // Default budget
                starts: 'Not Set',
                ends: 'Not Set',
                adData: adData // Store the complete ad data
            };

            // Add to campaigns list
            existingCampaigns.push(newCampaign);
            
            // Save back to storage
            localStorage.setItem('campaigns', JSON.stringify(existingCampaigns));
            
            return { success: true, campaign: newCampaign };
        } catch (error) {
            console.error('Error saving campaign:', error);
            return { success: false, error: error.message };
        }
    },

    getCampaigns: () => {
        try {
            return JSON.parse(localStorage.getItem('campaigns') || '[]');
        } catch (error) {
            console.error('Error getting campaigns:', error);
            return [];
        }
    }
};

// --- Helper Components ---

/**
 * Header Component
 * Displays the application title and potentially navigation/user info.
 */
function Header() {
    return (
        <header className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <img
                                className="h-12 w-auto"
                                src={spinsLogo}
                                alt="SPINS"
                                onError={(e) => {
                                    console.error('Logo failed to load:', e);
                                    e.target.style.display = 'none';
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

/**
 * StepNavigation Component
 * Displays the progress steps with improved connecting lines.
 */
function StepNavigation({ currentView }) {
    // Find the index of the current step
    const currentStepIndex = STEPS.findIndex(step => step.views.includes(currentView));

    return (
        <nav aria-label="Progress" className="bg-white shadow-sm rounded-lg mb-6 lg:mb-8 p-4">
            {/* Increased spacing for clarity */}
            <ol role="list" className="flex items-start justify-between space-x-4 md:space-x-8">
                {STEPS.map((step, index) => {
                    const isCompleted = index < currentStepIndex;
                    const isCurrent = index === currentStepIndex;

                    return (
                        // Use flex-1 for equal spacing, relative for line positioning
                        <li key={step.name} className="relative flex-1">
                            {/* Connecting line: Positioned absolutely, starts after circle, ends before next circle */}
                            {index < STEPS.length - 1 && (
                                <div
                                    // Position line vertically centered with the circle (top-4 for h-8 circle)
                                    // Start after the circle (left-4 for half of w-8 circle)
                                    // End before the next circle (right-4 for half of w-8 circle)
                                    className={`absolute top-4 left-4 right-4 h-0.5 ${
                                        isCompleted || isCurrent ? 'bg-blue-600' : 'bg-gray-200'
                                    }`}
                                    aria-hidden="true"
                                />
                            )}
                            {/* Step Content: Circle + Text, relative to allow line underneath */}
                            <div className="relative flex flex-col items-center text-center group">
                                {/* Circle/Icon */}
                                <span
                                    className={`z-10 flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full ${ // z-10 to be above line
                                        isCompleted ? 'bg-blue-600 group-hover:bg-blue-800' :
                                        isCurrent ? 'border-2 border-blue-600 bg-white' :
                                        'border-2 border-gray-300 bg-white group-hover:border-gray-400'
                                    }`}
                                >
                                    {isCompleted ? (
                                        <svg className="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    ) : isCurrent ? (
                                        <span className="text-blue-600 font-semibold">{step.id}</span>
                                    ) : (
                                        <span className="text-gray-500 group-hover:text-gray-700">{step.id}</span>
                                    )}
                                </span>
                                {/* Step Name Text */}
                                <span className={`mt-1 text-xs md:text-sm font-medium ${ // Added margin-top
                                    isCompleted ? 'text-gray-900' :
                                    isCurrent ? 'text-blue-600' :
                                    'text-gray-500 group-hover:text-gray-900'
                                }`}>{step.name}</span>
                            </div>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

/**
 * Button Component
 * A reusable button component with consistent styling.
 */
function Button({ onClick, children, className = '', variant = 'primary', disabled = false, size = 'normal' }) {
    const baseStyle = "rounded-lg font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 transition duration-150 ease-in-out";
    const sizes = {
        normal: "px-4 py-2 text-sm",
        small: "px-2 py-1 text-xs"
    };
    const variants = {
        primary: "bg-[#F7941D] hover:bg-[#E68A1B] text-white focus:ring-orange-400",
        secondary: "bg-gray-100 hover:bg-gray-200 text-gray-800 focus:ring-gray-400",
        success: "bg-green-600 hover:bg-green-700 text-white focus:ring-green-400",
        danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-400",
        light: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 focus:ring-blue-400"
    };
    const disabledStyle = "disabled:opacity-50 disabled:cursor-not-allowed";
    return (
        <button
            onClick={onClick}
            className={`${baseStyle} ${sizes[size]} ${variants[variant]} ${disabledStyle} ${className}`}
            disabled={disabled}
        >
            {children}
        </button>
    );
}

/**
 * Card Component
 * A reusable card component for grouping content.
 */
function Card({ children, title, className = '' }) {
    return (
        <div className={`bg-white shadow-sm rounded-lg p-6 ${className}`}>
            {title && <h2 className="text-xl font-semibold mb-4 text-[#0B2265]">{title}</h2>}
            {children}
        </div>
    );
}

/**
 * Input Field Component
 * Reusable styled input field. Added onKeyDown prop.
 */
function InputField({ id, label, type = 'text', value, onChange, onKeyDown, placeholder, error, disabled = false, className = '' }) {
    // Basic support for textarea
    const InputElement = type === 'textarea' ? 'textarea' : 'input';
    const typeProp = type === 'textarea' ? {} : { type: type }; // Don't pass type="textarea" to input
    const disabledStyle = disabled ? "bg-gray-100 cursor-not-allowed" : "";

    return (
        <div className={`${disabled ? "opacity-50" : ""} ${className}`}> {/* Dim container when disabled */}
            {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
            <InputElement
                id={id}
                {...typeProp}
                value={value}
                onChange={onChange}
                onKeyDown={onKeyDown} // Added onKeyDown prop
                placeholder={placeholder}
                disabled={disabled}
                className={`w-full p-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-400' : 'focus:ring-blue-400'} ${type === 'textarea' ? 'min-h-[60px]' : ''} ${disabledStyle}`}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
}

/**
 * Radio Group Component - Kept for potential future use, but not used in Audience step anymore
 * Simple radio button group for selecting options.
 */
function RadioGroup({ label, name, options, selectedValue, onChange }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <div className="space-y-2">
                {options.map((option) => (
                    <div key={option.value} className="flex items-center">
                        <input
                            id={`${name}-${option.value}`}
                            name={name}
                            type="radio"
                            value={option.value}
                            checked={selectedValue === option.value}
                            onChange={onChange}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                        />
                        <label htmlFor={`${name}-${option.value}`} className="ml-3 block text-sm font-medium text-gray-700">
                            {option.label}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
}

/**
 * Select Dropdown Component
 * Simple select dropdown.
 */
function SelectDropdown({ id, label, value, onChange, options, disabled = false }) {
     const disabledStyle = disabled ? "bg-gray-100 cursor-not-allowed" : "";
     return (
        <div className={disabled ? "opacity-50" : ""}>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <select
                id={id}
                name={id}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={`w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${disabledStyle}`}
            >
                {options.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
     );
}


// --- Ad Preview Component ---

/**
 * AdPreviewContent Component
 * Renders the ad preview based on selected size and data.
 * Includes click-to-expand interaction for Where-to-Buy overlay.
 */
function AdPreviewContent({
    headline,
    description,
    imageSrc,
    ctaType,
    ctaText,
    clickUrl,
    adSize
}) {
    // State for click-to-expand effect on Where-to-Buy
    const [isWtbExpanded, setIsWtbExpanded] = useState(false);
    // State to track which tab is active in expanded view
    const [wtbTab, setWtbTab] = useState('online'); // 'online' or 'instore'
    // State for store search query - Initialize with default zip
    const [storeSearchQuery, setStoreSearchQuery] = useState('11222');

    // Placeholder handler for store search
    const handleStoreSearch = () => {
        alert(`Searching for stores near: ${storeSearchQuery} (placeholder)`);
        // In a real app, trigger API call here
    };

    // Handler to open the WTB overlay and optionally set the active tab
    const handleOpenWtb = (initialTab = 'online') => {
        setWtbTab(initialTab);
        setIsWtbExpanded(true);
    }

    // Default layout (vertical stack)
    let layout = (
        <>
            {/* 1. Headline */}
            <h3 className="text-lg font-bold mb-1 text-gray-800 text-center leading-tight">{headline || "Ad Headline"}</h3>
            {/* 2. Description */}
            <p className="text-xs text-gray-600 mb-2 text-center leading-snug">{description || "Description"}</p>
            {/* 3. Image */}
            <div className="flex-grow flex items-center justify-center w-full mb-2 overflow-hidden">
                {imageSrc ? (
                    <img
                        src={imageSrc}
                        alt="Ad Preview"
                        className="max-w-full max-h-full object-contain rounded"
                        onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/300x250/f87171/ffffff?text=Image+Load+Error'; }}
                    />
                ) : (
                    <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center text-gray-400 text-sm p-2">
                        Image Area
                    </div>
                )}
            </div>
            {/* 4. CTA Area */}
            <div className="w-full mt-auto pt-2"> {/* Removed relative */}
                {ctaType === CTA_TYPE_TEXT && (
                    <Button variant="primary" size="small" className="w-full truncate" onClick={() => clickUrl && window.open(clickUrl, '_blank')} title={`Clicks go to: ${clickUrl || 'Not set'}`}>
                        {ctaText || 'Call To Action'}
                    </Button>
                )}
                {/* Where to Buy Section - Click to Expand */}
                {ctaType === CTA_TYPE_WHERE_TO_BUY && (
                    <div> {/* Container for both states */}
                        {/* Initial Collapsed View - Clickable */}
                         {!isWtbExpanded && (
                            <div className="bg-black bg-opacity-70 p-2 flex justify-center items-center space-x-2 rounded-lg cursor-pointer">
                                <Button variant="light" size="small" onClick={() => handleOpenWtb('online')}>
                                    Buy Online
                                </Button>
                                <Button variant="light" size="small" onClick={() => handleOpenWtb('instore')}>
                                    Find in Store
                                </Button>
                            </div>
                         )}

                        {/* Expanded View - Conditionally Rendered */}
                        {isWtbExpanded && (
                            <div
                                className="absolute inset-0 flex items-center justify-center z-20"
                            >
                                <div
                                    className="border border-gray-300 bg-white shadow-md rounded-lg p-2 w-[280px]"
                                >
                                    {/* Close Button */}
                                    <button
                                        onClick={() => setIsWtbExpanded(false)}
                                        className="absolute top-1 right-1 text-gray-400 hover:text-gray-600 z-30 p-1 bg-white rounded-full hover:bg-gray-100"
                                        aria-label="Close where to buy"
                                    >
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                                    </button>

                                    {/* Tabs */}
                                    <div className="flex border-b mb-2 flex-shrink-0">
                                        <button
                                            className={`flex-1 py-1.5 text-xs font-medium ${wtbTab === 'online' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                            onClick={() => setWtbTab('online')}
                                        >
                                            Buy Online
                                        </button>
                                        <button
                                            className={`flex-1 py-1.5 text-xs font-medium ${wtbTab === 'instore' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                            onClick={() => setWtbTab('instore')}
                                        >
                                            Find a Store
                                        </button>
                                    </div>

                                    {/* Content Area */}
                                    <div className="max-h-[150px] overflow-y-auto pr-1">
                                        {wtbTab === 'online' && (
                                            <div className="space-y-2">
                                                {ONLINE_RETAILERS.map(retailer => (
                                                    <div key={retailer.name} className="flex items-center justify-between space-x-2 p-1.5 hover:bg-gray-50 rounded">
                                                        <img src={retailer.logo} alt={retailer.name} className="h-5 object-contain flex-shrink-0" />
                                                        <span className="text-xs text-gray-700 truncate flex-grow text-left ml-2">{retailer.name}</span>
                                                        <Button variant="secondary" size="small" className="text-[10px] px-2 py-1">
                                                            Add to Cart
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {wtbTab === 'instore' && (
                                            <div className="space-y-2">
                                                <div className="flex space-x-2 items-center mb-2">
                                                    <InputField
                                                        id="store-search"
                                                        type="text"
                                                        value={storeSearchQuery}
                                                        onChange={(e) => setStoreSearchQuery(e.target.value)}
                                                        placeholder="City, State or Zip"
                                                        className="flex-grow text-xs"
                                                    />
                                                    <Button variant="primary" size="small" className="px-2 py-1 text-xs">
                                                        GO
                                                    </Button>
                                                </div>
                                                <div className="space-y-2">
                                                    {NEARBY_STORES.map((store, index) => (
                                                        <div key={index} className="p-2 border rounded bg-gray-50 hover:bg-gray-100 flex items-center justify-between cursor-pointer">
                                                            <div className="flex items-center space-x-2 overflow-hidden">
                                                                <img src={store.logo} alt={store.name} className="h-6 w-8 object-contain flex-shrink-0" />
                                                                <div className="text-left">
                                                                    <p className="text-xs font-semibold truncate">{store.name}</p>
                                                                    <p className="text-[10px] text-gray-600 truncate">{store.address}</p>
                                                                    <div className="flex items-center space-x-2 text-[10px] text-gray-500 mt-0.5">
                                                                        <span>🛒 {store.productCount}</span>
                                                                        <a href="#" onClick={(e)=>e.preventDefault()} className="hover:text-blue-600 flex items-center">
                                                                            <span className="mr-0.5">📍</span>
                                                                            Directions
                                                                        </a>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right flex-shrink-0 ml-2">
                                                                <p className="text-xs font-medium">{store.distance}</p>
                                                                <span className="text-blue-600 text-base">&gt;</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );

    // Specific layout for 320x50
    if (adSize === '320x50') {
         // Simplified: No expansion for 320x50, just show basic buttons
         layout = (
             <div className="flex items-center justify-between w-full h-full space-x-2">
                 {/* Left: Text */}
                 <div className="flex-shrink flex flex-col text-left overflow-hidden max-w-[45%]">
                      <h3 className="text-xs font-bold text-gray-800 leading-tight truncate">{headline || "Headline"}</h3>
                      <p className="text-[10px] text-gray-600 leading-snug truncate">{description || "Description"}</p>
                 </div>

                 {/* Middle: CTA */}
                  <div className="flex-shrink-0">
                      {ctaType === CTA_TYPE_TEXT && (
                         <Button variant="primary" size="small" className="truncate" onClick={() => clickUrl && window.open(clickUrl, '_blank')} title={`Clicks go to: ${clickUrl || 'Not set'}`}>
                             {ctaText || 'CTA'}
                         </Button>
                     )}
                     {ctaType === CTA_TYPE_WHERE_TO_BUY && (
                          <div className="flex flex-col space-y-1">
                             <Button variant="light" size="small" className="text-[9px] px-1 py-0.5" onClick={() => alert('"Buy Online" clicked (placeholder)')}>
                                 Buy Online
                             </Button>
                             <Button variant="light" size="small" className="text-[9px] px-1 py-0.5" onClick={() => alert('"Find in Store" clicked (placeholder)')}>
                                 Find Store
                             </Button>
                         </div>
                     )}
                  </div>

                  {/* Right: Image */}
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center overflow-hidden">
                      {imageSrc ? (
                         <img
                             src={imageSrc}
                             alt="Ad"
                             className="max-w-full max-h-full object-contain rounded-sm"
                             onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/40x40/f87171/ffffff?text=Err'; }}
                         />
                      ) : (
                         <div className="w-full h-full bg-gray-200 rounded-sm flex items-center justify-center text-gray-400 text-[8px]">
                             Img
                         </div>
                      )}
                  </div>
             </div>
         );
     }

    // Function to parse size string into width/height object
     const parseSize = (sizeString) => {
        const [width, height] = (sizeString || DEFAULT_AD_SIZE).split('x').map(Number);
        return { width, height };
    };
    // Get current dimensions for preview styling
    const currentDimensions = parseSize(adSize);

    return (
         <div
            className={`relative bg-white shadow-lg rounded-lg border border-gray-300 overflow-hidden flex transition-all duration-300 ease-in-out ${adSize === '320x50' ? 'p-1' : 'p-3 flex-col items-center'}`} // Add relative positioning here
            // Apply dynamic width and height using inline styles
            style={{
                width: `${currentDimensions.width}px`,
                height: `${currentDimensions.height}px`
            }}
        >
            {layout}
        </div>
    );
}


// --- Feature Components ---

// Add helper functions for auto-incrementing names
function getNextAvailableNumber(prefix, existingNames) {
    const regex = new RegExp(`^${prefix}(\\d+)$`);
    let maxNumber = 0;

    existingNames.forEach(name => {
        const match = name.match(regex);
        if (match) {
            const number = parseInt(match[1]);
            maxNumber = Math.max(maxNumber, number);
        }
    });

    return maxNumber + 1;
}

function generateNextCampaignName() {
    const campaigns = dbOperations.getCampaigns();
    const existingNames = campaigns.map(c => c.name);
    const nextNumber = getNextAvailableNumber('Campaign', existingNames);
    return `Campaign${nextNumber}`;
}

function generateNextCreativeName(campaignName) {
    const campaigns = dbOperations.getCampaigns();
    const campaign = campaigns.find(c => c.name === campaignName);
    let existingCreatives = [];
    
    if (campaign && campaign.adData && campaign.adData.creativeName) {
        existingCreatives = [campaign.adData.creativeName];
    }
    
    const nextNumber = getNextAvailableNumber('Creative', existingCreatives);
    return `Creative${nextNumber}`;
}

/**
 * CreateCampaignScreen Component
 */
function CreateCampaignScreen({ onCampaignCreated, onSaveAndExit }) {
    const [campaignName, setCampaignName] = useState(generateNextCampaignName());
    const [campaignNameError, setCampaignNameError] = useState('');
    const [audienceSegment, setAudienceSegment] = useState(DEFAULT_AUDIENCE_TYPE);
    const [showDietOverlay, setShowDietOverlay] = useState(false);
    const [selectedDietTypes, setSelectedDietTypes] = useState([]);
    const [showSpecificRetailers, setShowSpecificRetailers] = useState(false);
    const [selectedRetailers, setSelectedRetailers] = useState([]);
    const [showSpecificRegions, setShowSpecificRegions] = useState(false);
    const [selectedRegions, setSelectedRegions] = useState([]);

    const handleDietTypeChange = (value) => {
        if (selectedDietTypes.includes(value)) {
            setSelectedDietTypes(selectedDietTypes.filter(type => type !== value));
        } else {
            setSelectedDietTypes([...selectedDietTypes, value]);
        }
    };

    const handleRetailerChange = (value) => {
        if (selectedRetailers.includes(value)) {
            setSelectedRetailers(selectedRetailers.filter(retailer => retailer !== value));
        } else {
            setSelectedRetailers([...selectedRetailers, value]);
        }
    };

    const handleRegionChange = (value) => {
        if (selectedRegions.includes(value)) {
            setSelectedRegions(selectedRegions.filter(region => region !== value));
        } else {
            setSelectedRegions([...selectedRegions, value]);
        }
    };

    const handleContinue = () => {
        const trimmedCampaignName = campaignName.trim();
        if (!trimmedCampaignName) {
            setCampaignNameError('Campaign Name is required.');
            return;
        }
        setCampaignNameError('');

        const campaignSettings = {
            campaign: {
                name: trimmedCampaignName
            },
            audience: {
                type: audienceSegment,
                dietOverlay: showDietOverlay ? selectedDietTypes : [],
                specificRetailers: showSpecificRetailers ? selectedRetailers : [],
                specificRegions: showSpecificRegions ? selectedRegions : []
            }
        };
        onCampaignCreated(campaignSettings);
    };

    const handleSaveAndExit = () => {
        const trimmedCampaignName = campaignName.trim();
        if (!trimmedCampaignName) {
            setCampaignNameError('Campaign Name is required.');
            return;
        }
        setCampaignNameError('');

        const campaignSettings = {
            campaign: {
                name: trimmedCampaignName
            },
            audience: {
                type: audienceSegment,
                dietOverlay: showDietOverlay ? selectedDietTypes : [],
                specificRetailers: showSpecificRetailers ? selectedRetailers : [],
                specificRegions: showSpecificRegions ? selectedRegions : []
            }
        };
        onSaveAndExit(campaignSettings);
    };

    return (
        <Card title="Step 1: Create Campaign" className="max-w-lg mx-auto">
            <p className="text-gray-600 mb-6">Define your campaign name and audience details.</p>

            {/* Campaign Name Input */}
            <div className="mb-6">
                <InputField
                    id="campaignName"
                    label="Campaign Name"
                    value={campaignName}
                    onChange={(e) => { setCampaignName(e.target.value); setCampaignNameError(''); }}
                    placeholder="e.g., Summer Sale 2025"
                    error={campaignNameError}
                />
            </div>

            {/* Audience Section */}
            <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Choose Audience</h3>

                {/* Audience Segment Selection Dropdown */}
                <div className="mb-6">
                    <SelectDropdown
                        id="audienceSegment"
                        label="SPINS Shopper Profile"
                        value={audienceSegment}
                        onChange={(e) => setAudienceSegment(e.target.value)}
                        options={AUDIENCE_OPTIONS}
                    />
                </div>

                {/* Diet Type Overlay Radio Buttons */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Overlay Diet Type</label>
                    <div className="space-y-2">
                        <div className="flex items-center">
                            <input
                                type="radio"
                                id="dietOverlayNo"
                                name="dietOverlay"
                                checked={!showDietOverlay}
                                onChange={() => {
                                    setShowDietOverlay(false);
                                    setSelectedDietTypes([]);
                                }}
                                className="focus:ring-[#F7941D] h-4 w-4 text-[#F7941D] border-gray-300"
                            />
                            <label htmlFor="dietOverlayNo" className="ml-3 block text-sm font-medium text-gray-700">
                                No
                            </label>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="radio"
                                id="dietOverlayYes"
                                name="dietOverlay"
                                checked={showDietOverlay}
                                onChange={() => setShowDietOverlay(true)}
                                className="focus:ring-[#F7941D] h-4 w-4 text-[#F7941D] border-gray-300"
                            />
                            <label htmlFor="dietOverlayYes" className="ml-3 block text-sm font-medium text-gray-700">
                                Yes
                            </label>
                        </div>
                    </div>

                    {/* Diet Type Checkboxes */}
                    {showDietOverlay && (
                        <div className="mt-4 ml-6 space-y-2">
                            {DIET_TYPE_OPTIONS.map(option => (
                                <div key={option.value} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={`diet-${option.value}`}
                                        checked={selectedDietTypes.includes(option.value)}
                                        onChange={() => handleDietTypeChange(option.value)}
                                        className="focus:ring-[#F7941D] h-4 w-4 text-[#F7941D] border-gray-300 rounded"
                                    />
                                    <label htmlFor={`diet-${option.value}`} className="ml-3 block text-sm text-gray-700">
                                        {option.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Specific Retailer Radio Buttons */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Specific Retailers</label>
                    <div className="space-y-2">
                        <div className="flex items-center">
                            <input
                                type="radio"
                                id="retailerOverlayNo"
                                name="retailerOverlay"
                                checked={!showSpecificRetailers}
                                onChange={() => {
                                    setShowSpecificRetailers(false);
                                    setSelectedRetailers([]);
                                }}
                                className="focus:ring-[#F7941D] h-4 w-4 text-[#F7941D] border-gray-300"
                            />
                            <label htmlFor="retailerOverlayNo" className="ml-3 block text-sm font-medium text-gray-700">
                                No
                            </label>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="radio"
                                id="retailerOverlayYes"
                                name="retailerOverlay"
                                checked={showSpecificRetailers}
                                onChange={() => setShowSpecificRetailers(true)}
                                className="focus:ring-[#F7941D] h-4 w-4 text-[#F7941D] border-gray-300"
                            />
                            <label htmlFor="retailerOverlayYes" className="ml-3 block text-sm font-medium text-gray-700">
                                Yes
                            </label>
                        </div>
                    </div>

                    {/* Retailer Checkboxes */}
                    {showSpecificRetailers && (
                        <div className="mt-4 ml-6 space-y-2">
                            {SPECIFIC_RETAILER_OPTIONS.map(option => (
                                <div key={option.value} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={`retailer-${option.value}`}
                                        checked={selectedRetailers.includes(option.value)}
                                        onChange={() => handleRetailerChange(option.value)}
                                        className="focus:ring-[#F7941D] h-4 w-4 text-[#F7941D] border-gray-300 rounded"
                                    />
                                    <label htmlFor={`retailer-${option.value}`} className="ml-3 block text-sm text-gray-700">
                                        {option.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Specific Region Radio Buttons */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Specific Region</label>
                    <div className="space-y-2">
                        <div className="flex items-center">
                            <input
                                type="radio"
                                id="regionOverlayNo"
                                name="regionOverlay"
                                checked={!showSpecificRegions}
                                onChange={() => {
                                    setShowSpecificRegions(false);
                                    setSelectedRegions([]);
                                }}
                                className="focus:ring-[#F7941D] h-4 w-4 text-[#F7941D] border-gray-300"
                            />
                            <label htmlFor="regionOverlayNo" className="ml-3 block text-sm font-medium text-gray-700">
                                No
                            </label>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="radio"
                                id="regionOverlayYes"
                                name="regionOverlay"
                                checked={showSpecificRegions}
                                onChange={() => setShowSpecificRegions(true)}
                                className="focus:ring-[#F7941D] h-4 w-4 text-[#F7941D] border-gray-300"
                            />
                            <label htmlFor="regionOverlayYes" className="ml-3 block text-sm font-medium text-gray-700">
                                Yes
                            </label>
                        </div>
                    </div>

                    {/* Region Checkboxes */}
                    {showSpecificRegions && (
                        <div className="mt-4 ml-6 space-y-2">
                            {SPECIFIC_REGION_OPTIONS.map(option => (
                                <div key={option.value} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={`region-${option.value}`}
                                        checked={selectedRegions.includes(option.value)}
                                        onChange={() => handleRegionChange(option.value)}
                                        className="focus:ring-[#F7941D] h-4 w-4 text-[#F7941D] border-gray-300 rounded"
                                    />
                                    <label htmlFor={`region-${option.value}`} className="ml-3 block text-sm text-gray-700">
                                        {option.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-3 mt-6">
                <Button onClick={handleContinue} variant="primary" className="w-full">
                    Add a Creative
                </Button>
                <Button onClick={handleSaveAndExit} variant="secondary" className="w-full">
                    Save Campaign and Exit
                </Button>
                <Button disabled variant="secondary" className="w-full opacity-60 cursor-not-allowed">
                    Onboard Audience to Partner (Coming Soon)
                </Button>
            </div>
        </Card>
    );
}

/**
 * StartScreen Component
 * Step 2: Build Creative. Displays selected campaign/audience info.
 */
function StartScreen({ onSelectUpload, onSelectUrl, campaignSettings }) {
    // Extract info for display, handle null campaignSettings
    const campaignName = campaignSettings?.campaign?.name || 'N/A';
    const audienceTypeLabel = AUDIENCE_OPTIONS.find(opt => opt.value === campaignSettings?.audience?.type)?.label || campaignSettings?.audience?.type || 'N/A';
    
    // Get diet type labels
    const dietTypes = campaignSettings?.audience?.dietOverlay || [];
    const dietTypeLabels = dietTypes.map(type => 
        DIET_TYPE_OPTIONS.find(opt => opt.value === type)?.label
    ).filter(Boolean);

    // Get retailer labels
    const retailers = campaignSettings?.audience?.specificRetailers || [];
    const retailerLabels = retailers.map(retailer => 
        SPECIFIC_RETAILER_OPTIONS.find(opt => opt.value === retailer)?.label
    ).filter(Boolean);

    // Get region labels
    const regions = campaignSettings?.audience?.specificRegions || [];
    const regionLabels = regions.map(region => 
        SPECIFIC_REGION_OPTIONS.find(opt => opt.value === region)?.label
    ).filter(Boolean);

    return (
        <Card title="Step 2: Build Creative" className="text-center max-w-lg mx-auto">
            {/* Display Campaign and Audience Info */}
            <div className="text-gray-500 text-sm mb-4 border-b pb-4 text-left">
                <p className="font-medium text-gray-700 mb-2">Campaign Settings:</p>
                <p>Campaign Name: <span className="font-medium">{campaignName}</span></p>
                <p>SPINS Shopper Profile: <span className="font-medium">{audienceTypeLabel}</span></p>
                
                {/* Diet Types */}
                {dietTypeLabels.length > 0 && (
                    <div className="mt-2">
                        <p className="text-gray-700">Diet Types:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {dietTypeLabels.map((label, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                    {label}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Retailers */}
                {retailerLabels.length > 0 && (
                    <div className="mt-2">
                        <p className="text-gray-700">Target Retailers:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {retailerLabels.map((label, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {label}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Regions */}
                {regionLabels.length > 0 && (
                    <div className="mt-2">
                        <p className="text-gray-700">Target Regions:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {regionLabels.map((label, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {label}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <p className="text-gray-600 mb-6">How would you like to provide the ad content?</p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Button onClick={onSelectUpload} variant="primary" className="w-full sm:w-auto">
                    Upload Assets
                </Button>
                <Button onClick={onSelectUrl} variant="secondary" className="w-full sm:w-auto">
                    Use Product URL
                </Button>
            </div>
        </Card>
    );
}

/**
 * AssetUpload Component
 * Step 3a: Upload assets. Displays selected campaign/audience info.
 */
function AssetUpload({ onAssetsUploaded, campaignSettings }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewDataUrl, setPreviewDataUrl] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Initialize creative name using the generator
    const [creativeName, setCreativeName] = useState(() => 
        generateNextCreativeName(campaignSettings?.campaign?.name)
    );
    const [creativeNameError, setCreativeNameError] = useState('');

    // Extract info for display
    const campaignName = campaignSettings?.campaign?.name || 'N/A';
    const audienceTypeLabel = AUDIENCE_OPTIONS.find(opt => opt.value === campaignSettings?.audience?.type)?.label || campaignSettings?.audience?.type || 'N/A';
    
    // Get diet type labels
    const dietTypes = campaignSettings?.audience?.dietOverlay || [];
    const dietTypeLabels = dietTypes.map(type => 
        DIET_TYPE_OPTIONS.find(opt => opt.value === type)?.label
    ).filter(Boolean);

    // Get retailer labels
    const retailers = campaignSettings?.audience?.specificRetailers || [];
    const retailerLabels = retailers.map(retailer => 
        SPECIFIC_RETAILER_OPTIONS.find(opt => opt.value === retailer)?.label
    ).filter(Boolean);

    // Get region labels
    const regions = campaignSettings?.audience?.specificRegions || [];
    const regionLabels = regions.map(region => 
        SPECIFIC_REGION_OPTIONS.find(opt => opt.value === region)?.label
    ).filter(Boolean);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setPreviewDataUrl(null);
        setSelectedFile(null);
        setError('');

        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file (e.g., JPG, PNG, GIF).');
                return;
            }
            const reader = new FileReader();
            reader.onloadstart = () => setIsLoading(true);
            reader.onerror = () => {
                setError('Error reading file.');
                setIsLoading(false);
            };
            reader.onloadend = () => {
                setPreviewDataUrl(reader.result);
                setSelectedFile(file);
                setIsLoading(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = () => {
        if (!creativeName.trim()) {
            setCreativeNameError('Creative Name is required.');
            return;
        }
        if (!selectedFile || !previewDataUrl) {
            setError('Please select and process a file first.');
            return;
        }
        onAssetsUploaded({
            type: 'image',
            url: previewDataUrl,
            fileName: selectedFile.name,
            creativeName: creativeName.trim()
        });
    };

    return (
        <Card title="Step 3: Upload Your Assets" className="max-w-lg mx-auto">
            <div className="text-gray-500 text-sm mb-4 border-b pb-4 text-left">
                <p className="font-medium text-gray-700 mb-2">Campaign Settings:</p>
                <p>Campaign Name: <span className="font-medium">{campaignName}</span></p>
                <p>SPINS Shopper Profile: <span className="font-medium">{audienceTypeLabel}</span></p>
                
                {/* Diet Types */}
                {dietTypeLabels.length > 0 && (
                    <div className="mt-2">
                        <p className="text-gray-700">Diet Types:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {dietTypeLabels.map((label, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                    {label}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Retailers */}
                {retailerLabels.length > 0 && (
                    <div className="mt-2">
                        <p className="text-gray-700">Target Retailers:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {retailerLabels.map((label, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {label}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Regions */}
                {regionLabels.length > 0 && (
                    <div className="mt-2">
                        <p className="text-gray-700">Target Regions:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {regionLabels.map((label, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {label}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Add Creative Name Input */}
            <div className="mb-6">
                <InputField
                    id="creativeName"
                    label="Creative Name"
                    value={creativeName}
                    onChange={(e) => {
                        setCreativeName(e.target.value);
                        setCreativeNameError('');
                    }}
                    placeholder="Enter a name for this creative"
                    error={creativeNameError}
                />
            </div>

            <p className="text-gray-600 mb-4">Select an image for your ad.</p>
            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                disabled={isLoading}
            />
            {isLoading && <p className="text-blue-600 text-sm mb-4">Processing image...</p>}
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            {previewDataUrl && (
                <div className="mb-4 border rounded-lg p-2">
                    <p className="text-sm font-medium text-gray-700 mb-1">Preview:</p>
                    <img src={previewDataUrl} alt="Selected asset preview" className="max-w-xs max-h-40 mx-auto rounded" />
                </div>
            )}
            <Button onClick={handleUpload} variant="primary" disabled={!selectedFile || isLoading}>
                {isLoading ? 'Processing...' : 'Upload & Continue'}
            </Button>
        </Card>
    );
}

/**
 * UrlInput Component
 * Step 3b: Enter URL. Displays selected campaign/audience info.
 */
function UrlInput({ onUrlSubmitted, campaignSettings, onSelectUpload }) {
    const [url, setUrl] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [alternativeSuggestion, setAlternativeSuggestion] = useState(null);

    // Extract info for display
    const campaignName = campaignSettings?.campaign?.name || 'N/A';
    const audienceTypeLabel = AUDIENCE_OPTIONS.find(opt => opt.value === campaignSettings?.audience?.type)?.label || campaignSettings?.audience?.type || 'N/A';
    
    // Get diet type labels
    const dietTypes = campaignSettings?.audience?.dietOverlay || [];
    const dietTypeLabels = dietTypes.map(type => 
        DIET_TYPE_OPTIONS.find(opt => opt.value === type)?.label
    ).filter(Boolean);

    // Get retailer labels
    const retailers = campaignSettings?.audience?.specificRetailers || [];
    const retailerLabels = retailers.map(retailer => 
        SPECIFIC_RETAILER_OPTIONS.find(opt => opt.value === retailer)?.label
    ).filter(Boolean);

    // Get region labels
    const regions = campaignSettings?.audience?.specificRegions || [];
    const regionLabels = regions.map(region => 
        SPECIFIC_REGION_OPTIONS.find(opt => opt.value === region)?.label
    ).filter(Boolean);

    // Fetch product info from API
    const fetchProductInfo = async () => {
        if (!url || !url.startsWith('http')) {
            setError("Please enter a valid URL (e.g., https://...).");
            return;
        }
        
        setError('');
        setApiError(null);
        setAlternativeSuggestion(null);
        setIsLoading(true);
        
        try {
            console.log(`Fetching product info from URL: ${url}`);
            
            // Check if it's Amazon (quick client-side check)
            const isAmazonUrl = url.includes('amazon.com') || url.includes('amazon.co.uk') || 
                               url.includes('amazon.ca') || url.includes('amazon.de');
            
            if (isAmazonUrl) {
                console.log('Amazon URL detected. This might be slower or may not work.');
            }
            
            // Call our backend API to fetch the product image
            const response = await fetch('/api/fetch-product-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                // Store any alternative suggestion from the server
                if (data.alternativeSuggestion) {
                    setAlternativeSuggestion(data.alternativeSuggestion);
                }
                throw new Error(data.error || 'Failed to fetch product information');
            }
            
            if (!data.imageUrl) {
                throw new Error('No product image found on the page');
            }
            
            // Create a unique creative name
            const creativeName = generateNextCreativeName(campaignSettings?.campaign?.name);
            
            // Pass the product data to the parent component
            onUrlSubmitted({
                type: 'product',
                sourceUrl: url,
                imageUrl: data.imageUrl,
                title: data.title || 'Product Title',
                description: data.description ? 
                    (data.description.length > 125 ? 
                        data.description.substring(0, 125) + '...' : 
                        data.description) : 
                    'Product Description',
                creativeName
            });
            
        } catch (error) {
            console.error('Error fetching product info:', error);
            setApiError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card title="Step 3: Enter Product URL" className="max-w-lg mx-auto">
            <div className="text-gray-500 text-sm mb-4 border-b pb-4 text-left">
                <p className="font-medium text-gray-700 mb-2">Campaign Settings:</p>
                <p>Campaign Name: <span className="font-medium">{campaignName}</span></p>
                <p>SPINS Shopper Profile: <span className="font-medium">{audienceTypeLabel}</span></p>
                
                {/* Diet Types */}
                {dietTypeLabels.length > 0 && (
                    <div className="mt-2">
                        <p className="text-gray-700">Diet Types:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {dietTypeLabels.map((label, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                    {label}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Retailers */}
                {retailerLabels.length > 0 && (
                    <div className="mt-2">
                        <p className="text-gray-700">Target Retailers:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {retailerLabels.map((label, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {label}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Regions */}
                {regionLabels.length > 0 && (
                    <div className="mt-2">
                        <p className="text-gray-700">Target Regions:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {regionLabels.map((label, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {label}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <p className="text-gray-600 mb-4">Enter the URL of the product you want to advertise.</p>
            
            {/* Remove the preview example and URL examples section entirely */}
            
            <InputField
                id="productUrl"
                label="Product URL"
                type="url"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setError(''); setApiError(null); }}
                onKeyDown={(e) => { if (e.key === 'Enter') fetchProductInfo(); }}
                placeholder="e.g., https://yourstore.com/product/item"
                error={error}
            />
            
            {/* Display API error if any */}
            {apiError && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                    <p className="font-semibold">Error fetching product:</p>
                    <p>{apiError}</p>
                    {alternativeSuggestion && (
                        <p className="mt-2 text-xs text-gray-600">{alternativeSuggestion}</p>
                    )}
                    <div className="mt-4">
                        <Button 
                            variant="secondary" 
                            size="small"
                            onClick={() => onSelectUpload && onSelectUpload()}
                            className="text-xs"
                        >
                            Switch to Image Upload
                        </Button>
                    </div>
                </div>
            )}
            
            <Button onClick={fetchProductInfo} variant="primary" className="mt-4 w-full" disabled={isLoading}>
                {isLoading ? (
                    <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Fetching...
                    </span>
                ) : 'Fetch Product & Continue'}
            </Button>
        </Card>
    );
}


/**
 * AdCustomization Component
 * Step 4: Customize Ad. Includes selected campaign/audience info.
 */
function AdCustomization({ adData, campaignSettings, onPublish }) { // Receive campaignSettings
    // --- State for Ad Elements ---
    const [headline, setHeadline] = useState(adData?.title || 'Your Catchy Headline');
    const [description, setDescription] = useState(adData?.description || '');
    const [adSize, setAdSize] = useState(DEFAULT_AD_SIZE);

    // --- State for CTA ---
    const [ctaType, setCtaType] = useState(CTA_TYPE_TEXT);
    const [ctaText, setCtaText] = useState('Shop Now');
    const [clickUrl, setClickUrl] = useState(adData?.sourceUrl || '');

    // Determine image source based on input type
    const imageSrc = adData?.url || adData?.imageUrl;

    // Extract info for display
    const campaignName = campaignSettings?.campaign?.name || 'N/A';
    const audienceTypeLabel = AUDIENCE_OPTIONS.find(opt => opt.value === campaignSettings?.audience?.type)?.label || campaignSettings?.audience?.type || 'N/A';
    const audienceLocationsDisplay = campaignSettings?.audience?.locations?.length > 0 ? campaignSettings.audience.locations.join(', ') : 'Any';
    const retailerLabel = RETAILER_OPTIONS.find(opt => opt.value === campaignSettings?.audience?.retailer)?.label || campaignSettings?.audience?.retailer || 'N/A';

    // Function to handle publishing (passing customized data)
    const handlePreviewAndPublish = () => {
        const customizedAdData = {
            ...adData, // Original data (type, image url, fileName etc.)
            campaignName: campaignSettings?.campaign?.name || 'Unnamed Campaign', // Add fallback
            audience: campaignSettings?.audience || { // Add fallback for audience
                type: DEFAULT_AUDIENCE_TYPE,
                dietOverlay: [],
                specificRetailers: [],
                specificRegions: []
            },
            headline,
            description,
            adSize,
            ctaType: ctaType,
            ctaText: ctaType === CTA_TYPE_TEXT ? ctaText : null,
            clickUrl: ctaType === CTA_TYPE_TEXT ? clickUrl : null,
            whereToBuy: {
                enabled: ctaType === CTA_TYPE_WHERE_TO_BUY,
                buyOnlineUrl: '#',
                findInStoreUrl: '#'
            }
        };
        console.log("Passing customized data to publish screen:", customizedAdData);
        onPublish(customizedAdData);
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* --- Customization Panel --- */}
            <Card title="Step 4: Customize Your Ad" className="lg:col-span-1 h-fit sticky top-24">
                 <div className="text-gray-500 text-sm mb-4 border-b pb-2 text-left">
                     <p>Campaign: <span className="font-medium">{campaignName}</span></p>
                     <p>Segment: <span className="font-medium">{audienceTypeLabel}</span></p>
                    <p>Location(s): <span className="font-medium">{audienceLocationsDisplay}</span></p>
                    <p>Retailer: <span className="font-medium">{retailerLabel}</span></p>
                 </div>
                <div className="space-y-4">
                     {/* Ad Size Selection */}
                     <div className="pb-4 border-b">
                        <RadioGroup
                            label="Ad Size"
                            name="adSize"
                            selectedValue={adSize}
                            onChange={(e) => setAdSize(e.target.value)}
                            options={AD_SIZES}
                        />
                    </div>

                    {/* Basic Customization */}
                    <InputField
                        id="headline"
                        label="Headline"
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value)}
                        placeholder="Enter ad headline"
                    />
                    <InputField
                        id="description"
                        label="Description / Subheadline"
                        type="textarea"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter ad description or subheadline"
                    />

                    {/* CTA Selection Section */}
                    <div className="pt-4 border-t mt-4">
                        <RadioGroup
                            label="Call To Action Type"
                            name="ctaType"
                            selectedValue={ctaType}
                            onChange={(e) => setCtaType(e.target.value)}
                            options={[
                                { label: 'Text Button', value: CTA_TYPE_TEXT },
                                { label: '"Where to Buy" Overlay', value: CTA_TYPE_WHERE_TO_BUY },
                            ]}
                        />
                    </div>

                     {/* Text CTA Input Fields */}
                     <div className={`space-y-4 mt-4 ${ctaType !== CTA_TYPE_TEXT ? 'opacity-50 pointer-events-none' : ''}`}>
                        <InputField
                            id="cta"
                            label="Button Text"
                            value={ctaText}
                            onChange={(e) => setCtaText(e.target.value)}
                            disabled={ctaType !== CTA_TYPE_TEXT}
                        />
                         <InputField
                            id="clickUrl"
                            label="Click URL (Destination)"
                            type="url"
                            value={clickUrl}
                            onChange={(e) => setClickUrl(e.target.value)}
                            placeholder="https://example.com/product-page"
                            disabled={ctaType !== CTA_TYPE_TEXT}
                        />
                     </div>

                     {/* Note for Where to Buy */}
                      {ctaType === CTA_TYPE_WHERE_TO_BUY && (
                         <p className="text-xs text-gray-500 mt-2 italic">
                             The "Where to Buy" overlay will be shown.
                         </p>
                     )}

                </div>
                 <Button onClick={handlePreviewAndPublish} variant="success" className="w-full mt-6">Preview & Publish</Button>
            </Card>

            {/* --- Ad Preview Panel --- */}
            <Card title={`Ad Preview (${adSize})`} className="lg:col-span-2 flex flex-col items-center justify-start bg-gray-50 p-4">
                 {/* Use the AdPreviewContent component */}
                 <AdPreviewContent
                    headline={headline}
                    description={description}
                    imageSrc={imageSrc}
                    ctaType={ctaType}
                    ctaText={ctaText}
                    clickUrl={clickUrl}
                    adSize={adSize}
                 />
                 <p className="text-xs text-gray-500 mt-4 italic">Note: Preview is an approximation. Content may adjust based on size.</p>
            </Card>
        </div>
    );
}

/**
 * PublishScreen Component
 * Step 5: Review and Publish Your Ad. Includes selected campaign/audience info.
 */
function PublishScreen({ adData, onBack }) {
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null);
    const [navigateToAdPlatforms, setNavigateToAdPlatforms] = useState(false);

    // For navigating to Ad Platforms
    const { setAppView } = useContext(AppContext);

    useEffect(() => {
        if (navigateToAdPlatforms) {
            setAppView(APP_VIEW_AD_PLATFORMS);
        }
    }, [navigateToAdPlatforms, setAppView]);

    // Fallback in case adData is null or incomplete
    if (!adData) {
        return (
            <Card title="Review and Publish Your Ad" className="max-w-2xl mx-auto">
                <p className="text-red-500 text-center mb-4">Error: Ad data is missing.</p>
                <div className="text-center">
                    <Button onClick={onBack} variant="secondary">Back to Editing</Button>
                </div>
            </Card>
        );
    }

    const handleSave = async () => {
        setIsSaving(true);
        setSaveStatus(null);

        try {
            const result = await Promise.resolve(dbOperations.saveAd(adData)); // Simulating async operation
            
            if (result.success) {
                setSaveStatus({
                    type: 'success',
                    message: 'Campaign saved successfully!'
                });
            } else {
                setSaveStatus({
                    type: 'error',
                    message: 'Failed to save campaign. Please try again.'
                });
            }
        } catch (error) {
            setSaveStatus({
                type: 'error',
                message: 'An error occurred while saving. Please try again.'
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handlePublishToAdPlatform = async (platform) => {
        setIsSaving(true);
        setSaveStatus(null);

        try {
            // First save the campaign
            const result = await Promise.resolve(dbOperations.saveAd(adData));
            
            if (result.success) {
                setSaveStatus({
                    type: 'success',
                    message: `Campaign saved and ready to publish to ${platform}!`
                });
                
                // Navigate to Ad Platforms after a brief delay
                setTimeout(() => {
                    setNavigateToAdPlatforms(true);
                }, 1500);
            } else {
                setSaveStatus({
                    type: 'error',
                    message: 'Failed to save campaign. Please try again.'
                });
            }
        } catch (error) {
            setSaveStatus({
                type: 'error',
                message: 'An error occurred while saving. Please try again.'
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Extract data for display with fallbacks
    const {
        headline = "Ad Headline",
        description = "",
        ctaText = "Call To Action",
        ctaType = CTA_TYPE_TEXT,
        clickUrl = "",
        adSize = DEFAULT_AD_SIZE,
        campaignName = "N/A",
        audience = { type: DEFAULT_AUDIENCE_TYPE, locations: [], retailer: DEFAULT_RETAILER },
        url: uploadedDataUrl,
        imageUrl: fetchedImageUrl,
    } = adData;

    // Determine the primary image source for display
    const imageSrc = uploadedDataUrl || fetchedImageUrl;

    // Find labels/values for display
    const audienceTypeLabel = AUDIENCE_OPTIONS.find(opt => opt.value === audience?.type)?.label || audience?.type || 'N/A';
    const audienceLocationsDisplay = audience?.locations?.length > 0 ? audience.locations.join(', ') : 'Any';
    const retailerLabel = RETAILER_OPTIONS.find(opt => opt.value === audience?.retailer)?.label || audience?.retailer || 'N/A';

    return (
        <Card title="Step 5: Review and Publish Your Ad" className="max-w-2xl mx-auto">
            {/* Display selected campaign & audience details */}
            <div className="text-center text-sm text-gray-600 mb-4 border-b pb-2">
                <p>Campaign: <span className="font-semibold">{campaignName}</span></p>
                <p>Target Segment: <span className="font-semibold">{audienceTypeLabel}</span></p>
                <p>Location(s): <span className="font-semibold">{audienceLocationsDisplay}</span></p>
                <p>Retailer: <span className="font-semibold">{retailerLabel}</span></p>
            </div>

            {/* Final Ad Preview Container */}
            <div className="mb-6 flex justify-center">
                <AdPreviewContent
                    headline={headline}
                    description={description}
                    imageSrc={imageSrc}
                    ctaType={ctaType}
                    ctaText={ctaText}
                    clickUrl={clickUrl}
                    adSize={adSize}
                />
            </div>

            {/* Display Click URL if Text CTA was used */}
            {ctaType === CTA_TYPE_TEXT && clickUrl && (
                <p className="text-center text-sm text-gray-600 mb-4 break-all">
                    Click URL: <a href={clickUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{clickUrl}</a>
                </p>
            )}
            {ctaType === CTA_TYPE_TEXT && !clickUrl && (
                <p className="text-center text-sm text-gray-500 mb-4">
                    (No Click URL set for text button)
                </p>
            )}

            {/* Save Status Message */}
            {saveStatus && (
                <div className={`mb-4 p-3 rounded ${
                    saveStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                    {saveStatus.message}
                </div>
            )}

            <div className="space-y-3 mb-6">
                {/* Save Button */}
                <Button 
                    variant="primary" 
                    className="w-full" 
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? 'Saving...' : 'Save Campaign'}
                </Button>

                <Button 
                    variant="primary" 
                    className="w-full" 
                    onClick={() => handlePublishToAdPlatform('Google Ads')}
                    disabled={isSaving}
                >
                    Publish to Google Ads
                </Button>
                
                <Button 
                    variant="primary" 
                    className="w-full" 
                    onClick={() => handlePublishToAdPlatform('Facebook Ads')}
                    disabled={isSaving}
                >
                    Publish to Facebook Ads
                </Button>
                
                <Button variant="secondary" className="w-full" disabled>Download Ad Files</Button>
            </div>

            {/* Back Button */}
            <div className="text-center">
                <Button onClick={onBack} variant="secondary">Back to Editing</Button>
            </div>
        </Card>
    );
}

// Add Campaign Manager component
function CampaignManagerView({ onCreateNew, onCampaignClick }) {
    // Get campaigns from storage
    const [campaigns, setCampaigns] = useState([]);

    useEffect(() => {
        // Load campaigns when component mounts
        const loadedCampaigns = dbOperations.getCampaigns();
        setCampaigns(loadedCampaigns);
    }, []);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-2">
                    <svg className="w-6 h-6 text-[#F7941D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h1 className="text-2xl font-semibold text-gray-800">Campaigns</h1>
                    <span className="text-gray-500">Status, Budget & More</span>
                </div>
                <Button variant="primary" onClick={onCreateNew}>
                    Launch Campaign
                </Button>
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-[#0B2265]">My Campaigns</h2>
                        <div className="flex items-center space-x-2">
                            <Button variant="light" size="small">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                                </svg>
                            </Button>
                            <Button 
                                variant="primary" 
                                size="small" 
                                onClick={onCreateNew}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Info</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Starts</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ends</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {campaigns.map((campaign) => (
                                <tr key={campaign.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{campaign.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button 
                                            onClick={() => onCampaignClick(campaign)}
                                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline focus:outline-none"
                                        >
                                            {campaign.name}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            {campaign.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {campaign.info && (
                                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.created}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.budget}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.starts}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.ends}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <Button variant="light" size="small">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// Add CampaignDetailsView component
function CampaignDetailsView({ campaign, onBack, onPreviewCreative }) {
    if (!campaign) return null;

    // Extract creatives from campaign data
    const creatives = [{
        id: `CR-${campaign.id}`,
        adSize: campaign.adData.adSize,
        type: campaign.adData.ctaType === CTA_TYPE_WHERE_TO_BUY ? 'Where to Buy' : 'Add to Cart'
    }];

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-2">
                    <Button variant="light" onClick={onBack} className="mr-2">
                        ← Back
                    </Button>
                    <h1 className="text-2xl font-semibold text-gray-800">{campaign.name}</h1>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow">
                {/* Campaign Summary */}
                <div className="p-4 border-b border-gray-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <p className="font-medium">{campaign.status}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Created</p>
                            <p className="font-medium">{campaign.created}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Budget</p>
                            <p className="font-medium">{campaign.budget}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Type</p>
                            <p className="font-medium">{campaign.type}</p>
                        </div>
                    </div>
                </div>

                {/* Creatives Table */}
                <div className="p-4">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Campaign Creatives</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creative ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ad Size</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preview</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {creatives.map((creative) => (
                                    <tr key={creative.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                            <button 
                                                onClick={() => onPreviewCreative(campaign)}
                                                className="hover:underline focus:outline-none"
                                            >
                                                {creative.id}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {creative.adSize}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {creative.type}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <Button 
                                                variant="light" 
                                                size="small"
                                                onClick={() => onPreviewCreative(campaign)}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Add AdPlatformsView component to display ad platform connections
function AdPlatformsView() {
    // Define the platforms with their logos and connection status
    const platforms = [
        { 
            name: 'Facebook', 
            icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/2021_Facebook_icon.svg/800px-2021_Facebook_icon.svg.png',
            connected: false
        },
        { 
            name: 'Instagram', 
            icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/800px-Instagram_logo_2016.svg.png',
            connected: false
        },
        { 
            name: 'TikTok', 
            icon: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/TikTok_logo.svg/800px-TikTok_logo.svg.png',
            connected: false
        },
        { 
            name: 'YouTube', 
            icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/800px-YouTube_full-color_icon_%282017%29.svg.png',
            connected: false
        },
        { 
            name: 'Google Ads', 
            icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Google_Ads_logo.svg/800px-Google_Ads_logo.svg.png',
            connected: false
        }
    ];

    const handleConnect = (platformName) => {
        alert(`Connecting to ${platformName}... This feature is coming soon.`);
    };

    return (
        <div className="p-6">
            <Card title="Ad Platform Integrations" className="max-w-4xl mx-auto">
                <p className="text-gray-600 mb-6">
                    Connect your ad accounts to deliver campaigns directly to these platforms.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {platforms.map((platform) => (
                        <div key={platform.name} className="border rounded-lg p-4 flex items-center justify-between">
                            <div className="flex items-center">
                                <img 
                                    src={platform.icon} 
                                    alt={`${platform.name} logo`} 
                                    className="w-12 h-12 object-contain mr-4"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://placehold.co/48x48/cccccc/666666?text=' + platform.name.charAt(0);
                                    }}
                                />
                                <div>
                                    <h3 className="font-medium">{platform.name}</h3>
                                    <p className="text-sm text-gray-500">
                                        {platform.connected ? 'Connected' : 'Not connected'}
                                    </p>
                                </div>
                            </div>
                            <Button 
                                variant={platform.connected ? "secondary" : "primary"} 
                                onClick={() => handleConnect(platform.name)}
                            >
                                {platform.connected ? 'Manage' : 'Connect'}
                            </Button>
                        </div>
                    ))}
                </div>
                
                <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="font-medium mb-2">Why connect your ad accounts?</h3>
                    <ul className="list-disc pl-5 space-y-1 text-gray-600">
                        <li>Publish campaigns directly to platforms</li>
                        <li>View performance metrics in one dashboard</li>
                        <li>Optimize campaigns based on AI-driven insights</li>
                        <li>Automatically adjust creative based on platform requirements</li>
                    </ul>
                </div>
            </Card>
        </div>
    );
}

// Add new LeftNav component
function LeftNav({ onNavigate }) {
    const { appView: currentView } = useContext(AppContext);
    
    return (
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
            <div className="h-16 flex items-center px-6 border-b border-gray-200">
                <img
                    src={spinsLogo}
                    alt="SPINS"
                    className="h-14"
                    onError={(e) => {
                        console.error('Logo failed to load:', e);
                        e.target.style.display = 'none';
                    }}
                />
            </div>
            
            <div className="px-4 py-6">
                <div className="space-y-1">
                    <h2 className="px-2 text-xs font-semibold text-[#0B2265] uppercase tracking-wider">DASHBOARD</h2>
                    <button
                        onClick={() => onNavigate(APP_VIEW_CAMPAIGN_MANAGER)}
                        className={`w-full flex items-center px-2 py-2 text-sm rounded-lg ${
                            currentView === APP_VIEW_CAMPAIGN_MANAGER
                                ? 'bg-[#EEF2FF] text-[#0B2265]'
                                : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <svg className="mr-3 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zM3 16a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" />
                        </svg>
                        Campaign Manager
                    </button>
                </div>
                
                <div className="mt-8 space-y-1">
                    <h2 className="px-2 text-xs font-semibold text-[#0B2265] uppercase tracking-wider">CREATE</h2>
                    <button
                        onClick={() => onNavigate(APP_VIEW_CAMPAIGN_BUILDER)}
                        className={`w-full flex items-center px-2 py-2 text-sm rounded-lg ${
                            currentView === APP_VIEW_CAMPAIGN_BUILDER
                                ? 'bg-[#EEF2FF] text-[#0B2265]'
                                : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <svg className="mr-3 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Campaign Builder
                    </button>
                </div>

                <div className="mt-8 space-y-1">
                    <h2 className="px-2 text-xs font-semibold text-[#0B2265] uppercase tracking-wider">IDEATION</h2>
                    <a
                        href="https://vibeads.vercel.app/visuals?brandId=8"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center px-2 py-2 text-sm rounded-lg text-gray-600 hover:bg-gray-50"
                    >
                        <svg className="mr-3 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                        </svg>
                        Campaign Brainstorm
                    </a>
                    <a
                        href="https://meetsynthia.ai/app/chat"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center px-2 py-2 text-sm rounded-lg text-gray-600 hover:bg-gray-50"
                    >
                        <svg className="mr-3 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                        </svg>
                        Copy Brainstorm
                    </a>
                </div>

                <div className="mt-8 space-y-1">
                    <h2 className="px-2 text-xs font-semibold text-[#0B2265] uppercase tracking-wider">INTEGRATIONS</h2>
                    <button
                        onClick={() => onNavigate(APP_VIEW_AD_PLATFORMS)}
                        className={`w-full flex items-center px-2 py-2 text-sm rounded-lg ${
                            currentView === APP_VIEW_AD_PLATFORMS
                                ? 'bg-[#EEF2FF] text-[#0B2265]'
                                : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <svg className="mr-3 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                        </svg>
                        Ad Platforms
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- Main Application Component ---

/**
 * App Component
 * The main application component that manages the state and renders different views.
 */
function App() {
    // Add state for app view
    const [appView, setAppView] = useState(APP_VIEW_CAMPAIGN_MANAGER);
    // State to manage the current view/step - Start with campaign creation
    const [currentView, setCurrentView] = useState(VIEW_CREATE_CAMPAIGN); // Updated initial view
    // State to hold the data for the ad being created (including customizations)
    const [adData, setAdData] = useState(null);
    // State to hold the selected campaign settings { campaign: { name }, audience: { type, locations, retailer } }
    const [campaignSettings, setCampaignSettings] = useState(null); // Updated state name
    const [selectedCampaign, setSelectedCampaign] = useState(null);

    // --- Event Handlers ---

    // Handler for when campaign/audience is created (receives object)
    const handleCampaignCreated = (settings) => { // Renamed handler
        setCampaignSettings(settings); // Store the campaign settings object
        setAdData(null); // Reset ad data
        setCurrentView(VIEW_START); // Move to the next step (Upload/URL choice)
    };

    const handleSelectUpload = () => {
        setCurrentView(VIEW_UPLOAD);
    };

    const handleSelectUrl = () => {
        setCurrentView(VIEW_URL);
    };

    // Stores the initial data (image/product info)
    const handleInitialDataReceived = (initialData) => {
        console.log("Initial Data Received:", initialData);
        setAdData({
            ...initialData,
            campaignName: campaignSettings?.campaign?.name || 'Unnamed Campaign',
            audience: campaignSettings?.audience || {
                type: DEFAULT_AUDIENCE_TYPE,
                dietOverlay: [],
                specificRetailers: [],
                specificRegions: []
            }
        });
        setCurrentView(VIEW_CUSTOMIZE); // Move to customization view
    };

    // Stores the fully customized data before going to publish
    const handleGoToPublish = (customizedData) => {
        // Campaign/Audience info should already be in customizedData from AdCustomization step
        console.log("Final Data for Publish:", customizedData);
        setAdData(customizedData); // Update adData with customizations
        setCurrentView(VIEW_PUBLISH);
    }

    const handleBackToCustomize = () => {
        // adData already holds the customized data, just switch view
        setCurrentView(VIEW_CUSTOMIZE);
    }

    // Start Over should go back to Create Campaign now
    const handleStartOver = () => {
        setAdData(null);
        setCampaignSettings(null); // Reset campaign settings
        setCurrentView(VIEW_CREATE_CAMPAIGN); // Go back to first step
    }

    // Function to switch to Campaign Builder
    const handleCreateNewCampaign = () => {
        setAppView(APP_VIEW_CAMPAIGN_BUILDER);
        setCurrentView(VIEW_CREATE_CAMPAIGN);
        setAdData(null);
        setCampaignSettings(null);
    }

    // Function to return to Campaign Manager
    const handleReturnToManager = () => {
        setAppView(APP_VIEW_CAMPAIGN_MANAGER);
    };

    const handleCampaignClick = (campaign) => {
        setSelectedCampaign(campaign);
        setAppView(APP_VIEW_CAMPAIGN_DETAILS);
    };

    const handleBackToCampaigns = () => {
        setSelectedCampaign(null);
        setAppView(APP_VIEW_CAMPAIGN_MANAGER);
    };

    const handleSaveAndExit = async (settings) => {
        try {
            // Create a campaign with minimal data
            const result = await Promise.resolve(dbOperations.saveAd({
                campaignName: settings.campaign.name,
                audience: settings.audience,
                // Add minimal required fields
                ctaType: CTA_TYPE_TEXT,
                adSize: DEFAULT_AD_SIZE
            }));
            
            if (result.success) {
                // Return to campaign manager
                setAppView(APP_VIEW_CAMPAIGN_MANAGER);
            } else {
                // Handle error (you might want to show an error message)
                console.error('Failed to save campaign');
            }
        } catch (error) {
            console.error('Error saving campaign:', error);
        }
    };

    // Function to preview creative (navigate to publish screen)
    const handlePreviewCreative = (campaign) => {
        // Set the ad data from the campaign
        setAdData(campaign.adData);
        // Switch to campaign builder view
        setAppView(APP_VIEW_CAMPAIGN_BUILDER);
        // Go directly to publish screen
        setCurrentView(VIEW_PUBLISH);
    };

    // --- Render Logic ---

    // Function to render the current view based on state
    const renderCurrentView = () => {
        switch (currentView) {
            case VIEW_CREATE_CAMPAIGN:
                return <CreateCampaignScreen 
                    onCampaignCreated={handleCampaignCreated}
                    onSaveAndExit={handleSaveAndExit}
                />;
            case VIEW_START:
                return <StartScreen
                    onSelectUpload={handleSelectUpload}
                    onSelectUrl={handleSelectUrl}
                    campaignSettings={campaignSettings}
                />;
            case VIEW_UPLOAD:
                return <AssetUpload
                            onAssetsUploaded={handleInitialDataReceived}
                            campaignSettings={campaignSettings} // Pass campaign settings object
                        />;
            case VIEW_URL:
                return <UrlInput
                            onUrlSubmitted={handleInitialDataReceived}
                            campaignSettings={campaignSettings} // Pass campaign settings object
                            onSelectUpload={handleSelectUpload} // Add this prop
                        />;
            case VIEW_CUSTOMIZE:
                // Pass initial adData and campaign settings
                return <AdCustomization
                            adData={adData}
                            campaignSettings={campaignSettings} // Pass campaign settings object
                            onPublish={handleGoToPublish}
                        />;
            case VIEW_PUBLISH:
                // Pass the fully customized adData and the back handler
                return <PublishScreen adData={adData} onBack={handleBackToCustomize} />;
            default: // Default to the new starting view
                return <CreateCampaignScreen onCampaignCreated={handleCampaignCreated} />;
        }
    };

    return (
        <AppContext.Provider value={{ appView, setAppView }}>
            <div className="min-h-screen bg-gray-50 flex">
                {/* Left Navigation */}
                <LeftNav onNavigate={(view) => {
                    setAppView(view);
                    if (view === APP_VIEW_CAMPAIGN_BUILDER) {
                        setCurrentView(VIEW_CREATE_CAMPAIGN);
                        setAdData(null);
                        setCampaignSettings(null);
                    }
                }} />

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    <div className="h-16 bg-white border-b border-gray-200 flex items-center px-8">
                        <h2 className="text-xl font-semibold text-[#0B2265]">
                            {appView === APP_VIEW_CAMPAIGN_MANAGER ? 'Campaign Manager' : 
                            appView === APP_VIEW_CAMPAIGN_DETAILS ? `${selectedCampaign?.name || 'Campaign Details'}` :
                            appView === APP_VIEW_AD_PLATFORMS ? 'Ad Platform Integrations' :
                            'Campaign Builder'}
                        </h2>
                    </div>

                    <main className="flex-1 overflow-y-auto p-8">
                        {appView === APP_VIEW_CAMPAIGN_MANAGER ? (
                            <CampaignManagerView 
                                onCreateNew={handleCreateNewCampaign}
                                onCampaignClick={handleCampaignClick}
                            />
                        ) : appView === APP_VIEW_CAMPAIGN_DETAILS ? (
                            <CampaignDetailsView 
                                campaign={selectedCampaign}
                                onBack={handleBackToCampaigns}
                                onPreviewCreative={handlePreviewCreative}
                            />
                        ) : appView === APP_VIEW_AD_PLATFORMS ? (
                            <AdPlatformsView />
                        ) : (
                            <div className="max-w-7xl mx-auto">
                                {currentView !== VIEW_CREATE_CAMPAIGN && (
                                    <div className="mb-6">
                                        <Button variant="light" onClick={handleReturnToManager}>
                                            ← Back to Campaign Manager
                                        </Button>
                                    </div>
                                )}
                                <StepNavigation currentView={currentView} />
                                <div className="mt-6">
                                    {renderCurrentView()}
                                </div>
                                {currentView !== VIEW_CREATE_CAMPAIGN && (
                                    <div className="text-center mt-8">
                                        <Button onClick={handleStartOver} variant="danger">Start Over</Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </AppContext.Provider>
    );
}

export default App; // Export the main App component
