import React, { ReactNode, useState, useMemo } from "react";
import Pagination from "./Pagination";
import SearchBar from "./SearchBar";
import FilterPanel from "./filterPanel";

interface Column<T> {
  key: string;
  label: string;
  render?: (value: any, row: T, index?: number) => ReactNode;
  hideMobile?: boolean;
  hideTablet?: boolean;
  sortable?: boolean;
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
  sortBy?: string | null;
  sortDir?: "asc" | "desc" | null;
  onSort?: (key: string) => void;
  enablePagination?: boolean;
  initialPageSize?: number;
  fixedPagination?: boolean;
  pagination?: TablePaginationConfig;
  filterTypes?: string[];
  rowKey?: string;
  customToolbar?: React.ReactNode;
}

const HEADER_BG = "bg-[#355E3B] text-white";

const Table = <T extends Record<string, any>>({
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
  filterTypes,
  rowKey = "id",
  customToolbar,
}: TableProps<T>) => {
  const [search, setSearch] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [internalPage, setInternalPage] = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(initialPageSize);

  const showFilter = Array.isArray(filterTypes) && filterTypes.length > 0;

  const isControlled = Boolean(pagination);
  const currentPage = isControlled ? pagination!.currentPage : internalPage;
  const pageSize = isControlled ? pagination!.pageSize : internalPageSize;

  const filteredData = useMemo(() => {
    let tempData = [...data];

    if (search.trim()) {
      const lower = search.toLowerCase();
      tempData = tempData.filter((row) =>
        columns.some((col) =>
          String(row[col.key] ?? "").toLowerCase().includes(lower)
        )
      );
    }

    if (selectedFilters.length > 0) {
      tempData = tempData.filter((row) =>
        Object.values(row).some((val) =>
          selectedFilters.includes(String(val))
        )
      );
    }

    return tempData;
  }, [data, search, selectedFilters, columns]);

  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData =
    enablePagination ? filteredData.slice(startIndex, startIndex + pageSize) : filteredData;

  const handlePageChange = (page: number) => {
    if (isControlled) pagination?.onPageChange(page);
    else setInternalPage(page);
  };

  const handlePageSizeChange = (newSize: number) => {
    if (isControlled) pagination?.onPageSizeChange?.(newSize);
    else {
      setInternalPageSize(newSize);
      setInternalPage(1);
    }
  };

  const handleFilterChange = (filters: string[]) => {
    setSelectedFilters(filters);
    if (!isControlled) setInternalPage(1);
    else pagination?.onPageChange(1);
  };

  const getRowKey = (row: T, index: number) =>
    row[rowKey] !== undefined ? `${row[rowKey]}-${index}` : `row-${index}`;

  return (
    <div className={`w-full ${className}`}>
      {/* Table wrapper */}
      <div className="relative w-full rounded-xl border border-[#00001A4D] bg-white shadow-sm flex flex-col">
        {/* Search + Filter + Toolbar row */}
        <div className="px-4 py-3 border-b border-[#00001A4D]">
          <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-full lg:w-1/3">
                <SearchBar value={search} onChange={setSearch} />
              </div>
              <div className="w-full lg:w-auto">
                {showFilter && (
                  <FilterPanel
                    types={filterTypes}
                    onFilterChange={handleFilterChange}
                  />
                )}
              </div>
            </div>
            {customToolbar && <div className="flex-shrink-0">{customToolbar}</div>}
          </div>
        </div>

        {/* Table scrollable area */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <thead className={HEADER_BG}>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-left font-semibold"
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => onSort?.(col.key)}
                        className="flex items-center gap-2 w-full bg-transparent p-0 m-0 border-0 appearance-none focus:outline-none"
                      >
                        <span>{col.label}</span>
                        <span className="text-xs">
                          {sortBy === col.key
                            ? sortDir === "asc"
                              ? "▲"
                              : "▼"
                            : "↕"}
                        </span>
                      </button>
                    ) : (
                      col.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
          </table>

          {/* Table body scrollable */}
          <div className="overflow-y-auto">
            <table className="w-full text-sm table-fixed">
              <tbody className="divide-y divide-[#00001A4D]">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-8 text-gray-500">
                      {emptyMessage}
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row, rowIndex) => {
                    const uniqueKey = getRowKey(row, rowIndex);
                    return (
                      <tr
                        key={uniqueKey}
                        className={`border-b border-[#00001A4D] last:border-b-0 ${
                          onRowClick ? "cursor-pointer hover:bg-gray-50" : ""
                        }`}
                        onClick={() => onRowClick?.(row)}
                      >
                        {columns.map((col) => (
                          <td
                            key={`${uniqueKey}-${col.key}`}
                            className="px-4 py-3 text-sm text-[#1A1A1A]"
                          >
                            {col.render ? col.render(row[col.key], row, rowIndex) : row[col.key]}
                          </td>
                        ))}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination always visible at bottom */}
        {enablePagination && totalPages > 1 && (
          <div className="px-4 py-3 border-t border-[#00001A4D] flex justify-end">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              fixed={fixedPagination}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Table;