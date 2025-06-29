import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface CategorySummaryProps {
  categoryTotals: { category: string; total: number }[];
}

const CategorySummary: React.FC<CategorySummaryProps> = ({ categoryTotals }) => {
  return (
    <Card className="w-full max-w-2xl mx-auto mt-8 shadow-lg transition-all duration-300 ease-in-out bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Tổng Chi Tiêu Theo Danh Mục</CardTitle>
      </CardHeader>
      <CardContent>
        {categoryTotals.length === 0 ? (
          <p className="text-center text-gray-500">Không có dữ liệu chi tiêu theo danh mục.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Danh mục</TableHead>
                <TableHead className="text-right">Tổng số tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoryTotals.map((item) => (
                <TableRow key={item.category}>
                  <TableCell className="font-medium">{item.category}</TableCell>
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

export default CategorySummary;