import { useMemo, useState } from "react";

import type { ColumnInfo } from "../api/profile";
import { formatNumber, formatPercentage } from "../utils/format";
import Card from "./ui/Card";

type ColumnExplorerProps = {
  columns: ColumnInfo[];
};

type SortKey = "name" | "data_type" | "null_percentage" | "unique_values";
type SortDirection = "asc" | "desc";

function compareValues(
  first: ColumnInfo,
  second: ColumnInfo,
  key: SortKey,
  direction: SortDirection
) {
  const firstValue = first[key];
  const secondValue = second[key];
  const modifier = direction === "asc" ? 1 : -1;

  if (typeof firstValue === "number" && typeof secondValue === "number") {
    return (firstValue - secondValue) * modifier;
  }

  return String(firstValue).localeCompare(String(secondValue)) * modifier;
}

function ColumnExplorer({ columns }: ColumnExplorerProps) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const visibleColumns = useMemo(() => {
    const query = search.trim().toLowerCase();

    return columns
      .filter((column) => column.name.toLowerCase().includes(query))
      .sort((first, second) =>
        compareValues(first, second, sortKey, sortDirection)
      );
  }, [columns, search, sortDirection, sortKey]);

  function handleSort(nextKey: SortKey) {
    if (nextKey === sortKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      return;
    }

    setSortKey(nextKey);
    setSortDirection("asc");
  }

  const headers: Array<{ key: SortKey; label: string }> = [
    { key: "name", label: "Column Name" },
    { key: "data_type", label: "Type" },
    { key: "null_percentage", label: "Missing %" },
    { key: "unique_values", label: "Unique Values" },
  ];

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">
            Column Explorer
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Search and sort the detected dataset columns.
          </p>
        </div>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search columns"
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 sm:w-64"
        />
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead>
            <tr>
              {headers.map((header) => (
                <th
                  key={header.key}
                  scope="col"
                  className="whitespace-nowrap bg-slate-50 px-3 py-3 text-left font-semibold text-slate-600"
                >
                  <button
                    type="button"
                    className="font-semibold hover:text-[#635BFF]"
                    onClick={() => handleSort(header.key)}
                  >
                    {header.label}
                    {sortKey === header.key
                      ? sortDirection === "asc"
                        ? " asc"
                        : " desc"
                      : ""}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleColumns.map((column) => (
              <tr key={column.name} className="hover:bg-indigo-50/50">
                <td className="max-w-64 truncate px-3 py-3 font-medium text-slate-950">
                  {column.name}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-slate-600">
                  {column.data_type}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-slate-600">
                  {formatPercentage(column.null_percentage)}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-slate-600">
                  {formatNumber(column.unique_values)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {visibleColumns.length === 0 && (
        <p className="mt-5 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
          No columns match the current search.
        </p>
      )}
    </Card>
  );
}

export default ColumnExplorer;
