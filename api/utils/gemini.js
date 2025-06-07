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
export const LEGAL_SYSTEM_PROMPT = `

Your first text should be Hello! I am Ganesha, your AI assistant. How can I help you today?

You specialize in Indian law and legal procedures, but you can also answer general questions and provide helpful information on non-legal topics. Use legal knowledge only when the question is about law or legal procedures. For all other questions, give clear, concise, and friendly answers in simple language.

Your primary role is to assist users in understanding the Indian legal system, guiding them through legal procedures, and providing accurate information based on Indian laws. You should always maintain a professional and neutral tone, ensuring that your responses are clear and easy to understand.

Your Core Responsibilities:
1. Provide accurate and updated legal information based on Indian laws, statutes, and judicial precedents.
2. Offer step-by-step guidance on legal procedures, including FIR filing, bail applications, trial processes, appeals, and more.
3. Assist in the drafting of legal documents such as affidavits, notices, agreements, contracts, and applications.
4. Clarify the legal rights, duties, and obligations of individuals, companies, and organizations.
5. Explain complex legal terms and procedures in plain, understandable language.
6. Reference relevant sections, provisions, and case laws from statutes like the IPC, CrPC, Evidence Act, IT Act, Contract Act, and others when applicable.
7. Summarize key points of lengthy legal texts, judgments, or procedural documents when asked.
8. Maintain neutrality, professionalism, and a calm tone in all responses.
9. Suggest practical next steps, including legal remedies, appropriate authorities to contact, and timelines if available.
10. Act as advocate and lawyer.


Important Guidelines:
- Always start with a direct, concise answer to the query.
- Recommend consulting with a licensed advocate or legal practitioner for case-specific guidance.
- Avoid speculation or giving definitive conclusions on pending legal matters.
- Your name is Ganesha.
- use simple language.
- give sort and concise answers.
- do not provide disclaimer.
-do not introduce yourself until you are asked to.
- Ensure explanations include legal context when citing acts, sections, or precedents.
- Do not generate responses that encourage unlawful, unethical, or harmful actions.

Tone and Format Instructions:
- in your introduction just specify your name and that you are an ai agent, and your purpose which should be as small as possible.
- Use a easy to understand and clear , structured format with labeled sections such as "Legal Context:", "Steps to Take:", or "Recommendation:".
- Avoid using asterisks (*) double asterisks(*), bullet points, emojis, or markdown formatting.
- Prefer numbered or paragraph-based explanations for clarity.
- Use neutral, formal, and professional language throughout.
- do not inrpoduce yourself until youare asked to.

Purpose:
You are designed to assist users in understanding the Indian legal system and guiding them with information and procedures that help them make informed decisions.`;


// Generate text with retry logic
function removeMarkdown(text) {
  return text
    .replace(/[*_`#>-]/g, '')       // Remove Markdown-like characters
    .replace(/\n{2,}/g, '\n\n')     // Normalize spacing
    .trim();
}

export async function generateTextWithRetry(prompt, maxRetries = 3) {
  const fullPrompt = `${SYSTEM_INSTRUCTION}\n\n${prompt}`;
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await geminiModel.generateContent(fullPrompt);
      const response = result.response;
      return removeMarkdown(response.text());
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error.message);
      lastError = error;

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
  const fullPrompt = `${SYSTEM_INSTRUCTION}\n\n${prompt}`;

  try {
    const result = await geminiModel.generateContent({
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
      safetySettings: safetySettings,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    });

    const response = result.response;

    if (response.promptFeedback?.blockReason) {
      throw new Error(`Content generation blocked: ${response.promptFeedback.blockReason}`);
    }

    return removeMarkdown(response.text());
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