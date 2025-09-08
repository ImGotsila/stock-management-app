// src/App.js
import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
const Dashboard = lazy(() => import("./components/Dashboard"));
const ProductList = lazy(() => import("./components/ProductList"));
const ProductDetail = lazy(() => import("./components/ProductDetail"));
const ProductForm = lazy(() => import("./components/ProductForm"));
const CustomerList = lazy(() => import("./components/customers/CustomerList"));
const CustomerForm = lazy(() => import("./components/customers/CustomerForm"));
const OrderList = lazy(() => import("./components/orders/OrderList"));
const OrderForm = lazy(() => import("./components/orders/OrderForm"));
const OrderPrint = lazy(() => import("./components/orders/OrderPrint"));
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
              {/* ใช้ Bootstrap container สำหรับเนื้อหาหลัก */}
              <Suspense fallback={null}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/products" element={<ProductList />} />
                  <Route path="/products/new" element={<ProductForm />} />
                  {/* Route สำหรับเพิ่มสินค้า */}
                  <Route
                    path="/products/edit/:productId"
                    element={<ProductForm />}
                  />
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
                  <Route
                    path="/orders/:orderId/print"
                    element={<OrderPrint />}
                  />
                </Routes>
              </Suspense>
            </div>
          </OrderProvider>
        </CustomerProvider>
      </StockProvider>
    </Router>
  );
}

export default App;