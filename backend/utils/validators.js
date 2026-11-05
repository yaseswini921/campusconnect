import { body, param } from 'express-validator';

export const idParam = (key = 'id') => param(key).isMongoId().withMessage('A valid identifier is required.');

export const registrationRules = [
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2–80 characters.'),
  body('email').trim().isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('password').isLength({ min: 8, max: 72 }).withMessage('Password must be 8–72 characters.')
];

export const loginRules = [
  body('email').trim().isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.')
];

export const eventRules = [
  body('title').trim().isLength({ min: 3, max: 120 }).withMessage('Title must be 3–120 characters.'),
  body('description').trim().isLength({ min: 10, max: 5000 }).withMessage('Description must be at least 10 characters.'),
  body('category').isIn(['Technology', 'Cultural', 'Workshop', 'Seminar', 'Sports', 'Competition', 'Business', 'Other']),
  body('date').isISO8601().withMessage('Enter a valid event date.'),
  body('startTime').matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('Enter a valid start time.'),
  body('endTime')
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage('Enter a valid end time.')
    .bail()
    .custom((endTime, { req }) => {
      if (endTime <= req.body.startTime) throw new Error('End time must be after start time.');
      return true;
    }),
  body('venue').trim().isLength({ min: 2, max: 160 }).withMessage('Venue is required.'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1.'),
  body('organizer').trim().isLength({ min: 2, max: 120 }).withMessage('Organizer is required.'),
  body('image').optional({ values: 'falsy' }).isURL({ protocols: ['http', 'https'], require_protocol: true }).withMessage('Image must be a valid HTTPS or HTTP URL.')
];

export const profileRules = [
  body('name').optional().trim().isLength({ min: 2, max: 80 }),
  body('department').optional().trim().isLength({ max: 80 }),
  body('year').optional({ nullable: true }).isInt({ min: 1, max: 6 }).withMessage('Year must be between 1 and 6.')
];
