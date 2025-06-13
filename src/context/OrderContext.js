// ไฟล์: src/context/OrderContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// './App.css'; // บรรทัดนี้ถูกลบออกหรือคอมเมนต์ไว้แล้ว

const OrderContext = createContext();

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

// OrderProvider จะไม่รับ db, auth, appId แล้ว
export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [isOrdersLoaded, setIsOrdersLoaded] = useState(false);

  const API_BASE_URL = 'http://localhost:5000/api'; // Express API URL

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders`);
      const data = await res.json();
      // Assume API returns sorted orders, otherwise sort client-side
      setOrders(data);
      setIsOrdersLoaded(true);
      console.log("Orders fetched from Express Backend.");
    } catch (error) {
      console.error("Error fetching orders from Express Backend:", error);
      setIsOrdersLoaded(true); // Still set to true
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addOrder = async (orderData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add order');
      fetchData(); // Re-fetch to update state
      console.log("Order added via API:", data);
      return data;
    } catch (error) {
      console.error("Error adding order via API:", error);
      // alert(`ไม่สามารถเพิ่มคำสั่งซื้อได้: ${error.message}`); // Removed alert
      return null;
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update order status');
      fetchData(); // Re-fetch to update state
      console.log("Order status updated via API:", data);
      return data;
    } catch (error) {
      console.error("Error updating order status via API:", error);
      // alert(`ไม่สามารถอัปเดตสถานะคำสั่งซื้อได้: ${error.message}`); // Removed alert
      return null;
    }
  };

  const deleteOrder = async (orderId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete order');
      }
      fetchData(); // Re-fetch to update state
      console.log("Order deleted via API:", orderId);
      return { success: true };
    } catch (error) {
      console.error("Error deleting order via API:", error);
      // alert(`ไม่สามารถลบคำสั่งซื้อได้: ${error.message}`); // Removed alert
      return { success: false, message: error.message };
    }
  };

  const getOrderById = useCallback((orderId) => {
    return orders.find(order => order.orderId === orderId);
  }, [orders]);

  const getOrdersByCustomer = useCallback((customerId) => {
    return orders.filter(order => order.customerId === customerId);
  }, [orders]);

  const value = {
    orders,
    isOrdersLoaded,
    addOrder,
    updateOrderStatus,
    deleteOrder,
    getOrderById,
    getOrdersByCustomer
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};