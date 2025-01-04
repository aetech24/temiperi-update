import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import InvoiceTable from "../components/InvoiceTable";

const devUrl = "http://localhost:4000/temiperi/invoices";
const prodUrl = "https://temiperi-stocks-backend.onrender.com/temiperi/invoices";
const baseUrl = window.location.hostname === "localhost" ? devUrl : prodUrl;

const Invoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [filteredInvoices, setFilteredInvoices] = useState([]);
    const [activeFilter, setActiveFilter] = useState('all');
    const [showPhonePrompt, setShowPhonePrompt] = useState(false);
    const [customerPhone, setCustomerPhone] = useState("");
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [currentTotal, setCurrentTotal] = useState(0);
    const printRef = useRef();

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const response = await axios.get(`${prodUrl}`);
                if (response.data && response.data.data) {
                    // Sort invoices by date, most recent first
                    const sortedInvoices = response.data.data.sort((a, b) => 
                        new Date(b.createdAt) - new Date(a.createdAt)
                    );
                    setInvoices(sortedInvoices);
                    setFilteredInvoices(sortedInvoices);
                    
                    // Calculate initial total
                    const total = sortedInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
                    setCurrentTotal(total);
                }
            } catch (error) {
                console.error("Error fetching invoices:", error);
                toast.error("Failed to fetch invoices");
            }
        };
        fetchInvoices();
    }, []);

    const filterInvoices = (filter) => {
        setActiveFilter(filter);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - 7);

        let filtered;
        switch (filter) {
            case 'today':
                filtered = invoices.filter(invoice => {
                    const invoiceDate = new Date(invoice.createdAt);
                    return invoiceDate >= today;
                });
                break;
            case 'yesterday':
                filtered = invoices.filter(invoice => {
                    const invoiceDate = new Date(invoice.createdAt);
                    return invoiceDate >= yesterday && invoiceDate < today;
                });
                break;
            case 'thisWeek':
                filtered = invoices.filter(invoice => {
                    const invoiceDate = new Date(invoice.createdAt);
                    return invoiceDate >= weekStart;
                });
                break;
            case 'past':
                filtered = invoices.filter(invoice => {
                    const invoiceDate = new Date(invoice.createdAt);
                    return invoiceDate < weekStart;
                });
                break;
            default:
                filtered = invoices;
        }
        
        // Always sort by date, newest first
        const sortedFiltered = filtered.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );
        setFilteredInvoices(sortedFiltered);

        const total = sortedFiltered.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
        setCurrentTotal(total);
    };

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
        const printContent = document.createElement('div');
        printContent.innerHTML = `
            <div class="mt-8 p-8 border-t-2 border-gray-200 bg-gray-100 rounded-lg shadow-sm">
                <!-- Header -->
                <div class="flex justify-between items-center mb-8 pb-5 border-b-2 border-gray-200">
                    <img src="/src/assets/temiperi-logo.jpg" alt="Company Logo" class="w-24" />
                    <div class="text-right text-gray-600 text-sm">
                        <p>Date: ${formattedDate}</p>
                        <p>Time: ${formattedTime}</p>
                    </div>
                </div>

                <!-- Customer Info -->
                <div class="flex justify-between mb-8 p-4 bg-white rounded-md">
                    <div>
                        <h4 class="text-gray-800 font-semibold">Invoice #: ${invoice.invoiceNumber}</h4>
                        <h4 class="text-gray-800 font-semibold">Customer: ${invoice.customerName}</h4>
                        <h4 class="text-gray-800 font-semibold">Payment Method: ${
                            invoice.paymentMethod === 'momo' ? 'Mobile Money' :
                            invoice.paymentMethod === 'credit' ? 'Credit' :
                            invoice.paymentMethod === 'cash' ? 'Cash' : 'N/A'
                        }</h4>
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
                        ${invoice.items.map((item, index) => `
                            <tr class="hover:bg-gray-100 transition duration-200">
                                <td class="p-4">${index + 1}</td>
                                <td class="p-4">${item.description}</td>
                                <td class="p-4 text-center">${item.quantity}</td>
                                <td class="p-4">
                                    <span class="text-gray-600 mr-1">GH₵</span>
                                    ${item.price.toFixed(2)}
                                </td>
                                <td class="p-4">
                                    <span class="text-gray-600 mr-1">GH₵</span>
                                    ${(item.quantity * item.price).toFixed(2)}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot class="bg-gray-100 font-semibold">
                        <tr>
                            <td class="p-4" colspan="4">
                                <strong>Total Amount:</strong>
                            </td>
                            <td class="p-4">
                                <span class="text-gray-600 mr-1">GH₵</span>
                                ${invoice.totalAmount.toFixed(2)}
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
        const printWindow = window.open('', '_blank', 'width=800,height=600');
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
                                size: A4;
                                margin: 1cm;
                            }
                            body {
                                font-family: Arial, sans-serif;
                                line-height: 1.6;
                                color: #000 !important;
                                background-color: #fff !important;
                            }
                            .bg-gray-800 {
                                background-color: #1f2937 !important;
                                color: white !important;
                            }
                            .bg-gray-100 {
                                background-color: #f3f4f6 !important;
                            }
                            .bg-white {
                                background-color: #ffffff !important;
                            }
                            .text-white {
                                color: #ffffff !important;
                            }
                            .text-gray-600 {
                                color: #4b5563 !important;
                            }
                            .text-gray-800 {
                                color: #1f2937 !important;
                            }
                            thead.bg-gray-800 th {
                                background-color: #1f2937 !important;
                                color: #ffffff !important;
                            }
                            .shadow-md {
                                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
                            }
                            .border-gray-200 {
                                border-color: #e5e7eb !important;
                            }
                            table {
                                width: 100%;
                                border-collapse: collapse;
                                background-color: #ffffff !important;
                            }
                            th, td {
                                padding: 1rem;
                                text-align: left;
                                border-bottom: 1px solid #e5e7eb !important;
                            }
                            th {
                                font-weight: bold;
                                text-transform: uppercase;
                                font-size: 0.875rem;
                            }
                            tfoot {
                                background-color: #f3f4f6 !important;
                            }
                            .rounded-lg {
                                border-radius: 0.5rem;
                                overflow: hidden;
                            }
                            /* Hide non-printable elements */
                            .no-print {
                                display: none !important;
                            }
                        }
                    </style>
                </head>
                <body>
                    ${printContent.innerHTML}
                    <script>
                        window.onload = function() {
                            document.querySelectorAll('thead.bg-gray-800').forEach(header => {
                                header.style.backgroundColor = '#1f2937';
                                header.style.color = '#ffffff';
                            });
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
                const mediaQueryList = printWindow.matchMedia('print');
                mediaQueryList.addEventListener('change', function(mql) {
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
          `*Date:* ${new Date(selectedInvoice.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
          })}\n` +
          `*Time:* ${new Date(selectedInvoice.createdAt).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit"
          })}\n\n` +
          `*Order Details:*\n` +
          `${selectedInvoice.items.map((item, index) => 
            `${index + 1}. ${item.description} - Qty: ${item.quantity}, Price: GH₵${item.price.toFixed(2)}`
          ).join("\n")}\n\n` +
          `*Total Amount:* GH₵${selectedInvoice.totalAmount.toFixed(2)}\n\n` +
          `Thank you for your business!`;

        const whatsappUrl = `https://wa.me/${customerPhone}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank");

        setShowPhonePrompt(false);
        setCustomerPhone("");
        setSelectedInvoice(null);
    };

    return (
        <div className='pt-4 px-6 space-y-6'>
            <div className='flex items-center justify-between'>
                <h1 className='text-3xl font-medium'>Invoices</h1>
                <button className='bg-blue py-2 px-4 rounded text-white hover:bg-opacity-80'>
                    WayBill
                </button>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
                {['all', 'today', 'yesterday', 'thisWeek', 'past'].map((filter) => (
                    <button
                        key={filter}
                        onClick={() => filterInvoices(filter)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                            ${activeFilter === filter 
                                ? 'bg-blue text-white' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                        {filter === 'all' ? 'All Invoices' :
                         filter === 'today' ? "Today's Invoices" :
                         filter === 'yesterday' ? "Yesterday's Invoices" :
                         filter === 'thisWeek' ? "This Week's Invoices" :
                         'Past Invoices'}
                    </button>
                ))}
            </div>

            {/* Invoice Table */}
            <InvoiceTable 
                invoices={filteredInvoices}
                handlePrint={handlePrint}
                handleWhatsAppShare={handleWhatsAppShare}
            />

            {/* Total Amount */}
            <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">
                    {activeFilter === 'all' ? "Total Sales: " :
                     activeFilter === 'today' ? "Today's Total Sales: " :
                     activeFilter === 'yesterday' ? "Yesterday's Total Sales: " :
                     activeFilter === 'thisWeek' ? "This Week's Total Sales: " :
                     "Past Total Sales: "}
                    <span className="text-blue font-bold">
                        GH₵{currentTotal.toFixed(2)}
                    </span>
                </h3>
            </div>

            {/* Phone Number Modal */}
            {showPhonePrompt && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                        <h3 className="text-lg font-medium mb-4">Enter Customer's Phone Number</h3>
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
        </div>
    );
};

export default Invoices;