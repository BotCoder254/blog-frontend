import React, { createContext, useContext, useReducer, useEffect } from 'react';
import apiService from '../services/api';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: !!action.payload };
    case 'SET_TENANT':
      return { ...state, currentTenant: action.payload };
    case 'SET_TENANTS':
      return { ...state, tenants: action.payload };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false, currentTenant: null, tenants: [] };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

const initialState = {
  user: null,
  isAuthenticated: false,
  currentTenant: null,
  tenants: [],
  loading: true,
  error: null,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const user = await apiService.getCurrentUser();
        dispatch({ type: 'SET_USER', payload: user });
        
        if (user.tenants?.length > 0) {
          dispatch({ type: 'SET_TENANTS', payload: user.tenants });
          dispatch({ type: 'SET_TENANT', payload: user.currentTenant || user.tenants[0] });
        }
      }
    } catch (error) {
      localStorage.removeItem('authToken');
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await apiService.login(credentials);
      
      localStorage.setItem('authToken', response.token);
      dispatch({ type: 'SET_USER', payload: response.user });
      
      if (response.user.tenants?.length > 0) {
        dispatch({ type: 'SET_TENANTS', payload: response.user.tenants });
        dispatch({ type: 'SET_TENANT', payload: response.user.currentTenant || response.user.tenants[0] });
      }
      
      return response;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await apiService.register(userData);
      
      localStorage.setItem('authToken', response.token);
      dispatch({ type: 'SET_USER', payload: response.user });
      
      if (response.user.tenants?.length > 0) {
        dispatch({ type: 'SET_TENANTS', payload: response.user.tenants });
        dispatch({ type: 'SET_TENANT', payload: response.user.currentTenant || response.user.tenants[0] });
      }
      
      return response;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createTenant = async (tenantData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await apiService.createTenant(tenantData);
      
      localStorage.setItem('authToken', response.token);
      dispatch({ type: 'SET_USER', payload: response.user });
      
      if (response.user.tenants?.length > 0) {
        dispatch({ type: 'SET_TENANTS', payload: response.user.tenants });
        dispatch({ type: 'SET_TENANT', payload: response.user.currentTenant || response.user.tenants[0] });
      }
      
      return response;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      dispatch({ type: 'LOGOUT' });
    }
  };

  const switchTenant = async (tenantId) => {
    try {
      await apiService.switchTenant(tenantId);
      const tenant = state.tenants.find(t => t.id === tenantId);
      dispatch({ type: 'SET_TENANT', payload: tenant });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const value = {
    ...state,
    login,
    register,
    createTenant,
    logout,
    switchTenant,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};