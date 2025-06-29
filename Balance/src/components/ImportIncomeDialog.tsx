import React from "react";
import { useForm } from "react-hook-form";
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
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Papa from "papaparse";
import { Income } from "@/types/income";
import { v4 as uuidv4 } from 'uuid';
import { showSuccess, showError } from "@/utils/toast";

const formSchema = z.object({
  file: z.any()
    .refine((file) => file?.length > 0, "Vui lòng chọn một tệp.")
    .refine((file) => file?.[0]?.type === "text/csv", "Chỉ chấp nhận tệp CSV."),
});

interface ImportIncomeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImportIncome: (newIncome: Omit<Income, "id">[]) => void;
}

const ImportIncomeDialog: React.FC<ImportIncomeDialogProps> = ({
  isOpen,
  onClose,
  onImportIncome,
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const file = values.file[0];

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          showError("Lỗi khi phân tích cú pháp tệp CSV: " + results.errors[0].message);
          return;
        }

        const importedIncome: Omit<Income, "id">[] = [];
        let hasError = false;

        for (const row of results.data) {
          const incomeRow = row as Record<string, string>;
          const amount = parseFloat(incomeRow.amount);

          if (
            !incomeRow.description ||
            isNaN(amount) ||
            amount <= 0 ||
            !incomeRow.date ||
            !incomeRow.source
          ) {
            showError(`Dữ liệu không hợp lệ trong hàng: ${JSON.stringify(row)}. Bỏ qua hàng này.`);
            hasError = true;
            continue;
          }

          importedIncome.push({
            description: incomeRow.description,
            amount: amount,
            date: incomeRow.date,
            source: incomeRow.source,
          });
        }

        if (importedIncome.length > 0) {
          onImportIncome(importedIncome);
          showSuccess(`Đã nhập thành công ${importedIncome.length} khoản thu nhập.`);
          onClose();
        } else if (!hasError) {
          showError("Không tìm thấy dữ liệu thu nhập hợp lệ nào trong tệp.");
        }
      },
      error: (error) => {
        showError("Lỗi khi đọc tệp: " + error.message);
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-xl shadow-xl bg-card/80 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-center">Nhập Thu Nhập từ CSV</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="file"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Chọn tệp CSV</FormLabel>
                  <FormControl>
                    <Input
                      {...fieldProps}
                      type="file"
                      accept=".csv"
                      onChange={(event) => onChange(event.target.files)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" className="w-full">Nhập Dữ Liệu</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ImportIncomeDialog;