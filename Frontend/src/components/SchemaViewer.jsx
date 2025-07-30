import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Eye, EyeOff, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import mermaid from 'mermaid';
import { useDatabase } from '../context/DatabaseContext';

const SchemaViewer = () => {
  const [diagram, setDiagram] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [animateBoxes, setAnimateBoxes] = useState(false);
  const diagramRef = useRef(null);
  const { dbConfig, connectionStatus, schema, fetchSchema } = useDatabase();

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
      themeVariables: {
        primaryColor: '#3b82f6',
        primaryTextColor: document.documentElement.classList.contains('dark') ? '#e2e8f0' : '#374151',
        primaryBorderColor: '#6366f1',
        lineColor: '#6b7280',
        background: 'transparent',
      },
    });
    
    if (connectionStatus === 'connected') {
      loadSchema();
    }
  }, [dbConfig, connectionStatus]);

  const loadSchema = async () => {
    if (!dbConfig.host || connectionStatus !== 'connected') return;
    
    setIsLoading(true);
    try {
      const mermaidDiagram = await fetchSchema();
      if (mermaidDiagram) {
        setDiagram(mermaidDiagram);
        setAnimateBoxes(true);
      }
    } catch (error) {
      console.error('Failed to fetch schema:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (diagram && diagramRef.current && isVisible) {
      try {
        mermaid.parse(diagram);
        mermaid.render('schema-diagram', diagram).then(({ svg }) => {
          if (diagramRef.current) {
            diagramRef.current.innerHTML = svg;
            
            // Animate the diagram elements
            if (animateBoxes) {
              const boxes = diagramRef.current.querySelectorAll('.node');
              boxes.forEach((box, index) => {
                box.style.opacity = '0';
                box.style.transform = 'scale(0.8)';
                setTimeout(() => {
                  box.style.transition = 'all 0.5s ease-out';
                  box.style.opacity = '1';
                  box.style.transform = 'scale(1)';
                }, index * 200);
              });
              
              // Animate connections after boxes
              const edges = diagramRef.current.querySelectorAll('.edgePath');
              edges.forEach((edge, index) => {
                edge.style.opacity = '0';
                setTimeout(() => {
                  edge.style.transition = 'opacity 0.5s ease-out';
                  edge.style.opacity = '1';
                }, (boxes.length * 200) + (index * 100));
              });
              
              setAnimateBoxes(false);
            }
          }
        });
      } catch (error) {
        console.error('Mermaid rendering error:', error);
      }
    }
  }, [diagram, isVisible, animateBoxes]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-500" />
          <h4 className="font-medium text-gray-900 dark:text-white">ER Diagram</h4>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsVisible(!isVisible)}
            className="p-2 hover:bg-gray-100/80 dark:hover:bg-slate-600/80 rounded-lg transition-all duration-200"
          >
            {isVisible ? (
              <EyeOff className="w-4 h-4 text-gray-500" />
            ) : (
              <Eye className="w-4 h-4 text-gray-500" />
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadSchema}
            disabled={isLoading || connectionStatus !== 'connected'}
            className="p-2 hover:bg-gray-100/80 dark:hover:bg-slate-600/80 rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white/50 dark:bg-slate-600/50 backdrop-blur-sm rounded-xl p-4 min-h-[200px] overflow-auto border border-gray-200/50 dark:border-slate-500/50"
          >
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-48 space-y-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
                />
                <p className="text-gray-500 dark:text-gray-400 text-sm">Loading schema...</p>
              </div>
            ) : diagram ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                ref={diagramRef}
                className="schema-diagram min-h-[200px] flex items-center justify-center"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-48 space-y-3">
                <Database className="w-12 h-12 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400 text-center">
                  {connectionStatus === 'connected' ? 'No schema data available' : 'Connect to database to view schema'}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SchemaViewer;