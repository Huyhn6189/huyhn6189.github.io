import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Expense } from "@/types/expense";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CategoryPieChartProps {
  expenses: Expense[]; // Now expects expenses already filtered for the desired month
  totalExpenses: number; // New prop to get the total for percentage calculation
}

const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d",
  "#a4de6c", "#d0ed57", "#ffc658", "#ff7300", "#d3d3d3", "#add8e6"
];

// Custom Tooltip component for CategoryPieChart
const CustomPieTooltip = ({ active, payload, label, totalExpenses }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload; // For PieChart, payload[0] contains the data object
    // Calculate percentage manually using the value and totalExpenses
    const calculatedPercentage = totalExpenses > 0 ? (data.value / totalExpenses) * 100 : 0;
    const percentage = calculatedPercentage.toFixed(1); // Format to one decimal place
    return (
      <div className="p-2 bg-card text-card-foreground border border-border rounded-md shadow-lg">
        <p className="font-bold">{`${data.name}`}</p>
        <p className="text-sm">{`Số tiền: ${data.value.toLocaleString('vi-VN')} VNĐ`}</p>
        <p className="text-sm">{`Phần trăm: ${percentage}%`}</p>
      </div>
    );
  }
  return null;
};

const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ expenses, totalExpenses }) => {
  const categoryTotalsMap = new Map<string, number>();

  expenses.forEach((expense) => {
    const currentTotal = categoryTotalsMap.get(expense.category) || 0;
    categoryTotalsMap.set(expense.category, currentTotal + expense.amount);
  });

  const chartData = Array.from(categoryTotalsMap.entries())
    .map(([category, total]) => ({ name: category, value: total }))
    .sort((a, b) => b.value - a.value); // Sort by value descending

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8 shadow-lg transition-all duration-300 ease-in-out bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Phân Bổ Chi Tiêu Theo Danh Mục</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-center text-gray-500">Không có dữ liệu chi tiêu theo danh mục để hiển thị biểu đồ.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${isNaN(percent) ? "0.0" : (percent * 100).toFixed(1)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip totalExpenses={totalExpenses} />} /> {/* Pass totalExpenses to CustomPieTooltip */}
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryPieChart;