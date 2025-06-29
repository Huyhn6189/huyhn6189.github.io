import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Income } from "@/types/income";
import { format, parseISO } from "date-fns"; // Import parseISO

interface MonthlyIncomeViewProps {
  income: Income[]; // Income already filtered for the selected month
}

const MonthlyIncomeView: React.FC<MonthlyIncomeViewProps> = ({ income }) => {
  const totalMonthlyIncome = income.reduce((sum, inc) => sum + inc.amount, 0);

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8 shadow-lg transition-all duration-300 ease-in-out bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Thu Nhập Tháng Này</CardTitle>
      </CardHeader>
      <CardContent>
        {income.length === 0 ? (
          <p className="text-center text-gray-500">Không có thu nhập nào trong tháng này.</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Nguồn</TableHead>
                  <TableHead className="text-right">Số tiền</TableHead>
                  <TableHead className="text-right">Ngày</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {income.map((inc) => (
                  <TableRow key={inc.id}>
                    <TableCell className="font-medium">{inc.description}</TableCell>
                    <TableCell>{inc.source}</TableCell>
                    <TableCell className="text-right">{inc.amount.toLocaleString()} VNĐ</TableCell>
                    <TableCell className="text-right">{format(parseISO(inc.date), 'dd-MM-yyyy')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 text-right text-lg font-semibold">
              Tổng cộng: {totalMonthlyIncome.toLocaleString()} VNĐ
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MonthlyIncomeView;