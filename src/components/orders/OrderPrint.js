// ไฟล์: src/components/orders/OrderPrint.js
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrder } from '../../context/OrderContext';
// import { useReactToPrint } from 'react-to-print'; // Changed import
import ReactToPrint from 'react-to-print'; // Changed import for direct use
import { Printer, ArrowLeft, XCircle } from 'lucide-react';
import { format } from 'date-fns';

const OrderPrint = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { getOrderById, isOrdersLoaded } = useOrder();
  const componentRef = useRef();

  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOrdersLoaded) {
      const fetchedOrder = getOrderById(orderId);
      if (fetchedOrder) {
        setOrder(fetchedOrder);
      } else {
        setError('ไม่พบคำสั่งซื้อที่ต้องการพิมพ์');
      }
    }
  }, [orderId, getOrderById, isOrdersLoaded]);

  // Removed useReactToPrint hook, now handled directly by <ReactToPrint> component below


  if (!isOrdersLoaded) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">กำลังโหลดข้อมูลคำสั่งซื้อ...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card shadow-sm text-center p-5">
        <XCircle size={64} className="text-danger mb-3 mx-auto" />
        <h2 className="text-danger mb-3">{error}</h2>
        <p className="text-muted mb-4">โปรดตรวจสอบรหัสคำสั่งซื้ออีกครั้ง</p>
        <button onClick={() => navigate('/orders')} className="btn btn-primary">
          กลับสู่หน้ารายการคำสั่งซื้อ
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Searching for order...</span>
        </div>
        <p className="mt-3">กำลังค้นหาข้อมูลคำสั่งซื้อ...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="no-print d-flex justify-content-between align-items-center mb-4">
        <button onClick={() => navigate('/orders')} className="btn btn-outline-secondary d-flex align-items-center">
          <ArrowLeft size={20} className="me-2" />
          กลับ
        </button>

        {/* Use ReactToPrint as a component */}
        <ReactToPrint
          trigger={() => (
            <button className="btn btn-primary d-flex align-items-center">
              <Printer size={20} className="me-2" />
              พิมพ์ใบสั่งซื้อ
            </button>
          )}
          content={() => componentRef.current}
          documentTitle={`Order_${order.orderId}`}
          onAfterPrint={() => console.log("Printing finished")}
          pageStyle={`
            @page {
              size: A4;
              margin: 20mm;
            }
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .no-print {
              display: none;
            }
            .print-table {
              width: 100%;
              border-collapse: collapse;
            }
            .print-table th, .print-table td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            .print-table th {
              background-color: #f2f2f2;
            }
          `}
        />
      </div>

      <div ref={componentRef} className="p-4 bg-white shadow-sm rounded-3">
        {/* Header Section */}
        <div className="text-center mb-4">
          <h1 className="h2 mb-2">ใบสั่งซื้อ</h1>
          <p className="lead text-muted">เลขที่: <strong>{order.orderId}</strong></p>
          <hr />
        </div>

        {/* Order Info and Customer Info */}
        <div className="row mb-4">
          <div className="col-md-6">
            <h3 className="h5 text-primary">ข้อมูลคำสั่งซื้อ</h3>
            <p className="mb-1"><strong>วันที่สั่งซื้อ:</strong> {order.orderDate ? format(new Date(order.orderDate), 'dd/MM/yyyy') : '-'}</p>
            <p className="mb-1"><strong>วันที่จัดส่ง:</strong> {order.deliveryDate ? format(new Date(order.deliveryDate), 'dd/MM/yyyy') : '-'}</p>
            <p className="mb-1"><strong>สถานะ:</strong> {order.status}</p>
          </div>
          <div className="col-md-6">
            <h3 className="h5 text-success">ข้อมูลลูกค้า</h3>
            <p className="mb-1"><strong>ชื่อลูกค้า:</strong> {order.customerInfo?.customerName || 'ไม่ระบุ'}</p>
            <p className="mb-1"><strong>ผู้ติดต่อ:</strong> {order.customerInfo?.contactPerson || '-'}</p>
            <p className="mb-1"><strong>เบอร์โทร:</strong> {order.customerInfo?.phone || '-'}</p>
            <p className="mb-1"><strong>อีเมล:</strong> {order.customerInfo?.email || '-'}</p>
            <p className="mb-1"><strong>ที่อยู่:</strong> {order.customerInfo?.address || '-'}</p>
            {order.customerInfo?.taxId && (
              <p className="mb-1"><strong>เลขประจำตัวผู้เสียภาษี:</strong> {order.customerInfo.taxId}</p>
            )}
          </div>
        </div>

        {/* Order Items Table */}
        <h3 className="h5 text-info mb-3">รายการสินค้า</h3>
        <div className="table-responsive mb-4">
          <table className="table table-bordered table-striped print-table">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>สินค้า</th>
                <th>ขนาด</th>
                <th className="text-end">ราคา/ชิ้น</th>
                <th className="text-end">จำนวน</th>
                <th className="text-end">ราคารวม</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.filter(Boolean).map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.productName}</td>
                  <td>{item.size}</td>
                  <td className="text-end">{typeof item.unitPrice === 'number' ? item.unitPrice.toLocaleString() : '0'}</td>
                  <td className="text-end">{item.quantity}</td>
                  <td className="text-end">{typeof item.totalPrice === 'number' ? item.totalPrice.toLocaleString() : '0'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="row justify-content-end mb-4">
          <div className="col-md-5">
            <div className="p-3 border rounded bg-light">
              <div className="d-flex justify-content-between mb-1">
                <span>ยอดรวม:</span>
                <span>{typeof order.subtotal === 'number' ? order.subtotal.toLocaleString('th-TH', { style: 'currency', currency: 'THB' }) : '฿0.00'}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="d-flex justify-content-between text-danger mb-1">
                  <span>ส่วนลด ({order.discountPercent || 0}%):</span>
                  <span>- {typeof order.discountAmount === 'number' ? order.discountAmount.toLocaleString('th-TH', { style: 'currency', currency: 'THB' }) : '฿0.00'}</span>
                </div>
              )}
              <div className="d-flex justify-content-between mb-1">
                <span>VAT (7%):</span>
                <span>{typeof order.vatAmount === 'number' ? order.vatAmount.toLocaleString('th-TH', { style: 'currency', currency: 'THB' }) : '฿0.00'}</span>
              </div>
              <div className="d-flex justify-content-between border-top pt-2 fw-bold fs-5">
                <span>ยอดรวมสุทธิ:</span>
                <span>{typeof order.grandTotal === 'number' ? order.grandTotal.toLocaleString('th-TH', { style: 'currency', currency: 'THB' }) : '฿0.00'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="mb-4">
            <h3 className="h5 text-secondary">หมายเหตุ:</h3>
            <p className="p-2 border rounded bg-light">{order.notes}</p>
          </div>
        )}

        {/* Footer for print */}
        <div className="d-flex justify-content-around text-center mt-5 print-footer-signatures">
          <div className="signature-block">
            <p>_________________________</p>
            <p>ลายเซ็นผู้สั่งซื้อ</p>
            <p>วันที่: _______________</p>
          </div>
          <div className="signature-block">
            <p>_________________________</p>
            <p>ลายเซ็นผู้รับคำสั่งซื้อ</p>
            <p>วันที่: _______________</p>
          </div>
        </div>

        <div className="text-center text-muted small mt-3">
          <p>ขอบคุณที่ใช้บริการ</p>
          <p>Generated on {format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
        </div>
      </div>
    </div>
  );
};

export default OrderPrint;