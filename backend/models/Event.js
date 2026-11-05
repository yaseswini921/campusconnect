import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    category: {
      type: String,
      required: true,
      enum: ['Technology', 'Cultural', 'Workshop', 'Seminar', 'Sports', 'Competition', 'Business', 'Other']
    },
    date: { type: Date, required: true },
    startTime: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    endTime: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    venue: { type: String, required: true, trim: true, maxlength: 160 },
    image: { type: String, trim: true, default: '' },
    capacity: { type: Number, required: true, min: 1 },
    registeredCount: { type: Number, default: 0, min: 0 },
    organizer: { type: String, required: true, trim: true, maxlength: 120 }
  },
  { timestamps: true }
);

eventSchema.index({ date: 1, category: 1 });

export default mongoose.model('Event', eventSchema);
