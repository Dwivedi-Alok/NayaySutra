import { geminiModel, LEGAL_SYSTEM_PROMPT } from './utils/gemini.js';
import { generateEmbedding, createContext } from './utils/embeddings.js';
import { searchSimilarDocuments } from './utils/vectorStore.js';

// Enable CORS for local development
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).headers(corsHeaders).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;
    
    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: 'Messages are required' });
    }
    
    const userQuery = messages[messages.length - 1].content;
    
    // Step 1: Generate embedding for the user's query
    console.log('Generating embedding for query...');
    const queryEmbedding = await generateEmbedding(userQuery);
    
    // Step 2: Search for relevant legal documents
    console.log('Searching for relevant documents...');
    const relevantDocs = await searchSimilarDocuments(queryEmbedding, 5);
    
    // Step 3: Create context from retrieved documents
    const context = createContext(relevantDocs);
    
    // Step 4: Build conversation history
    const conversationHistory = messages.slice(0, -1)
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');
    
    // Step 5: Create the prompt for Gemini
    const prompt = `${LEGAL_SYSTEM_PROMPT}

Context from Legal Documents:
${context}

Previous Conversation:
${conversationHistory}

User Question: ${userQuery}

Please provide a comprehensive answer based on the legal context provided. If the context doesn't contain relevant information, provide general legal guidance while being clear about the limitations.`;
    
    // Step 6: Generate response using Gemini
    console.log('Generating response with Gemini...');
    const result = await geminiModel.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Step 7: Calculate confidence based on document relevance scores
    const avgScore = relevantDocs.length > 0 
      ? relevantDocs.reduce((sum, doc) => sum + doc.score, 0) / relevantDocs.length 
      : 0;
    
    // Step 8: Format sources
    const sources = relevantDocs
      .filter(doc => doc.score > 0.7)
      .map(doc => `${doc.metadata.title || 'Legal Document'} - ${doc.metadata.section || 'Section'}`);
    
    return res.status(200).json({
      answer: text,
      sources: sources,
      confidence: avgScore,
    });
    
  } catch (error) {
    console.error('Chat API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to process your request',
      details: error.message 
    });
  }
}