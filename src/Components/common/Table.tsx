import React, { ReactNode, useState } from "react";
import Pagination from "./Pagination";

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => ReactNode;
  sortable?: boolean;
  hideMobile?: boolean; // Hide on mobile
  hideTablet?: boolean; // Hide on tablet
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
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

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

  // Filter columns for tablet view (hide less important columns)
  const getVisibleColumns = (breakpoint: "mobile" | "tablet" | "desktop") => {
    return columns.filter((col) => {
      if (breakpoint === "mobile") return !col.hideMobile;
      if (breakpoint === "tablet") return !col.hideTablet;
      return true;
    });
  };

  // Get primary column (usually first visible)
  const getPrimaryColumn = (visibleColumns: Column[]) => visibleColumns[0];

  const getInitialColumns = (visibleColumns: Column[]) => {
    // Show first 3 visible columns initially
    return visibleColumns.slice(0, 3);
  };

  const toggleRowExpand = (rowIndex: number) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(rowIndex)) {
      newExpandedRows.delete(rowIndex);
    } else {
      newExpandedRows.add(rowIndex);
    }
    setExpandedRows(newExpandedRows);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Mobile Card View - visible only on mobile */}
      <div className="lg:hidden space-y-3">
        {data.map((row, rowIndex) => {
          const visibleCols = getVisibleColumns("mobile");
          const primaryCol = getPrimaryColumn(visibleCols);
          const primaryValue = primaryCol.render
            ? primaryCol.render(row[primaryCol.key], row)
            : row[primaryCol.key];
          const initialCols = getInitialColumns(visibleCols);
          const isExpanded = expandedRows.has(rowIndex);
          const hasMoreData = visibleCols.length > initialCols.length;

          return (
            <div
              key={rowIndex}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col"
            >
              {/* Card Header - Primary Value with Label */}
              <div 
                className="px-4 py-3"
                style={{ backgroundColor: '#AFC8AD9C' }}
              >
                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  {primaryCol.label}
                </p>
                <h3 className="text-sm font-bold text-gray-900 truncate mt-1">
                  {primaryValue}
                </h3>
              </div>

              {/* Card Body - Initial Data Grid (Always Visible) */}
              <div className="px-4 py-3 space-y-3 flex-1">
                {initialCols.slice(1).map((column, colIndex) => {
                  const isLastInitialCol = colIndex === initialCols.slice(1).length - 1;
                  return (
                    <div key={column.key} className="flex flex-col gap-1">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {column.label}
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm text-gray-900 font-medium break-words flex-1">
                          {column.render ? column.render(row[column.key], row) : row[column.key]}
                        </span>
                        {/* Arrow Icon - on last initial column, hidden when expanded */}
                        {isLastInitialCol && hasMoreData && !isExpanded && (
                          <button
                            onClick={() => toggleRowExpand(rowIndex)}
                            className="ml-3 p-0.5 rounded-lg transition-all duration-200 flex-shrink-0 bg-transparent hover:bg-gray-100"
                            aria-label="Expand"
                          >
                            <svg
                              className="w-3.5 h-3.5 text-gray-600 transition-transform duration-200"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M7 10l5 5 5-5z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Card Body - Additional Data (Expandable) */}
              {isExpanded && hasMoreData && (
                <div className="px-4 py-3 space-y-3 border-t border-gray-200 bg-gray-50">
                  {visibleCols.slice(initialCols.length).map((column, colIndex) => {
                    const isLastCol = colIndex === visibleCols.slice(initialCols.length).length - 1;
                    return (
                      <div key={column.key} className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {column.label}
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm text-gray-900 font-medium break-words flex-1">
                            {column.render ? column.render(row[column.key], row) : row[column.key]}
                          </span>
                          {/* Arrow Icon - on last expanded column */}
                          {isLastCol && (
                            <button
                              onClick={() => toggleRowExpand(rowIndex)}
                              className="ml-3 p-0.5 rounded-lg transition-all duration-200 flex-shrink-0 bg-transparent hover:bg-gray-100"
                              aria-label="Collapse"
                            >
                              <svg
                                className="w-3.5 h-3.5 text-gray-600 transition-transform duration-200 transform rotate-180"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M7 10l5 5 5-5z" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Card Footer - Action Column if exists */}
              {columns.some((col) => col.label === "Actions") && (
                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                  {columns
                    .find((col) => col.label === "Actions")
                    ?.render?.(
                      columns.find((col) => col.label === "Actions")?.key,
                      row
                    )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tablet Table View - visible on tablet to small desktop */}
      <div className="hidden lg:block xl:hidden overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full">
          <thead style={{ backgroundColor: '#AFC8AD9C' }}>
            <tr>
              {getVisibleColumns("tablet").map((column) => (
                <th
                  key={column.key}
                  className="px-3 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-gray-50 transition-colors duration-200"
              >
                {getVisibleColumns("tablet").map((column) => (
                  <td key={column.key} className="px-3 py-3 text-xs text-gray-700">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Desktop Table View - visible on large desktop */}
      <div className="hidden xl:block overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full">
          <thead style={{ backgroundColor: '#AFC8AD9C' }}>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-gray-50 transition-colors duration-200"
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 text-xs sm:text-sm text-gray-700">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
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
