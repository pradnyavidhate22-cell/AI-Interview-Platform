import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Container, Grid, Paper, Typography } from '@mui/material';

function SectionBadge({ label }) {
  return (
    <Box
      sx={{
        width: 48,
        height: 48,
        borderRadius: 2,
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: '1.1rem'
      }}
    >
      {label}
    </Box>
  );
}

const sections = [
  {
    title: 'Interview coaching',
    description:
      'Practice with a humanoid avatar: voice, feedback, and dataset-driven technical questions.',
    to: '/interview',
    badge: 'I'
  },
  {
    title: 'Code practice',
    description:
      'Solve DSA-style problems with hints, automated checks, and AI help when you are stuck.',
    to: '/code-practice',
    badge: 'C'
  },
  {
    title: 'Confidence dashboard',
    description:
      'See how your interview performance trends over time and where to improve next.',
    to: '/dashboard',
    badge: '%'
  }
];

function Home() {
  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        background: 'linear-gradient(165deg, #f0f7ff 0%, #ffffff 55%, #fafafa 100%)'
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Box sx={{ maxWidth: 900, mx: 'auto', textAlign: { xs: 'left', sm: 'center' } }}>
          <Typography
            component="h1"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '2rem', sm: '2.75rem', md: '3.5rem' },
              lineHeight: 1.12,
              letterSpacing: '-0.03em',
              color: 'text.primary',
              mb: 2
            }}
          >
            AI That Talks, Teaches, and Assists
          </Typography>
          <Typography
            variant="h6"
            component="p"
            sx={{
              fontWeight: 400,
              fontSize: { xs: '1.05rem', md: '1.25rem' },
              lineHeight: 1.6,
              color: 'text.secondary',
              maxWidth: 720,
              mx: { xs: 0, sm: 'auto' },
              mb: 1
            }}
          >
            Experience AI-powered interview coaching and hands-on code practice through a
            humanoid avatar — with feedback, hints, and progress you can track over time.
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ mt: { xs: 4, md: 6 } }}>
          {sections.map((item) => (
            <Grid item xs={12} sm={6} key={item.to}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  transition: 'box-shadow 0.2s, transform 0.2s',
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <Box sx={{ mb: 2 }}>
                  <SectionBadge label={item.badge} />
                </Box>
                <Typography variant="h6" component="h2" gutterBottom fontWeight={700}>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, mb: 2 }}>
                  {item.description}
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  component={RouterLink}
                  to={item.to}
                  sx={{ alignSelf: 'flex-start', textTransform: 'none', fontWeight: 600 }}
                >
                  Open
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export default Home;
