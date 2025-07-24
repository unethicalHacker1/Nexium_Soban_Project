// models/Journal.js

import mongoose from 'mongoose';

const JournalSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  journalText: { type: String, required: true },
  reflectionText: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Journal || mongoose.model('Journal', JournalSchema);
