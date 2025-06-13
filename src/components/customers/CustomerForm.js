// ไฟล์: src/components/customers/CustomerForm.js
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCustomer } from "../../context/CustomerContext";
import { UserPlus } from "lucide-react";

const CustomerForm = () => {
  const navigate = useNavigate();
  const { customerId } = useParams();
  const { customers, addCustomer, updateCustomer, getCustomerById } =
    useCustomer();

  const [customerName, setCustomerName] = useState("");
  const [customerType, setCustomerType] = useState("retail");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [discountRate, setDiscountRate] = useState(0);
  const [creditLimit, setCreditLimit] = useState(0);
  const [paymentTerms, setPaymentTerms] = useState("");
  const [notification, setNotification] = useState(null); // Add notification state

  const isEditMode = !!customerId;

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

  useEffect(() => {
    if (isEditMode) {
      const customerToEdit = getCustomerById(customerId);
      if (customerToEdit) {
        setCustomerName(customerToEdit.customerName);
        setCustomerType(customerToEdit.customerType);
        setContactPerson(customerToEdit.contactPerson);
        setEmail(customerToEdit.email);
        setPhone(customerToEdit.phone);
        setAddress(customerToEdit.address);
        setDiscountRate(customerToEdit.discountRate || 0);
        setCreditLimit(customerToEdit.creditLimit || 0);
        setPaymentTerms(customerToEdit.paymentTerms || "");
      } else {
        showNotification("error", "ไม่พบข้อมูลลูกค้าที่ต้องการแก้ไข"); // Use showNotification
        navigate("/customers");
      }
    } else {
      setCustomerName("");
      setCustomerType("retail");
      setContactPerson("");
      setEmail("");
      setPhone("");
      setAddress("");
      setDiscountRate(0);
      setCreditLimit(0);
      setPaymentTerms("");
    }
  }, [isEditMode, customerId, customers, navigate, getCustomerById]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotification(null); // Clear previous notifications

    if (!customerName || !customerType || !contactPerson) {
      showNotification("error", "โปรดกรอกข้อมูลสำคัญ: ชื่อลูกค้า, ประเภทลูกค้า, ผู้ติดต่อ"); // Use showNotification
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

    let result = null;
    if (isEditMode) {
      result = await updateCustomer(customerId, customerData);
    } else {
      result = await addCustomer(customerData);
    }

    if (result) {
      showNotification("success", isEditMode ? "อัปเดตข้อมูลลูกค้าสำเร็จ!" : "เพิ่มลูกค้าใหม่สำเร็จ!"); // Use showNotification
      navigate("/customers");
    }
    // Error handling is inside addCustomer/updateCustomer in context now
  };

  return (
    <div className="card shadow-sm p-4 mb-4">
      {" "}
      {/* Bootstrap card styling */}
      <h2 className="h3 text-dark mb-4 d-flex align-items-center">
        <UserPlus size={28} className="me-2" />
        <span>{isEditMode ? "แก้ไขข้อมูลลูกค้า" : "เพิ่มลูกค้าใหม่"}</span>
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="row g-3 mb-3">
          {" "}
          {/* Bootstrap grid for form layout */}
          <div className="col-md-6">
            <label htmlFor="customerName" className="form-label">
              ชื่อลูกค้า: <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="form-control"
              placeholder="ชื่อบริษัท หรือ ชื่อบุคคล"
              required
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="customerType" className="form-label">
              ประเภทลูกค้า: <span className="text-danger">*</span>
            </label>
            <select
              id="customerType"
              value={customerType}
              onChange={(e) => setCustomerType(e.target.value)}
              className="form-select"
              required
            >
              <option value="retail">ขายปลีก (Retail)</option>
              <option value="wholesale">ขายส่ง (Wholesale)</option>
            </select>
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="contactPerson" className="form-label">
            ผู้ติดต่อ: <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            id="contactPerson"
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
            className="form-control"
            placeholder="ชื่อผู้ติดต่อหลัก"
            required
          />
        </div>

        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label htmlFor="email" className="form-label">
              อีเมล:
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              placeholder="customer@example.com"
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="phone" className="form-label">
              เบอร์โทรศัพท์:
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="form-control"
              placeholder="08X-XXX-XXXX"
            />
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="address" className="form-label">
            ที่อยู่:
          </label>
          <textarea
            id="address"
            rows="3"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="form-control"
            placeholder="ที่อยู่สำหรับจัดส่งสินค้า"
          ></textarea>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <label htmlFor="discountRate" className="form-label">
              ส่วนลด (%):
            </label>
            <input
              type="number"
              id="discountRate"
              value={discountRate}
              onChange={(e) => setDiscountRate(e.target.value)}
              className="form-control"
              min="0"
              max="100"
            />
          </div>
          <div className="col-md-4">
            <label htmlFor="creditLimit" className="form-label">
              วงเงินเครดิต (฿):
            </label>
            <input
              type="number"
              id="creditLimit"
              value={creditLimit}
              onChange={(e) => setCreditLimit(e.target.value)}
              className="form-control"
              min="0"
            />
          </div>
          <div className="col-md-4">
            <label htmlFor="paymentTerms" className="form-label">
              เงื่อนไขการชำระเงิน (วัน):
            </label>
            <input
              type="text"
              id="paymentTerms"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              className="form-control"
              placeholder="เช่น '30 วัน' หรือ 'เมื่อได้รับสินค้า'"
            />
          </div>
        </div>

        <div className="d-flex justify-content-end">
          <button type="submit" className="btn btn-primary btn-lg">
            {isEditMode ? "บันทึกการแก้ไข" : "เพิ่มลูกค้า"}
          </button>
        </div>
      </form>

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

export default CustomerForm;