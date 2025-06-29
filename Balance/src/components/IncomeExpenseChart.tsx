import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Expense } from "@/types/expense";
import { Income } from "@/types/income";
import { format, parseISO } from "date-fns";

interface IncomeExpenseChartProps {
  expenses: Expense[];
  income: Income[];
}

// Custom Tooltip component for IncomeExpenseChart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const incomeValue = payload.find((p: any) => p.dataKey === 'income')?.value || 0;
    const expenseValue = payload.find((p: any) => p.dataKey === 'expenses')?.value || 0;
    const monthYear = format(parseISO(label + '-01'), 'MM/yyyy'); // Assuming label is YYYY-MM

    return (
      <div className="p-2 bg-card text-card-foreground border border-border rounded-md shadow-lg">
        <p className="font-bold">{`Tháng: ${monthYear}`}</p>
        <p className="text-sm text-green-600">{`Thu nhập: ${incomeValue.toLocaleString('vi-VN')} VNĐ`}</p>
        <p className="text-sm text-red-600">{`Chi tiêu: ${expenseValue.toLocaleString('vi-VN')} VNĐ`}</p>
      </div>
    );
  }
  return null;
};

const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({ expenses, income }) => {
  const monthlyDataMap = new Map<string, { income: number; expenses: number }>();

  // Aggregate income by month
  income.forEach((inc) => {
    const monthYear = format(parseISO(inc.date), "yyyy-MM");
    const currentData = monthlyDataMap.get(monthYear) || { income: 0, expenses: 0 };
    monthlyDataMap.set(monthYear, { ...currentData, income: currentData.income + inc.amount });
  });

  // Aggregate expenses by month
  expenses.forEach((exp) => {
    const monthYear = format(parseISO(exp.date), "yyyy-MM");
    const currentData = monthlyDataMap.get(monthYear) || { income: 0, expenses: 0 };
    monthlyDataMap.set(monthYear, { ...currentData, expenses: currentData.expenses + exp.amount });
  });

  // Convert map to array of objects for Recharts, sorted by month
  const chartData = Array.from(monthlyDataMap.entries())
    .map(([monthYear, totals]) => ({ date: monthYear, ...totals }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8 shadow-lg transition-all duration-300 ease-in-out bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Biểu Đồ Thu Nhập và Chi Tiêu Hàng Tháng</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-center text-gray-500">Không có dữ liệu thu nhập hoặc chi tiêu để hiển thị biểu đồ.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(tick) => format(parseISO(tick + '-01'), 'MM/yyyy')} />
              <YAxis tickFormatter={(tick) => tick.toLocaleString('vi-VN')} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="income" name="Thu nhập" stroke="#22c55e" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="expenses" name="Chi tiêu" stroke="#ef4444" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default IncomeExpenseChart;