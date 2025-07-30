import React from 'react';
import { Clock, Database, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDatabase } from '../context/DatabaseContext';

const StatusBar = () => {
  const { connectionStatus, lastQuery, dbConfig } = useDatabase();

  return (
    <motion.footer
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-slate-700/50 px-6 py-3 shadow-lg"
    >
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2"
          >
            <div className="relative">
              <Database className="w-4 h-4" />
              {connectionStatus === 'connected' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full"
                >
                  <motion.div
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-full h-full bg-emerald-400 rounded-full"
                  />
                </motion.div>
              )}
            </div>
            <span>
              {connectionStatus === 'connected' 
                ? `Connected to ${dbConfig.database}@${dbConfig.host}` 
                : 'Not connected'
              }
            </span>
          </motion.div>
        </div>
        
        {lastQuery && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm rounded-full px-3 py-1 border border-gray-200/50 dark:border-slate-600/50"
          >
            <Clock className="w-4 h-4" />
            <span>
              Last query: {new Date(lastQuery.timestamp).toLocaleTimeString()} 
              ({lastQuery.executionTime})
            </span>
            <Zap className="w-3 h-3 text-yellow-500" />
          </motion.div>
        )}
      </div>
    </motion.footer>
  );
};

export default StatusBar;