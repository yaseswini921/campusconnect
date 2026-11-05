import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function startOfUtcDay() {
  return new Date(`${new Date().toISOString().slice(0, 10)}T00:00:00.000Z`);
}

export const registerForEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.body;
  if (!eventId || !/^[a-f\d]{24}$/i.test(eventId)) {
    return res.status(400).json({ message: 'A valid eventId is required.' });
  }
  const existing = await Registration.findOne({ student: req.user.id, event: eventId });
  if (existing?.status === 'registered' || existing?.status === 'attended') {
    return res.status(409).json({ message: 'You already have a registration for this event.' });
  }
  if (existing?.status === 'cancelled') {
    return res.status(409).json({ message: 'This registration was cancelled. Contact an administrator if you need to rejoin.' });
  }

  const event = await Event.findOneAndUpdate(
    { _id: eventId, date: { $gte: startOfUtcDay() }, $expr: { $lt: ['$registeredCount', '$capacity'] } },
    { $inc: { registeredCount: 1 } },
    { new: true }
  );
  if (!event) {
    const found = await Event.exists({ _id: eventId });
    return res.status(found ? 409 : 404).json({
      message: found ? 'This event has passed or is full.' : 'Event not found.'
    });
  }

  try {
    const registration = await Registration.create({ student: req.user.id, event: eventId });
    return res.status(201).json({ registration, message: 'You are registered for this event.' });
  } catch (error) {
    await Event.updateOne({ _id: eventId }, { $inc: { registeredCount: -1 } });
    if (error.code === 11000) return res.status(409).json({ message: 'You already have a registration for this event.' });
    throw error;
  }
});

export const myRegistrations = asyncHandler(async (req, res) => {
  const registrations = await Registration.find({ student: req.user.id })
    .populate('event')
    .sort({ registrationDate: -1 });
  res.json({ registrations });
});

export const allRegistrations = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.eventId) filter.event = req.query.eventId;
  if (req.query.status && req.query.status !== 'all') filter.status = req.query.status;
  const registrations = await Registration.find(filter)
    .populate('student', 'name email department year')
    .populate('event', 'title category date venue')
    .sort({ registrationDate: -1 });
  res.json({ registrations });
});

export const cancelRegistration = asyncHandler(async (req, res) => {
  const registration = await Registration.findOne({ _id: req.params.id, student: req.user.id });
  if (!registration) return res.status(404).json({ message: 'Registration not found.' });
  if (registration.status !== 'registered') {
    return res.status(409).json({ message: 'Only active registrations can be cancelled.' });
  }

  const updated = await Registration.findOneAndUpdate(
    { _id: registration.id, status: 'registered' },
    { $set: { status: 'cancelled' } },
    { new: true }
  );
  if (!updated) return res.status(409).json({ message: 'This registration has already changed.' });
  await Event.updateOne({ _id: registration.event, registeredCount: { $gt: 0 } }, { $inc: { registeredCount: -1 } });
  res.json({ registration: updated, message: 'Registration cancelled successfully.' });
});

export const updateRegistrationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['registered', 'cancelled', 'attended'].includes(status)) {
    return res.status(400).json({ message: 'Status must be registered, cancelled, or attended.' });
  }

  const registration = await Registration.findById(req.params.id);
  if (!registration) return res.status(404).json({ message: 'Registration not found.' });
  if (registration.status === status) {
    return res.json({ registration, message: 'Registration status is already up to date.' });
  }
  const wasActive = registration.status === 'registered' || registration.status === 'attended';
  const willBeActive = status === 'registered' || status === 'attended';
  const previousStatus = registration.status;
  if (!wasActive && willBeActive) {
    const event = await Event.findOneAndUpdate(
      { _id: registration.event, $expr: { $lt: ['$registeredCount', '$capacity'] } },
      { $inc: { registeredCount: 1 } },
      { new: true }
    );
    if (!event) return res.status(409).json({ message: 'No seats are available for this event.' });

    const updated = await Registration.findOneAndUpdate(
      { _id: registration.id, status: previousStatus },
      { $set: { status } },
      { new: true }
    );
    if (!updated) {
      await Event.updateOne({ _id: registration.event, registeredCount: { $gt: 0 } }, { $inc: { registeredCount: -1 } });
      return res.status(409).json({ message: 'This registration has already changed.' });
    }
    return res.json({ registration: updated, message: 'Registration status updated.' });
  }

  const updated = await Registration.findOneAndUpdate(
    { _id: registration.id, status: previousStatus },
    { $set: { status } },
    { new: true }
  );
  if (!updated) return res.status(409).json({ message: 'This registration has already changed.' });
  if (wasActive && !willBeActive) {
    await Event.updateOne({ _id: registration.event, registeredCount: { $gt: 0 } }, { $inc: { registeredCount: -1 } });
  }
  return res.json({ registration: updated, message: 'Registration status updated.' });
});
