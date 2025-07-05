# Campaign Edit Implementation Plan

## Current Issue Analysis

### Problem
When clicking on an existing campaign in the Campaign Manager, users are redirected to the V2 Campaign Flow, but:
1. **New Campaign Created**: The flow creates a new campaign instead of editing the existing one
2. **Data Loss**: Existing campaign data is not properly loaded into the V2 flow steps
3. **ID Mismatch**: The V2 flow generates a new campaign ID instead of using the existing one
4. **Database Inconsistency**: Multiple campaigns are created instead of updating the existing one

### Root Cause
The `CampaignFlowV2` component is designed primarily for **creating new campaigns** and lacks proper **edit mode** functionality:
- Campaign ID is always generated as `campaign_${Date.now()}`
- Initial data mapping doesn't preserve the original campaign ID
- No distinction between "create" and "edit" modes
- Database operations always create new records instead of updating existing ones

## Technical Requirements

### 1. Database Schema Requirements
**Current Status**: ✅ **COMPLETE** - Database tables exist and are working

The database schema already supports editing:
- `campaigns` table with `id`, `legacy_id`, `name`, `status`, `created_at`, `updated_at`
- `legacy_id` field stores original campaign IDs (e.g., `campaign_1751748238782_jmnfg21s7`)
- API endpoints support both create and update operations

### 2. Campaign Flow V2 Modifications Required

#### A. Edit Mode Detection
**Status**: ❌ **MISSING**
- Add `isEditMode` prop to `CampaignFlowV2` component
- Detect edit mode based on presence of existing campaign ID in `initialData`
- Preserve original campaign ID throughout the flow

#### B. Initial Data Handling
**Status**: ⚠️ **PARTIAL** - Data mapping exists but incomplete
- Current `getV2InitialData()` function attempts to map legacy data
- Missing proper step data restoration for V2 campaigns
- Need to handle both V2 and legacy campaign formats

#### C. Campaign ID Management
**Status**: ❌ **MISSING**
- Always preserve original campaign ID in edit mode
- Prevent generation of new IDs when editing
- Ensure database operations use existing campaign ID

#### D. Save Operations
**Status**: ❌ **MISSING**
- Distinguish between "create" and "update" database operations
- Update existing campaigns instead of creating new ones
- Preserve campaign metadata (creation date, status, etc.)

### 3. UI/UX Requirements

#### A. Visual Indicators
**Status**: ❌ **MISSING**
- Show "Editing: [Campaign Name]" in header
- Display campaign creation date and last modified
- Show edit mode indicator in flow navigation

#### B. Data Persistence
**Status**: ⚠️ **PARTIAL** - Draft system exists but not edit-aware
- Current draft system works for new campaigns
- Need to adapt draft system for editing existing campaigns
- Ensure drafts don't overwrite original campaign data

#### C. Navigation Behavior
**Status**: ⚠️ **PARTIAL** - Basic routing exists
- Current routing works but creates new campaigns
- Need to preserve campaign context during editing
- Handle cancel/exit scenarios properly

## Implementation Plan

### Phase 1: Core Edit Mode Infrastructure
**Priority**: 🔴 **HIGH**

#### 1.1 Update CampaignFlowV2 Component
```javascript
// Add edit mode detection
const isEditMode = initialData?.id && initialData.id !== `campaign_${Date.now()}`;

// Preserve original campaign ID
const [campaignData, setCampaignData] = useState({
  id: initialData?.id || `campaign_${Date.now()}`, // Use existing ID if available
  name: initialData?.name || '',
  createdAt: initialData?.createdAt || new Date().toISOString(),
  status: initialData?.status || 'draft',
  version: 2,
  isEditMode, // Add edit mode flag
  ...initialData
});
```

#### 1.2 Update Database Save Operations
```javascript
// Modify saveCampaignData function
const saveCampaignData = async (data) => {
  if (data.isEditMode) {
    // Update existing campaign
    const result = await dbOperations.updateCampaign(data.id, data);
  } else {
    // Create new campaign
    const result = await dbOperations.saveAd(data);
  }
};
```

