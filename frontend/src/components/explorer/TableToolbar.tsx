type TableToolbarProps = {
  search: string;
  pageSize: number;
  totalRows: number;
  onSearchChange: (value: string) => void;
  onPageSizeChange: (value: number) => void;
};

const pageSizeOptions = [10, 25, 50, 100];

function TableToolbar({
  search,
  pageSize,
  totalRows,
  onSearchChange,
  onPageSizeChange,
}: TableToolbarProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h2 className="text-xl font-semibold text-slate-950">Data Explorer</h2>
        <p className="mt-1 text-sm text-slate-600">
          Preview, search, sort, and page through uploaded dataset rows.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative">
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search all columns"
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 sm:w-72"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-600">
          Rows
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-950 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <p className="text-sm text-slate-500">{totalRows.toLocaleString()} rows</p>
      </div>
    </div>
  );
}

export default TableToolbar;
