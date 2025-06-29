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
import { Budget } from "@/types/budget";
import { importBudgetsFromCsv } from "@/utils/fileUtils"; // Import the utility function

const formSchema = z.object({
  file: z.any()
    .refine((file) => file?.length > 0, "Vui lòng chọn một tệp.")
    .refine((file) => file?.[0]?.type === "text/csv", "Chỉ chấp nhận tệp CSV."),
});

interface ImportBudgetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImportBudgets: (newBudgets: Budget[]) => void;
}

const ImportBudgetDialog: React.FC<ImportBudgetDialogProps> = ({
  isOpen,
  onClose,
  onImportBudgets,
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const file = values.file[0];
    importBudgetsFromCsv(file, (budgets) => {
      onImportBudgets(budgets);
      onClose();
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-xl shadow-xl bg-card/80 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-center">Nhập Ngân Sách từ CSV</DialogTitle>
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

export default ImportBudgetDialog;