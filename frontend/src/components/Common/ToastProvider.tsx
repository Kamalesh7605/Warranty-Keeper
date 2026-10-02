import { Alert, Snackbar } from '@mui/material';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type Severity = 'success' | 'error' | 'info';
interface Toast {
  message: string;
  severity: Severity;
  key: number;
}

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const [open, setOpen] = useState(false);

  const show = useCallback((severity: Severity) => (message: string) => {
    setToast({ message, severity, key: Date.now() });
    setOpen(true);
  }, []);

  const api = useMemo<ToastApi>(
    () => ({ success: show('success'), error: show('error'), info: show('info') }),
    [show],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Snackbar
        key={toast?.key}
        open={open}
        autoHideDuration={4500}
        onClose={(_, reason) => reason !== 'clickaway' && setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast?.severity ?? 'info'} variant="filled" onClose={() => setOpen(false)} sx={{ width: '100%' }}>
          {toast?.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
