/* eslint-disable react-hooks/exhaustive-deps */
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { type ReactNode, useEffect, useState } from "react"
import { useFilter } from "@/hooks/use-filter"
import usePaginationStore from "@/stores/pagination"
import { Loader2 } from "lucide-react"
import { DataTablePagination } from "./pagination"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[],
  filterAction?: ReactNode
  actionButton?: ReactNode
  viewButton?: ReactNode
  isLoading?: boolean
  hasPagination?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterAction,
  actionButton,
  viewButton,
  isLoading,
  hasPagination = true
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    []
  )
  const { updateFilter } = useFilter()

  const { pagination: { totalPages } } = usePaginationStore()

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      rowSelection,
      columnFilters
    },
    enableRowSelection: true,
    pageCount: totalPages,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
  })

  useEffect(() => {
    const filters = sorting.map((s) => {
      return { field: s.id.split('_').join('.'), direction: s.desc ? 'DESC' : 'ASC' }
    })

    updateFilter({ sortBy: JSON.stringify(filters) })
  }, [sorting])  

  return (
    <>
      {isLoading ? (
        <Loader2 className="animate-spin"/>
      ) : (
        <>
          <div className='flex items-center justify-between gap-4 py-4'>
            <div className="flex gap-4">
              {filterAction}
              {actionButton}
            </div>
            {viewButton}
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead className="first:pl-4" key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell className="first:pl-4" key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      Sem Registros
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="py-4">
            {hasPagination && <DataTablePagination table={table} />}
          </div>
        </>
      )}
    </>
  )
}
