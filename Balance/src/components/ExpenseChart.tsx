import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Expense } from "@/types/expense";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO } from "date-fns"; // Import parseISO

interface ExpenseChartProps {
  expenses: Expense[]; // Now expects expenses already filtered for the desired month
}

// Custom Tooltip component for ExpenseChart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-card text-card-foreground border border-border rounded-md shadow-lg">
        <p className="font-bold">{`Ngày: ${format(parseISO(label), 'dd-MM-yyyy')}`}</p>
        <p className="text-sm">{`Chi tiêu: ${payload[0].value.toLocaleString('vi-VN')} VNĐ`}</p>
      </div>
    );
  }
  return null;
};

const ExpenseChart: React.FC<ExpenseChartProps> = ({ expenses }) => {
  // Aggregate expenses by date
  const dailyExpensesMap = new Map<string, number>();

  expenses.forEach((expense) => {
    const date = expense.date; // Date is already in YYYY-MM-DD format
    const currentAmount = dailyExpensesMap.get(date) || 0;
    dailyExpensesMap.set(date, currentAmount + expense.amount);
  });

  // Convert map to array of objects for Recharts, sorted by date
  const chartData = Array.from(dailyExpensesMap.entries())
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8 shadow-lg transition-all duration-300 ease-in-out bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Biểu Đồ Chi Tiêu Hàng Ngày</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-center text-gray-500">Không có dữ liệu chi tiêu để hiển thị biểu đồ.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} /> {/* Use custom tooltip */}
              <Bar dataKey="amount" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpenseChart;