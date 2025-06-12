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
  Users,
  ShoppingCart,
  AlertCircle,
} from "lucide-react";
import { useOrder } from "../context/OrderContext";
import { useStock } from "../context/StockContext";

const Dashboard = () => {
  const { orders, updateOrderStatus, getOrdersWithDetails } = useOrder(); // orders จาก OrderContext
  const { products, getProductsWithStock } = useStock(); // products และ getProductsWithStock จาก StockContext

  // ดึงข้อมูล products พร้อมสต็อกและราคาที่อัปเดตล่าสุด
  const productsWithStock = getProductsWithStock();

  const [dateRange, setDateRange] = useState("7"); // 7, 30, 90 days
  const [loading, setLoading] = useState(true);

  // Function to filter orders based on timeframe
  const filterOrdersByTimeframe = (allOrders, currentFilter) => {
    const now = new Date();
    return allOrders.filter((order) => {
      const orderDate = new Date(order.orderDate); // Ensure orderDate is a Date object
      switch (currentFilter) {
        case "today":
          // Compare only date parts, ignoring time
          return orderDate.toDateString() === now.toDateString();
        case "thisWeek":
          // Get the start of the current week (Sunday)
          const firstDayOfWeek = new Date(now);
          firstDayOfWeek.setDate(now.getDate() - now.getDay());
          firstDayOfWeek.setHours(0, 0, 0, 0); // Set to start of the day
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
    // Simulate data loading delay for better UX
    setLoading(true);
    setTimeout(() => {
      // Ensure all data is loaded from contexts
      // getProductsWithStock and getOrdersWithDetails are functions to get current state
      // The actual data (products, orders) are states and will trigger re-renders when updated by their contexts.
      setLoading(false);
    }, 500);
  }, [dateRange, products, orders]); // Dependencies to re-run effect when dateRange, products, or orders change

  // Calculate statistics
  const calculateStats = () => {
    const today = new Date();
    const daysAgo = new Date(
      today.getTime() - parseInt(dateRange) * 24 * 60 * 60 * 1000
    );

    const recentOrders = orders.filter(
      (order) =>
        // ตรวจสอบ order.orderDate ก่อนแปลงเป็น Date object
        order.orderDate && new Date(order.orderDate) >= daysAgo
    );

    // ตรวจสอบ grandTotal ก่อนนำมาคำนวณ
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

    // สินค้าขายดี
    const productSales = {};
    recentOrders.forEach((order) => {
      // ตรวจสอบ order.items ก่อนวนลูป
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
      .sort((a, b) => (b.quantity || 0) - (a.quantity || 0)) // ตรวจสอบ quantity
      .slice(0, 5);

    // สต็อกต่ำ
    const lowStockProducts = productsWithStock.filter(
      (product) =>
        (product.totalStock || 0) <= 10 && (product.totalStock || 0) > 0 // Filter only if stock is positive but low
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
      ), // Ensure recent orders are sorted by date
    };
  };

  const stats = calculateStats();

  // ข้อมูลกราฟยอดขายรายวัน
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

  // ข้อมูลกราฟหมวดหมู่สินค้า
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
    "#00f2fe", // Added more colors for more categories
    "#ffc107",
    "#20c997",
    "#6f42c1",
  ];

  // Function to show a custom dialog (replaces alert/confirm)
  const showCustomDialog = (
    message,
    type = "info",
    actions = [{ label: "ตกลง", onClick: () => {} }]
  ) => {
    const dialogOverlay = document.createElement("div");
    dialogOverlay.className = "dialog-overlay";

    const dialogContent = document.createElement("div");
    dialogContent.className = "dialog-content";

    const messageParagraph = document.createElement("p");
    messageParagraph.className = `text-lg mb-4 ${
      type === "error"
        ? "text-red-700"
        : type === "success"
        ? "text-green-700"
        : "text-gray-700"
    }`;
    messageParagraph.textContent = message;
    dialogContent.appendChild(messageParagraph);

    const buttonContainer = document.createElement("div");
    buttonContainer.className = "flex justify-center space-x-4 mt-4";

    actions.forEach((action) => {
      const button = document.createElement("button");
      button.className = `dialog-button ${
        action.label === "ยกเลิก"
          ? "bg-gray-500 hover:bg-gray-600"
          : action.label === "ยืนยัน"
          ? "bg-red-500 hover:bg-red-600"
          : "bg-indigo-500 hover:bg-indigo-600"
      }`;
      button.textContent = action.label;
      button.onclick = () => {
        action.onClick();
        dialogOverlay.remove();
      };
      buttonContainer.appendChild(button);
    });
    dialogContent.appendChild(buttonContainer);
    dialogOverlay.appendChild(dialogContent);
    document.body.appendChild(dialogOverlay);
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
    const statusDialogContent = document.createElement("div");
    statusDialogContent.className = "dialog-content p-6"; // Added padding for better look
    statusDialogContent.innerHTML = `
      <h3 class="text-xl font-bold mb-4 text-gray-800">อัปเดตสถานะคำสั่งซื้อ ${orderId}</h3>
      <p class="text-gray-700 mb-4">สถานะปัจจุบัน: <span class="font-semibold">${currentStatusLabel}</span></p>
      <div class="flex flex-col space-y-3">
        ${statusOptions
          .map(
            (option) => `
          <button
            class="status-select-button bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors duration-200 ${
              option.value === currentStatus
                ? "bg-indigo-100 font-bold border border-indigo-500"
                : ""
            }"
            data-status="${option.value}"
          >
            ${option.label}
          </button>
        `
          )
          .join("")}
      </div>
      <button class="dialog-button bg-red-500 hover:bg-red-600 mt-6 mx-auto" id="cancelStatusUpdate">ยกเลิก</button>
    `;

    const statusDialogOverlay = document.createElement("div");
    statusDialogOverlay.className = "dialog-overlay";
    statusDialogOverlay.appendChild(statusDialogContent);
    document.body.appendChild(statusDialogOverlay);

    // Add event listeners to status buttons
    statusDialogContent
      .querySelectorAll(".status-select-button")
      .forEach((button) => {
        button.onclick = async () => {
          const newStatus = button.dataset.status;
          statusDialogOverlay.remove(); // Close status selection dialog

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

    document.getElementById("cancelStatusUpdate").onclick = () => {
      statusDialogOverlay.remove(); // Close dialog on cancel
    };
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>กำลังโหลดข้อมูล Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>📊 Dashboard และรายงาน</h1>
        <div className="date-filter">
          <label>ช่วงเวลา:</label>
          <select
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
      <div className="stats-grid">
        <div className="stat-card revenue">
          <div className="stat-icon">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <h3>ยอดขายรวม</h3>
            <p className="stat-number">
              ฿
              {typeof stats.totalRevenue === "number"
                ? stats.totalRevenue.toLocaleString()
                : "0"}
            </p>
            <span className="stat-label">ใน {dateRange} วันที่ผ่านมา</span>
          </div>
        </div>

        <div className="stat-card orders">
          <div className="stat-icon">
            <ShoppingCart size={24} />
          </div>
          <div className="stat-content">
            <h3>จำนวนคำสั่งซื้อ</h3>
            <p className="stat-number">{stats.totalOrders}</p>
            <span className="stat-label">คำสั่งซื้อ</span>
          </div>
        </div>

        <div className="stat-card items">
          <div className="stat-icon">
            <Package size={24} />
          </div>
          <div className="stat-content">
            <h3>สินค้าที่ขาย</h3>
            <p className="stat-number">{stats.totalItems}</p>
            <span className="stat-label">ชิ้น</span>
          </div>
        </div>

        <div className="stat-card avg">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h3>ยอดขายเฉลี่ย</h3>
            <p className="stat-number">
              ฿
              {typeof stats.avgOrderValue === "number"
                ? stats.avgOrderValue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : "0"}
            </p>
            <span className="stat-label">ต่อคำสั่งซื้อ</span>
          </div>
        </div>
      </div>

      {/* กราฟและชาร์ต */}
      <div className="charts-grid">
        {/* กราฟยอดขายรายวัน */}
        <div className="chart-card">
          <h3>📈 ยอดขายรายวัน</h3>
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
            <div className="no-data">ไม่มีข้อมูลยอดขายรายวัน</div>
          )}
        </div>

        {/* กราฟสินค้าขายดี */}
        <div className="chart-card">
          <h3>🏆 สินค้าขายดี Top 5</h3>
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
            <div className="no-data">ไม่มีข้อมูลสินค้าขายดี</div>
          )}
        </div>

        {/* กราฟหมวดหมู่สินค้า */}
        <div className="chart-card">
          <h3>📊 สินค้าตามหมวดหมู่</h3>
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
                >
                  {getCategoryData().map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">ไม่มีข้อมูลสัดส่วนประเภทสินค้า</div>
          )}
          <div className="pie-legend">
            {getCategoryData().map((entry, index) => (
              <div key={entry.name} className="legend-item">
                <span
                  className="legend-color"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></span>
                <span>
                  {entry.name} ({entry.count})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ตารางข้อมูล */}
      <div className="tables-grid">
        {/* สต็อกต่ำ */}
        <div className="table-card">
          <h3>⚠️ แจ้งเตือนสต็อกต่ำ</h3>
          {stats.lowStockProducts.length === 0 ? (
            <div className="no-data">ไม่มีสินค้าสต็อกต่ำ</div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider rounded-tl-lg">
                      สินค้า
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      หมวดหมู่
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider rounded-tr-lg">
                      สต็อกคงเหลือ
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      สถานะ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.lowStockProducts.map((product) => (
                    <tr key={product.productId} className="hover:bg-gray-50">
                      <td className="py-3 px-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.productName}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-500">
                        {product.category}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-sm text-right">
                        <span
                          className={`stock-badge ${
                            product.totalStock <= 5 ? "critical" : "low"
                          } px-2 py-1 rounded-full text-xs font-semibold`}
                        >
                          {product.totalStock}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-sm">
                        <span className="status-badge warning bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold inline-flex items-center">
                          <AlertCircle size={14} className="mr-1" />
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

        {/* คำสั่งซื้อล่าสุด */}
        <div className="table-card">
          <h3>🛒 คำสั่งซื้อล่าสุด</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider rounded-tl-lg">
                    เลขที่
                  </th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    ลูกค้า
                  </th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    วันที่
                  </th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    ยอดรวม
                  </th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    สถานะ
                  </th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider rounded-tr-lg">
                    การจัดการ
                  </th>{" "}
                  {/* NEW Column */}
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.slice(0, 10).map((order) => (
                  <tr key={order.orderId} className="hover:bg-gray-50">
                    <td className="py-3 px-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.orderId}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-500">
                      {order.customerInfo?.customerName || "ไม่ระบุ"}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-500">
                      {order.orderDate
                        ? new Date(order.orderDate).toLocaleDateString("th-TH")
                        : "-"}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                      ฿
                      {(typeof order.totalAmount === "number"
                        ? order.totalAmount
                        : 0
                      ).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-sm">
                      <span
                        className={`status-badge ${order.status} px-2 py-1 rounded-full text-xs font-semibold`}
                      >
                        {order.status === "pending" && "รอดำเนินการ"}
                        {order.status === "completed" && "เสร็จสมบูรณ์"}
                        {order.status === "shipped" && "จัดส่งแล้ว"}
                        {order.status === "delivered" && "ส่งมอบแล้ว"}
                        {order.status === "cancelled" && "ยกเลิกแล้ว"}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-center">
                      {" "}
                      {/* NEW Action Column */}
                      <button
                        onClick={() =>
                          handleUpdateOrderStatus(order.orderId, order.status)
                        }
                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-1 px-3 rounded-lg text-xs transition-colors duration-200"
                      >
                        อัปเดตสถานะ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
