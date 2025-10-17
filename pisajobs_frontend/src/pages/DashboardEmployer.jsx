import { Box, Typography, Button, Paper, Stack } from '@mui/material';

export default function DashboardEmployer() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Dashboard Employer
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Qui puoi pubblicare, modificare e gestire le tue offerte di lavoro.
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Button variant="contained">+ Crea Nuova Offerta</Button>
        <Button variant="outlined">Vedi Candidature</Button>
      </Stack>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6">Le tue offerte attive</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          (In futuro qui compariranno le offerte pubblicate.)
        </Typography>
      </Paper>
    </Box>
  );
}
