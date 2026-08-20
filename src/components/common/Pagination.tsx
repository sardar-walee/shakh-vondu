import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
  className
}: PaginationProps) {
  const { t, i18n } = useTranslation();
  const isRTL = ['ku', 'ar', 'fa'].includes(i18n.language);

  if (totalItems === 0) return null;

  const startItem = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate visible page numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const PrevIcon = isRTL ? ChevronRight : ChevronLeft;
  const NextIcon = isRTL ? ChevronLeft : ChevronRight;
  const FirstIcon = isRTL ? ChevronsRight : ChevronsLeft;
  const LastIcon = isRTL ? ChevronsLeft : ChevronsRight;

  return (
    <div className={cn(
      "flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-white border-t border-gray-100",
      className
    )}>
      {/* Items range & total */}
      <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
        <span>
          {isRTL ? (
            <>پیشاندانی <strong className="text-gray-900 font-bold">{startItem}</strong> بۆ <strong className="text-gray-900 font-bold">{endItem}</strong> لە سەرجەم <strong className="text-gray-900 font-bold">{totalItems}</strong> دانە</>
          ) : (
            <>Showing <strong className="text-gray-900 font-bold">{startItem}</strong> to <strong className="text-gray-900 font-bold">{endItem}</strong> of <strong className="text-gray-900 font-bold">{totalItems}</strong> entries</>
          )}
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-gray-400">|</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 outline-none hover:bg-gray-100 cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / {isRTL ? 'لاپەڕە' : 'page'}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className={cn("flex items-center gap-1.5", isRTL && "flex-row-reverse")}>
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
          title={isRTL ? 'یەکەم لاپەڕە' : 'First page'}
        >
          <FirstIcon className="w-4 h-4" />
        </button>

        {/* Previous Page ("لاپەڕەی پێشوو") */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
        >
          <PrevIcon className="w-4 h-4" />
          <span>{isRTL ? 'پێشوو' : 'Prev'}</span>
        </button>

        {/* Page Numbers */}
        <div className="hidden md:flex items-center gap-1">
          {getPageNumbers().map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`dots-${idx}`} className="px-2 text-xs text-gray-400 font-black">
                  ...
                </span>
              );
            }
            const pageNum = Number(p);
            const isActive = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={cn(
                  "w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Page ("لاپەڕەی دواتر") */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700 hover:bg-blue-100 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
        >
          <span>{isRTL ? 'دواتر' : 'Next'}</span>
          <NextIcon className="w-4 h-4" />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
          title={isRTL ? 'دوا لاپەڕە' : 'Last page'}
        >
          <LastIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
