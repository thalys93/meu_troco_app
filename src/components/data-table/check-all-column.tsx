import { Row, Table } from "@tanstack/react-table";
import { Checkbox } from "../ui/checkbox";

export type CheckAllColumnProps<T> = {
  table: Table<T>
  row: Row<T>
}

export function CheckAllColumn<T>({ table, row }: CheckAllColumnProps<T>) {
  return {
      id: "select",
      header: () => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="hidden"
        />
      ),
      cell: () => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="hidden"
        />
      )
    }
}
