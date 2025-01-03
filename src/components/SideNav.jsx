import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from '../assets/temiperi-logo.jpg';

const SideNav = () => {
    const location = useLocation();

    const getLinkClass = (path) =>
        location.pathname === path
            ? 'bg-white text-blue w-full py-2 text-center rounded-md'
            : 'text-white w-full text-center';

    return (
        <div className='hidden h-[100vh] w-64 md:flex flex-col px-6 py-10 items-center bg-blue gap-8 fixed'>
            <img src={Logo} alt="" className='w-20 h-20 rounded-full' />
            <div className="flex flex-col gap-4 items-center font-semibold text-lg w-full">
                <Link to="/" className='w-full'>
                    <p className={getLinkClass('/')}>All Products</p>
                </Link>
                <Link to="/submit-order" className='w-full'>
                    <p className={getLinkClass('/submit-order')}>Submit Orders</p>
                </Link>
                <Link to="/invoices" className='w-full'>
                    <p className={getLinkClass('/invoices')}>All Invoices</p>
                </Link>
            </div>
        </div>
    );
};

export default SideNav;
