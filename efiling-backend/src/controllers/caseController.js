import Case from '../models/Case.js';
import Document from '../models/Document.js';
import Notification from '../models/Notification.js';
import { generateEFilingNumber, generateCNRNumber } from '../utils/generateIds.js';
import { COURT_FEES } from '../utils/constants.js';

export const createCase = async (req, res) => {
  try {
    const userId = req.user.id;
    const caseData = req.body;

    // Generate e-filing number
    const eFilingNumber = generateEFilingNumber();

    // Calculate court fees
    const category = caseData.courtDetails.category;
    const courtFees = {
      filingFee: COURT_FEES[category.toUpperCase()].FILING_FEE,
      processFee: COURT_FEES[category.toUpperCase()].PROCESS_FEE
    };
    courtFees.totalAmount = courtFees.filingFee + courtFees.processFee;

    const newCase = await Case.create({
      ...caseData,
      eFilingNumber,
      userId,
      courtFees,
      status: 'draft',
      lastUpdated: new Date()
    });

    // Create notification
    await Notification.create({
      userId,
      type: 'case_update',
      title: 'New Case Created',
      message: `Case ${eFilingNumber} has been created successfully`,
      relatedCase: newCase._id
    });

    res.status(201).json({
      status: 'success',
      data: { case: newCase }
    });
  } catch (error) {
    console.error('Create case error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const updateCase = async (req, res) => {
  try {
    const { caseId } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    const case_ = await Case.findOne({ _id: caseId, userId });
    
    if (!case_) {
      return res.status(404).json({
        status: 'error',
        message: 'Case not found or access denied'
      });
    }

    if (!['draft', 'not_accepted', 'defective'].includes(case_.status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot update case in current status'
      });
    }

    const updatedCase = await Case.findByIdAndUpdate(caseId, {
      ...updates,
      lastUpdated: new Date()
    }, { new: true, runValidators: true });

    res.status(200).json({
      status: 'success',
      data: { case: updatedCase }
    });
  } catch (error) {
    console.error('Update case error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const submitCase = async (req, res) => {
  try {
    const { caseId } = req.params;
    const userId = req.user.id;

    const case_ = await Case.findOne({ _id: caseId, userId });
    
    if (!case_) {
      return res.status(404).json({
        status: 'error',
        message: 'Case not found or access denied'
      });
    }

    if (case_.status !== 'draft') {
      return res.status(400).json({
        status: 'error',
        message: 'Case has already been submitted'
      });
    }

    if (!case_.affirmationSigned) {
      return res.status(400).json({
        status: 'error',
        message: 'Affirmation must be signed before submission'
      });
    }

    if (case_.courtFees.paymentStatus !== 'paid') {
      return res.status(400).json({
        status: 'error',
        message: 'Court fees must be paid before submission'
      });
    }

    // Update case status
    case_.status = 'pending_acceptance';
    case_.submissionDate = new Date();
    case_.lastUpdated = new Date();
    await case_.save();

    // Create notification
    await Notification.create({
      userId,
      type: 'case_update',
      title: 'Case Submitted',
      message: `Case ${case_.eFilingNumber} has been submitted for review`,
      relatedCase: case_._id,
      priority: 'high'
    });

    res.status(200).json({
      status: 'success',
      message: 'Case submitted successfully',
      data: { case: case_ }
    });
  } catch (error) {
    console.error('Submit case error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getCases = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10, search } = req.query;

    const query = { userId };
    if (status) query.status = status;
    
    // Add search functionality
    if (search) {
      query.$or = [
        { eFilingNumber: { $regex: search, $options: 'i' } },
        { cnrNumber: { $regex: search, $options: 'i' } },
        { 'petitioner.firstName': { $regex: search, $options: 'i' } },
        { 'petitioner.lastName': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const cases = await Case.find(query)
      .populate('documents')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Case.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: cases.length,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      data: { cases }
    });
  } catch (error) {
    console.error('Get cases error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getCase = async (req, res) => {
  try {
    const { caseId } = req.params;
    const userId = req.user.id;

    const case_ = await Case.findOne({ _id: caseId, userId })
      .populate('documents')
      .populate('userId', 'personalInfo advocateInfo');

    if (!case_) {
      return res.status(404).json({
        status: 'error',
        message: 'Case not found or access denied'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { case: case_ }
    });
  } catch (error) {
    console.error('Get case error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getCaseStatus = async (req, res) => {
  try {
    const { cnrNumber } = req.params;

    const case_ = await Case.findOne({ cnrNumber })
      .populate('documents')
      .select('eFilingNumber cnrNumber status courtDetails petitioner respondents hearingDates lastUpdated');

    if (!case_) {
      return res.status(404).json({
        status: 'error',
        message: 'Case not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { case: case_ }
    });
  } catch (error) {
    console.error('Get case status error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const deleteCase = async (req, res) => {
  try {
    const { caseId } = req.params;
    const userId = req.user.id;

    const case_ = await Case.findOne({ _id: caseId, userId });
    
    if (!case_) {
      return res.status(404).json({
        status: 'error',
        message: 'Case not found or access denied'
      });
    }

    if (case_.status !== 'draft') {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete case that has been submitted'
      });
    }

    // Delete associated documents
    await Document.deleteMany({ caseId });
    
    // Delete the case
    await Case.findByIdAndDelete(caseId);

    res.status(200).json({
      status: 'success',
      message: 'Case deleted successfully'
    });
  } catch (error) {
    console.error('Delete case error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Case.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedStats = {
      total: 0,
      draft: 0,
      pending_acceptance: 0,
      not_accepted: 0,
      pending_scrutiny: 0,
      defective: 0,
      filed: 0,
      rejected: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
      formattedStats.total += stat.count;
    });

    // Get recent cases
   // efiling/controllers/caseController.js - Continued

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Case.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedStats = {
      total: 0,
      draft: 0,
      pending_acceptance: 0,
      not_accepted: 0,
      pending_scrutiny: 0,
      defective: 0,
      filed: 0,
      rejected: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
      formattedStats.total += stat.count;
    });

    // Get recent cases
    const recentCases = await Case.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('eFilingNumber status petitioner createdAt');

    // Get payment stats
    const paymentStats = await Case.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          totalPaid: { $sum: '$courtFees.paidAmount' },
          totalDeficit: { $sum: '$courtFees.deficitAmount' }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        caseStats: formattedStats,
        recentCases,
        paymentStats: paymentStats[0] || { totalPaid: 0, totalDeficit: 0 }
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const signAffirmation = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { signingMethod, aadharOTP, digitalSignature } = req.body;
    const userId = req.user.id;

    const case_ = await Case.findOne({ _id: caseId, userId });
    
    if (!case_) {
      return res.status(404).json({
        status: 'error',
        message: 'Case not found or access denied'
      });
    }

    if (case_.status !== 'draft') {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot sign affirmation for submitted case'
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

    // Mark affirmation as signed
    case_.affirmationSigned = true;
    case_.lastUpdated = new Date();
    await case_.save();

    // Create notification
    await Notification.create({
      userId,
      type: 'case_update',
      title: 'Affirmation Signed',
      message: `Affirmation for case ${case_.eFilingNumber} has been signed`,
      relatedCase: case_._id
    });

    res.status(200).json({
      status: 'success',
      message: 'Affirmation signed successfully',
      data: { case: case_ }
    });
  } catch (error) {
    console.error('Sign affirmation error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Admin functions (for court staff)
export const assignCNR = async (req, res) => {
  try {
    const { caseId } = req.params;

    const case_ = await Case.findById(caseId);
    
    if (!case_) {
      return res.status(404).json({
        status: 'error',
        message: 'Case not found'
      });
    }

    if (case_.cnrNumber) {
      return res.status(400).json({
        status: 'error',
        message: 'CNR already assigned to this case'
      });
    }

    // Generate CNR number
    const cnrNumber = generateCNRNumber(
      case_.courtDetails.state, 
      case_.courtDetails.district
    );
    
    case_.cnrNumber = cnrNumber;
    case_.status = 'filed';
    case_.lastUpdated = new Date();
    await case_.save();

    // Create notification for user
    await Notification.create({
      userId: case_.userId,
      type: 'case_update',
      title: 'CNR Assigned',
      message: `CNR ${cnrNumber} has been assigned to your case ${case_.eFilingNumber}`,
      relatedCase: case_._id,
      priority: 'high'
    });

    res.status(200).json({
      status: 'success',
      message: 'CNR assigned successfully',
      data: { case: case_ }
    });
  } catch (error) {
    console.error('Assign CNR error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const updateCaseStatus = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { status, reason, defects } = req.body;

    const case_ = await Case.findById(caseId);
    
    if (!case_) {
      return res.status(404).json({
        status: 'error',
        message: 'Case not found'
      });
    }

    const oldStatus = case_.status;
    case_.status = status;
    case_.lastUpdated = new Date();

    if (status === 'not_accepted' || status === 'rejected') {
      case_.rejectionReason = reason;
    }

    if (status === 'defective' && defects) {
      case_.defects = defects;
    }

    await case_.save();

    // Create notification for user
    await Notification.create({
      userId: case_.userId,
      type: 'case_update',
      title: 'Case Status Updated',
      message: `Your case ${case_.eFilingNumber} status changed from ${oldStatus} to ${status}`,
      relatedCase: case_._id,
      priority: ['rejected', 'not_accepted', 'defective'].includes(status) ? 'high' : 'medium'
    });

    res.status(200).json({
      status: 'success',
      message: 'Case status updated successfully',
      data: { case: case_ }
    });
  } catch (error) {
    console.error('Update case status error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};