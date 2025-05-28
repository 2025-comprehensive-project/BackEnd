// src/components/common/DataTable.js
import React from 'react';
import '../../styles/common/DataTable.css';

function DataTable({ columns, data, keyField, emptyMessage, className = '' }) {
  return (
    <div className={`table-responsive ${className}`}>
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} style={column.style}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item) => (
              <tr key={item[keyField]}>
                {columns.map((column) => (
                  <td key={`${item[keyField]}-${column.key}`} style={column.style}>
                    {column.render 
                      ? column.render(item) 
                      : item[column.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="no-data">
                {emptyMessage || '데이터가 없습니다.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;