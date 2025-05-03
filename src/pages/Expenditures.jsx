import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { MdDelete, MdEdit, MdAdd } from "react-icons/md";
import { FaCalendarAlt } from "react-icons/fa";

const Expenditures = ({ searchQuery }) => {
  const [expenditures, setExpenditures] = useState([]);
  const [filteredExpenditures, setFilteredExpenditures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalExpenditure, setTotalExpenditure] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentExpenditure, setCurrentExpenditure] = useState({
    amount: "",
    description: "",
    category: "utilities",
    date: new Date()
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // Filter states
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    fetchExpenditures();
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = [...expenditures];

    // Apply time filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(thisWeekStart.getDate() - today.getDay());
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    // Apply date range filter if active
    if (startDate && endDate && activeFilter === "custom") {
      // Set end date to end of day for inclusive filtering
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate >= startDate && expDate <= endOfDay;
      });
    } else {
      // Apply preset filters if no custom date range
      switch (activeFilter) {
        case "today":
          filtered = filtered.filter(
            (exp) => new Date(exp.date) >= today
          );
          break;
        case "yesterday":
          filtered = filtered.filter((exp) => {
            const date = new Date(exp.date);
            return date >= yesterday && date < today;
          });
          break;
        case "thisWeek":
          filtered = filtered.filter(
            (exp) => new Date(exp.date) >= thisWeekStart
          );
          break;
        case "thisMonth":
          filtered = filtered.filter(
            (exp) => new Date(exp.date) >= thisMonthStart
          );
          break;
        default:
          break;
      }
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(exp => exp.category === selectedCategory);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (exp) =>
          exp.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          exp.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by date, most recent first
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    setFilteredExpenditures(filtered);

    // Calculate total
    const total = filtered.reduce((sum, exp) => sum + exp.amount, 0);
    setTotalExpenditure(total);
  }, [expenditures, activeFilter, searchQuery, startDate, endDate, selectedCategory]);

  const fetchExpenditures = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://temiperi-eaze.onrender.com/temiperi/expenditures"
      );
      if (response.data && response.data.expenditures) {
        const formattedExpenditures = response.data.expenditures.map(exp => ({
          ...exp,
          date: new Date(exp.date)
        }));
        setExpenditures(formattedExpenditures);
      }
    } catch (error) {
      console.error("Error fetching expenditures:", error);
      toast.error("Failed to fetch expenditures");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    if (filter === "custom") {
      setShowDateFilter(true);
    } else {
      setShowDateFilter(false);
    }
  };

  const handleDateFilterApply = () => {
    if (startDate && endDate) {
      setActiveFilter("custom");
      setShowDateFilter(false);
    } else {
      toast.error("Please select both start and end dates");
    }
  };

  const handleDateFilterClear = () => {
    setStartDate(null);
    setEndDate(null);
    setActiveFilter("all");
    setShowDateFilter(false);
  };

  const handleExpenditureChange = (e) => {
    const { name, value } = e.target;
    setCurrentExpenditure(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentExpenditure.amount || !currentExpenditure.description) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      let response;
      const payload = {
        ...currentExpenditure,
        amount: parseFloat(currentExpenditure.amount)
      };

      if (isEditing) {
        response = await axios.put(
          `https://temiperi-eaze.onrender.com/temiperi/expenditure/${editId}`,
          payload
        );
        toast.success("Expenditure updated successfully!");
      } else {
        response = await axios.post(
          "https://temiperi-eaze.onrender.com/temiperi/expenditure",
          payload
        );
        toast.success("Expenditure added successfully!");
      }

      if (response.status === 200 || response.status === 201) {
        fetchExpenditures();
        setIsModalOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error("Error saving expenditure:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to save expenditure. Please try again."
      );
    }
  };

  const resetForm = () => {
    setCurrentExpenditure({
      amount: "",
      description: "",
      category: "utilities",
      date: new Date()
    });
    setIsEditing(false);
    setEditId(null);
  };

  const handleEdit = (expenditure) => {
    setCurrentExpenditure({
      amount: expenditure.amount.toString(),
      description: expenditure.description,
      category: expenditure.category,
      date: new Date(expenditure.date)
    });
    setIsEditing(true);
    setEditId(expenditure._id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!id) return;
    
    try {
      const confirmDelete = window.confirm("Are you sure you want to delete this expenditure?");
      if (!confirmDelete) return;
      
      const response = await axios.delete(
        `https://temiperi-eaze.onrender.com/temiperi/expenditure/${id}`
      );
      
      if (response.status === 200) {
        toast.success("Expenditure deleted successfully");
        fetchExpenditures();
      }
    } catch (error) {
      console.error("Error deleting expenditure:", error);
      toast.error("Failed to delete expenditure");
    }
  };

  // Function to format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="pt-4 md:px-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between mb-4">
        <h1 className="text-3xl font-medium">Expenditures</h1>
        <button 
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-blue text-white px-4 py-2 rounded-md hover:bg-opacity-80 flex items-center gap-2"
        >
          <MdAdd /> Add Expenditure
        </button>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {["all", "today", "yesterday", "thisWeek", "thisMonth", "custom"].map((filter) => (
            <button
              key={filter}
              onClick={() => handleFilterChange(filter)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${
                  activeFilter === filter
                    ? "bg-blue text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              {filter === "all"
                ? "All Expenditures"
                : filter === "today"
                ? "Today"
                : filter === "yesterday"
                ? "Yesterday"
                : filter === "thisWeek"
                ? "This Week" 
                : filter === "thisMonth"
                ? "This Month"
                : "Custom Date Range"}
            </button>
          ))}
        </div>
        
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border p-2 rounded-md border-gray-300 outline-none"
          >
            <option value="all">All Categories</option>
            <option value="utilities">Utilities</option>
            <option value="rent">Rent</option>
            <option value="supplies">Office Supplies</option>
            <option value="salary">Salaries</option>
            <option value="transport">Transportation</option>
            <option value="maintenance">Maintenance</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        {/* Date Range Picker */}
        {showDateFilter && (
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="w-full md:w-auto">
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <div className="relative">
                  <DatePicker
                    selected={startDate}
                    onChange={date => setStartDate(date)}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    maxDate={new Date()}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholderText="Select start date"
                  />
                  <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div className="w-full md:w-auto">
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <div className="relative">
                  <DatePicker
                    selected={endDate}
                    onChange={date => setEndDate(date)}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate}
                    maxDate={new Date()}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholderText="Select end date"
                  />
                  <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleDateFilterApply}
                  className="bg-blue text-white px-4 py-2 rounded-md hover:bg-opacity-80"
                >
                  Apply
                </button>
                <button 
                  onClick={handleDateFilterClear}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active Filter Display */}
      {activeFilter === "custom" && startDate && endDate && (
        <div className="bg-blue bg-opacity-10 border border-blue-200 rounded-md p-2">
          <p className="text-blue font-medium">
            Showing expenditures from {startDate.toLocaleDateString()} to {endDate.toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Expenditures Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading expenditures...</div>
        ) : filteredExpenditures.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No expenditures found.</div>
        ) : (
          <div className="overflow-x-auto">
            {/* Mobile View */}
            <div className="lg:hidden">
              {filteredExpenditures.map((exp) => (
                <div key={exp._id} className="p-4 border-b">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Date:</span>
                      <span>{formatDate(exp.date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Category:</span>
                      <span className="capitalize">{exp.category}</span>
                    </div>
                    <div>
                      <span className="font-medium">Description:</span>
                      <p className="mt-1 text-sm">{exp.description}</p>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Amount:</span>
                      <span className="font-bold">GH₵{exp.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-end space-x-2 pt-2">
                      <button
                        onClick={() => handleEdit(exp)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded inline-flex items-center space-x-1"
                      >
                        <MdEdit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(exp._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded inline-flex items-center space-x-1"
                      >
                        <MdDelete className="w-4 h-4" />
                        <span>Delete</span>
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
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExpenditures.map((exp) => (
                  <tr key={exp._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(exp.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {exp.category}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {exp.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      GH₵{exp.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right space-x-2">
                      <button
                        onClick={() => handleEdit(exp)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded inline-flex items-center space-x-1"
                      >
                        <MdEdit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(exp._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded inline-flex items-center space-x-1"
                      >
                        <MdDelete className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Total Amount */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900">
          {activeFilter === "all"
            ? "Total Expenditures: "
            : activeFilter === "today"
            ? "Today's Expenditures: "
            : activeFilter === "yesterday"
            ? "Yesterday's Expenditures: "
            : activeFilter === "thisWeek"
            ? "This Week's Expenditures: "
            : activeFilter === "thisMonth"
            ? "This Month's Expenditures: "
            : "Custom Range Expenditures: "}
          <span className="text-red-600 font-bold">
            GH₵{totalExpenditure.toFixed(2)}
          </span>
        </h3>
      </div>

      {/* Modal for adding/editing expenditure */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-4">
              {isEditing ? "Edit Expenditure" : "Add Expenditure"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amount (GH₵):</label>
                <input
                  type="number"
                  name="amount"
                  value={currentExpenditure.amount}
                  onChange={handleExpenditureChange}
                  className="border p-2 rounded-md border-gray-300 outline-none w-full"
                  placeholder="Enter amount"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category:</label>
                <select
                  name="category"
                  value={currentExpenditure.category}
                  onChange={handleExpenditureChange}
                  className="border p-2 rounded-md border-gray-300 outline-none w-full"
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
              <div>
                <label className="block text-sm font-medium mb-1">Description:</label>
                <textarea
                  name="description"
                  value={currentExpenditure.description}
                  onChange={handleExpenditureChange}
                  className="border p-2 rounded-md border-gray-300 outline-none w-full"
                  placeholder="Enter expenditure details"
                  rows="3"
                  required
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date:</label>
                <DatePicker
                  selected={currentExpenditure.date}
                  onChange={(date) => setCurrentExpenditure(prev => ({ ...prev, date }))}
                  className="border p-2 rounded-md border-gray-300 outline-none w-full"
                  maxDate={new Date()}
                />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue text-white rounded-md hover:bg-opacity-80"
                >
                  {isEditing ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenditures;
