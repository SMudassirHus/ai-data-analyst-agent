import { useEffect, useMemo, useState } from "react";

import { createForecast, type ForecastResponse } from "../../api/forecasting";
import type { ColumnInfo } from "../../api/profile";
import Card from "../ui/Card";
import ForecastChart from "./ForecastChart";
import ForecastControls from "./ForecastControls";
import ForecastSummaryCard from "./ForecastSummaryCard";

type ForecastingPanelProps = {
  filename?: string;
  columns: ColumnInfo[];
};

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

function ForecastingPanel({ filename, columns }: ForecastingPanelProps) {
  const defaultDateColumn = useMemo(
    () => columns.find(isLikelyDate)?.name ?? "",
    [columns]
  );
  const defaultValueColumn = useMemo(
    () => columns.find(isLikelyNumeric)?.name ?? "",
    [columns]
  );
  const [dateColumn, setDateColumn] = useState(defaultDateColumn);
  const [valueColumn, setValueColumn] = useState(defaultValueColumn);
  const [periods, setPeriods] = useState(6);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasLikelyDate = columns.some(isLikelyDate);
  const hasLikelyNumeric = columns.some(isLikelyNumeric);
  const isSuitable = hasLikelyDate && hasLikelyNumeric;

  useEffect(() => {
    setDateColumn((current) => current || defaultDateColumn);
  }, [defaultDateColumn]);

  useEffect(() => {
    setValueColumn((current) => current || defaultValueColumn);
  }, [defaultValueColumn]);

  async function handleGenerate() {
    if (!filename || !dateColumn || !valueColumn || isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await createForecast({
        filename,
        date_column: dateColumn,
        value_column: valueColumn,
        periods,
      });
      setForecast(response);
    } catch (apiError: unknown) {
      setError(
        apiError instanceof Error
          ? apiError.message
          : "Unable to generate forecast."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-200 p-5">
        <h2 className="text-xl font-semibold text-slate-950">
          Predictive Forecasting
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Create a simple monthly baseline forecast from date and numeric columns.
        </p>
      </div>

      {!hasLikelyDate && (
        <div className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-800">
          This dataset is not suitable for time-series forecasting because no
          date column was detected.
        </div>
      )}

      {hasLikelyDate && !hasLikelyNumeric && (
        <div className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-800">
          This dataset has a date-like column, but no numeric value column was
          detected for forecasting.
        </div>
      )}

      <ForecastControls
        columns={columns}
        dateColumn={dateColumn}
        valueColumn={valueColumn}
        periods={periods}
        disabled={!filename || isLoading || !isSuitable}
        onDateColumnChange={setDateColumn}
        onValueColumnChange={setValueColumn}
        onPeriodsChange={setPeriods}
        onSubmit={handleGenerate}
      />

      <div className="space-y-5 bg-slate-50/70 p-5">
        {isLoading && (
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
            Building monthly series and generating baseline forecast...
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        {!forecast && !isLoading && !error && (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center">
            <p className="text-sm font-semibold text-slate-950">
              No forecast generated yet
            </p>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
              Forecasting needs a date column with monthly history and a
              numeric measure such as sales, revenue, profit, or quantity.
            </p>
          </div>
        )}

        {forecast && (
          <div className="space-y-5">
            <ForecastSummaryCard summary={forecast.summary} />
            <ForecastChart forecast={forecast.forecast} />
          </div>
        )}
      </div>
    </Card>
  );
}

export default ForecastingPanel;
