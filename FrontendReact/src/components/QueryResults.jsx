import React, { useState } from 'react';
import { BarChart3, Table2, FileText, Download, Maximize2, PieChart, TrendingUp, ScatterChart as Scatter, Radar, Map, Grid3X3, TreePine, Activity, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import DataVisualization from './DataVisualization';
import { useDatabase } from '../context/DatabaseContext';

const QueryResults = () => {
  const { queryResults, lastQuery } = useDatabase();
  const [activeView, setActiveView] = useState('chart');
  const [selectedVizType, setSelectedVizType] = useState(null);
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  if (!queryResults) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-8 text-center"
      >
        <div className="max-w-md mx-auto">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center"
          >
            <BarChart3 className="w-8 h-8 text-gray-400" />
          </motion.div>
          <p className="text-gray-500 dark:text-gray-400">No query results to display</p>
        </div>
      </motion.div>
    );
  }

  const { sql, data, vizType, executionTime, rowCount, explanation } = queryResults;
  const currentVizType = selectedVizType || vizType;

  const views = [
    { id: 'chart', label: 'Chart View', icon: BarChart3 },
    { id: 'table', label: 'Table View', icon: Table2 },
    { id: 'sql', label: 'SQL Query', icon: FileText },
  ];

  const vizTypes = [
    { id: 'bar', label: 'Bar Chart', icon: BarChart3, description: 'Compare values across categories' },
    { id: 'line', label: 'Line Chart', icon: TrendingUp, description: 'Show trends over time' },
    { id: 'pie', label: 'Pie Chart', icon: PieChart, description: 'Show proportions of a whole' },
    { id: 'doughnut', label: 'Doughnut', icon: PieChart, description: 'Pie chart with center space' },
    { id: 'scatter', label: 'Scatter Plot', icon: Scatter, description: 'Show correlation between variables' },
    { id: 'bubble', label: 'Bubble Chart', icon: Scatter, description: 'Three-dimensional scatter plot' },
    { id: 'radar', label: 'Radar Chart', icon: Radar, description: 'Compare multiple variables' },
    { id: 'polarArea', label: 'Polar Area', icon: Radar, description: 'Circular area chart' },
    { id: 'funnel', label: 'Funnel Chart', icon: TrendingUp, description: 'Show process stages' },
    { id: 'kpi', label: 'KPI Cards', icon: Activity, description: 'Key performance indicators' },
    { id: 'geomap', label: 'Geographic Map', icon: Map, description: 'Plot data on world map' },
    { id: 'heatmap', label: 'Heatmap', icon: Grid3X3, description: 'Show data density with colors' },
    { id: 'treemap', label: 'Tree Map', icon: TreePine, description: 'Hierarchical data visualization' },
    { id: 'table', label: 'Data Table', icon: Table2, description: 'Raw data in tabular format' },
  ];

  const exportData = (format) => {
    if (!data || data.length === 0) return;

    if (format === 'csv') {
      const csv = [
        Object.keys(data[0]).join(','),
        ...data.map(row => Object.values(row).map(val => 
          typeof val === 'string' && val.includes(',') ? `"${val}"` : val
        ).join(','))
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'query_results.csv';
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'json') {
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'query_results.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="p-8 max-w-7xl mx-auto"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl shadow-2xl p-6 mb-6 border border-white/20 dark:border-slate-700/20 overflow-hidden"
      >
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center"
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Query Results
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                "{lastQuery?.query}"
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm rounded-xl px-4 py-2 border border-gray-200/50 dark:border-slate-600/50">
                <span className="font-medium text-blue-600 dark:text-blue-400">{rowCount}</span> rows • 
                <span className="font-medium text-emerald-600 dark:text-emerald-400 ml-1">{executionTime}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => exportData('csv')}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-white/60 dark:bg-slate-700/60 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-slate-600/80 text-gray-700 dark:text-gray-300 rounded-xl transition-all duration-200 border border-gray-200/50 dark:border-slate-600/50"
                >
                  <Download className="w-4 h-4" />
                  CSV
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => exportData('json')}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-white/60 dark:bg-slate-700/60 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-slate-600/80 text-gray-700 dark:text-gray-300 rounded-xl transition-all duration-200 border border-gray-200/50 dark:border-slate-600/50"
                >
                  <Download className="w-4 h-4" />
                  JSON
                </motion.button>
              </div>
            </div>
          </div>

          {/* View Tabs */}
          <div className="flex space-x-1 mt-6 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm p-1 rounded-xl border border-gray-200/50 dark:border-slate-600/50">
            {views.map((view, index) => (
              <motion.button
                key={view.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveView(view.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeView === view.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-slate-600/50'
                }`}
              >
                <view.icon className="w-4 h-4" />
                {view.label}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="relative bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/20 dark:border-slate-700/20 overflow-hidden"
        >
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />
          
          <div className="relative z-10">
            {activeView === 'chart' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Data Visualization
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 hover:bg-gray-100/80 dark:hover:bg-slate-700/80 rounded-xl transition-all duration-200"
                  >
                    <Maximize2 className="w-5 h-5 text-gray-500" />
                  </motion.button>
                </div>

                {/* Visualization Type Selector */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Choose Visualization Type:
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                    {vizTypes.map((type, index) => (
                      <motion.button
                        key={type.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedVizType(type.id)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-300 ${
                          currentVizType === type.id
                            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-700 dark:text-blue-300 shadow-lg'
                            : 'border-gray-200/50 dark:border-slate-600/50 hover:border-gray-300/50 dark:hover:border-slate-500/50 text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-slate-700/50'
                        }`}
                        title={type.description}
                      >
                        <type.icon className="w-5 h-5" />
                        <span className="text-xs font-medium text-center leading-tight">
                          {type.label}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {data && data.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <DataVisualization 
                      data={data} 
                      type={currentVizType} 
                      explanation={explanation}
                    />
                  </motion.div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                    No data available for visualization
                  </div>
                )}
              </div>
            )}

            {activeView === 'table' && (
              <div>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
                  Data Table
                </h3>
                {data && data.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <DataVisualization data={data} type="table" />
                  </motion.div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                    No data available
                  </div>
                )}
              </div>
            )}

            {activeView === 'sql' && (
              <div>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
                  Generated SQL Query
                </h3>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-gray-900 to-slate-800 rounded-2xl p-6 overflow-x-auto border border-gray-700/50 shadow-2xl"
                >
                  <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap leading-relaxed">
                    {sql}
                  </pre>
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default QueryResults;