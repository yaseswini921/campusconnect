import { Router } from 'express';
import {
  allRegistrations,
  cancelRegistration,
  myRegistrations,
  registerForEvent,
  updateRegistrationStatus
} from '../controllers/registrationController.js';
import { adminOnly, protect, studentOnly } from '../middleware/auth.js';
import { checkValidation } from '../middleware/validateResult.js';
import { idParam } from '../utils/validators.js';

const router = Router();
router.use(protect);
router.post('/', studentOnly, registerForEvent);
router.get('/my', myRegistrations);
router.get('/', adminOnly, allRegistrations);
router.delete('/:id', idParam(), checkValidation, cancelRegistration);
router.patch('/:id/status', adminOnly, idParam(), checkValidation, updateRegistrationStatus);
export default router;
