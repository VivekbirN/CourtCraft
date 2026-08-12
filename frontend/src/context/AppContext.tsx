import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserSummary {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN';
}

interface AppContextType {
  token: string | null;
  user: UserSummary | null;
  login: (token: string, user: UserSummary) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<UserSummary | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (newToken: string, newUser: UserSummary) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  useEffect(() => {
    if (!token) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [token]);

  return (
    <AppContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        isAuthenticated: !!token,
        isAdmin: user?.role === 'ADMIN',
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
