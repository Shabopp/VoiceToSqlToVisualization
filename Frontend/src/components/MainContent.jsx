import React, { useState, useEffect, useRef } from 'react';
import { Database, ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';
import { motion } from 'framer-motion';
import mermaid from 'mermaid';
import VoiceRecorder from './VoiceRecorder';
import QueryResults from './QueryResults';
import { useDatabase } from '../context/DatabaseContext';

const DatabaseSchema = () => {
  const { connectionStatus, fetchSchema } = useDatabase();
  const [diagram, setDiagram] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const diagramRef = useRef(null);
  const containerRef = useRef(null);

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
  }, [connectionStatus]);

  const loadSchema = async () => {
    if (connectionStatus !== 'connected') return;
    
    setIsLoading(true);
    try {
      const mermaidDiagram = await fetchSchema();
      if (mermaidDiagram) {
        setDiagram(mermaidDiagram);
      }
    } catch (error) {
      console.error('Failed to fetch schema:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (diagram && diagramRef.current) {
      try {
        mermaid.parse(diagram);
        mermaid.render('full-schema-diagram', diagram).then(({ svg }) => {
          if (diagramRef.current) {
            diagramRef.current.innerHTML = svg;
          }
        });
      } catch (error) {
        console.error('Mermaid rendering error:', error);
      }
    }
  }, [diagram]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.1));
  };

  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.1, Math.min(3, prev * delta)));
  };

  if (connectionStatus !== 'connected') {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Database className="w-16 h-16 text-gray-400 mx-auto" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Database Not Connected
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Connect to a database to view the schema diagram
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Controls */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Database Schema
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleZoomOut}
              className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </motion.button>
            <span className="text-sm text-gray-600 dark:text-gray-300 min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleZoomIn}
              className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReset}
              className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadSchema}
              disabled={isLoading}
              className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white transition-colors"
              title="Refresh Schema"
            >
              <Maximize2 className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Schema Diagram */}
      <div 
        className="flex-1 relative overflow-hidden bg-gray-50 dark:bg-slate-900"
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"
              />
              <p className="text-gray-500 dark:text-gray-400">Loading schema...</p>
            </div>
          </div>
        ) : diagram ? (
          <div 
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.1s ease-out'
            }}
          >
            <div
              ref={diagramRef}
              className="schema-diagram bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-slate-700"
              style={{ 
                minWidth: '800px',
                minHeight: '600px',
                userSelect: 'none'
              }}
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4">
              <Database className="w-16 h-16 text-gray-400 mx-auto" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  No Schema Available
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Unable to load database schema
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MainContent = () => {
  const { queryResults, connectionStatus } = useDatabase();
  const [activeTab, setActiveTab] = useState('recorder');

  const tabs = [
    { id: 'recorder', label: 'Voice Query', component: VoiceRecorder },
    ...(queryResults ? [{ id: 'results', label: 'Results', component: QueryResults }] : []),
    ...(connectionStatus === 'connected' ? [{ id: 'schema', label: 'Database Schema', component: DatabaseSchema }] : []),
  ];

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-slate-900">
      {/* Tab Navigation */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="px-6 py-4">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-2 text-sm font-medium border-b-2 transition-colors duration-200 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.id === 'schema' && <Database className="w-4 h-4" />}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className={`flex-1 ${activeTab === 'schema' ? 'overflow-hidden' : 'overflow-auto'}`}>
        {tabs.find(tab => tab.id === activeTab) && 
          React.createElement(tabs.find(tab => tab.id === activeTab).component)
        }
      </div>
    </main>
  );
};

export default MainContent;