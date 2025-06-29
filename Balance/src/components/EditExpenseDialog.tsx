import React, { useEffect, useState } from "react";
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Expense } from "@/types/expense";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { showSuccess } from "@/utils/toast";

const formSchema = z.object({
  description: z.string().min(1, "Mô tả không được để trống."),
  amount: z.preprocess(
    (val) => Number(String(val).replace(/\D/g, '')), // Clean input before parsing
    z.number().positive("Số tiền phải lớn hơn 0."),
  ),
  date: z.date({
    required_error: "Ngày không được để trống.",
  }),
  category: z.string().min(1, "Danh mục không được để trống."),
});

interface EditExpenseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
  onUpdateExpense: (updatedExpense: Expense) => void;
  categories: string[]; // Add categories prop
}

const EditExpenseDialog: React.FC<EditExpenseDialogProps> = ({
  isOpen,
  onClose,
  expense,
  onUpdateExpense,
  categories,
}) => {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<z.infer<typeof formSchema> | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: 0,
      date: new Date(),
      category: "",
    },
  });

  useEffect(() => {
    if (expense) {
      form.reset({
        description: expense.description,
        amount: expense.amount,
        date: parse(expense.date, 'yyyy-MM-dd', new Date()), // Use parse for consistent local date
        category: expense.category,
      });
    }
  }, [expense, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setPendingUpdate(values);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmUpdate = () => {
    if (expense && pendingUpdate) {
      onUpdateExpense({
        ...expense,
        description: pendingUpdate.description,
        amount: pendingUpdate.amount,
        date: format(pendingUpdate.date, "yyyy-MM-dd"),
        category: pendingUpdate.category,
      });
      showSuccess("Chi tiêu đã được cập nhật thành công!");
      setIsConfirmDialogOpen(false);
      onClose();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px] rounded-xl shadow-xl bg-card/80 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-center">Chỉnh Sửa Chi Tiêu</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Input placeholder="Ví dụ: Mua sắm, Ăn uống..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số tiền</FormLabel>
                    <FormControl>
                      <Input
                        type="text" // Changed to text to allow custom formatting
                        placeholder="0"
                        value={field.value === 0 ? "" : field.value.toLocaleString('vi-VN')} // Format for display
                        onChange={(e) => {
                          const rawValue = e.target.value;
                          const numericValue = rawValue.replace(/\D/g, ''); // Remove all non-digits
                          const num = numericValue === "" ? 0 : parseInt(numericValue, 10);
                          field.onChange(num); // Update form state with the number
                        }}
                        onBlur={(e) => {
                          // On blur, ensure the value is correctly formatted even if user types non-numeric chars
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
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Ngày</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd-MM-yyyy")
                            ) : (
                              <span>Chọn ngày</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Danh mục</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}> {/* Use value prop */}
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
              <DialogFooter>
                <Button type="submit" className="w-full">Lưu Thay Đổi</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận thay đổi?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn lưu các thay đổi này cho khoản chi tiêu?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsConfirmDialogOpen(false)}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmUpdate}>Xác nhận</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EditExpenseDialog;