import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Budget } from "@/types/budget";
import { format } from "date-fns";
import { showSuccess, showError } from "@/utils/toast";
import { Trash2, Pencil } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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


const formSchema = z.object({
  category: z.string().min(1, "Vui lòng chọn một danh mục."),
  amount: z.preprocess(
    (val) => Number(String(val).replace(/\D/g, '')), // Clean input before parsing
    z.number().positive("Số tiền phải lớn hơn 0."),
  ),
});

interface BudgetSettingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentBudgets: Budget[];
  onSaveBudget: (budget: Budget) => void;
  onDeleteBudget: (category: string, monthYear: string) => void;
  categories: string[];
}

const BudgetSettingDialog: React.FC<BudgetSettingDialogProps> = ({
  isOpen,
  onClose,
  currentBudgets,
  onSaveBudget,
  onDeleteBudget,
  categories,
}) => {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState<string>(format(today, "MM"));
  const [selectedYear, setSelectedYear] = useState<string>(format(today, "yyyy"));
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false); // New state for confirmation
  const [pendingBudget, setPendingBudget] = useState<z.infer<typeof formSchema> | null>(null); // New state for pending budget

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "",
      amount: 0,
    },
  });

  useEffect(() => {
    if (!isOpen) { // Reset when dialog closes
      form.reset({
        category: "",
        amount: 0,
      });
      setSelectedMonth(format(new Date(), "MM"));
      setSelectedYear(format(new Date(), "yyyy"));
      setEditingBudget(null);
      setPendingBudget(null); // Reset pending budget
      setIsConfirmDialogOpen(false); // Close confirmation dialog
    }
  }, [isOpen, form]);

  useEffect(() => {
    if (editingBudget) {
      form.reset({
        category: editingBudget.category,
        amount: editingBudget.amount,
      });
      const [year, month] = editingBudget.monthYear.split('-');
      setSelectedMonth(month);
      setSelectedYear(year);
    } else {
      form.reset({
        category: "",
        amount: 0,
      });
      setSelectedMonth(format(new Date(), "MM"));
      setSelectedYear(format(new Date(), "yyyy"));
    }
  }, [editingBudget, form]);

  const currentMonthYear = `${selectedYear}-${selectedMonth}`;

  const budgetsForSelectedMonth = currentBudgets.filter(
    (budget) => budget.monthYear === currentMonthYear
  );

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setPendingBudget(values);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmSave = () => {
    if (pendingBudget) {
      const newBudget: Budget = {
        category: pendingBudget.category,
        amount: pendingBudget.amount,
        monthYear: currentMonthYear,
      };

      onSaveBudget(newBudget);
      showSuccess(editingBudget ? "Ngân sách đã được cập nhật!" : "Ngân sách đã được thêm!");
      form.reset({ category: "", amount: 0 });
      setEditingBudget(null);
      setPendingBudget(null);
      setIsConfirmDialogOpen(false);
    }
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
  };

  const handleDelete = (category: string, monthYear: string) => {
    onDeleteBudget(category, monthYear);
    showSuccess(`Đã xóa ngân sách cho danh mục "${category}" trong tháng ${format(new Date(monthYear + "-01"), "MM/yyyy")}.`);
  };

  const years = Array.from({ length: 11 }, (_, i) => (today.getFullYear() - 5 + i).toString());
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px] rounded-xl shadow-xl bg-card/80 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-center">
              {editingBudget ? "Chỉnh Sửa Ngân Sách" : `Đặt Ngân Sách cho Tháng ${selectedMonth}/${selectedYear}`}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
              <FormItem className="flex flex-col">
                <FormLabel>Chọn tháng</FormLabel>
                <div className="flex gap-2">
                  <Select value={selectedMonth} onValueChange={setSelectedMonth} disabled={!!editingBudget}>
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
                  <Select value={selectedYear} onValueChange={setSelectedYear} disabled={!!editingBudget}>
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
              </FormItem>
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Danh mục</FormLabel>
                    <Select onValueChange={(value) => {
                      field.onChange(value);
                      const existing = currentBudgets.find(b => b.category === value && b.monthYear === currentMonthYear);
                      form.setValue("amount", existing ? existing.amount : 0);
                    }} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn danh mục" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số tiền ngân sách</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="0"
                        value={field.value === 0 ? "" : field.value.toLocaleString('vi-VN')}
                        onChange={(e) => {
                          const rawValue = e.target.value;
                          const numericValue = rawValue.replace(/\D/g, '');
                          const num = numericValue === "" ? 0 : parseInt(numericValue, 10);
                          field.onChange(num);
                        }}
                        onBlur={(e) => {
                          const rawValue = e.target.value;
                          const numericValue = rawValue.replace(/\D/g, '');
                          const num = numericValue === "" ? 0 : parseInt(numericValue, 10);
                          field.onChange(num);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" className="w-full">
                  {editingBudget ? "Cập Nhật Ngân Sách" : "Lưu Ngân Sách"}
                </Button>
                {editingBudget && (
                  <Button variant="outline" onClick={() => setEditingBudget(null)} className="w-full mt-2">
                    Hủy Chỉnh Sửa
                  </Button>
                )}
              </DialogFooter>
            </form>
          </Form>

          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Ngân Sách Tháng Này:</h3>
            {budgetsForSelectedMonth.length === 0 ? (
              <p className="text-center text-gray-500">Chưa có ngân sách nào được đặt cho tháng này.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Danh mục</TableHead>
                    <TableHead className="text-right">Số tiền</TableHead>
                    <TableHead className="text-center">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgetsForSelectedMonth.map((budget) => (
                    <TableRow key={`${budget.category}-${budget.monthYear}`}>
                      <TableCell className="font-medium">{budget.category}</TableCell>
                      <TableCell className="text-right">{budget.amount.toLocaleString()} VNĐ</TableCell>
                      <TableCell className="text-center flex justify-center space-x-2">
                        <Button variant="outline" size="icon" onClick={() => handleEdit(budget)}>
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
                                Hành động này không thể hoàn tác. Thao tác này sẽ xóa vĩnh viễn ngân sách cho danh mục "{budget.category}" trong tháng {format(new Date(budget.monthYear + "-01"), "MM/yyyy")}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(budget.category, budget.monthYear)}>
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
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận {editingBudget ? "cập nhật" : "thêm"} ngân sách?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn {editingBudget ? "cập nhật" : "thêm"} ngân sách này?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsConfirmDialogOpen(false)}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSave}>Xác nhận</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BudgetSettingDialog;