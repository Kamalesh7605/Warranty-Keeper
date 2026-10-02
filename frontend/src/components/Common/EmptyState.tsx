import InboxOutlined from '@mui/icons-material/InboxOutlined';
import { Avatar, Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface Props {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({ title, description, action, icon }: Props) {
  return (
    <Box sx={{ textAlign: 'center', py: 7, px: 2 }}>
      <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, bgcolor: 'primary.light', color: 'primary.main' }}>
        {icon ?? <InboxOutlined fontSize="large" />}
      </Avatar>
      <Typography variant="h6">{title}</Typography>
      {description && <Typography color="text.secondary" sx={{ mt: 0.5, mb: action ? 2.5 : 0 }}>{description}</Typography>}
      {action}
    </Box>
  );
}
