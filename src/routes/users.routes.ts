import { Router } from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import * as usersController from '../controllers/users.controller';

const router = Router();

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(roleMiddleware('admin'));

// Get all users
router.get('/', usersController.getAll);

// Get all roles
router.get('/roles', usersController.getRoles);

// Get single user
router.get('/:id', usersController.getById);

// Create user
router.post('/', usersController.create);

// Update user
router.put('/:id', usersController.update);

// Delete user
router.delete('/:id', usersController.deleteUser);

export default router;
