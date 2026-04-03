import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

interface User {
  _id: string;
  name: string;
  email: string;
  platform: string;
  role: 'worker' | 'admin';
}

type LoginMode = 'worker' | 'admin';

interface AuthContextType {
  user: User | null;
  token: string | null;
  locationCity: string;
  login: (userData: User, token: string, mode?: LoginMode) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [locationCity, setLocationCity] = useState<string>('Delhi');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const storedToken = localStorage.getItem('earnkavach_token');
    const storedUser = localStorage.getItem('earnkavach_user');
    
    if (storedToken && storedUser) {
      try {
        const decoded: any = jwtDecode(storedToken);
        if (decoded.exp * 1000 < Date.now()) {
            logout();
        } else {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        logout();
      }
    }
    
    // Automatically fetch user's location via IP for realistic dashboard context
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
         if (data.city) setLocationCity(data.city);
      })
      .catch(console.error);

  }, []);

  const login = (userData: User, tokenData: string, mode?: LoginMode) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem('earnkavach_token', tokenData);
    localStorage.setItem('earnkavach_user', JSON.stringify(userData));
    if ((mode || userData.role) === 'admin') {
      navigate('/admin');
      return;
    }
    navigate('/dashboard');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('earnkavach_token');
    localStorage.removeItem('earnkavach_user');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, locationCity, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
