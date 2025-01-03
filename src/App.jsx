import React from 'react';
import SideNav from './components/SideNav';
import Header from './components/Header';
import { Routes, Route } from 'react-router-dom';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Invoices from './pages/Invoices';

const App = () => {
    return (
        <div className='flex h-screen'>
            {/* Fixed Side Navigation */}
            <div className='w-64'>
                <SideNav />
            </div>
            {/* Main Content Area */}
            <div className='flex flex-col'>
                {/* Fixed Header */}
                <div className='fixed w-full bg-white z-10 shadow'>
                    <Header />
                </div>
                {/* Scrollable Content Below Header */}
                <div className='flex-1 pt-[70px]'>
                    {/* Adjusted padding to match header height */}
                    <Routes>
                        <Route path='/*' element={<Products />} />
                        <Route path='/submit-order' element={<Orders />} />
                        <Route path='/invoices' element={<Invoices />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default App;
