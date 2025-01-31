// src/theme/mui-theme.ts
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  // Add your theme customizations
});

// In your App.tsx or main layout
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme/mui-theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      {/* Your app content */}
    </ThemeProvider>
  );
}
