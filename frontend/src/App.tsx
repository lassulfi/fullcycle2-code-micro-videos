import React from 'react';
import logo from './logo.svg';
// import './App.css';
import { Box, CssBaseline, MuiThemeProvider } from '@material-ui/core';
import { Navbar } from './components/Navbar';
import Breadcrumbs from './components/Breadcrumbs';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './routes/AppRouter';
import theme from './theme';
import SnackbarProvider from './components/SnackbarProvider';

function App() {
  return (
    <React.Fragment>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>
          <BrowserRouter>
            <Navbar/>
            <Box paddingTop={'70px'}>
              <Breadcrumbs/>
              <AppRouter/>
            </Box>
          </BrowserRouter>
        </SnackbarProvider>
      </MuiThemeProvider>
    </React.Fragment>
  );
}

export default App;
