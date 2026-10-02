import { Avatar } from '@mui/material';
import { avatarGradient } from '../../utils/colors';

export function ProductAvatar({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <Avatar
      variant="rounded"
      sx={{ width: size, height: size, background: avatarGradient(name), color: '#fff', fontWeight: 700, fontSize: size * 0.42, borderRadius: 2.5, boxShadow: '0 4px 10px rgba(15,23,42,0.15)' }}
    >
      {name.charAt(0).toUpperCase()}
    </Avatar>
  );
}
