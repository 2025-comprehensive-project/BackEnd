// src/hooks/usePagination.js
import { useState, useEffect, useMemo } from 'react';

export function usePagination(items, itemsPerPage, initialPage = 1) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const totalPages = useMemo(() => 
    Math.ceil(items.length / itemsPerPage), [items.length, itemsPerPage]);
  
  // 아이템 목록이 변경되면 첫 페이지로 이동
  useEffect(() => {
    setCurrentPage(1);
  }, [items]);
  
  // 현재 페이지에 해당하는 아이템만 선택
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, itemsPerPage]);
  
  // 페이지 변경 핸들러
  const handlePageChange = (newPage) => {
    setCurrentPage(Math.max(1, Math.min(newPage, totalPages)));
  };
  
  return {
    currentPage,
    totalPages,
    paginatedItems,
    handlePageChange,
    setCurrentPage
  };
}