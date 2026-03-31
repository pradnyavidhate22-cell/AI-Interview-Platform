import React, { useEffect } from 'react';
import { useInterview } from '../context/InterviewContext';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';

function Dashboard() {
  const {
    confidenceData,
    loading,
    error,
    getConfidenceDashboard
  } = useInterview();

  useEffect(() => {
    getConfidenceDashboard();
  }, []);

  const renderConfidenceScore = (score) => (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress
          variant="determinate"
          value={score * 100}
          sx={{ height: 10, borderRadius: 5 }}
        />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">
          {`${Math.round(score * 100)}%`}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Confidence Dashboard
        </Typography>

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
          confidenceData && (
            <Grid container spacing={4}>
              {/* Overall Confidence */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Overall Confidence
                    </Typography>
                    {renderConfidenceScore(confidenceData.summary.overall_confidence)}
                  </CardContent>
                </Card>
              </Grid>

              {/* Topic Confidence */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Topic Confidence
                    </Typography>
                    {Object.entries(confidenceData.summary.topic_confidence).map(
                      ([topic, score]) => (
                        <Box key={topic} sx={{ mb: 2 }}>
                          <Typography variant="body2" gutterBottom>
                            {topic.replace('_', ' ').toUpperCase()}
                          </Typography>
                          {renderConfidenceScore(score)}
                        </Box>
                      )
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Strength Areas */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Strength Areas
                    </Typography>
                    {confidenceData.summary.strength_areas.length > 0 ? (
                      confidenceData.summary.strength_areas.map((area) => (
                        <Typography
                          key={area}
                          variant="body2"
                          color="success.main"
                          sx={{ mb: 1 }}
                        >
                          ✓ {area.replace('_', ' ').toUpperCase()}
                        </Typography>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Keep practicing to identify your strengths!
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Improvement Areas */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Areas for Improvement
                    </Typography>
                    {Object.entries(confidenceData.improvement_plan).map(
                      ([topic, suggestions]) => (
                        <Box key={topic} sx={{ mb: 3 }}>
                          <Typography variant="subtitle1" gutterBottom>
                            {topic.replace('_', ' ').toUpperCase()}
                          </Typography>
                          {suggestions.map((suggestion, index) => (
                            <Typography
                              key={index}
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 1 }}
                            >
                              • {suggestion}
                            </Typography>
                          ))}
                        </Box>
                      )
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Motivational Prompt */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Keep Going!
                    </Typography>
                    <Typography variant="body1" color="primary">
                      {confidenceData.motivational_prompt}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )
        )}
      </Paper>
    </Container>
  );
}

export default Dashboard; 