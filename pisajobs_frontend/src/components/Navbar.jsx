import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/PisaJobs.png'; // importa logo

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }} component={Link} to="/">
          <Box
            component="img"
            src={logo}
            alt="Logo Pisa Jobs"
            sx={{ height: 60, width: 70, mr: 1 }}
          />
          <Typography variant="h6">Pisa Jobs</Typography>
        </Box>

        <Box>
          {!user && (
            <>
              <Button component={Link} to="/login" color="inherit">Login</Button>
              <Button component={Link} to="/register" color="inherit">Registrati</Button>
            </>
          )}
          {user && (
            <>
              <Button component={Link} to={user.is_employer ? "/dashboard/employer" : "/dashboard/user"} color="inherit">
                Dashboard
              </Button>
              <Button component={Link} to="/" color="inherit">Logout</Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
