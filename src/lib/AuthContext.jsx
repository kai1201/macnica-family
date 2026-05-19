import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // We are faking a logged-in user so your local UI works instantly
  const [user, setUser] = useState({ name: "Magical User", email: "user@magic.com" });
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  
  // Dummy functions so your buttons don't crash when clicked
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    console.log("User logged out locally");
  };

  const navigateToLogin = () => {
    console.log("Would navigate to login screen");
  };

  const checkUserAuth = async () => { return true; };
  const checkAppState = async () => { return true; };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings: false,
      authError: null,
      appPublicSettings: null,
      authChecked: true,
      logout,
      navigateToLogin,
      checkUserAuth,
      checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};