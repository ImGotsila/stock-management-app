// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import ProductList from "./components/ProductList";
import ProductDetail from "./components/ProductDetail";
import ProductForm from "./components/ProductForm"; // เพิ่ม ProductForm
import CustomerList from "./components/customers/CustomerList";
import CustomerForm from "./components/customers/CustomerForm";
import OrderList from "./components/orders/OrderList";
import OrderForm from "./components/orders/OrderForm";
import OrderPrint from "./components/orders/OrderPrint"; // หากมีคอมโพเนนต์นี้
import { StockProvider } from "./context/StockContext";
import { CustomerProvider } from "./context/CustomerContext";
import { OrderProvider } from "./context/OrderContext";
import "./App.css"; // ตรวจสอบว่ามีบรรทัดนี้อยู่และไม่มีการ import dashboard.css อีก

function App() {
  return (
    <Router>
      <StockProvider>
        <CustomerProvider>
          <OrderProvider>
            <Navbar />
            <div className="container mt-4">
              {" "}
              {/* ใช้ Bootstrap container สำหรับเนื้อหาหลัก */}
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/products" element={<ProductList />} />
                <Route path="/products/new" element={<ProductForm />} />{" "}
                {/* Route สำหรับเพิ่มสินค้า */}
                <Route
                  path="/products/edit/:productId"
                  element={<ProductForm />}
                />{" "}
                {/* Route สำหรับแก้ไขสินค้า */}
                <Route
                  path="/products/:productId"
                  element={<ProductDetail />}
                />
                <Route path="/customers" element={<CustomerList />} />
                <Route path="/customers/new" element={<CustomerForm />} />
                <Route
                  path="/customers/edit/:customerId"
                  element={<CustomerForm />}
                />
                <Route path="/orders" element={<OrderList />} />
                <Route path="/orders/new" element={<OrderForm />} />
                <Route path="/orders/:orderId/print" element={<OrderPrint />} />
              </Routes>
            </div>
          </OrderProvider>
        </CustomerProvider>
      </StockProvider>
    </Router>
  );
}

export default App;