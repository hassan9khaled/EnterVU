import axios from 'axios';


const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:5000/api/v2',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetches a list of all interview sessions.
 */
export const getInterviews = () => {
  return apiClient.get('/interviews/'); // Example endpoint
};

/**
 * Fetches the detailed report for a single interview.
 * @param {string} interviewId - The ID of the interview to fetch.
 */
export const getInterviewReport = (interviewId) => {
  return apiClient.get(`/interviews/${interviewId}/report`); // Example endpoint
};

/**
 * Fetches the list of CVs for the user.
 */
export const getCvs = () => {
  return apiClient.get('/cvs/'); // Example endpoint
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

export default apiClient;

