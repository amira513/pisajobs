import  { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Chip, 
  Stack, 
  CircularProgress, 
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import {Favorite, FavoriteBorder, Send } from "@mui/icons-material";

const ZONE_PISA = [
  "Tutti",
  "Centro",
  "San Marco",
  "Porta a Mare",
  "Santa Maria",
  "Ospedaletto",
  "San Giusto",
];

const TrovaLavoro = () => {
  const [keyword, setKeyword] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("tutti");
  const [zonaFiltro, setZonaFiltro] = useState("Tutti");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchJobs();
    if (token) {
      fetchUserData();
    }
  }, []);

  useEffect(() => {
    filterJobs();
  }, [keyword, categoriaFiltro, zonaFiltro, jobs]);

  const fetchJobs = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/jobs/');
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      } else {
        setError('Errore nel caricamento dei job');
      }
    } catch (err) {
      setError('Errore nel caricamento dei job');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const [savedRes, appliedRes] = await Promise.all([
        fetch('http://localhost:8000/api/saved-jobs/', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('http://localhost:8000/api/applications/', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (savedRes.ok) {
        const saved = await savedRes.json();
        setSavedJobs(saved.map(item => item.job.id));
      }

      if (appliedRes.ok) {
        const applied = await appliedRes.json();
        setAppliedJobs(applied.map(item => item.job.id));
      }
    } catch (err) {
      console.error('Errore nel caricamento dei dati utente:', err);
    }
  };

  const filterJobs = () => {
    let risultati = [...jobs];

    if (keyword.trim() !== "") {
      risultati = risultati.filter(
        (job) =>
          job.title.toLowerCase().includes(keyword.toLowerCase()) ||
          job.description.toLowerCase().includes(keyword.toLowerCase()) ||
          (job.skills_required && job.skills_required.toLowerCase().includes(keyword.toLowerCase()))
      );
    }
    if (categoriaFiltro !== "tutti") {
      risultati = risultati.filter((job) => job.category === categoriaFiltro);
    }
    if (zonaFiltro !== "Tutti") {
      risultati = risultati.filter((job) => job.location === zonaFiltro);
    }

    setJobs(risultati);
  };

  const handleSaveJob = async (jobId) => {
    if (!token) {
      alert('Devi essere loggato per salvare i job');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/jobs/${jobId}/save/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setSavedJobs([...savedJobs, jobId]);
      } else {
        const error = await response.json();
        alert(error.detail || 'Errore nel salvataggio');
      }
    } catch (err) {
      alert('Errore nel salvataggio');
    }
  };

  const handleUnsaveJob = async (jobId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/jobs/${jobId}/unsave/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setSavedJobs(savedJobs.filter(id => id !== jobId));
      }
    } catch (err) {
      alert('Errore nella rimozione');
    }
  };

  const handleApplyToJob = async () => {
    if (!token) {
      alert('Devi essere loggato per candidarti');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/jobs/${selectedJob.id}/apply/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setAppliedJobs([...appliedJobs, selectedJob.id]);
        setApplyDialogOpen(false);
        alert('Candidatura inviata con successo!');
      } else {
        const error = await response.json();
        alert(error.detail || 'Errore nell\'invio della candidatura');
      }
    } catch (err) {
      alert('Errore nell\'invio della candidatura');
    }
  };

  const getUniqueCategories = () => {
    const categories = jobs.map(job => job.category).filter(Boolean);
    return [...new Set(categories)];
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, margin: "0 auto", padding: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
        Trova Lavoro su PisaJobs
      </Typography>

      <Stack spacing={2} sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Cerca per titolo, descrizione o competenze..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          variant="outlined"
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <FormControl fullWidth>
            <InputLabel>Categoria</InputLabel>
            <Select
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
            >
              <MenuItem value="tutti">Tutte le categorie</MenuItem>
              {getUniqueCategories().map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Zona</InputLabel>
            <Select
              value={zonaFiltro}
              onChange={(e) => setZonaFiltro(e.target.value)}
            >
              {ZONE_PISA.map((zona) => (
                <MenuItem key={zona} value={zona}>
                  {zona}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Stack>

      <Typography variant="h6" sx={{ mb: 2 }}>
        {jobs.length} offerte trovate
      </Typography>

      {jobs.length === 0 ? (
        <Alert severity="info">Nessuna offerta trovata con i filtri selezionati.</Alert>
      ) : (
        <Stack spacing={2}>
          {jobs.map((job) => (
            <Card key={job.id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {job.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {job.description}
                </Typography>
                
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <Chip label={job.category} size="small" />
                  <Chip label={job.location} size="small" />
                  <Chip label={`€${job.pay}/h`} size="small" color="primary" />
                </Stack>

                {job.skills_required && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Competenze richieste:</strong> {job.skills_required}
                  </Typography>
                )}

                <Typography variant="caption" color="text.secondary">
                  Pubblicato il {new Date(job.created_at).toLocaleDateString()} da {job.employer}
                </Typography>
              </CardContent>
              
              <CardActions>
                {token && !appliedJobs.includes(job.id) && (
                  <Button
                    variant="contained"
                    startIcon={<Send />}
                    onClick={() => {
                      setSelectedJob(job);
                      setApplyDialogOpen(true);
                    }}
                  >
                    Candidati
                  </Button>
                )}
                
                {appliedJobs.includes(job.id) && (
                  <Chip label="Candidatura inviata" color="success" />
                )}

                {token && (
                  <Button
                    startIcon={savedJobs.includes(job.id) ? <Favorite /> : <FavoriteBorder />}
                    onClick={() => 
                      savedJobs.includes(job.id) 
                        ? handleUnsaveJob(job.id) 
                        : handleSaveJob(job.id)
                    }
                    color={savedJobs.includes(job.id) ? "error" : "default"}
                  >
                    {savedJobs.includes(job.id) ? "Rimuovi" : "Salva"}
                  </Button>
                )}
              </CardActions>
            </Card>
          ))}
        </Stack>
      )}

      {/* Dialog per candidatura */}
      <Dialog open={applyDialogOpen} onClose={() => setApplyDialogOpen(false)}>
        <DialogTitle>Candidati per {selectedJob?.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Sei sicuro di voler inviare la tua candidatura per questo lavoro?
          </Typography>
          {selectedJob && (
            <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="subtitle2">{selectedJob.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedJob.description}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApplyDialogOpen(false)}>Annulla</Button>
          <Button onClick={handleApplyToJob} variant="contained">
            Invia Candidatura
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TrovaLavoro;
