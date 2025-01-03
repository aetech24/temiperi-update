import React from 'react';
import { FaRegCalendarAlt } from "react-icons/fa";
import { IoMdSearch, IoMdTime } from "react-icons/io";

const Header = () => {
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

    return (
        <div className='w-full px-6 py-2 shadow bg-white'>
            <div className='flex items-center justify-between'>
                {/* Date and Time */}
                <div className="flex flex-col gap-1">
                    <p className='font-medium flex items-center gap-2'><FaRegCalendarAlt className='text-xl font-semibold'/> {formattedDate}</p>
                    <p className='text-sm text-gray-700 font-medium flex items-center gap-2'><IoMdTime className='text-xl font-semibold'/> {formattedTime}</p>
                </div>

                {/* Search Input */}
                <div className='w-1/4 mr-64 bg-blue bg-opacity-20 rounded-full px-4 py-2 flex items-center '>
                    <input
                        type="search"
                        className='w-full outline-none bg-blue bg-opacity-0 placeholder-gray-500'
                        placeholder="Search for products"
                    />
                    <IoMdSearch className='text-2xl text-gray-500 hover:text-black cursor-pointer'/>
                </div>
            </div>
        </div>
    );
};

export default Header;
