// ไฟล์: src/components/Dashboard.js
import React, { useState, useEffect } from "react"; // แก้ไขไวยากรณ์ตรงนี้
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
  const { orders } = useOrder(); // orders จาก OrderContext
  const { getProductsWithStock, stock } = useStock(); // stock จาก StockContext เพื่อใช้เป็น dependency ใน useEffect

  // ดึงข้อมูล products พร้อมสต็อกและราคาที่อัปเดตล่าสุด
  // ต้องเรียกใช้ getProductsWithStock() ในทุก render หรือเมื่อ stock/products มีการเปลี่ยนแปลง
  const productsWithStock = getProductsWithStock();

  const [dateRange, setDateRange] = useState("7"); // 7, 30, 90 days

  // คำนวณสถิติ
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

    // ตรวจสอบ totalAmount ก่อนนำมาคำนวณ
    const totalRevenue = recentOrders.reduce(
      (sum, order) =>
        sum + (typeof order.grandTotal === "number" ? order.grandTotal : 0),
      0
    ); // ใช้ grandTotal แทน totalAmount
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
      (product) => (product.totalStock || 0) <= 10
    ); // ใช้ productsWithStock

    return {
      totalRevenue,
      totalOrders,
      totalItems,
      avgOrderValue,
      topProducts,
      lowStockProducts,
      recentOrders,
    };
  };

  const stats = calculateStats(); // เรียก calculateStats ในทุก render

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
      ); // ใช้ grandTotal

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
      // ใช้ productsWithStock
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
  ];

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
                ? stats.avgOrderValue.toLocaleString()
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
                    <th>สินค้า</th>
                    <th>หมวดหมู่</th>
                    <th>สต็อกคงเหลือ</th>
                    <th>สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.lowStockProducts.map((product) => (
                    <tr key={product.productId}>
                      <td>{product.productName}</td>
                      <td>{product.category}</td>
                      <td>
                        <span
                          className={`stock-badge ${
                            product.totalStock <= 5 ? "critical" : "low"
                          }`}
                        >
                          {product.totalStock}
                        </span>
                      </td>
                      <td>
                        <span className="status-badge warning">
                          <AlertCircle size={14} />
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
                  <th>เลขที่</th>
                  <th>ลูกค้า</th>
                  <th>วันที่</th>
                  <th>ยอดรวม</th>
                  <th>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.slice(0, 10).map((order) => (
                  <tr key={order.orderId}>
                    <td>{order.orderId}</td>
                    <td>
                      {order.customerInfo?.customerName || "ไม่ระบุ"}
                    </td>{" "}
                    {/* เพิ่มการตรวจสอบ customerInfo */}
                    <td>
                      {order.orderDate
                        ? new Date(order.orderDate).toLocaleDateString("th-TH")
                        : "-"}
                    </td>
                    <td>
                      ฿
                      {(typeof order.totalAmount === "number"
                        ? order.totalAmount
                        : 0
                      ).toLocaleString()}
                    </td>{" "}
                    {/* ตรวจสอบ totalAmount */}
                    <td>
                      <span className={`status-badge ${order.status}`}>
                        {order.status === "pending" && "รอดำเนินการ"}
                        {order.status === "completed" && "เสร็จสมบูรณ์"}
                        {order.status === "shipped" && "จัดส่งแล้ว"}
                        {order.status === "delivered" && "ส่งมอบแล้ว"}
                        {order.status === "cancelled" && "ยกเลิกแล้ว"}{" "}
                        {/* เพิ่มสถานะ cancelled */}
                      </span>
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
