import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number;
  pageSize?: number;
  totalItems?: number;
  onPageSizeChange?: (pageSize: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5,
  pageSize = 10,
  totalItems = 0,
  onPageSizeChange
}) => {
  // Generate array of page numbers to display
  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= maxVisiblePages + 2) {
      // Show all pages if total is small
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    // Always show first page
    pages.push(1);

    let startPage = Math.max(2, currentPage - halfVisible);
    let endPage = Math.min(totalPages - 1, currentPage + halfVisible);

    // Adjust if we're near the start
    if (currentPage <= halfVisible + 1) {
      endPage = Math.min(totalPages - 1, maxVisiblePages);
    }

    // Adjust if we're near the end
    if (currentPage >= totalPages - halfVisible) {
      startPage = Math.max(2, totalPages - maxVisiblePages);
    }

    // Add ellipsis after first page if needed
    if (startPage > 2) {
      pages.push('...');
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      pages.push('...');
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number | string) => {
    if (typeof page === 'number') {
      onPageChange(page);
    }
  };

  const pageNumbers = getPageNumbers();

  // Calculate the range of items being shown
  const startItem = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="w-full mt-4">
      {/* Results indicator and rows per page selector */}
      <div className="flex items-center justify-between py-4 px-2 bg-gray-50 rounded-t-lg border border-gray-200 border-b-0">
        <div className="text-sm text-gray-700">
          Showing <span className="font-bold text-[#2E523A]">{startItem}-{endItem}</span> of <span className="font-bold text-[#2E523A]">{totalItems}</span> results
        </div>
        
        {/* Rows per page selector */}
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="px-3 py-2 text-sm font-medium border-2 border-gray-300 rounded-lg bg-white text-gray-900 hover:border-[#2E523A] focus:outline-none focus:ring-2 focus:ring-[#2E523A]/30 focus:border-[#2E523A] cursor-pointer transition-all"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        )}
      </div>

      {/* Pagination controls centered at bottom */}
      <div className="flex items-center justify-center gap-2 py-5 bg-white border border-gray-200 rounded-b-lg shadow-sm">
      {/* Previous Button */}
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1 || totalPages <= 1}
        className={`flex items-center justify-center w-10 h-10 rounded-lg border-2 transition-all duration-200 shadow-sm ${
          currentPage === 1 || totalPages <= 1
            ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-40'
            : 'bg-white border-gray-400 hover:bg-[#2E523A] hover:border-[#2E523A] hover:shadow-md active:scale-95'
        }`}
        aria-label="Previous page"
      >
        <svg 
          className="w-12 h-12" 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          <path d="M8.41 7.41L7 6l-6 6 6 6 1.41-1.41L3.83 12z"/>
        </svg>
      </button>

      {/* Page Numbers */}
      {pageNumbers.map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <span className="flex items-center justify-center w-10 h-10 text-gray-500 font-bold text-lg">
              ...
            </span>
          ) : (
            <button
              onClick={() => handlePageClick(page)}
              disabled={totalPages <= 1}
              className={`flex items-center justify-center w-10 h-10 rounded-lg border-2 font-semibold text-sm transition-all duration-200 shadow-sm ${
                currentPage === page
                  ? 'bg-[#2E523A] border-[#2E523A] text-white shadow-lg scale-105'
                  : totalPages <= 1
                  ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-white border-gray-400 text-gray-700 hover:bg-[#2E523A]/10 hover:border-[#2E523A] hover:text-[#2E523A] hover:shadow-md active:scale-95'
              }`}
              aria-label={`Page ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          )}
        </React.Fragment>
      ))}

      {/* Next Button */}
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages || totalPages <= 1}
        className={`flex items-center justify-center w-10 h-10 rounded-lg border-2 transition-all duration-200 shadow-sm ${
          currentPage === totalPages || totalPages <= 1
            ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-40'
            : 'bg-white border-gray-400 hover:bg-[#2E523A] hover:border-[#2E523A] hover:shadow-md active:scale-95'
        }`}
        aria-label="Next page"
      >
        <svg 
          className="w-12 h-12" 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
          <path d="M15.59 16.59L17 18l6-6-6-6-1.41 1.41L20.17 12z"/>
        </svg>
      </button>
      </div>
    </div>
  );
};

export default Pagination;
