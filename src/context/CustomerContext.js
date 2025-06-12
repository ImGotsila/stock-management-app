// ไฟล์: src/context/CustomerContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import './App.css'; // ตรวจสอบว่ามีบรรทัดนี้อยู่
const CustomerContext = createContext();

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
};

// CustomerProvider จะไม่รับ db, auth, appId แล้ว
export const CustomerProvider = ({ children }) => {
  const [customers, setCustomers] = useState([]);
  const [isCustomersLoaded, setIsCustomersLoaded] = useState(false);

  const API_BASE_URL = 'http://localhost:5000/api'; // Express API URL

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/customers`);
      const data = await res.json();
      setCustomers(data);
      setIsCustomersLoaded(true);
      console.log("Customers fetched from Express Backend.");
    } catch (error) {
      console.error("Error fetching customers from Express Backend:", error);
      setIsCustomersLoaded(true); // Still set to true
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addCustomer = async (customerData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add customer');
      fetchData(); // Re-fetch to update state
      console.log("Customer added via API:", data);
      return data;
    } catch (error) {
      console.error("Error adding customer via API:", error);
      alert(`ไม่สามารถเพิ่มลูกค้าได้: ${error.message}`);
      return null;
    }
  };

  const updateCustomer = async (customerId, customerData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/customers/${customerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update customer');
      fetchData(); // Re-fetch to update state
      console.log("Customer updated via API:", data);
      return data;
    } catch (error) {
      console.error("Error updating customer via API:", error);
      alert(`ไม่สามารถอัปเดตลูกค้าได้: ${error.message}`);
      return null;
    }
  };

  const deleteCustomer = async (customerId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/customers/${customerId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete customer');
      }
      fetchData(); // Re-fetch to update state
      console.log("Customer deleted via API:", customerId);
      return { success: true };
    } catch (error) {
      console.error("Error deleting customer via API:", error);
      alert(`ไม่สามารถลบลูกค้าได้: ${error.message}`);
      return { success: false, message: error.message };
    }
  };

  const getCustomerById = useCallback((customerId) => {
    return customers.find(customer => customer.customerId === customerId);
  }, [customers]);

  const value = {
    customers,
    isCustomersLoaded,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerById
  };

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
};
