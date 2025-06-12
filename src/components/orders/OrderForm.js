// ไฟล์: src/components/orders/OrderForm.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStock } from "../../context/StockContext";
import { useCustomer } from "../../context/CustomerContext";
import { useOrder } from "../../context/OrderContext";
import { format } from "date-fns";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  ShoppingCart,
  Package,
  Trash2,
  UserPlus,
  Minus,
  Plus,
} from "lucide-react";

const OrderForm = () => {
  const navigate = useNavigate();
  const { getProductsWithStock, updateProductQuantity } = useStock();
  const { customers } = useCustomer();
  const { addOrder } = useOrder();

  const availableProducts = getProductsWithStock();

  const [selectedCustomer, setSelectedCustomer] = useState(() => {
    return customers.length > 0
      ? {
          value: customers[0].customerId,
          label: `${customers[0].customerName} (${
            customers[0].customerType === "wholesale" ? "ขายส่ง" : "ขายปลีก"
          })`,
          customerType: customers[0].customerType,
          discountRate: customers[0].discountRate || 0,
          ...customers[0],
        }
      : null;
  });

  const [orderDate, setOrderDate] = useState(new Date());
  const [deliveryDate, setDeliveryDate] = useState(new Date());
  const [orderItems, setOrderItems] = useState([]);
  const [notes, setNotes] = useState("");

  // ตัวเลือกสำหรับ dropdown ลูกค้า
  // ย้ายการสร้าง customerOptions มาไว้ที่นี่ เพื่อให้สามารถเข้าถึง customers ได้อย่างถูกต้อง
  const customerOptions = customers.map((cust) => ({
    value: cust.customerId,
    label: `${cust.customerName} (${
      cust.customerType === "wholesale" ? "ขายส่ง" : "ขายปลีก"
    })`,
    customerType: cust.customerType,
    discountRate: cust.discountRate || 0,
    ...cust,
  }));

  // คำนวณราคาต่อหน่วยสำหรับสินค้าที่เลือก โดยอิงจากประเภทลูกค้า
  const getUnitPrice = (product, size, customerType) => {
    // เพิ่ม size parameter
    const priceInfo = product.pricesBySize?.[size]; // ดึงราคาจาก pricesBySize
    if (priceInfo) {
      return customerType === "wholesale"
        ? priceInfo.wholesalePrice
        : priceInfo.retailPrice;
    }
    // Fallback หากหาราคาตามขนาดไม่เจอ
    return product.retailPrice || 0;
  };

  const handleAddItem = (productToAdd, size) => {
    if (!selectedCustomer) {
      alert("โปรดเลือกลูกค้าก่อนเพิ่มสินค้า");
      return;
    }

    const existingItemIndex = orderItems.findIndex(
      (item) => item.productId === productToAdd.productId && item.size === size
    );

    const currentProductInStock = availableProducts.find(
      (p) => p.productId === productToAdd.productId
    );
    const productStock = currentProductInStock?.stockBySize?.[size] || 0;

    const unitPrice = getUnitPrice(
      productToAdd,
      size,
      selectedCustomer.customerType
    ); // ส่ง size ไปด้วย

    if (existingItemIndex > -1) {
      const currentQuantityInCart = orderItems[existingItemIndex].quantity;
      if (currentQuantityInCart + 1 > productStock) {
        alert(
          `สินค้า ${productToAdd.productName} (ขนาด ${size}) มีสต็อกไม่เพียงพอ มีเพียง ${productStock} ชิ้น`
        );
        return;
      }
      setOrderItems(
        orderItems.map((item, index) =>
          index === existingItemIndex
            ? {
                ...item,
                quantity: item.quantity + 1,
                totalPrice: (item.quantity + 1) * unitPrice,
              }
            : item
        )
      );
    } else {
      if (1 > productStock) {
        alert(
          `สินค้า ${productToAdd.productName} (ขนาด ${size}) มีสต็อกไม่เพียงพอ มีเพียง ${productStock} ชิ้น`
        );
        return;
      }

      setOrderItems([
        ...orderItems,
        {
          productId: productToAdd.productId,
          productName: productToAdd.productName,
          size,
          quantity: 1,
          unitPrice,
          totalPrice: unitPrice * 1,
        },
      ]);
    }
  };

  const handleQuantityChange = (index, newQuantity) => {
    const quantity = parseInt(newQuantity);
    if (isNaN(quantity) || quantity < 0) return;

    const updatedItems = [...orderItems];
    const itemToUpdate = updatedItems[index];

    const currentProductInStock = availableProducts.find(
      (p) => p.productId === itemToUpdate.productId
    );
    const productStock =
      currentProductInStock?.stockBySize?.[itemToUpdate.size] || 0;

    if (quantity > productStock) {
      alert(
        `สินค้า ${itemToUpdate.productName} (ขนาด ${itemToUpdate.size}) มีสต็อกไม่เพียงพอ มีเพียง ${productStock} ชิ้น`
      );
      itemToUpdate.quantity = productStock;
    } else {
      itemToUpdate.quantity = quantity;
    }

    itemToUpdate.totalPrice = itemToUpdate.quantity * itemToUpdate.unitPrice;
    setOrderItems([...updatedItems]);
  };

  const handleRemoveItem = (index) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const subtotal = orderItems.reduce(
    (acc, item) => acc + (item.totalPrice || 0),
    0
  );
  const effectiveDiscountRate = selectedCustomer?.discountRate || 0;
  const discountAmount = subtotal * (effectiveDiscountRate / 100);
  const totalAfterDiscount = subtotal - discountAmount;
  const vatAmount = totalAfterDiscount * 0.07;
  const grandTotal = totalAfterDiscount + vatAmount;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedCustomer) {
      alert("โปรดเลือกลูกค้า");
      return;
    }
    if (orderItems.length === 0) {
      alert("โปรดเพิ่มสินค้าในคำสั่งซื้อ");
      return;
    }

    for (const item of orderItems) {
      const product = availableProducts.find(
        (p) => p.productId === item.productId
      );
      if (product && item.quantity > (product.stockBySize?.[item.size] || 0)) {
        alert(
          `สินค้า ${item.productName} (ขนาด ${
            item.size
          }) มีสต็อกไม่เพียงพอ มีเพียง ${product.stockBySize[item.size]} ชิ้น`
        );
        return;
      }
    }

    const newOrder = {
      customerId: selectedCustomer.value,
      customerInfo: selectedCustomer,
      orderDate: format(orderDate, "yyyy-MM-dd"),
      deliveryDate: format(deliveryDate, "yyyy-MM-dd"),
      items: orderItems,
      subtotal,
      discountPercent: effectiveDiscountRate,
      discountAmount,
      totalAfterDiscount,
      vatAmount,
      grandTotal,
      notes,
      status: "pending",
    };

    addOrder(newOrder);

    orderItems.forEach((item) => {
      updateProductQuantity(item.productId, item.size, -item.quantity);
    });

    alert("สร้างคำสั่งซื้อสำเร็จ!");
    navigate("/orders");
  };

  if (customers.length === 0) {
    return (
      <div className="order-form no-customer-state">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          ไม่พบข้อมูลลูกค้า
        </h2>
        <p className="text-gray-700 mb-4">
          โปรดเพิ่มข้อมูลลูกค้าอย่างน้อยหนึ่งรายในเมนู "ลูกค้า"
          ก่อนจึงจะสามารถสร้างคำสั่งซื้อได้
        </p>
        <button
          onClick={() => navigate("/customers/new")}
          className="submit-btn"
        >
          <UserPlus size={20} />
          <span>เพิ่มลูกค้าใหม่</span>
        </button>
      </div>
    );
  }

  return (
    <div className="order-form">
      <div className="order-header">
        <h2>
          <ShoppingCart size={28} />
          <span>สร้างคำสั่งซื้อใหม่</span>
        </h2>
      </div>
      <form onSubmit={handleSubmit}>
        {/* ส่วนข้อมูลลูกค้าและวันที่ */}
        <div className="customer-section">
          <label>เลือกลูกค้า:</label>
          <Select
            id="customer-select"
            options={customerOptions} // customerOptions ถูกเรียกใช้งานที่นี่
            onChange={setSelectedCustomer}
            value={selectedCustomer}
            placeholder="เลือกลูกค้า"
            isClearable
            className="basic-single"
            classNamePrefix="select"
          />
          {selectedCustomer && (
            <div className="customer-info">
              <p>
                <strong>ผู้ติดต่อ:</strong> {selectedCustomer.contactPerson}
              </p>
              <p>
                <strong>เบอร์โทร:</strong> {selectedCustomer.phone}
              </p>
              <p>
                <strong>ส่วนลด:</strong> {selectedCustomer.discountRate || 0}%
              </p>
              <p>
                <strong>ที่อยู่:</strong> {selectedCustomer.address}
              </p>
            </div>
          )}
        </div>

        {/* Date pickers */}
        <div className="additional-info">
          <div className="form-group">
            <label>วันที่สั่งซื้อ:</label>
            <DatePicker
              id="order-date"
              selected={orderDate}
              onChange={(date) => setOrderDate(date)}
              dateFormat="dd/MM/yyyy"
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>วันที่จัดส่ง:</label>
            <DatePicker
              id="delivery-date"
              selected={deliveryDate}
              onChange={(date) => setDeliveryDate(date)}
              dateFormat="dd/MM/yyyy"
              className="form-control"
            />
          </div>
        </div>

        {/* ส่วนเลือกสินค้า */}
        <div className="product-section">
          <h3>
            <Package size={20} />
            <span>เลือกสินค้า</span>
          </h3>
          <div className="products-grid">
            {availableProducts.map((product) => {
              if (!product) return null;

              return (
                <div key={product.productId} className="product-card-mini">
                  <img src={product.imageUrl} alt={product.productName} />
                  <h4>{product.productName}</h4>
                  <p>รหัส: {product.productId}</p>

                  <div className="size-options">
                    {product.availableSizes?.map((size) => {
                      // ใช้ availableSizes
                      const stock = product.stockBySize?.[size] || 0;
                      // ดึงราคาจาก pricesBySize
                      const priceInfo = product.pricesBySize?.[size];
                      const price = selectedCustomer
                        ? selectedCustomer.customerType === "wholesale"
                          ? priceInfo?.wholesalePrice
                          : priceInfo?.retailPrice
                        : priceInfo?.retailPrice || 0;

                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => handleAddItem(product, size)}
                          disabled={stock <= 0 || !selectedCustomer}
                          className="size-btn"
                        >
                          {size} ({stock} ชิ้น) ฿
                          {typeof price === "number" && !isNaN(price)
                            ? price.toLocaleString()
                            : "0"}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ตารางตะกร้าสินค้า */}
        <div className="cart-section">
          <h3>ตะกร้าสินค้า ({orderItems.length} รายการ)</h3>
          {orderItems.length === 0 ? (
            <p>ยังไม่มีสินค้าในตะกร้า</p>
          ) : (
            <div className="cart-items">
              {orderItems.map((item, index) => {
                if (!item) return null;
                return (
                  <div
                    key={`${item.productId}-${item.size}-${index}`}
                    className="cart-item"
                  >
                    <span>
                      {item.productName} (ขนาด {item.size})
                    </span>
                    <div className="quantity-controls">
                      <button
                        type="button"
                        onClick={() =>
                          handleQuantityChange(index, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={18} />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() =>
                          handleQuantityChange(index, item.quantity + 1)
                        }
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    <span>
                      {typeof item.totalPrice === "number" &&
                      !isNaN(item.totalPrice)
                        ? item.totalPrice.toLocaleString("th-TH", {
                            style: "currency",
                            currency: "THB",
                          })
                        : "0"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="remove-btn"
                    >
                      ลบ
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ส่วนสรุปยอด */}
        <div className="order-summary">
          <h3>สรุปคำสั่งซื้อ</h3>
          <div className="summary-row">
            <span>ยอดรวม:</span>
            <span>
              {typeof subtotal === "number" && !isNaN(subtotal)
                ? subtotal.toLocaleString("th-TH", {
                    style: "currency",
                    currency: "THB",
                  })
                : "0"}
            </span>
          </div>
          <div className="summary-row discount">
            <span>ส่วนลด ({selectedCustomer?.discountRate || 0}%):</span>
            <span>
              -{" "}
              {typeof discountAmount === "number" && !isNaN(discountAmount)
                ? discountAmount.toLocaleString("th-TH", {
                    style: "currency",
                    currency: "THB",
                  })
                : "0"}
            </span>
          </div>
          <div className="summary-row">
            <span>VAT (7%):</span>
            <span>
              {typeof vatAmount === "number" && !isNaN(vatAmount)
                ? vatAmount.toLocaleString("th-TH", {
                    style: "currency",
                    currency: "THB",
                  })
                : "0"}
            </span>
          </div>
          <div className="summary-row total">
            <span>ยอดรวมสุทธิ:</span>
            <span>
              {typeof grandTotal === "number" && !isNaN(grandTotal)
                ? grandTotal.toLocaleString("th-TH", {
                    style: "currency",
                    currency: "THB",
                  })
                : "0"}
            </span>
          </div>
        </div>

        {/* Additional Info */}
        <div className="additional-info">
          <div className="form-group">
            <label>หมายเหตุ:</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="หมายเหตุเพิ่มเติม..."
              className="form-control"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button
            onClick={handleSubmit}
            className="submit-btn"
            disabled={!selectedCustomer || orderItems.length === 0}
          >
            สร้างคำสั่งซื้อ
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrderForm;
