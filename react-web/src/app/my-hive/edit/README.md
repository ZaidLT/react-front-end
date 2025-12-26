# My Hive Member Edit Functionality

## Overview
This directory contains the member edit functionality for the My Hive feature. Users can click on any hive member from the My Hive page to edit their profile information.

## Route Structure
- **Route**: `/my-hive/edit/[id]`
- **Dynamic Parameter**: `id` - The UniqueId of the user to edit
- **Navigation**: Accessed by clicking on a member tile in the My Hive page

## Features

### User Information Editing
The edit page allows modification of the following user fields:

#### Basic Information
- First Name (required)
- Last Name
- Email Address (required, validated)

#### Contact Information
- Cell Phone Number
- Home Phone Number

#### Address Information
- Address
- City
- State
- Zip Code
- Country

#### Additional Information
- Workplace
- Birthday (date picker)

### Validation
- **First Name**: Required field
- **Email Address**: Required field with email format validation
- **Form Validation**: Real-time validation with error messages

### User Experience
- **Loading States**: Skeleton loaders while fetching data
- **Error Handling**: Comprehensive error messages for various scenarios
- **Responsive Design**: Works on desktop and mobile devices
- **Navigation**: Back button returns to My Hive page
- **Save Confirmation**: Automatic redirect to My Hive after successful save

## Technical Implementation

### Components Used
- `NavHeader` - Top navigation with back button
- `UserBasicInfo` - User avatar and basic display info
- `ProfileItem` - Reusable form input component
- `Button` - Save button with loading state
- `CustomText` - Consistent text styling
- `Icon` - Section icons
- `HorizontalLine` - Visual separators

### API Integration
- **Fetch User Data**: `getUsersByAccount()` to get all account members
- **Update User**: `userService.updateUser()` to save changes
- **Field Mapping**: Proper mapping between UI fields and API fields

### Styling
- **CSS File**: `edit-member.css` with responsive design
- **Color Scheme**: Consistent with app design system
- **Layout**: Centered form with sections and proper spacing

## File Structure
```
src/app/my-hive/edit/[id]/
├── page.tsx           # Main edit page component
├── edit-member.css    # Styling for the edit page
└── README.md          # This documentation
```

## Usage Example

1. Navigate to My Hive page (`/my-hive`)
2. Click on any member tile
3. Edit the desired information
4. Click "Save" to update the member
5. Automatically redirected back to My Hive page

## Error Scenarios Handled
- Member not found (invalid ID)
- Network errors during fetch/save
- Validation errors (missing required fields)
- Authentication issues
- API failures

## Future Enhancements
- Avatar image editing
- Additional profile fields
- Bulk editing capabilities
- Member deletion functionality
- Activity status toggle (Active/Inactive)
