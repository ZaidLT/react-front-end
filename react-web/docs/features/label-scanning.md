# AI Label Scanning

The Eeva React Web application includes an AI-powered label scanning feature that automatically extracts product information from appliance labels using OpenAI's vision capabilities.

## Overview

The label scanning feature allows users to quickly populate appliance information by simply taking a photo of the product label. The system uses OpenAI's GPT-4o model to analyze the image and extract structured data including brand, product name, model number, and serial number.

## Features

- **Automatic Data Extraction**: Extracts brand, product name, model number, and serial number from product labels
- **Seamless Integration**: Works within the existing appliance editing workflow
- **Visual Feedback**: Provides loading states and visual indicators during processing
- **Form Auto-Population**: Automatically fills form fields with extracted information
- **Error Handling**: Graceful handling of extraction failures or API errors

## How It Works

### User Flow

1. **Navigate to Appliance Edit**: Go to any appliance edit page (`/edit-appliance-detail/[id]`)
2. **Click "Scan Label"**: Click the scan label button in the capture information section
3. **Select Image**: Choose an image file containing a product label
4. **Processing**: The system shows a loading spinner while OpenAI processes the image
5. **Auto-Population**: Form fields are automatically populated with extracted data
6. **Save**: User can review and save the appliance information

### Technical Flow

1. **Image Upload**: User selects an image file through the file input
2. **Base64 Conversion**: Image is converted to base64 format for API transmission
3. **OpenAI API Call**: Image is sent to `/api/openai/label-scan` endpoint
4. **AI Processing**: OpenAI GPT-4o analyzes the image and extracts structured data
5. **Response Processing**: Extracted data is validated and cleaned
6. **Form Update**: React state is updated to populate form fields
7. **File Handling**: Image file is stored for potential upload with appliance data

## API Endpoint

### `/api/openai/label-scan`

**Method**: `POST`

**Request Body**:
```json
{
  "imageData": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "brand": "Samsung",
    "productName": "Smart Refrigerator",
    "modelNumber": "RF28R7351SG",
    "serialNumber": "ABC123456789"
  },
  "tokensUsed": 751
}
```

**Error Response**:
```json
{
  "error": "Failed to analyze label",
  "details": "OpenAI API error message"
}
```

## Configuration

### Environment Variables

The label scanning feature requires the following environment variable:

```bash
# OpenAI API Configuration
OPENAI_API_KEY=sk-proj-your-openai-api-key-here
```

**Important**: This must be set in your deployment environment (Vercel, etc.) for the feature to work in production.

### OpenAI Model Configuration

The system uses the following OpenAI configuration:
- **Model**: `gpt-4o-2024-11-20`
- **Temperature**: `0.0` (deterministic responses)
- **Max Tokens**: `300`
- **Response Format**: `json_object`

## Implementation Details

### File Structure

```
src/
├── app/api/openai/label-scan/
│   └── route.ts                    # OpenAI API endpoint
├── util/
│   └── labelScanning.ts           # Utility functions
└── app/edit-appliance-detail/[id]/
    └── page.tsx                   # Integration in edit page
```

### Key Components

1. **API Route** (`src/app/api/openai/label-scan/route.ts`):
   - Handles OpenAI API communication
   - Validates and processes responses
   - Provides structured error handling

2. **Utility Functions** (`src/util/labelScanning.ts`):
   - `scanProductLabel()`: Main scanning function
   - `fileToBase64()`: File conversion utility
   - Type definitions and helper functions

3. **UI Integration** (`src/app/edit-appliance-detail/[id]/page.tsx`):
   - `handleLabelScan()`: Processes scan results
   - Loading states and visual feedback
   - Form field auto-population

### Data Extraction

The AI system extracts the following information:

| Field | Description | Example |
|-------|-------------|---------|
| `brand` | Manufacturer name | "Samsung", "LG", "Whirlpool" |
| `productName` | Product name/type | "Smart Refrigerator", "Washer" |
| `modelNumber` | Model identifier | "RF28R7351SG", "WM3900HWA" |
| `serialNumber` | Unique serial number | "ABC123456789" |

All fields return `null` if the information cannot be determined from the label.

## Usage Guidelines

### Best Practices

1. **Image Quality**: Use clear, well-lit photos of product labels
2. **Label Visibility**: Ensure the entire label is visible in the image
3. **File Size**: Keep image files reasonably sized (< 5MB recommended)
4. **Supported Formats**: JPEG, PNG, and other common image formats

### Limitations

1. **Text-Based Extraction**: Only extracts information from visible text on labels
2. **Language Support**: Optimized for English text
3. **Label Types**: Works best with official manufacturer labels
4. **API Costs**: Each scan consumes OpenAI API tokens

## Error Handling

The system includes comprehensive error handling:

- **API Errors**: Network issues, OpenAI API failures
- **Parsing Errors**: Invalid JSON responses from OpenAI
- **Validation Errors**: Missing or invalid image data
- **Token Limits**: Handles token usage and limits

All errors are logged to the console for debugging purposes.

## Testing

### Test Page

A dedicated test page is available at `/test-label-scan` for development and testing purposes. This page allows developers to:

- Upload test images
- View extraction results
- Debug API responses
- Monitor token usage

### Manual Testing

1. Navigate to any appliance edit page
2. Click "Scan Label"
3. Upload a test image with a product label
4. Verify form fields are populated correctly
5. Check browser console for detailed logs

## Security Considerations

- **API Key Protection**: OpenAI API key is server-side only, never exposed to client
- **Input Validation**: All image data is validated before processing
- **Error Sanitization**: Error messages are sanitized before returning to client
- **Rate Limiting**: Consider implementing rate limiting for production use

## Performance

- **Average Processing Time**: 3-5 seconds per image
- **Token Usage**: Approximately 700-800 tokens per scan
- **Caching**: No caching implemented (each scan is processed fresh)
- **File Size Impact**: Larger images may take longer to process

## Future Enhancements

Potential improvements for the label scanning feature:

1. **Multi-Language Support**: Support for non-English labels
2. **Batch Processing**: Scan multiple labels at once
3. **Confidence Scoring**: Provide confidence levels for extracted data
4. **Label Type Detection**: Identify different types of product labels
5. **OCR Fallback**: Fallback to traditional OCR if AI extraction fails
6. **Caching**: Cache results for identical images
7. **Rate Limiting**: Implement API rate limiting and usage tracking
