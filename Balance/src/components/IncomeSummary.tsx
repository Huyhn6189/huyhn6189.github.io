import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Income } from "@/types/income";
import { format, parse } from "date-fns";

interface IncomeSummaryProps {
  income: Income[];
}

const IncomeSummary: React.FC<IncomeSummaryProps> = ({ income }) => {
  const monthlyTotalsMap = new Map<string, number>();

  income.forEach((inc) => {
    const incomeDate = parse(inc.date, 'yyyy-MM-dd', new Date());
    const monthYear = format(incomeDate, "MM/yyyy");
    const currentAmount = monthlyTotalsMap.get(monthYear) || 0;
    monthlyTotalsMap.set(monthYear, currentAmount + inc.amount);
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
        <CardTitle className="text-2xl font-bold text-center">Tổng Thu Nhập Hàng Tháng</CardTitle>
      </CardHeader>
      <CardContent>
        {monthlyTotals.length === 0 ? (
          <p className="text-center text-gray-500">Không có dữ liệu thu nhập hàng tháng.</p>
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

export default IncomeSummary;