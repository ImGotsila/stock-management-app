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
  const { getProductsWithStock, updateStock } = useStock(); // Changed updateProductQuantity to updateStock
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
  const [notification, setNotification] = useState(null); // Add notification state

  const customerOptions = customers.map((cust) => ({
    value: cust.customerId,
    label: `${cust.customerName} (${
      cust.customerType === "wholesale" ? "ขายส่ง" : "ขายปลีก"
    })`,
    customerType: cust.customerType,
    discountRate: cust.discountRate || 0,
    ...cust,
  }));

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


  const getUnitPrice = (product, size, customerType) => {
    const priceInfo = product.pricesBySize?.[size];
    if (priceInfo) {
      return customerType === "wholesale"
        ? priceInfo.wholesalePrice
        : priceInfo.retailPrice;
    }
    // Fallback for products without sizes or if size not found in pricesBySize
    return customerType === "wholesale"
        ? product.wholesalePrice || 0
        : product.retailPrice || 0;
  };

  const handleAddItem = (productToAdd, size) => {
    if (!selectedCustomer) {
      showNotification("error", "โปรดเลือกลูกค้าก่อนเพิ่มสินค้า");
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
    );

    if (existingItemIndex > -1) {
      const currentQuantityInCart = orderItems[existingItemIndex].quantity;
      if (currentQuantityInCart + 1 > productStock) {
        showNotification(
          "error",
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
        showNotification(
          "error",
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
          imageUrl: productToAdd.imageUrl, // Add imageUrl to item for potential print view
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
      showNotification(
        "error",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotification(null); // Clear previous notifications

    if (!selectedCustomer) {
      showNotification("error", "โปรดเลือกลูกค้า");
      return;
    }
    if (orderItems.length === 0) {
      showNotification("error", "โปรดเพิ่มสินค้าในคำสั่งซื้อ");
      return;
    }

    for (const item of orderItems) {
      const product = availableProducts.find(
        (p) => p.productId === item.productId
      );
      if (product && item.quantity > (product.stockBySize?.[item.size] || 0)) {
        showNotification(
          "error",
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

    const result = await addOrder(newOrder);

    if (result) {
      // If order was added successfully, update stock
      for (const item of orderItems) {
        // Use updateStock from context
        await updateStock(item.productId, item.size, -item.quantity, 'ขายออก');
      }
      showNotification("success", "สร้างคำสั่งซื้อสำเร็จ!");
      navigate("/orders");
    }
    // Error alert is handled in addOrder function in OrderContext now
  };

  if (customers.length === 0) {
    return (
      <div className="card shadow-sm p-4 text-center">
        <h2 className="text-danger mb-3">ไม่พบข้อมูลลูกค้า</h2>
        <p className="text-muted mb-4">
          โปรดเพิ่มข้อมูลลูกค้าอย่างน้อยหนึ่งรายในเมนู "ลูกค้า"
          ก่อนจึงจะสามารถสร้างคำสั่งซื้อได้
        </p>
        <button
          onClick={() => navigate("/customers/new")}
          className="btn btn-primary d-inline-flex align-items-center justify-content-center"
        >
          <UserPlus size={20} className="me-2" />
          <span>เพิ่มลูกค้าใหม่</span>
        </button>
      </div>
    );
  }

  return (
    <div className="card shadow-sm p-4">
      <div className="card-header bg-white mb-4">
        <h2 className="h3 text-dark d-flex align-items-center">
          <ShoppingCart size={28} className="me-2" />
          <span>สร้างคำสั่งซื้อใหม่</span>
        </h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4 p-3 border rounded">
          <label
            htmlFor="customer-select"
            className="form-label d-flex align-items-center gap-2 fw-bold"
          >
            เลือกลูกค้า:
          </label>
          <Select
            id="customer-select"
            options={customerOptions}
            onChange={setSelectedCustomer}
            value={selectedCustomer}
            placeholder="เลือกลูกค้า"
            isClearable
            className="basic-single"
            classNamePrefix="select"
          />
          {selectedCustomer && (
            <div className="bg-light p-3 rounded mt-3">
              <p className="mb-1">
                <strong>ผู้ติดต่อ:</strong> {selectedCustomer.contactPerson}
              </p>
              <p className="mb-1">
                <strong>เบอร์โทร:</strong> {selectedCustomer.phone}
              </p>
              <p className="mb-1">
                <strong>ส่วนลด:</strong> {selectedCustomer.discountRate || 0}%
              </p>
              <p className="mb-0">
                <strong>ที่อยู่:</strong> {selectedCustomer.address}
              </p>
            </div>
          )}
        </div>

        <div className="row g-3 mb-4 p-3 border rounded">
          <div className="col-md-6">
            <label htmlFor="order-date" className="form-label">
              วันที่สั่งซื้อ:
            </label>
            <DatePicker
              id="order-date"
              selected={orderDate}
              onChange={(date) => setOrderDate(date)}
              dateFormat="dd/MM/yyyy"
              className="form-control"
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="delivery-date" className="form-label">
              วันที่จัดส่ง:
            </label>
            <DatePicker
              id="delivery-date"
              selected={deliveryDate}
              onChange={(date) => setDeliveryDate(date)}
              dateFormat="dd/MM/yyyy"
              className="form-control"
            />
          </div>
        </div>

        <div className="mb-4 p-3 border rounded">
          <h3 className="h5 d-flex align-items-center gap-2 mb-3">
            <Package size={20} />
            <span>เลือกสินค้า</span>
          </h3>
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
            {availableProducts.map((product) => {
              if (!product) return null;

              return (
                <div key={product.productId} className="col">
                  <div className="card h-100 text-center">
                    <img
                      src={product.imageUrl}
                      className="card-img-top"
                      alt={product.productName}
                      style={{ height: "120px", objectFit: "cover" }}
                    />
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title text-truncate">
                        {product.productName}
                      </h5>
                      <p className="card-subtitle mb-2 text-muted small">
                        รหัส: {product.productId}
                      </p>
                      <div className="d-flex flex-wrap justify-content-center gap-2 mt-auto">
                        {product.availableSizes?.map((size) => {
                          const stock = product.stockBySize?.[size] || 0;
                          const priceInfo = product.pricesBySize?.[size];
                          const price = selectedCustomer
                            ? selectedCustomer.customerType === "wholesale"
                              ? priceInfo?.wholesalePrice
                              : priceInfo?.retailPrice
                            : priceInfo?.retailPrice || product.retailPrice || 0; // Fallback to product.retailPrice

                          return (
                            <button
                              key={size}
                              type="button"
                              onClick={() => handleAddItem(product, size)}
                              disabled={stock <= 0 || !selectedCustomer}
                              className="btn btn-outline-info btn-sm"
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
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mb-4 p-3 border rounded">
          <h3 className="h5 mb-3">ตะกร้าสินค้า ({orderItems.length} รายการ)</h3>
          {orderItems.length === 0 ? (
            <div className="alert alert-secondary text-center" role="alert">
              ยังไม่มีสินค้าในตะกร้า
            </div>
          ) : (
            <ul className="list-group">
              {orderItems.map((item, index) => {
                if (!item) return null;
                return (
                  <li
                    key={`${item.productId}-${item.size}-${index}`}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <h6 className="mb-1">
                        {item.productName} (ขนาด {item.size})
                      </h6>
                      <small className="text-muted">
                        ฿{item.unitPrice.toLocaleString()}/ชิ้น
                      </small>
                    </div>
                    <div className="d-flex align-items-center">
                      <div
                        className="btn-group me-2"
                        role="group"
                        aria-label="Quantity controls"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            handleQuantityChange(index, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          className="btn btn-outline-secondary btn-sm"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="btn btn-light btn-sm disabled">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleQuantityChange(index, item.quantity + 1)
                          }
                          className="btn btn-outline-secondary btn-sm"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="fw-bold me-3">
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
                        className="btn btn-danger btn-sm"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="mb-4 p-3 border rounded bg-light">
          <h3 className="h5 mb-3">สรุปคำสั่งซื้อ</h3>
          <div className="d-flex justify-content-between mb-2">
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
          <div className="d-flex justify-content-between text-danger mb-2">
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
          <div className="d-flex justify-content-between mb-2">
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
          <div className="d-flex justify-content-between border-top pt-2 fw-bold fs-5">
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

        <div className="mb-4 p-3 border rounded">
          <label htmlFor="notes" className="form-label">
            หมายเหตุ:
          </label>
          <textarea
            id="notes"
            rows="3"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="หมายเหตุเพิ่มเติม..."
            className="form-control"
          />
        </div>

        <div className="text-center">
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={!selectedCustomer || orderItems.length === 0}
          >
            สร้างคำสั่งซื้อ
          </button>
        </div>
      </form>

      {/* Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 p-4 rounded-lg shadow-lg text-white ${
            notification.type === "success" ? "bg-green-500" : "bg-red-500"
          } transition-opacity duration-300`}
        >
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default OrderForm;