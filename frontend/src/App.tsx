import React from 'react';
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
import { ReactKeycloakProvider } from '@react-keycloak/web';
import { keycloak, keycloakConfig } from './utils/auth';

function App() {
  return (
    <ReactKeycloakProvider authClient={keycloak} initOptions={keycloakConfig}>
      <LoadingProvider>
        <MuiThemeProvider theme={theme}>
          <CssBaseline />
          <SnackbarProvider>
            <BrowserRouter basename={process.env.REACT_APP_BASENAME}>
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
    </ReactKeycloakProvider>
  );
}

export default App;
