import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from '../axiosConfig';

const MaintenanceContext = createContext();

export const MaintenanceProvider = ({ children }) => {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch initial maintenance mode status
    const fetchMaintenanceStatus = async () => {
      try {
        const response = await axios.get('/maintenance/status');
        setIsMaintenanceMode(response.data.isMaintenanceMode);
        setError(null);
      } catch (error) {
        console.error('Error fetching maintenance status:', error);
        setError('Failed to fetch maintenance status');
      }
    };
    fetchMaintenanceStatus();
  }, []);

  const toggleMaintenanceMode = async () => {
    try {
      const response = await axios.post('/maintenance/toggle');
      setIsMaintenanceMode(response.data.isMaintenanceMode);
      setError(null);
    } catch (error) {
      console.error('Error toggling maintenance mode:', error);
      setError('Failed to toggle maintenance mode. Please try again.');
      // Revert the local state if the API call fails
      setIsMaintenanceMode(prev => !prev);
    }
  };

  return (
    <MaintenanceContext.Provider value={{ isMaintenanceMode, toggleMaintenanceMode, error }}>
      {children}
    </MaintenanceContext.Provider>
  );
};

export const useMaintenance = () => {
  const context = useContext(MaintenanceContext);
  if (!context) {
    throw new Error('useMaintenance must be used within a MaintenanceProvider');
  }
  return context;
}; 