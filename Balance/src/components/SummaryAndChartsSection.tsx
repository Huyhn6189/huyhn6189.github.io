import React from "react";
import BudgetSummary from "@/components/BudgetSummary";
import ExpenseChart from "@/components/ExpenseChart";
import CategoryPieChart from "@/components/CategoryPieChart";
import CategorySummary from "@/components/CategorySummary";
import MonthlyExpenseView from "@/components/MonthlyExpenseView"; // Import new component
import MonthlyIncomeView from "@/components/MonthlyIncomeView"; // Corrected import path
import { Expense } from "@/types/expense";
import { Budget } from "@/types/budget";
import { Income } from "@/types/income"; // Import Income type
import { format, parse } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface SummaryAndChartsSectionProps {
  expenses: Expense[];
  budgets: Budget[];
  income: Income[]; // Add income prop
  selectedMonth: string;
  selectedYear: string;
  onMonthChange: (month: string) => void;
  onYearChange: (year: string) => void;
}

const calculateCategoryTotals = (expenses: Expense[]) => {
  const totalsMap = new Map<string, number>();
  expenses.forEach((expense) => {
    const currentTotal = totalsMap.get(expense.category) || 0;
    totalsMap.set(expense.category, currentTotal + expense.amount);
  });
  return Array.from(totalsMap.entries()).map(([category, total]) => ({ category, total }));
};

const SummaryAndChartsSection: React.FC<SummaryAndChartsSectionProps> = ({
  expenses,
  budgets,
  income, // Destructure income
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
}) => {
  // Ensure expenses and income are always arrays
  const currentExpenses = Array.isArray(expenses) ? expenses : [];
  const currentIncome = Array.isArray(income) ? income : [];

  const today = new Date();
  const years = Array.from({ length: 11 }, (_, i) => (today.getFullYear() - 5 + i).toString());
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));

  const selectedMonthYear = `${selectedYear}-${selectedMonth}`;

  const expensesForMonth = currentExpenses.filter(expense => {
    const expenseDate = parse(expense.date, 'yyyy-MM-dd', new Date());
    const expenseMonthYear = format(expenseDate, "yyyy-MM");
    return expenseMonthYear === selectedMonthYear;
  });

  // Calculate total expenses for the month to pass to CategoryPieChart
  const totalExpensesForMonth = expensesForMonth.reduce((sum, exp) => sum + exp.amount, 0);

  const incomeForMonth = currentIncome.filter(inc => {
    const incomeDate = parse(inc.date, 'yyyy-MM-dd', new Date());
    const incomeMonthYear = format(incomeDate, "yyyy-MM");
    return incomeMonthYear === selectedMonthYear;
  });

  const categoryTotals = calculateCategoryTotals(expensesForMonth);

  const handleSetCurrentMonth = () => {
    onMonthChange(format(today, "MM"));
    onYearChange(format(today, "yyyy"));
  };

  return (
    <div className="w-full p-4 bg-card/80 backdrop-blur-sm rounded-xl shadow-xl space-y-8 transition-all duration-300 ease-in-out">
      <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">
        Tổng Quan & Biểu Đồ Chi Tiêu tháng {selectedMonth}/{selectedYear}
      </h2>
      <div className="mb-4 flex flex-wrap justify-center gap-4">
        <div className="flex items-center space-x-2">
          <Label htmlFor="month-select">Tháng:</Label>
          <Select value={selectedMonth} onValueChange={onMonthChange}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Tháng" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month} value={month}>
                  Tháng {parseInt(month, 10)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="year-select">Năm:</Label>
          <Select value={selectedYear} onValueChange={onYearChange}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Năm" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={handleSetCurrentMonth} className="w-full sm:w-auto">
          Tháng hiện tại
        </Button>
      </div>
      <BudgetSummary
        expenses={expenses}
        budgets={budgets}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={onMonthChange}
        onYearChange={onYearChange}
      />
      <ExpenseChart expenses={expensesForMonth} />
      <CategoryPieChart expenses={expensesForMonth} totalExpenses={totalExpensesForMonth} /> {/* Pass totalExpenses */}
      <CategorySummary categoryTotals={categoryTotals} />
      <MonthlyExpenseView expenses={expensesForMonth} /> {/* New monthly expense view */}
      <MonthlyIncomeView income={incomeForMonth} /> {/* New monthly income view */}
    </div>
  );
};

export default SummaryAndChartsSection;