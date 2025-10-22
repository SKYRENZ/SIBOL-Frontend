import React, { ReactNode } from "react";

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => ReactNode;
}

interface TableProps {
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
  emptyMessage?: string;
  className?: string;
}

const Table: React.FC<TableProps> = ({ 
  columns, 
  data, 
  onRowClick,
  emptyMessage = "No data available",
  className = ""
}) => {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full bg-white border border-gray-200 rounded-lg shadow-sm">
        <thead className="bg-[#AFC8AD]/50">
          <tr>
            {columns.map((column) => (
              <th 
                key={column.key}
                className="px-6 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider border-b border-gray-200"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td 
                colSpan={columns.length} 
                className="px-6 py-8 text-center text-gray-500 italic"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr 
                key={rowIndex}
                className={`${
                  rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                } ${
                  onRowClick ? 'cursor-pointer hover:bg-gray-100 transition-colors duration-150' : ''
                }`}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column) => (
                  <td 
                    key={column.key}
                    className="px-6 py-4 text-sm text-gray-900 border-b border-gray-100"
                  >
                    {column.render 
                      ? column.render(row[column.key], row)
                      : row[column.key]
                    }
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
