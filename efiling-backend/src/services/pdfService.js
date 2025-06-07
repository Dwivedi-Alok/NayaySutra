import { PDFDocument } from 'pdf-lib';
import fs from 'fs';

export const getPDFInfo = async (filePath) => {
  try {
    const pdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    return {
      pageCount: pdfDoc.getPageCount(),
      title: pdfDoc.getTitle() || '',
      author: pdfDoc.getAuthor() || '',
      creationDate: pdfDoc.getCreationDate()
    };
  } catch (error) {
    throw new Error(`PDF processing error: ${error.message}`);
  }
};

export const validatePDF = async (filePath) => {
  try {
    const pdfBytes = fs.readFileSync(filePath);
    await PDFDocument.load(pdfBytes);
    return { isValid: true, message: 'PDF is valid' };
  } catch (error) {
    return { isValid: false, message: `Invalid PDF: ${error.message}` };
  }
};

export const createAffirmationPDF = async (caseData, userInfo) => {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    
    const { width, height } = page.getSize();
    const fontSize = 12;
    
    // Add content to PDF
    page.drawText('AFFIRMATION', {
      x: width / 2 - 50,
      y: height - 100,
      size: 18
    });
    
    page.drawText(`I, ${userInfo.personalInfo.firstName} ${userInfo.personalInfo.lastName},`, {
      x: 50,
      y: height - 150,
      size: fontSize
    });
    
    page.drawText('do hereby affirm and state as follows:', {
      x: 50,
      y: height - 170,
      size: fontSize
    });
    
    page.drawText('1. The facts stated in the petition are true to the best of my knowledge.', {
      x: 50,
      y: height - 210,
      size: fontSize
    });
    
    page.drawText('2. I have not concealed any material facts.', {
      x: 50,
      y: height - 230,
      size: fontSize
    });
    
    page.drawText('3. The case is being filed in good faith.', {
      x: 50,
      y: height - 250,
      size: fontSize
    });
    
    page.drawText(`Date: ${new Date().toLocaleDateString()}`, {
      x: 50,
      y: height - 300,
      size: fontSize
    });
    
    page.drawText('Signature: ____________________', {
      x: 350,
      y: height - 350,
      size: fontSize
    });
    
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  } catch (error) {
    throw new Error(`Affirmation PDF creation error: ${error.message}`);
  }
};