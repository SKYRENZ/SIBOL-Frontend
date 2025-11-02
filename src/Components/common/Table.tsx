import React, { ReactNode } from "react";

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => ReactNode;
  sortable?: boolean;
}

interface TableProps {
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
  emptyMessage?: string;
  className?: string;
  sortBy?: string | null;
  sortDir?: "asc" | "desc" | null;
  onSort?: (key: string) => void;
}

const Table: React.FC<TableProps> = ({ 
  columns, 
  data, 
  onRowClick,
  emptyMessage = "No data available",
  className = "",
  sortBy = null,
  sortDir = null,
  onSort,
}) => {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full bg-white border border-gray-200 rounded-lg shadow-sm table-fixed">
        <thead className="bg-[#AFC8AD]/50">
          <tr>
            {columns.map((column) => {
              const isSorted = sortBy === column.key;
              return (
                <th
                  key={column.key}
                  className="px-4 py-3 text-left align-middle font-medium text-xs text-gray-700 select-none"
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      onClick={() => onSort && onSort(column.key)}
                      // reset default button styles so it looks like plain header text
                      className="flex items-center gap-2 w-full text-left bg-transparent p-0 m-0 border-0 appearance-none focus:outline-none focus:ring-0"
                    >
                      <span>{column.label}</span>
                      <span className="text-xs text-gray-500">
                        {isSorted ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                      </span>
                    </button>
                  ) : (
                    <span>{column.label}</span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`${
                  rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
                } ${onRowClick ? "cursor-pointer hover:bg-gray-100 transition-colors duration-150" : ""}`}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 align-top text-sm text-gray-700">
                    {column.render ? column.render(row[column.key], row) : String(row[column.key] ?? "")}
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
