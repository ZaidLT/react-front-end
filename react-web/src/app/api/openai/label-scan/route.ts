import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Lazily create an OpenAI client to avoid build-time env checks
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
};

// Define the expected response structure
interface LabelScanResult {
  brand: string | null;
  productName: string | null;
  modelNumber: string | null;
  serialNumber: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageData } = body;

    if (!imageData) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      );
    }

    // Ensure the image data is in the correct format for OpenAI
    let formattedImageData = imageData;
    if (!imageData.startsWith('data:image/')) {
      formattedImageData = `data:image/jpeg;base64,${imageData}`;
    }

    console.log('[OpenAI Label Scan] Starting label scan analysis...');
    const startTime = Date.now();

    // Initialize client only when handling a request
    const openai = getOpenAIClient();
    if (!openai) {
      return NextResponse.json({ error: 'OpenAI is not configured' }, { status: 503 });
    }

    // Call OpenAI API for label scanning
    const response = await openai.chat.completions.create({
      model: "gpt-4o-2024-11-20",
      response_format: { type: "json_object" },
      temperature: 0.0,
      top_p: 1.0,
      max_tokens: 300,
      presence_penalty: 0.0,
      frequency_penalty: 0.0,
      messages: [
        {
          role: "system",
          content: `You are an expert OCR and product information extraction specialist. Your task is to analyze product labels and extract specific information.

Extract the following information from the product label in the image:

1. **Brand**: The manufacturer or brand name (e.g., "Samsung", "LG", "Whirlpool", "GE")
2. **Product Name**: The specific product name or model line (e.g., "Galaxy Refrigerator", "Smart Washer")
3. **Model Number**: The specific model identifier (e.g., "RF28R7351SG", "WM3900HWA")
4. **Serial Number**: The unique serial number for this specific unit

Important Rules:
- Extract information ONLY from visible text on the label
- If any information cannot be clearly determined, return null for that field
- Be precise and do not make assumptions
- Focus on official product labels, not user-written notes
- Model numbers are typically alphanumeric codes
- Serial numbers are usually longer alphanumeric sequences

Return the extracted data in this exact JSON format:
{
  "brand": string | null,
  "productName": string | null,
  "modelNumber": string | null,
  "serialNumber": string | null
}`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please analyze this product label and extract the brand, product name, model number, and serial number. Return the information in JSON format."
            },
            {
              type: "image_url",
              image_url: {
                url: formattedImageData,
              },
            },
          ],
        },
      ],
    });

    const duration = Date.now() - startTime;
    console.log(`[OpenAI Label Scan] Analysis completed in ${duration}ms`);

    // Parse the response
    const rawContent = response.choices[0].message.content || '{}';
    console.log('[OpenAI Label Scan] Raw response:', rawContent.substring(0, 200) + '...');

    let result: LabelScanResult;
    try {
      result = JSON.parse(rawContent);
    } catch (parseError) {
      console.error('[OpenAI Label Scan] Failed to parse response as JSON:', parseError);
      
      // Try to extract JSON from wrapped response
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          result = JSON.parse(jsonMatch[0]);
        } catch (extractError) {
          console.error('[OpenAI Label Scan] Failed to parse extracted JSON:', extractError);
          throw new Error('OpenAI returned malformed JSON response');
        }
      } else {
        throw new Error('OpenAI response does not contain valid JSON');
      }
    }

    // Log token usage
    const totalTokens = response.usage?.total_tokens;
    const promptTokens = response.usage?.prompt_tokens;
    const completionTokens = response.usage?.completion_tokens;
    console.log(`[OpenAI Label Scan] Token usage - Total: ${totalTokens}, Prompt: ${promptTokens}, Completion: ${completionTokens}`);

    // Validate and clean the result
    const cleanedResult: LabelScanResult = {
      brand: result.brand || null,
      productName: result.productName || null,
      modelNumber: result.modelNumber || null,
      serialNumber: result.serialNumber || null,
    };

    console.log('[OpenAI Label Scan] Extracted data:', cleanedResult);

    return NextResponse.json({
      success: true,
      data: cleanedResult,
      tokensUsed: totalTokens,
    });

  } catch (error) {
    console.error('[OpenAI Label Scan] Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to analyze label',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
