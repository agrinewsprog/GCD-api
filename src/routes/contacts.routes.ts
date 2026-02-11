import { Router } from 'express';
import {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  contactValidation,
} from '../controllers/contacts.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get all contacts (with optional company_id filter)
router.get('/', getAllContacts);

// Get contact by ID
router.get('/:id', getContactById);

// Create contact (only admin and comercial)
router.post(
  '/',
  roleMiddleware('admin', 'comercial'),
  contactValidation,
  createContact
);

// Update contact (only admin and comercial)
router.put(
  '/:id',
  roleMiddleware('admin', 'comercial'),
  contactValidation,
  updateContact
);

// Delete contact (only admin)
router.delete('/:id', roleMiddleware('admin'), deleteContact);

export default router;
