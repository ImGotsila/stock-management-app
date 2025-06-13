// src/components/dashboard/LowStockTable.js
import React from 'react';
import { AlertCircle } from 'lucide-react';

const LowStockTable = ({ products }) => {
  return (
    <div className="card shadow-sm h-100">
      <div className="card-body">
        <h3 className="card-title h5 mb-3 d-flex align-items-center">
          <AlertCircle size={20} className="text-warning me-2" />
          แจ้งเตือนสต็อกต่ำ ({products.length})
        </h3>
        {products.length === 0 ? (
          <div className="alert alert-success text-center mt-3" role="alert">
            ไม่มีสินค้าสต็อกต่ำ
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover table-striped table-bordered align-middle">
              <thead className="table-light">
                <tr>
                  <th scope="col" className="text-start">สินค้า</th>
                  <th scope="col" className="text-start">หมวดหมู่</th>
                  <th scope="col" className="text-end">สต็อกคงเหลือ</th>
                  <th scope="col" className="text-start">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {products.filter(Boolean).map((product) => (
                  <tr key={product.productId}>
                    <td className="text-nowrap">{product.productName}</td>
                    <td className="text-nowrap">{product.category}</td>
                    <td className="text-end">
                      <span
                        className={`badge ${
                          product.totalStock <= 5 ? "bg-danger" : "bg-warning text-dark"
                        }`}
                      >
                        {product.totalStock}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-warning text-dark d-inline-flex align-items-center">
                        <AlertCircle size={14} className="me-1" />
                        ต้องเติมสต็อก
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LowStockTable;