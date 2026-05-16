import { Router } from 'express';
import { getLeads, createLead, getLeadById, updateLead, deleteLead } from '../controllers/leadController';
import { protect, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

// Inject 'protect' middleware to guarantee no guest can ping these endpoints without logged-in header keys
router.use(protect);

// Basic route assignments for fetching lists or appending new leads
router.route('/')
  .get(getLeads)
  .post(createLead);

// Targeted single parameters modification routes
router.route('/:id')
  .get(getLeadById)
  .put(updateLead)
  .delete(authorizeRoles(['Admin']), deleteLead); 
  // 👆 Role Check: Every authenticated user can view/edit records, but ONLY accounts holding an 'Admin' flag can execute a DELETE query command!

export default router;