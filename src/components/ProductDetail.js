// ไฟล์: src/components/ProductDetail.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStock } from "../context/StockContext";
import {
  MinusCircle,
  PlusCircle,
  ArrowLeft,
  Package,
  Edit,
  Save,
  XCircle,
} from "lucide-react";

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { getProductDetail, updateStock, updateProductPrice } = useStock();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantityInput, setQuantityInput] = useState(1);
  const [notification, setNotification] = useState(null);

  const [editingSizePrice, setEditingSizePrice] = useState(null);
  const [editedRetailPrice, setEditedRetailPrice] = useState(0);
  const [editedWholesalePrice, setEditedWholesalePrice] = useState(0);

  useEffect(() => {
    const fetchedProduct = getProductDetail(productId);
    if (fetchedProduct) {
      setProduct(fetchedProduct);
    } else {
      showNotification("error", "ไม่พบสินค้าที่ต้องการ");
      setTimeout(() => navigate("/products"), 2000);
    }
    setLoading(false);
  }, [productId, getProductDetail, navigate]);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleUpdateStock = async (size, change) => {
    const result = await updateStock(
      productId,
      size,
      change,
      change > 0 ? "เพิ่มสต็อก" : "ลดสต็อก"
    );
    if (result.success) {
      setProduct(getProductDetail(productId));
      showNotification("success", result.message);
    } else {
      showNotification("error", result.message);
    }
  };

  const handleBulkUpdateStock = async (size, type) => {
    const quantity = parseInt(quantityInput);
    if (isNaN(quantity) || quantity <= 0) {
      showNotification("error", "โปรดระบุจำนวนที่ถูกต้อง");
      return;
    }

    const change = type === "add" ? quantity : -quantity;
    await handleUpdateStock(size, change);
    setQuantityInput(1);
  };

  const handleEditPriceClick = (size) => {
    const priceInfo = product.pricesBySize?.[size];
    setEditedRetailPrice(priceInfo?.retailPrice || 0);
    setEditedWholesalePrice(priceInfo?.wholesalePrice || 0);
    setEditingSizePrice(size);
  };

  const handleSavePrice = async (size) => {
    const newRetail = parseFloat(editedRetailPrice);
    const newWholesale = parseFloat(editedWholesalePrice);

    if (
      isNaN(newRetail) ||
      isNaN(newWholesale) ||
      newRetail < 0 ||
      newWholesale < 0
    ) {
      showNotification("error", "โปรดกรอกราคาที่ถูกต้อง");
      return;
    }

    const result = await updateProductPrice(
      productId,
      newRetail,
      newWholesale,
      size,
      { retailPrice: newRetail, wholesalePrice: newWholesale }
    );

    if (result.success) {
      setProduct(getProductDetail(productId));
      showNotification("success", "บันทึกราคาเรียบร้อย");
      setEditingSizePrice(null);
    } else {
      showNotification("error", result.message);
    }
  };

  const handleCancelPrice = () => {
    setEditingSizePrice(null);
  };

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">กำลังโหลดข้อมูลสินค้า...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="card shadow-sm text-center p-5">
        <h2 className="text-danger mb-3">ไม่พบข้อมูลสินค้า</h2>
        <p className="text-muted mb-4">
          สินค้าที่คุณกำลังมองหาอาจไม่มีอยู่ในระบบแล้ว
        </p>
        <button
          onClick={() => navigate("/products")}
          className="btn btn-primary"
        >
          กลับสู่หน้ารายการสินค้า
        </button>
      </div>
    );
  }

  const productAvailableSizes = product.availableSizes || [];

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center mb-3">
        <button
          onClick={() => navigate("/products")}
          className="btn btn-outline-secondary d-flex align-items-center"
        >
          <ArrowLeft size={20} className="me-2" />
          กลับสู่หน้ารายการสินค้า
        </button>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-4">
            <div className="col-md-4">
              <div
                className="product-image-large bg-light rounded-3 d-flex align-items-center justify-content-center overflow-hidden"
                style={{ height: "400px" }}
              >
                <img
                  src={product.imageUrl}
                  alt={product.productName}
                  className="img-fluid rounded-3"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
                <div
                  className="no-image-large text-muted opacity-50 fs-1"
                  style={{ display: "none" }}
                >
                  📷
                </div>
              </div>
            </div>
            <div className="col-md-8">
              <h2 className="display-5 text-dark mb-3">
                {product.productName}
              </h2>
              <p className="text-muted mb-1">รหัสสินค้า: {product.productId}</p>
              <p className="text-muted text-uppercase mb-4">
                หมวดหมู่: {product.category}
              </p>
              <div className="bg-primary text-white p-3 rounded-pill d-flex align-items-center justify-content-center gap-2 mb-4">
                <Package size={24} />
                <span className="fw-bold fs-5">
                  สต็อกคงเหลือทั้งหมด: {product.totalStock} ชิ้น
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <h3 className="h4 text-dark mb-4 text-center">
            จัดการสต็อกและราคาตามขนาด
          </h3>
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {productAvailableSizes.map((size) => {
              const currentStock = product.stockBySize?.[size] || 0;
              const sizePriceInfo = product.pricesBySize?.[size];
              const retailPrice = sizePriceInfo?.retailPrice || 0;
              const wholesalePrice = sizePriceInfo?.wholesalePrice || 0;
              const isEditing = editingSizePrice === size;

              return (
                <div key={size} className="col">
                  <div className="card h-100 p-4 text-center border-2 shadow-sm transition-border-transform">
                    <h4 className="card-title fw-bold mb-3">ขนาด {size}</h4>
                    <div className="display-4 fw-bold text-primary mb-3">
                      {currentStock}
                    </div>

                    <div className="mb-4 text-sm text-gray-700">
                      {isEditing ? (
                        <div className="price-edit-form">
                          <div className="mb-2">
                            <label className="form-label mb-0">ราคาปลีก:</label>
                            <input
                              type="number"
                              value={editedRetailPrice}
                              onChange={(e) =>
                                setEditedRetailPrice(e.target.value)
                              }
                              className="form-control form-control-sm text-center"
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label mb-0">ราคาส่ง:</label>
                            <input
                              type="number"
                              value={editedWholesalePrice}
                              onChange={(e) =>
                                setEditedWholesalePrice(e.target.value)
                              }
                              className="form-control form-control-sm text-center"
                            />
                          </div>
                          <div className="d-flex justify-content-center gap-2">
                            <button
                              onClick={() => handleSavePrice(size)}
                              className="btn btn-success btn-sm d-flex align-items-center"
                            >
                              <Save size={16} className="me-1" /> บันทึก
                            </button>
                            <button
                              onClick={handleCancelPrice}
                              className="btn btn-secondary btn-sm d-flex align-items-center"
                            >
                              <XCircle size={16} className="me-1" /> ยกเลิก
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="mb-1">
                            ปลีก: ฿{retailPrice.toLocaleString()}
                          </p>
                          <p className="mb-3">
                            ส่ง: ฿{wholesalePrice.toLocaleString()}
                          </p>
                          <button
                            onClick={() => handleEditPriceClick(size)}
                            className="btn btn-outline-primary btn-sm d-flex align-items-center mx-auto"
                          >
                            <Edit size={16} className="me-1" /> แก้ไขราคา
                          </button>
                        </>
                      )}
                    </div>

                    {!isEditing && (
                      <>
                        <div className="d-flex justify-content-center gap-2 mb-3">
                          <button
                            onClick={() => handleUpdateStock(size, -1)}
                            disabled={currentStock <= 0}
                            className="btn btn-danger rounded-circle p-2 d-flex align-items-center justify-content-center"
                            style={{ width: "45px", height: "45px" }}
                          >
                            <MinusCircle size={20} />
                          </button>
                          <button
                            onClick={() => handleUpdateStock(size, 1)}
                            className="btn btn-success rounded-circle p-2 d-flex align-items-center justify-content-center"
                            style={{ width: "45px", height: "45px" }}
                          >
                            <PlusCircle size={20} />
                          </button>
                        </div>
                        <div className="border-top pt-3">
                          <input
                            type="number"
                            min="1"
                            value={quantityInput}
                            onChange={(e) =>
                              setQuantityInput(parseInt(e.target.value) || 1)
                            }
                            className="form-control mb-2 text-center"
                          />
                          <div className="d-flex gap-2 justify-content-center">
                            <button
                              onClick={() => handleBulkUpdateStock(size, "add")}
                              className="btn btn-success flex-grow-1"
                            >
                              เพิ่ม
                            </button>
                            <button
                              onClick={() =>
                                handleBulkUpdateStock(size, "subtract")
                              }
                              disabled={currentStock < quantityInput}
                              className="btn btn-danger flex-grow-1"
                            >
                              ลด
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {notification && (
        <div
          className={`notification alert alert-dismissible fade show ${
            notification.type === "success" ? "alert-success" : "alert-danger"
          }`}
          role="alert"
        >
          {notification.message}
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="alert"
            aria-label="Close"
            onClick={() => setNotification(null)}
          ></button>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
