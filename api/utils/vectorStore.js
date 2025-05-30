import { Pinecone } from '@pinecone-database/pinecone';

let pineconeClient = null;
let index = null;

// Initialize Pinecone client
export async function initPinecone() {
  if (!pineconeClient) {
    if (!process.env.PINECONE_API_KEY) {
      throw new Error('PINECONE_API_KEY is required');
    }
    
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
    
    index = pineconeClient.index(process.env.PINECONE_INDEX_NAME);
    
    // Verify index exists
    try {
      const indexStats = await index.describeIndexStats();
      console.log('Pinecone index connected:', indexStats);
    } catch (error) {
      console.error('Pinecone index error:', error);
      throw new Error('Failed to connect to Pinecone index');
    }
  }
  
  return { pineconeClient, index };
}

// Search for similar documents
export async function searchSimilarDocuments(embedding, topK = 5, scoreThreshold = 0.7) {
  try {
    const { index } = await initPinecone();
    
    const queryResponse = await index.query({
      vector: embedding,
      topK,
      includeMetadata: true,
      includeValues: false,
    });
    
    // Filter by score threshold and format results
    return queryResponse.matches
      .filter(match => match.score >= scoreThreshold)
      .map(match => ({
        id: match.id,
        score: match.score,
        metadata: match.metadata || {},
        text: match.metadata?.text || '',
      }));
  } catch (error) {
    console.error('Error searching documents:', error);
    return [];
  }
}

// Upsert documents to Pinecone
export async function upsertDocuments(documents) {
  try {
    const { index } = await initPinecone();
    
    // Ensure documents have required format
    const formattedDocs = documents.map(doc => ({
      id: doc.id,
      values: doc.values,
      metadata: {
        ...doc.metadata,
        timestamp: doc.metadata.timestamp || new Date().toISOString(),
      }
    }));
    
    await index.upsert(formattedDocs);
    console.log(`Successfully upserted ${formattedDocs.length} documents`);
    return true;
  } catch (error) {
    console.error('Error upserting documents:', error);
    throw error;
  }
}

// Delete documents by ID
export async function deleteDocuments(ids) {
  try {
    const { index } = await initPinecone();
    await index.deleteMany(ids);
    console.log(`Deleted ${ids.length} documents`);
    return true;
  } catch (error) {
    console.error('Error deleting documents:', error);
    return false;
  }
}