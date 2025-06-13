// src/components/dashboard/TopProductsChart.js
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const TopProductsChart = ({ data }) => {
  return (
    <div className="card shadow-sm h-100">
      <div className="card-body">
        <h3 className="card-title h5 mb-3">🏆 สินค้าขายดี Top 5</h3>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="productName"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  typeof value === "number" ? value : 0,
                  name === "quantity" ? "จำนวนขาย" : "ยอดขาย",
                ]}
              />
              <Bar dataKey="quantity" fill="#667eea" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="alert alert-info text-center mt-3" role="alert">
            ไม่มีข้อมูลสินค้าขายดี
          </div>
        )}
      </div>
    </div>
  );
};

export default TopProductsChart;