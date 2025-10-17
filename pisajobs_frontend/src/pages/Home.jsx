import { Box, Typography, Button, Container } from '@mui/material';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,           // occupa lo spazio flessibile tra navbar e footer
      bgcolor: '#FAF8F6',
      px: 2
    }}>
      <Container sx={{ textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom fontWeight={700}>
          Scopri le opportunità di lavoro a Pisa in un click
        </Typography>
        <Typography variant="h6" sx={{ mb: 4, color: 'text.secondary' }}>
          PisaJobs è la piattaforma che mette in contatto giovani talenti e studenti con lavori locali, flessibili e immediati. Offriamo un’esperienza semplice e rapida per trovare opportunità a Pisa, rafforzando il legame tra studenti e piccole imprese locali.
        </Typography>
        <Button component={Link} to="/login" variant="contained" sx={{ mr: 2, px: 4, py: 1.5 }}>
          Login
        </Button>
        <Button component={Link} to="/register" variant="outlined" sx={{ px: 4, py: 1.5 }}>
          Registrati
        </Button>
      </Container>
    </Box>
  );
}
