

import usePaginationStore from "@/stores/pagination"
import type { Table } from "@tanstack/react-table"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Button } from "../ui/button"


interface DataTablePaginationProps<TData> {
  table: Table<TData>
}

export function DataTablePagination<TData>({
  table
}: DataTablePaginationProps<TData>) {
  const { pagination: { currentPage, itemsPerPage, totalPages }, updatePagination } = usePaginationStore()  

  return (
    <div className="flex items-center justify-between px-2">
      <div className='flex-1 text-muted-foreground text-sm'>
        {/* {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} {t('default.pagination.selected')}. */}
      </div>
      <div className='flex flex-end items-center space-x-6 lg:space-x-8'>
        <div className="flex items-center space-x-2">
          <p className='font-medium text-sm'>Items por página</p>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
              updatePagination({ itemsPerPage: Number(value), currentPage: 1 })
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={itemsPerPage.toString()} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 25, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='flex w-[100px] items-center justify-center font-medium text-sm'>
          Página { currentPage } de { totalPages }
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => {
              updatePagination({ currentPage: 1 })
            }}
            disabled={currentPage === 1}
          >
            <span className="sr-only">Primeira Pagina</span>
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => {
              updatePagination({ currentPage: currentPage - 1 })
            }}
            disabled={currentPage === 1}
          >
            <span className="sr-only">Página Anterior</span>
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => {
              updatePagination({ currentPage: currentPage + 1 })
            }}
            disabled={currentPage === totalPages}
          >
            <span className="sr-only">Proxima Pagina</span>
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => {
              updatePagination({ currentPage: totalPages })
            }}
            disabled={currentPage === totalPages}
          >
            <span className="sr-only">Ultima Pagina</span>
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  )
}
