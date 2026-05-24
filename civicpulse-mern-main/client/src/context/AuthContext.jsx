import { createContext, useContext, useEffect, useState } from 'react';
import { getMe, loginUser, registerUser } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Check if user is still logged in on page refresh
  useEffect(() => {
    const loadUser = async () => {
      const savedToken = localStorage.getItem('token');

      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await getMe();
        setUser(response.data.user);
        setToken(savedToken);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (credentials) => {
    const response = await loginUser(credentials);
    const { user: loggedInUser, token: authToken } = response.data;

    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(loggedInUser));

    setToken(authToken);
    setUser(loggedInUser);

    return response;
  };

  const register = async (userData) => {
    const response = await registerUser(userData);
    const { user: newUser, token: authToken } = response.data;

    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(newUser));

    setToken(authToken);
    setUser(newUser);

    return response;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    role: user?.role,
    isAdmin: user?.role === 'admin',
    isCitizen: user?.role === 'citizen',
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};
