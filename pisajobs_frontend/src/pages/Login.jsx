import { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Login({ setUser }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.detail || 'Credenziali non valide');
        return;
      } 

      const data = await res.json();

      // Salva token
      localStorage.setItem('accessToken', data.access);
      localStorage.setItem('refreshToken', data.refresh);
      localStorage.setItem('token', data.access); // per compatibilità con Dashboard
      localStorage.setItem('user', JSON.stringify(data));

      // Passa utente al context/app
      if (setUser) setUser(data);

      // Redirect basato su tipo utente
      if (data.is_employer) {
        navigate('/dashboard/employer');
      } else {
        navigate('/dashboard/user');
      }
    } catch (err) {
      setError('Errore di rete o server non disponibile');
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
      <Paper sx={{ p: 4, width: 400 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>Accedi al tuo account</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth label="Username" name="username" onChange={handleChange} sx={{ mb: 2 }}
            required
          />
          <TextField
            fullWidth label="Password" type="password" name="password" onChange={handleChange} sx={{ mb: 3 }}
            required
          />
          <Button fullWidth type="submit" variant="contained">Login</Button>
        </form>
      </Paper>
    </Box>
  );
}
