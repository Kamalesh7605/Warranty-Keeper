import { Alert, Button } from '@mui/material';
import { getErrorMessage } from '../../services/api';

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <Alert
      severity="error"
      sx={{ my: 2 }}
      action={onRetry && <Button color="inherit" size="small" onClick={onRetry}>Retry</Button>}
    >
      {getErrorMessage(error)}
    </Alert>
  );
}
