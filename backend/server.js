const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request Logging (Simple)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// MongoDB Connection
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/quizapp';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  // Log the database name we are connected to
  console.log('Database Name:', mongoose.connection.name);
})
.catch((err) => {
  console.error('❌ MongoDB connection error details:');
  console.error('Error:', err.message);
  console.error('Make sure MongoDB is installed and running (mongod service).');
});

// Question Schema
const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  options: [{ type: String }], // Optional for MCQs
  type: { type: String, enum: ['text', 'mcq'], default: 'text' }
});

const Question = mongoose.model('Question', questionSchema);

// Competition Schema
const competitionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  timeLimit: { type: Number, default: 5 }, // duration in minutes
  startTime: { type: Date }, // scheduled start
  endTime: { type: Date },   // scheduled end
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Competition = mongoose.model('Competition', competitionSchema);

// Result/Leaderboard Schema
const resultSchema = new mongoose.Schema({
  username: { type: String, required: true },
  competitionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Competition' },
  score: { type: Number, required: true },
  total: { type: Number, required: true },
  percentage: { type: Number, required: true },
  timeTaken: { type: Number }, // in seconds
  createdAt: { type: Date, default: Date.now }
});

const Result = mongoose.model('Result', resultSchema);

// User Schema (with admin approval)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// API Endpoints - Prefixed with /api

// Health check to verify server is reachable
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// --- USER AUTHENTICATION ENDPOINTS ---

/**
 * @route   POST /api/register
 * @desc    Register a new user (Status: pending)
 */
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const newUser = new User({ username, password });
    await newUser.save();
    res.status(201).json({ message: 'Registration successful. Waiting for admin approval.', user: { username: newUser.username, status: newUser.status } });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

/**
 * @route   POST /api/login
 * @desc    User login (Requires admin approval)
 */
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.status !== 'approved') {
      return res.status(403).json({ message: `Access denied. Status: ${user.status}` });
    }

    res.json({ message: 'Login successful', user: { username: user.username, status: user.status } });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

// --- ADMIN USER MANAGEMENT ENDPOINTS ---

/**
 * @route   GET /api/admin/users
 * @desc    List all users (For admin)
 */
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching users', error: error.message });
  }
});

/**
 * @route   PUT /api/admin/users/:id/approve
 * @desc    Approve a user login
 */
app.put('/api/admin/users/:id/approve', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User approved', user });
  } catch (error) {
    res.status(500).json({ message: 'Error approving user', error: error.message });
  }
});

/**
 * @route   PUT /api/admin/users/:id/reject
 * @desc    Reject a user login
 */
app.put('/api/admin/users/:id/reject', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User rejected', user });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting user', error: error.message });
  }
});

// --- COMPETITION ENDPOINTS ---

/**
 * @route   POST /api/competitions
 * @desc    Create a new competition
 */
app.post('/api/competitions', async (req, res) => {
  try {
    const { title, description, questionIds, timeLimit, startTime, endTime } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    const newComp = new Competition({
      title,
      description,
      questions: questionIds || [],
      timeLimit: timeLimit || 5,
      startTime: startTime ? new Date(startTime) : null,
      endTime: endTime ? new Date(endTime) : null
    });
    await newComp.save();
    res.status(201).json(newComp);
  } catch (error) {
    res.status(500).json({ message: 'Error creating competition', error: error.message });
  }
});

/**
 * @route   GET /api/competitions
 * @desc    Get all active competitions
 */
app.get('/api/competitions', async (req, res) => {
  try {
    const comps = await Competition.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(comps);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching competitions', error: error.message });
  }
});

/**
 * @route   GET /api/competitions/:id
 * @desc    Get a specific competition with questions
 */
app.get('/api/competitions/:id', async (req, res) => {
  try {
    const comp = await Competition.findById(req.params.id).populate('questions');
    if (!comp) return res.status(404).json({ message: 'Competition not found' });
    res.json(comp);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching competition details', error: error.message });
  }
});

