/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { type KeyboardEvent, useCallback } from "react";
import { Input } from "../ui/input";
import { useFilter } from "@/hooks/use-filter";

export type FilterColumnByTextProps = {
  filters: string[]
  placeholder?: string;
}

export function FilterColumnByText({ filters, placeholder }: FilterColumnByTextProps) {
  const { updateFilter } = useFilter()

  const debounce = <T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void => {
    let timer: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const handleKeyup = useCallback(
    debounce((event: KeyboardEvent<HTMLInputElement>) => {
      const value = (event.target as HTMLInputElement).value
      let filteredFields = {};
      filters.map(filter => {
        filteredFields = {
          ...filteredFields,
          [filter]: value
        }
      })
      updateFilter({ ...filteredFields })
    }, 500),
    []
  )

  return <Input name="name" placeholder={placeholder ?? ""} onKeyUp={handleKeyup}/>
}
