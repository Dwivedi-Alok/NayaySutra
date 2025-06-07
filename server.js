import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { log } from 'console';

// Load environment variables FIRST
dotenv.config({ path: '.env.local' });

// Verify environment variables are loaded
console.log('🔧 Environment Check:', {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3001,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Missing',
  PINECONE_API_KEY: process.env.PINECONE_API_KEY ? '✅ Set' : '❌ Missing',
  PINECONE_INDEX_NAME: process.env.PINECONE_INDEX_NAME || 'Not set'
});

// Warn if critical environment variables are missing
if (!process.env.GEMINI_API_KEY) {
  console.warn('⚠️  WARNING: GEMINI_API_KEY is not set. The chatbot will not function properly.');
  console.warn('📝 Please add GEMINI_API_KEY to your .env.local file');
  console.warn('🔗 Get your API key from: https://makersuite.google.com/app/apikey\n');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Add your frontend URLs
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
      pinecone: process.env.PINECONE_API_KEY ? 'configured' : 'missing'
    },
    version: process.env.npm_package_version || '0.0.0'
  };
  
  // Set status based on configuration
  if (!process.env.GEMINI_API_KEY || !process.env.PINECONE_API_KEY) {
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

// Chat endpoint with better error handling
app.post('/chat', async (req, res) => {
  try {
    // Validate request body
    if (!req.body || !req.body.messages) {
      console.log("hi there",res.json());
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
    message: 'Legal Chatbot API',
    version: '1.0.0',
    endpoints: {
      'GET /health': 'Health check endpoint',
      'GET /test': 'Test endpoint',
      'POST /chat': 'Chat with AI assistant',
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
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    message: `The endpoint ${req.method} ${req.path} does not exist`,
    availableEndpoints: ['/health', '/test', '/chat', '/api']
  });
});

// Error handling middleware
app.use((err, req, res) => {
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
  app.close(() => {
    console.log('🛑 HTTP server closed');
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log('\n🚀 Legal Chatbot Backend Started!');
  console.log('━'.repeat(50));
  console.log(`✅ Server running on: http://localhost:${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/test`);
  console.log(`📚 API docs: http://localhost:${PORT}/api`);
  console.log('━'.repeat(50));
  
  if (!process.env.GEMINI_API_KEY) {
    console.log('\n⚠️  To enable AI features:');
    console.log('1. Get API key from: https://makersuite.google.com/app/apikey');
    console.log('2. Add to .env.local: GEMINI_API_KEY=your_key_here');
    console.log('3. Restart the server\n');
  }
});

export default server;