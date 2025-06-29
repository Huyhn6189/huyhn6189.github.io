import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Expense } from "@/types/expense";
import { Budget } from "@/types/budget";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface BudgetSummaryProps {
  expenses: Expense[];
  budgets: Budget[];
  selectedMonth: string; // Nhận từ props
  selectedYear: string; // Nhận từ props
  onMonthChange: (month: string) => void; // Nhận từ props
  onYearChange: (year: string) => void; // Nhận từ props
}

const BudgetSummary: React.FC<BudgetSummaryProps> = ({
  expenses,
  budgets,
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
}) => {
  const selectedMonthYear = `${selectedYear}-${selectedMonth}`;

  // Filter expenses for the selected month
  const currentMonthExpenses = expenses.filter(
    (expense) => format(new Date(expense.date), "yyyy-MM") === selectedMonthYear
  );

  // Calculate total spent per category for the selected month
  const spentByCategoryMap = new Map<string, number>();
  currentMonthExpenses.forEach((expense) => {
    const currentSpent = spentByCategoryMap.get(expense.category) || 0;
    spentByCategoryMap.set(expense.category, currentSpent + expense.amount);
  });

  // Prepare data for display
  const budgetSummaryData = budgets
    .filter((budget) => budget.monthYear === selectedMonthYear)
    .map((budget) => {
      const spent = spentByCategoryMap.get(budget.category) || 0;
      const remaining = budget.amount - spent;
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      return {
        category: budget.category,
        budgeted: budget.amount,
        spent: spent,
        remaining: remaining,
        percentage: Math.min(100, percentage), // Cap at 100% for progress bar
        overBudget: remaining < 0,
      };
    });

  // Remove month/year selectors from here as they are now in SummaryAndChartsSection
  // const years = Array.from({ length: 11 }, (_, i) => (new Date().getFullYear() - 5 + i).toString());
  // const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8 shadow-lg transition-all duration-300 ease-in-out bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Ngân Sách Tháng {selectedMonth}/{selectedYear}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Removed month/year selectors from here */}
        {budgetSummaryData.length === 0 ? (
          <p className="text-center text-gray-500">Chưa có ngân sách nào được đặt cho tháng này.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Danh mục</TableHead>
                <TableHead className="text-right">Ngân sách</TableHead>
                <TableHead className="text-right">Đã chi</TableHead>
                <TableHead className="text-right">Còn lại</TableHead>
                <TableHead className="text-center">Tiến độ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgetSummaryData.map((item) => (
                <TableRow key={item.category}>
                  <TableCell className="font-medium">{item.category}</TableCell>
                  <TableCell className="text-right">{item.budgeted.toLocaleString()} VNĐ</TableCell>
                  <TableCell className="text-right">{item.spent.toLocaleString()} VNĐ</TableCell>
                  <TableCell className={`text-right ${item.overBudget ? "text-red-500" : "text-green-600"}`}>
                    {item.remaining.toLocaleString()} VNĐ
                  </TableCell>
                  <TableCell className="text-center">
                    <Progress value={item.percentage} className="w-full" />
                    <span className="text-sm text-gray-500">{item.percentage.toFixed(0)}%</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default BudgetSummary;