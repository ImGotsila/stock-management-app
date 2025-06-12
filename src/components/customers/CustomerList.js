// ไฟล์: src/components/customers/CustomerList.js
import React from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { Link } from 'react-router-dom';
import { UserPlus, Edit, Trash2, Users } from 'lucide-react'; // นำเข้าไอคอน

const CustomerList = () => {
  const { customers, deleteCustomer } = useCustomer();

  const handleDelete = (customerId, customerName) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ที่จะลบลูกค้า ${customerName} (รหัส: ${customerId})?`)) {
      deleteCustomer(customerId);
      alert('ลบลูกค้าเรียบร้อยแล้ว');
    }
  };

  const getCustomerTypeBadgeClass = (type) => {
    switch (type) {
      case 'wholesale':
        return 'bg-blue-100 text-blue-800';
      case 'retail':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center space-x-3">
          <Users size={28} />
          <span>รายชื่อลูกค้า</span>
        </h2>
        <Link
          to="/customers/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors duration-200"
        >
          <UserPlus size={20} />
          <span>เพิ่มลูกค้าใหม่</span>
        </Link>
      </div>

      {customers.length === 0 ? (
        <p className="text-gray-500 text-center py-8 text-lg">
          ยังไม่มีลูกค้าในระบบ เพิ่มลูกค้าใหม่ได้เลย!
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รหัสลูกค้า</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อลูกค้า</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ประเภท</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ผู้ติดต่อ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เบอร์โทรศัพท์</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">อีเมล</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customers.map((customer) => (
                <tr key={customer.customerId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.customerId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{customer.customerName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCustomerTypeBadgeClass(customer.customerType)}`}>
                      {customer.customerType === 'wholesale' ? 'ขายส่ง' : 'ขายปลีก'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{customer.contactPerson}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{customer.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{customer.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Link
                      to={`/customers/edit/${customer.customerId}`} // ใช้ params สำหรับการแก้ไข
                      className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100 inline-flex items-center"
                      title="แก้ไขข้อมูลลูกค้า"
                    >
                      <Edit size={18} />
                    </Link>
                    <button
                      onClick={() => handleDelete(customer.customerId, customer.customerName)}
                      className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100 inline-flex items-center"
                      title="ลบลูกค้า"
                    >
                      <Trash2 size={18} />
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
