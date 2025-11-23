import React, { ReactNode, useState } from "react";
import Pagination from "./Pagination";
import {
  Table as ShadTable,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/Components/ui/table";

/* ============================================================
   TYPES
============================================================ */

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => ReactNode;
  sortable?: boolean;
  hideMobile?: boolean;
  hideTablet?: boolean;
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

/* ============================================================
   STYLE CONSTANTS
============================================================ */

const HEADER_BG = "bg-[#AFC8AD]"; // Column header text fully opaque
const BORDER_COLOR = "border-[#00001A4D]"; // Row border 30%
const DIVIDE_COLOR = "divide-[#00001A4D]"; // Divider between rows

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
    if (isControlled) pagination?.onPageSizeChange?.(newPageSize);
    else {
      setInternalPageSize(newPageSize);
      setInternalPage(1);
    }
  };

  const handlePageChange = (page: number) => {
    if (isControlled) pagination?.onPageChange(page);
    else setInternalPage(page);
  };

  const getVisibleColumns = (breakpoint: "mobile" | "tablet" | "desktop") =>
    columns.filter((col) => {
      if (breakpoint === "mobile") return !col.hideMobile;
      if (breakpoint === "tablet") return !col.hideTablet;
      return true;
    });

  const getPrimaryColumn = (visibleColumns: Column[]) => visibleColumns[0];
  const getInitialColumns = (visibleColumns: Column[]) =>
    visibleColumns.slice(0, 3);

  const toggleRowExpand = (rowIndex: number) => {
    const newSet = new Set(expandedRows);
    newSet.has(rowIndex) ? newSet.delete(rowIndex) : newSet.add(rowIndex);
    setExpandedRows(newSet);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* MOBILE CARD VIEW */}
      <div className="lg:hidden space-y-3">
        {paginatedData.length === 0 ? (
          <div className="px-4 py-3 text-sm text-gray-600">{emptyMessage}</div>
        ) : (
          paginatedData.map((row, rowIndex) => {
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
                className={`bg-white rounded-xl ${BORDER_COLOR} shadow-[0_2px_4px_rgba(0,0,0,0.4)] transition-all duration-200`}
                onClick={() => onRowClick?.(row)}
                role={onRowClick ? "button" : undefined}
              >
                {/* Card header */}
                <div className={`px-4 py-3 ${HEADER_BG}`}>
                  <p className="text-xs font-semibold uppercase tracking-wider text-white">
                    {primaryCol.label}
                  </p>
                  <h3 className="text-sm font-bold text-white mt-1 truncate">
                    {primaryValue}
                  </h3>
                </div>

                {/* Card body */}
                <div className="px-4 py-3 space-y-3 flex-1">
                  {initialCols.slice(1).map((column) => (
                    <div key={column.key} className="flex flex-col gap-1">
                      <span className="text-xs font-semibold uppercase text-gray-500 tracking-wider">
                        {column.label}
                      </span>

                      <span className="text-xs sm:text-sm text-gray-900 font-medium break-words">
                        {column.render
                          ? column.render(row[column.key], row)
                          : row[column.key]}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Extra details expanded */}
                {isExpanded && hasMoreData && (
                  <div className={`px-4 py-3 border-t ${BORDER_COLOR} bg-gray-50`}>
                    {visibleCols.slice(initialCols.length).map((column) => (
                      <div key={column.key} className="flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase text-gray-500">
                          {column.label}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-900 font-medium">
                          {column.render
                            ? column.render(row[column.key], row)
                            : row[column.key]}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* TABLET VIEW */}
      <div className={`hidden lg:block xl:hidden overflow-x-auto ${BORDER_COLOR}`}>
        {paginatedData.length === 0 ? (
          <div className="p-4 text-sm text-gray-600">{emptyMessage}</div>
        ) : (
          <ShadTable className="w-full">
            <TableHeader className={`${HEADER_BG}`}>
              <TableRow>
                {getVisibleColumns("tablet").map((column) => (
                  <TableHead
                    key={column.key}
                    className="px-3 py-3 text-left text-xs font-semibold text-white"
                  >
                    {column.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody className={`${DIVIDE_COLOR}`}>
              {paginatedData.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className="transition-all hover:shadow-[0_4px_6px_rgba(0,0,0,0.4)] hover:bg-gray-50 border-b"
                  onClick={() => onRowClick?.(row)}
                >
                  {getVisibleColumns("tablet").map((column) => (
                    <TableCell
                      key={column.key}
                      className={`px-3 py-3 text-xs text-gray-900 ${BORDER_COLOR}`}
                    >
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </ShadTable>
        )}
      </div>

      {/* DESKTOP VIEW */}
      <div className={`hidden xl:block overflow-x-auto ${BORDER_COLOR}`}>
        {paginatedData.length === 0 ? (
          <div className="p-4 text-sm text-gray-600">{emptyMessage}</div>
        ) : (
          <ShadTable className="w-full">
            <TableHeader className={`${HEADER_BG}`}>
              <TableRow>
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-white"
                  >
                    {column.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody className={`${DIVIDE_COLOR}`}>
              {paginatedData.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className="transition-all hover:shadow-[0_4px_6px_rgba(0,0,0,0.4)] hover:bg-gray-50 border-b"
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={`px-4 py-3 text-xs sm:text-sm text-gray-900 ${BORDER_COLOR}`}
                    >
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </ShadTable>
        )}
      </div>

      {/* PAGINATION */}
      {enablePagination && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageSizeChange={handlePageSizeChange}
            fixed={fixedPagination}
          />
        </div>
      )}
    </div>
  );
};

export default Table;
