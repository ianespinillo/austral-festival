"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  itemName?: string;
}

export function TablePagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  itemName = "elementos",
}: TablePaginationProps) {
  if (totalItems === 0) {
    return null;
  }

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generamos lista de páginas visibles (máximo 5 páginas)
  const getPageNumbers = () => {
    const pages: number[] = [];
    let start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);

    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/60 bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
      {/* Rango visible y total */}
      <div className="flex items-center gap-1 whitespace-nowrap">
        <span>Mostrando</span>
        <strong className="text-foreground tabular-nums">{startItem}</strong>
        <span>a</span>
        <strong className="text-foreground tabular-nums">{endItem}</strong>
        <span>de</span>
        <strong className="text-foreground tabular-nums">{totalItems}</strong>
        <span>{itemName}</span>
      </div>

      <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-4">
        {/* Selector de filas por página */}
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <label htmlFor={`page-size-${itemName}`} className="text-xs text-muted-foreground whitespace-nowrap">
              Filas por pág.:
            </label>
            <select
              id={`page-size-${itemName}`}
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-8 rounded-md border border-border/80 bg-card px-2.5 py-1 text-xs font-semibold text-foreground shadow-2xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
              aria-label="Filas por página"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Botones de navegación y números de página */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="h-8 px-2.5 text-xs font-medium border-border/80 bg-card hover:bg-muted/50 disabled:opacity-40"
            aria-label="Página anterior"
          >
            <ChevronLeft className="size-3.5 mr-1" />
            Anterior
          </Button>

          <div className="flex items-center gap-1">
            {getPageNumbers().map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                className={`size-8 rounded-md text-xs font-semibold transition-colors tabular-nums ${
                  page === currentPage
                    ? "bg-primary text-primary-foreground shadow-xs font-bold"
                    : "bg-card text-foreground hover:bg-muted border border-border/70"
                }`}
                aria-current={page === currentPage ? "page" : undefined}
              >
                {page}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="h-8 px-2.5 text-xs font-medium border-border/80 bg-card hover:bg-muted/50 disabled:opacity-40"
            aria-label="Página siguiente"
          >
            Siguiente
            <ChevronRight className="size-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
