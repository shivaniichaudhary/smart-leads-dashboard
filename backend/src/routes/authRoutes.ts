import { Router } from 'express';
import { registerUser, loginUser } from '../controllers/authController';

const router = Router();

// Routes mapped directly to their handler logic functions [cite: 33, 34, 100]
router.post('/register', registerUser);
router.post('/login', loginUser);

export default router;