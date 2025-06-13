// src/components/dashboard/CategoryPieChart.js
import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const COLORS = [
  "#667eea",
  "#764ba2",
  "#f093fb",
  "#f5576c",
  "#4facfe",
  "#43e97b",
  "#00f2fe",
  "#ffc107",
  "#20c997",
  "#6f42c1",
];

const CategoryPieChart = ({ data }) => {
  return (
    <div className="card shadow-sm h-100">
      <div className="card-body">
        <h3 className="card-title h5 mb-3">📊 สินค้าตามหมวดหมู่</h3>
        {data.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="name"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="d-flex flex-wrap justify-content-center mt-3">
              {data.map((entry, index) => (
                <div key={entry.name} className="d-flex align-items-center me-3 mb-2">
                  <span
                    className="me-2 rounded"
                    style={{
                      backgroundColor: COLORS[index % COLORS.length],
                      width: "14px",
                      height: "14px",
                    }}
                  ></span>
                  <span className="text-muted small">
                    {entry.name} ({entry.count})
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="alert alert-info text-center mt-3" role="alert">
            ไม่มีข้อมูลสัดส่วนประเภทสินค้า
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPieChart;