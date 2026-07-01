import type { ColumnInfo } from "../../api/profile";
import Button from "../ui/Button";

type ForecastControlsProps = {
  columns: ColumnInfo[];
  dateColumn: string;
  valueColumn: string;
  periods: number;
  disabled?: boolean;
  onDateColumnChange: (value: string) => void;
  onValueColumnChange: (value: string) => void;
  onPeriodsChange: (value: number) => void;
  onSubmit: () => void;
};

const periodOptions = [3, 6, 12];

function isLikelyNumeric(column: ColumnInfo) {
  return ["int", "float", "double", "decimal"].some((type) =>
    column.data_type.toLowerCase().includes(type)
  );
}

function isLikelyDate(column: ColumnInfo) {
  const name = column.name.toLowerCase();
  const type = column.data_type.toLowerCase();
  return type.includes("datetime") || name.includes("date") || name.includes("month");
}

function ForecastControls({
  columns,
  dateColumn,
  valueColumn,
  periods,
  disabled = false,
  onDateColumnChange,
  onValueColumnChange,
  onPeriodsChange,
  onSubmit,
}: ForecastControlsProps) {
  const dateColumns = columns.filter(isLikelyDate);
  const numericColumns = columns.filter(isLikelyNumeric);

  return (
    <div className="grid gap-4 border-b border-slate-200 p-5 lg:grid-cols-[1fr_1fr_0.7fr_auto] lg:items-end">
      <label className="space-y-2 text-sm font-medium text-slate-700">
        Date column
        <select
          value={dateColumn}
          disabled={disabled}
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
          onChange={(event) => onDateColumnChange(event.target.value)}
        >
          <option value="">Select date column</option>
          {dateColumns.map((column) => (
            <option key={column.name} value={column.name}>
              {column.name}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2 text-sm font-medium text-slate-700">
        Value column
        <select
          value={valueColumn}
          disabled={disabled}
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
          onChange={(event) => onValueColumnChange(event.target.value)}
        >
          <option value="">Select numeric value</option>
          {numericColumns.map((column) => (
            <option key={column.name} value={column.name}>
              {column.name}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2 text-sm font-medium text-slate-700">
        Periods
        <select
          value={periods}
          disabled={disabled}
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
          onChange={(event) => onPeriodsChange(Number(event.target.value))}
        >
          {periodOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <Button
        disabled={disabled || !dateColumn || !valueColumn}
        onClick={onSubmit}
      >
        Generate Forecast
      </Button>
    </div>
  );
}

export default ForecastControls;
