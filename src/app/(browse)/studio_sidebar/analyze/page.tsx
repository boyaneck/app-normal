import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

interface DataItem {
  subject: string;
  A: number;
  B: number;
  fullMark: number;
}

const AnalyzePage = () => {
  const data: DataItem[] = [
    { subject: "관심도", A: 120, B: 110, fullMark: 150 },
    { subject: "충성도", A: 98, B: 130, fullMark: 150 },
    { subject: "소통", A: 86, B: 130, fullMark: 150 },
    { subject: "참여도", A: 99, B: 100, fullMark: 150 },
    { subject: "활성도", A: 85, B: 90, fullMark: 150 },
    { subject: "만족도", A: 65, B: 85, fullMark: 150 },
  ];

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis angle={70} domain={[0, 160]} />
        <Radar
          name="fullMark"
          dataKey="B"
          stroke="#98111e"
          fill="#8884d8"
          fillOpacity={0.2}
        />
        {/* <Radar
          name="B"
          dataKey="B"
          stroke="#82ca9d"
          fill="#82ca9d"
          fillOpacity={0.6}
        /> */}
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default AnalyzePage;
