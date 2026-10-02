import { createTheme } from '@mui/material/styles';

export const statusColors = {
  success: { bg: '#e6f7ee', fg: '#15803d' },
  warning: { bg: '#fff4e0', fg: '#b45309' },
  error: { bg: '#fdecec', fg: '#c62828' },
  neutral: { bg: '#eef1f6', fg: '#556070' },
  info: { bg: '#e8f0fe', fg: '#1d4ed8' },
};

export const gradients = {
  primary: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  hero: 'linear-gradient(120deg, #1e3a8a 0%, #2563eb 55%, #38bdf8 100%)',
  sidebar: 'linear-gradient(180deg, #0f172a 0%, #172554 100%)',
};

export const cardShadow = '0 1px 2px rgba(16,24,40,0.04), 0 6px 20px rgba(16,24,40,0.05)';
export const cardShadowHover = '0 2px 4px rgba(16,24,40,0.06), 0 12px 28px rgba(37,99,235,0.14)';

export const theme = createTheme({
  palette: {
    primary: { main: '#2563eb', dark: '#1d4ed8', light: '#eaf1ff' },
    success: { main: '#16a34a' },
    warning: { main: '#f59e0b' },
    error: { main: '#dc2626' },
    background: { default: '#f3f6fc', paper: '#ffffff' },
    text: { primary: '#0f172a', secondary: '#64748b' },
    divider: '#e7ebf3',
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 800, fontSize: '1.65rem', letterSpacing: -0.5 },
    h5: { fontWeight: 700, letterSpacing: -0.3 },
    h6: { fontWeight: 700, letterSpacing: -0.2 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'radial-gradient(1200px 500px at 85% -10%, #e0ebff 0%, transparent 60%), #f3f6fc',
          backgroundAttachment: 'fixed',
        },
        '@keyframes fadeUp': { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'none' } },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 10, paddingInline: 18 },
        containedPrimary: {
          background: gradients.primary,
          boxShadow: '0 4px 12px rgba(37,99,235,0.28)',
          '&:hover': { background: 'linear-gradient(135deg, #2f74f0 0%, #1a45c4 100%)', boxShadow: '0 6px 16px rgba(37,99,235,0.36)' },
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { border: '1px solid #e7ebf3', borderRadius: 18, boxShadow: cardShadow } },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiTextField: { defaultProps: { size: 'small', fullWidth: true } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: '#fff',
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#93b4f5' },
        },
        notchedOutline: { borderColor: '#dde3ee' },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { color: '#64748b', fontWeight: 700, fontSize: '0.72rem', letterSpacing: 0.6, textTransform: 'uppercase', backgroundColor: '#f8fafd' },
        root: { borderColor: '#eef1f7' },
      },
    },
    MuiTableRow: { styleOverrides: { root: { '&:last-child td': { borderBottom: 0 } } } },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', fontWeight: 600, borderColor: '#dde3ee',
          '&.Mui-selected, &.Mui-selected:hover': { backgroundColor: '#eaf1ff', color: '#1d4ed8' },
        },
      },
    },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 20 } } },
    MuiTab: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } } },
  },
});
