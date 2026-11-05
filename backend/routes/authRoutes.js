import { Router } from 'express';
import { currentUser, login, register } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { checkValidation } from '../middleware/validateResult.js';
import { loginRules, registrationRules } from '../utils/validators.js';

const router = Router();
router.post('/register', registrationRules, checkValidation, register);
router.post('/login', loginRules, checkValidation, login);
router.get('/me', protect, currentUser);
export default router;
