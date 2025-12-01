import React, { ReactNode, useMemo, useState } from "react";
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
  enablePagination?: boolean;
  initialPageSize?: number;
  fixedPagination?: boolean;
  pagination?: TablePaginationConfig;
  types?: string[];
}

const HEADER_BG = "bg-[#355842]";
const BORDER_COLOR = "border-[#00001A4D]";

const Table: React.FC<TableProps> = ({
  columns,
  data,
  onRowClick,
  emptyMessage = "No data available",
  className = "",
  enablePagination = true,
  initialPageSize = 5,
  fixedPagination = true,
  pagination,
  types = [],
}) => {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<string[]>([]);

  const processedData = useMemo(() => {
    let temp = [...data];
    if (search.trim() !== "") {
      const lower = search.toLowerCase();
      temp = temp.filter((row) =>
        columns.some((col) =>
          String(row[col.key] ?? "").toLowerCase().includes(lower)
        )
      );
    }
    if (filters.length > 0) {
      temp = temp.filter((row) => filters.includes(row.type));
    }
    return temp;
  }, [search, filters, data, columns]);

  const [internalPage, setInternalPage] = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(initialPageSize);

  const isControlled = Boolean(pagination);
  const currentPage = isControlled ? pagination!.currentPage : internalPage;
  const pageSize = isControlled ? pagination!.pageSize : internalPageSize;
  const totalItems = processedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData =
    enablePagination && !isControlled
      ? processedData.slice(startIndex, startIndex + pageSize)
      : processedData;

  const handlePageSizeChange = (newSize: number) => {
    if (isControlled) pagination?.onPageSizeChange?.(newSize);
    else {
      setInternalPageSize(newSize);
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

  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const toggleRowExpand = (idx: number) => {
    const newSet = new Set(expandedRows);
    newSet.has(idx) ? newSet.delete(idx) : newSet.add(idx);
    setExpandedRows(newSet);
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
            return (
              <div
                key={rowIndex}
                className={`bg-white rounded-xl shadow-md ${BORDER_COLOR}`}
              >
                <div className={`px-4 py-3 ${HEADER_BG}`}>
                  <p className="text-xs font-semibold text-white uppercase tracking-wider">
                    {primaryCol.label}
                  </p>
                  <h3 className="text-sm font-bold text-white mt-1 truncate">
                    {row[primaryCol.key]}
                  </h3>
                </div>
                <div className="px-4 py-3 space-y-2">
                  {visibleCols.slice(1, 3).map((col) => (
                    <div key={col.key}>
                      <p className="text-xs text-gray-500">{col.label}</p>
                      <p className="text-sm font-medium text-gray-900">
                        {col.render ? col.render(row[col.key], row) : row[col.key]}
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
          {/* SEARCH + FILTER ROW */}
          <TableHeader>
            <TableRow className="bg-white cursor-default select-none">
              <TableCell colSpan={columns.length} className="px-4 py-3">
                <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
                  <div className="w-full lg:w-1/3">
                    <SearchBar value={search} onChange={setSearch} placeholder="Search..." />
                  </div>
                  <div className="w-full lg:w-auto">
                    <FilterPanel types={types} onFilterChange={(f) => setFilters(f)} />
                  </div>
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
            {paginatedData.map((row, idx) => (
              <TableRow key={idx} className="cursor-default">
                {columns.map((col) => (
                  <TableCell key={col.key} className="px-4 py-3 text-sm">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </ShadTable>
      </div>

      {/* PAGINATION */}
      {enablePagination && (
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
