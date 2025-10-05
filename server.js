// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const Topic = require('./models/Topic');
const Scenario = require('./models/Scenario');
const Bookmark = require('./models/Bookmark');

const app = express();
app.use(cors());
app.use(express.json());

// Serve front-end static files (so you can open root)
app.use(express.static(path.join(__dirname, 'src')));

// Serve standards PDFs (docs folder)
app.use('/docs', express.static(path.join(__dirname, 'docs')));

// Connect to MongoDB
const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/pm_standards';
mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('MongoDB error', err));

// Helper: load fallback JSON (your pm_data.json)
function loadLocalData() {
  const file = path.join(__dirname, 'data', 'pm_data.json');
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, 'utf8');
  return JSON.parse(raw);
}

/**
 * ROUTES
 */

// GET all topics (from DB if available, otherwise from local JSON)
app.get('/api/topics', async (req, res) => {
  try {
    const count = await Topic.countDocuments();
    if (count === 0) {
      const data = loadLocalData();
      if (!data) return res.json({ topics: [] });
      // transform object -> array if needed (your pm_data.json uses keyed object)
      const topicsObj = data.topics || data; // handle whichever structure
      const arr = Object.keys(topicsObj).map(k => ({ key: k, ...topicsObj[k] }));
      return res.json({ topics: arr });
    } else {
      const topics = await Topic.find().sort({ key: 1 });
      return res.json({ topics });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// GET single topic by key
app.get('/api/topics/:key', async (req, res) => {
  const key = req.params.key;
  try {
    const topic = await Topic.findOne({ key });
    if (topic) return res.json(topic);

    const data = loadLocalData();
    if (data && data.topics && data.topics[key]) {
      return res.json({ key, ...data.topics[key] });
    }
    return res.status(404).json({ error: 'Topic not found' });
  } catch (err) {
    res.status(500).json({ error: 'server error' });
  }
});

// GET scenarios
app.get('/api/scenarios', async (req, res) => {
  try {
    const count = await Scenario.countDocuments();
    if (count === 0) {
      const data = loadLocalData();
      if (!data) return res.json({ scenarios: {} });
      return res.json({ scenarios: data.scenarios || {} });
    } else {
      const scenarios = await Scenario.find().sort({ name: 1 });
      return res.json({ scenarios });
    }
  } catch (err) {
    res.status(500).json({ error: 'server error' });
  }
});

// Bookmarks: create
app.post('/api/bookmarks', async (req, res) => {
  try {
    const { userId = null, topicKey = null, standard = null, page = 1, note = '' } = req.body;
    const b = new Bookmark({ userId, topicKey, standard, page, note });
    await b.save();
    res.json({ message: 'Bookmark saved', bookmark: b });
  } catch (err) {
    res.status(500).json({ error: 'server error' });
  }
});

// Bookmarks: list
app.get('/api/bookmarks', async (req, res) => {
  try {
    const bookmarks = await Bookmark.find().sort({ createdAt: -1 }).limit(200);
    res.json(bookmarks);
  } catch (err) {
    res.status(500).json({ error: 'server error' });
  }
});

// Serve the front-end index (fallback)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'pm_index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
