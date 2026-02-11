import { Router } from 'express';
import { login, register, getCurrentUser, loginValidation, registerValidation } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/login', loginValidation, login);
router.post('/register', registerValidation, register);
router.get('/me', authMiddleware, getCurrentUser);

export default router;
