export interface Income {
  id: string;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  source: string; // e.g., Salary, Freelance, Gift
}