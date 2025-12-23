import { useState, useEffect, useMemo } from 'react';

// Sentinel value for ellipsis in page numbers
export const ELLIPSIS = -1;

interface UsePaginationOptions<T> {
  items: T[];
  itemsPerPage?: number;
}

interface UsePaginationResult<T> {
  currentPage: number;
  totalPages: number;
  paginatedItems: T[];
  startIndex: number;
  endIndex: number;
  pageNumbers: number[];
  setCurrentPage: (page: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  isFirstPage: boolean;
  isLastPage: boolean;
}

export function usePagination<T>({
  items,
  itemsPerPage = 10,
}: UsePaginationOptions<T>): UsePaginationResult<T> {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to first page when items change
  useEffect(() => {
    setCurrentPage(1);
  }, [items.length]);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, items.length);
  const paginatedItems = items.slice(startIndex, endIndex);

  // Generate page numbers to display (show max 5 pages with ellipsis)
  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const leftBound = Math.max(1, currentPage - 2);
      const rightBound = Math.min(totalPages, currentPage + 2);

      if (leftBound > 1) pages.push(1);
      if (leftBound > 2) pages.push(ELLIPSIS);

      for (let i = leftBound; i <= rightBound; i++) {
        pages.push(i);
      }

      if (rightBound < totalPages - 1) pages.push(ELLIPSIS);
      if (rightBound < totalPages) pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages]);

  const goToNextPage = () => {
    setCurrentPage(p => Math.min(totalPages, p + 1));
  };

  const goToPreviousPage = () => {
    setCurrentPage(p => Math.max(1, p - 1));
  };

  return {
    currentPage,
    totalPages,
    paginatedItems,
    startIndex,
    endIndex,
    pageNumbers,
    setCurrentPage,
    goToNextPage,
    goToPreviousPage,
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages,
  };
}
