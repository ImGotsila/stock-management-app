// ไฟล์: src/components/orders/OrderList.js
import React, { useState } from "react"; // Import useState
import { useOrder } from "../../context/OrderContext";
import { Link, useNavigate } from "react-router-dom";
import { Printer, Trash2, PlusCircle, ShoppingCart } from "lucide-react";
import { format } from "date-fns";

const OrderList = () => {
  const { orders, deleteOrder, isOrdersLoaded } = useOrder();
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null); // Add notification state

  /**
   * Displays a notification message to the user.
   * @param {string} type - 'success' or 'error'
   * @param {string} message - The message content.
   */
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleDelete = async (orderId, customerName) => {
    if (
      window.confirm(
        `คุณแน่ใจหรือไม่ที่จะลบคำสั่งซื้อ #${orderId} ของลูกค้า ${customerName}?`
      )
    ) {
      const result = await deleteOrder(orderId);
      if (result && result.success) {
        showNotification("success", "ลบคำสั่งซื้อเรียบร้อยแล้ว"); // Use showNotification
      } else {
        showNotification(
          "error",
          `เกิดข้อผิดพลาดในการลบคำสั่งซื้อ: ${
            result?.message || "ไม่ทราบข้อผิดพลาด"
          }`
        ); // Use showNotification
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "completed":
        return "bg-success";
      case "pending":
        return "bg-warning text-dark";
      case "cancelled":
        return "bg-danger";
      case "shipped":
        return "bg-info text-dark";
      case "delivered":
        return "bg-primary";
      default:
        return "bg-secondary";
    }
  };

  if (!isOrdersLoaded) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading orders...</span>
        </div>
        <p className="mt-3">กำลังโหลดข้อมูลคำสั่งซื้อ...</p>
      </div>
    );
  }

  return (
    <div className="card shadow-sm p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h3 text-dark d-flex align-items-center">
          <ShoppingCart size={28} className="me-2" />
          <span>รายการคำสั่งซื้อ</span>
        </h2>
        <Link
          to="/orders/new"
          className="btn btn-primary d-flex align-items-center"
        >
          <PlusCircle size={20} className="me-2" />
          <span>สร้างคำสั่งซื้อใหม่</span>
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="alert alert-info text-center py-4" role="alert">
          <p className="mb-0">
            ยังไม่มีคำสั่งซื้อในระบบ สร้างคำสั่งซื้อใหม่ได้เลย!
          </p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover table-striped table-bordered align-middle">
            <thead className="table-light">
              <tr>
                <th scope="col" className="text-start">
                  รหัสคำสั่งซื้อ
                </th>
                <th scope="col" className="text-start">
                  ลูกค้า
                </th>
                <th scope="col" className="text-start">
                  วันที่สั่งซื้อ
                </th>
                <th scope="col" className="text-start">
                  วันที่จัดส่ง
                </th>
                <th scope="col" className="text-end">
                  ยอดรวมสุทธิ
                </th>
                <th scope="col" className="text-start">
                  สถานะ
                </th>
                <th scope="col" className="text-end">
                  การดำเนินการ
                </th>
              </tr>
            </thead>
            <tbody>
              {orders
                .filter(Boolean) // Added filter(Boolean) here to remove any null/undefined orders
                .map((order) => (
                  <tr key={order.orderId}>
                    <td className="text-nowrap">{order.orderId}</td>
                    <td className="text-nowrap">
                      {order.customerInfo?.customerName || order.customerId}
                    </td>
                    <td className="text-nowrap">
                      {order.orderDate
                        ? format(new Date(order.orderDate), "dd/MM/yyyy")
                        : "-"}
                    </td>
                    <td className="text-nowrap">
                      {order.deliveryDate
                        ? format(new Date(order.deliveryDate), "dd/MM/yyyy")
                        : "-"}
                    </td>
                    <td className="text-nowrap">
                      {order.grandTotal.toLocaleString("th-TH", {
                        style: "currency",
                        currency: "THB",
                      })}
                    </td>
                    <td className="text-nowrap">
                      <span
                        className={`badge ${getStatusBadgeClass(order.status)}`}
                      >
                        {order.status === "pending" && "รอดำเนินการ"}
                        {order.status === "completed" && "เสร็จสมบูรณ์"}
                        {order.status === "shipped" && "จัดส่งแล้ว"}
                        {order.status === "delivered" && "ส่งมอบแล้ว"}
                        {order.status === "cancelled" && "ยกเลิกแล้ว"}
                      </span>
                    </td>
                    <td className="text-end text-nowrap">
                      <Link
                        to={`/orders/${order.orderId}/print`}
                        className="btn btn-sm btn-outline-info me-2"
                        title="พิมพ์ใบสั่งซื้อ"
                      >
                        <Printer size={16} />
                      </Link>
                      <button
                        onClick={() =>
                          handleDelete(
                            order.orderId,
                            order.customerInfo?.customerName || order.customerId
                          )
                        }
                        className="btn btn-sm btn-outline-danger"
                        title="ลบคำสั่งซื้อ"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 p-4 rounded-lg shadow-lg text-white ${
            notification.type === "success" ? "bg-green-500" : "bg-red-500"
          } transition-opacity duration-300`}
        >
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default OrderList;
