import React, { useState, useEffect, useContext, createContext, useMemo } from 'react';
import spinsLogo from './assets/spins-logo.jpg';
import CanvasEditor from './components/canvas/CanvasEditor.jsx';
import ResponsiveCanvas from './components/ResponsiveCanvas.jsx';
import { loadSampleData } from './sample-data.js';
import BackgroundCustomizer from './components/BackgroundCustomizer.jsx';

// Feature flags and new flow imports
import { isFeatureEnabled, FEATURES } from './config/features.js';
import CampaignFlowV2 from './flows/v2/CampaignFlowV2.jsx';

// Database integration
import { databaseAdapter } from './services/databaseAdapter.js';
import DatabaseMigrationUI from './components/DatabaseMigrationUI.jsx';
import { debugCampaigns } from './services/debug-campaigns.js';

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
const VIEW_PRODUCT_IMAGES = 'product_images';
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
    { label: 'Stories and Reels (1080x1920)', value: '1080x1920' },
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

// Product categories
const PRODUCT_CATEGORIES = [
    { label: 'Dairy & Alternatives', value: 'dairy_alternatives' },
    { label: 'Beverages', value: 'beverages' },
    { label: 'Snacks', value: 'snacks' },
    { label: 'Pantry Staples', value: 'pantry_staples' },
    { label: 'Fresh Produce', value: 'fresh_produce' },
    { label: 'Frozen Foods', value: 'frozen_foods' },
    { label: 'Health & Wellness', value: 'health_wellness' }
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
const APP_VIEW_PRODUCT_MANAGER = 'product_manager';
const APP_VIEW_PRODUCT_DETAILS = 'product_details';
const APP_VIEW_PRODUCT_FORM = 'product_form';
const APP_VIEW_CAMPAIGN_MANAGER = 'campaign_manager';
const APP_VIEW_CAMPAIGN_BUILDER = 'campaign_builder';
const APP_VIEW_CAMPAIGN_FLOW_V2 = 'campaign_flow_v2'; // New V2 flow
const APP_VIEW_CAMPAIGN_DETAILS = 'campaign_details';
const APP_VIEW_AD_PLATFORMS = 'ad_platforms';
const APP_VIEW_INSIGHTS = 'insights';
const APP_VIEW_SHOPPABLE_LANDING_PAGES = 'shoppable_landing_pages';
const APP_VIEW_SHOPPABLE_LINKS = 'shoppable_links';
const APP_VIEW_SHOPPABLE_RECIPES = 'shoppable_recipes';
const APP_VIEW_QR_CODES = 'qr_codes';
const APP_VIEW_LOCATORS = 'locators';
const APP_VIEW_ACCOUNT = 'account';

// --- Helper Components ---

/**
 * Header Component
 * Displays the application title and potentially navigation/user info.
 */
function Header() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    
    // Check dark mode status on component mount
    useEffect(() => {
        const htmlElement = document.documentElement;
        setIsDarkMode(htmlElement.classList.contains('dark'));
    }, []);
    
    const toggleDarkMode = () => {
        const htmlElement = document.documentElement;
        htmlElement.classList.toggle('dark');
        const newDarkMode = htmlElement.classList.contains('dark');
        setIsDarkMode(newDarkMode);
        localStorage.setItem('darkMode', newDarkMode ? 'dark' : 'light');
    };

    return (
        <header className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
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
                    <button
                        type="button"
                        className="p-2 rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                        onClick={toggleDarkMode}
                        title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                    >
                        {isDarkMode ? (
                            // Sun icon for light mode
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        ) : (
                            // Moon icon for dark mode
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        )}
                    </button>
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
        <nav aria-label="Progress" className="bg-white shadow-sm rounded-lg mb-6 lg:mb-8 p-4 dark:bg-gray-800">
            {/* Browser back button indicator */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>You can use your browser's back button to navigate between steps</span>
                </div>
            </div>
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
                                        isCompleted || isCurrent ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-200 dark:bg-gray-600'
                                    }`}
                                    aria-hidden="true"
                                />
                            )}
                            {/* Step Content: Circle + Text, relative to allow line underneath */}
                            <div className="relative flex flex-col items-center text-center group">
                                {/* Circle/Icon */}
                                <span
                                    className={`z-10 flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full ${ // z-10 to be above line
                                        isCompleted ? 'bg-blue-600 group-hover:bg-blue-800 dark:bg-blue-500 dark:group-hover:bg-blue-400' :
                                        isCurrent ? 'border-2 border-blue-600 bg-white dark:border-blue-500 dark:bg-gray-800' :
                                        'border-2 border-gray-300 bg-white group-hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:group-hover:border-gray-500'
                                    }`}
                                >
                                    {isCompleted ? (
                                        <svg className="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    ) : isCurrent ? (
                                        <span className="text-blue-600 font-semibold dark:text-blue-400">{step.id}</span>
                                    ) : (
                                        <span className="text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200">{step.id}</span>
                                    )}
                                </span>
                                {/* Step Name Text */}
                                <span className={`mt-1 text-xs md:text-sm font-medium ${ // Added margin-top
                                    isCompleted ? 'text-gray-900 dark:text-gray-100' :
                                    isCurrent ? 'text-blue-600 dark:text-blue-400' :
                                    'text-gray-500 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-gray-100'
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
        secondary: "bg-gray-100 hover:bg-gray-200 text-gray-800 focus:ring-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-100 dark:focus:ring-gray-500",
        success: "bg-green-600 hover:bg-green-700 text-white focus:ring-green-400",
        danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-400",
        light: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 focus:ring-blue-400 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 dark:border-gray-600 dark:focus:ring-blue-500"
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
        <div className={`bg-white shadow-sm rounded-lg p-6 ${className} dark:bg-gray-800`}>
            {title && <h2 className="text-xl font-semibold mb-4 text-[#0B2265] dark:text-gray-200">{title}</h2>}
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
    const disabledStyle = disabled ? "bg-gray-100 cursor-not-allowed dark:bg-gray-700" : "";

    return (
        <div className={`${disabled ? "opacity-50" : ""} ${className}`}> {/* Dim container when disabled */}
            {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">{label}</label>}
            <InputElement
                id={id}
                {...typeProp}
                value={value}
                onChange={onChange}
                onKeyDown={onKeyDown} // Added onKeyDown prop
                placeholder={placeholder}
                disabled={disabled}
                className={`w-full p-2 border ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-400' : 'focus:ring-blue-400 dark:focus:ring-blue-500'} ${type === 'textarea' ? 'min-h-[60px]' : ''} ${disabledStyle} bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400`}
            />
            {error && <p className="text-red-500 text-xs mt-1 dark:text-red-400">{error}</p>}
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
            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">{label}</label>
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
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-500 dark:checked:bg-blue-500"
                        />
                        <label htmlFor={`${name}-${option.value}`} className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
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
function SelectDropdown({ id, label, value, onChange, options, disabled = false, error = '' }) {
     const disabledStyle = disabled ? "bg-gray-100 cursor-not-allowed dark:bg-gray-700" : "";
     const errorStyle = error ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-blue-400";
     return (
        <div className={disabled ? "opacity-50" : ""}>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">{label}</label>
            <select
                id={id}
                name={id}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 ${errorStyle} ${disabledStyle} bg-white text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:focus:ring-blue-500`}
            >
                {options.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
     );
}


// --- Ad Preview Component ---

/**
 * AdPreviewContent Component
 * Renders the ad preview based on selected size and data.
 * Includes click-to-expand interaction for Where-to-Buy overlay.
 */
// Canvas Preview Component - Shows the edited canvas as a static preview
function CanvasPreview({ canvasData, adSize }) {
    if (!canvasData || !canvasData.elements) {
        return <div className="text-red-500">No canvas data available</div>;
    }

    // Parse ad size for dimensions
    const parseSize = (sizeString) => {
        const [width, height] = sizeString.split('x').map(Number);
        return { width, height };
    };

    const { width, height } = parseSize(adSize);
    const elements = canvasData.elements || [];

    // Scale for preview display
    const maxPreviewWidth = 300;
    const scale = Math.min(maxPreviewWidth / width, 1);
    const previewWidth = width * scale;
    const previewHeight = height * scale;

    console.log('🎨 Rendering canvas preview:', {
        adSize,
        dimensions: { width, height },
        scale,
        elementsCount: elements.length,
        backgroundImage: canvasData.meta?.backgroundImage
    });

    return (
        <div className="flex justify-center">
            <div 
                className="relative border border-gray-300 bg-white shadow-lg"
                style={{
                    width: `${width}px`,
                    height: `${height}px`,
                    transform: `scale(${scale})`,
                    transformOrigin: 'center center'
                }}
            >
            {/* Background */}
            {canvasData.meta?.backgroundImage && (
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: `url(${canvasData.meta.backgroundImage})`
                    }}
                />
            )}

            {/* Render all elements */}
            {elements
                .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
                .map((element, index) => {
                    const elementStyle = {
                        position: 'absolute',
                        left: `${element.position?.x || 0}px`,
                        top: `${element.position?.y || 0}px`,
                        width: `${element.size?.width || 100}px`,
                        height: `${element.size?.height || 50}px`,
                        zIndex: element.zIndex || 0,
                        ...element.styles
                    };

                    if (element.type === 'text') {
                        return (
                            <div
                                key={element.id || `text-${index}`}
                                style={elementStyle}
                                className="flex items-center justify-center text-center pointer-events-none"
                            >
                                {String(element.content || '')}
                            </div>
                        );
                    }

                    if (element.type === 'button') {
                        return (
                            <div
                                key={element.id || `button-${index}`}
                                style={elementStyle}
                                className="flex items-center justify-center bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700 transition-colors pointer-events-none"
                            >
                                {String(element.content || 'Button')}
                            </div>
                        );
                    }

                    if (element.type === 'image' || element.type === 'product') {
                        const imgSrc = element.content || element.src;
                        return (
                            <div
                                key={element.id || `image-${index}`}
                                style={elementStyle}
                                className="overflow-hidden pointer-events-none"
                            >
                                {imgSrc ? (
                                    <img
                                        src={imgSrc}
                                        alt="Element"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                                        Image
                                    </div>
                                )}
                            </div>
                        );
                    }

                    // Default element rendering
                    return (
                        <div
                            key={element.id || `element-${index}`}
                            style={elementStyle}
                            className="bg-gray-200 border border-gray-300 flex items-center justify-center text-xs text-gray-600 pointer-events-none"
                        >
                            {String(element.type || 'Element')}
                        </div>
                                         );
                 })}
            </div>
        </div>
    );
}

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
            {/* 2. Description - Limited to 2 lines */}
            <p className="text-xs text-gray-600 mb-2 text-center leading-snug line-clamp-2">{description || "Description"}</p>
            {/* 3. Image - Better sized and contained */}
            <div className="flex items-center justify-center w-full mb-2 overflow-hidden h-28 px-4">
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
            <div className="w-full mt-auto pt-2 px-0 flex justify-center"> {/* Removed relative, added flex justify-center */}
                {ctaType === CTA_TYPE_TEXT && (
                    <div className="overflow-hidden">
                        <Button 
                            variant="primary" 
                            size="small" 
                            className="truncate !ring-offset-0 !focus:ring-offset-0 px-6 py-2" 
                            style={{ 
                                maxWidth: '80%', 
                                boxSizing: 'border-box',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis'
                            }} 
                            onClick={() => clickUrl && window.open(clickUrl, '_blank')} 
                            title={`Clicks go to: ${clickUrl || 'Not set'}`}
                        >
                        {ctaText || 'Call To Action'}
                    </Button>
                    </div>
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

    // Specific layout for Mobile Rectangle (320x400)
    if (adSize === '320x400') {
        layout = (
            <>
                {/* Header with text */}
                <div className="mb-3">
                    <h3 className="text-lg font-bold mb-1 text-gray-900 text-center leading-tight">{headline || "Ad Headline"}</h3>
                    <div 
                        className="text-sm text-gray-800 text-center leading-normal px-2"
                        style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}
                    >
                        {description || "Description"}
                    </div>
                </div>
                
                {/* Image - better sized */}
                <div className="flex items-center justify-center w-full mb-3 overflow-hidden px-4 h-48">
                    {imageSrc ? (
                        <img
                            src={imageSrc}
                            alt="Ad Preview"
                            className="max-w-full max-h-full object-contain rounded"
                            onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/320x400/f87171/ffffff?text=Image+Load+Error'; }}
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center text-gray-400 text-sm p-2">
                            Image Area
                        </div>
                    )}
                </div>
                
                {/* CTA at bottom */}
                <div className="w-full mt-auto px-0 flex justify-center">
                    {ctaType === CTA_TYPE_TEXT && (
                        <div className="overflow-hidden">
                            <Button 
                                variant="primary" 
                                size="small" 
                                className="truncate !ring-offset-0 !focus:ring-offset-0 px-6 py-2" 
                                style={{ 
                                    maxWidth: '80%', 
                                    boxSizing: 'border-box',
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis'
                                }} 
                                onClick={() => clickUrl && window.open(clickUrl, '_blank')} 
                                title={`Clicks go to: ${clickUrl || 'Not set'}`}
                            >
                            {ctaText || 'Call To Action'}
                        </Button>
                        </div>
                    )}
                    {ctaType === CTA_TYPE_WHERE_TO_BUY && (
                        <div>
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
                            {isWtbExpanded && (
                                <div className="absolute inset-0 flex items-center justify-center z-20">
                                    <div className="border border-gray-300 bg-white shadow-md rounded-lg p-2 w-[280px]">
                                        <button
                                            onClick={() => setIsWtbExpanded(false)}
                                            className="absolute top-1 right-1 text-gray-400 hover:text-gray-600 z-30 p-1 bg-white rounded-full hover:bg-gray-100"
                                            aria-label="Close where to buy"
                                        >
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                                        </button>
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
                                        <div className="max-h-[200px] overflow-y-auto pr-1">
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
                                                            id="store-search-mobile"
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
    }
    // Specific layout for Stories and Reels (1080x1920)
    else if (adSize === '1080x1920') {
        layout = (
            <div className="h-full flex flex-col">
                {/* Header with text */}
                <div className="mb-3 px-3 pt-3">
                    <h3 className="text-lg font-bold mb-1 text-gray-900 text-center leading-tight">{headline || "Stories Headline"}</h3>
                    {description && (
                        <div 
                            className="text-sm text-gray-800 text-center leading-normal"
                            style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}
                        >
                            {description}
                        </div>
                    )}
                </div>
                
                {/* Image - takes most space for stories */}
                <div className="flex-grow flex items-center justify-center w-full overflow-hidden px-3">
                    {imageSrc ? (
                        <img
                            src={imageSrc}
                            alt="Ad Preview"
                            className="max-w-full max-h-full object-contain rounded"
                            onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/1080x1600/f87171/ffffff?text=Image+Load+Error'; }}
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs p-2">
                            Stories & Reels Image Area
                        </div>
                    )}
                </div>
                
                {/* CTA at bottom */}
                <div className="w-full px-3 pb-3 flex justify-center">
                    <div className="overflow-hidden">
                        {ctaType === CTA_TYPE_TEXT && (
                            <Button 
                                variant="primary" 
                                className="text-xs py-2 px-6 truncate overflow-hidden" 
                                style={{ 
                                    maxWidth: '80%', 
                                    boxSizing: 'border-box',
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis'
                                }}
                                onClick={() => clickUrl && window.open(clickUrl, '_blank')} 
                                title={`Clicks go to: ${clickUrl || 'Not set'}`}
                            >
                                {ctaText || 'Swipe Up'}
                            </Button>
                        )}
                        {ctaType === CTA_TYPE_WHERE_TO_BUY && (
                            <div className="flex space-x-2 justify-center">
                                <Button variant="light" className="text-xs py-2 px-4 truncate" onClick={() => handleOpenWtb('online')}>
                                    Buy Online
                                </Button>
                                <Button variant="light" className="text-xs py-2 px-4 truncate" onClick={() => handleOpenWtb('instore')}>
                                    Find Store
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Where to Buy expanded view for Stories format */}
                {isWtbExpanded && (
                    <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-20">
                        <div className="bg-white rounded-lg p-6 w-[90%] max-w-md">
                            {/* Close Button */}
                            <button
                                onClick={() => setIsWtbExpanded(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-30 p-2 bg-white rounded-full hover:bg-gray-100"
                                aria-label="Close where to buy"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                                </svg>
                            </button>

                            {/* Tabs */}
                            <div className="flex border-b mb-4">
                                <button
                                    className={`flex-1 py-3 text-base font-medium ${wtbTab === 'online' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                    onClick={() => setWtbTab('online')}
                                >
                                    Buy Online
                                </button>
                                <button
                                    className={`flex-1 py-3 text-base font-medium ${wtbTab === 'instore' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                    onClick={() => setWtbTab('instore')}
                                >
                                    Find a Store
                                </button>
                            </div>

                            {/* Content */}
                            <div className="max-h-[300px] overflow-y-auto">
                                {wtbTab === 'online' && (
                                    <div className="space-y-3">
                                        {ONLINE_RETAILERS.map(retailer => (
                                            <div key={retailer.name} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded">
                                                <img src={retailer.logo} alt={retailer.name} className="h-8 object-contain" />
                                                <Button variant="secondary" className="text-sm px-4 py-2">
                                                    Add to Cart
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {wtbTab === 'instore' && (
                                    <div>
                                        <div className="flex space-x-2 mb-4">
                                            <InputField
                                                id="store-search-stories"
                                                type="text"
                                                value={storeSearchQuery}
                                                onChange={(e) => setStoreSearchQuery(e.target.value)}
                                                placeholder="City, State or Zip"
                                                className="flex-grow"
                                            />
                                            <Button variant="primary" className="px-4 py-2">
                                                GO
                                            </Button>
                                        </div>
                                        <div className="space-y-3">
                                            {NEARBY_STORES.slice(0, 3).map((store, index) => (
                                                <div key={index} className="p-3 border rounded bg-gray-50 hover:bg-gray-100">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-3">
                                                            <img src={store.logo} alt={store.name} className="h-8 w-10 object-contain" />
                                                            <div>
                                                                <p className="font-semibold">{store.name}</p>
                                                                <p className="text-sm text-gray-600 truncate">{store.address}</p>
                                                                <p className="text-sm text-gray-500">{store.distance} • {store.productCount} products</p>
                                                            </div>
                                                        </div>
                                                        <span className="text-blue-600 text-xl">&gt;</span>
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
        );
    }
    // Specific layout for 320x50
    else if (adSize === '320x50') {
         // Simplified: No expansion for 320x50, just show basic buttons
         layout = (
             <div className="flex items-center justify-between w-full h-full space-x-2">
                 {/* Left: Text */}
                 <div className="flex-shrink flex flex-col text-left overflow-hidden max-w-[45%]">
                      <h3 className="text-xs font-bold text-gray-800 leading-tight truncate">{headline || "Headline"}</h3>
                      <p className="text-[10px] text-gray-600 leading-snug truncate">{description || "Description"}</p>
                 </div>

                 {/* Middle: CTA */}
                  <div className="flex-shrink-0 overflow-hidden">
                      {ctaType === CTA_TYPE_TEXT && (
                         <Button 
                            variant="primary" 
                            size="small" 
                            className="truncate overflow-hidden" 
                            style={{ 
                                maxWidth: '100%', 
                                boxSizing: 'border-box',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis'
                            }}
                            onClick={() => clickUrl && window.open(clickUrl, '_blank')} 
                            title={`Clicks go to: ${clickUrl || 'Not set'}`}
                         >
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
                             className="w-full h-full object-cover rounded-sm"
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
    
    // Get current dimensions for preview styling with scaling for large formats
    const getPreviewDimensions = (sizeString) => {
        const originalDimensions = parseSize(sizeString);
        
        // Scale down Stories and Reels format for preview
        if (sizeString === '1080x1920') {
            const scale = 0.25; // Scale to 25% of original size
            return {
                width: Math.round(originalDimensions.width * scale),
                height: Math.round(originalDimensions.height * scale)
            };
        }
        
        // Return original dimensions for other formats
        return originalDimensions;
    };
    
    const currentDimensions = getPreviewDimensions(adSize);

    return (
         <div
            className={`relative bg-white shadow-lg rounded-lg border border-gray-300 overflow-hidden flex transition-all duration-300 ease-in-out ${adSize === '320x50' ? 'p-1' : adSize === '1080x1920' ? 'p-2' : 'p-3 flex-col items-center'}`} // Add relative positioning here
            // Apply dynamic width and height using inline styles
            style={{
                width: `${currentDimensions.width}px`,
                height: `${currentDimensions.height}px`,
                boxSizing: 'border-box',
                maxWidth: `${currentDimensions.width}px`,
                maxHeight: `${currentDimensions.height}px`,
                minWidth: `${currentDimensions.width}px`,
                minHeight: `${currentDimensions.height}px`
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

function generateNextCampaignName(dbOperations = null) {
    if (!dbOperations) {
        // Simple fallback when dbOperations is not available
        return `Campaign${Date.now().toString().slice(-4)}`;
    }
    const campaigns = dbOperations.getCampaigns();
    const existingNames = campaigns.map(c => c.name);
    const nextNumber = getNextAvailableNumber('Campaign', existingNames);
    return `Campaign${nextNumber}`;
}

function generateNextCreativeName(campaignName = 'Campaign', dbOperations = null) {
    if (!dbOperations) {
        // Simple fallback when dbOperations is not available
        return `Creative${Date.now().toString().slice(-4)}`;
    }
    const campaigns = dbOperations.getCampaigns();
    const campaign = campaigns.find(c => c.name === campaignName);
    let existingCreatives = [];
    
    if (campaign && campaign.adData && campaign.adData.creativeName) {
        existingCreatives = [campaign.adData.creativeName];
    }
    
    const nextNumber = getNextAvailableNumber('Creative', existingCreatives);
    return `Creative${nextNumber}`;
}

// Utility function to construct UTM tracking URLs
function constructTrackingUrl(baseUrl, utmParams) {
    if (!baseUrl || !utmParams) return baseUrl;
    
    try {
        const url = new URL(baseUrl);
        const params = new URLSearchParams(url.search);
        
        // Add UTM parameters if they exist
        if (utmParams.utmSource) params.set('utm_source', utmParams.utmSource);
        if (utmParams.utmMedium) params.set('utm_medium', utmParams.utmMedium);
        if (utmParams.utmCampaign) params.set('utm_campaign', utmParams.utmCampaign);
        if (utmParams.utmContent) params.set('utm_content', utmParams.utmContent);
        if (utmParams.utmTerm) params.set('utm_term', utmParams.utmTerm);
        
        url.search = params.toString();
        return url.toString();
    } catch (error) {
        console.error('Error constructing tracking URL:', error);
        return baseUrl;
    }
}

/**
 * ProductCard Component
 */
function ProductCard({ product, onView, onEdit, dbOperations }) {
    const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
    const campaignCount = dbOperations ? dbOperations.getCampaigns().filter(c => c.productId === product.id).length : 0;

    return (
        <div className="bg-white rounded-lg shadow dark:bg-gray-800 overflow-hidden">
            <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700">
                {primaryImage ? (
                    <img
                        src={primaryImage.url}
                        alt={primaryImage.altText || product.name}
                        className="w-full h-48 object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-48">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
            </div>
            
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {product.name}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        product.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        product.status === 'Draft' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                    }`}>
                        {product.status}
                    </span>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{product.brand}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mb-2 line-clamp-2">{product.description}</p>
                
                {product.productUrl && (
                    <div className="flex items-center text-xs text-blue-600 dark:text-blue-400 mb-3">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <span className="truncate">Product page linked</span>
                    </div>
                )}
                
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {campaignCount} campaign{campaignCount !== 1 ? 's' : ''}
                    </span>
                    <div className="flex space-x-2">
                        <Button variant="light" size="small" onClick={onEdit}>
                            Edit
                        </Button>
                        <Button variant="primary" size="small" onClick={onView}>
                            View
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * CreateCampaignScreen Component - Enhanced for Phase 3
 */
function CreateCampaignScreen({ onCampaignCreated, onSaveAndExit, selectedProduct = null, dbOperations }) {
    // Load available products
    const [products] = useState(() => dbOperations.getProducts());
    const [productId, setProductId] = useState(selectedProduct?.id || '');
    
    // Generate campaign name based on selected product or default
    const [campaignName, setCampaignName] = useState(() => {
        if (selectedProduct) {
            const campaigns = dbOperations.getCampaigns();
            const productCampaigns = campaigns.filter(c => c.productId === selectedProduct.id);
            const nextNumber = getNextAvailableNumber('Campaign', productCampaigns.map(c => c.name));
            return `${selectedProduct.name} Campaign ${nextNumber}`;
        }
        return generateNextCampaignName(dbOperations);
    });
    
    const [campaignNameError, setCampaignNameError] = useState('');
    const [productError, setProductError] = useState('');
    
    // Use product defaults if product is selected
    const selectedProductData = products.find(p => p.id === productId) || selectedProduct;
    const [audienceSegment, setAudienceSegment] = useState(
        selectedProductData?.settings?.defaultAudience || DEFAULT_AUDIENCE_TYPE
    );
    const [showDietOverlay, setShowDietOverlay] = useState(false);
    const [selectedDietTypes, setSelectedDietTypes] = useState([]);
    const [showSpecificRetailers, setShowSpecificRetailers] = useState(
        selectedProductData?.settings?.defaultRetailers?.length > 0
    );
    const [selectedRetailers, setSelectedRetailers] = useState(
        selectedProductData?.settings?.defaultRetailers || []
    );
    const [showSpecificRegions, setShowSpecificRegions] = useState(
        selectedProductData?.settings?.defaultRegions?.length > 0
    );
    const [selectedRegions, setSelectedRegions] = useState(
        selectedProductData?.settings?.defaultRegions || []
    );

    // Get Shoppable Link functionality - NEW
    const [showShoppableLink, setShowShoppableLink] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

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

    // Handle product selection change
    const handleProductChange = (newProductId) => {
        setProductId(newProductId);
        setProductError(''); // Clear product error when product changes
        
        if (newProductId) {
            const product = products.find(p => p.id === newProductId);
            if (product) {
                // Update campaign name based on selected product
                const campaigns = dbOperations.getCampaigns();
                const productCampaigns = campaigns.filter(c => c.productId === product.id);
                const nextNumber = getNextAvailableNumber('Campaign', productCampaigns.map(c => c.name));
                setCampaignName(`${product.name} Campaign ${nextNumber}`);
                
                // Apply product defaults
                setAudienceSegment(product.settings?.defaultAudience || DEFAULT_AUDIENCE_TYPE);
                setShowSpecificRetailers(product.settings?.defaultRetailers?.length > 0);
                setSelectedRetailers(product.settings?.defaultRetailers || []);
                setShowSpecificRegions(product.settings?.defaultRegions?.length > 0);
                setSelectedRegions(product.settings?.defaultRegions || []);
            }
        } else {
            // Reset to defaults when no product selected
            setCampaignName(generateNextCampaignName(dbOperations));
            setAudienceSegment(DEFAULT_AUDIENCE_TYPE);
            setShowSpecificRetailers(false);
            setSelectedRetailers([]);
            setShowSpecificRegions(false);
            setSelectedRegions([]);
        }
    };

    const handleContinue = () => {
        const trimmedCampaignName = campaignName.trim();
        if (!trimmedCampaignName) {
            setCampaignNameError('Campaign Name is required.');
            return;
        }
        if (!productId && products.length > 0) {
            setProductError('Please select a product for this campaign.');
            return;
        }
        setCampaignNameError('');
        setProductError('');

        const campaignSettings = {
            campaign: {
                name: trimmedCampaignName,
                productId: productId || null // Include product ID
            },
            audience: {
                type: audienceSegment,
                dietOverlay: showDietOverlay ? selectedDietTypes : [],
                specificRetailers: showSpecificRetailers ? selectedRetailers : [],
                specificRegions: showSpecificRegions ? selectedRegions : []
            },
            product: selectedProductData // Include product data for UTM defaults
        };
        onCampaignCreated(campaignSettings);
    };

    const handleSaveAndExit = () => {
        const trimmedCampaignName = campaignName.trim();
        if (!trimmedCampaignName) {
            setCampaignNameError('Campaign Name is required.');
            return;
        }
        if (!productId && products.length > 0) {
            setProductError('Please select a product for this campaign.');
            return;
        }
        setCampaignNameError('');
        setProductError('');

        const campaignSettings = {
            campaign: {
                name: trimmedCampaignName,
                productId: productId || null
            },
            audience: {
                type: audienceSegment,
                dietOverlay: showDietOverlay ? selectedDietTypes : [],
                specificRetailers: showSpecificRetailers ? selectedRetailers : [],
                specificRegions: showSpecificRegions ? selectedRegions : []
            },
            product: selectedProductData
        };
        onSaveAndExit(campaignSettings);
    };

    // Handle Get Shoppable Link - NEW
    const handleGetShoppableLink = async () => {
        if (!selectedProductData?.productUrl) return;

        // Generate UTM data from current campaign settings
        const utmData = {
            utmSource: selectedProductData.utmCodes?.source || 'campaign',
            utmMedium: selectedProductData.utmCodes?.medium || 'digital',
            utmCampaign: campaignName.toLowerCase().replace(/\s+/g, '_') || 'campaign',
            utmContent: selectedProductData.utmCodes?.content || audienceSegment,
            utmTerm: selectedProductData.utmCodes?.term || ''
        };

        const trackingUrl = constructTrackingUrl(selectedProductData.productUrl, utmData);
        
        // Copy to clipboard
        try {
            await navigator.clipboard.writeText(trackingUrl);
            setCopySuccess(true);
            setShowShoppableLink(true);
            
            // Reset copy success after 3 seconds
            setTimeout(() => setCopySuccess(false), 3000);
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
            setShowShoppableLink(true);
        }
    };

    return (
        <Card title="Step 1: Create Campaign" className="max-w-lg mx-auto">
            <p className="text-gray-600 mb-6 dark:text-gray-400">Define your campaign name and audience details.</p>

            {/* Product Selection - NEW */}
            {products.length > 0 && (
                <div className="mb-6">
                    <SelectDropdown
                        id="productSelection"
                        label="Select Product"
                        value={productId}
                        onChange={(e) => handleProductChange(e.target.value)}
                        options={[
                            { label: selectedProduct ? `${selectedProduct.name} (pre-selected)` : 'Choose a product...', value: '' },
                            ...products.map(p => ({ 
                                label: `${p.name} (${p.brand})`, 
                                value: p.id 
                            }))
                        ]}
                        disabled={!!selectedProduct} // Disable if product pre-selected
                        error={productError}
                    />
                    {selectedProduct && (
                        <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
                            Product: {selectedProduct.name} (pre-selected from product details)
                        </p>
                    )}
                    {selectedProductData && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                                Using product defaults:
                            </p>
                            <ul className="text-xs text-blue-600 dark:text-blue-400 mt-1 space-y-1">
                                <li>• Audience: {AUDIENCE_OPTIONS.find(opt => opt.value === audienceSegment)?.label}</li>
                                {selectedRetailers.length > 0 && (
                                    <li>• Retailers: {selectedRetailers.map(r => 
                                        SPECIFIC_RETAILER_OPTIONS.find(opt => opt.value === r)?.label
                                    ).join(', ')}</li>
                                )}
                                {selectedRegions.length > 0 && (
                                    <li>• Regions: {selectedRegions.map(r => 
                                        SPECIFIC_REGION_OPTIONS.find(opt => opt.value === r)?.label
                                    ).join(', ')}</li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>
            )}

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
            <div className="border-t pt-4 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 dark:text-gray-300">Choose Audience</h3>

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
                    <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Overlay Diet Type</label>
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
                            <label htmlFor="dietOverlayNo" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                            <label htmlFor="dietOverlayYes" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                                    <label htmlFor={`diet-${option.value}`} className="ml-3 block text-sm text-gray-700 dark:text-gray-300">
                                        {option.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Specific Retailer Radio Buttons */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Specific Retailers</label>
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
                            <label htmlFor="retailerOverlayNo" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                            <label htmlFor="retailerOverlayYes" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                                    <label htmlFor={`retailer-${option.value}`} className="ml-3 block text-sm text-gray-700 dark:text-gray-300">
                                        {option.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Specific Region Radio Buttons */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Specific Region</label>
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
                            <label htmlFor="regionOverlayNo" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                            <label htmlFor="regionOverlayYes" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                                    <label htmlFor={`region-${option.value}`} className="ml-3 block text-sm text-gray-700 dark:text-gray-300">
                                        {option.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Get Shoppable Link Section - NEW */}
            {selectedProductData?.productUrl && (
                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-semibold text-green-800 dark:text-green-300">
                                🛒 Ready to Generate Shoppable Link
                            </h4>
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                Get a trackable URL for immediate sharing
                            </p>
                        </div>
                        <Button 
                            onClick={handleGetShoppableLink}
                            variant="primary"
                            size="small"
                            className="bg-green-600 hover:bg-green-700 focus:ring-green-500"
                        >
                            Get Shoppable Link
                        </Button>
                    </div>
                </div>
            )}

            {/* Shoppable Link Modal - NEW */}
            {showShoppableLink && selectedProductData?.productUrl && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowShoppableLink(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                🛒 Your Shoppable Link
                            </h3>
                            <button 
                                onClick={() => setShowShoppableLink(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    Campaign: <strong>{campaignName}</strong>
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Product: <strong>{selectedProductData.name}</strong>
                                </p>
                            </div>
                            
                            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded border">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Generated Tracking URL:</p>
                                <code className="text-xs text-gray-800 dark:text-gray-200 break-all block">
                                    {(() => {
                                        const utmData = {
                                            utmSource: selectedProductData.utmCodes?.source || 'campaign',
                                            utmMedium: selectedProductData.utmCodes?.medium || 'digital',
                                            utmCampaign: campaignName.toLowerCase().replace(/\s+/g, '_') || 'campaign',
                                            utmContent: selectedProductData.utmCodes?.content || audienceSegment,
                                            utmTerm: selectedProductData.utmCodes?.term || ''
                                        };
                                        return constructTrackingUrl(selectedProductData.productUrl, utmData);
                                    })()}
                                </code>
                            </div>
                            
                            {copySuccess && (
                                <div className="flex items-center text-green-600 dark:text-green-400 text-sm">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Successfully copied to clipboard!
                                </div>
                            )}
                            
                            <div className="flex space-x-3">
                                <Button 
                                    onClick={handleGetShoppableLink}
                                    variant="primary"
                                    className="flex-1"
                                >
                                    📋 Copy Again
                                </Button>
                                <Button 
                                    onClick={() => setShowShoppableLink(false)}
                                    variant="secondary"
                                    className="flex-1"
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
function StartScreen({ onSelectUpload, onSelectUrl, onSelectProductImages, campaignSettings }) {
    // Extract info for display, handle null campaignSettings
    const campaignName = campaignSettings?.campaign?.name || 'N/A';
    const audienceTypeLabel = AUDIENCE_OPTIONS.find(opt => opt.value === campaignSettings?.audience?.type)?.label || campaignSettings?.audience?.type || 'N/A';
    
    // Check if product has images available
    const productImages = campaignSettings?.product?.images || [];
    const hasProductImages = productImages.length > 0;
    
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
            <div className={`flex flex-col ${hasProductImages ? 'sm:flex-row' : 'sm:flex-row'} justify-center space-y-4 sm:space-y-0 sm:space-x-4`}>
                <Button onClick={onSelectUpload} variant="primary" className="w-full sm:w-auto">
                    Upload Assets
                </Button>
                <Button onClick={onSelectUrl} variant="secondary" className="w-full sm:w-auto">
                    Use Product URL
                </Button>
                {hasProductImages && (
                    <Button onClick={onSelectProductImages} variant="secondary" className="w-full sm:w-auto">
                        📷 Use Product Images ({productImages.length})
                    </Button>
                )}
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
        // Use product UTM codes if available
        const product = campaignSettings?.product;
        const audienceType = campaignSettings?.audience?.type || 'general';
        
        let utmData = {
            utmSource: 'social_media',
            utmMedium: 'paid_social',
            utmCampaign: campaignSettings?.campaign?.name?.toLowerCase().replace(/\s+/g, '_') || 'general_campaign',
            utmContent: `${audienceType}_audience`,
            utmTerm: ''
        };
        
        // Override with product UTM codes if available
        if (product?.utmCodes) {
            utmData = {
                utmSource: product.utmCodes.source || utmData.utmSource,
                utmMedium: product.utmCodes.medium || utmData.utmMedium,
                utmCampaign: product.utmCodes.campaign || utmData.utmCampaign,
                utmContent: product.utmCodes.content || utmData.utmContent,
                utmTerm: product.utmCodes.term || utmData.utmTerm
            };
        }
        
        onAssetsUploaded({
            type: 'image',
            url: previewDataUrl,
            fileName: selectedFile.name,
            creativeName: creativeName.trim(),
            title: product?.name || 'Uploaded Product',
            description: product?.description || 'Product description will be customized in the next step.',
            productId: product?.id || null,
            utmData: utmData // Include UTM tracking data
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
 * ProductImageSelection Component
 * Step 3c: Select from saved product images.
 */
function ProductImageSelection({ onImageSelected, campaignSettings }) {
    const [selectedImageId, setSelectedImageId] = useState(null);
    const [creativeName, setCreativeName] = useState(() => 
        generateNextCreativeName(campaignSettings?.campaign?.name)
    );
    const [creativeNameError, setCreativeNameError] = useState('');

    // Extract info for display
    const campaignName = campaignSettings?.campaign?.name || 'N/A';
    const audienceTypeLabel = AUDIENCE_OPTIONS.find(opt => opt.value === campaignSettings?.audience?.type)?.label || campaignSettings?.audience?.type || 'N/A';
    const product = campaignSettings?.product;
    const productImages = product?.images || [];
    
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

    const handleImageSelect = (imageId) => {
        setSelectedImageId(imageId);
    };

    const handleContinue = () => {
        if (!creativeName.trim()) {
            setCreativeNameError('Creative Name is required.');
            return;
        }
        if (!selectedImageId) {
            alert('Please select an image first.');
            return;
        }

        const selectedImage = productImages.find(img => img.id === selectedImageId);
        if (!selectedImage) {
            alert('Selected image not found.');
            return;
        }

        // Use product UTM codes if available
        const audienceType = campaignSettings?.audience?.type || 'general';
        
        let utmData = {
            utmSource: 'social_media',
            utmMedium: 'paid_social',
            utmCampaign: campaignSettings?.campaign?.name?.toLowerCase().replace(/\s+/g, '_') || 'general_campaign',
            utmContent: `${audienceType}_audience`,
            utmTerm: ''
        };
        
        // Override with product UTM codes if available
        if (product?.utmCodes) {
            utmData = {
                utmSource: product.utmCodes.source || utmData.utmSource,
                utmMedium: product.utmCodes.medium || utmData.utmMedium,
                utmCampaign: product.utmCodes.campaign || utmData.utmCampaign,
                utmContent: product.utmCodes.content || utmData.utmContent,
                utmTerm: product.utmCodes.term || utmData.utmTerm
            };
        }

        onImageSelected({
            type: 'product_image',
            url: selectedImage.url,
            fileName: selectedImage.fileName || 'product-image',
            creativeName: creativeName.trim(),
            title: product?.name || 'Product Title',
            description: product?.description || 'Product description will be customized in the next step.',
            productId: product?.id || null,
            utmData: utmData,
            imageAltText: selectedImage.altText || '',
            isPrimaryImage: selectedImage.isPrimary || false
        });
    };

    return (
        <Card title="Step 3: Select Product Image" className="max-w-4xl mx-auto">
            <div className="text-gray-500 text-sm mb-4 border-b pb-4 text-left">
                <p className="font-medium text-gray-700 mb-2">Campaign Settings:</p>
                <p>Campaign Name: <span className="font-medium">{campaignName}</span></p>
                <p>SPINS Shopper Profile: <span className="font-medium">{audienceTypeLabel}</span></p>
                <p>Product: <span className="font-medium">{product?.name || 'N/A'}</span></p>
                
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

            <div className="space-y-4">
                {/* Creative Name Input */}
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

                {/* Product Images Grid */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Select an image from {product?.name || 'product'}:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {productImages.map((image) => (
                            <div 
                                key={image.id}
                                className={`relative border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                                    selectedImageId === image.id 
                                        ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-400' 
                                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                }`}
                                onClick={() => handleImageSelect(image.id)}
                            >
                                <div className="aspect-w-16 aspect-h-9">
                                    <img 
                                        src={image.url} 
                                        alt={image.altText || 'Product image'}
                                        className="w-full h-48 object-cover"
                                    />
                                </div>
                                {image.isPrimary && (
                                    <div className="absolute top-2 left-2">
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                            Primary
                                        </span>
                                    </div>
                                )}
                                {selectedImageId === image.id && (
                                    <div className="absolute top-2 right-2">
                                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    </div>
                                )}
                                {image.altText && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
                                        <p className="text-xs truncate">{image.altText}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <Button 
                    onClick={handleContinue} 
                    variant="primary" 
                    disabled={!selectedImageId}
                    className="w-full"
                >
                    Continue with Selected Image
                </Button>
            </div>
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
    
    // Function to validate URLs
    const isValidUrl = (string) => {
        try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (err) {
            return false;
        }
    };
    
    // Fetch product info from API
    const fetchProductInfo = async () => {
        // Validate URL
        if (!url.trim()) {
            setError('Please enter a product URL');
            return;
        }

        if (!isValidUrl(url)) {
            setError('Please enter a valid URL (starting with http:// or https://)');
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
            console.log('Sending request to API with URL:', url);
            
            // Build the API URL to ensure it works in production
            const apiUrl = new URL('/api/fetch-product-image', window.location.origin).toString();
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url }),
                // Add production-friendly options
                credentials: 'same-origin',
                mode: 'cors'
            });
            
            console.log('Response status:', response.status);
            console.log('Response headers:', [...response.headers.entries()]);
            
            // Check if we got a JSON response
            const contentType = response.headers.get('content-type');
            console.log('Content-Type header:', contentType);
            
            let data;
            
            try {
                // Try to parse as JSON regardless of content-type
                const text = await response.text();
                console.log('Response text:', text);
                
                try {
                    // Attempt to parse the text as JSON
                    data = JSON.parse(text);
                    console.log('Successfully parsed JSON data:', data);
                } catch (jsonError) {
                    console.error('JSON parse error:', jsonError);
                    throw new Error('Failed to parse server response as JSON');
                }
            } catch (parseError) {
                console.error('Error reading response text:', parseError);
                throw new Error('Server returned an invalid response');
            }
            
            if (!response.ok) {
                // Store any alternative suggestion from the server
                if (data && data.alternativeSuggestion) {
                    setAlternativeSuggestion(data.alternativeSuggestion);
                }
                throw new Error((data && data.error) || 'Failed to fetch product information');
            }
            
            if (!data || !data.imageUrl) {
                throw new Error('No product image found on the page');
            }
            
            // Create a unique creative name
            const creativeName = generateNextCreativeName(campaignSettings?.campaign?.name);
            
            // Use product UTM codes if available
            const product = campaignSettings?.product;
            const audienceType = campaignSettings?.audience?.type || 'general';
            
            let utmData = {
                utmSource: 'social_media',
                utmMedium: 'paid_social',
                utmCampaign: campaignSettings?.campaign?.name?.toLowerCase().replace(/\s+/g, '_') || 'general_campaign',
                utmContent: `${audienceType}_audience`,
                utmTerm: ''
            };
            
            // Override with product UTM codes if available
            if (product?.utmCodes) {
                utmData = {
                    utmSource: product.utmCodes.source || utmData.utmSource,
                    utmMedium: product.utmCodes.medium || utmData.utmMedium,
                    utmCampaign: product.utmCodes.campaign || utmData.utmCampaign,
                    utmContent: product.utmCodes.content || utmData.utmContent,
                    utmTerm: product.utmCodes.term || utmData.utmTerm
                };
            }
            
            // Pass the product data to the parent component
            onUrlSubmitted({
                type: 'product',
                sourceUrl: url,
                imageUrl: data.imageUrl,
                title: data.title || product?.name || 'Product Title',
                description: data.description ? 
                    (data.description.length > 125 ? 
                        data.description.substring(0, 125) + '...' : 
                        data.description) : 
                    (product?.description || 'Product Description'),
                creativeName,
                productId: product?.id || null,
                utmData: utmData // Include UTM tracking data
            });
            
        } catch (error) {
            console.error('Error fetching product info:', error);
            
            // Provide more specific error messages for common production issues
            let errorMessage = error.message;
            if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Unable to connect to the product extraction service. This might be a temporary network issue. Please try again.';
            } else if (error.message.includes('Mixed Content')) {
                errorMessage = 'Security error: This product URL cannot be processed due to browser security restrictions. Please try a different URL.';
            } else if (error.message.includes('CORS')) {
                errorMessage = 'Cross-origin request blocked. Please try a different product URL or upload an image directly.';
            }
            
            setApiError(errorMessage);
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
function AdCustomization({ adData, campaignSettings, onPublish, dbOperations }) {
    // Phase 7: Use ResponsiveCanvas for multi-format support
    return (
        <ResponsiveCanvas
            initialAdData={adData}
            campaignSettings={campaignSettings}
            onPublish={onPublish}
            primaryFormat={adData?.adSize || '300x250'}
            enableMultiFormat={true}
            dbOperations={dbOperations}
        />
    );
}

/**
 * PublishScreen Component
 * Step 5: Review and Publish Your Ad. Includes selected campaign/audience info.
 */
function PublishScreen({ adData, onBack, dbOperations }) {
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null);
    const [navigateToAdPlatforms, setNavigateToAdPlatforms] = useState(false);

    // For navigating to Ad Platforms and Campaign Manager
    const { setAppView } = useContext(AppContext);
    const APP_VIEW_CAMPAIGN_MANAGER = 'campaign_manager';
    const APP_VIEW_AD_PLATFORMS = 'ad_platforms';

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
                // Provide specific error messages based on the error type
                let errorMessage = 'Failed to save campaign. Please try again.';
                
                if (result.error && result.error.includes('quota')) {
                    const storageInfo = dbOperations.getStorageInfo();
                    errorMessage = `Storage limit reached! You have ${storageInfo.campaigns} campaigns stored. The campaign was saved but older campaigns were cleaned up.`;
                } else if (result.error && result.error.includes('Storage')) {
                    errorMessage = 'Storage quota exceeded. Please clear some browser data and try again.';
                } else if (result.error) {
                    errorMessage = `Save failed: ${result.error}`;
                }
                
                setSaveStatus({
                    type: result.error && result.error.includes('quota') ? 'warning' : 'error',
                    message: errorMessage
                });
            }
        } catch (error) {
            console.error('Error in handlePublishToAdPlatform:', error);
            setSaveStatus({
                type: 'error',
                message: 'An unexpected error occurred while saving. Please try again.'
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Handle save campaign and return to campaign manager
    const handleSaveCampaign = async () => {
        setIsSaving(true);
        setSaveStatus(null);

        try {
            const result = await Promise.resolve(dbOperations.saveAd(adData));
            
            if (result.success) {
                setSaveStatus({
                    type: 'success',
                    message: 'Campaign saved successfully! Returning to Campaign Manager...'
                });
                
                // Navigate to Campaign Manager after a brief delay
                setTimeout(() => {
                    setAppView(APP_VIEW_CAMPAIGN_MANAGER);
                }, 1500);
            } else {
                let errorMessage = 'Failed to save campaign. Please try again.';
                
                if (result.error && result.error.includes('quota')) {
                    const storageInfo = dbOperations.getStorageInfo();
                    errorMessage = `Storage limit reached! You have ${storageInfo.campaigns} campaigns stored. The campaign was saved but older campaigns were cleaned up.`;
                } else if (result.error && result.error.includes('Storage')) {
                    errorMessage = 'Storage quota exceeded. Please clear some browser data and try again.';
                } else if (result.error) {
                    errorMessage = `Save failed: ${result.error}`;
                }
                
                setSaveStatus({
                    type: result.error && result.error.includes('quota') ? 'warning' : 'error',
                    message: errorMessage
                });
            }
        } catch (error) {
            console.error('Error in handleSaveCampaign:', error);
            setSaveStatus({
                type: 'error',
                message: 'An unexpected error occurred while saving. Please try again.'
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
        utmData = null,
        product = null,
        productId = null,
        elements = [], // Canvas elements from editing
        canvasData = null // Full canvas state
    } = adData;

    console.log('📋 PublishScreen received adData:', {
        headline,
        description,
        ctaText,
        hasElements: elements.length > 0,
        hasCanvasData: !!canvasData,
        imageSources: { uploadedDataUrl, fetchedImageUrl }
    });

    // Determine the primary image source for display, preferring edited canvas data
    let imageSrc = uploadedDataUrl || fetchedImageUrl;
    
    // If we have canvas elements, try to extract the image from the edited elements
    if (elements && elements.length > 0) {
        const imageElement = elements.find(el => 
            (el.type === 'image' || el.type === 'product') && 
            (el.content || el.src)
        );
        if (imageElement) {
            imageSrc = imageElement.content || imageElement.src || imageSrc;
            console.log('🖼️ Using image from canvas element:', imageSrc);
        }
    }

    // Find labels/values for display
    const audienceTypeLabel = AUDIENCE_OPTIONS.find(opt => opt.value === audience?.type)?.label || audience?.type || 'N/A';
    const audienceLocationsDisplay = audience?.locations?.length > 0 ? audience.locations.join(', ') : 'Any';
    const retailerLabel = RETAILER_OPTIONS.find(opt => opt.value === audience?.retailer)?.label || audience?.retailer || 'N/A';

    return (
        <Card title="Step 3: Review and Save Your Campaign" className="max-w-2xl mx-auto">
            {/* Display selected campaign & audience details */}
                <div className="text-center text-sm text-gray-600 mb-4 border-b pb-2">
                    <p>Campaign: <span className="font-semibold">{campaignName}</span></p>
                    <p>Target Segment: <span className="font-semibold">{audienceTypeLabel}</span></p>
                    <p>Location(s): <span className="font-semibold">{audienceLocationsDisplay}</span></p>
                    <p>Retailer: <span className="font-semibold">{retailerLabel}</span></p>
                </div>

            {/* Final Ad Preview Container */}
            <div className="mb-6 flex justify-center">
                {canvasData && elements && elements.length > 0 ? (
                    // Show edited canvas version
                    <div>
                        <p className="text-xs text-green-600 text-center mb-2">
                            ✓ Showing your edited ad ({elements.length} elements)
                        </p>
                        <CanvasPreview 
                            canvasData={canvasData}
                            adSize={adSize}
                        />
                    </div>
                ) : (
                    // Fallback to original simple preview
                    <div>
                        <p className="text-xs text-orange-600 text-center mb-2">
                            ⚠ Showing simple preview (no edits made)
                        </p>
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
                )}
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

            {/* Product Information & UTM Tracking - NEW */}
            {(product || utmData) && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                        📊 Campaign Tracking & Product Details
                    </h4>
                    
                    {/* Product Information */}
                    {product && (
                        <div className="mb-4 last:mb-0">
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Linked Product:</p>
                            <div className="bg-white dark:bg-gray-700 p-3 rounded border">
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{product.name}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Brand: {product.brand}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Category: {product.category}</p>
                                {product.metadata?.sku && (
                                    <p className="text-xs text-gray-600 dark:text-gray-400">SKU: {product.metadata.sku}</p>
                                )}
                            </div>
                        </div>
                    )}

                                         {/* UTM Tracking Parameters */}
                    {utmData && (
                        <div>
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">UTM Tracking Parameters:</p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                {utmData.utmSource && (
                                    <div className="bg-white dark:bg-gray-700 p-2 rounded border">
                                        <span className="font-medium text-gray-700 dark:text-gray-300">Source:</span>
                                        <span className="ml-1 text-gray-600 dark:text-gray-400">{utmData.utmSource}</span>
                                    </div>
                                )}
                                {utmData.utmMedium && (
                                    <div className="bg-white dark:bg-gray-700 p-2 rounded border">
                                        <span className="font-medium text-gray-700 dark:text-gray-300">Medium:</span>
                                        <span className="ml-1 text-gray-600 dark:text-gray-400">{utmData.utmMedium}</span>
                                    </div>
                                )}
                                {utmData.utmCampaign && (
                                    <div className="bg-white dark:bg-gray-700 p-2 rounded border">
                                        <span className="font-medium text-gray-700 dark:text-gray-300">Campaign:</span>
                                        <span className="ml-1 text-gray-600 dark:text-gray-400">{utmData.utmCampaign}</span>
                                    </div>
                                )}
                                {utmData.utmContent && (
                                    <div className="bg-white dark:bg-gray-700 p-2 rounded border">
                                        <span className="font-medium text-gray-700 dark:text-gray-300">Content:</span>
                                        <span className="ml-1 text-gray-600 dark:text-gray-400">{utmData.utmContent}</span>
                                    </div>
                                )}
                                {utmData.utmTerm && (
                                    <div className="bg-white dark:bg-gray-700 p-2 rounded border col-span-2">
                                        <span className="font-medium text-gray-700 dark:text-gray-300">Term:</span>
                                        <span className="ml-1 text-gray-600 dark:text-gray-400">{utmData.utmTerm}</span>
                                    </div>
                                )}
                            </div>

                            {/* Generated Tracking URL - NEW */}
                            {product?.productUrl && (
                                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border">
                                    <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-2">🔗 Generated Tracking URL:</p>
                                    <div className="bg-white dark:bg-gray-700 p-2 rounded border break-all">
                                        <code className="text-xs text-gray-800 dark:text-gray-200">
                                            {constructTrackingUrl(product.productUrl, utmData)}
                                        </code>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        This is the URL that will be used in your ads to track campaign performance.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Save Status Message */}
            {saveStatus && (
                <div className={`mb-4 p-3 rounded ${
                    saveStatus.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200' : 
                    saveStatus.type === 'warning' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200' : 
                    'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200'
                }`}>
                    {saveStatus.message}
                </div>
            )}

                {/* Status Message */}
                {saveStatus && (
                    <div className={`p-3 rounded-lg mb-4 ${
                        saveStatus.type === 'success' ? 'bg-green-50 text-green-800' :
                        saveStatus.type === 'warning' ? 'bg-yellow-50 text-yellow-800' :
                        'bg-red-50 text-red-800'
                    }`}>
                        {saveStatus.message}
                    </div>
                )}

                <div className="space-y-3 mb-6">
                    {/* Primary Save Campaign Button */}
                    <Button 
                        variant="primary" 
                        className="w-full bg-[#F7941D] hover:bg-orange-600" 
                        onClick={handleSaveCampaign}
                        disabled={isSaving}
                    >
                        {isSaving ? 'Saving Campaign...' : '💾 Save Campaign'}
                    </Button>

                    {/* Platform Publishing Options */}
                    <div className="pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600 mb-3 text-center">Or publish directly to platforms:</p>
                        
                        <Button 
                            variant="primary" 
                            className="w-full mb-3" 
                            onClick={() => handlePublishToAdPlatform('Google Ads')}
                            disabled={isSaving}
                        >
                            Publish to Google Ads
                        </Button>
                        
                        <Button 
                            variant="primary" 
                            className="w-full mb-3" 
                            onClick={() => handlePublishToAdPlatform('Facebook Ads')}
                            disabled={isSaving}
                        >
                            Publish to Facebook Ads
                        </Button>
                        
                        <Button variant="secondary" className="w-full" disabled>Download Ad Files</Button>
                    </div>
                </div>

                {/* Back Button */}
                <div className="text-center">
                    <Button onClick={onBack} variant="secondary">Back to Editing</Button>
                </div>
        </Card>
    );
}

// Add Product Manager component
function ProductManagerView({ onCreateNew, onProductClick, onEditProduct, dbOperations }) {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadProducts = async () => {
            if (dbOperations) {
                const loadedProducts = await dbOperations.getProductsAsync();
                setProducts(loadedProducts);
            }
        };
        loadProducts();
    }, [dbOperations]);

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-2">
                    <svg className="w-6 h-6 text-[#F7941D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Products</h1>
                    <span className="text-gray-500 dark:text-gray-400">Manage Product Library</span>
                </div>
                <Button variant="primary" onClick={onCreateNew}>
                    Add Product
                </Button>
            </div>

            {/* Search and Filters */}
            <div className="mb-6">
                <InputField
                    id="productSearch"
                    label="Search Products"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by product name or brand..."
                    className="max-w-md"
                />
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                    <ProductCard 
                        key={product.id}
                        product={product}
                        onView={() => onProductClick(product)}
                        onEdit={() => onEditProduct(product)}
                        dbOperations={dbOperations}
                    />
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Products Found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                        {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first product.'}
                    </p>
                    {!searchTerm && (
                        <Button variant="primary" onClick={onCreateNew}>
                            Add Your First Product
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}

// Add Campaign Manager component
function CampaignManagerView({ onCreateNew, onCampaignClick, dbOperations }) {
    // Get campaigns from storage
    const [campaigns, setCampaigns] = useState([]);

    const loadCampaigns = async () => {
        if (dbOperations) {
            try {
                console.log('🔄 Loading campaigns...');
                // Use async version to get fresh data
                const loadedCampaigns = await dbOperations.getCampaignsAsync();
                console.log('📊 Loaded campaigns:', loadedCampaigns.length, 'campaigns');
                console.log('📋 Campaign data:', loadedCampaigns);
                setCampaigns(loadedCampaigns);
            } catch (error) {
                console.error('❌ Error loading campaigns:', error);
            }
        }
    };

    useEffect(() => {
        // Load campaigns when component mounts
        loadCampaigns();
    }, [dbOperations]);

    // Listen for storage changes to refresh campaigns
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'saved_campaigns' || e.key === 'campaigns') {
                loadCampaigns();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        
        // Also listen for focus event to refresh when returning to tab
        const handleFocus = () => {
            loadCampaigns();
        };
        
        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [dbOperations]);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-2">
                    <svg className="w-6 h-6 text-[#F7941D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Campaigns</h1>
                    <span className="text-gray-500 dark:text-gray-400">Status, Budget & More</span>
                </div>
                <Button variant="primary" onClick={onCreateNew}>
                    Launch Campaign
                </Button>
            </div>

            <div className="bg-white rounded-lg shadow dark:bg-gray-800">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-[#0B2265] dark:text-gray-200">My Campaigns</h2>
                        <div className="flex items-center space-x-2">
                            <Button 
                                variant="light" 
                                size="small" 
                                onClick={loadCampaigns}
                                className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 dark:border-gray-600"
                                title="Refresh campaigns"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </Button>
                            <Button variant="light" size="small" className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 dark:border-gray-600">
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
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Info</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Created</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Budget</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Starts</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Ends</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                            {campaigns.map((campaign) => (
                                <tr key={campaign.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{campaign.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            <button 
                                                onClick={() => onCampaignClick(campaign)}
                                                className="text-sm bg-transparent text-blue-500 hover:text-blue-700 hover:underline focus:outline-none dark:text-blue-400 dark:hover:text-blue-300"
                                            >
                                                {campaign.name}
                                            </button>
                                            {campaign.source === 'v2' && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                                    V2
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                            {campaign.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {campaign.info && (
                                            <svg className="w-5 h-5 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{campaign.created}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{campaign.type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{campaign.budget}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{campaign.starts}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{campaign.ends}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        <Button variant="light" size="small" className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 dark:border-gray-600">
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
function CampaignDetailsView({ campaign, onBack, onPreviewCreative, dbOperations }) {
    if (!campaign) return null;

    // Extract creatives from campaign data
    const creatives = [{
        id: `CR-${campaign.id}`,
        adSize: campaign.adData.adSize,
        type: campaign.adData.ctaType === CTA_TYPE_WHERE_TO_BUY ? 'Where to Buy' : 'Add to Cart'
    }];

    // Get linked product information
    const linkedProduct = campaign.productId && dbOperations ? dbOperations.getProducts().find(p => p.id === campaign.productId) : null;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-2">
                    <Button variant="light" onClick={onBack} className="mr-2 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 dark:border-gray-600">
                        ← Back
                    </Button>
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">{campaign.name}</h1>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow dark:bg-gray-800">
                {/* Campaign Summary */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                            <p className="font-medium dark:text-gray-100">{campaign.status}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                            <p className="font-medium dark:text-gray-100">{campaign.created}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Budget</p>
                            <p className="font-medium dark:text-gray-100">{campaign.budget}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
                            <p className="font-medium dark:text-gray-100">{campaign.type}</p>
                        </div>
                    </div>
                </div>

                {/* Linked Product Information - NEW */}
                {linkedProduct && (
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">
                            🏷️ Linked Product
                        </h3>
                        <div className="flex items-start space-x-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            {linkedProduct.images && linkedProduct.images.length > 0 && (
                                <img 
                                    src={linkedProduct.images.find(img => img.isPrimary)?.url || linkedProduct.images[0]?.url} 
                                    alt={linkedProduct.name}
                                    className="w-16 h-16 object-cover rounded-lg"
                                />
                            )}
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100">{linkedProduct.name}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Brand: {linkedProduct.brand}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Category: {linkedProduct.category}</p>
                                {linkedProduct.metadata?.sku && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400">SKU: {linkedProduct.metadata.sku}</p>
                                )}
                                <div className="mt-2">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                        linkedProduct.status === 'active' 
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                                    }`}>
                                        {linkedProduct.status}
                                    </span>
                                </div>
                            </div>
                            {linkedProduct.utmCodes && Object.values(linkedProduct.utmCodes).some(v => v) && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    <p className="font-medium">UTM Tracking:</p>
                                    {linkedProduct.utmCodes.source && <p>Source: {linkedProduct.utmCodes.source}</p>}
                                    {linkedProduct.utmCodes.medium && <p>Medium: {linkedProduct.utmCodes.medium}</p>}
                                    {linkedProduct.utmCodes.campaign && <p>Campaign: {linkedProduct.utmCodes.campaign}</p>}
                                </div>
                            )}
                            {linkedProduct.productUrl && (
                                <div className="text-xs">
                                    <p className="font-medium text-gray-700 dark:text-gray-300">Product Page:</p>
                                    <a 
                                        href={linkedProduct.productUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 truncate block"
                                    >
                                        {linkedProduct.productUrl.length > 30 
                                            ? `${linkedProduct.productUrl.substring(0, 30)}...` 
                                            : linkedProduct.productUrl}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Creatives Table */}
                <div className="p-4">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 dark:text-gray-200">Campaign Creatives</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Creative ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Ad Size</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Preview</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                {creatives.map((creative) => (
                                    <tr key={creative.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">
                                            <button 
                                                onClick={() => onPreviewCreative(campaign)}
                                                className="bg-transparent text-blue-500 hover:text-blue-700 hover:underline focus:outline-none dark:text-blue-400 dark:hover:text-blue-300"
                                            >
                                                {creative.id}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {creative.adSize}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {creative.type}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            <Button 
                                                variant="light" 
                                                size="small"
                                                onClick={() => onPreviewCreative(campaign)}
                                                className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 dark:border-gray-600"
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
                <p className="text-gray-600 mb-6 dark:text-gray-400">
                    Connect your ad accounts to deliver campaigns directly to these platforms.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {platforms.map((platform) => (
                        <div key={platform.name} className="border rounded-lg p-4 flex items-center justify-between dark:border-gray-700">
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
                                    <h3 className="font-medium dark:text-gray-100">{platform.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
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
                
                <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-700 dark:border-gray-600">
                    <h3 className="font-medium mb-2 dark:text-gray-100">Why connect your ad accounts?</h3>
                    <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400">
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

// Coming Soon Views
function ComingSoonView({ title, description, icon }) {
    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="text-center py-20">
                <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                        {icon}
                    </div>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{title}</h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">{description}</p>
                <div className="inline-flex items-center px-6 py-3 border-2 border-blue-200 dark:border-blue-800 rounded-lg">
                    <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-lg font-medium text-blue-700 dark:text-blue-300">Coming Soon</span>
                </div>
                <div className="mt-12 bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">What to expect:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                        <div className="flex items-start">
                            <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">Easy Creation</h4>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">Intuitive tools for quick content generation</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">Professional Templates</h4>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">Pre-designed layouts for your brand</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">Analytics Integration</h4>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">Track performance and optimize</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">Multi-Platform Support</h4>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">Deploy across all channels</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ShoppableLandingPagesView() {
    return (
        <ComingSoonView 
            title="Shoppable Landing Pages"
            description="Create beautiful, conversion-optimized landing pages that let customers shop directly from your content. Perfect for email campaigns, social media, and paid advertising."
            icon={
                <svg className="w-12 h-12 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
            }
        />
    );
}

function ShoppableLinksView() {
    return (
        <ComingSoonView 
            title="Shoppable Links"
            description="Transform any link into a shoppable experience. Add product overlays, purchase options, and branded checkout flows to drive direct sales from social posts and content."
            icon={
                <svg className="w-12 h-12 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                </svg>
            }
        />
    );
}

function ShoppableRecipesView() {
    return (
        <ComingSoonView 
            title="Shoppable Recipes"
            description="Create interactive recipe content where customers can shop for ingredients directly. Build engagement and drive sales through cooking inspiration and convenience."
            icon={
                <svg className="w-12 h-12 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM14 9a1 1 0 011 1v6a1 1 0 11-2 0v-6a1 1 0 011-1zM16 9a1 1 0 011 1v6a1 1 0 11-2 0v-6a1 1 0 011-1z" />
                </svg>
            }
        />
    );
}

function QRCodesView() {
    return (
        <ComingSoonView 
            title="QR Codes"
            description="Generate smart QR codes that connect offline and online experiences. Track scans, customize destinations, and create seamless customer journeys from print to purchase."
            icon={
                <svg className="w-12 h-12 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1V4a1 1 0 011-1h3zm-1 2v1h-1V5h1zM11 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3zm2 2v-1h1v1h-1zM2 2h16v16H2V2z" clipRule="evenodd" />
                </svg>
            }
        />
    );
}

function LocatorsView() {
    return (
        <ComingSoonView
            title="Locators"
            description="Create interactive store locator tools to help customers find your products at nearby retailers. Include maps, filters, and real-time inventory information."
            icon={
                <svg className="w-12 h-12 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
            }
        />
    );
}

function AccountView({ dbOperations }) {
    const [storageInfo, setStorageInfo] = useState(null);
    const [isClearing, setIsClearing] = useState(false);
    const [clearStatus, setClearStatus] = useState(null);

    useEffect(() => {
        const loadStorageInfo = async () => {
            if (dbOperations) {
                const info = await dbOperations.getStorageInfo();
                setStorageInfo(info);
            }
        };
        loadStorageInfo();
    }, [dbOperations]);

    const handleClearOldCampaigns = async () => {
        if (!dbOperations) return;
        
        setIsClearing(true);
        setClearStatus(null);
        
        try {
            const result = await dbOperations.clearOldCampaigns();
            if (result.success) {
                setClearStatus({
                    type: 'success',
                    message: `Cleared ${result.cleared} old campaigns successfully!`
                });
                // Refresh storage info
                const newInfo = await dbOperations.getStorageInfo();
                setStorageInfo(newInfo);
            } else {
                setClearStatus({
                    type: 'error',
                    message: `Failed to clear campaigns: ${result.error}`
                });
            }
        } catch (error) {
            setClearStatus({
                type: 'error',
                message: 'An error occurred while clearing campaigns.'
            });
        } finally {
            setIsClearing(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center space-x-2 mb-6">
                <svg className="w-6 h-6 text-[#F7941D]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Account Settings</h1>
            </div>

            {/* Storage Management Section */}
            <Card title="Storage Management" className="mb-6">
                {storageInfo ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                <div className="text-sm text-gray-600 dark:text-gray-400">Campaigns</div>
                                <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{storageInfo.campaigns}</div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                <div className="text-sm text-gray-600 dark:text-gray-400">Products</div>
                                <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{storageInfo.products}</div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                <div className="text-sm text-gray-600 dark:text-gray-400">Storage Used</div>
                                <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{storageInfo.percentage}%</div>
                            </div>
                        </div>

                        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    storageInfo.percentage > 80 ? 'bg-red-500' :
                                    storageInfo.percentage > 60 ? 'bg-yellow-500' : 
                                    'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
                            ></div>
                        </div>

                        {storageInfo.percentage > 70 && (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-yellow-800 dark:text-yellow-200">Storage is getting full. Consider clearing old campaigns.</span>
                                </div>
                            </div>
                        )}

                        {clearStatus && (
                            <div className={`p-3 rounded-lg ${
                                clearStatus.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200' : 
                                'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200'
                            }`}>
                                {clearStatus.message}
                            </div>
                        )}

                        <div className="flex space-x-3">
                            <Button 
                                variant="secondary" 
                                onClick={handleClearOldCampaigns}
                                disabled={isClearing}
                            >
                                {isClearing ? 'Clearing...' : 'Clear Old Campaigns'}
                            </Button>
                            <Button variant="light" disabled>
                                Export Data (Coming Soon)
                            </Button>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Clearing old campaigns will keep your 20 most recent campaigns and remove the rest to free up storage space.
                        </p>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500 dark:text-gray-400">
                            Loading storage information...
                        </p>
                    </div>
                )}
            </Card>

            {/* Other Account Settings - Coming Soon */}
            <Card title="Account Information">
                <div className="text-center py-8">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Profile & Billing</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Account information, billing settings, and team management coming soon.
                    </p>
                </div>
            </Card>
        </div>
    );
}

// Add Insights View component
function InsightsView() {
    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Market Insights</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    Comprehensive market intelligence to guide your campaign planning
                </p>
            </div>

            {/* Distribution Section */}
            <div className="mb-8">
                <Card title="Distribution" className="mb-6">
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Brand settings and distribution analysis across different channels
                        </p>
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
                            <div className="p-4">
                                <div className="relative">
                                    {/* Retail Distribution Map Visualization */}
                                    <img 
                                        src="/distribution-map.png"
                                        alt="Retail Store Distribution Map"
                                        className="w-full h-auto rounded-lg"
                                        style={{ maxHeight: '400px', objectFit: 'contain' }}
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-5 transition-all duration-200 rounded-lg cursor-pointer flex items-center justify-center opacity-0 hover:opacity-100">
                                        <span className="text-white bg-black bg-opacity-50 px-3 py-1 rounded-full text-sm">
                                            Click to view full analytics
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-between items-center">
                                    <div className="flex space-x-4 text-sm text-gray-600 dark:text-gray-400">
                                        <span>Total Stores: <strong className="text-gray-900 dark:text-gray-100">2,847</strong></span>
                                        <span>•</span>
                                        <span>Banners: <strong className="text-blue-600 dark:text-blue-400">23 Active</strong></span>
                                        <span>•</span>
                                        <span>Metro Areas: <strong className="text-green-600 dark:text-green-400">18 Markets</strong></span>
                                    </div>
                                    <Button variant="light" size="small">
                                        View Full Map
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Grid for other sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Category Section */}
                <Card title="Category" className="h-fit">
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Product category performance and trends
                        </p>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Health & Wellness</span>
                                <span className="text-sm text-green-600 dark:text-green-400">+12.5%</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Organic Foods</span>
                                <span className="text-sm text-green-600 dark:text-green-400">+8.3%</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Supplements</span>
                                <span className="text-sm text-blue-600 dark:text-blue-400">+5.7%</span>
                            </div>
                        </div>
                        <Button variant="light" size="small" className="w-full">
                            View Detailed Analysis
                        </Button>
                    </div>
                </Card>

                {/* Competitors Section */}
                <Card title="Competitors" className="h-fit">
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Competitive landscape and market positioning
                        </p>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">A</span>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Brand Alpha</span>
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">32% share</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                        <span className="text-xs font-semibold text-green-600 dark:text-green-400">B</span>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Brand Beta</span>
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">28% share</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                                        <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">C</span>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Brand Gamma</span>
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">18% share</span>
                            </div>
                        </div>
                        <Button variant="light" size="small" className="w-full">
                            Competitive Analysis
                        </Button>
                    </div>
                </Card>

                {/* Products Section */}
                <Card title="Products" className="h-fit">
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Product performance metrics and opportunities
                        </p>
                        <div className="space-y-3">
                            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Top Performing</span>
                                    <span className="text-xs text-green-600 dark:text-green-400">↗ 15%</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                    <div className="bg-green-600 h-2 rounded-full" style={{width: '75%'}}></div>
                                </div>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Growth Opportunity</span>
                                    <span className="text-xs text-blue-600 dark:text-blue-400">↗ 8%</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '45%'}}></div>
                                </div>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Needs Attention</span>
                                    <span className="text-xs text-red-600 dark:text-red-400">↘ 3%</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                    <div className="bg-red-600 h-2 rounded-full" style={{width: '25%'}}></div>
                                </div>
                            </div>
                        </div>
                        <Button variant="light" size="small" className="w-full">
                            Product Deep Dive
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Bottom Notice */}
            <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                            Enhanced Analytics Coming Soon
                        </h3>
                        <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                            <p>Advanced market intelligence features including real-time trend analysis, predictive modeling, and custom dashboard creation will be available in upcoming releases.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Add ProductImageManager component
function ProductImageManager({ images, setImages }) {
    const [uploadError, setUploadError] = useState('');

    const handleImageUpload = (event) => {
        const files = Array.from(event.target.files);
        setUploadError('');
        
        files.forEach(file => {
            if (file && file.type.startsWith('image/')) {
                if (file.size > 10 * 1024 * 1024) { // 10MB limit
                    setUploadError('File size must be less than 10MB');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    const newImage = {
                        id: String(Date.now() + Math.random()),
                        url: e.target.result,
                        fileName: file.name,
                        altText: '',
                        isPrimary: images.length === 0, // First image is primary by default
                        size: '300x250', // Default size
                        uploadDate: new Date().toISOString()
                    };
                    setImages(prev => [...prev, newImage]);
                };
                reader.readAsDataURL(file);
            } else {
                setUploadError('Please select valid image files only');
            }
        });
    };

    const handleImageDelete = (imageId) => {
        setImages(prev => {
            const filtered = prev.filter(img => img.id !== imageId);
            // If we deleted the primary image, make the first remaining image primary
            if (filtered.length > 0 && !filtered.some(img => img.isPrimary)) {
                filtered[0].isPrimary = true;
            }
            return filtered;
        });
    };

    const handleSetPrimary = (imageId) => {
        setImages(prev => prev.map(img => ({
            ...img,
            isPrimary: img.id === imageId
        })));
    };

    const handleAltTextChange = (imageId, altText) => {
        setImages(prev => prev.map(img => 
            img.id === imageId ? { ...img, altText } : img
        ));
    };

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="imageUpload"
                />
                <label
                    htmlFor="imageUpload"
                    className="cursor-pointer flex flex-col items-center"
                >
                    <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-600 dark:text-gray-400">
                        Click to upload product images
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        PNG, JPG, GIF up to 10MB each
                    </p>
                </label>
            </div>

            {/* Upload Error */}
            {uploadError && (
                <div className="text-red-600 text-sm">{uploadError}</div>
            )}

            {/* Uploaded Images Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {images.map((image) => (
                        <div key={image.id} className="relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                            <img
                                src={image.url}
                                alt={image.altText || 'Product image'}
                                className="w-full h-32 object-cover"
                            />
                            
                            {/* Primary Badge */}
                            {image.isPrimary && (
                                <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 text-xs rounded">
                                    Primary
                                </div>
                            )}
                            
                            {/* Action Buttons */}
                            <div className="absolute top-2 right-2 flex space-x-1">
                                {!image.isPrimary && (
                                    <button
                                        onClick={() => handleSetPrimary(image.id)}
                                        className="bg-blue-500 text-white p-1 rounded text-xs hover:bg-blue-600"
                                        title="Set as primary"
                                    >
                                        ★
                                    </button>
                                )}
                                <button
                                    onClick={() => handleImageDelete(image.id)}
                                    className="bg-red-500 text-white p-1 rounded text-xs hover:bg-red-600"
                                    title="Delete image"
                                >
                                    ×
                                </button>
                            </div>
                            
                            {/* Alt Text Input */}
                            <div className="p-2">
                                <input
                                    type="text"
                                    value={image.altText}
                                    onChange={(e) => handleAltTextChange(image.id, e.target.value)}
                                    placeholder="Alt text for accessibility..."
                                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Enhanced ProductFormView component (Phase 2)
function ProductFormView({ product = null, onSave, onCancel }) {
    const isEditing = !!product;
    const [formData, setFormData] = useState({
        name: product?.name || '',
        description: product?.description || '',
        brand: product?.brand || '',
        category: product?.category || '',
        productUrl: product?.productUrl || '',
        utmCodes: {
            source: product?.utmCodes?.source || '',
            medium: product?.utmCodes?.medium || '',
            campaign: product?.utmCodes?.campaign || '',
            term: product?.utmCodes?.term || '',
            content: product?.utmCodes?.content || ''
        },
        settings: {
            defaultAudience: product?.settings?.defaultAudience || DEFAULT_AUDIENCE_TYPE,
            defaultRetailers: product?.settings?.defaultRetailers || [],
            defaultRegions: product?.settings?.defaultRegions || []
        },
        metadata: {
            sku: product?.metadata?.sku || '',
            tags: product?.metadata?.tags || [],
            retailerUrls: product?.metadata?.retailerUrls || []
        },
        status: product?.status || 'Draft'
    });
    
    const [images, setImages] = useState(product?.images || []);
    const [errors, setErrors] = useState({});

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const handleNestedInputChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Product name is required';
        if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
        if (!formData.category) newErrors.category = 'Category is required';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        const productData = {
            ...formData,
            images
        };

        try {
            const result = isEditing 
                ? await dbOperations.updateProduct(product.id, productData)
                : await dbOperations.saveProduct(productData);
            
            if (result.success) {
                onSave(result.product);
            }
        } catch (error) {
            console.error('Error saving product:', error);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                    {isEditing ? `Edit ${product.name}` : 'Add New Product'}
                </h1>
                <Button variant="light" onClick={onCancel}>
                    Cancel
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Basic Information */}
                <Card title="Basic Information">
                    <div className="space-y-4">
                        <InputField
                            id="productName"
                            label="Product Name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="e.g., Mountain Huckleberry Yogurt"
                            error={errors.name}
                        />
                        
                        <InputField
                            id="brand"
                            label="Brand"
                            value={formData.brand}
                            onChange={(e) => handleInputChange('brand', e.target.value)}
                            placeholder="e.g., SPINS Organic"
                            error={errors.brand}
                        />
                        
                        <SelectDropdown
                            id="category"
                            label="Category"
                            value={formData.category}
                            onChange={(e) => handleInputChange('category', e.target.value)}
                            options={PRODUCT_CATEGORIES}
                            error={errors.category}
                        />
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Description
                            </label>
                            <textarea
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F7941D] focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                                rows="3"
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Brief description of the product..."
                            />
                        </div>

                        <InputField
                            id="productUrl"
                            label="Product URL"
                            type="url"
                            value={formData.productUrl || ''}
                            onChange={(e) => handleInputChange('productUrl', e.target.value)}
                            placeholder="https://www.tillamook.com/products/yogurt/mountain-huckleberry-yogurt"
                        />

                        <SelectDropdown
                            id="status"
                            label="Status"
                            value={formData.status}
                            onChange={(e) => handleInputChange('status', e.target.value)}
                            options={[
                                { label: 'Draft', value: 'Draft' },
                                { label: 'Active', value: 'Active' },
                                { label: 'Archived', value: 'Archived' }
                            ]}
                        />
                    </div>
                </Card>

                {/* UTM Codes */}
                <Card title="UTM Tracking Codes">
                    <div className="space-y-4">
                        <InputField
                            id="utmSource"
                            label="UTM Source"
                            value={formData.utmCodes.source}
                            onChange={(e) => handleNestedInputChange('utmCodes', 'source', e.target.value)}
                            placeholder="e.g., newsletter"
                        />
                        
                        <InputField
                            id="utmMedium"
                            label="UTM Medium"
                            value={formData.utmCodes.medium}
                            onChange={(e) => handleNestedInputChange('utmCodes', 'medium', e.target.value)}
                            placeholder="e.g., email"
                        />
                        
                        <InputField
                            id="utmCampaign"
                            label="UTM Campaign"
                            value={formData.utmCodes.campaign}
                            onChange={(e) => handleNestedInputChange('utmCodes', 'campaign', e.target.value)}
                            placeholder="e.g., spring_launch"
                        />

                        <InputField
                            id="utmTerm"
                            label="UTM Term (Optional)"
                            value={formData.utmCodes.term}
                            onChange={(e) => handleNestedInputChange('utmCodes', 'term', e.target.value)}
                            placeholder="e.g., huckleberry"
                        />

                        <InputField
                            id="utmContent"
                            label="UTM Content (Optional)"
                            value={formData.utmCodes.content}
                            onChange={(e) => handleNestedInputChange('utmCodes', 'content', e.target.value)}
                            placeholder="e.g., yogurt_promo"
                        />
                    </div>
                </Card>
            </div>

            {/* Product Metadata */}
            <Card title="Product Metadata" className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                        id="sku"
                        label="SKU"
                        value={formData.metadata.sku}
                        onChange={(e) => handleNestedInputChange('metadata', 'sku', e.target.value)}
                        placeholder="e.g., SPO-YOG-HUCK-001"
                    />
                </div>
            </Card>

            {/* Image Management Section */}
            <Card title="Product Images" className="mt-8">
                <ProductImageManager images={images} setImages={setImages} />
            </Card>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 mt-8">
                <Button variant="secondary" onClick={onCancel}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    {isEditing ? 'Update Product' : 'Create Product'}
                </Button>
            </div>
        </div>
    );
}

// Add ProductDetailsView component
function ProductDetailsView({ product, onBack, onEdit, onCreateCampaign, dbOperations }) {
    const [campaigns, setCampaigns] = useState([]);
    const [currentProduct, setCurrentProduct] = useState(product);
    const [selectedImageId, setSelectedImageId] = useState(null);
    const [showBackgroundCustomizer, setShowBackgroundCustomizer] = useState(false);

    useEffect(() => {
        if (dbOperations) {
            const allCampaigns = dbOperations.getCampaigns();
            const productCampaigns = allCampaigns.filter(c => c.productId === product.id);
            setCampaigns(productCampaigns);
        }
    }, [product.id, dbOperations]);

    useEffect(() => {
        setCurrentProduct(product);
    }, [product]);

    const handleBackgroundChange = (updatedProduct) => {
        setCurrentProduct(updatedProduct);
        // Optionally trigger a parent update if needed
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-2">
                    <Button variant="light" onClick={onBack} className="mr-2">
                        ← Back to Products
                    </Button>
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">{product.name}</h1>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        product.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        product.status === 'Draft' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                    }`}>
                        {product.status}
                    </span>
                </div>
                <div className="flex space-x-2">
                    <Button variant="light" onClick={() => onEdit(product)}>
                        Edit Product
                    </Button>
                    <Button variant="primary" onClick={() => onCreateCampaign(product)}>
                        Create Campaign
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Product Information */}
                <div className="lg:col-span-2">
                    <Card title="Product Information">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Brand</p>
                                <p className="font-medium dark:text-gray-100">{product.brand}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
                                <p className="font-medium dark:text-gray-100">
                                    {PRODUCT_CATEGORIES.find(c => c.value === product.category)?.label || product.category}
                                </p>
                            </div>
                            {product.metadata?.sku && (
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">SKU</p>
                                    <p className="font-mono text-sm dark:text-gray-100">{product.metadata.sku}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                                <p className="font-medium dark:text-gray-100">
                                    {new Date(product.created).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
                                <p className="font-medium dark:text-gray-100">{product.description}</p>
                            </div>
                            {product.productUrl && (
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Product URL</p>
                                    <div className="flex items-center space-x-2">
                                        <a 
                                            href={product.productUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium truncate"
                                        >
                                            {product.productUrl}
                                        </a>
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* UTM Codes */}
                    {product.utmCodes && Object.values(product.utmCodes).some(v => v) && (
                        <Card title="UTM Tracking Codes" className="mt-6">
                            <div className="grid grid-cols-2 gap-4">
                                {Object.entries(product.utmCodes).map(([key, value]) => (
                                    value && (
                                        <div key={key}>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                                                UTM {key}
                                            </p>
                                            <p className="font-mono text-sm dark:text-gray-100">{value}</p>
                                        </div>
                                    )
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Campaigns */}
                    <Card title={`Campaigns (${campaigns.length})`} className="mt-6">
                        {campaigns.length > 0 ? (
                            <div className="space-y-3">
                                {campaigns.map((campaign) => (
                                    <div key={campaign.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                                        <div>
                                            <h4 className="font-medium dark:text-gray-100">{campaign.name}</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Created {campaign.created} • {campaign.status}
                                            </p>
                                        </div>
                                        <Button variant="light" size="small">
                                            View
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-gray-500 dark:text-gray-400 mb-4">No campaigns created yet</p>
                                <Button variant="primary" onClick={() => onCreateCampaign(product)}>
                                    Create First Campaign
                                </Button>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Product Images */}
                <div>
                    <Card title="Product Images">
                        {currentProduct.images && currentProduct.images.length > 0 ? (
                            <div className="space-y-3">
                                {currentProduct.images.map((image) => {
                                    const activeImageUrl = (dbOperations && dbOperations.getActiveImageUrl) ? 
                                        dbOperations.getActiveImageUrl(currentProduct, image.id) || image.url : 
                                        image.url;
                                    const hasCustomBackground = image.backgroundVersions?.some(v => v.isActive);
                                    
                                    return (
                                        <div key={image.id} className="relative">
                                            <img
                                                src={activeImageUrl}
                                                alt={image.altText || currentProduct.name}
                                                className="w-full h-32 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                                                onClick={() => {
                                                    setSelectedImageId(image.id);
                                                    setShowBackgroundCustomizer(true);
                                                }}
                                            />
                                            <div className="absolute top-2 left-2 flex gap-1">
                                                {image.isPrimary && (
                                                    <span className="bg-green-500 text-white px-2 py-1 text-xs rounded">
                                                        Primary
                                                    </span>
                                                )}
                                                {hasCustomBackground && (
                                                    <span className="bg-blue-500 text-white px-2 py-1 text-xs rounded">
                                                        Custom BG
                                                    </span>
                                                )}
                                            </div>
                                            <div className="absolute top-2 right-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedImageId(image.id);
                                                        setShowBackgroundCustomizer(true);
                                                    }}
                                                    className="bg-black bg-opacity-50 text-white p-1 rounded hover:bg-opacity-70 transition-all"
                                                    title="Customize Background"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </button>
                                            </div>
                                            {image.altText && (
                                                <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">{image.altText}</p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-sm text-gray-500 dark:text-gray-400">No images uploaded</p>
                            </div>
                        )}
                    </Card>

                    {/* Quick Actions */}
                    <Card title="Quick Actions" className="mt-6">
                        <div className="space-y-3">
                            <Button variant="primary" className="w-full" onClick={() => onCreateCampaign(product)}>
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Create Campaign
                            </Button>
                            <Button variant="light" className="w-full" onClick={() => onEdit(product)}>
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Product
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Background Customizer Modal */}
            {showBackgroundCustomizer && selectedImageId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Customize Background
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowBackgroundCustomizer(false);
                                        setSelectedImageId(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <BackgroundCustomizer
                                product={currentProduct}
                                imageId={selectedImageId}
                                onBackgroundChange={handleBackgroundChange}
                                dbOperations={dbOperations}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Add new LeftNav component
function LeftNav({ onNavigate }) {
    const { appView: currentView } = useContext(AppContext);
    const [isDarkMode, setIsDarkMode] = useState(false);
    
    // Check dark mode status on component mount
    useEffect(() => {
        const htmlElement = document.documentElement;
        setIsDarkMode(htmlElement.classList.contains('dark'));
    }, []);
    
    const toggleDarkMode = () => {
        const htmlElement = document.documentElement;
        htmlElement.classList.toggle('dark');
        const newDarkMode = htmlElement.classList.contains('dark');
        setIsDarkMode(newDarkMode);
        localStorage.setItem('darkMode', newDarkMode ? 'dark' : 'light');
    };
    
    return (
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen dark:bg-gray-800 dark:border-gray-700">
            <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
                <img
                    src={spinsLogo}
                    alt="SPINS"
                    className="h-14"
                    onError={(e) => {
                        console.error('Logo failed to load:', e);
                        e.target.style.display = 'none';
                    }}
                />
                <button
                    type="button"
                    className="p-1.5 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                    onClick={toggleDarkMode}
                    title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                >
                    {isDarkMode ? (
                        // Sun icon for light mode
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    ) : (
                        // Moon icon for dark mode
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    )}
                </button>
            </div>
            
            <div className="px-4 py-6">
                <div className="space-y-1">
                    <h2 className="px-2 text-xs font-semibold text-[#0B2265] uppercase tracking-wider dark:text-gray-200">Planning & Intelligence</h2>
                    <button
                        onClick={() => onNavigate(APP_VIEW_INSIGHTS)}
                        className={`w-full flex items-center px-2 py-2 text-sm rounded-lg ${
                            currentView === APP_VIEW_INSIGHTS
                                ? 'bg-[#EEF2FF] text-blue-700 dark:text-blue-400 dark:font-semibold'
                                : 'bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                    >
                        <svg className="mr-3 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        Insights
                    </button>
                    <button
                        onClick={() => onNavigate(APP_VIEW_PRODUCT_MANAGER)}
                        className={`w-full flex items-center px-2 py-2 text-sm rounded-lg ${
                            currentView === APP_VIEW_PRODUCT_MANAGER || currentView === APP_VIEW_PRODUCT_DETAILS || currentView === APP_VIEW_PRODUCT_FORM
                                ? 'bg-[#EEF2FF] text-blue-700 dark:text-blue-400 dark:font-semibold'
                                : 'bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                    >
                        <svg className="mr-3 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        Products
                    </button>
                </div>
                
                <div className="mt-8 space-y-1">
                    <h2 className="px-2 text-xs font-semibold text-[#0B2265] uppercase tracking-wider dark:text-gray-200">CREATE</h2>
                    <button
                        onClick={() => onNavigate(APP_VIEW_CAMPAIGN_FLOW_V2)}
                        className={`w-full flex items-center px-2 py-2 text-sm rounded-lg ${
                            currentView === APP_VIEW_CAMPAIGN_FLOW_V2
                                ? 'bg-[#EEF2FF] text-blue-700 dark:text-blue-400 dark:font-semibold'
                                : 'bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                    >
                        <svg className="mr-3 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 110 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 11-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 11-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 112 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 110 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 110-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Campaign Builder (new)
                    </button>
                    <button
                        onClick={() => onNavigate(APP_VIEW_CAMPAIGN_BUILDER)}
                        className={`w-full flex items-center px-2 py-2 text-sm rounded-lg ${
                            currentView === APP_VIEW_CAMPAIGN_BUILDER
                                ? 'bg-[#EEF2FF] text-blue-700 dark:text-blue-400 dark:font-semibold'
                                : 'bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                    >
                        <svg className="mr-3 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5V4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        Campaign Builder
                    </button>
                    <button
                        onClick={() => onNavigate(APP_VIEW_SHOPPABLE_LANDING_PAGES)}
                        className={`w-full flex items-center px-2 py-2 text-sm rounded-lg ${
                            currentView === APP_VIEW_SHOPPABLE_LANDING_PAGES
                                ? 'bg-[#EEF2FF] text-blue-700 dark:text-blue-400 dark:font-semibold'
                                : 'bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                    >
                        <svg className="mr-3 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                        </svg>
                        Shoppable Landing Pages
                    </button>
                    <button
                        onClick={() => onNavigate(APP_VIEW_SHOPPABLE_LINKS)}
                        className={`w-full flex items-center px-2 py-2 text-sm rounded-lg ${
                            currentView === APP_VIEW_SHOPPABLE_LINKS
                                ? 'bg-[#EEF2FF] text-blue-700 dark:text-blue-400 dark:font-semibold'
                                : 'bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                    >
                        <svg className="mr-3 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                        </svg>
                        Shoppable Links
                    </button>
                    <button
                        onClick={() => onNavigate(APP_VIEW_SHOPPABLE_RECIPES)}
                        className={`w-full flex items-center px-2 py-2 text-sm rounded-lg ${
                            currentView === APP_VIEW_SHOPPABLE_RECIPES
                                ? 'bg-[#EEF2FF] text-blue-700 dark:text-blue-400 dark:font-semibold'
                                : 'bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                    >
                        <svg className="mr-3 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM14 9a1 1 0 011 1v6a1 1 0 11-2 0v-6a1 1 0 011-1zM16 9a1 1 0 011 1v6a1 1 0 11-2 0v-6a1 1 0 011-1z" />
                        </svg>
                        Shoppable Recipes
                    </button>
                    <button
                        onClick={() => onNavigate(APP_VIEW_QR_CODES)}
                        className={`w-full flex items-center px-2 py-2 text-sm rounded-lg ${
                            currentView === APP_VIEW_QR_CODES
                                ? 'bg-[#EEF2FF] text-blue-700 dark:text-blue-400 dark:font-semibold'
                                : 'bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                    >
                        <svg className="mr-3 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1V4a1 1 0 011-1h3zm-1 2v1h-1V5h1zM11 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3zm2 2v-1h1v1h-1zM2 2h16v16H2V2z" clipRule="evenodd" />
                        </svg>
                        QR Codes
                    </button>
                </div>

                <div className="mt-8 space-y-1">
                    <h2 className="px-2 text-xs font-semibold text-[#0B2265] uppercase tracking-wider dark:text-gray-200">MEASUREMENT</h2>
                    <button
                        onClick={() => onNavigate(APP_VIEW_CAMPAIGN_MANAGER)}
                        className={`w-full flex items-center px-2 py-2 text-sm rounded-lg ${
                            currentView === APP_VIEW_CAMPAIGN_MANAGER
                                ? 'bg-[#EEF2FF] text-blue-700 dark:text-blue-400 dark:font-semibold'
                                : 'bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                    >
                        <svg className="mr-3 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zM3 16a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" />
                        </svg>
                        Campaign Manager
                    </button>
                    <button
                        onClick={() => onNavigate(APP_VIEW_LOCATORS)}
                        className={`w-full flex items-center px-2 py-2 text-sm rounded-lg ${
                            currentView === APP_VIEW_LOCATORS
                                ? 'bg-[#EEF2FF] text-blue-700 dark:text-blue-400 dark:font-semibold'
                                : 'bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                    >
                        <svg className="mr-3 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        Locators
                    </button>
                    <button
                        onClick={() => onNavigate(APP_VIEW_SHOPPABLE_LANDING_PAGES)}
                        className={`w-full flex items-center px-2 py-2 text-sm rounded-lg ${
                            currentView === APP_VIEW_SHOPPABLE_LANDING_PAGES
                                ? 'bg-[#EEF2FF] text-blue-700 dark:text-blue-400 dark:font-semibold'
                                : 'bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                    >
                        <svg className="mr-3 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                        </svg>
                        Shoppable Landing Pages
                    </button>
                    <button
                        onClick={() => onNavigate(APP_VIEW_SHOPPABLE_LINKS)}
                        className={`w-full flex items-center px-2 py-2 text-sm rounded-lg ${
                            currentView === APP_VIEW_SHOPPABLE_LINKS
                                ? 'bg-[#EEF2FF] text-blue-700 dark:text-blue-400 dark:font-semibold'
                                : 'bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                    >
                        <svg className="mr-3 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                        </svg>
                        Shoppable Links
                    </button>
                </div>

                <div className="mt-8 space-y-1">
                    <h2 className="px-2 text-xs font-semibold text-[#0B2265] uppercase tracking-wider dark:text-gray-200">IDEATION</h2>
                    <a
                        href="https://www.vibertise.com/login"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center px-2 py-2 text-sm rounded-lg bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700"
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
                        className="w-full flex items-center px-2 py-2 text-sm rounded-lg bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        <svg className="mr-3 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                        </svg>
                        Copy Brainstorm
                    </a>
                </div>

                <div className="mt-8 space-y-1">
                    <h2 className="px-2 text-xs font-semibold text-[#0B2265] uppercase tracking-wider dark:text-gray-200">INTEGRATIONS</h2>
                    <button
                        onClick={() => onNavigate(APP_VIEW_AD_PLATFORMS)}
                        className={`w-full flex items-center px-2 py-2 text-sm rounded-lg ${
                            currentView === APP_VIEW_AD_PLATFORMS
                                ? 'bg-[#EEF2FF] text-blue-700 dark:text-blue-400 dark:font-semibold'
                                : 'bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                    >
                        <svg className="mr-3 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                        </svg>
                        Platform Integrations
                    </button>
                </div>

                <div className="mt-8 space-y-1">
                    <h2 className="px-2 text-xs font-semibold text-[#0B2265] uppercase tracking-wider dark:text-gray-200">ACCOUNT</h2>
                    <button
                        onClick={() => onNavigate(APP_VIEW_ACCOUNT)}
                        className={`w-full flex items-center px-2 py-2 text-sm rounded-lg ${
                            currentView === APP_VIEW_ACCOUNT
                                ? 'bg-[#EEF2FF] text-blue-700 dark:text-blue-400 dark:font-semibold'
                                : 'bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                    >
                        <svg className="mr-3 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                        Account
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
    const [currentView, setCurrentView] = useState(VIEW_CREATE_CAMPAIGN);
    const [adData, setAdData] = useState(null);
    const [campaignSettings, setCampaignSettings] = useState(null);
    const [appView, setAppView] = useState(APP_VIEW_CAMPAIGN_MANAGER);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showMigrationUI, setShowMigrationUI] = useState(false);
    
    // Database integration state
    const [databaseStatus, setDatabaseStatus] = useState(null);
    const [isInitializing, setIsInitializing] = useState(true);

    // Initialize database adapter and check status
    useEffect(() => {
        const initializeDatabase = async () => {
            try {
                console.log('🚀 Initializing database adapter...');
                
                // Initialize cache and check migration status
                await databaseAdapter.initializeCache();
                const status = await databaseAdapter.getHealthStatus();
                
                setDatabaseStatus(status);
                console.log('📊 Database status:', status);
                
                // Show migration UI if enabled and data exists for migration
                if (FEATURES.SHOW_MIGRATION_UI && !databaseAdapter.isUsingDatabase()) {
                    const localCampaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
                    const localProducts = JSON.parse(localStorage.getItem('products') || '[]');
                    
                    if (localCampaigns.length > 0 || localProducts.length > 0) {
                        setShowMigrationUI(true);
                    }
                }
            } catch (error) {
                console.error('❌ Failed to initialize database:', error);
                setDatabaseStatus({ error: error.message });
            } finally {
                setIsInitializing(false);
            }
        };

        initializeDatabase();
        
        // Make debug function available globally for testing
        window.debugCampaigns = debugCampaigns;
    }, []);

    // Database Operations (integrated with database adapter) - MEMOIZED to prevent re-creation
    const dbOperations = useMemo(() => ({
        saveAd: async (adData) => {
            // Use database adapter which handles the database/localStorage routing
            return await databaseAdapter.saveAd(adData);
        },

        getCampaigns: () => {
            // Use synchronous method for immediate access (reads from cache)
            return databaseAdapter.getCampaigns();
        },

        // Async version for when fresh data is needed
        getCampaignsAsync: async () => {
            return await databaseAdapter.getCampaignsAsync();
        },

        // Utility function to clear old campaigns if storage is getting full
        clearOldCampaigns: async () => {
            // Use database adapter which handles the database/localStorage routing
            return await databaseAdapter.clearOldCampaigns();
        },

        // Get storage usage info
        getStorageInfo: async () => {
            // Use database adapter which handles the database/localStorage routing
            return await databaseAdapter.getStorageInfo();
        },

        // Product operations
        saveProduct: async (productData) => {
            // Use database adapter which handles the database/localStorage routing
            return await databaseAdapter.saveProduct(productData);
        },

        getProducts: () => {
            // Use synchronous method for immediate access (reads from cache)
            return databaseAdapter.getProducts();
        },

        // Async version for when fresh data is needed
        getProductsAsync: async () => {
            return await databaseAdapter.getProductsAsync();
        },

        updateProduct: async (productId, updates) => {
            // Use database adapter which handles the database/localStorage routing
            return await databaseAdapter.updateProduct(productId, updates);
        },

        deleteProduct: async (productId) => {
            // Use database adapter which handles the database/localStorage routing
            return await databaseAdapter.deleteProduct(productId);
        },

        // Database management operations
        getDatabaseStatus: () => databaseStatus,
        isUsingDatabase: () => databaseAdapter.isUsingDatabase(),
        getMigrationStatus: () => databaseAdapter.getMigrationStatus(),
        runMigration: async () => await databaseAdapter.runMigration(),
        validateMigration: async () => await databaseAdapter.validateMigration(),

        // Campaign Draft operations (V2 Flow)
        saveCampaignDraft: async (campaignId, stepData) => {
            return await databaseAdapter.saveCampaignDraft(campaignId, stepData);
        },
        getCampaignDraft: async (campaignId) => {
            return await databaseAdapter.getCampaignDraft(campaignId);
        },
        deleteCampaignDraft: async (campaignId) => {
            return await databaseAdapter.deleteCampaignDraft(campaignId);
        },

        // Background operations for Phase 2 features
        storeBackground: (imageUrl, prompt) => {
            try {
                const backgrounds = JSON.parse(localStorage.getItem('backgrounds') || '[]');
                const newBackground = {
                    id: String(Date.now()),
                    imageUrl,
                    prompt,
                    created: new Date().toISOString()
                };
                backgrounds.push(newBackground);
                localStorage.setItem('backgrounds', JSON.stringify(backgrounds));
                return { success: true, background: newBackground };
            } catch (error) {
                console.error('Error storing background:', error);
                return { success: false, error: error.message };
            }
        },

                 getBackgrounds: () => {
             try {
                 return JSON.parse(localStorage.getItem('backgrounds') || '[]');
             } catch (error) {
                 console.error('Error getting backgrounds:', error);
                 return [];
             }
         },

         // Background change operations for product management
         addBackgroundVersion: (productId, imageId, backgroundData) => {
             try {
                 const products = JSON.parse(localStorage.getItem('products') || '[]');
                 const productIndex = products.findIndex(p => p.id === productId);
                 
                 if (productIndex === -1) {
                     return { success: false, error: 'Product not found' };
                 }

                 const product = products[productIndex];
                 const imageIndex = product.images.findIndex(img => img.id === imageId);
                 
                 if (imageIndex === -1) {
                     return { success: false, error: 'Image not found' };
                 }

                 // Initialize backgroundVersions if it doesn't exist
                 if (!product.images[imageIndex].backgroundVersions) {
                     product.images[imageIndex].backgroundVersions = [];
                 }

                 // Add new background version
                 const backgroundVersion = {
                     id: `bg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                     url: backgroundData.imageUrl,
                     prompt: backgroundData.prompt,
                     requestId: backgroundData.requestId,
                     processingTime: backgroundData.processingTime,
                     metadata: backgroundData.metadata,
                     created: new Date().toISOString(),
                     isActive: false // Will be set to true when selected
                 };

                 product.images[imageIndex].backgroundVersions.push(backgroundVersion);
                 
                 // Update product timestamp
                 product.updated = new Date().toISOString();
                 
                 localStorage.setItem('products', JSON.stringify(products));
                 
                 return { success: true, backgroundVersion, product: product };
             } catch (error) {
                 console.error('Error adding background version:', error);
                 return { success: false, error: error.message };
             }
         },

         setActiveBackgroundVersion: (productId, imageId, backgroundVersionId) => {
             try {
                 const products = JSON.parse(localStorage.getItem('products') || '[]');
                 const productIndex = products.findIndex(p => p.id === productId);
                 
                 if (productIndex === -1) {
                     return { success: false, error: 'Product not found' };
                 }

                 const product = products[productIndex];
                 const imageIndex = product.images.findIndex(img => img.id === imageId);
                 
                 if (imageIndex === -1) {
                     return { success: false, error: 'Image not found' };
                 }

                 const backgroundVersions = product.images[imageIndex].backgroundVersions || [];
                 
                 // Set all versions to inactive
                 backgroundVersions.forEach(version => {
                     version.isActive = false;
                 });

                 // Set the selected version to active (null means original image)
                 if (backgroundVersionId !== null) {
                     const versionIndex = backgroundVersions.findIndex(v => v.id === backgroundVersionId);
                     if (versionIndex === -1) {
                         return { success: false, error: 'Background version not found' };
                     }
                     backgroundVersions[versionIndex].isActive = true;
                 }

                 // Update product timestamp
                 product.updated = new Date().toISOString();
                 
                 localStorage.setItem('products', JSON.stringify(products));
                 
                 return { success: true, product: product };
             } catch (error) {
                 console.error('Error setting active background version:', error);
                 return { success: false, error: error.message };
             }
         },

         deleteBackgroundVersion: (productId, imageId, backgroundVersionId) => {
             try {
                 const products = JSON.parse(localStorage.getItem('products') || '[]');
                 const productIndex = products.findIndex(p => p.id === productId);
                 
                 if (productIndex === -1) {
                     return { success: false, error: 'Product not found' };
                 }

                 const product = products[productIndex];
                 const imageIndex = product.images.findIndex(img => img.id === imageId);
                 
                 if (imageIndex === -1) {
                     return { success: false, error: 'Image not found' };
                 }

                 if (!product.images[imageIndex].backgroundVersions) {
                     return { success: false, error: 'No background versions found' };
                 }

                 // Remove the background version
                 product.images[imageIndex].backgroundVersions = 
                     product.images[imageIndex].backgroundVersions.filter(v => v.id !== backgroundVersionId);

                 // Update product timestamp
                 product.updated = new Date().toISOString();
                 
                 localStorage.setItem('products', JSON.stringify(products));
                 
                 return { success: true, product: product };
             } catch (error) {
                 console.error('Error deleting background version:', error);
                 return { success: false, error: error.message };
             }
         },

         getActiveImageUrl: (product, imageId) => {
             try {
                 const image = product.images.find(img => img.id === imageId);
                 if (!image) return null;

                 // Check if there's an active background version
                 const activeBackgroundVersion = image.backgroundVersions?.find(v => v.isActive);
                 
                 return activeBackgroundVersion ? activeBackgroundVersion.url : image.url;
             } catch (error) {
                 console.error('Error getting active image URL:', error);
                 return null;
             }
         }
     }), []); // Empty dependency array - only create once

    // Browser history management for Campaign Builder
    const updateUrlFragment = (view) => {
        if (appView === APP_VIEW_CAMPAIGN_BUILDER) {
            const fragmentMap = {
                [VIEW_CREATE_CAMPAIGN]: '#campaign-setup',
                [VIEW_START]: '#asset-source',
                [VIEW_UPLOAD]: '#upload-assets',
                [VIEW_URL]: '#url-input',
                [VIEW_PRODUCT_IMAGES]: '#product-images',
                [VIEW_CUSTOMIZE]: '#customize',
                [VIEW_PUBLISH]: '#publish'
            };
            
            const fragment = fragmentMap[view];
            if (fragment && window.location.hash !== fragment) {
                // Use replaceState to avoid creating too many history entries during initial setup
                const method = window.location.hash ? 'pushState' : 'replaceState';
                window.history[method](null, '', fragment);
            }
        }
    };

    // Handle browser back/forward navigation and initial hash detection
    useEffect(() => {
        const handlePopState = () => {
            if (appView === APP_VIEW_CAMPAIGN_BUILDER) {
                const hash = window.location.hash;
                const viewMap = {
                    '#campaign-setup': VIEW_CREATE_CAMPAIGN,
                    '#asset-source': VIEW_START,
                    '#upload-assets': VIEW_UPLOAD,
                    '#url-input': VIEW_URL,
                    '#product-images': VIEW_PRODUCT_IMAGES,
                    '#customize': VIEW_CUSTOMIZE,
                    '#publish': VIEW_PUBLISH
                };
                
                const newView = viewMap[hash];
                if (newView && newView !== currentView) {
                    // Validate if the transition is allowed based on current state
                    const isValidTransition = validateViewTransition(currentView, newView);
                    if (isValidTransition) {
                        setCurrentView(newView);
                    } else {
                        // If transition is not valid, update URL to match current valid state
                        updateUrlFragment(currentView);
                    }
                }
            } else if (appView === APP_VIEW_CAMPAIGN_FLOW_V2) {
                // Campaign Flow V2 handles its own navigation internally
                const hash = window.location.hash;
                if (!hash.startsWith('#step-') && hash !== '#campaign-flow-v2') {
                    // If someone navigates to a non-step hash while in V2, handle it
                    handleInitialHash();
                }
            }
        };

        // Check for initial hash on page load to determine which view to show
        const handleInitialHash = () => {
            const hash = window.location.hash;
            if (hash === '#campaign-builder-v2' || hash === '#campaign-flow-v2' || hash.startsWith('#step-')) {
                // Navigate to Campaign Builder V2 (including step-specific hashes)
                setAppView(APP_VIEW_CAMPAIGN_FLOW_V2);
                setSelectedProduct(null);
            } else if (hash === '#campaign-setup') {
                // Navigate to legacy Campaign Builder
                setAppView(APP_VIEW_CAMPAIGN_BUILDER);
                setCurrentViewWithHistory(VIEW_CREATE_CAMPAIGN);
                setAdData(null);
                setCampaignSettings(null);
            }
        };

        // Set initial fragment when entering Campaign Builder
        if (appView === APP_VIEW_CAMPAIGN_BUILDER) {
            updateUrlFragment(currentView);
        } else if (appView === APP_VIEW_CAMPAIGN_FLOW_V2) {
            // Set hash for V2 flow
            if (window.location.hash !== '#campaign-flow-v2') {
                window.history.replaceState(null, '', '#campaign-flow-v2');
            }
        }

        // Check hash on initial load
        if (appView !== APP_VIEW_CAMPAIGN_BUILDER && appView !== APP_VIEW_CAMPAIGN_FLOW_V2) {
            handleInitialHash();
        }

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [appView, currentView]);

    // Validate if a view transition is allowed
    const validateViewTransition = (fromView, toView) => {
        // Define valid transitions - users can go back but not skip forward
        const validTransitions = {
            [VIEW_CREATE_CAMPAIGN]: [VIEW_START], // Can only go forward to start
            [VIEW_START]: [VIEW_CREATE_CAMPAIGN, VIEW_UPLOAD, VIEW_URL, VIEW_PRODUCT_IMAGES], // Can go back or to any asset option
            [VIEW_UPLOAD]: [VIEW_START, VIEW_CUSTOMIZE], // Can go back to start or forward to customize if data exists
            [VIEW_URL]: [VIEW_START, VIEW_CUSTOMIZE], // Can go back to start or forward to customize if data exists
            [VIEW_PRODUCT_IMAGES]: [VIEW_START, VIEW_CUSTOMIZE], // Can go back to start or forward to customize if data exists
            [VIEW_CUSTOMIZE]: [VIEW_UPLOAD, VIEW_URL, VIEW_PRODUCT_IMAGES, VIEW_PUBLISH], // Can go back to any asset view or forward to publish
            [VIEW_PUBLISH]: [VIEW_CUSTOMIZE] // Can only go back to customize
        };

        // Always allow going back to campaign creation
        if (toView === VIEW_CREATE_CAMPAIGN) {
            return true;
        }

        // Check if transition is in valid transitions list
        const allowedFromCurrent = validTransitions[fromView] || [];
        if (allowedFromCurrent.includes(toView)) {
            // Additional validation for forward transitions that require data
            if (toView === VIEW_CUSTOMIZE && !adData) {
                return false; // Can't go to customize without ad data
            }
            if (toView === VIEW_PUBLISH && (!adData || !campaignSettings)) {
                return false; // Can't go to publish without full data
            }
            return true;
        }

        return false;
    };

    // Enhanced view change handler that updates URL
    const setCurrentViewWithHistory = (newView) => {
        setCurrentView(newView);
        updateUrlFragment(newView);
    };
    
    // Initialize dark mode based on saved preference or system preference
    useEffect(() => {
        const savedTheme = localStorage.getItem('darkMode');
        const htmlElement = document.documentElement;
        
        if (savedTheme === 'dark') {
            htmlElement.classList.add('dark');
        } else if (savedTheme === 'light') {
            htmlElement.classList.remove('dark');
        } else {
            // If no saved preference, check system preference
            const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDarkMode) {
                htmlElement.classList.add('dark');
            }
        }

        // Load sample data for demonstration
        loadSampleData();
    }, []);

    // --- Event Handlers ---

    // Handler for when campaign/audience is created (receives object)
    const handleCampaignCreated = (settings) => { // Renamed handler
        setCampaignSettings(settings); // Store the campaign settings object
        setAdData(null); // Reset ad data
        setCurrentViewWithHistory(VIEW_START); // Move to the next step (Upload/URL choice)
    };

    const handleSelectUpload = () => {
        setCurrentViewWithHistory(VIEW_UPLOAD);
    };

    const handleSelectUrl = () => {
        setCurrentViewWithHistory(VIEW_URL);
    };

    const handleSelectProductImages = () => {
        setCurrentViewWithHistory(VIEW_PRODUCT_IMAGES);
    };

    // Stores the initial data (image/product info)
    const handleInitialDataReceived = (initialData) => {
        console.log("Initial Data Received:", initialData);
        setAdData({
            ...initialData,
            campaignName: campaignSettings?.campaign?.name || 'Unnamed Campaign',
            productId: campaignSettings?.campaign?.productId || initialData?.productId || null,
            audience: campaignSettings?.audience || {
                type: DEFAULT_AUDIENCE_TYPE,
                dietOverlay: [],
                specificRetailers: [],
                specificRegions: []
            },
            // Include UTM data and product information
            utmData: initialData?.utmData || null,
            product: campaignSettings?.product || null
        });
        setCurrentViewWithHistory(VIEW_CUSTOMIZE); // Move to customization view
    };

    // Stores the fully customized data before going to publish
    const handleGoToPublish = (customizedData) => {
        // Campaign/Audience info should already be in customizedData from AdCustomization step
        console.log("🚀 Final Data for Publish:", customizedData);
        console.log('📊 Canvas data included:', {
            hasCanvasData: !!customizedData.canvasData,
            hasElements: customizedData.elements?.length > 0,
            elementsCount: customizedData.elements?.length || 0,
            elementsTypes: customizedData.elements?.map(el => el.type) || []
        });
        setAdData(customizedData); // Update adData with customizations
        setCurrentViewWithHistory(VIEW_PUBLISH);
    }

    const handleBackToCustomize = () => {
        // adData already holds the customized data, just switch view
        setCurrentViewWithHistory(VIEW_CUSTOMIZE);
    }

    // Start Over should go back to Create Campaign now
    const handleStartOver = () => {
        setAdData(null);
        setCampaignSettings(null); // Reset campaign settings
        setCurrentViewWithHistory(VIEW_CREATE_CAMPAIGN); // Go back to first step
    }

    // Function to switch to Campaign Builder
    const handleCreateNewCampaign = () => {
        // Check if new campaign flow is enabled
        if (isFeatureEnabled('NEW_CAMPAIGN_FLOW')) {
            setAppView(APP_VIEW_CAMPAIGN_FLOW_V2);
        } else {
            setAppView(APP_VIEW_CAMPAIGN_BUILDER);
            setCurrentViewWithHistory(VIEW_CREATE_CAMPAIGN);
        }
        setAdData(null);
        setCampaignSettings(null);
    }

    // Function to return to Campaign Manager
    const handleReturnToManager = () => {
        // Clear URL fragment when leaving Campaign Builder or V2 flow
        if ((appView === APP_VIEW_CAMPAIGN_BUILDER || appView === APP_VIEW_CAMPAIGN_FLOW_V2) && window.location.hash) {
            window.history.replaceState(null, '', window.location.pathname);
        }
        setAppView(APP_VIEW_CAMPAIGN_MANAGER);
    };

    const handleCampaignClick = (campaign) => {
        // Smart routing based on campaign source and V2 availability
        if (isFeatureEnabled('NEW_CAMPAIGN_FLOW')) {
            // Route all campaigns to V2 flow for editing (deprecate old details view)
            setSelectedCampaign(campaign);
            setAppView(APP_VIEW_CAMPAIGN_FLOW_V2);
            
            // Set URL hash for V2 editing mode
            window.history.replaceState(null, '', '#campaign-flow-v2');
        } else {
            // Fallback to details view if V2 is not enabled
            setSelectedCampaign(campaign);
            setAppView(APP_VIEW_CAMPAIGN_DETAILS);
        }
    };

    const handleBackToCampaigns = () => {
        setSelectedCampaign(null);
        setAppView(APP_VIEW_CAMPAIGN_MANAGER);
    };

    const handleSaveAndExit = async (settings) => {
        try {
            // Create a campaign with minimal data, including product linkage
            const result = await Promise.resolve(dbOperations.saveAd({
                campaignName: settings.campaign.name,
                productId: settings.campaign.productId, // Include product linkage
                audience: settings.audience,
                // Add minimal required fields
                ctaType: CTA_TYPE_TEXT,
                adSize: DEFAULT_AD_SIZE
            }));
            
            if (result.success) {
                // Return to campaign manager
                setAppView(APP_VIEW_CAMPAIGN_MANAGER);
                // Clear selected product when exiting
                setSelectedProduct(null);
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
        setCurrentViewWithHistory(VIEW_PUBLISH);
    };

    // Product handlers
    const handleCreateNewProduct = () => {
        setAppView(APP_VIEW_PRODUCT_FORM);
        setSelectedProduct(null);
    };

    const handleProductClick = (product) => {
        setSelectedProduct(product);
        setAppView(APP_VIEW_PRODUCT_DETAILS);
    };

    const handleEditProduct = (product) => {
        setSelectedProduct(product);
        setAppView(APP_VIEW_PRODUCT_FORM);
    };

    const handleProductSaved = (product) => {
        setAppView(APP_VIEW_PRODUCT_MANAGER);
        setSelectedProduct(null);
    };

    const handleCreateCampaignFromProduct = (product) => {
        setSelectedProduct(product);
        // Check if new campaign flow is enabled
        if (isFeatureEnabled('NEW_CAMPAIGN_FLOW')) {
            setAppView(APP_VIEW_CAMPAIGN_FLOW_V2);
        } else {
            setAppView(APP_VIEW_CAMPAIGN_BUILDER);
            setCurrentViewWithHistory(VIEW_CREATE_CAMPAIGN);
        }
        setAdData(null);
        setCampaignSettings(null);
    };

    // Prepare initial data for V2 flow (handles both new campaigns and editing existing ones)
    const getV2InitialData = () => {
        // If editing an existing campaign
        if (selectedCampaign) {
            console.log('🔄 Preparing V2 initial data for editing campaign:', selectedCampaign.name);
            
            // Check if this is already a V2 campaign with preserved data
            if (selectedCampaign.source === 'v2' && selectedCampaign.adData?.v2Data) {
                console.log('✅ Loading V2 campaign data');
                return {
                    id: selectedCampaign.id, // Preserve original ID
                    name: selectedCampaign.name,
                    status: selectedCampaign.status || 'draft',
                    createdAt: selectedCampaign.createdAt || selectedCampaign.created || new Date().toISOString(),
                    version: 2,
                    isEditMode: true, // Mark as edit mode
                    // Restore the original V2 step data
                    product: selectedCampaign.adData.v2Data.product || null,
                    audience: selectedCampaign.adData.v2Data.audience || null,
                    platforms: selectedCampaign.adData.v2Data.platforms || [],
                    creative: selectedCampaign.adData.v2Data.creative || {},
                    publish: selectedCampaign.adData.v2Data.publish || null
                };
            } else {
                // Legacy campaign - migrate to V2 format
                console.log('🔄 Migrating legacy campaign to V2 format');
                console.log('🔍 Legacy campaign adData:', selectedCampaign.adData);
                
                // Enhanced legacy data extraction
                const legacyData = selectedCampaign.adData || {};
                
                // Extract product data from various legacy formats
                const extractProductData = () => {
                    if (legacyData.productData) return legacyData.productData;
                    
                    // Try to extract from legacy ad data structure
                    const productInfo = {
                        name: legacyData.productName || legacyData.headline || selectedCampaign.name || 'Legacy Product',
                        brand: legacyData.brandName || legacyData.brand || '',
                        description: legacyData.description || legacyData.productDescription || '',
                        category: legacyData.category || legacyData.productCategory || 'general',
                        price: legacyData.price || legacyData.productPrice || '',
                        url: legacyData.clickUrl || legacyData.productUrl || legacyData.url || '',
                        images: [],
                        // Enhanced metadata preservation
                        tags: legacyData.tags || legacyData.productTags || [],
                        targetDemographic: legacyData.targetDemographic || legacyData.audienceType || '',
                        seasonality: legacyData.seasonality || '',
                        priceRange: legacyData.priceRange || 'mid'
                    };
                    
                    // Extract images from legacy format with enhanced metadata
                    if (legacyData.imageSrc) {
                        productInfo.images = [{ 
                            id: 'legacy-image-1',
                            url: legacyData.imageSrc, 
                            isPrimary: true,
                            altText: productInfo.name || 'Product Image',
                            metadata: {
                                sourceType: 'legacy',
                                processingStatus: 'completed'
                            }
                        }];
                    } else if (legacyData.productImages) {
                        productInfo.images = Array.isArray(legacyData.productImages) 
                            ? legacyData.productImages.map((img, index) => ({
                                id: `legacy-image-${index + 1}`,
                                url: typeof img === 'string' ? img : img.url,
                                isPrimary: index === 0,
                                altText: typeof img === 'object' ? img.altText : `${productInfo.name} Image ${index + 1}`,
                                metadata: {
                                    sourceType: 'legacy',
                                    processingStatus: 'completed'
                                }
                            }))
                            : [{ 
                                id: 'legacy-image-1',
                                url: legacyData.productImages, 
                                isPrimary: true,
                                altText: productInfo.name || 'Product Image',
                                metadata: {
                                    sourceType: 'legacy',
                                    processingStatus: 'completed'
                                }
                            }];
                    } else if (legacyData.images) {
                        productInfo.images = Array.isArray(legacyData.images) 
                            ? legacyData.images.map((img, index) => ({
                                id: `legacy-image-${index + 1}`,
                                url: typeof img === 'string' ? img : img.url,
                                isPrimary: index === 0,
                                altText: typeof img === 'object' ? img.altText : `${productInfo.name} Image ${index + 1}`,
                                metadata: {
                                    sourceType: 'legacy',
                                    processingStatus: 'completed'
                                }
                            }))
                            : [{ 
                                id: 'legacy-image-1',
                                url: legacyData.images, 
                                isPrimary: true,
                                altText: productInfo.name || 'Product Image',
                                metadata: {
                                    sourceType: 'legacy',
                                    processingStatus: 'completed'
                                }
                            }];
                    }
                    
                    // Try to extract additional product data from campaign settings
                    if (selectedCampaign.productId && selectedCampaign.adData) {
                        // Look for product data in campaign settings
                        const campaignProduct = selectedCampaign.adData.product;
                        if (campaignProduct) {
                            productInfo.name = campaignProduct.name || productInfo.name;
                            productInfo.brand = campaignProduct.brand || productInfo.brand;
                            productInfo.description = campaignProduct.description || productInfo.description;
                            productInfo.category = campaignProduct.category || productInfo.category;
                            productInfo.price = campaignProduct.price || productInfo.price;
                            productInfo.url = campaignProduct.url || productInfo.url;
                            productInfo.tags = campaignProduct.tags || productInfo.tags;
                            productInfo.targetDemographic = campaignProduct.targetDemographic || productInfo.targetDemographic;
                            productInfo.seasonality = campaignProduct.seasonality || productInfo.seasonality;
                            productInfo.priceRange = campaignProduct.priceRange || productInfo.priceRange;
                            
                            // Merge images if available
                            if (campaignProduct.images && campaignProduct.images.length > 0) {
                                productInfo.images = campaignProduct.images.map((img, index) => ({
                                    id: img.id || `campaign-image-${index + 1}`,
                                    url: img.url || img.src || img,
                                    isPrimary: img.isPrimary || index === 0,
                                    altText: img.altText || `${productInfo.name} Image ${index + 1}`,
                                    metadata: {
                                        sourceType: 'campaign',
                                        processingStatus: 'completed',
                                        ...img.metadata
                                    }
                                }));
                            }
                        }
                    }
                    
                    console.log('📦 Enhanced extracted product data:', productInfo);
                    return productInfo.name ? productInfo : null;
                };
                
                // Extract audience data from legacy format
                const extractAudienceData = () => {
                    if (legacyData.audienceData) return legacyData.audienceData;
                    
                    // Create basic audience from legacy targeting data
                    const audienceInfo = {
                        name: 'Legacy Audience',
                        demographics: {
                            age: legacyData.targetAge || [25, 54],
                            gender: legacyData.targetGender || 'all',
                            income: 'any',
                            education: 'any'
                        },
                        locations: {
                            countries: legacyData.targetCountries || ['US'],
                            regions: [],
                            cities: []
                        },
                        interests: legacyData.targetInterests || [],
                        behaviors: [],
                        estimatedSize: legacyData.estimatedReach || 50000
                    };
                    
                    console.log('🎯 Extracted audience data:', audienceInfo);
                    return audienceInfo;
                };
                
                // Extract platform data from legacy format
                const extractPlatformData = () => {
                    if (legacyData.platformData) return legacyData.platformData;
                    
                    const platformInfo = {
                        selectedPlatforms: legacyData.platforms || ['meta'],
                        totalBudget: legacyData.budget || legacyData.totalBudget || 1000,
                        budgetAllocation: 'auto',
                        campaignObjective: legacyData.objective || 'awareness',
                        duration: legacyData.duration || 7,
                        startDate: legacyData.startDate || new Date().toISOString().split('T')[0]
                    };
                    
                    console.log('🚀 Extracted platform data:', platformInfo);
                    return platformInfo;
                };
                
                // Extract creative data from legacy format
                const extractCreativeData = () => {
                    if (legacyData.creativeData) return legacyData.creativeData;
                    
                    const creativeInfo = {
                        selectedFormats: ['square'], // Default format
                        creatives: {},
                        generationSettings: {
                            style: 'modern',
                            tone: 'professional',
                            includePrice: true,
                            includeCTA: true
                        },
                        variations: 1,
                        aiGenerated: false
                    };
                    
                    // If we have legacy creative data, try to convert it
                    if (legacyData.headline || legacyData.description || legacyData.imageSrc) {
                        creativeInfo.creatives['square_1'] = {
                            id: 'square_1',
                            formatId: 'square',
                            elements: [
                                {
                                    type: 'text',
                                    content: legacyData.headline || 'Legacy Headline',
                                    style: { fontSize: 24, fontWeight: 'bold' }
                                },
                                {
                                    type: 'text', 
                                    content: legacyData.description || 'Legacy Description',
                                    style: { fontSize: 16 }
                                }
                            ]
                        };
                        
                        if (legacyData.imageSrc) {
                            creativeInfo.creatives['square_1'].elements.unshift({
                                type: 'image',
                                content: legacyData.imageSrc
                            });
                        }
                    }
                    
                    console.log('🎨 Extracted creative data:', creativeInfo);
                    return creativeInfo;
                };
                
                // Extract publish data from legacy format
                const extractPublishData = () => {
                    if (legacyData.publishData) return legacyData.publishData;
                    
                    return {
                        campaignName: selectedCampaign.name || 'Legacy Campaign',
                        saved: true,
                        savedAt: selectedCampaign.createdAt || selectedCampaign.created || new Date().toISOString(),
                        status: selectedCampaign.status || 'draft'
                    };
                };
                
                return {
                    id: selectedCampaign.id, // Preserve original ID
                    name: selectedCampaign.name,
                    status: selectedCampaign.status || 'draft',
                    createdAt: selectedCampaign.createdAt || selectedCampaign.created || new Date().toISOString(),
                    version: 2,
                    isEditMode: true, // Mark as edit mode
                    // Enhanced data extraction
                    product: extractProductData(),
                    audience: extractAudienceData(),
                    platforms: extractPlatformData(),
                    creative: extractCreativeData(),
                    publish: extractPublishData()
                };
            }
        }
        
        // If creating new campaign with selected product
        if (selectedProduct) {
            console.log('🆕 Preparing V2 initial data for new campaign with product:', selectedProduct.name);
            return { 
                product: selectedProduct,
                name: `${selectedProduct.name} Campaign`,
                version: 2,
                isEditMode: false // Explicitly mark as new campaign
            };
        }
        
        // Default for new campaign
        console.log('🆕 Preparing V2 initial data for new campaign');
        return { 
            version: 2,
            name: `Campaign ${new Date().getFullYear()}`,
            isEditMode: false // Explicitly mark as new campaign
        };
    };

    // V2 Campaign Flow handlers
    const handleCampaignFlowV2Complete = (campaignData) => {
        console.log('Campaign Flow V2 completed:', campaignData);
        // Return to campaign manager after completion
        setAppView(APP_VIEW_CAMPAIGN_MANAGER);
        setSelectedProduct(null);
        setSelectedCampaign(null); // Clear selected campaign when done editing
    };

    const handleCampaignFlowV2Cancel = () => {
        // Return to campaign manager if cancelled
        setAppView(APP_VIEW_CAMPAIGN_MANAGER);
        setSelectedProduct(null);
        setSelectedCampaign(null); // Clear selected campaign when cancelled
    };

    // --- Render Logic ---

    // Function to render the current view based on state
    const renderCurrentView = () => {
        switch (currentView) {
            case VIEW_CREATE_CAMPAIGN:
                return <CreateCampaignScreen 
                    onCampaignCreated={handleCampaignCreated}
                    onSaveAndExit={handleSaveAndExit}
                    selectedProduct={selectedProduct}
                    dbOperations={dbOperations}
                />;
            case VIEW_START:
                return <StartScreen
                    onSelectUpload={handleSelectUpload}
                    onSelectUrl={handleSelectUrl}
                    onSelectProductImages={handleSelectProductImages}
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
            case VIEW_PRODUCT_IMAGES:
                return <ProductImageSelection
                            onImageSelected={handleInitialDataReceived}
                            campaignSettings={campaignSettings}
                        />;
            case VIEW_CUSTOMIZE:
                // Pass initial adData and campaign settings
                return <AdCustomization
                            adData={adData}
                            campaignSettings={campaignSettings} // Pass campaign settings object
                            onPublish={handleGoToPublish}
                            dbOperations={dbOperations}
                        />;
            case VIEW_PUBLISH:
                // Pass the fully customized adData and the back handler
                return <PublishScreen adData={adData} onBack={handleBackToCustomize} dbOperations={dbOperations} />;
            default: // Default to the new starting view
                return <CreateCampaignScreen 
                    onCampaignCreated={handleCampaignCreated} 
                    dbOperations={dbOperations}
                />;
        }
    };

    return (
        <AppContext.Provider value={{ appView, setAppView }}>
            <div className="min-h-screen bg-gray-50 flex dark:bg-gray-900">
                {/* Left Navigation */}
                <LeftNav onNavigate={(view) => {
                    // Clear URL fragment when leaving Campaign Builder or V2 flow
                    if ((appView === APP_VIEW_CAMPAIGN_BUILDER && view !== APP_VIEW_CAMPAIGN_BUILDER) ||
                        (appView === APP_VIEW_CAMPAIGN_FLOW_V2 && view !== APP_VIEW_CAMPAIGN_FLOW_V2)) {
                        if (window.location.hash) {
                            window.history.replaceState(null, '', window.location.pathname);
                        }
                    }
                    
                    setAppView(view);
                    
                    if (view === APP_VIEW_CAMPAIGN_BUILDER) {
                        setCurrentViewWithHistory(VIEW_CREATE_CAMPAIGN);
                        setAdData(null);
                        setCampaignSettings(null);
                    }
                    
                    // Reset any selected product when navigating to Campaign Builder V2
                    if (view === APP_VIEW_CAMPAIGN_FLOW_V2) {
                        setSelectedProduct(null);
                        // Set the V2 hash
                        window.history.replaceState(null, '', '#campaign-flow-v2');
                    }
                }} />

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    <div className="h-16 bg-white border-b border-gray-200 flex items-center px-8 dark:bg-gray-800 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-[#0B2265] dark:text-gray-200">
                            {appView === APP_VIEW_PRODUCT_MANAGER ? 'Product Manager' :
                            appView === APP_VIEW_PRODUCT_DETAILS ? `${selectedProduct?.name || 'Product Details'}` :
                            appView === APP_VIEW_PRODUCT_FORM ? (selectedProduct ? `Edit ${selectedProduct.name}` : 'Add New Product') :
                            appView === APP_VIEW_CAMPAIGN_MANAGER ? 'Campaign Manager' : 
                            appView === APP_VIEW_CAMPAIGN_FLOW_V2 ? 'Campaign Builder (Enhanced)' :
                            appView === APP_VIEW_CAMPAIGN_DETAILS ? `${selectedCampaign?.name || 'Campaign Details'}` :
                            appView === APP_VIEW_AD_PLATFORMS ? 'Platform Integrations' :
                            appView === APP_VIEW_INSIGHTS ? 'Market Insights' :
                            appView === APP_VIEW_SHOPPABLE_LANDING_PAGES ? 'Shoppable Landing Pages' :
                            appView === APP_VIEW_SHOPPABLE_LINKS ? 'Shoppable Links' :
                            appView === APP_VIEW_SHOPPABLE_RECIPES ? 'Shoppable Recipes' :
                            appView === APP_VIEW_QR_CODES ? 'QR Codes' :
                            appView === APP_VIEW_LOCATORS ? 'Locators' :
                            appView === APP_VIEW_ACCOUNT ? 'Account Settings' :
                            'Campaign Builder'}
                        </h2>
                    </div>

                    <main className="flex-1 overflow-y-auto p-8">
                        {appView === APP_VIEW_PRODUCT_MANAGER ? (
                            <ProductManagerView 
                                onCreateNew={handleCreateNewProduct}
                                onProductClick={handleProductClick}
                                onEditProduct={handleEditProduct}
                                dbOperations={dbOperations}
                            />
                        ) : appView === APP_VIEW_PRODUCT_DETAILS ? (
                            <ProductDetailsView 
                                product={selectedProduct}
                                onBack={() => setAppView(APP_VIEW_PRODUCT_MANAGER)}
                                onEdit={handleEditProduct}
                                onCreateCampaign={handleCreateCampaignFromProduct}
                                dbOperations={dbOperations}
                            />
                        ) : appView === APP_VIEW_PRODUCT_FORM ? (
                            <ProductFormView 
                                product={selectedProduct}
                                onSave={handleProductSaved}
                                onCancel={() => setAppView(selectedProduct ? APP_VIEW_PRODUCT_DETAILS : APP_VIEW_PRODUCT_MANAGER)}
                            />
                        ) : appView === APP_VIEW_CAMPAIGN_MANAGER ? (
                            <CampaignManagerView 
                                onCreateNew={handleCreateNewCampaign}
                                onCampaignClick={handleCampaignClick}
                                dbOperations={dbOperations}
                            />
                        ) : appView === APP_VIEW_CAMPAIGN_DETAILS ? (
                            <CampaignDetailsView 
                                campaign={selectedCampaign}
                                onBack={handleBackToCampaigns}
                                onPreviewCreative={handlePreviewCreative}
                                dbOperations={dbOperations}
                            />
                        ) : appView === APP_VIEW_AD_PLATFORMS ? (
                            <AdPlatformsView />
                        ) : appView === APP_VIEW_INSIGHTS ? (
                            <InsightsView />
                        ) : appView === APP_VIEW_SHOPPABLE_LANDING_PAGES ? (
                            <ShoppableLandingPagesView />
                        ) : appView === APP_VIEW_SHOPPABLE_LINKS ? (
                            <ShoppableLinksView />
                        ) : appView === APP_VIEW_SHOPPABLE_RECIPES ? (
                            <ShoppableRecipesView />
                        ) : appView === APP_VIEW_QR_CODES ? (
                            <QRCodesView />
                        ) : appView === APP_VIEW_LOCATORS ? (
                            <LocatorsView />
                        ) : appView === APP_VIEW_ACCOUNT ? (
                            <AccountView dbOperations={dbOperations} />
                        ) : appView === APP_VIEW_CAMPAIGN_FLOW_V2 ? (
                            isFeatureEnabled('NEW_CAMPAIGN_FLOW') ? (
                                <CampaignFlowV2
                                    onComplete={handleCampaignFlowV2Complete}
                                    onCancel={handleCampaignFlowV2Cancel}
                                    initialData={getV2InitialData()}
                                    dbOperations={dbOperations}
                                />
                            ) : (
                                <div className="max-w-4xl mx-auto">
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-yellow-800">
                                                    Enhanced Campaign Flow Not Enabled
                                                </h3>
                                                <div className="mt-2 text-sm text-yellow-700">
                                                    <p>The enhanced campaign builder is currently disabled. To enable it, set <code>VITE_NEW_CAMPAIGN_FLOW=true</code> in your environment variables.</p>
                                                </div>
                                                <div className="mt-4">
                                                    <Button 
                                                        onClick={() => setAppView(APP_VIEW_CAMPAIGN_MANAGER)}
                                                        variant="secondary"
                                                    >
                                                        ← Back to Campaign Manager
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
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
                
                {/* Database Migration UI - Development Tool */}
                {showMigrationUI && (
                    <DatabaseMigrationUI onClose={() => setShowMigrationUI(false)} />
                )}
                
                {/* Development Tools - Only show in development */}
                {import.meta.env.DEV && FEATURES.SHOW_MIGRATION_UI && (
                    <div className="fixed bottom-4 right-4 z-40">
                        <button
                            onClick={() => setShowMigrationUI(true)}
                            className="bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg hover:bg-blue-700 text-sm"
                            title="Open Database Migration Console"
                        >
                            🗄️ DB Console
                        </button>
                    </div>
                )}
            </div>
        </AppContext.Provider>
    );
}

export default App; // Export the main App component
