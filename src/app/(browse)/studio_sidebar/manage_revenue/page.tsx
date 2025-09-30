import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

const ManageRevenuePage = () => {
  const productSales = [
    { name: "월요일", product1: 4000, product2: 2400 },
    { name: "화요일", product1: 3000, product2: 2210 },
    { name: "수요일", product1: 2000, product2: 2290 },
    { name: "Apr", product1: 2780, product2: 2000 },
    { name: "May", product1: 1890, product2: 2181 },
    { name: "Jun", product1: 2390, product2: 2500 },
    { name: "Jun", product1: 2390, product2: 2500 },
    { name: "Jun", product1: 2390, product2: 2500 },
    { name: "Jun", product1: 2390, product2: 2500 },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: "#fff",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "5px",
          }}
        >
          <p className="label">{`${label}`}</p>
          <p className="intro">{`Product 1 : ${payload[0].value}`}</p>
          <p className="desc">{`Product 2 : ${payload[1].value}`}</p>
        </div>
      );
    }

    return null;
  };

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={productSales}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />{" "}
          {/* 옅은 격자선 */}
          <XAxis dataKey="name" />
          <YAxis />
          {/* <Tooltip content={<CustomTooltip />} /> */}
          <Legend />
          <Line
            type="basis"
            dataKey="product1"
            stroke="#c12323" // 토스 스타일 파란색
            strokeWidth={2}
            dot={false} // 데이터 포인트 제거
          />
          <Line
            type="monotone"
            dataKey="product2"
            stroke="#82CAFA" // 토스 스타일 하늘색
            strokeWidth={2}
            dot={false} // 데이터 포인트 제거
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ManageRevenuePage;
