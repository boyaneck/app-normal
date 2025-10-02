import React from "react";
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DataItem {
  name: string;
  value: number;
}

const ManageViewerPage = () => {
  const data: DataItem[] = [
    { name: "10대", value: 400 },
    { name: "20대", value: 300 },
    { name: "30대", value: 300 },
    { name: "40대", value: 200 },
    { name: "50대+", value: 100 },
  ];

  const COLORS = ["#FF0000", "#6441A4", "#1F8CFF", "#9E9E9E"];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={14}
      >
        {`${data[index].name} ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    // <div className={`pie-chart-container`}>
    //   <ResponsiveContainer width="100%" height={400}>
    //     <PieChart>
    //       <defs>
    //         {/* 3D 효과를 위한 그라데이션 */}
    //         <linearGradient
    //           id="gradientA"
    //           x1="100%"
    //           y1="50%"
    //           x2="100%"
    //           y2="50%"
    //         >
    //           <stop offset="100%" stopColor="#A3A1FB" />
    //           <stop offset="100%" stopColor="#7450E7" />
    //         </linearGradient>

    //         {/* 3D 효과를 위한 그림자 */}
    //         <filter
    //           id="innerShadow"
    //           x="-20%"
    //           y="-20%"
    //           width="140%"
    //           height="140%"
    //         >
    //           <feGaussianBlur
    //             in="SourceGraphic"
    //             stdDeviation="3"
    //             result="blur"
    //           />
    //           <feOffset dx="0" dy="2" in="blur" result="offsetBlur" />
    //           <feComposite
    //             in="SourceGraphic"
    //             in2="offsetBlur"
    //             operator="over"
    //             k2="-1"
    //             k3="1"
    //             k4="0.5"
    //           />
    //         </filter>
    //       </defs>
    //       <Pie
    //         data={data}
    //         cx="50%"
    //         cy="50%"
    //         labelLine={false}
    //         label={renderCustomizedLabel}
    //         outerRadius={170}
    //         fill="url(#)" // 그라데이션 적용
    //         dataKey="value"
    //         filter="url(#)" // 내부 그림자 효과
    //       >
    //         {data.map((entry, index) => (
    //           <Cell
    //             key={`cell-${index}`}
    //             fill={COLORS[index % COLORS.length]}
    //           />
    //         ))}
    //       </Pie>
    //     </PieChart>
    //   </ResponsiveContainer>
    // </div>
    <ResponsiveContainer width="100%" height={300}>
      <PieChart margin={{ top: 20, right: 0, left: 0, bottom: 20 }}>
        <Pie
          data={data}
          innerRadius={70} // 도넛 모양을 위한 내부 반지름
          outerRadius={100} // 바깥 반지름
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value, name) => [`${value}%`, name]} />
        {/* 이미지와 같이 원 밖에 Legend 배치 */}
        <Legend layout="vertical" align="right" verticalAlign="middle" />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default ManageViewerPage;
