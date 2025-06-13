import React from 'react';

const LowStockTable = ({ products }) => (
  <div className="card shadow-sm">
    <div className="card-body">
      <h5 className="card-title">สินค้าคงเหลือน้อย</h5>
      <ul className="list-group list-group-flush">
        {products && products.length > 0 ? (
          products.map(p => (
            <li key={p.productId} className="list-group-item d-flex justify-content-between">
              <span>{p.productName}</span>
              <span className="badge bg-danger">{p.totalStock}</span>
            </li>
          ))
        ) : (
          <li className="list-group-item text-muted">ไม่มีข้อมูล</li>
        )}
      </ul>
    </div>
  </div>
);

export default LowStockTable;
