import React, { useMemo, useState } from "react";
import Pagination from "./Pagination";
import SearchBar from "./SearchBar";
import FilterPanel from "./filterPanel";

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

interface Column<T> {
  key: string;
  label: string;
  render?: (value: any, row: T, index?: number) => React.ReactNode;
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

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  className?: string;
  enablePagination?: boolean;
  initialPageSize?: number;
  fixedPagination?: boolean;
  pagination?: TablePaginationConfig;
  filterTypes?: string[]; // ✅ Filter types to fetch from API
  rowKey?: string;
  customToolbar?: React.ReactNode;
}

const HEADER_BG = "bg-[#355E3B]"; // <-- UPDATED HEADER COLOR
const BORDER_COLOR = "border-[#00001A4D]";

const Table = <T extends Record<string, any>>({
  columns,
  data,
  onRowClick,
  emptyMessage = "No data available",
  className = "",
  enablePagination = true,
  initialPageSize = 5,
  fixedPagination = true,
  pagination,
  filterTypes = [], // ✅ Optional filter types
  rowKey = "id",
  customToolbar,
}: TableProps<T>) => {
  const [search, setSearch] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [internalPage, setInternalPage] = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(initialPageSize);

  // Helper function to get unique row key
  const getRowKey = (row: T, index: number): string => {
    if (row[rowKey] !== undefined) {
      return String(row[rowKey]);
    }
    return `row-${index}`;
  };

  // ✅ Process data with search and filters
  const processedData = useMemo(() => {
    let temp = [...data];

    // Search filter
    if (search.trim() !== "") {
      const lower = search.toLowerCase();
      temp = temp.filter((row) =>
        columns.some((col) =>
          String(row[col.key] ?? "").toLowerCase().includes(lower)
        )
      );
    }

    // ✅ Generic filters - works with any field
    if (selectedFilters.length > 0) {
      temp = temp.filter((row) => {
        // Check all possible filter fields
        return selectedFilters.some((filter) => {
          // Try different field patterns
          const fieldsToCheck = [
            "status",
            "status_name",
            "Status",
            "area",
            "area_name",
            "Area_Name",
            "Area",
            "type",
            "Type",
            "category",
            "Category",
          ];

          return fieldsToCheck.some((field) => {
            const value = row[field];
            if (value === undefined || value === null) return false;
            return String(value).toLowerCase() === filter.toLowerCase();
          });
        });
      });
    }

    return temp;
  }, [search, selectedFilters, data, columns]);

  // Pagination logic
  const isControlled = Boolean(pagination);
  const currentPage = isControlled ? pagination!.currentPage : internalPage;
  const pageSize = isControlled ? pagination!.pageSize : internalPageSize;
  const totalItems = isControlled ? pagination!.totalItems : processedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData =
    enablePagination && !isControlled
      ? processedData.slice(startIndex, startIndex + pageSize)
      : processedData;

  const handlePageSizeChange = (newSize: number) => {
    if (isControlled) {
      pagination?.onPageSizeChange?.(newSize);
    } else {
      setInternalPageSize(newSize);
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

  const getVisibleColumns = (breakpoint: "mobile" | "tablet" | "desktop") =>
    columns.filter((col) => {
      if (breakpoint === "mobile") return !col.hideMobile;
      if (breakpoint === "tablet") return !col.hideTablet;
      return true;
    });

  const handleRowClick = (row: T) => {
    if (onRowClick) {
      onRowClick(row);
    }
  };

  // ✅ Handle filter changes
  const handleFilterChange = (filters: string[]) => {
    setSelectedFilters(filters);
    // Reset to page 1 when filters change
    if (isControlled) {
      pagination?.onPageChange(1);
    } else {
      setInternalPage(1);
    }
  };

  return (
    <div className={`w-full space-y-4 ${className}`}>
      {/* MOBILE VIEW */}
      <div className="lg:hidden space-y-3">
        {paginatedData.length === 0 ? (
          <div className="px-4 py-3 text-sm text-gray-600">{emptyMessage}</div>
        ) : (
          paginatedData.map((row, rowIndex) => {
            const visibleCols = getVisibleColumns("mobile");
            const primaryCol = visibleCols[0];
            const uniqueKey = getRowKey(row, rowIndex);

            return (
              <div
                key={uniqueKey}
                className={`bg-white rounded-xl shadow-md ${BORDER_COLOR} ${
                  onRowClick
                    ? "cursor-pointer hover:shadow-lg transition-shadow"
                    : ""
                }`}
                onClick={() => handleRowClick(row)}
              >
                <div className={`px-4 py-3 ${HEADER_BG}`}>
                  <p className="text-xs font-semibold text-white uppercase tracking-wider">
                    {primaryCol.label}
                  </p>
                  <h3 className="text-sm font-bold text-white mt-1 truncate">
                    {primaryCol.render
                      ? primaryCol.render(row[primaryCol.key], row, rowIndex)
                      : row[primaryCol.key]}
                  </h3>
                </div>
                <div className="px-4 py-3 space-y-2">
                  {visibleCols.slice(1, 3).map((col) => (
                    <div key={col.key}>
                      <p className="text-xs text-gray-500">{col.label}</p>
                      <p className="text-sm font-medium text-gray-900">
                        {col.render
                          ? col.render(row[col.key], row, rowIndex)
                          : row[col.key]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* TABLET & DESKTOP VIEW */}
      <div className="hidden lg:block overflow-x-auto">
        <ShadTable className="w-full border">
          {/* ✅ SEARCH + FILTER + CUSTOM TOOLBAR ROW */}
          <TableHeader>
            <TableRow className="bg-white cursor-default select-none">
              <TableCell colSpan={columns.length} className="px-4 py-3">
                <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {/* Search Bar */}
                    <div className="w-full lg:w-1/3">
                      <SearchBar
                        value={search}
                        onChange={setSearch}
                        placeholder="Search..."
                      />
                    </div>

                    {/* ✅ Filter Panel - ALWAYS SHOWN (will fetch data based on filterTypes) */}
                    <div className="w-full lg:w-auto">
                      <FilterPanel
                        types={filterTypes.length > 0 ? filterTypes : undefined}
                        onFilterChange={handleFilterChange}
                      />
                    </div>
                  </div>

                  {/* ✅ Custom Toolbar (e.g., Add Machine button) */}
                  {customToolbar && (
                    <div className="flex-shrink-0">{customToolbar}</div>
                  )}
                </div>
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* TABLE HEADER */}
          <TableHeader>
            <TableRow className={`${HEADER_BG} cursor-default select-none`}>
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-semibold text-white"
                >
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          {/* TABLE BODY */}
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-8 text-gray-500"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, rowIndex) => {
                const uniqueKey = getRowKey(row, rowIndex);
                return (
                  <TableRow
                    key={uniqueKey}
                    className={
                      onRowClick
                        ? "cursor-pointer hover:bg-gray-50"
                        : "cursor-default"
                    }
                    onClick={() => handleRowClick(row)}
                  >
                    {columns.map((col) => (
                      <TableCell
                        key={`${uniqueKey}-${col.key}`}
                        className="px-4 py-3 text-sm"
                      >
                        {col.render ? col.render(row[col.key], row, rowIndex) : row[col.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </ShadTable>
      </div>

      {/* PAGINATION */}
      {enablePagination && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          fixed={fixedPagination}
        />
      )}
    </div>
  );
};

export default Table;
