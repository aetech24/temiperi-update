import React from 'react';
import { FaRegCalendarAlt } from "react-icons/fa";
import { IoMdSearch, IoMdTime } from "react-icons/io";
import { useLocation } from 'react-router-dom';

const Header = ({ searchQuery, setSearchQuery }) => {
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

    const location = useLocation();

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const getPlaceholder = () => {
        if (location.pathname.includes('/products')) {
            return 'Search Products';
        } else if (location.pathname.includes('/invoices')) {
            return 'Search Invoice by Name';
        }
        return '';
    };

    return (
        <div className='w-full px-4 lg:px-6 py-4 bg-white shadow'>
            <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4'>
                {/* Date and Time */}
                <div className="flex flex-col gap-1">
                    <p className='font-medium flex items-center gap-2 text-sm lg:text-base'>
                        <FaRegCalendarAlt className='text-lg lg:text-xl font-semibold'/> 
                        {formattedDate}
                    </p>
                    <p className='text-xs lg:text-sm text-gray-700 font-medium flex items-center gap-2'>
                        <IoMdTime className='text-lg lg:text-xl font-semibold'/> 
                        {formattedTime}
                    </p>
                </div>

                {/* Search Input */}
                <div className='w-full lg:w-1/3 bg-blue bg-opacity-20 rounded-full px-4 py-2 flex items-center'>
                    <input
                        type="search"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className='w-full outline-none bg-transparent placeholder-gray-500 text-sm'
                        placeholder={getPlaceholder()}
                    />
                    <IoMdSearch className='text-xl lg:text-2xl text-gray-500 hover:text-black cursor-pointer'/>
                </div>
            </div>
        </div>
    );
};

export default Header;
