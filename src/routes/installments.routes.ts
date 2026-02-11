import { Router } from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import {
  getInstallmentsByCampaign,
  createInstallment,
  updateInstallment,
  deleteInstallment,
  generateInstallments
} from '../controllers/installments.controller';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get installments for a campaign
router.get('/campaign/:campaignId', getInstallmentsByCampaign);

// Generate installments automatically
router.post('/campaign/:campaignId/generate', roleMiddleware('admin', 'comercial'), generateInstallments);

// Create installment
router.post('/campaign/:campaignId', roleMiddleware('admin', 'comercial'), createInstallment);

// Update installment
router.put('/:id', roleMiddleware('admin', 'comercial'), updateInstallment);

// Delete installment
router.delete('/:id', roleMiddleware('admin', 'comercial'), deleteInstallment);

export default router;
