import React from 'react'
import { useEffect, useState } from "react";
import Preview from '../components/Preview';
import PrintablePreview from '../components/PrintablePreview';
import InvoiceGenerator from '../components/InvoiceGenerator';
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BsWhatsapp } from "react-icons/bs";
import { MdOutlinePrint } from "react-icons/md";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import html2pdf from "html2pdf.js";

const baseURL =
  process.env.NODE_ENV === "production"
    ? "https://temiperi-stocks-backend.onrender.com/temiperi"
    : "http://localhost:4000/temiperi";

const Orders = () => {
    const [data, setData] = useState({
        invoiceNumber: "",
        customerName: "",
        paymentMethod: "",
        items: [{ description: "", quantity: 0, price: 0 }],
      });
    const [loading, setLoading] = useState(false);
    const [latestInvoiceNumber, setLatestInvoiceNumber] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [showPhonePrompt, setShowPhonePrompt] = useState(false);
    const [customerPhone, setCustomerPhone] = useState("");
    const [showActionModal, setShowActionModal] = useState(false);
    const [products, setProducts] = useState([]);
    const [previewItems, setPreviewItems] = useState([]);

    useEffect(() => {
        const savedPreviewItems = localStorage.getItem("previewItems");
        if (savedPreviewItems) {
            setPreviewItems(JSON.parse(savedPreviewItems));
            localStorage.removeItem("previewItems");
        }

        const fetchProducts = async () => {
            try {
                const response = await axios.get('https://temiperi-stocks-backend.onrender.com/temiperi/products');
                setProducts(response.data.products);
            } catch (error) {
                console.error("Error fetching products:", error);
                toast.error("Failed to fetch products");
            }
        };

        const generateInvoiceNumber = async () => {
            try {
                setLoading(true);
                const response = await axios.post(`${baseURL}/invoice/number`);
                const { invoiceNumber } = response.data;
                if (!invoiceNumber || typeof invoiceNumber !== "string" || !invoiceNumber.startsWith("tm")) {
                    throw new Error("Invalid invoice number format");
                }
                setData(prevData => ({
                    ...prevData,
                    invoiceNumber: invoiceNumber,
                }));
            } catch (error) {
                console.error("Error generating invoice number:", error);
                const timestamp = Date.now().toString().slice(-6);
                const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
                const fallbackNumber = `tm${timestamp}${randomNum}`;
                setData(prevData => ({
                    ...prevData,
                    invoiceNumber: fallbackNumber,
                }));
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
        generateInvoiceNumber();
    }, []);

    const onChangeHandler = (e) => {
        const { name, value } = e.target;
        setData((data) => ({ ...data, [name]: value }));
      };

    const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
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
        setPreviewItems([...previewItems, { ...currentItem }]);
    
        // Reset current item
        setData({
          ...data,
          items: [{ description: "", quantity: 0, price: 0 }],
        });
      };

    const getFilteredProducts = () => {
        if (!searchQuery) return products; // Return all products if searchQuery is empty
        return products.filter((product) =>
          product?.name?.toLowerCase().startsWith(searchQuery.toLowerCase())
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          // Check if there are any items to submit
          if (previewItems.length === 0) {
            const currentItem = data.items[0];
    
            // If no items in preview and current item is empty, show error
            if (!currentItem.description || currentItem.quantity <= 0) {
              toast.error("Please add at least one item before submitting.");
              return;
            }
    
            // If current item has data, add it first
            if (currentItem.description && currentItem.quantity > 0) {
              const selectedProduct = products.find(
                (product) => product.name === currentItem.description
              );
              if (
                selectedProduct &&
                selectedProduct.quantity < currentItem.quantity
              ) {
                toast.error("Not enough stock available for this product.");
                return;
              }
              // Add current item to preview items
              setPreviewItems([...previewItems, { ...currentItem }]);
            }
          }
    
          // Get final list of items
          const finalItems = [...previewItems];
          if (data.items[0].description && data.items[0].quantity > 0) {
            finalItems.push({ ...data.items[0] });
          }
    
          // Calculate total amount
          const totalAmount = finalItems.reduce((sum, item) => {
            return sum + item.quantity * item.price;
          }, 0);
    
          // Prepare the invoice data
          const invoiceData = {
            invoiceNumber: data.invoiceNumber,
            customerName: data.customerName,
            paymentMethod: data.paymentMethod,
            items: finalItems.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              price: item.price,
            })),
            totalAmount,
          };
    
          //order payload
          const orderPayload = {
            invoiceNumber: data.invoiceNumber,
            customerName: data.customerName,
            paymentMethod: data.paymentMethod,
            items: finalItems.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              price: item.price,
            })),
          };
    
          // Submit the invoice
          await axios.post(`${baseURL}/invoice`, invoiceData, {
            headers: {
              "Content-Type": "application/json",
            },
          });
    
          //submit the order
          const orderResponse = await axios.post(`${baseURL}/order`, orderPayload, {
            headers: {
              "Content-Type": "application/json",
            },
          });
    
          if (orderResponse.status === 201) {
            toast.success("Order submitted successfully!", {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
    
            //update the products to undertake the deduction
            for (const item of finalItems) {
              const selectedProduct = products.find(
                (product) => product.name === item.description
              );
    
              if (selectedProduct) {
                await axios.post(`${baseURL}/product-update`, {
                  productId: selectedProduct._id,
                  quantityToDeduct: item.quantity,
                });
              }
            }
    
            // Show modal instead of resetting form
            setShowActionModal(true);
          }
        } catch (error) {
          console.error("Error submitting invoice:", error);
          toast.error(
            error.response?.data?.error ||
              "Failed to submit invoice. Please try again.",
            {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            }
          );
        }
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
        const printContent = document.querySelector("#invoice-content");
        if (!printContent) {
            toast.error("Print reference not found");
            return;
        }

        const printWindow = window.open("", "_blank", "width=800,height=600");
        printWindow.document.write(`
            <html>
                <head>
                    <title>Print Invoice</title>
                    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
                    <script src="https://unpkg.com/react@17/umd/react.production.min.js"></script>
                    <script src="https://unpkg.com/react-dom@17/umd/react-dom.production.min.js"></script>
                    <style>
                        body { font-family: Arial, sans-serif; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
                        th { background-color: #f8f9fa; }
                    </style>
                </head>
                <body>
                    ${printContent.innerHTML}
                </body>
            </html>
        `);
        printWindow.document.close();

            setTimeout(() => {
                printWindow.print();
            // Reload page after print dialog is closed
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
        }, 500);
    };

    const handleShareWhatsApp = () => {
        setShowPhonePrompt(true);
    };

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

        // Create a message with invoice details
        const message = `Hello! Here's your invoice #${data.invoiceNumber}\n\n` +
            `Total Amount: GH₵${previewItems.reduce((sum, item) => sum + item.quantity * item.price, 0).toFixed(2)}\n\n` +
            `Thank you for your business!`;

        // Format phone number and create WhatsApp URL
        const formattedPhone = customerPhone.replace(/\D/g, "");
        const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;

        // Open WhatsApp in new window
        window.open(whatsappUrl, "_blank");
        setShowPhonePrompt(false);
    };

    return(
        <div className='pt-6 px-6 flex gap-6 flex-col lg:flex-row'>
            <div className='flex flex-col gap-4 flex-1'>
                <h1 className='text-3xl font-medium'>Submit Order</h1>
                <form onSubmit={handleSubmit} className='flex flex-col gap-2'>
                    <label className='flex flex-col gap-1'>
                        Invoice Number
                        <InvoiceGenerator
                        value={data.invoiceNumber}
                        loading={loading}
                        />
                    </label>
                    <label className='flex flex-col gap-1'>
                        Customer Name:
                    <input
                    type="text"
                    value={data.customerName}
                    onChange={onChangeHandler}
                    name="customerName"
                    required
                    className='border p-2 rounded-md border-black outline-none'
                    />
                    </label>
                    <label className='flex flex-col gap-2'>
                        Payment Method:
                        <select
                        name="paymentMethod"
                        value={data.paymentMethod}
                        onChange={onChangeHandler}
                        required
                        className='border p-2 rounded-md border-black outline-none'
                        >
                        <option value="">Select a payment method</option>
                        <option value="cash">Cash</option>
                        <option value="momo">Mobile Money</option>
                        <option value="credit">Credit</option>
                        </select>
                    </label>
                    <h3 className='text-2xl font-medium pt-4'>Add Item</h3>
                    <div className="items">
                        <label className='flex flex-col gap-2'>
                        Description:
                        <div className="flex items-center gap-4 flex-1 w-full">
                            <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Search products..."
                            className='border p-2 rounded-md border-black outline-none w-full'
                            />
                            <select
                            value={data.items[0].description}
                            onChange={(e) =>
                                handleItemChange(0, "description", e.target.value)
                            }
                            className='border p-2 rounded-md border-black outline-none w-full'
                            required
                            >
                            <option value="">Select a product</option>
                            {getFilteredProducts().map((product, idx) => (
                                <option key={idx} value={product.name}>
                                {product.name}
                                </option>
                            ))}
                            </select>
                        </div>
                        </label>
                        <label className='flex flex-col gap-2'>
                        Quantity:
                        <input
                            type="number"
                            value={data.items[0].quantity || ""}
                            onChange={(e) =>
                            handleItemChange(0, "quantity", Number(e.target.value))
                            }
                            className='border p-2 rounded-md border-black outline-none'
                            required
                            min="1" // Ensures quantity starts from 1
                        />
                        </label>
                        <div className='flex items-center justify-between py-2'>
                            <label className='flex items-center gap-2'>
                                Price: GH₵
                                <strong className="text-2xl">
                                    {data.items[0].price.toFixed(2)}
                                </strong>
                            </label>
                            <label className='flex items-center gap-2'>
                                Total: GH₵
                                <strong className='text-2xl'>
                                {(data.items[0].quantity * data.items[0].price).toFixed(
                                    2
                                )}
                                </strong>
                            </label>
                        </div>
                    </div>

                    <div className='flex items-center gap-6'>
                        <button type="button" className='bg-blue text-white px-6 hover:bg-opacity-80 py-2 rounded-md ' onClick={handleAddItem}>Add Item</button>
                        <button type="submit" className='bg-blue text-white px-6 hover:bg-opacity-80 py-2 rounded-md '>Submit</button>
                    </div>
                </form>
            </div>
            <div className='flex-1'>
                <div id="invoice-content">
                    <Preview data={data} previewItems={previewItems} />
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

                {/* Phone number prompt */}
                {showPhonePrompt && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-lg shadow-xl">
                            <h3 className="text-lg font-semibold mb-4">Enter Customer's Phone Number</h3>
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
            </div>
        </div>
    )
}

export default Orders;