#### 1.3 Update App.jsx Initial Data Mapping
```javascript
const getV2InitialData = () => {
  if (selectedCampaign) {
    return {
      id: selectedCampaign.id, // Preserve original ID
      name: selectedCampaign.name,
      status: selectedCampaign.status,
      createdAt: selectedCampaign.createdAt,
      isEditMode: true, // Mark as edit mode
      // ... rest of data mapping
    };
  }
  // ... new campaign logic
};
```

### Phase 2: Step Data Restoration
**Priority**: 🔴 **HIGH**

#### 2.1 V2 Campaign Data Restoration
For campaigns created with V2 flow:
```javascript
// In getV2InitialData()
if (selectedCampaign.source === 'v2' && selectedCampaign.adData?.v2Data) {
  return {
    id: selectedCampaign.id,
    isEditMode: true,
    // Restore complete V2 step data
    product: selectedCampaign.adData.v2Data.product,
    audience: selectedCampaign.adData.v2Data.audience,
    platforms: selectedCampaign.adData.v2Data.platforms,
    creative: selectedCampaign.adData.v2Data.creative,
    publish: selectedCampaign.adData.v2Data.publish,
  };
}
```

#### 2.2 Legacy Campaign Migration
For campaigns created with legacy flow:
```javascript
// Smart migration from legacy format
const migrateLegacyToV2 = (legacyCampaign) => {
  return {
    id: legacyCampaign.id,
    isEditMode: true,
    // Extract available data from legacy format
    product: extractProductData(legacyCampaign.adData),
    audience: extractAudienceData(legacyCampaign.adData),
    platforms: extractPlatformData(legacyCampaign.adData),
    creative: extractCreativeData(legacyCampaign.adData),
    publish: extractPublishData(legacyCampaign.adData),
  };
};
```

### Phase 3: Database Operations Update
**Priority**: 🟡 **MEDIUM**

#### 3.1 Add Update Campaign API
Create new API endpoint or modify existing:
```javascript
// api/campaigns.js - Add update operation
async function updateCampaignInSupabase(campaignId, updates, req, res) {
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .update({
        name: updates.name,
        status: updates.status,
        legacy_data: updates.adData || updates,
        updated_at: new Date().toISOString()
      })
      .eq('legacy_id', campaignId); // Use legacy_id for lookup

    if (error) throw new Error(`Database error: ${error.message}`);
    
    res.json({ success: true, campaign: data[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
```

