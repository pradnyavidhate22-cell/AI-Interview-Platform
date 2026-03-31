import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

const InterviewContext = createContext();

/**
 * API base URL.
 * - If REACT_APP_API_URL is set (e.g. in .env), use it (no trailing slash).
 * - In development, default to Flask directly so /api calls are not sent to the React dev server
 *   (avoids 404 when the CRA proxy does not run or apply).
 * - Production build without env: same-origin /api (put a reverse proxy in front or set REACT_APP_API_URL).
 */
function getApiBase() {
  const fromEnv = (process.env.REACT_APP_API_URL || '').trim().replace(/\/$/, '');
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV === 'development') {
    return 'http://127.0.0.1:5000';
  }
  return '';
}

const api = axios.create({
  baseURL: getApiBase()
});

export function useInterview() {
  return useContext(InterviewContext);
}

export function InterviewProvider({ children }) {
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [feedback, setFeedback] = useState('');
  const [nextQuestion, setNextQuestion] = useState('');
  const [improvedAnswer, setImprovedAnswer] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [confidenceScore, setConfidenceScore] = useState(null);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [code, setCode] = useState('');
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [confidenceData, setConfidenceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastPracticeTopic, setLastPracticeTopic] = useState('arrays');
  const [lastPracticeDifficulty, setLastPracticeDifficulty] = useState('easy');

  const startInterview = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/api/start-interview');
      setCurrentQuestion(response.data.question);
      return response.data;
    } catch (err) {
      setError('Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  const submitResponse = async (response) => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.post('/api/analyze-response', { response });
      setFeedback(result.data.feedback);
      setNextQuestion(result.data.next_question);
      setImprovedAnswer(result.data.improved_answer || '');
      setSuggestions(result.data.suggestions || []);
      setConfidenceScore(
        typeof result.data.confidence_score === 'number' ? result.data.confidence_score : null
      );

      // Allow UI components to immediately speak/display the new fields.
      return result.data;
    } catch (err) {
      setError('Failed to submit response');
      return {
        feedback: 'I could not analyze the response due to a temporary issue. Please try again.',
        next_question: currentQuestion || '',
        improved_answer: 'Try giving a short, direct answer with one technical point.',
        suggestions: [
          'Answer in 2-3 concise sentences.',
          'Use one core technical term.',
          'If voice fails, type your response.'
        ],
        confidence_score: 0.3
      };
    } finally {
      setLoading(false);
    }
  };

  const startCodePractice = async (topic = 'arrays', difficulty = 'easy') => {
    try {
      setLoading(true);
      setError(null);
      setLastPracticeTopic(topic);
      setLastPracticeDifficulty(difficulty);
      const response = await api.post('/api/start-code-practice', {
        topic,
        difficulty
      });
      const data = response.data;
      if (data && data.success === false) {
        setCurrentProblem(null);
        setError(
          data.message ||
            'No problems available for this topic and difficulty. Try another combination.'
        );
        return;
      }
      if (!data || !data.problem) {
        setCurrentProblem(null);
        setError('Invalid response from server. Is the backend up to date?');
        return;
      }
      setCurrentProblem(data.problem);
      setEvaluationResult(null);
    } catch (err) {
      const isNetwork =
        !err.response &&
        (err.code === 'ERR_NETWORK' || err.message === 'Network Error');
      const is404 = err.response?.status === 404;
      setCurrentProblem(null);
      setError(
        isNetwork
          ? 'Cannot reach the API. Open a terminal in the inner project folder (the one that contains ai_interviewer.py), run: python backend/app.py — keep it running — then restart npm start (npm run start must run from frontend/).'
          : is404
            ? 'API returned 404. Ensure Flask is running (python backend/app.py) on port 5000, then restart the React dev server (npm start from frontend/).'
            : err.response?.data?.message ||
                err.message ||
                'Failed to start code practice.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getHint = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/get-hint');
      return response.data.hint;
    } catch (err) {
      setError('Failed to get hint');
    } finally {
      setLoading(false);
    }
  };

  const submitSolution = async (code) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/api/submit-solution', { code });
      const data = response.data;

      if (
        data &&
        data.success === false &&
        typeof data.message === 'string' &&
        data.message.toLowerCase().includes('no problem selected')
      ) {
        // Backend session can reset (e.g. Flask reload). Re-select a problem automatically.
        await startCodePractice(lastPracticeTopic, lastPracticeDifficulty);
        setError('Session refreshed. Please submit your solution again.');
        return;
      }

      setEvaluationResult(data);
      if (
        data &&
        data.message &&
        data.success === false &&
        !data.skipped_tests &&
        !data.results?.length
      ) {
        setError(data.message);
      }
    } catch (err) {
      const isNetwork =
        !err.response &&
        (err.code === 'ERR_NETWORK' || err.message === 'Network Error');
      const is404 = err.response?.status === 404;
      setError(
        isNetwork
          ? 'Cannot reach the API. Run python backend/app.py from the inner project folder and keep Flask on port 5000 (or set REACT_APP_API_URL if you use another port).'
          : is404
            ? 'API returned 404. Start Flask on port 5000 and restart npm start from frontend/.'
            : err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                'Failed to submit solution.'
      );
      setEvaluationResult(null);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/confidence-dashboard');
      setConfidenceData(response.data);
    } catch (err) {
      setError('Failed to get confidence dashboard');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentQuestion,
    feedback,
    nextQuestion,
    improvedAnswer,
    suggestions,
    confidenceScore,
    currentProblem,
    code,
    setCode,
    evaluationResult,
    confidenceData,
    loading,
    error,
    startInterview,
    submitResponse,
    startCodePractice,
    getHint,
    submitSolution,
    getConfidenceDashboard
  };

  return (
    <InterviewContext.Provider value={value}>
      {children}
    </InterviewContext.Provider>
  );
} 