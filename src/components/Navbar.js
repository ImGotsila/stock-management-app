// ไฟล์: src/components/Navbar.js (ปรับปรุง)
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { BarChart3, Package, ShoppingCart, Users, Plus } from "lucide-react";
// import '../styles/dashboard.css'; // ลบบรรทัดนี้

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: BarChart3, label: "Dashboard" },
    { path: "/products", icon: Package, label: "สินค้า" },
    { path: "/orders", icon: ShoppingCart, label: "คำสั่งซื้อ" },
    { path: "/customers", icon: Users, label: "ลูกค้า" },
  ];

  return (
    <nav className="navbar navbar-expand-lg">
      {" "}
      {/* ใช้ Bootstrap navbar classes */}
      <div className="container-fluid">
        {" "}
        {/* เพิ่ม container-fluid */}
        <Link to="/" className="navbar-brand text-white">
          {" "}
          {/* ใช้ navbar-brand และ text-white */}
          <h1>🛍️ ระบบจัดการสต็อก</h1>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav w-100">
            {" "}
            {/* ใช้ w-100 เพื่อให้เต็มความกว้าง */}
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <li className="nav-item" key={item.path}>
                  {" "}
                  {/* ใช้ nav-item */}
                  <Link
                    to={item.path}
                    className={`nav-link text-white ${
                      isActive ? "active" : ""
                    }`} // ใช้ nav-link และ text-white
                  >
                    <Icon size={18} className="me-2" />{" "}
                    {/* เพิ่ม me-2 สำหรับ margin-right */}
                    {item.label}
                  </Link>
                </li>
              );
            })}
            <li className="nav-item ms-auto">
              {" "}
              {/* ใช้ ms-auto เพื่อจัดชิดขวา */}
              <Link
                to="/orders/new"
                className="btn btn-warning text-dark d-flex align-items-center"
              >
                {" "}
                {/* เปลี่ยนเป็นปุ่ม Bootstrap */}
                <Plus size={18} className="me-2" />
                สร้างคำสั่งซื้อ
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
