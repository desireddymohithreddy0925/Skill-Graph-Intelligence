# LMS Skill Intelligence Meter

![LMS Skill Intelligence Meter Banner](https://img.shields.io/badge/Status-Active-success)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=flat&logo=vite&logoColor=FFD62E)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)

**Skill Intelligence Meter** is a comprehensive, next-generation Learning Management System (LMS) designed specifically to bridge the gap between college students and industry mentors. It provides a highly interactive and data-driven platform for tracking skills, attempting assessments, engaging in live classes, and preparing for real-world tech careers.

## 🌟 Key Features

### For Students
* **Career GPS & Skill Roadmaps**: Guided paths to help students understand what skills they need for their dream jobs.
* **AI Skill Gap Analysis**: Identifies missing competencies using AI and recommends personalized learning materials.
* **Gamification Center**: Engage with daily missions, earn badges, and track performance intelligence.
* **Proctored Assessments**: 
  * Timed MCQ and Coding assessments.
  * **Anti-Cheat System**: Auto-submits if a student switches tabs more than 3 times.
  * **Pre-Assessment System Check**: Validates internet connection speed before permitting entry.
  * Full-screen lock during assessment attempts.
* **Mock Interviews & Viva Practice**: Features an AI-assisted practice mode that includes facial matching, voice matching, and live feedback.
* **Skill-T-Meter**: Participate in live, interactive presentations (similar to Mentimeter) with polls, word clouds, and real-time Q&A.
* **Resume Builder & Project Portfolio**: Keep track of achievements, badges, and projects in one centralized dashboard.

### For Mentors & Administrators
* **Role-Based Dashboards**: Tailored views for Admins, Sub-Admins, Managers, Mentors, and "Skill T Team" members.
* **Staff Dashboard & Classes Management**: Organize students, monitor progress, and manage class assignments effectively.
* **Live Interactive Sessions (Skill-T-Meter)**: Create and run live interactive slideshows. Engage students in real-time and review metrics instantly.
* **Assessment Management**: Create, assign, and review student performance across various assessment types.
* **Student Tracking**: Monitor student progress, review coding approaches, and manage class assignments.

## 🚀 Tech Stack

* **Frontend**: React.js, Vite, CSS (Vanilla + Modules), Lucide React (Icons)
* **Backend**: Node.js, Express.js (Running on port 5001)
* **Real-time Communication**: Socket.io (for Live Polling / Skill-T-Meter)
* **Database**: MongoDB (via Mongoose)
* **Authentication**: Firebase Auth (for secure login and user management)

## 🛠️ Installation & Setup

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### 1. Clone the repository
```bash
git clone https://github.com/your-username/lms-skill-intelligence-meter.git
cd lms-skill-intelligence-meter
```

### 2. Environment Variables & Firebase Setup
Before running the application, you need to set up environment variables.
* **Backend**: Create a `.env` file in the `backend` directory with `PORT` and `MONGO_URI`. Also, place your `firebase-service-account.json` in the `backend` directory.
* **Frontend**: Create a `.env` file in the `frontend` directory with your `VITE_FIREBASE_*` configuration variables and `VITE_API_URL`.

### 3. Setup the Backend
Navigate to the `backend` directory, install dependencies, and start the server:
```bash
cd backend
npm install
npm start
# The backend will start running on http://localhost:5001
```

### 4. Setup the Frontend
Open a new terminal window, navigate to the `frontend` directory, install dependencies, and start the development server:
```bash
cd frontend
npm install
npm run dev
```

## 🔒 Security & Integrity Features

* **Anti-Tab Switching**: The system strictly monitors visibility changes. After 3 tab-switches, the assessment is automatically submitted and the student is redirected to the dashboard.
* **Network Speed Validation**: Ensures students have a stable connection before starting critical assessments, preventing mid-exam disconnections.
* **Biometric Pre-Checks**: Uses webcam and microphone APIs for Facial Match and Voice Match before accessing specific tests or viva modes.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 
Feel free to check [issues page](https://github.com/your-username/lms-skill-intelligence-meter/issues).

## 📝 License

This project is [MIT](https://choosealicense.com/licenses/mit/) licensed.
