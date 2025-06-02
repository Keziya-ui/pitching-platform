"use client";
import { useState, useEffect } from "react";

type FinancialRow = {
  year: number;
  revenue: number;
  expenses: number;
};

export default function FinancialProjectionsForm({
  value,
  onChange,
}: {
  value?: FinancialRow[]; // <-- optional initial rows from parent
  onChange: (rows: (FinancialRow & { profit: number })[]) => void;
}) {
  const [rows, setRows] = useState<FinancialRow[]>(
    value && value.length > 0
      ? value
      : [{ year: new Date().getFullYear(), revenue: 0, expenses: 0 }]
  );

  // Sync local state when `value` changes from parent
  useEffect(() => {
    if (value && JSON.stringify(value) !== JSON.stringify(rows)) {
      setRows(value);
    }
  }, [value]);

  const handleChange = (
    index: number,
    key: keyof FinancialRow,
    value: number
  ) => {
    const newRows = [...rows];
    newRows[index][key] = value;
    setRows(newRows);
    onChange(
      newRows.map((r) => ({
        ...r,
        profit: r.revenue - r.expenses,
      }))
    );
  };

  const addRow = () => {
    setRows([
      ...rows,
      { year: new Date().getFullYear() + rows.length, revenue: 0, expenses: 0 },
    ]);
    onChange(
      [
        ...rows,
        {
          year: new Date().getFullYear() + rows.length,
          revenue: 0,
          expenses: 0,
        },
      ].map((r) => ({
        ...r,
        profit: r.revenue - r.expenses,
      }))
    );
  };

  const removeRow = (index: number) => {
    const newRows = rows.filter((_, i) => i !== index);
    setRows(newRows);
    onChange(
      newRows.map((r) => ({
        ...r,
        profit: r.revenue - r.expenses,
      }))
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Financial Projections</h3>

      <div className="grid grid-cols-4 gap-4 font-medium text-gray-600">
        <span>Year</span>
        <span>Revenue</span>
        <span>Expenses</span>
        <span>Profit</span>
      </div>

      {rows.map((row, index) => (
        <div key={index} className="grid grid-cols-4 gap-4 items-center">
          <input
            type="number"
            value={row.year}
            onChange={(e) =>
              handleChange(index, "year", Number(e.target.value))
            }
            className="border border-gray-300 px-2 py-1 rounded"
            placeholder="Year"
          />
          <input
            type="number"
            value={row.revenue}
            onChange={(e) =>
              handleChange(index, "revenue", Number(e.target.value))
            }
            className="border border-gray-300 px-2 py-1 rounded"
            placeholder="Revenue"
          />
          <input
            type="number"
            value={row.expenses}
            onChange={(e) =>
              handleChange(index, "expenses", Number(e.target.value))
            }
            className="border border-gray-300 px-2 py-1 rounded"
            placeholder="Expenses"
          />
          <div className="flex items-center gap-2">
            <span className="font-medium text-green-600">
              ${row.revenue - row.expenses}
            </span>
            {rows.length > 1 && (
              <button
                type="button"
                onClick={() => removeRow(index)}
                className="text-red-500 text-sm"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addRow}
        className="mt-2 px-4 py-1 bg-blue-600 text-white rounded"
      >
        + Add Year
      </button>
    </div>
  );
}
