import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function createToken(userId) {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured.');
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}

function authResponse(user) {
  return { token: createToken(user.id), user };
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const exists = await User.exists({ email });
  if (exists) return res.status(409).json({ message: 'An account with this email already exists.' });

  const user = await User.create({
    name,
    email,
    password: await bcrypt.hash(password, 12),
    role: 'student'
  });
  return res.status(201).json(authResponse(user));
});

export const login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select('+password');
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return res.status(401).json({ message: 'The email or password is incorrect.' });
  }

  user.password = undefined;
  return res.json(authResponse(user));
});

export const currentUser = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});
