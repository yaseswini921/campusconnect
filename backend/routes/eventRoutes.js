import { Router } from 'express';
import { createEvent, deleteEvent, eventStats, getEvent, listEvents, updateEvent } from '../controllers/eventController.js';
import { adminOnly, protect } from '../middleware/auth.js';
import { checkValidation } from '../middleware/validateResult.js';
import { idParam, eventRules } from '../utils/validators.js';

const router = Router();
router.get('/', listEvents);
router.get('/stats', protect, adminOnly, eventStats);
router.get('/:id', idParam(), checkValidation, getEvent);
router.post('/', protect, adminOnly, eventRules, checkValidation, createEvent);
router.put('/:id', protect, adminOnly, idParam(), eventRules, checkValidation, updateEvent);
router.delete('/:id', protect, adminOnly, idParam(), checkValidation, deleteEvent);
export default router;
