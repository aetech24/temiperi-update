import React, { useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const PaginatedTable = ({ products }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const paginatedProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(products.length / itemsPerPage);

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisible = 5;

    const startPage = Math.max(currentPage - 2, 1);
    const endPage = Math.min(currentPage + 2, totalPages);

    if (startPage > 1) pageNumbers.push(1);
    if (startPage > 2) pageNumbers.push("...");

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    if (endPage < totalPages - 1) pageNumbers.push("...");
    if (endPage < totalPages) pageNumbers.push(totalPages);

    return pageNumbers.map((number, index) =>
      typeof number === "number" ? (
        <button
          key={index}
          className={`px-3 py-1 mx-1 rounded-md ${
            currentPage === number
              ? "bg-blue text-white"
              : "bg-gray-200 hover:bg-blue-400 hover:text-white"
          }`}
          onClick={() => handlePageChange(number)}
        >
          {number}
        </button>
      ) : (
        <span key={index} className="px-3 py-1 mx-1">
          {number}
        </span>
      )
    );
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="">
      <table className="w-full border-collapse border border-gray-300 shadow-md">
        <thead className="bg-blue-500 text-white bg-blue">
          <tr>
            <th className="py-3 px-4 border">Product Name</th>
            <th className="py-3 px-4 border">Wholesale Price</th>
            <th className="py-3 px-4 border">Retail Price</th>
            <th className="py-3 px-4 border">Quantity</th>
          </tr>
        </thead>
        <tbody>
          {paginatedProducts.length > 0 ? (
            paginatedProducts.map((product) => (
              <tr key={product._id} className="hover:bg-gray-100">
                <td className="py-3 px-4 border">{product.name || "Unnamed Product"}</td>
                <td className="py-3 px-4 border">
                  GH₵{product.price?.whole_sale_price?.toFixed(2) || "0.00"}
                </td>
                <td className="py-3 px-4 border">
                  GH₵{product.price?.retail_price?.toFixed(2) || "0.00"}
                </td>
                <td className="py-3 px-4 border">{product.quantity || 0}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center py-4">
                No products available.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex items-center justify-center mt-6 space-x-2">
        <button
          className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <FaArrowLeft />
        </button>

        <div className="flex space-x-2">{renderPageNumbers()}</div>

        <button
          className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <FaArrowRight />
        </button>
      </div>
    </div>
  );
};

export default PaginatedTable;
