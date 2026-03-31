import React, { useState, useEffect } from 'react';
import { useInterview } from '../context/InterviewContext';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import CodeEditor from '@monaco-editor/react';

function CodePractice() {
  const {
    currentProblem,
    code,
    setCode,
    evaluationResult,
    loading,
    error,
    startCodePractice,
    getHint,
    submitSolution
  } = useInterview();

  const [topic, setTopic] = useState('arrays');
  const [difficulty, setDifficulty] = useState('easy');
  const [hint, setHint] = useState('');

  useEffect(() => {
    startCodePractice(topic, difficulty);
  }, [topic, difficulty]);

  useEffect(() => {
    if (currentProblem?.template) {
      setCode(currentProblem.template);
    }
  }, [currentProblem, setCode]);

  const handleStartPractice = () => {
    setHint('');
    startCodePractice(topic, difficulty);
  };

  const handleGetHint = async () => {
    const hintText = await getHint();
    setHint(hintText);
  };

  const handleSubmit = () => {
    const payload = (code || currentProblem?.template || '').trim();
    submitSolution(payload);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Code Practice
        </Typography>

        <Box sx={{ mb: 4 }}>
          <FormControl sx={{ mr: 2, minWidth: 120 }}>
            <InputLabel>Topic</InputLabel>
            <Select
              value={topic}
              label="Topic"
              onChange={(e) => setTopic(e.target.value)}
            >
              <MenuItem value="arrays">Arrays</MenuItem>
              <MenuItem value="linked_lists">Linked Lists</MenuItem>
              <MenuItem value="trees">Trees</MenuItem>
              <MenuItem value="graphs">Graphs</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Difficulty</InputLabel>
            <Select
              value={difficulty}
              label="Difficulty"
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <MenuItem value="easy">Easy</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="hard">Hard</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {currentProblem && (
              <>
                <Typography variant="h6" gutterBottom>
                  Problem: {currentProblem.title}
                </Typography>
                <Typography paragraph>{currentProblem.description}</Typography>

                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleGetHint}
                    sx={{ mr: 2 }}
                  >
                    Get Hint
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleStartPractice}
                    sx={{ mr: 2 }}
                  >
                    Next Question
                  </Button>
                  {hint && (
                    <Typography variant="body2" color="text.secondary">
                      Hint: {hint}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ mb: 4 }}>
                  <CodeEditor
                    height="400px"
                    defaultLanguage="python"
                    value={code || currentProblem.template}
                    onChange={setCode}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14
                    }}
                  />
                </Box>

                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={!(code || currentProblem?.template)}
                >
                  Submit Solution
                </Button>

                {evaluationResult && (
                  <Box mt={4}>
                    <Typography variant="h6" gutterBottom>
                      Evaluation Results:
                    </Typography>
                    <Typography
                      color={
                        evaluationResult.skipped_tests
                          ? 'text.secondary'
                          : evaluationResult.success
                            ? 'success.main'
                            : 'error.main'
                      }
                    >
                      {evaluationResult.skipped_tests
                        ? (evaluationResult.message ||
                            'No automated tests for this problem — see AI feedback below.')
                        : evaluationResult.success
                          ? 'All test cases passed!'
                          : 'Some test cases failed.'}
                    </Typography>
                    {evaluationResult.code_feedback && (
                      <Alert severity="info" sx={{ mt: 2, mb: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          AI code review
                        </Typography>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {evaluationResult.code_feedback}
                        </Typography>
                      </Alert>
                    )}
                    {evaluationResult.corrected_code && (
                      <Box mt={2}>
                        <Typography variant="subtitle2" gutterBottom>
                          Suggested correction (Python)
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.900' }}>
                          <Typography
                            component="pre"
                            sx={{
                              m: 0,
                              fontFamily: 'monospace',
                              fontSize: 13,
                              whiteSpace: 'pre-wrap',
                              color: 'grey.100'
                            }}
                          >
                            {evaluationResult.corrected_code}
                          </Typography>
                        </Paper>
                      </Box>
                    )}
                    {evaluationResult.results && (
                      <Box mt={2}>
                        {evaluationResult.results.map((result, index) => (
                          <Alert
                            key={index}
                            severity={result.passed ? 'success' : 'error'}
                            sx={{ mb: 1 }}
                          >
                            Test Case {index + 1}:{' '}
                            {result.passed ? 'Passed' : 'Failed'}
                            <br />
                            Input: {JSON.stringify(result.input)}
                            <br />
                            Expected: {JSON.stringify(result.expected)}
                            <br />
                            Actual: {JSON.stringify(result.actual)}
                          </Alert>
                        ))}
                      </Box>
                    )}
                  </Box>
                )}
              </>
            )}
          </>
        )}
      </Paper>
    </Container>
  );
}

export default CodePractice; 