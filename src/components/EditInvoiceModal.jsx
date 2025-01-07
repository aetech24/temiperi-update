import React, { useState, useEffect } from 'react';
import { MdClose } from 'react-icons/md';

const EditInvoiceModal = ({ invoice, isOpen, onClose, onSave }) => {
    const [editedInvoice, setEditedInvoice] = useState(null);

    useEffect(() => {
        if (invoice) {
            setEditedInvoice({ ...invoice });
        }
    }, [invoice]);

    if (!isOpen || !editedInvoice) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedInvoice(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...editedInvoice.items];
        updatedItems[index] = {
            ...updatedItems[index],
            [field]: field === 'quantity' || field === 'price' ? parseFloat(value) || 0 : value
        };

        // Recalculate total amount
        const totalAmount = updatedItems.reduce((sum, item) => 
            sum + (item.quantity * item.price), 0
        );

        setEditedInvoice(prev => ({
            ...prev,
            items: updatedItems,
            totalAmount
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(editedInvoice);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold">Edit Invoice</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <MdClose className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Customer Name
                                </label>
                                <input
                                    type="text"
                                    name="customerName"
                                    value={editedInvoice.customerName}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue focus:ring-blue sm:text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Payment Method
                                </label>
                                <select
                                    name="paymentMethod"
                                    value={editedInvoice.paymentMethod}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue focus:ring-blue sm:text-sm"
                                    required
                                >
                                    <option value="cash">Cash</option>
                                    <option value="momo">Mobile Money</option>
                                    <option value="credit">Credit</option>
                                    <option value="momo/cash">Mobile Money & Cash</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Items</h3>
                            <div className="space-y-4">
                                {editedInvoice.items.map((item, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Description
                                            </label>
                                            <input
                                                type="text"
                                                value={item.description}
                                                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue focus:ring-blue sm:text-sm"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Quantity
                                            </label>
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue focus:ring-blue sm:text-sm"
                                                min="1"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Price
                                            </label>
                                            <input
                                                type="number"
                                                value={item.price}
                                                onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue focus:ring-blue sm:text-sm"
                                                min="0"
                                                step="0.01"
                                                required
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t">
                            <div className="text-lg font-semibold">
                                Total Amount: GH₵{editedInvoice.totalAmount.toFixed(2)}
                            </div>
                            <div className="space-x-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue text-white px-4 py-2 rounded-md hover:bg-opacity-80"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditInvoiceModal;
