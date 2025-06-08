// utils/bhashiniService.js
import fetch from 'node-fetch';

const UDYAT_KEY = process.env.UDYAT_API_KEY;
const INFERENCE_KEY = process.env.INFERENCE_API_KEY;

// Cache for access token
let tokenCache = {
  token: null,
  expiry: null
};

// Get access token using Udyat API key
export async function getBhashiniAccessToken() {
  // Check if we have a valid cached token
  if (tokenCache.token && tokenCache.expiry && new Date() < tokenCache.expiry) {
    console.log('📌 Using cached Bhashini token');
    return tokenCache.token;
  }

  try {
    console.log('🔑 Fetching new Bhashini access token...');
    
    const response = await fetch('https://auth.ulc.bhashini.gov.in/api/v1/udyat/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `ApiKey ${UDYAT_KEY}`
      },
      body: JSON.stringify({})
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get access token: ${error}`);
    }

    const data = await response.json();
    
    // Cache the token (assume 1 hour validity)
    tokenCache.token = data.token;
    tokenCache.expiry = new Date(Date.now() + 3600000); // 1 hour
    
    console.log('✅ Access token obtained successfully');
    return data.token;
  } catch (error) {
    console.error('❌ Error fetching Bhashini token:', error);
    throw error;
  }
}

// Translate text using the inference API
export async function translateText(inputText, sourceLang, targetLang) {
  try {
    // First get the access token
    const token = await getBhashiniAccessToken();

    const requestBody = {
      pipelineTasks: [
        {
          taskType: 'translation',
          config: {
            language: {
              sourceLanguage: sourceLang,
              targetLanguage: targetLang
            },
            serviceId: 'ai4bharat/indictrans-v2-all-gpu--t4'
          }
        }
      ],
      inputData: {
        input: [{ source: inputText }]
      }
    };

    console.log(`🔄 Translating: ${sourceLang} → ${targetLang}`);

    const response = await fetch('https://dhruva-api.bhashini.gov.in/services/inference/pipeline', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ulca-api-key': INFERENCE_KEY
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Translation API error: ${error}`);
    }

    const data = await response.json();
    
    // Extract translation from response
    const translation = data?.pipelineResponse?.[0]?.output?.[0]?.target || 
                       data?.pipelineResponse?.[0]?.output?.[0]?.translation || '';

    if (!translation) {
      throw new Error('No translation received from API');
    }

    return {
      success: true,
      translation,
      originalText: inputText,
      sourceLang,
      targetLang
    };
  } catch (error) {
    console.error('❌ Translation error:', error);
    throw error;
  }
}