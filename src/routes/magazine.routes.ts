import { Router } from 'express';
import {
  getAllMagazineEditions,
  getMagazineEditionById,
  getEditionsByMedium,
  createMagazineEdition,
  updateMagazineEdition,
  deleteMagazineEdition,
  getEditionWithCampaigns,
  completeMagazineEdition
} from '../controllers/magazine.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get all magazine editions
router.get('/', getAllMagazineEditions);

// Get editions by medium
router.get('/medium/:mediumId', getEditionsByMedium);

// Get edition with campaigns
router.get('/:id/campaigns', getEditionWithCampaigns);

// Get single edition
router.get('/:id', getMagazineEditionById);

// Create new edition
router.post('/', createMagazineEdition);

// Update edition
router.put('/:id', updateMagazineEdition);

// Complete edition (mark as finished with publication link)
router.put('/:id/complete', completeMagazineEdition);

// Delete edition
router.delete('/:id', deleteMagazineEdition);

export default router;
