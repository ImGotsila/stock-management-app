// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'; // ตรวจสอบว่ามีบรรทัดนี้อยู่
import Navbar from './components/Navbar';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail'; // สมมติว่ามี ProductDetail แล้ว
import AddProductForm from './components/AddProductForm'; // Added AddProductForm route
import Dashboard from './components/Dashboard';
import OrderList from './components/orders/OrderList';
import OrderForm from './components/orders/OrderForm';
import OrderPrint from './components/orders/OrderPrint';
import CustomerList from './components/customers/CustomerList';
import CustomerForm from './components/customers/CustomerForm';
import { StockProvider } from './context/StockContext';
import { OrderProvider } from './context/OrderContext';
import { CustomerProvider } from './context/CustomerContext';

function App() {
  return (
    <Router>
      {/* ใช้ StockProvider, OrderProvider, CustomerProvider คลุมทั้งแอปเพื่อให้ Context ใช้งานได้ทุกที่ */}
      <StockProvider>
        <CustomerProvider>
          <OrderProvider>
            {/* แถบนำทาง (Navbar) จะแสดงอยู่ด้านบนของทุกหน้า */}
            <Navbar />
            {/* The main content area, with a responsive container */}
            <div className="container mx-auto p-4">
              {/* กำหนดเส้นทางสำหรับหน้าต่างๆ */}
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/products" element={<ProductList />} />
                <Route path="/products/:productId" element={<ProductDetail />} /> {/* สำหรับหน้าแสดงรายละเอียดสินค้า */}
                <Route path="/products/new" element={<AddProductForm />} /> {/* Route for adding new product */}
                <Route path="/orders" element={<OrderList />} />
                <Route path="/orders/new" element={<OrderForm />} />
                <Route path="/orders/:orderId/print" element={<OrderPrint />} />
                <Route path="/customers" element={<CustomerList />} />
                <Route path="/customers/new" element={<CustomerForm />} />
                <Route path="/customers/edit/:customerId" element={<CustomerForm />} /> {/* เพิ่มเส้นทางสำหรับแก้ไขลูกค้า */}
              </Routes>
            </div>
          </OrderProvider>
        </CustomerProvider>
      </StockProvider>
    </Router>
  );
}

export default App