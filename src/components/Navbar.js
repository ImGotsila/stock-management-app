// ไฟล์: src/components/Navbar.js (สร้างใหม่)
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Package, ShoppingCart, Users, Plus } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: BarChart3, label: 'Dashboard' },
    { path: '/products', icon: Package, label: 'สินค้า' },
    { path: '/orders', icon: ShoppingCart, label: 'คำสั่งซื้อ' },
    { path: '/customers', icon: Users, label: 'ลูกค้า' }
  ];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>🛍️ ระบบจัดการสต็อก</h1>
      </div>
      
      <div className="navbar-menu">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link 
              key={item.path}
              to={item.path} 
              className={`navbar-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
        
        <Link to="/orders/new" className="navbar-item create-order">
          <Plus size={18} />
          <span>สร้างคำสั่งซื้อ</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;