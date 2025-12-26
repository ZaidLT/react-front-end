# Camera Functionality Implementation

## Overview
This document describes the camera functionality implemented for the Eeva React Web project, specifically for capturing appliance photos and scanning labels in the edit appliance detail page.

## Implementation Status: ✅ COMPLETE

### What Was Implemented
- **iOS Camera Integration**: Direct camera launch from web browser using `capture="environment"`
- **Dual Camera Options**: "Take Photo" and "Scan Label" buttons
- **File Upload Integration**: Photos are uploaded with appliance data using the same system as avatar uploads
- **Visual Feedback**: Buttons show confirmation when photos are captured
- **API Integration**: Both JSON and FormData support in tile API

## Files Modified

### 1. `/src/app/edit-appliance-detail/[id]/page.tsx`
**Key Changes:**
- Added state for `selectedPhoto` and `selectedLabel`
- Added `fileToBase64` helper function
- Implemented dual camera buttons at top of form
- Modified `handleSave` to support FormData uploads when files are present
- Added visual feedback showing "✓ Photo" / "✓ Label" when files selected

**Camera Button Implementation:**
```tsx
// Two side-by-side camera options
<div className="form-group">
  <label className="form-label">Capture Information</label>
  <div style={{ display: 'flex', gap: '12px', flexDirection: 'row' }}>
    {/* Take Photo Option */}
    <div onClick={() => document.getElementById('camera-input-photo')?.click()}>
      <input id="camera-input-photo" type="file" accept="image/*" capture="environment" />
    </div>
    {/* Scan Label Option */}
    <div onClick={() => document.getElementById('camera-input-label')?.click()}>
      <input id="camera-input-label" type="file" accept="image/*" capture="environment" />
    </div>
  </div>
</div>
```

### 2. `/src/app/api/tiles/route.ts`
**Key Changes:**
- Added multipart/form-data support to PUT endpoint
- Detects content-type and handles both JSON and FormData requests
- Forwards FormData directly to backend for file processing
- Enhanced error handling and logging for file uploads

**API Logic:**
```typescript
if (contentType.includes('multipart/form-data')) {
  // Handle file uploads with FormData
  const formData = await request.formData();
  // Forward to backend with files
} else {
  // Handle regular JSON updates
  const body = await request.json();
}
```

## How It Works

### 1. User Interaction Flow
1. User opens edit appliance detail page
2. Camera section appears at top of form with two options
3. User taps "Take Photo" or "Scan Label"
4. iOS camera launches (rear camera due to `capture="environment"`)
5. User captures photo
6. Button text changes to "✓ Photo" or "✓ Label"
7. User fills out form and hits Save
8. Photo is uploaded with appliance data

### 2. Technical Flow
1. **File Selection**: Camera input captures file, stores in component state
2. **Form Submission**: `handleSave` detects if files are present
3. **FormData Creation**: If files exist, creates FormData with all appliance fields + files
4. **API Request**: Sends multipart request to `/api/tiles` (not `/api/tiles/[id]`)
5. **Backend Processing**: Backend handles file upload and sets first file as avatar
6. **Response**: User redirected to appliance detail page with new image

### 3. File Priority
- If both photo and label are selected, photo takes priority for avatar
- Both files are uploaded but photo becomes the appliance image
- Files are stored using same system as user avatars

## Key Features

### ✅ iOS Camera Integration
- Uses `capture="environment"` attribute
- Successfully tested on iOS WKWebView
- Launches rear camera directly (no photo picker)

### ✅ Consistent Styling
- Blue branding for both camera options
- Hover effects and visual feedback
- Matches existing app design system
- Responsive layout

### ✅ Robust API Integration
- Supports both file uploads and regular updates
- Uses existing tile API infrastructure
- Same file handling as avatar uploads
- Proper error handling and logging

### ✅ User Experience
- Clear visual feedback when photos captured
- Positioned at top of form for prominence
- Non-blocking (form works with or without photos)
- Seamless integration with existing form flow

## Testing Notes
- ✅ Camera launch works on iOS mobile devices
- ✅ File selection and state management working
- ✅ FormData creation and API integration implemented
- ⚠️ **NEEDS TESTING**: End-to-end file upload and avatar display

## Next Steps (If Needed)
1. **Test Complete Flow**: Verify files actually upload and appear as appliance avatars
2. **Error Handling**: Add user-friendly error messages for upload failures
3. **File Validation**: Add file size/type validation if needed
4. **Progress Indicators**: Add upload progress for large files
5. **Image Preview**: Show thumbnail of captured image before save

## Code Locations
- **Main Implementation**: `src/app/edit-appliance-detail/[id]/page.tsx` (lines 217-390)
- **API Handler**: `src/app/api/tiles/route.ts` (lines 49-134)
- **Backend Integration**: Uses existing tile controller file upload logic

## Dependencies
- Uses existing Icon component for camera/scan icons
- Leverages existing Colors and Typography constants
- Integrates with existing AuthContext and form validation
- Uses same file upload infrastructure as avatars

## Design Decisions
1. **Positioned at Top**: Camera functionality is first thing users see
2. **Dual Options**: Separate "Take Photo" vs "Scan Label" for clarity
3. **FormData Approach**: Uses multipart uploads like avatar system
4. **Non-Destructive**: Existing JSON API still works for non-file updates
5. **Visual Feedback**: Clear indication when photos are captured

---

**Status**: Implementation complete, ready for testing
**Last Updated**: Current session
**Next Developer**: Test end-to-end flow and verify file uploads work correctly
