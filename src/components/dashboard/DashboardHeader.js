import React from 'react';

const DashboardHeader = ({ dateRange, onDateRangeChange, onRefresh }) => (
  <div className="mb-3 d-flex justify-content-between align-items-center">
    <h2 className="h4">Dashboard</h2>
    <div className="d-flex gap-2">
      <select value={dateRange} onChange={onDateRangeChange} className="form-select">
        <option value="7">7 วัน</option>
        <option value="30">30 วัน</option>
        <option value="90">90 วัน</option>
      </select>
      <button onClick={onRefresh} className="btn btn-outline-primary">รีเฟรช</button>
    </div>
  </div>
);

export default DashboardHeader;
