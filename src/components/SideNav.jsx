import React from "react";
import Logo from "../assets/temiperi-logo.jpg";
import { NavLink } from "react-router-dom";
import { MdOutlineProductionQuantityLimits, MdOutlineBorderColor, MdOutlineReceiptLong, MdOutlineMessage, MdOutlineAttachMoney } from "react-icons/md";

const SideNav = ({ onClose }) => {
  return (
    <div className="bg-blue h-screen w-[280px] p-4 flex flex-col">
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <img src={Logo} alt="Logo" className="w-20 h-20 rounded-full" />
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-2 flex-grow">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-3 rounded-lg ${
              isActive
                ? "bg-white text-blue font-medium"
                : "text-white hover:bg-blue-hover"
            }`
          }
          onClick={onClose}
        >
          <MdOutlineProductionQuantityLimits className="text-xl" />
          Products
        </NavLink>
        <NavLink
          to="/submit-order"
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-3 rounded-lg ${
              isActive
                ? "bg-white text-blue font-medium"
                : "text-white hover:bg-blue-hover"
            }`
          }
          onClick={onClose}
        >
          <MdOutlineBorderColor className="text-xl" />
          Submit Order
        </NavLink>
        <NavLink
          to="/invoices"
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-3 rounded-lg ${
              isActive
                ? "bg-white text-blue font-medium"
                : "text-white hover:bg-blue-hover"
            }`
          }
          onClick={onClose}
        >
          <MdOutlineReceiptLong className="text-xl" />
          Invoices
        </NavLink>
        
        {/* New Expenditures Link */}
        {/* <NavLink
          to="/expenditures"
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-3 rounded-lg ${
              isActive
                ? "bg-white text-blue font-medium"
                : "text-white hover:bg-blue-hover"
            }`
          }
          onClick={onClose}
        >
          <MdOutlineAttachMoney className="text-xl" />
          Expenditures
        </NavLink>
        
        <NavLink
          to="/chat"
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-3 rounded-lg ${
              isActive
                ? "bg-white text-blue font-medium"
                : "text-white hover:bg-blue-hover"
            }`
          }
          onClick={onClose}
        >
          <MdOutlineMessage className="text-xl" />
          Chat with Admin
        </NavLink> */}
      </nav>
      
      {/* Footer */}
      <div className="text-white text-xs text-center mt-auto">
        Temiperi © {new Date().getFullYear()}
      </div>
    </div>
  );
};

export default SideNav;
