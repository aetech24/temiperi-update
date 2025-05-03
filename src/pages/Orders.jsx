import React, { useEffect, useState, useMemo } from "react";
import Preview from "../components/Preview";
import PrintablePreview from "../components/PrintablePreview";
import InvoiceGenerator from "../components/InvoiceGenerator";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BsWhatsapp } from "react-icons/bs";
import { MdOutlinePrint, MdSchedule } from "react-icons/md";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import html2pdf from "html2pdf.js";
import Modal from "react-modal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

Modal.setAppElement("#root"); // Set the app element for accessibility

const modalStyle = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    width: "500px",
    height: "300px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "10px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
    backgroundColor: "#fff",
  },
};

const baseURL =
  process.env.NODE_ENV === "production"
    ? "https://temiperi-eaze.onrender.com/temiperi"
    : "http://localhost:4000/temiperi";

const Orders = ({ searchQuery }) => {
  const [data, setData] = useState({
    invoiceNumber: "",
    customerName: "",
    paymentMethod: "",
    items: [
      { description: "", quantity: 0, price: 0, productId: "", total: 0 },
    ],
  });
  const [loading, setLoading] = useState(false);
  const [latestInvoiceNumber, setLatestInvoiceNumber] = useState(0);
  const [search, setSearch] = useState("");
  const [showPhonePrompt, setShowPhonePrompt] = useState(false);
  const [customerPhone, setCustomerPhone] = useState("");
  const [showActionModal, setShowActionModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [previewItems, setPreviewItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [cashAmount, setCashAmount] = useState("");
  const [momoAmount, setMomoAmount] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWhatsAppSent, setIsWhatsAppSent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPhonePromptModal, setShowPhonePromptModal] = useState(false);

  // New state variables for payment tracking
  const [amountPaid, setAmountPaid] = useState("");
  const [balance, setBalance] = useState(0);

  // New state variables for order scheduling
  const [isScheduled, setIsScheduled] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState(new Date());
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");

  // New state variables for expenditure tracking
  const [showExpenditure, setShowExpenditure] = useState(false);
  const [expenditure, setExpenditure] = useState({
    amount: "",
    description: "",
    category: "utilities", // default category
    date: new Date(),
  });
  const [expenditures, setExpenditures] = useState([]);

  useEffect(() => {
    const savedPreviewItems = localStorage.getItem("previewItems");
    if (savedPreviewItems) {
      setPreviewItems(JSON.parse(savedPreviewItems));
      localStorage.removeItem("previewItems");
    }

    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          "https://temiperi-eaze.onrender.com/temiperi/products"
        );
        setProducts(response.data.products);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to fetch products");
      }
    };

    const generateInvoiceNumber = async () => {
      try {
        setLoading(true);
        const response = await axios.post(
          "https://temiperi-eaze.onrender.com/temiperi//invoice/number"
        );
        const { invoiceNumber } = response.data;
        if (
          !invoiceNumber ||
          typeof invoiceNumber !== "string" ||
          !invoiceNumber.startsWith("tm")
        ) {
          throw new Error("Invalid invoice number format");
        }
        setData((prevData) => ({
          ...prevData,
          invoiceNumber: invoiceNumber,
        }));
      } catch (error) {
        console.error("Error generating invoice number:", error);
        const timestamp = Date.now().toString().slice(-6);
        const randomNum = Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, "0");
        const fallbackNumber = `tm${timestamp}${randomNum}`;
        setData((prevData) => ({
          ...prevData,
          invoiceNumber: fallbackNumber,
        }));
      } finally {
        setLoading(false);
      }
    };

    const fetchExpenditures = async () => {
      try {
        const response = await axios.get(
          "https://temiperi-eaze.onrender.com/temiperi/expenditures"
        );
        if (response.data && response.data.expenditures) {
          setExpenditures(response.data.expenditures);
        }
      } catch (error) {
        console.error("Error fetching expenditures:", error);
      }
    };

    fetchProducts();
    generateInvoiceNumber();
    fetchExpenditures();
  }, []);

  // Calculate balance whenever amount paid changes
  useEffect(() => {
    const calculatedTotal =
      previewItems.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      ) +
      (data.items[0].description
        ? data.items[0].quantity * data.items[0].price
        : 0);

    const paid = parseFloat(amountPaid) || 0;
    const calculatedBalance = paid - calculatedTotal;
    setBalance(calculatedBalance);
  }, [amountPaid, previewItems, data.items]);

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setData((data) => ({ ...data, [name]: value }));
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleAddItem = () => {
    const currentItem = data.items[0];

    // Validate item
    if (!currentItem.description || currentItem.quantity <= 0) {
      toast.error("Please select a product and ensure quantity is valid.");
      return;
    }

    // Check stock
    const selectedProduct = products.find(
      (product) => product.name === currentItem.description
    );
    if (selectedProduct && selectedProduct.quantity < currentItem.quantity) {
      toast.error("Not enough stock available for this product.");
      return;
    }

    // Add item to preview
    setPreviewItems([
      ...previewItems,
      { ...currentItem, productId: selectedProduct._id },
    ]);

    // Reset current item
    setData({
      ...data,
      items: [
        {
          description: "",
          quantity: 0,
          price: 0,
          productId: "",
          total: 0,
          name: selectedProduct.name,
        },
      ],
    });
  };

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    return products.filter(
      (product) =>
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const getFilteredProducts = (query) => {
    if (!query) return filteredProducts;
    return filteredProducts.filter((product) =>
      product.name?.toLowerCase().startsWith(query?.toLowerCase())
    );
  };

  const handleItemChange = (index, field, value) => {
    const items = [...data.items];
    if (field === "quantity" && value <= 0) return;

    items[index][field] = value;

    if (field === "description") {
      const selectedProduct = products.find((p) => p.name === value);
      if (selectedProduct) {
        // Default to retail price when product is first selected
        items[index].price = selectedProduct.price?.retail_price || 0;
        items[index].whole_sale_price =
          selectedProduct.price?.whole_sale_price || 0;
        items[index].productId = selectedProduct._id;
      }
    }

    if (field === "quantity") {
      const selectedProduct = products.find(
        (p) => p.name === items[index].description
      );
      if (selectedProduct) {
        // Use wholesale price if quantity > 10, otherwise use retail price
        items[index].price =
          value > 9
            ? selectedProduct.price?.whole_sale_price || 0
            : selectedProduct.price?.retail_price || 0;
      }
    }

    setData({ ...data, items });
  };

  const handleExpenditureChange = (e) => {
    const { name, value } = e.target;
    setExpenditure((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleExpenditureSubmit = async (e) => {
    e.preventDefault();

    if (!expenditure.amount || !expenditure.description) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const response = await axios.post(
        "https://temiperi-eaze.onrender.com/temiperi/expenditure",
        {
          ...expenditure,
          amount: parseFloat(expenditure.amount),
        }
      );

      if (response.status === 201 || response.status === 200) {
        toast.success("Expenditure recorded successfully!");

        // Add new expenditure to the list
        setExpenditures((prev) => [response.data.expenditure, ...prev]);

        // Reset form
        setExpenditure({
          amount: "",
          description: "",
          category: "utilities",
          date: new Date(),
        });

        // Close the form
        setShowExpenditure(false);
      }
    } catch (error) {
      console.error("Error recording expenditure:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to record expenditure. Please try again."
      );
    }
  };

  const handleDeleteExpenditure = async (id) => {
    if (!id) return;

    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this expenditure?"
      );
      if (!confirmDelete) return;

      const response = await axios.delete(
        `https://temiperi-eaze.onrender.com/temiperi/expenditure/${id}`
      );

      if (response.status === 200) {
        toast.success("Expenditure deleted successfully");
        setExpenditures((prev) => prev.filter((exp) => exp._id !== id));
      }
    } catch (error) {
      console.error("Error deleting expenditure:", error);
      toast.error("Failed to delete expenditure");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate items array
      if (
        previewItems.length === 0 &&
        (!data.items[0].description || data.items[0].quantity <= 0)
      ) {
        toast.error("Please add at least one item before submitting.");
        return;
      }

      // Combine preview items and current item if it exists
      let allItems = [...previewItems];
      if (data.items[0].description && data.items[0].quantity > 0) {
        const selectedProduct = products.find(
          (product) => product.name === data.items[0].description
        );
        if (selectedProduct) {
          allItems.push({
            ...data.items[0],
            productId: selectedProduct._id,
          });
        }
      }

      // Calculate total amount
      const totalAmount = allItems.reduce((sum, item) => {
        return sum + item.quantity * item.price;
      }, 0);

      // Prepare the invoice data
      const invoiceData = {
        invoiceNumber: data.invoiceNumber,
        customerName: data.customerName,
        paymentMethod: paymentMethod || "cash",
        items: allItems.map((item) => ({
          description: item.description,
          quantity: parseInt(item.quantity),
          price: parseFloat(item.price),
        })),
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        // Only include productId if you have it
        ...(allItems[0]?.productId && { productId: allItems[0].productId }),
        ...(allItems[0]?.description && {
          productName: allItems[0].description,
        }),
        // Add payment tracking information
        amountPaid: parseFloat(amountPaid) || totalAmount,
        balance: parseFloat(balance.toFixed(2)) || 0,
        // Add scheduling information if applicable
        isScheduled: isScheduled,
        ...(isScheduled && {
          deliveryDate,
          deliveryAddress,
          deliveryNotes,
        }),
      };

      // Submit the invoice
      const invoiceResponse = await axios.post(
        "https://temiperi-eaze.onrender.com/temiperi/invoice",
        invoiceData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (invoiceResponse.status === 201) {
        console.log(invoiceResponse.data.productId);
        // Now submit the order
        const orderPayload = {
          invoiceNumber: data.invoiceNumber,
          customerName: data.customerName,
          paymentMethod: paymentMethod || "cash",
          paymentType: "full",
          items: allItems.map((item) => ({
            description: item.description,
            quantity: parseInt(item.quantity),
            price: parseFloat(item.price),
            productId: item.productId || null,
          })),
          // Add payment tracking information
          amountPaid: parseFloat(amountPaid) || totalAmount,
          balance: parseFloat(balance.toFixed(2)) || 0,
          // Add scheduling information if applicable
          isScheduled: isScheduled,
          ...(isScheduled && {
            deliveryDate,
            deliveryAddress,
            deliveryNotes,
          }),
        };

        const orderResponse = await axios.post(
          "https://temiperi-eaze.onrender.com/temiperi/order",
          orderPayload
        );

        if (orderResponse.status === 201) {
          setIsModalOpen(true);
          toast.success("Order submitted successfully!");
        }
      }
    } catch (error) {
      console.error("Error submitting:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to submit. Please check your data and try again."
      );
    }
  };

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
    setData((prev) => ({
      ...prev,
      paymentMethod: e.target.value,
    }));
    if (e.target.value !== "momo/cash") {
      setCashAmount("");
      setMomoAmount("");
    }
  };

  const handleToggleSchedule = () => {
    setShowScheduleModal(true);
  };

  const handleScheduleSubmit = () => {
    setIsScheduled(true);
    setShowScheduleModal(false);
    toast.success("Order scheduled for delivery");
  };

  const handleCancelSchedule = () => {
    setShowScheduleModal(false);
  };

  const generatePDF = async () => {
    const invoice = document.getElementById("invoice-content");
    if (!invoice) return null;

    const options = {
      margin: 1,
      filename: `Invoice-${data.invoiceNumber}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    try {
      const pdfBlob = await html2pdf()
        .set(options)
        .from(invoice)
        .outputPdf("blob");
      return pdfBlob;
    } catch (error) {
      console.error("Error generating PDF:", error);
      return null;
    }
  };

  const handlePrintInvoice = () => {
    const printContent = document.getElementById("invoice-content");
    if (!printContent) {
      toast.error("Print reference not found");
      return;
    }

    // Create a new window for printing
    const printWindow = window.open("", "_blank", "width=800,height=600");

    // Write the print content with proper styling
    printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Invoice #${data.invoiceNumber}</title>
                    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
                    <style>
                        @media print {
                            @page {
                                size: A4;
                                margin: 1cm;
                            }
                            body {
                                font-family: Arial, sans-serif;
                                line-height: 1.6;
                                color: #000;
                            }
                            .print-header {
                                text-align: center;
                                margin-bottom: 20px;
                            }
                            .print-content {
                                padding: 20px;
                            }
                            table {
                                width: 100%;
                                border-collapse: collapse;
                                margin: 20px 0;
                            }
                            th, td {
                                padding: 8px;
                                text-align: left;
                                border-bottom: 1px solid #ddd;
                            }
                            th {
                                background-color: #f8f9fa;
                                font-weight: bold;
                            }
                            .total-row {
                                font-weight: bold;
                            }
                            .footer {
                                margin-top: 30px;
                                text-align: center;
                                font-size: 0.9em;
                            }
                            /* Hide non-printable elements */
                            .no-print {
                                display: none !important;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="print-content">
                        ${printContent.innerHTML}
                    </div>
                </body>
            </html>
        `);

    // Close the document writing
    printWindow.document.close();

    // Wait for resources to load before printing
    setTimeout(() => {
      printWindow.print();

      // Handle print dialog close and page reload
      if (printWindow.matchMedia) {
        const mediaQueryList = printWindow.matchMedia("print");
        mediaQueryList.addEventListener("change", function (mql) {
          if (!mql.matches) {
            window.location.reload();
          }
        });
      } else {
        printWindow.onafterprint = () => {
          window.location.reload();
        };
      }
    }, 1000); // Increased timeout to ensure styles are loaded
  };

  const handleShareWhatsApp = () => {
    setShowPhonePrompt(true);
  };

  const totalAmount =
    previewItems.reduce((sum, item) => sum + item.quantity * item.price, 0) +
    (data.items[0].description
      ? data.items[0].quantity * data.items[0].price
      : 0);

  const sendToWhatsApp = async () => {
    if (!customerPhone) {
      toast.error("Please enter a phone number");
      return;
    }

    const pdfBlob = await generatePDF();
    if (!pdfBlob) {
      toast.error("Error generating PDF invoice");
      return;
    }

    const message =
      `*TEMIPERI ENTERPRISE*\n\n` +
      `*Invoice #:* ${data.invoiceNumber}\n` +
      `*Customer:* ${data.customerName}\n` +
      `*Order Details:*\n` +
      `${data.items
        .map(
          (item, index) =>
            `${index + 1}. ${item.description} - Qty: ${
              item.quantity
            }, Price: GH₵${item.price.toFixed(2)}`
        )
        .join("\n")}\n\n` +
      `Total Amount: GH₵${totalAmount.toFixed(2)}\n\n` +
      `Thank you for your business!`;

    const formattedPhone = customerPhone.replace(/\D/g, "");
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(
      message
    )}`;

    window.open(whatsappUrl, "_blank");
    setShowPhonePrompt(false);
    setIsWhatsAppSent(true);
  };

  const handleSendWhatsAppModal = () => {
    setShowPhonePromptModal(true);
  };

  const handleShareWhatsAppModal = async (phoneNumber) => {
    try {
      const message =
        `*TEMIPERI ENTERPRISE*\n\n` +
        `*Invoice #:* ${data.invoiceNumber}\n` +
        `*Customer:* ${data.customerName}\n` +
        `*Order Details:*\n` +
        `${data.items
          .map(
            (item, index) =>
              `${index + 1}. ${item.description} - Qty: ${
                item.quantity
              }, Price: GH₵${item.price.toFixed(2)}`
          )
          .join("\n")}\n\n` +
        `Total Amount: GH₵${totalAmount.toFixed(2)}\n\n` +
        `Thank you for your business!`;
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
        message
      )}`;
      window.open(whatsappUrl, "_blank");
      setShowPhonePromptModal(false);
      setIsModalOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      toast.error("Error sending WhatsApp message");
    }
  };

  const handlePrintModal = async () => {
    try {
      await handlePrintInvoice();
      setTimeout(() => {
        setIsModalOpen(false);
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error printing invoice:", error);
    }
  };

  const handleCancelModal = () => {
    setIsModalOpen(false);
    window.location.reload();
  };

  return (
    <div className="pt-4 md:px-6 flex gap-6 flex-col lg:flex-row w-full">
      <div className="flex flex-col gap-4 flex-1">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-medium">Submit Order</h1>
          <button
            onClick={() => setShowExpenditure(!showExpenditure)}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center gap-2"
          >
            {showExpenditure ? "Hide Expenditure" : "Record Expenditure"}
          </button>
        </div>

        {/* Expenditure Form */}
        {showExpenditure && (
          <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            <h2 className="text-xl font-semibold mb-4">Record Expenditure</h2>
            <form
              onSubmit={handleExpenditureSubmit}
              className="flex flex-col gap-3"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Amount (GH₵):
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={expenditure.amount}
                    onChange={handleExpenditureChange}
                    className="border p-2 rounded-md border-black outline-none w-full"
                    placeholder="Enter amount"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category:
                  </label>
                  <select
                    name="category"
                    value={expenditure.category}
                    onChange={handleExpenditureChange}
                    className="border p-2 rounded-md border-black outline-none w-full"
                    required
                  >
                    <option value="utilities">Utilities</option>
                    <option value="rent">Rent</option>
                    <option value="supplies">Office Supplies</option>
                    <option value="salary">Salaries</option>
                    <option value="transport">Transportation</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description:
                </label>
                <textarea
                  name="description"
                  value={expenditure.description}
                  onChange={handleExpenditureChange}
                  className="border p-2 rounded-md border-black outline-none w-full"
                  placeholder="Enter expenditure details"
                  rows="3"
                  required
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date:</label>
                <DatePicker
                  selected={expenditure.date}
                  onChange={(date) =>
                    setExpenditure((prev) => ({ ...prev, date }))
                  }
                  className="border p-2 rounded-md border-black outline-none w-full"
                  maxDate={new Date()}
                />
              </div>
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  Save Expenditure
                </button>
              </div>
            </form>

            {/* Recent Expenditures */}
            {expenditures.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium mb-2">Recent Expenditures</h3>
                <div className="max-h-60 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {expenditures.slice(0, 5).map((item) => (
                        <tr key={item._id}>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                            {new Date(item.date).toLocaleDateString()}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-900 max-w-[200px] truncate">
                            {item.description}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 capitalize">
                            {item.category}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                            GH₵{item.amount.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">
                            <button
                              onClick={() =>
                                handleDeleteExpenditure(item._id)
                              }
                              className="text-red-500 hover:text-red-700"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Existing form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <label className="flex flex-col gap-1">
            Invoice Number
            <InvoiceGenerator value={data.invoiceNumber} loading={loading} />
          </label>
          <label className="flex flex-col gap-1">
            Customer Name:
            <input
              type="text"
              value={data.customerName}
              onChange={onChangeHandler}
              name="customerName"
              required
              className="border p-2 rounded-md border-black outline-none"
            />
          </label>
          <label className="flex flex-col gap-1">
            Payment Method:
            <select
              value={paymentMethod}
              onChange={handlePaymentMethodChange}
              required
              className="border p-2 rounded-md border-black outline-none"
            >
              <option value="">Select a payment method</option>
              <option value="cash">Cash</option>
              <option value="momo">Mobile Money</option>
              <option value="credit">Credit</option>
              <option value="momo/cash">
                Partly Mobile Money And Partly Cash
              </option>
            </select>
          </label>
          {paymentMethod === "momo/cash" && (
            <div className="flex flex-col md:flex-row items-center md:gap-6 gap-2 w-full">
              <label className="flex flex-col gap-1 w-full">
                Amount Paid by Cash:
                <input
                  type="number"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  className="border p-2 rounded-md border-black outline-none"
                  placeholder="Enter cash amount"
                />
              </label>
              <label className="flex flex-col gap-1 w-full">
                Amount Paid by Momo:
                <input
                  type="number"
                  value={momoAmount}
                  onChange={(e) => setMomoAmount(e.target.value)}
                  className="border p-2 rounded-md border-black outline-none"
                  placeholder="Enter momo amount"
                />
              </label>
            </div>
          )}

          <div className="mt-4 p-4 border border-gray-300 rounded-lg bg-gray-50">
            <h3 className="text-lg font-medium mb-2">Payment Details</h3>
            <div className="flex flex-col md:flex-row md:gap-4 space-y-2 md:space-y-0">
              <div className="flex-1">
                <label className="block text-sm font-medium">
                  Total Amount:
                  <span className="ml-2 text-lg font-bold">
                    GH₵{totalAmount.toFixed(2)}
                  </span>
                </label>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium">
                  Amount Paid:
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="w-full border p-2 rounded-md border-black outline-none"
                  placeholder="Enter amount paid"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium">
                  Balance/Change:
                </label>
                <div
                  className={`w-full p-2 rounded-md font-bold ${
                    balance >= 0
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  GH₵{balance.toFixed(2)}
                  {balance >= 0 && balance > 0
                    ? " (Change)"
                    : balance < 0
                    ? " (Owing)"
                    : ""}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-2">
            <button
              type="button"
              onClick={handleToggleSchedule}
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                isScheduled
                  ? "bg-green-100 text-green-800 border border-green-300"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              <MdSchedule className="text-xl" />
              {isScheduled ? "Scheduled for Delivery" : "Schedule for Later"}
            </button>
            {isScheduled && (
              <div className="mt-2 text-sm text-gray-600">
                Delivery on: {deliveryDate.toLocaleDateString()}
                {deliveryAddress && ` • Address: ${deliveryAddress}`}
              </div>
            )}
          </div>

          <h3 className="text-2xl font-medium pt-4">Add Item</h3>
          <div className="items">
            <label className="flex flex-col gap-2">
              Description:
              <div className="flex items-center gap-4 flex-1 w-full">
                <input
                  type="text"
                  value={search}
                  onChange={handleSearchChange}
                  placeholder="Search products..."
                  className="border p-2 rounded-md border-black outline-none w-full"
                />
                <select
                  value={data.items[0].description}
                  onChange={(e) =>
                    handleItemChange(0, "description", e.target.value)
                  }
                  className="border p-2 rounded-md border-black outline-none w-full"
                  required
                >
                  <option value="">Select a product</option>
                  {getFilteredProducts(search).map((product, idx) => (
                    <option key={idx} value={product.name}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
            </label>
            <label className="flex flex-col gap-2">
              Quantity:
              <input
                type="number"
                value={data.items[0].quantity || ""}
                onChange={(e) =>
                  handleItemChange(0, "quantity", Number(e.target.value))
                }
                className="border p-2 rounded-md border-black outline-none"
                required
                min="1" // Ensures quantity starts from 1
              />
            </label>
            <div className="flex items-center justify-between py-2">
              <label className="flex items-center gap-2">
                Price: GH₵
                <strong className="text-2xl">
                  {data.items[0].price.toFixed(2)}
                </strong>
              </label>
              <label className="flex items-center gap-2">
                Total: GH₵
                <strong className="text-2xl">
                  {(data.items[0].quantity * data.items[0].price).toFixed(2)}
                </strong>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button
              type="button"
              className="bg-blue text-white px-6 hover:bg-opacity-80 py-2 rounded-md "
              onClick={handleAddItem}
            >
              Add Item
            </button>
            <button
              type="submit"
              className="bg-blue text-white px-6 hover:bg-opacity-80 py-2 rounded-md "
            >
              Submit
            </button>
          </div>
        </form>
      </div>
      <div className="flex-1">
        <div id="invoice-content">
          <Preview
            data={{
              ...data,
              amountPaid,
              balance,
              isScheduled,
              deliveryDate,
              deliveryAddress,
              deliveryNotes,
            }}
            previewItems={previewItems}
          />
        </div>
        <div className="mt-4 flex gap-4 justify-end">
          <button
            onClick={handlePrintInvoice}
            className="bg-blue hover:bg-opacity-80 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <MdOutlinePrint />
            Print Invoice
          </button>
          <button
            onClick={handleShareWhatsApp}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <BsWhatsapp />
            Share via WhatsApp
          </button>
        </div>

        {showPhonePrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <h3 className="text-lg font-semibold mb-4">
                Enter Customer's Phone Number
              </h3>
              <PhoneInput
                country={"gh"}
                value={customerPhone}
                onChange={(phone) => setCustomerPhone(phone)}
                inputProps={{
                  required: true,
                }}
                containerClass="mb-4"
              />
              <div className="flex gap-4">
                <button
                  onClick={sendToWhatsApp}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                  Send
                </button>
                <button
                  onClick={() => setShowPhonePrompt(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        <Modal
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          style={modalStyle}
        >
          <h2 className="text-2xl font-semibold mb-4">Order Submitted</h2>
          <div className="flex gap-4 items-center">
            <button
              onClick={handleSendWhatsAppModal}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Send via WhatsApp
            </button>
            <button
              onClick={handlePrintModal}
              className="bg-blue hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Print
            </button>
            <button
              onClick={handleCancelModal}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </Modal>

        {showPhonePromptModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Enter Phone Number</h3>
              <PhoneInput
                country={"gh"}
                value={phoneNumber}
                onChange={(phone) => setPhoneNumber(phone)}
                className="mb-4"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowPhonePromptModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleShareWhatsAppModal(phoneNumber)}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {showScheduleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">
                Schedule Order for Delivery
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Delivery Date:
                  </label>
                  <DatePicker
                    selected={deliveryDate}
                    onChange={(date) => setDeliveryDate(date)}
                    minDate={new Date()}
                    className="w-full border p-2 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Delivery Address:
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full border p-2 rounded-md"
                    placeholder="Enter delivery address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Delivery Notes:
                  </label>
                  <textarea
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    className="w-full border p-2 rounded-md"
                    placeholder="Add any special instructions"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={handleCancelSchedule}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleScheduleSubmit}
                  className="px-4 py-2 bg-blue text-white rounded hover:bg-opacity-80"
                >
                  Schedule Order
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
