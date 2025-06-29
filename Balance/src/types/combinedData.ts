export interface CombinedFinancialRow {
  type: 'expense' | 'income' | 'budget';
  id?: string; // For expense/income
  description?: string; // For expense/income
  amount: number; // For all
  date?: string; // For expense/income (YYYY-MM-DD)
  category?: string; // For expense/budget
  source?: string; // For income
  monthYear?: string; // For budget (YYYY-MM)
}