import React from 'react';

const StatCards = ({ stats }) => {
  if (!stats) return null;
  const { totalRevenue, totalOrders, totalItems } = stats;
  return (
    <div className="row g-3 mb-4">
      <div className="col">
        <div className="card text-center shadow-sm">
          <div className="card-body">
            <h5 className="card-title">รายรับรวม</h5>
            <p className="card-text">{totalRevenue}</p>
          </div>
        </div>
      </div>
      <div className="col">
        <div className="card text-center shadow-sm">
          <div className="card-body">
            <h5 className="card-title">คำสั่งซื้อ</h5>
            <p className="card-text">{totalOrders}</p>
          </div>
        </div>
      </div>
      <div className="col">
        <div className="card text-center shadow-sm">
          <div className="card-body">
            <h5 className="card-title">จำนวนสินค้า</h5>
            <p className="card-text">{totalItems}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCards;
