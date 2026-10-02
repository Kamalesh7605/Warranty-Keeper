import { Box, Card, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '../components/Common/EmptyState';
import { ErrorState } from '../components/Common/ErrorState';
import { PageHeader } from '../components/Common/PageHeader';
import { Loading } from '../components/Loading/Loading';
import { useMarkNotificationRead, useNotifications } from '../features/notifications/hooks';
import { formatDate } from '../utils/format';

export function NotificationsPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useNotifications();
  const markRead = useMarkNotificationRead();

  return (
    <>
      <PageHeader title="Notifications" subtitle="Warranty reminders are created one day before expiry" />
      {isLoading ? <Loading label="Loading notifications..." /> : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : data && data.length > 0 ? (
        <Card>
          <Box component="ul" sx={{ m: 0, p: 0 }}>
            {data.map((n, i) => (
              <Box
                component="li"
                key={n.id}
                onClick={() => { if (!n.read) markRead.mutate(n.id); navigate(`/products/${n.productId}`); }}
                sx={{
                  listStyle: 'none', px: 2.5, py: 1.75, cursor: 'pointer', borderTop: i === 0 ? 0 : 1, borderColor: 'divider',
                  bgcolor: n.read ? undefined : 'primary.light', '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Typography sx={{ fontWeight: n.read ? 400 : 600 }}>{n.message}</Typography>
                <Typography variant="caption" color="text.secondary">{formatDate(n.notificationDate)}</Typography>
              </Box>
            ))}
          </Box>
        </Card>
      ) : (
        <EmptyState title="No notifications yet." description="You will be notified one day before a warranty expires." />
      )}
    </>
  );
}
