import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useCart } from './CartContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  // Add other user fields if necessary
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { clearCart } = useCart();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('auth-token');
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
            console.error('Failed to fetch user with stored token:', response.statusText);
          }
        } catch (error) {
          console.error('Error fetching current user:', error);
          localStorage.removeItem('auth-token');
          localStorage.removeItem('auth-user');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append('username', email); // FastAPI expects 'username'
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
      const token = data.access_token;

      if (!token) {
        throw new Error('Access token not received');
      }

      localStorage.setItem('auth-token', token);

      // Fetch user details
      const userResponse = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
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
      setUser(null);
      throw error; // Re-throw
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('auth-user');
    setUser(null);
    clearCart(); // Clear cart
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
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
