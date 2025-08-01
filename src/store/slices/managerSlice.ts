import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  budget: number;
  usedBudget: number;
  walletBalance: number;
  rewardPoints: number;
}

interface Expense {
  id: string;
  employeeId: string;
  employeeName: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface ManagerState {
  employees: Employee[];
  expenses: Expense[];
  totalTeamBudget: number;
  totalExpenses: number;
  pendingApprovals: number;
  loading: boolean;
  error: string | null;
}

const initialState: ManagerState = {
  employees: [],
  expenses: [],
  totalTeamBudget: 0,
  totalExpenses: 0,
  pendingApprovals: 0,
  loading: false,
  error: null,
};

export const fetchEmployees = createAsyncThunk(
  'manager/fetchEmployees',
  async () => {
    const employees = await apiService.getEmployees();
    return employees;
  }
);

export const fetchExpenses = createAsyncThunk(
  'manager/fetchExpenses',
  async () => {
    const expenses = await apiService.getExpenses();
    return expenses;
  }
);

export const updateEmployeeBudget = createAsyncThunk(
  'manager/updateEmployeeBudget',
  async ({ id, budget }: { id: number; budget: number }) => {
    // Since external API is read-only, we'll return a mock updated employee
    const mockUpdatedEmployee = {
      id,
      budget,
      // Add other required fields with mock data
      name: 'Updated Employee',
      email: 'employee@example.com',
      department: 'General',
      usedBudget: 0,
      walletBalance: 0,
      rewardPoints: 0
    };
    return mockUpdatedEmployee;
  }
);

export const updateExpenseStatus = createAsyncThunk(
  'manager/updateExpenseStatus',
  async ({ id, status }: { id: string; status: 'approved' | 'rejected' }) => {
    // Since external API is read-only, we'll return a mock updated expense
    const mockUpdatedExpense = {
      id,
      status,
      // Add other required fields with mock data
      employeeId: '1',
      employeeName: 'Updated Employee',
      description: 'Updated expense',
      amount: 0,
      category: 'General',
      date: new Date().toISOString().split('T')[0]
    };
    return mockUpdatedExpense;
  }
);

export const fetchManagerStats = createAsyncThunk(
  'manager/fetchManagerStats',
  async () => {
    const [employees, expenses] = await Promise.all([
      apiService.getEmployees(),
      apiService.getExpenses()
    ]);
    
    const totalTeamBudget = employees.reduce((sum: number, emp: Employee) => sum + emp.budget, 0);
    const totalExpenses = expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);
    const pendingApprovals = expenses.filter((exp: any) => exp.status === 'pending').length;
    
    return {
      employees,
      expenses,
      totalTeamBudget,
      totalExpenses,
      pendingApprovals
    };
  }
);

const managerSlice = createSlice({
  name: 'manager',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch employees';
      })
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
      .addCase(updateEmployeeBudget.fulfilled, (state, action) => {
        const index = state.employees.findIndex(emp => emp.id === action.payload.id);
        if (index !== -1) {
          state.employees[index] = action.payload;
        }
      })
      .addCase(updateExpenseStatus.fulfilled, (state, action) => {
        const index = state.expenses.findIndex(exp => exp.id === action.payload.id);
        if (index !== -1) {
          state.expenses[index].status = action.payload.status;
        }
      })
      .addCase(fetchManagerStats.fulfilled, (state, action) => {
        state.employees = action.payload.employees;
        state.expenses = action.payload.expenses;
        state.totalTeamBudget = action.payload.totalTeamBudget;
        state.totalExpenses = action.payload.totalExpenses;
        state.pendingApprovals = action.payload.pendingApprovals;
      });
  },
});

export const { clearError } = managerSlice.actions;
export default managerSlice.reducer; 