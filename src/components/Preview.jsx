import React from 'react';
import Logo from "../assets/temiperi-logo.jpg"

const Preview = ({ data, previewItems }) => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const formattedTime = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
    });
    
    // Calculate total amount including current item
    const totalAmount = previewItems.reduce((sum, item) => sum + item.quantity * item.price, 0) +
        (data.items[0].description ? data.items[0].quantity * data.items[0].price : 0);
    
    return (
        <div className="mt-8 p-4 md:p-8 border-t-2 border-gray-200 bg-gray-100 rounded-lg shadow-sm" id="invoice-content">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 pb-5 border-b-2 border-gray-200">
                <img src={Logo} alt="Company Logo" className="w-24" />
                <div className="text-right text-gray-600 text-sm">
                    <p>Date: {formattedDate}</p>
                    <p>Time: {formattedTime}</p>
                </div>
            </div>

            {/* Customer Info */}
            <div className="flex justify-between mb-8 p-4 bg-white rounded-md">
                <div>
                    <h4 className="text-gray-800 font-semibold">Invoice #: {data.invoiceNumber || 'Not Generated'}</h4>
                    <h4 className="text-gray-800 font-semibold">Customer: {data.customerName || 'Not Specified'}</h4>
                    <h4 className="text-gray-800 font-semibold">Payment Method: {data?.paymentMethod || 'Not Specified'}</h4>
                    
                    {/* Show scheduled delivery information if applicable */}
                    {data.isScheduled && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                            <h4 className="text-gray-800 font-semibold">Scheduled for Delivery</h4>
                            <p className="text-gray-600">Delivery Date: {data.deliveryDate?.toLocaleDateString()}</p>
                            {data.deliveryAddress && <p className="text-gray-600">Address: {data.deliveryAddress}</p>}
                            {data.deliveryNotes && <p className="text-gray-600">Notes: {data.deliveryNotes}</p>}
                        </div>
                    )}
                </div>
            </div>

            {/* Order Summary */}
            <h3 className="text-center text-2xl font-semibold text-gray-800 mb-5">Order Summary</h3>
            <table className="w-full mt-4 bg-white shadow-md rounded-lg overflow-hidden">
                <thead className="bg-gray-800 text-white uppercase text-sm">
                    <tr>
                        <th className="p-2 md:p-4 text-left">#</th>
                        <th className="p-2 md:p-4 text-left">Product</th>
                        <th className="p-2 md:p-4 text-center">Quantity</th>
                        <th className="p-2 md:p-4 text-left">Unit Price</th>
                        <th className="p-2 md:p-4 text-left">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {previewItems.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-100 transition duration-200">
                            <td className="p-4">{index + 1}</td>
                            <td className="p-4">{item.description}</td>
                            <td className="p-4 text-center">{item.quantity}</td>
                            <td className="p-4">
                                <span className="text-gray-600 mr-1">GH₵</span>
                                {item.price.toFixed(2)}
                            </td>
                            <td className="p-4">
                                <span className="text-gray-600 mr-1">GH₵</span>
                                {(item.quantity * item.price).toFixed(2)}
                            </td>
                        </tr>
                    ))}
                    {data.items[0].description && data.items[0].quantity > 0 && (
                        <tr className="bg-gray-50">
                            <td className="p-4">{previewItems.length + 1}</td>
                            <td className="p-4">{data.items[0].description}</td>
                            <td className="p-4 text-center">{data.items[0].quantity}</td>
                            <td className="p-4">
                                <span className="text-gray-600 mr-1">GH₵</span>
                                {data.items[0].price.toFixed(2)}
                            </td>
                            <td className="p-4">
                                <span className="text-gray-600 mr-1">GH₵</span>
                                {(data.items[0].quantity * data.items[0].price).toFixed(2)}
                            </td>
                        </tr>
                    )}
                </tbody>
                <tfoot className="bg-gray-100 font-semibold">
                    <tr>
                        <td className="p-4" colSpan="4">
                            <strong>Total Amount:</strong>
                        </td>
                        <td className="p-4">
                            <span className="text-gray-600 mr-1">GH₵</span>
                            {totalAmount.toFixed(2)}
                        </td>
                    </tr>
                </tfoot>
            </table>

            {/* Payment Details */}
            <div className="mt-6 p-4 bg-white rounded-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Payment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border-r border-gray-200 pr-4">
                        <p className="text-gray-600">Total Amount:</p>
                        <p className="text-xl font-bold">GH₵{totalAmount.toFixed(2)}</p>
                    </div>
                    
                    <div className="border-r border-gray-200 pr-4 pl-4">
                        <p className="text-gray-600">Amount Paid:</p>
                        <p className="text-xl font-bold">GH₵{(parseFloat(data.amountPaid) || totalAmount).toFixed(2)}</p>
                    </div>
                    
                    <div className="pl-4">
                        <p className="text-gray-600">Balance/Change:</p>
                        <p className={`text-xl font-bold ${(data.balance >= 0) ? 'text-green-600' : 'text-red-600'}`}>
                            GH₵{(data.balance || 0).toFixed(2)}
                            {data.balance > 0 && " (Change)"}
                            {data.balance < 0 && " (Owing)"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-10 pt-5 border-t-2 border-gray-200">
                <div className="flex justify-between items-center mb-8">
                    <div className="text-center">
                        <p className="text-gray-600">____________________</p>
                        <p className="text-gray-800 text-sm">Authorized Signature</p>
                    </div>
                </div>
                <div className="p-5 bg-gray-100 rounded-md">
                    <p className="font-semibold text-gray-800 mb-2">All Terms & Conditions applied</p>
                </div>
            </div>
        </div>
    );
};

// Make sure to have this explicit default export statement
export default Preview;
