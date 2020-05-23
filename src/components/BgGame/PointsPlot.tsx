import Plot from 'react-plotly.js';
import React from 'react';
import { Config, Data, Layout } from 'plotly.js';

const X_LIMIT = 10;
const Y_LIMIT = 11;

const getColor = (won) => (won ? '#2aa11f' : '#8b1207');

type Game = { won: boolean; points: number; n: number };

/**
 * Plotly.js based graph.
 * @link https://plotly.com/javascript/text-and-annotations/
 */
export default function PointsPlot({ gamesHistory }: { gamesHistory: Game[] }) {
  const gamesPlotData: { x: number[]; y: number[] } = gamesHistory.reduce(
    (acc, game) => ({ x: [...acc.x, game.n], y: [...acc.y, game.points] }),
    {
      x: [],
      y: [],
    },
  );

  const last = (arr) => arr[arr.length - 1];
  const lastX = last(gamesPlotData.x);
  const lastY = last(gamesPlotData.y);
  const lastGame = last(gamesHistory);

  const xStart = Math.max(0, lastX - X_LIMIT - 1);

  const layoutConfig: Partial<Layout> = {
    plot_bgcolor: 'transparent',
    paper_bgcolor: 'transparent',
    showlegend: false,
    autosize: true,
    xaxis: {
      showgrid: false,
      dtick: 2,
      range: [xStart, Math.max((lastX || 0) + 1, X_LIMIT)],
      tickwidth: 0.1,
      ticklen: 2,
      tickfont: {
        size: 4,
        color: 'black',
      },
      tickcolor: '#27763c',
      color: '#27763c',
      zerolinecolor: '#ececec',
      zerolinewidth: 1,
      showline: false,
      ticks: '',
      zeroline: false,
      showticklabels: false,
    },
    yaxis: {
      showgrid: false,
      dtick: 2,
      range: [lastY - Math.ceil(Y_LIMIT / 2) - 1, lastY + Math.ceil(Y_LIMIT / 2) + 1],
      tickwidth: 0.1,
      ticklen: 2,
      tickfont: {
        size: 4,
        color: 'black',
      },
      zerolinecolor: '#ececec',
      zerolinewidth: 1,
      showline: false,
      ticks: '',
      zeroline: false,
      showticklabels: false,
    },
    margin: {
      l: 8,
      r: 0,
      b: 8,
      t: 3,
      pad: 0,
    },
    annotations: [
      {
        text: `${lastGame.points}`,
        x: lastGame.n,
        y: lastGame.points + 3,
        xref: 'x',
        yref: 'y',
        showarrow: false,
        font: {
          color: getColor(lastGame.won),
          family: 'monospace',
          size: 6,
        },
      },
      {
        text: `${gamesHistory.length}`,
        x: lastGame.n,
        y: lastGame.points - 1,
        xref: 'x',
        yref: 'y',
        showarrow: false,
        font: {
          color: '#cecece',
          family: 'monospace',
          size: 5,
        },
      },
    ],
  };
  const config: Partial<Config> = {
    responsive: true,
    displayModeBar: false,
    editable: false,
    staticPlot: true,
  };

  const plotData: Data[] = getPlot(gamesHistory);

  return (
    <div>
      <Plot data={plotData} layout={layoutConfig} config={config} />
    </div>
  );
};

const getPlot = (history: Game[]) => {
  const games = history.slice(-(X_LIMIT + 1));
  let lastGame = games.shift();

  return games.map((game, i) => {
    const last = lastGame;
    lastGame = game;
    const color = getColor(game.won);

    return {
      x: [last.n, game.n],
      y: [last.points, game.points],
      type: 'scatter',
      mode: 'lines+markers',
      line: { width: 1, color },
      marker: { color, size: 3 },
    } as Data;
  });
};
