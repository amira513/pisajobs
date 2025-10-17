import { Box, Typography, Link } from '@mui/material';

export default function Footer() {
  return (
    <Box sx={{ mt: 6, py: 4, bgcolor: 'background.paper', textAlign: 'center' }}>
      <Typography variant="body2" color="text.secondary">
        © {new Date().getFullYear()} Pisa Jobs. Tutti i diritti riservati.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        <Link href="#" color="inherit" sx={{ mx: 1 }}>Privacy</Link> | 
        <Link href="#" color="inherit" sx={{ mx: 1 }}>Termini</Link>
      </Typography>
    </Box>
  );
}
