import Tesseract from 'tesseract.js';
import mammoth from 'mammoth';

// Load PDF.js from CDN
const loadPdfJs = async () => {
  if (!window.pdfjsLib) {
    // Create script element
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    document.head.appendChild(script);
    
    // Wait for script to load
    await new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = () => reject(new Error('Failed to load PDF.js'));
    });
    
    // Set worker source
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }
  return window.pdfjsLib;
};

// OCR function with better error handling
export const performOCR = async (file, onProgress) => {
  try {
    // Validate file
    if (!file) {
      throw new Error('No file provided for OCR');
    }

    // Check file size (limit to 10MB for OCR)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File too large for OCR. Please use a file smaller than 10MB.');
    }

    console.log('Starting OCR for file:', file.name);

    const result = await Tesseract.recognize(
      file,
      'eng+hin+mar+tam+ben', // Languages
      {
        logger: (m) => {
          console.log('OCR Progress:', m);
          if (m.status === 'recognizing text' && onProgress) {
            onProgress(Math.round(m.progress * 100));
          }
        },
        errorHandler: (error) => {
          console.error('OCR Error:', error);
        }
      }
    );

    const text = result.data.text;
    
    if (!text || text.trim().length === 0) {
      throw new Error('No text could be extracted from the image');
    }

    console.log('OCR completed, extracted text length:', text.length);
    return text;
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error(`OCR failed: ${error.message}`);
  }
};

// Extract text from PDF with better error handling
export const extractTextFromPDF = async (file, onProgress) => {
  try {
    console.log('Loading PDF.js...');
    const pdfjsLib = await loadPdfJs();
    
    console.log('Reading PDF file...');
    const arrayBuffer = await file.arrayBuffer();
    
    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    
    // Track loading progress
    loadingTask.onProgress = function(progress) {
      if (onProgress && progress.total > 0) {
        const percent = Math.round((progress.loaded / progress.total) * 100);
        onProgress(percent);
      }
    };
    
    const pdf = await loadingTask.promise;
    console.log(`PDF loaded. Total pages: ${pdf.numPages}`);
    
    let fullText = '';
    let hasText = false;
    
    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      if (onProgress) {
        onProgress(Math.round((i / pdf.numPages) * 100));
      }
      
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map(item => item.str)
        .join(' ')
        .trim();
      
      if (pageText.length > 0) {
        hasText = true;
        fullText += `\n--- Page ${i} ---\n${pageText}\n`;
      }
    }
    
    if (!hasText) {
      console.warn('No text found in PDF. The PDF might contain scanned images.');
      throw new Error('No text found in PDF. The document might be scanned. Try using OCR on individual pages.');
    }
    
    console.log('PDF text extraction completed. Total characters:', fullText.length);
    return fullText.trim();
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
};

// Extract text from Word documents
export const extractTextFromWord = async (file, onProgress) => {
  try {
    console.log('Reading Word document...');
    
    // Check file size (limit to 50MB)
    if (file.size > 50 * 1024 * 1024) {
      throw new Error('File too large. Please use a file smaller than 50MB.');
    }
    
    if (onProgress) onProgress(30);
    
    const arrayBuffer = await file.arrayBuffer();
    
    if (onProgress) onProgress(60);
    
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    if (onProgress) onProgress(90);
    
    if (!result.value || result.value.trim().length === 0) {
      throw new Error('No text could be extracted from the Word document');
    }
    
    if (result.messages && result.messages.length > 0) {
      console.warn('Word extraction warnings:', result.messages);
    }
    
    if (onProgress) onProgress(100);
    
    console.log('Word text extraction completed. Total characters:', result.value.length);
    return result.value;
  } catch (error) {
    console.error('Word extraction error:', error);
    throw new Error(`Failed to extract text from Word document: ${error.message}`);
  }
};

// Utility function to detect if PDF has text or is scanned
export const isPDFScanned = async (file) => {
  try {
    const pdfjsLib = await loadPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    // Check first few pages for text
    const pagesToCheck = Math.min(3, pdf.numPages);
    let totalTextLength = 0;
    
    for (let i = 1; i <= pagesToCheck; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      totalTextLength += textContent.items.reduce((sum, item) => sum + item.str.length, 0);
    }
    
    // If very little text found, it's likely scanned
    return totalTextLength < 100;
  } catch (error) {
    console.error('Error checking if PDF is scanned:', error);
    return false;
  }
};

// Process any document type
export const processDocument = async (file, onProgress) => {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();
  
  console.log(`Processing file: ${file.name}, Type: ${fileType}, Size: ${file.size} bytes`);
  
  try {
    // Handle different file types
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      // First try text extraction
      try {
        const text = await extractTextFromPDF(file, onProgress);
        return { text, method: 'pdf-extraction' };
      } catch (pdfError) {
        // If PDF extraction fails or no text, check if it's scanned
        const isScanned = await isPDFScanned(file);
        if (isScanned) {
          throw new Error('This PDF appears to be scanned. Please extract individual pages as images and use OCR.');
        }
        throw pdfError;
      }
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileType === 'application/msword' ||
      fileName.endsWith('.docx') ||
      fileName.endsWith('.doc')
    ) {
      const text = await extractTextFromWord(file, onProgress);
      return { text, method: 'word-extraction' };
    } else if (fileType.startsWith('image/')) {
      const text = await performOCR(file, onProgress);
      return { text, method: 'ocr' };
    } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
      const text = await file.text();
      return { text, method: 'text-file' };
    } else {
      throw new Error(`Unsupported file type: ${fileType || 'unknown'}`);
    }
  } catch (error) {
    console.error('Document processing error:', error);
    throw error;
  }
};

// Export all functions
export default {
  performOCR,
  extractTextFromPDF,
  extractTextFromWord,
  isPDFScanned,
  processDocument,
  loadPdfJs
};