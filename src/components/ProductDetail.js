/ src/components/ProductDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStock } from '../context/StockContext';
import { MinusCircle, PlusCircle, ArrowLeft, Package, Edit, Save, XCircle } from 'lucide-react'; // เพิ่มไอคอน Edit, Save, XCircle

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { getProductDetail, updateStock, products, stock, updateProductPrice } = useStock(); // เพิ่ม updateProductPrice

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantityInput, setQuantityInput] = useState(1);
  const [notification, setNotification] = useState(null);

  // States สำหรับการแก้ไขราคาแต่ละขนาด
  const [editingSizePrice, setEditingSizePrice] = useState(null); // เก็บขนาดที่กำลังแก้ไขราคา เช่น 'S', 'M'
  const [editedRetailPrice, setEditedRetailPrice] = useState(0);
  const [editedWholesalePrice, setEditedWholesalePrice] = useState(0);

  useEffect(() => {
    const fetchedProduct = getProductDetail(productId);
    if (fetchedProduct) {
      setProduct(fetchedProduct);
    } else {
      setNotification({ type: 'error', message: 'ไม่พบสินค้าที่ต้องการ' });
      setTimeout(() => navigate('/products'), 2000);
    }
    setLoading(false);
  }, [productId, getProductDetail, navigate, stock]); // 'stock' เป็น dependency เพื่อให้ข้อมูลอัปเดตเมื่อสต็อกเปลี่ยน

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleUpdateStock = async (size, change) => {
    const result = await updateStock(productId, size, change, change > 0 ? 'เพิ่มสต็อก' : 'ลดสต็อก');
    if (result.success) {
      // ดึงข้อมูลสินค้าล่าสุดหลังจากอัปเดตสต็อก เพื่อให้ product state อัปเดต
      setProduct(getProductDetail(productId));
      showNotification('success', result.message);
    } else {
      showNotification('error', result.message);
    }
  };

  const handleBulkUpdateStock = async (size, type) => {
    const quantity = parseInt(quantityInput);
    if (isNaN(quantity) || quantity <= 0) {
      showNotification('error', 'โปรดระบุจำนวนที่ถูกต้อง');
      return;
    }

    const change = type === 'add' ? quantity : -quantity;
    await handleUpdateStock(size, change); // เรียกใช้ handleUpdateStock
    setQuantityInput(1);
  };

  // ===============================================
  // ฟังก์ชันสำหรับการจัดการราคาแต่ละขนาด
  // ===============================================
  const handleEditPriceClick = (size) => {
    const priceInfo = product.pricesBySize?.[size];
    setEditedRetailPrice(priceInfo?.retailPrice || 0);
    setEditedWholesalePrice(priceInfo?.wholesalePrice || 0);
    setEditingSizePrice(size); // เข้าสู่โหมดแก้ไขสำหรับขนาดนี้
  };

  const handleSavePrice = async (size) => {
    const newRetail = parseFloat(editedRetailPrice);
    const newWholesale = parseFloat(editedWholesalePrice);

    if (isNaN(newRetail) || isNaN(newWholesale) || newRetail < 0 || newWholesale < 0) {
      showNotification('error', 'โปรดกรอกราคาที่ถูกต้อง');
      return;
    }

    const result = await updateProductPrice(
      productId,
      newRetail,
      newWholesale,
      size, // ส่ง size ไปด้วย
      { retailPrice: newRetail, wholesalePrice: newWholesale } // ส่ง object ราคาของขนาดนั้นๆ
    );

    if (result.success) {
      setProduct(getProductDetail(productId)); // อัปเดตข้อมูลสินค้าล่าสุด
      showNotification('success', 'บันทึกราคาเรียบร้อย');
      setEditingSizePrice(null); // ออกจากโหมดแก้ไข
    } else {
      showNotification('error', result.message);
    }
  };

  const handleCancelPrice = () => {
    setEditingSizePrice(null); // ออกจากโหมดแก้ไข
  };


  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>กำลังโหลดข้อมูลสินค้า...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="error-container">
        <h2>ไม่พบข้อมูลสินค้า</h2>
        <p>สินค้าที่คุณกำลังมองหาอาจไม่มีอยู่ในระบบแล้ว</p>
        <button onClick={() => navigate('/products')} className="submit-btn">
          กลับสู่หน้ารายการสินค้า
        </button>
      </div>
    );
  }

  const productAvailableSizes = product.availableSizes || [];

  return (
    <div className="container">
      <div className="header">
        <button onClick={() => navigate('/products')} className="back-btn">
          <ArrowLeft size={20} />
          กลับสู่หน้ารายการสินค้า
        </button>
        <div className="header-title">
          <h1>📦 รายละเอียดสินค้า</h1>
        </div>
      </div>

      <div className="product-detail">
        <div className="product-header">
          <div className="product-image-large">
            <img
              src={product.imageUrl}
              alt={product.productName}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="no-image-large" style={{display: 'none'}}>
              📷
            </div>
          </div>
          <div className="product-info-large">
            <h2>{product.productName}</h2>
            <p className="product-id">รหัสสินค้า: {product.productId}</p>
            <p className="product-category">หมวดหมู่: {product.category}</p>
            <div className="total-stock">
              <Package size={24} />
              สต็อกคงเหลือทั้งหมด: {product.totalStock} ชิ้น
            </div>
            {/* สามารถแสดงราคาปลีก/ส่งโดยรวมได้ ถ้ามี (ซึ่งตอนนี้จะแสดง 0 ถ้าไม่มีราคาแยกขนาด) */}
            {/* <p className="mt-4 text-lg font-semibold">ราคาปลีก: ฿{product.retailPrice?.toLocaleString() || '0'}</p>
            <p className="text-lg font-semibold">ราคาส่ง: ฿{product.wholesalePrice?.toLocaleString() || '0'}</p> */}
          </div>
        </div>

        <div className="stock-management">
          <h3>จัดการสต็อกและราคาตามขนาด</h3> {/* เปลี่ยนหัวข้อ */}
          <div className="size-grid">
            {productAvailableSizes.map(size => {
              const currentStock = product.stockBySize?.[size] || 0;
              const sizePriceInfo = product.pricesBySize?.[size];
              const retailPrice = sizePriceInfo?.retailPrice || 0;
              const wholesalePrice = sizePriceInfo?.wholesalePrice || 0;

              const isEditing = editingSizePrice === size; // ตรวจสอบว่ากำลังแก้ไขขนาดนี้หรือไม่

              return (
                <div key={size} className="size-item">
                  <div className="size-label">ขนาด {size}</div>
                  <div className="stock-display">
                    {currentStock}
                  </div>
                  <div className="prices-display mb-4 text-sm text-gray-700">
                    {isEditing ? (
                      <div className="price-edit-form"> {/* เพิ่มคลาส price-edit-form */}
                        <div className="form-group">
                          <label>ราคาปลีก:</label>
                          <input
                            type="number"
                            value={editedRetailPrice}
                            onChange={(e) => setEditedRetailPrice(e.target.value)}
                            className="price-input" // เพิ่มคลาส price-input
                          />
                        </div>
                        <div className="form-group">
                          <label>ราคาส่ง:</label>
                          <input
                            type="number"
                            value={editedWholesalePrice}
                            onChange={(e) => setEditedWholesalePrice(e.target.value)}
                            className="price-input" // เพิ่มคลาส price-input
                          />
                        </div>
                        <div className="button-group">
                          <button onClick={() => handleSavePrice(size)} className="save-price-btn"> {/* เปลี่ยนคลาส submit-btn เป็น save-price-btn */}
                            <Save size={16} /> บันทึก
                          </button>
                          <button onClick={handleCancelPrice} className="cancel-price-btn"> {/* เปลี่ยนคลาส cancel-btn เป็น cancel-price-btn */}
                            <XCircle size={16} /> ยกเลิก
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p>ปลีก: ฿{retailPrice.toLocaleString()}</p>
                        <p>ส่ง: ฿{wholesalePrice.toLocaleString()}</p>
                        <button onClick={() => handleEditPriceClick(size)} className="edit-price-btn">
                          <Edit size={16} /> แก้ไขราคา
                        </button>
                      </>
                    )}
                  </div>

                  {/* Stock Update Controls */}
                  {!isEditing && ( // ซ่อนปุ่มอัปเดตสต็อกเมื่ออยู่ในโหมดแก้ไขราคา
                    <>
                      <div className="quick-controls">
                        <button
                          onClick={() => handleUpdateStock(size, -1)}
                          disabled={currentStock <= 0}
                          className="control-btn decrease-btn"
                        >
                          <MinusCircle size={20} />
                        </button>
                        <button
                          onClick={() => handleUpdateStock(size, 1)}
                          className="control-btn increase-btn"
                        >
                          <PlusCircle size={20} />
                        </button>
                      </div>
                      <div className="bulk-controls">
                        <input
                          type="number"
                          min="1"
                          value={quantityInput}
                          onChange={(e) => setQuantityInput(parseInt(e.target.value) || 1)}
                          className="quantity-input"
                        />
                        <div className="bulk-buttons">
                          <button
                            onClick={() => handleBulkUpdateStock(size, 'add')}
                            className="bulk-btn bulk-add"
                          >
                            เพิ่ม
                          </button>
                          <button
                            onClick={() => handleBulkUpdateStock(size, 'subtract')}
                            disabled={currentStock < quantityInput}
                            className="bulk-btn bulk-subtract"
                          >
                            ลด
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
          {/* ส่วนสำหรับเพิ่มขนาดใหม่ (อาจเพิ่มตรงนี้ หรือทำหน้า Product Form แยก) */}
          {/* <div className="mt-8 text-center">
            <button className="submit-btn">
              เพิ่มขนาดใหม่
            </button>
          </div> */}
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type} ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
