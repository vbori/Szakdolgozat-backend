import { config } from 'dotenv';
import { Router } from 'express';
import { refreshToken, login, logout } from '../controllers/auth.controller.js';

config();
const router = Router();

router.post('/token', refreshToken);
router.post('/login', login);
router.delete('/logout', logout);

export default router;