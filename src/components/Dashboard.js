// src/components/Dashboard.js
import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  Package,
  ShoppingCart,
  AlertCircle,
} from "lucide-react";
import { useOrder } from "../context/OrderContext";
import { useStock } from "../context/StockContext";
import { Link } from "react-router-dom"; // Import Link for navigation

const Dashboard = () => {
  const { orders, updateOrderStatus, getOrdersWithDetails } = useOrder();
  const { products, getProductsWithStock } = useStock();

  const productsWithStock = getProductsWithStock();

  const [dateRange, setDateRange] = useState("7");
  const [loading, setLoading] = useState(true);

  // Function to filter orders based on timeframe
  const filterOrdersByTimeframe = (allOrders, currentFilter) => {
    const now = new Date();
    return allOrders.filter((order) => {
      const orderDate = new Date(order.orderDate);
      switch (currentFilter) {
        case "today":
          return orderDate.toDateString() === now.toDateString();
        case "thisWeek":
          const firstDayOfWeek = new Date(now);
          firstDayOfWeek.setDate(now.getDate() - now.getDay());
          firstDayOfWeek.setHours(0, 0, 0, 0);
          return orderDate >= firstDayOfWeek;
        case "thisMonth":
          return (
            orderDate.getMonth() === now.getMonth() &&
            orderDate.getFullYear() === now.getFullYear()
          );
        case "all":
        default:
          return true;
      }
    });
  };

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, [dateRange, products, orders]);

  const calculateStats = () => {
    const today = new Date();
    const daysAgo = new Date(
      today.getTime() - parseInt(dateRange) * 24 * 60 * 60 * 1000
    );

    const recentOrders = orders.filter(
      (order) => order.orderDate && new Date(order.orderDate) >= daysAgo
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
  };

  const stats = calculateStats();

  const getDailySalesData = () => {
    const days = parseInt(dateRange);
    const salesData = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dayOrders = orders.filter(
        (order) => order.orderDate && order.orderDate.split("T")[0] === dateStr
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
  };

  const getCategoryData = () => {
    const categoryStats = {};

    productsWithStock.forEach((product) => {
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
  };

  const COLORS = [
    "#667eea",
    "#764ba2",
    "#f093fb",
    "#f5576c",
    "#4facfe",
    "#43e97b",
    "#00f2fe",
    "#ffc107",
    "#20c997",
    "#6f42c1",
  ];

  // Custom dialog (replaces alert/confirm for Bootstrap compatibility)
  const showCustomDialog = (
    message,
    type = "info",
    actions = [{ label: "ตกลง", onClick: () => {} }]
  ) => {
    const dialogOverlay = document.createElement("div");
    dialogOverlay.className = "modal-backdrop fade show"; // Bootstrap modal backdrop
    document.body.appendChild(dialogOverlay);

    const modal = document.createElement("div");
    modal.className = "modal fade show d-block"; // d-block to force display
    modal.tabIndex = -1;
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-labelledby", "customDialogLabel");
    modal.setAttribute("aria-hidden", "true");

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

    // Append buttons to modal-footer
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
  };

  const handleUpdateOrderStatus = (orderId, currentStatus) => {
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

    // Create a custom status selection dialog
    const statusDialog = document.createElement("div");
    statusDialog.className = "modal fade show d-block";
    statusDialog.tabIndex = -1;
    statusDialog.setAttribute("role", "dialog");
    statusDialog.setAttribute("aria-labelledby", "statusDialogLabel");
    statusDialog.setAttribute("aria-hidden", "true");

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

    // Add event listeners to status buttons
    statusDialog.querySelectorAll(".status-select-button").forEach((button) => {
      button.onclick = async () => {
        const newStatus = button.dataset.status;
        statusDialog.remove(); // Close status selection dialog
        backdrop.remove(); // Remove backdrop

        if (newStatus === currentStatus) {
          showCustomDialog(
            `สถานะคำสั่งซื้อยังคงเป็น "${currentStatusLabel}"`,
            "info"
          );
          return;
        }

        const result = await updateOrderStatus(orderId, newStatus);
        if (result.success) {
          showCustomDialog(
            `อัปเดตสถานะคำสั่งซื้อ ${orderId} เป็น "${
              statusOptions.find((opt) => opt.value === newStatus)?.label
            }" เรียบร้อย!`,
            "success"
          );
        } else {
          showCustomDialog(
            `เกิดข้อผิดพลาดในการอัปเดตสถานะ: ${result.message}`,
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

  if (loading) {
    return (
      <div className="loading-container text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">กำลังโหลดข้อมูล Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard container-fluid py-4">
      {" "}
      {/* Use container-fluid for full width, py-4 for padding */}
      <div className="dashboard-header bg-primary text-white p-4 rounded shadow-sm mb-4 d-flex justify-content-between align-items-center">
        <h1 className="h3 mb-0">📊 Dashboard และรายงาน ออเดอร์</h1>
        <div className="date-filter d-flex align-items-center">
          <label htmlFor="timeframe-select" className="me-2 mb-0">
            ช่วงเวลา:
          </label>
          <select
            id="timeframe-select"
            className="form-select form-select-sm bg-light text-dark"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="7">7 วันที่ผ่านมา</option>
            <option value="30">30 วันที่ผ่านมา</option>
            <option value="90">90 วันที่ผ่านมา</option>
          </select>
        </div>
      </div>
      {/* สถิติหลัก */}
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 mb-4">
        {" "}
        {/* Bootstrap grid for stats */}
        <div className="col">
          <div className="card shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div className="stat-icon bg-gradient-primary rounded p-3 me-3">
                {" "}
                {/* Custom gradient class */}
                <DollarSign size={24} />
              </div>
              <div className="stat-content">
                <h3 className="card-title text-uppercase text-muted mb-0">
                  ยอดขายรวม
                </h3>
                <p className="h4 card-text mb-0 text-dark">
                  ฿
                  {typeof stats.totalRevenue === "number"
                    ? stats.totalRevenue.toLocaleString()
                    : "0"}
                </p>
                <span className="text-muted small">
                  ใน {dateRange} วันที่ผ่านมา
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div className="stat-icon bg-gradient-pink rounded p-3 me-3">
                {" "}
                {/* Custom gradient class */}
                <ShoppingCart size={24} />
              </div>
              <div className="stat-content">
                <h3 className="card-title text-uppercase text-muted mb-0">
                  จำนวนคำสั่งซื้อ
                </h3>
                <p className="h4 card-text mb-0 text-dark">
                  {stats.totalOrders}
                </p>
                <span className="text-muted small">คำสั่งซื้อ</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div className="stat-icon bg-gradient-info rounded p-3 me-3">
                {" "}
                {/* Custom gradient class */}
                <Package size={24} />
              </div>
              <div className="stat-content">
                <h3 className="card-title text-uppercase text-muted mb-0">
                  สินค้าที่ขาย
                </h3>
                <p className="h4 card-text mb-0 text-dark">
                  {stats.totalItems}
                </p>
                <span className="text-muted small">ชิ้น</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div className="stat-icon bg-gradient-success rounded p-3 me-3">
                {" "}
                {/* Custom gradient class */}
                <TrendingUp size={24} />
              </div>
              <div className="stat-content">
                <h3 className="card-title text-uppercase text-muted mb-0">
                  ยอดขายเฉลี่ย
                </h3>
                <p className="h4 card-text mb-0 text-dark">
                  ฿
                  {typeof stats.avgOrderValue === "number"
                    ? stats.avgOrderValue.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : "0"}
                </p>
                <span className="text-muted small">ต่อคำสั่งซื้อ</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* กราฟและชาร์ต */}
      <div className="row g-4 mb-4">
        {/* กราฟยอดขายรายวัน */}
        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h3 className="card-title h5 mb-3">📈 ยอดขายรายวัน</h3>
              {getDailySalesData().length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={getDailySalesData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        name === "revenue"
                          ? `฿${(typeof value === "number"
                              ? value
                              : 0
                            ).toLocaleString()}`
                          : typeof value === "number"
                          ? value
                          : 0,
                        name === "revenue" ? "ยอดขาย" : "จำนวนคำสั่งซื้อ",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#667eea"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="alert alert-info text-center mt-3" role="alert">
                  ไม่มีข้อมูลยอดขายรายวัน
                </div>
              )}
            </div>
          </div>
        </div>

        {/* กราฟสินค้าขายดี */}
        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h3 className="card-title h5 mb-3">🏆 สินค้าขายดี Top 5</h3>
              {stats.topProducts.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.topProducts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="productName"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        typeof value === "number" ? value : 0,
                        name === "quantity" ? "จำนวนขาย" : "ยอดขาย",
                      ]}
                    />
                    <Bar dataKey="quantity" fill="#667eea" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="alert alert-info text-center mt-3" role="alert">
                  ไม่มีข้อมูลสินค้าขายดี
                </div>
              )}
            </div>
          </div>
        </div>

        {/* กราฟหมวดหมู่สินค้า */}
        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h3 className="card-title h5 mb-3">📊 สินค้าตามหมวดหมู่</h3>
              {getCategoryData().length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getCategoryData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="name"
                    >
                      {getCategoryData().map((entry, index) => (
                        <Cell
                          key={`cell-${entry.name}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="alert alert-info text-center mt-3" role="alert">
                  ไม่มีข้อมูลสัดส่วนประเภทสินค้า
                </div>
              )}
              <div className="d-flex flex-wrap justify-content-center mt-3">
                {" "}
                {/* Bootstrap flex classes */}
                {getCategoryData().map((entry, index) => (
                  <div
                    key={entry.name}
                    className="d-flex align-items-center me-3 mb-2"
                  >
                    {" "}
                    {/* Bootstrap flex classes */}
                    <span
                      className="me-2 rounded"
                      style={{
                        backgroundColor: COLORS[index % COLORS.length],
                        width: "14px",
                        height: "14px",
                      }}
                    ></span>
                    <span className="text-muted small">
                      {entry.name} ({entry.count})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* ตารางข้อมูล */}
      <div className="row g-4">
        {/* สต็อกต่ำ */}
        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h3 className="card-title h5 mb-3 d-flex align-items-center">
                <AlertCircle size={20} className="text-warning me-2" />
                แจ้งเตือนสต็อกต่ำ ({stats.lowStockProducts.length})
              </h3>
              {stats.lowStockProducts.length === 0 ? (
                <div
                  className="alert alert-success text-center mt-3"
                  role="alert"
                >
                  ไม่มีสินค้าสต็อกต่ำ
                </div>
              ) : (
                <div className="table-responsive">
                  {" "}
                  {/* Bootstrap for responsive table */}
                  <table className="table table-hover table-striped table-bordered align-middle">
                    {" "}
                    {/* Bootstrap table classes */}
                    <thead className="table-light">
                      {" "}
                      {/* Bootstrap table header light */}
                      <tr>
                        <th scope="col" className="text-start">
                          สินค้า
                        </th>
                        <th scope="col" className="text-start">
                          หมวดหมู่
                        </th>
                        <th scope="col" className="text-end">
                          สต็อกคงเหลือ
                        </th>
                        <th scope="col" className="text-start">
                          สถานะ
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.lowStockProducts.map((product) => (
                        <tr key={product.productId}>
                          <td className="text-nowrap">{product.productName}</td>
                          <td className="text-nowrap">{product.category}</td>
                          <td className="text-end">
                            <span
                              className={`badge ${
                                product.totalStock <= 5
                                  ? "bg-danger"
                                  : "bg-warning text-dark"
                              }`}
                            >
                              {product.totalStock}
                            </span>
                          </td>
                          <td>
                            <span className="badge bg-warning text-dark d-inline-flex align-items-center">
                              <AlertCircle size={14} className="me-1" />
                              ต้องเติมสต็อก
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* คำสั่งซื้อล่าสุด */}
        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h3 className="card-title h5 mb-3 d-flex align-items-center">
                <ShoppingCart size={20} className="text-primary me-2" />
                คำสั่งซื้อล่าสุด (
                {stats.recentOrders.length > 10
                  ? "10 รายการ"
                  : stats.recentOrders.length}
                )
              </h3>
              {stats.recentOrders.length === 0 ? (
                <div className="alert alert-info text-center mt-3" role="alert">
                  ไม่มีคำสั่งซื้อล่าสุด
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover table-striped table-bordered align-middle">
                    <thead className="table-light">
                      <tr>
                        <th scope="col" className="text-start">
                          เลขที่
                        </th>
                        <th scope="col" className="text-start">
                          ลูกค้า
                        </th>
                        <th scope="col" className="text-start">
                          วันที่
                        </th>
                        <th scope="col" className="text-end">
                          ยอดรวม
                        </th>
                        <th scope="col" className="text-start">
                          สถานะ
                        </th>
                        <th scope="col" className="text-center">
                          การจัดการ
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentOrders.slice(0, 10).map((order) => (
                        <tr key={order.orderId}>
                          <td className="text-nowrap">
                            <Link
                              to={`/orders/${order.orderId}/print`}
                              className="text-decoration-none text-primary fw-bold"
                            >
                              {order.orderId}
                            </Link>
                          </td>
                          <td className="text-nowrap">
                            {order.customerInfo?.customerName || "ไม่ระบุ"}
                          </td>
                          <td className="text-nowrap">
                            {order.orderDate
                              ? new Date(order.orderDate).toLocaleDateString(
                                  "th-TH"
                                )
                              : "-"}
                          </td>
                          <td className="text-end">
                            ฿
                            {(typeof order.totalAmount === "number"
                              ? order.totalAmount
                              : 0
                            ).toLocaleString()}
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                order.status === "pending"
                                  ? "bg-secondary"
                                  : order.status === "completed"
                                  ? "bg-success"
                                  : order.status === "shipped"
                                  ? "bg-info text-dark"
                                  : order.status === "delivered"
                                  ? "bg-primary"
                                  : order.status === "cancelled"
                                  ? "bg-danger"
                                  : "bg-light text-dark"
                              }`}
                            >
                              {order.status === "pending" && "รอดำเนินการ"}
                              {order.status === "completed" && "เสร็จสมบูรณ์"}
                              {order.status === "shipped" && "จัดส่งแล้ว"}
                              {order.status === "delivered" && "ส่งมอบแล้ว"}
                              {order.status === "cancelled" && "ยกเลิกแล้ว"}
                            </span>
                          </td>
                          <td className="text-center">
                            <button
                              onClick={() =>
                                handleUpdateOrderStatus(
                                  order.orderId,
                                  order.status
                                )
                              }
                              className="btn btn-sm btn-outline-primary"
                            >
                              อัปเดตสถานะ
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
