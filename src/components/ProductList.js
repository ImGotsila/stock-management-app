// src/components/ProductList.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Package, Search, RefreshCw, PlusCircle } from "lucide-react";
import { useStock } from "../context/StockContext";

const ProductList = () => {
  const { products, isProductsLoaded, resetData } = useStock(); // ดึง products และ isProductsLoaded จาก Context
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const getStockClass = (stock) => {
    if (stock >= 50) return "bg-success";
    if (stock >= 20) return "bg-warning text-dark";
    if (stock >= 10) return "bg-danger";
    return "bg-dark"; // critical stock
  };

  const categories = [
    "",
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.productId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleRefresh = () => {
    resetData();
  };

  if (!isProductsLoaded) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading products...</span>
        </div>
        <p className="mt-3">กำลังโหลดข้อมูลสินค้า...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {" "}
      {/* Use Bootstrap container and padding */}
      <div className="p-4 bg-primary text-white rounded-3 shadow-sm mb-4">
        {" "}
        {/* Bootstrap header styling */}
        <div className="d-flex justify-content-between align-items-center flex-wrap">
          <div className="d-flex align-items-center mb-3 mb-md-0">
            <Package size={32} className="me-3" />
            <div>
              <h1 className="h3 mb-1">🛍️ ระบบจัดการสต็อกเสื้อผ้า</h1>
              <p className="lead mb-0">
                จัดการสินค้าและติดตามสต็อกได้อย่างง่ายดาย
              </p>
            </div>
          </div>
          <div className="d-flex gap-2">
            <button
              onClick={handleRefresh}
              className="btn btn-outline-light d-flex align-items-center"
            >
              <RefreshCw size={16} className="me-2" />
              รีเฟรช
            </button>
            <button onClick={resetData} className="btn btn-outline-light">
              รีเซ็ตข้อมูล
            </button>
            {/* ปุ่มเพิ่มสินค้าใหม่ */}
            <Link
              to="/products/new"
              className="btn btn-warning text-dark d-flex align-items-center"
            >
              <PlusCircle size={16} className="me-2" />
              เพิ่มสินค้าใหม่
            </Link>
          </div>
        </div>
      </div>
      <div className="d-flex flex-wrap gap-3 mb-4">
        {" "}
        {/* Bootstrap flexbox for filters */}
        <div className="input-group flex-grow-1">
          {" "}
          {/* Bootstrap input group */}
          <span className="input-group-text">
            <Search size={20} />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="ค้นหาสินค้า..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="form-select flex-shrink-0"
          style={{ maxWidth: "200px" }}
        >
          <option value="">ทุกหมวดหมู่</option>
          {categories.slice(1).map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      <div className="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-3 mb-4">
        {" "}
        {/* Bootstrap grid for stats */}
        <div className="col">
          <div className="card text-center shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title display-6 mb-1">{products.length}</h5>
              <p className="card-text text-muted">สินค้าทั้งหมด</p>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card text-center shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title display-6 mb-1">
                {products.reduce((sum, p) => sum + (p.totalStock || 0), 0)}
              </h5>
              <p className="card-text text-muted">สต็อกรวม</p>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card text-center shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title display-6 mb-1">
                {categories.length - 1}
              </h5>
              <p className="card-text text-muted">หมวดหมู่</p>
            </div>
          </div>
        </div>
      </div>
      {filteredProducts.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-3 shadow-sm">
          <Package size={64} className="text-muted opacity-50 mb-3" />
          <h3 className="text-muted">ไม่พบสินค้า</h3>
          <p className="text-muted">ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่น</p>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {" "}
          {/* Bootstrap grid for products */}
          {filteredProducts.map(
            (product) =>
              // ตรวจสอบว่า product ไม่เป็น undefined ก่อนเรนเดอร์
              product && (
                <div key={product.productId} className="col">
                  <div className="card h-100 shadow-sm transition-transform">
                    <div
                      className="product-image-container overflow-hidden rounded-top"
                      style={{ height: "250px" }}
                    >
                      {/* แสดงรูปภาพแรกของสินค้า หรือรูปภาพหลัก */}
                      <img
                        src={
                          product.imageUrls?.[0] || "placeholder-image-url.jpg"
                        } // ใช้รูปภาพแรก หรือ placeholder
                        className="card-img-top h-100 w-100 object-fit-cover"
                        alt={product.productName}
                        onError={(e) => {
                          e.target.style.display = "none"; // ซ่อนรูปภาพที่โหลดไม่ได้
                          // ตรวจสอบว่ามี element ถัดไป (ซึ่งคือ div.no-image) ก่อนที่จะเข้าถึง
                          if (e.target.nextSibling) {
                            e.target.nextSibling.style.display = "flex"; // แสดง placeholder แทน
                          }
                        }}
                      />
                      {/* Placeholder สำหรับกรณีไม่มีรูปภาพ หรือโหลดรูปภาพไม่ได้ */}
                      <div
                        className="no-image h-100 w-100 position-absolute top-0 start-0 bg-light justify-content-center align-items-center"
                        style={{ display: "none" }}
                      >
                        <span className="text-muted opacity-50 fs-1">📷</span>
                      </div>
                    </div>

                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title text-truncate">
                        {product.productName}
                      </h5>
                      <p className="card-subtitle mb-2 text-muted small">
                        รหัส: {product.productId}
                      </p>
                      <p className="card-text text-uppercase text-info fw-bold">
                        {product.category}
                      </p>

                      <div className="d-flex justify-content-between align-items-center mt-auto py-2 px-3 bg-light rounded-pill">
                        <span className="text-muted fw-bold">
                          สต็อกคงเหลือ:
                        </span>
                        <span
                          className={`badge rounded-pill ${getStockClass(
                            product.totalStock || 0
                          )}`}
                        >
                          {product.totalStock || 0}
                        </span>
                      </div>

                      <Link
                        to={`/products/${product.productId}`}
                        className="btn btn-primary mt-3 text-uppercase fw-bold"
                      >
                        จัดการสต็อก
                      </Link>
                    </div>
                  </div>
                </div>
              )
          )}
        </div>
      )}
    </div>
  );
};

export default ProductList;