#### 3.2 Update Database Adapter
```javascript
// src/services/databaseAdapter.js
async updateCampaign(campaignId, updates) {
  try {
    const response = await fetch(`/api/campaigns/${campaignId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### Phase 4: UI/UX Enhancements
**Priority**: 🟡 **MEDIUM**

#### 4.1 Edit Mode Indicators
```javascript
// In CampaignFlowV2 component
const renderHeader = () => (
  <div className="flex items-center justify-between">
    <h1 className="text-2xl font-bold">
      {isEditMode ? `Editing: ${campaignData.name}` : 'Create New Campaign'}
    </h1>
    {isEditMode && (
      <div className="text-sm text-gray-500">
        Created: {new Date(campaignData.createdAt).toLocaleDateString()}
        Last Modified: {new Date(campaignData.updatedAt).toLocaleDateString()}
      </div>
    )}
  </div>
);
```

#### 4.2 Draft System Updates
```javascript
// Modify draft key to include edit mode
const getDraftKey = (campaignId, isEditMode) => {
  return isEditMode 
    ? `campaign_edit_${campaignId}` 
    : `campaign_draft_${campaignId}`;
};
```

#### 4.3 Navigation Improvements
```javascript
// Update cancel behavior for edit mode
const handleCancel = () => {
  if (isEditMode) {
    // Return to campaign details or manager
    onCancel?.(campaignData);
  } else {
    // Return to campaign manager
    onCancel?.();
  }
};
```

### Phase 5: Testing & Validation
**Priority**: 🟢 **LOW**

#### 5.1 Test Scenarios
1. **Edit V2 Campaign**: Click existing V2 campaign → Edit → Save → Verify no new campaign created
2. **Edit Legacy Campaign**: Click legacy campaign → Edit → Save → Verify migration works
3. **Draft Persistence**: Edit campaign → Navigate away → Return → Verify draft restored
4. **Cancel Behavior**: Edit campaign → Cancel → Verify original unchanged
5. **Multiple Edits**: Edit → Save → Edit again → Verify consistency

#### 5.2 Data Validation
1. **Campaign ID Preservation**: Ensure original IDs are maintained
2. **Step Data Integrity**: Verify all step data is properly restored
3. **Database Consistency**: Confirm updates don't create duplicates
4. **Legacy Compatibility**: Ensure legacy campaigns still work

## Database Field Mapping

### Current Database Schema
```sql
-- campaigns table (✅ Already exists)
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    legacy_id VARCHAR(255) NOT NULL, -- Original campaign ID
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) DEFAULT 'Display Campaign',
    status VARCHAR(50) DEFAULT 'draft',
    source VARCHAR(50) DEFAULT 'v2',
    legacy_data JSONB, -- Complete campaign data
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### V2 Step Data Structure
```javascript
// Expected structure in legacy_data.v2Data
{
  "v2Data": {
    "product": {
      "id": "product_123",
      "name": "Product Name",
      "images": [...],
      "category": "...",
      // ... other product fields
    },
    "audience": {
      "demographics": {...},
      "interests": [...],
      "behaviors": [...],
      // ... other audience fields
    },
    "platforms": {
      "selectedPlatforms": ["facebook", "google"],
      "totalBudget": 1000,
      "duration": 7,
      // ... other platform fields
    },
    "creative": {
      "selectedFormats": [...],
      "creatives": {...},
      "variations": 3,
      // ... other creative fields
    },
    "publish": {
      "campaignName": "...",
      "saved": true,
      "launched": false,
      // ... other publish fields
    }
  }
}
```

## Implementation Priority

### 🔴 **IMMEDIATE** (Required for basic editing)
1. Campaign ID preservation in V2 flow
2. Edit mode detection and handling
3. Database update operations
4. Initial data restoration for V2 campaigns

### 🟡 **SOON** (Required for complete functionality)
1. Legacy campaign migration to V2 format
2. UI indicators for edit mode
3. Draft system updates for edit mode
4. Proper cancel/exit behavior

### 🟢 **LATER** (Nice to have)
1. Advanced edit history tracking
2. Conflict resolution for concurrent edits
3. Enhanced validation for edited campaigns
4. Performance optimizations

## Success Criteria

### Functional Requirements
- [ ] Clicking existing campaign opens edit mode (not create mode)
- [ ] All step data is properly restored from database
- [ ] Saving updates existing campaign (no duplicates created)
- [ ] Campaign ID remains consistent throughout editing
- [ ] Both V2 and legacy campaigns can be edited

### Technical Requirements
- [ ] Database operations use UPDATE instead of INSERT for existing campaigns
- [ ] Draft system works correctly for edited campaigns
- [ ] No data loss during edit operations
- [ ] Proper error handling for edit failures

### User Experience Requirements
- [ ] Clear visual indication of edit mode
- [ ] Intuitive navigation between edit and view modes
- [ ] Consistent behavior across all campaign types
- [ ] Proper handling of unsaved changes

## Next Steps

1. **Review this plan** and confirm approach
2. **Implement Phase 1** - Core edit mode infrastructure
3. **Test basic editing** with V2 campaigns
4. **Implement Phase 2** - Step data restoration
5. **Add legacy campaign support** if needed
6. **Polish UI/UX** in final phases

This plan ensures we build a robust campaign editing system that handles both new V2 campaigns and legacy campaigns, with proper database consistency and user experience. 