/**
 * @route   POST /api/questions
 * @desc    Add a new question
 */
app.post('/api/questions', async (req, res) => {
  try {
    const { question, answer, options, type } = req.body;
    console.log('Received new question request:', { question, answer, type });
    
    if (!question || !answer) {
      return res.status(400).json({ message: 'Question and answer are required' });
    }
    const newQuestion = new Question({ 
      question, 
      answer, 
      options: options || [], 
      type: type || 'text' 
    });
    await newQuestion.save();
    console.log('Question saved successfully:', newQuestion._id);
    res.status(201).json(newQuestion);
  } catch (error) {
    console.error('Error saving question:', error.message);
    res.status(500).json({ message: `Server error saving question: ${error.message}` });
  }
});

/**
 * @route   GET /api/questions
 * @desc    Get all questions (Hiding answers)
 */
app.get('/api/questions', async (req, res) => {
  try {
    const questions = await Question.find({}, 'question type options');
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   POST /api/submit
 * @desc    Submit quiz and evaluate answers
 */
app.post('/api/submit', async (req, res) => {
  try {
    const { userAnswers, username, competitionId, timeTaken } = req.body;
    if (!userAnswers || !Array.isArray(userAnswers)) {
      return res.status(400).json({ message: 'Invalid submission format' });
    }

    // Determine which questions to check against
    let questionsToCheck;
    if (competitionId) {
      const comp = await Competition.findById(competitionId).populate('questions');
      if (!comp) return res.status(404).json({ message: 'Competition not found' });
      questionsToCheck = comp.questions;
    } else {
      questionsToCheck = await Question.find({});
    }

    let correctCount = 0;
    const detailedResults = [];

    questionsToCheck.forEach((q) => {
      const userSubmission = userAnswers.find((ans) => ans.id === q._id.toString());
      const userAnsText = userSubmission ? userSubmission.answer.trim().toLowerCase() : '';
      const correctAnsText = q.answer.trim().toLowerCase();

      const isCorrect = userAnsText === correctAnsText;
      if (isCorrect) correctCount++;

      detailedResults.push({
        question: q.question,
        userAnswer: userSubmission ? userSubmission.answer : '',
        correctAnswer: isCorrect ? null : q.answer,
        isCorrect: isCorrect
      });
    });

    const totalQuestions = questionsToCheck.length;
    const scorePercentage = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

    // Save to Leaderboard if username is provided
    if (username && username.trim()) {
      const newResult = new Result({
        username: username.trim(),
        competitionId: competitionId || null,
        score: correctCount,
        total: totalQuestions,
        percentage: parseFloat(scorePercentage.toFixed(2)),
        timeTaken: timeTaken || 0
      });
      await newResult.save();
      console.log('Result saved to leaderboard for:', username);
    }

    res.json({
      totalQuestions,
      correctCount,
      scorePercentage: scorePercentage.toFixed(2),
      results: detailedResults,
      competitionId: competitionId
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// --- ADMIN REPORTS ENDPOINT ---

/**
 * @route   GET /api/admin/reports
 * @desc    Get all results with competition details
 */
app.get('/api/admin/reports', async (req, res) => {
  try {
    const results = await Result.find()
      .populate('competitionId', 'title')
      .sort({ createdAt: -1 });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reports', error: error.message });
  }
});

/**
 * @route   GET /api/leaderboard
 * @desc    Get top results for competition
 */
app.get('/api/leaderboard', async (req, res) => {
  try {
    const { competitionId } = req.query;
    const query = competitionId ? { competitionId } : {};
    
    const topResults = await Result.find(query)
      .sort({ percentage: -1, createdAt: -1 })
      .limit(10);
    res.json(topResults);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching leaderboard', error: error.message });
  }
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Only start server if not in a serverless environment (like Vercel)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

module.exports = app;
