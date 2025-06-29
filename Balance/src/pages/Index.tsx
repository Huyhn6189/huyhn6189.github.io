import React, { useState, useEffect } from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import ExpenseList from "@/components/ExpenseList";
import EditExpenseDialog from "@/components/EditExpenseDialog";
import ImportExpensesDialog from "@/components/ImportExpensesDialog";
import BudgetSettingDialog from "@/components/BudgetSettingDialog";
import CategoryManagementDialog from "@/components/CategoryManagementDialog";
import SummaryAndChartsSection from "@/components/SummaryAndChartsSection";
import MonthlySummary from "@/components/MonthlySummary";
import CurrentBalanceCard from "@/components/CurrentBalanceCard";
import IncomeSummary from "@/components/IncomeSummary";
import IncomeList from "@/components/IncomeList";
import EditIncomeDialog from "@/components/EditIncomeDialog";
import ImportIncomeDialog from "@/components/ImportIncomeDialog";
import ImportBudgetDialog from "@/components/ImportBudgetDialog";
import CsvManagementDialog from "@/components/CsvManagementDialog";
import AddTransactionDialog from "@/components/AddTransactionDialog";
import NetBalanceChart from "@/components/NetBalanceChart";
import MonthlyFinancialOverview from "@/components/MonthlyFinancialOverview";
import RecentTransactions from "@/components/RecentTransactions";
import IncomeExpenseChart from "@/components/IncomeExpenseChart";
// import ChangePasswordDialog from "@/components/ChangePasswordDialog"; // Removed
import ProfileDialog from "@/components/ProfileDialog"; // Import ProfileDialog
import { Expense } from "@/types/expense";
import { Income } from "@/types/income";
import { useFinancialData } from "@/hooks/useFinancialData";
import { Button } from "@/components/ui/button";
import { parseISO, format } from "date-fns";
import ThemeToggle from "@/components/ThemeToggle";
import {
  exportExpensesToCsv,
  exportIncomeToCsv,
  exportBudgetsToCsv,
  exportCombinedFinancialDataToCsv,
  importCombinedFinancialDataFromCsv
} from "@/utils/fileUtils";
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
import { FileText, PlusCircle, Wallet, Tag, KeyRound, User as UserIcon } from "lucide-react"; // Import UserIcon
import { User } from '@supabase/supabase-js'; // Import User type

interface IndexProps {
  user: User; // Receive user prop
}

