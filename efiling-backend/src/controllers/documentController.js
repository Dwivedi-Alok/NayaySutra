import Document from '../models/Document.js';
import Case from '../models/Case.js';
import Notification from '../models/Notification.js';
import { generateDocumentId } from '../utils/generateIds.js';
import { generateHash } from '../utils/hashGenerator.js';
import { getPDFInfo, validatePDF } from '../services/pdfService.js';
import fs from 'fs';
import path from 'path';

export const uploadDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    const { caseId, documentType, documentTitle, cnrNumber } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
    }

    // Validate PDF
    const pdfValidation = await validatePDF(file.path);
    if (!pdfValidation.isValid) {
      // Clean up file
      fs.unlinkSync(file.path);
      return res.status(400).json({
        status: 'error',
        message: pdfValidation.message
      });
    }

    // Get PDF info
    const pdfInfo = await getPDFInfo(file.path);

    // Generate hash
    const hashValue = generateHash(file.path);
    const documentId = generateDocumentId();

    // Create document record
    const document = await Document.create({
      documentId,
      userId,
      caseId: caseId || null,
      cnrNumber: cnrNumber || null,
      documentType,
      documentTitle,
      fileName: file.originalname,
      filePath: file.path,
      fileSize: file.size,
      mimeType: file.mimetype,
      hashValue,
      pageCount: pdfInfo.pageCount
    });

    // Update case if caseId provided
    if (caseId) {
      await Case.findByIdAndUpdate(caseId, {
        $push: { documents: document._id },
        lastUpdated: new Date()
      });
    }

    // Create notification
    await Notification.create({
      userId,
      type: 'document_required',
      title: 'Document Uploaded',
      message: `Document "${documentTitle}" uploaded successfully`,
      relatedCase: caseId
    });

    res.status(201).json({
      status: 'success',
      data: { document }
    });
  } catch (error) {
    // Clean up file if error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error('Upload document error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { caseId, documentType, page = 1, limit = 10 } = req.query;

    const query = { userId };
    if (caseId) query.caseId = caseId;
    if (documentType) query.documentType = documentType;

    const skip = (page - 1) * limit;

    const documents = await Document.find(query)
      .populate('caseId', 'eFilingNumber cnrNumber')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Document.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: documents.length,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: { documents }
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.id;

    const document = await Document.findOne({ 
      _id: documentId, 
      userId 
    }).populate('caseId');

    if (!document) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found or access denied'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { document }
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const downloadDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.id;

    const document = await Document.findOne({ 
      _id: documentId, 
      userId 
    });

    if (!document) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found or access denied'
      });
    }

    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({
        status: 'error',
        message: 'Document file not found on server'
      });
    }

    res.setHeader('Content-Type', document.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${document.fileName}"`);
    
    const fileStream = fs.createReadStream(document.filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Download document error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.id;

    const document = await Document.findOne({ 
      _id: documentId, 
      userId 
    });

    if (!document) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found or access denied'
      });
    }

    if (document.status === 'filed') {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete filed document'
      });
    }

    // Remove from case if associated
    if (document.caseId) {
      await Case.findByIdAndUpdate(document.caseId, {
        $pull: { documents: document._id },
        lastUpdated: new Date()
      });
    }

    // Delete file from filesystem
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    // Delete document record
    await Document.findByIdAndDelete(documentId);

    res.status(200).json({
      status: 'success',
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const signDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { signingMethod, aadharOTP, digitalSignature } = req.body;
    const userId = req.user.id;

    const document = await Document.findOne({ 
      _id: documentId, 
      userId 
    });

    if (!document) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found or access denied'
      });
    }

    if (document.isSigned) {
      return res.status(400).json({
        status: 'error',
        message: 'Document is already signed'
      });
    }

    // Validate signing method
    if (signingMethod === 'aadhar' && !aadharOTP) {
      return res.status(400).json({
        status: 'error',
        message: 'Aadhar OTP is required for e-signing'
      });
    }

    if (signingMethod === 'digital' && !digitalSignature) {
      return res.status(400).json({
        status: 'error',
        message: 'Digital signature is required'
      });
    }

    // Update document
    document.isSigned = true;
    document.signingMethod = signingMethod;
    document.signedAt = new Date();
    document.status = 'signed';
    await document.save();

    res.status(200).json({
      status: 'success',
      message: 'Document signed successfully',
      data: { document }
    });
  } catch (error) {
    console.error('Sign document error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const fileMiscellaneousDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cnrNumber, documentType, documentTitle } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
    }

    // Find case by CNR
    const case_ = await Case.findOne({ cnrNumber });
    if (!case_) {
      return res.status(404).json({
        status: 'error',
        message: 'Case not found with provided CNR number'
      });
    }

    // Check if user has access to this case
    if (case_.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied to this case'
      });
    }

    // Validate PDF
    const pdfValidation = await validatePDF(file.path);
    if (!pdfValidation.isValid) {
      fs.unlinkSync(file.path);
      return res.status(400).json({
        status: 'error',
        message: pdfValidation.message
      });
    }

    // Get PDF info and generate hash
    const pdfInfo = await getPDFInfo(file.path);
    const hashValue = generateHash(file.path);
    const documentId = generateDocumentId();

    // Create document
    const document = await Document.create({
      documentId,
      userId,
      caseId: case_._id,
      cnrNumber,
      documentType,
      documentTitle,
      fileName: file.originalname,
      filePath: file.path,
      fileSize: file.size,
      mimeType: file.mimetype,
      hashValue,
      pageCount: pdfInfo.pageCount,
      courtFeeRequired: ['application', 'affidavit'].includes(documentType)
    });

    // Update case
    await Case.findByIdAndUpdate(case_._id, {
      $push: { documents: document._id },
      lastUpdated: new Date()
    });

    res.status(201).json({
      status: 'success',
      message: 'Miscellaneous document filed successfully',
      data: { document }
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error('File miscellaneous document error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};