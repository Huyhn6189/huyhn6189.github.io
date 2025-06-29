import { useState, useEffect, useCallback } from "react";
import { Expense } from "@/types/expense";
import { Income } from "@/types/income";
import { Budget } from "@/types/budget";
import { supabase } from "@/lib/supabase";
import { User } from '@supabase/supabase-js';
import { showSuccess, showError } from "@/utils/toast";

const defaultCategories = ["Ăn uống", "Di chuyển", "Mua sắm", "Giải trí", "Hóa đơn", "Khác"];

// Helper function to sort categories with "Khác" at the end
const sortCategories = (cats: string[]): string[] => {
  const otherCategory = "Khác";
  const filteredCats = cats.filter(cat => cat !== otherCategory);
  const sortedCats = filteredCats.sort((a, b) => a.localeCompare(b, 'vi', { sensitivity: 'base' }));
  if (cats.includes(otherCategory)) {
    return [...sortedCats, otherCategory];
  }
  return sortedCats;
};

export interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
}

export const useFinancialData = (user: User | null) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<string[]>(sortCategories(defaultCategories));
  const [income, setIncome] = useState<Income[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null); // New state for user profile
  const [loadingData, setLoadingData] = useState(true);

  const fetchFinancialData = useCallback(async () => {
    if (!user) {
      setExpenses([]);
      setBudgets([]);
      setCategories(sortCategories(defaultCategories));
      setIncome([]);
      setProfile(null); // Reset profile
      setLoadingData(false);
      return;
    }

    setLoadingData(true);
    try {
      // Fetch Expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id);
      if (expensesError) throw expensesError;
      setExpenses(expensesData as Expense[]);

      // Fetch Income
      const { data: incomeData, error: incomeError } = await supabase
        .from('income')
        .select('*')
        .eq('user_id', user.id);
      if (incomeError) throw incomeError;
      setIncome(incomeData as Income[]);

      // Fetch Budgets
      const { data: budgetsData, error: budgetsError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id);
      if (budgetsError) throw budgetsError;
      // Map month_year from DB to monthYear in app's Budget type
      const mappedBudgets = budgetsData.map(budget => ({
        ...budget,
        monthYear: budget.month_year // Correctly map from snake_case to camelCase
      })) as Budget[];
      setBudgets(mappedBudgets);

      // Fetch Categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('name')
        .eq('user_id', user.id);
      if (categoriesError) throw categoriesError;
      const fetchedCategories = categoriesData.map(c => c.name);
      setCategories(sortCategories(fetchedCategories.length > 0 ? fetchedCategories : defaultCategories));

      // Fetch Profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('id', user.id)
        .single(); // Use single() as there should be only one profile per user
      if (profileError && profileError.code !== 'PGRST116') { // PGRST116 means no rows found, which is fine for new users
        throw profileError;
      }
      setProfile(profileData as UserProfile || { id: user.id, first_name: null, last_name: null });


      showSuccess("Dữ liệu đã được tải từ Supabase!");
    } catch (error: any) {
      showError("Lỗi khi tải dữ liệu từ Supabase: " + error.message);
      console.error("Error fetching financial data:", error);
    } finally {
      setLoadingData(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFinancialData();
  }, [fetchFinancialData]);

  const addExpense = async (newExpense: Omit<Expense, "id">) => {
    if (!user) { showError("Vui lòng đăng nhập để thêm chi tiêu."); return; }
    const { data, error } = await supabase
      .from('expenses')
      .insert({ ...newExpense, user_id: user.id })
      .select();
    if (error) { showError("Lỗi khi thêm chi tiêu: " + error.message); return; }
    setExpenses((prev) => [...prev, data[0]]);
    showSuccess("Chi tiêu đã được thêm thành công!");
  };

  const deleteExpense = async (id: string) => {
    if (!user) { showError("Vui lòng đăng nhập để xóa chi tiêu."); return; }
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) { showError("Lỗi khi xóa chi tiêu: " + error.message); return; }
    setExpenses((prev) => prev.filter((expense) => expense.id !== id));
    showSuccess("Chi tiêu đã được xóa!");
  };

  const updateExpense = async (updatedExpense: Expense) => {
    if (!user) { showError("Vui lòng đăng nhập để cập nhật chi tiêu."); return; }
    const { data, error } = await supabase
      .from('expenses')
      .update({
        description: updatedExpense.description,
        amount: updatedExpense.amount,
        date: updatedExpense.date,
        category: updatedExpense.category,
      })
      .eq('id', updatedExpense.id)
      .eq('user_id', user.id)
      .select();
    if (error) { showError("Lỗi khi cập nhật chi tiêu: " + error.message); return; }
    setExpenses((prev) =>
      prev.map((expense) =>
        expense.id === updatedExpense.id ? data[0] : expense
      )
    );
    showSuccess("Chi tiêu đã được cập nhật thành công!");
  };

  const addIncome = async (newIncome: Omit<Income, "id">) => {
    if (!user) { showError("Vui lòng đăng nhập để thêm thu nhập."); return; }
    const { data, error } = await supabase
      .from('income')
      .insert({ ...newIncome, user_id: user.id })
      .select();
    if (error) { showError("Lỗi khi thêm thu nhập: " + error.message); return; }
    setIncome((prev) => [...prev, data[0]]);
    showSuccess("Thu nhập đã được thêm thành công!");
  };

  const deleteIncome = async (id: string) => {
    if (!user) { showError("Vui lòng đăng nhập để xóa thu nhập."); return; }
    const { error } = await supabase
      .from('income')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) { showError("Lỗi khi xóa thu nhập: " + error.message); return; }
    setIncome((prev) => prev.filter((inc) => inc.id !== id));
    showSuccess("Thu nhập đã được xóa!");
  };

  const updateIncome = async (updatedIncome: Income) => {
    if (!user) { showError("Vui lòng đăng nhập để cập nhật thu nhập."); return; }
    const { data, error } = await supabase
      .from('income')
      .update({
        description: updatedIncome.description,
        amount: updatedIncome.amount,
        date: updatedIncome.date,
        source: updatedIncome.source,
      })
      .eq('id', updatedIncome.id)
      .eq('user_id', user.id)
      .select();
    if (error) { showError("Lỗi khi cập nhật thu nhập: " + error.message); return; }
    setIncome((prev) =>
      prev.map((inc) =>
        inc.id === updatedIncome.id ? data[0] : inc
      )
    );
    showSuccess("Thu nhập đã được cập nhật thành công!");
  };

  const handleImportExpenses = async (newExpenses: Omit<Expense, "id">[]) => {
    if (!user) { showError("Vui lòng đăng nhập để nhập chi tiêu."); return; }
    const expensesToInsert = newExpenses.map(exp => ({ ...exp, user_id: user.id }));
    const { data, error } = await supabase
      .from('expenses')
      .insert(expensesToInsert)
      .select();
    if (error) { showError("Lỗi khi nhập chi tiêu: " + error.message); return; }
    setExpenses((prev) => [...prev, ...(data as Expense[])]);
    showSuccess(`Đã nhập thành công ${data.length} khoản chi tiêu.`);
  };

  const handleImportIncome = async (newIncome: Omit<Income, "id">[]) => {
    if (!user) { showError("Vui lòng đăng nhập để nhập thu nhập."); return; }
    const incomeToInsert = newIncome.map(inc => ({ ...inc, user_id: user.id }));
    const { data, error } = await supabase
      .from('income')
      .insert(incomeToInsert)
      .select();
    if (error) { showError("Lỗi khi nhập thu nhập: " + error.message); return; }
    setIncome((prev) => [...prev, ...(data as Income[])]);
    showSuccess(`Đã nhập thành công ${data.length} khoản thu nhập.`);
  };

  const handleImportBudgets = async (newBudgets: Budget[]) => {
    if (!user) { showError("Vui lòng đăng nhập để nhập ngân sách."); return; }
    const budgetsToUpsert = newBudgets.map(budget => ({
      category: budget.category,
      amount: budget.amount,
      month_year: budget.monthYear, // Explicitly map to snake_case
      user_id: user.id
    }));
    const { data, error } = await supabase
      .from('budgets')
      .upsert(budgetsToUpsert, { onConflict: 'user_id,category,month_year' })
      .select();
    if (error) { showError("Lỗi khi nhập ngân sách: " + error.message); return; }
    // Re-fetch all budgets to ensure state is consistent after upsert
    await fetchFinancialData();
    showSuccess(`Đã nhập thành công ${data.length} khoản ngân sách.`);
  };

  const handleSaveBudget = async (newBudget: Budget) => {
    if (!user) { showError("Vui lòng đăng nhập để lưu ngân sách."); return; }
    const { data, error } = await supabase
      .from('budgets')
      .upsert({
        category: newBudget.category,
        amount: newBudget.amount,
        month_year: newBudget.monthYear, // Explicitly map to snake_case
        user_id: user.id
      }, { onConflict: 'user_id,category,month_year' })
      .select();
    if (error) { showError("Lỗi khi lưu ngân sách: " + error.message); return; }
    // Re-fetch all budgets to ensure state is consistent after upsert
    await fetchFinancialData();
    showSuccess("Ngân sách đã được lưu!");
  };

  const handleDeleteBudget = async (categoryToDelete: string, monthYearToDelete: string) => {
    if (!user) { showError("Vui lòng đăng nhập để xóa ngân sách."); return; }
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('category', categoryToDelete)
      .eq('month_year', monthYearToDelete)
      .eq('user_id', user.id);
    if (error) { showError("Lỗi khi xóa ngân sách: " + error.message); return; }
    setBudgets((prev) =>
      prev.filter(
        (budget) => !(budget.category === categoryToDelete && budget.monthYear === monthYearToDelete)
      )
    );
    showSuccess("Ngân sách đã được xóa!");
  };

  const handleUpdateCategories = async (updatedCategories: string[]) => {
    if (!user) { showError("Vui lòng đăng nhập để cập nhật danh mục."); return; }

    const existingCategoriesInDb = await supabase
      .from('categories')
      .select('name')
      .eq('user_id', user.id);

    if (existingCategoriesInDb.error) {
      showError("Lỗi khi lấy danh mục hiện có: " + existingCategoriesInDb.error.message);
      return;
    }

    const currentDbCategoryNames = new Set(existingCategoriesInDb.data.map(c => c.name));
    const newCategoryNames = new Set(updatedCategories);

    // Categories to add
    const toAdd = updatedCategories.filter(name => !currentDbCategoryNames.has(name));
    if (toAdd.length > 0) {
      const { error: insertError } = await supabase
        .from('categories')
        .insert(toAdd.map(name => ({ name, user_id: user.id })));
      if (insertError) { showError("Lỗi khi thêm danh mục: " + insertError.message); return; }
    }

    // Categories to delete
    const toDelete = Array.from(currentDbCategoryNames).filter(name => !newCategoryNames.has(name));
    if (toDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .in('name', toDelete)
        .eq('user_id', user.id);
      if (deleteError) { showError("Lỗi khi xóa danh mục: " + deleteError.message); return; }
    }

    setCategories(sortCategories(updatedCategories));
    showSuccess("Danh mục đã được cập nhật!");
  };

  const updateProfile = async (updatedProfile: Omit<UserProfile, 'id'>) => {
    if (!user) { showError("Vui lòng đăng nhập để cập nhật hồ sơ."); return; }
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...updatedProfile }, { onConflict: 'id' })
      .select('id, first_name, last_name')
      .single();

    if (error) {
      showError("Lỗi khi cập nhật hồ sơ: " + error.message);
      return null;
    }
    setProfile(data as UserProfile);
    showSuccess("Hồ sơ đã được cập nhật thành công!");
    return data as UserProfile;
  };

  const uniqueIncomeSources = Array.from(new Set(income.map(inc => inc.source)));

  return {
    expenses,
    budgets,
    categories,
    income,
    profile, // Return profile
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
    updateProfile, // Return updateProfile function
    uniqueIncomeSources,
  };
};