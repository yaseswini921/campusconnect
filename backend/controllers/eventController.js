import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const EVENT_FIELDS = [
  'title', 'description', 'category', 'date', 'startTime', 'endTime',
  'venue', 'image', 'capacity', 'organizer'
];

function eventInput(body) {
  return Object.fromEntries(EVENT_FIELDS.filter((field) => body[field] !== undefined).map((field) => [field, body[field]]));
}

function dateOnlyStart(value) {
  return new Date(`${value}T00:00:00.000Z`);
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const listEvents = asyncHandler(async (req, res) => {
  const { search, category, from, to, upcoming } = req.query;
  for (const [field, value] of Object.entries({ search, category, from, to, upcoming })) {
    if (value !== undefined && typeof value !== 'string') {
      return res.status(400).json({ message: `${field} must be a single text value.` });
    }
  }
  if (search?.length > 120) {
    return res.status(400).json({ message: 'Search must be 120 characters or fewer.' });
  }
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  const validDate = (value) => {
    if (!datePattern.test(value)) return false;
    const parsedDate = dateOnlyStart(value);
    return Number.isFinite(parsedDate.getTime()) && parsedDate.toISOString().slice(0, 10) === value;
  };
  if ((from && !validDate(from)) || (to && !validDate(to))) {
    return res.status(400).json({ message: 'Date filters must use YYYY-MM-DD format.' });
  }
  if (from && to && from > to) {
    return res.status(400).json({ message: 'The start date must be on or before the end date.' });
  }
  const filter = {};
  if (category && category !== 'All') filter.category = category;
  if (search) filter.$or = [
    { title: { $regex: escapeRegex(search), $options: 'i' } },
    { description: { $regex: escapeRegex(search), $options: 'i' } },
    { venue: { $regex: escapeRegex(search), $options: 'i' } }
  ];
  if (from || to || upcoming === 'true') {
    filter.date = {};
    const earliestDate = upcoming === 'true' ? new Date().toISOString().slice(0, 10) : null;
    if (from && earliestDate && from > earliestDate) filter.date.$gte = dateOnlyStart(from);
    else if (from || earliestDate) filter.date.$gte = dateOnlyStart(from || earliestDate);
    if (to) filter.date.$lte = new Date(`${to}T23:59:59.999Z`);
  }
  const events = await Event.find(filter).sort({ date: 1 });
  res.json({ events });
});

export const getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found.' });
  res.json({ event });
});

export const createEvent = asyncHandler(async (req, res) => {
  const event = await Event.create(eventInput(req.body));
  res.status(201).json({ event, message: 'Event created successfully.' });
});

export const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found.' });
  if (Number(req.body.capacity) < event.registeredCount) {
    return res.status(400).json({ message: 'Capacity cannot be lower than the current number of registrations.' });
  }
  Object.assign(event, eventInput(req.body));
  await event.save();
  res.json({ event, message: 'Event updated successfully.' });
});

export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found.' });
  await Registration.deleteMany({ event: event.id });
  await event.deleteOne();
  res.json({ message: 'Event and its registrations were deleted.' });
});

export const eventStats = asyncHandler(async (_req, res) => {
  const [totalEvents, upcomingEvents, registrationCount] = await Promise.all([
    Event.countDocuments(),
    Event.countDocuments({ date: { $gte: dateOnlyStart(new Date().toISOString().slice(0, 10)) } }),
    Registration.countDocuments({ status: { $ne: 'cancelled' } })
  ]);
  res.json({ stats: { totalEvents, upcomingEvents, registrationCount } });
});
