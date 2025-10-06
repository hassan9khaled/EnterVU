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

export default apiClient;

