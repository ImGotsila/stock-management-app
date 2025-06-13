import React from 'react';

const RecentOrdersTable = ({ orders, onUpdateStatus }) => (
  <div className="card shadow-sm">
    <div className="card-body">
      <h5 className="card-title">คำสั่งซื้อล่าสุด</h5>
      <ul className="list-group list-group-flush">
        {orders && orders.length > 0 ? (
          orders.map(o => (
            <li key={o.orderId} className="list-group-item d-flex justify-content-between">
              <span>{o.orderId}</span>
              <button className="btn btn-sm btn-outline-primary" onClick={() => onUpdateStatus && onUpdateStatus(o.orderId, o.status)}>
                {o.status}
              </button>
            </li>
          ))
        ) : (
          <li className="list-group-item text-muted">ไม่มีข้อมูล</li>
        )}
      </ul>
    </div>
  </div>
);

export default RecentOrdersTable;
