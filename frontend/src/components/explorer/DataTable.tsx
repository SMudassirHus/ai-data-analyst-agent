import type { ExploreRow, ExploreRowValue } from "../../api/explore";

type DataTableProps = {
  columns: string[];
  rows: ExploreRow[];
  sortBy?: string;
  sortOrder: "asc" | "desc";
  onSortChange: (column: string) => void;
};

function formatCellValue(value: ExploreRowValue) {
  if (value === null || value === "") {
    return "N/A";
  }

  return String(value);
}

function DataTable({
  columns,
  rows,
  sortBy,
  sortOrder,
  onSortChange,
}: DataTableProps) {
  if (columns.length === 0) {
    return (
      <div className="p-6 text-sm text-slate-600">
        No columns were found in this dataset.
      </div>
    );
  }

  return (
    <div className="max-h-[620px] overflow-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="sticky top-0 z-10 bg-slate-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                scope="col"
                className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-700"
              >
                <button
                  type="button"
                  className="inline-flex items-center gap-1 hover:text-[#635BFF]"
                  onClick={() => onSortChange(column)}
                >
                  {column}
                  {sortBy === column && (
                    <span className="text-xs text-[#635BFF]">
                      {sortOrder === "asc" ? "asc" : "desc"}
                    </span>
                  )}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-indigo-50/50">
              {columns.map((column) => (
                <td
                  key={`${rowIndex}-${column}`}
                  className="max-w-72 truncate whitespace-nowrap px-4 py-3 text-slate-700"
                  title={formatCellValue(row[column])}
                >
                  {formatCellValue(row[column])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {rows.length === 0 && (
        <div className="border-t border-slate-100 p-6 text-sm text-slate-600">
          No rows match the current search.
        </div>
      )}
    </div>
  );
}

export default DataTable;
