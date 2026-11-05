import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDatabase } from '../config/db.js';
import User from '../models/User.js';

const { MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;
if (!MONGODB_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_NAME) {
  console.error('Set MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_NAME before running this script.');
  process.exit(1);
}
if (ADMIN_PASSWORD.length < 12) {
  console.error('ADMIN_PASSWORD must be at least 12 characters.');
  process.exit(1);
}

try {
  await connectDatabase();
  const email = ADMIN_EMAIL.trim().toLowerCase();
  if (await User.exists({ email })) {
    throw new Error(`An account already exists for ${email}.`);
  }
  await User.create({
    name: ADMIN_NAME.trim(),
    email,
    password: await bcrypt.hash(ADMIN_PASSWORD, 12),
    role: 'admin'
  });
  console.log(`Administrator account created for ${email}.`);
} catch (error) {
  console.error(`Admin account was not created: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
