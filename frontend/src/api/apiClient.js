import axios from 'axios';


const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:5000/api/v2',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
    const userData = localStorage.getItem('user');
    if (userData) {
        try {
            const user = JSON.parse(userData);
            if (user && user.id) {
                // Add user_id to query params for GET requests
                if (config.method === 'get') {
                    config.params = { ...config.params, user_id: user.id };
                }
                // Add user_id to data for POST requests
                if (config.method === 'post' && config.data) {
                    if (config.data instanceof FormData) {
                        config.data.append('user_id', user.id);
                    } else {
                        config.data = { ...config.data, user_id: user.id };
                    }
                }
            }
        } catch (e) {
            console.error('Failed to parse user data from localStorage');
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

/**
 * Fetches a list of all interview sessions.
 */
export const getInterviews = (userId) => {
  return apiClient.get('/interviews/', {
    params: { user_id: userId } // Explicitly pass user_id
  });
};
/**
 * Fetches the detailed report for a single interview.
 * @param {string} interviewId - The ID of the interview to fetch.
 */
export const getInterviewReport = (interviewId) => {
  return apiClient.get(`/interviews/${interviewId}`); // Example endpoint
};

/**
 * Fetches the list of CVs for the user.
 */
export const getCvs = (userId) => {
  return apiClient.get('/cvs/user/', {
    params: { user_id: userId } // Explicitly pass user_id
  });
};
export const deleteCv = (cvId, userId) => {
  return apiClient.delete(`/cvs/`, {
    params: { user_id: userId , cv_id: cvId } // Explicitly pass user_id
  });
};

export const getUser = (userId) => {
  return apiClient.get(`/users/${userId}`);
};

/**
 * Uploads a new CV file.
 * @param {FormData} formData - The form data containing the file.
 */
// api/apiClient.js
export const uploadCv = (file, userId) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('user_id', userId); // Must match FastAPI's Form field name

  return apiClient.post('/cvs/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * Starts a new interview session.
 * @param {object} interviewData - The data for the new interview.
 */
export const startInterview = (interviewData) => {
    return apiClient.post('/interviews/start', interviewData);
};

/**
 * Fetches the next question for an ongoing interview.
 * @param {string} interviewId - The ID of the current interview.
 */
export const getNextQuestion = (interviewId) => {
    return apiClient.get(`/interviews/${interviewId}/next-question`);
};

/**
 * Submits an answer for the current question.
 * @param {string} interviewId - The ID of the current interview.
 * @param {object} answerData - The answer payload (question_id, content).
 */
export const submitAnswer = (interviewId, answerData) => {
    return apiClient.post(`/interviews/${interviewId}/answer`, answerData);
};

/**
 * Finalizes an interview session.
 * @param {string} interviewId - The ID of the interview to finish.
 */
export const finishInterview = (interviewId) => {
    return apiClient.post(`/interviews/${interviewId}/finish`);
};
// api/apiClient.js

/**
 * Registers a new user.
 * @param {string} name - Full name of the user
 * @param {string} email - User's email
 * @param {string} password - User's password
 */
export const registerUser = (name, email, password) => {
  return apiClient.post('/users/', {
    name,
    email,
    password,
  });
};

/**
 * Logs in a user and returns auth token + user data.
 * @param {string} email
 * @param {string} password
 */
export const loginUser = (email, password) => {
  return apiClient.post('/users/login', { email, password });
};
// SSE (Server-Sent Events) endpoints for live audio streaming
export const sseEndpoints = {
  events: (userId, interviewId) => 
    `http://127.0.0.1:8000/api/v2/interviews/events/${userId}/${interviewId}`,

  send: (userId) => 
    `http://127.0.0.1:8000/api/v2/interviews/send/${userId}`,
};

// Send message to agent
export const sendToAgent = async (userId, message) => {
  try {
    const fullUrl = sseEndpoints.send(userId);
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending message to agent:', error);
    throw error;
  }
};

export default apiClient;

