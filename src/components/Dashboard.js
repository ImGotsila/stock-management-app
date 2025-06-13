// src/components/Dashboard.js (ทำหน้าที่เป็น Container Component)
import React, { useState, useEffect, useCallback } from "react";
import { useOrder } from "../context/OrderContext";
import { useStock } from "../context/StockContext";

// Import sub-components
import DashboardHeader from './dashboard/DashboardHeader';
import StatCards from './dashboard/StatCards';
import SalesChart from './dashboard/SalesChart';
import TopProductsChart from './dashboard/TopProductsChart';
import CategoryPieChart from './dashboard/CategoryPieChart';
import LowStockTable from './dashboard/LowStockTable';
import RecentOrdersTable from './dashboard/RecentOrdersTable';


const Dashboard = () => {
  const { orders, updateOrderStatus } = useOrder();
  const { products, getProductsWithStock, resetData } = useStock();

  const productsWithStock = getProductsWithStock();

  const [dateRange, setDateRange] = useState("7");
  const [loading, setLoading] = useState(true);

  // Custom Dialog (Moved from original Dashboard.js)
  // Adjusted Bootstrap classes for modal structure
  const showCustomDialog = (
    message,
    type = "info",
    actions = [{ label: "ตกลง", onClick: () => {} }]
  ) => {
    const dialogOverlay = document.createElement("div");
    dialogOverlay.className = "modal-backdrop fade show";
    document.body.appendChild(dialogOverlay);

    const modal = document.createElement("div");
    modal.className = "modal fade show d-block"; // d-block to force display
    modal.tabIndex = -1;
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-labelledby", "customDialogLabel");
    modal.setAttribute("aria-hidden", "true");
    modal.style.backgroundColor = "rgba(0,0,0,0.5)"; // Add a background to the modal itself

    modal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="customDialogLabel">${
              type === "error"
                ? "ข้อผิดพลาด"
                : type === "success"
                ? "สำเร็จ"
                : "แจ้งเตือน"
            }</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p class="${
              type === "error"
                ? "text-danger"
                : type === "success"
                ? "text-success"
                : "text-body"
            }">${message}</p>
          </div>
          <div class="modal-footer d-flex justify-content-center">
            </div>
        </div>
      </div>
    `;

    const modalFooter = modal.querySelector(".modal-footer");
    actions.forEach((action) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `btn ${
        action.label === "ยกเลิก"
          ? "btn-secondary"
          : action.label === "ยืนยัน"
          ? "btn-danger"
          : "btn-primary"
      }`;
      button.textContent = action.label;
      button.onclick = () => {
        action.onClick();
        modal.remove();
        dialogOverlay.remove();
      };
      modalFooter.appendChild(button);
    });

    document.body.appendChild(modal);

    // Add event listener to close button
    modal.querySelector(".btn-close").onclick = () => {
      modal.remove();
      dialogOverlay.remove();
    };
  };


  const handleUpdateOrderStatus = async (orderId, currentStatus) => {
    const statusOptions = [
      { value: "pending", label: "รอดำเนินการ" },
      { value: "shipped", label: "จัดส่งแล้ว" },
      { value: "delivered", label: "ส่งมอบแล้ว" },
      { value: "completed", label: "เสร็จสมบูรณ์" },
      { value: "cancelled", label: "ยกเลิกแล้ว" },
    ];

    const currentStatusLabel =
      statusOptions.find((opt) => opt.value === currentStatus)?.label ||
      "ไม่ระบุสถานะ";

    const statusDialog = document.createElement("div");
    statusDialog.className = "modal fade show d-block";
    statusDialog.tabIndex = -1;
    statusDialog.setAttribute("role", "dialog");
    statusDialog.setAttribute("aria-labelledby", "statusDialogLabel");
    statusDialog.setAttribute("aria-hidden", "true");
    statusDialog.style.backgroundColor = "rgba(0,0,0,0.5)"; // Add a background to the modal itself


    statusDialog.innerHTML = `
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="statusDialogLabel">อัปเดตสถานะคำสั่งซื้อ ${orderId}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p class="mb-3">สถานะปัจจุบัน: <strong>${currentStatusLabel}</strong></p>
            <div class="d-grid gap-2">
              ${statusOptions
                .map(
                  (option) => `
                <button type="button" class="btn btn-outline-primary status-select-button ${
                  option.value === currentStatus ? "active" : ""
                }" data-status="${option.value}">
                  ${option.label}
                </button>
              `
                )
                .join("")}
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ยกเลิก</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(statusDialog);
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop fade show";
    document.body.appendChild(backdrop);

    statusDialog.querySelectorAll(".status-select-button").forEach((button) => {
      button.onclick = async () => {
        const newStatus = button.dataset.status;
        statusDialog.remove();
        backdrop.remove();

        if (newStatus === currentStatus) {
          showCustomDialog(
            `สถานะคำสั่งซื้อยังคงเป็น "${currentStatusLabel}"`,
            "info"
          );
          return;
        }

        const result = await updateOrderStatus(orderId, newStatus);
        if (result && result.success) {
          showCustomDialog(
            `อัปเดตสถานะคำสั่งซื้อ ${orderId} เป็น "${
              statusOptions.find((opt) => opt.value === newStatus)?.label
            }" เรียบร้อย!`,
            "success"
          );
        } else {
          showCustomDialog(
            `เกิดข้อผิดพลาดในการอัปเดตสถานะ: ${result?.message || 'ไม่ทราบข้อผิดพลาด'}`,
            "error"
          );
        }
      };
    });

    statusDialog.querySelector(".btn-close").onclick = () => {
      statusDialog.remove();
      backdrop.remove();
    };
    statusDialog.querySelector('[data-bs-dismiss="modal"]').onclick = () => {
      statusDialog.remove();
      backdrop.remove();
    };
  };

  useEffect(() => {
    setLoading(true);
    // Simulate loading for 500ms
    setTimeout(() => {
      setLoading(false);
    }, 500);
    // Dependencies are needed here if calculations depend on `dateRange`, `products`, `orders`
  }, [dateRange, products, orders]);


  const calculateStats = useCallback(() => {
    const today = new Date();
    const daysAgo = new Date(
      today.getTime() - parseInt(dateRange) * 24 * 60 * 60 * 1000
    );

    const recentOrders = orders.filter(
      (order) => order && order.orderDate && new Date(order.orderDate) >= daysAgo
    );

    const totalRevenue = recentOrders.reduce(
      (sum, order) =>
        sum + (typeof order.grandTotal === "number" ? order.grandTotal : 0),
      0
    );
    const totalOrders = recentOrders.length;
    const totalItems = recentOrders.reduce(
      (sum, order) =>
        sum +
        (order.items
          ? order.items.reduce(
              (itemSum, item) => itemSum + (item.quantity || 0),
              0
            )
          : 0),
      0
    );
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const productSales = {};
    recentOrders.forEach((order) => {
      order.items?.forEach((item) => {
        if (productSales[item.productId]) {
          productSales[item.productId].quantity += item.quantity || 0;
          productSales[item.productId].revenue += item.totalPrice || 0;
        } else {
          productSales[item.productId] = {
            productName: item.productName,
            quantity: item.quantity || 0,
            revenue: item.totalPrice || 0,
          };
        }
      });
    });

    const topProducts = Object.entries(productSales)
      .map(([id, data]) => ({ productId: id, ...data }))
      .sort((a, b) => (b.quantity || 0) - (a.quantity || 0))
      .slice(0, 5);

    const lowStockProducts = productsWithStock.filter(
      (product) =>
        (product.totalStock || 0) <= 10 && (product.totalStock || 0) > 0
    );

    return {
      totalRevenue,
      totalOrders,
      totalItems,
      avgOrderValue,
      topProducts,
      lowStockProducts,
      recentOrders: recentOrders.sort(
        (a, b) => new Date(b.orderDate) - new Date(a.orderDate)
      ),
    };
  }, [dateRange, orders, productsWithStock]);

  const stats = calculateStats();

  const getDailySalesData = useCallback(() => {
    const days = parseInt(dateRange);
    const salesData = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dayOrders = orders.filter(
        (order) => order && order.orderDate && order.orderDate.split("T")[0] === dateStr
      );

      const dayRevenue = dayOrders.reduce(
        (sum, order) =>
          sum + (typeof order.grandTotal === "number" ? order.grandTotal : 0),
        0
      );

      salesData.push({
        date: date.toLocaleDateString("th-TH", {
          month: "short",
          day: "numeric",
        }),
        revenue: dayRevenue,
        orders: dayOrders.length,
      });
    }

    return salesData;
  }, [dateRange, orders]);

  const getCategoryData = useCallback(() => {
    const categoryStats = {};

    productsWithStock.filter(Boolean).forEach((product) => {
      if (!product || !product.category) return;

      if (categoryStats[product.category]) {
        categoryStats[product.category].count += 1;
        categoryStats[product.category].stock += product.totalStock || 0;
      } else {
        categoryStats[product.category] = {
          name: product.category,
          count: 1,
          stock: product.totalStock || 0,
        };
      }
    });

    return Object.values(categoryStats);
  }, [productsWithStock]);

  const handleRefresh = useCallback(() => {
    setLoading(true);
    resetData(); // Call resetData from StockContext
    // Orders context also needs a refresh mechanism if it doesn't auto-refresh on order updates
    // For now, assuming resetData() might trigger a full re-fetch across contexts, or
    // you might need an explicit refreshOrders() in OrderContext
    setTimeout(() => setLoading(false), 500); // Simulate loading duration
  }, [resetData]);


  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Dashboard...</span>
        </div>
        <p className="mt-3">กำลังโหลดข้อมูล Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard container-fluid py-4">
      <DashboardHeader
        dateRange={dateRange}
        onDateRangeChange={(e) => setDateRange(e.target.value)}
        onRefresh={handleRefresh}
      />

      <StatCards stats={stats} dateRange={dateRange} />

      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <SalesChart data={getDailySalesData()} />
        </div>
        <div className="col-lg-6">
          <TopProductsChart data={stats.topProducts} />
        </div>
        <div className="col-lg-6">
          <CategoryPieChart data={getCategoryData()} />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <LowStockTable products={stats.lowStockProducts} />
        </div>
        <div className="col-lg-6">
          <RecentOrdersTable orders={stats.recentOrders} onUpdateStatus={handleUpdateOrderStatus} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;