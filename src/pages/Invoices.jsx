import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import InvoiceTable from "../components/InvoiceTable";
import EditInvoiceModal from "../components/EditInvoiceModal";

const devUrl = "http://localhost:4000/temiperi/invoices";
const prodUrl =
  "https://temiperi-stocks-backend.onrender.com/temiperi/invoices";
const baseUrl = window.location.hostname === "localhost" ? devUrl : prodUrl;

const Invoices = ({ searchQuery }) => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [showPhonePrompt, setShowPhonePrompt] = useState(false);
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [currentTotal, setCurrentTotal] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const printRef = useRef();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await axios.get(`${prodUrl}`);
        if (response.data && response.data.data) {
          // Sort invoices by date, most recent first
          const sortedInvoices = response.data.data.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setInvoices(sortedInvoices);

          // Calculate initial total
          const total = sortedInvoices.reduce(
            (sum, invoice) => sum + invoice?.totalAmount,
            0
          );
          setCurrentTotal(total);
        }
      } catch (error) {
        console.error("Error fetching invoices:", error);
        toast.error("Failed to fetch invoices");
      }
    };
    fetchInvoices();
  }, []);

  // Handle both time filter and search
  useEffect(() => {
    let filtered = invoices;

    // Apply time filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(thisWeekStart.getDate() - today.getDay());

    switch (activeFilter) {
      case "today":
        filtered = filtered.filter(
          (invoice) => new Date(invoice.createdAt) >= today
        );
        break;
      case "yesterday":
        filtered = filtered.filter((invoice) => {
          const date = new Date(invoice.createdAt);
          return date >= yesterday && date < today;
        });
        break;
      case "thisWeek":
        filtered = filtered.filter(
          (invoice) => new Date(invoice.createdAt) >= thisWeekStart
        );
        break;
      case "past":
        filtered = filtered.filter(
          (invoice) => new Date(invoice.createdAt) < thisWeekStart
        );
        break;
      default:
        break;
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (invoice) =>
          invoice.customerName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          invoice.invoiceNumber
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    // Always sort by date, newest first
    const sortedFiltered = filtered.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    setFilteredInvoices(sortedFiltered);

    const total = sortedFiltered.reduce(
      (sum, invoice) => sum + invoice.totalAmount,
      0
    );
    setCurrentTotal(total);
  }, [activeFilter, searchQuery, invoices]);

  const handleWhatsAppShare = (invoice) => {
    setSelectedInvoice(invoice);
    setShowPhonePrompt(true);
  };

  const handlePrint = (invoice) => {
    // Format the date and time
    const now = new Date(invoice.createdAt);
    const formattedDate = now.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const formattedTime = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Create a temporary div to hold the invoice content
    const printContent = document.createElement("div");
    printContent.innerHTML = `
            <div class="mt-8 p-8 border-t-2 border-gray-200 bg-gray-100 rounded-lg shadow-sm">
                <!-- Header -->
                <div class="invoice-header flex justify-between items-center gap-5 mb-8 pb-5 border-b-2 border-gray-200">
                    <div class="flex items-center">
                        <img src="/src/assets/temiperi-logo.jpg" alt="Company Logo" style="width: 100px; height: auto;" />
                        <div class="ml-4">
                            <h2 class="text-xl font-bold text-gray-800">TEMIPERI ENTERPRISE</h2>
                            <p class="text-sm text-gray-600">Quality Products, Excellent Service</p>
                        </div>
                    </div>
                    <div class="text-right text-gray-600 text-sm">
                        <p>Date: ${formattedDate}</p>
                        <p>Time: ${formattedTime}</p>
                    </div>
                </div>

                <!-- Customer Info -->
                <div class="flex justify-between mb-8 p-4 bg-white rounded-md">
                    <div>
                        <h4 class="text-gray-800 font-semibold">Invoice #: ${
                          invoice.invoiceNumber
                        }</h4>
                        <h4 class="text-gray-800 font-semibold">Customer: ${
                          invoice.customerName
                        }</h4>
                        <h4 class="text-gray-800 font-semibold">
                      Payment Method: ${invoice?.paymentMethod}
                        </h4>

                    </div>
                </div>

                <!-- Order Summary -->
                <h3 class="text-center text-2xl font-semibold text-gray-800 mb-5">Order Summary</h3>
                <table class="w-full mt-4 bg-white shadow-md rounded-lg overflow-hidden">
                    <thead class="bg-gray-800 text-white uppercase text-sm">
                        <tr>
                            <th class="p-4 text-left">#</th>
                            <th class="p-4 text-left">Product</th>
                            <th class="p-4 text-center">Quantity</th>
                            <th class="p-4 text-left">Unit Price</th>
                            <th class="p-4 text-left">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoice.items
                          .map(
                            (item, index) => `
                            <tr class="hover:bg-gray-100 transition duration-200">
                                <td class="p-4">${index + 1}</td>
                                <td class="p-4">${item.description}</td>
                                <td class="p-4 text-center">${
                                  item.quantity
                                }</td>
                                <td class="p-4">
                                    <span class="text-gray-600 mr-1">GH₵</span>
                                    ${item.price.toFixed(2)}
                                </td>
                                <td class="p-4">
                                    <span class="text-gray-600 mr-1">GH₵</span>
                                    ${(item.quantity * item.price).toFixed(2)}
                                </td>
                            </tr>
                        `
                          )
                          .join("")}
                    </tbody>
                    <tfoot class="bg-gray-100 font-semibold">
                        <tr>
                            <td class="p-4" colspan="4">
                                <strong>Total Amount:</strong>
                            </td>
                            <td class="p-4">
                                <span class="text-gray-600 mr-1">GH₵</span>
                                ${invoice?.totalAmount?.toFixed(2)}
                            </td>
                        </tr>
                    </tfoot>
                </table>

                <!-- Footer -->
                <div class="mt-10 pt-5 border-t-2 border-gray-200">
                    <div class="flex justify-between items-center mb-8">
                        <div class="text-center">
                            <p class="text-gray-600">____________________</p>
                            <p class="text-gray-800 text-sm">Authorized Signature</p>
                        </div>
                    </div>
                    <div class="p-5 bg-gray-100 rounded-md">
                        <p class="font-semibold text-gray-800 mb-2">All Terms & Conditions applied</p>
                    </div>
                </div>
            </div>
        `;

    // Create a new window for printing
    const printWindow = window.open("", "_blank", "width=800,height=600");
    printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Invoice #${invoice.invoiceNumber}</title>
                    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
                    <style>
                        @media print {
                            * {
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                            }
                            @page {
                                size: auto;  
                                margin: 0.5cm 1cm;  
                            }
                            @page :first {
                                margin-top: 0.5cm;
                            }
                            html, body {
                                margin: 0;
                                padding: 0;
                                font-family: Arial, sans-serif;
                                line-height: 1.6;
                                color: #000 !important;
                                background-color: #fff !important;
                                -webkit-print-color-adjust: exact;
                                height: auto !important;  
                                min-height: 100%;
                            }
                            #print-content {
                                margin: 0 auto;
                                max-width: 210mm;  
                                width: 100%;
                                padding: 0;
                                box-sizing: border-box;
                            }
                            .invoice-container {
                                width: 100%;
                                margin: 0 auto;
                                padding: 1cm 0;
                                box-sizing: border-box;
                            }
                            table {
                                width: 100%;
                                border-collapse: collapse;
                                background-color: #ffffff !important;
                                page-break-inside: auto;
                                margin-bottom: 1cm;  
                            }
                            tr {
                                page-break-inside: avoid;
                                page-break-after: auto;
                            }
                            thead {
                                display: table-header-group;  
                            }
                            tfoot {
                                display: table-footer-group;  
                            }
                            /* Only show header on first page */
                            .invoice-header {
                                display: none;
                            }
                            .invoice-header:first-of-type {
                                display: flex;
                            }
                            /* Ensure content fills the page width appropriately */
                            .flex {
                                display: block !important;  
                            }
                            .flex.justify-between {
                                display: flex !important;  
                            }
                            /* Adjust spacing for longer formats */
                            .mt-8 {
                                margin-top: 1cm !important;
                            }
                            .mb-8 {
                                margin-bottom: 1cm !important;
                            }
                            .p-8 {
                                padding: 1cm !important;
                            }
                            /* Ensure proper scaling of the logo */
                            img {
                                max-width: 120px;
                                height: auto !important;
                            }
                            /* Better spacing for data cells */
                            th, td {
                                padding: 0.5cm 0.3cm;
                                text-align: left;
                                border-bottom: 1px solid #e5e7eb !important;
                                font-size: 11pt;  
                            }
                            /* Improve header visibility */
                            thead.bg-gray-800 th {
                                background-color: #1f2937 !important;
                                color: #ffffff !important;
                                -webkit-print-color-adjust: exact;
                                font-size: 11pt;
                                font-weight: 600;
                            }
                            /* Footer styling */
                            .invoice-footer {
                                margin-top: 2cm;
                                page-break-inside: avoid;
                            }
                            /* Hide non-printable elements */
                            .no-print {
                                display: none !important;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div id="print-content">
                        <div class="invoice-container">
                            ${printContent.innerHTML}
                        </div>
                    </div>
                    <script>
                        window.onload = function() {
                            document.querySelectorAll('thead.bg-gray-800').forEach(header => {
                                header.style.backgroundColor = '#1f2937';
                                header.style.color = '#ffffff';
                            });
                            // Force immediate print to avoid blank page
                            window.print();
                        }
                    </script>
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
    }, 1000);
  };

  const sendWhatsAppMessage = () => {
    if (!customerPhone || !selectedInvoice) return;

    const message =
      `*TEMIPERI ENTERPRISE*\n\n` +
      `*Invoice #:* ${selectedInvoice.invoiceNumber}\n` +
      `*Customer:* ${selectedInvoice.customerName}\n` +
      `*Date:* ${new Date(selectedInvoice.createdAt).toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      )}\n` +
      `*Time:* ${new Date(selectedInvoice.createdAt).toLocaleTimeString(
        "en-US",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      )}\n\n` +
      `*Order Details:*\n` +
      `${selectedInvoice.items
        .map(
          (item, index) =>
            `${index + 1}. ${item.description} - Qty: ${
              item.quantity
            }, Price: GH₵${item.price.toFixed(2)}`
        )
        .join("\n")}\n\n` +
      `*Total Amount:* GH₵${selectedInvoice.totalAmount.toFixed(2)}\n\n` +
      `Thank you for your business!`;

    const whatsappUrl = `https://wa.me/${customerPhone}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");

    setShowPhonePrompt(false);
    setCustomerPhone("");
    setSelectedInvoice(null);
  };

  const handleDelete = async (invoiceId) => {
    if (!invoiceId) {
      toast.error("Invalid invoice ID");
      return;
    }

    try {
      const confirmResult = window.confirm(
        "Are you sure you want to delete this invoice? This action cannot be undone."
      );
      if (!confirmResult) return;

      const response = await axios.get(
        `https://temiperi-stocks-backend.onrender.com/temiperi/delete-invoice?id=${invoiceId}`
      );

      if (response.data) {
        setInvoices((prevInvoices) =>
          prevInvoices.filter((invoice) => invoice._id !== invoiceId)
        );
        // Update filtered invoices as well
        setFilteredInvoices((prevFiltered) =>
          prevFiltered.filter((invoice) => invoice._id !== invoiceId)
        );
        toast.success("Invoice deleted successfully");
      } else {
        throw new Error("Failed to delete invoice");
      }
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to delete invoice. Please try again."
      );
    }
  };

  const handleEdit = async (invoice) => {
    setEditingInvoice(invoice);
    setIsEditing(true);
  };

  const handleSaveEdit = async (editedInvoice) => {
    if (!editedInvoice || !editedInvoice._id) {
      toast.error("Invalid invoice data");
      return;
    }

    try {
      // Basic validation
      if (
        !editedInvoice.customerName ||
        !editedInvoice.items ||
        editedInvoice.items.length === 0
      ) {
        throw new Error(
          "Invalid invoice data. Please check all required fields."
        );
      }

      // Calculate total amount to ensure it matches
      const calculatedTotal = editedInvoice.items.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      );
      if (Math.abs(calculatedTotal - editedInvoice.totalAmount) > 0.01) {
        throw new Error(
          "Total amount mismatch. Please check the calculations."
        );
      }

      const response = await axios.post(
        `https://temiperi-stocks-backend.onrender.com/temiperi/update-invoice?id=${editedInvoice._id}`,
        editedInvoice
      );

      if (response.data) {
        // Update both invoices and filtered invoices states with the updated invoice
        const updatedInvoice = response.data;

        setInvoices((prevInvoices) =>
          prevInvoices.map((inv) =>
            inv._id === editedInvoice._id ? updatedInvoice : inv
          )
        );

        setFilteredInvoices((prevFiltered) =>
          prevFiltered.map((inv) =>
            inv._id === editedInvoice._id ? updatedInvoice : inv
          )
        );

        toast.success("Invoice updated successfully");
        setIsEditing(false);
        setEditingInvoice(null);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast.error(
        error.message || "Failed to update invoice. Please try again."
      );
    }
  };

  return (
    <div className="pt-4 md:px-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-medium">Invoices</h1>
        <button className="bg-blue py-2 px-4 rounded text-white hover:bg-opacity-80">
          WayBill
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {["all", "today", "yesterday", "thisWeek", "past"].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                            ${
                              activeFilter === filter
                                ? "bg-blue text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
          >
            {filter === "all"
              ? "All Invoices"
              : filter === "today"
              ? "Today's Invoices"
              : filter === "yesterday"
              ? "Yesterday's Invoices"
              : filter === "thisWeek"
              ? "This Week's Invoices"
              : "Past Invoices"}
          </button>
        ))}
      </div>

      {/* Invoice Table */}
      <InvoiceTable
        invoices={filteredInvoices}
        handlePrint={handlePrint}
        handleWhatsAppShare={handleWhatsAppShare}
        handleDelete={handleDelete}
        handleEdit={handleEdit}
        isEditing={isEditing}
      />

      {/* Edit Modal */}
      <EditInvoiceModal
        invoice={editingInvoice}
        isOpen={isEditing}
        onClose={() => {
          setIsEditing(false);
          setEditingInvoice(null);
        }}
        onSave={handleSaveEdit}
      />

      {/* Phone Number Prompt Modal */}
      {showPhonePrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">
              Enter Customer's Phone Number
            </h3>
            <input
              type="text"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Enter phone number"
              className="w-full p-2 border rounded mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowPhonePrompt(false)}
                className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={sendWhatsAppMessage}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Total Amount */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900">
          {activeFilter === "all"
            ? "Total Sales: "
            : activeFilter === "today"
            ? "Today's Total Sales: "
            : activeFilter === "yesterday"
            ? "Yesterday's Total Sales: "
            : activeFilter === "thisWeek"
            ? "This Week's Total Sales: "
            : "Past Total Sales: "}
          <span className="text-blue font-bold">
            GH₵{currentTotal.toFixed(2)}
          </span>
        </h3>
      </div>
    </div>
  );
};

export default Invoices;
