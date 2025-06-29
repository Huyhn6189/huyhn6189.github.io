import { Expense } from "@/types/expense";
import { Income } from "@/types/income";
import { Budget } from "@/types/budget";
import { CombinedFinancialRow } from "@/types/combinedData"; // Import new type
import { showSuccess, showError } from "@/utils/toast";
import Papa from "papaparse";
import { v4 as uuidv4 } from 'uuid';

export const exportExpensesToCsv = (expenses: Expense[]) => {
  if (expenses.length === 0) {
    showError("Không có dữ liệu chi tiêu để xuất.");
    return;
  }

  const headers = ["id", "description", "amount", "date", "category"];
  const csvRows = [];

  // Add headers
  csvRows.push(headers.join(","));

  // Add data rows
  for (const expense of expenses) {
    const values = headers.map(header => {
      const value = (expense as any)[header];
      // Handle commas and quotes in string values
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvRows.push(values.join(","));
  }

  const csvString = csvRows.join("\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) { // feature detection
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "chi_tieu.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess("Dữ liệu chi tiêu đã được xuất thành công!");
  } else {
    showError("Trình duyệt của bạn không hỗ trợ tải xuống tệp.");
  }
};

export const exportIncomeToCsv = (income: Income[]) => {
  if (income.length === 0) {
    showError("Không có dữ liệu thu nhập để xuất.");
    return;
  }

  const headers = ["id", "description", "amount", "date", "source"];
  const csvRows = [];

  // Add headers
  csvRows.push(headers.join(","));

  // Add data rows
  for (const inc of income) {
    const values = headers.map(header => {
      const value = (inc as any)[header];
      // Handle commas and quotes in string values
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvRows.push(values.join(","));
  }

  const csvString = csvRows.join("\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) { // feature detection
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "thu_nhap.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess("Dữ liệu thu nhập đã được xuất thành công!");
  } else {
    showError("Trình duyệt của bạn không hỗ trợ tải xuống tệp.");
  }
};

export const exportBudgetsToCsv = (budgets: Budget[]) => {
  if (budgets.length === 0) {
    showError("Không có dữ liệu ngân sách để xuất.");
    return;
  }

  const headers = ["category", "amount", "monthYear"];
  const csvRows = [];

  // Add headers
  csvRows.push(headers.join(","));

  // Add data rows
  for (const budget of budgets) {
    const values = headers.map(header => {
      const value = (budget as any)[header];
      // Handle commas and quotes in string values
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvRows.push(values.join(","));
  }

  const csvString = csvRows.join("\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) { // feature detection
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "ngan_sach.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess("Dữ liệu ngân sách đã được xuất thành công!");
  } else {
    showError("Trình duyệt của bạn không hỗ trợ tải xuống tệp.");
  }
};

export const importBudgetsFromCsv = (file: File, onImport: (budgets: Budget[]) => void) => {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      if (results.errors.length > 0) {
        showError("Lỗi khi phân tích cú pháp tệp CSV: " + results.errors[0].message);
        return;
      }

      const importedBudgets: Budget[] = [];
      let hasError = false;

      for (const row of results.data) {
        const budgetRow = row as Record<string, string>;
        const amount = parseFloat(budgetRow.amount);

        if (
          !budgetRow.category ||
          isNaN(amount) ||
          amount <= 0 ||
          !budgetRow.monthYear ||
          !/^\d{4}-\d{2}$/.test(budgetRow.monthYear) // Validate YYYY-MM format
        ) {
          showError(`Dữ liệu không hợp lệ trong hàng: ${JSON.stringify(row)}. Bỏ qua hàng này.`);
          hasError = true;
          continue;
        }

        importedBudgets.push({
          category: budgetRow.category,
          amount: amount,
          monthYear: budgetRow.monthYear,
        });
      }

      if (importedBudgets.length > 0) {
        onImport(importedBudgets);
        showSuccess(`Đã nhập thành công ${importedBudgets.length} khoản ngân sách.`);
      } else if (!hasError) {
        showError("Không tìm thấy dữ liệu ngân sách hợp lệ nào trong tệp.");
      }
    },
    error: (error) => {
      showError("Lỗi khi đọc tệp: " + error.message);
    },
  });
};

export const exportAllFinancialDataToCsv = (expenses: Expense[], income: Income[], budgets: Budget[]) => {
  showSuccess("Đang xuất tất cả dữ liệu...");
  exportExpensesToCsv(expenses);
  exportIncomeToCsv(income);
  exportBudgetsToCsv(budgets);
};

export const exportCombinedFinancialDataToCsv = (expenses: Expense[], income: Income[], budgets: Budget[]) => {
  const allData: CombinedFinancialRow[] = [];

  expenses.forEach(exp => {
    allData.push({
      type: 'expense',
      id: exp.id,
      description: exp.description,
      amount: exp.amount,
      date: exp.date,
      category: exp.category,
      source: '', // Empty for expense
      monthYear: '', // Empty for expense
    });
  });

  income.forEach(inc => {
    allData.push({
      type: 'income',
      id: inc.id,
      description: inc.description,
      amount: inc.amount,
      date: inc.date,
      source: inc.source,
      category: '', // Empty for income
      monthYear: '', // Empty for income
    });
  });

  budgets.forEach(budget => {
    allData.push({
      type: 'budget',
      id: '', // Empty for budget
      description: '', // Empty for budget
      amount: budget.amount,
      date: '', // Empty for budget
      category: budget.category,
      source: '', // Empty for budget
      monthYear: budget.monthYear,
    });
  });

  if (allData.length === 0) {
    showError("Không có dữ liệu để xuất.");
    return;
  }

  const csv = Papa.unparse(allData, {
    header: true,
    columns: ["type", "id", "description", "amount", "date", "category", "source", "monthYear"]
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "tat_ca_du_lieu_tai_chinh.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess("Tất cả dữ liệu tài chính đã được xuất thành công!");
  } else {
    showError("Trình duyệt của bạn không hỗ trợ tải xuống tệp.");
  }
};

export const importCombinedFinancialDataFromCsv = (
  file: File,
  onImportExpenses: (newExpenses: Omit<Expense, "id">[]) => void,
  onImportIncome: (newIncome: Omit<Income, "id">[]) => void,
  onImportBudgets: (newBudgets: Budget[]) => void
) => {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      if (results.errors.length > 0) {
        showError("Lỗi khi phân tích cú pháp tệp CSV: " + results.errors[0].message);
        return;
      }

      const importedExpenses: Omit<Expense, "id">[] = [];
      const importedIncome: Omit<Income, "id">[] = [];
      const importedBudgets: Budget[] = [];
      let hasError = false;

      for (const row of results.data) {
        const dataRow = row as Record<string, string>;
        const type = dataRow.type;
        const amount = parseFloat(dataRow.amount);

        if (isNaN(amount) || amount <= 0) {
          showError(`Dữ liệu số tiền không hợp lệ trong hàng: ${JSON.stringify(row)}. Bỏ qua hàng này.`);
          hasError = true;
          continue;
        }

        switch (type) {
          case 'expense':
            if (!dataRow.description || !dataRow.date || !dataRow.category) {
              showError(`Dữ liệu chi tiêu không hợp lệ trong hàng: ${JSON.stringify(row)}. Bỏ qua hàng này.`);
              hasError = true;
            } else {
              importedExpenses.push({
                description: dataRow.description,
                amount: amount,
                date: dataRow.date,
                category: dataRow.category,
              });
            }
            break;
          case 'income':
            if (!dataRow.description || !dataRow.date || !dataRow.source) {
              showError(`Dữ liệu thu nhập không hợp lệ trong hàng: ${JSON.stringify(row)}. Bỏ qua hàng này.`);
              hasError = true;
            } else {
              importedIncome.push({
                description: dataRow.description,
                amount: amount,
                date: dataRow.date,
                source: dataRow.source,
              });
            }
            break;
          case 'budget':
            if (!dataRow.category || !dataRow.monthYear || !/^\d{4}-\d{2}$/.test(dataRow.monthYear)) {
              showError(`Dữ liệu ngân sách không hợp lệ trong hàng: ${JSON.stringify(row)}. Bỏ qua hàng này.`);
              hasError = true;
            } else {
              importedBudgets.push({
                category: dataRow.category,
                amount: amount,
                monthYear: dataRow.monthYear,
              });
            }
            break;
          default:
            showError(`Loại dữ liệu không xác định trong hàng: ${JSON.stringify(row)}. Bỏ qua hàng này.`);
            hasError = true;
        }
      }

      if (importedExpenses.length > 0) {
        onImportExpenses(importedExpenses);
        showSuccess(`Đã nhập thành công ${importedExpenses.length} khoản chi tiêu.`);
      }
      if (importedIncome.length > 0) {
        onImportIncome(importedIncome);
        showSuccess(`Đã nhập thành công ${importedIncome.length} khoản thu nhập.`);
      }
      if (importedBudgets.length > 0) {
        onImportBudgets(importedBudgets);
        showSuccess(`Đã nhập thành công ${importedBudgets.length} khoản ngân sách.`);
      }

      if (importedExpenses.length === 0 && importedIncome.length === 0 && importedBudgets.length === 0 && !hasError) {
        showError("Không tìm thấy dữ liệu hợp lệ nào trong tệp.");
      }
    },
    error: (error) => {
      showError("Lỗi khi đọc tệp: " + error.message);
    },
  });
};