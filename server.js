import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { log } from 'console';
import fetch from 'node-fetch';

// Load environment variables FIRST
dotenv.config({ path: '.env.local' });

// Verify environment variables are loaded
console.log('🔧 Environment Check:', {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3001,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Missing',
  PINECONE_API_KEY: process.env.PINECONE_API_KEY ? '✅ Set' : '❌ Missing',
  PINECONE_INDEX_NAME: process.env.PINECONE_INDEX_NAME || 'Not set',
  UDYAT_API_KEY: process.env.UDYAT_API_KEY ? '✅ Set' : '❌ Missing',
  INFERENCE_API_KEY: process.env.INFERENCE_API_KEY ? '✅ Set' : '❌ Missing'
});

// Warn if critical environment variables are missing
if (!process.env.GEMINI_API_KEY) {
  console.warn('⚠️  WARNING: GEMINI_API_KEY is not set. The chatbot will not function properly.');
  console.warn('📝 Please add GEMINI_API_KEY to your .env.local file');
  console.warn('🔗 Get your API key from: https://makersuite.google.com/app/apikey\n');
}

if (!process.env.UDYAT_API_KEY || !process.env.INFERENCE_API_KEY) {
  console.warn('⚠️  WARNING: Bhashini API keys are not set. Translation features will not work.');
  console.warn('📝 Please add UDYAT_API_KEY and INFERENCE_API_KEY to your .env.local file');
  console.warn('🔗 Get your API keys from: https://bhashini.gov.in/ulca\n');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'], // Add your frontend URLs
  credentials: true
}));
app.use(express.json({ limit: '100mb' }));

// Request logging middleware (helpful for debugging)
app.use((req, res, next) => {
  console.log(`📨 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Import route handlers with error handling
let chatHandler;
try {
  chatHandler = (await import('./api/chat.js')).default;
} catch (error) {
  console.error('❌ Failed to import chat handler:', error.message);
  chatHandler = (req, res) => {
    res.status(500).json({ 
      error: 'Chat handler not available',
      message: 'Please check your api/chat.js file and dependencies'
    });
  };
}

// Health check endpoint with more details
app.get('/health', (req, res) => {
  const healthStatus = {
    status: 'OK',
    message: 'Legal Chatbot API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    apiKeys: {
      gemini: process.env.GEMINI_API_KEY ? 'configured' : 'missing',
      pinecone: process.env.PINECONE_API_KEY ? 'configured' : 'missing',
      bhashini: {
        udyat: process.env.UDYAT_API_KEY ? 'configured' : 'missing',
        inference: process.env.INFERENCE_API_KEY ? 'configured' : 'missing'
      }
    },
    version: process.env.npm_package_version || '0.0.0'
  };
  
  // Set status based on configuration
  if (!process.env.GEMINI_API_KEY || !process.env.PINECONE_API_KEY || 
      !process.env.UDYAT_API_KEY || !process.env.INFERENCE_API_KEY) {
    healthStatus.status = 'DEGRADED';
    healthStatus.message = 'API is running but some services are not configured';
  }
  
  res.json(healthStatus);
});

// Test endpoint for debugging
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Backend is working!',
    time: new Date().toISOString()
  });
});

// Bhashini Token Cache
let bhashiniTokenCache = {
  token: null,
  expiry: null
};

// Function to get Bhashini auth token using Udyat API
async function getBhashiniAccessToken() {
  // Check if we have a valid cached token
  if (bhashiniTokenCache.token && bhashiniTokenCache.expiry && new Date() < bhashiniTokenCache.expiry) {
    console.log('📌 Using cached Bhashini token');
    return bhashiniTokenCache.token;
  }

  try {
    console.log('🔑 Fetching new Bhashini access token...');
    
    const response = await fetch('https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ulca-api-key': process.env.UDYAT_API_KEY,
        'userID': process.env.BHASHINI_USER_ID || 'default-user'
      },
      body: JSON.stringify({
        pipelineTasks: [
          {
            taskType: 'translation',
            config: {
              language: {
                sourceLanguage: 'en',
                targetLanguage: 'hi'
              }
            }
          }
        ],
        pipelineRequestConfig: {
          pipelineId: '64392f96daac500b55c543cd'
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get access token: ${error}`);
    }

    const data = await response.json();
    
    // Extract the authorization key
    const authorizationKey = data?.pipelineInferenceAPIEndPoint?.inferenceApiKey?.value;
    
    if (!authorizationKey) {
      throw new Error('No authorization key received from Bhashini');
    }
    
    // Cache the token (assume 1 hour validity)
    bhashiniTokenCache.token = authorizationKey;
    bhashiniTokenCache.expiry = new Date(Date.now() + 3600000); // 1 hour
    
    console.log('✅ Access token obtained successfully');
    return authorizationKey;
  } catch (error) {
    console.error('❌ Error fetching Bhashini token:', error);
    throw error;
  }
}

