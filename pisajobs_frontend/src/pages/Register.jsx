import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    is_employer: false,
    skills: '',
    experience: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    if (type === 'radio') {
      setForm({ ...form, is_employer: value === 'true' });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setError(
          errorData.detail ||
          Object.values(errorData)[0]?.[0] ||
          'Errore durante la registrazione'
        );
        return;
      }

      const data = await res.json();
      console.log('Registration successful:', data);

      // Mostra messaggio di successo
      setSuccess('Registrazione avvenuta con successo! Verrai reindirizzato...');

      // Aspetta 2 secondi, poi naviga
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      setError('Errore di rete o server non disponibile');
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
      <Paper sx={{ p: 4, width: 400 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>Crea un account</Typography>

        {/* Alert messaggi */}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth label="Username" name="username" onChange={handleChange}
            sx={{ mb: 2 }} required
          />
          <TextField
            fullWidth label="Email" name="email" onChange={handleChange}
            sx={{ mb: 2 }} type="email" required
          />
          <TextField
            fullWidth label="Password" type="password" name="password" onChange={handleChange}
            sx={{ mb: 2 }} required
          />
            <TextField
            fullWidth label="Conferma Password" type="password" name="password" onChange={handleChange}
            sx={{ mb: 2 }} required
          />

          <FormControl component="fieldset" sx={{ mb: 2 }}>
            <FormLabel>Seleziona tipo utente</FormLabel>
            <RadioGroup row name="is_employer" onChange={handleChange} defaultValue="false">
              <FormControlLabel value="false" control={<Radio />} label="Studente / Lavoratore" />
              <FormControlLabel value="true" control={<Radio />} label="Employer" />
            </RadioGroup>
          </FormControl>

          <TextField
            fullWidth label="Skills (opzionale)" name="skills" onChange={handleChange}
            sx={{ mb: 2 }} multiline rows={2}
          />
          <TextField
            fullWidth label="Esperienza (opzionale)" name="experience" onChange={handleChange}
            sx={{ mb: 3 }} multiline rows={2}
          />

          <Button fullWidth type="submit" variant="contained">Registrati</Button>
        </form>
      </Paper>
    </Box>
  );
}
