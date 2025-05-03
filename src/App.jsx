import React, { useState } from "react";
import SideNav from "./components/SideNav";
import Header from "./components/Header";
import { Routes, Route } from "react-router-dom";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Invoices from "./pages/Invoices";
import Expenditures from "./pages/Expenditures"; // Import the new page
import ChatRoom from "./pages/ChatRoom";
import { HiMenuAlt2 } from "react-icons/hi";
import InvoiceSkeleton from "./components/InvoiceSkeleton";

const App = () => {
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex h-screen relative">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSideNavOpen(!isSideNavOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 rounded-md bg-blue text-white hover:bg-opacity-90"
      >
        <HiMenuAlt2 className="text-2xl" />
      </button>

      {/* Overlay for mobile */}
      {isSideNavOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSideNavOpen(false)}
        />
      )}

      {/* Side Navigation */}
      <div
        className={`fixed lg:static h-full z-40 transform transition-transform duration-300 ease-in-out ${
          isSideNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <SideNav onClose={() => setIsSideNavOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-20 lg:relative">
          <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 max-md:w-screen overflow-y-auto px-4 lg:px-6 pt-8 md:pt-16 lg:pt-0 pb-6">
          <Routes>
            <Route path="/*" element={<Products searchQuery={searchQuery} />} />
            <Route
              path="/submit-order"
              element={<Orders searchQuery={searchQuery} />}
            />
            <Route
              path="/invoices"
              element={<Invoices searchQuery={searchQuery} />}
            />
            <Route
              path="/expenditures"
              element={<Expenditures searchQuery={searchQuery} />}
            />
            <Route path="/chat" element={<ChatRoom />} />
            <Route path="/skeleton" element={<InvoiceSkeleton />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default App;
