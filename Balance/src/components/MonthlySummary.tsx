import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Expense } from "@/types/expense";
import { format, parse } from "date-fns";

interface MonthlySummaryProps {
  expenses: Expense[];
}

const MonthlySummary: React.FC<MonthlySummaryProps> = ({ expenses }) => {
  const monthlyTotalsMap = new Map<string, number>();

  expenses.forEach((expense) => {
    const expenseDate = parse(expense.date, 'yyyy-MM-dd', new Date());
    const monthYear = format(expenseDate, "MM/yyyy");
    const currentAmount = monthlyTotalsMap.get(monthYear) || 0;
    monthlyTotalsMap.set(monthYear, currentAmount + expense.amount);
  });

  // Convert map to array of objects, sorted by date (most recent first)
  const monthlyTotals = Array.from(monthlyTotalsMap.entries())
    .map(([monthYear, total]) => ({ monthYear, total }))
    .sort((a, b) => {
      // Parse "MM/YYYY" to Date objects for sorting
      const [monthA, yearA] = a.monthYear.split('/').map(Number);
      const [monthB, yearB] = b.monthYear.split('/').map(Number);
      const dateA = new Date(yearA, monthA - 1);
      const dateB = new Date(yearB, monthB - 1);
      return dateB.getTime() - dateA.getTime(); // Descending order (most recent first)
    });

  return (
    <Card className="w-full shadow-lg transition-all duration-300 ease-in-out bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Tổng Chi Tiêu Hàng Tháng</CardTitle>
      </CardHeader>
      <CardContent>
        {monthlyTotals.length === 0 ? (
          <p className="text-center text-gray-500">Không có dữ liệu chi tiêu hàng tháng.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tháng</TableHead>
                <TableHead className="text-right">Tổng số tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyTotals.map((item) => (
                <TableRow key={item.monthYear}>
                  <TableCell className="font-medium">{item.monthYear}</TableCell>
                  <TableCell className="text-right">{item.total.toLocaleString()} VNĐ</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default MonthlySummary;