const Index: React.FC<IndexProps> = ({ user }) => { // Destructure user from props
  const {
    expenses,
    budgets,
    categories,
    income,
    profile, // Get profile from hook
    loadingData,
    addExpense,
    deleteExpense,
    updateExpense,
    addIncome,
    deleteIncome,
    updateIncome,
    handleImportExpenses,
    handleImportIncome,
    handleImportBudgets,
    handleSaveBudget,
    handleDeleteBudget,
    handleUpdateCategories,
    updateProfile, // Get updateProfile function
    uniqueIncomeSources,
  } = useFinancialData(user); // Pass user to the hook

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isImportExpensesDialogOpen, setIsImportExpensesDialogOpen] = useState(false);
  const [isImportIncomeDialogOpen, setIsImportIncomeDialogOpen] = useState(false);
  const [isImportBudgetDialogOpen, setIsImportBudgetDialogOpen] = useState(false);
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [isCategoryManagementDialogOpen, setIsCategoryManagementDialogOpen] = useState(false);
  const [isAddTransactionDialogOpen, setIsAddTransactionDialogOpen] = useState(false);
  const [isCsvManagementDialogOpen, setIsCsvManagementDialogOpen] = useState(false);
  // const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false); // Removed
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false); // New state for profile dialog

  const [editingIncome, setEditingIncome] = useState<Income | null>(null);

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState<string>(format(today, "MM"));
  const [selectedYear, setSelectedYear] = useState<string>(format(today, "yyyy"));

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
  };

  const handleEditIncome = (inc: Income) => {
    setEditingIncome(inc);
  };

  const handleExportExpenses = () => {
    exportExpensesToCsv(expenses);
  };

  const handleExportIncome = () => {
    exportIncomeToCsv(income);
  };

  const handleExportBudgets = () => {
    exportBudgetsToCsv(budgets);
  };

  const handleExportCombinedData = () => {
    exportCombinedFinancialDataToCsv(expenses, income, budgets);
  };

  const handleImportCombinedData = (file: File) => {
    importCombinedFinancialDataFromCsv(file, handleImportExpenses, handleImportIncome, handleImportBudgets);
  };

  // Calculate cumulative balance data for the chart
  const calculateNetBalanceData = (expenses: Expense[], income: Income[]) => {
    const dailyNetChange = new Map<string, number>();

    expenses.forEach(exp => {
      const currentChange = dailyNetChange.get(exp.date) || 0;
      dailyNetChange.set(exp.date, currentChange - exp.amount);
    });

    income.forEach(inc => {
      const currentChange = dailyNetChange.get(inc.date) || 0;
      dailyNetChange.set(inc.date, currentChange + inc.amount);
    });

    const sortedDates = Array.from(dailyNetChange.keys()).sort();

    const chartData: { date: string; balance: number }[] = [];
    let cumulativeBalance = 0;

    sortedDates.forEach(date => {
      cumulativeBalance += dailyNetChange.get(date)!;
      chartData.push({ date, balance: cumulativeBalance });
    });

    return chartData;
  };

  const netBalanceData = calculateNetBalanceData(expenses, income);

  // Calculate total income and expenses for the selected month
  const selectedMonthYear = `${selectedYear}-${selectedMonth}`;
  const totalMonthlyIncome = income
    .filter(inc => format(parseISO(inc.date), "yyyy-MM") === selectedMonthYear)
    .reduce((sum, inc) => sum + inc.amount, 0);

  const totalMonthlyExpenses = expenses
    .filter(exp => format(parseISO(exp.date), "yyyy-MM") === selectedMonthYear)
    .reduce((sum, exp) => sum + exp.amount, 0);

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        Đang tải dữ liệu tài chính...
      </div>
    );
  }

  const displayName = profile?.first_name || profile?.last_name
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
    : 'Người dùng';

  return (
    <div className="min-h-screen p-8 flex flex-col items-center">
      <header className="w-full max-w-7xl flex flex-col sm:flex-row justify-between items-center mb-8 p-4 bg-background/80 backdrop-blur-sm rounded-xl shadow-lg border border-border animate-in fade-in slide-in-from-top-4 duration-700 ease-out">
        <div className="text-center sm:text-left flex-grow mb-4 sm:mb-0">
          <h1 className="text-5xl font-extrabold text-gray-800 dark:text-gray-100 mb-2">
            Quản Lý Tài Chính Cá Nhân
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-1">
            Theo dõi chi tiêu, thu nhập và ngân sách của bạn một cách dễ dàng.
          </p>
          <p className="text-md text-gray-500 dark:text-gray-400">
            Chào mừng, <span className="font-semibold">{displayName}</span> ({user.email})
          </p>
        </div>
        <ThemeToggle />
      </header>
      
      <div className="w-full max-w-4xl mx-auto mb-8 p-6 bg-card/80 backdrop-blur-sm rounded-xl shadow-lg flex flex-wrap gap-4 justify-center border border-border animate-in fade-in slide-in-from-top-4 duration-700 ease-out delay-100">
        <Button variant="outline" onClick={() => setIsCsvManagementDialogOpen(true)} className="w-full sm:w-auto">
          <FileText className="mr-2 h-4 w-4" /> Quản Lý Nhập/Xuất CSV
        </Button>
        <Button variant="outline" onClick={() => setIsAddTransactionDialogOpen(true)} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> Thêm Giao Dịch Mới
        </Button>
        <Button variant="outline" onClick={() => setIsBudgetDialogOpen(true)} className="w-full sm:w-auto">
          <Wallet className="mr-2 h-4 w-4" /> Đặt Ngân Sách
        </Button>
        <Button variant="outline" onClick={() => setIsCategoryManagementDialogOpen(true)} className="w-full sm:w-auto">
          <Tag className="mr-2 h-4 w-4" /> Quản Lý Danh Mục
        </Button>
        {/* Removed Change Password Button */}
        <Button variant="outline" onClick={() => setIsProfileDialogOpen(true)} className="w-full sm:w-auto">
          <UserIcon className="mr-2 h-4 w-4" /> Quản Lý Hồ Sơ
        </Button>
      </div>

      <section className="w-full max-w-7xl mx-auto p-6 bg-card/80 backdrop-blur-sm rounded-xl shadow-xl mb-8 transition-all duration-300 ease-in-out border border-border animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out delay-200">
        <SummaryAndChartsSection
          expenses={expenses}
          budgets={budgets}
          income={income}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
        />
      </section>

      <section className="w-full max-w-7xl mx-auto p-6 bg-card/80 backdrop-blur-sm rounded-xl shadow-xl mb-8 transition-all duration-300 ease-in-out border border-border animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out delay-300">
        {/* Monthly Financial Overview and Current Balance Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <MonthlyFinancialOverview
            totalMonthlyIncome={totalMonthlyIncome}
            totalMonthlyExpenses={totalMonthlyExpenses}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />
          <CurrentBalanceCard
            expenses={expenses}
            income={income}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />
        </div>

        {/* Recent Transactions and Net Balance Chart */}
        <div className="grid grid-cols-1 gap-8 mb-8">
          <RecentTransactions expenses={expenses} income={income} />
          <NetBalanceChart data={netBalanceData} />
          <IncomeExpenseChart expenses={expenses} income={income} />
        </div>

        {/* Expense List, Income List, Monthly Summary, Income Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ExpenseList
            expenses={expenses}
            onDeleteExpense={deleteExpense}
            onEditExpense={handleEditExpense}
            categories={categories}
          />
          
          <IncomeList
            income={income}
            onDeleteIncome={deleteIncome}
            onEditIncome={handleEditIncome}
            incomeSources={uniqueIncomeSources}
          />

          <MonthlySummary expenses={expenses} />
          <IncomeSummary income={income} />
        </div>
      </section>

      {editingExpense && (
        <EditExpenseDialog
          isOpen={!!editingExpense}
          onClose={() => setEditingExpense(null)}
          expense={editingExpense}
          onUpdateExpense={updateExpense}
          categories={categories}
        />
      )}
      {editingIncome && (
        <EditIncomeDialog
          isOpen={!!editingIncome}
          onClose={() => setEditingIncome(null)}
          income={editingIncome}
          onUpdateIncome={updateIncome}
        />
      )}
      <ImportExpensesDialog
        isOpen={isImportExpensesDialogOpen}
        onClose={() => setIsImportExpensesDialogOpen(false)}
        onImportExpenses={handleImportExpenses}
      />
      {isImportIncomeDialogOpen && (
        <ImportIncomeDialog
          isOpen={isImportIncomeDialogOpen}
          onClose={() => setIsImportIncomeDialogOpen(false)}
          onImportIncome={handleImportIncome}
        />
      )}
      {isImportBudgetDialogOpen && (
        <ImportBudgetDialog
          isOpen={isImportBudgetDialogOpen}
          onClose={() => setIsImportBudgetDialogOpen(false)}
          onImportBudgets={handleImportBudgets}
        />
      )}
      {isCsvManagementDialogOpen && (
        <CsvManagementDialog
          isOpen={isCsvManagementDialogOpen}
          onClose={() => setIsCsvManagementDialogOpen(false)}
          onOpenImportExpenses={() => setIsImportExpensesDialogOpen(true)}
          onOpenImportIncome={() => setIsImportIncomeDialogOpen(true)}
          onOpenImportBudgets={() => setIsImportBudgetDialogOpen(true)}
          onExportExpenses={handleExportExpenses}
          onExportIncome={handleExportIncome}
          onExportBudgets={handleExportBudgets}
          onImportCombinedData={handleImportCombinedData}
          onExportCombinedData={handleExportCombinedData}
        />
      )}
      {isBudgetDialogOpen && (
        <BudgetSettingDialog
          isOpen={isBudgetDialogOpen}
          onClose={() => setIsBudgetDialogOpen(false)}
          currentBudgets={budgets}
          onSaveBudget={handleSaveBudget}
          onDeleteBudget={handleDeleteBudget}
          categories={categories}
        />
      )}
      {isCategoryManagementDialogOpen && (
        <CategoryManagementDialog
          isOpen={isCategoryManagementDialogOpen}
          onClose={() => setIsCategoryManagementDialogOpen(false)}
          categories={categories}
          onUpdateCategories={handleUpdateCategories}
        />
      )}
      {isAddTransactionDialogOpen && (
        <AddTransactionDialog
          isOpen={isAddTransactionDialogOpen}
          onClose={() => setIsAddTransactionDialogOpen(false)}
          onAddExpense={addExpense}
          onAddIncome={addIncome}
          categories={categories}
        />
      )}
      {/* Removed ChangePasswordDialog component */}
      {/* {isChangePasswordDialogOpen && (
        <ChangePasswordDialog
          isOpen={isChangePasswordDialogOpen}
          onClose={() => setIsChangePasswordDialogOpen(false)}
        />
      )} */}
      {isProfileDialogOpen && (
        <ProfileDialog
          isOpen={isProfileDialogOpen}
          onClose={() => setIsProfileDialogOpen(false)}
          profile={profile}
          onUpdateProfile={updateProfile}
        />
      )}
      <MadeWithDyad />
    </div>
  );
};

export default Index;