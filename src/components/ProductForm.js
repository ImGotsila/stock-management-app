// src/components/ProductForm.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStock } from '../context/StockContext';
import { PlusCircle, MinusCircle, Upload, Save, XCircle, ArrowLeft } from 'lucide-react';

const ProductForm = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { getProductDetail, addProduct, updateProduct } = useStock();

  const isEditMode = !!productId;

  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [baseRetailPrice, setBaseRetailPrice] = useState('');
  const [baseWholesalePrice, setBaseWholesalePrice] = useState('');
  const [availableSizes, setAvailableSizes] = useState([{ size: '', retailPrice: '', wholesalePrice: '' }]);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImageUrls, setExistingImageUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null); // ใช้ notification state แทน error

  /**
   * Displays a notification message to the user.
   * @param {string} type - 'success' or 'error'
   * @param {string} message - The message content.
   */
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Load product data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const productToEdit = getProductDetail(productId);
      if (productToEdit) {
        setProductName(productToEdit.productName || '');
        setCategory(productToEdit.category || '');
        setDescription(productToEdit.description || '');
        setBaseRetailPrice(productToEdit.retailPrice || '');
        setBaseWholesalePrice(productToEdit.wholesalePrice || '');

        if (productToEdit.availableSizes && productToEdit.availableSizes.length > 0) {
          const sizesWithPrices = productToEdit.availableSizes.map(size => ({
            size: size,
            retailPrice: productToEdit.pricesBySize?.[size]?.retailPrice || '',
            wholesalePrice: productToEdit.pricesBySize?.[size]?.wholesalePrice || ''
          }));
          setAvailableSizes(sizesWithPrices);
        } else {
          setAvailableSizes([{ size: '', retailPrice: '', wholesalePrice: '' }]);
        }

        setExistingImageUrls(productToEdit.imageUrls || []);
        setLoading(false);
      } else {
        showNotification('error', 'ไม่พบสินค้าที่ต้องการแก้ไข'); // ใช้ showNotification
        setLoading(false);
        setTimeout(() => navigate('/products'), 2000); // Navigate after notification
      }
    } else {
      setLoading(false);
    }
  }, [isEditMode, productId, getProductDetail, navigate]);

  const handleSizeChange = (index, field, value) => {
    const newSizes = [...availableSizes];
    newSizes[index][field] = value;
    setAvailableSizes(newSizes);
  };

  const handleAddSize = () => {
    setAvailableSizes([...availableSizes, { size: '', retailPrice: '', wholesalePrice: '' }]);
  };

  const handleRemoveSize = (index) => {
    const newSizes = availableSizes.filter((_, i) => i !== index);
    setAvailableSizes(newSizes.length > 0 ? newSizes : [{ size: '', retailPrice: '', wholesalePrice: '' }]);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    // Limit to 10 images total (existing + new)
    if (existingImageUrls.length + imageFiles.length + files.length > 10) {
      showNotification('error', 'สามารถอัปโหลดรูปภาพได้สูงสุด 10 รูป'); // ใช้ showNotification
      return;
    }
    setImageFiles(prevFiles => [...prevFiles, ...files]);
  };

  const handleRemoveImage = (indexToRemove, isExisting = false) => {
    if (isExisting) {
      setExistingImageUrls(prevUrls => prevUrls.filter((_, index) => index !== indexToRemove));
    } else {
      setImageFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotification(null); // Clear previous notifications

    // Basic validation
    if (!productName || !category) {
      showNotification('error', 'โปรดกรอกชื่อสินค้าและหมวดหมู่'); // ใช้ showNotification
      return;
    }

    // Validate sizes and prices
    const sizesData = {};
    const hasDuplicateSizes = new Set(availableSizes.filter(s => s.size.trim() !== '').map(s => s.size.trim())).size !== availableSizes.filter(s => s.size.trim() !== '').length;
    if (hasDuplicateSizes) {
      showNotification('error', 'มีขนาดสินค้าซ้ำกัน โปรดแก้ไข'); // ใช้ showNotification
      return;
    }

    // Check if at least one size is defined or if there's a base price for a product without sizes
    const hasDefinedSizes = availableSizes.some(s => s.size.trim() !== '');
    if (!hasDefinedSizes && (!baseRetailPrice && !baseWholesalePrice)) {
      showNotification('error', 'โปรดเพิ่มอย่างน้อยหนึ่งขนาดสินค้าพร้อมราคา หรือกรอกราคาพื้นฐานของสินค้า');
      return;
    }

    availableSizes.forEach(s => {
      const trimmedSize = s.size.trim();
      if (trimmedSize) { // Only add if size name is provided
        sizesData[trimmedSize] = {
          retailPrice: parseFloat(s.retailPrice) || 0,
          wholesalePrice: parseFloat(s.wholesalePrice) || 0
        };
      }
    });

    // Prepare form data for API
    const formData = new FormData();
    formData.append('productName', productName);
    formData.append('category', category);
    formData.append('description', description);
    formData.append('retailPrice', parseFloat(baseRetailPrice) || 0); // Base price if not by size
    formData.append('wholesalePrice', parseFloat(baseWholesalePrice) || 0); // Base price if not by size
    formData.append('availableSizes', JSON.stringify(Object.keys(sizesData))); // Array of size names
    formData.append('pricesBySize', JSON.stringify(sizesData)); // Object of prices by size

    // Add existing image URLs back to form data (if editing)
    existingImageUrls.forEach(url => {
      formData.append('existingImageUrls', url);
    });

    // Append new image files
    imageFiles.forEach((file) => {
      formData.append('images', file);
    });

    let result;
    if (isEditMode) {
      result = await updateProduct(productId, formData);
    } else {
      result = await addProduct(formData);
    }

    if (result && result.success) {
      showNotification('success', isEditMode ? 'บันทึกข้อมูลสินค้าเรียบร้อย!' : 'เพิ่มสินค้าใหม่เรียบร้อย!');
      setTimeout(() => navigate('/products'), 1500);
    } else {
      showNotification('error', result?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูลสินค้า');
    }
  };

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading product data...</span>
        </div>
        <p className="mt-3">กำลังโหลดข้อมูลสินค้า...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center mb-3">
        <button onClick={() => navigate('/products')} className="btn btn-outline-secondary d-flex align-items-center">
          <ArrowLeft size={20} className="me-2" />
          กลับสู่หน้ารายการสินค้า
        </button>
      </div>

      <div className="card shadow-sm p-4">
        <h2 className="h3 text-dark mb-4">{isEditMode ? 'แก้ไขรายละเอียดสินค้า' : 'เพิ่มสินค้าใหม่'}</h2>

        {notification && ( // แสดง notification แทน error
          <div className={`alert alert-dismissible fade show ${notification.type === 'success' ? 'alert-success' : 'alert-danger'}`} role="alert">
            {notification.message}
            <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={() => setNotification(null)}></button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="productName" className="form-label">ชื่อสินค้า <span className="text-danger">*</span></label>
            <input
              type="text"
              className="form-control"
              id="productName"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="category" className="form-label">หมวดหมู่ <span className="text-danger">*</span></label>
            <input
              type="text"
              className="form-control"
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="description" className="form-label">รายละเอียดสินค้า</label>
            <textarea
              className="form-control"
              id="description"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          {/* New fields for base retail and wholesale prices */}
          <div className="row g-3 mb-4 p-3 border rounded bg-light">
            <h4 className="h5 mb-3">ราคาพื้นฐาน (ใช้เมื่อสินค้าไม่มีขนาดเฉพาะ)</h4>
            <div className="col-md-6">
              <label htmlFor="baseRetailPrice" className="form-label">ราคาปลีกพื้นฐาน</label>
              <input
                type="number"
                className="form-control"
                id="baseRetailPrice"
                placeholder="ราคาปลีก"
                value={baseRetailPrice}
                onChange={(e) => setBaseRetailPrice(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="baseWholesalePrice" className="form-label">ราคาส่งพื้นฐาน</label>
              <input
                type="number"
                className="form-control"
                id="baseWholesalePrice"
                placeholder="ราคาส่ง"
                value={baseWholesalePrice}
                onChange={(e) => setBaseWholesalePrice(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* ส่วนการจัดการขนาดและราคาตามขนาด */}
          <div className="mb-4 p-3 border rounded bg-light">
            <h4 className="h5 mb-3">ขนาดและราคา (ถ้ามี)</h4>
            {availableSizes.map((sizeData, index) => (
              <div key={index} className="row g-2 align-items-end mb-2">
                <div className="col-md-3">
                  <label htmlFor={`size-${index}`} className="form-label visually-hidden">ขนาด</label>
                  <input
                    type="text"
                    className="form-control"
                    id={`size-${index}`}
                    placeholder="เช่น S, M, L, XL"
                    value={sizeData.size}
                    onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <label htmlFor={`retailPrice-${index}`} className="form-label visually-hidden">ราคาปลีก</label>
                  <input
                    type="number"
                    className="form-control"
                    id={`retailPrice-${index}`}
                    placeholder="ราคาปลีก"
                    value={sizeData.retailPrice}
                    onChange={(e) => handleSizeChange(index, 'retailPrice', e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="col-md-3">
                  <label htmlFor={`wholesalePrice-${index}`} className="form-label visually-hidden">ราคาส่ง</label>
                  <input
                    type="number"
                    className="form-control"
                    id={`wholesalePrice-${index}`}
                    placeholder="ราคาส่ง"
                    value={sizeData.wholesalePrice}
                    onChange={(e) => handleSizeChange(index, 'wholesalePrice', e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="col-md-3 text-end">
                  {availableSizes.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleRemoveSize(index)}
                    >
                      <MinusCircle size={16} /> ลบ
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button type="button" className="btn btn-outline-primary mt-2" onClick={handleAddSize}>
              <PlusCircle size={16} className="me-2" /> เพิ่มขนาด
            </button>
          </div>

          {/* ส่วนการจัดการรูปภาพ */}
          <div className="mb-4 p-3 border rounded bg-light">
            <h4 className="h5 mb-3">รูปภาพสินค้า (1-10 รูป)</h4>
            <div className="input-group mb-3">
              <input
                type="file"
                className="form-control"
                id="imageUpload"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                disabled={existingImageUrls.length + imageFiles.length >= 10}
              />
              <label className="input-group-text" htmlFor="imageUpload">
                <Upload size={18} className="me-2" /> อัปโหลดรูปภาพ
              </label>
            </div>
            {(existingImageUrls.length > 0 || imageFiles.length > 0) && (
              <div className="d-flex flex-wrap gap-2 mt-3">
                {existingImageUrls.map((url, index) => (
                  <div key={`existing-${index}`} className="position-relative border rounded p-1" style={{ width: '100px', height: '100px', objectFit: 'cover' }}>
                    <img src={url} alt={`Existing product ${index}`} className="img-fluid rounded" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      className="btn btn-danger btn-sm position-absolute top-0 end-0 translate-middle rounded-circle"
                      onClick={() => handleRemoveImage(index, true)}
                      style={{ width: '24px', height: '24px', fontSize: '0.75rem', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <XCircle size={14} />
                    </button>
                  </div>
                ))}
                {imageFiles.map((file, index) => (
                  <div key={`new-${index}`} className="position-relative border rounded p-1" style={{ width: '100px', height: '100px', objectFit: 'cover' }}>
                    <img src={URL.createObjectURL(file)} alt={`New product ${index}`} className="img-fluid rounded" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      className="btn btn-danger btn-sm position-absolute top-0 end-0 translate-middle rounded-circle"
                      onClick={() => handleRemoveImage(index, false)}
                      style={{ width: '24px', height: '24px', fontSize: '0.75rem', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <XCircle size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="d-flex justify-content-end">
            <button type="submit" className="btn btn-primary btn-lg">
              <Save size={20} className="me-2" />
              {isEditMode ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;