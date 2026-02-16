import { Router } from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import * as usersController from '../controllers/users.controller';

const router = Router();

// Routes that require only authentication (any role)
router.use(authMiddleware);

// Get mediums assigned to the logged-in user (any authenticated user)
router.get('/my-mediums', usersController.getMyMediums as any);

// All remaining routes require admin role
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
