// src/components/dashboard/StatCards.js
import React from 'react';
import { TrendingUp, DollarSign, ShoppingCart, Package } from 'lucide-react';

const StatCards = ({ stats, dateRange }) => {
  return (
    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 mb-4">
      <div className="col">
        <div className="card shadow-sm h-100">
          <div className="card-body d-flex align-items-center">
            <div className="stat-icon bg-gradient-primary rounded p-3 me-3 text-white">
              <DollarSign size={24} />
            </div>
            <div className="stat-content">
              <h3 className="card-title text-uppercase text-muted mb-0 fs-6">
                ยอดขายรวม
              </h3>
              <p className="h4 card-text mb-0 text-dark">
                ฿{typeof stats.totalRevenue === "number" ? stats.totalRevenue.toLocaleString() : "0"}
              </p>
              <span className="text-muted small">
                ใน {dateRange} วันที่ผ่านมา
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="col">
        <div className="card shadow-sm h-100">
          <div className="card-body d-flex align-items-center">
            <div className="stat-icon bg-gradient-pink rounded p-3 me-3 text-white">
              <ShoppingCart size={24} />
            </div>
            <div className="stat-content">
              <h3 className="card-title text-uppercase text-muted mb-0 fs-6">
                จำนวนคำสั่งซื้อ
              </h3>
              <p className="h4 card-text mb-0 text-dark">
                {stats.totalOrders}
              </p>
              <span className="text-muted small">คำสั่งซื้อ</span>
            </div>
          </div>
        </div>
      </div>
      <div className="col">
        <div className="card shadow-sm h-100">
          <div className="card-body d-flex align-items-center">
            <div className="stat-icon bg-gradient-info rounded p-3 me-3 text-white">
              <Package size={24} />
            </div>
            <div className="stat-content">
              <h3 className="card-title text-uppercase text-muted mb-0 fs-6">
                สินค้าที่ขาย
              </h3>
              <p className="h4 card-text mb-0 text-dark">
                {stats.totalItems}
              </p>
              <span className="text-muted small">ชิ้น</span>
            </div>
          </div>
        </div>
      </div>
      <div className="col">
        <div className="card shadow-sm h-100">
          <div className="card-body d-flex align-items-center">
            <div className="stat-icon bg-gradient-success rounded p-3 me-3 text-white">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <h3 className="card-title text-uppercase text-muted mb-0 fs-6">
                ยอดขายเฉลี่ย
              </h3>
              <p className="h4 card-text mb-0 text-dark">
                ฿
                {typeof stats.avgOrderValue === "number"
                  ? stats.avgOrderValue.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : "0"}
              </p>
              <span className="text-muted small">ต่อคำสั่งซื้อ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCards;