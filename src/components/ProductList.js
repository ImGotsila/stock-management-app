// src/components/ProductList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, RefreshCw, PlusCircle } from 'lucide-react'; // Added PlusCircle icon
import { useStock } from '../context/StockContext';

const ProductList = () => {
  const { getProductsWithStock, resetData } = useStock();
  // เรียกใช้ getProductsWithStock ใน useEffect เพื่อให้ได้ข้อมูลล่าสุด
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  // ใช้ useEffect เพื่อโหลดและอัปเดต products เมื่อ getProductsWithStock เปลี่ยนแปลง (เช่น สต็อกถูกอัปเดต)
  useEffect(() => {
    setLoading(true);
    // Simulate loading time
    setTimeout(() => {
      setProducts(getProductsWithStock());
      setLoading(false);
    }, 300); // ลดเวลาจำลองการโหลด
  }, [getProductsWithStock]); // Dependency array: จะรัน effect นี้เมื่อ getProductsWithStock เปลี่ยนแปลง

  const getStockClass = (stock) => {
    if (stock >= 50) return 'stock-high';
    if (stock >= 20) return 'stock-medium';
    if (stock >= 10) return 'stock-low';
    return 'stock-critical';
  };

  // กรองหมวดหมู่ที่ไม่ซ้ำกัน
  const categories = ['', ...new Set(products.map(p => p.category).filter(Boolean))]; // filter(Boolean) เพื่อกรอง undefined/null

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.productId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setProducts(getProductsWithStock()); // โหลดข้อมูลใหม่
      setLoading(false);
    }, 300);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>กำลังโหลดข้อมูลสินค้า...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <div className="header-content">
          <div className="header-title">
            <Package size={32} />
            <div>
              <h1>🛍️ ระบบจัดการสต็อกเสื้อผ้า</h1>
              <p>จัดการสินค้าและติดตามสต็อกได้อย่างง่ายดาย</p>
            </div>
          </div>
          <div className="header-actions">
            {/* NEW: Add Product Button */}
            <Link to="/products/new" className="add-product-btn">
              <PlusCircle size={16} />
              เพิ่มสินค้าใหม่
            </Link>
            <button onClick={handleRefresh} className="refresh-btn">
              <RefreshCw size={16} />
              รีเฟรช
            </button>
            <button onClick={resetData} className="reset-btn">
              รีเซ็ตข้อมูล
            </button>
          </div>
        </div>
      </div>

      <div className="filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="ค้นหาสินค้า..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-filter"
        >
          <option value="">ทุกหมวดหมู่</option>
          {categories.slice(1).map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      <div className="stats">
        <div className="stat-item">
          <span className="stat-number">{products.length}</span>
          <span className="stat-label">สินค้าทั้งหมด</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {products.reduce((sum, p) => sum + (p.totalStock || 0), 0)} {/* ตรวจสอบ totalStock */}
          </span>
          <span className="stat-label">สต็อกรวม</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{categories.length - 1}</span>
          <span className="stat-label">หมวดหมู่</span>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="empty-state">
          <Package size={64} />
          <h3>ไม่พบสินค้า</h3>
          <p>ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่น</p>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map(product => (
            <div key={product.productId} className="product-card">
              <div className="product-image">
                <img
                  src={product.imageUrl}
                  alt={product.productName}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="no-image" style={{display: 'none'}}>
                  📷
                </div>
              </div>

              <div className="product-info">
                <div className="product-name">{product.productName}</div>
                <div className="product-id">รหัส: {product.productId}</div>
                <div className="product-category">{product.category}</div>

                <div className="stock-info">
                  <span className="stock-label">สต็อกคงเหลือ:</span>
                  <span className={`stock-count ${getStockClass(product.totalStock || 0)}`}> {/* ตรวจสอบ totalStock */}
                    {product.totalStock || 0}
                  </span>
                </div>

                <Link
                  to={`/products/${product.productId}`}
                  className="manage-btn"
                >
                  จัดการสต็อก
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList