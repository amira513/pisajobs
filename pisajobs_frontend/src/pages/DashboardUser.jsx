import { useEffect, useState } from 'react';
import { Work, Favorite, Message, TrendingUp } from '@mui/icons-material';

import { 
  Box, 
  Typography, 
  Paper, 
  Stack, 
  Button, 
  List, 
  ListItem, 
  ListItemText,
  Card,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Link } from 'react-router-dom';


export default function DashboardUser() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 
  const [messagesDialogOpen, setMessagesDialogOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [savedJobsDialogOpen, setSavedJobsDialogOpen] = useState(false);
  const [jobDetailsDialogOpen, setJobDetailsDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);


  

  const token = localStorage.getItem('token');
  
  

  useEffect(() => {
    if (!token) {
      setError('Utente non autenticato');
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        const [savedRes, appsRes, notifRes, recRes, convRes, unreadRes] = await Promise.all([
          fetch('http://localhost:8000/api/saved-jobs/', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('http://localhost:8000/api/applications/', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('http://localhost:8000/api/notifications/', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('http://localhost:8000/api/recommendations/', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('http://localhost:8000/api/conversations/', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('http://localhost:8000/api/notifications/unread-count/', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!savedRes.ok || !appsRes.ok || !notifRes.ok) {
          throw new Error('Errore nel caricamento dei dati');
        }

        setSavedJobs(await savedRes.json());
        setApplications(await appsRes.json());
        setNotifications(await notifRes.json());
        
        if (recRes.ok) {
          setRecommendations(await recRes.json());
        }
        
        if (convRes.ok) {
          setConversations(await convRes.json());
        }

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

  const handleOpenMessages = async (conversation) => {
    setSelectedConversation(conversation);
    setMessagesDialogOpen(true);
    
    try {
      const response = await fetch(`http://localhost:8000/api/conversations/${conversation.id}/messages/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const messagesData = await response.json();
        setMessages(messagesData);
      }
    } catch (err) {
      console.error('Errore nel caricamento dei messaggi:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const otherParticipant = selectedConversation.participants.find(p => p.id !== JSON.parse(localStorage.getItem('user')).id);
      
      const response = await fetch('http://localhost:8000/api/messages/send/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiver_id: otherParticipant.id,
          content: newMessage,
          job_id: selectedConversation.job?.id || null
        }),
      });

      if (response.ok) {
        const newMsg = await response.json();
        setMessages([...messages, newMsg]);
        setNewMessage('');
      }
    } catch (err) {
      console.error('Errore nell\'invio del messaggio:', err);
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

  const handleViewJobDetails = (job) => {
    setSelectedJob(job);
    setJobDetailsDialogOpen(true);
  };


  

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ mb: 1 }}>Dashboard Utente</Typography>
          <Typography variant="body1">
            Gestisci le tue candidature, lavori salvati e messaggi.
          </Typography>
        </Box>
   
      </Box>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Button variant="contained" component={Link} to="/trovalavoro" startIcon={<Work />}>
          Trova Lavori
        </Button>
        <Button 
          variant="outlined" 
          startIcon={<Favorite />} 
          onClick={() => setSavedJobsDialogOpen(true)}
        >
          Lavori Salvati ({savedJobs.length})
        </Button>
        <Button 
          variant="outlined" 
          startIcon={<Message />} 
          onClick={() => setMessagesDialogOpen(true)}
        >
          Messaggi {unreadCount > 0 && `(${unreadCount})`}
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {/* Raccomandazioni */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }} startIcon={<TrendingUp />}>
              Lavori Consigliati per Te
            </Typography>
            {recommendations.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Nessuna raccomandazione disponibile.
              </Typography>
            ) : (
              <Stack spacing={2}>
                {recommendations.slice(0, 3).map((rec, index) => (
                  <Card key={index} sx={{ p: 2 }}>
                    <Typography variant="subtitle1">{rec.job.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {rec.job.description}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                      <Chip label={rec.job.category} size="small" />
                      <Chip label={`€${rec.job.pay}/h`} size="small" color="primary" />
                      <Chip 
                        label={`${Math.round(rec.match_score * 100)}% match`} 
                        size="small" 
                        color="success" 
                      />
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      Competenze in comune: {rec.common_skills.join(', ')}
                    </Typography>
                  </Card>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>

        {/* Candidature */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Le tue candidature</Typography>
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
                    <Chip 
                      label={app.status} 
                      color={app.status === 'accepted' ? 'success' : app.status === 'rejected' ? 'error' : 'default'}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Lavori Salvati */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Lavori Salvati</Typography>
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
        </Grid>

        {/* Notifiche */}
        <Grid item xs={12} md={6}>
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
              <Typography variant="body2" color="text.secondary">Nessuna notifica.</Typography>
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

      {/* Dialog per messaggi */}
      <Dialog open={messagesDialogOpen} onClose={() => setMessagesDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Messaggi</DialogTitle>
        <DialogContent>
          {conversations.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Nessuna conversazione disponibile.
            </Typography>
          ) : (
            <List>
              {conversations.map(conv => (
                <ListItem 
                  key={conv.id} 
                  button 
                  onClick={() => handleOpenMessages(conv)}
                  sx={{ border: '1px solid #ddd', mb: 1, borderRadius: 1 }}
                >
                  <ListItemText
                    primary={conv.job_title || 'Conversazione generale'}
                    secondary={`Ultimo messaggio: ${conv.last_message ? new Date(conv.last_message.created_at).toLocaleString() : 'Nessuno'}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMessagesDialogOpen(false)}>Chiudi</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog per conversazione specifica */}
      <Dialog open={selectedConversation !== null} onClose={() => setSelectedConversation(null)} maxWidth="md" fullWidth>
        <DialogTitle>
          Conversazione {selectedConversation?.job_title ? `per ${selectedConversation.job_title}` : ''}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ height: 400, overflow: 'auto', mb: 2 }}>
            {messages.map(msg => (
              <Box 
                key={msg.id} 
                sx={{ 
                  p: 1, 
                  mb: 1, 
                  bgcolor: msg.sender_username === JSON.parse(localStorage.getItem('user'))?.username ? 'primary.light' : 'grey.100',
                  borderRadius: 1,
                  textAlign: msg.sender_username === JSON.parse(localStorage.getItem('user'))?.username ? 'right' : 'left'
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {msg.sender_username}
                </Typography>
                <Typography variant="body1">{msg.content}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(msg.created_at).toLocaleString()}
                </Typography>
              </Box>
            ))}
          </Box>
          <TextField
            fullWidth
            placeholder="Scrivi un messaggio..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedConversation(null)}>Chiudi</Button>
          <Button onClick={handleSendMessage} variant="contained">Invia</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog per Lavori Salvati */}
      <Dialog open={savedJobsDialogOpen} onClose={() => setSavedJobsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>I Tuoi Lavori Salvati ({savedJobs.length})</DialogTitle>
        <DialogContent>
          {savedJobs.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              Non hai ancora salvato nessun lavoro.
              <br />
              <Button 
                component={Link} 
                to="/trovalavoro" 
                variant="contained" 
                sx={{ mt: 2 }}
                onClick={() => setSavedJobsDialogOpen(false)}
              >
                Cerca Lavori
              </Button>
            </Typography>
          ) : (
            <List>
              {savedJobs.map(saved => (
                <ListItem key={saved.id} sx={{ border: '1px solid #ddd', mb: 1, borderRadius: 1 }}>
                  <ListItemText
                    primary={
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {saved.job.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {saved.job.employer.username} • {saved.job.location}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {saved.job.description.length > 150 
                            ? `${saved.job.description.substring(0, 150)}...` 
                            : saved.job.description
                          }
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip label={saved.job.category} color="primary" size="small" />
                          <Chip 
                            label={`€${saved.job.pay}/ora`} 
                            color="success" 
                            size="small" 
                          />
                          <Typography variant="caption" color="text.secondary">
                            Salvato il {new Date(saved.job.created_at).toLocaleDateString()}
                          </Typography>
                        </Stack>
                      </Box>
                    }
                  />
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => handleViewJobDetails(saved.job)}
                  >
                    Vedi Dettagli
                  </Button>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSavedJobsDialogOpen(false)}>Chiudi</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog per Dettagli Job */}
      <Dialog open={jobDetailsDialogOpen} onClose={() => setJobDetailsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Dettagli Lavoro</DialogTitle>
        <DialogContent>
          {selectedJob && (
            <Box>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                {selectedJob.title}
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                  {selectedJob.employer.username}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Pubblicato il {new Date(selectedJob.created_at).toLocaleDateString()}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                  <Chip 
                    label={selectedJob.category} 
                    color="primary" 
                    icon={<Work />}
                  />
                  <Chip 
                    label={selectedJob.location} 
                    color="secondary"
                  />
                  <Chip 
                    label={`€${selectedJob.pay}/ora`} 
                    color="success"
                  />
                </Stack>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Descrizione
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {selectedJob.description}
                </Typography>
              </Box>

              {selectedJob.skills_required && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Competenze Richieste
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedJob.skills_required}
                  </Typography>
                </Box>
              )}

              <Box sx={{ 
                p: 2, 
                backgroundColor: '#f5f5f5', 
                borderRadius: 1,
                border: '1px solid #ddd'
              }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Informazioni Aggiuntive
                </Typography>
                <Stack direction="row" spacing={4}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Compenso
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      €{selectedJob.pay}/ora
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Luogo
                    </Typography>
                    <Typography variant="h6">
                      {selectedJob.location}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Categoria
                    </Typography>
                    <Typography variant="h6">
                      {selectedJob.category}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJobDetailsDialogOpen(false)}>Chiudi</Button>
          <Button 
            component={Link} 
            to="/trovalavoro" 
            variant="contained"
            onClick={() => setJobDetailsDialogOpen(false)}
          >
            Cerca Altri Lavori
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
