import React from 'react';
import SideNav from './components/SideNav';
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
            {/* Scrollable Main Content */}
            <div className='flex-1 overflow-y-scroll'>
                <Routes>
                    <Route path='/*' element={<Products />} />
                    <Route path='/submit-order' element={<Orders />} />
                    <Route path='/invoices' element={<Invoices />} />
                </Routes>
            </div>
        </div>
    );
};

export default App;
