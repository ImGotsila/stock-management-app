// ไฟล์: src/components/customers/CustomerList.js
import React, { useState } from "react"; // Import useState
import { useCustomer } from "../../context/CustomerContext";
import { Link } from "react-router-dom";
import { UserPlus, Edit, Trash2, Users } from "lucide-react";

const CustomerList = () => {
  const { customers, deleteCustomer, isCustomersLoaded } = useCustomer();
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

  const handleDelete = async (customerId, customerName) => {
    if (
      window.confirm(
        `คุณแน่ใจหรือไม่ที่จะลบลูกค้า ${customerName} (รหัส: ${customerId})?`
      )
    ) {
      const result = await deleteCustomer(customerId);
      if (result.success) {
        showNotification("success", "ลบลูกค้าเรียบร้อยแล้ว"); // Use showNotification
      } else {
        showNotification(
          "error",
          `เกิดข้อผิดพลาดในการลบลูกค้า: ${result.message}`
        ); // Use showNotification
      }
    }
  };

  const getCustomerTypeBadgeClass = (type) => {
    switch (type) {
      case "wholesale":
        return "bg-info text-dark";
      case "retail":
        return "bg-success";
      default:
        return "bg-secondary";
    }
  };

  if (!isCustomersLoaded) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading customers...</span>
        </div>
        <p className="mt-3">กำลังโหลดข้อมูลลูกค้า...</p>
      </div>
    );
  }

  return (
    <div className="card shadow-sm p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h3 text-dark d-flex align-items-center">
          <Users size={28} className="me-2" />
          <span>รายชื่อลูกค้า</span>
        </h2>
        <Link
          to="/customers/new"
          className="btn btn-primary d-flex align-items-center"
        >
          <UserPlus size={20} className="me-2" />
          <span>เพิ่มลูกค้าใหม่</span>
        </Link>
      </div>

      {customers.length === 0 ? (
        <div className="alert alert-info text-center py-4" role="alert">
          <p className="mb-0">ยังไม่มีลูกค้าในระบบ สร้างลูกค้าใหม่ได้เลย!</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover table-striped table-bordered align-middle">
            <thead className="table-light">
              <tr>
                <th scope="col" className="text-start">
                  รหัสลูกค้า
                </th>
                <th scope="col" className="text-start">
                  ชื่อลูกค้า
                </th>
                <th scope="col" className="text-start">
                  ประเภท
                </th>
                <th scope="col" className="text-start">
                  ผู้ติดต่อ
                </th>
                <th scope="col" className="text-start">
                  เบอร์โทรศัพท์
                </th>
                <th scope="col" className="text-start">
                  อีเมล
                </th>
                <th scope="col" className="text-end">
                  การดำเนินการ
                </th>
              </tr>
            </thead>
            <tbody>
              {customers.map(
                (customer) =>
                  customer && (
                    <tr key={customer.customerId}>
                      <td className="text-nowrap">{customer.customerId}</td>
                      <td className="text-nowrap">{customer.customerName}</td>
                      <td className="text-nowrap">
                        <span
                          className={`badge ${getCustomerTypeBadgeClass(
                            customer.customerType
                          )}`}
                        >
                          {customer.customerType === "wholesale"
                            ? "ขายส่ง"
                            : "ขายปลีก"}
                        </span>
                      </td>
                      <td className="text-nowrap">{customer.contactPerson}</td>
                      <td className="text-nowrap">{customer.phone}</td>
                      <td className="text-nowrap">{customer.email}</td>
                      <td className="text-end text-nowrap">
                        <Link
                          to={`/customers/edit/${customer.customerId}`}
                          className="btn btn-sm btn-outline-primary me-2"
                          title="แก้ไขข้อมูลลูกค้า"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() =>
                            handleDelete(
                              customer.customerId,
                              customer.customerName
                            )
                          }
                          className="btn btn-sm btn-outline-danger"
                          title="ลบลูกค้า"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  )
              )}
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

export default CustomerList;
