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
import { format, parse } from "date-fns"; // Import parse
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Income } from "@/types/income";
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
  source: z.string().min(1, "Nguồn thu nhập không được để trống."),
});

interface EditIncomeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  income: Income | null;
  onUpdateIncome: (updatedIncome: Income) => void;
}

const EditIncomeDialog: React.FC<EditIncomeDialogProps> = ({
  isOpen,
  onClose,
  income,
  onUpdateIncome,
}) => {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<z.infer<typeof formSchema> | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: 0,
      date: new Date(),
      source: "",
    },
  });

  useEffect(() => {
    if (income) {
      form.reset({
        description: income.description,
        amount: income.amount,
        date: parse(income.date, 'yyyy-MM-dd', new Date()), // Use parse for consistent local date
        source: income.source,
      });
    }
  }, [income, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setPendingUpdate(values);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmUpdate = () => {
    if (income && pendingUpdate) {
      onUpdateIncome({
        ...income,
        description: pendingUpdate.description,
        amount: pendingUpdate.amount,
        date: format(pendingUpdate.date, "yyyy-MM-dd"),
        source: pendingUpdate.source,
      });
      showSuccess("Thu nhập đã được cập nhật thành công!");
      setIsConfirmDialogOpen(false);
      onClose();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px] rounded-xl shadow-xl bg-card/80 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-center">Chỉnh Sửa Thu Nhập</DialogTitle>
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
                      <Input placeholder="Ví dụ: Lương tháng, Tiền thưởng..." {...field} />
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
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nguồn thu nhập</FormLabel>
                    <FormControl>
                      <Input placeholder="Ví dụ: Lương, Freelance, Quà tặng" {...field} />
                    </FormControl>
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
              Bạn có chắc chắn muốn lưu các thay đổi này cho khoản thu nhập?
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

export default EditIncomeDialog;