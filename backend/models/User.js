import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    department: { type: String, trim: true, maxlength: 80, default: '' },
    year: { type: Number, min: 1, max: 6, default: null }
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

userSchema.set('toJSON', {
  transform(_document, result) {
    delete result.password;
    delete result.__v;
    return result;
  }
});

export default mongoose.model('User', userSchema);
