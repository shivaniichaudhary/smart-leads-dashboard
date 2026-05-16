import { Response } from 'express';
import { Lead } from '../models/Lead';
import { CustomRequest } from '../middleware/authMiddleware';

// @desc    Get all leads with advanced filtering, search, and backend pagination
// @route   GET /api/leads
export const getLeads = async (req: CustomRequest, res: Response): Promise<any> => {
  try {
    // 1. Destructure incoming URL parameters with default query assignments
    const { status, source, search, page = 1, limit = 10, sortBy = 'latest' } = req.query;

    // 2. Dynamically construct our search query filter object
    let queryFilter: any = {};

    if (status) {
      queryFilter.status = status;
    }

    if (source) {
      queryFilter.source = source;
    }

    // Advanced Text Search across both Name OR Email parameters simultaneously using case-insensitive regex
    if (search) {
      queryFilter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // 3. Handle Sort Logic (latest vs oldest entries)
    const sortOrder = sortBy === 'oldest' ? 1 : -1;

    // 4. Execute Backend Pagination calculations (skip & limit parameters)
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skipRecords = (pageNum - 1) * limitNum;

    // Run query commands concurrently to fetch data entries alongside absolute record count metrics
    const [leads, totalRecords] = await Promise.all([
      Lead.find(queryFilter)
        .sort({ createdAt: sortOrder })
        .skip(skipRecords)
        .limit(limitNum),
      Lead.countDocuments(queryFilter),
    ]);

    // 5. Send unified clean standard JSON back containing custom metadata blocks
    return res.json({
      success: true,
      meta: {
        totalRecords,
        currentPage: pageNum,
        totalPages: Math.ceil(totalRecords / limitNum),
        limit: limitNum,
      },
      data: leads,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a fresh Lead entry
// @route   POST /api/leads
export const createLead = async (req: CustomRequest, res: Response): Promise<any> => {
  try {
    const { name, email, status, source } = req.body;

    if (!name || !email || !source) {
      return res.status(400).json({ success: false, message: 'Missing required lead parameters' });
    }

    const newLead = await Lead.create({ name, email, status, source });
    return res.status(201).json({ success: true, data: newLead });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a single specific Lead's layout profiles
// @route   GET /api/leads/:id
export const getLeadById = async (req: CustomRequest, res: Response): Promise<any> => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead record entry not found' });
    }
    return res.json({ success: true, data: lead });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update an existing Lead data record
// @route   PUT /api/leads/:id
export const updateLead = async (req: CustomRequest, res: Response): Promise<any> => {
  try {
    const updatedLead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Returns the fresh updated record back rather than historical object data
      runValidators: true,
    });

    if (!updatedLead) {
      return res.status(404).json({ success: false, message: 'Lead record entry not found' });
    }
    return res.json({ success: true, data: updatedLead });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a Lead entry from memory
// @route   DELETE /api/leads/:id
export const deleteLead = async (req: CustomRequest, res: Response): Promise<any> => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead record entry not found' });
    }
    return res.json({ success: true, message: 'Lead successfully extracted and deleted' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};