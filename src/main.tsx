import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { ColorThemeProvider } from './contexts/ColorThemeContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SoundProvider } from './contexts/SoundContext';
import { ControlsProvider } from './contexts/ControlsContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ColorThemeProvider>
        <AuthProvider>
          <ThemeProvider>
            <SoundProvider>
              <ControlsProvider>
                <App />
              </ControlsProvider>
            </SoundProvider>
          </ThemeProvider>
        </AuthProvider>
      </ColorThemeProvider>
    </BrowserRouter>
  </StrictMode>
);