import React, { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";

const WeaknessChart = ({ performances = [] }) => {
  const { theme } = useContext(ThemeContext);

  // Only display subtopics with weaknessScore > 0 and sort by weaknessScore descending
  const chartData = performances
    .filter((p) => p.weaknessScore > 0)
    .sort((a, b) => b.weaknessScore - a.weaknessScore)
    .slice(0, 8) // Limit to top 8 weak subtopics to keep layout clean
    .map((p) => ({
      name: p.subtopic,
      weakness: p.weaknessScore,
      mastery: p.masteryScore
    }));

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/40 px-6">
        <p className="text-slate-400 dark:text-slate-500 text-xs text-center">
          No weakness data available yet. Start practicing and submit answers to populate stats.
        </p>
      </div>
    );
  }

  // Custom Tooltip component for theme styling
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-lg shadow-md text-3xs flex flex-col gap-1">
          <p className="font-semibold text-slate-900 dark:text-slate-100">{data.name}</p>
          <p className="text-red-500 font-semibold">Weakness: {data.weakness}%</p>
          <p className="text-emerald-500 font-semibold">Mastery: {data.mastery}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          barSize={16}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#334155" : "#e2e8f0"} vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#94a3b8"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => (value.length > 12 ? `${value.substring(0, 10)}...` : value)}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }} />
          <Bar dataKey="weakness" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => {
              // Color gradient: higher weakness = red/warning, lower weakness = green
              const color =
                entry.weakness > 70
                  ? "#EF4444" // red (Danger)
                  : entry.weakness > 40
                  ? "#F59E0B" // amber (Warning)
                  : "#10B981"; // emerald (Success)
              return <Cell key={`cell-${index}`} fill={color} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeaknessChart;