// Translation endpoint
app.post('/api/translate', async (req, res) => {
  try {
    const { text, sourceLang, targetLang, dialect } = req.body;
    
    // Validate input
    if (!text || !sourceLang || !targetLang) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: text, sourceLang, targetLang'
      });
    }

    // Check if Bhashini credentials are configured
    if (!process.env.UDYAT_API_KEY || !process.env.INFERENCE_API_KEY) {
      // Development fallback
      if (process.env.NODE_ENV === 'development') {
        console.warn('📌 Using mock translation for development');
        return res.json({ 
          success: true, 
          translation: `[${targetLang}] ${text}`,
          metadata: {
            sourceLang,
            targetLang,
            mock: true
          }
        });
      }
      
      return res.status(503).json({
        success: false,
        error: 'Translation service is not configured. Please contact administrator.'
      });
    }
    
    // Get Bhashini authorization token
    const authToken = await getBhashiniAccessToken();
    
    // Call Bhashini translation API
    console.log(`🔄 Translating: ${sourceLang} → ${targetLang}`);
    
    const bhashiniResponse = await fetch(
      'https://dhruva-api.bhashini.gov.in/services/inference/pipeline',
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': authToken,
          'x-ulca-inference-api-key': process.env.INFERENCE_API_KEY
        },
        body: JSON.stringify({
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
            input: [{ source: text }]
          }
        })
      }
    );

    if (!bhashiniResponse.ok) {
      const errorText = await bhashiniResponse.text();
      console.error('Bhashini API error response:', errorText);
      throw new Error(`Bhashini API error: ${bhashiniResponse.status} - ${errorText}`);
    }

    const data = await bhashiniResponse.json();
    
    // Extract translation from response
    const translation = data?.pipelineResponse?.[0]?.output?.[0]?.target || 
                       data?.pipelineResponse?.[0]?.output?.[0]?.translation || 
                       data?.output?.[0]?.target || '';

    if (!translation) {
      console.error('Unexpected response structure:', JSON.stringify(data, null, 2));
      throw new Error('No translation received from Bhashini API');
    }

    console.log(`✅ Translation successful: "${text.substring(0, 30)}..." → "${translation.substring(0, 30)}..."`);
    
    res.json({ 
      success: true, 
      translation,
      metadata: {
        sourceLang,
        targetLang,
        dialect,
        textLength: text.length,
        translationLength: translation.length
      }
    });
  } catch (error) {
    console.error('❌ Translation error:', error);
    
    // Development fallback
    if (process.env.NODE_ENV === 'development') {
      console.warn('📌 Using fallback translation due to error');
      return res.json({ 
        success: true, 
        translation: `[${req.body.targetLang}] ${req.body.text}`,
        metadata: {
          sourceLang: req.body.sourceLang,
          targetLang: req.body.targetLang,
          mock: true,
          error: error.message
        }
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Translation failed',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Test Bhashini configuration endpoint
app.get('/api/bhashini/test', async (req, res) => {
  try {
    // Test if we can get an access token
    const token = await getBhashiniAccessToken();
    
    res.json({
      success: true,
      message: 'Bhashini configuration is working',
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 10)}...` : null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      hint: 'Check your UDYAT_API_KEY in .env.local'
    });
  }
});

// Chat endpoint with better error handling
app.post('/chat', async (req, res) => {
  try {
    // Validate request body
    if (!req.body || !req.body.messages) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'Messages array is required in request body'
      });
    }
    
    // Check if API keys are configured
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ 
        error: 'Service Unavailable',
        message: 'AI service is not configured. Please contact administrator.'
      });
    }
    
    await chatHandler(req, res);
  } catch (error) {
        console.error('❌ Chat endpoint error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
      timestamp: new Date().toISOString()
    });
  }
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Legal Services API',
    version: '1.0.0',
    endpoints: {
      'GET /health': 'Health check endpoint',
      'GET /test': 'Test endpoint',
      'POST /chat': 'Chat with AI assistant',
      'POST /api/translate': 'Translate text using Bhashini',
      'GET /api/bhashini/test': 'Test Bhashini configuration',
      'GET /api': 'API documentation'
    },
    chatEndpoint: {
      method: 'POST',
      path: '/chat',
      body: {
        messages: [
          { role: 'user', content: 'Your question here' }
        ]
      },
      response: {
        answer: 'AI response',
        sources: ['Source 1', 'Source 2'],
        confidence: 0.95
      }
    },
    translateEndpoint: {
      method: 'POST',
      path: '/api/translate',
      body: {
        text: 'Text to translate',
        sourceLang: 'en',
        targetLang: 'hi',
        dialect: 'hi-IN' // optional
      },
      response: {
        success: true,
        translation: 'Translated text',
        metadata: {
          sourceLang: 'en',
          targetLang: 'hi',
          textLength: 100,
          translationLength: 120
        }
      }
    },
    bhashiniTest: {
      method: 'GET',
      path: '/api/bhashini/test',
      description: 'Test if Bhashini configuration is working',
      response: {
        success: true,
        message: 'Bhashini configuration is working',
        hasToken: true
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    message: `The endpoint ${req.method} ${req.path} does not exist`,
    availableEndpoints: ['/health', '/test', '/chat', '/api', '/api/translate', '/api/bhashini/test']
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('💥 Global error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('🛑 HTTP server closed');
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log('\n🚀 Legal Services Backend Started!');
  console.log('━'.repeat(50));
  console.log(`✅ Server running on: http://localhost:${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/test`);
  console.log(`📚 API docs: http://localhost:${PORT}/api`);
  console.log(`🔐 Test Bhashini: http://localhost:${PORT}/api/bhashini/test`);
  console.log('━'.repeat(50));
  
  if (!process.env.GEMINI_API_KEY) {
    console.log('\n⚠️  To enable AI features:');
    console.log('1. Get API key from: https://makersuite.google.com/app/apikey');
    console.log('2. Add to .env.local: GEMINI_API_KEY=your_key_here');
    console.log('3. Restart the server\n');
  }

  if (!process.env.UDYAT_API_KEY || !process.env.INFERENCE_API_KEY) {
    console.log('\n⚠️  To enable translation features:');
    console.log('1. Register at: https://bhashini.gov.in/ulca');
    console.log('2. Get your API keys from the Bhashini platform');
    console.log('3. Add to .env.local:');
    console.log('   UDYAT_API_KEY=your_udyat_key');
    console.log('   INFERENCE_API_KEY=your_inference_key');
    console.log('   BHASHINI_USER_ID=your_user_id (optional)');
    console.log('4. Restart the server\n');
  }
});

export default server;
