// ไฟล์: src/components/customers/CustomerForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCustomer } from '../../context/CustomerContext';
import { UserPlus } from 'lucide-react'; // ไอคอน

const CustomerForm = () => {
  const navigate = useNavigate();
  const { customerId } = useParams(); // ดึง customerId จาก URL params
  const { customers, addCustomer, updateCustomer, getCustomerById } = useCustomer();

  const [customerName, setCustomerName] = useState('');
  const [customerType, setCustomerType] = useState('retail'); // 'wholesale', 'retail'
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [discountRate, setDiscountRate] = useState(0); // ส่วนลด
  const [creditLimit, setCreditLimit] = useState(0); // วงเงินเครดิต
  const [paymentTerms, setPaymentTerms] = useState(''); // เงื่อนไขการชำระเงิน

  const isEditMode = !!customerId; // ตรวจสอบว่าเป็นโหมดแก้ไขหรือไม่

  useEffect(() => {
    if (isEditMode) {
      const customerToEdit = getCustomerById(customerId); // ใช้ getCustomerById
      if (customerToEdit) {
        setCustomerName(customerToEdit.customerName);
        setCustomerType(customerToEdit.customerType);
        setContactPerson(customerToEdit.contactPerson);
        setEmail(customerToEdit.email);
        setPhone(customerToEdit.phone);
        setAddress(customerToEdit.address);
        setDiscountRate(customerToEdit.discountRate || 0);
        setCreditLimit(customerToEdit.creditLimit || 0);
        setPaymentTerms(customerToEdit.paymentTerms || '');
      } else {
        // หากไม่พบลูกค้าที่ต้องการแก้ไข อาจมีการพิมพ์ URL ผิด
        alert('ไม่พบข้อมูลลูกค้าที่ต้องการแก้ไข');
        navigate('/customers');
      }
    } else {
      // รีเซ็ตฟอร์มเมื่อเปลี่ยนเป็นโหมดสร้างใหม่
      setCustomerName('');
      setCustomerType('retail');
      setContactPerson('');
      setEmail('');
      setPhone('');
      setAddress('');
      setDiscountRate(0);
      setCreditLimit(0);
      setPaymentTerms('');
    }
  }, [isEditMode, customerId, customers, navigate, getCustomerById]); // เพิ่ม getCustomerById ใน dependency array

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!customerName || !customerType || !contactPerson) {
      alert('โปรดกรอกข้อมูลสำคัญ: ชื่อลูกค้า, ประเภทลูกค้า, ผู้ติดต่อ');
      return;
    }

    const customerData = {
      customerName,
      customerType,
      contactPerson,
      email,
      phone,
      address,
      discountRate: parseFloat(discountRate),
      creditLimit: parseFloat(creditLimit),
      paymentTerms,
    };

    if (isEditMode) {
      updateCustomer(customerId, customerData);
      alert('อัปเดตข้อมูลลูกค้าสำเร็จ!');
    } else {
      addCustomer(customerData);
      alert('เพิ่มลูกค้าใหม่สำเร็จ!');
    }

    navigate('/customers'); // กลับไปที่หน้ารายการลูกค้า
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center space-x-3">
        <UserPlus size={28} />
        <span>{isEditMode ? 'แก้ไขข้อมูลลูกค้า' : 'เพิ่มลูกค้าใหม่'}</span>
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="customerName">
              ชื่อลูกค้า: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="ชื่อบริษัท หรือ ชื่อบุคคล"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="customerType">
              ประเภทลูกค้า: <span className="text-red-500">*</span>
            </label>
            <select
              id="customerType"
              value={customerType}
              onChange={(e) => setCustomerType(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
              <option value="retail">ขายปลีก (Retail)</option>
              <option value="wholesale">ขายส่ง (Wholesale)</option>
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contactPerson">
            ผู้ติดต่อ: <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="contactPerson"
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="ชื่อผู้ติดต่อหลัก"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              อีเมล:
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="customer@example.com"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
              เบอร์โทรศัพท์:
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="08X-XXX-XXXX"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
            ที่อยู่:
          </label>
          <textarea
            id="address"
            rows="3"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="ที่อยู่สำหรับจัดส่งสินค้า"
          ></textarea>
        </div>

        {/* ข้อมูลเพิ่มเติมสำหรับลูกค้า (ส่วนลด, วงเงิน, เงื่อนไขการชำระเงิน) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="discountRate">
              ส่วนลด (%):
            </label>
            <input
              type="number"
              id="discountRate"
              value={discountRate}
              onChange={(e) => setDiscountRate(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              min="0"
              max="100"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="creditLimit">
              วงเงินเครดิต (฿):
            </label>
            <input
              type="number"
              id="creditLimit"
              value={creditLimit}
              onChange={(e) => setCreditLimit(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              min="0"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="paymentTerms">
              เงื่อนไขการชำระเงิน (วัน):
            </label>
            <input
              type="text"
              id="paymentTerms"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="เช่น '30 วัน' หรือ 'เมื่อได้รับสินค้า'"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-colors duration-200"
          >
            {isEditMode ? 'บันทึกการแก้ไข' : 'เพิ่มลูกค้า'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerForm;
