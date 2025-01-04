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
            // If total pages is less than max visible, show all pages
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            // Always show first page
            pageNumbers.push(1);

            if (currentPage <= 3) {
                // If current page is near the start
                for (let i = 2; i <= 4; i++) {
                    pageNumbers.push(i);
                }
                pageNumbers.push('...');
                pageNumbers.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                // If current page is near the end
                pageNumbers.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pageNumbers.push(i);
                }
            } else {
                // If current page is in the middle
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
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-blue text-white">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                Invoice Number
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                Customer Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                Total Amount
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                Payment Method
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
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
                <div className="flex-1 flex justify-between sm:hidden">
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md 
                            ${currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === Math.ceil(invoices.length / itemsPerPage)}
                        className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md 
                            ${currentPage === Math.ceil(invoices.length / itemsPerPage) ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                        Next
                    </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                            Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                            <span className="font-medium">
                                {Math.min(indexOfLastItem, invoices.length)}
                            </span>{' '}
                            of <span className="font-medium">{invoices.length}</span> results
                        </p>
                    </div>
                    <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium 
                                    ${currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                Previous
                            </button>
                            {getPageNumbers().map((number, idx) => (
                                number === '...' ? (
                                  <span key={`ellipsis-${idx}`} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                    {number}
                                  </span>
                                ) : (
                                  <button
                                    key={number}
                                    onClick={() => paginate(number)}
                                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium 
                                      ${currentPage === number 
                                        ? 'z-10 bg-blue text-white border-blue' 
                                        : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                                  >
                                    {number}
                                  </button>
                                )
                              ))}
                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === Math.ceil(invoices.length / itemsPerPage)}
                                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium 
                                    ${currentPage === Math.ceil(invoices.length / itemsPerPage) 
                                        ? 'text-gray-300' 
                                        : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                Next
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceTable;
