import React, { useState } from 'react';
import { BsWhatsapp } from "react-icons/bs";
import { MdOutlinePrint } from "react-icons/md";

const InvoiceTable = ({ invoices, handlePrint, handleWhatsAppShare }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(7);

    // Get current invoices
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentInvoices = invoices.slice(indexOfFirstItem, indexOfLastItem);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Calculate page numbers with ellipsis
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxVisible = 5;
        const totalPages = Math.ceil(invoices.length / itemsPerPage);

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            pageNumbers.push(1);
            if (currentPage <= 3) {
                for (let i = 2; i <= 4; i++) {
                    pageNumbers.push(i);
                }
                pageNumbers.push('...');
                pageNumbers.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pageNumbers.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pageNumbers.push(i);
                }
            } else {
                pageNumbers.push('...');
                pageNumbers.push(currentPage - 1);
                pageNumbers.push(currentPage);
                pageNumbers.push(currentPage + 1);
                pageNumbers.push('...');
                pageNumbers.push(totalPages);
            }
        }
        return pageNumbers;
    };

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
                {/* Mobile View */}
                <div className="lg:hidden">
                    {currentInvoices.map((invoice) => (
                        <div key={invoice._id} className="p-4 border-b">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">Invoice #:</span>
                                    <span>{invoice.invoiceNumber}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">Customer:</span>
                                    <span>{invoice.customerName}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">Amount:</span>
                                    <span>GH₵{invoice.totalAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">Payment:</span>
                                    <span className={`px-2 text-xs font-semibold rounded-full 
                                        ${invoice.paymentMethod === 'momo' ? 'bg-green-100 text-green-800' : 
                                        invoice.paymentMethod === 'credit' ? 'bg-red-100 text-red-800' : 
                                        'bg-blue-100 text-blue-800'}`}>
                                        {invoice.paymentMethod === 'momo' ? 'Mobile Money' :
                                        invoice.paymentMethod === 'credit' ? 'Credit' :
                                        invoice.paymentMethod === 'cash' ? 'Cash' : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-end space-x-2 pt-2">
                                    <button
                                        onClick={() => handlePrint(invoice)}
                                        className="bg-blue hover:bg-opacity-80 text-white px-3 py-1 rounded inline-flex items-center space-x-1"
                                    >
                                        <MdOutlinePrint className="w-4 h-4" />
                                        <span>Print</span>
                                    </button>
                                    <button
                                        onClick={() => handleWhatsAppShare(invoice)}
                                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded inline-flex items-center space-x-1"
                                    >
                                        <BsWhatsapp className="w-4 h-4" />
                                        <span>Share</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop View */}
                <table className="hidden lg:table min-w-full divide-y divide-gray-200">
                    <thead className="bg-blue text-white">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                Invoice Number
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                Customer Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                Total Amount
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                Payment Method
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentInvoices.map((invoice) => (
                            <tr key={invoice._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {invoice.invoiceNumber}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {invoice.customerName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    GH₵{invoice.totalAmount.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${invoice.paymentMethod === 'momo' ? 'bg-green-100 text-green-800' : 
                                        invoice.paymentMethod === 'credit' ? 'bg-red-100 text-red-800' : 
                                        'bg-blue-100 text-blue-800'}`}>
                                        {invoice.paymentMethod === 'momo' ? 'Mobile Money' :
                                        invoice.paymentMethod === 'credit' ? 'Credit' :
                                        invoice.paymentMethod === 'cash' ? 'Cash' : 'N/A'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <button
                                        onClick={() => handlePrint(invoice)}
                                        className="bg-blue hover:bg-opacity-80 text-white px-3 py-1 rounded inline-flex items-center space-x-1"
                                    >
                                        <MdOutlinePrint className="w-4 h-4" />
                                        <span>Print</span>
                                    </button>
                                    <button
                                        onClick={() => handleWhatsAppShare(invoice)}
                                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded inline-flex items-center space-x-1"
                                    >
                                        <BsWhatsapp className="w-4 h-4" />
                                        <span>Share</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex justify-center w-full">
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50
                                ${currentPage === 1 ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50'}`}
                        >
                            Previous
                        </button>
                        {getPageNumbers().map((number, index) => (
                            <button
                                key={index}
                                onClick={() => number !== '...' ? paginate(number) : null}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                                    ${number === currentPage
                                        ? 'z-10 bg-blue border-blue text-white'
                                        : number === '...'
                                            ? 'cursor-default bg-white border-gray-300 text-gray-700'
                                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {number}
                            </button>
                        ))}
                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === Math.ceil(invoices.length / itemsPerPage)}
                            className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500
                                ${currentPage === Math.ceil(invoices.length / itemsPerPage) ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50'}`}
                        >
                            Next
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default InvoiceTable;
