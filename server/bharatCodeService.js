/**
 * BharatCode Model API Service
 * 
 * Official API Integration for BharatCode Build League Hackathon
 * Base URL: https://bharatcode.ai/api/model/v1
 * Endpoint: /chat/completions
 * Model: qwen-3.8-27b
 * 
 * Secure server-side execution: API Key is read exclusively on the server
 * and NEVER exposed to frontend client bundles or the browser.
 */

export const BHARATCODE_CONFIG = {
  baseUrl: process.env.BHARATCODE_BASE_URL || 'https://bharatcode.ai/api/model/v1',
  model: process.env.BHARATCODE_MODEL || 'qwen-3.8-27b',
  get apiKey() {
    return (process.env.BHARATCODE_API_KEY || '').trim();
  },
  get isConfigured() {
    return Boolean(this.apiKey && this.apiKey.length > 5 && this.apiKey !== 'your_bharatcode_api_key_here');
  },
};

/**
 * Civic Issue System Prompt for structured JSON analysis
 */
const CIVIC_ANALYSIS_SYSTEM_PROMPT = `You are a municipal civil engineer and civic issue classification system for CivicLens.
Analyze this civic issue photograph. Respond ONLY with a valid JSON object strictly matching this schema:
{
  "category": "pothole" | "garbage" | "streetlight" | "water_leakage" | "drainage" | "infrastructure" | "other",
  "severity": "low" | "medium" | "high" | "critical",
  "explanation": "concise 1-2 sentence engineering description of the defect and public safety hazard",
  "confidence": 0.88,
  "detected_elements": ["element1", "element2", "element3"],
  "suggested_title": "Clear concise descriptive headline"
}
Ensure valid JSON without markdown wrapping if possible. Do not include introductory text.`;

/**
 * Sanitizes and extracts clean JSON from LLM output
 */
export function extractAndParseJson(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Empty or invalid response from BharatCode Model API');
  }

  // Strip markdown code fences if present
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  }

  // Find first { and last } to tolerate any outer prose
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  return JSON.parse(cleaned);
}

/**
 * Calls BharatCode chat completions endpoint with vision payload
 * 
 * @param {Object} params
 * @param {string} [params.imageBase64] Base64 image payload (without data URI prefix)
 * @param {string} [params.mimeType] Image mime type (image/jpeg, image/png, image/webp)
 * @param {string} [params.imageUrl] Public image URL (fallback when not uploading base64)
 * @returns {Promise<{ result: Object, isLiveAI: boolean, model: string }>}
 */
export async function callBharatCodeVision({ imageBase64, mimeType = 'image/jpeg', imageUrl }) {
  if (!BHARATCODE_CONFIG.isConfigured) {
    const error = new Error('BHARATCODE_API_KEY is not configured on the server. Please set BHARATCODE_API_KEY in your environment or .env.local.');
    error.statusCode = 503;
    error.code = 'CONFIG_MISSING';
    throw error;
  }

  // Prepare image content for OpenAI-compatible multimodal chat completions
  let imageSourceUrl = '';
  if (imageBase64) {
    imageSourceUrl = imageBase64.startsWith('data:') 
      ? imageBase64 
      : `data:${mimeType};base64,${imageBase64}`;
  } else if (imageUrl) {
    imageSourceUrl = imageUrl;
  } else {
    const error = new Error('No image provided for AI analysis. Please upload an image or provide a valid image URL.');
    error.statusCode = 400;
    error.code = 'BAD_REQUEST';
    throw error;
  }

  const endpoint = `${BHARATCODE_CONFIG.baseUrl}/chat/completions`;
  const payload = {
    model: BHARATCODE_CONFIG.model,
    messages: [
      {
        role: 'system',
        content: CIVIC_ANALYSIS_SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analyze this civic issue photograph and return the classified JSON output strictly adhering to the specified schema.',
          },
          {
            type: 'image_url',
            image_url: {
              url: imageSourceUrl,
            },
          },
        ],
      },
    ],
    temperature: 0.2,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout for vision model inference

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BHARATCODE_CONFIG.apiKey}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorDetails = '';
      try {
        const errorJson = await response.json();
        errorDetails = errorJson.error?.message || errorJson.message || JSON.stringify(errorJson);
      } catch {
        errorDetails = await response.text();
      }

      const error = new Error(`BharatCode API error (${response.status}): ${errorDetails || response.statusText}`);
      error.statusCode = response.status;
      
      if (response.status === 401) {
        error.message = `Authentication Failed (401): Invalid BharatCode API Key. Please verify BHARATCODE_API_KEY (${errorDetails})`;
      } else if (response.status === 429) {
        error.message = `Rate Limit Exceeded (429): BharatCode request rate limit reached. Please retry in a few moments. (${errorDetails})`;
      } else if (response.status >= 500) {
        error.message = `BharatCode Server Error (${response.status}): The upstream BharatCode model service encountered an internal error. Please retry.`;
      }
      
      throw error;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('BharatCode API returned an empty completion message.');
    }

    const parsed = extractAndParseJson(content);

    return {
      result: parsed,
      isLiveAI: true,
      model: BHARATCODE_CONFIG.model,
      rawContent: content,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      const timeoutError = new Error('BharatCode Vision API request timed out after 45 seconds. The model may be under heavy load.');
      timeoutError.statusCode = 504;
      throw timeoutError;
    }
    throw err;
  }
}

