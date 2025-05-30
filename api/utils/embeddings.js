import { embeddingModel } from './gemini.js';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';


export async function generateEmbedding(text) {
  try {
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }
    
   
    const truncatedText = text.length > 3000 ? text.substring(0, 3000) : text;
    
    const result = await embeddingModel.embedContent(truncatedText);
    return result.embedding.values;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding: ' + error.message);
  }
}


export async function splitDocuments(text, metadata = {}) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
    separators: ['\n\n', '\n', '.', '!', '?', ';', ':', ' ', ''],
  });
  
  const chunks = await splitter.splitText(text);
  
  return chunks.map((chunk, index) => ({
    text: chunk.trim(),
    metadata: {
      ...metadata,
      chunkIndex: index,
      chunkTotal: chunks.length,
      chunkSize: chunk.length,
    },
  }));
}


export function createContext(documents, maxLength = 4000) {
  if (!documents || documents.length === 0) {
    return "No relevant legal documents found for this query.";
  }
  
  let context = "=== Relevant Legal Information ===\n\n";
  let currentLength = context.length;
  
 
  const sortedDocs = [...documents].sort((a, b) => b.score - a.score);
  
  for (const doc of sortedDocs) {
    const docInfo = `📄 Source: ${doc.metadata.title || 'Legal Document'}\n` +
                   `📍 Section: ${doc.metadata.section || 'General'}\n` +
                   `📊 Relevance: ${(doc.score * 100).toFixed(1)}%\n` +
                   `📝 Content: ${doc.text}\n` +
                   `${'─'.repeat(50)}\n\n`;
    
        if (currentLength + docInfo.length > maxLength) {
      
      context += "\n[Additional relevant documents truncated due to length constraints]";
      break;
    }
    
    context += docInfo;
    currentLength += docInfo.length;
  }
  
  return context;
}


export function processQuery(query) {
  
  const cleaned = query.trim().replace(/\s+/g, ' ');
  
  
  if (cleaned.length < 3) {
    throw new Error('Query too short. Please provide more details.');
  }
  
  
  if (cleaned.length > 1000) {
    throw new Error('Query too long. Please keep it under 1000 characters.');
  }
  
  return cleaned;
}