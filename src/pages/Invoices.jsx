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
        // Implement print functionality
        console.log("Printing invoice:", invoice);
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
        <div className='pt-6 px-6 space-y-6'>
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