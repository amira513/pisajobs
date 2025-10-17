import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Stack, Button, CircularProgress, Alert, List, ListItem, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';

export default function DashboardUser() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      setError('Utente non autenticato');
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        const [savedRes, appsRes, notifRes] = await Promise.all([
          fetch('http://localhost:8000/api/saved-jobs/', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('http://localhost:8000/api/applications/', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('http://localhost:8000/api/notifications/', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!savedRes.ok || !appsRes.ok || !notifRes.ok) {
          throw new Error('Errore nel caricamento dei dati');
        }

        setSavedJobs(await savedRes.json());
        setApplications(await appsRes.json());
        setNotifications(await notifRes.json());
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }

    fetchData();
  }, [token]);

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ p: 4 }}><Alert severity="error">{error}</Alert></Box>;

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Dashboard Utente</Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Gestisci le tue candidature e i lavori salvati.
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <Button variant="contained" component={Link} to="/trovalavoro"> 🔍 Trova Lavori
  </Button>
        <Button variant="outlined" href="/">❤️ Lavori Salvati</Button>
      </Stack>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Le tue candidature</Typography>
        {applications.length === 0 ? (
          <Typography variant="body2" color="text.secondary">Nessuna candidatura inviata.</Typography>
        ) : (
          <List dense>
            {applications.map(app => (
              <ListItem key={app.id}>
                <ListItemText
                  primary={app.job.title}
                  secondary={`Stato: ${app.status} - Candidatura inviata il ${new Date(app.applied_at).toLocaleDateString()}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Lavori Salvati</Typography>
        {savedJobs.length === 0 ? (
          <Typography variant="body2" color="text.secondary">Non hai lavori salvati.</Typography>
        ) : (
          <List dense>
            {savedJobs.map(saved => (
              <ListItem key={saved.id}>
                <ListItemText
                  primary={saved.job.title}
                  secondary={`Luogo: ${saved.job.location} - Categoria: ${saved.job.category}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Notifiche</Typography>
        {notifications.length === 0 ? (
          <Typography variant="body2" color="text.secondary">Nessuna notifica.</Typography>
        ) : (
          <List dense>
            {notifications.map(notif => (
              <ListItem key={notif.id} sx={{ bgcolor: notif.read ? 'inherit' : 'rgba(0,0,255,0.1)' }}>
                <ListItemText
                  primary={notif.message}
                  secondary={new Date(notif.created_at).toLocaleString()}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
}
