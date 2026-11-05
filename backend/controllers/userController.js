import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: 'student' }).sort({ createdAt: -1 });
  res.json({ users });
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, role: 'student' });
  if (!user) return res.status(404).json({ message: 'Student not found.' });
  res.json({ user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, department, year } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $set: { ...(name !== undefined && { name }), ...(department !== undefined && { department }), ...(year !== undefined && { year }) } },
    { new: true, runValidators: true }
  );
  res.json({ user, message: 'Profile updated successfully.' });
});
