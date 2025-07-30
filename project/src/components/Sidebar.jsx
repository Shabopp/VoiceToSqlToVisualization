import React, { useState } from 'react';
import { X, Server, User, Lock, Database, RefreshCw, Check, AlertCircle, ChevronDown, ChevronRight, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDatabase } from '../context/DatabaseContext';
import SchemaViewer from './SchemaViewer';
import toast from 'react-hot-toast';

const Sidebar = ({ isOpen, onClose }) => {
  const { 
    dbConfig, 
    updateConfig, 
    connectionStatus, 
    testConnection,
    schema 
  } = useDatabase();
  
  const [isSchemaOpen, setIsSchemaOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(true);

  const handleInputChange = (field, value) => {
    updateConfig({ [field]: value });
  };

  const handleTestConnection = async () => {
    const success = await testConnection();
    if (success) {
      toast.success('Database connection successful!');
    } else {
      toast.error('Failed to connect to database');
    }
  };

  const renderInputIcon = (type) => {
    const iconClass = "w-5 h-5 text-gray-400";
    switch (type) {
      case 'host': return <Server className={iconClass} />;
      case 'user': return <User className={iconClass} />;
      case 'password': return <Lock className={iconClass} />;
      case 'database': return <Database className={iconClass} />;
      default: return null;
    }
  };

  const renderStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Check className="w-5 h-5 text-emerald-500" />;
      case 'connecting':
        return <RefreshCw className="w-5 h-5 text-orange-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <RefreshCw className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isOpen ? 0 : -320,
        }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed lg:relative lg:translate-x-0 top-0 left-0 h-full w-80 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-slate-700/50 z-50 flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-purple-500/5 to-pink-500/5" />
        
        {/* Header */}
        <div className="relative z-10 p-6 border-b border-gray-200/50 dark:border-slate-700/50 lg:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Database className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Configuration
              </h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100/80 dark:hover:bg-slate-700/80 transition-all duration-200"
            >
              <X className="w-5 h-5 text-gray-500" />
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 p-6 space-y-6 overflow-y-auto scrollbar-hide">
          {/* Database Configuration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => setIsConfigOpen(!isConfigOpen)}
              className="flex items-center justify-between w-full text-left p-3 rounded-xl bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm border border-gray-200/50 dark:border-slate-600/50 hover:bg-white/70 dark:hover:bg-slate-700/70 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Database className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Database Setup
                </h3>
              </div>
              <motion.div
                animate={{ rotate: isConfigOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-5 h-5 text-gray-500" />
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {isConfigOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="space-y-4 overflow-hidden"
                >
                  {['host', 'user', 'password', 'database'].map((field, index) => (
                    <motion.div
                      key={field}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative group"
                    >
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                        {renderInputIcon(field)}
                      </div>
                      <input
                        type={field === 'password' ? 'password' : 'text'}
                        value={dbConfig[field]}
                        onChange={(e) => handleInputChange(field, e.target.value)}
                        className="w-full pl-12 pr-4 py-4 border border-gray-300/50 dark:border-slate-600/50 rounded-xl bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white dark:focus:bg-slate-700 transition-all duration-200 group-hover:border-gray-400/50 dark:group-hover:border-slate-500/50"
                        placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                    </motion.div>
                  ))}

                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleTestConnection}
                    disabled={connectionStatus === 'connecting'}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl transition-all duration-300 transform hover:shadow-lg disabled:scale-100 disabled:cursor-not-allowed relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative z-10 flex items-center gap-3">
                      {renderStatusIcon()}
                      Test Connection
                    </div>
                    {connectionStatus === 'connected' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center"
                      >
                        <Zap className="w-3 h-3 text-emerald-900" />
                      </motion.div>
                    )}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Schema Viewer */}
          {connectionStatus === 'connected' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setIsSchemaOpen(!isSchemaOpen)}
                className="flex items-center justify-between w-full text-left p-3 rounded-xl bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm border border-gray-200/50 dark:border-slate-600/50 hover:bg-white/70 dark:hover:bg-slate-700/70 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Database className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Database Schema
                  </h3>
                </div>
                <motion.div
                  animate={{ rotate: isSchemaOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {isSchemaOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="bg-white/30 dark:bg-slate-700/30 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-slate-600/50 p-4">
                      <SchemaViewer />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;