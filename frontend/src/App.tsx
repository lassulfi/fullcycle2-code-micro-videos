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
import Spinner from './components/Spinner';
import LoadingProvider from './components/loading/LoadingProvider';

function App() {
  return (
    <React.Fragment>
      <LoadingProvider>
        <MuiThemeProvider theme={theme}>
          <CssBaseline />
          <SnackbarProvider>
            <BrowserRouter basename="/admin">
              <Spinner />
              <Navbar/>
              <Box paddingTop={'70px'}>
                <Breadcrumbs/>
                <AppRouter/>
              </Box>
            </BrowserRouter>
          </SnackbarProvider>
        </MuiThemeProvider>
      </LoadingProvider>
    </React.Fragment>
  );
}

export default App;
