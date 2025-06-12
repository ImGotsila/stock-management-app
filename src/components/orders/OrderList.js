// ไฟล์: src/components/orders/OrderList.js
import React from 'react';
import { useOrder } from '../../context/OrderContext';
import { Link, useNavigate } from 'react-router-dom';
import { Printer, Trash2, PlusCircle, ShoppingCart } from 'lucide-react'; // เพิ่ม ShoppingCart ที่นี่
import { format } from 'date-fns';

const OrderList = () => {
  const { orders, deleteOrder } = useOrder();
  const navigate = useNavigate();

  const handleDelete = (orderId, customerName) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ที่จะลบคำสั่งซื้อ #${orderId} ของลูกค้า ${customerName}?`)) {
      deleteOrder(orderId);
      alert('ลบคำสั่งซื้อเรียบร้อยแล้ว');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center space-x-3">
          <ShoppingCart size={28} /> {/* ใช้งาน ShoppingCart ตรงนี้ */}
          <span>รายการคำสั่งซื้อ</span>
        </h2>
        <Link
          to="/orders/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors duration-200"
        >
          <PlusCircle size={20} />
          <span>สร้างคำสั่งซื้อใหม่</span>
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className="text-gray-500 text-center py-8 text-lg">
          ยังไม่มีคำสั่งซื้อในระบบ สร้างคำสั่งซื้อใหม่ได้เลย!
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รหัสคำสั่งซื้อ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ลูกค้า</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่สั่งซื้อ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่จัดส่ง</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ยอดรวมสุทธิ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.orderId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.orderId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.customerInfo?.customerName || order.customerId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {order.orderDate ? format(new Date(order.orderDate), 'dd/MM/yyyy') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {order.deliveryDate ? format(new Date(order.deliveryDate), 'dd/MM/yyyy') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {order.grandTotal.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                      {order.status === 'pending' ? 'รอดำเนินการ' : order.status === 'completed' ? 'เสร็จสมบูรณ์' : 'ยกเลิก'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Link
                      to={`/orders/${order.orderId}/print`}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100 inline-flex items-center"
                      title="พิมพ์ใบสั่งซื้อ"
                    >
                      <Printer size={18} />
                    </Link>
                    <button
                      onClick={() => handleDelete(order.orderId, order.customerInfo?.customerName || order.customerId)}
                      className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100 inline-flex items-center"
                      title="ลบคำสั่งซื้อ"
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

export default OrderList;
