import { CssBaseline, ThemeProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import { AuthGate } from './features/auth/AuthGate';
import { ToastProvider } from './components/Common/ToastProvider';
import { AppRoutes } from './routes/AppRoutes';
import { theme } from './theme/theme';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 15_000 } },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthProvider>
            <AuthGate>
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </AuthGate>
          </AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
