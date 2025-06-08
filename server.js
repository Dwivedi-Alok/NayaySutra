import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
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
  INFERENCE_API_KEY: process.env.INFERENCE_API_KEY ? '✅ Set' : '❌ Missing'
});

// Warn if critical environment variables are missing
if (!process.env.GEMINI_API_KEY) {
  console.warn('⚠️  WARNING: GEMINI_API_KEY is not set. The chatbot will not function properly.');
  console.warn('📝 Please add GEMINI_API_KEY to your .env.local file');
  console.warn('🔗 Get your API key from: https://makersuite.google.com/app/apikey\n');
}

if (!process.env.INFERENCE_API_KEY) {
  console.warn('⚠️  WARNING: Bhashini INFERENCE_API_KEY is not set. Translation features will not work.');
  console.warn('📝 Please add INFERENCE_API_KEY to your .env.local file');
  console.warn('🔗 Get your API key from: https://bhashini.gov.in/ulca\n');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json({ limit: '100mb' }));

// Request logging middleware
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

// Bhashini API Configuration - Using dhruva endpoints
const BHASHINI_INFERENCE_URL = 'https://dhruva-api.bhashini.gov.in/services/inference/pipeline';

// Health check endpoint
app.get('/health', (req, res) => {
  const healthStatus = {
    status: 'OK',
    message: 'Legal Chatbot API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    apiKeys: {
      gemini: process.env.GEMINI_API_KEY ? 'configured' : 'missing',
      pinecone: process.env.PINECONE_API_KEY ? 'configured' : 'missing',
      bhashini: process.env.INFERENCE_API_KEY ? 'configured' : 'missing'
    },
    version: process.env.npm_package_version || '1.0.0'
  };
  
  // Set status based on configuration
  if (!process.env.GEMINI_API_KEY || !process.env.PINECONE_API_KEY || !process.env.INFERENCE_API_KEY) {
    healthStatus.status = 'DEGRADED';
    healthStatus.message = 'API is running but some services are not configured';
  }
  
  res.json(healthStatus);
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Backend is working!',
    time: new Date().toISOString()
  });
});

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

    // Check if API key is configured
    if (!process.env.INFERENCE_API_KEY) {
      console.warn('⚠️  INFERENCE_API_KEY not configured');
      
      // Return mock translation for development
      return res.json({ 
        success: true, 
        translation: `[Mock ${targetLang}] ${text}`,
        metadata: {
          sourceLang,
          targetLang,
          mock: true,
          reason: 'API key not configured'
        }
      });
    }

    try {
      console.log(`🔄 Translating: "${text}" | ${sourceLang} → ${targetLang}`);
      
      // Direct API call to Bhashini
      const response = await fetch(BHASHINI_INFERENCE_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': process.env.INFERENCE_API_KEY,
          'x-api-key': process.env.INFERENCE_API_KEY
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
      });

      const responseText = await response.text();
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        console.error('API Error Response:', responseText);
        throw new Error(`Translation API error: ${response.status} - ${responseText.substring(0, 200)}`);
      }

      const data = JSON.parse(responseText);
      
      // Extract translation from response - try multiple possible paths
      const translation = 
        data?.pipelineResponse?.[0]?.output?.[0]?.target ||
        data?.pipelineResponse?.[0]?.output?.[0]?.translation ||
        data?.output?.[0]?.target ||
        data?.output?.[0]?.translation ||
        '';

      if (!translation) {
        console.error('Response structure:', JSON.stringify(data, null, 2));
        throw new Error('No translation found in response');
      }

      console.log(`✅ Translation successful: "${translation}"`);
      
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
      
    } catch (apiError) {
      console.error('❌ Bhashini API error:', apiError.message);
      
      // Return mock translation on error in development
      if (process.env.NODE_ENV === 'development') {
        return res.json({ 
          success: true, 
          translation: `[Error - Mock ${targetLang}] ${text}`,
          metadata: {
            sourceLang,
            targetLang,
            mock: true,
            error: apiError.message
          }
        });
      }
      
      // In production, return error
      return res.status(500).json({
        success: false,
        error: 'Translation service temporarily unavailable',
        details: apiError.message
      });
    }
    
  } catch (error) {
    console.error('❌ Translation endpoint error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Translation failed'
    });
  }
});

// Test Bhashini API endpoint
app.get('/api/bhashini/test', async (req, res) => {
  try {
    if (!process.env.INFERENCE_API_KEY) {
      return res.status(400).json({
        success: false,
        error: 'INFERENCE_API_KEY not configured'
      });
    }

    console.log('🧪 Testing Bhashini API...');

    // Test with a simple translation request
    const testResponse = await fetch(BHASHINI_INFERENCE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.INFERENCE_API_KEY,
        'x-api-key': process.env.INFERENCE_API_KEY
      },
      body: JSON.stringify({
        pipelineTasks: [
          {
            taskType: 'translation',
            config: {
              language: {
                sourceLanguage: 'en',
                targetLanguage: 'hi'
              },
              serviceId: 'ai4bharat/indictrans-v2-all-gpu--t4'
            }
          }
        ],
        inputData: {
          input: [{ source: 'Hello' }]
        }
      })
    });

    const responseText = await testResponse.text();
    console.log('Test response status:', testResponse.status);
    
    res.json({
      success: testResponse.ok,
      status: testResponse.status,
      headers: Object.fromEntries(testResponse.headers.entries()),
      response: testResponse.ok ? JSON.parse(responseText) : responseText.substring(0, 500),
      apiKeyLength: process.env.INFERENCE_API_KEY.length,
      endpoint: BHASHINI_INFERENCE_URL
    });
    
  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      type: error.constructor.name
    });
  }
});

