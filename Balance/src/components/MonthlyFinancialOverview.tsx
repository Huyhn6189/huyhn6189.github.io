import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";

interface MonthlyFinancialOverviewProps {
  totalMonthlyIncome: number;
  totalMonthlyExpenses: number;
  selectedMonth: string;
  selectedYear: string;
}

const MonthlyFinancialOverview: React.FC<MonthlyFinancialOverviewProps> = ({
  totalMonthlyIncome,
  totalMonthlyExpenses,
  selectedMonth,
  selectedYear,
}) => {
  const netSavings = totalMonthlyIncome - totalMonthlyExpenses;
  const savingsColorClass =
    netSavings >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
  const savingsIcon = netSavings >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />;

  return (
    <Card className="w-full shadow-lg transition-all duration-300 ease-in-out bg-card/80 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold text-center">
          Tổng Quan Tài Chính Tháng {selectedMonth}/{selectedYear}
        </CardTitle>
        <DollarSign className="h-8 w-8 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-medium text-gray-700 dark:text-gray-300">Tổng Thu Nhập:</span>
          <span className="text-xl font-semibold text-green-600 dark:text-green-400">
            {totalMonthlyIncome.toLocaleString()} VNĐ
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-lg font-medium text-gray-700 dark:text-gray-300">Tổng Chi Tiêu:</span>
          <span className="text-xl font-semibold text-red-600 dark:text-red-400">
            {totalMonthlyExpenses.toLocaleString()} VNĐ
          </span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-border">
          <span className="text-xl font-bold text-gray-800 dark:text-gray-100">Tiết Kiệm Ròng:</span>
          <span className={`text-3xl font-extrabold flex items-center gap-2 ${savingsColorClass}`}>
            {savingsIcon} {netSavings.toLocaleString()} VNĐ
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyFinancialOverview;