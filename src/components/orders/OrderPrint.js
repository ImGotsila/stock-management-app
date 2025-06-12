import React, { forwardRef } from 'react';

const OrderPrint = forwardRef(({ order }, ref) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div ref={ref} className="print-template">
      {/* Header */}
      <div className="print-header">
        <div className="company-info">
          <h1>บริษัท เสื้อผ้าดีเลิศ จำกัด</h1>
          <p>123 ถนนแฟชั่น เขตสไตล์ กรุงเทพฯ 10110</p>
          <p>โทร: 02-123-4567 | Email: contact@fashion.com</p>
          <p>เลขประจำตัวผู้เสียภาษี: 0123456789012</p>
        </div>
        <div className="invoice-info">
          <h2>ใบสั่งซื้อ</h2>
          <p><strong>เลขที่:</strong> {order.orderId}</p>
          <p><strong>วันที่:</strong> {formatDate(order.orderDate)}</p>
          <p><strong>วันที่จัดส่ง:</strong> {order.deliveryDate ? formatDate(order.deliveryDate) : '-'}</p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="customer-section">
        <h3>ข้อมูลลูกค้า</h3>
        <p><strong>ชื่อ:</strong> {order.customerInfo.customerName}</p>
        <p><strong>ผู้ติดต่อ:</strong> {order.customerInfo.contactPerson}</p>
        <p><strong>โทร:</strong> {order.customerInfo.phone}</p>
        <p><strong>ที่อยู่:</strong> {order.customerInfo.address}</p>
        {order.customerInfo.taxId && (
          <p><strong>เลขประจำตัวผู้เสียภาษี:</strong> {order.customerInfo.taxId}</p>
        )}
      </div>

      {/* Items Table */}
      <table className="items-table">
        <thead>
          <tr>
            <th>ลำดับ</th>
            <th>รายการสินค้า</th>
            <th>ขนาด</th>
            <th>จำนวน</th>
            <th>ราคาต่อหน่วย</th>
            <th>จำนวนเงิน</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{item.productName}</td>
              <td>{item.size}</td>
              <td>{item.quantity}</td>
              <td>฿{item.unitPrice.toLocaleString()}</td>
              <td>฿{item.totalPrice.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div className="print-summary">
        <div className="summary-table">
          <div className="summary-row">
            <span>ยอดรวม:</span>
            <span>฿{order.subtotal.toLocaleString()}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="summary-row">
              <span>ส่วนลด:</span>
              <span>-฿{order.discountAmount.toLocaleString()}</span>
            </div>
          )}
          <div className="summary-row">
            <span>VAT (7%):</span>
            <span>฿{order.vatAmount.toLocaleString()}</span>
          </div>
          <div className="summary-row total">
            <span>ยอดรวมสุทธิ:</span>
            <span>฿{order.totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="notes-section">
          <h4>หมายเหตุ:</h4>
          <p>{order.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="print-footer">
        <div className="signature-section">
          <div className="signature">
            <p>ลายเซ็นผู้สั่งซื้อ</p>
            <p>_________________________</p>
            <p>วันที่: _______________</p>
          </div>
          <div className="signature">
            <p>ลายเซ็นผู้รับคำสั่งซื้อ</p>
            <p>_________________________</p>
            <p>วันที่: _______________</p>
          </div>
        </div>
        
        <div className="terms">
          <h4>เงื่อนไข:</h4>
          <ul>
            <li>สินค้าที่สั่งแล้วไม่สามารถยกเลิกหรือเปลี่ยนแปลงได้</li>
            <li>กรุณาตรวจสอบสินค้าให้ถูกต้องก่อนรับมอบ</li>
            <li>ชำระเงินภายใน 30 วัน</li>
          </ul>
        </div>
      </div>
    </div>
  );
});

export default OrderPrint;