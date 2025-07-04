
import type { Column, } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react"
import { Button } from "../ui/button"

export type SortableColumnProps<TData, TValue> = {
  column: Column<TData, TValue>,
  header: string
}

export function SortableColumn<TData, TValue>({ column, header }: SortableColumnProps<TData, TValue>) {
  return (
    <Button
      variant="ghost"
      size="filter"
      onClick={() => column?.toggleSorting(column?.getIsSorted() === "asc")}
    >
      {header}
      {column?.getIsSorted() === "desc" ? (
        <ArrowDown className="ml-2 h-4 w-4" />
      ) : column?.getIsSorted() === "asc" ? (
        <ArrowUp className="ml-2 h-4 w-4" />
      ) : (
        <ChevronsUpDown className="ml-2 h-4 w-4" />
      )}
    </Button>
  )
}
