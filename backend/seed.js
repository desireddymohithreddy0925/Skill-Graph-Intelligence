require('dotenv').config();
const mongoose = require('mongoose');

const Subject = require('./models/Subject');
const DashboardData = require('./models/DashboardData');
const UserProgress = require('./models/UserProgress');
const InterviewReport = require('./models/InterviewReport');

const mockSubjects = [
  {
    id: 's1',
    title: 'Engineering Essentials: Data Management and Presentation Tools',
    desc: 'Build foundational skills in organizing, analyzing, and presenting technical information using common digital tools.',
    chaptersCount: 3,
    topicsCount: 3,
    minutes: 30,
    views: 18898,
    icon: '📊',
    chapters: [
      {
        id: 'c1',
        title: 'Unit I - Spreadsheet Fundamentals & Data Organization',
        desc: 'Review the core concepts of spreadsheet usage, focusing on data entry, structuring information, and organizing datasets.',
        topicsCount: 1,
        minutes: 10,
        views: 5610,
        topics: [
          {
            id: 't1',
            title: 'Spreadsheet Fundamentals & Data Organization - Unit 1',
            desc: 'Practice the foundational concepts of spreadsheets by reviewing Excel or Google Sheets basics, including formulas.',
            minutes: 10,
          }
        ]
      },
      {
        id: 'c2',
        title: 'Unit II - Advanced Spreadsheet Functions & Data Analysis',
        desc: 'Review advanced spreadsheet techniques by focusing on functions, data processing methods, and analytical approaches.',
        topicsCount: 1,
        minutes: 10,
        views: 3091,
        topics: [
          {
            id: 't2',
            title: 'Advanced Functions & Analysis - Unit 2',
            desc: 'Practice complex formulas and pivot tables to analyze large datasets efficiently.',
            minutes: 10,
          }
        ]
      },
      {
        id: 'c3',
        title: 'Unit III - Database Concepts & SQL Basics',
        desc: 'Review the foundational concepts of databases and structured query language, focusing on how data is organized.',
        topicsCount: 1,
        minutes: 10,
        views: 3506,
        topics: [
          {
            id: 't3',
            title: 'SQL Basics - Unit 3',
            desc: 'Practice basic SQL queries including SELECT, WHERE, and JOIN operations.',
            minutes: 10,
          }
        ]
      }
    ]
  },
  {
    id: 's2',
    title: 'Environmental Science',
    desc: 'Develop foundational knowledge of environmental systems and sustainability concepts.',
    chaptersCount: 1,
    topicsCount: 1,
    minutes: 10,
    views: 12241,
    icon: '🌿',
    chapters: [
      {
        id: 'c4',
        title: 'Unit I - Ecosystems & Biodiversity',
        desc: 'Understand the basic components of ecosystems and the importance of biodiversity.',
        topicsCount: 1,
        minutes: 10,
        views: 4000,
        topics: [
          {
            id: 't4',
            title: 'Ecosystem Basics - Unit 1',
            desc: 'Review food chains, webs, and ecological pyramids. Understand how energy flows through ecosystems.',
            minutes: 10,
          }
        ]
      }
    ]
  },
  {
    id: 's3',
    title: 'Frontend Web Development',
    desc: 'Build foundational knowledge of web technologies used to design and structure modern web applications.',
    chaptersCount: 2,
    topicsCount: 2,
    minutes: 20,
    views: 22183,
    icon: '💻',
    chapters: [
      {
        id: 'c5',
        title: 'Unit I - HTML & CSS Fundamentals',
        desc: 'Review the building blocks of the web: semantic HTML tags and CSS styling.',
        topicsCount: 1,
        minutes: 10,
        views: 8000,
        topics: [
          {
            id: 't5',
            title: 'HTML & CSS Basics - Unit 1',
            desc: 'Practice HTML structure and CSS styling including flexbox, grid, and responsive design.',
            minutes: 10,
          }
        ]
      },
      {
        id: 'c6',
        title: 'Unit II - JavaScript & React Essentials',
        desc: 'Review core JavaScript concepts and modern React component patterns.',
        topicsCount: 1,
        minutes: 10,
        views: 6500,
        topics: [
          {
            id: 't6',
            title: 'JavaScript & React - Unit 2',
            desc: 'Practice JavaScript fundamentals, ES6 syntax, hooks, and component lifecycle.',
            minutes: 10,
          }
        ]
      }
    ]
  }
];


const mockReport = {
  sessionId: 'mock_session_1',
  title: 'Spreadsheet Fundamentals & Data Organization - Unit 1 Report',
  submittedAt: 'Assessment submitted on Apr 23, 2026, 10:41 AM',
  overall: {
    technicalScore: 85,
    termMatchScore: 89,
    relevanceScore: 88,
    confidenceScore: 72,
  },
  questions: [
    {
      q: 'Explain the difference between a process and a thread.',
      technicalScore: 84,
      termMatchScore: 83,
      relevanceScore: 85,
      transcript: 'A process is basically a program in execution. It has its own memory space. A thread is a lightweight process, um, it shares the memory with other threads in the same process.',
      perceived: 'The evaluator understood that you know the basic definition and memory sharing model.',
      gaps: 'You missed mentioning context switching overhead and resource allocation details.',
      commAnalysis: "You had a few filler words ('basically', 'um') but overall pacing was steady.",
      improve: 'Try to structure the answer by contrasting points directly: Memory, Overhead, and Creation time.',
    },
    {
      q: 'What is virtual memory and how does it work?',
      technicalScore: 78,
      termMatchScore: 80,
      relevanceScore: 82,
      transcript: 'Virtual memory is a memory management technique. It makes the system appear to have more memory than it actually does by using the hard drive.',
      perceived: 'Understood the high-level concept of extending RAM using disk storage.',
      gaps: "Did not explain paging, page tables, or page faults, which are critical to 'how it works'.",
      commAnalysis: 'Very confident delivery, good eye contact.',
      improve: 'Always follow the definition with the underlying mechanism (e.g., Paging mechanism).',
    },
    {
      q: 'Describe the concept of deadlocks. What are the necessary conditions for a deadlock?',
      technicalScore: 90,
      termMatchScore: 88,
      relevanceScore: 91,
      transcript: 'A deadlock is a state where two or more processes are each waiting for the other to release resources. The four conditions are: mutual exclusion, hold and wait, no preemption, and circular wait.',
      perceived: 'Excellent grasp of all four necessary conditions. Evaluator was impressed.',
      gaps: 'Could expand with examples or prevention/avoidance strategies.',
      commAnalysis: 'Confident and fluent. Good technical vocabulary used.',
      improve: 'Mention prevention strategies like the Banker\'s algorithm to score higher.',
    },
  ],
};

async function seed() {
  try {
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI is missing in .env');
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas for seeding...');

    // Clear existing collections
    await Subject.deleteMany({});
    await DashboardData.deleteMany({});
    await UserProgress.deleteMany({});
    
    // Note: UserProgress and DashboardData are now created dynamically per user on registration
    await InterviewReport.create(mockReport);
    
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

seed();
