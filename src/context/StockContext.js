// src/context/StockContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const StockContext = createContext();

export const useStock = () => {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error('useStock must be used within a StockProvider');
  }
  return context;
};

export const StockProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [stockLogs, setStockLogs] = useState([]);
  const [isProductsLoaded, setIsProductsLoaded] = useState(false);

  const API_BASE_URL = 'http://localhost:5000/api'; // Express API URL

  // Fetch Products and Stock Logs
  const fetchData = useCallback(async () => {
    try {
      // Fetch products
      const productsRes = await fetch(`${API_BASE_URL}/products`);
      if (!productsRes.ok) throw new Error('Failed to fetch products');
      const productsData = await productsRes.json();

      // Fetch stock logs
      const logsRes = await fetch(`${API_BASE_URL}/stock-logs`);
      if (!logsRes.ok) throw new Error('Failed to fetch stock logs');
      const logsData = await logsRes.json();

      setStockLogs(logsData);

      // Map stock data into products
      const productsWithStock = productsData.map(product => {
        const productLogs = logsData.filter(log => log.productId === product.productId);
        const stockBySize = {};
        let totalStock = 0;

        // Calculate current stock for each size
        if (product.availableSizes) {
          product.availableSizes.forEach(size => {
            const initialStock = product.initialStockBySize?.[size] || 0; // Use initialStockBySize from product
            const sizeLogs = productLogs.filter(log => log.size === size);
            const netChange = sizeLogs.reduce((sum, log) => sum + log.quantityChange, 0);
            stockBySize[size] = initialStock + netChange;
            totalStock += stockBySize[size];
          });
        }

        return {
          ...product,
          stockBySize,
          totalStock
        };
      });

      setProducts(productsWithStock);
      setIsProductsLoaded(true);
      console.log("Products and Stock Logs fetched from Express Backend.");
    } catch (error) {
      console.error("Error fetching data from Express Backend:", error);
      setIsProductsLoaded(true); // Still set to true even if fetch fails
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Add Product
  const addProduct = async (productData) => { // productData will be FormData
    try {
      const res = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        body: productData, // productData is already FormData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add product');
      fetchData(); // Re-fetch to update state
      console.log("Product added via API:", data);
      return { success: true, product: data };
    } catch (error) {
      console.error("Error adding product via API:", error);
      return { success: false, message: error.message };
    }
  };

  // Update Product
  const updateProduct = async (productId, productData) => { // productData will be FormData
    try {
      const res = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'PUT',
        body: productData, // productData is already FormData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update product');
      fetchData(); // Re-fetch to update state
      console.log("Product updated via API:", data);
      return { success: true, product: data };
    } catch (error) {
      console.error("Error updating product via API:", error);
      return { success: false, message: error.message };
    }
  };

  // Update Stock Quantity (existing function, ensure it logs to API)
  const updateStock = async (productId, size, quantityChange, type) => {
    try {
      const logEntry = {
        productId,
        size,
        quantityChange,
        type, // 'เพิ่มสต็อก', 'ลดสต็อก', 'ขายออก', 'รับคืน'
        timestamp: new Date().toISOString(),
      };

      const res = await fetch(`${API_BASE_URL}/stock-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logEntry),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update stock');
      fetchData(); // Re-fetch to update state and product stocks
      console.log("Stock updated and logged via API:", data);
      return { success: true, message: 'อัปเดตสต็อกเรียบร้อย' };
    } catch (error) {
      console.error("Error updating stock via API:", error);
      return { success: false, message: error.message };
    }
  };

  // New function for updating product quantity (specifically for OrderForm)
  const updateProductQuantity = async (productId, size, quantityChange) => {
    // This function will directly call updateStock with a specific type
    return await updateStock(productId, size, quantityChange, 'ขายออก');
  };


  // Update Product Price (existing function, ensure it calls API for product update)
  const updateProductPrice = async (productId, retailPrice, wholesalePrice, size, pricesBySize) => {
    try {
      const product = products.find(p => p.productId === productId);
      if (!product) throw new Error('Product not found');

      // Prepare payload for product update
      const updatePayload = {};

      if (size) { // If updating a specific size's price
        const updatedPricesBySize = { ...product.pricesBySize, [size]: { retailPrice, wholesalePrice } };
        updatePayload.pricesBySize = updatedPricesBySize;
      } else { // If updating base retail/wholesale price (for products without sizes)
        updatePayload.retailPrice = retailPrice;
        updatePayload.wholesalePrice = wholesalePrice;
      }

      const res = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update product prices');
      fetchData(); // Re-fetch to update state
      console.log("Product prices updated via API:", data);
      return { success: true, message: 'อัปเดตราคาเรียบร้อย' };
    } catch (error) {
      console.error("Error updating product prices via API:", error);
      return { success: false, message: error.message };
    }
  };

  const getProductsWithStock = useCallback(() => products, [products]);
  const getProductDetail = useCallback((productId) => products.find(p => p.productId === productId), [products]);
  const getStockLogs = useCallback(() => stockLogs, [stockLogs]);
  const getProductStockLogs = useCallback((productId) => stockLogs.filter(log => log.productId === productId), [stockLogs]);

  // New: deleteProduct (if needed, otherwise remove from context if not used)
  const deleteProduct = async (productId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete product');
      }
      fetchData(); // Re-fetch to update state
      console.log("Product deleted via API:", productId);
      return { success: true };
    } catch (error) {
      console.error("Error deleting product via API:", error);
      return { success: false, message: error.message };
    }
  };

  const resetData = () => {
    // This function might need to call backend APIs to reset data,
    // or you might remove it if you manage data persistence entirely via backend.
    // For now, it will simply re-fetch data.
    console.warn("Reset data initiated. Re-fetching data from backend.");
    fetchData();
  };


  const value = {
    products,
    stockLogs,
    isProductsLoaded,
    getProductsWithStock,
    getProductDetail,
    getStockLogs,
    getProductStockLogs,
    updateStock,
    updateProductPrice,
    addProduct,
    updateProduct,
    deleteProduct,
    resetData,
    updateProductQuantity // Expose the new function
  };

  return (
    <StockContext.Provider value={value}>
      {children}
    </StockContext.Provider>
  );
};