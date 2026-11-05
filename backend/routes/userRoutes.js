import { Router } from 'express';
import { getUser, listUsers, updateProfile } from '../controllers/userController.js';
import { adminOnly, protect } from '../middleware/auth.js';
import { checkValidation } from '../middleware/validateResult.js';
import { idParam, profileRules } from '../utils/validators.js';

const router = Router();
router.put('/profile', protect, profileRules, checkValidation, updateProfile);
router.get('/', protect, adminOnly, listUsers);
router.get('/:id', protect, adminOnly, idParam(), checkValidation, getUser);
export default router;
