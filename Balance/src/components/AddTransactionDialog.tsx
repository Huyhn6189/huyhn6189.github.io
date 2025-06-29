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
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Expense } from "@/types/expense";
import { Income } from "@/types/income";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface AddTransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (expense: Omit<Expense, "id">) => void;
  onAddIncome: (newIncome: Omit<Income, "id">) => void;
  categories: string[];
}

const expenseFormSchema = z.object({
  description: z.string().min(1, "Mô tả không được để trống."),
  amount: z.preprocess(
    (val) => Number(String(val).replace(/\D/g, '')),
    z.number().positive("Số tiền phải lớn hơn 0."),
  ),
  date: z.date({
    required_error: "Ngày không được để trống.",
  }),
  category: z.string().min(1, "Danh mục không được để trống."),
});

const incomeFormSchema = z.object({
  description: z.string().min(1, "Mô tả không được để trống."),
  amount: z.preprocess(
    (val) => Number(String(val).replace(/\D/g, '')),
    z.number().positive("Số tiền phải lớn hơn 0."),
  ),
  date: z.date({
    required_error: "Ngày không được để trống.",
  }),
  source: z.string().min(1, "Nguồn thu nhập không được để trống."),
});

const AddTransactionDialog: React.FC<AddTransactionDialogProps> = ({
  isOpen,
  onClose,
  onAddExpense,
  onAddIncome,
  categories,
}) => {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [pendingExpense, setPendingExpense] = useState<z.infer<typeof expenseFormSchema> | null>(null);
  const [pendingIncome, setPendingIncome] = useState<z.infer<typeof incomeFormSchema> | null>(null);
  const [currentTab, setCurrentTab] = useState<"expense" | "income">("expense");

  const expenseForm = useForm<z.infer<typeof expenseFormSchema>>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      description: "",
      amount: 0,
      date: new Date(),
      category: categories[0] || "",
    },
  });

  const incomeForm = useForm<z.infer<typeof incomeFormSchema>>({
    resolver: zodResolver(incomeFormSchema),
    defaultValues: {
      description: "",
      amount: 0,
      date: new Date(),
      source: "",
    },
  });

  useEffect(() => {
    if (!isOpen) {
      expenseForm.reset({ description: "", amount: 0, date: new Date(), category: categories[0] || "" });
      incomeForm.reset({ description: "", amount: 0, date: new Date(), source: "" });
      setPendingExpense(null);
      setPendingIncome(null);
      setIsConfirmDialogOpen(false);
    }
  }, [isOpen, expenseForm, incomeForm, categories]);

  const onExpenseSubmit = (values: z.infer<typeof expenseFormSchema>) => {
    setPendingExpense(values);
    setCurrentTab("expense"); // Ensure the correct tab is set for confirmation message
    setIsConfirmDialogOpen(true);
  };

  const onIncomeSubmit = (values: z.infer<typeof incomeFormSchema>) => {
    setPendingIncome(values);
    setCurrentTab("income"); // Ensure the correct tab is set for confirmation message
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmAdd = () => {
    if (currentTab === "expense" && pendingExpense) {
      onAddExpense({
        description: pendingExpense.description,
        amount: pendingExpense.amount,
        date: format(pendingExpense.date, "yyyy-MM-dd"),
        category: pendingExpense.category,
      });
      showSuccess("Chi tiêu đã được thêm thành công!");
    } else if (currentTab === "income" && pendingIncome) {
      onAddIncome({
        description: pendingIncome.description,
        amount: pendingIncome.amount,
        date: format(pendingIncome.date, "yyyy-MM-dd"),
        source: pendingIncome.source,
      });
      showSuccess("Thu nhập đã được thêm thành công!");
    }
    setIsConfirmDialogOpen(false);
    onClose();
  };

  const formatAmountInput = (value: number) => {
    return value === 0 ? "" : value.toLocaleString('vi-VN');
  };

  const parseAmountInput = (rawValue: string) => {
    const numericValue = rawValue.replace(/\D/g, '');
    return numericValue === "" ? 0 : parseInt(numericValue, 10);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px] rounded-xl shadow-xl bg-card/80 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-center">Thêm Giao Dịch Mới</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="expense" className="w-full" onValueChange={(value) => setCurrentTab(value as "expense" | "income")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="expense">Chi Tiêu</TabsTrigger>
              <TabsTrigger value="income">Thu Nhập</TabsTrigger>
            </TabsList>
            <TabsContent value="expense">
              <Form {...expenseForm}>
                <form onSubmit={expenseForm.handleSubmit(onExpenseSubmit)} className="grid gap-4 py-4">
                  <FormField
                    control={expenseForm.control}
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
                    control={expenseForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số tiền</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="0"
                            value={formatAmountInput(field.value)}
                            onChange={(e) => field.onChange(parseAmountInput(e.target.value))}
                            onBlur={(e) => field.onChange(parseAmountInput(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={expenseForm.control}
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
                    control={expenseForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Danh mục</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
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
                    <Button type="submit" className="w-full">Thêm Chi Tiêu</Button>
                  </DialogFooter>
                </form>
              </Form>
            </TabsContent>
            <TabsContent value="income">
              <Form {...incomeForm}>
                <form onSubmit={incomeForm.handleSubmit(onIncomeSubmit)} className="grid gap-4 py-4">
                  <FormField
                    control={incomeForm.control}
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
                    control={incomeForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số tiền</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="0"
                            value={formatAmountInput(field.value)}
                            onChange={(e) => field.onChange(parseAmountInput(e.target.value))}
                            onBlur={(e) => field.onChange(parseAmountInput(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={incomeForm.control}
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
                    control={incomeForm.control}
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
                    <Button type="submit" className="w-full">Thêm Thu Nhập</Button>
                  </DialogFooter>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận thêm giao dịch?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn thêm giao dịch {currentTab === "expense" ? "chi tiêu" : "thu nhập"} này?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsConfirmDialogOpen(false)}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAdd}>Xác nhận</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AddTransactionDialog;