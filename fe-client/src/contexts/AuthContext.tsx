import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useCart } from './CartContext';
import { bookwormApi } from '@/services/bookwormApi'; // Import the API service

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth-token')); // Initialize token state
  const [isLoading, setIsLoading] = useState(true);
  const { clearCart } = useCart();

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const userData: User = await response.json();
            setUser(userData);
          } else {
            // Token invalid/expired
            localStorage.removeItem('auth-token');
            localStorage.removeItem('auth-user');
            setToken(null);
            setUser(null);
            console.error('Failed to fetch user with stored token:', response.statusText);
          }
        } catch (error) {
          console.error('Error fetching current user:', error);
          localStorage.removeItem('auth-token');
          localStorage.removeItem('auth-user');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [token]); // Re-run if token changes externally (unlikely here)

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await fetch(`${API_BASE_URL}/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Invalid credentials or server error' }));
        throw new Error(errorData.detail || `Login failed: ${response.statusText}`);
      }

      const data = await response.json();
      const receivedToken = data.access_token;

      if (!receivedToken) {
        throw new Error('Access token not received');
      }

      localStorage.setItem('auth-token', receivedToken);
      setToken(receivedToken); 

      const userResponse = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${receivedToken}`, // Use received token
        },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user details after login');
      }

      const userData: User = await userResponse.json();
      setUser(userData);
      localStorage.setItem('auth-user', JSON.stringify(userData)); // Store user data

    } catch (error) {
      console.error('Login error:', error);
      localStorage.removeItem('auth-token');
      localStorage.removeItem('auth-user');
      setToken(null); // Clear token on error
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => { 
    if (token) {
      try {
        await bookwormApi.logout(token);
        console.log('Successfully logged out on backend.');
      } catch (error) {
        console.error('Backend logout failed:', error);
      }
    }
    localStorage.removeItem('auth-token');
    localStorage.removeItem('auth-user');
    localStorage.removeItem('auth-refresh-token');
    setToken(null);
    setUser(null);
    clearCart();
  };

  // TODO: Implement token refresh logic if needed
  const refreshToken = async () => { 
    if (token) {
      bookwormApi.refreshToken(token)
        .then((data) => {
          const newToken = data.access_token;
          setToken(newToken);
          localStorage.setItem('auth-token', newToken);
        })
        .catch((error) => {
          console.error('Token refresh failed:', error);
          logout(); // refresh fails
        });
    }
  }

  const value = {
    user,
    isAuthenticated: !!user && !!token,
    isLoading,
    token,
    login,
    logout,
    refreshToken, // Add if implemented
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// useAuth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
