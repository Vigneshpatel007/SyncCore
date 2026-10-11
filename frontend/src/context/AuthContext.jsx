import { createContext, useContext, useState } from 'react';
import api, { TOKEN_KEY } from '../api/axios';

// Context = a global box any component can read, so we don't pass `user` through props at every level.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Lazy initial state: restore the session if the page is refreshed
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('synccore_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (username, password) => {
    const { data } = await api.post('/auth/login', { username, password });
    localStorage.setItem(TOKEN_KEY, data.token);                       // token for the interceptor
    const profile = { username: data.username, role: data.role };
    localStorage.setItem('synccore_user', JSON.stringify(profile));    // profile for the UI
    setUser(profile);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('synccore_user');
    setUser(null);
  };

  const value = { user, login, logout, isAdmin: user?.role === 'ADMIN' };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
