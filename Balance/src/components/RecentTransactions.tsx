import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Expense } from "@/types/expense";
import { Income } from "@/types/income";
import { format, parseISO } from "date-fns";

interface RecentTransactionsProps {
  expenses: Expense[];
  income: Income[];
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ expenses, income }) => {
  // Combine expenses and income, adding a 'type' property
  const combinedTransactions = [
    ...expenses.map(exp => ({ ...exp, type: 'expense' as const })),
    ...income.map(inc => ({ ...inc, type: 'income' as const })),
  ];

  // Sort by date in descending order (most recent first)
  combinedTransactions.sort((a, b) => {
    const dateA = parseISO(a.date);
    const dateB = parseISO(b.date);
    return dateB.getTime() - dateA.getTime();
  });

  // Take the latest 5 transactions
  const recentTransactions = combinedTransactions.slice(0, 5);

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8 shadow-lg transition-all duration-300 ease-in-out bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Giao Dịch Gần Đây</CardTitle>
      </CardHeader>
      <CardContent>
        {recentTransactions.length === 0 ? (
          <p className="text-center text-gray-500">Không có giao dịch gần đây nào.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loại</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead className="text-right">Số tiền</TableHead>
                <TableHead className="text-right">Ngày</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.map((transaction) => (
                <TableRow key={transaction.id} className={transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'}>
                  <TableCell className="font-medium">
                    {transaction.type === 'expense' ? 'Chi tiêu' : 'Thu nhập'}
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell className="text-right">{transaction.amount.toLocaleString()} VNĐ</TableCell>
                  <TableCell className="text-right">{format(parseISO(transaction.date), 'dd-MM-yyyy')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;