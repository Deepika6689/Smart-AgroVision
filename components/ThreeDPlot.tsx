
import React from 'react';
import Plot from 'react-plotly.js';
import { ConfidenceScore, Theme } from '../types';
import type * as Plotly from 'plotly.js';

interface ThreeDPlotProps {
  scores: ConfidenceScore[];
  theme: Theme;
  plotId: string; // Unique ID for the Plotly div
}

const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 80) return '#22c55e'; // green-500
  if (confidence >= 50) return '#f59e0b'; // amber-500
  return '#ef4444'; // red-500
};

const ThreeDPlot: React.FC<ThreeDPlotProps> = ({ scores, theme, plotId }) => {

  const plotData: Plotly.Data[] = scores.flatMap((score) => {
    const diseaseName = score.disease.replace(/_/g, ' ');
    const barColor = getConfidenceColor(score.confidence);

    // Glowing marker at the top of the bar for a halo effect and better tooltips
    const markerTrace: Plotly.Data = {
      type: 'scatter3d',
      mode: 'markers',
      x: [diseaseName],
      y: [0],
      z: [score.confidence],
      name: '', // No legend entry for markers
      marker: {
        size: 8,
        color: barColor,
        symbol: 'circle',
        opacity: 0.9,
      },
      hoverinfo: 'text',
      text: `🌿 Disease: ${diseaseName}<br>📈 Confidence: ${score.confidence}%`,
    };

    // The bar itself
    const barTrace: Plotly.Data = {
      type: 'scatter3d',
      mode: 'lines',
      x: [diseaseName, diseaseName],
      y: [0, 0],
      z: [0, score.confidence],
      name: diseaseName, // Legend entry for the bar
      line: {
        width: 25,
        color: barColor,
      },
      // Disable hover for the bar line to avoid duplicate tooltips
      hoverinfo: 'none',
    };

    return [barTrace, markerTrace];
  });

  const layout: Partial<Plotly.Layout> = {
    autosize: true,
    margin: { l: 0, r: 0, b: 20, t: 0 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: {
      color: theme === 'dark' ? '#E2E8F0' : '#1A202C',
      family: 'Poppins, sans-serif',
    },
    showlegend: false,
    scene: {
      xaxis: {
        title: { text: 'Plant Diseases', font: { size: 12 } },
        type: 'category',
        tickfont: { size: 10 },
        tickangle: -15,
        gridcolor: theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
      },
      yaxis: {
        title: '',
        range: [-1, 1], // Keep it slim
        showticklabels: false,
        visible: false, // Hide the Y-axis completely
      },
      zaxis: {
        title: { text: 'Confidence (%)', font: { size: 12 } },
        range: [0, 100],
        gridcolor: theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
      },
      camera: {
        eye: { x: 1.8, y: 1.8, z: 1.2 },
        center: { x: 0, y: 0, z: -0.2 },
      },
      aspectmode: 'manual',
      aspectratio: { x: 1.5, y: 0.5, z: 0.8 },
      // Add lighting for depth perception
      lighting: {
        ambient: 0.7,
        diffuse: 0.6,
        specular: 0.1,
      },
    },
  };

  return (
    <div className="w-full h-full">
      <Plot
        divId={plotId}
        data={plotData}
        layout={layout}
        useResizeHandler={true}
        style={{ width: '100%', height: '100%' }}
        config={{ responsive: true, displayModeBar: false, displaylogo: false }}
      />
    </div>
  );
};

export default ThreeDPlot;