import { GoogleGenerativeAI } from '@google/generative-ai';

// Validate API key
if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is required in environment variables');
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Export configured models with updated model names
export const geminiModel = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash" // Fast model, good for most use cases
  // Alternative: model: "gemini-1.5-pro" // More capable but slower
});

// Updated embedding model
export const embeddingModel = genAI.getGenerativeModel({ 
  model: "text-embedding-004" 
});

// System prompt for legal assistant
export const LEGAL_SYSTEM_PROMPT = `You are an AI legal assistant specializing in Indian law and legal procedures. 

Your responsibilities:
1. Provide accurate legal information based on Indian laws and regulations
2. Explain complex legal concepts in simple, understandable language
3. Reference specific acts, sections, and legal provisions when applicable
4. Maintain a professional and helpful tone

Important guidelines:
- Always clarify that your responses are for informational purposes only
- Recommend consulting with a qualified lawyer for specific legal advice
- Be transparent when information is outside your knowledge base
- Use the provided context from legal documents to give accurate answers

When answering:
- Start with a direct answer to the question
- Provide relevant legal context and citations
- Explain any legal terminology used
- Suggest next steps if applicable`;

// Generate text with retry logic
export async function generateTextWithRetry(prompt, maxRetries = 3) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await geminiModel.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error.message);
      lastError = error;
      
      // Wait before retrying (exponential backoff)
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError;
}

// Generate embedding with proper error handling
export async function generateEmbeddingWithRetry(text, maxRetries = 3) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await embeddingModel.embedContent({
        content: { 
          parts: [{ text: text }] 
        }
      });
      
      return result.embedding.values;
    } catch (error) {
      console.error(`Embedding attempt ${i + 1} failed:`, error.message);
      lastError = error;
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError;
}

// Safety settings for content generation
export const safetySettings = [
  {
    category: "HARM_CATEGORY_HARASSMENT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE"
  },
  {
    category: "HARM_CATEGORY_HATE_SPEECH",
    threshold: "BLOCK_MEDIUM_AND_ABOVE"
  },
  {
    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE"
  },
  {
    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE"
  }
];

// Generate content with safety settings
export async function generateSafeContent(prompt) {
  try {
    const result = await geminiModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      safetySettings: safetySettings,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    });
    
    const response = result.response;
    
    // Check if response was blocked
    if (response.promptFeedback?.blockReason) {
      throw new Error(`Content generation blocked: ${response.promptFeedback.blockReason}`);
    }
    
    return response.text();
  } catch (error) {
    console.error('Error generating safe content:', error);
    throw error;
  }
}

// List available models (for debugging)
export async function listAvailableModels() {
  try {
    const models = await genAI.listModels();
    console.log('Available Gemini models:');
    for await (const model of models) {
      console.log(`- ${model.name} (${model.displayName})`);
      console.log(`  Supported methods: ${model.supportedGenerationMethods.join(', ')}`);
    }
  } catch (error) {
    console.error('Error listing models:', error);
  }
}

// Test function to verify API key and models
export async function testGeminiConnection() {
  try {
    console.log('Testing Gemini API connection...');
    
    // Test text generation
    const testPrompt = "Say 'Hello, Legal Assistant is ready!' in a professional way.";
    const response = await generateTextWithRetry(testPrompt, 1);
    console.log('✅ Text generation working:', response.substring(0, 50) + '...');
    
    // Test embedding generation
    const testEmbedding = await generateEmbeddingWithRetry("test legal text", 1);
    console.log('✅ Embedding generation working, dimensions:', testEmbedding.length);
    
    return true;
  } catch (error) {
    console.error('❌ Gemini API test failed:', error.message);
    return false;
  }
}

// Export a function to get model info
export function getModelInfo() {
  return {
    chatModel: "gemini-1.5-flash",
    embeddingModel: "text-embedding-004",
    embeddingDimensions: 768,
    maxTokens: 2048,
    temperature: 0.7
  };
}