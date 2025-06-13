// src/components/dashboard/SalesChart.js
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const SalesChart = ({ data }) => {
  return (
    <div className="card shadow-sm h-100">
      <div className="card-body">
        <h3 className="card-title h5 mb-3">📈 ยอดขายรายวัน</h3>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  name === "revenue"
                    ? `฿${(typeof value === "number" ? value : 0).toLocaleString()}`
                    : typeof value === "number" ? value : 0,
                  name === "revenue" ? "ยอดขาย" : "จำนวนคำสั่งซื้อ",
                ]}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#667eea"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="alert alert-info text-center mt-3" role="alert">
            ไม่มีข้อมูลยอดขายรายวัน
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesChart;