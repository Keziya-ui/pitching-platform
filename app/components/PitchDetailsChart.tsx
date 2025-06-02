import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

type FinancialProjection = {
  year: number;
  revenue: number;
  expenses: number;
  profit: number;
};

export default function PitchDetailsChart({
  projections,
}: {
  projections: FinancialProjection[];
}) {
  const data = projections.map((p) => ({
    year: p.year.toString(),
    revenue: p.revenue,
    expenses: p.expenses,
    profit: p.profit,
  }));

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Financial Projections</h3>
      <p className="block mb-2 text-sm font-medium">
        Revenues and Expenses are in USD
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
          <Line type="monotone" dataKey="expenses" stroke="#82ca9d" />
          <Line type="monotone" dataKey="profit" stroke="#f87171" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
