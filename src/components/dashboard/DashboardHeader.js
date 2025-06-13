// src/components/dashboard/DashboardHeader.js
import React from 'react';
import { Package, RefreshCw } from 'lucide-react';
import { useStock } from '../../context/StockContext'; // นำเข้า useStock
import { useOrder } from '../../context/OrderContext'; // นำเข้า useOrder (ถ้าจำเป็น)

const DashboardHeader = ({ dateRange, onDateRangeChange, onRefresh }) => {
  const { resetData } = useStock(); // ดึง resetData จาก StockContext

  return (
    <div className="p-4 bg-primary text-white rounded-3 shadow-sm mb-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap">
        <div className="d-flex align-items-center mb-3 mb-md-0">
          <Package size={32} className="me-3" />
          <div>
            <h1 className="h3 mb-1">📊 Dashboard และรายงาน</h1>
            <p className="lead mb-0">ภาพรวมการจัดการสต็อกและคำสั่งซื้อ</p>
          </div>
        </div>
        <div className="d-flex gap-2">
          <div className="date-filter d-flex align-items-center me-3">
            <label htmlFor="timeframe-select" className="me-2 mb-0 text-white-50">
              ช่วงเวลา:
            </label>
            <select
              id="timeframe-select"
              className="form-select form-select-sm bg-light text-dark"
              value={dateRange}
              onChange={onDateRangeChange}
            >
              <option value="7">7 วันที่ผ่านมา</option>
              <option value="30">30 วันที่ผ่านมา</option>
              <option value="90">90 วันที่ผ่านมา</option>
            </select>
          </div>
          <button onClick={onRefresh} className="btn btn-outline-light d-flex align-items-center me-2">
            <RefreshCw size={16} className="me-2" />
            รีเฟรช
          </button>
          <button onClick={resetData} className="btn btn-outline-light">
            รีเซ็ตข้อมูล
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;