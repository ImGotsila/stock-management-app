// src/components/dashboard/RecentOrdersTable.js
import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const RecentOrdersTable = ({ orders, onUpdateStatus }) => {

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed': return 'bg-success';
      case 'pending': return 'bg-warning text-dark';
      case 'cancelled': return 'bg-danger';
      case 'shipped': return 'bg-info text-dark';
      case 'delivered': return 'bg-primary';
      default: return 'bg-secondary';
    }
  };

  return (
    <div className="card shadow-sm h-100">
      <div className="card-body">
        <h3 className="card-title h5 mb-3 d-flex align-items-center">
          <ShoppingCart size={20} className="text-primary me-2" />
          คำสั่งซื้อล่าสุด ({orders.length > 10 ? "10 รายการ" : orders.length})
        </h3>
        {orders.length === 0 ? (
          <div className="alert alert-info text-center mt-3" role="alert">
            ไม่มีคำสั่งซื้อล่าสุด
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover table-striped table-bordered align-middle">
              <thead className="table-light">
                <tr>
                  <th scope="col" className="text-start">เลขที่</th>
                  <th scope="col" className="text-start">ลูกค้า</th>
                  <th scope="col" className="text-start">วันที่</th>
                  <th scope="col" className="text-end">ยอดรวม</th>
                  <th scope="col" className="text-start">สถานะ</th>
                  <th scope="col" className="text-center">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).filter(Boolean).map((order) => (
                  <tr key={order.orderId}>
                    <td className="text-nowrap">
                      <Link
                        to={`/orders/${order.orderId}/print`}
                        className="text-decoration-none text-primary fw-bold"
                      >
                        {order.orderId}
                      </Link>
                    </td>
                    <td className="text-nowrap">{order.customerInfo?.customerName || "ไม่ระบุ"}</td>
                    <td className="text-nowrap">
                      {order.orderDate ? new Date(order.orderDate).toLocaleDateString("th-TH") : "-"}
                    </td>
                    <td className="text-end">
                      ฿{(typeof order.grandTotal === "number" ? order.grandTotal : 0).toLocaleString()}
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                        {order.status === "pending" && "รอดำเนินการ"}
                        {order.status === "completed" && "เสร็จสมบูรณ์"}
                        {order.status === "shipped" && "จัดส่งแล้ว"}
                        {order.status === "delivered" && "ส่งมอบแล้ว"}
                        {order.status === "cancelled" && "ยกเลิกแล้ว"}
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => onUpdateStatus(order.orderId, order.status)}
                        className="btn btn-sm btn-outline-primary"
                      >
                        อัปเดตสถานะ
                      </button>
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

export default RecentOrdersTable;