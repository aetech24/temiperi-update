import React, { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";
import axios from "axios";
import { toast } from "react-toastify";

const EditInvoiceModal = ({ invoice, isOpen, onClose, onSave }) => {
  const [editedInvoice, setEditedInvoice] = useState(null);
  const [products, setProducts] = useState([]);
  const [currentItem, setCurrentItem] = useState({
    description: "",
    quantity: 1,
    price: 0,
  });
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (invoice) {
      setEditedInvoice({ ...invoice });
    }
  }, [invoice]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          "https://temiperi-stocks-backend.onrender.com/temiperi/products"
        );
        setProducts(response.data.products);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to fetch products");
      }
    };

    fetchProducts();
  }, []);

  if (!isOpen || !editedInvoice) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedInvoice((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...editedInvoice.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]:
        field === "quantity" || field === "price"
          ? parseFloat(value) || 0
          : value,
    };

    // Recalculate total amount
    const totalAmount = updatedItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    setEditedInvoice((prev) => ({
      ...prev,
      items: updatedItems,
      totalAmount,
    }));
  };

  const handleCurrentItemChange = (field, value) => {
    if (field === "description") {
      const selectedProduct = products.find((p) => p.name === value);
      if (selectedProduct) {
        setCurrentItem({
          ...currentItem,
          description: value,
          price: selectedProduct.price?.retail_price || 0,
        });
      }
    } else if (field === "quantity") {
      const selectedProduct = products.find((p) => p.name === currentItem.description);
      if (selectedProduct) {
        const newPrice = value > 9
          ? selectedProduct.price?.whole_sale_price || 0
          : selectedProduct.price?.retail_price || 0;
        
        setCurrentItem({
          ...currentItem,
          quantity: parseInt(value) || 0,
          price: newPrice,
        });
      } else {
        setCurrentItem({
          ...currentItem,
          quantity: parseInt(value) || 0,
        });
      }
    }
  };

  const handleAddItem = () => {
    if (!currentItem.description || currentItem.quantity <= 0) {
      toast.error("Please select a product and ensure quantity is valid.");
      return;
    }

    const selectedProduct = products.find(
      (product) => product.name === currentItem.description
    );
    
    if (selectedProduct && selectedProduct.quantity < currentItem.quantity) {
      toast.error("Not enough stock available for this product.");
      return;
    }

    setEditedInvoice((prev) => {
      const newItems = [...prev.items, { ...currentItem }];
      const newTotal = newItems.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      );
      return {
        ...prev,
        items: newItems,
        totalAmount: newTotal,
      };
    });

    setCurrentItem({
      description: "",
      quantity: 1,
      price: 0,
    });
  };

  const handleRemoveItem = (index) => {
    setEditedInvoice((prev) => {
      const updatedItems = prev.items.filter((_, i) => i !== index);
      const totalAmount = updatedItems.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      );
      return {
        ...prev,
        items: updatedItems,
        totalAmount,
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(editedInvoice);
  };

  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Edit Invoice</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <MdClose className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Customer Name
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={editedInvoice.customerName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue focus:ring-blue sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Payment Method
                </label>
                <select
                  name="paymentMethod"
                  value={editedInvoice.paymentMethod}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue focus:ring-blue sm:text-sm"
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="momo">Mobile Money</option>
                  <option value="credit">Credit</option>
                  <option value="momo/cash">Mobile Money & Cash</option>
                </select>
              </div>
            </div>

            {/* Add New Item Section */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Item</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Product
                  </label>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search products..."
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue focus:ring-blue sm:text-sm"
                  />
                  {search && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto">
                      {filteredProducts.map((product) => (
                        <div
                          key={product._id}
                          className="cursor-pointer hover:bg-gray-100 px-4 py-2"
                          onClick={() => {
                            handleCurrentItemChange("description", product.name);
                            setSearch("");
                          }}
                        >
                          {product.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={currentItem.quantity}
                    onChange={(e) => handleCurrentItemChange("quantity", e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue focus:ring-blue sm:text-sm"
                    min="1"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="bg-blue text-white px-4 py-2 rounded-md hover:bg-opacity-80"
                  >
                    Add Item
                  </button>
                </div>
              </div>
            </div>

            {/* Existing Items */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Current Items</h3>
              <div className="space-y-4">
                {editedInvoice.items.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg"
                  >
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) =>
                          handleItemChange(index, "description", e.target.value)
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue focus:ring-blue sm:text-sm"
                        required
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(index, "quantity", e.target.value)
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue focus:ring-blue sm:text-sm"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Price
                      </label>
                      <input
                        type="number"
                        value={item.price}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue focus:ring-blue sm:text-sm"
                        readOnly
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-lg font-semibold">
                Total Amount: GH₵{editedInvoice.totalAmount.toFixed(2)}
              </div>
              <div className="space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue text-white px-4 py-2 rounded-md hover:bg-opacity-80"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditInvoiceModal;
