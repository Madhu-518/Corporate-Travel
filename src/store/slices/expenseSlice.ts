import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

interface Expense {
  id: number;
  employeeId: number;
  date: string;
  description: string;
  category: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  receipt?: string;
}

interface ExpenseState {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
}

const initialState: ExpenseState = {
  expenses: [],
  loading: false,
  error: null,
};

export const fetchExpenses = createAsyncThunk(
  'expense/fetchExpenses',
  async (employeeId?: number) => {
    const expenses = await apiService.getExpenses(employeeId);
    return expenses;
  }
);

export const createExpense = createAsyncThunk(
  'expense/createExpense',
  async (expenseData: Omit<Expense, 'id'>) => {
    // Since external API is read-only, we'll create a mock expense with a new ID
    const mockExpense: Expense = {
      ...expenseData,
      id: Date.now(), // Generate a temporary ID
      status: 'pending' as const
    };
    return mockExpense;
  }
);

export const updateExpenseStatus = createAsyncThunk(
  'expense/updateExpenseStatus',
  async ({ id, status }: { id: number; status: 'approved' | 'rejected' }) => {
    // Since external API is read-only, we'll return a mock updated expense
    const mockUpdatedExpense = {
      id,
      status,
      // Add other required fields with mock data
      employeeId: 1,
      date: new Date().toISOString().split('T')[0],
      description: 'Updated expense',
      category: 'General',
      amount: 0
    };
    return mockUpdatedExpense;
  }
);

const expenseSlice = createSlice({
  name: 'expense',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch expenses';
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.expenses.push(action.payload);
      })
      .addCase(updateExpenseStatus.fulfilled, (state, action) => {
        const index = state.expenses.findIndex(expense => expense.id === action.payload.id);
        if (index !== -1) {
          state.expenses[index] = action.payload;
        }
      });
  },
});

export const { clearError } = expenseSlice.actions;
export default expenseSlice.reducer; 