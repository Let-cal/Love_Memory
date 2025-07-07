"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Heart, MoreHorizontal } from "lucide-react";

interface PaginationComponentProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  itemType?: "photo" | "date";
  className?: string;
}

export function PaginationComponent({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  itemsPerPage,
  itemType = "photo",
  className,
}: PaginationComponentProps) {
  // Don't render if there's only one page or no items
  if (totalPages <= 1 || totalItems === 0) {
    return null;
  }

  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Complex pagination logic
      if (currentPage <= 3) {
        // Show first few pages
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        if (totalPages > 5) {
          pages.push("...");
          pages.push(totalPages);
        }
      } else if (currentPage >= totalPages - 2) {
        // Show last few pages
        pages.push(1);
        if (totalPages > 5) {
          pages.push("...");
        }
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show middle pages
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = generatePageNumbers();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={cn("flex flex-col items-center space-y-4", className)}>
      {/* Info Text */}
      <div className="text-sm text-slate-400 text-center">
        Showing {startItem}-{endItem} of {totalItems} {itemType}
        {totalItems !== 1 ? "s" : ""}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-center space-x-1">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            "relative overflow-hidden",
            "bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20",
            "border-pink-200 dark:border-pink-800/50",
            "text-pink-700 dark:text-pink-300",
            "hover:from-pink-100 hover:to-rose-100 dark:hover:from-pink-800/30 dark:hover:to-rose-800/30",
            "hover:border-pink-300 dark:hover:border-pink-700/70",
            "hover:shadow-lg hover:shadow-pink-200/50 dark:hover:shadow-pink-900/30",
            "transition-all duration-300",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "disabled:hover:from-pink-50 disabled:hover:to-rose-50",
            "disabled:dark:hover:from-pink-900/20 disabled:dark:hover:to-rose-900/20",
            "group"
          )}
        >
          <ChevronLeft className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
          <span className="sr-only">Previous page</span>
        </Button>

        {/* Page Numbers */}
        <div className="flex items-center space-x-1">
          {pageNumbers.map((page, index) => {
            if (page === "...") {
              return (
                <div
                  key={`ellipsis-${index}`}
                  className="px-2 py-1 text-slate-400 dark:text-slate-500"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </div>
              );
            }

            const isActive = page === currentPage;
            
            return (
              <Button
                key={page}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page as number)}
                className={cn(
                  "relative overflow-hidden min-w-[2.5rem]",
                  "transition-all duration-300",
                  isActive
                    ? [
                        // Active state - romantic glow
                        "bg-gradient-to-r from-pink-500 to-rose-500",
                        "border-pink-500",
                        "text-white",
                        "shadow-lg shadow-pink-300/50 dark:shadow-pink-900/50",
                        "hover:from-pink-600 hover:to-rose-600",
                        "hover:shadow-xl hover:shadow-pink-400/60 dark:hover:shadow-pink-800/60",
                        "scale-105",
                        // Heart glow animation
                        "after:absolute after:inset-0",
                        "after:bg-gradient-to-r after:from-pink-400/20 after:to-rose-400/20",
                        "after:animate-pulse after:rounded-md",
                      ]
                    : [
                        // Inactive state
                        "bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/10 dark:to-rose-900/10",
                        "border-pink-200 dark:border-pink-800/30",
                        "text-pink-700 dark:text-pink-300",
                        "hover:from-pink-100 hover:to-rose-100 dark:hover:from-pink-800/20 dark:hover:to-rose-800/20",
                        "hover:border-pink-300 dark:hover:border-pink-700/50",
                        "hover:text-pink-800 dark:hover:text-pink-200",
                        "hover:shadow-md hover:shadow-pink-200/30 dark:hover:shadow-pink-900/20",
                        "hover:scale-105",
                      ]
                )}
              >
                {isActive && (
                  <Heart className="absolute top-0 right-0 h-2 w-2 text-pink-200 fill-current animate-pulse" />
                )}
                <span className="relative z-10">{page}</span>
              </Button>
            );
          })}
        </div>

        {/* Next Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(
            "relative overflow-hidden",
            "bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20",
            "border-pink-200 dark:border-pink-800/50",
            "text-pink-700 dark:text-pink-300",
            "hover:from-pink-100 hover:to-rose-100 dark:hover:from-pink-800/30 dark:hover:to-rose-800/30",
            "hover:border-pink-300 dark:hover:border-pink-700/70",
            "hover:shadow-lg hover:shadow-pink-200/50 dark:hover:shadow-pink-900/30",
            "transition-all duration-300",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "disabled:hover:from-pink-50 disabled:hover:to-rose-50",
            "disabled:dark:hover:from-pink-900/20 disabled:dark:hover:to-rose-900/20",
            "group"
          )}
        >
          <ChevronRight className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
          <span className="sr-only">Next page</span>
        </Button>
      </div>

      {/* Mobile-friendly Quick Navigation */}
      <div className="flex items-center justify-center space-x-2 md:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={cn(
            "text-xs",
            "bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20",
            "border-pink-200 dark:border-pink-800/50",
            "text-pink-700 dark:text-pink-300",
            "hover:from-pink-100 hover:to-rose-100 dark:hover:from-pink-800/30 dark:hover:to-rose-800/30",
            "disabled:opacity-50"
          )}
        >
          First
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={cn(
            "text-xs",
            "bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20",
            "border-pink-200 dark:border-pink-800/50",
            "text-pink-700 dark:text-pink-300",
            "hover:from-pink-100 hover:to-rose-100 dark:hover:from-pink-800/30 dark:hover:to-rose-800/30",
            "disabled:opacity-50"
          )}
        >
          Last
        </Button>
      </div>
    </div>
  );
}