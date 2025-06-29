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
import { UserProfile } from "@/hooks/useFinancialData";
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
import { showSuccess, showError } from "@/utils/toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase"; // Import supabase for password change

const profileFormSchema = z.object({
  first_name: z.string().max(50, "Tên không được quá 50 ký tự.").nullable(),
  last_name: z.string().max(50, "Họ không được quá 50 ký tự.").nullable(),
});

const passwordFormSchema = z.object({
  newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự."),
  confirmPassword: z.string().min(6, "Xác nhận mật khẩu phải có ít nhất 6 ký tự."),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp.",
  path: ["confirmPassword"],
});

interface ProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  onUpdateProfile: (updatedProfile: Omit<UserProfile, 'id'>) => Promise<UserProfile | null>;
}

const ProfileDialog: React.FC<ProfileDialogProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
}) => {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [pendingProfileUpdate, setPendingProfileUpdate] = useState<z.infer<typeof profileFormSchema> | null>(null);
  const [pendingPasswordUpdate, setPendingPasswordUpdate] = useState<z.infer<typeof passwordFormSchema> | null>(null);
  const [currentTab, setCurrentTab] = useState<"profile" | "password">("profile");
  const [loadingPasswordChange, setLoadingPasswordChange] = useState(false);

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (profile) {
      profileForm.reset({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
      });
    } else {
      profileForm.reset({
        first_name: "",
        last_name: "",
      });
    }
    // Reset password form whenever dialog opens/closes or profile changes
    passwordForm.reset({ newPassword: "", confirmPassword: "" });
    setPendingProfileUpdate(null);
    setPendingPasswordUpdate(null);
    setIsConfirmDialogOpen(false);
    setCurrentTab("profile"); // Default to profile tab on open
  }, [isOpen, profile, profileForm, passwordForm]);

  const onProfileSubmit = (values: z.infer<typeof profileFormSchema>) => {
    setPendingProfileUpdate(values);
    setPendingPasswordUpdate(null); // Clear any pending password update
    setCurrentTab("profile");
    setIsConfirmDialogOpen(true);
  };

  const onPasswordSubmit = (values: z.infer<typeof passwordFormSchema>) => {
    setPendingPasswordUpdate(values);
    setPendingProfileUpdate(null); // Clear any pending profile update
    setCurrentTab("password");
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (currentTab === "profile" && pendingProfileUpdate) {
      await onUpdateProfile({
        first_name: pendingProfileUpdate.first_name,
        last_name: pendingProfileUpdate.last_name,
      });
      showSuccess("Hồ sơ đã được cập nhật thành công!");
      setIsConfirmDialogOpen(false);
      onClose();
    } else if (currentTab === "password" && pendingPasswordUpdate) {
      setLoadingPasswordChange(true);
      try {
        const { error } = await supabase.auth.updateUser({
          password: pendingPasswordUpdate.newPassword,
        });

        if (error) {
          showError("Lỗi khi đổi mật khẩu: " + error.message);
        } else {
          showSuccess("Mật khẩu đã được đổi thành công!");
          passwordForm.reset(); // Clear password fields
          setIsConfirmDialogOpen(false);
          onClose();
        }
      } catch (err: any) {
        showError("Đã xảy ra lỗi không mong muốn: " + err.message);
      } finally {
        setLoadingPasswordChange(false);
      }
    }
  };

  const getAlertDialogContent = () => {
    if (currentTab === "profile" && pendingProfileUpdate) {
      return {
        title: "Xác nhận thay đổi hồ sơ?",
        description: "Bạn có chắc chắn muốn lưu các thay đổi này cho hồ sơ của mình?",
      };
    } else if (currentTab === "password" && pendingPasswordUpdate) {
      return {
        title: "Xác nhận đổi mật khẩu?",
        description: "Bạn có chắc chắn muốn đổi mật khẩu của mình?",
      };
    }
    return { title: "", description: "" };
  };

  const { title, description } = getAlertDialogContent();

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px] rounded-xl shadow-xl bg-card/80 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-center">Quản Lý Hồ Sơ</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="profile" className="w-full" onValueChange={(value) => setCurrentTab(value as "profile" | "password")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
              <TabsTrigger value="password">Đổi mật khẩu</TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="grid gap-4 py-4">
                  <FormField
                    control={profileForm.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên</FormLabel>
                        <FormControl>
                          <Input placeholder="Ví dụ: Nguyễn" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Họ</FormLabel>
                        <FormControl>
                          <Input placeholder="Ví dụ: Văn A" {...field} value={field.value || ""} />
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
            </TabsContent>
            <TabsContent value="password">
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="grid gap-4 py-4">
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mật khẩu mới</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Nhập mật khẩu mới" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Xác nhận mật khẩu mới" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" className="w-full" disabled={loadingPasswordChange}>
                      {loadingPasswordChange ? "Đang đổi mật khẩu..." : "Đổi Mật Khẩu"}
                    </Button>
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
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsConfirmDialogOpen(false)}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>Xác nhận</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProfileDialog;