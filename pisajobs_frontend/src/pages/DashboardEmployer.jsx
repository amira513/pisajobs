import { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Stack, 
  Button, 
  CircularProgress, 
  Alert, 
  List, 
  ListItem, 
  ListItemText,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Card,
  CardContent,
  CardActions,
  Grid,
  Badge,
  IconButton
} from '@mui/material';
import { Add, Edit, Delete, People } from '@mui/icons-material';

export default function DashboardEmployer() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicationsDialogOpen, setApplicationsDialogOpen] = useState(false);
  const [selectedJobApplications, setSelectedJobApplications] = useState([]);
  const [allApplicationsDialogOpen, setAllApplicationsDialogOpen] = useState(false);
  const [allApplications, setAllApplications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const token = localStorage.getItem('token');

  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    category: '',
    location: 'Pisa',
    pay: '',
    skills_required: ''
  });

  useEffect(() => {
    if (!token) {
      setError('Utente non autenticato');
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        const [jobsRes, notifRes, unreadRes] = await Promise.all([
          fetch('http://localhost:8000/api/employer/jobs/', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('http://localhost:8000/api/notifications/', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('http://localhost:8000/api/notifications/unread-count/', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!jobsRes.ok || !notifRes.ok) {
          throw new Error('Errore nel caricamento dei dati');
        }

        setJobs(await jobsRes.json());
        setNotifications(await notifRes.json());
        
        if (unreadRes.ok) {
          const unreadData = await unreadRes.json();
          setUnreadCount(unreadData.unread_count);
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }

    fetchData();
  }, [token]);

  const handleCreateJob = async () => {
    // Validazione dei campi obbligatori
    if (!newJob.title.trim()) {
      setError('Il titolo è obbligatorio');
      return;
    }
    if (!newJob.description.trim()) {
      setError('La descrizione è obbligatoria');
      return;
    }
    if (!newJob.category.trim()) {
      setError('La categoria è obbligatoria');
      return;
    }
    if (!newJob.pay || parseFloat(newJob.pay) <= 0) {
      setError('Il compenso deve essere maggiore di zero');
      return;
    }

    try {
      // Prepara i dati per l'invio
      const jobData = {
        ...newJob,
        pay: parseFloat(newJob.pay), // Converti in numero
        skills_required: newJob.skills_required || '' // Assicura che non sia undefined
      };

      const response = await fetch('http://localhost:8000/api/jobs/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(jobData),
      });

      if (response.ok) {
        const createdJob = await response.json();
        setJobs([createdJob, ...jobs]);
        setCreateDialogOpen(false);
        setNewJob({
          title: '',
          description: '',
          category: '',
          location: 'Pisa',
          pay: '',
          skills_required: ''
        });
        setError(''); // Pulisci eventuali errori precedenti
      } else {
        const error = await response.json();
        console.error('Errore del server:', error);
        setError(JSON.stringify(error) || 'Errore nella creazione del job');
      }
    } catch (err) {
      console.error('Errore di rete:', err);
      setError('Errore nella creazione del job');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo job?')) return;

    try {
      const response = await fetch(`http://localhost:8000/api/jobs/${jobId}/delete/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setJobs(jobs.filter(job => job.id !== jobId));
      } else {
        setError('Errore nell\'eliminazione del job');
      }
    } catch (err) {
      setError('Errore nell\'eliminazione del job');
    }
  };

  const handleViewApplications = async (jobId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/jobs/${jobId}/applications/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const applications = await response.json();
        setSelectedJobApplications(applications);
        setApplicationsDialogOpen(true);
      } else {
        setError('Errore nel caricamento delle candidature');
      }
    } catch (err) {
      setError('Errore nel caricamento delle candidature');
    }
  };

  const handleUpdateApplicationStatus = async (applicationId, status) => {
    try {
      const response = await fetch(`http://localhost:8000/api/applications/${applicationId}/status/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        // Aggiorna la lista delle candidature
        setSelectedJobApplications(prev => 
          prev.map(app => 
            app.id === applicationId ? { ...app, status } : app
          )
        );
      } else {
        setError('Errore nell\'aggiornamento dello status');
      }
    } catch (err) {
      setError('Errore nell\'aggiornamento dello status');
    }
  };

  const handleEditJob = (job) => {
    setSelectedJob(job);
    setNewJob({
      title: job.title,
      description: job.description,
      category: job.category,
      location: job.location,
      pay: job.pay.toString(),
      skills_required: job.skills_required || ''
    });
    setEditDialogOpen(true);
  };

  const handleUpdateJob = async () => {
    // Validazione dei campi obbligatori
    if (!newJob.title.trim()) {
      setError('Il titolo è obbligatorio');
      return;
    }
    if (!newJob.description.trim()) {
      setError('La descrizione è obbligatoria');
      return;
    }
    if (!newJob.category.trim()) {
      setError('La categoria è obbligatoria');
      return;
    }
    if (!newJob.pay || parseFloat(newJob.pay) <= 0) {
      setError('Il compenso deve essere maggiore di zero');
      return;
    }

    try {
      // Prepara i dati per l'invio
      const jobData = {
        ...newJob,
        pay: parseFloat(newJob.pay), // Converti in numero
        skills_required: newJob.skills_required || '' // Assicura che non sia undefined
      };

      const response = await fetch(`http://localhost:8000/api/jobs/${selectedJob.id}/update/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(jobData),
      });

      if (response.ok) {
        const updatedJob = await response.json();
        setJobs(jobs.map(job => job.id === selectedJob.id ? updatedJob : job));
        setEditDialogOpen(false);
        setSelectedJob(null);
        setNewJob({
          title: '',
          description: '',
          category: '',
          location: 'Pisa',
          pay: '',
          skills_required: ''
        });
        setError(''); // Pulisci eventuali errori precedenti
      } else {
        const error = await response.json();
        console.error('Errore del server:', error);
        setError(JSON.stringify(error) || 'Errore nell\'aggiornamento del job');
      }
    } catch (err) {
      console.error('Errore di rete:', err);
      setError('Errore nell\'aggiornamento del job');
    }
  };

  const handleViewAllApplications = async () => {
    try {
      // Raccoglie tutte le candidature da tutti i job dell'employer
      const allApps = [];
      
      for (const job of jobs) {
        const response = await fetch(`http://localhost:8000/api/jobs/${job.id}/applications/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (response.ok) {
          const applications = await response.json();
          // Aggiunge informazioni sul job a ogni candidatura
          const appsWithJobInfo = applications.map(app => ({
            ...app,
            job_title: job.title,
            job_id: job.id
          }));
          allApps.push(...appsWithJobInfo);
        }
      }
      
      setAllApplications(allApps);
      setAllApplicationsDialogOpen(true);
    } catch (err) {
      setError('Errore nel caricamento delle candidature');
    }
  };

  const handleMarkNotificationRead = async (notificationId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/notifications/${notificationId}/read/`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        // Aggiorna lo stato locale
        setNotifications(notifications.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        ));
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
    } catch (err) {
      console.error('Errore nel marcare la notifica come letta:', err);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/notifications/mark-all-read/', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        // Aggiorna lo stato locale
        setNotifications(notifications.map(notif => ({ ...notif, read: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Errore nel marcare tutte le notifiche come lette:', err);
    }
  };

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ p: 4 }}><Alert severity="error">{error}</Alert></Box>;

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Dashboard Employer
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Gestisci le tue offerte di lavoro e le candidature ricevute.
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Crea Nuova Offerta
        </Button>
        <Button variant="outlined" startIcon={<People />} onClick={handleViewAllApplications}>
          Vedi Tutte le Candidature
        </Button>
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Le tue offerte attive ({jobs.length})
            </Typography>
            {jobs.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Nessuna offerta pubblicata. Crea la tua prima offerta!
              </Typography>
            ) : (
              <List>
                {jobs.map(job => (
                  <Card key={job.id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6">{job.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {job.description}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                        <Chip label={job.category} size="small" />
                        <Chip label={job.location} size="small" />
                        <Chip label={`€${job.pay}/h`} size="small" color="primary" />
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        Pubblicato il {new Date(job.created_at).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small" 
                        startIcon={<People />}
                        onClick={() => handleViewApplications(job.id)}
                      >
                        Candidature
                      </Button>
                      <Button 
                        size="small" 
                        startIcon={<Edit />}
                        onClick={() => handleEditJob(job)}
                      >
                        Modifica
                      </Button>
                      <Button 
                        size="small" 
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => handleDeleteJob(job.id)}
                      >
                        Elimina
                      </Button>
                    </CardActions>
                  </Card>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Notifiche 
                {unreadCount > 0 && (
                  <Chip 
                    label={unreadCount} 
                    color="error" 
                    size="small" 
                    sx={{ ml: 1 }}
                  />
                )}
              </Typography>
              {unreadCount > 0 && (
                <Button 
                  size="small" 
                  onClick={handleMarkAllNotificationsRead}
                  color="primary"
                >
                  Marca tutte come lette
                </Button>
              )}
            </Box>
            {notifications.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Nessuna notifica.
              </Typography>
            ) : (
              <List dense>
                {notifications.slice(0, 5).map(notif => (
                  <ListItem 
                    key={notif.id} 
                    sx={{ 
                      bgcolor: notif.read ? 'inherit' : 'rgba(0,0,255,0.1)',
                      borderRadius: 1,
                      mb: 1,
                      cursor: notif.read ? 'default' : 'pointer'
                    }}
                    onClick={() => !notif.read && handleMarkNotificationRead(notif.id)}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: notif.read ? 'normal' : 'bold',
                              color: notif.read ? 'text.secondary' : 'text.primary'
                            }}
                          >
                            {notif.message}
                          </Typography>
                          {!notif.read && (
                            <Chip label="Nuova" color="primary" size="small" />
                          )}
                        </Box>
                      }
                      secondary={new Date(notif.created_at).toLocaleString()}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog per creare nuovo job */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Crea Nuova Offerta</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Titolo "
              value={newJob.title}
              onChange={(e) => setNewJob({...newJob, title: e.target.value})}
              fullWidth
              required
            />
            <TextField
              label="Descrizione "
              value={newJob.description}
              onChange={(e) => setNewJob({...newJob, description: e.target.value})}
              multiline
              rows={3}
              fullWidth
              required
            />
            <TextField
              label="Categoria "
              value={newJob.category}
              onChange={(e) => setNewJob({...newJob, category: e.target.value})}
              fullWidth
              required
            />
            <TextField
              label="Luogo"
              value={newJob.location}
              onChange={(e) => setNewJob({...newJob, location: e.target.value})}
              fullWidth
            />
            <TextField
              label="Compenso (€/h) *"
              type="number"
              value={newJob.pay}
              onChange={(e) => setNewJob({...newJob, pay: e.target.value})}
              fullWidth
              required
              inputProps={{ min: 0, step: 0.01 }}
            />
            <TextField
              label="Competenze richieste (separate da virgola)"
              value={newJob.skills_required}
              onChange={(e) => setNewJob({...newJob, skills_required: e.target.value})}
              fullWidth
              placeholder="es: JavaScript, React, Python"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setCreateDialogOpen(false);
            setError('');
          }}>Annulla</Button>
          <Button onClick={handleCreateJob} variant="contained">Crea</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog per modificare job */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Modifica Offerta</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Titolo "
              value={newJob.title}
              onChange={(e) => setNewJob({...newJob, title: e.target.value})}
              fullWidth
              required
            />
            <TextField
              label="Descrizione "
              value={newJob.description}
              onChange={(e) => setNewJob({...newJob, description: e.target.value})}
              multiline
              rows={3}
              fullWidth
              required
            />
            <TextField
              label="Categoria *"
              value={newJob.category}
              onChange={(e) => setNewJob({...newJob, category: e.target.value})}
              fullWidth
              required
            />
            <TextField
              label="Luogo"
              value={newJob.location}
              onChange={(e) => setNewJob({...newJob, location: e.target.value})}
              fullWidth
            />
            <TextField
              label="Compenso (€/h)"
              type="number"
              value={newJob.pay}
              onChange={(e) => setNewJob({...newJob, pay: e.target.value})}
              fullWidth
              required
              inputProps={{ min: 0, step: 0.01 }}
            />
            <TextField
              label="Competenze richieste (separate da virgola)"
              value={newJob.skills_required}
              onChange={(e) => setNewJob({...newJob, skills_required: e.target.value})}
              fullWidth
              placeholder="es: JavaScript, React, Python"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setEditDialogOpen(false);
            setSelectedJob(null);
            setError('');
          }}>Annulla</Button>
          <Button onClick={handleUpdateJob} variant="contained">Salva Modifiche</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog per vedere candidature */}
      <Dialog open={applicationsDialogOpen} onClose={() => setApplicationsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Candidature per {selectedJob?.title}</DialogTitle>
        <DialogContent>
          {selectedJobApplications.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Nessuna candidatura per questo job.
            </Typography>
          ) : (
            <List>
              {selectedJobApplications.map(app => (
                <ListItem key={app.id}>
                  <ListItemText
                    primary={app.user.username}
                    secondary={`Candidatura inviata il ${new Date(app.applied_at).toLocaleDateString()}`}
                  />
                  <Stack direction="row" spacing={1}>
                    <Chip 
                      label={app.status} 
                      color={app.status === 'accepted' ? 'success' : app.status === 'rejected' ? 'error' : 'default'}
                    />
                    {app.status === 'pending' && (
                      <>
                        <Button 
                          size="small" 
                          color="success"
                          onClick={() => handleUpdateApplicationStatus(app.id, 'accepted')}
                        >
                          Accetta
                        </Button>
                        <Button 
                          size="small" 
                          color="error"
                          onClick={() => handleUpdateApplicationStatus(app.id, 'rejected')}
                        >
                          Rifiuta
                        </Button>
                      </>
                    )}
                  </Stack>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApplicationsDialogOpen(false)}>Chiudi</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog per tutte le candidature */}
      <Dialog open={allApplicationsDialogOpen} onClose={() => setAllApplicationsDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Tutte le Candidature Ricevute ({allApplications.length})</DialogTitle>
        <DialogContent>
          {allApplications.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Nessuna candidatura ricevuta.
            </Typography>
          ) : (
            <List>
              {allApplications.map(app => (
                <ListItem key={`${app.job_id}-${app.id}`} sx={{ border: '1px solid #ddd', mb: 1, borderRadius: 1 }}>
                  <ListItemText
                    primary={
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {app.user.username}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Per: {app.job_title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Candidatura inviata il {new Date(app.applied_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip 
                            label={app.status} 
                            color={app.status === 'accepted' ? 'success' : app.status === 'rejected' ? 'error' : 'default'}
                            size="small"
                          />
                          {app.status === 'pending' && (
                            <>
                              <Button 
                                size="small" 
                                color="success"
                                onClick={() => handleUpdateApplicationStatus(app.id, 'accepted')}
                              >
                                Accetta
                              </Button>
                              <Button 
                                size="small" 
                                color="error"
                                onClick={() => handleUpdateApplicationStatus(app.id, 'rejected')}
                              >
                                Rifiuta
                              </Button>
                            </>
                          )}
                        </Stack>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAllApplicationsDialogOpen(false)}>Chiudi</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
