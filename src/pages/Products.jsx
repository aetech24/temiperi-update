import React, { useState, useEffect } from "react";
import axios from "axios";
import PaginatedTable from "../components/PaginatedTable";

const Products = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        "https://temiperi-stocks-backend.onrender.com/temiperi/products"
      );
      const data = response.data.products || [];

      setProducts(data);
      setFilteredProducts(data);

      const uniqueCategories = [...new Set(data.map((item) => item.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (category) {
      const filtered = products.filter((product) => product.category === category);
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  };

  return (
    <div className="w-full pt-0 md:px-6">
      <div className="flex items-center justify-between py-6">
        <h1 className="text-2xl md:text-3xl font-medium">Available Stocks</h1>
        <div className="bg-blue bg-opacity-20 rounded-full px-2 py-1 group">
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="bg-blue md:py-2 md:px-6 bg-opacity-0 text-gray-600 outline-none flex-grow group-hover:cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>
      <PaginatedTable products={filteredProducts} />
    </div>
  );
};

export default Products;
