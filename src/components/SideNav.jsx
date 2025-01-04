import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from '../assets/temiperi-logo.jpg';
import { IoMdClose } from 'react-icons/io';

const SideNav = ({ onClose }) => {
    const location = useLocation();

    const getLinkClass = (path) =>
        location.pathname === path
            ? 'bg-white text-blue w-full py-2 text-center rounded-md'
            : 'text-white w-full text-center hover:bg-white/10 py-2 rounded-md transition-colors';

    return (
        <div className='w-[280px] lg:w-64 h-full flex flex-col px-4 lg:px-6 py-6 lg:py-10 items-center bg-blue gap-8'>
            {/* Close button for mobile */}
            <button 
                onClick={onClose}
                className='lg:hidden self-end p-2 text-white hover:bg-white/10 rounded-full'
            >
                <IoMdClose className='text-2xl' />
            </button>

            {/* Logo */}
            <img src={Logo} alt="Temiperi Logo" className='w-16 h-16 lg:w-20 lg:h-20 rounded-full' />
            
            {/* Navigation Links */}
            <div className="flex flex-col gap-3 items-center font-medium text-base lg:text-lg w-full">
                <Link to="/" className='w-full' onClick={onClose}>
                    <p className={getLinkClass('/')}>All Products</p>
                </Link>
                <Link to="/submit-order" className='w-full' onClick={onClose}>
                    <p className={getLinkClass('/submit-order')}>Submit Orders</p>
                </Link>
                <Link to="/invoices" className='w-full' onClick={onClose}>
                    <p className={getLinkClass('/invoices')}>All Invoices</p>
                </Link>
            </div>

            {/* Company Info */}
            <div className="mt-auto text-center text-white">
                <p className="text-sm opacity-80"> 2024 Temiperi Enterprise</p>
            </div>
        </div>
    );
};

export default SideNav;
