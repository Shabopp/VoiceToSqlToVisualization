import React from 'react';
import { Menu, Database, Sun, Moon, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useDatabase } from '../context/DatabaseContext';

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { connectionStatus } = useDatabase();

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-emerald-500 shadow-emerald-500/50';
      case 'connecting': return 'bg-orange-500 shadow-orange-500/50 animate-pulse';
      case 'error': return 'bg-red-500 shadow-red-500/50';
      default: return 'bg-gray-400 shadow-gray-400/50';
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-700/50 px-6 py-4 flex items-center justify-between shadow-lg"
    >
      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl hover:bg-gray-100/80 dark:hover:bg-slate-700/80 transition-all duration-200 lg:hidden backdrop-blur-sm"
        >
          <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </motion.button>
        
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-30" />
            <div className="relative p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl">
              <Database className="w-6 h-6 text-white" />
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg"
            >
              <Zap className="w-2 h-2 text-yellow-900" />
            </motion.div>
          </motion.div>
          
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            >
              VOCALATICS
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-gray-500 dark:text-gray-400"
            >
              Speak. Query. Visualize
            </motion.p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-slate-700/60 backdrop-blur-sm rounded-full border border-gray-200/50 dark:border-slate-600/50 shadow-lg"
        >
          <motion.div
            animate={{ scale: connectionStatus === 'connecting' ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 1, repeat: connectionStatus === 'connecting' ? Infinity : 0 }}
            className={`w-3 h-3 rounded-full shadow-lg ${getStatusColor()}`}
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
            {connectionStatus}
          </span>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.05, rotate: 180 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleDarkMode}
          className="p-3 rounded-xl bg-white/60 dark:bg-slate-700/60 backdrop-blur-sm hover:bg-gray-100/80 dark:hover:bg-slate-600/80 transition-all duration-300 border border-gray-200/50 dark:border-slate-600/50 shadow-lg"
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600" />
          )}
        </motion.button>
      </div>
    </motion.header>
  );
};

export default Header;