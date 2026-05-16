import { useState, useEffect } from 'react';
import { Auth } from './features/auth/Auth';
import { Dashboard } from './features/leads/Dashboard.tsx';
interface UserState {
  name: string;
  email: string;
  role: string;
}

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token')); // [cite: 40]
  const [user, setUser] = useState<UserState | null>(null);

  // Check storage on boot to preserve logged-in sessions automatically
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.clear();
      }
    }
  }, []);

  const handleAuthSuccess = (userToken: string, userData: UserState) => {
    localStorage.setItem('token', userToken); // [cite: 40]
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(userToken);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
  };

  // 1. Guard Clause: If the user is unauthenticated, show the Auth Portal screen deck [cite: 35]
  if (!token || !user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  // 2. Main Workspace Entry: Launch the interactive lead management database matrix [cite: 35, 44]
  return <Dashboard user={user} onLogout={handleLogout} />;
}

export default App;