import { normalizeDate } from "@/utils/normalizers/normalizers"

export type NormalizedDateColumnProps = {
  date: string | Date | undefined
}

export function NormalizedDateColumn({ date }: NormalizedDateColumnProps) {
  return (
    <div>{normalizeDate(date)}</div>
  )
}
