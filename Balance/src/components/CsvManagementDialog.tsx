import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface CsvManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenImportExpenses: () => void;
  onOpenImportIncome: () => void;
  onOpenImportBudgets: () => void;
  onExportExpenses: () => void;
  onExportIncome: () => void;
  onExportBudgets: () => void;
  onImportCombinedData: (file: File) => void; // New prop for combined import
  onExportCombinedData: () => void; // New prop for combined export
}

const CsvManagementDialog: React.FC<CsvManagementDialogProps> = ({
  isOpen,
  onClose,
  onOpenImportExpenses,
  onOpenImportIncome,
  onOpenImportBudgets,
  onExportExpenses,
  onExportIncome,
  onExportBudgets,
  onImportCombinedData,
  onExportCombinedData,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImportAllClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onImportCombinedData(event.target.files[0]);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-xl shadow-xl bg-card/80 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-center">Quản Lý Nhập/Xuất CSV</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <h3 className="text-lg font-semibold text-center">Nhập Dữ Liệu</h3>
          <Button variant="outline" onClick={() => { onOpenImportExpenses(); onClose(); }} className="w-full">
            Nhập Chi Tiêu CSV (riêng lẻ)
          </Button>
          <Button variant="outline" onClick={() => { onOpenImportIncome(); onClose(); }} className="w-full">
            Nhập Thu Nhập CSV (riêng lẻ)
          </Button>
          <Button variant="outline" onClick={() => { onOpenImportBudgets(); onClose(); }} className="w-full">
            Nhập Ngân Sách CSV (riêng lẻ)
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            className="hidden"
          />
          <Button variant="default" onClick={handleImportAllClick} className="w-full mt-2">
            Nhập Tất Cả Dữ Liệu
          </Button>

          <Separator className="my-4" />

          <h3 className="text-lg font-semibold text-center">Xuất Dữ Liệu</h3>
          <Button variant="outline" onClick={() => { onExportExpenses(); onClose(); }} className="w-full">
            Xuất Chi Tiêu CSV (riêng lẻ)
          </Button>
          <Button variant="outline" onClick={() => { onExportIncome(); onClose(); }} className="w-full">
            Xuất Thu Nhập CSV (riêng lẻ)
          </Button>
          <Button variant="outline" onClick={() => { onExportBudgets(); onClose(); }} className="w-full">
            Xuất Ngân Sách CSV (riêng lẻ)
          </Button>
          <Button variant="default" onClick={() => { onExportCombinedData(); onClose(); }} className="w-full mt-2">
            Xuất Tất Cả Dữ Liệu
          </Button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="w-full">Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CsvManagementDialog;