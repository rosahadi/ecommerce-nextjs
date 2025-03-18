"use client";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";

const Charts = ({
  data: { salesData },
}: {
  data: {
    salesData: { month: string; totalSales: number }[];
  };
}) => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    if (typeof document !== "undefined") {
      setIsDarkTheme(
        document.documentElement.classList.contains("dark")
      );

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (
            mutation.attributeName === "class" &&
            mutation.target === document.documentElement
          ) {
            setIsDarkTheme(
              document.documentElement.classList.contains(
                "dark"
              )
            );
          }
        });
      });

      observer.observe(document.documentElement, {
        attributes: true,
      });

      // Cleanup
      return () => observer.disconnect();
    }
  }, []);

  const CustomTooltip = ({
    active,
    payload,
    label,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          className={`${isDarkTheme ? "bg-zinc-800" : "bg-white"} border ${isDarkTheme ? "border-zinc-700" : "border-zinc-200"} p-3 rounded-lg shadow-lg`}
        >
          <p className="font-bold uppercase text-xs tracking-wide">
            {label}
          </p>
          <p
            className={`${isDarkTheme ? "text-blue-400" : "text-blue-600"} font-bold text-lg`}
          >
            ${payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  // Define colors based on theme
  const primaryColor = isDarkTheme ? "#60a5fa" : "#2563eb"; // blue-400 : blue-600
  const primaryColorLight = isDarkTheme
    ? "rgba(96, 165, 250, 0.4)"
    : "rgba(37, 99, 235, 0.4)";
  const textColor = isDarkTheme ? "#e4e4e7" : "#27272a"; // zinc-200 : zinc-800
  const borderColor = isDarkTheme ? "#3f3f46" : "#d4d4d8"; // zinc-700 : zinc-300
  const hoverColor = isDarkTheme
    ? "rgba(255, 255, 255, 0.05)"
    : "rgba(0, 0, 0, 0.05)";

  return (
    <div className="w-full h-[350px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={salesData}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 20,
          }}
        >
          <defs>
            <linearGradient
              id="colorGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor={primaryColor}
                stopOpacity={1}
              />
              <stop
                offset="100%"
                stopColor={primaryColorLight}
                stopOpacity={1}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke={borderColor}
            opacity={0.5}
          />
          <XAxis
            dataKey="month"
            stroke={textColor}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tick={{ fontWeight: "bold" }}
            tickMargin={10}
          />
          <YAxis
            stroke={textColor}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value}`}
            width={50}
          />
          <Tooltip
            cursor={{ fill: hoverColor }}
            content={<CustomTooltip />}
          />
          <Bar
            dataKey="totalSales"
            fill="url(#colorGradient)"
            radius={[6, 6, 0, 0]}
            barSize={40}
            animationDuration={1500}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Charts;
