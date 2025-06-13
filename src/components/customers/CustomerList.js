// ไฟล์: src/components/customers/CustomerList.js
import React from "react";
import { useCustomer } from "../../context/CustomerContext";
import { Link } from "react-router-dom";
import { UserPlus, Edit, Trash2, Users } from "lucide-react";

const CustomerList = () => {
  const { customers, deleteCustomer } = useCustomer();

  const handleDelete = (customerId, customerName) => {
    if (
      window.confirm(
        `คุณแน่ใจหรือไม่ที่จะลบลูกค้า ${customerName} (รหัส: ${customerId})?`
      )
    ) {
      deleteCustomer(customerId);
      alert("ลบลูกค้าเรียบร้อยแล้ว");
    }
  };

  const getCustomerTypeBadgeClass = (type) => {
    switch (type) {
      case "wholesale":
        return "bg-info text-dark"; // Bootstrap info badge
      case "retail":
        return "bg-success"; // Bootstrap success badge
      default:
        return "bg-secondary"; // Bootstrap secondary badge
    }
  };

  return (
    <div className="card shadow-sm p-4">
      {" "}
      {/* Use Bootstrap card and padding */}
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
          <p className="mb-0">ยังไม่มีลูกค้าในระบบ เพิ่มลูกค้าใหม่ได้เลย!</p>
        </div>
      ) : (
        <div className="table-responsive">
          {" "}
          {/* Bootstrap responsive table */}
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
              {customers.map((customer) => (
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
                        handleDelete(customer.customerId, customer.customerName)
                      }
                      className="btn btn-sm btn-outline-danger"
                      title="ลบลูกค้า"
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
    </div>
  );
};

export default CustomerList;
