// models/Bookmark.js
const mongoose = require('mongoose');

const BookmarkSchema = new mongoose.Schema({
  userId: { type: String, default: null }, // optional (for assignment you can leave null)
  topicKey: { type: String, default: null }, // which topic (if bookmark from comparison)
  standard: { type: String, default: null }, // e.g. 'PMBOK7' or 'PRINCE2'
  page: { type: Number, default: 1 },
  note: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Bookmark', BookmarkSchema);
