// src/components/AddProductForm.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStock } from "../context/StockContext";
import {
  ArrowLeft,
  Save,
  PlusCircle,
  MinusCircle,
  Image,
  Tag,
  Text,
  Layers,
  DollarSign,
} from "lucide-react";

const AddProductForm = () => {
  const navigate = useNavigate();
  const { addProduct, getProductsWithStock } = useStock(); // getProductsWithStock to check for existing IDs
  const [notification, setNotification] = useState(null);

  // State for product details
  const [productId, setProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [imageUrl, setImageUrl] = useState(""); // Google Drive File ID
  const [category, setCategory] = useState("");

  // State for initial sizes and their stock/prices
  const [initialSizes, setInitialSizes] = useState([
    { size: "S", stock: 0, retailPrice: 0, wholesalePrice: 0 },
  ]);

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

  /**
   * Handles changes to the size, stock, retail price, or wholesale price for a specific size entry.
   * @param {number} index - The index of the size entry being modified.
   * @param {string} field - The field name ('size', 'stock', 'retailPrice', 'wholesalePrice').
   * @param {string|number} value - The new value for the field.
   */
  const handleSizeChange = (index, field, value) => {
    const newSizes = [...initialSizes];
    if (
      field === "stock" ||
      field === "retailPrice" ||
      field === "wholesalePrice"
    ) {
      newSizes[index][field] = parseFloat(value) || 0; // Parse as float for prices, int for stock
    } else {
      newSizes[index][field] = value;
    }
    setInitialSizes(newSizes);
  };

  /**
   * Adds a new empty size entry to the form.
   */
  const addSizeField = () => {
    setInitialSizes([
      ...initialSizes,
      { size: "", stock: 0, retailPrice: 0, wholesalePrice: 0 },
    ]);
  };

  /**
   * Removes a size entry from the form.
   * @param {number} index - The index of the size entry to remove.
   */
  const removeSizeField = (index) => {
    const newSizes = initialSizes.filter((_, i) => i !== index);
    setInitialSizes(newSizes);
  };

  /**
   * Handles the form submission to add a new product.
   * @param {Event} e - The form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!productId.trim() || !productName.trim() || !category.trim()) {
      showNotification(
        "error",
        "โปรดกรอกข้อมูลสินค้าให้ครบถ้วน (รหัส, ชื่อ, หมวดหมู่)"
      );
      return;
    }

    const existingProducts = getProductsWithStock();
    if (
      existingProducts.some(
        (p) => p.productId.toLowerCase() === productId.trim().toLowerCase()
      )
    ) {
      showNotification("error", "รหัสสินค้าซ้ำ! โปรดใช้รหัสสินค้าอื่น");
      return;
    }

    // Prepare product data for API
    const stockBySize = {};
    const pricesBySize = {};
    let isValidSizes = true;
    let isDefaultSizeAdded = false; // Flag to check if at least one size is added

    initialSizes.forEach((item) => {
      const trimmedSize = item.size.trim();
      if (trimmedSize) {
        // Only add if size is not empty
        isDefaultSizeAdded = true;
        if (stockBySize[trimmedSize]) {
          isValidSizes = false; // Duplicate size entered
          showNotification("error", `พบขนาดซ้ำ: ${trimmedSize}`);
          return;
        }
        stockBySize[trimmedSize] = parseInt(item.stock) || 0;
        pricesBySize[trimmedSize] = {
          retailPrice: parseFloat(item.retailPrice) || 0,
          wholesalePrice: parseFloat(item.wholesalePrice) || 0,
        };
      }
    });

    if (!isValidSizes) return;

    // If no sizes are added, add a default 'One Size' with 0 stock and 0 price.
    if (!isDefaultSizeAdded) {
      stockBySize["One Size"] = 0;
      pricesBySize["One Size"] = { retailPrice: 0, wholesalePrice: 0 };
    }

    const newProduct = {
      productId: productId.trim(),
      productName: productName.trim(),
      imageUrl: imageUrl.trim(), // Send as Google Drive File ID
      category: category.trim(),
      stockBySize: stockBySize, // Object with size as key and stock as value
      pricesBySize: pricesBySize, // Object with size as key and price object as value
    };

    const result = await addProduct(newProduct);
    if (result.success) {
      showNotification("success", "เพิ่มสินค้าใหม่เรียบร้อยแล้ว!");
      // Clear form fields
      setProductId("");
      setProductName("");
      setImageUrl("");
      setCategory("");
      setInitialSizes([
        { size: "S", stock: 0, retailPrice: 0, wholesalePrice: 0 },
      ]);
      // Optionally navigate back to product list after a delay
      setTimeout(() => navigate("/products"), 1500);
    } else {
      showNotification("error", result.message);
    }
  };

  return (
    <div className="container p-6 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate("/products")}
          className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 transition-colors duration-200"
        >
          <ArrowLeft size={20} />
          <span>กลับสู่รายการสินค้า</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-800">เพิ่มสินค้าใหม่</h1>
        <div></div> {/* Placeholder for alignment */}
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Product ID */}
          <div>
            <label
              htmlFor="productId"
              className="block text-gray-700 text-sm font-bold mb-2 flex items-center"
            >
              <Tag size={16} className="mr-2" /> รหัสสินค้า{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="productId"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-indigo-500 rounded-lg"
              placeholder="เช่น SHIRT001"
              required
            />
          </div>

          {/* Product Name */}
          <div>
            <label
              htmlFor="productName"
              className="block text-gray-700 text-sm font-bold mb-2 flex items-center"
            >
              <Text size={16} className="mr-2" /> ชื่อสินค้า{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="productName"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-indigo-500 rounded-lg"
              placeholder="เช่น เสื้อยืดคอกลมสีขาว"
              required
            />
          </div>

          {/* Image URL (Google Drive File ID) */}
          <div>
            <label
              htmlFor="imageUrl"
              className="block text-gray-700 text-sm font-bold mb-2 flex items-center"
            >
              <Image size={16} className="mr-2" /> Google Drive File ID รูปภาพ
            </label>
            <input
              type="text"
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-indigo-500 rounded-lg"
              placeholder="เช่น 1A2B3C4D5E6F7G"
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-gray-700 text-sm font-bold mb-2 flex items-center"
            >
              <Layers size={16} className="mr-2" /> หมวดหมู่{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-indigo-500 rounded-lg"
              placeholder="เช่น เสื้อยืด, กางเกง, เดรส"
              required
            />
          </div>
        </div>

        {/* Initial Sizes, Stock, and Prices */}
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <DollarSign size={20} className="mr-2" /> สต็อกและราคาเริ่มต้นตามขนาด
        </h3>
        {initialSizes.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200"
          >
            <div className="md:col-span-1">
              <label
                htmlFor={`size-${index}`}
                className="block text-gray-700 text-xs font-semibold mb-1"
              >
                ขนาด
              </label>
              <input
                type="text"
                id={`size-${index}`}
                value={item.size}
                onChange={(e) =>
                  handleSizeChange(index, "size", e.target.value)
                }
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-indigo-500 text-sm rounded-lg"
                placeholder="เช่น S, M, L, XL"
              />
            </div>
            <div className="md:col-span-1">
              <label
                htmlFor={`stock-${index}`}
                className="block text-gray-700 text-xs font-semibold mb-1"
              >
                สต็อก
              </label>
              <input
                type="number"
                id={`stock-${index}`}
                value={item.stock}
                onChange={(e) =>
                  handleSizeChange(index, "stock", e.target.value)
                }
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-indigo-500 text-sm rounded-lg"
                min="0"
              />
            </div>
            <div className="md:col-span-1">
              <label
                htmlFor={`retailPrice-${index}`}
                className="block text-gray-700 text-xs font-semibold mb-1"
              >
                ราคาปลีก
              </label>
              <input
                type="number"
                id={`retailPrice-${index}`}
                value={item.retailPrice}
                onChange={(e) =>
                  handleSizeChange(index, "retailPrice", e.target.value)
                }
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-indigo-500 text-sm rounded-lg"
                min="0"
                step="0.01"
              />
            </div>
            <div className="md:col-span-1">
              <label
                htmlFor={`wholesalePrice-${index}`}
                className="block text-gray-700 text-xs font-semibold mb-1"
              >
                ราคาส่ง
              </label>
              <input
                type="number"
                id={`wholesalePrice-${index}`}
                value={item.wholesalePrice}
                onChange={(e) =>
                  handleSizeChange(index, "wholesalePrice", e.target.value)
                }
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-indigo-500 text-sm rounded-lg"
                min="0"
                step="0.01"
              />
            </div>
            <div className="md:col-span-1 flex justify-end items-end h-full">
              {initialSizes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSizeField(index)}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-200 flex items-center justify-center text-sm"
                >
                  <MinusCircle size={16} className="mr-1" /> ลบ
                </button>
              )}
            </div>
          </div>
        ))}
        <div className="text-center mb-6">
          <button
            type="button"
            onClick={addSizeField}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-200 flex items-center mx-auto"
          >
            <PlusCircle size={20} className="mr-2" /> เพิ่มขนาดสินค้า
          </button>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-200 flex items-center justify-center text-lg"
          >
            <Save size={20} className="mr-2" /> บันทึกสินค้าใหม่
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

export default AddProductForm;
