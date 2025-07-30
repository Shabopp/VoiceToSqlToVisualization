import React, { createContext, useContext, useState } from 'react';
import toast from 'react-hot-toast';

const DatabaseContext = createContext();

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};

export const DatabaseProvider = ({ children }) => {
  const [dbConfig, setDbConfig] = useState({
    host: '',
    user: '',
    password: '',
    database: '',
  });
  
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [schema, setSchema] = useState(null);
  const [lastQuery, setLastQuery] = useState(null);
  const [queryResults, setQueryResults] = useState(null);

  const updateConfig = (newConfig) => {
    setDbConfig(prev => ({ ...prev, ...newConfig }));
  };

  const testConnection = async () => {
    if (!dbConfig.host || !dbConfig.user || !dbConfig.database) {
      toast.error('Please fill in all required database fields');
      return false;
    }

    setConnectionStatus('connecting');
    try {
      const response = await fetch('http://localhost:5000/set-db-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dbConfig),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Connection failed');
      }

      const result = await response.text();
      console.log('✅ Connection response:', result);
      
      setConnectionStatus('connected');
      toast.success('Database connection successful!');
      return true;
    } catch (error) {
      console.error('❌ Connection error:', error);
      setConnectionStatus('error');
      toast.error('Failed to connect: ' + error.message);
      return false;
    }
  };

  const fetchSchema = async () => {
    if (!dbConfig.host || connectionStatus !== 'connected') {
      console.log('❌ Cannot fetch schema - not connected');
      return null;
    }
    
    try {
      const response = await fetch('http://localhost:5000/schema-mermaid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dbConfig }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch schema');
      }

      const data = await response.json();
      console.log('✅ Schema fetched:', data);
      
      setSchema(data.mermaid);
      return data.mermaid;
    } catch (error) {
      console.error('❌ Schema fetch error:', error);
      toast.error('Failed to load database schema: ' + error.message);
      return null;
    }
  };

  return (
    <DatabaseContext.Provider value={{
      dbConfig,
      updateConfig,
      connectionStatus,
      setConnectionStatus,
      testConnection,
      schema,
      setSchema,
      fetchSchema,
      lastQuery,
      setLastQuery,
      queryResults,
      setQueryResults,
    }}>
      {children}
    </DatabaseContext.Provider>
  );
};