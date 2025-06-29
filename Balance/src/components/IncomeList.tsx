import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil, ArrowUpDown, CalendarIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Income } from "@/types/income";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parse, parseISO } from "date-fns"; // Import parseISO
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface IncomeListProps {
  income: Income[]; // Now expects the full list
  onDeleteIncome: (id: string) => void;
  onEditIncome: (income: Income) => void;
  incomeSources: string[]; // Still needed for source filter dropdown
}

type SortColumn = keyof Income | null;
type SortDirection = 'asc' | 'desc';

const IncomeList: React.FC<IncomeListProps> = ({
  income,
  onDeleteIncome,
  onEditIncome,
  incomeSources,
}) => {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState<string>(format(today, "MM"));
  const [selectedYear, setSelectedYear] = useState<string>(format(today, "yyyy"));
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedSource, setSelectedSource] = useState<string>("Tất cả");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const years = Array.from({ length: 11 }, (_, i) => (today.getFullYear() - 5 + i).toString());
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));

  const handleSort = (column: keyof Income) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const filteredIncome = income.filter((inc) => {
    const incomeDate = parse(inc.date, 'yyyy-MM-dd', new Date());
    
    let dateFilterPass = true;

    // If startDate or endDate are set, prioritize date range filter
    if (startDate || endDate) {
      dateFilterPass = (!startDate || incomeDate >= startDate) && (!endDate || incomeDate <= endDate);
    } else {
      // Otherwise, use month/year filter
      const incomeMonthYear = format(incomeDate, "yyyy-MM");
      const selectedMonthYear = `${selectedYear}-${selectedMonth}`;
      dateFilterPass = incomeMonthYear === selectedMonthYear;
    }

    const isSourceFiltered = selectedSource === "Tất cả" || inc.source === selectedSource;
    const isSearchFiltered = inc.description.toLowerCase().includes(searchTerm.toLowerCase());

    return dateFilterPass && isSourceFiltered && isSearchFiltered;
  });

  const totalIncome = filteredIncome.reduce((sum, inc) => sum + inc.amount, 0);

  const sortedIncome = [...filteredIncome].sort((a, b) => {
    if (!sortColumn) return 0;

    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    let comparison = 0;
    if (sortColumn === 'amount') {
      comparison = (aValue as number) - (bValue as number);
    } else if (sortColumn === 'date') {
      comparison = parse(aValue as string, 'yyyy-MM-dd', new Date()).getTime() - parse(bValue as string, 'yyyy-MM-dd', new Date()).getTime();
    } else {
      comparison = String(aValue).localeCompare(String(bValue));
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const renderSortIcon = (column: keyof Income) => {
    if (sortColumn === column) {
      return sortDirection === 'asc' ? <ArrowUpDown className="ml-2 h-4 w-4 rotate-180" /> : <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return <ArrowUpDown className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />;
  };

  const hasActiveFilters = startDate || endDate || selectedSource !== "Tất cả" || searchTerm !== "" || selectedMonth !== format(today, "MM") || selectedYear !== format(today, "yyyy");

  const onClearFilters = () => {
    setSelectedMonth(format(today, "MM"));
    setSelectedYear(format(today, "yyyy"));
    setStartDate(undefined);
    setEndDate(undefined);
    setSelectedSource("Tất cả");
    setSearchTerm("");
  };

  return (
    <Card className="w-full bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Danh Sách Thu Nhập</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters Section */}
        <div className="flex flex-wrap justify-center gap-4 mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-inner transition-all duration-300">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Label htmlFor="month-select">Tháng:</Label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full">
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
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Label htmlFor="year-select">Năm:</Label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-full">
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
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Label htmlFor="startDate">Từ ngày:</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "dd-MM-yyyy") : <span>Chọn ngày</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Label htmlFor="endDate">Đến ngày:</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "dd-MM-yyyy") : <span>Chọn ngày</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Label htmlFor="sourceFilter">Nguồn:</Label>
            <Select onValueChange={setSelectedSource} value={selectedSource}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn nguồn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tất cả">Tất cả</SelectItem>
                {incomeSources.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Label htmlFor="search">Tìm kiếm:</Label>
            <Input
              id="search"
              type="text"
              placeholder="Tìm theo mô tả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          {hasActiveFilters && (
            <Button variant="outline" onClick={onClearFilters} className="w-full sm:w-auto">
              Xóa bộ lọc
            </Button>
          )}
        </div>

        {filteredIncome.length === 0 ? (
          <p className="text-center text-gray-500">Chưa có thu nhập nào được thêm.</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group" onClick={() => handleSort('description')}>
                    <div className="flex items-center">Mô tả{renderSortIcon('description')}</div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group" onClick={() => handleSort('source')}>
                    <div className="flex items-center">Nguồn{renderSortIcon('source')}</div>
                  </TableHead>
                  <TableHead className="text-right cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group" onClick={() => handleSort('amount')}>
                    <div className="flex items-center justify-end">Số tiền{renderSortIcon('amount')}</div>
                  </TableHead>
                  <TableHead className="text-right cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group" onClick={() => handleSort('date')}>
                    <div className="flex items-center justify-end">Ngày{renderSortIcon('date')}</div>
                  </TableHead>
                  <TableHead className="text-center">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedIncome.map((inc) => (
                  <TableRow key={inc.id}>
                    <TableCell className="font-medium">{inc.description}</TableCell>
                    <TableCell>{inc.source}</TableCell>
                    <TableCell className="text-right">{inc.amount.toLocaleString()} VNĐ</TableCell>
                    <TableCell className="text-right">{format(parseISO(inc.date), 'dd-MM-yyyy')}</TableCell>
                    <TableCell className="text-center flex justify-center space-x-2">
                      <Button variant="outline" size="icon" onClick={() => onEditIncome(inc)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Hành động này không thể hoàn tác. Thao tác này sẽ xóa vĩnh viễn khoản thu nhập "{inc.description}" khỏi danh sách của bạn.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDeleteIncome(inc.id)}>
                              Xóa
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 text-right text-lg font-semibold">
              Tổng cộng: {totalIncome.toLocaleString()} VNĐ
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default IncomeList;