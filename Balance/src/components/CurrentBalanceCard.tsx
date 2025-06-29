import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Expense } from "@/types/expense";
import { Income } from "@/types/income";
import { format, parse, endOfMonth, isSameMonth, isSameYear } from "date-fns";

interface CurrentBalanceCardProps {
  expenses: Expense[];
  income: Income[];
  selectedMonth: string;
  selectedYear: string;
}

const CurrentBalanceCard: React.FC<CurrentBalanceCardProps> = ({
  expenses,
  income,
  selectedMonth,
  selectedYear,
}) => {
  const today = new Date();
  const selectedMonthDate = new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1);
  const endOfSelectedMonth = endOfMonth(selectedMonthDate);

  // Determine the effective end date for filtering
  const filterEndDate =
    isSameMonth(today, selectedMonthDate) && isSameYear(today, selectedMonthDate)
      ? today
      : endOfSelectedMonth;

  // Calculate total income up to the effective end date
  const totalIncomeCumulative = income
    .filter((inc) => parse(inc.date, 'yyyy-MM-dd', new Date()) <= filterEndDate)
    .reduce((sum, inc) => sum + inc.amount, 0);

  // Calculate total expenses up to the effective end date
  const totalExpensesCumulative = expenses
    .filter((exp) => parse(exp.date, 'yyyy-MM-dd', new Date()) <= filterEndDate)
    .reduce((sum, exp) => sum + exp.amount, 0);

  const currentBalance = totalIncomeCumulative - totalExpensesCumulative;

  const balanceColorClass =
    currentBalance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";

  return (
    <Card className="w-full shadow-lg transition-all duration-300 ease-in-out bg-card/80 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold text-center">
          Số Dư Tích Lũy (đến {format(filterEndDate, "dd/MM/yyyy")})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-5xl font-extrabold text-center ${balanceColorClass}`}>
          {currentBalance.toLocaleString()} VNĐ
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentBalanceCard;