import React, { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler,
  registerables,
} from 'chart.js';
import { Bar, Pie, Line, Scatter, Bubble, Radar, Doughnut, PolarArea } from 'react-chartjs-2';
import { FunnelController, TrapezoidElement } from 'chartjs-chart-funnel';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import Tree from 'react-d3-tree';
import * as d3 from 'd3';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

ChartJS.register(
  ...registerables,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler,
  FunnelController,
  TrapezoidElement
);

const DataVisualization = ({ data, type = 'bar', explanation }) => {
  const heatmapRef = useRef(null);
  const treemapRef = useRef(null);
  const [treeData, setTreeData] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-slate-700 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">No data to visualize</p>
      </div>
    );
  }

  const columns = Object.keys(data[0]);
  const isDarkMode = document.documentElement.classList.contains('dark');

  // Helper function to get numeric values
  const getNumericValues = (columnName) => {
    return data.map(item => {
      const value = item[columnName];
      return typeof value === 'number' ? value : parseFloat(value) || 0;
    });
  };

  // Color palettes
  const colors = [
    'rgba(59, 130, 246, 0.8)',   // Blue
    'rgba(16, 185, 129, 0.8)',   // Emerald
    'rgba(249, 115, 22, 0.8)',   // Orange
    'rgba(139, 92, 246, 0.8)',   // Purple
    'rgba(236, 72, 153, 0.8)',   // Pink
    'rgba(34, 197, 94, 0.8)',    // Green
    'rgba(245, 158, 11, 0.8)',   // Amber
    'rgba(239, 68, 68, 0.8)',    // Red
  ];

  const borderColors = colors.map(color => color.replace('0.8', '1'));

  // Common chart options
  const getChartOptions = (customOptions = {}) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          color: isDarkMode ? '#e2e8f0' : '#374151',
          font: {
            size: 12,
            family: 'Inter, system-ui, sans-serif',
          },
        },
      },
      tooltip: {
        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
        titleColor: isDarkMode ? '#e2e8f0' : '#374151',
        bodyColor: isDarkMode ? '#e2e8f0' : '#374151',
        borderColor: isDarkMode ? '#475569' : '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 12,
        },
      },
    },
    scales: type !== 'pie' && type !== 'doughnut' && type !== 'radar' && type !== 'polarArea' ? {
      x: {
        grid: {
          color: isDarkMode ? '#334155' : '#f3f4f6',
        },
        ticks: {
          color: isDarkMode ? '#94a3b8' : '#6b7280',
          font: {
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: isDarkMode ? '#334155' : '#f3f4f6',
        },
        ticks: {
          color: isDarkMode ? '#94a3b8' : '#6b7280',
          font: {
            size: 11,
          },
        },
      },
    } : undefined,
    ...customOptions,
  });

  // Generate tree data for treemap
  useEffect(() => {
    if (type === 'treemap' && data.length > 0) {
      const treeStructure = {
        name: 'Root',
        children: data.map((item, index) => ({
          name: item[columns[0]] || `Item ${index + 1}`,
          value: getNumericValues(columns[1])[index] || 1,
        })),
      };
      setTreeData(treeStructure);
    }
  }, [data, type]);

  // Render heatmap using D3
  useEffect(() => {
    if (type === 'heatmap' && heatmapRef.current) {
      const container = d3.select(heatmapRef.current);
      container.selectAll('*').remove();

      const margin = { top: 50, right: 50, bottom: 100, left: 100 };
      const width = 600 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;

      const svg = container
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);

      const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Prepare data for heatmap
      const numericColumns = columns.filter(col => 
        data.some(row => !isNaN(parseFloat(row[col])))
      );

      if (numericColumns.length < 2) return;

      const xScale = d3.scaleBand()
        .domain(data.map(d => d[columns[0]]))
        .range([0, width])
        .padding(0.1);

      const yScale = d3.scaleBand()
        .domain(numericColumns)
        .range([0, height])
        .padding(0.1);

      const maxValue = d3.max(data, d => 
        d3.max(numericColumns, col => parseFloat(d[col]) || 0)
      );

      const colorScale = d3.scaleSequential(d3.interpolateBlues)
        .domain([0, maxValue]);

      // Add rectangles
      numericColumns.forEach(col => {
        data.forEach(row => {
          const value = parseFloat(row[col]) || 0;
          g.append('rect')
            .attr('x', xScale(row[columns[0]]))
            .attr('y', yScale(col))
            .attr('width', xScale.bandwidth())
            .attr('height', yScale.bandwidth())
            .attr('fill', colorScale(value))
            .attr('stroke', isDarkMode ? '#475569' : '#e5e7eb')
            .attr('stroke-width', 1)
            .append('title')
            .text(`${row[columns[0]]}, ${col}: ${value}`);
        });
      });

      // Add axes
      g.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll('text')
        .style('fill', isDarkMode ? '#94a3b8' : '#6b7280')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-45)');

      g.append('g')
        .call(d3.axisLeft(yScale))
        .selectAll('text')
        .style('fill', isDarkMode ? '#94a3b8' : '#6b7280');
    }
  }, [data, type, isDarkMode]);

  const renderChart = () => {
    const labels = data.map(item => item[columns[0]]);

    switch (type) {
      case 'bar':
        return (
          <Bar
            data={{
              labels,
              datasets: columns.slice(1).map((col, index) => ({
                label: col,
                data: getNumericValues(col),
                backgroundColor: colors[index % colors.length],
                borderColor: borderColors[index % borderColors.length],
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
              })),
            }}
            options={getChartOptions()}
          />
        );

      case 'line':
        return (
          <Line
            data={{
              labels,
              datasets: columns.slice(1).map((col, index) => ({
                label: col,
                data: getNumericValues(col),
                borderColor: borderColors[index % borderColors.length],
                backgroundColor: colors[index % colors.length],
                fill: false,
                tension: 0.4,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: borderColors[index % borderColors.length],
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
              })),
            }}
            options={getChartOptions()}
          />
        );

      case 'pie':
        return (
          <Pie
            data={{
              labels,
              datasets: [{
                label: columns[1],
                data: getNumericValues(columns[1]),
                backgroundColor: colors,
                borderColor: borderColors,
                borderWidth: 2,
                hoverOffset: 10,
              }],
            }}
            options={getChartOptions()}
          />
        );

      case 'doughnut':
        return (
          <Doughnut
            data={{
              labels,
              datasets: [{
                label: columns[1],
                data: getNumericValues(columns[1]),
                backgroundColor: colors,
                borderColor: borderColors,
                borderWidth: 2,
                hoverOffset: 10,
              }],
            }}
            options={getChartOptions()}
          />
        );

      case 'scatter':
        return (
          <Scatter
            data={{
              datasets: [{
                label: `${columns[0]} vs ${columns[1]}`,
                data: data.map((item, index) => ({
                  x: getNumericValues(columns[0])[index],
                  y: getNumericValues(columns[1])[index],
                })),
                backgroundColor: colors[0],
                borderColor: borderColors[0],
                pointRadius: 8,
                pointHoverRadius: 12,
              }],
            }}
            options={getChartOptions()}
          />
        );

      case 'bubble':
        return (
          <Bubble
            data={{
              datasets: [{
                label: 'Bubble Chart',
                data: data.map((item, index) => ({
                  x: getNumericValues(columns[0])[index],
                  y: getNumericValues(columns[1])[index],
                  r: Math.max(5, (getNumericValues(columns[2] || columns[1])[index] / 10)),
                })),
                backgroundColor: colors[0],
                borderColor: borderColors[0],
                borderWidth: 2,
              }],
            }}
            options={getChartOptions()}
          />
        );

      case 'radar':
        return (
          <Radar
            data={{
              labels: columns.slice(1),
              datasets: data.slice(0, 3).map((item, index) => ({
                label: item[columns[0]],
                data: columns.slice(1).map(col => parseFloat(item[col]) || 0),
                backgroundColor: colors[index].replace('0.8', '0.2'),
                borderColor: borderColors[index],
                borderWidth: 2,
                pointBackgroundColor: borderColors[index],
                pointBorderColor: '#ffffff',
                pointRadius: 6,
              })),
            }}
            options={getChartOptions()}
          />
        );

      case 'polarArea':
        return (
          <PolarArea
            data={{
              labels,
              datasets: [{
                label: columns[1],
                data: getNumericValues(columns[1]),
                backgroundColor: colors,
                borderColor: borderColors,
                borderWidth: 2,
              }],
            }}
            options={getChartOptions()}
          />
        );

      case 'funnel':
        return (
          <div className="w-full h-96">
            <Bar
              data={{
                labels,
                datasets: [{
                  label: columns[1],
                  data: getNumericValues(columns[1]).sort((a, b) => b - a),
                  backgroundColor: colors,
                  borderColor: borderColors,
                  borderWidth: 2,
                  borderRadius: 8,
                }],
              }}
              options={getChartOptions({
                indexAxis: 'y',
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    callbacks: {
                      title: (context) => `Stage ${context[0].dataIndex + 1}`,
                    },
                  },
                },
              })}
            />
          </div>
        );

      case 'kpi':
        const kpiData = columns.slice(1).map(col => {
          const values = getNumericValues(col);
          const total = values.reduce((sum, val) => sum + val, 0);
          const avg = total / values.length;
          const max = Math.max(...values);
          const min = Math.min(...values);
          
          return { col, total, avg, max, min };
        });

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
            {kpiData.map((kpi, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-700 dark:to-slate-600 p-6 rounded-2xl shadow-lg border border-blue-100 dark:border-slate-600">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 capitalize">
                  {kpi.col.replace('_', ' ')}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Total</span>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {kpi.total.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Average</span>
                    <span className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                      {kpi.avg.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Range</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {kpi.min} - {kpi.max}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'geopoint':
      case 'geomap':
        // Check if data has latitude and longitude columns
        const hasLatLng = columns.some(col => 
          col.toLowerCase().includes('lat') || col.toLowerCase().includes('lng') || 
          col.toLowerCase().includes('lon') || col.toLowerCase().includes('coord')
        );

        if (!hasLatLng) {
          return (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              Geographic data requires latitude and longitude columns
            </div>
          );
        }

        const latCol = columns.find(col => col.toLowerCase().includes('lat')) || columns[1];
        const lngCol = columns.find(col => col.toLowerCase().includes('lng') || col.toLowerCase().includes('lon')) || columns[2];

        return (
          <div className="h-96 w-full rounded-lg overflow-hidden">
            <MapContainer 
              center={[0, 0]} 
              zoom={2} 
              style={{ height: '100%', width: '100%' }}
              className="rounded-lg"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {data.map((item, index) => {
                const lat = parseFloat(item[latCol]);
                const lng = parseFloat(item[lngCol]);
                if (isNaN(lat) || isNaN(lng)) return null;
                
                return (
                  <Marker key={index} position={[lat, lng]}>
                    <Popup>
                      <div className="p-2">
                        {columns.map(col => (
                          <div key={col} className="text-sm">
                            <strong>{col}:</strong> {item[col]}
                          </div>
                        ))}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        );

      case 'heatmap':
        return (
          <div className="w-full overflow-x-auto">
            <div ref={heatmapRef} className="min-w-[600px]" />
          </div>
        );

      case 'treemap':
        if (!treeData) {
          return (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              Loading treemap...
            </div>
          );
        }

        return (
          <div className="w-full h-96 border border-gray-200 dark:border-slate-600 rounded-lg overflow-hidden">
            <Tree
              data={treeData}
              orientation="vertical"
              translate={{ x: 300, y: 50 }}
              nodeSize={{ x: 200, y: 100 }}
              separation={{ siblings: 1, nonSiblings: 2 }}
              renderCustomNodeElement={({ nodeDatum }) => (
                <g>
                  <circle
                    r={Math.max(10, (nodeDatum.value || 1) / 10)}
                    fill={colors[0]}
                    stroke={borderColors[0]}
                    strokeWidth="2"
                  />
                  <text
                    fill={isDarkMode ? '#e2e8f0' : '#374151'}
                    strokeWidth="0"
                    x="20"
                    y="5"
                    fontSize="12"
                  >
                    {nodeDatum.name}
                  </text>
                  {nodeDatum.value && (
                    <text
                      fill={isDarkMode ? '#94a3b8' : '#6b7280'}
                      strokeWidth="0"
                      x="20"
                      y="20"
                      fontSize="10"
                    >
                      {nodeDatum.value}
                    </text>
                  )}
                </g>
              )}
            />
          </div>
        );

      case 'table':
      default:
        return (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-700">
                  {columns.map((col, index) => (
                    <th
                      key={index}
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-600"
                    >
                      {col.replace('_', ' ').toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    {columns.map((col, colIndex) => (
                      <td
                        key={colIndex}
                        className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-slate-700"
                      >
                        {typeof row[col] === 'number' 
                          ? row[col].toLocaleString() 
                          : String(row[col] || '')
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      <div className="h-96 w-full">
        {renderChart()}
      </div>
      
      {explanation && (
        <details className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <summary className="cursor-pointer font-semibold text-blue-900 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-200 transition-colors">
            💡 Why this visualization?
          </summary>
          <div className="mt-3 text-blue-800 dark:text-blue-200 text-sm whitespace-pre-wrap leading-relaxed">
            {explanation}
          </div>
        </details>
      )}
    </div>
  );
};

export default DataVisualization;