// Debug environment variables endpoint
app.get('/api/debug/env', (req, res) => {
  res.json({
    INFERENCE_KEY_EXISTS: !!process.env.INFERENCE_API_KEY,
    INFERENCE_KEY_LENGTH: process.env.INFERENCE_API_KEY?.length || 0,
    INFERENCE_KEY_PREVIEW: process.env.INFERENCE_API_KEY ? 
      `${process.env.INFERENCE_API_KEY.substring(0, 5)}...${process.env.INFERENCE_API_KEY.slice(-5)}` : 'NOT SET',
    GEMINI_KEY_EXISTS: !!process.env.GEMINI_API_KEY,
    PINECONE_KEY_EXISTS: !!process.env.PINECONE_API_KEY,
    NODE_ENV: process.env.NODE_ENV || 'development'
  });
});

// Chat endpoint handler (shared logic for both /chat and /chatbot)
const handleChatRequest = async (req, res) => {
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
};

// Chat endpoint
app.post('/chat', handleChatRequest);

// Chatbot endpoint (alias for /chat to maintain compatibility)
app.post('/chatbot', handleChatRequest);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Legal Services API',
    version: '1.0.0',
    endpoints: {
      'GET /health': 'Health check endpoint',
      'GET /test': 'Test endpoint',
      'POST /chat': 'Chat with AI assistant',
      'POST /chatbot': 'Chat with AI assistant (alias for /chat)',
      'POST /api/translate': 'Translate text using Bhashini',
      'GET /api/bhashini/test': 'Test Bhashini API connection',
      'GET /api/debug/env': 'Debug environment variables',
      'GET /api': 'API documentation'
    },
    chatEndpoint: {
      method: 'POST',
      paths: ['/chat', '/chatbot'],
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
      description: 'Test Bhashini API connection and configuration',
      response: {
        success: true,
        status: 200,
        apiKeyLength: 64,
        endpoint: 'https://dhruva-api.bhashini.gov.in/services/inference/pipeline'
      }
    },
    supportedLanguages: {
      translation: {
        source: ['en', 'hi', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa', 'as', 'or', 'ur'],
        target: ['en', 'hi', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa', 'as', 'or', 'ur']
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    message: `The endpoint ${req.method} ${req.path} does not exist`,
    availableEndpoints: [
      '/health',
      '/test',
      '/chat',
      '/chatbot',
      '/api',
      '/api/translate',
      '/api/bhashini/test',
      '/api/debug/env'
    ]
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

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('✅ HTTP server closed gracefully');
    process.exit(0);
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
  console.log(`💬 Chat endpoints: http://localhost:${PORT}/chat or /chatbot`);
  console.log(`📚 API docs: http://localhost:${PORT}/api`);
  console.log(`🔐 Test Bhashini: http://localhost:${PORT}/api/bhashini/test`);
  console.log(`🐛 Debug env: http://localhost:${PORT}/api/debug/env`);
  console.log('━'.repeat(50));
  
  if (!process.env.GEMINI_API_KEY) {
    console.log('\n⚠️  To enable AI features:');
    console.log('1. Get API key from: https://makersuite.google.com/app/apikey');
    console.log('2. Add to .env.local: GEMINI_API_KEY=your_key_here');
    console.log('3. Restart the server\n');
  }

  if (!process.env.INFERENCE_API_KEY) {
    console.log('\n⚠️  To enable translation features:');
    console.log('1. Register at: https://bhashini.gov.in/ulca');
    console.log('2. Get your Inference API key from the Bhashini platform');
    console.log('3. Add to .env.local:');
    console.log('   INFERENCE_API_KEY=your_inference_key');
    console.log('4. Restart the server\n');
  }
  
  console.log('💡 Quick test commands:');
  console.log('━'.repeat(50));
  console.log('# Check if your API key is loaded:');
  console.log(`curl http://localhost:${PORT}/api/debug/env\n`);
  
  console.log('# Test Bhashini API connection:');
  console.log(`curl http://localhost:${PORT}/api/bhashini/test\n`);
  
  console.log('# Test translation:');
  console.log(`curl -X POST http://localhost:${PORT}/api/translate \\`);
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -d \'{"text":"Hello, how are you?","sourceLang":"en","targetLang":"hi"}\'');
  console.log('\n# Test chatbot:');
  console.log(`curl -X POST http://localhost:${PORT}/chatbot \\`);
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -d \'{"messages":[{"role":"user","content":"Hello"}]}\'');
  console.log('━'.repeat(50) + '\n');
});

export default server;