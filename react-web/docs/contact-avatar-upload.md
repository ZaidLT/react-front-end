# Avatar Upload Implementation

## Overview

This document describes the implementation of avatar image upload functionality for contacts and Hive members in the Eeva React Web application.

## Features Implemented

### 1. Image Upload Modal
- **Component**: `ImageUploadModal` (src/components/ImageUploadModal.tsx)
- **Features**:
  - Camera capture (mobile-friendly with `capture="environment"`)
  - Gallery/file selection
  - File type validation (images only)
  - Responsive design

### 2. New Contact Page (`/people/new`)
- **File**: `src/app/people/new/page.tsx`
- **Features**:
  - Avatar preview with hexagon shape
  - Image selection and preview
  - Multipart form data upload when image is selected
  - Fallback to JSON upload when no image

### 3. Edit Contact Page (`/people/[id]/edit`)
- **File**: `src/app/people/[id]/edit/page.tsx`
- **Features**:
  - Display existing avatar or initials
  - Image selection and preview
  - Multipart form data upload when new image is selected
  - Fallback to JSON upload when no new image

### 4. Edit Hive Member Page (`/my-hive/member/[id]/edit`)
- **File**: `src/app/my-hive/member/[id]/edit/page.tsx`
- **Features**:
  - Display existing avatar or initials in hexagon shape
  - Image selection and preview
  - Multipart form data upload with existing FormData structure
  - Edit button overlay on avatar for easy access

### 5. API Routes
- **Create Contact**: `src/app/api/contacts/create/route.ts`
- **Update Contact**: `src/app/api/contacts/[id]/update/route.ts`
- **Update User/Hive Member**: `src/app/api/users/[id]/route.ts`
- **Features**:
  - Support for both JSON and multipart form data
  - Automatic detection of content type
  - Proper field mapping for backend API

## Backend Integration

### Multipart Form Data Structure
When uploading with an image, the frontend sends:
```
Content-Type: multipart/form-data

Fields:
- accountId: string
- userId: string
- firstName: string
- lastName: string
- ... (other contact fields)
- avatarImages: File (the image file)
```

### Backend Processing
The backend contact controller:
1. Receives multipart form data
2. Extracts the image file from `avatarImages` field
3. Uploads the file to cloud storage (GCP)
4. Generates signed URLs for the uploaded images
5. Returns proper image URLs in the `avatarImagePath` field and `contactFiles` response
6. Creates/updates the contact record

### Avatar Display Logic
The frontend displays avatars using this priority:
1. **Contact Files**: Checks `contactFiles[contactId]` for files with `fileUrl`
2. **Avatar Image Path**: Uses `contact.AvatarImagePath` (assumes backend provides valid URLs)
3. **Fallback**: Shows initials if no image is available

## Usage Instructions

### For New Contacts:
1. Navigate to `/people/new`
2. Click the edit icon on the hexagon avatar
3. Choose "Take a Photo" or "Choose from Gallery"
4. Select/capture an image
5. Fill in other contact details
6. Click "Save"

### For Existing Contacts:
1. Navigate to `/people/[id]/edit`
2. Click the edit icon on the avatar
3. Choose "Take a Photo" or "Choose from Gallery"
4. Select/capture a new image
5. Make other edits as needed
6. Click "Save"

### For Hive Members:
1. Navigate to `/my-hive/member/[id]/edit`
2. Click the edit icon on the hexagon avatar
3. Choose "Take a Photo" or "Choose from Gallery"
4. Select/capture a new image
5. Make other edits as needed
6. Click "Save"

## Technical Details

### File Handling
- **Accepted formats**: All image types (`image/*`)
- **Upload method**: Multipart form data
- **Field name**: `avatarImages` (matches backend expectation)
- **Preview**: Uses `URL.createObjectURL()` for immediate preview

### Error Handling
- File type validation on frontend
- Backend validation and error responses
- User-friendly error messages

### Performance
- Images are only uploaded when actually selected
- Fallback to JSON requests when no image changes
- Efficient form data construction

## Testing

To test the functionality:
1. Start the development server: `pnpm debug`
2. Navigate to http://localhost:3001/people/new
3. Test image upload on new contact creation
4. Navigate to an existing contact edit page
5. Test image upload on contact updates

## Future Enhancements

Potential improvements:
- Image compression before upload
- Multiple image support
- Image cropping/editing
- Progress indicators for large uploads
- Drag and drop support
