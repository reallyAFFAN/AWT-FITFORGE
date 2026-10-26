
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import api from '../services/api';

const AuthContext = createContext(null);

function normalizeUser(user) {
  if (!user) return null;

  return {
    ...user,
    id: String(user.id ?? user._id ?? ''),
    phone: user.phone || '',
    addresses: Array.isArray(user.addresses)
      ? user.addresses
      : [],
  };
}

function getSavedUser() {
  try {
    const savedUser = localStorage.getItem('fit-forge-user');
    return savedUser ? normalizeUser(JSON.parse(savedUser)) : null;
  } catch {
    return null;
  }
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(getSavedUser);
  const [isLoadingUser, setIsLoadingUser] = useState(
    () => Boolean(localStorage.getItem('fit-forge-token'))
  );

  useEffect(() => {
    if (user) {
      localStorage.setItem('fit-forge-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('fit-forge-user');
    }
  }, [user]);

  // Verify the saved token and refresh the user's profile.
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const token = localStorage.getItem('fit-forge-token');

      if (!token) {
        setIsLoadingUser(false);
        return;
      }

      try {
        const response = await api.get('/users/profile');

        if (!cancelled) {
          setUser(normalizeUser(response.data.user));
        }
      } catch {
        if (!cancelled) {
          localStorage.removeItem('fit-forge-token');
          localStorage.removeItem('fit-forge-user');
          setUser(null);
        }
      } finally {
        if (!cancelled) setIsLoadingUser(false);
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });

      const { token, user: loggedInUser } = response.data;

      if (!token || !loggedInUser) {
        return {
          success: false,
          message: 'The server returned an invalid login response.',
        };
      }

      localStorage.setItem('fit-forge-token', token);
      localStorage.setItem(
        'fit-forge-user',
        JSON.stringify(normalizeUser(loggedInUser))
      );

      setUser(normalizeUser(loggedInUser));

      // Remove the old browser-only account after successful backend login.
      localStorage.removeItem('fit-forge-account');

      return {
        success: true,
        message: response.data.message || 'Login successful.',
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'Unable to log in. Check your connection and try again.',
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      await api.post('/auth/register', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      // The current backend registration endpoint does not return a JWT.
      // Sign in after registration to obtain one.
      return await login(email, password);
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'Unable to create your account. Please try again.',
      };
    }
  };

  const updateAccount = async (updates) => {
    if (!user) {
      return {
        success: false,
        message: 'Please sign in first.',
      };
    }

    try {
      const response = await api.put('/users/profile', updates);
      const updatedUser = normalizeUser(response.data.user);

      setUser(updatedUser);

      return { success: true, user: updatedUser };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'Unable to update your profile.',
      };
    }
  };

  const addAddress = async (address) => {
    try {
      const response = await api.post('/users/addresses', address);

      // Refresh the complete profile so address data stays in sync.
      const profileResponse = await api.get('/users/profile');
      const updatedUser = normalizeUser(profileResponse.data.user);

      setUser(updatedUser);

      return {
        success: true,
        address: response.data.address,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'Unable to save the address.',
      };
    }
  };

  const updateAddress = async (addressId, updatedAddress) => {
    try {
      await api.put(`/users/addresses/${addressId}`, updatedAddress);
      const response = await api.get('/users/profile');
      setUser(normalizeUser(response.data.user));

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'Unable to update the address.',
      };
    }
  };

  const deleteAddress = async (addressId) => {
    try {
      await api.delete(`/users/addresses/${addressId}`);
      const response = await api.get('/users/profile');
      setUser(normalizeUser(response.data.user));

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'Unable to delete the address.',
      };
    }
  };

  const setDefaultAddress = async (addressId) => {
    try {
      await api.put(`/users/addresses/${addressId}`, {
        isDefault: true,
      });

      const response = await api.get('/users/profile');
      setUser(normalizeUser(response.data.user));

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'Unable to update the default address.',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('fit-forge-token');
    localStorage.removeItem('fit-forge-account');
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isLoadingUser,
    login,
    register,
    logout,
    updateAccount,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}

export default AuthProvider;
