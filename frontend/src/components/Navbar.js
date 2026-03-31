import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box
} from '@mui/material';

function Navbar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none', fontWeight: 700 }}
        >
          AI That Talks
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          <Button color="inherit" component={RouterLink} to="/" sx={{ mx: 0.5 }}>
            Home
          </Button>
          <Button color="inherit" component={RouterLink} to="/interview" sx={{ mx: 0.5 }}>
            Interview
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/code-practice"
            sx={{ mx: 0.5 }}
          >
            Code Practice
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/dashboard"
            sx={{ mx: 0.5 }}
          >
            Dashboard
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 