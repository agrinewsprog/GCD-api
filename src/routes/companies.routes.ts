import { Router } from 'express';
import {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  companyValidation,
} from '../controllers/companies.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get all companies (all authenticated users)
router.get('/', getAllCompanies);

// Get company by ID (all authenticated users)
router.get('/:id', getCompanyById);

// Create company (only admin and comercial)
router.post(
  '/',
  roleMiddleware('admin', 'comercial'),
  companyValidation,
  createCompany
);

// Update company (only admin and comercial)
router.put(
  '/:id',
  roleMiddleware('admin', 'comercial'),
  companyValidation,
  updateCompany
);

// Delete company (only admin)
router.delete('/:id', roleMiddleware('admin'), deleteCompany);

export default router;
