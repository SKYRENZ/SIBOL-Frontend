import React, { ReactNode, useState } from "react";
import Pagination from "./Pagination";

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => ReactNode;
  sortable?: boolean;
}

interface TablePaginationConfig {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
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
  enablePagination?: boolean;
  initialPageSize?: number;
  fixedPagination?: boolean;
  pagination?: TablePaginationConfig;
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
  enablePagination = true,
  initialPageSize = 5,
  fixedPagination = true,
  pagination,
}) => {
  const [internalPage, setInternalPage] = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(initialPageSize);

  const isControlled = Boolean(pagination);
  const currentPage = isControlled ? pagination!.currentPage : internalPage;
  const pageSize = isControlled ? pagination!.pageSize : internalPageSize;
  const totalItems = isControlled ? pagination!.totalItems : data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData =
    enablePagination && !isControlled ? data.slice(startIndex, endIndex) : data;

  const handlePageSizeChange = (newPageSize: number) => {
    if (isControlled) {
      pagination?.onPageSizeChange?.(newPageSize);
    } else {
      setInternalPageSize(newPageSize);
      setInternalPage(1);
    }
  };

  const handlePageChange = (page: number) => {
    if (isControlled) {
      pagination?.onPageChange(page);
    } else {
      setInternalPage(page);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full bg-white border border-gray-200 rounded-t-lg shadow-sm table-fixed">
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
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-6 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
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

      {enablePagination && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageSizeChange={handlePageSizeChange}
          fixed={fixedPagination}
        />
      )}
    </div>
  );
};

export default Table;
