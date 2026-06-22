const BASE_URL = import.meta.env.PROD ? 'https://nxtagenticm.onrender.com/api' : 'http://localhost:5001/api';

export const apiClient = async (endpoint, options = {}) => {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const finalOptions = { ...defaultOptions, ...options };
  
  if (finalOptions.body && typeof finalOptions.body === 'object') {
    finalOptions.body = JSON.stringify(finalOptions.body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, finalOptions);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'API request perfectly failed');
    }
    
    return data;
  } catch (error) {
    console.error('API Client Error:', error);
    throw error;
  }
};

export const VivaAPI = {
  startSession: (subject, unit) => apiClient('/viva/start', { 
    method: 'POST', 
    body: { subject, unit } 
  }),
  evaluateAnswer: (sessionId, answer) => apiClient('/viva/evaluate', { 
    method: 'POST', 
    body: { sessionId, answer } 
  }),
  getReport: (sessionId) => apiClient(`/viva/report/${sessionId}`, {
    method: 'GET'
  }),
  getTopicStatus: () => apiClient('/viva/topics/status', { method: 'GET' }),
  completeTopic: (topic) => apiClient('/viva/topics/complete', {
    method: 'POST',
    body: { topic }
  }),
  getSubjects: () => apiClient('/viva/subjects', { method: 'GET' })
};

export const DashboardAPI = {
  getOverview: () => apiClient('/dashboard/overview', { method: 'GET' }),
  getSkills: () => apiClient('/dashboard/skills', { method: 'GET' }),
  getDreamCompanies: () => apiClient('/dashboard/dream-companies', { method: 'GET' }),
  saveStudentSkills: (skills) => apiClient('/dashboard/student-skills', { method: 'POST', body: { skills } }),
  getDreamCompaniesAdmin: () => apiClient('/dashboard/dream-companies-admin', { method: 'GET' }),
  saveDreamCompany: (name, requiredSkills) => apiClient('/dashboard/dream-companies-admin', { method: 'POST', body: { name, requiredSkills } }),
  deleteDreamCompany: (id) => apiClient(`/dashboard/dream-companies-admin/${id}`, { method: 'DELETE' }),
  getCareerGPS: () => apiClient('/dashboard/career-gps', { method: 'GET' }),
  toggleCareerGPSTask: (key) => apiClient('/dashboard/career-gps/toggle', { method: 'POST', body: { key } }),
  setDreamCompany: (company) => apiClient('/dashboard/dream-company', { method: 'POST', body: { company } }),
  getBadges: () => apiClient('/dashboard/badges', { method: 'GET' }),
  getNextAction: () => apiClient('/dashboard/next-action', { method: 'GET' }),
  completeNextAction: () => apiClient('/dashboard/next-action/complete', { method: 'POST' })
};

export const AuthAPI = {
  login: (email, password) => apiClient('/auth/login', {
    method: 'POST',
    body: { email, password }
  }),
  register: (username, email, password) => apiClient('/auth/register', {
    method: 'POST',
    body: { username, email, password }
  })
};
