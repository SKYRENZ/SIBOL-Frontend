import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number;
  pageSize?: number;
  totalItems?: number;
  onPageSizeChange?: (pageSize: number) => void;
  fixed?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5,
  pageSize = 10,
  totalItems = 0,
  onPageSizeChange,
  fixed = true,
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

  const handleFirst = () => {
    if (currentPage !== 1) {
      onPageChange(1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleLast = () => {
    if (currentPage !== totalPages) {
      onPageChange(totalPages);
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
    <div className={`w-full bg-white border-t border-gray-200 shadow-lg ${fixed ? "fixed bottom-0 left-0 right-0 z-10" : ""}`}>
      {/* Single row with results, pagination controls, and rows per page selector */}
      <div className="flex items-center justify-between py-4 px-6 bg-white">
        {/* Results indicator */}
        <div className="text-sm text-gray-700">
          Showing <span className="font-bold text-[#2E523A]">{startItem}-{endItem}</span> of <span className="font-bold text-[#2E523A]">{totalItems}</span> results
        </div>
        
        {/* Pagination controls centered */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleFirst}
            disabled={currentPage === 1 || totalPages <= 1}
            className={`flex items-center justify-center w-11 h-11 rounded-lg border-2 border-transparent transition-all ${
              currentPage === 1 || totalPages <= 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                : 'bg-white text-gray-900 hover:bg-[#2E523A]/10 hover:text-[#2E523A] hover:border-[#2E523A] focus:outline-none focus:ring-2 focus:ring-[#2E523A]/30'
            }`}
            aria-label="First page"
          >
            <span className="flex items-center justify-center text-2xl leading-none">«</span>
          </button>

          <button
            onClick={handlePrevious}
            disabled={currentPage === 1 || totalPages <= 1}
            className={`flex items-center justify-center w-11 h-11 rounded-lg border-2 border-transparent transition-all ${
              currentPage === 1 || totalPages <= 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                : 'bg-white text-gray-900 hover:bg-[#2E523A]/10 hover:text-[#2E523A] hover:border-[#2E523A] focus:outline-none focus:ring-2 focus:ring-[#2E523A]/30'
            }`}
            aria-label="Previous page"
          >
            <span className="flex items-center justify-center text-2xl leading-none">‹</span>
          </button>

          {pageNumbers.map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="flex items-center justify-center w-10 h-10 text-gray-500 font-bold text-lg">...</span>
              ) : (
                <button
                  onClick={() => handlePageClick(page)}
                  disabled={totalPages <= 1}
                  className={`flex items-center justify-center w-10 h-10 rounded-lg border-2 font-semibold text-sm transition-all duration-200 shadow-sm ${
                    currentPage === page
                      ? 'bg-[#2E523A] border-[#2E523A] text-white shadow-lg'
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

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages || totalPages <= 1}
            className={`flex items-center justify-center w-11 h-11 rounded-lg border-2 border-transparent transition-all ${
              currentPage === totalPages || totalPages <= 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                : 'bg-white text-gray-900 hover:bg-[#2E523A]/10 hover:text-[#2E523A] hover:border-[#2E523A] focus:outline-none focus:ring-2 focus:ring-[#2E523A]/30'
            }`}
            aria-label="Next page"
          >
            <span className="flex items-center justify-center text-2xl leading-none">›</span>
          </button>

          <button
            onClick={handleLast}
            disabled={currentPage === totalPages || totalPages <= 1}
            className={`flex items-center justify-center w-11 h-11 rounded-lg border-2 border-transparent transition-all ${
              currentPage === totalPages || totalPages <= 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                : 'bg-white text-gray-900 hover:bg-[#2E523A]/10 hover:text-[#2E523A] hover:border-[#2E523A] focus:outline-none focus:ring-2 focus:ring-[#2E523A]/30'
            }`}
            aria-label="Last page"
          >
            <span className="flex items-center justify-center text-2xl leading-none">»</span>
          </button>
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
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pagination;
