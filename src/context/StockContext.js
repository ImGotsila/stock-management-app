// ไฟล์: src/context/StockContext.js
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const StockContext = createContext();

export const useStock = () => {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error('useStock must be used within a StockProvider');
  }
  return context;
};

// StockProvider จะไม่รับ db, auth, appId แล้ว
export const StockProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [stock, setStock] = useState([]); // stock array (raw stock data)
  const [logs, setLogs] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false); // สถานะบ่งชี้ว่าข้อมูลเริ่มต้นโหลดแล้ว

  const API_BASE_URL = 'http://localhost:5000/api'; // Express API URL

  // Function to fetch all data from Express API
  const fetchData = useCallback(async () => {
    try {
      // Products API now returns products combined with pricing and stock by size
      const productsRes = await fetch(`${API_BASE_URL}/products`);
      const productsData = await productsRes.json();
      setProducts(productsData); // products state will hold this combined data

      // CORRECTED: Fetch raw stock data from /api/stock_raw endpoint
      const rawStockRes = await fetch(`${API_BASE_URL}/stock_raw`); 
      const rawStockData = await rawStockRes.json();
      setStock(rawStockData); // Store raw stock data

      const logsRes = await fetch(`${API_BASE_URL}/logs`);
      const logsData = await logsRes.json();
      setLogs(logsData);
      
      setIsDataLoaded(true);
      console.log("Data fetched from Express Backend.");
    } catch (error) {
      console.error("Error fetching data from Express Backend:", error);
      setIsDataLoaded(true); // Still set to true to avoid perpetual loading, but indicate error
    }
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
    // เนื่องจาก Express.js ไม่รองรับ Real-time updates แบบ Firestore ได้โดยตรง
    // คุณอาจต้องใช้ Polling หากต้องการอัปเดตข้อมูลแบบ Real-time มากขึ้น (แต่ไม่แนะนำสำหรับแอปขนาดเล็ก)
    // const intervalId = setInterval(fetchData, 5000); // Fetch every 5 seconds
    // return () => clearInterval(intervalId);
  }, [fetchData]);

  // Helper to get products with combined stock (now relies on Express API returning combined data)
  const getProductsWithStock = () => {
    // If Express API returns combined products+stock, this is simpler
    // Otherwise, you'd combine products and stock data here client-side
    return products; // Assuming products state already has combined info from API
  };

  const getProductDetail = (productId) => {
    return products.find(p => p.productId === productId); // Assuming products state has detail
  };

  const updateStock = async (productId, size, quantityChange, action) => {
    try {
      const res = await fetch(`${API_BASE_URL}/stock/${productId}/${size}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantityChange, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update stock');
      }
      fetchData(); // Re-fetch all data to update state
      return { success: true, message: data.message };
    } catch (error) {
      console.error("Error updating stock via API:", error);
      return { success: false, message: error.message };
    }
  };

  const updateProductQuantity = (productId, size, quantityChange) => {
    return updateStock(productId, size, quantityChange, quantityChange < 0 ? 'ขายสินค้า' : 'เพิ่มสต็อก');
  };

  // Function to add or remove a size for a product
  const addOrRemoveProductSize = async (productId, size, action) => { // 'add' or 'remove'
    try {
      const productToUpdate = products.find(p => p.productId === productId);
      if (!productToUpdate) throw new Error("Product not found.");

      let newAvailableSizes = [...(productToUpdate.availableSizes || [])];
      
      if (action === 'add' && !newAvailableSizes.includes(size)) {
        newAvailableSizes.push(size);
        newAvailableSizes.sort(); // Sort sizes for consistency
      } else if (action === 'remove') {
        newAvailableSizes = newAvailableSizes.filter(s => s !== size);
        // Backend's DELETE /api/stock/:productId/:size is designed for stock.
        // For removing a size and its stock entry, you'd need to send a specific request to backend.
        // For simplicity, here we update sizes in frontend and let backend handle stock cleanup if size removed.
      }
      
      // Send a PUT request to update product's availableSizes
      const res = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availableSizes: newAvailableSizes }), // Send updated availableSizes
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update sizes');
      fetchData(); // Re-fetch all data to update state
      return { success: true, message: data.message };
    } catch (error) {
      console.error("Error updating product sizes via API:", error);
      return { success: false, message: error.message };
    }
  };

  // Function to update product's overall retail/wholesale price or size-specific prices
  const updateProductPrice = async (productId, newRetailPrice, newWholesalePrice, sizeToUpdate = null, newSizeSpecificPrices = null) => {
    try {
      const productToUpdate = products.find(p => p.productId === productId);
      if (!productToUpdate) throw new Error("Product not found.");

      let updatedPricesBySize = { ...productToUpdate.pricesBySize };
      let updatedGeneralPrices = {};

      if (sizeToUpdate && newSizeSpecificPrices) {
        // Update specific size price
        updatedPricesBySize[sizeToUpdate] = newSizeSpecificPrices;
      } else {
        // Update general prices if no specific size is mentioned
        updatedGeneralPrices = { retailPrice: newRetailPrice, wholesalePrice: newWholesalePrice };
      }

      const res = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updatedGeneralPrices, // General prices (if provided)
          pricesBySize: updatedPricesBySize // Updated size-specific prices
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update prices');
      fetchData(); // Re-fetch all data to update state
      return { success: true, message: data.message };
    } catch (error) {
      console.error("Error updating product price via API:", error);
      return { success: false, message: error.message };
    }
  };

  // Reset all data (requires API endpoint)
  const resetData = async () => {
    if (!window.confirm("คุณแน่ใจหรือไม่ที่จะรีเซ็ตข้อมูลทั้งหมด? ข้อมูลปัจจุบันในระบบจะถูกลบ!")) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/reset-data`, { method: 'POST' }); // Assumes you create this endpoint
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to reset data');
      }
      fetchData(); // Re-fetch all data to update state
      alert('รีเซ็ตข้อมูลเรียบร้อยแล้ว!');
      return { success: true };
    } catch (error) {
      console.error("Error resetting data via API:", error);
      alert(`ไม่สามารถรีเซ็ตข้อมูลได้: ${error.message}`);
      return { success: false, message: error.message };
    }
  };

  const value = {
    products,
    stock, // stock state will hold raw stock data
    logs,
    getProductsWithStock,
    getProductDetail,
    updateStock,
    updateProductQuantity,
    addOrRemoveProductSize, 
    updateProductPrice,     
    resetData,
    isDataLoaded
  };

  return (
    <StockContext.Provider value={value}>
      {children}
    </StockContext.Provider>
  );
};
