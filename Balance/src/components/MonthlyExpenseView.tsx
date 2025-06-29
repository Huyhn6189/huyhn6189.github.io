import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Expense } from "@/types/expense";
import { format, parseISO } from "date-fns"; // Import parseISO

interface MonthlyExpenseViewProps {
  expenses: Expense[]; // Expenses already filtered for the selected month
}

const MonthlyExpenseView: React.FC<MonthlyExpenseViewProps> = ({ expenses }) => {
  const totalMonthlyExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8 shadow-lg transition-all duration-300 ease-in-out bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Chi Tiêu Tháng Này</CardTitle>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <p className="text-center text-gray-500">Không có chi tiêu nào trong tháng này.</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead className="text-right">Số tiền</TableHead>
                  <TableHead className="text-right">Ngày</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">{expense.description}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell className="text-right">{expense.amount.toLocaleString()} VNĐ</TableCell>
                    <TableCell className="text-right">{format(parseISO(expense.date), 'dd-MM-yyyy')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 text-right text-lg font-semibold">
              Tổng cộng: {totalMonthlyExpenses.toLocaleString()} VNĐ
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MonthlyExpenseView;