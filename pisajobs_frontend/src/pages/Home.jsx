import { Box, Typography, Button, Container } from '@mui/material';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,          
      bgcolor: '#FAF8F6',
      px: 2
    }}>
      <Container sx={{ textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom fontWeight={700}>
          Scopri le opportunità di lavoro a Pisa in un click
        </Typography>
        <Typography variant="h6" sx={{ mb: 4, color: 'text.secondary' }}>
          PisaJobs è la piattaforma che connette persone e imprese a Pisa con opportunità di lavoro reali, flessibili e immediate.
Che tu stia cercando un lavoretto, un impiego stabile o una collaborazione professionale, qui trovi tutto in un solo posto.
Semplice da usare, pensato per la comunità, utile per studenti, professionisti e aziende locali.
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
