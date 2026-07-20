const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in the environment variables.");
  process.exit(1);
}

const app = express();
const server = http.createServer(app);
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
};

const io = new Server(server, {
  cors: corsOptions
});
const PORT = process.env.PORT || 5005;

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Monitor MongoDB connection health
mongoose.connection.on('disconnected', () => {
  console.error('MongoDB disconnected! Shutting down process to trigger orchestrator restart...');
  process.exit(1); // Force crash so PM2/Docker can restart the healthy state
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected successfully.');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Attach socket io to req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const dashboardRoutes = require('./routes/dashboard');
const projectsRoutes = require('./routes/projects');
const vivaRoutes = require('./routes/viva');
const skilltmeterRoutes = require('./routes/skilltmeter');
const assignmentsRoutes = require('./routes/assignments');
const rolesRoutes = require('./routes/roles');
const assessmentsRoutes = require('./routes/assessments');
const linksRoutes = require('./routes/links');
const codingProblemsRoutes = require('./routes/codingProblems');
const classesRoutes = require('./routes/classes');
const resumeRoutes = require('./routes/resume');
const complaintsRoutes = require('./routes/complaints');

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/viva', vivaRoutes);
app.use('/api/skilltmeter', skilltmeterRoutes);
app.use('/api/assignments', assignmentsRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/assessments', assessmentsRoutes);
app.use('/api/links', linksRoutes);
app.use('/api/coding-problems', codingProblemsRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/complaints', complaintsRoutes);

// Socket.io logic for SkillTMeter
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error('Authentication error: Token missing'));
  }
  
  const JWT_SECRET = process.env.JWT_SECRET;
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error('Authentication error: Invalid token'));
    socket.user = decoded.user || decoded; // Support both standard and Firebase payloads
    next();
  });
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('joinPresentation', (joinCode) => {
    socket.join(joinCode);
    console.log(`Socket ${socket.id} joined presentation ${joinCode}`);
  });

  // When a presenter changes slide
  socket.on('changeSlide', (data) => {
    // data: { joinCode, slideIndex }
    io.to(data.joinCode).emit('slideChanged', data.slideIndex);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend server is running perfectly' });
});

// Render production deployment static files
const path = require('path');
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get(/(.*)/, (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/dist', 'index.html'));
  });
} else {
  // 404 handler for API only in dev
  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found', path: req.path });
  });
}

// Start server
server.listen(PORT, () => {
  console.log(`Server is running perfectly on http://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down gracefully...');
  console.error(err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down gracefully...');
  console.error(err);
  server.close(() => {
    process.exit(1);
  });
});
