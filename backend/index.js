const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

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
const PORT = process.env.PORT || 5001;

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

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
