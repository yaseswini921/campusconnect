import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    registrationDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['registered', 'cancelled', 'attended'], default: 'registered' }
  },
  { timestamps: true }
);

registrationSchema.index({ student: 1, event: 1 }, { unique: true });

export default mongoose.model('Registration', registrationSchema);
