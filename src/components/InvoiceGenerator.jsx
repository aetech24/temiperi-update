import React from 'react';

function InvoiceGenerator({ value, loading }) {
  return (
    <input
      type="text"
      value={value || ''}
      placeholder={loading ? 'Generating...' : 'Invoice number'}
      readOnly
      style={{ 
        backgroundColor: '#f5f5f5',
        cursor: 'not-allowed'
      }}
      className='border p-2 rounded-md border-black outline-none'
    />
  );
}

export default InvoiceGenerator;