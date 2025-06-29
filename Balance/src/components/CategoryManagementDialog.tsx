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
import { showSuccess, showError } from "@/utils/toast";
import { X, Pencil } from "lucide-react";
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
  categoryName: z.string().min(1, "Tên danh mục không được để trống."),
});

interface CategoryManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  onUpdateCategories: (updatedCategories: string[]) => void;
}

interface PendingAction {
  type: 'add' | 'edit' | 'delete';
  categoryName?: string; // For add/edit
  oldCategoryName?: string; // For edit
  categoryToDelete?: string; // For delete
}

const CategoryManagementDialog: React.FC<CategoryManagementDialogProps> = ({
  isOpen,
  onClose,
  categories,
  onUpdateCategories,
}) => {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryName: "",
    },
  });

  useEffect(() => {
    if (!isOpen) {
      // Reset form and editing state when dialog closes
      form.reset({ categoryName: "" });
      setEditingCategory(null);
      setPendingAction(null);
      setIsConfirmDialogOpen(false);
    }
  }, [isOpen, form]);

  useEffect(() => {
    if (editingCategory) {
      form.setValue("categoryName", editingCategory);
    } else {
      form.reset({ categoryName: "" });
    }
  }, [editingCategory, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const newCategoryName = values.categoryName.trim();

    if (editingCategory) {
      // Editing existing category
      if (newCategoryName === editingCategory) {
        showError("Tên danh mục không thay đổi.");
        return;
      }
      if (categories.some(cat => cat === newCategoryName && cat !== editingCategory)) {
        showError("Danh mục này đã tồn tại.");
        return;
      }
      setPendingAction({ type: 'edit', categoryName: newCategoryName, oldCategoryName: editingCategory });
    } else {
      // Adding new category
      if (categories.includes(newCategoryName)) {
        showError("Danh mục này đã tồn tại.");
        return;
      }
      setPendingAction({ type: 'add', categoryName: newCategoryName });
    }
    setIsConfirmDialogOpen(true);
  };

  const handleDeleteCategory = (categoryToDelete: string) => {
    if (categories.length <= 1) {
      showError("Không thể xóa danh mục cuối cùng.");
      return;
    }
    setPendingAction({ type: 'delete', categoryToDelete: categoryToDelete });
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmAction = () => {
    if (!pendingAction) return;

    switch (pendingAction.type) {
      case 'add':
        if (pendingAction.categoryName) {
          onUpdateCategories([...categories, pendingAction.categoryName]);
          showSuccess(`Đã thêm danh mục "${pendingAction.categoryName}".`);
        }
        break;
      case 'edit':
        if (pendingAction.oldCategoryName && pendingAction.categoryName) {
          const updatedCategories = categories.map((cat) =>
            cat === pendingAction.oldCategoryName ? pendingAction.categoryName : cat
          );
          onUpdateCategories(updatedCategories);
          showSuccess(`Đã cập nhật danh mục "${pendingAction.oldCategoryName}" thành "${pendingAction.categoryName}".`);
        }
        break;
      case 'delete':
        if (pendingAction.categoryToDelete) {
          onUpdateCategories(categories.filter((cat) => cat !== pendingAction.categoryToDelete));
          showSuccess(`Đã xóa danh mục "${pendingAction.categoryToDelete}".`);
        }
        break;
    }
    form.reset();
    setEditingCategory(null);
    setPendingAction(null);
    setIsConfirmDialogOpen(false);
  };

  const handleCancelConfirm = () => {
    setIsConfirmDialogOpen(false);
    setPendingAction(null);
    // If it was an edit, reset the form to the original editing category
    if (pendingAction?.type === 'edit' && pendingAction.oldCategoryName) {
      form.setValue("categoryName", pendingAction.oldCategoryName);
    } else {
      form.reset({ categoryName: "" });
    }
  };

  const handleEditClick = (category: string) => {
    setEditingCategory(category);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    form.reset({ categoryName: "" });
  };

  const getAlertDialogContent = () => {
    if (!pendingAction) return { title: "", description: "" };

    switch (pendingAction.type) {
      case 'add':
        return {
          title: "Xác nhận thêm danh mục?",
          description: `Bạn có chắc chắn muốn thêm danh mục "${pendingAction.categoryName}"?`,
        };
      case 'edit':
        return {
          title: "Xác nhận cập nhật danh mục?",
          description: `Bạn có chắc chắn muốn đổi tên danh mục "${pendingAction.oldCategoryName}" thành "${pendingAction.categoryName}"?`,
        };
      case 'delete':
        return {
          title: "Xác nhận xóa danh mục?",
          description: `Hành động này không thể hoàn tác. Thao tác này sẽ xóa vĩnh viễn danh mục "${pendingAction.categoryToDelete}".`,
        };
      default:
        return { title: "", description: "" };
    }
  };

  const { title, description } = getAlertDialogContent();

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px] rounded-xl shadow-xl bg-card/80 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-center">Quản Lý Danh Mục</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="categoryName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}</FormLabel>
                    <FormControl>
                      <Input placeholder="Ví dụ: Sức khỏe, Giáo dục" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                {editingCategory ? "Cập Nhật Danh Mục" : "Thêm Danh Mục"}
              </Button>
              {editingCategory && (
                <Button variant="outline" onClick={handleCancelEdit} className="w-full mt-2">
                  Hủy Chỉnh Sửa
                </Button>
              )}
            </form>
          </Form>

          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Các Danh Mục Hiện Có:</h3>
            <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {categories.map((category) => (
                <li key={category} className="flex items-center justify-between p-2 border rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                  <span>{category}</span>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(category)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCategory(category)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose} className="w-full">Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelConfirm}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>Xác nhận</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CategoryManagementDialog;