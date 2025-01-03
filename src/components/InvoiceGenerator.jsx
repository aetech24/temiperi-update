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
    />
  );
}

export default InvoiceGenerator;