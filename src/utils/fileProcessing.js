import Tesseract from 'tesseract.js';

export const performOCR = async (file, onProgress) => {
  return new Promise((resolve, reject) => {
    Tesseract.recognize(
      file,
      'eng+hin+mar+tam+ben',
      {
        logger: (m) => {
          if (m.status === 'recognizing text' && onProgress) {
            onProgress(Math.round(m.progress * 100));
          }
        }
      }
    ).then(({ data: { text } }) => {
      resolve(text);
    }).catch(reject);
  });
};

export const extractTextFromPDF = async (file) => {
  // Placeholder - implement with pdfjs-dist
  return "PDF text extraction to be implemented";
};

export const extractTextFromWord = async (file) => {
  // Placeholder - implement with mammoth
  return "Word document text extraction to be implemented";
};