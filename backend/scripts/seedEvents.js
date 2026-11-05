import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/db.js';
import Event from '../models/Event.js';

const samples = [
  ['Tech Fest 2026', 'Technology', 'A full day of student-led product demos, coding challenges, and conversations with emerging tech teams.', 'Innovation Arena', 'Campus Tech Society', 180],
  ['Hackathon 2026', 'Technology', 'Build a useful campus solution with a team, get mentor feedback, and present your prototype to the jury.', 'Computer Science Block', 'Developer Student Club', 120],
  ['Cultural Fest', 'Cultural', 'Celebrate campus creativity with live music, dance, theatre, food stalls, and performances from student groups.', 'Open Air Theatre', 'Cultural Council', 500],
  ['Web Development Workshop', 'Workshop', 'A practical, beginner-friendly workshop covering responsive interfaces, APIs, and deployment fundamentals.', 'Lab 3, IT Department', 'Web Innovators Club', 80],
  ['AI and ML Seminar', 'Seminar', 'Faculty and industry speakers explore responsible AI, practical machine learning, and research opportunities.', 'Main Auditorium', 'AI Research Cell', 150],
  ['Inter-College Sports Meet', 'Sports', 'Compete across track, badminton, football, and basketball events in a spirited inter-college meet.', 'University Sports Complex', 'Sports Committee', 300],
  ['Photography Competition', 'Competition', 'Capture the theme “A day on campus” and share your perspective in a judged student exhibition.', 'Fine Arts Gallery', 'Lenscape Photography Club', 60],
  ['Entrepreneurship Summit', 'Business', 'Meet founders and alumni, test a business idea, and learn the basics of turning a student project into a venture.', 'Business School Hall', 'Entrepreneurship Cell', 100]
];

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is required to seed events.');
  process.exit(1);
}

try {
  await connectDatabase();
  let created = 0;
  for (const [index, [title, category, description, venue, organizer, capacity]] of samples.entries()) {
    const date = new Date();
    date.setDate(date.getDate() + 10 + index * 6);
    date.setHours(0, 0, 0, 0);
    const result = await Event.updateOne(
      { title },
      {
        $setOnInsert: {
          title,
          category,
          description,
          date,
          startTime: index % 2 ? '10:00' : '09:30',
          endTime: index % 2 ? '14:00' : '16:00',
          venue,
          image: `https://images.unsplash.com/photo-${[
            '1540575467063-178a50c2df87',
            '1504384308090-c894fdcc538d',
            '1514525253161-7a46d19cd819',
            '1516321318423-f06f85e504b3',
            '1485827404703-89b55fcc595e',
            '1461896836934-ffe607ba8211',
            '1516035069371-29a1b244cc32',
            '1556761175-b413da4baf72'
          ][index]}?auto=format&fit=crop&w=1200&q=80`,
          capacity,
          registeredCount: 0,
          organizer
        }
      },
      { upsert: true }
    );
    if (result.upsertedCount) created += 1;
  }
  console.log(`Sample event seed complete. ${created} new event(s) added; existing matching titles were preserved.`);
} catch (error) {
  console.error(`Event seeding failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
